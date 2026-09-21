#!/usr/bin/env bash
# ============================================================
# RETIRED in v2 (kept for reference). Research now runs live inside the
# `cert-prep` Claude Code skill via WebSearch, per-user and on demand — there
# is no weekly cron, gist snapshot, or Hub to feed anymore. Team progress is
# tracked through the Slack workflow + private List (see slack-tracker-setup.md).
# Repurpose the EXAMS catalog below only if you ever revive a batch digest.
# ============================================================
# cert-research-cron.sh — v1
# Weekly synchronized research pipeline for the Cert Prep Kit.
#
# Flow (every Monday 7am):
#   1. READ   — pulls the last 7 days of #claudecode_certprepkit Slack messages
#               (exam results, hard topics, resources, questions).
#   2. THINK  — runs Claude Code headless with web search: checks both
#               exam guides for changes, finds new enablement, and digs
#               deeper on anything the channel flagged hard or failed.
#   3. WRITE  — posts a digest back to #claudecode_certprepkit AND publishes
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
#    4. Invite the bot to #claudecode_certprepkit (/invite @YourBot).
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
# Notes: never commit .env anywhere. The bot only reads #claudecode_certprepkit.
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

# ---------- 1. READ: last 7 days of #claudecode_certprepkit ----------
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

# ============================================================
# EXAM CATALOG — the ONLY place to edit when adding a product.
# Keep in sync with the PLANS registry in cert-prep-hub.jsx
# (same keys, same section ids). One row per exam, fields split on "|":
#   key | Full certification name | Exam-guide URL | id=label;id=label;...
# The prompt fragments below are generated from this — nothing per-exam
# is hardcoded past this block.
# ============================================================
EXAMS=(
  "tableau|Salesforce Certified Tableau Next Consultant|https://help.salesforce.com/s/articleView?id=005387158&type=1|sem=semantic models;agent=agentic experiences;embed=embedding/interop;viz=visualizations;admin=setup/security;ws=workspaces/deployment"
  "mcnext|Salesforce Certified Marketing Cloud Next Consultant|https://help.salesforce.com/s/articleView?id=005387657&type=1|flow=campaigns/flows/content;data=Data 360/segmentation;setup=platform setup/governance;consent=consent;ai=Agentforce/AI;rpt=analytics"
  "data360|Salesforce Certified Data 360 Consultant|https://help.salesforce.com/s/articleView?id=005298940&type=1|pos=solution positioning;admin=setup/administration;ingest=data source connection/ingestion;unify=harmonization/unification;insights=data enhancements/sharing/analysis;activate=data activations/utilization"
)

EXAM_LIST_BLOCK=""
SECTION_MAP_BLOCK=""
KEYS_PIPE=""
i=1
for row in "${EXAMS[@]}"; do
  IFS='|' read -r key name url sections <<< "$row"
  EXAM_LIST_BLOCK+="  ${i}. ${name}"$'\n'"     (guide: ${url})"$'\n'
  pretty="$(echo "$sections" | sed 's/=/ (/g; s/;/), /g')"
  SECTION_MAP_BLOCK+="  ${key}: ${pretty})"$'\n'
  KEYS_PIPE+="${key}|"
  i=$((i + 1))
done
KEYS_PIPE="${KEYS_PIPE%|}"

# ---------- 2. THINK: Claude Code headless run ----------
# read -d '' (not $(cat <<EOF)) — the latter breaks on stock macOS bash 3.2
# when the heredoc body contains a lone ")". `|| true` absorbs read's EOF exit.
IFS= read -r -d '' PROMPT <<EOF || true
Today is ${TODAY}. You maintain a team certification-prep pipeline for these exams:
${EXAM_LIST_BLOCK}
STEP 1 — Parse the channel. Read ${WORK_DIR}/slack_raw.json (raw Slack
conversations.history export of #claudecode_certprepkit, last 7 days). Extract, tolerating
informal phrasing, messages matching our conventions:
  - RESULT posts: exam taken, pass/fail, hardest sections, tips, author name
  - HARD TOPIC posts: topics people are struggling with mid-study
  - RESOURCE posts: links teammates found useful
Map each exam to its key and map hardest-section mentions to these section ids:
${SECTION_MAP_BLOCK}

STEP 2 — Research with web search:
  a. Check each exam guide listed above for outline/weighting/release changes.
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
  "outcomes": [{"date":"YYYY-MM-DD","exam":"${KEYS_PIPE}","result":"pass|fail","hardSections":["<id>"],"alias":"<first name or blank>","tip":"<tip or blank>"}],
  "flaggedSections": {"<one object per exam key, e.g. ${KEYS_PIPE}>":{"<section id>":<count>}},
  "tips": [{"exam":"${KEYS_PIPE}","tip":"...","alias":"..."}],
  "research": {"ranAt":"${TODAY}","digest":"<the same digest as plain text>"}
}
Counts in flaggedSections must be cumulative across all RESULT and HARD TOPIC
posts parsed this run. Valid JSON only — no trailing commas, no comments.
EOF

claude -p "${PROMPT}" --allowedTools "WebSearch,WebFetch,Read,Write" --add-dir "${WORK_DIR}"

[[ -f "${WORK_DIR}/digest.md" && -f "${WORK_DIR}/snapshot.json" ]] || {
  echo "Claude run did not produce expected files"; exit 1; }

# Validate JSON before publishing
python3 -m json.tool "${WORK_DIR}/snapshot.json" > /dev/null

# ---------- 3a. WRITE: post digest to #claudecode_certprepkit ----------
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
