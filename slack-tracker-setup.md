# Slack Progress Tracker — Facilitator Setup (Kanani, one-time)

This is the stats pipeline: teammates report progress through a **Slack Workflow form**; the
workflow writes to a **Slack List only you can see**; your Code reads that List to build the
dashboard. Because the *workflow* is the writer, teammates never need access to the List — that's
what keeps it facilitator-only.

```
teammate fills workflow form (in #claudecode_certprepkit)
        │  workflow "Add item to list" step  (workflow = writer)
        ▼
Slack List "Cert Prep — Team Progress"  (PRIVATE to you)
        │  slack_read_list via MCP
        ▼
your Code → builds TEAM_STATS → cert-prep-dashboard.jsx (Cowork)
```

---

## Status at a glance (updated 2026-09-22)

**✅ Done**
- **Part A — List created** via MCP (`Cert Prep — Team Progress`, ID `F0C301AURRV`).
- **Visibility confirmed** private to Kanani (not shared to the channel).
- **`Exam` labels** created exactly `Tableau Next` / `MC Next` / `Data 360`.
- **Primary column renamed** `Person` → `Submitter`; docs updated to match.

**⏳ Remaining (Kanani, in Slack)**
- **Part B** — build + publish the Workflow (form → "Add an item to a list") and run the crux test
  (non-facilitator submission lands a row they can't open).
- **Part C** — pin the workflow link in `#claudecode_certprepkit`; send the link to Claude to fill
  `WORKFLOW_URL` in the skill.
- **First refresh** — once a real row exists, Claude runs `slack_read_list` → rebuilds `TEAM_STATS`
  (replaces the current stopgap data).

---

## Part A — Create the private List — ✅ DONE (created via MCP 2026-09-21)

The List **`Cert Prep — Team Progress`** now exists:

- **ID:** `F0C301AURRV`
- **Link:** <https://salesforce.enterprise.slack.com/lists/T5J4Q04QG/F0C301AURRV>

Columns as built (in order):

| Column | Type | Options / notes |
|---|---|---|
| `Submitter` | text (primary) | Submitter's name. Text, not a `user` column — Slack requires the primary column to be text. The workflow maps "Person who submitted" into it as text. |
| `Exam` | select | `Tableau Next`, `MC Next`, `Data 360` |
| `Status` | select | `Studying`, `Scheduled`, `Passed`, `Retaking` |
| `Sections Complete` | number | Count of checklist sections the person has finished (0–6). |
| `Practice Avg %` | number | Their latest practice-quiz score. |
| `Last Result` | select | `Pass`, `Fail`, `—` |
| `Hardest Sections` | text | Free text, e.g. "Consent, Flows". |
| `Tip` | text | One-line tip for teammates. |

**`Updated` column:** not created via MCP (`last_edited_time` isn't an MCP-creatable type). Slack
tracks last-edited automatically; add it as a visible column from the List UI (**+ Add column →
Last edited time**) if you want it on screen. The dashboard doesn't need it.

**UI confirmations — ✅ done:**
1. **Visibility** — confirmed **not shared** to `#claudecode_certprepkit` or anyone; stays
   facilitator-only.
2. **`Exam` labels** — read exactly `Tableau Next` / `MC Next` / `Data 360`, matching the `short`
   values in `cert-plans.json`.

---

## Part B — Build the Workflow (Workflow Builder)

In Slack: **Tools → Workflow Builder → New Workflow**.

**Workflow name:** `Log Cert Prep Progress`

1. **Trigger:** "From a link" (or a button/bookmark you pin in `#claudecode_certprepkit`). A link
   trigger lets anyone in the channel start it on demand.
2. **Step — "Collect info in a form"**. Set the form up as:
   - **Form title:** `📊 Log your cert prep`
   - **Form description:** `Takes ~30 seconds. Log a study session, a practice round, or an exam
     result. Your facilitator sees the team view — you don't need to do anything else.`

   Fields (map each to a List column in step 3). "Req?" = required in Builder; the rest are optional
   so people can log a quick update without every field:

   | Field | Type | Req? | Options | Hint (helper text) |
   |---|---|---|---|---|
   | *Exam* | select | ✅ | `Tableau Next`, `MC Next`, `Data 360` | Which certification this update is about. |
   | *Status* | select | ✅ | `Studying`, `Scheduled`, `Passed`, `Retaking` | Where you are with this exam right now. |
   | *Sections complete (0–6)* | number | ✅ | — | How many of the 6 exam sections you've finished studying. Check your 80/20 plan in the skill if unsure. Enter 0–6. |
   | *Practice score %* | number | — | — | Your most recent practice-quiz score as a percent (0–100). Leave blank if you haven't taken one yet. |
   | *Last result* | select | ✅ | `Pass`, `Fail`, `Not taken yet` | Only if you've sat the real exam. Pick "Not taken yet" if you're still studying or just scheduled. |
   | *Hardest sections* | short text | — | — | The topic(s) giving you the most trouble, e.g. "Consent, Flows". |
   | *Tip for teammates* | short text | — | — | One thing that clicked or that you'd tell someone starting this exam. |

   > The dashboard handles a blank *Practice score* — it renders "—" rather than a fake 0%, so an
   > empty field flows through cleanly.
3. **Step — "Add an item to a list"** → select the `Cert Prep — Team Progress` list. Map:
   - `Submitter` ← **Person who submitted the form** (a built-in workflow variable)
   - `Exam` ← form Exam · `Status` ← form Status · `Sections Complete` ← form number ·
     `Practice Avg %` ← form score · `Last Result` ← form result (`Not taken yet` → `—`) ·
     `Hardest Sections` ← form text · `Tip` ← form text
4. **Publish.** Copy the workflow link.

**Verify the crux:** confirm the workflow writes to the private List even though the submitter
can't open the List directly. (This is the whole design — [Likely] it works because the workflow
runs with its own permissions, but confirm it once with a test submission.) If your workspace tier
blocks link-triggered workflows or the list-write step, tell me and we'll switch collection to a
webhook the skill posts to.

---

## Part C — Wire it up

1. **Pin the workflow link** in `#claudecode_certprepkit` (e.g. as "📊 Log your cert prep").
2. **Fill `WORKFLOW_URL`** in `~/.claude/skills/cert-prep/SKILL.md` (the "Report your progress"
   section) with the copied link, so the skill can point teammates to it precisely.

---

## Notes on appends vs. updates

The "Add an item to a list" step **appends a new row** each time someone reports — it does not
update in place. That's fine: the dashboard build **keeps the latest row per (Submitter, Exam)** and
ignores older ones, so history is preserved in the List while the dashboard shows current state.
If Workflow Builder later offers an "update matching item" step, we can switch to it, but append +
dedup-on-build is the reliable default.

---

## Verification checklist

- [x] List created, private to you, columns and `Exam` labels exactly as above.
- [ ] Workflow published; link pinned in the channel.
- [ ] Test submission from a non-facilitator account lands a row in the List.
- [ ] That test account **cannot** open/browse the List.
- [ ] `slack_read_list` returns the row for your dashboard build.
