# Levels.fyi — competitor deep-dive (2026-06-11)

> Researched 2026-06-11 via live fetches of levels.fyi pages + web search. Relevance tags: **[R]** = relevant to Advisor Comp Studio (equity/token comp modeling, tiers, scenario walks, advisor-facing docs, governance), **[NR]** = not relevant.

## Snapshot — positioning, audiences, status, pricing both sides

- **What it is:** The de-facto tech-compensation transparency platform — crowdsourced, partially document-verified salary data ("Search 1M+ data points for different companies, job titles, career levels, and locations" — homepage meta, fetched 2026-06-11, https://www.levels.fyi/), plus a two-sided business: candidate services (negotiation coaching, resume review) and employer products (benchmarking data, Interactive Offers, Talent Pool).
- **Origin/status:** Founded 2017 by Zaheer Mohiuddin and Zuhayeer Musa as a static HTML page comparing SWE career ladders across Google/Microsoft/Facebook, built "in coffee shops" with hosting "less than a cup of coffee a year" (Indie Hackers interview, https://www.indiehackers.com/interview/building-levels-fyi-in-coffee-shops-and-growing-to-profitability-da7a4f5d63). Bootstrapped to profitability; third-party revenue estimate ~$2.8M (Prospeo, https://prospeo.io/c/levels-fyi-revenue) [uncertain]. Footer "© 2017-2026 Levels Fyi Inc." confirms active. Tagline: **"Get Paid, Not Played."**
- **Consumer pricing (2026-06-11, https://www.levels.fyi/services/):** data free; **Negotiation Standard/Startup $1,250** ($10k guaranteed increase or refund), **Premium $2,450** ($15k guarantee, multiple offers, includes 1 month benchmarking access), **Leadership $5,000** ($40k guarantee, Director+/C-suite, 6 months support), **Startup Offer Evaluation $250** (creditable to full package).
- **Employer pricing — benchmarking (2026-06-11, https://www.levels.fyi/offerings/data/):** **Plus $800/mo** (billed $9,600/yr), **Premium $2,000/mo** (annual commitment, $24,000/yr per embedded contract), **Enterprise $4,000/mo** (annual). One-off **Trailing Data** purchase: 6-month slice (75k+ points) shown at **$10,000**; 12-month (145k+) and 24-month (220k+) plans also offered. Self-serve Stripe checkout for Plus.
- **Employer pricing — Interactive Offers (2026-06-11, https://www.levels.fyi/offerings/interactive-offers):** four tiers **Free / Plus / Premium / Enterprise**; tier prices not published (Free & Plus = "Get Started Free", Premium/Enterprise = "Book a Demo"); bundled "in all of our Compensation and Talent plans" — the data-pricing page maps Plus→"Interactive Offers, Growth", Premium→"Scale", Enterprise→"Enterprise".
- **Scale claims (benchmarking page, dated 2026-06-11):** "Avg. TC $285k", "Data Points 245k+", "Companies 1,200+", "Titles 150+", "75,000+ data points in last 6 months"; customers incl. Netflix, ByteDance, Palantir, Bloomberg, Arm, Coupang, Thomson Reuters.
- **Historical price point:** the dataset was sold at ~$1,200/mo in April 2022 (HN, https://news.ycombinator.com/item?id=30963833) — pricing has roughly tripled since at the low tier.

## Complete feature inventory — by product, EXHAUSTIVE

### Consumer (free)
| Module | URL | Tag | Notes |
|---|---|---|---|
| Salary tables by title | https://www.levels.fyi/t/software-engineer | [R] | Core data product; per-level percentile tables |
| By location / by company / by industry | https://www.levels.fyi/locations · /companies · /industry | [NR] | Browse axes |
| **Level-ladder comparison (signature)** | https://www.levels.fyi/ (compare widget) + https://www.levels.fyi/create.html | **[R]** | Side-by-side career-ladder mapping across companies; crowdsourced "Add Level Mapping" form; "standard leveling" normalization (see UI section) |
| Salary Heatmap (beta) | https://www.levels.fyi/heatmap/ | [R] | US DMA-region choropleth; percentile selector; regional variants (bay-area, europe, canada, india); "Powered by Borderly" |
| Salary Calculator | https://www.levels.fyi/calculator/ | [R] | Total-comp calculator |
| Chart Visualizations | https://www.levels.fyi/charts.html | [R] | Alternate chart views of the dataset |
| Real-time Percentiles (consumer view of benchmark) | https://www.levels.fyi/benchmark | [R] | Live percentile explorer, gated |
| Verified Salary Stream | https://www.levels.fyi/verified/ | **[R]** | Bi-weekly email of document-verified offers; "Search Offer Letters" marked COMING SOON (search by company/level, filter by gender, "see the number of shares") |
| Internship salaries | https://www.levels.fyi/internships/ | [NR] | |
| H-1B salaries | https://www.levels.fyi/h1b/ | [NR] | Public LCA data angle |
| Compare Benefits (+ add) | https://www.levels.fyi/benefits/ | [NR] | Crowdsourced benefits |
| Annual Pay Report | https://www.levels.fyi/2025/ | [R] | Marketing/analysis flagship |
| Top Paying Companies leaderboard | https://www.levels.fyi/leaderboard/ | [NR] | |
| Meeting Cost calculator | https://www.levels.fyi/cost/ | [NR] | Novelty tool |
| Jobs board + Inbox | https://www.levels.fyi/jobs · /inbox | [NR] | |
| Community | https://www.levels.fyi/community | [NR] | Blind-style feed |
| Add Salary (incl. proof-doc upload) | https://www.levels.fyi/salaries/add | **[R]** | Entry point of the verification pipeline |
| Mobile app | https://www.levels.fyi/download | [NR] | iOS/Android |
| Currency & locale settings | site-wide | [R] | USD/INR etc., annual/monthly toggle, Indic lakh number display |
| Blog / Press / About | https://www.levels.fyi/blog/ · /press · /about/ | [NR] | |

### Consumer (paid services)
| Module | URL | Tag | Notes |
|---|---|---|---|
| Negotiation coaching (4 packages, $1,250–$5,000) | https://www.levels.fyi/services/ | [R] | Money-back guaranteed minimum increases; coaches are ex-recruiters (8–10+ yrs); equity evaluation for startup offers; "300+ recent outcomes" reviews page |
| Resume review / gift | https://www.levels.fyi/services/resume/ | [NR] | |

### Employer
| Module | URL | Tag | Notes |
|---|---|---|---|
| **Interactive Offers** | https://www.levels.fyi/offerings/interactive-offers (product) · https://www.levels.fyi/employers/offer (portal/demo) | **[R]** | Candidate-facing interactive offer letters. Tier ladder (exact, 2026-06-11): **Free** — All Standard Fields, ATS Integration, 2 Licences. **Plus** — adds **Equity scenario modeling**, Custom Theme & Company Banner, 2 Custom Fields, 5 Licences. **Premium** ("Most popular") — adds **Commission Modeling for Sales Roles**, "Your Theme and Company Banner", 4 Custom Fields, 15 Recruiter Licences. **Enterprise** — adds **custom domain name**, **Variable Compensation Charts**, unlimited Custom Offer Fields and Custom Info Fields, 25+ Recruiter Licenses. → *the equity-scenario-modeling paywall line sits between Free and Plus.* Candidate access gated: "Candidates must verify their email to access offers." |
| Compensation Benchmarking | https://www.levels.fyi/offerings/data/ | **[R]** | Real-time percentiles by title/location; custom peer cuts down to single companies; individual data-point granularity; view by Levels.fyi standard leveling, your own leveling (Premium), or *other companies'* leveling frameworks (Enterprise); Data Stream w/ 3 (Premium) or 15 (Enterprise) months history via daily-refreshed Google Sheet; **Skill Index** column (0–100 seniority normalization); competitive-intelligence dossiers; custom TC formulas; metadata text search; MCP/API access (Enterprise); data-scientist support |
| Real-time Percentiles tool | https://www.levels.fyi/benchmark | [R] | The benchmarking UI itself |
| Competitive Intelligence | https://www.levels.fyi/benchmark/competitive-intelligence | [R] | Dossiers on company total-rewards practices |
| Data Explorer | https://www.levels.fyi/explorer | [R] | Employer-portal data slicer |
| Talent Pool | https://www.levels.fyi/offerings/talent · /employers/talent-pool | [NR] | Senior-talent sourcing |
| Company Profile | https://www.levels.fyi/employers/profile | [NR] | Employer branding |
| Trailing data purchase | https://www.levels.fyi/offerings/data/ (modal) | [R] | $10,000 one-off, click-through ToS w/ no-redistribution clause |
| API / MCP / CLI access | https://www.levels.fyi/api-access/ | [R] | Programmatic data access incl. an MCP server |
| Academic dataset program | https://www.levels.fyi/offerings/data/#university-research-section | [NR] | Harvard, MIT, Berkeley, Yale, etc. |
| "vs" comparison marketing pages | e.g. https://www.levels.fyi/offerings/data/radford-comparison/ (also Mercer, Payfactors, WTW, Pave, Compa) | [NR] | Positioning vs survey incumbents |
| Pequity partnership (data into comp tools) | https://www.levels.fyi/blog/levelsfyi-and-pequity.html | [R] | Distribution into comp-planning software |

## UI/UX documentation

- **IA / navigation.** Global top nav of four groups — Salaries, Jobs, Services, Community — with emoji-prefixed subnav items ("📂 All Data", "📍 Salary Heatmap", "🔥 Real-time Percentiles", "💵 Negotiation Coaching"), a persistent **"For Employers"** link, a **⌘K omnisearch** ("Google Software Engineer", "Product Manager New York City Area" quick chips), currency/locale switchers, and a floating "Negotiate" action button (`?ref=fab_home`). The Services menu deliberately interleaves "Candidate Services" and "For Employers" sections — both sides marketed in one menu (homepage, 2026-06-11).
- **The level-comparison ladder UI (signature).** Companies' career ladders render as **side-by-side vertical columns, horizontally aligned at equivalent seniority**, against a normalized "Standard" ladder; users pick companies + track (SWE, PM, etc.) and instantly see e.g. Google L5 ↔ Microsoft 63–64. Mappings are crowdsourced — "Add Level Mapping" / create.html lets anyone "map out leveling for your company" — and based "on scope / responsibilities… mostly scope and word of mouth" (Blind discussion, https://www.teamblind.com/post/how-does-levelsfyi-compare-levels-across-companies-w4sqreka). The employer-grade version is the **Skill Index**: "a numeric value in the range of 0 - 100, codifying the level, scope, and responsibility of the employee through our leveling normalization" (data FAQ, https://www.levels.fyi/offerings/data/). Background explainer: https://www.levels.fyi/blog/what-are-career-levels-ladders.html.
- **Salary table / heatmap design.** Tables group rows by company level with median + percentile TC split into Base / Stock / Bonus. The heatmap (https://www.levels.fyi/heatmap/) is a US choropleth "organized by DMA regions and accompanied by a color-coded legend"; a **single percentile selector (10th / 25th / Median / 75th / 90th)** re-paints the whole map; three color-scheme presets (Default, Purple-Red, Brown-Green); "Click into a region and uncover insights on salary percentiles, breakdown of total compensation components, and top paying companies" (on-page copy). A persistent contribute CTA: "Empower workers like yourself by contributing your salary."
- **Interactive offer candidate page.** Meta description: **"View your offer in a new light."** (https://www.levels.fyi/employers/offer). Marketing panels: "**Visualize Total Compensation — Show clarifying visuals over dense legal jargon**", "**Highlight key details — Build your new hire's story arc in with your team's**", "**Model growth scenarios — Sell the story beyond the numbers**" (https://www.levels.fyi/offerings/interactive-offers). FAQ: "Candidates can explore their total compensation, see equity growth projections, understand vesting schedules, and compare different scenarios — all in an interactive format." Branding is tiered: logo/colors/custom fields at Plus+, and at Enterprise "offers appear to come directly from your company" via custom domains. The employer portal nav splits **TOTAL REWARDS** (Compensation Percentiles, Competitive Intelligence, Data Explorer) from **TALENT ACQUISITION** (Company Profile, Interactive Offers, Talent Pool), with a public "Data Fact Sheet" PDF link.
- **Charts & interactions.** Consumer: percentile bar/branch charts, time-series in the annual pay report, chart-visualizations page; benchmark tool shows live-updating percentiles "refreshed everyday." The offerings pages embed Loom video demos and an interactive sample Google Sheet (raw-data preview) rather than screenshots.
- **Self-serve contract wizard (notable).** The Premium benchmarking buy-flow is a 3-step in-page wizard — "1 Company Info → 2 Review Contract → 3 Sign" — rendering the full SaaS agreement inline (order summary table: $2,000/mo, $24,000 annual, 8 users, 12-month term) with **draw-or-type signature capture**, then Stripe payment (https://www.levels.fyi/offerings/data/). A legal document turned into a guided UI flow.
- **Services routing wizard.** A 4-step qualifier ("Are you expecting multiple offers?" → company type → level → "Is this for an AI role?") that routes to a recommended package, including a graceful **disqualification screen** ("We Can't Help Just Yet… we don't currently support new grad or entry-level roles"). Social-proof tickers: "$2M+ negotiated this week 🎉", "+$55,800 — Average increase we've gotten for this level — L5" (https://www.levels.fyi/services/).
- **Visual tone.** Utilitarian, data-first; slate-grey brand (`theme-color: #5B6F79`); undraw-style flat illustrations; heavy logo walls and outcome-stamped testimonials ("+$89k — Robinhood"); emoji as nav iconography; AI-assistant summary buttons (ChatGPT/Claude/Gemini/Grok/Perplexity prompts baked into the footer — an AEO/SEO play).
- **Mobile.** Native iOS/Android app promoted site-wide; `apple-mobile-web-app-capable` PWA meta; heatmap and tables are responsive.

## Known criticisms & limitations

- **Selection/inflation bias.** Long-running debate that self-reporting "skews high" — high earners disproportionately report; HN threads: "Is levels.fyi biased towards high pay jobs?" (https://news.ycombinator.com/item?id=41793224) and "heavily biased toward companies where tech is their primary business" (https://news.ycombinator.com/item?id=25784294).
- **Geographic skew.** "If you use Levels.fyi data in a salary negotiation anywhere outside of SF or Seattle, you will probably get laughed at" (HN comment in the threads above); accuracy debated on Blind (https://www.teamblind.com/post/How-accurate-have-you-found-Levelsfyi-Sq644mrY).
- **Two-sided conflict of interest.** "Tell HN: Levels.fyi is selling your salary data to companies for $1200/month" (Apr 2022, https://news.ycombinator.com/item?id=30963833): "I question how they can both sell salary data to companies and also offer salary negotiation coaching." Founder Zaheer's on-record defense: "Employers already have access to this information via the main site… It's a win-win-win… HR / Eng Managers / Comp analysts often buy our data to justify internally that they should be paying more."
- **Published numbers are deliberately inexact.** "Compensation numbers are modified slightly within a close margin to preserve anonymity" (https://www.levels.fyi/verified/) — fine for browsing, a caveat for benchmarking precision.
- **Leveling mappings are soft data.** Cross-company level equivalence is "mostly scope and word of mouth" (Blind, URL above); Quora threads dispute specific mappings (https://www.quora.com/In-levels-fyi-why-does-L6-SWE-at-Google-roughly-map-to-L65-67-Principal-SDE-at-Microsoft-whereas-L6-EM-at-Google-maps-to-L63-65-EM-at-Microsoft-Despite-different-ladders-I-thought-transferring-at-same-level-was).
- **Enshittification/paywall-creep complaints.** Third-party tracker scores it 30/100 "Is Levels.fyi Getting Worse?" (https://deshittify.io/products/levels-fyi) [uncertain — single-source]; review roundups note feature gating (IGotAnOffer review, https://igotanoffer.com/en/advice/levelsfyi-alternatives-review).

## Data, benchmarks & methodology (verification pipeline)

- **Two-tier data model:** bulk self-reported submissions + a verified stream. "Although most data is self-reported from users on our site, we also have verified data… Users can opt to submit their offer letters, pay statements, and other proof documents which we use to review the self-reported data. We also receive verified information from the candidate services we offer. To date, we've collected hundreds of verified proof documents" (data FAQ, https://www.levels.fyi/offerings/data/).
- **Verification pipeline (verified stream, https://www.levels.fyi/verified/):** (1) **Proof Documents Required** (W2, Offer Letter, Pay Statement, Annual Adjustment); (2) **Outlier & Forgery Detection**; (3) **Identity Verification**. Verified entries are published "within close margin of the real number (modified slightly for further anonymity)."
- **Anonymity thresholds:** "For small companies or companies with few submissions, the company name will not be revealed. In its place, rough company size (ex. 1-10, 11-50…) and industry… will be provided" — k-anonymity-style masking.
- **Normalization:** dataset "normalized so you can compare data across organizations"; the **Skill Index (0–100)** codifies level/scope/responsibility across all supported companies; Enterprise customers can re-project salaries onto *their own* or *other companies'* leveling frameworks.
- **Freshness as the wedge:** percentiles "refreshed everyday," "no data submission required" (vs give-to-get surveys like Radford/Mercer); Twilio's VP Total Rewards: "The days of lagging survey data are moving behind us" (testimonial on the data page).
- **Distribution formats:** benchmark web tool; daily-refreshing Google Sheet (Premium+); MCP/API (Enterprise); one-off trailing-data spreadsheets under a click-through no-redistribution agreement.

## Integrations & security/compliance

- **ATS:** "Our platform currently integrates with Greenhouse and Ashby… generate interactive offers directly from your existing workflow" (Interactive Offers FAQ).
- **Security:** "SOC 2 Type II compliant" with Delve-issued Type I & II badges displayed; "Secure Email Verification — Candidates must verify their email to access offers"; "Enterprise-Grade Security — Multi-layered security architecture with continuous monitoring" (https://www.levels.fyi/offerings/interactive-offers).
- **Custom domains** (Enterprise) so offer links live on the employer's domain.
- **Commerce/legal:** Stripe self-serve checkout; embedded e-sign SaaS agreement (Delaware law, no-redistribution and no-re-identification clauses, liability cap = 12 months fees).
- **Data delivery:** Google Sheets, API, MCP, CLI (https://www.levels.fyi/api-access/); partnership feeding data into Pequity comp software (https://www.levels.fyi/blog/levelsfyi-and-pequity.html); heatmap "Powered by Borderly".

## Patterns worth borrowing for Advisor Comp Studio

1. **Equity-scenario modeling as the named premium line.** Levels.fyi draws its Free→Plus paywall exactly at "Equity scenario modeling" — confirmation that scenario walks (our Conservative/Base/Aggressive trajectory engine) are the perceived-value core of an offer tool, worth foregrounding in the Proposition doc rather than burying in settings.
2. **"Visuals over dense legal jargon" offer page.** The Interactive Offer candidate page leads with TC visualization, vesting timeline, and growth scenarios, with legal text demoted — the right structure for our printable advisor Proposition: chart-first, verbatim legal corpus as an appendix, "discussion draft" framing on top.
3. **Email-verification gate + custom domain for confidential comp.** Their answer to "comp figures on a public URL" is exactly our COM-33/34 gap: candidate must verify email before the offer renders, and Enterprise offers serve from the company's own domain. A lightweight verified-link gate is a credible interim pattern while Supabase auth is blocked.
4. **Skill Index normalization (0–100).** Collapsing messy ladders into one numeric scale is the same move as mapping FAST advisor tiers to a compa-ratio guardrail — expose a single normalized "tier index" so cross-advisor comparisons and outlier flags are one number, not a matrix.
5. **Side-by-side ladder alignment.** The signature compare UI — vertical ladders aligned horizontally at equivalence against a "standard" column — is a strong template for an advisor-tier comparison view (FAST standard tiers vs Raiku's house tiers vs an individual grant).
6. **One global percentile/scenario selector that re-paints everything.** The heatmap's 10th/25th/50th/75th/90th selector instantly recolors the whole map; the analog is a single Conservative/Base/Aggressive switch that re-renders every chart and figure on the page simultaneously — no per-widget toggles.
7. **Inline contract wizard with signature capture.** Their 3-step "Company Info → Review Contract → Sign (draw/type)" flow turns a legal agreement into guided UI — a direct model for our governance/consents checklist evolving into an acknowledgment flow on the Proposition (e.g., "Pantera consent obtained" sign-off with named signatory and audit-log entry).
8. **Anonymity jitter + masking thresholds.** Publishing figures "modified slightly within a close margin" and masking small-n companies is a tidy pattern if Comp Studio ever shows cross-advisor benchmarks: jitter + minimum-cohort masking keeps individual grants confidential.

## Sources — deduped

**[primary] (levels.fyi properties, fetched 2026-06-11)**
- https://www.levels.fyi/ — homepage, IA, omnisearch, employer cross-sell
- https://www.levels.fyi/offerings/interactive-offers — Interactive Offers tiers (Free/Plus/Premium/Enterprise), SOC 2, ATS, email gate, custom domains
- https://www.levels.fyi/employers/offer — employer portal / public demo offer entry ("View your offer in a new light")
- https://www.levels.fyi/offerings/data/ — benchmarking pricing ($800/$2,000/$4,000/mo), Skill Index, methodology FAQ, trailing-data $10,000, embedded SaaS contract wizard
- https://www.levels.fyi/verified/ — verification pipeline (proof docs, forgery detection, identity verification, anonymity jitter, masking)
- https://www.levels.fyi/services/ — negotiation packages $250–$5,000, guarantees, routing wizard
- https://www.levels.fyi/heatmap/ — DMA choropleth, percentile selector, color schemes
- https://www.levels.fyi/benchmark · /explorer · /api-access/ · /create.html · /salaries/add · /benefits/ · /2025/ · /leaderboard/ · /cost/ — feature modules (linked from primary nav)
- https://www.levels.fyi/blog/what-are-career-levels-ladders.html — leveling explainer
- https://www.levels.fyi/blog/levelsfyi-and-pequity.html — Pequity partnership
- https://www.levels.fyi/offerings/data/radford-comparison/ (et al.) — vs-survey positioning pages

**[review]**
- https://news.ycombinator.com/item?id=30963833 — "selling your salary data for $1200/month" + founder response (2022)
- https://news.ycombinator.com/item?id=41793224 — high-pay bias debate
- https://news.ycombinator.com/item?id=25784294 — tech-company bias
- https://www.teamblind.com/post/How-accurate-have-you-found-Levelsfyi-Sq644mrY — accuracy debate
- https://www.teamblind.com/post/how-does-levelsfyi-compare-levels-across-companies-w4sqreka — "scope and word of mouth" mapping
- https://igotanoffer.com/en/advice/levelsfyi-alternatives-review — third-party review
- https://deshittify.io/products/levels-fyi — 30/100 quality-trend score [uncertain]

**[secondary]**
- https://www.indiehackers.com/interview/building-levels-fyi-in-coffee-shops-and-growing-to-profitability-da7a4f5d63 — founding story, bootstrapped economics
- https://www.fastcompany.com/90604436/levels-fyi-leveling-tech-salaries-leveling-negotiation — press profile, W2/offer-letter verification
- https://prospeo.io/c/levels-fyi-revenue — revenue estimate [uncertain]
- https://www.crunchbase.com/organization/levels-fyi — company profile
- https://www.quora.com/In-levels-fyi-why-does-L6-SWE-at-Google-roughly-map-to-L65-67-Principal-SDE-at-Microsoft-whereas-L6-EM-at-Google-maps-to-L63-65-EM-at-Microsoft-Despite-different-ladders-I-thought-transferring-at-same-level-was — mapping disputes
