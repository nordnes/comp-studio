# Complete — Leveling & Bands — Deep Dive

**Service:** https://www.complete.so/leveling · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Direct product-page extraction plus actual product screenshots (pulled from Complete's CDN) and a leveling-specific customer case study give concrete, citable grounding for tier/level placement UX.

## Positioning

Complete (YC W22, $4M seed from Accel; founders ex-Google PM Rani Mavram + ex-Uber/Opendoor eng Zack Field) sells "Leveling & Bands" as one of five platform modules (AI Agents · Planning · Leveling & Bands · Total Rewards · Interactive Offers). Its pitch: "Skip the guesswork on understanding levels" — leveling is positioned as the *shared-vocabulary layer* that recruiters, managers, and leadership align on before bands, cycles, and offers happen. Notably, Complete sells **recommended levels** (starter frameworks), acknowledging early-stage customers "don't even have a software engineer one versus a software engineer two" (TechCrunch). PPC framing: "Define job levels and set total rewards bands by role, department, and location with real-time market data overlays."

## Feature inventory

From `/leveling` (verbatim feature chips): **Level descriptions · Comp band visualization · Table overview · Benchmark imports · Real-time insights · Dynamic sharing · Drafting capability · Compensation analytics.** Plus, from page copy and homepage:

- **Recommended levels** — pre-built tiers, location-specific tiers, and job bands per job family
- **Draft mode** — "Construct, edit, and draft levels… as you scale" (levels are versioned drafts before publish)
- **Workforce visualization** — employees plotted against levels/bands "at a glance"
- **Custom permissions** — per-audience visibility "from leadership down to individual managers"
- **Band Builder Agent** (2025/26 AI layer) — synthesizes benchmark data, "models progression curves," surfaces draft bands with "business impact summarized"; human validates/adjusts/approves
- No public evidence of a formal IC-vs-management dual-track matrix editor or a calibration-committee feature — their architecture is **job family → L1…Ln tiers**, simpler than Pave/Ravio-style track matrices.

## Key workflows

1. **Framework creation**: pick/adapt recommended levels per job family → import benchmarks → Band Builder drafts bands → validate/approve → publish.
2. **Mapping people**: HRIS-synced employees auto-appear positioned within their level's band; per-person card carries Level, Salary range, Location, Compa ratio, free-text Notes, and a "Last updated 2mo ago" staleness stamp.
3. **Distribution**: "Share with recruiters" — a level framework for a job family is shared as a link with a per-recipient message; role-scoped views (Manager vs Admin badges in the marketing UI).
4. **Connection to cycles/offers**: levels→bands feed the Offer Agent ("matches it to your salary bands and benchmarks") and Cycle Prep Agent (pre-populates merit recommendations "based on performance ratings, comp ratios, and your merit matrix"). Their merit-cycle guide prescribes pre-planning (data cleanup, benchmarking, performance calibration, budget) → planning (top-down % vs bottoms-up merit-matrix models) → post-cycle evaluation (budget adherence, distribution analysis).

## UI/UX documentation (from CDN screenshots)

- **Band strip with people-on-band**: a horizontal band labeled "Engineering: Level 1 (Junior)" with Min/Mid/Max ticks beneath; employee avatars positioned along the strip at their salary; the mid zone highlighted green; a selected person ringed in purple. This is the signature visualization — *band as a 1-D scatter of people*, not a bar chart.
- **Person detail card**: avatar + name, 2×2 grid (Level | Salary range, Location | Compa ratio), Notes box, last-updated timestamp — a hover/click drill-down from the band strip.
- **Level ladder rail**: vertical purple rail L1–L6 with per-level name (Junior/Developer/Proficient/Skilled/Expert/Advisory), **headcount per level** (14/10/8/6/3/1), and a band bar per row; share icon at top; "Share with recruiters" composer beside it.
- **Role-based view chips**: "👁 Manager" and "👁 Admin" badges over the same screens — preview-as-role is a first-class concept (mirrors their offer-side preview-as-candidate).
- Screenshots: `cdn.prod.website-files.com/...653bf9a3..._leveling-page-graphic-1.png`, `..._leveling-page-graphic-2.png`, `...685057a8..._Frame 1000002949.jpg`.

