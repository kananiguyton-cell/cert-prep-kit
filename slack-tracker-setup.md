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

## Part A — Create the private List

Create a Slack List named **`Cert Prep — Team Progress`**. Keep it **private to you** (don't share
it to the channel). Give it these columns, in this order:

| Column | Type | Options / notes |
|---|---|---|
| `Person` | person (user) | The submitter; the workflow fills this automatically. Primary column. |
| `Exam` | select | `Tableau Next`, `MC Next`, `Data 360` |
| `Status` | select | `Studying`, `Scheduled`, `Passed`, `Retaking` |
| `Sections Complete` | number | Count of checklist sections the person has finished (0–6). |
| `Practice Avg %` | number | Their latest practice-quiz score. |
| `Last Result` | select | `Pass`, `Fail`, `—` |
| `Hardest Sections` | text | Free text, e.g. "Consent, Flows". |
| `Tip` | text | One-line tip for teammates. |
| `Updated` | last_edited_time | Auto — no input needed. |

**Keep the `Exam` option labels exactly** `Tableau Next` / `MC Next` / `Data 360` — they must match
the `short` values in `cert-plans.json` so the dashboard can map rows to exams.

> Want me to create this List for you via the Slack MCP? I can — then you just flip it to private
> and confirm the columns. Or build it in the Slack UI yourself if you'd rather own its visibility
> from the start.

---

## Part B — Build the Workflow (Workflow Builder)

In Slack: **Tools → Workflow Builder → New Workflow**.

1. **Trigger:** "From a link" (or a button/bookmark you pin in `#claudecode_certprepkit`). A link
   trigger lets anyone in the channel start it on demand.
2. **Step — "Collect info in a form"** with these fields (map each to a List column in step 3):
   - *Exam* — select: `Tableau Next`, `MC Next`, `Data 360`
   - *Status* — select: `Studying`, `Scheduled`, `Passed`, `Retaking`
   - *Sections complete (0–6)* — number
   - *Practice score %* — number
   - *Last result* — select: `Pass`, `Fail`, `Not taken yet`
   - *Hardest sections* — short text (optional)
   - *Tip for teammates* — short text (optional)
3. **Step — "Add an item to a list"** → select the `Cert Prep — Team Progress` list. Map:
   - `Person` ← **Person who submitted the form** (a built-in workflow variable)
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
update in place. That's fine: the dashboard build **keeps the latest row per (Person, Exam)** and
ignores older ones, so history is preserved in the List while the dashboard shows current state.
If Workflow Builder later offers an "update matching item" step, we can switch to it, but append +
dedup-on-build is the reliable default.

---

## Verification checklist

- [ ] List created, private to you, columns and `Exam` labels exactly as above.
- [ ] Workflow published; link pinned in the channel.
- [ ] Test submission from a non-facilitator account lands a row in the List.
- [ ] That test account **cannot** open/browse the List.
- [ ] `slack_read_list` returns the row for your dashboard build.
