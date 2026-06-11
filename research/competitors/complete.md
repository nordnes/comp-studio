# Complete — competitor deep-dive (2026-06-11)

Tags: **[R]** = relevant to Advisor Comp Studio (equity/token comp modeling net-of-strike, scenario walks, tiers, guardrails, governance, printable advisor Proposition). **[NR]** = not relevant.

## Snapshot — positioning, target user, status/funding, pricing

- **What it is:** "Complete helps companies design, manage, and communicate compensation with clarity — from offers and leveling to planning and total rewards" (site meta description, fetched 2026-06-11). Current hero: "AI Native Compensation Without the Complication" under a "NEW: COMPY AGENT" banner (https://www.complete.so/).
- **Origin & target user:** YC W22 startup founded 2021 by Rani Mavram (ex-Google product) and CTO Zack Field (ex-Uber/Opendoor). Aimed at startups/scale-ups — "gracefully scale from 30 employees to 10,000+" (G2 product blurb). Buyer personas have their own solution pages: CPOs/Total Rewards leaders, CFOs, CEOs, CXOs (https://www.complete.so/for-ceos etc.).
- **Funding/status:** $4M seed led by Accel + Y Combinator + angels from Calm, Opendoor, Stripe, announced 2022-08-22 (TechCrunch: https://techcrunch.com/2022/08/22/complete-startups-compensation-salary-benefits-tech-employee-equity-strategy-hiring-retention-philosophy-y-combinator/). Tracxn lists ~$4.5M total over 2 rounds; **no Series A found as of 2026-06-11** (searched explicitly) — still seed-stage. GetLatka (secondary, [uncertain]) claims ~$2.3M ARR in 2024 (https://getlatka.com/companies/complete.so).
- **Customers:** Vercel, DataStax, Grindr, Glean, Clerk, Sardine, Notable, Hadrian, Hummingbird, Linear, TrueNorth (homepage logo wall + case studies, https://www.complete.so/customers).
- **Pricing:** Not published anywhere on the site — demo-gated ("Request a demo" is the only CTA on every page). G2 has a gated "pricing details" section; no public per-employee figure found ([uncertain]; industry norm for this category is ~$5–10/employee/mo per Capterra buyer data, https://www.capterra.com/compensation-management-software/). The Compensation Philosophy Builder (https://app.complete.so/philosophy) is the only free/public tool found.
- **Reviews:** G2 5.0/5 across 14 reviews (https://www.g2.com/products/complete/reviews); the homepage itself displays "Excellent 4.7 out of 5" (likely a different/aggregate widget — minor discrepancy worth noting). Nine G2 Winter-2024 badges shown on the homepage (Best Est. ROI, Easiest Setup, Fastest Implementation, etc.).

## Complete feature inventory — by module

### 1. AI Agents / "Compy" + Team Intelligence — https://www.complete.so/team-intelligence
- **Cycle Prep Agent** [R — pre-computed review-cadence prep]: "syncs your employee data, proactively flags retention risks, identifies pay equity gaps, and pre-populates recommendations based on performance ratings, comp ratios, and your merit matrix" (homepage).
- **Offer Agent** [R — auto-assembled Proposition]: "pulls candidate data from your ATS, matches it to your salary bands and benchmarks, and assembles a personalized interactive offer… Recruiters review and send."
- **Band Builder Agent** [R — tier/band generation]: "synthesizing benchmark data, modeling progression curves, and surfacing draft bands for your review, with business impact summarized for you."
- **Total Rewards Analysis agent** [R]: "generates personalized compensation statements for every employee… clear, visual total rewards story."
- Team Intelligence page adds: unified comp snapshot "cash, equity, and variable pay—all in one place," AI alerts ("catch sharp drop-offs for top performers"), pay-equity analytics, "context-aware chatbots," equity grant modeling, admin comments, shareable intelligence dashboards. Feature chips: Real-time employee data · Custom tags · AI-enabled alerts · Automated rules · Shareable intelligence dashboards · Equity grant modeling · Admin comments · In-app chat and agentic functionality.

### 2. Team Leveling & Bands — https://www.complete.so/leveling  (flagged module)
- Headline: "Skip the guesswork on understanding levels — Recommended levels allow you to create tiers, location-specific tiers, and job bands for the whole team to internalize." [R — direct analogue of FAST advisor tiers]
- "Build a shared understanding of levels" (recruiter/manager alignment) [R].
- "Visualize your workforce… Track and understand team positions at a glance" [R — roster-over-bands view].
- "Set custom permissions for sharing — Tailor who sees what, from leadership down to individual managers… controlling the visibility of levels and progression paths" [R — governance/visibility scope].
- Eight feature chips, each an icon card: **Level descriptions · Comp band visualization · Table overview · Benchmark imports · Real time insights · Dynamic sharing · Drafting capability · Compensation analytics** [R — esp. drafting + band viz].
- **No public/free leveling tool found.** The user-flagged hypothesis of a free leveling product did not verify: the page is marketing-only with demo-gated product; the only free public tool is the Philosophy Builder ([uncertain] whether a free leveling tier exists behind login).

### 3. Interactive Offers — https://www.complete.so/offers
- "World-class offer portal for candidates… fully customized to your company"; candidates "visualize their long-term value across equity, benefits, salary, equity refreshes" [R — the advisor-facing Proposition analogue].
- Eight candidate-portal blocks (icon cards): **Powerful analytics** (offer-view tracking; a G2 CEO reviewer: "I used the analytics to monitor the most competitive candidates") · **Team profiles** · **Educational modules** · **Custom notes** · **Dilution and funding** · **Options vs RSUs** · **Benefits modeling** · **Company milestones** [R — dilution/funding education and options explainers map 1:1 to net-of-strike + DilutionPath education].
- Band guardrails at offer time [R]: "Adhere to your predefined compensation ranges for base salary, equity, and variable pay to avoid unnecessary approval cycles. Make sure the candidate's initial compensation leaves room for future growth within their role." — i.e., compa-ratio-style headroom logic.
- ATS integration (Greenhouse, Ashby, Lever, JazzHR, Workday…) [NR].
- Personalization: animated welcome from a real person (the "Rani welcoming a candidate" GIF) [R — humanizing a confidential document].

### 4. Planning & Budgeting — https://www.complete.so/planning-budgeting
- "Run configurable and spreadsheet-free compensation cycles"; "Model different scenarios before committing to your budget, built-in approval chains, and planner education" (homepage) [R — scenario sets + consents/approvals].
- Feature chips: Real-time employee data · Custom tags · Automated reminders · **Automated rules** · **Shareable dashboards** · **Scenario planning** · Team sharing · In-app reminders [R — automated rules ≈ guardrails engine].
- "Real-time plan tracking & progress… accepted candidates, employees, anniversaries, adjustments" [partially R — review cadence].

### 5. Total Rewards / Employee Rewards — https://www.complete.so/employee-rewards
- Per-employee statement portal: "transparent, all-inclusive view of their compensation—salary, equity, benefits, and long-term growth paths" [R — recurring advisor statement idea].
- "Say goodbye to PDF mail merges!… without creating or emailing thousands of PDFs. Just share when you're ready!" [R — share-link vs printable doc tradeoff].
- Feature chips: User engagement · **Employee authentication** · **Equity education** · **Equity visualization** · Benefits tracker · **Long-term value modeling** · Org chart access · **Preview as employee** [R — preview-as-recipient is directly borrowable].

### 6. Integrations — https://www.complete.so/integrations
- "100+ HRIS, ATS, and equity integrations"; categories: Applicant Tracking Systems, HRIS, **Cap Table Managers (Carta, Pulley)**, eSign (DocuSign, Dropbox Sign), Performance Management "Coming Soon" [R — cap-table + eSign chain mirrors the consents checklist].

### 7. Free/public resources
- **Compensation Philosophy Builder** (free tool, https://www.complete.so/compensation-philosophy-builder-3 → https://app.complete.so/philosophy): "document your compensation philosophy and share it with your team" [R — philosophy-as-shareable-artifact].
- **The Handbook** (https://handbook.complete.so): founder's / manager's / startup-employee's guides to compensation [R as domain copy reference]. Webinars + blog + case studies [NR].

## UI/UX documentation

- **Marketing IA/navigation:** top nav = Product (AI-Agents, Team Leveling, Planning, Total Rewards, Interactive Offers) · Solutions (by persona: CPO/Total Rewards, CFO, CEO, CXO) · Integrations · Company · Resources; persistent "Request a Demo" + "Log In" (app.complete.so). Product pages all follow one template: hero claim → alternating image/claim sections → an 8-chip "feature icon grid" → demo CTA. The 8-chip grid is their signature scannable inventory pattern (seen on /leveling, /offers, /employee-rewards, /planning-budgeting, /team-intelligence).
- **Candidate offer page, block by block** (from /offers copy, product screenshots, and G2 evidence): (1) personalized welcome — name, brand, often a founder welcome GIF/video ("Gif of Rani welcoming a candidate," image alt text); (2) total-comp summary "from equity, benefits, salary, bonuses"; (3) long-term value chart — "visualize their long-term value across equity, benefits, salary, equity refreshes"; a G2 reviewer: "much better than verbally articulating the offer than showing the stock projections using the Complete tool"; (4) educational blocks — Dilution & funding, Options vs RSUs explainers; (5) Benefits modeling; (6) Company milestones / business goals ("Walk through business goals, customers, and more to pull back the curtain"); (7) Team profiles ("who you are working with"); (8) Custom notes; with admin-side view analytics. G2: "On the offer side, we had same day acceptances from the clarity of the presentation."
- **Leveling matrix UI** (from /leveling screenshots + chips): a left-rail leveled **table overview** (rows = levels e.g. L3/L4/L5 per job family, columns = level descriptions/expectations), toggled with a **comp band visualization** — horizontal band bars per level with employee dots plotted against band min/mid/max ("visualize employees alongside critical compensation data — all in one place"); **benchmark imports** overlay market data on bands; **drafting capability** (pencil icon) = staged edits before publishing; **dynamic sharing/custom permissions** = per-audience visibility of levels and progression paths. Location-specific tiers are first-class ("create tiers, location-specific tiers, and job bands").
- **Charts & interactions:** stacked-bar/area long-term comp projections over years (offer portal), band-vs-employee scatter/band bars (leveling), dashboards with filters/alerts (planning, intelligence), org chart access (rewards). Interaction verbs across the site: model, preview, draft, share, flag, approve.
- **Visual tone:** design-led, friendly SaaS — rounded cards, pastel illustration chips, candidate-facing pages fully white-labeled "to match our startup's brand and values" (G2). Marketing leans warm/human ("Career progression should be celebrated, not overwhelming"). Notably, two pages currently leak a Webflow placeholder banner ("Write whatever you'd like here") — even polished design-led vendors ship rough edges.
- **Forms/wizards:** demo-gated app, so limited evidence; the Philosophy Builder is a guided questionnaire-style builder producing a shareable philosophy doc; G2 mentions "a lot of great templates that made it easy for the whole team… to get started really quickly" and "built-in approval chains."

## Known criticisms & limitations

Coverage is **thin**: only 14 G2 reviews (nearly all dated Nov 2023, suggesting a solicited review push), no Capterra/Reddit threads found, and no third-party teardown. From the G2 set (https://www.g2.com/products/complete/reviews):
- "They are launching new features and requires staying on top of the new launches to enable them for your team" — feature velocity creates admin overhead.
- "I had some suggestions on the UX that the team resolved the same day" and "We needed more flexibility on stock option plans and they delivered fast" — implies gaps existed in option-plan flexibility and UX, papered over by white-glove support (a small-team dependency risk).
- Structural limitations: no public pricing, no self-serve signup, no published benchmark dataset of its own (see below), employee-comp only — **no advisor/board-member or token-compensation support at all** [the whitespace Advisor Comp Studio occupies].
- Review-source bias: a perfect 5.0 across mostly same-day reviews should be read as marketing-adjacent, not independent validation.

## Data, benchmarks & methodology

- **No proprietary benchmark dataset.** Explicit on /security: "We do not create compensation benchmarks using our customers data, thereby ensuring that you don't have to worry about your private company data being exposed to data re-identification risks" (https://www.complete.so/security). Differentiates them from Pave/Ravio-style crowd-sourced benchmarks.
- Instead: **"Benchmark imports"** on /leveling (bring your own Radford/Pave/Carta data) and the Band Builder Agent "synthesizing benchmark data, modeling progression curves" from whatever the customer supplies; Offer Agent "matches it to your salary bands and benchmarks" plus "competitive comp data" surfaced inside offers (homepage).
- Leveling methodology = "Recommended levels" templates the customer adapts (tiers, location-specific tiers, job bands); the philosophy layer (free builder + handbook guides) frames the why before numbers — methodology-as-content.
- Cap-table integrations (Carta, Pulley) ground equity figures in real grant/valuation data rather than manual entry (https://www.complete.so/integrations).

## Integrations & security/compliance

- 100+ integrations across ATS (Greenhouse, Ashby, Lever, Workday, SmartRecruiters…), HRIS (Workday, BambooHR, Gusto, Rippling, Deel, ADP, Personio…), Cap Table (Carta, Pulley), eSign (DocuSign, Dropbox Sign); Performance Management "Coming Soon"; SSO directories (Okta, Azure AD, OneLogin, Google Workspace) listed under HRIS (https://www.complete.so/integrations).
- **ISO 27001 certified and SOC 2 Type II compliant since 2022**; compliance docs via trust portal https://security.complete.so; HackerOne vulnerability disclosure program; status page status.complete.so (https://www.complete.so/security).

## Patterns worth borrowing for Advisor Comp Studio

1. **Dilution & funding education blocks inside the offer doc** (/offers "Dilution and funding," "Options vs RSUs" chips): embed short "how options net of strike work" / "how token FDV scenarios dilute" explainer cards directly in the Proposition, not in a separate help page — Complete credits these for "same day acceptances" (G2).
2. **Long-term value chart as the offer centerpiece**: a multi-year stacked projection of equity+token value per scenario at the top of the Proposition; G2 evidence that "showing the stock projections" beats verbal articulation.
3. **"Preview as employee"** (/employee-rewards chip): a one-click "Preview as advisor" mode that renders exactly what the watermarked Proposition recipient sees — cheap to build over an existing print view, high trust payoff.
4. **Guardrail-aware drafting with headroom**: "Adhere to your predefined compensation ranges… avoid unnecessary approval cycles" + "leaves room for future growth within their role" (/offers) — surface compa-ratio guardrails as inline pass/fail while drafting, and add a "headroom to next tier" readout, not just a post-hoc check.
5. **Drafting capability + approval chains** (/leveling chip, homepage planning copy): explicit Draft → Review → Approved states on grants/tiers feeding the governance checklist and audit log, instead of edit-in-place.
6. **Personalized human welcome block** (Rani GIF pattern): a short note/photo from Robin atop each advisor Proposition — the cheapest differentiation Complete has, and reviewers cite it constantly ("people are often why people join").
7. **Offer-view analytics**: even minimal "Proposition generated/printed on DATE, version N" metadata in the audit log mirrors Complete's offer analytics and strengthens the discussion-draft governance trail.
8. **8-chip feature grid + philosophy-first framing**: for internal docs/onboarding, a one-screen icon-grid inventory of what the studio does, plus a short "compensation philosophy" preamble (their free Philosophy Builder pattern) above the numbers in the Proposition — frames every figure as policy-driven, not ad hoc.

## Sources

- https://www.complete.so/ — [primary] homepage, Compy agents, customer logos, G2 badges
- https://www.complete.so/leveling — [primary] leveling/bands module
- https://www.complete.so/offers — [primary] interactive offers module
- https://www.complete.so/employee-rewards — [primary] total rewards module
- https://www.complete.so/planning-budgeting — [primary] planning module
- https://www.complete.so/team-intelligence — [primary] AI agents/intelligence module
- https://www.complete.so/integrations — [primary] integration catalog
- https://www.complete.so/security — [primary] ISO 27001/SOC 2, no-benchmark policy
- https://www.complete.so/compensation-philosophy-builder-3 — [primary] free philosophy tool (→ app.complete.so/philosophy)
- https://www.complete.so/customers and https://www.complete.so/customers/notable — [primary] case studies (Notable: 50% prep reduction, PDF 24h→30min)
- https://handbook.complete.so/ — [primary] content/handbook
- https://www.g2.com/products/complete/reviews — [review] 5.0/5, 14 reviews, quoted criticisms
- https://techcrunch.com/2022/08/22/complete-startups-compensation-salary-benefits-tech-employee-equity-strategy-hiring-retention-philosophy-y-combinator/ — [secondary] $4M seed, founders, origin
- https://getlatka.com/companies/complete.so — [secondary][uncertain] ARR estimate
- https://tracxn.com/d/companies/complete/__SUqk9rqncawUxrpy3bMBN-1v8hr2Pu-6eMTWDrTl2nE — [secondary][uncertain] $4.5M total funding
- https://www.capterra.com/compensation-management-software/ — [secondary] category pricing norms ([uncertain] as applied to Complete)
