# OpenComp — competitor deep-dive (2026-06-11)

## Snapshot — positioning, target user, status, pricing

- **What it is:** "The world's first Comp Decision Software" — an end-to-end compensation management SaaS covering benchmarking, pay ranges, merit/bonus cycles, pay equity, offers, total-rewards statements and headcount planning. Tagline: "Know what it feels like to get pay right." (https://www.opencomp.com/)
- **Lineage/positioning:** Founded 2021 by Thanh Nguyen (CEO) and Nancy Connery — "Salesforce's founding HR team" (Connery was Salesforce's first VP of HR; the product encodes her comp philosophy). Seed $4.6M (Mar 2021, incl. Marc Benioff's TIME Ventures); Series A $20M (Feb 2022, led by K5 Global and J.P. Morgan, with TIME Ventures, 8VC, Circle Ventures, Mantis). Customer base grew 432% in year one to 2,100+ companies incl. Calm, Discord, Figma, Medium, Reddit. (https://www.businesswire.com/news/home/20220224005073/en/OpenComp-Closes-%2420M-in-Series-A-Funding-to-Bring-Compensation-Intelligence-to-High-growth-Companies; https://venturebeat.com/business/opencomp-closes-a-4-6m-seed-round-of-funding-to-help-companies-get-compensation-right-with-powerful-cloud-platform/)
- **Target user:** HR/People + Finance at high-growth startups and scale-ups **up to ~1,500 employees without in-house comp expertise** — explicitly a "comp expert in a box" play. (https://www.selectsoftwarereviews.com/reviews/opencomp, dated 2026-01-28)
- **Status (June 2026):** Active; site copyright 2025, free-trial signup live (`app.opencomp.com`), blog active. A 2024-era consulting arm ("Compensation Consulting Practice," via sister company Connery Consulting) is now a first-class nav item. (https://www.opencomp.com/compensation-consulting-practice)
- **Pricing (verified 2026-06-11):** OpenComp's own pricing page shows **three named bundles with a feature-checkmark matrix but no dollar figures** — "Comp Benchmarking" (understand), "Comp Strategy" (create), "Comp Cycles" (apply); Advisory Services is an add-on to all three (https://www.opencomp.com/pricing-plans). Published numbers come from directories: GetApp (updated June 2026) lists **Comp Benchmarking $4,500/yr · Comp Strategy $8,500/yr · Comp Cycles $15,000/yr (flat-rate subscription, free trial + free version)** (https://www.getapp.com/hr-employee-management-software/a/opencomp/). SelectSoftware Reviews (2026-01-28): "from $4,500/year" (https://www.selectsoftwarereviews.com/reviews/opencomp). Vendr transaction data (updated Feb 2026): **median actual contract $17,000/yr** (range $7,800–$26,600; <100 emp $12–30K; 100–500 emp $30–80K; 500+ emp $60–150K+ with equity module adding $10–40K) — i.e., the flat list price is the floor; real deals are headcount-priced (https://www.vendr.com/marketplace/opencomp). **[uncertain]** whether the $4,500/$8,500/$15,000 figures are current vendor-set list prices or a small-company base configuration; OpenComp itself no longer prints them.

## Complete feature inventory — by module

Tags: **[R]** relevant to Advisor Comp Studio, **[NR]** not relevant.

**1. Global Comp Data** — https://www.opencomp.com/compensation-management-software/global-compensation-data
- Continuously updated market rates for salary, bonus **and equity** per role/level/geo **[R — equity benchmarks per role = analogue of advisor value-band anchors]**
- First-party data sourced directly from customers' HRIS/equity/payroll systems via daily API syncs ("crowd-sourced in real time"), "never stale" **[NR — we have no peer-data network]**
- Data "verified by advanced technologies" (ML cleaning/validation) **[NR]**

**2. Benchmarking** — https://www.opencomp.com/compensation-management-software/compensation-benchmarking
- Connect HRIS + equity systems; benchmark entire employee population "in less than thirty seconds" **[NR]**
- "AI-powered benchmarking process that normalizes, levels and matches your data for apples to apples comparison" (auto job-matching/leveling) **[R — auto-mapping advisors to FAST tiers is the same shape]**
- Import third-party datasets and benchmark against multiple sources simultaneously **[R — multiple data anchors per role]**
- Percentile targeting per employee (e.g., "50th percentile" chips shown on homepage hero next to salary AND equity %) **[R — percentile chip per grant]**

**3. Pay Strategy and Ranges** — https://www.opencomp.com/compensation-management-software/pay-strategy-and-salary-ranges
- Strategy-survey-driven range builder: "expert-grade salary ranges that balance cash and equity, incorporate location strategies and apply remote pay policies" **[R — wizard that derives bands from a declared philosophy = our tier policy → guardrails flow]**
- Out-of-policy detection: "easily identify areas where existing comp may not be aligned with your company's pay strategy" **[R — compa-ratio guardrail flags]**
- Ranges surfaced everywhere: "consistently see pay ranges throughout the OpenComp system… from offers and merit increases to pay equity" **[R — guardrails rendered in every view, not one page]**
- Knowledge-base detail (Ranges feature): main page = distribution overview (below/in/above range bar graph, click-to-filter), drill into department/quartile views, filters by department/level/employee type/geo/range group; per-job "Cost to Minimum" + average range position; CSV export of Ranges + employee census **kept past subscription** (https://success.opencomp.com/opencomp-knowledge-base/product-guides/ranges-overview) **[R]**

**4. Merit and Bonus Cycles** — https://www.opencomp.com/compensation-management-software/merit-cycle-software
- Step-by-step setup wizard: assign budgets, eligibility criteria, approval workflows **[R — wizard pattern for scenario/grant setup]**
- Central tracker of each manager's progress + inquiry handling **[NR]**
- Real-time cycle impact view ("immediately identify and correct issues"); real-time exec summary of budget burn, market position, % of workforce below range (per SSR demo) **[R — live KPI strip while editing]**
- Auto-generated employee letters communicating increases/promotions "at the click of a button" **[R — direct analogue of the watermarked Proposition doc]**

**5. Pay Equity** — https://www.opencomp.com/compensation-management-software/pay-equity-software
- Disparity detection within roles by gender/ethnicity; metrics per demographic group incl. **share of equity**, average job level, average performance score **[R — cohort comparison table mechanics]**
- Track by department and management team; real-time impact of merit cycles on equity gaps **[NR]**

**6. Total Rewards Statements** — https://www.opencomp.com/compensation-management-software/total-rewards-statements
- Employee-facing statement of full comp (base, equity, bonus, benefits) **and how it evolved over time** **[R — advisor-facing "what your package is worth" document, with history]**

**7. Headcount Planning** — https://www.opencomp.com/compensation-management-software/headcount-planning
- Models of headcount changes vs expenses/burn; level/start-date/end-date levers over 1 mo–5 yr horizons; "predict future cash burn **and dilution**"; financing-round goal modeling **[R — scenario modeling with dilution is exactly our Conservative/Base/Aggressive walk]**

**8. Intelligent Offers** — https://www.opencomp.com/compensation-management-software/intelligent-job-offers
- Offer composer showing ranges, peer data and **past offers for the same role** side-by-side **[R — precedent panel next to a draft grant]**
- Offer approvals "with a clear, auditable timeline and workflow" **[R — our governance/consents checklist + audit log]**
- Interactive (web) offer letters showcasing the whole package **[R — interactive vs print Proposition]**

**9. Compensation Consulting Practice (services tier)** — https://www.opencomp.com/compensation-consulting-practice
- Human consulting (via Connery Consulting heritage): comp philosophy, pay-range development, executive comp, job-leveling frameworks, competitive analysis, **equity modeling ("cash and equity burn with cost strategies for different valuation, eligibility, equity target scenarios")**, pay-equity analysis, incentive plan design, program design. Sold as "Advisory Services — Add on" on every pricing tier. **[R — equity modeling across valuation scenarios is our core engine, sold by them as consulting]**

**10. AI features** — limited and embedded, not a copilot: "AI-powered benchmarking" matching/leveling/normalization (https://www.opencomp.com/compensation-management-software/compensation-benchmarking) and data verification "by advanced technologies" (https://www.opencomp.com/compensation-management-software/global-compensation-data). No public LLM assistant/chat feature found as of 2026-06-11. **[NR]**

## UI/UX documentation

- **IA/navigation:** Marketing IA mirrors product IA — eight modules in a fixed pill-nav strip repeated on every product page (global comp data · benchmarking · merit and bonus cycles · pay strategy and ranges · pay equity · total rewards statements · headcount planning · intelligent offers). In-app (per knowledge base): left-nav with **Ranges**, Market Data, Merit Cycles, Scenario Settings; setup is sequenced — "In order to use Ranges, you must first Create a Pay Strategy" (https://success.opencomp.com/opencomp-knowledge-base/product-guides/ranges-overview). Strategy is a prerequisite object, not a settings page.
- **Compa-ratio / range-placement rendering (the signature screens):**
  - The **Ranges overview** opens with a stacked distribution bar (employees below / in / above range). The bars are interactive filters — "clicking into the bar graph that represents the employees below their respective ranges will filter the results to those employees."
  - **Job Range rows** group by Job Type × Level; each collapsed row shows aggregate stats — "Cost to Minimum if there are employees below the range… as well as the average range position." Expanding the row reveals individual employees plotted on the same horizontal band.
  - **Per-employee placement:** "Clicking on an individual employee reveals where that employee sits in the Job's Range. The thicker vertical line represents where the employee sits on the range group" — i.e., a horizontal range bar (min→max, quartile shading per the drill-down views) with a bold tick at the employee's pay. The SSR review screenshot ("OpenComp_Employee_Distribution.png") shows the same: roster table left, range bars inline per row.
  - Quartile drill-down view + filters (department, levels, employee type, geos, range groups); quick switcher between Range Groups and Geo Tiers. (All: https://success.opencomp.com/opencomp-knowledge-base/product-guides/ranges-overview)
  - Compa-ratio per se is expressed as **position-in-range / percentile chips** rather than a bare ratio column; homepage hero shows employee cards with "$125K — 50th percentile" and ".801% — 50th percentile" (equity) badges (https://www.opencomp.com/). A SHRM-directory reviewer: "It's very, very easy to intuit pay disparities and range penetration or compa ratio within OpenComp" (https://vendordirectory.shrm.org/company/911750/reviews).
- **Forms/wizards:** Merit cycles use "a simple, step-by-step wizard" for budgets/eligibility/approvals (https://www.opencomp.com/compensation-management-software/merit-cycle-software); the range builder starts from "a short strategy survey" (https://www.selectsoftwarereviews.com/reviews/opencomp). Onboarding = connect HRIS or upload a templated census file (per-HRIS upload guides in the KB, e.g. Rippling).
- **Charts & interactions:** distribution bars as filters; horizontal band charts with tick markers; real-time cycle summary KPIs (budget burn, % below range); "Suggested" pill on recommended values (homepage mock). Headcount module = line/area burn projections.
- **Visual tone:** clean SaaS, white background, rounded cards, generous whitespace; testimonials lean hard on it — "Huge time saver… clean and intuitive" (PetFriendly), "Best interface for any compensation tool" (Mosaic) (https://www.opencomp.com/). One GetApp/G2-sourced gripe: "the colour scheme could be different," "initial settings are kind of annoying" (https://www.g2.com/products/opencomp/reviews).
- **Review evidence on UX:** G2 Ease of Use 9.1, Quality of Support 9.6, Comp Data Management 9.4 (https://www.g2.com/products/opencomp/reviews). Zendrop HR manager (6/10 overall): "the interface is simple to use and easy to navigate" but support/demo experience was poor (https://www.selectsoftwarereviews.com/reviews/opencomp).
- **Accessibility:** no public a11y/VPAT statement found. **[uncertain]**
- **Mobile:** web app; GetApp lists platform support as Web only (no Android/iOS apps flagged) (https://www.getapp.com/hr-employee-management-software/a/opencomp/).
- **Exports/printables:** Ranges + employee census downloadable as files customers "keep past their subscription period" (https://success.opencomp.com/opencomp-knowledge-base/product-guides/ranges-overview); merit letters and total-rewards statements are generated documents.

## Known criticisms & limitations (review-sourced)

- **Benchmark matching gaps for specialized roles/industries**: "difficult to match some positions to the benchmarked roles due to specialized industries"; requests for more niche roles/levels/locations data (https://www.g2.com/products/opencomp/reviews; https://vendordirectory.shrm.org/company/911750/reviews).
- **HRIS sync limitations** — no real-time two-way sync with some systems; some integrations are one-way/file-based (https://www.g2.com/products/opencomp/reviews; https://www.selectsoftwarereviews.com/reviews/opencomp).
- **Rigid defaults**: platform defaults to 50th percentile; users targeting other percentiles "have to view multiple screens to get what they want" — limited individual customization (https://vendordirectory.shrm.org/company/911750/reviews).
- **No termination/backfill management with level tracking** (https://www.selectsoftwarereviews.com/reviews/opencomp).
- **Cost escalation**: "pricing can scale into six figures for larger orgs"; auto-renewal with 5–10% annual escalators and add-on fees (data refresh, seats, migration) reported (https://www.selectsoftwarereviews.com/reviews/opencomp; https://www.vendr.com/marketplace/opencomp).
- **Early-stage service wobble**: demo/support negativity in at least one verified 2025–26 review (https://www.selectsoftwarereviews.com/reviews/opencomp).

## Data, benchmarks & methodology

- First-party, **HRIS-connected crowd-sourced dataset**: "Actionable data, crowd-sourced in real time straight from our customers' HRIS systems. Matched and leveled to allow benchmarking that's truly apples-to-apples" (https://www.opencomp.com/). Daily API syncs from HRIS, equity-management and payroll systems (https://www.opencomp.com/compensation-management-software/global-compensation-data).
- Methodology is editorialized in a public KB ("The OpenComp Benchmark": job levels, determining the appropriate level, market data overview) — methodology-as-documentation builds trust (https://success.opencomp.com/opencomp-knowledge-base).
- The *Salesforce lineage* is people, not data: founders = Salesforce's founding HR/comp team; product encodes Connery's comp philosophy (https://www.businesswire.com/news/home/20220224005073/en/OpenComp-Closes-%2420M-in-Series-A-Funding-to-Bring-Compensation-Intelligence-to-High-growth-Companies; https://www.selectsoftwarereviews.com/reviews/opencomp).
- Third-party survey import lets customers benchmark against external datasets alongside OpenComp's (https://www.opencomp.com/compensation-management-software/compensation-benchmarking). Vendr notes some contracts charge separately for benchmark refreshes/expanded datasets (https://www.vendr.com/marketplace/opencomp).

## Integrations & security/compliance

- **Integrations:** 2022 press release: "20+ cash and equity integrations," daily-refresh HRIS connections (https://www.businesswire.com/news/home/20220127005220/en/). Named: ADP Workforce Now, BambooHR, Gusto, Namely, Rippling, UKG (Ready + Pro), Justworks, TriNet, ChartHop, plus equity platforms **Carta** and **Pulley** (https://www.getapp.com/hr-employee-management-software/a/opencomp/; https://www.businesswire.com/news/home/20220127005220/en/). SSR: "12+ HRIS tools and a public API" (https://www.selectsoftwarereviews.com/reviews/opencomp). Vendr also references Workday/Greenhouse/Lever connectivity claims **[uncertain — not on vendor site]** (https://www.vendr.com/marketplace/opencomp).
- **Security/compliance:** site trust bar shows **CCPA, GDPR, AICPA (SOC 2)** badges with "access controls, data encryption, security certifications and system audits" (https://www.opencomp.com/); dedicated GDPR page (https://www.opencomp.com/gdpr). SOC 2 type not publicly specified. **[uncertain]**

## Patterns worth borrowing for Advisor Comp Studio

1. **Range bar + thick tick per person.** OpenComp's core visual: horizontal min→max band (quartile-shaded), bold vertical line at the individual's position, aggregate "average range position" per group. Render each advisor grant on its FAST-tier band exactly this way — it reads instantly in tables and in the printed Proposition. (https://success.opencomp.com/opencomp-knowledge-base/product-guides/ranges-overview)
2. **Distribution bar as filter.** The below/in/above-range stacked bar doubles as a click-to-filter control for the roster underneath. Our guardrail summary (n advisors under/over band) should filter the advisor roster on click.
3. **Percentile chip on every number.** Hero cards pair each value with its market position ("$125K — 50th percentile", ".801% — 50th percentile" for equity). Tag each advisor grant with its position vs tier anchor as a compact chip rather than a separate column. (https://www.opencomp.com/)
4. **"Cost to Minimum" roll-up.** One number per group quantifying what it costs to bring everyone up to the band floor — translate to "cost to bring all advisors to tier floor" in tokens/options, a great guardrail KPI. (https://success.opencomp.com/opencomp-knowledge-base/product-guides/ranges-overview)
5. **Strategy as prerequisite object.** You cannot open Ranges before creating a Pay Strategy; the philosophy → bands → every-screen-enforcement pipeline keeps decisions consistent. Mirror: tier policy must exist before grants can be drafted, and bands then appear in every view ("consistently see pay ranges throughout the system").
6. **Precedent panel in the offer composer.** Showing ranges, peer data and *past offers for the same role* beside the draft (https://www.opencomp.com/compensation-management-software/intelligent-job-offers) — show prior advisor grants of the same tier next to a new draft.
7. **Auditable approval timeline on offers.** "Automate and track all offer approvals with a clear, auditable timeline and workflow" — render our governance/consents checklist as a vertical timeline with timestamps, not a static checklist. (same URL)
8. **One-click letter generation + exports that outlive the subscription.** Cycle results auto-generate personalized letters; ranges/census export to files customers keep. Reinforces our printable watermarked Proposition + durable audit-log export. (https://www.opencomp.com/compensation-management-software/merit-cycle-software; https://success.opencomp.com/opencomp-knowledge-base/product-guides/ranges-overview)

## Sources

**[primary]** (vendor)
- https://www.opencomp.com/ — homepage, positioning, testimonials, trust badges
- https://www.opencomp.com/pricing-plans — three bundles + feature matrix (no dollar figures)
- https://www.opencomp.com/compensation-management-software/global-compensation-data
- https://www.opencomp.com/compensation-management-software/compensation-benchmarking
- https://www.opencomp.com/compensation-management-software/pay-strategy-and-salary-ranges
- https://www.opencomp.com/compensation-management-software/merit-cycle-software
- https://www.opencomp.com/compensation-management-software/pay-equity-software
- https://www.opencomp.com/compensation-management-software/total-rewards-statements
- https://www.opencomp.com/compensation-management-software/headcount-planning
- https://www.opencomp.com/compensation-management-software/intelligent-job-offers
- https://www.opencomp.com/compensation-consulting-practice — services tier
- https://success.opencomp.com/opencomp-knowledge-base/product-guides/ranges-overview — Ranges UI walkthrough (compa-ratio/range rendering)
- https://success.opencomp.com/opencomp-knowledge-base — methodology & product guides
- https://www.opencomp.com/gdpr

**[review]**
- https://www.g2.com/products/opencomp/reviews — G2 scores + pros/cons
- https://www.selectsoftwarereviews.com/reviews/opencomp — SSR hands-on review, 2026-01-28
- https://vendordirectory.shrm.org/company/911750/reviews — SHRM vendor directory reviews
- https://www.getapp.com/hr-employee-management-software/a/opencomp/ — pricing tiers + integrations, updated June 2026

**[secondary]**
- https://www.vendr.com/marketplace/opencomp — transaction-data pricing benchmarks, Feb 2026
- https://www.businesswire.com/news/home/20220224005073/en/OpenComp-Closes-%2420M-in-Series-A-Funding-to-Bring-Compensation-Intelligence-to-High-growth-Companies — Series A, founders, customers
- https://venturebeat.com/business/opencomp-closes-a-4-6m-seed-round-of-funding-to-help-companies-get-compensation-right-with-powerful-cloud-platform/ — seed round
- https://www.businesswire.com/news/home/20220127005220/en/OpenComp-Announces-New-HRIS-Integrations-to-Give-Employers-a-Competitive-Advantage-with-Automated-Compensation-Data-and-Intelligence — integrations list
- https://www.capterra.com/p/10010961/OpenComp/ **[uncertain — not independently fetched]**
