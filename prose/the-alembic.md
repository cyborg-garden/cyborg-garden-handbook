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

The repositories that carry the garden's agents into the Commons all run the same
gate, kept in [Swarm Map](https://github.com/cyborg-garden/swarm-map) and called
from each repository as a shared workflow. It has two layers, and both have to
pass.

The first layer is pattern matching. It looks for the shapes of secrets and
personal details: API keys and tokens, private key blocks, passwords inside
connection strings, email addresses, phone numbers, national ID numbers, card
numbers that pass the checksum, IP addresses. A hit is a hard fail, and the fix
is to take the value out.

The second layer is a language model reading the files that carry the most
meaning: docs, skills, the agent's own instructions. It is asked a narrower
question than whether something is secret. Does this file describe one
particular venture, rather than a general method? A client's name, a case
codename, a dataset ID that points at one engagement. The file under review is
fenced off with a random marker on every run, and the model is told everything
inside the fence is untrusted, so a file cannot talk its way past its own
reviewer.

A model flag goes to a person. It asks for a judgement rather than rejecting the
change outright, and someone has to make that judgement before the change
merges.

## What CI does with it

The gate runs on every pull request, against the files the pull request changed.
It fails closed. If the model layer was supposed to run and could not, the check
goes red instead of quietly passing on the first layer alone.

Pull requests from forks get partial coverage, and the run says so. GitHub does
not give repository secrets to a pull request from a fork, so the model layer
cannot run there. The pattern layer still does, and a maintainer reads the diff
for particulars by hand before merging.

Two further checks cover what a diff cannot see. Swarm Map rescans its whole tree
every day. Vera's repository audits the full tree of a release candidate before
the version tag is cut, because Swarm Map installs agents by tag name, and a tag
that has been pushed is already published.

## One gate, pinned by tag

There is one copy of the gate, in Swarm Map, released under a version tag.
Matilde, Vera's repository and the
[package template](https://github.com/NimbleCoAI/usecase-package-template) call
it at that tag, never at a moving branch, so the workflow and the script it runs
always come from the same release. A new version of the gate means a new tag,
and then a bump to every repository's pin.

Matilde's
[account of the gate](https://github.com/cyborg-garden/Matilde/blob/main/docs/sanitization-gate.md)
is the clearest written description of how the two layers behave and what to do
when one of them flags your change.
