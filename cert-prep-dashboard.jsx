import { useState } from "react";

/* ============================================================
   Cert Prep — Facilitator Dashboard (read-only, Cowork-safe)
   ------------------------------------------------------------
   No AI, no network, no storage. Renders team stats that are
   BAKED IN below (Cowork blocks fetch). Refresh by re-running
   the "build dashboard" flow: read the private Slack List via
   MCP → regenerate TEAM_STATS → reopen this file in Cowork.
   Design vocabulary matches the study Hub (Exam Bar, tokens).
   ============================================================ */

/* ---- design tokens (hoisted from the Hub's inline literals) ---- */
const T = {
  ink: "#17213B",
  surface: "#F4F6FB",
  card: "#FFFFFF",
  blue: "#1B4DD8",
  green: "#178A5E",
  amber: "#B45309",
  red: "#B3372B",
  muted: "#5A6478",
  border: "#B9C2D6",
  track: "#E4E8F2",
  darkAlt: "#232F52",
  onDark: "#AAB6D3",
};

const GAP_STYLE = {
  Core: { bg: "#EEF2FF", fg: "#1B4DD8", label: "Study hard" },
  Medium: { bg: "#FEF3E2", fg: "#B45309", label: "Medium lift" },
  Verify: { bg: "#E7F6EF", fg: "#178A5E", label: "Verify only" },
};

/* ---- exam structure (mirror of cert-plans.json; the build flow
   regenerates this from the same file so it stays in sync) ---- */
const PLANS = {
  tableau: {
    name: "Tableau Next Consultant",
    short: "Tableau Next",
    passPct: 65,
    sections: [
      { id: "sem", name: "Data Setup", weight: 20, gap: "Core" },
      { id: "agent", name: "Agentic Experiences", weight: 25, gap: "Core" },
      { id: "embed", name: "Embedding & Interop", weight: 20, gap: "Core" },
      { id: "viz", name: "Visualizations & Dashboards", weight: 15, gap: "Medium" },
      { id: "admin", name: "Setup, Admin & Security", weight: 10, gap: "Medium" },
      { id: "ws", name: "Workspaces & Deployment", weight: 10, gap: "Medium" },
    ],
  },
  mcnext: {
    name: "Marketing Cloud Next Consultant",
    short: "MC Next",
    passPct: 72,
    sections: [
      { id: "flow", name: "Campaigns, Flows & Content", weight: 30, gap: "Core" },
      { id: "data", name: "Data Modeling & Segmentation", weight: 25, gap: "Verify" },
      { id: "setup", name: "Platform Setup & Governance", weight: 13, gap: "Medium" },
      { id: "consent", name: "Consent", weight: 13, gap: "Core" },
      { id: "ai", name: "Agentforce & AI", weight: 11, gap: "Verify" },
      { id: "rpt", name: "Analytics & Insights", weight: 8, gap: "Verify" },
    ],
  },
  data360: {
    name: "Data 360 Consultant",
    short: "Data 360",
    passPct: 70,
    sections: [
      { id: "pos", name: "Solution Positioning", weight: 14, gap: "Medium" },
      { id: "admin", name: "Setup & Administration", weight: 13, gap: "Verify" },
      { id: "ingest", name: "Connection & Ingestion", weight: 18, gap: "Core" },
      { id: "unify", name: "Harmonization & Unification", weight: 17, gap: "Core" },
      { id: "insights", name: "Enhancements, Sharing & Analysis", weight: 18, gap: "Medium" },
      { id: "activate", name: "Activations & Utilization", weight: 20, gap: "Core" },
    ],
  },
};
const EXAM_KEYS = Object.keys(PLANS);

/* ============================================================
   TEAM_STATS — baked in by the build flow from the Slack List.
   `sample: true` shows a banner and obviously-fake names until
   the first real refresh. `hardest` holds section ids.
   ============================================================ */
const TEAM_STATS = {
  generatedAt: "2026-09-23 (live from Slack List F0C301AURRV)",
  sample: false,
  members: [
    { person: "Kanani G.", exam: "mcnext", status: "Passed", sectionsComplete: 6, practiceAvg: null, lastResult: "Pass", hardest: ["consent"], tip: "In Marketing Cloud Next, consent is managed at the Contact Point level (e.g. an email address or phone number), not at the Individual or customer ID level — different from traditional marketing platforms." },
  ],
};

