This is the onboarding packet for people doing paid work for the garden on
contract. Most of them are friends doing a short, scoped job. It covers how the
contracts work, how you get paid, what you get access to, and the few rules that
are not up for negotiation. Your contract wins over anything written here. If
the two ever disagree, ask, and this page gets fixed.

## How the contracts work

Every contract is scoped around deliverables: things you make or get done, with a
rate and a cap. You are an independent contractor, not an employee. You choose
how and when you work, you use your own tools, and you are free to work for
anyone else. This matters. Tax law in both Aotearoa New Zealand and
California looks hard at whether a "contractor" is really an employee, so the
contracts are written to keep that answer clear.

Ongoing monthly work follows the same rule. A retainer still lists what you will
deliver each month, such as a log, a playbook update or a set of closed tasks.
It never sets hours, on-call duty or exclusivity.

The hiring entity is the US limited liability company that Cyborg Garden trades
through. Its name is on your contract, and that is who pays you.

Signing is done by email. Your agreement arrives as a PDF with its agreement
number in the subject line. Reply in the same thread with the signed copy, and
you will get the countersigned version back. The contract takes effect once both
sides have signed.

When you get close to your cap, we talk before you go past it. More hours mean a
short change order by email, and it counts once you reply that you agree. Work
done past the cap without one is work we cannot pay for, so flag it early.

## Tax forms

Before your first payment we collect one tax form, through Track1099. It emails
you a link, you fill it in there, and nobody has to send forms around as
attachments.

- **US citizens and residents**, including Americans living abroad: a **W-9**.
- **Everyone else**: a **W-8BEN**.
- **If you are based in Aotearoa New Zealand**, we also ask for an **IR330C**
  before your first invoice.

No form, no payment. It keeps the company's books straight. Nothing is withheld from what we pay you, so your own tax is yours to
handle. If you are a US person, expect a 1099-NEC from us early in the new year.

## Invoicing and getting paid

**Invoice fortnightly.** Each invoice covers two weeks and shows:

- your agreement number
- the dates it covers
- hours and rate, or the deliverables completed, as your contract defines them
- the currency and the total due

Invoice in the currency your contract states, unless we have agreed something
else in writing. We pay from Mercury, the company's bank. Some people are paid
into a Wise account, and if that suits you better, say so when you send your
details.

We confirm any new or changed bank details with you directly, by message or a
call, and never by email reply alone. Invoice fraud usually starts with an email
asking for payment to go somewhere new. If you ever get one that looks like it
came from us, assume it did not and check.

## What you get access to

You get the access your job needs, and no more.

- **GitHub.** An invite to `garden-contractors`, a private repository that works as
  your shared memory with the crew, plus access to the specific repositories your
  job touches. You do not get the garden's full memory, and that is by design.
- **Web tools.** If your work needs one of the garden's internal web apps, you
  get your own login to that one app.
- **Discord.** The contractor role, which opens the **Greenhouse** (where the
  crew and its agents work) and **#approvals** (see below).
- **Agents.** Several of the garden's agents sit in the Greenhouse. Mention one
  by name to ask it something. They only pick up messages that mention them, so a
  question nobody tags goes unanswered.

## Shipping work through the Alembic

The garden's work moves outward through three rings: the **Secret Garden**
(private and particular), the **Greenhouse** (vetted, shared with people the crew
trusts) and the **Commons** (public). The [Alembic](./the-alembic.md) is the
process that promotes things outward, and its gate runs on every pull request.
Contract work almost always starts on the inside, and some of it ends up public.
Build it so that move is easy.

1. **Work on a branch and open a pull request.** Nothing goes straight to a main
   branch.
2. **Let the gate run.** The repositories that carry agents check every pull
   request for secrets and personal details, and a language model reads the
   docs and instructions for anything that describes one particular venture or
   client. A pattern hit is a hard fail: take the value out. A model flag goes to
   a person, who has to clear it before the merge.
3. **Write the general shape, not the particulars.** Keep client names, case
   codenames and one-off IDs in config or in your notes, never in the reusable
   code or its docs. A piece written that way can be promoted without a rewrite.
4. **Tag your releases.** The garden keeps an index of its reusable pieces, and
   Swarm Map installs an agent's package by an immutable version tag, never by a
   branch. A pushed tag counts as published, so tag only what has passed the gate.
5. **Leave promotion to a person.** Moving something into the Greenhouse or the
   Commons is a decision the crew makes, not a step you take.

## Handoffs

At the end of each working session, write a short handoff in `garden-contractors`
so the next person, or the next agent, can pick up where you stopped.

1. Copy `handoffs/_TEMPLATE.md` to `handoffs/YYYY-MM/DD-<handle>-<topic-slug>.md`.
2. Fill in the frontmatter and the sections. Keep every field: the format matches
   the garden's main memory exactly, so good handoffs can be copied across as
   they are.
3. Add one line for it to the top of `handoffs/index.md`.
4. Commit and push, or open a pull request if you were asked to.

Never rename or rewrite someone else's handoff. Write a new one that points at
it. Decisions worth keeping go in `knowledge/decisions/`, plans in `plans/`,
designs in `specs/`. Your own onboarding notes are in `people/<handle>/`, and
the files in `shared/` are read-only copies, so leave them as they are.

## Approvals: real money and anything outward

Anything that touches real money, credentials or the outside world needs a
person's written OK first. That covers purchases and payments, account
sign-ups, emails, posts or messages to anyone outside the crew, and deploys to
shared machines.

Ask in **#approvals**: one line on what you want to do and why, then wait for a
human yes. An agent's yes does not count. If it is urgent, message directly as
well, then post the one-liner in #approvals so there is a record. A dry run
stops at the final confirm screen and declines.

## Secrets stay out of chat and out of repositories

- No API keys, tokens, passwords, private keys, `.env` files, cookies or session
  files in a commit, a chat message, an issue or a handoff.
- Card numbers and passwords never go into an agent's context. A person types
  them.
- No personal details about anyone: addresses, phone numbers, travel, payments,
  family, home network details.
- Keep te reo Māori content and any third-party data out of training,
  fine-tuning and evaluation sets.
- Run `git diff --staged` before every commit and read it.

If you need a secret to do your job, ask how it should reach you. If one leaks,
say so straight away. A key rotated in ten minutes is a small story, and a
leak kept quiet is a bad one.

## Asking questions

Ask early, and ask in the open where you can. For anything about the work, post
in the Greenhouse, where someone, human or agent, will usually know. For quick
lookups, mention an agent. For a question that can wait, write it into your
handoff under its open threads, where it will get picked up. For anything urgent
or private, message directly.

There is no such thing as a question too small here. A five-minute question
costs less than a day spent building the wrong thing.
