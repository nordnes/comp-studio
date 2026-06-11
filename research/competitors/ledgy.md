# Ledgy — Deep Dive

**Service:** https://ledgy.com · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Extensive primary documentation found: full pricing-page feature matrix, employee dashboard anatomy (verbatim customer guide), 2026 AI strategy post, and concrete review quotes.

# Ledgy Deep-Dive (extends prior coverage)

## Positioning & pricing
Repositioned (2025–26) as "the world's first unified platform for all non-cash compensation: equity, deferred compensation, carried interest, pensions, and savings" and "leading AI-powered equity & executive compensation software." New CEO Armon Bättig; CSC partnership powers an exec-comp offering. Tiers (official pricing page):
- **Launch (free, ≤50 stakeholders):** multi-entry cap table, equity plans/grants, simple vesting, stakeholder dashboards, employee scenarios, self-serve.
- **Scale (from €3k/yr, 50+ stakeholders):** + data room/document folders, selective publishing, full transaction history w/ docs, 70+ HRIS, DocuSign/Skribble e-signing, on/offboarding automation (2 workflows), automated granting, vesting tranche builder (≤5 performance conditions), end-to-end exercising, document templating, investor dashboard, valuation calculator, custom reporting/preset views, EMI1/EMI40/Register of Members, tax & payroll reporting, automated share certificates, Companies House reporting, independent HMRC/409a/BSPCE valuations, AI chat support.
- **Enterprise (custom, 200+):** + unlimited performance conditions & offboarding, global mobility reporting, GraphQL API, dividends workflows, **customisable + localised dashboards**, bank-details collection, **full transaction audit trails, role-based access levels**, SAML SSO/SCIM/2FA enforcement, **Document Auditor**, restriction & holding periods, IPO readiness team.
- **Public-company plan:** trading & settlement (nominee Zedra, broker Winterflood, paying agent Airwallex; orders in 170 countries/60+ currencies, real-time order tracking), share-price scenario calculator, insider management, blackout periods.
- **Financial reporting add-ons:** Essentials €3k/yr (tranche-level IFRS 2/FRS 102/ASC 718 expensing, Black-Scholes, volatility/risk-free rates, graded/straight-line amortisation, forfeiture rates, **locked report history**, disclosures); Advanced €5k/yr (+cost-centre movements, performance conditions, journal entries); DTA report extra. Vendr benchmarks: Scale ~€8–25k, Enterprise €25–50k+ actual annual spend.

## Feature inventory (by module)
- **Cap table:** dynamic transaction-based (issuances, secondaries, convertibles, splits, valuations, any currency), docs attached per transaction, customisable columns/views/aggregate grouping, fully- vs non-diluted %, anti-dilution provisions, multi-entity.
- **Scenario & exit modeling:** funding-round stacking, liquidation preferences, waterfall + **breakpoint analysis**, dilution projections; unlimited scenarios on paid tiers (free = 1, mid = 3 historically).
- **Equity plans:** ESOP, VSOP, LTIP, EMI, CSOP, RSUs, options, warrants, growth/hurdle shares, BSPCE, SARs, STAK; automation rules triggered on HRIS sync; bulk granting + bulk document/signature workflows; leaver/joiner status tags.
- **AI (April 2026 post):** **AI Auditor** cross-checks documents against transactions, flags missing links/data mismatches in one dashboard; AI validation at data entry, cross-jurisdiction compliance monitoring; explicit principle that "all AI actions are explainable and auditable — users can see the reasoning behind any AI alert."

## Key workflows
Grant → template doc generated → e-signed (DocuSign/Skribble/native) → auto-attached to transaction → employee invited (admin previews-as-stakeholder first) → vesting tracked → exercise request in-app → settlement. Migration = 4 stages (setup, extraction, import, validation), "weeks not months."

