#!/usr/bin/env bash
# ============================================================
# cert-research-cron.sh — v1
# Weekly synchronized research pipeline for the Cert Prep Kit.
#
# Flow (every Monday 7am):
#   1. READ   — pulls the last 7 days of #cert-prep Slack messages
#               (exam results, hard topics, resources, questions).
#   2. THINK  — runs Claude Code headless with web search: checks both
#               exam guides for changes, finds new enablement, and digs
#               deeper on anything the channel flagged hard or failed.
#   3. WRITE  — posts a digest back to #cert-prep AND publishes
#               cert-prep-snapshot.json to a GitHub gist, which the
#               Cert Prep Hub artifact reads live.
#
# ------------------------------------------------------------
# ONE-TIME SETUP
# ------------------------------------------------------------
# A. Slack app (5 min):
#    1. api.slack.com/apps → Create New App → From scratch.
#    2. OAuth & Permissions → Bot Token Scopes: channels:history,
#       channels:read, chat:write.
#    3. Install to workspace; copy the xoxb- token.
#    4. Invite the bot to #cert-prep (/invite @YourBot).
#    5. Get the channel ID (channel details → About → Channel ID).
# B. Gist:
#    1. gist.github.com → new SECRET gist, filename
#       cert-prep-snapshot.json, content: {}
#    2. Copy the gist ID from its URL. Ensure `gh` CLI is authed
#       (gh auth login) on this machine.
#    3. Open the gist's Raw URL, copy it, and paste into
#       SNAPSHOT_URL at the top of cert-prep-hub.jsx, then
#       republish the artifact. (Raw URLs allow cross-origin
#       reads, so the hub can fetch it directly.)
# C. This machine:
#       mkdir -p ~/cert-prep
#       cp cert-research-cron.sh ~/cert-prep/ && chmod +x ~/cert-prep/cert-research-cron.sh
#       Create ~/cert-prep/.env with:
#         SLACK_BOT_TOKEN=xoxb-...
#         SLACK_CHANNEL_ID=C0XXXXXXX
#         GIST_ID=abc123...
#       crontab -e → add:
#         0 7 * * 1 ~/cert-prep/cert-research-cron.sh >> ~/cert-prep/cron.log 2>&1
#
# Notes: never commit .env anywhere. The bot only reads #cert-prep.
# ============================================================

set -euo pipefail

BASE_DIR="${HOME}/cert-prep"
WORK_DIR="${BASE_DIR}/run-$(date +%Y%m%d)"
TODAY="$(date +%Y-%m-%d)"
mkdir -p "${WORK_DIR}"

# shellcheck disable=SC1091
source "${BASE_DIR}/.env"
: "${SLACK_BOT_TOKEN:?Set SLACK_BOT_TOKEN in ~/cert-prep/.env}"
: "${SLACK_CHANNEL_ID:?Set SLACK_CHANNEL_ID in ~/cert-prep/.env}"
: "${GIST_ID:?Set GIST_ID in ~/cert-prep/.env}"

# ---------- 1. READ: last 7 days of #cert-prep ----------
OLDEST=$(date -d '7 days ago' +%s 2>/dev/null || date -v-7d +%s)
curl -s -G "https://slack.com/api/conversations.history" \
  -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
  --data-urlencode "channel=${SLACK_CHANNEL_ID}" \
  --data-urlencode "oldest=${OLDEST}" \
  --data-urlencode "limit=200" \
  > "${WORK_DIR}/slack_raw.json"

if ! grep -q '"ok":true' "${WORK_DIR}/slack_raw.json"; then
  echo "Slack read failed:" && cat "${WORK_DIR}/slack_raw.json" && exit 1
fi

