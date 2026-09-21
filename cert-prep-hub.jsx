import { useState, useEffect, useMemo } from "react";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ink #17213B · surface #F4F6FB · card #FFFFFF · blue #1B4DD8         */
/* mastery #178A5E · flag #B45309 · miss #B3372B                       */
/* Display: Space Grotesk · Body: system sans                          */
/* Signature: the Exam Bar — each section drawn at its true exam       */
/* weight, filled by your progress, with the pass line marked.         */
/* ------------------------------------------------------------------ */

const PLANS = {
  tableau: {
    name: "Tableau Next Consultant",
    short: "Tableau Next",
    passPct: 65,
    passNote: "60 questions · 105 min · 65% to pass (~39 correct) · aligned to the July 262.11 release",
    trail:
      "https://trailhead.salesforce.com/content/learn/trails/prepare-for-your-salesforce-tableau-next-consultant-exam",
    sections: [
      {
        id: "sem",
        name: "Data Setup",
        weight: 20,
        gap: "Core",
        note: "Semantic models are the spine of this section — nearly everything hangs off them.",
        items: [
          "Components: semantic data objects, joins, metrics, calculated fields, definitions",
          "Field hygiene for AI agents — descriptions, synonyms, hiding noisy fields",
          "Semantic Model AI Optimization (Beta): score & improve models",
          "AI-Generated Descriptions (Beta)",
          "Marketplace semantic model templates",
          "Complete the Tableau Semantics badge (45 min)",
        ],
      },
      {
        id: "agent",
        name: "Agentic Experiences",
        weight: 25,
        gap: "Core",
        note: "Biggest section on the exam.",
        items: [
          "Tableau/Analytics Agent: conversational Q&A grounded in semantics",
          "Verified questions & business preferences — calibrating Q&A accuracy",
          "Agentic readiness: what makes a model agent-ready",
          "Inspector proactive data alerts (Beta) — threshold notifications",
          "Draft with Einstein / natural-language data prep",
          "Read: Plan Your Tableau Agent Implementation",
        ],
      },
      {
        id: "embed",
        name: "Embedding, Cross-Cloud & Interoperability",
        weight: 20,
        gap: "Core",
        note: "Likely least-familiar territory as the exam scopes it.",
        items: [
          "Embed dashboards in Lightning pages and Slack",
          "Slack integration: rich previews + MCP server (ask Slackbot about data)",
          "Tableau Next Apps for Salesforce + Marketplace offerings",
          "APIs/SDKs and App Template Framework — know what each is for",
          "Positioning vs. other Salesforce analytics (CRM Analytics)",
        ],
      },
      {
        id: "viz",
        name: "Visualizations & Dashboards",
        weight: 15,
        gap: "Medium",
        note: "Mostly best-practice judgment questions.",
        items: [
          "Dashboard design best practices",
          "Actions: navigation links, object actions, single-click actions firing Flows/URLs",
        ],
      },
      {
        id: "admin",
        name: "Setup, Admin & Security",
        weight: 10,
        gap: "Medium",
        items: [
          "Guided setup; activating features incl. Agentic Analytics for users",
          "Permission sets & licenses — which enables what",
          "Row-Level Security (RLS) and object-level governance",
        ],
      },
      {
        id: "ws",
        name: "Workspaces, Orgs & Deployment",
        weight: 10,
        gap: "Medium",
        items: [
          "Workspaces: sharing, collections, asset access",
          "Personal Org: isolated self-service analyst environments",
          "Deployment with data kits: sandbox → production",
          "Data Monitoring dashboard (DLO details, execution history)",
        ],
      },
    ],
    skips: "Skim only: Data 360 foundation modules (Setup, Connectors, Data & Identity) if you already work in Data 360 daily.",
  },
  mcnext: {
    name: "Marketing Cloud Next Consultant",
    short: "MC Next",
    passPct: 72,
    passNote: "60 questions · 105 min · 72% to pass (~44 correct — only ~16 wrong allowed) · Summer '26 release",
    trail:
      "https://trailhead.salesforce.com/content/learn/trails/prepare-for-your-marketing-cloud-next-consultant-certification",
    sections: [
      {
        id: "flow",
        name: "Campaign Design, Flow Orchestration & Content",
        weight: 30,
        gap: "Core",
        note: "The heart of MC Next — where you pass or fail.",
        items: [
          "Flow types: segment- vs. record- vs. schedule-triggered; pick per scenario",
          "Marketing flow elements: send, wait, decision, frequency/quiet time",
          "Personalization methods: Handlebars, AMPscript, merge fields, repeaters, content variations — know when to use each (raw AMPscript scripting is out of deep scope)",
          "Data sources feeding personalized content",
          "Activation templates & contact points; source priority order",
          "Landing page components and configuration",
          "Badges: Email Content & Personalization + Campaign Optimization with Flows",
        ],
      },
      {
        id: "data",
        name: "Data Modeling, Identity Resolution & Segmentation",
        weight: 25,
        gap: "Verify",
        note: "Home turf for Data 360 practitioners — verify, don't re-study.",
        items: [
          "Actionable Lists from CRM data for segmentation/activation",
          "Consumption entitlements & Digital Wallet — marketing-flavored credit scenarios",
          "Identity resolution match & reconciliation rules (refresher)",
          "Segmentation → activation path in MC Next context",
        ],
      },
      {
        id: "setup",
        name: "Platform Setup & Governance",
        weight: 13,
        gap: "Medium",
        items: [
          "Core Org editions, Data 360 provisioning, Marketing Data Kit, permission sets",
          "Business Units ↔ Data Spaces 1:1 — isolation scenarios; when BUs are required",
          "Roles + Enhanced CMS Workspaces for content governance",
          "Domain authentication vs. authorization (DKIM/SPF); dedicated IP guardrails",
        ],
      },
      {
        id: "consent",
        name: "Consent",
        weight: 13,
        gap: "Core",
        note: "Entirely new subsystem for most candidates; heavily scenario-tested.",
        items: [
          "Platform consent object model and relationships",
          "Creating/updating consent records: forms, flows, API — when each fits",
          "Consent banners on marketing and external landing pages",
          "Compliance framing: opt-in models, engagement rules",
        ],
      },
      {
        id: "ai",
        name: "Agentforce & AI Innovation",
        weight: 11,
        gap: "Verify",
        items: [
          "Out-of-box Marketing Agents: campaign creation, audience gen, content gen",
          "Conversational messaging across SMS / email / WhatsApp",
          "Which predictive AI feature fits a scenario (STO, engagement scoring…)",
        ],
      },
      {
        id: "rpt",
        name: "Analytics & Performance Insights",
        weight: 8,
        gap: "Verify",
        items: [
          "Pre-built dashboard catalog — which dashboard answers which requirement",
          "Surfacing marketing data & insights across the platform",
        ],
      },
    ],
    skips:
      "Out of scope per the exam guide: deep AMPscript/SQL, MuleSoft, heavy Apex, external data lake admin. Skim Data 360 fundamentals badges only.",
  },
  data360: {
    name: "Data 360 Consultant",
    short: "Data 360",
    passPct: 70,
    passNote: "60 scored questions (+ up to 5 unscored) · 105 min · 70% to pass (~42 correct) · Spring '26 release",
    trail:
      "https://trailhead.salesforce.com/content/learn/trails/prepare-for-your-salesforce-data-360-consultant-exam",
    sections: [
      {
        id: "pos",
        name: "Solution Positioning",
        weight: 14,
        gap: "Medium",
        note: "Consultative framing, not config — practitioners routinely under-study this and lose points here.",
        items: [
          "Data 360 key terminology and business value",
          "Data 360's foundational role in generative and predictive AI",
          "Identifying initial use cases for Data 360",
          "Principles of data ethics and governance",
        ],
      },
      {
        id: "admin",
        name: "Setup and Administration",
        weight: 13,
        gap: "Verify",
        note: "Home turf if you administer Data 360 daily — verify, don't re-study.",
        items: [
          "Configure permissions, permission sets, and org-wide settings",
          "Apply data governance requirements to platform configuration",
          "Manage the development lifecycle with available tooling",
          "Diagnose and troubleshoot common issues with tooling",
        ],
      },
      {
        id: "ingest",
        name: "Data Source Connection and Ingestion",
        weight: 18,
        gap: "Core",
        note: "Transformations, ingestion patterns across varied sources, and Zero-Copy collaboration.",
        items: [
          "Data transformation capabilities within Data 360",
          "Ingestion processes & considerations from varied sources",
          "Data collaboration capabilities, including Zero-Copy",
        ],
      },
      {
        id: "unify",
        name: "Harmonization and Unification",
        weight: 17,
        gap: "Core",
        note: "Identity resolution + data modeling — the classic make-or-break section.",
        items: [
          "Purpose, process, and supported use cases of unification (identity resolution)",
          "Data modeling in Data 360 (DMOs, mapping)",
        ],
      },
      {
        id: "insights",
        name: "Data Enhancements, Sharing, and Analysis",
        weight: 18,
        gap: "Medium",
        items: [
          "Enhance data and build insights on unified data (calculated insights)",
          "Reference Data 360 data from other systems",
          "View and build reports and dashboards using Data 360",
          "Apply predictive & generative AI tooling to customer scenarios",
        ],
      },
      {
        id: "activate",
        name: "Data Activations and Utilization",
        weight: 20,
        gap: "Core",
        note: "Biggest section on the exam.",
        items: [
          "Basic concepts of segmentation and use cases",
          "Manage segments within Data 360",
          "Publish activations within Data 360",
          "Act on data",
          "Use Data 360 in Salesforce flows",
        ],
      },
    ],
    skips:
      "The guide publishes no explicit out-of-scope list. If you implement Data 360 daily, treat Setup/Admin, Ingestion, Unification, and Activations as verify-not-study, and reallocate that time to Solution Positioning's advisory framing (business value, ethics, governance) and the predictive/generative AI tooling scenarios.",
  },
};

