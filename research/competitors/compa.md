# Compa — competitor deep-dive (2026-06-11)

## Snapshot — positioning, target user, status, pricing

- **What it is:** "AI for Enterprise Compensation Teams" — a compensation-intelligence platform combining a live offer/employee/stock market-data network with two AI agents (Analyst, Partner) that "think like your comp team" (https://www.compa.ai/, 2026-06-11).
- **Origin:** Founded 2020 by Charlie Franklin (ex-Mercer/Juniper/Workday comp), Joe Malandruccolo, Taylor Cone; emerged from stealth Aug 2021 with $3.9M seed as a recruiter-facing **"deal desk" offer-management tool** (https://techcrunch.com/2024/01/29/compa-real-time-compensation-data/). Pivoted to offers-based market data with Compa Index launch May 2023 (https://www.businesswire.com/news/home/20230517005024/en/Compa-Launches-the-First-Offers-based-Market-Data-Platform-For-Leading-Tech-Companies).
- **Funding status:** $10M Series A Jan 2024 (Storm Ventures; 10x revenue growth and 793% data-network growth in 2023 — TechCrunch above); **$35M Series B Jan 26, 2026** led by Jump Capital, with Crosslink, Storm, Permanent Capital, HR Tech Investments LLC (Indeed affiliate), PagsGroup (https://www.compa.ai/blog/compa-raises-35m-series-b-to-accelerate-ai-for-enterprise-compensation).
- **Target user:** enterprise total-rewards/compensation teams and their recruiter stakeholders. "Compa is currently available exclusively for enterprise companies" (https://www.compa.ai/how-it-works/data-matching). Named customers/quoted logos: **Workday, NVIDIA, Micron, Autodesk, SiFive, OpenAI** (Series B PR), plus **Airbnb, Stripe, Instacart, Block, DoorDash, Marvell** (TechCrunch Jan 2024), **Celonis** (June 2026 webinar, compa.ai/events), an anonymous "Magnificent 7" comp leader and a "Fortune 50" VP of Compensation (homepage testimonials).
- **Pricing (exactly what is public):** a real pricing page exists — rare for this category. **Market Data: "Starting at $35,000/year"** with Employees data included and Offers/Stock/Frontline/Skills as add-ons; **Agents: "Starting at Contact Sales"**; "Multi-year discounts and pilot pricing available by request" (https://www.compa.ai/pricing, 2026-06-11). No per-seat figures, tier matrix, or agent pricing published.
- **Scale claims:** "9M+ observations in 50+ countries" across tech, health, retail, finance, professional services, manufacturing (homepage); "1.5M+ Verified Offer Records from Market-Leading Enterprises" (https://www.compa.ai/offers).

## Complete feature inventory — by module

**AI Agents**
- **Analyst Agent** [NR — chat analytics over a data network; Comp Studio is a deterministic engine] — internal-facing agent for comp teams: prompt → "exec-ready" market analysis in seconds; benchmarks, tracks market movement across roles/levels/geos. https://www.compa.ai/analyst-agent
- **Partner Agent** [R — this is the offer-desk pattern] — recruiter-facing agent that "applies your compensation philosophy, ranges, and policies": pre-sourcing target ranges; instant in-policy answers on geo rules, incentive plans, equity programs; drafts offers, hiring briefs, talking points; **"Approve in-policy offers and flag exceptions for review. Every decision is documented, transparent"**; comp team tracks "prompts, recommendations, approvals, and spend." https://www.compa.ai/partner-agent
- **Evals** [NR] — dashboard to "measure AI performance in seconds"; supports the "accurate, cited, and traceable" answer guarantee. https://www.compa.ai/evals

**Live Market Data (the Compa Index network)**
- **Offers** [R — closest analogue to scenario-priced offers] — near real-time offer benchmarks from customer ATSs; trend discovery, compare, acceptance/decline-rate analytics, policy enforcement & spend control. Tabs on page: Discover Trends / Compare / Analyze / Track. https://www.compa.ai/offers
- **Employees** [NR] — live employee cash-comp benchmarks from HCM connections. https://www.compa.ai/employees
- **Stock** [R — grant-level equity data is conceptually adjacent to option/token modeling] — "grant-level market data streamed from Compa's secure customer network" via stock-admin integrations. https://www.compa.ai/stock
- **Skills** [NR] — custom jobs for hard-to-match roles; skill-based pay variance filters (e.g., AI-engineer premium, once cited at ~240% stock premium over standard SWE — TechCrunch). https://www.compa.ai/skills
- **Frontline** [NR] — hourly pay by zip code for retailers (launched via PR on businesswire newsroom). https://www.compa.ai/frontline
- **Research / Market Briefs** [NR] — published index-style trend reports (leveling distribution index, external-vs-internal pay gap). https://www.compa.ai/research

**Platform / How-it-works**
- **Data & Matching** [R — methodology patterns] — give-to-get network, bi-weekly refresh, canonical job architecture, one-click match confirmation. https://www.compa.ai/how-it-works/data-matching
- **Privacy & Security** [R — confidentiality posture] — SOC 2 Type II, GDPR/CCPA, 2FA + SSO, no PII, data minimums/privacy blockers; public trust center. https://www.compa.ai/how-it-works/privacy-security, https://trust.compa.ai/
- **Use Cases / Peer Proof / Custom Role Analysis** [NR] — prompt library, social proof, bespoke role pricing. https://www.compa.ai/use-cases, https://www.compa.ai/peer-proof, https://www.compa.ai/custom-role-analysis
- **Pricing-page "included features"** [R as naming reference]: Peer Groups, Geo Tiers, Location Insights, Leveling Insights, Research. https://www.compa.ai/pricing

## UI/UX documentation

- **IA/navigation:** marketing nav splits Products into *Agents* (Analyst, Partner), *Live Market Data* (Offers, Employees, Stock, Skills, Frontline), and *How It Works* (Data & Matching, Privacy & Security, Evals). The actual app lives at a separate domain (`compaoffers.com/login`) — no public sandbox, so app-UI evidence is limited to vendor screenshots/animations.
- **Key screens (from product-page imagery):**
  - *Offers* shows a trend-line dashboard ("Spot market shifts before the business feels them"), a comparison view for TA-vs-comp alignment, and an acceptance/decline-rate tracker used to "adjust comp bands with confidence" — i.e., charts segmented by tabbed intents **Discover Trends / Compare / Analyze / Track** (https://www.compa.ai/offers).
  - *Partner Agent* is a chat-plus-cards surface organized by tabs **Your Rules / Recruiter / Offers / Market Data**: a rules console where comp "set[s] policies once," a recruiter Q&A thread, an offer-draft view, and an approvals view that flags out-of-policy exceptions (https://www.compa.ai/partner-agent).
  - *Data & Matching* shows a job-match table where customers "Confirm or change matches with one click," and a market summary table — Figure 04 of the methodology post is literally "See how your data stacks up against the market," a per-job row table of your comp vs network percentiles (https://www.compa.ai/blog/how-compa-levels-and-matches-thousands-of-offers-from-the-best-tech-companies).
- **Forms/wizards:** onboarding is human-assisted, not wizard-driven — survey-key upload + questionnaire, then a validation review meeting ("Did we get it right?") (same blog post).
- **Visual tone:** dark, pattern-heavy enterprise-AI aesthetic (Webflow site, looping product videos); in-app shots show clean light tables/line charts "purpose-built for savvy comp professionals" (https://www.compa.ai/how-it-works/data-matching).
- **Quoted demo evidence:** "Analyst Agent feels effortless; drop in a prompt, get a sharp starting point, and refine from there" — Cindy Yogiaman, Workday (homepage). "I use Compa more than survey data." — Ann McDaniel, SiFive (homepage).

## Known criticisms & limitations (review coverage is thin)

- **No substantive third-party review base.** There is no genuine Compa listing with reviews on G2 — searches surface "Comp AI" (an unrelated compliance-automation vendor, https://www.g2.com/products/comp-ai/reviews). All testimonials are vendor-curated. Treat satisfaction claims as unverified. [uncertain]
- **Competitor-sourced critique (Ravio, a rival, so biased):** Compa is "an offers-based tool… useful for understanding what the market is actively paying right now" but offers **no compensation-management tooling** (bands, pay-equity, comp-review workflows) and is best as a **supplement to surveys**, suited to "US enterprises in tech, life sciences, and retail" (https://ravio.com/blog/the-best-tools-for-salary-benchmarking).
- **Self-acknowledged data scoping:** dataset historically covered only Professional & Management levels, "excludes Support and Executive… because it tells the best story"; level "collapsing" is applied where granularity is weak (https://www.compa.ai/blog/how-compa-levels-and-matches-thousands-of-offers-from-the-best-tech-companies).
- **Enterprise-only gate:** explicitly unavailable below enterprise scale (https://www.compa.ai/how-it-works/data-matching); $35k/yr floor (https://www.compa.ai/pricing).
- **Structural caveat:** a give-to-get network's benchmark quality depends on network composition — offers data skews to companies actively hiring, an inherent bias the vendor frames as a feature ("upstream pay signal").

## Data, benchmarks & methodology (their core asset)

- **Sourcing:** automated, "submissionless" pulls from customers' **ATS** (offers), **HCM** (employee cash comp), and **stock-admin** systems (grant-level equity), under a **give-to-get** model — your data feeds the network; you receive aggregated insights back. Refreshed **bi-weekly** (https://www.compa.ai/how-it-works/data-matching).
- **Scale:** 9M+ observations, 50+ countries (AMER/EMEA/APAC), thousands of new observations monthly; 1.5M+ verified offer records (homepage; /offers).
- **Why offers:** offers are "fundamentally real-time: an upstream pay signal and live buyer–seller transaction," vs survey data that can be ~a year old; rich metadata: **volume, acceptance rate, location variance, prevalence, average spend** (https://www.compa.ai/blog/how-compa-levels-and-matches-thousands-of-offers-from-the-best-tech-companies).
- **Leveling/matching pipeline (the moat):** (1) a **canonical career architecture** (job, level, career stream, location) aligned to the customer's via survey keys, offer letters, internal docs; (2) **data validation** — ATS treated "as a map," outlier detection, level collapsing where differentiation is weak; (3) a **part-AI, part-human matching engine** reviewed with the customer ("Did we get it right?"), with one-click match confirm/override; onboarding in ~1 month vs months-long survey cycles (same post). Scope deliberately narrowed to the "five or six pay elements" present at time-of-offer.
- **Privacy engineering on the data product:** "No PII. Ever. Plus, data minimums, privacy blockers, and smart filters" to prevent re-identification of individual offers (https://www.compa.ai/how-it-works/data-matching).
- **WTW partnership (announced Sept 8, 2025):** pairs Compa's real-time offer data with WTW's validated global survey benchmarks — "a complete and defensible view of market pay"; positioning quote: "Compensation teams are no longer choosing between published compensation surveys or real-time data—they need both" (Erica Johnson, WTW) (https://www.businesswire.com/news/home/20250908145108/en/...; https://www.wtwco.com/en-us/news/2025/09/compa-and-wtw-announce-a-partnership-to-provide-compensation-intelligence-for-enterprise-comp-teams). A parallel **BetterComp** partnership embeds Compa offer data beside survey benchmarks in BetterComp's market-pricing platform (https://finance.yahoo.com/news/bettercomp-partners-compa-combine-offer-140000075.html).
- **AI trust layer:** "Built-in safeguards keep every answer accurate, cited, and traceable so comp teams understand how responses were created" (homepage); Evals product quantifies agent accuracy (https://www.compa.ai/evals).

## Integrations & security/compliance

- **Integrations:** Workday (Certified integration, listed in Workday Marketplace — businesswire newsroom item "Compa Completes Workday Certified Integration"; also "Compa's real-time data network is now live in Workday HCM," compa.ai/blog), Oracle, Greenhouse (ATS), Carta and E*TRADE (stock admin) (homepage "Enterprise Infrastructure" section). Data partnerships: WTW, BetterComp (above).
- **Security/compliance:** SOC 2 Type II certified; CCPA and GDPR compliant; 2FA and SSO required; access controls limiting customer-data exposure; public trust center at https://trust.compa.ai/ (homepage; https://www.compa.ai/how-it-works/privacy-security).

## Patterns worth borrowing for Advisor Comp Studio

1. **In-policy vs exception flow.** Partner Agent auto-approves in-policy offers and flags exceptions, with "every decision documented, transparent" — exactly the shape for compa-ratio guardrails: green-path proposals inside tier bands; out-of-band grants forced through an explicit, logged exception state on the governance checklist (https://www.compa.ai/partner-agent).
2. **Decision audit trail as a first-class view.** Compa tracks "prompts, recommendations, approvals, and spend" so comp knows "where money moves and where risk hides" — model the Comp Studio audit log as a queryable timeline of recommendation → override → approval, not just an append-only list (same URL).
3. **"Cited and traceable" figures.** Every agent answer carries citations/traceability — port this as per-figure provenance in the Proposition doc (each number footnoted to engine input: FDV scenario, strike, pool assumption).
4. **One-click confirm/override on matches.** Their matching engine proposes, the human confirms or changes "with one click" — same mechanic for FAST-tier assignment: engine suggests tier from inputs, user confirms or overrides, and the override is logged (https://www.compa.ai/how-it-works/data-matching).
5. **Freshness stamping.** "Refreshed bi-weekly" is surfaced as a trust feature — stamp every scenario table and the printable Proposition with an "as-of" data/assumptions date so stale drafts are self-evident (same URL).
6. **"Your data vs market" delta table.** The Figure-04 summary table (your comp vs network, per job/level) is a compact compa-ratio panel — adapt as advisor grant vs tier-band midpoint, with deviation coloring (https://www.compa.ai/blog/how-compa-levels-and-matches-thousands-of-offers-from-the-best-tech-companies).
7. **Intent-tabbed dashboards.** Offers' Discover Trends / Compare / Analyze / Track tabs split one dataset by user intent rather than by chart type — useful pattern for the scenario walker (Overview / Compare scenarios / Trajectory / Governance) (https://www.compa.ai/offers).
8. **Outcome feedback loop.** They track offer acceptance/decline rates to recalibrate bands — Comp Studio could log advisor accept/counter outcomes per tier to pressure-test value-band anchors over time (https://www.compa.ai/offers).

## Sources

- https://www.compa.ai/ — [primary] homepage, agents, data network, security, testimonials
- https://www.compa.ai/pricing — [primary] public pricing ($35k floor, agents quote-only)
- https://www.compa.ai/offers — [primary] Offers product + 1.5M offer records
- https://www.compa.ai/partner-agent — [primary] offer-desk/guardrail UI
- https://www.compa.ai/analyst-agent — [primary] Analyst Agent
- https://www.compa.ai/how-it-works/data-matching — [primary] give-to-get, bi-weekly refresh, privacy
- https://www.compa.ai/how-it-works/privacy-security — [primary] SOC 2 / GDPR / SSO
- https://www.compa.ai/evals — [primary] AI evals
- https://www.compa.ai/blog/how-compa-levels-and-matches-thousands-of-offers-from-the-best-tech-companies — [primary] methodology deep-dive
- https://www.compa.ai/blog/compa-raises-35m-series-b-to-accelerate-ai-for-enterprise-compensation — [primary] Series B, OpenAI quote
- https://www.businesswire.com/news/home/20250908145108/en/Compa-and-WTW-Announce-a-Partnership-to-Provide-Compensation-Intelligence-for-Enterprise-Comp-Teams — [primary] WTW partnership
- https://www.wtwco.com/en-us/news/2025/09/compa-and-wtw-announce-a-partnership-to-provide-compensation-intelligence-for-enterprise-comp-teams — [primary] WTW side of announcement
- https://www.businesswire.com/news/home/20230517005024/en/Compa-Launches-the-First-Offers-based-Market-Data-Platform-For-Leading-Tech-Companies — [primary] Compa Index launch
- https://finance.yahoo.com/news/bettercomp-partners-compa-combine-offer-140000075.html — [secondary] BetterComp partnership
- https://techcrunch.com/2024/01/29/compa-real-time-compensation-data/ — [secondary] Series A, customer logos, deal-desk origin
- https://ravio.com/blog/the-best-tools-for-salary-benchmarking — [review] competitor-authored assessment (biased)
- https://www.g2.com/products/comp-ai/reviews — [review][uncertain] different company ("Comp AI", compliance automation); cited only as evidence Compa lacks a G2 review base
- https://trust.compa.ai/ — [primary] trust center
- https://compapeergroup.substack.com/p/introducing-compas-complete-market — [primary] founder newsletter on platform launch
