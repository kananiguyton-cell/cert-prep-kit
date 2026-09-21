# Dashboard Refresh — Facilitator Runbook (Kanani)

Refreshes `cert-prep-dashboard.jsx` with current team progress from the private Slack List.
Run this whenever you want an up-to-date view. It's a Claude Code task — just say
**"refresh the cert prep dashboard"** in a Code session with Slack MCP, and follow these steps.

## Steps

1. **Read the List.** `slack_read_list` with `list_title: "Cert Prep — Team Progress"` (or the
   `list_id` once you know it). Pull all rows (paginate if >100).

2. **Dedup to current state.** The workflow appends a row per submission. Keep only the **latest
   row per (Person, Exam)** — sort by `Updated` descending, take the first of each pair. This gives
   each teammate's current status per exam.

3. **Map each row to a `TEAM_STATS.members` entry:**
   - `person` ← the `Person` column (display name).
   - `exam` ← map the `Exam` label to its key: `Tableau Next → tableau`, `MC Next → mcnext`,
     `Data 360 → data360`. (These are the `short` values in `cert-plans.json`.)
   - `status` ← `Status` verbatim (`Studying` / `Scheduled` / `Passed` / `Retaking`).
   - `sectionsComplete` ← `Sections Complete` (number, 0–6).
   - `practiceAvg` ← `Practice Avg %` (number).
   - `lastResult` ← `Last Result` (`Pass` / `Fail` / `—`).
   - `hardest` ← parse the free-text `Hardest Sections` into **section ids** for that exam by
     fuzzy-matching against the section `name`s in `cert-plans.json`. E.g. for Data 360,
     "unification" or "harmonization" → `unify`; "activation" → `activate`. Drop anything that
     doesn't match a section. Keep as an array of ids.
   - `tip` ← the `Tip` column (or omit if blank).

4. **Rewrite the `TEAM_STATS` const** in `cert-prep-dashboard.jsx`:
   - Set `generatedAt` to today's date (e.g. `"2026-09-18"`).
   - Set `sample: false` (this removes the sample banner and the placeholder names).
   - Replace `members: [...]` with the mapped entries.
   - Change nothing else in the file — only the `TEAM_STATS` object.

5. **Open the updated file in Cowork** to view. It renders offline — no network needed.

## Guardrails

- Keep exam keys and section ids identical to `cert-plans.json` — the dashboard maps on them.
- If the List has no rows for an exam, that's fine — the dashboard shows an empty-state card.
- This reads a facilitator-only List; end users can't run this against it, by design.

## TEAM_STATS shape (target)

```js
const TEAM_STATS = {
  generatedAt: "2026-09-18",
  sample: false,
  members: [
    { person: "Firstname L.", exam: "data360", status: "Studying",
      sectionsComplete: 3, practiceAvg: 74, lastResult: "—",
      hardest: ["unify", "activate"], tip: "..." },
    // ...one per (person, exam)
  ],
};
```
