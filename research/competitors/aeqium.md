# Aeqium — competitor deep-dive (2026-06-11)

## Snapshot — positioning, target user, status, pricing

- **What it is:** AI-first compensation planning platform. 2026 positioning: *"The only AI built to execute compensation planning"* — comp cycles, salary bands, executive analytics "done in plain language, instantly" (https://www.aeqium.com/, fetched 2026-06-11). Earlier positioning was "flexible, no-code comp cycle management" — the AI-agent framing ("Aeqium Assist" / "Aeqium Analyst") is the 2025–26 pivot (https://www.aeqium.com/product/agentic-compensation-planning).
- **Company:** San Francisco; founded 2020 by Peter McKee (CEO, ex-Uber self-driving eng manager, MIT); ~15 employees; $5.81M seed (Dec 2022; Vestigo Ventures, Ridge Ventures, CoFound Partners, SHRM Labs) ([Crunchbase](https://www.crunchbase.com/organization/aeqium), [Tracxn](https://tracxn.com/d/companies/aeqium/__FEne5zvBKEnsnArzzRftoXc0WjQtOuXpOsRoDpefCgw)). Tiny team relative to its enterprise logos — Braze, IFS, Hopper, dbt Labs, NEXT Insurance, Warby Parker, WHOOP, Mixpanel, Klaviyo, Chime, Netgear, Redis, V2X, Front, Cedar (homepage + https://www.aeqium.com/plans).
- **Target user:** HR/Total Rewards teams at mid-market-to-enterprise companies, 200–6,000 employees; tech, insurance, and increasingly 10 verticalized industry pages (gov contractors, energy, construction…) ([SelectSoftware Reviews, 2026-01-28](https://www.selectsoftwarereviews.com/reviews/aeqium)).
- **Pricing (as of 2026-06-11):** Not disclosed. Modular: a "Compensation Management Foundations" base (cycles + bands + offer letters) plus paid **add-ons** — Compensation Analysis (alerts, "My Team" manager reporting, Pay Equity regression) and Communication (Employee Total Rewards Portal) (https://www.aeqium.com/plans). No free trial, but a **free fully-configured demo environment with your own data in <1 business day** (plans page; confirmed in the [Hopper case study](https://www.aeqium.com/customers/how-hopper-runs-hyper-efficient-compensation-cycles-that-close-faster-with-aeqium)). Customer-reported price anchor: *"It costs us less than half of what we were being charged by Pave"* (Joe Bast, Crisp — homepage). The Interactive Offer Letters product launched as a **free tier** in May 2022 ([Medium launch post](https://medium.com/aeqium/launching-our-free-product-for-interactive-offer-letters-2ffa8c1a41fc)).
- **Implementation:** "Technical implementation takes a few hours; onboarding 4–6 weeks" (FAQ on every product page, e.g. https://www.aeqium.com/product/compensation-cycle-management).
- **Review status:** G2 4.5–4.6★ on ~22–29 reviews ([G2](https://www.g2.com/products/aeqium/reviews), [SSR](https://www.selectsoftwarereviews.com/reviews/aeqium)) — coverage is thin; listed on [Gartner Peer Insights](https://www.gartner.com/reviews/market/compensation-management-software/vendor/aeqium/product/aeqium).

Tags below: **[R]** = relevant to Advisor Comp Studio (net-of-strike equity + token modeling, scenarios, tiers, guardrails, governance, printable Proposition); **[NR]** = not relevant.

## Complete feature inventory — by module

### 1. Compensation AI — "Aeqium Assist" + "Aeqium Analyst" — https://www.aeqium.com/product/agentic-compensation-planning
- **Aeqium Assist** [NR-mostly]: plain-English *agentic configuration* — "update eligibility rules, configure approval workflows, adjust permissions" and it applies live config changes in minutes, including last-minute mid-cycle ones.
- **Aeqium Analyst** [R as pattern]: plain-English Q&A over comp data ("average raises by department, equity distribution by tenure, budget utilization"), generating **full narrative reports** "with context, insights, and actionable recommendations" — not just charts. Spans current and historical cycles.
- FAQ claim: AI "configures cycles, builds compensation logic, manages bands, and surfaces analytics automatically."

### 2. Compensation Cycle Management — https://www.aeqium.com/product/compensation-cycle-management
- No-code cycle builder: merit matrices, **bonus formulas with proration and attainment calculations**, stock refreshes with "nuanced eligibility rules" [R — tier/eligibility logic].
- **Approval chains / reviewer chains** rolling recommendations up to designated decision-makers, configurable per org structure [R — maps to consents checklist] (https://www.aeqium.com/plans).
- **Budgets**: top-down or bottom-up; budget types, owners, **holdbacks**; allocations by region/function/currency; real-time utilization monitoring [R — pool-budget guardrails].
- **Controls & oversight**: per-manager progress tracking, budget guardrail enforcement, exception tracking, automated audits, "complete audit trails built automatically" [R — audit log] (https://www.aeqium.com/).
- Real-time dashboards + out-of-the-box visualizations + fully customizable reports (pay-for-performance, inconsistencies) [R].
- **Mid-cycle live recalc**: change a formula in the backend mid-cycle and updates "propagate immediately across the system" without restarting the cycle ([SSR review](https://www.selectsoftwarereviews.com/reviews/aeqium)) [R — engine-driven recompute].
- Guided step-by-step reviewer workflows; cycle duplication ("copy a new cycle, refresh employee data") [R-pattern]; automated end-of-cycle comp statements per employee [R — Proposition analogue]. Multi-currency throughout (plans page).

### 3. Compensation Bands — https://www.aeqium.com/product/compensation-bands
- Create/manage bands for **total comp: salary, equity, and bonus**; bands enforced across planning + offers [R — FAST tiers + compa-ratio guardrails].
- **Band analytics & visualization**: employee placement within band, headcount per band, headcount spend per band (plans page) [R].
- **Benchmark imports from unlimited sources** + use of *live offer data* to inform bands [R-partial — no native data].
- **Band history audit**: track how bands changed over time; fully audit employee pay history [R — audit log pattern].
- Role-based access controls on who sees which bands [R].

### 4. Compensation Insights — https://www.aeqium.com/product/compensation-insights
- Team comp history timeline; org-chart comp visualization [NR].
- **Automated alerts**: out-of-band employees, due-for-increase, **"upcoming drop in equity vesting"** (vesting-cliff retention alerts) [R — strong guardrail pattern] (plans page add-on).
- **Pay Equity add-on**: automated **regression-based analysis**, adjusted and non-adjusted gaps, macro summaries + individual breakdowns [NR for advisors, R as methodology cue].
- Live calibration and pay-equity reports built by AI, always current (page meta description) [NR].

### 5. Employee Portal / Total Rewards Statements — https://www.aeqium.com/product/employee-portal
- Personalized portal: cash, bonus, equity, benefits — current **and historical** in one place [R — total-package view].
- **Equity visualization and scenario modeling** for employees; configurable benefits display (plans page) [R — same primitive as our trajectory scenarios].
- **Staged transparency controls**: configure exactly which ranges (total cash, salary, equity) employees see, "share information as you're ready" [R — confidentiality tiers for the advisor-facing doc].
- "Help employees visualize company success" — upside framing visuals [R].

### 6. Interactive Offer Letters — https://www.aeqium.com/product/interactive-offer-letters
- Branded, interactive, personalized web offers (tokenized share URL: `app.aeqium.com/o/<id>`) showing salary, equity, bonuses, benefits as one visual package [R — the closest analogue to our Proposition doc].
- **Built-in equity offer simulator**: "help candidates understand the value of their equity under different scenarios"; candidates "play with the numbers themselves" — vesting visualization + value-over-time projection ([product page](https://www.aeqium.com/product/interactive-offer-letters); [free-tool launch post](https://www.aeqium.com/post/free-offer-letter-product)) [R — document in detail, see UI section].
- **Offer intelligence**: data-backed offers from benchmarks or **prior offer acceptance rates**; check offers fall within comp bands "to prevent salary compression" [R — guardrails at offer time].
- **Offer acceptance analytics** (accept/decline rates + influencing factors) and **integrated band visualization** of where offers land within bands (plans page) [R].
- Custom branding: colors, images, content blocks ([Medium post](https://medium.com/aeqium/launching-our-free-product-for-interactive-offer-letters-2ffa8c1a41fc)) [R].

### Platform-wide (plans page)
Unlimited integrations (HRIS/ATS/equity/performance/benchmarks); unlimited no-code customization (custom calculations, permissions, budgets); dedicated CSM; **SAML SSO** [R-infra].

## UI/UX documentation

**IA / navigation.** The app (per marketing screenshots and reviewer descriptions) is organized around: Cycles (dashboard + reviewer workspace), Bands, Insights/Reports, Offers, Employee Portal, and the AI chat surfaces (Assist/Analyst). The reviewer experience is a **guided, step-by-step workflow** ("Guided workflows lead your reviewers step-by-step, providing all the necessary information to make informed, data-driven decisions for each employee" — plans page). PeopleManagingPeople's screenshot captions confirm key screens: "compensation band management tool with salary ranges, equity bands, and benchmarking visuals", "employee compensation dashboard highlighting salary, equity, variable pay, and **vesting progress**", "custom report builder displaying salary increase analytics by department and location", and "cycle monitor view showing a **visual org chart of reviewers**" ([PMP review, updated 2026-02-03](https://peoplemanagingpeople.com/tools/aeqium-review/)).

**The offer page (deep detail).** Aeqium's interactive offer is a single scrolling, company-branded page (custom hero image/colors/copy) with three visual centerpieces, visible in the product screenshots (`total-conpensation.avif`, `offer-eq.avif`) and the free-tool launch screenshots:
- A **first-year total-compensation breakdown** — a donut/ring-style total-comp summary with a legend splitting base / signing bonus / target bonus / equity, plus a stacked "see how your total compensation stacks up" bar (PMP caption: "interactive offer letter view showing a breakdown of first-year total compensation").
- An **equity vesting + value chart**: "visualize and explain equity vesting and value" — a time-series projection of vest schedule and grant value ([launch post](https://www.aeqium.com/post/free-offer-letter-product)).
- A **candidate-driven scenario simulator**. Methodology is documented in McKee's essay ([An Open Tool to Understand Compensation](https://www.aeqium.com/post/an-open-tool-to-understand-compensation)): instead of asking candidates to guess exit valuation, ownership %, and dilution, the tool models **an annual growth rate applied to the last preferred price vs the option strike** — "hold periods and annual return rates are the language of venture capitalists." It deliberately focuses on **annualized** comp (not naive 4-year totals) and explicitly excludes taxes. The public calculator is parameterized via URL query string (`/offer_analysis?s=120000&sb=50000&ab=25000&sc=6000&st=option&sp=0.99&pp=6` — salary, signing bonus, annual bonus, stock comp, stock type, strike, preferred price), i.e., the whole scenario state is shareable as a link. Note: it values options against strike (an implicit net-of-strike framing), but marketing screenshots of paid offers show grant value without prominent strike-netting disclaimers — our always-net-of-strike rule is stricter.
- A public demo offer exists at `app.aeqium.com/o/xOJP37QHRfGAGoL0PgMVGA` (JS-only; not fetchable as static HTML — same for the [Navattic tour](https://aeqium.navattic.com/0427v0tnr)).

**Cycle screens.** Cycle dashboard = progress tracker (who's completed, reminders in-app), budget utilization meters, and report panels; Hopper: "Real-time visibility to see where people are completed or not completed… We can easily check the dashboard for progress and send reminders" ([Hopper case study](https://www.aeqium.com/customers/how-hopper-runs-hyper-efficient-compensation-cycles-that-close-faster-with-aeqium)). Braze: "Managers can easily create their own views… it's all kind of becoming a one-stop shop" ([Braze case study](https://www.aeqium.com/customers/how-braze-guides-managers-to-data-backed-compensation-recommendations)).

**Charts & interactions.** Recurring chart vocabulary across screenshots: horizontal **band bars with employee placement dots** and benchmark overlays; stacked bars/donuts for total-comp mix; line/area charts for comp history and equity value projection; org-chart node views; alert list cards ("out of band", "vesting drop"). The AI surfaces are chat-panel + generated-report layouts (Nov 2025 screenshots on the AI page).

**Visual tone & review evidence.** Clean, light SaaS aesthetic, card-based, generous whitespace. Reviewers consistently emphasize ease: "The platform is super intuitive both as an Admin as well as for frontline managers" ([G2 via search](https://www.g2.com/products/aeqium/reviews)); "Our CTO says it's one of the easiest systems he's ever used, especially for HR tools" (NEXT Insurance, homepage); Braze managers: "The process is really self-explanatory", "It's my source of truth for anything comp related" (Braze case study).

## Known criticisms & limitations (review-sourced; coverage is thin — ~22–29 G2 reviews)

- **No built-in benchmarking data** — you must import Radford/Pave/Comptryx etc. yourself ([PMP](https://peoplemanagingpeople.com/tools/aeqium-review/), [SSR](https://www.selectsoftwarereviews.com/reviews/aeqium)).
- **No automated payroll sync** — approved changes are exported and uploaded to payroll manually; sync "on the roadmap" (PMP, SSR).
- **Early-product feel**: "the tool still feels early in development, as bugs occur now and then and not all the features requested have been added yet" ([G2 review via search](https://www.g2.com/products/aeqium/reviews)).
- **Multi-country band management is cumbersome** — "multiple sources of truth regarding salary bands" creates redundant maintenance (G2 via search).
- Requested improvements: reporting/budgeting adjustments; ability to set **by formula** how annual salary is calculated (G2 via search); "may lack certain advanced features for larger organizations" (G2 summary).
- ATS integration depth and onboarding hiccups noted as minor cons (SSR).

## Data, benchmarks & methodology

- **BYO-benchmark model**: unlimited benchmark-source imports + your own live offer data as an internal benchmark; no proprietary survey dataset (plans page; PMP). This is the inverse of Pave's data-network play.
- **Equity valuation methodology** (free tools/offer simulator): annual-growth-rate-on-preferred-price model, anchored on strike vs last preferred price, with linked VC-return/hold-period benchmarks; explicitly avoids FDV/dilution guessing and tax modeling ([methodology post](https://www.aeqium.com/post/an-open-tool-to-understand-compensation)).
- **Pay equity**: regression-based, adjusted + unadjusted gaps (plans page).
- **Research content**: 2025 Compensation Planning Trends Report (survey of 300 HR leaders) (https://www.aeqium.com/2025-compensation-trends-report); State of Compensation Reviews 2024 (https://www.aeqium.com/resources/state-of-compensation-review-management-2024).
- **Outcome metrics they publish**: Braze/Hopper — 50% faster cycles, 90% fewer errors, 92% manager satisfaction; Klaviyo — 90% reduction in cycle admin; IFS — 750 spreadsheets eliminated; Chime — 98% manager satisfaction (homepage FAQ + case studies).

## Integrations & security/compliance

- **HRIS**: Workday, BambooHR ([marketplace listing](https://www.bamboohr.com/integrations/listings/aeqium)), Gusto, Rippling, ADP Workforce Now/Run, Justworks, Paylocity, TriNet, Zenefits, Namely, UKG Pro, Sequoia One, QuickBooks ([GetApp](https://www.getapp.com/hr-employee-management-software/a/aeqium/); [Aeqium integrations post](https://www.aeqium.com/post/compensation-management-software-integrations-adp-workday-sap)).
- **Equity systems**: Carta, Shareworks (+ Startup Edition), Pulley, E*TRADE Equity Edge (GetApp) — notable: first-class equity-system ingestion is core to their total-comp story [R].
- **ATS**: Greenhouse, Lever. Plus CSV upload from any source; custom integrations on request (FAQ).
- **Security**: AICPA **SOC 2 Type 2** certified; GDPR-compliant; regular external audits + penetration tests; published **vulnerability disclosure policy with safe harbor** (security@aeqium.com); SAML SSO on all plans; public status page (https://www.aeqium.com/legal/security; https://aeqium.statuspage.io/).

## Patterns worth borrowing for Advisor Comp Studio

1. **URL-parameterized scenario state** — their calculator encodes the entire comp scenario in the query string (`?s=…&st=option&sp=…`). Encode an advisor Proposition's scenario set in a shareable (internal) URL/hash for instant reproduction in review meetings.
2. **Growth-rate slider as the scenario dial** — let the advisor-facing simulator expose *one* intuitive dial (annualized growth on last-round price) alongside our Conservative/Base/Aggressive presets, rather than asking readers to reason about FDV and dilution directly. Keep strike-netting always visible (they don't).
3. **Band bar with placement dot + offer overlay** — render each advisor's proposed grant as a dot on its FAST-tier band bar, with compa-ratio guardrail zones shaded; Aeqium uses exactly this to "prevent salary compression" at offer time.
4. **Proactive alert cards** ("out of band", "upcoming drop in equity vesting") — turn our guardrails from passive validation into an alerts panel on the dashboard: tier breach, missing consent, vesting cliff approaching, stale valuation.
5. **Band/figure history audit timeline** — a per-grant "how this number changed over time" view; pairs naturally with our audit log and the discussion-draft framing.
6. **Staged transparency controls** — explicit per-document toggles for what the advisor-facing Proposition reveals (ranges vs point values, token FDV scenarios), mirroring their "share information as you're ready" rollout model.
7. **First-year/annualized framing** — their insight that 4-year totals mislead; show advisors annualized value per scenario year (we already do trajectory walks — surface an "annualized" toggle).
8. **One-click cycle duplication** — "copy last cycle, refresh data" as the template for re-running an advisor's annual review with the new cap-table state.

## Sources

**[primary] — vendor**
- https://www.aeqium.com/ (homepage, positioning, testimonials, FAQ)
- https://www.aeqium.com/product/agentic-compensation-planning (AI module)
- https://www.aeqium.com/product/compensation-cycle-management
- https://www.aeqium.com/product/compensation-bands
- https://www.aeqium.com/product/compensation-insights
- https://www.aeqium.com/product/employee-portal
- https://www.aeqium.com/product/interactive-offer-letters
- https://www.aeqium.com/plans (feature matrix, add-ons)
- https://www.aeqium.com/legal/security (SOC 2, VDP)
- https://www.aeqium.com/customers/how-braze-guides-managers-to-data-backed-compensation-recommendations
- https://www.aeqium.com/customers/how-hopper-runs-hyper-efficient-compensation-cycles-that-close-faster-with-aeqium
- https://www.aeqium.com/post/free-offer-letter-product + https://medium.com/aeqium/launching-our-free-product-for-interactive-offer-letters-2ffa8c1a41fc (offer-letter launch)
- https://www.aeqium.com/post/an-open-tool-to-understand-compensation (equity methodology)
- https://www.aeqium.com/post/compensation-management-software-integrations-adp-workday-sap
- https://aeqium.navattic.com/0427v0tnr (interactive tour — JS-only, not statically fetchable) [uncertain]
- https://app.aeqium.com/o/xOJP37QHRfGAGoL0PgMVGA (public demo offer — JS-only) [uncertain]
- https://aeqium.statuspage.io/

**[review]**
- https://www.g2.com/products/aeqium/reviews (quotes obtained via search snippets; page not directly fetched) [uncertain on exact counts]
- https://peoplemanagingpeople.com/tools/aeqium-review/ (updated 2026-02-03)
- https://www.selectsoftwarereviews.com/reviews/aeqium (updated 2026-01-28)
- https://www.gartner.com/reviews/market/compensation-management-software/vendor/aeqium/product/aeqium

**[secondary]**
- https://www.crunchbase.com/organization/aeqium (funding, founding) 
- https://tracxn.com/d/companies/aeqium/__FEne5zvBKEnsnArzzRftoXc0WjQtOuXpOsRoDpefCgw (seed details)
- https://www.getapp.com/hr-employee-management-software/a/aeqium/ (integration list)
- https://www.bamboohr.com/integrations/listings/aeqium
- https://www.softwareadvice.com/hr/aeqium-profile/
