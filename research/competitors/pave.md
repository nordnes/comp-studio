# Pave — Deep Dive

**Service:** https://pave.com · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Pave is dense, well-documented prior art for nearly every Comp Studio surface: benchmark provenance labels, band-editing with preview, guardrail "hard/soft stops," and the interactive equity offer letter.

## Positioning & pricing
Pave ("PaveOS") positions as the complete compensation operating system: real-time benchmarks from **9,000+ integrated companies** (give-to-get: data access requires connecting your HRIS/ATS/EMS), ML-blended pricing, workflows, and employee-facing comms. Pricing is quote-based: **Market Data Lite is free** (1–200 employees, US + 1 market, no exec roles); **Market Data Pro** ~$7–20/employee/mo (third-party estimates); full-platform annual fees **$15k–$40k** (100–500 FTE), **$40k–$90k** (500–1,500), **$90k–$200k+** enterprise, with 15–30% negotiated discounts common and $3k–$25k+ implementation on top. Modules sold individually or bundled.

## Feature inventory (by module)
- **Market Data (Lite/Pro):** real-time HRIS/ATS/EMS-sourced benchmarks; AI job matching; 200+ job-family catalog (incl. 5 AI/ML roles, July 2025); industry/demographic filters; geo differentials; **Calculated Benchmarks** (ML-generated equity benchmarks); **data consistency labels** (successor to "confidence labels") combining sample size + distribution/margin-of-error, applied to every benchmark incl. equity (equity needs ~10× the data points of salary for equal consistency).
- **Market Pricing & Bands:** multi-source dataset blending; survey/job-code fallbacks; level progressions; band generation for all pay types; scenario modeling with preview-before-commit; **AI Auto-Smoothing** (outlier detection, geo-differential data infill, regression, per-band confidence scoring); **Band Editor** (bird's-eye triage view of bands vs incumbents vs market; test midpoint shifts, smooth level progressions, fix low compa-ratios); granular share permissions; on-publish auto-sync of band edits everywhere bands are consumed.
- **Compensation Planning:** merit/promo/equity-refresh/bonus cycles; top-down + bottom-up budgets; custom worksheet columns and planning windows; **Employee Groups guardrails** — hard stops (block submission) and soft stops (require justification) on out-of-band or over-guideline changes, with admin-customized explanation copy; multi-layer approvals (CFO/CPCO approve in-product; full audit trail "if we have an audit, we can always just go back to the cycle" — Pipedrive); **Cycle Insights** (2025): cycle-progress by department/bottlenecks, real-time budget burn, cycle-outcome peer comparisons, plus a reporting API; **AI Employee Summaries** (Q4 2025 beta, LLM snapshot per employee with planner comments); white-label reward letters.
- **Total Rewards Portal:** always-on per-employee view — salary, equity, place-in-band, bonuses, benefits; **compensation simulator + share-price slider**; vesting/target payouts on a timeline; manager rollup view; white-label (colors, copy, learning hub); self-service admin editing.
- **Visual Offer Letter:** branded interactive page; stacked breakdown of base + target bonus + new-hire equity + benefits; equity sliders across share-price scenarios × vesting timeline; configurable net vs gross display and which growth scenarios candidates see; some letters include band position and preferred-price-per-round context; ATS sync + approval workflow automation.
- **Platform:** integrations — ~20 HRIS (Workday, Rippling, BambooHR, HiBob, Gusto, ADP, UKG…), ATS (Greenhouse, Lever, Ashby), 9 cap-table/EMS (Carta via CSV, Pulley, Ledgy, Shareworks, E-Trade, Fidelity…); self-service role management with assignable permission roles; **Impersonation** (admin views/acts as any user for testing); SOC 2 Type 2, ISO 27001, GDPR.
- **AI (2025–26):** **Pave Agent / "Paige"** — chat-based comp analyst (beta into 2026); answers benchmarks/org-design/equity-practice questions grounded in the live dataset; roadmap: internal-data analysis and "you vs market" comparisons; pitched as "defensible to your board."

## Key workflows
1. **Band refresh:** blend sources → Auto-Smooth (with confidence scores flagging what to double-check) → Band Editor triage of worst bands → scenario-test changes visually → publish → auto-sync downstream. Marketing claim: weeks → minutes; Workato case: 10 weeks → 3.
2. **Merit cycle:** admin sets guidelines/budgets/Employee Group stops → managers see whole team at once with compa-ratios and live budget impact of each recommendation → soft/hard stops at submit with explanation copy → layered approvals in-product → Cycle Insights mid-cycle → reward letters.
3. **Offer:** ATS-triggered generation → approval chain → candidate self-serve scenario exploration (cuts recruiter back-and-forth).

## UI/UX documentation
Public teardown/screenshot material is thin (demo-gated); best available: NextSprints teardown — left-nav IA (Benchmarking, Offers, Analytics), muted palette emphasizing data viz, standout elements are the **interactive salary-band visualization and equity-grant simulator** (manipulate variables, see live impact); mobile limited to approvals/alerts. Planning is a spreadsheet-style worksheet + dashboard of budget utilization, compa-ratio, range penetration. Band Editor renders ranges as bands overlaid with incumbent dots vs market markers. No empty-state documentation found.

## Review sentiment (G2/aggregate, ~64 reviews, 4.4/5)
- **Strengths:** Quality of Support 9.8, Comp Data Management 9.5; "no more digging through endless spreadsheets"; "the compensation cycle workflow… keeps everything in one place and enforces consistent standards"; Dropbox: employees saying "'This is absolutely awesome.' This never happens with HR tools"; Ramp: "particularly permissioning, the ability to ensure the right people can see the right things is fantastic."
- **Criticisms:** "A downside of using Pave is the administrative tasks" (G2); Automated Compliance only **6.5** vs Workday 9.1; Performance Mgmt Integration 5.9; limited customization for complex comp structures; basic advanced reporting ("require workarounds"); heavy implementation for smaller orgs; benchmark density thin outside NA/EU tech and niche roles/geos.

## Takeaways for Comp Studio
1. **(9a benchmark provenance)** Pave's *data consistency labels* are the strongest prior art: pair every benchmark with sample size + distribution quality + margin of error, and explicitly teach the sample-size-vs-consistency tradeoff. Equity anchors deserve a wider uncertainty scale than cash (~10× data needed). Comp Studio's benchmark anchors should carry visible provenance/consistency badges, not bare numbers.
2. **(WS-G guardrails / governance)** Employee Groups' two-tier model — hard stop (block) vs soft stop (justify, captured in the audit trail) with admin-authored explanation copy — maps directly to Comp Studio guardrails: don't just block out-of-policy proposals, require recorded justification and explain *why* in the blocking UI.
3. **(WS-C feedback/undo + 9b band placement)** Band Editor's pattern — triage view ranking which bands need attention, scenario-test changes against incumbents + market *before* committing, then publish-with-sync — validates preview-before-commit as the core editing loop; pair it with per-change confidence flagging (Auto-Smoothing's confidence scores) so users know what to double-check after a bulk action.
4. **(9e vesting timeline / exit slider + WS-F charts)** Visual Offer Letter's winning anatomy: stacked total-comp breakdown up top, then an equity section where a share-price/scenario slider drives a vesting-timeline chart live, with employer-configured scenario bounds and net/gross toggle. Comp Studio's exit slider should similarly constrain scenario ranges via governance config and recompute the timeline in place — Pave's market proof is that interactivity is what makes equity "real" to recipients.
5. **(WS-G info design)** Pave's weakest scores (compliance 6.5, admin burden, reporting) show that workflow polish without legible governance/audit surfaces is the gap incumbents complain about — Comp Studio's audit log + governance-gated letters are a differentiator worth keeping prominent, not buried.

