# Comprehensive.io — Deep Dive

**Service:** https://www.comprehensive.io · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Full module inventory, pricing model, funding, and the transparency-tracker origin are all now well-sourced; pixel-level UI documentation is the one thin spot (marketing pages are text-only; G2 screenshots not directly accessible).

# Comprehensive.io — Deep Dive

## Positioning & Pricing
- **Positioning:** "AI-powered, fully-customizable compensation platform" — configurability without consulting dependency; "zero spreadsheets"; sweet spot is VC-backed small/mid-market tech. Implementation pitched at <2 weeks ("no-touch"); SOC 2 Type 2, GDPR, CCPA. [comprehensive.io]
- **Company:** Founded 2021, SF. Roger Lee (CEO; also created Layoffs.fyi, co-founded Human Interest) + Teddy Sherrill (CTO, ex-RBI). ~9 employees. **$15.1M total**: $6M seed (Inspired Capital, Oct 2022) + ~$9.07M Series A (Mar–May 2025; SV Angel, Floodgate, Liquid 2). [CB Insights, Tracxn, LinkedIn]
- **Pricing:** PEPM model, billed annually, total-headcount-based (not per-seat), prorated headcount changes, quote-only. Data points: Vendr avg contract **$7,000/yr**; a competitor comparison cites starter tiers ≈ **$500–$2,000/mo** for early-stage, Growth/Enterprise quote-only. API exists for paid customers only — no self-serve tier. [comprehensive.io/faq, Vendr, orbytjobs.ai]

## Feature Inventory (by module)
**1. Compensation review cycles** — merit + promotion + bonus targets/payouts + equity grants in one cycle; separate bonus-only cycles; OTE/variable comp. Merit logic from performance ratings, **compa-ratio positioning**, tenure; custom formulas; **caps, floors, range-based guardrails with optional justification requirements**; fields editable/formula-driven/hybrid; mid-cycle rule edits hidden from employees until letters release; eligibility filters (exclude contractors). Budgets: fixed % pools, dynamic from suggested increases, per-dept/country; managers see real-time budget usage. Approvals: configurable chains by role/hierarchy/geo, batch review-and-edit, enforced justification for guideline exceedance or off-cycle promotions; notifications. Scenario planning listed under admin.

**2. Pay ranges (bands)** — import/maintain ranges, map to titles or title groups; "model compa-ratio philosophies and display employee positioning within ranges"; benchmark targets adjustable and aligned to internal leveling pulled from HRIS or custom fields; selective sharing via permissions; single source of truth.

**3. Benchmarking** — four datasets in one tool: (a) free job-postings dataset, 6,000+ US tech companies, refreshed daily (grew from 700 companies/53k postings at Jan 2023 launch); (b) **exec/AI/board dataset from 500+ VC-backed companies, filterable by capital raised, revenue, headcount, valuation, last round** (built with 20 VC firms incl. Sequoia, Accel); (c) Mercer Comptryx Global Tech (4M+ employees, 100+ countries); (d) Salary.com (15k titles, 225 industries). AI job matching; level-percentile comparison views; base + STI + LTI spectrum; blendable matches for hybrid roles.

**4. Total rewards** — employee dashboards (salary/bonus/equity/benefits), **equity value modeling**, award letters from configurable templates (web + PDF, calculated-value references, acknowledgment tracking, bulk reminders), local-currency display, letters can be generated from uploads without running a cycle.

**5. Analytics & compliance** — pay equity reporting with demographic segmentation, **auto-outlier flagging based on rules**, promotion-rate analysis, **market-position distribution views**, FTE normalization, **audit log**, CSV export, AI Q&A over comp data + AI manager coaching, **EU Pay Transparency Directive reporting** (expanding). 

**6. Integrations** — HRIS (BambooHR — formal 2025 partnership, Rippling), performance (Culture Amp, 15Five), cap table (**Carta**), Mercer; SSO; mix-and-match employee data from multiple sources.

## UI/UX Documentation (what's verifiable)
- Marketing copy consistently says "salary bands with **compa-ratio and range penetration visuals**" and "market positioning tools show where you are relative to targets," but the public site does not document the exact visual grammar (band bars vs. dots). Their own buyer's guide poses "How do you visualize where employees sit within their ranges?" as a vendor question — implying horizontal band bars with employee position markers, the category norm, but **unconfirmed; a demo is required for pixel-level detail**.
- Cycle UX: spreadsheet-like planning table with per-role customizable columns/layouts, real-time budget meters for managers, batch approval views, field-level visibility toggles (e.g., hide bonus target, show payout).
- Benchmarking UX: job-family picker → percentile table across levels; the free public tracker is browseable without an account.
- Band-building doctrine (their guide): min/mid/max anchored to a chosen percentile (e.g., P60 for slight-lead); spreads 15–20% entry, 20–30% mid, 30–50% senior/exec; watch midpoint progression + level overlap.

