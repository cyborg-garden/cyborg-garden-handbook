#!/usr/bin/env node
// bin/compile.mjs: compile the handbook from its sources.
//
// Sources (hand-edited, committed):
//   handbook.json   the record of every PUBLIC repository, place and page
//   prose/*.md      the hand-written body of each chapter
//
// Outputs (GENERATED, committed, never hand-edited):
//   generated/repos.snapshot.json   what GitHub says about each listed repository
//   pages/*.md                      one compiled chapter per page record
//
// Usage:
//   node bin/compile.mjs                refresh the snapshot from GitHub, then write pages
//   node bin/compile.mjs --no-fetch     write pages from the committed snapshot only
//   node bin/compile.mjs --check        verify pages match their sources; exit 1 on drift
//   node bin/compile.mjs --allow-stale  compile from a snapshot older than its max age
//
// --check never touches the network. It compiles from the committed snapshot and
// compares byte for byte, so CI can run it on a pull request from a fork with no
// credentials and still catch someone editing a generated page by hand.
//
// THE PRIVACY INVARIANT, and it is the reason this repository exists separately
// from anything internal: a record whose live visibility is not literally PUBLIC
// aborts the whole run before a single file is written. Private work is absent
// from the handbook rather than redacted in it, so there is no sanitization step
// that a tired person can get wrong. Absence is the default; inclusion is the
// deliberate act, and it is checked against GitHub rather than trusted.
//
// The invariant fails closed on the freshness axis too, which is the axis that is
// easy to get wrong. A repository going private is exactly the event that makes
// `gh repo view` start throwing for that one repository, so a per-repository
// lookup failure is recorded as UNVERIFIED and aborts the run. It is never quietly
// answered from the committed snapshot, which would still say PUBLIC. Falling back
// to the committed snapshot is allowed only when GitHub is unreachable or the CLI
// is unauthenticated, meaning no repository was checked at all, and then only while
// that snapshot is inside its stamped max age. An old snapshot is a stale claim
// about visibility, and this repository publishes visibility claims.
//
// No dependencies. Node >= 18. `gh` (the GitHub CLI, authenticated) is required
// for the fetch pass only.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SRC = join(ROOT, 'handbook.json');
const PROSE_DIR = join(ROOT, 'prose');
const PAGES_DIR = join(ROOT, 'pages');
const SNAPSHOT = join(ROOT, 'generated', 'repos.snapshot.json');

const CHECK = process.argv.includes('--check');
const NO_FETCH = CHECK || process.argv.includes('--no-fetch');
const ALLOW_STALE = process.argv.includes('--allow-stale');

// The scheduled refresh runs weekly. The max age is that interval plus three days
// of slack, so one missed job is survivable and a fortnight of silence is not: past
// this, the snapshot's visibility answers are old enough that publishing them is a
// guess rather than a check.
const REFRESH_INTERVAL_DAYS = 7;
const SNAPSHOT_MAX_AGE_DAYS = REFRESH_INTERVAL_DAYS + 3;

const FOOTER_GENERATED =
  '_Compiled by `bin/compile.mjs` from `handbook.json` and `prose/`. Edit the sources, not this file._';

// ---- read the source of truth -----------------------------------------------

const book = JSON.parse(readFileSync(SRC, 'utf8'));
const AREAS = book.areas || {};
const AREA_FACET = book.facets?.area || [];
const repoEntries = Object.entries(book.repos).map(([full, r]) => {
  const [org, name] = full.split('/');
  return { full, org, name, ...r };
});

const problems = [];
for (const r of repoEntries) {
  if (!r.org || !r.name) problems.push(`${r.full}: not in "org/name" form`);
  if (AREA_FACET.length && !AREA_FACET.includes(r.area)) {
    problems.push(`${r.full}: area="${r.area}" is not in facets.area`);
  }
  if (!r.purpose) problems.push(`${r.full}: no purpose line, so the entry says nothing a stranger can use`);
}
for (const p of book.places || []) {
  if (AREA_FACET.length && !AREA_FACET.includes(p.area)) {
    problems.push(`place "${p.name}": area="${p.area}" is not in facets.area`);
  }
}
const slugs = new Set();
for (const p of book.pages) {
  if (slugs.has(p.slug)) problems.push(`page "${p.slug}": duplicate slug`);
  slugs.add(p.slug);
  if (p.prose && !existsSync(join(PROSE_DIR, p.prose))) {
    problems.push(`page "${p.slug}": prose/${p.prose} is missing`);
  }
}
if (problems.length) fail('SOURCE PROBLEMS', problems);

