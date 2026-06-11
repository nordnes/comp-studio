# Pave — competitor deep-dive (2026-06-11)

> Research note: Pave's help center (support.pave.com) migrated from Zendesk to a client-rendered Brainfish app; article bodies do not render to plain fetches and web.archive.org is blocked in this environment. Help-center claims below were extracted via search-engine snapshots of the named articles and are tagged with their canonical URLs. Treat exact phrasing as paraphrase unless quoted.

## Snapshot — positioning, target user, status, pricing

- **What it is:** "PaveOS — the AI compensation platform / the AI-powered operating system for compensation." Full-suite comp software: real-time benchmarking, job pricing & pay bands, merit cycles, total-rewards communication, and visual offer letters. https://pave.com/ , https://www.pave.com/products
- **Target user:** compensation & total-rewards teams from "startup in a garage" to 50,000-person enterprise; logos cited on product pages: Dropbox, Ramp, Grammarly, Ancestry, Clio, GoFundMe, Workato (https://www.pave.com/products/visual-offer-letter, https://www.pave.com/products/total-rewards).
- **Status:** Founded 2019 by Matt Schulman (YC; ex-Facebook). $100M Series C led by Index Ventures, June 2022, at **$1.6B valuation**; simultaneously **acquired Option Impact from Morgan Stanley (Shareworks)**, making it "the largest compensation provider for private companies" ([finsmes](https://www.finsmes.com/2022/06/pave-raises-100m-in-series-c-funding.html), [Schulman on X](https://x.com/Matthewschulman/status/1541789084548403201)). ~288 employees per Tracxn (Apr 2026) ([tracxn](https://tracxn.com/d/companies/pave/__W0ybGw1xTBNeZY4HHJFu9yGpBzwamdJQABcnwqGf7nY)). 2025: launched **Pave Agent** ("Comp Agent") and **Paige** AI agents (https://www.pave.com/products/comp-agent, https://www.pave.com/blog-posts/whats-new-in-pave-q4-2025-product-releases).
- **Pricing (as of 2026-06-11):**
  - **Market Data Lite — free** for companies with 1–200 employees (https://www.pave.com/pricing).
  - **Market Data Pro** and **Full Suite** (Market Data Pro + Team View + Market Pricing + Compensation Planning + Total Rewards Portal + Visual Offer Letter) — quote-only, "Book a demo" (https://www.pave.com/pricing).
  - Third-party estimates [uncertain]: **$8–20/employee/month**; ~$15k–40k/yr at 100–500 employees, ~$40k–90k/yr at 500–1,500; implementation $3k–25k+; 10–25% multi-year discounts ([Vendr](https://www.vendr.com/marketplace/pave), [SoftwareFinder](https://softwarefinder.com/hr/pave)).

## Complete feature inventory — by module

Tags: **[R]** relevant to Advisor Comp Studio, **[NR]** not relevant.

### Market Data Lite (free benchmarking) — https://www.pave.com/products/market-data-lite
- [R] Real-time comp data from **8,700+ participating companies**; benchmarks for 200+ job families across 16 functions; overall U.S. + 1 extra market; unlimited seats/queries/exports (pricing page).
- [R] **New-hire equity benchmarks** included even in free tier — the comparable for advisor-grant "market anchors."
- [NR] Automated/persistent HRIS-ATS data submission as the price of entry (give-to-get model).

### Market Data Pro — https://www.pave.com/products/market-data-pro
- [R] Base salary, target-bonus %, variable pay, total cash, **new-hire equity, refresh equity, and unvested-equity-holding benchmarks** (https://www.pave.com/pricing).
- [R] **Dynamic equity valuation methodologies — "total vs. annualized values, and actual vs. intended values"** — i.e., the same grant expressed in multiple valuation frames, the analogue of %FD vs $ toggling (pricing page, "Advanced Insights & Features").
- [R] **Equity practice insights: burn rates, vesting schedules, vesting structures** (pricing page).
- [R] Calculated Benchmarks; geo-differentials tool; peer groups; 55+ countries, 90+ metros; custom report builds/exports.
- [NR] Pave Data Lab insights community; Hot Jobs Index (https://www.pave.com/pavedatalab).

### Market Pricing & Pay Bands — https://www.pave.com/products/market-pricing
- [R] Blend multiple data sources to price jobs; build/update **compensation bands**, model band scenarios, **flag ranges needing adjustment when market shifts and show employee impact**.
- [R] Survey & job-code fallbacks, level progressions, geo differentials to fill data gaps.
- [R] Q4 2025: **AI Auto-Smoothing** (detects outliers, fills gaps via geo-differentials + regression) and a dedicated **Band Editor** (https://www.pave.com/blog-posts/whats-new-in-pave-q4-2025-product-releases).
- [NR] Custom survey mapping logic for purchased third-party surveys.

### Compensation Planning (merit cycles) — https://www.pave.com/products/compensation-planning
- [R] Centralized budgets (top-down & bottom-up), **built-in guardrails** "to reduce costly mistakes, limit exceptions, and ensure every pay decision aligns with policy and budget" — the compa-ratio-guardrail pattern.
- [R] Managers see team members with **compa-ratios and live impact of each recommendation on compa-ratio and budget** ([Pipedrive case study](https://www.pave.com/case-studies/how-pipedrive-transformed-promotions-with-monthly-compensation-planning-cycles), [compa-ratio explainer](https://www.pave.com/blog-posts/what-is-compa-ratio)).
- [R] Approval chains, granular permissioning (praised by Ramp testimonial), custom columns, planning windows, flexible worksheet views, contextual comments.
- [R] **Cycle Insights** analytics: real-time budget utilization, fully configurable bar chart (Q4 2025).
- [R] **Reward Letters**: white-labeled letters generated from cycle data using **handlebars syntax + basic HTML with conditional tags** referencing cycle fields (current salary, increase, new salary, equity grant); delivered into the employee's Total Rewards portal under a "Reward Letters" top-nav header (https://support.pave.com/hc/en-us/articles/6300367739159-Reward-Letters).
- [NR] Monthly promotion cycles; HRIS write-back.

### Visual Offer Letter — https://www.pave.com/products/visual-offer-letter
- [R] Centralized offer creation, approvals, delivery; offer form with comp fields (leave irrelevant ones blank); **equity can be configured as value "gross or net"** — net-of-strike is an explicit setup decision (https://support.pave.com/hc/en-us/articles/4430752450839-Creating-and-sending-Visual-Offer-Letters-in-Pave).
- [R] Branded candidate page: company colors, values/mission blocks, personalized messaging on "company branded letterhead."
- [R] **Equity slider** (see UI section) — the headline interaction.
- [R] Send via Pave email or **"Copy offer link"** for manual sending; permissions limited to Admins/Recruiters/Recruiting Managers by default.
- [NR] ATS sync: Greenhouse (https://support.pave.com/hc/en-us/articles/4430806035351-Visual-Offer-Letters-with-Greenhouse), Lever, Ashby.

### Total Rewards Portal — https://www.pave.com/products/total-rewards
- [R] Personalized, always-on portal per employee: salary, bonus/variable targets on a payout timeline, **equity with vesting timeline**, **place in band**, benefits values.
- [R] **Compensation simulator + share-price slider** for modeling future earnings under personal and company growth.
- [R] White-label: colors, copy, personalized benefits, optional learning hub.
- [NR] Benefits/perks itemization, retirement, PTO valuation.

### Team View — https://www.pave.com/products/team-view
- [NR mostly] Manager-facing roster view of team comp (salary + equity) with band placement; useful only as a pattern for "all advisors at a glance" roster.

### Pave AI — https://www.pave.com/products/comp-agent
- [R-pattern] **Pave Agent / Comp Agent**: AI comp analyst — builds salary bands for net-new roles "in minutes," compares pay vs market, proactively flags retention risk, pay-equity issues, compression; every answer grounded in the 8,700-company dataset.
- [R-pattern] **Paige** (Q4 2025 beta, extending into 2026): chat-based comp-intelligence agent for benchmarks, equity practices, merit-cycle outcomes; roadmap = "you vs market" comparisons (https://www.pave.com/blog-posts/whats-new-in-pave-q4-2025-product-releases).
- [NR] AI job matching/leveling against Pave's job architecture (https://pave.com/blog-posts/ai-powered-job-matching-works).

### Integrations & API — https://www.pave.com/products/integrations , https://pave.com/products/api
- [R-context] HRIS: Workday, ADP, BambooHR, Rippling (incl. in-Rippling purchase of Market Data Pro — https://www.rippling.com/blog/rippling-pave-enhancements); ATS: Greenhouse, Lever, Ashby; **equity/cap-table: Shareworks, E*Trade; Carta via CSV upload rather than live API** ([search synthesis of integrations docs](https://support.pave.com/hc/en-us/articles/4430975849495-Market-Data-Connections-Overview)) [uncertain on current Carta status]; Culture Amp planning integration; UKG marketplace listing; public Pave API.

## UI/UX documentation

**IA / navigation.** Web app at app.pave.com. Primary **left sidebar** navigation with module entries (help docs instruct: "navigate to the menu on the left side of the page, and select Offers"); page-level primary actions sit top-right ("click on the Send Offer button located on the top right") (https://support.pave.com/hc/en-us/articles/4430752450839-Creating-and-sending-Visual-Offer-Letters-in-Pave). Marketing nav mirrors the module split: Benchmarks (Data Lite/Pro) vs Management (Market Pricing, Compensation Planning, Team View, Total Rewards, Visual Offer Letter).

**Visual Offer Letter — candidate page (the key screen).**
- **Access model:** candidate authenticates with the email the recruiter has on file ("the email address where you received the email from Pave"); **the offer cannot be accepted in Pave**; once the candidate accepts/rejects or becomes an employee, **login to view the offer is revoked** (https://support.pave.com/hc/en-us/articles/4577135240855-Visual-Offer-Letter-as-a-Candidate). The offer page is a discussion artifact, not a signing surface — exactly the "discussion draft, not a binding offer" stance.
- **Page structure** (from product page + help center): (1) branded hero with company letterhead, values/mission and a personalized recruiter message; (2) total-package summary stacking base salary + target bonus + new-hire equity + benefits into one visual; (3) interactive **equity section** with the share-price slider and vesting-over-time view; (4) benefits detail. "Candidates instantly understand how base salary, target bonus, new hire equity, and benefits come together" (https://www.pave.com/products/visual-offer-letter).
- **The equity slider** (https://support.pave.com/hc/en-us/articles/18768191931159-Configurations-for-the-Equity-Slider): one of **three company-level slider types**, applied uniformly to *all* equity sections (Options, RSUs, RSAs, Common Stock) in both Total Rewards and VOL:
  1. **Multiples** — value growth as 1x/2x/3x of current valuation/share price ("frequently leveraged by early-mid stage startups");
  2. **Percentages** — growth as % increases on current valuation/share price (late-stage/public);
  3. **Open Editor** — candidate types an arbitrary share price.
  Admin-configurable: **slider range (min/max), steps (visible tick marks), default position, increments, and "milestones — commentary added to positions along the slider"** to give contextual meaning to growth points. Equity value can be shown **gross or net** (of strike) per onboarding configuration. Q4 2025 added **per-pay-type equity settings** (was global) (https://www.pave.com/blog-posts/whats-new-in-pave-q4-2025-product-releases).
- **Sending flow:** select candidate → offer record → "Send Offer" (Pave-branded email) or "Copy offer link"; ATS-triggered creation via Greenhouse/Lever/Ashby webhooks.

**Total Rewards portal.** Personal dashboard with top-nav tabs (e.g., **"Reward Letters" header in the top navigation bar** once a cycle is finalized — https://support.pave.com/hc/en-us/articles/6300367739159-Reward-Letters); vesting timeline visualization; band placement; compensation simulator with the same slider grammar. Dropbox: "this is the first time I've seen our employees… saying 'This is absolutely awesome.' This never happens with HR tools" (https://www.pave.com/products/total-rewards).

**Band / cycle screens.** Market Pricing: benchmark-review screen "tailor-made for compensation professionals" with fallback/level-progression/geo-diff resolution tools; Band Editor with AI auto-smoothing of jagged ranges; out-of-band flags with employee-impact preview (https://www.pave.com/products/market-pricing). Compensation Planning: spreadsheet-like worksheets with custom columns, inline compa-ratio, live budget bar, comments per row; Cycle Insights dashboard with configurable bar charts (https://www.pave.com/products/compensation-planning).

**Visual tone & accessibility.** Clean SaaS aesthetic, white cards, blue/purple accent palette, heavy use of large numeric callouts and stacked-area "growth" charts (product screenshots on module pages). No public WCAG/VPAT statement found [uncertain]. Mobile: candidate/employee pages are responsive web; no native app found.

**Review evidence on UX.** G2 users praise the interface but note it "sometimes requires more steps than necessary to get to specific details" and "could use more flexibility when customizing reports and export options" (https://www.g2.com/products/pave/reviews). Ramp on permissioning: "the ability to ensure the right people can see the right things is fantastic… much better than spreadsheets" (https://www.pave.com/products/compensation-planning).

## Known criticisms & limitations

- **Benchmark granularity/precision:** "market benchmarks are not as granular or reliable as other sources"; depth "varies by region and role" — global orgs supplement with outside surveys (https://www.g2.com/products/pave/reviews, https://www.selecthub.com/p/compensation-management-software/pave/).
- **Geographic coverage gaps** for some operating countries (G2, ibid.).
- **Reporting/export rigidity** and extra navigation steps (G2, ibid.).
- **Cycle annoyances:** file uploads during a cycle land in the employee comment stream, "muddling" comments (G2, ibid.).
- **Support complaints** on Trustpilot: "They don't respond on time… customer support is non existential" (https://www.trustpilot.com/review/pave.com) [small sample].
- **Legality/optics debate:** HN thread "Ask HN: Why is Pave legal?" likens give-to-get real-time wage data to RealPage-style coordination (https://news.ycombinator.com/item?id=41510103).
- **No e-sign / acceptance:** the VOL explicitly cannot capture acceptance — a gap if you need a binding flow (https://support.pave.com/hc/en-us/articles/4577135240855-Visual-Offer-Letter-as-a-Candidate).
- **Carta via CSV** rather than live cap-table sync [uncertain, per integration docs] — equity data freshness depends on uploads.

## Data, benchmarks & methodology

- **Source:** persistent, automated connections to customers' HRIS/ATS/EMS (and equity systems); no survey forms. Records are ML-matched to Pave's job architecture, then **aggregated and de-identified** into the benchmark database (https://www.pave.com/products/market-data-methodology, https://support.pave.com/hc/en-us/articles/4440857010071-Market-Data-Overview-and-Methodology-Guide).
- **Lineage:** Option Impact (the long-standing pre-IPO equity survey from Shareworks/Advanced-HR) acquired June 2022 and folded in; ~6K companies / 645K employee records by Sept 2023, **8,700+ companies** by 2026 (https://x.com/Matthewschulman/status/1541789084548403201, https://www.pave.com/pricing).
- **Quality signaling:** every benchmark ships with **sample size and a data-consistency indicator**; Pave notes equity needs ~**10× more data points** than salary for equal consistency (https://www.pave.com/blog-posts/pave-transforms-equity-compensation-benchmarks-using-machine-learning).
- **Equity benchmark frames:** new-hire vs refresh vs unvested holdings; total vs annualized; actual vs intended value — i.e., equity expressed both as ownership and dollar value with explicit valuation methodology (https://www.pave.com/pricing).
- **Cadence:** continuous/"real-time" rather than annual survey cycles; new pay types (e.g., Annual Bonus Percent) and geos added quarterly (https://www.pave.com/blog-posts/whats-new-in-pave-q4-2025-product-releases).

## Integrations & security/compliance

- **Integrations:** Workday, ADP, BambooHR, Rippling, UKG (HRIS); Greenhouse, Lever, Ashby (ATS, incl. VOL triggers); Shareworks, E*Trade (equity), Carta (CSV) [uncertain]; Culture Amp; public API (https://www.pave.com/products/integrations, https://pave.com/products/api).
- **Security:** SOC 2 Type II; encryption at rest & in transit; dedicated security team; **bi-annual third-party pen tests; paid bug bounty**; SSO; role-based access control; GDPR & CCPA adherence (https://www.pave.com/blog-posts/pave-receives-soc-2-type-ii-certification, https://www.pave.com/security-and-privacy).

## Patterns worth borrowing for Advisor Comp Studio

1. **Milestone-annotated valuation slider.** Pave's slider supports "milestones — commentary added to positions along the slider." Pin Conservative/Base/Aggressive FDV scenarios as named, annotated tick marks on the Comp Trajectory slider instead of unlabeled positions; the annotation carries the narrative ("Series C anchor: $118,707/share equivalent").
2. **Three slider semantics (multiples / % / open editor), one global setting.** Early-stage default = valuation multiples (1x/2x/3x of TGE FDV $600M) — more intuitive for advisors than absolute prices; offer an "open editor" escape hatch for sophisticated advisors. Keep the mode a single app-level setting so every chart agrees, exactly as Pave applies one slider type to all equity sections.
3. **Gross-vs-net as an explicit, documented configuration.** Pave forces a deliberate "value (gross or net)" decision at setup. The Studio already mandates net-of-strike — surface that as a visible badge/legend on every figure ("all values net of $1,572.95 strike"), not just an engine invariant.
4. **Email-bound, self-expiring share link.** Candidate links are tied to the email on file and die once the offer is decided. Apply to the watermarked Proposition: per-advisor link + auto-expiry on signature/decline, complementing the watermark.
5. **Handlebars-templated reward letters fed by cycle data.** The Proposition document as a template with conditional blocks bound to engine output (tier, scenario table, consents status), so legal copy stays verbatim while numbers stay live.
6. **Inline compa-ratio with live impact preview.** Pave shows managers each edit's effect on compa-ratio and budget *as they type*. Mirror for tier guardrails: editing an advisor grant should immediately recolor the compa-ratio chip and the remaining-pool budget bar.
7. **Sample-size / confidence badges on benchmarks.** Attach a provenance chip to every market anchor in the value-band view ("n=14 FAST-tier comps, updated 2026-05") so discussion drafts carry data credibility.
8. **Out-of-band flagging with downstream impact.** Market Pricing flags ranges that drifted from market and shows which employees are affected; the Studio equivalent: when a scenario set or pool assumption changes, flag every saved advisor proposition that now violates a guardrail.

## Sources

**[primary] — Pave properties**
- https://pave.com/ · https://www.pave.com/products · https://www.pave.com/pricing (pricing, plan contents, Market Data Lite/Pro comparison; accessed 2026-06-11)
- https://www.pave.com/products/visual-offer-letter · https://www.pave.com/products/total-rewards · https://www.pave.com/products/market-pricing · https://www.pave.com/products/compensation-planning · https://www.pave.com/products/market-data-pro · https://www.pave.com/products/market-data-lite · https://www.pave.com/products/team-view · https://www.pave.com/products/comp-agent · https://www.pave.com/products/integrations · https://pave.com/products/api · https://www.pave.com/products/market-data-methodology · https://www.pave.com/security-and-privacy
- Help center (Brainfish; content via search snapshots): https://support.pave.com/hc/en-us/articles/4577135240855-Visual-Offer-Letter-as-a-Candidate · https://support.pave.com/hc/en-us/articles/4430752450839-Creating-and-sending-Visual-Offer-Letters-in-Pave · https://support.pave.com/hc/en-us/articles/18768191931159-Configurations-for-the-Equity-Slider · https://support.pave.com/hc/en-us/articles/6300367739159-Reward-Letters · https://support.pave.com/hc/en-us/articles/4440857010071-Market-Data-Overview-and-Methodology-Guide · https://support.pave.com/hc/en-us/articles/4430975849495-Market-Data-Connections-Overview · https://support.pave.com/hc/en-us/articles/4430806035351-Visual-Offer-Letters-with-Greenhouse
- Blog/changelog: https://www.pave.com/blog-posts/whats-new-in-pave-q4-2025-product-releases · https://www.pave.com/blog-posts/pave-transforms-equity-compensation-benchmarks-using-machine-learning · https://www.pave.com/blog-posts/what-is-compa-ratio · https://www.pave.com/blog-posts/pave-receives-soc-2-type-ii-certification · https://www.pave.com/blog-posts/ai-powered-job-matching-works · https://www.pave.com/case-studies/how-pipedrive-transformed-promotions-with-monthly-compensation-planning-cycles
- https://x.com/Matthewschulman/status/1541789084548403201 (Series C + Option Impact acquisition)

**[review]**
- https://www.g2.com/products/pave/reviews · https://www.g2.com/products/pave/reviews?qs=pros-and-cons
- https://www.gartner.com/reviews/market/compensation-management-software/vendor/pave/product/pave-suite
- https://www.trustpilot.com/review/pave.com
- https://www.selecthub.com/p/compensation-management-software/pave/
- https://news.ycombinator.com/item?id=41510103 (HN legality debate)

**[secondary]**
- https://www.vendr.com/marketplace/pave [uncertain — third-party price estimates] · https://softwarefinder.com/hr/pave [uncertain]
- https://www.finsmes.com/2022/06/pave-raises-100m-in-series-c-funding.html · https://tracxn.com/d/companies/pave/__W0ybGw1xTBNeZY4HHJFu9yGpBzwamdJQABcnwqGf7nY · https://research.contrary.com/company/pave
- https://www.rippling.com/blog/rippling-pave-enhancements · https://support.cultureamp.com/en/articles/8281918-faqs-pave-compensation-planning-integration · https://carta.com/carta-vs-pave/