/* ---- derived helpers ---- */
const membersFor = (key) => TEAM_STATS.members.filter((m) => m.exam === key);

function rollup(members) {
  const n = members.length;
  const taken = members.filter((m) => m.lastResult === "Pass" || m.lastResult === "Fail");
  const passed = members.filter((m) => m.lastResult === "Pass").length;
  const avg = (sel) => (n ? Math.round(members.reduce((a, m) => a + (sel(m) || 0), 0) / n) : 0);
  const withPractice = members.filter((m) => typeof m.practiceAvg === "number");
  return {
    n,
    studying: members.filter((m) => m.status === "Studying").length,
    scheduled: members.filter((m) => m.status === "Scheduled").length,
    passed,
    passRate: taken.length ? Math.round((passed / taken.length) * 100) : null,
    avgSections: avg((m) => m.sectionsComplete),
    avgPractice: withPractice.length ? Math.round(withPractice.reduce((a, m) => a + m.practiceAvg, 0) / withPractice.length) : null,
  };
}

function flagCounts(members, plan) {
  const counts = Object.fromEntries(plan.sections.map((s) => [s.id, 0]));
  members.forEach((m) => (m.hardest || []).forEach((id) => { if (id in counts) counts[id] += 1; }));
  return counts;
}

/* ---- Struggle Bar: Exam Bar reused as a heatmap of where the
   team flags difficulty. Segments sized at true exam weight;
   fill intensity = flag count relative to the busiest section. ---- */
