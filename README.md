# Cert Prep Kit — v2

A certification prep system for the team, covering:
- **Salesforce Certified Tableau Next Consultant**
- **Salesforce Certified Marketing Cloud Next Consultant**
- **Salesforce Certified Data 360 Consultant**

Built on an 80/20 principle: study plans weighted by real exam section weights. **v2 splits the
kit for the team's environment (Claude Code + Cowork, not claude.ai):** end users study through a
Claude Code skill at full model quality; the facilitator gets a read-only Cowork dashboard of team
progress, fed by a Slack workflow.

## Architecture

```
END USERS — Claude Code + `cert-prep` skill              FACILITATOR — Kanani
  product-aware 80/20 plans · scenario quizzes                  │
  · live WebSearch research · Socratic tutoring                 │
            │ report progress                                   │
            ▼                                                    │
  Slack Workflow form (in #claudecode_certprepkit)               │
            │  "add record" step  (workflow = writer)           │
            ▼                                                    │
  Slack List — PRIVATE to Kanani  ──── slack MCP read ──────────►│
                                                                 ▼
                                          Kanani's Code: read List → build
                                                                 │
                                                                 ▼
                                    cert-prep-dashboard.jsx (Cowork, read-only)
```

Why the split: in Cowork, AI runs on single-turn Haiku with no web search — bad for generating
questions and impossible for research. In Claude Code, it's full quality with real `WebSearch` and
MCP. So the *thinking* lives in Code (the skill); Cowork does what it's great at — a visual,
interactive **read-only dashboard** (no generation, so its limits don't matter).

## What's in the box

| File | What it is |
|---|---|
| `cert-plans.json` | **Single source of truth** — objective structure of every exam (sections, weights, official topics, pass marks, trails, suggested sequences). Both the skill and the dashboard read it. |
| `~/.claude/skills/cert-prep/` | The **end-user skill** (`SKILL.md` + its copy of `cert-plans.json`): 80/20 plans, scenario practice quizzes, live research, tutoring. This is how teammates study. |
| `cert-prep-dashboard.jsx` | The **facilitator dashboard** — read-only Cowork artifact: per-exam team roll-ups, a "where the team struggles" heat bar, and per-teammate progress. No AI/network/storage. |
| `slack-tracker-setup.md` | One-time facilitator setup: build the Slack List + Workflow that collect progress (facilitator-only). |
| `dashboard-refresh.md` | Runbook: read the Slack List via MCP → regenerate the dashboard's `TEAM_STATS` → open in Cowork. |
| `slack-channel-guide.md` | Channel conventions — log via the workflow; free-form tips/resources/questions. |
| `cert-prep-hub.jsx` | **Superseded** by the split above (was the single all-in-one artifact for claude.ai). Kept for reference. |
| `80-20-cert-prep-plans.md` | **Superseded** readable study plans (2 exams, stale) — now sourced from `cert-plans.json`. Kept for reference. |
| `cert-research-cron.sh` | **Retired** weekly research cron — research now lives in the skill's live `WebSearch`. Kept for reference. |

## Setup order (facilitator, one-time)

1. **Confirm the skill is installed:** `~/.claude/skills/cert-prep/SKILL.md` + `cert-plans.json`
   exist. Teammates invoke it in Code with "help me study for [that cert]".
2. **Build the Slack tracker:** follow `slack-tracker-setup.md` — create the private List and the
   Workflow, pin the workflow link, and paste that link into `WORKFLOW_URL` in the skill.
3. **Seed + refresh the dashboard:** once teammates start logging, run `dashboard-refresh.md`
   ("refresh the cert prep dashboard") to bake real data into `cert-prep-dashboard.jsx`, then open
   it in Cowork.

## For teammates (zero setup)

- In Claude Code: "help me study for Data 360" (or Tableau Next, or MC Next). Work the plan, run
  practice rounds, ask for research or tutoring.
- Log progress through the pinned **📊 Cert Prep progress** workflow in #claudecode_certprepkit.
- Post tips, resources, and hard topics freely in the channel.

## Notes & guardrails

- Never share literal exam questions — topic areas only. The skill generates original scenarios.
- The team stats List is **facilitator-only**: the Slack workflow is the writer, so teammates
  never need access to it.
- Each teammate's study happens in their own Code session; only what they submit via the workflow
  is shared.
- **Product-aware by design.** Adding a cert is a **data-only** change in one place:
  `cert-plans.json` (name, passPct, passNote, trail, sections, sequence). The skill picks it up
  automatically; the dashboard picks it up on the next refresh. Keep section `id`s stable and
  section `weight`s summing to 100 — the dashboard and Slack tracker key off the same ids.

— v2 · September 2026
