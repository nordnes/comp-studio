# Aeqium — Deep Dive

**Service:** https://www.aeqium.com · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Aeqium's full module map, pricing intelligence, and the anatomy of its public equity-scenario simulator are all directly portable to Comp Studio workstreams.

## Aeqium Deep-Dive (extends prior coverage)

### Positioning & pricing
- Repositioned 2025→2026 as **"the only AI built to execute compensation planning"** — agentic AI (Aeqium Assist + The Analyst, launched ~Sep 2025) layered on the flexible cycle platform. YC W22, SF, ~$5.8M seed (Ridge, Vestigo, Unusual, SHRM Ventures). Customers: Braze, dbt Labs, Klaviyo (first cycle Apr 2026, 98% manager completion), WHOOP, Warby Parker, Mixpanel, Hopper, Thoropass.
- **No public pricing.** Vendr: median $28.8K/yr ($25K–$30.4K band), single "Foundations" SKU + add-ons. Zendikt crowdsourced: ~$5–9/employee/mo entry; $9.6K median (50–200 emp), $36K (200–1,000). Older free tier (bands + RBAC) for small teams; Enterprise at 200+. Sales hook: they **configure your full comp process free pre-sale, live in <1 business day**. All plans: SAML SSO, dedicated CSM, unlimited integrations.
- Critically: **zero proprietary benchmark data** — customers import unlimited external benchmark sources (vs Pave/Radford). Positioned as "80% of Pave at half the cost" (G2 buyer quote).

### Feature inventory (by module)
- **Compensation Cycle Management**: guided step-by-step reviewer workflows; configurable reviewer chains rolling up to designated decision-makers; top-down or bottom-up budgets with owners, holdbacks, allocations by region/function/currency; exception tracking; **automated audit trails**; auto-generated end-of-cycle comp statements (PDF-able); merit matrices, bonus proration/attainment formulas, stock-refresh eligibility rules; multi-currency, LTI support.
- **Compensation Bands**: total-comp bands (salary+equity+bonus); band visualization with employee placement, headcount per band, spend per band; unlimited multi-source benchmark import; **band history audit** (track how bands changed over time + full employee pay history); custom roles/field-level access controls.
- **Interactive Offer Letters**: branded custom offers; built-in **equity offer simulator**; offer acceptance/decline analytics; offers plotted against existing bands (live offer data feeds back into band calibration); ATS-integrated; free-tier origin product.
- **Compensation Analysis (add-ons)**: automated alerts (out-of-band, due for increase, **upcoming equity-vesting drop**); "My Team" manager reporting suite; pay equity via regression (adjusted + unadjusted gaps, macro + individual breakdowns).
- **Employee Total Rewards Portal (add-on)**: base/variable/equity visualization, scenario modeling, configurable benefits, current + historical comp, staged band sharing.
- **Aeqium AI**: Assist (plain-language config of eligibility rules, approval workflows, permissions — applied live, no tickets); Analyst (NL questions → full narrative reports with outliers, "the why", recommendations).
- **Integrations**: Workday, BambooHR (marketplace, May 2025), Gusto, Rippling, Justworks, Namely, Greenhouse, **Carta**, ADP, UKG; ~2h technical integration, 4–6 week onboarding.

### Key workflows
Cycle setup (no-code or AI-described) → budget allocation to owners → guided reviewer pass with in-context band/benchmark data → chain approvals → exception + audit tracking → auto comp statements → portal update. Offers loop: offer → band placement check → acceptance analytics → band recalibration.