# ---------- 2. THINK: Claude Code headless run ----------
PROMPT=$(cat <<EOF
Today is ${TODAY}. You maintain a team certification-prep pipeline for two exams:
  1. Salesforce Certified Tableau Next Consultant
     (guide: https://help.salesforce.com/s/articleView?id=005387158&type=1)
  2. Salesforce Certified Marketing Cloud Next Consultant
     (guide: https://help.salesforce.com/s/articleView?id=005387657&type=1)

STEP 1 — Parse the channel. Read ${WORK_DIR}/slack_raw.json (raw Slack
conversations.history export of #cert-prep, last 7 days). Extract, tolerating
informal phrasing, messages matching our conventions:
  - RESULT posts: exam taken, pass/fail, hardest sections, tips, author name
  - HARD TOPIC posts: topics people are struggling with mid-study
  - RESOURCE posts: links teammates found useful
Map exams to keys: tableau | mcnext. Map hardest-section mentions to these ids:
  tableau: sem (semantic models), agent (agentic experiences), embed
  (embedding/interop), viz (visualizations), admin (setup/security),
  ws (workspaces/deployment)
  mcnext: flow (campaigns/flows/content), data (Data 360/segmentation),
  setup (platform setup/governance), consent, ai (Agentforce/AI),
  rpt (analytics)

STEP 2 — Research with web search:
  a. Check both exam guides for outline/weighting/release changes.
  b. Find enablement published in the last 60 days: Trailhead modules/trails,
     Trailhead Academy courses, Help docs, release notes touching exam topics,
     community exam-experience writeups.
  c. For every section flagged hard or tied to a FAIL this week, find the single
     best targeted study resource for that exact topic.

STEP 3 — Write exactly two files:

FILE ${WORK_DIR}/digest.md — a Slack-friendly digest (plain markdown, no HTML,
under 350 words): this week's attempts & congrats, hardest-flagged sections,
what's new for each exam (or "no changes"), targeted fixes for weak spots with
links, and one suggested focus for the coming week.

FILE ${WORK_DIR}/snapshot.json — machine-readable, EXACTLY this schema:
{
  "generatedAt": "<ISO timestamp>",
  "outcomes": [{"date":"YYYY-MM-DD","exam":"tableau|mcnext","result":"pass|fail","hardSections":["<id>"],"alias":"<first name or blank>","tip":"<tip or blank>"}],
  "flaggedSections": {"tableau":{"<id>":<count>},"mcnext":{"<id>":<count>}},
  "tips": [{"exam":"tableau|mcnext","tip":"...","alias":"..."}],
  "research": {"ranAt":"${TODAY}","digest":"<the same digest as plain text>"}
}
Counts in flaggedSections must be cumulative across all RESULT and HARD TOPIC
posts parsed this run. Valid JSON only — no trailing commas, no comments.
EOF
)

claude -p "${PROMPT}" --allowedTools "WebSearch,WebFetch,Read,Write" --add-dir "${WORK_DIR}"

[[ -f "${WORK_DIR}/digest.md" && -f "${WORK_DIR}/snapshot.json" ]] || {
  echo "Claude run did not produce expected files"; exit 1; }

# Validate JSON before publishing
python3 -m json.tool "${WORK_DIR}/snapshot.json" > /dev/null

# ---------- 3a. WRITE: post digest to #cert-prep ----------
DIGEST_TEXT=$(python3 - "$WORK_DIR/digest.md" <<'PY'
import json, sys
print(json.dumps(open(sys.argv[1]).read()))
PY
)
curl -s -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"${SLACK_CHANNEL_ID}\",\"text\":${DIGEST_TEXT}}" \
  | grep -q '"ok":true' && echo "Digest posted to Slack."

# ---------- 3b. WRITE: publish snapshot to the gist ----------
cp "${WORK_DIR}/snapshot.json" "${WORK_DIR}/cert-prep-snapshot.json"
gh gist edit "${GIST_ID}" "${WORK_DIR}/cert-prep-snapshot.json"
echo "Snapshot published. The Cert Prep Hub will pick it up on next load."

# Keep a local archive too
cat "${WORK_DIR}/digest.md" >> "${BASE_DIR}/research-log.md"
echo "Run complete: ${TODAY}"