## UI/UX documentation (concrete)
- **Navigation:** top-level marketing IA = Cap table / Equity plan automation / Scenario & exit modeling / dashboards; in-app left-side menu pattern (per peer tools and Ledgy course screenshots).
- **Employee dashboard anatomy** (Camunda's internal Ledgy guide): (1) **"Today's Value" card top-left** — net value of *vested* shares only at current valuation; (2) **Equity Value Growth bar chart + slider calculator** — bars show total potential value at each historical company valuation; slider models a user-chosen future valuation; (3) **Vesting Breakdown chart** — accrued vs to-come over the full journey; (4) **grants list** with per-grant shares + vesting schedule; cost-to-exercise shown. Company-pushed conservative/moderate/aggressive presets sit beside the custom slider; forecasting tool optionally factors dilution from future rounds.
- **Tables:** column/view customisation with aggregate grouping; Excel export respects custom views, **PDF export does not** (a named user complaint).
- **Admin trust features:** preview-as-stakeholder before invite; selective publishing (choose which cap-table info each stakeholder group sees); real-time status tags.

## Review sentiment
G2 4.7/5; Capterra 4.9/5 (29 reviews). Praise: "shows information which would take hours to find… in one click, visually appealing"; "easy for employees to track and understand the value of their options with simple scenario modelling"; "easier to navigate than Global Shares or ComputerShare"; support replies <1 day. Complaints: PDF export ignores custom views; investors lack the scenario-modelling feature companies have; historic-data implementation is effortful; limited custom-report filters/flexibility; confusing notifications; no phone/24-7 support; occasional bugs.

## Takeaways for Comp Studio
1. **(9d formula inspectability / 9a provenance):** Ledgy's AI stance — "every alert shows its reasoning, all actions auditable" — is the market bar for trust surfaces; Comp Studio's formula-inspection and benchmark-provenance panels should similarly show the *why* inline, not in docs.
2. **(9c sealed versions):** Ledgy sells **"locked report history"** as a paid financial-reporting feature and full transaction audit trails as Enterprise-only — sealed proposition versions are a recognized, monetizable governance primitive; mirror the "locked once issued" semantics.
3. **(9b band placement / WS-F charts):** The employee dashboard formula — value-today card + valuation-history bar chart + slider for custom future valuation + preset conservative/moderate/aggressive anchors — is the proven layout; place Comp Studio's band anchors as labeled points on the same interactive valuation axis.
4. **(9e vesting timeline / WS-G):** Ledgy splits "Vesting Breakdown" (accrued vs to-come) from the per-grant list; keep Comp Studio's timeline cumulative with cliff visually called out (their education course renders the cliff as a step jump at month 12).
5. **(WS-B dialogs / WS-C feedback):** Preview-as-stakeholder before sending, and selective publishing per audience, are the two safety affordances reviewers value; a "preview as Robin/advisor" mode before sealing a proposition letter maps directly. Also note their top complaint — exports that don't match the configured view — as a defect class to avoid in Comp Studio's print/PDF path.

## Sources
- https://ledgy.com/company-pricing — full tier feature matrix
- https://ledgy.com/ — unified-platform positioning, module list
- https://ledgy.com/cap-table — cap table features
- https://ledgy.com/equity-plan-automation — plan types, automation rules
- https://ledgy.com/employee-equity-communications — dashboard, preview-as-stakeholder
- https://confluence.camunda.com/spaces/BP/pages/178594092/Ledgy+-+Equity+Management+Solution — employee dashboard anatomy (customer guide)
- https://ledgy.com/blog/scenario-modelling-for-equity — scenario presets, employee simulation
- https://ledgy.com/blog/ai-powered-equity-management-platform — AI Auditor, explainability (Apr 2026)
- https://ledgy.com/blog/2024-at-ledgy — trading/settlement (Zedra/Winterflood/Airwallex), public-co launch
- https://ledgy.com/blog/a-new-era-of-executive-compensation — CSC partnership
- https://www.vendr.com/marketplace/ledgy · https://costbench.com/software/equity-management/ledgy/ — actual pricing benchmarks
- https://www.capterra.co.za/software/173939/ledgy · https://www.g2.com/it/products/ledgy/reviews · https://www.joinsecret.com/ledgy/reviews — review quotes
- https://www.zendikt.com/product/ledgy — EU-leader positioning, trade-offs
- https://docs.ledgy.com/ — GraphQL API (captable, vesting, documentCount fields)

 I've gathered what I need, so I'm ready to compile the structured markdown report with all the requested sections, keeping it dense and focused within the token limit.