### UI/UX documentation
- **Public simulator** (`tools.aeqium.com/offer_analysis`) — the clearest blueprint of their scenario UX: inputs = salary, signing/annual bonus, N equity grants (share count, strike, option/RSU type, vesting years); "Expectations & Preferences" sliders = annual salary growth %, **annual equity growth %**, years-until-exit. Outputs: stacked "Annual Total Compensation Over Time" chart + "Potential Equity Outcomes" curve vs growth rate, annotated with **educational anchor copy** (top-quartile VC ≈ 23%/yr; 10x-in-7yr ≈ 40%/yr; Facebook ≈ 137%) to calibrate recipient expectations.
- **Transparency controls**: per-audience access levels with **per-component range transparency** (total cash vs salary vs equity, configurable across teams), framed explicitly as staged rollout ("share as you're ready"). Field-level RBAC.
- Admin dashboard (per TechRepublic/CBInsights): pay bands per role, budget constraints, equity spend, performance scores in one chart-heavy view. Interactive product tour at `aeqium.com/product-tour` (JS-loaded, not fetchable); marketing tagline "every number structured and explainable before anyone asks."

### Review sentiment & health
Review base is **near-empty**: Capterra 4.0/5 from 2 reviews; G2/TrustRadius listed but ~zero accessible reviews. Praise: intuitive layout, dashboards, responsive support, adoption without training. Complaints: underdeveloped budgeting, export formatting bugs, limited performance-cycle options, **no benchmarking data**. Company is tiny and contracting — 14 employees (−13% YoY) on a 2022 seed — but logo velocity (Klaviyo, Ocient 2025–26) and web traffic (+169% YoY) suggest it's alive and winning mid-market deals on price/flexibility.

### Takeaways for Comp Studio
1. **WS-C (approval/feedback flows)**: Aeqium's model = named reviewer chains rolling up to designated decision-makers + budget owners/holdbacks + exception tracking + automatic audit trail. For our scale, the durable pattern is chain-with-rollup + exceptions surfaced inline — not the AI config layer.
2. **WS-G (disclosure dials)**: their transparency control is a **per-component × per-audience matrix** (cash/salary/equity ranges, per team) with explicit staged-rollout framing — validates per-audience disclosure dials over one global toggle, and suggests labeling the dial as a rollout journey.
3. **9a (benchmark provenance)**: Aeqium ships no data; its credibility mechanism is **source-tagged multi-source imports + temporal band-history audit**. Our benchmark anchors should carry source + as-of-date and an audit trail of anchor changes.
4. **9e (recipient scenario modeling)**: their simulator keeps inputs minimal (growth-rate slider, exit year, strike-aware grants) and pairs every output chart with **calibrating educational copy citing VC return distributions** — directly portable to our net-of-strike proposition letters; the "Potential Equity Outcomes vs growth rate" curve is a strong chart pattern for us.
5. **Audit log**: "always audit-ready / explainable before anyone asks" is their compliance pitch — mirrors and validates our audit-log objective; vesting-drop alerts are an adjacent idea for advisor-grant cliff monitoring.

### Sources
- https://www.aeqium.com/ — homepage positioning
- https://www.aeqium.com/plans — full module/feature enumeration
- https://www.aeqium.com/product/compensation-cycle-management — cycles, budgets, audits
- https://www.aeqium.com/product/compensation-bands — bands, benchmark import, band-history audit
- https://www.aeqium.com/product/interactive-offer-letters — offers + equity simulator
- https://www.aeqium.com/product/employee-portal — portal + transparency levels
- https://www.aeqium.com/product/aeqium-ai — Assist/Analyst
- https://tools.aeqium.com/offer_analysis — public simulator UI anatomy
- https://www.vendr.com/marketplace/aeqium — pricing intelligence ($28.8K median)
- https://www.zendikt.com/product/aeqium — crowdsourced pricing, 2025–26 timeline
- https://checkthat.ai/brands/aeqium — review-sentiment analysis
- https://www.cbinsights.com/company/aeqium / https://linkedin.com/company/aeqium — funding, headcount, customers
- https://peoplemanagingpeople.com/tools/best-compensation-management-software/ — integrations list, feature summary
- https://ravio.com/blog/radford-alternatives-for-compensation-management — no-proprietary-data positioning