## Sources
- https://www.pave.com/blog-posts/big-pave-platform-news-from-total-rewards-live-2025 — PaveOS, Auto-Smoothing, Band Editor, Paige
- https://www.pave.com/blog-posts/whats-new-in-pave-q4-2025-product-releases — Q4 2025 AI releases
- https://www.pave.com/products/pave-agent — Pave Agent positioning
- https://www.pave.com/products/market-pricing · /compensation-planning · /total-rewards · /visual-offer-letter · /integrations — module pages
- https://www.pave.com/market-data-methodology — consistency labels, equity-benchmark methodology, integration list
- https://www.pave.com/blog-posts/compensation-controls-for-merit-cycle-compensation-planning — Employee Groups hard/soft stops
- https://www.pave.com/blog-posts/compensation-planning-tools-to-new-heights-with-cycle-insights — Cycle Insights
- https://www.pave.com/blog-posts/six-new-self-service-features-from-pave — roles, impersonation, self-service
- https://www.pave.com/blog-posts/offer-letters-first-compensation-conversation · /competing-for-talent-consider-offer-letters-reward-letters — offer-letter anatomy
- https://pave.com/pricing · https://www.vendr.com/marketplace/pave · https://softwarefinder.com/hr/pave — pricing tiers and transaction data
- https://www.g2.com/compare/pave-vs-workday-compensation — G2 category scores + quotes
- https://www.rfp.wiki/hr-office/employee-benefits-compensation/pave — aggregated review sentiment (4.4/5, 64 reviews)
- https://www.selecthub.com/p/compensation-management-software/pave/ — pros/cons synthesis
- https://nextsprints.com/guide/pave-product-manager-teardown-analysis — UI/IA teardown
- https://www.pave.com/case-studies/how-pipedrive-transformed-promotions-with-monthly-compensation-planning-cycles · https://pave.com/case-studies/chronosphere — workflow/audit-trail case studies
