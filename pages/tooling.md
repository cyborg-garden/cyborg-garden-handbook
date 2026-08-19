---
title: "Public tooling"
order: 6
summary: "Every public repository, what it is for, and where to start reading it."
updated: 2026-08-18
---
# Public tooling

Everything below is public, readable without an account, and used by the garden
itself. Nothing here is a demo repository published to look busy.

## How the pieces stack

At the bottom is the **agent runtime**. Hermes is an agent that lives on a
messaging platform, holds its own credentials, and runs plugins. The garden runs
a multiplayer fork of it, because the interesting behaviour shows up when several
agents and several people share one room instead of one user talking to one bot.

Above that sits **Swarm Map**, the console. It runs fleets of agents across more
than one runtime, with multi-tenant permissions, group approval for risky
actions, and an audit trail. The garden's own daily operations run on it, which
is the only endorsement worth much.

Around both sit the **capabilities**: a headless browser built to survive bot
detection, a CAPTCHA-solving plugin, Google Workspace access that handles more
than one agent holding keys. These are small on purpose. Each one does a single
thing that an agent could not otherwise do.

Finally there is the **packaging layer**: a template for turning one agent
configured for one job into something you can hand to someone else, and a
lightweight self-hosted install for people who want a single machine rather than
a fleet.

## Reading order

If you are evaluating rather than contributing, read Swarm Map's getting-started
document first, then the multiplayer runtime's contributing guide. Together they
show the permission model, which is the part most agent stacks skip.

## A note on the table below

The purpose lines and the starting points are written by hand. A repository's own
GitHub description is written for maintainers in the shorthand maintainers use
with each other, so the table carries why each thing exists instead. What the
table does pull live from GitHub on every compile is the checkable part: the
default branch, the file to start reading at, whether the repository is archived,
and the date of the last push.

## The repositories

### Ventures

| Repository | Why it exists | Start here | Last touched |
|---|---|---|---|
| [cyborg-garden/agentic-startup-generalist](https://github.com/cyborg-garden/agentic-startup-generalist) | The open core of the founder-support work, MIT licensed. | [README.md](https://github.com/cyborg-garden/agentic-startup-generalist/blob/main/README.md) | 2026-08-05 |
| [NimbleCoAI/brandkit](https://github.com/NimbleCoAI/brandkit) | Logos, marks and type for NimbleCo, kept public so nobody has to ask for a file. | [README.md](https://github.com/NimbleCoAI/brandkit/blob/main/README.md) | 2026-05-27 |

### Open science

| Repository | Why it exists | Start here | Last touched |
|---|---|---|---|
| [cyborg-garden/fde-lean](https://github.com/cyborg-garden/fde-lean) | A machine-checked proof, kept where anyone can rerun the checker. | [README.md](https://github.com/cyborg-garden/fde-lean/blob/main/README.md) | 2026-08-13 |
| [cyborg-garden/Matilde](https://github.com/cyborg-garden/Matilde) | The research colleague behind most of the open science work. Signs its own posts. | [README.md](https://github.com/cyborg-garden/Matilde/blob/main/README.md) | 2026-08-12 |
| [cyborg-garden/open-science](https://github.com/cyborg-garden/open-science) | The experiments themselves, each one a page you can open, check and fork. | [README.md](https://github.com/cyborg-garden/open-science/blob/main/README.md) | 2026-08-14 |

### The studio

| Repository | Why it exists | Start here | Last touched |
|---|---|---|---|
| [cyborg-garden/designing-touch](https://github.com/cyborg-garden/designing-touch) | Live algorithmic art, written so an agent can perform it too. | [README.md](https://github.com/cyborg-garden/designing-touch/blob/main/README.md) | 2026-08-16 |

### Public tooling

| Repository | Why it exists | Start here | Last touched |
|---|---|---|---|
| [cyborg-garden/camofox-browser](https://github.com/cyborg-garden/camofox-browser) | A browser an agent can drive without being shown the door. | [README.md](https://github.com/cyborg-garden/camofox-browser/blob/master/README.md) | 2026-07-18 |
| [cyborg-garden/captcha-solver](https://github.com/cyborg-garden/captcha-solver) | A small plugin, published mostly to prove the path from private tool to public commons runs end to end. | [README.md](https://github.com/cyborg-garden/captcha-solver/blob/main/README.md) | 2026-06-10 |
| [cyborg-garden/google-multiplayer-mcp](https://github.com/cyborg-garden/google-multiplayer-mcp) | Google Workspace access that survives more than one agent holding the keys. | [README.md](https://github.com/cyborg-garden/google-multiplayer-mcp/blob/main/README.md) | 2026-06-09 |
| [cyborg-garden/hermes-agent-mt](https://github.com/cyborg-garden/hermes-agent-mt) | The agent runtime, forked so several people and several agents can share one room. | [CONTRIBUTING.md](https://github.com/cyborg-garden/hermes-agent-mt/blob/main/CONTRIBUTING.md) | 2026-08-17 |
| [NimbleCoAI/hermes-agent-upstream](https://github.com/NimbleCoAI/hermes-agent-upstream) | The upstream the multiplayer fork tracks. Read it to see what changed, and why. | [README.md](https://github.com/NimbleCoAI/hermes-agent-upstream/blob/main/README.md) | 2026-07-19 |
| [NimbleCoAI/NimbleCo-lite](https://github.com/NimbleCoAI/NimbleCo-lite) | The small self-hosted way in, for people who want one machine rather than a fleet. | [README.md](https://github.com/NimbleCoAI/NimbleCo-lite/blob/main/README.md) | 2026-06-02 |
| [cyborg-garden/swarm-map](https://github.com/cyborg-garden/swarm-map) | The console the garden's own agents run on, every day. | [docs/getting-started.md](https://github.com/cyborg-garden/swarm-map/blob/main/docs/getting-started.md) | 2026-08-12 |
| [NimbleCoAI/usecase-package-template](https://github.com/NimbleCoAI/usecase-package-template) | The template for packaging one agent for one job, sanitized enough to hand to someone else. | [README.md](https://github.com/NimbleCoAI/usecase-package-template/blob/main/README.md) | 2026-06-17 |

---

_Compiled by `bin/compile.mjs` from `handbook.json` and `prose/`. Edit the sources, not this file._