// ---- the fetch pass ----------------------------------------------------------

/**
 * Ask GitHub about every listed repository.
 *
 * Two things come back that the handbook cannot get any other way. The first is
 * `visibility`, which is what makes the privacy rule mechanical instead of a
 * promise. The second is the real README filename and default branch, so every
 * "start here" link in the handbook points at a file that exists rather than at a
 * path somebody assumed.
 *
 * A lookup that throws for one repository does not abort here and does not inherit
 * the previous answer. It is recorded with `visibility: null`, which the privacy
 * check rejects a few lines further down. Swallowing it would turn "we can no
 * longer see this repository" into "it is still public", which is the one mistake
 * this file exists to make impossible.
 */
function fetchSnapshot() {
  const repos = {};
  for (const r of repoEntries) {
    process.stderr.write(`fetch ${r.full}\n`);
    let view;
    try {
      view = JSON.parse(
        gh([
          'repo', 'view', r.full,
          '--json', 'visibility,isArchived,defaultBranchRef,licenseInfo,homepageUrl,pushedAt',
        ])
      );
    } catch (err) {
      process.stderr.write(`  warn: ${r.full}: lookup failed (${firstLine(err)})\n`);
      repos[r.full] = { visibility: null, unverified: firstLine(err) };
      continue;
    }
    const branch = view.defaultBranchRef?.name || 'main';

    // The README's actual filename. A repository with README.rst or readme.md
    // would otherwise get a 404 link from a hardcoded "README.md".
    let readme = null;
    try {
      readme = gh(['api', `repos/${r.full}/readme`, '--jq', '.name']).trim() || null;
    } catch {
      readme = null;
    }

    const wanted = r.start_here === 'README.md' && readme ? readme : r.start_here;
    let startHere = null;
    if (wanted) {
      try {
        gh(['api', `repos/${r.full}/contents/${wanted}`, '--jq', '.name']);
        startHere = wanted;
      } catch {
        process.stderr.write(`  warn: ${r.full}: "${wanted}" not found, linking the repository root instead\n`);
      }
    }

    repos[r.full] = {
      visibility: view.visibility,
      archived: !!view.isArchived,
      defaultBranch: branch,
      license: view.licenseInfo?.spdxId || null,
      homepage: view.homepageUrl || null,
      pushed: (view.pushedAt || '').slice(0, 10),
      readme,
      startHere,
    };
  }
  return {
    _comment: [
      'GENERATED by bin/compile.mjs. Do not hand-edit.',
      'What GitHub says about each repository listed in handbook.json, captured so',
      'that --check can compile the pages offline and still catch hand edits.',
      'max_age_days is how long these visibility answers may be published for. Past',
      'it, compile.mjs refuses to write pages from this file without --allow-stale.',
    ],
    fetched: new Date().toISOString().slice(0, 10),
    max_age_days: SNAPSHOT_MAX_AGE_DAYS,
    repos,
  };
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

const firstLine = (err) => String(err?.message ?? err).split('\n')[0];

/**
 * Is the GitHub CLI usable at all?
 *
 * This separates the two failures that a naive try/catch around the whole fetch
 * conflates. No CLI, or a CLI with no credentials, means nothing was checked and
 * the committed snapshot is the best available record. A CLI that works but cannot
 * see one repository means something changed about that repository, and the
 * committed snapshot is precisely the wrong place to look.
 */
function ghUsable() {
  try {
    gh(['auth', 'status']);
    return true;
  } catch (err) {
    process.stderr.write(`warn: the GitHub CLI is unusable (${firstLine(err)})\n`);
    return false;
  }
}

/** Whole days between the snapshot's fetch date and now. Unparseable reads as ancient. */
function snapshotAgeDays(snap) {
  const at = Date.parse(`${snap?.fetched}T00:00:00Z`);
  if (Number.isNaN(at)) return Infinity;
  return Math.floor((Date.now() - at) / 86_400_000);
}

/**
 * A snapshot compiled from rather than fetched has to still be inside its stamped
 * max age. The pages assert that only public repositories are listed and that the
 * compile checked it, and a claim that old stops being a check.
 */
function assertSnapshotFresh(snap) {
  const maxAge = Number.isFinite(snap?.max_age_days) ? snap.max_age_days : SNAPSHOT_MAX_AGE_DAYS;
  const age = snapshotAgeDays(snap);
  if (age <= maxAge) return;
  const line = `the committed snapshot was fetched ${snap?.fetched ?? 'never'} (${age} days ago, max ${maxAge}).`;
  if (ALLOW_STALE) {
    process.stderr.write(`warn: ${line} Continuing because --allow-stale was passed.\n`);
    return;
  }
  fail('SNAPSHOT TOO OLD', [
    line,
    'Its visibility answers are too old to publish as a check.',
    'Run `node bin/compile.mjs` with the GitHub CLI authenticated, or pass --allow-stale.',
  ]);
}

function committedSnapshot(why) {
  if (!existsSync(SNAPSHOT)) {
    fail('NO SNAPSHOT', [
      `${SNAPSHOT} is missing, and ${why}`,
      'Run `node bin/compile.mjs` once with the GitHub CLI authenticated.',
    ]);
  }
  const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
  assertSnapshotFresh(snap);
  return snap;
}

let snapshot;
let fetched = false;
if (NO_FETCH) {
  snapshot = committedSnapshot('this run cannot reach GitHub.');
} else if (!ghUsable()) {
  // Nothing was checked, so nothing new was learned and nothing was contradicted.
  // The committed record is the honest fallback, inside its max age.
  process.stderr.write('warn: compiling from the committed snapshot\n');
  snapshot = committedSnapshot('the GitHub CLI is unusable.');
} else {
  snapshot = fetchSnapshot();
  fetched = true;
}

// ---- the privacy invariant ---------------------------------------------------

/**
 * A public projection must contain zero non-public records, and zero records whose
 * visibility this run failed to establish.
 *
 * Called before anything is written, and it aborts rather than filtering, because
 * quietly dropping a record would hide the mistake that put it here. The test is
 * for the literal string PUBLIC: null, undefined, an error, a renamed enum value
 * and an actually-private repository all fail the same way, which is the only
 * default a privacy rule can safely have.
 */
function assertNoPrivateLeak(records, label = 'the handbook') {
  const unverified = [];
  const leaked = [];
  for (const r of records) {
    const snap = snapshot.repos[r.full];
    if (!snap) {
      unverified.push(`${r.full} (no snapshot entry)`);
      continue;
    }
    if (snap.visibility === 'PUBLIC') continue;
    if (snap.visibility == null) unverified.push(`${r.full} (${snap.unverified || 'visibility unknown'})`);
    else leaked.push(`${r.full} (${snap.visibility})`);
  }
  if (leaked.length) {
    fail(`PRIVACY LEAK in ${label}`, [
      ...leaked,
      'Remove the record from handbook.json, or make the repository public.',
    ]);
  }
  if (unverified.length) {
    fail(`UNVERIFIED in ${label}`, [
      ...unverified,
      'Visibility could not be established, so it is not published as public.',
      'A repository that just went private looks exactly like this.',
    ]);
  }
}

assertNoPrivateLeak(repoEntries);

// ---- rendering ---------------------------------------------------------------

// Repository descriptions are deliberately not published here. A description is
// written for GitHub's sidebar, in the shorthand maintainers use with each other,
// and that register does not belong beside hand-written prose addressed to a
// stranger. The `purpose` line in handbook.json says the same
// thing to a stranger, on purpose, and it is reviewed like any other public copy.
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
const repoUrl = (r) => `https://github.com/${r.full}`;

function startHereLink(r) {
  const snap = snapshot.repos[r.full];
  if (!snap.startHere) return `[the repository](${repoUrl(r)})`;
  return `[${snap.startHere}](${repoUrl(r)}/blob/${snap.defaultBranch}/${snap.startHere})`;
}

/** One area's repositories, as a table a stranger can scan in a single pass. */
function repoTable(area) {
  const rows = repoEntries.filter((r) => area === 'all' || r.area === area);
  if (!rows.length) return '';
  const byArea = new Map();
  for (const r of rows) {
    if (!byArea.has(r.area)) byArea.set(r.area, []);
    byArea.get(r.area).push(r);
  }
  let out = '';
  const order = AREA_FACET.length ? AREA_FACET : [...byArea.keys()];
  for (const a of order) {
    const inArea = byArea.get(a);
    if (!inArea) continue;
    if (area === 'all') out += `### ${AREAS[a] || a}\n\n`;
    out += '| Repository | Why it exists | Start here | Last touched |\n';
    out += '|---|---|---|---|\n';
    for (const r of inArea.sort((x, y) => x.name.localeCompare(y.name))) {
      const snap = snapshot.repos[r.full];
      const archived = snap.archived ? ' _(archived)_' : '';
      out += `| [${cell(r.full)}](${repoUrl(r)})${archived} | ${cell(r.purpose)} | ${startHereLink(r)} | ${cell(snap.pushed)} |\n`;
    }
    out += '\n';
  }
  return out.trimEnd() + '\n';
}

/** One area's public web pages and feeds. */
function placeList(area) {
  const rows = (book.places || []).filter((p) => p.area === area);
  if (!rows.length) return '';
  return rows.map((p) => `- [${p.name}](${p.url}) ${p.note}`).join('\n') + '\n';
}

/** The contents page: every other chapter, in reading order, with its one-liner. */
function contents() {
  const rows = book.pages
    .filter((p) => p.slug !== 'index')
    .sort((a, b) => a.order - b.order);
  // Two trailing spaces are a markdown hard break, so the title reads as a link
  // and the summary sits under it instead of running on from the bold text.
  // Links are written as `./<slug>.md` so they work when the repository is read
  // on GitHub; the site rewrites them to its own routes when it syncs the pages.
  return rows.map((p) => `- **[${p.title}](./${p.slug}.md)**  \n  ${p.summary}`).join('\n') + '\n';
}

const BLOCK_HEADINGS = {
  contents: '## Contents',
  places: '## Where to look',
  repos: '## The repositories',
};

function renderBlock(spec) {
  const [kind, arg] = spec.split(':');
  const body =
    kind === 'contents' ? contents() : kind === 'places' ? placeList(arg) : kind === 'repos' ? repoTable(arg) : '';
  if (!body.trim()) return '';
  return `${BLOCK_HEADINGS[kind]}\n\n${body.trimEnd()}\n`;
}

function renderPage(page) {
  const front = [
    '---',
    `title: ${JSON.stringify(page.title)}`,
    `order: ${page.order}`,
    `summary: ${JSON.stringify(page.summary)}`,
    `updated: ${snapshot.fetched}`,
    '---',
    '',
  ].join('\n');

  const prose = page.prose ? readFileSync(join(PROSE_DIR, page.prose), 'utf8').trimEnd() : '';
  const blocks = (page.blocks || []).map(renderBlock).filter(Boolean);

  const parts = [`# ${page.title}`, '', prose];
  for (const b of blocks) parts.push('', b.trimEnd());
  parts.push('', '---', '', FOOTER_GENERATED);

  return front + parts.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
}

// ---- write or check ----------------------------------------------------------

const outputs = book.pages.map((p) => ({ path: join(PAGES_DIR, `${p.slug}.md`), body: renderPage(p) }));
if (fetched) {
  outputs.push({ path: SNAPSHOT, body: JSON.stringify(snapshot, null, 2) + '\n' });
}

// A page whose record was deleted must not linger in pages/, or the site would
// keep publishing a chapter the handbook no longer claims.
const expected = new Set(book.pages.map((p) => `${p.slug}.md`));
const orphans = existsSync(PAGES_DIR)
  ? readdirSync(PAGES_DIR).filter((f) => f.endsWith('.md') && !expected.has(f))
  : [];

let stale = 0;
for (const o of outputs) {
  const current = existsSync(o.path) ? readFileSync(o.path, 'utf8') : null;
  if (current === o.body) {
    console.log(`ok    ${rel(o.path)}`);
    continue;
  }
  if (CHECK) {
    console.error(`STALE ${rel(o.path)}`);
    stale++;
    continue;
  }
  mkdirSync(dirname(o.path), { recursive: true });
  writeFileSync(o.path, o.body);
  console.log(`wrote ${rel(o.path)}`);
}

for (const f of orphans) {
  if (CHECK) {
    console.error(`ORPHAN pages/${f} (no page record in handbook.json)`);
    stale++;
  } else {
    rmSync(join(PAGES_DIR, f));
    console.log(`removed pages/${f}`);
  }
}

if (CHECK && stale) {
  fail('OUT OF DATE', [`${stale} file(s) do not match the sources.`, 'Run: node bin/compile.mjs']);
}

const provenance = fetched ? 'checked against GitHub just now' : `from the snapshot of ${snapshot.fetched}`;
console.log(`handbook ok: ${book.pages.length} pages, ${repoEntries.length} public repositories, ${provenance}`);

function rel(p) {
  return p.startsWith(ROOT) ? p.slice(ROOT.length + 1) : p;
}

function fail(label, lines) {
  console.error(`\n${label}:\n  - ${lines.join('\n  - ')}`);
  process.exit(1);
}