/* Every entry in PLANS is a product/exam. Add a new one and the whole app
   picks it up — tabs, quizzes, logging, insights, and research — with no code
   changes here. These two derived constants are the only "which exams exist"
   source of truth the views depend on. */
const EXAM_KEYS = Object.keys(PLANS);
const DEFAULT_EXAM = EXAM_KEYS[0];

const GAP_STYLE = {
  Core: { bg: "#EEF2FF", fg: "#1B4DD8", label: "Study hard" },
  Medium: { bg: "#FEF3E2", fg: "#B45309", label: "Medium lift" },
  Verify: { bg: "#E7F6EF", fg: "#178A5E", label: "Verify only" },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------------- team snapshot (published weekly by the cron) ----------
   Paste the RAW URL of your gist file (cert-prep-snapshot.json) below.
   e.g. https://gist.githubusercontent.com/<user>/<id>/raw/cert-prep-snapshot.json
   Leave empty to run the hub standalone.                                   */
const SNAPSHOT_URL = "";

async function fetchSnapshot() {
  if (!SNAPSHOT_URL) return null;
  try {
    const r = await fetch(SNAPSHOT_URL, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/* ---------------- storage helpers ----------------
   Runtime-adaptive so the same file runs in two places:
   - claude.ai artifacts  → window.storage (async, supports a shared flag)
   - Cowork / plain web    → localStorage (sync; shared flag is a no-op)
   Both paths are wrapped in promises and swallow errors, so callers keep
   using `await sGet/sSet` unchanged.                                        */
const hasClaudeStorage = () => typeof window !== "undefined" && !!window.storage;

async function sGet(key, shared = false) {
  try {
    if (hasClaudeStorage()) {
      const r = await window.storage.get(key, shared);
      return r ? JSON.parse(r.value) : null;
    }
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
async function sSet(key, value, shared = false) {
  try {
    if (hasClaudeStorage()) {
      await window.storage.set(key, JSON.stringify(value), shared);
      return true;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ---------------- model call (runtime-adaptive) ----------------
   - Cowork               → window.cowork.askClaude(prompt)
   - claude.ai artifacts  → direct fetch to the Messages API (claude.ai injects auth)
   Returns the model's text; throws on failure so callers can show a fallback.
   allowWebSearch attaches the web_search tool ONLY on the claude.ai path — in a
   sandboxed renderer that blocks network calls (Cowork), the fetch path can't
   run at all, so research falls back to the weekly team digest.
   VERIFY with Cowork: exact window.cowork.askClaude signature (assumed here to
   take a prompt string and return the response text).                        */
async function callModel(prompt, { allowWebSearch = false } = {}) {
  if (typeof window !== "undefined" && window.cowork && window.cowork.askClaude) {
    const out = await window.cowork.askClaude(prompt);
    return (typeof out === "string" ? out : String(out || "")).trim();
  }
  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  };
  if (allowWebSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("http");
  const data = await r.json();
  if (data.error) throw new Error("api");
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/* ---------------- Exam Bar (signature element) ---------------- */
function ExamBar({ plan, checked }) {
  const total = plan.sections.reduce((a, s) => a + s.weight, 0);
  return (
    <div>
      <div className="flex h-8 w-full overflow-hidden rounded-md" style={{ background: "#E4E8F2" }}>
        {plan.sections.map((s) => {
          const done = s.items.filter((_, i) => checked[`${s.id}:${i}`]).length;
          const pct = s.items.length ? done / s.items.length : 0;
          return (
            <div
              key={s.id}
              className="relative h-full border-r border-white last:border-r-0"
              style={{ width: `${(s.weight / total) * 100}%` }}
              title={`${s.name} — ${s.weight}% of exam, ${Math.round(pct * 100)}% studied`}
            >
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${pct * 100}%`, background: pct >= 1 ? "#178A5E" : "#1B4DD8", opacity: pct >= 1 ? 1 : 0.85 }}
              />
            </div>
          );
        })}
      </div>
      <div className="relative mt-1 h-4">
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${plan.passPct}%`, transform: "translateX(-50%)" }}
        >
          <div className="h-2 w-px" style={{ background: "#B3372B" }} />
          <span className="text-xs font-medium" style={{ color: "#B3372B" }}>
            pass {plan.passPct}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Plans view ---------------- */
function PlansView({ examKey, checked, toggle }) {
  const plan = PLANS[examKey];
  const totalItems = plan.sections.reduce((a, s) => a + s.items.length, 0);
  const doneItems = plan.sections.reduce(
    (a, s) => a + s.items.filter((_, i) => checked[`${s.id}:${i}`]).length,
    0
  );
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#17213B" }}>
            {plan.name}
          </h2>
          <span className="text-sm" style={{ color: "#5A6478" }}>
            {doneItems}/{totalItems} tasks
          </span>
        </div>
        <p className="mt-1 text-xs" style={{ color: "#5A6478" }}>{plan.passNote}</p>
        <div className="mt-3">
          <ExamBar plan={plan} checked={checked} />
        </div>
        <p className="mt-2 text-xs" style={{ color: "#5A6478" }}>
          Each segment is drawn at its real exam weight. Fill every segment past the pass line before booking.
        </p>
        <a
          href={plan.trail}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-medium underline"
          style={{ color: "#1B4DD8" }}
        >
          Open the official prep trail →
        </a>
      </div>

      {plan.sections.map((s) => {
        const g = GAP_STYLE[s.gap];
        const done = s.items.filter((_, i) => checked[`${s.id}:${i}`]).length;
        return (
          <div key={s.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#17213B" }}>
                {s.name}
              </h3>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#E4E8F2", color: "#17213B" }}>
                {s.weight}% of exam
              </span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: g.bg, color: g.fg }}>
                {g.label}
              </span>
              <span className="ml-auto text-xs" style={{ color: "#5A6478" }}>
                {done}/{s.items.length}
              </span>
            </div>
            {s.note && <p className="mt-1 text-sm" style={{ color: "#5A6478" }}>{s.note}</p>}
            <ul className="mt-3 space-y-2">
              {s.items.map((item, i) => {
                const k = `${s.id}:${i}`;
                const on = !!checked[k];
                return (
                  <li key={k}>
                    <button
                      onClick={() => toggle(k)}
                      className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors"
                      style={{ background: on ? "#F1F7F4" : "transparent" }}
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded border text-xs font-bold text-white"
                        style={{
                          background: on ? "#178A5E" : "#FFFFFF",
                          borderColor: on ? "#178A5E" : "#B9C2D6",
                        }}
                      >
                        {on ? "✓" : ""}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: on ? "#5A6478" : "#17213B", textDecoration: on ? "line-through" : "none" }}
                      >
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="rounded-xl p-4 text-sm" style={{ background: "#FEF3E2", color: "#7A4A08" }}>
        <strong>Skip list:</strong> {plan.skips}
      </div>
    </div>
  );
}

/* ---------------- Log outcome view ---------------- */
function LogView({ onSaved }) {
  const [exam, setExam] = useState(DEFAULT_EXAM);
  const [result, setResult] = useState("pass");
  const [hard, setHard] = useState({});
  const [tip, setTip] = useState("");
  const [alias, setAlias] = useState("");
  const [status, setStatus] = useState("");

  const plan = PLANS[exam];

  const save = async () => {
    setStatus("saving");
    const rec = {
      id: uid(),
      exam,
      result,
      hardSections: Object.keys(hard).filter((k) => hard[k]),
      tip: tip.trim(),
      alias: alias.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    const ok = await sSet(`outcome:${rec.id}`, rec, true);
    if (ok) {
      setStatus("saved");
      setHard({});
      setTip("");
      onSaved();
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#17213B" }}>
          Log an exam attempt
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#5A6478" }}>
          Shared with everyone using this hub — your entry sharpens the plan for the next person. No scores or personal
          details required.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium" style={{ color: "#17213B" }}>Exam</p>
            <div className="flex gap-2">
              {Object.entries(PLANS).map(([k, p]) => (
                <button
                  key={k}
                  onClick={() => { setExam(k); setHard({}); }}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium"
                  style={{
                    background: exam === k ? "#1B4DD8" : "#E4E8F2",
                    color: exam === k ? "#FFFFFF" : "#17213B",
                  }}
                >
                  {p.short}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium" style={{ color: "#17213B" }}>Result</p>
            <div className="flex gap-2">
              {["pass", "fail"].map((r) => (
                <button
                  key={r}
                  onClick={() => setResult(r)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium capitalize"
                  style={{
                    background: result === r ? (r === "pass" ? "#178A5E" : "#B3372B") : "#E4E8F2",
                    color: result === r ? "#FFFFFF" : "#17213B",
                  }}
                >
                  {r === "pass" ? "Passed" : "Didn't pass"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium" style={{ color: "#17213B" }}>
              Which sections felt hardest? (tap all that apply)
            </p>
            <div className="flex flex-wrap gap-2">
              {plan.sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setHard((h) => ({ ...h, [s.id]: !h[s.id] }))}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: hard[s.id] ? "#B45309" : "#E4E8F2",
                    color: hard[s.id] ? "#FFFFFF" : "#17213B",
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium" style={{ color: "#17213B" }}>One tip for the next person (optional)</p>
            <textarea
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              rows={3}
              placeholder="e.g. Three scenario questions on contact point source priority — know it cold."
              className="w-full rounded-lg border p-2 text-sm"
              style={{ borderColor: "#B9C2D6", color: "#17213B" }}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium" style={{ color: "#17213B" }}>Name or alias (optional)</p>
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Kanani G."
              className="w-full rounded-lg border p-2 text-sm"
              style={{ borderColor: "#B9C2D6", color: "#17213B" }}
            />
          </div>

          <button
            onClick={save}
            disabled={status === "saving"}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ background: "#1B4DD8", opacity: status === "saving" ? 0.6 : 1 }}
          >
            {status === "saving" ? "Saving…" : "Save attempt"}
          </button>
          {status === "saved" && (
            <p className="text-sm font-medium" style={{ color: "#178A5E" }}>Saved. Thanks for feeding the loop.</p>
          )}
          {status === "error" && (
            <p className="text-sm font-medium" style={{ color: "#B3372B" }}>
              Couldn't save. Check your connection and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Insights view ---------------- */
function InsightsView({ outcomes, loading, snapshot }) {
  const byExam = useMemo(() => {
    const m = Object.fromEntries(EXAM_KEYS.map((k) => [k, []]));
    outcomes.forEach((o) => m[o.exam] && m[o.exam].push(o));
    return m;
  }, [outcomes]);

  const teamCard = snapshot ? (
    <div className="rounded-xl p-4 shadow-sm" style={{ background: "#17213B" }}>
      <h3 className="font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        From #claudecode_certprepkit (team channel)
      </h3>
      <p className="mt-1 text-xs" style={{ color: "#AAB6D3" }}>
        Synced {snapshot.generatedAt ? new Date(snapshot.generatedAt).toLocaleDateString() : "recently"} by the weekly
        research run.
      </p>
      {Object.entries(PLANS).map(([k, plan]) => {
        const flags = (snapshot.flaggedSections && snapshot.flaggedSections[k]) || {};
        const ranked = Object.entries(flags).sort((a, b) => b[1] - a[1]);
        const os = (snapshot.outcomes || []).filter((o) => o.exam === k);
        if (!ranked.length && !os.length) return null;
        const passes = os.filter((o) => o.result === "pass").length;
        return (
          <div key={k} className="mt-3">
            <p className="text-sm font-medium text-white">
              {plan.short}
              {os.length > 0 && (
                <span className="ml-2 text-xs font-normal" style={{ color: "#AAB6D3" }}>
                  {os.length} attempt{os.length > 1 ? "s" : ""} · {passes} passed
                </span>
              )}
            </p>
            {ranked.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {ranked.map(([sid, n]) => {
                  const sec = plan.sections.find((s) => s.id === sid);
                  return (
                    <span key={sid} className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#B45309", color: "#FFFFFF" }}>
                      {sec ? sec.name : sid} ×{n}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {(snapshot.tips || []).slice(0, 4).map((t, i) => (
        <p key={i} className="mt-2 rounded-lg p-2 text-sm" style={{ background: "#232F52", color: "#E8ECF7" }}>
          "{t.tip}" <span className="text-xs" style={{ color: "#AAB6D3" }}>— {t.alias || "teammate"} · {PLANS[t.exam] ? PLANS[t.exam].short : t.exam}</span>
        </p>
      ))}
    </div>
  ) : null;

  if (loading)
    return (
      <div className="space-y-4">
        {teamCard}
        <p className="rounded-xl bg-white p-4 text-sm shadow-sm" style={{ color: "#5A6478" }}>Loading community results…</p>
      </div>
    );

  if (!outcomes.length)
    return (
      <div className="space-y-4">
        {teamCard}
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="font-medium" style={{ color: "#17213B" }}>No attempts logged in this hub yet</p>
          <p className="mt-1 text-sm" style={{ color: "#5A6478" }}>
            Best practice: post attempts in #claudecode_certprepkit so the whole pipeline learns. Logging here works too — pass rates
            and hardest-section flags appear below.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      {teamCard}
      {Object.entries(byExam).map(([k, list]) => {
        if (!list.length) return null;
        const plan = PLANS[k];
        const passes = list.filter((o) => o.result === "pass").length;
        const counts = {};
        list.forEach((o) => (o.hardSections || []).forEach((s) => (counts[s] = (counts[s] || 0) + 1)));
        const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const tips = list.filter((o) => o.tip);
        return (
          <div key={k} className="rounded-xl bg-white p-4 shadow-sm">
            <h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#17213B" }}>
              {plan.name}
            </h3>
            <p className="mt-1 text-sm" style={{ color: "#5A6478" }}>
              {list.length} attempt{list.length > 1 ? "s" : ""} logged · {passes} passed
              {list.length - passes > 0 ? ` · ${list.length - passes} retaking` : ""}
            </p>
            {ranked.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium" style={{ color: "#17213B" }}>Sections flagged hardest</p>
                <ul className="mt-1 space-y-1">
                  {ranked.map(([sid, n]) => {
                    const sec = plan.sections.find((s) => s.id === sid);
                    return (
                      <li key={sid} className="flex items-center justify-between text-sm" style={{ color: "#17213B" }}>
                        <span>{sec ? sec.name : sid}</span>
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#FEF3E2", color: "#B45309" }}>
                          flagged {n}×
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {tips.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium" style={{ color: "#17213B" }}>Tips from the field</p>
                <ul className="mt-1 space-y-2">
                  {tips.map((o) => (
                    <li key={o.id} className="rounded-lg p-2 text-sm" style={{ background: "#F4F6FB", color: "#17213B" }}>
                      "{o.tip}"
                      <span className="block text-xs" style={{ color: "#5A6478" }}>
                        — {o.alias || "anonymous"} · {o.result === "pass" ? "passed" : "retaking"} · {o.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Research view ---------------- */
function ResearchView({ snapshot }) {
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const cached = await sGet("research-v1");
      if (cached) setReport(cached);
    })();
  }, []);

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const examList = EXAM_KEYS.map((k, i) => `(${i + 1}) Salesforce Certified ${PLANS[k].name}`).join(", ");
      const prompt = `Today is ${today}. Search the web for the newest enablement and study materials for these Salesforce certifications: ${examList}. Look for: updated exam guides or outline changes, new Trailhead modules or trails, new Trailhead Academy courses, recent release notes affecting exam-relevant features, and community exam-experience writeups. Report only findings from the last ~60 days. Format as short plain-text sections per exam with source names and dates. If nothing new, say so plainly.`;
      const text = await callModel(prompt, { allowWebSearch: true });
      if (!text) throw new Error("empty");
      const rec = { text, ranAt: new Date().toLocaleString() };
      setReport(rec);
      await sSet("research-v1", rec);
    } catch {
      setError(
        "Live web search isn't available here. The weekly team digest above is the dependable source — it runs every Monday and posts to the channel."
      );
    }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      {snapshot && snapshot.research && snapshot.research.digest && (
        <div className="rounded-xl bg-white p-4 shadow-sm" style={{ borderLeft: "4px solid #178A5E" }}>
          <p className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#17213B" }}>
            This week's team research digest
          </p>
          <p className="text-xs" style={{ color: "#5A6478" }}>
            Published {snapshot.research.ranAt || "recently"} by the automated weekly run.
          </p>
          <pre className="mt-2 whitespace-pre-wrap text-sm" style={{ color: "#17213B", fontFamily: "inherit" }}>
            {snapshot.research.digest}
          </pre>
        </div>
      )}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#17213B" }}>
          Research newer materials
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#5A6478" }}>
          Best-effort live web search for exam-guide changes and new enablement across every cert. The dependable
          source is the weekly team digest above (published every Monday) — use this only for an ad-hoc check between
          digests, and it may be unavailable depending on where the Hub is running.
        </p>
        <button
          onClick={run}
          disabled={busy}
          className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
          style={{ background: "#1B4DD8", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Searching the web…" : report ? "Refresh research" : "Run research"}
        </button>
        {error && <p className="mt-2 text-sm font-medium" style={{ color: "#B3372B" }}>{error}</p>}
      </div>
      {report && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs" style={{ color: "#5A6478" }}>Last run: {report.ranAt}</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm" style={{ color: "#17213B", fontFamily: "inherit" }}>
            {report.text}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ---------------- Practice quiz view ---------------- */
function QuizView({ outcomes, snapshot }) {
  const [exam, setExam] = useState(DEFAULT_EXAM);
  const [phase, setPhase] = useState("setup"); // setup | loading | quiz | done
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      const h = await sGet("quiz-history-v1");
      if (h) setHistory(h);
    })();
  }, []);

  const plan = PLANS[exam];

  const flagCounts = useMemo(() => {
    const c = {};
    outcomes
      .filter((o) => o.exam === exam)
      .forEach((o) => (o.hardSections || []).forEach((s) => (c[s] = (c[s] || 0) + 1)));
    const teamFlags = snapshot && snapshot.flaggedSections ? snapshot.flaggedSections[exam] : null;
    if (teamFlags) Object.entries(teamFlags).forEach(([s, n]) => (c[s] = (c[s] || 0) + n));
    return c;
  }, [outcomes, exam, snapshot]);

  const start = async () => {
    setPhase("loading");
    setError("");
    try {
      const sectionSpec = plan.sections
        .map(
          (s) =>
            `- id "${s.id}": ${s.name} (${s.weight}% of exam${
              flagCounts[s.id] ? `, flagged hard by ${flagCounts[s.id]} past candidate(s) — PRIORITIZE` : ""
            }). Topics: ${s.items.join("; ")}`
        )
        .join("\n");
      const prompt = `You write practice questions for the Salesforce Certified ${plan.name} exam. Exam sections:\n${sectionSpec}\n\nWrite exactly 4 consultant-style, scenario-based multiple-choice questions ("Given a scenario..." style, one clearly best answer, plausible distractors, concise wording). Distribute across sections roughly by exam weight, giving extra to any section marked PRIORITIZE. Respond with ONLY a JSON array — no markdown fences, no preamble: [{"section":"<section id>","question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"one short sentence on why"}]`;
      const raw = await callModel(prompt);
      const text = raw.replace(/```json|```/g, "").trim();
      const qs = JSON.parse(text);
      if (!Array.isArray(qs) || !qs.length) throw new Error("bad payload");
      setQuestions(qs);
      setIdx(0);
      setPicked(null);
      setAnswers([]);
      setPhase("quiz");
    } catch {
      setError("Couldn't generate questions — try again in a moment.");
      setPhase("setup");
    }
  };

  const next = async () => {
    const q = questions[idx];
    const rec = [...answers, { section: q.section, correct: picked === q.correctIndex }];
    setAnswers(rec);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      const score = rec.filter((a) => a.correct).length;
      const entry = {
        date: new Date().toISOString().slice(0, 10),
        exam,
        score,
        total: rec.length,
        weak: [...new Set(rec.filter((a) => !a.correct).map(a => a.section))],
      };
      const h = [entry, ...history].slice(0, 20);
      setHistory(h);
      await sSet("quiz-history-v1", h);
      setPhase("done");
    }
  };

  const secName = (id) => {
    const s = plan.sections.find((x) => x.id === id);
    return s ? s.name : id;
  };

  if (phase === "quiz") {
    const q = questions[idx];
    const answered = picked !== null;
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "#5A6478" }}>
              Question {idx + 1} of {questions.length} · {secName(q.section)}
            </span>
            <span className="text-xs" style={{ color: "#5A6478" }}>{plan.short}</span>
          </div>
          <p className="mt-3 text-sm font-medium" style={{ color: "#17213B" }}>{q.question}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, i) => {
              let bg = "#F4F6FB";
              let fg = "#17213B";
              if (answered) {
                if (i === q.correctIndex) { bg = "#178A5E"; fg = "#FFFFFF"; }
                else if (i === picked) { bg = "#B3372B"; fg = "#FFFFFF"; }
              }
              return (
                <button
                  key={i}
                  onClick={() => picked === null && setPicked(i)}
                  className="w-full rounded-lg p-3 text-left text-sm transition-colors"
                  style={{ background: bg, color: fg }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "#EEF2FF", color: "#17213B" }}>
              <strong>{picked === q.correctIndex ? "Correct." : "Not quite."}</strong> {q.explanation}
            </div>
          )}
          {answered && (
            <button
              onClick={next}
              className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
              style={{ background: "#1B4DD8" }}
            >
              {idx + 1 < questions.length ? "Next question" : "See results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const score = answers.filter((a) => a.correct).length;
    const pct = Math.round((score / answers.length) * 100);
    const weak = [...new Set(answers.filter((a) => !a.correct).map((a) => a.section))];
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: pct >= plan.passPct ? "#178A5E" : "#B45309" }}>
            {score}/{answers.length}
          </p>
          <p className="mt-1 text-sm" style={{ color: "#5A6478" }}>
            {pct}% — the real exam needs {plan.passPct}%.
          </p>
          {weak.length > 0 && (
            <p className="mt-2 text-sm" style={{ color: "#17213B" }}>
              Revisit: <strong>{weak.map(secName).join(", ")}</strong>
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button onClick={start} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white" style={{ background: "#1B4DD8" }}>
              New round
            </button>
            <button onClick={() => setPhase("setup")} className="flex-1 rounded-lg py-2.5 text-sm font-semibold" style={{ background: "#E4E8F2", color: "#17213B" }}>
              Change exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#17213B" }}>
          Practice questions
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#5A6478" }}>
          Four fresh scenario questions per round, distributed by real exam weight — and tilted toward sections the
          community has flagged hardest. Different questions every time.
        </p>
        <div className="mt-3 flex gap-2">
          {Object.entries(PLANS).map(([k, p]) => (
            <button
              key={k}
              onClick={() => setExam(k)}
              className="flex-1 rounded-lg py-2 text-sm font-semibold"
              style={{
                background: exam === k ? "#1B4DD8" : "#E4E8F2",
                color: exam === k ? "#FFFFFF" : "#17213B",
              }}
            >
              {p.short}
            </button>
          ))}
        </div>
        {Object.keys(flagCounts).length > 0 && (
          <p className="mt-2 text-xs" style={{ color: "#B45309" }}>
            Weighting up: {Object.keys(flagCounts).map(secName).join(", ")} (community-flagged)
          </p>
        )}
        <button
          onClick={start}
          disabled={phase === "loading"}
          className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
          style={{ background: "#1B4DD8", opacity: phase === "loading" ? 0.6 : 1 }}
        >
          {phase === "loading" ? "Writing questions…" : "Start a round"}
        </button>
        {error && <p className="mt-2 text-sm font-medium" style={{ color: "#B3372B" }}>{error}</p>}
      </div>

      {history.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-medium" style={{ color: "#17213B" }}>Your recent rounds</p>
          <ul className="mt-2 space-y-1">
            {history.slice(0, 8).map((h, i) => (
              <li key={i} className="flex items-center justify-between text-sm" style={{ color: "#17213B" }}>
                <span>{PLANS[h.exam] ? PLANS[h.exam].short : h.exam} · {h.date}</span>
                <span className="font-semibold" style={{ color: h.score / h.total >= (PLANS[h.exam]?.passPct || 70) / 100 ? "#178A5E" : "#B45309" }}>
                  {h.score}/{h.total}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------- App ---------------- */
export default function CertPrepHub() {
  const [view, setView] = useState("plans");
  const [examKey, setExamKey] = useState(DEFAULT_EXAM);
  const [checked, setChecked] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [outcomes, setOutcomes] = useState([]);
  const [outcomesLoading, setOutcomesLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await sGet("progress-v1");
      if (p) setChecked(p);
      setLoaded(true);
      fetchSnapshot().then(setSnapshot);
      await loadOutcomes();
    })();
  }, []);

  const loadOutcomes = async () => {
    setOutcomesLoading(true);
    try {
      const listing = await window.storage.list("outcome:", true);
      const keys = listing ? listing.keys || [] : [];
      const recs = [];
      for (const k of keys) {
        const key = typeof k === "string" ? k : k.key;
        const rec = await sGet(key, true);
        if (rec) recs.push(rec);
      }
      recs.sort((a, b) => (a.date < b.date ? 1 : -1));
      setOutcomes(recs);
    } catch {
      setOutcomes([]);
    }
    setOutcomesLoading(false);
  };

  const toggle = (k) => {
    setChecked((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      sSet("progress-v1", next);
      return next;
    });
  };

  const NAV = [
    { id: "plans", label: "Study plans" },
    { id: "quiz", label: "Practice" },
    { id: "log", label: "Log attempt" },
    { id: "insights", label: "Insights" },
    { id: "research", label: "Research" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F4F6FB" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');`}</style>
      <header className="px-4 pb-3 pt-6" style={{ background: "#17213B" }}>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Next-Gen Cert Prep Hub
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "#AAB6D3" }}>
          80/20 plans for Tableau Next & Marketing Cloud Next Consultant — track, share, learn from every attempt.
        </p>
        <nav className="mt-4 flex gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => { setView(n.id); if (n.id === "insights") loadOutcomes(); }}
              className="whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium"
              style={{
                background: view === n.id ? "#F4F6FB" : "transparent",
                color: view === n.id ? "#17213B" : "#AAB6D3",
              }}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4 pb-12">
        {view === "plans" && (
          <>
            <div className="mb-4 flex gap-2">
              {Object.entries(PLANS).map(([k, p]) => (
                <button
                  key={k}
                  onClick={() => setExamKey(k)}
                  className="flex-1 rounded-lg py-2 text-sm font-semibold"
                  style={{
                    background: examKey === k ? "#1B4DD8" : "#FFFFFF",
                    color: examKey === k ? "#FFFFFF" : "#17213B",
                    boxShadow: "0 1px 2px rgba(23,33,59,0.08)",
                  }}
                >
                  {p.short}
                </button>
              ))}
            </div>
            {loaded ? (
              <PlansView examKey={examKey} checked={checked} toggle={toggle} />
            ) : (
              <p className="text-sm" style={{ color: "#5A6478" }}>Loading your progress…</p>
            )}
          </>
        )}
        {view === "quiz" && <QuizView outcomes={outcomes} snapshot={snapshot} />}
        {view === "log" && <LogView onSaved={loadOutcomes} />}
        {view === "insights" && <InsightsView outcomes={outcomes} loading={outcomesLoading} snapshot={snapshot} />}
        {view === "research" && <ResearchView snapshot={snapshot} />}
      </main>
    </div>
  );
}
