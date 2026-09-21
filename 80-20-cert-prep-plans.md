# 80/20 Cert Prep Plans — Tableau Next & Marketing Cloud Next Consultant

> ⚠️ **Superseded (kept for reference).** The canonical, up-to-date plans now live in
> `cert-plans.json` (all three exams, including Data 360) and are delivered interactively by the
> `cert-prep` Claude Code skill. This file covers only 2 exams and is no longer maintained.

**Built for:** Kanani Guyton — Senior SA, Agentforce + Data 360 specialist
**Strategy:** Skip what you already live daily (Data 360), concentrate on the product-specific layers each exam actually tests.

**Recommended order:** Tableau Next first (65% pass bar, ~8 hr trail), then Marketing Cloud Next (72% pass bar, ~17.5 hr trail).

---

# EXAM 1: Tableau Next Consultant

## Quick Facts
- 60 scored questions, 105 minutes, **65% to pass (~39 correct)**
- Aligned to the July 262.11 release
- $200 / $100 retake

## Section Weights & Your Effort Level

| Section | Weight | ~Questions | Your gap |
|---|---|---|---|
| Agentic Experiences | 25% | 15 | **HIGH — study hard** |
| Data Setup (incl. semantic models) | 20% | 12 | LOW-MED — semantic models only |
| Embedding, Cross-Cloud & Interop | 20% | 12 | **HIGH — study hard** |
| Visualizations & Dashboards | 15% | 9 | MEDIUM |
| Basic Setup & Admin | 10% | 6 | MEDIUM |
| Managing Workspaces & Orgs | 10% | 6 | MEDIUM |

**Your math:** Data 360 knowledge banks most of Data Setup (~10-12%). Nail Agentic (25%) + Embedding (20%) + semantic models and you're at the pass line before touching the smaller sections.

## The 20% to Study (in priority order)

### 1. Semantic Models — the spine of the whole exam (~2 hrs)
Everything in Tableau Next hangs off semantic models. Know cold:
- Components: semantic data objects, joins/relationships, metrics, calculated fields, semantic definitions
- **Field hygiene for AI agents** — descriptions, synonyms, hiding noisy fields ("agent readiness")
- Semantic Model AI Optimization (Beta) — scoring/improving models
- AI-Generated Descriptions (Beta)
- Marketplace semantic model templates
- Do: **Tableau Semantics** badge (45 min) + Semantic Foundations for Agentforce article

### 2. Agentic Experiences — biggest section (~2.5 hrs)
- Analytics Agent / Tableau Agent: conversational Q&A grounded in semantics
- **Verified questions & business preferences** — how you calibrate Q&A accuracy
- Agentic readiness assessment — what makes a model "agent-ready"
- **Inspector proactive data alerts (Beta)** — threshold notifications on metrics
- Draft with Einstein / NL data prep
- Plan Your Tableau Agent Implementation article

### 3. Embedding, Cross-Cloud & Interoperability (~1.5 hrs)
Likely your least-familiar territory as scoped by the exam:
- Embedding dashboards in **Lightning pages and Slack**
- Tableau Next + Slack: rich previews, **MCP server in Slack** (ask Slackbot about your data)
- **Tableau Next Apps for Salesforce** + Marketplace offerings (prebuilt apps, dashboard templates)
- APIs/SDKs and **App Template Framework** — know what exists and what each is for (breadth, not depth)
- Relationship to other Salesforce analytics (CRM Analytics positioning)

### 4. Workspaces, Orgs & Deployment (~1 hr)
- Workspaces: content sharing, collections, asset access management
- **Personal Org** — isolated self-service analyst environments; how they relate to shared workspaces
- **Deployment: data kits, sandbox → production migration**
- Data Monitoring dashboard (DLO details, execution history)

### 5. Setup, Admin & Security (~1 hr)
- Guided setup flow; feature activation incl. **activating Agentic Analytics for users**
- Permission sets & licenses (which perm set enables what)
- **Row-Level Security (RLS)** and object-level governance
- User/group management for asset sharing

