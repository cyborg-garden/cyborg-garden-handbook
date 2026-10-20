The Alembic is the process that moves work outward through the rings. Take
something that has proven itself in the Secret Garden, strip out the particulars
that belong to one venture or one person, and release the general shape into the
Commons. The covenant calls it the still, which is about right. What goes in is
specific and private. What comes out is the part anyone can use.

## The path

Work starts in the **Secret Garden**, where ventures run their rawest bots
against real problems. When something there keeps working, it moves to the
**Greenhouse**: named, visible to people the crew trusts, still carrying details
that are nobody else's business. When it is ready, it goes to the **Commons** as
a public repository.

Ready has a specific meaning here. A thing goes public once publishing it no
longer hands a competitor the edge, because the edge has moved into the garden's
running head start and the hosted service. Vera is the worked example. The whole
self-hostable package is public and MIT licensed, and the hosted version is the
part founders pay for.

## The gate

The repositories that carry the garden's agents into the Commons each run a gate:
a script called `check_sanitization.py`, usually under `scripts/`, usually with a
`sanitize.config.json` beside it that names the folders that matter most. It
has two layers, and both have to pass.

The first layer is pattern matching. It looks for the shapes of secrets and
personal details: API keys and tokens, private key blocks, passwords inside
connection strings, email addresses, phone numbers, national ID numbers, card
numbers that pass the checksum, IP addresses. It needs no credentials and no
network, so it runs everywhere. A hit is a hard fail, and the fix is to take the
value out.

The second layer is a language model reading the files that carry the most
meaning: docs, skills, the agent's own instructions. It is asked a narrower
question than whether something is secret. Does this file describe one
particular venture, rather than a general method? A client's name, a case
codename, a dataset ID that points at one engagement. The file under review is
fenced off with a random marker on every run, and the model is told everything
inside the fence is untrusted, so a file cannot talk its way past its own
reviewer. In Swarm Map, Matilde and Vera's repository this layer runs through
OpenRouter.

A model flag goes to a person. It asks for a judgement rather than rejecting the
change outright, but someone has to make that judgement before the change
merges.

## What CI does with it

The gate runs on every pull request, against the files the pull request changed.
It fails closed. If the model layer was supposed to run and could not, because a
key was missing or the provider returned an error, the check goes red instead of
quietly passing on the first layer alone.

Pull requests from forks get partial coverage, and the run says so. GitHub does
not give repository secrets to a pull request from a fork, so the model layer
cannot run there. The pattern layer still does, and the check posts a warning
that a maintainer has to read the diff for particulars by hand before merging.
Letting the model layer run on forks safely is a deliberate decision that has not
been made yet.

Two further checks cover what a diff cannot see. Swarm Map rescans its whole tree
every day, which catches a file that reached the main branch without any single
pull request touching it. Vera's repository audits the full tree of a release
candidate before the version tag is cut, because Swarm Map installs agents by tag
name, and a tag that has been pushed is already published.

## Each repository carries its own copy

Right now each repository carries its own copy of the gate. Swarm Map, Matilde,
Vera's repository, the [package
template](https://github.com/NimbleCoAI/usecase-package-template) and the
[anti-slop guide](https://github.com/cyborg-garden/anti-slop-core) each have
their own version, and the copies have drifted apart. They differ in length, in
which shapes they detect, in their command-line flags, and in how they reach the
model. The template, for instance, leaves the model layer optional until you add
a key, because it is meant to be copied by people who have not set one up yet,
and it tells you the one flag that makes it mandatory once you have.

Pulling the copies back into one shared gate is planned work. Until then, if you
are contributing, read the copy in the repository you are working on. Every copy
accepts `--all` to scan the whole tree. Matilde's
[account of the gate](https://github.com/cyborg-garden/Matilde/blob/main/docs/sanitization-gate.md)
is the clearest written description of how the two layers behave and what to do
when one of them flags your change.

## The handbook follows the same rule

This handbook sits on the Commons side of the gate, and it uses the simplest
version of the rule. Only public repositories are written down here. The compile
asks GitHub about each one before it writes a page, and refuses to write anything
if a single answer comes back as other than public. Private work is absent rather
than redacted, because a page that never held a private detail has nothing to
leak.
