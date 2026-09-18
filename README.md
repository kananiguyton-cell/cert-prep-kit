# Cert Prep Kit — v1

A self-improving certification prep pipeline for:
- **Salesforce Certified Tableau Next Consultant**
- **Salesforce Certified Marketing Cloud Next Consultant**

Built on an 80/20 principle: study plans weighted by real exam section weights,
continuously re-targeted by the team's actual pass/fail experience and fresh
enablement research.

## What's in the box

| File | What it is |
|---|---|
| `cert-prep-hub.jsx` | The Cert Prep Hub — interactive Claude artifact: 80/20 study plans with progress tracking, AI-generated practice quizzes, team insights, research digests |
| `cert-research-cron.sh` | Weekly automation: reads #cert-prep, researches new materials with Claude Code, posts a digest, publishes the snapshot the Hub reads |
| `slack-channel-guide.md` | Posting conventions for #cert-prep — share/pin in the channel |
| `80-20-cert-prep-plans.md` | The full written study plans (readable reference version of what's in the Hub) |

## How it fits together

```
 teammates post results/questions        weekly cron (Mon 7am)
        │                                        │
        ▼                                        ▼
   #cert-prep  ──────── reads ────────►  Claude Code research run
        ▲                                        │
        │                              ┌─────────┴──────────┐
    posts digest ◄─────────────────────┤                    │
                                       ▼                    ▼
                                  digest.md          snapshot.json → gist
                                                             │
                                                             ▼
                                                    Cert Prep Hub artifact
                                              (insights · quiz weighting · digest)
```

Slack is the source of truth. The Hub is the study surface. The cron is the
brain that keeps both current.

## Setup order (owner: one person, ~30 min)

1. **Create #cert-prep** in Slack; pin `slack-channel-guide.md`.
2. **Create the gist** (secret gist, file `cert-prep-snapshot.json`, content `{}`).
3. **Wire the Hub:** paste the gist's Raw URL into `SNAPSHOT_URL` at the top of
   `cert-prep-hub.jsx`, create it as a Claude artifact, publish, and share the
   link in #cert-prep. (Without a URL it still works standalone.)
4. **Install the cron** on a machine with Claude Code + `gh` CLI: follow the
   setup block at the top of `cert-research-cron.sh` (Slack app token, `.env`,
   crontab entry).
5. **Seed it:** post your own first HARD TOPIC or RESULT so week one's digest
   has something to chew on.

## For teammates (zero setup)

- Open the Hub link → work the checklists, run practice rounds.
- Post results, hard topics, and resources in #cert-prep per the guide.
- Read the Monday digest.

## Notes & guardrails

- Never share literal exam questions anywhere in the pipeline — topic areas only.
- Keep `.env` (Slack token) local and uncommitted; the gist should be secret.
- Each person's Hub checklist/quiz progress is private to them; insights and
  digests are shared.
- v1 scope: two exams. Adding an exam = add a plan object in the Hub's `PLANS`
  and its section-id mapping in the cron prompt.

— v1 · August 2026