### 6. Visualizations & Dashboards (~45 min)
Mostly best-practice judgment questions:
- Dashboard design best practices (you know these from CRM Analytics work)
- **Actions**: navigation links, Salesforce object actions, single-click actions that fire Flows or navigate to URLs — know the action types and where each is configured

### SKIP / SKIM
- Data 360 foundation modules (Data 360 Setup, Connectors & Integrations, Data & Identity badges) — you teach this. 10-min skim for terminology only.
- Data strategy planning articles — skim once.

**Trail:** [Prepare for Your Salesforce Tableau Next Consultant Exam](https://trailhead.salesforce.com/content/learn/trails/prepare-for-your-salesforce-tableau-next-consultant-exam) (~8 hrs full; **~5 hrs your version**)

## Suggested Sequence (compressible)
- **Session 1 (2 hrs):** Tableau Semantics badge + semantic model articles (incl. both Betas)
- **Session 2 (2 hrs):** Agentic Experiences — Tableau Agent, verified questions, alerts, implementation planning
- **Session 3 (1.5 hrs):** Embedding + Slack + MCP + Marketplace + APIs overview
- **Session 4 (1.5 hrs):** Setup/permissions/RLS + workspaces/Personal Org/data kit deployment
- **Session 5 (1 hr):** Visualization actions + full exam-guide re-read; self-quiz each bullet in the outline ("could I answer a scenario on this?")
- **Hands-on multiplier:** spin up Tableau Next in an internal demo org and build one semantic model → viz → dashboard → ask the Agent. One hour of this replaces three of reading.

---

# EXAM 2: Marketing Cloud Next Consultant

## Quick Facts
- 60 scored questions, 105 minutes, **72% to pass (~44 correct)** — tightest margin of any SF exam, only ~16 wrong allowed
- Aligned to Summer '26 release
- $200 / $100 retake

## Section Weights & Your Effort Level

| Section | Weight | ~Questions | Your gap |
|---|---|---|---|
| Campaign Design, Flow Orchestration & Content | 30% | 18 | **HIGH — study hardest** |
| Data Modeling, Identity Resolution & Segmentation | 25% | 15 | **LOW — your home turf** |
| Platform Setup & Governance | 13% | 8 | MEDIUM |
| Consent | 13% | 8 | **HIGH — new material** |
| Agentforce & AI Innovation | 11% | 7 | LOW-MED |
| Analytics & Performance Insights | 8% | 5 | LOW |

**Your math:** Section 3 (25%) + Agentforce (11%) + Analytics (8%) ≈ 44% you can mostly bank. But at a 72% bar you can't punt anything — Campaigns/Flows (30%) + Consent (13%) are where you pass or fail.

## The 20% to Study (in priority order)

### 1. Campaign Design, Flow Orchestration & Content — 30% of the exam (~5 hrs)
This is the heart of MC Next and probably your biggest gap:
- **Flow types for marketing**: segment-triggered vs. record-triggered vs. schedule-triggered — given a scenario, pick the type, trigger conditions, and config
- **Marketing flow elements** in Flow Builder: Send Email/SMS/WhatsApp, Wait/Time Delay, Decision splits, frequency/quiet-time settings
- **Personalization methods** — the exam names five: Handlebars, **AMPscript**, merge fields, repeaters, content variations. Know when to use each. (AMPscript is an in-scope *method to recognize and select*; only **writing raw programmatic AMPscript** is out of deep scope.)
- **Data sources for personalization** — which source feeds what content
- **Activation templates & contact points** — selecting the right contact point value, source priority order
- Landing page components and configuration
- Do: **Email Content & Personalization** badge (1:40) + **Campaign Optimization with Flows** badge (50 min) + Flow Builder Elements article + Contact Points article

### 2. Consent — 13%, entirely new subsystem (~2 hrs)
Almost certainly unfamiliar and heavily scenario-tested:
- **Platform consent objects and their relationships** (Individual, Contact Point Type Consent, Communication Subscription, Communication Subscription Consent, etc.) — know the object model
- Methods to create/update consent records (forms, flows, API, manual) and when each fits
- **Consent banners** on marketing + external landing pages
- Compliance framing: opt-in models, engagement rules
- Do: **Consent Management Fundamentals** badge + both consent Help articles

### 3. Platform Setup & Governance — 13% (~2 hrs)
- Environment requirements: **Core Org editions, Data 360 provisioning, Marketing Data Kit installation, permission sets**
- **Business Units ↔ Data Spaces 1:1 relationship** — the exam's favorite architecture question; when BUs are required, data isolation scenarios
- Roles + **Enhanced CMS Workspaces** for content governance
- **Domain authentication vs. domain authorization** (DKIM/SPF, self-service setup); automated dedicated IP scaling guardrails
- Do: **Email Sending Essentials** badge (1:35) + BU article + domain auth article

### 4. Your home-turf sections — verify, don't study (~1.5 hrs total)
- **Data 360 (25%)**: skim for MC-specific angles only — Actionable Lists from CRM data, **consumption entitlements/Digital Wallet** (how automation design decisions burn credits — you know the credit model, learn the marketing-flavored examples), segmentation → activation path
- **Agentforce (11%)**: out-of-box **Marketing Agents** (campaign creation, audience generation, content gen), conversational messaging config across SMS/email/WhatsApp, **which predictive AI feature fits a scenario** (send-time optimization, engagement scoring, etc.)
- **Analytics (8%)**: pre-built dashboard catalog — which dashboard answers which requirement; surfacing marketing data across the platform

### SKIP
- Out of deep scope per the exam guide: writing raw programmatic AMPscript or heavy SQL; custom LLMs / external AI transformer architectures; complex MuleSoft API integrations or extensive Apex (*unless* establishing basic data providers for high-throughput transactional sending); raw external data-lake DB admin (*outside* standard Zero Copy or Data Share connections with Data 360)
- Data 360 fundamentals badges in the trail (Ingest/Harmonize/Unify, Segment & Activate) — skim titles only

**Trail:** [Prepare for Your Marketing Cloud Next Consultant Certification](https://trailhead.salesforce.com/content/learn/trails/prepare-for-your-marketing-cloud-next-consultant-certification) (~17.5 hrs full; **~10-11 hrs your version**)

## Suggested Sequence
- **Session 1 (2 hrs):** MC Next Basics badge + Setup articles + BU/Data Space model
- **Session 2 (2 hrs):** Email Sending Essentials + domain auth (DKIM/SPF)
- **Session 3 (2.5 hrs):** Flows deep-dive — flow types, elements, triggers; Campaign Optimization badge
- **Session 4 (2 hrs):** Personalization (Handlebars, merge fields, repeaters, variations) + contact points/activation templates + landing pages
- **Session 5 (2 hrs):** Consent — object model, record management, banners
- **Session 6 (1.5 hrs):** Marketing Agents + conversational messaging + predictive AI features; dashboards; Digital Wallet marketing scenarios
- **Session 7 (1 hr):** Exam-guide outline self-quiz — every bullet phrased as "given a scenario…"; drill anything shaky
- **Hands-on multiplier:** build one segment-triggered flow with a personalized email in a demo org, and click through Consent objects in Setup once. The object relationships stick 10x faster seen live.

---

# Cross-Exam Cheats

**Shared backbone (study once, use twice):** DMOs, identity resolution, segmentation, Data 360 provisioning, consumption/credits, Agentforce grounding concepts. Both exams also test *"agent readiness"* — clean metadata, good descriptions, governed access.

**Exam technique for both:**
- These are consultant exams: answers favor *"given a scenario, what would you advise"* — pick the governed, out-of-box, lowest-maintenance option over the clever custom one.
- Watch for Beta-labeled features (Semantic Model AI Optimization, AI-Generated Descriptions, Inspector proactive alerts) — new exams love testing brand-new features because that's what distinguishes current knowledge.
- 105 min / 60 Q = 1:45 per question. Flag and move on; first instinct on scenario questions is usually right.
- Wrong-answer patterns: anything requiring AMPscript/Apex/custom LLMs (MC Next) or external Tableau Server/Cloud concepts that don't apply to Tableau Next.
