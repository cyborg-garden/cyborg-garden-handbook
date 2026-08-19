# The Cyborg Garden Handbook

This repository holds the handbook for [Cyborg Garden](https://cyborg.garden/): a
single navigable account of everything the garden does in public. The venture
studio, the open science, the games and stories, and the dozen or so
repositories anyone can read. Start at [pages/index.md](pages/index.md), or read
it on the site at [cyborg.garden/handbook](https://cyborg.garden/handbook). It
exists because the work is scattered across two GitHub organizations, a website
with half a dozen sections, and several feeds, and a stranger arriving at any one
of those has no way to see the rest.

The handbook compiles itself. The chapters in `pages/` are generated from two
sources: `handbook.json`, which records every public repository and public page
along with why it exists, and `prose/`, which holds the hand-written body of each
chapter. Running `node bin/compile.mjs` asks GitHub about each listed repository
and rewrites the chapters, so the default branch, the file to start reading at
and the date of the last push are checked rather than remembered. A weekly job
does exactly that and commits the result. The reason the whole thing is public,
rather than a projection of something internal, is that it makes the privacy rule
mechanical: only public repositories are ever written down here, the compile
verifies that against GitHub's own answer before writing a single file, and
everything else is absent rather than redacted. There is no sanitization step to
get wrong.

The verification fails closed, which is the part worth knowing before you trust
it. A repository whose visibility comes back as anything other than `PUBLIC`
aborts the run, and so does a repository the compile could not look up at all,
because a repository that has just gone private looks exactly like a lookup that
failed. Falling back to the committed snapshot is allowed only when the GitHub
CLI is unusable, meaning nothing was checked and nothing was contradicted, and
only while that snapshot is inside the max age stamped into it.

## Working on it

```sh
node bin/compile.mjs                # refresh from GitHub, then rewrite pages/
node bin/compile.mjs --no-fetch     # rewrite pages/ from the committed snapshot
node bin/compile.mjs --check        # fail if pages/ does not match its sources (CI)
node bin/compile.mjs --allow-stale  # compile from a snapshot past its max age
```

Edit `handbook.json` or a file in `prose/`, then compile and commit both the
source and the regenerated pages. Do not edit anything in `pages/` or
`generated/`. The next compile will overwrite it, and CI will fail before that in
case you were hoping otherwise.

`README.md` and everything in `prose/` are written by hand. Everything in
`pages/` and `generated/` is compiled.
