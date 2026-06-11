# Pequity — competitor deep-dive (2026-06-11)

> Researched 2026-06-11 for Advisor Comp Studio. Tags: **[R]** = relevant to our advisor-comp tool (offers/proposition docs, approvals, compa-ratio, equity display, audit), **[NR]** = not relevant (employee merit cycles at scale, ATS plumbing, payroll).

## Snapshot — positioning, target user, status, pricing

- **What it is:** "A new class of compensation management software that combines the familiarity and ease-of-use of a spreadsheet with the power of automation at scale." Tagline (2025 site): "Compensation made simple. Decisions made powerful. Price roles, scale comp cycles, manage pay bands, streamline approvals, and promote pay transparency — all in one platform." — https://pequity.com/ (fetched 2026-06-11)
- **Status: acquired by ADP (announced 29 Oct 2025).** Founder/CEO Kaitlyn Knopp (ex-comp at Google, Cruise, Instacart): "Pequity is merging with ADP… the entire Pequity team and platform are moving to this new world together." Team was 23 people / 11 engineers after 6 years. Site now shows the "Pequity an ADP company" logo and a Pequity↔ADP Lyric DPA. — https://blog.pequity.com/pequity-joins-adp, ADP press release https://mediacenter.adp.com/2025-10-29-ADP-Acquires-Pequity
- **History:** founded 2019, San Francisco; $19M Series A led by Norwest (First Round, Designer Fund, Scribble), ~$22.5M total. — https://techcrunch.com/2021/06/23/pequity-a-compensation-platform-designed-for-more-equitable-pay-raises-19m/
- **Target user:** "HR teams, Compensation, People Ops, and Total Rewards leaders at fast-scaling, mid-market, and enterprise companies… 200 or 20,000 employees"; pricing page says it's for "companies that have 1 or more compensation team members." Customers: Notion, Instacart, Canva, Robinhood, Scale, Equinox, Kioxia, Safran, Uber Freight, May Mobility, CAPTRUST. — https://pequity.com/, https://pequity.com/pricing
- **Pricing (as of 2026-06-11):** platform is **quote-only** ("Get your custom quote today!") with a self-serve "Get Started - Free" quickstart (https://pequity.app/quickstart). The **data product is price-listed**: Single Job $149, Job Family $999, Full Dataset "starts at $9k/year" (one page markets "$10K"); "data free with Platform." Setup claim: live "in under two weeks." — https://pequity.com/pricing, https://pequity.com/solutions/data
- **Key differentiation claims:** "100% customizable," mid-cycle editability, AI Copilot/"Paygent," and vs Pave: holdbacks/slush funds, multi-currency in a single cycle, self-serve reward-letter templates (no CSM needed). — https://pequity.com/compare-pave

## Complete feature inventory — by module

**1. Comp Cycle (AI Enabled)** — https://pequity.com/solutions/comp-cycle — mostly **[NR]** (employee merit cycles), but mechanics are instructive **[R]**
- Plan/budget/execute merit, promotion, market-adjustment cycles; "review any compensation element; plan in local, budget in USD; configure budgets in any direction; add slush funds; design custom approval workflows."
- **Pequity Copilot (AI):** natural-language formula building ("decrease all increases by 1%" rewrites the formula), step-by-step formula explanations mid-cycle for exec questions.
- Published feature checklist (verbatim list on the page): AI Assistance · Sandbox Account · API + SFTP integrations · Admin/Planner/Partner experiences · Budget Visualizations · Performance · Analytics · Bottom's-Up and Top-Down Budget · Forced Justification · Flexible Planning Structures · CSV upload · Salary/Annual Bonus/Spot Bonus/Market Adjustments · **Crypto Rewards** · Range Matching · Dynamic Increase Logic · **Compa-Ratios** · Reporting · Comments + @Mentions · Reward Letters · Promotions/Transfers · Refresh/Promo/Spot Equity · **Pay History · Change History** · Configurable Flags · Branded Data Styling · **Pay Equity** · Currency Conversion · Column renaming/resizing/re-ordering/branding · Multiple Budgets · Multiple Merit Matrices · Slush Funds · Custom Fields · Tooltips · Dropdowns · Plan Local, Budget in USD · Flexible Planning Roles. (Crypto rewards + compa-ratios + change history are directly **[R]** to us.)
- Help docs add: Waves & planning hierarchy, planning groups, budget trackers, column visibility per planner, bulk edits, reopen-after-submit, cycle clone/archive/delete, formula function reference. — https://helpcenter.pequity.com/support/pequity-features-workflows

**2. Offers / Recruiter Workbench ("offers in hours—not days")** — https://pequity.com/solutions/recruiter-workbench, https://pequity.com/integrations — **[R]**
- Pitch: replace "Slack, email, and spreadsheets"; cited offer-letter error classes: "wrong person, wrong money, wrong start date." Claimed outcomes: time-to-offer reduced ~2 days; up to 2x offers extended (homepage).
- Offer flow (integrations page): "Proactively compare pay to peers & ranges, notify decision makers with automated approval chains, and track historical pay decisions"; "structured approvals and exportable change history" for audits — **[R]** (mirrors our governance checklist + audit log).
- Chrome extension embeds comp data in the ATS ("Create Offer in Pequity" button in Greenhouse), auto-fills candidate name/email/location/department/Greenhouse link into the approval. — https://helpcenter.pequity.com/support/use-pequity-approvals

**3. Approvals (off-cycle: offers, promotions, transfers, adjustments)** — https://pequity.com/solutions/approvals — **[R]** (closest analogue to our consents checklist)
- "Off-cycle compensation approvals, on autopilot." Configuration model (help doc): **Data Fields** (incl. formulaic fields) → **Comp Tables** matched/triggered by Job Family Group>Job Family, Level, Geo>Location → **Approval Chains** routed by job family/level/location/custom fields (manager, decision type). "Admins have the ability to create self-serve approval workflows—no engineering help needed."
- Runtime: approvers get email notifications, Approve/Reject; owner/admin can edit a sent approval and resend through the chain; required fields, comments, **All Activity** feed, approval-chain tracking, post-approval field editing; "NEW Approvals Center" hub. — https://helpcenter.pequity.com/support/use-pequity-approvals, https://helpcenter.pequity.com/support/approvals-center-guide

**4. Ranges / pay bands** — https://pequity.com/solutions/ranges — **[R]** (our tier bands)
- "Sync, store, and share your compensation ranges at scale"; granular customizable permissions for internal sharing ("push updates in real time" instead of emailing spreadsheets); custom job structures, metadata fields, column naming, compensation elements. Admin setup guide + range-permission management in help center.

**5. Salary Board (public pay-transparency boards)** — nav: "Share salary ranges with candidates directly or in job posts"; landing page https://pequity.com/get-started-with-salary-board.html (page now serves empty content — feature appears de-emphasized post-ADP; **[uncertain]** current status) — **[R]** as a pattern
- "Cities & states are legally requiring employers to share salary ranges in job posts; Salary Board allows you to publish ranges to job posts in minutes" — i.e., a candidate-facing published view generated from the internal ranges source of truth.

**6. Visual / Digital Offers** — https://pequity.com/solutions/digital-offers — **[R]** (our watermarked Proposition doc)
- "Interactive, branded offer experience" for candidates; "Cue the confetti! Pequity helps candidates see themselves with you now, in the future" (future-value framing of the package); positioning: win against big tech by being first + standing out.

**7. Employee Portals / Employee Comp Overview** — https://pequity.com/solutions/employee-comp-overview — **[R]**
- Total-comp portals: salary, equity, bonuses, benefits. "Pequity presents **equity at the grant level** so employees get a better understanding of the true value… and see their equity status in real time." Admin view shows full package incl. vesting schedules; copy: "Salary is simple. Total compensation is not." — a vesting "roadmap" of where pay is headed as milestones vest. Help docs: reward-letter views inside the portal, **configurable disclaimer on employee portals** (directly **[R]** to our "discussion draft, not a binding offer" legal banner).

**8. People Insights / analytics (AI Enabled)** — https://pequity.com/solutions/people — **[R]** partially
- Single source of truth for comp data; **Comp Health** tool: "see at a glance which employees are overpaid, underpaid, or are hitting the mark perfectly" (compa-ratio-style traffic-lighting → flight-risk flags). Exec-ready visualizations; AI insights "generate custom people analytics and reports instantly through natural language." Boardroom-report claim (homepage): "put boardroom reports together in minutes." Talent & budget analytics: budget vs actual, offer accept/reject rates. — https://pequity.com/solutions/talent-analytics
- **Paygent** — "Your AI-Powered Compensation Strategist" assistant (help-center articles incl. "How Paygent Sources and Uses Data"). — https://helpcenter.pequity.com/support/paygent-your-intelligent-compensation-assistant

**9. Pay-equity tooling** — **[R]** conceptually
- "Pay Equity" is a listed comp-cycle feature and a G2-listed capability ("Pay Equity," "Salary Bands," "Benchmarking Data"); founding mission was equitable pay (TechCrunch 2021). No standalone regression-audit module is documented publicly — pay equity shows up as flags/peer comparisons inside cycles and approvals ("instantly comparing new compensation packages against peer benchmarks… while ensuring equity across your workforce," approvals page). **[uncertain]** depth vs dedicated tools like Syndio.

**10. Market Pulse (benchmarking data product)** — https://pequity.com/solutions/data — **[NR]** for advisors but methodology is interesting
- "First ever predictive compensation dataset": 15K+ orgs, 1.09M+ data points, 98 countries, 122 job functions, 950+ roles; P50/P75 for salary, bonus, equity, total comp; quarterly updates; **6 & 12-month forecasted pay** based on "market trends, compensation activity, inflation, layoffs, talent density, hiring patterns."

**11. Reward letters / statements** — **[R]** (our Proposition doc)
- Generate + distribute total-reward statements at cycle close; template editor with custom formatting & formulas, decimal control, Indian number formatting, naming conventions, easy regeneration after late changes. — https://helpcenter.pequity.com/support/reward-letters

**12. Embedded** — comp data embedded in ATS via extension/API, "permissioned on role, level, location, and range – so your team only sees the comp data they should." — https://pequity.com/integrations — **[NR]**

## UI/UX documentation

- **IA / navigation:** marketing nav splits Platform "By Product" (Comp Cycle · Market Pulse · Approvals · Range Management · Employee Portals · People Insights · Embedded · Visual Offers · Salary Board) and "By Role" (Compensation, TA, HR, Finance, People Ops, Exec Leadership). In-app modules (per help center): **Comp Cycles · Ranges Tool · People Tool · Approvals Tool**, plus admin/personal settings — a small module-per-job IA, not a mega-suite. — https://pequity.com/, https://helpcenter.pequity.com/support
- **Core layout = governed spreadsheet.** The whole product identity is "familiarity of a spreadsheet + automation": dense tables with column renaming/resizing/re-ordering/branding, dropdowns, tooltips, calculated/formula columns, CSV import/export, bulk edit — but permissioned per role and validated. Per-planner **column visibility** and "layouts" are first-class config objects. — https://pequity.com/solutions/comp-cycle, help center
- **Key screens:** (a) Comp Cycle planner workbook — employee rows, comp columns, budget tracker, flags, comments/@mentions, forced justification; (b) Admin cycle builder — columns/formulas/roles/waves/planning groups; (c) Approvals — comp table + approval-chain timeline with per-step status and an All Activity feed; (d) Ranges grid with permission scoping; (e) Comp Health dashboard — over/under/on-target classification of employees; (f) Employee portal — grant-level equity with vesting timeline; (g) Visual Offer — branded interactive candidate page (confetti moment). A public **Navattic interactive demo** is linked from the homepage (https://capture.navattic.com/cm6gmvi4b000003jr8bqyaa1f).
- **Charts & interactions:** "Budget Visualizations" in-cycle (budget consumed vs remaining), analytics dashboards (accept/reject rates, budget drill-downs), equity vesting roadmaps, range-position displays; AI chat surfaces (Copilot/Paygent) layered over the grid. Mid-cycle live edits of formulas/data are a signature interaction ("editing formulas, data, and logic mid-cycle for real-time scenario planning" — ADP-merger post).
- **Forms/wizards:** cycle creation from scratch or **clone**; approval creation auto-filled from ATS, then routed; reward-letter template setup; waves/groups launch with editable email notifications.
- **Visual tone:** clean light SaaS, friendly copy ("oh my!", 🎉/confetti), branded data styling so customers can match their own brand in letters and columns.
- **Review evidence (manager-facing simplicity — verified):** "The **managers found the tool to be extremely intuitive and easy to use**. The letter generation process is very efficient, and regenerating letters due to late changes… is very easy" (G2, Kelly M., Enterprise, 2024-11-13, 5/5). "**Managers had nothing but positive feedback** on the system and made the process a lot more transparent… The system itself is very flexible and user friendly" (G2, verified IT user, Mid-Market, 2025-03-03, 4/5). "Pequity makes compensation so clear. The software is easy to navigate and customize" (G2, Manufacturing, 2024-05-23, 5/5). — https://www.g2.com/products/pequity/reviews

## Known criticisms & limitations

- **Reporting is the recurring complaint:** "I would also like **better reporting functionality**" / G2's aggregated dislikes: "better reporting functionality… falls short of expectations" (3 mentions). — https://www.g2.com/products/pequity/reviews
- **Admin self-service gaps / CSM dependence:** "I would like the ability for **admins to do more on the system as opposed to rely on Jaki [CSM] so much**… I understand this is on the roadmap" (G2, 2025-03-03). High-touch service is praised constantly, but it doubles as a dependency.
- **Product maturity:** "With Pequity being a new software, there are still things on the roadmap that are not yet deployed" (G2, 2024-05-23).
- **Tiny public review base:** only **3 G2 reviews (4.7/5)** vs Pave/Payfactors with hundreds — strong but statistically thin social proof; Capterra/GetApp listings exist with minimal review content. — https://www.g2.com/products/pequity/reviews, https://www.capterra.com/p/10031150/Pequity/
- **Opaque pricing** (quote-only platform). — https://pequity.com/pricing
- **Post-acquisition uncertainty:** founder's own post anticipates customers feeling "surprise. Maybe even a shock," and the boutique reach-the-founder support model is exactly what an ADP merger puts at risk; Salary Board's landing page now renders empty. **[uncertain]** — https://blog.pequity.com/pequity-joins-adp
- Site hygiene: stale COVID-19 banners still render on some pages (homepage/integrations), placeholder text in the feature grid ("Model out a new merit matrix" repeated under every checklist item).

## Data, benchmarks & methodology

- **Market Pulse:** real-time, expert-reviewed dataset; 15K+ organizations, 1.09M+ data points, 98 countries, 122 job functions, 950+ roles; P50/P75 across salary/bonus/equity/total comp; **quarterly refresh**; predictive 6/12-month pay outlooks built from market trends, comp activity, inflation, layoffs, talent density, hiring patterns. Sold standalone ($149 job / $999 family / $9k+ full) or bundled free with platform. — https://pequity.com/solutions/data
- Real-time positioning: "customers use Pequity every day—not once per month or quarter like a salary survey," removing reliance on lagging external surveys. — https://pequity.com/
- Benchmarks surface in-flow: peer medians in offers/approvals, range matching + compa-ratios in cycles. — https://pequity.com/integrations, https://pequity.com/solutions/comp-cycle

## Integrations & security/compliance

- **ATS:** Greenhouse (deepest: extension + approvals integration), Lever, SmartRecruiters, Workday, SuccessFactors, BambooHR, Ashby, Workable, Teamtailor, Jobvite, Taleo + ~20 more listed, "and more — just ask." **HRIS:** Workday, SuccessFactors, BambooHR "+50 more" (employee census sync for cycles, peer medians, pay-reporting compliance). Also API + SFTP, CSV, cap-table software ("integrates with… cap table software" — FAQ), SSO. — https://pequity.com/integrations, https://pequity.com/
- **Security:** SOC 2 Type 2 (report downloadable), GDPR controls doc, continuous monitoring via **Drata trust center** (https://security.pequity.com/), MFA, SSO, RBAC, audit trails, encryption, regular pen tests (summary PDF published), subprocessor list, DPA + a separate **ADP Lyric DPA**. — https://pequity.com/security-overview

## Patterns worth borrowing for Advisor Comp Studio

1. **Comp Health traffic-light classification** — one glanceable over/under/on-target verdict per person against band (we'd render each advisor's package vs FAST-tier band as below/within/above with a colored chip + drill-in). — https://pequity.com/solutions/people
2. **Trigger-matched comp tables + approval chains** — approval routing auto-selected by (tier × decision type × custom fields), with per-step status, email nudges, Approve/Reject, and edit-and-resend. Our governance/consents checklist could become a visible "chain" with state per consent (e.g., Pantera consent, board approval). — https://helpcenter.pequity.com/support/use-pequity-approvals
3. **"All Activity" feed + exportable change history on every approval** — audit log rendered inline on the object it audits, and exportable "to pass your future audits" — exactly our audit-log objective, including print/export. — https://pequity.com/integrations
4. **Grant-level equity display with vesting roadmap** — "where employees are now and where they're headed as vesting milestones are met"; for us: per-grant option/token rows with a vesting timeline and net-of-strike value at each scenario point. — https://pequity.com/solutions/employee-comp-overview
5. **Configurable disclaimer banner on portals** — a first-class setting for legal copy on every shared view; maps 1:1 to our mandatory "internal & confidential / discussion draft, not a binding offer" framing on the Proposition. — https://helpcenter.pequity.com/support/how-to-add-a-disclaimer-to-your-employee-portals
6. **Regenerable letters from templates** — reward letters as data-bound templates (custom formatting, decimal/number-format control, naming conventions) so a late comp change is a one-click regenerate, not a re-write; praised by name in reviews. Our Proposition doc should regenerate from scenario state the same way. — https://helpcenter.pequity.com/support/reward-letters
7. **AI explain-the-formula** — Copilot "walks through the formula step by step so you can explain it clearly" to execs mid-cycle. Even without AI, an "explain this number" expandable trace (engine inputs → net-of-strike math) would serve the same trust function for Robin in board conversations. — https://pequity.com/solutions/comp-cycle
8. **Spreadsheet-with-guardrails grid grammar** — configurable columns (rename/reorder/hide-per-role), formula columns, flags, forced justification, comments/@mentions on rows. Borrow: per-role column visibility for the advisor table + a required "rationale" field when a package breaches the compa-ratio guardrail. — https://pequity.com/solutions/comp-cycle

## Sources

**[primary] (vendor)**
- https://pequity.com/ — homepage, positioning, FAQs, outcome claims
- https://pequity.com/solutions/comp-cycle — Comp Cycle + Copilot + feature checklist
- https://pequity.com/solutions/recruiter-workbench — Offers ("hours not days")
- https://pequity.com/solutions/approvals — Approvals module
- https://pequity.com/solutions/ranges — Ranges/pay bands
- https://pequity.com/solutions/data — Market Pulse data + data pricing
- https://pequity.com/solutions/people — People Insights / Comp Health
- https://pequity.com/solutions/digital-offers — Visual Offers
- https://pequity.com/solutions/employee-comp-overview — Employee portals / equity display
- https://pequity.com/solutions/talent-analytics — talent & budget analytics
- https://pequity.com/integrations — offer workflow, ATS/HRIS lists
- https://pequity.com/pricing — quote-only pricing
- https://pequity.com/security-overview + https://security.pequity.com/ — SOC2/GDPR/Drata, ADP Lyric DPA
- https://pequity.com/get-started-with-salary-board.html — Salary Board (page now empty) [uncertain]
- https://pequity.com/compare-pave — vs-Pave comparison claims
- https://helpcenter.pequity.com/support — help center IA
- https://helpcenter.pequity.com/support/pequity-features-workflows — full workflow article index
- https://helpcenter.pequity.com/support/use-pequity-approvals — approvals configuration detail
- https://blog.pequity.com/pequity-joins-adp — ADP merger announcement (2025-10-29)
- https://mediacenter.adp.com/2025-10-29-ADP-Acquires-Pequity — ADP press release

**[review]**
- https://www.g2.com/products/pequity/reviews — 4.7/5, 3 reviews, full texts quoted above
- https://www.capterra.com/p/10031150/Pequity/ — Capterra listing (thin content)
- https://www.getapp.com/hr-employee-management-software/a/pequity/ — GetApp listing

**[secondary]**
- https://techcrunch.com/2021/06/23/pequity-a-compensation-platform-designed-for-more-equitable-pay-raises-19m/ — funding/founding
- https://www.compup.io/blogs/pave-alternatives — competitor framing [uncertain — competitor-authored]
- https://ravio.com/blog/the-best-tools-for-salary-benchmarking — benchmarking-market context [uncertain — competitor-authored]
- https://coldiq.com/tools/pequity — pricing summary (custom quote)
