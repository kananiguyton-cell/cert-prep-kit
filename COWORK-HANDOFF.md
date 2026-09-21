# Opening the Dashboard in Cowork (Facilitator)

The old team-facing Hub (`cert-prep-hub.jsx`) is **retired** — teammates now study through the
`cert-prep` Claude Code skill, not an artifact. The only thing you open in Cowork is your
**facilitator dashboard**, `cert-prep-dashboard.jsx`.

## How to open it

1. Refresh it first (so it shows real data): in a Claude Code session with Slack MCP, say
   **"refresh the cert prep dashboard"** and follow `dashboard-refresh.md`. This reads the private
   Slack List and bakes current `TEAM_STATS` into the file.
2. Open `cert-prep-dashboard.jsx` in Cowork. It renders in the sidebar — **fully offline**, no
   network, no AI, no login. Pick an exam tab to see roll-ups, the "where the team struggles" heat
   bar, and per-teammate progress.

## Notes

- Before the first refresh it shows **sample data** with a banner and placeholder names — that's
  expected; the refresh replaces it and clears the banner (`sample: false`).
- It's read-only and private to you. Nothing you do in it writes back anywhere.
- If you add a cert to `cert-plans.json`, mirror the trimmed structure in the dashboard's `PLANS`
  const (or just re-run the refresh flow, which regenerates it) so the new exam appears.