## Review sentiment

Thin and leveling-light. G2: 4.7–5.0★ across ~14 reviews, winter-2024 badges (Easiest To Use, Easiest Setup, Best Support, Best ROI) — but G2 review text is bot-walled; nothing leveling-specific retrievable. SoftwareFinder (10 reviews, est. $20–60/employee/mo + $2k–20k implementation): praise for ease of use and responsiveness; mild "extensive capabilities feel overwhelming at first." Best leveling-specific signal is Complete's own Sardine case study: **Team Leveling cut tier-creation time 50%**, became the comp single source of truth, enabled "streamlined semi-annual reviews with up-to-date compensation data" and "real-time leveling decisions." Public leveling-framework thought-leadership is essentially absent — their educational content centers on comp philosophy and merit cycles, not level design.

## Takeaways for Comp Studio

1. **(9b — tier/band placement)** Complete's signature view is the *people-on-band strip*: Min/Mid/Max axis, advisors plotted as avatars at their package value, mid-zone shaded, selected advisor highlighted. Direct fit for advisor tier placement: render Base/Strategic/Anchor as band strips with each advisor positioned by net-of-strike value — far more legible than a table of multipliers.
2. **(9b)** Their level ladder rail (tier name + headcount-in-tier + band bar per row) is a compact tier-summary sidebar pattern: Base (n) / Strategic (n) / Anchor (n) with value-band bars — cheap to build in custom SVG within `DESIGN_SYSTEM.md` grammar.
3. **(WS-G info design)** Placement detail = small card, not modal-of-everything: Tier | Package value, Role | "Compa ratio" analog (advisor's value ÷ tier midpoint), Notes, last-reviewed timestamp. The compa-ratio analog and staleness stamp are the two highest-leverage fields for review/top-up triage.
4. **(Review/top-up workflow)** Their merit-cycle staging maps cleanly: pre-planning (data refresh + anchors check) → planning (top-down % vs bottoms-up matrix — for advisors, a tier×contribution top-up matrix) → post-cycle (budget adherence vs pool). Sardine's "semi-annual reviews + real-time leveling decisions" supports a standing review cadence with ad-hoc tier moves between cycles (relevant to spec Part 17's review-cadence blank).
5. **(WS-G)** Preview-as-role chips (Manager/Admin) and "draft → publish" leveling states are worth copying: tier-framework edits as drafts with explicit publish, and a "view as Robin / view as advisor" toggle — consistent with the offer-side preview-as-candidate pattern already covered.

## Sources

- https://www.complete.so/leveling — Leveling & Bands product page (features, copy)
- https://www.complete.so/ — homepage (module framing, Band Builder/Cycle Prep/Offer agents, G2 4.7★)
- https://www.complete.so/p/compensation-management — PPC page (module one-liners, integrations, Carta sync)
- https://www.complete.so/customers/sardine — leveling case study (50% tier-creation time saved, semi-annual reviews)
- https://www.complete.so/blog/merit-cycles-a-guide-on-best-practices — merit-cycle staging, merit matrix
- https://www.complete.so/planning-budgeting · /for-cpos-and-total-rewards-leaders · /for-cxos — cycle + persona framing
- https://techcrunch.com/2022/08/22/complete-startups-compensation-salary-benefits-tech-employee-equity-strategy-hiring-retention-philosophy-y-combinator/ — founding story, "no levels yet" target customer
- https://softwarefinder.com/hr/complete-platform — third-party review/pricing estimates
- CDN screenshots: `653bf9a3…leveling-page-graphic-1.png`, `653bf9a3…leveling-page-graphic-2.png`, `685057a8…Frame 1000002949.jpg` (band strip, ladder rail, person card, role chips)
