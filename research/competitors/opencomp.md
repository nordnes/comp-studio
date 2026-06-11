# OpenComp — Deep Dive

**Service:** https://www.opencomp.com · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Primary sources (live product pages, GitBook release notes through Nov 2025, hands-on reviewer walkthroughs) yielded a near-complete module inventory, concrete workflow detail, and a notable correction to one circulating claim.

## OpenComp Deep-Dive Digest

### Positioning & pricing
- Positioning: "compensation intelligence" for venture-backed / high-growth companies **without in-house comp expertise**, up to ~1,500 employees (sweet spot 200–2,000). Founded 2021 by Thanh Nguyen & Nancy Connery (Salesforce's founding HR team); $24M raised (J.P. Morgan, TIME Ventures, 8VC). 2,000–3,000+ customers incl. Discord, Figma, Reddit, Calm.
- **Correction worth knowing:** a May-2026 blog claims Pave acquired OpenComp in Feb 2024 and wound it down. This is **contradicted by primary evidence** — opencomp.com is live with 2025 copyright, release notes ship through Nov 2025, and 2026 third-party reviews describe fresh demos. The verified Pave acquisition was Option Impact/Advanced-HR (2022). Treat the acquisition claim as false (likely AI-generated source).
- Pricing: free ≤50 employees; three bundles — **Comp Benchmarking** (from ~$4,500/yr, incl. offer creation) → **Comp Strategy** (adds ranges, headcount planning) → **Comp Cycles** (adds offers-at-scale, total rewards, merit/bonus cycles). Real-world: $12–30k/yr (<100 EE), $30–80k (100–300 EE, equity module adds $10–40k), $60–150k+ enterprise. Base platform fee + per-employee fees with volume breaks at 100/250/500. Price escalation is a confirmed complaint.

### Feature inventory (by module)
- **Global Comp Data / Benchmarking** — give-to-get crowd-sourced model: customers connect HRIS/payroll/equity systems; data is AI/ML job-matched & leveled (claimed 95% accuracy), refreshed quarterly; ~6,000 companies, ~4,000 roles, 41 countries, 18 industries (2023 figures). Auto-benchmarks the whole roster on HRIS connect. **Spring 2025: Multiple/Custom Benchmarks** — import third-party survey data, map to employees, view side-by-side with OpenComp's benchmark; **Custom Job Architectures** (own taxonomy, hierarchies, role descriptions, skills) followed.
- **Pay Strategy & Ranges** — Range Builder (2022, "3 clicks"): generates bands from market data + strategy survey + growth stage; cash/equity balance, geo tiers, remote pay policies; flags employees outside guidelines. **Q4 2024 Range Manager**: view/edit individual bands post-generation; express equity as cash value; compare-to-range by total cash or base.
- **Intelligent Offers** — ranges + peer data + past offers for the role in one view; pre-approval routing with "clear, auditable timeline"; interactive offer letters showing full package.
- **Merit & Bonus Cycles** — budget allocation, eligibility rules, approvals; Budget Pools per manager; custom fields; variable pay periods; auto-generated personalized pay-change letters; real-time exec summary (budget burn, market position, % below range).
- **Pay Equity (DEI)** — disparities by gender/ethnicity within roles; per-demographic metrics (equity share, avg level, avg performance score); by-department and management-team tracking; live impact of cycles on equity gaps.
- **Total Rewards Statements** — step-by-step wizard; visual salary/bonus/equity/history; current & future equity value charts; pay-transparency range disclosure toggle.
- **Headcount Planning** — scenario models projecting payroll, burn rate, **and equity dilution** over a horizon as roles/dates/levels change.
- **Reports (Nov 2025)** — new nav tab; ad-hoc query over employee/market/range data, filter/group, save & re-run. No generative-AI copilot announced; AI is confined to matching/leveling.

### Key workflows & UI/UX
- Reviewer-documented UI: "clean UI and modular architecture"; range builder = short survey → generated bands → Range Manager edit screen with per-band editable fields. Offer flow: draft → see range/peers/history → route through pre-approval → interactive letter. Cycle exec summary = the health strip (budget burn / market position / % below range) updating as recommendations land. Exports: one-click executive-summary export is specifically praised.
- No public self-serve product tour; demos are sales-gated. Release notes embed feature walkthrough videos (Budget Pools, Range Manager) — best public source of actual screens.

### Review sentiment (G2 4.7/5, n=20)
- Praise: *"easy to digest visuals on each page… I can get the data I need and feel confident about it"*; *"force multiplier for our tiny People Team"* (Paylocity sync, no manual range upkeep); *"customize benchmarks based on our funding, stage and location… data updates every quarter"*; board-recommended credibility.
- Complaints: no real-time two-way HRIS sync; no termination/backfill tracking by level; six-figure pricing at full suite; thin data outside tech / limited size-industry filtering; one 6/10 review citing weak demo/support experience ("clear the company is still in early stages").

### Takeaways for Comp Studio
1. **WS-G (health strip):** OpenComp's exec summary proves the pattern — exactly three live aggregates (budget burn, market position, % below guideline) recomputed on every edit. Mirror with: pool consumed, position vs. value-band anchor, # advisors outside generosity guardrails.
2. **WS-G (guardrails):** "Identify where pay falls outside your guidelines" is passive flagging, not blocking — guardrails as visible deviation badges on a scenario row outperform hard validation.
3. **9a (benchmark provenance):** Their Spring 2025 pivot to Multiple/Custom Benchmarks shown *side-by-side with provenance* validates labeling each anchor with source + as-of date; quarterly-refresh framing ("reflects current pay from companies like ours") is the trust language users quote back.
4. **9b (band placement):** Range Builder's strategy-survey → generated bands → editable Range Manager is the adoption-winning sequence: generate a defensible default, then allow per-band overrides — never force manual band entry first.
5. **WS-C (feedback/audit):** Offer approvals with a "clear, auditable timeline" plus auto-generated personalized letters maps directly to proposition letters + audit log; the letter is a render of the approved scenario state, not a separate artifact.

### Sources
- https://www.opencomp.com/ + /pricing-plans + /compensation-management-software + /product/intelligent-offers + /product/pay-equity-analysis-tools + /product/total-rewards-statements + /product/pay-strategy-and-salary-ranges — live module/pricing pages
- https://success.opencomp.com/opencomp-release-notes/opencomp-release-notes — primary release notes (2024-01 → 2025-11)
- https://www.selectsoftwarereviews.com/reviews/opencomp — hands-on walkthrough, pricing floor, cons, user interview
- https://www.vendr.com/marketplace/opencomp — negotiated pricing bands
- https://www.g2.com/compare/opencomp-vs-payfactors — G2 rating + quotes
- https://softwarefinder.com/hr/opencomp/reviews — review quotes
- https://www.businesswire.com/news/home/20220628005345/en/ (Range Builder launch) and /20230425005418/en/ (Gusto partnership, dataset stats)
- https://www.youngju.dev/blog/... — source of the **disputed** Pave-acquisition claim (treated as unreliable)
