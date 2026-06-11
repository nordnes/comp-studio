# Pequity — Deep Dive

**Service:** https://pequity.com · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Full module inventory, concrete UI/workflow mechanics, verified pricing estimates, and a major 2025 structural change (ADP acquisition) all surfaced.

# Pequity (pequity.com) — Research Digest

## Positioning & Pricing
- Founded 2019/2020 by ex-Coinbase total-rewards leaders (CEO Kaitlyn Knopp). **Acquired by ADP, Oct 29 2025** — now being folded into ADP's mid-market/enterprise comp suite; expect roadmap gravity toward ADP HCM. Pitch: "spreadsheet familiarity + automation at scale," 100% configurable; target 200–2,000-employee tech-forward orgs.
- vs competitors: Pave = deeper benchmarking data network (8,000+ orgs, live HRIS-sourced); Pequity deliberately **consumes external benchmarks** (Pave, Salary.com, Mercer, Radford partnership) rather than being a primary source. Assemble = absorbed into Deel's payroll ecosystem. Pequity's differentiators it markets vs Pave: equity/cash budget **holdbacks**, multi-currency in one cycle, unified base+bonus+equity cycle, real-time mid-cycle manager edits, guideline differentiation by role/level/location.
- **Pricing:** core platform quote-only, flat (not per-manager) — crowdsourced medians ~$16.8K/yr (50–200 emp), ~$84K (200–1K), ~$192K (1–2K). **Market Pulse data sold à la carte:** Single Job $149 · Job Family $999 · Full Dataset from $9–10K/yr (free with platform).

## Feature Inventory (by module)
- **Comp Cycle:** merit/promotion/equity/bonus in one cycle; top-down + bottoms-up budgets, multiple budgets & merit matrices, slush funds/holdbacks, "plan local, budget USD," dynamic increase logic, compa-ratios, configurable flags, **forced justification** on out-of-guideline entries, column resize/reorder/branding, custom approval flows, mid-cycle edits. 2025: self-create cycles, direct CSV upload.
- **Ranges:** central band store; custom job structures, metadata fields, column naming, comp elements; granular permissions; real-time push of updates; outlier visibility for execs.
- **Approvals Center** (replaced older "Offers" product): automated chains for offers/transfers/promotions/off-cycle; self-service chain builder, field-level visibility/required rules, formula-calculated fields, comments, approve/reject/edit, optional skip-re-approval rule; "clean, auditable flow for every comp decision."
- **Market Pulse:** "first predictive comp dataset" — 15K+ orgs, 1.09M+ data points, 98 countries, 950+ roles; P50/P75 for salary/bonus/equity/TC; quarterly refresh; **6/12-month forecasted pay** from market trends, inflation, layoffs, talent density.
- **People & Cycle Insights:** dashboards for budget utilization, **pay-equity gaps**, accept/reject rates, manager behavior, boardroom reports.
- **Employee Portals / Comp Overview:** branded total-rewards statements for employees & managers.
- **Salary Board:** automated candidate-facing range sharing for job posts (transparency-law support).
- **AI (2024–2026):** *Copilot* — natural-language formula build ("create a merit matrix based on @rating"), step-by-step formula explanation mid-cycle, bulk edits ("decrease all increases by 1%"); *AI Insights* — NL report generation; *Paygent* (newest) — JD generation, leveling suggestions, band-build guidance, benchmark best-practice advice; roadmap: automated range building with built-in equity checks, org-data-aware advice.
- **Integrations/Security:** 50–60+ HRIS, ATS (Greenhouse/Ashby/Lever), cap-table, API + SFTP; SOC 2 Type 2, GDPR, MFA, SSO, RBAC, audit trails, pen-testing.

## Key Workflows
- **Offer:** recruiter starts in Greenhouse via Chrome extension → Pequity becomes field source-of-truth → comp tables + peer/range comparison shown inline → automated approval chain → approved values written back to Greenhouse; optional EEOC/demographic sync feeds pay-equity views. Pitch: "offers in hours, not days."
- **Cycle:** HRIS census sync → configure columns/logic/budgets (or via Copilot) → managers plan with live guardrails/flags → layered approvals with change tracking → reward letters. Notion case: cycle time 2 weeks → 6 days despite more approvers.

