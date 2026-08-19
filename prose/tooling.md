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