function StruggleBar({ plan, counts }) {
  const total = plan.sections.reduce((a, s) => a + s.weight, 0);
  const max = Math.max(1, ...Object.values(counts));
  return (
    <div>
      <div className="flex h-8 w-full overflow-hidden rounded-md" style={{ background: T.track }}>
        {plan.sections.map((s) => {
          const c = counts[s.id] || 0;
          const intensity = c / max;
          return (
            <div
              key={s.id}
              className="relative h-full border-r border-white last:border-r-0"
              style={{ width: `${(s.weight / total) * 100}%` }}
              title={`${s.name} — ${s.weight}% of exam · flagged hard by ${c}`}
            >
              <div
                className="flex h-full items-center justify-center"
                style={{ background: T.red, opacity: c ? 0.2 + intensity * 0.8 : 0.06 }}
              >
                {c > 0 && <span className="text-xs font-bold text-white">{c}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative mt-1 h-4">
        <div className="absolute top-0 flex flex-col items-center" style={{ left: `${plan.passPct}%`, transform: "translateX(-50%)" }}>
          <div className="h-2 w-px" style={{ background: T.ink }} />
          <span className="text-xs font-medium" style={{ color: T.muted }}>pass {plan.passPct}%</span>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub }) {
  return (
    <div className="rounded-xl p-3" style={{ background: T.darkAlt }}>
      <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      <div className="text-xs" style={{ color: T.onDark }}>{label}</div>
      {sub && <div className="mt-0.5 text-xs" style={{ color: T.onDark, opacity: 0.8 }}>{sub}</div>}
    </div>
  );
}

const STATUS_STYLE = {
  Studying: { bg: "#EEF2FF", fg: T.blue },
  Scheduled: { bg: "#FEF3E2", fg: T.amber },
  Passed: { bg: "#E7F6EF", fg: T.green },
  Retaking: { bg: "#FBE9E7", fg: T.red },
};

function ExamOverview({ examKey }) {
  const plan = PLANS[examKey];
  const members = membersFor(examKey);
  const r = rollup(members);
  const counts = flagCounts(members, plan);
  const ranked = [...plan.sections].map((s) => ({ ...s, c: counts[s.id] || 0 })).filter((s) => s.c > 0).sort((a, b) => b.c - a.c);

  if (!members.length) {
    return (
      <div className="rounded-xl p-6 text-center text-sm" style={{ background: T.card, color: T.muted }}>
        No one has logged progress for <strong>{plan.name}</strong> yet. Once teammates submit the
        Slack workflow, refresh the dashboard to see them here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* roll-up tiles */}
      <div className="rounded-xl p-4" style={{ background: T.ink }}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{plan.name}</h2>
          <span className="text-xs" style={{ color: T.onDark }}>{r.n} on this exam</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Studying" value={r.studying} />
          <StatTile label="Scheduled" value={r.scheduled} />
          <StatTile label="Pass rate" value={r.passRate === null ? "—" : `${r.passRate}%`} sub={`${r.passed} passed`} />
          <StatTile label="Avg practice" value={r.avgPractice === null ? "—" : `${r.avgPractice}%`} sub={`~${r.avgSections}/6 sections`} />
        </div>
      </div>

      {/* where the team struggles */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.ink }}>Where the team struggles</h3>
        <p className="mt-0.5 mb-3 text-xs" style={{ color: T.muted }}>
          Sections drawn at true exam weight; redder = flagged hard by more teammates.
        </p>
        <StruggleBar plan={plan} counts={counts} />
        {ranked.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ranked.map((s) => {
              const g = GAP_STYLE[s.gap];
              return (
                <span key={s.id} className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: g.bg, color: g.fg }}>
                  {s.name} · {s.c} flag{s.c > 1 ? "s" : ""}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* per-person table */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.ink }}>By teammate</h3>
        <div className="space-y-2">
          {members.map((m, i) => {
            const st = STATUS_STYLE[m.status] || { bg: T.track, fg: T.ink };
            return (
              <div key={i} className="rounded-lg border p-3" style={{ borderColor: T.track }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium" style={{ color: T.ink }}>{m.person}</span>
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: st.bg, color: st.fg }}>{m.status}</span>
                  {m.lastResult && m.lastResult !== "—" && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: m.lastResult === "Pass" ? "#E7F6EF" : "#FBE9E7", color: m.lastResult === "Pass" ? T.green : T.red }}>
                      {m.lastResult}
                    </span>
                  )}
                  <span className="ml-auto text-xs" style={{ color: T.muted }}>
                    {m.sectionsComplete}/6 sections{typeof m.practiceAvg === "number" ? ` · ${m.practiceAvg}% practice` : ""}
                  </span>
                </div>
                {m.hardest && m.hardest.length > 0 && (
                  <p className="mt-1 text-xs" style={{ color: T.muted }}>
                    Hardest: {m.hardest.map((id) => (plan.sections.find((s) => s.id === id) || {}).name || id).join(", ")}
                  </p>
                )}
                {m.tip && <p className="mt-1 text-sm" style={{ color: T.ink }}>💡 {m.tip}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CertPrepDashboard() {
  const [examKey, setExamKey] = useState(EXAM_KEYS[0]);
  return (
    <div className="min-h-screen" style={{ background: T.surface }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');`}</style>
      <header className="px-4 pb-3 pt-6" style={{ background: T.ink }}>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cert Prep — Team Dashboard</h1>
        <p className="mt-0.5 text-sm" style={{ color: T.onDark }}>
          Facilitator view · who's prepping what and where they're stuck · refreshed {TEAM_STATS.generatedAt}
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4 pb-12">
        {TEAM_STATS.sample && (
          <div className="mb-4 rounded-xl p-3 text-sm" style={{ background: "#FEF3E2", color: "#7A4A08" }}>
            <strong>Sample data.</strong> These are placeholder names. Run the dashboard build flow
            (read the Slack List → regenerate <code>TEAM_STATS</code>) to replace with real progress.
          </div>
        )}
        <div className="mb-4 flex gap-2">
          {EXAM_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setExamKey(k)}
              className="flex-1 rounded-lg py-2 text-sm font-semibold"
              style={{
                background: examKey === k ? T.blue : T.card,
                color: examKey === k ? "#FFFFFF" : T.ink,
                boxShadow: "0 1px 2px rgba(23,33,59,0.08)",
              }}
            >
              {PLANS[k].short}
            </button>
          ))}
        </div>
        <ExamOverview examKey={examKey} />
      </main>
    </div>
  );
}