## UI/UX Documentation
- Spreadsheet-metaphor planning grid (configurable columns, flags, branded styling) is the core surface; budget visualizations alongside.
- **Visual Offers:** interactive branded candidate page — total-rewards breakdown (salary/equity/benefits), perks & eligibility rules, **wealth-growth modeling over time**, confetti moment. No public static screenshots; demos are gated ("View Demo" → sales). Product tour lives at pequity.com/solutions.
- Recipient-facing surfaces: Visual Offers (candidates), Salary Board (candidates), Employee Portals (employees/managers).

## Review Sentiment
- Thin public review base: G2 page exists but essentially review-empty; Capterra/TrustRadius no results — sentiment comes from vendor case studies + analyst sites (treat accordingly).
- Praise: *"stood out for the specific kinds of approvals/approval sequencing we required, plus audit functionality (not all audit functionality is created equally!)"* (AHEAD); *"remarkable adaptability… flexibility to tailor the software"* (Notion); *"candidate accept rate went up after switching from a PDF-based comp narrative"* (G2 via Zendikt, 2026).
- Criticism patterns: less benchmark depth than Pave, planning maturity behind Pave, opaque pricing, complex custom rules can require vendor support, low brand recognition; post-ADP integration uncertainty.

## Takeaways for Comp Studio
1. **WS-C (feedback/approvals):** Pequity's winning pattern is approval chains with field-level rules + *forced justification* when an entry colors outside guidelines, plus comment threads on each request and a "skip re-approval" escape hatch. Map: every advisor-scenario edit that breaches a guardrail should demand a stored justification, and the audit log should treat approval-chain state as first-class.
2. **WS-G (info design/guardrails):** guardrails are rendered as *configurable flags inline in the planning grid* (compa-ratio, range position, budget burn) rather than blocking modals — visibility-first, block-second. The exec/operator split (dashboards of outliers for execs, granular controls for operators) is a useful IA pattern.
3. **9a (benchmark provenance):** Pequity's credibility move is explicit provenance metadata — 15K orgs / 1.09M points / 98 countries / quarterly refresh / P50-P75 — surfaced next to every number, plus *forecast* benchmarks (6/12-month outlook). Comp Studio's benchmark anchors should carry source, date, sample, and percentile labels the same way.
4. **9b (band placement):** band placement is communicated via compa-ratio + peer comparison at decision time (offer screen shows candidate vs range vs peers before approval). For advisors: show each grant against the value-band anchors at the moment of scenario sign-off, not in a separate report.
5. **Recipient surface:** the Visual Offer (interactive total-rewards page with growth modeling, replacing a static PDF) is Pequity's most-cited differentiator and reportedly lifted accept rates — direct prior art for Comp Studio's proposition-letter surface (interactive net-of-strike trajectory > static draft), within the "discussion draft" framing.

## Sources
- https://pequity.com/ — product overview, AI FAQ, security
- https://pequity.com/solutions/comp-cycle — cycle feature list, Copilot
- https://pequity.com/solutions/ranges — Ranges module
- https://pequity.com/solutions/data — Market Pulse stats & pricing
- https://pequity.com/solutions/approvals + https://helpcenter.pequity.com/support/approvals-center-guide — approvals mechanics
- https://helpcenter.pequity.com/support/how-does-the-pequity-platform-serve-both-hr-teams-executives- — module inventory, 2025 enhancements
- https://helpcenter.pequity.com/support/paygent-your-intelligent-compensation-assistant — Paygent
- https://blog.pequity.com/meet-pequity-copilot-supercharge-your-compensation-cycles-with-ai — Copilot launch
- https://pequity.com/solutions/digital-offers — Visual Offers
- https://pequity.com/compare-pave — vendor's Pave comparison
- https://support.greenhouse.io/hc/en-us/articles/7156392502939-Pequity-integration — offer workflow detail
- https://mediacenter.adp.com/2025-10-29-ADP-Acquires-Pequity — acquisition
- https://www.zendikt.com/product/pequity — pricing estimates, editorial strengths/weaknesses
- https://checkthat.ai/brands/pequity — review-platform absence
- https://pequity.com/case-studies/ahead-2 + /case-studies/notion — customer quotes
- https://peopleopsclub.com/software/pequity, https://sourcrlab.com/tools/pequity, https://us.fitgap.com/products/048981/pequity — third-party reviews/pricing

 I've got solid material here with the ADP acquisition from October 2025 as a key finding, so I can now pull together the digest. I'm organizing this around the requested structure—positioning and pricing, feature breakdown by module, core workflows, UI documentation, review sentiment, and implications for Comp Studio—targeting around 1500 tokens and including the research-value header and sources.