## Review Sentiment & Traction
- **Pros (G2/aggregators):** intuitive, fast cycles ("cut admin time by more than half"), configurability without code, strong support, fast implementation, managers finally understand budgets in-flow.
- **Cons:** thin out-of-the-box benchmarking for some buyers ("we uploaded our own"), young-product rough edges, more setup effort for niche enterprise workflows vs. legacy incumbents.
- Traction: Forbes Future of Work 2023 (pay transparency); Bloomberg cites their AI-salary data; BambooHR preferred-vendor partnership (2025). Still small (9 FTE) — credibility comes from the free tracker + founder brand, not scale.

## Pay-Transparency Origin & 2025–26 Angle
Launched **Jan 2023 as a free salary-range tracker** scraping careers pages daily (GPT-4 extraction; React/Node/Postgres), riding California's pay-transparency law; published per-jurisdiction **compliance rates** (CA 28%→58% in months; NYC 70%). The tracker is now the top-of-funnel for the paid platform. 2025–26: transparency mandates expanded (IL, MN ≥30 emp, NJ ≥10 emp, VT, MA; 16 states + DC ≈ 60M workers) and **EU Pay Transparency Directive (June 2026)** — Comprehensive now markets EU-directive analytics and "ranges usable when posting roles" as compliance tooling.

## Takeaways for Comp Studio
1. **WS-G (guardrail presentation):** Comprehensive frames guardrails as *cycle-time policy*: caps/floors/range-bounds that trigger **justification requirements** rather than hard blocks, with exceedance surfaced to approvers. For Comp Studio: render generosity guardrails as soft gates with a required-rationale affordance captured into the audit log, not as validation errors.
2. **9a (benchmark provenance):** Their credibility model is explicit per-claim sourcing — each number is tagged to a named dataset (job postings n=6,000, exec n=500+ VC-backed, Mercer, Salary.com) with refresh cadence and filter dimensions (capital raised, valuation, last round). Comp Studio's benchmark anchors should carry the same provenance chip: source name + n + as-of date + filter cut.
3. **9b (band placement grammar):** Industry-standard vocabulary they normalize: min/mid/max three-point bands, compa-ratio vs. **range penetration** as distinct measures, midpoint anchored to a stated percentile philosophy (lead/match/lag), spreads widening by seniority (30–50% at exec), deliberate level overlap. Adopting this exact vocabulary makes Comp Studio's advisor band placement legible to anyone who's used comp tooling.
4. **Audit log as first-class feature:** they list audit log + CSV export under analytics, and their buyer's guide names "audit trails for board and regulator requests" as table stakes — validates Comp Studio's audit-log workstream as a category expectation, not gold-plating.
5. **Gap = opportunity:** Comprehensive's exec/board dataset covers cash+equity for VC-backed roles but has **no token-compensation or net-of-strike modeling at all** — Comp Studio's advisory-equity+token niche has no overlap with the closest comp-tooling incumbent.

## Sources
- https://www.comprehensive.io/products/compensation-management — module FAQ (cycles, guardrails, ranges, analytics, audit log)
- https://www.comprehensive.io/products/benchmarking — four datasets, exec/board filters
- https://www.comprehensive.io/ — homepage, AI features, datasets
- https://www.comprehensive.io/faq — pricing structure (PEPM, annual, headcount-based)
- https://www.comprehensive.io/content/compensation-management-software-buyers-guide — band-visualization vendor questions, compliance expectations
- https://www.comprehensive.io/content/how-to-create-salary-ranges — band-building doctrine (spreads, midpoints)
- https://www.comprehensive.io/content/best-compensation-management-software — self-published pros/cons incl. review quotes
- https://www.cbinsights.com/company/comprehensive-1 — funding ($15.07M, Series A)
- https://tracxn.com/d/companies/comprehensive/… — founding, Series A Mar 2025
- https://linkedin.com/company/comprehensiveio — headcount, partnerships, funding history
- https://www.vendr.com/buyer-guides/comprehensive — $7,000 avg contract value
- https://www.orbytjobs.ai/orbyt-intelligence/compare/orbyt-intelligence-vs-comprehensive — $500–$2,000/mo starter tiers, API closed (competitor source; treat as directional)
- https://www.hrdive.com/news/pay-transparency-tracker-California-NYC/640103/ — Jan 2023 tracker launch, compliance rates
- https://blog.pragmaticengineer.com/the-scoop-salary-transparency/ — tracker architecture (GPT-4 scraping), compliance stats
- https://ogletree.com/insights-resources/blog-posts/pay-transparency-reminder-5-states-laws-take-effect-in-2025/ — 2025 state laws
- https://www.pin.com/blog/salary-benchmarking-tools/ — 16 states + DC / 60M workers coverage, free-tracker assessment

 I've gathered what I can find—sources are starting to repeat and I haven't located detailed pixel-level screenshots of the compa-ratio interface since G2 blocks access and marketing materials are mostly text. I should acknowledge that limitation upfront. Now I'll structure the digest with what I have, keeping it tight around 1500 tokens while still delivering the exhaustive feature breakdown and concrete UI details the caller requested.
