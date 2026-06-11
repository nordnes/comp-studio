# Competitive Landscape Research — Advisor Comp Studio

**Date:** 2026-06-11 · **Method:** 5 parallel research tracks (60+ web searches, ~30 primary-source
fetches), claims cross-verified; the one inter-track conflict (FAST matrix shape) was resolved against the
live primary source. Confidence markers: claims below are sourced inline; vendor self-descriptions are
flagged as marketing where they couldn't be independently confirmed.

**Headline finding:** no commercial product does what Comp Studio does. The four adjacent categories
each cover one quadrant — cap-table tools model dilution but not advisor propositions; comp tools
benchmark employees but not advisors; token tools administer vesting, and the one true token-modeling tool (Forgd — see FORGD_DEEP_DIVE.md)
simulates FDV/price at protocol level but never answers "what is *this advisor's* 0.25% worth at $600M
FDV"; offer tools visualize packages but gross-of-strike and without governance.
Comp Studio's combination (FAST bands + compa-ratio guardrails + net-of-strike + TGE-FDV scenarios +
governance checklist + watermarked proposition) is uncovered white space. The market is also
consolidating fast: AngelList exited cap tables (Aug 2025), LTSE Equity shut down (2024), Liquifi became
Coinbase Token Manager, Welcome was absorbed by BambooHR, Assemble by Deel, Barley by Workleap,
Magna is Kraken-powered.

---

## Category 1 — Cap-table & equity scenario modeling

### Carta — carta.com
Category leader (40k+ companies). Free "Launch" tier <25 employees; paid tiers quote-only (~$2.8k–$77k/yr
per third-party data, 2025) ([pricing breakdown](https://www.spendflo.com/blog/how-much-does-carta-cost-a-breakdown-of-plans-and-pricing)).
**Functionality:** SAFE/convertible pro-forma modeling; multi-round dilution with side-by-side scenario
comparison; exit **waterfall with breakpoint analysis** and payout by share class (inputs: exit value, debt,
date) ([waterfall docs](https://support.carta.com/s/article/scenario-modeling-for-companies-waterfall-modeling));
in-house 409A; option grants with strike/exercise. The waterfall product decomposes into **three views:
breakpoints (threshold), sensitivity (payout-vs-exit-value line chart), and point payout (one exit's proceeds
table)** — the most concrete published exit-explorer decomposition. **Board consents** are the
differentiator: legal-admin review gate → publish → board signs via email/iOS → progress tracked toward
unanimous consent → permanent record; reusable templates; grant issuance merged into the consent flow;
evidence (e.g. 409A summary + FMV-over-time graph) embedded *inside* the consent
([how Carta does board consents](https://carta.com/product-updates/how-carta-does-board-consents/),
[board resolutions](https://carta.com/blog/board-resolutions/)).
**UI/UX:** stakeholder portal with grants/vesting/exercise; G2 reviews split between "clean and intuitive"
and "complex and overwhelming… reporting complex and confusing"
([G2](https://www.g2.com/products/carta-carta/reviews?qs=pros-and-cons)). Sharpest documented defect:
settled shares and voided grants share one "Canceled or Terminated" label — "no visual distinction
whatsoever" (Trustpilot/G2). **Advisor:** education only (typical 0.1–1% grants, NSOs, monthly/no-cliff
vesting) ([advisory shares](https://carta.com/learn/startups/equity-management/advisory-shares/)).

### Pulley — pulley.com
YC-backed challenger; "wins on UX and price" per 2026 roundups
([ValueAdd VC ranking](https://valueaddvc.com/blog/best-cap-table-management-tools-in-2026-carta-pulley-angellist-capdesk-ranked));
AngelList's official migration recommendation. Low-to-mid hundreds $/mo early-stage; no free tier.
**Functionality:** pro-forma SAFE conversion; waterfalls with configurable preferences, "fully dynamic and
auditable" formulas, one-click Excel export; PE/LLC waterfalls (2025); 409A, e-sign.
**UI/UX:** personal employee portal to "visualize scenario outcomes" at hypothetical exits. G2 criticisms:
"difficult setup for modeling," "lack of instructions daunting," confusing menus, undiscovered features
([G2](https://www.g2.com/products/pulley-pulley/reviews?qs=pros-and-cons)). **Advisor:** advisory-shares
guide; recommends FAST + grant agreement with vesting automated in-platform
([guide](https://pulley.com/guides/advisory-shares)).

### Ledgy — ledgy.com
European equity-plan platform (Revolut, DeepL); IPO-scale plan *automation* focus. Quote-based; "quite
expensive for smaller startups" (G2). **Functionality:** round/exit scenario modeling with liquidation
preferences and waterfalls; bulk document generation + DocuSign; HRIS-triggered granting rules (70+
integrations); broad instrument zoo (ESOP/VSOP/EMI/CSOP/RSU/warrants/BSPCE…)
([equity plan automation](https://ledgy.com/equity-plan-automation)). **UI/UX:** "intuitive employee
dashboards" (marketing); G2: "interface is not super intuitive initially," confusing notifications.

### Cake Equity — cakeequity.com
SMB/early-stage, "equity made easy." Free ≤5 stakeholders; Build from $1,000/yr.
**Functionality:** "modeling 2.0" — save/revert/edit/delete named scenarios, multi-round on higher tiers;
own 409A; templates + e-sign + guided issuance wizards
([advanced modeling](https://www.cakeequity.com/blog/advanced-cap-table-modeling)). G2: limited
features, timezone support lag, wants better reporting. **Advisor:** dedicated advisory-shares guide +
grant templates.

### Eqvista — eqvista.com
Budget/freemium (free ≤20 shareholders, ~$2/shareholder/mo beyond). Waterfall analysis with a
**dedicated waterfall chart** for preference rounds
([waterfall](https://eqvista.com/waterfall-analysis/)). Reviews: dated UI, overwhelming dashboard, slow on
large tables, weak mobile, detail forced into Excel export ([SoftwareAdvice](https://www.softwareadvice.com/equity-management/eqvista-profile/reviews/)).

### AngelList Equity — STATUS: sunset
Stopped accepting new cap-table customers **Aug 6, 2025**; points users to J.P. Morgan Workplace
Solutions and Pulley ([announcement](https://www.angellist.com/blog/the-future-of-cap-tables)). Legacy
notable: priced per team member including advisors (~$1,600/yr ≤20), scenario modeling, RUV roll-ups.

### LTSE Equity (ex-Captable.io) — STATUS: discontinued
Shutdown announced Jan 2024, data through Nov 2024
([HN](https://news.ycombinator.com/item?id=39137362)). Historical reference for free founder modeling.

### Astrella (EQ/Equiniti) — astrella.com
$5–10/stakeholder/mo. Waterfall/exit mapping; differentiators are AI features and a **blockchain-anchored
audit trail** ([SaaSworthy](https://www.saasworthy.com/product/astrella)). Thin public UI detail.

### Capboard — capboard.io
EU budget option ($2/stakeholder/mo, $360/yr min). Notable: **stakeholder portals where employees
themselves run exit simulations** — full visibility into vesting/cliff/leaver outcomes
([simulation FAQ](https://www.capboard.io/en/faq/how-to-create-a-simulation)).

### Vestd — vestd.com
UK share schemes (from £300/mo). **Most advisor-relevant product in the category: "Agile
Partnerships™"** — conditional equity released against agreed performance milestones, explicitly designed
to avoid over-granting advisors ([Agile Partnerships](https://www.vestd.com/agile-partnerships/)).
Capterra: "UX could be designed to be a little clearer," manual data input.

### Diligent Equity — equityeffect.com
Equity module in the Diligent governance suite. "Run waterfall analyses in seconds with multiple versions
of future rounds"; LLC profit-interest waterfalls; natural adjacency to Diligent Boards consent workflows
([LLC waterfall release](https://www.equityeffect.com/blog/diligent-equity-releases-llc-cap-table-and-waterfall-features/)).

**Category observations.** (1) The recipient-facing "what's it worth to me" simulator (Pulley portal,
Capboard) is the emotional core — exactly the Proposition surface. (2) Scenario UX has converged on
**saved, named, comparable scenario objects**, not one live slider. (3) Waterfall = table stakes;
auditability/exportability is the trust feature. (4) The recurring UX failures are **state-label ambiguity and
undiscoverable depth** behind setup ceremony. (5) Governance workflow (only Carta) and advisor
templates (only Vestd) are thin everywhere; tokens are absent entirely.

---

## Category 2 — Comp benchmarking & planning

### Pave — pave.com
"AI-powered OS for compensation"; Market Data Lite free ≤200 employees, rest quote-based. Benchmarks
from 8–9k companies via live HRIS/cap-table integrations; equity benchmarks in **both %-fully-diluted and
$-value**, incl. refresh grants and vesting norms. **Visual Offer Letter** stacks base/bonus/equity/benefits
with an **equity share-price slider** for candidates ([product](https://www.pave.com/products/visual-offer-letter)).
G2 (~4.7): praised UI but "implementation is confusing… you have to do more than needed for reaching
details" ([G2](https://www.g2.com/products/pave/reviews)).

### OpenComp — opencomp.com
Ex-Salesforce comp team; rare public pricing: Benchmarking $4,500/yr, Strategy $8,500/yr, Cycles
$15,000/yr ([pricing](https://www.opencomp.com/pricing-plans)). **Compa-ratio is a first-class roster
column** — "very easy to intuit pay disparities and range penetration or compa ratio" (G2).

### Ravio — ravio.com
European real-time benchmarking (1.4–1.7k companies). Distinctive visualization: **percentile shown as a
normal-distribution curve with the chosen percentile marked**; plus an **employee upside calculator**
with valuation multiple, dilution rate, and tax inputs showing pre/post-tax, pre/post-exit value — the
closest commercial analog to a net-of-strike trajectory engine
([benchmarking](https://ravio.com/compensation-benchmarking)). G2: "amazing visualisations… most user
friendly"; cons: thin coverage for some roles/countries, "rigid export options."

### Figures — figures.hr
EU mid-market (from ~€2,500/yr); Mercer partnership; bands + reviews + pay-equity (EU Pay Transparency
angle). Gap: **no equity benchmarks** (base + variable only).

### Assemble — STATUS: acquired by Deel (Dec 2024)
Bands + planning + "Illustrative Offers" add-on; being rebuilt inside Deel
([Deel announcement](https://www.deel.com/blog/deel-acquires-assemble/)). Band editor with
side-by-side market comparison and min/mid/max grammar.

### Compa — compa.ai
Enterprise offer intelligence: **Compa Index networks accepted AND rejected offers straight from
customer ATSs** (9M+ observations) ([methodology](https://www.compa.ai/blog/how-compa-levels-and-matches-thousands-of-offers-from-the-best-tech-companies));
WTW partnership 2025. Design-relevant pattern: the **offer desk** — recruiter sees a recommended
package bounded by policy guardrails (the "generosity guardrails" analog) rather than raw percentiles.

### Carta Total Comp — the closest analog
Benchmarks from 1M+ employee records; the defining convention: **equity expressed as % of fully diluted
shares**, cut by valuation/stage/industry/geo. **"Comp philosophy as settings":** target percentiles set
independently per component (e.g. 75th salary, 25th equity) and the app re-derives all bands
([support doc](https://support.carta.com/s/article/total-comp)). Auto-flags people paid significantly
above/below band. **The one vendor with real advisor data:** median pre-seed advisor grant 0.21–0.25%
FD (declining 2021→2024), seed ~0.12%, only 10% of pre-seed advisors get ≥1%, most startups have 1–2
advisors ([Carta advisor data](https://carta.com/learn/startups/founding-team/advisor/)).

### Aeqium — aeqium.com
AI comp planning + **Interactive Offer Letters** with an "equity offer simulator… under different scenarios"
and band-compliance checks; section header worth noting: "Make candidates into owners"
([offer letters](https://www.aeqium.com/product/interactive-offer-letters)).

### Barley — STATUS: now Workleap Compensation
Public per-seat price ("from $5/user/mo"). Screenshots show the category's canonical visualization: **pay
bands as horizontal range bars per level with a marker for the person**, outlier "visual flags," sandbox
mode for dry-running review scenarios ([Workleap](https://workleap.com/compensation)).

### Pequity — pequity.com
Comp cycles + offers ("offers in hours, not days"); "Salary Board" publishes ranges for pay-transparency
laws; G2: "extremely intuitive" for managers.

### Comprehensive — comprehensive.io
Free **Pay Range Tracker** scraping live posted ranges from 6,000+ US tech companies daily (distinctive
data source); guided step-by-step review workflows; <2-week implementation.

### FAST Agreement — the benchmark anchor (verified on the live page today)
Current published version: **FAST v2, "Updated August 1st, 2020."** The live matrix has **two engagement
rows** — Standard (Monthly Meetings): 0.25% idea / 0.20% startup / 0.15% growth; Expert (Add Contacts,
Projects): 1.00% / 0.80% / 0.60% — while the page prose still references three levels ("standard, strategic,
or expert"); the Strategic middle tier (historically 0.50/0.40/0.30) was dropped from the table but
circulates in third-party 3×3 reproductions ([fi.co/fast](https://fi.co/fast)). Other canon: restricted stock or
options, **2-year monthly vesting, 3-month cliff** (framed as the try-before-you-grant escape hatch),
equity-only comp, ~5% advisory pool "not uncommon." **No SaaS product operationalizes FAST** — it
lives in templates and blog calculators. Cross-check: FAST Standard (0.15–0.25%) brackets Carta's
observed medians; FAST Expert (0.6–1.0%) sits near the ~90th percentile of actual grants — useful
calibration for the generosity guardrails.

**Category observations.** (1) Dominant band visualization = **horizontal min/mid/max range bar with a
person/offer marker** (Workleap, Carta, OpenComp); Ravio's distribution-curve-with-percentile is the
elegant alternative. (2) Compa-ratio renders as a number + colored outlier flag embedded in a roster
table. (3) Equity is always dual-denominated (%FD and $) with a bounded scenario slider. (4) "Comp
philosophy as settings" is a standard IA pattern that maps to Comp Studio's Configure. (5) Review-cited
failure mode is depth-behind-clicks and configuration overload — an argument for Comp Studio's
opinionated reading-column flow. **Nobody benchmarks advisor/board comp** except Carta's published
statistics and the static FAST matrix.

---

## Category 3 — Token compensation & vesting

### Magna — magna.so (now "powered by Kraken")
Full token-ops suite; **from $500/mo** (public). Modules: on-chain vesting (audited contracts with
**cancel/reclaim on termination** — advisor clawback), off-chain vesting + tax (distributions from
Fireblocks/Anchorage/Safe custody), **whitelabel claim portals** (geofencing, T&Cs, claim windows),
grant management (milestone evidence, KYC), escrow, staking. Recipients "login with **email or wallet**"
— deliberate de-crypto bridge for non-native advisors ([magna.so](https://www.magna.so/)). Claims $10B+
TVL, customers Berachain/Wormhole/Optimism (marketing).

### Liquifi → Coinbase Token Manager — STATUS: acquired
All liquifi.finance URLs redirect to
[coinbase.com/tokenmanager](https://www.coinbase.com/tokenmanager) ("the institutional standard for
token operations"). Pillars: automated vesting/lockups (custodial or smart-contract), **TGE launch
management**, bulk distribution to 10k+ stakeholders, tax withholding + payroll. Product screenshots show
**Vested and Unlocked as separate side-by-side categories**, per-allocation-category progress bars, and
stakeholder rows with **country and tax rate** columns. Liquifi's canonical *Token Vesting & Allocation
Benchmarks* report (150+ projects) is no longer directly reachable post-acquisition.

### Toku — toku.com
Repositioned to global payroll/EOR for the stablecoin economy; **Token Grant Administration** product
(vesting, distribution, withholding, reporting across 100+ jurisdictions). The deepest public corpus on
token-comp legal mechanics (US taxation of token awards; why token *options* are a "legal minefield");
ran ZKsync's TGE distribution for 400+ international recipients
([toku.com](https://www.toku.com/)). A "Token Compensation Value Calculator" is listed as coming soon —
evidence the $-valuation gap is recognized.

### Pulley (token features)
**The only mainstream vendor unifying equity AND token cap tables side-by-side**; hybrid comp plans;
lockups layered on vesting with unlock notifications; audit-defensible token FMV valuations (the 409A
analog); token offer letters e-signed in-platform; custodian integrations, never holds keys; per-holder
portal with vesting/tax/lockup in real time
([token cap tables](https://pulley.com/products/cap-table-management/token-cap-tables)).

### Hedgey — hedgey.finance
Free, 100% on-chain; vesting plans minted as **NFTs**; **vesting and post-vesting lockup as separately
composable layers**; optional cliffs; admin revocation; governance delegation of unvested tokens;
recipient-discretion claiming ([docs](https://hedgey.gitbook.io/hedgey-community-docs/hedgey/vesting-plans)).
Wallet-gated (no email login) — friction for non-crypto advisors. No tax/fiat/FDV.

### Sablier — sablier.com
The original streaming protocol (since 2019; 24+ EVM chains): assets "vest by the second"; linear, cliff,
discrete, "any curve you can dream up"; Airstreams (vested airdrops). Crypto-dark aesthetic with the
signature animated **hourglass NFT** per stream.

### Streamflow — streamflow.finance
Solana-native; batch vesting with a "cranker" that auto-transfers on unlock (recipients never claim
manually); white-label claim/staking portals; public **Token Dashboard** (shareable supply/lock charts).
Degen-adjacent tone (testimonials are crypto-Twitter) — a credibility contrast vs Magna/Pulley's CFO
quotes.

### Forgd — forgd.com (hands-on deep-dive: see FORGD_DEEP_DIVE.md)
Free pre-TGE token-launch platform (paid advisory behind it); its **Token Designer** is the strongest
adjacent token-modeling reference found anywhere in this research, verified by a signed-in walkthrough
of every section (2026-06-11). Wizard-style designer: Token Profile narratives (with "Compare with Aave"
exemplars), Distribution Schedule (group rows + donut + 100%-allocated validation banner), Emission
Schedule (per-group TGE unlock/lockup/cliff/duration/frequency grid + stacked emission chart + computed
inflation KPIs), Demand Drivers + per-driver estimation drawers (template cards, Conservative/Moderate/
Aggressive growth factor, comparable-project anchoring e.g. GMX staking stats), Valuation (comparables
scatter with project logos, "likelihood to achieve FDV" slider, FDV ÷ supply → price at TGE), and five
Performance Simulations (supply vs demand, circulating-supply KPIs, per-group sell-pressure stacks with
seller-type cost-basis config, daily price discovery with a Dynamic Price toggle, and post-TGE "pop"
candles with a **Perceived vs Actual User Experience** returns panel). Plus: XLS export of the whole
design, password-protected public token page, and a 100+-lesson Academy. Its Base Layer template
allocates **Advisors 2.5–3% of supply, 12-month lockup, 24-month monthly unlock** — a live calibration
point for advisor token norms. Gaps relevant here: protocol-level only — **no per-recipient view, no
equity leg, no net-of-strike, no governance/consents, single scenario path** (no named scenario sets).

### Benchmarks
"Advisors & partners" as a *category* of token supply: **3–5%** is the widely repeated norm (secondary
sources; directional). Single-advisor example grants ~0.25% of supply appear in token-comp guides.
Dragonfly/Liquifi canon: team ≈17.5% across 20–40 people; 4-year vest / 1-year cliff standard; **lockups
distinct from vesting, typically 12 months from TGE for team+advisors**, staggered by stakeholder class
([Dragonfly token comp](https://medium.com/dragonfly-research/token-compensation-for-web3-startups-47621640a6ba)).
Dragonfly 2024/25 report: token grants down 75% YoY; 51% of teams treat tokens and equity as fully
separate comp elements ([report](https://dccr.dragonfly.xyz/report)).

**Category observations.** (1) **Vested vs Unlocked are always two simultaneously-visible states** —
never collapse them into one curve. (2) The recipient view is the product's emotional core, and winners
de-crypto it (email login, fiat values, plain language). (3) The visual vocabulary is per-category progress
bars, staircase progressions, and supply-unlock area charts — Comp Studio's staircase chart is on-idiom.
(4) Tone splits by buyer: protocol tools are crypto-dark; CFO/GC tools are fintech-light — validating
Espresso. (5) **Scenario valuation exists only at protocol level (Forgd: FDV → price → simulated paths);
no product translates it to the recipient ("your 0.25% is worth $X net at $600M FDV")** — grant
administration tools track actuals, Forgd models the token, and the per-person modeling layer still
exists only in VC blog posts and spreadsheets. Comp Studio occupies exactly that seam.

---

## Category 4 — Offer & comp communication / visualization

### Complete — complete.so
The design-led category leader. Candidate portal blocks: **dilution & funding education, options-vs-RSU
explainers, benefits modeling, company milestones, team profiles, custom welcome notes/video**; ATS
sync; **comp-band guardrails baked into the candidate UI** ("adhering to predefined compensation
ranges"); Total Rewards Agent for employee statements ([offers](https://www.complete.so/offers)).
Aesthetic: friendly SaaS, rounded cards, large illustrative numbers, "humanize the experience."

### Welcome (heywelcome.com) — STATUS: acquired by BambooHR, effectively sunset
Historical reference; the category's why, per its founder: candidates "don't understand the value of their
equity"; teams recruit for 90–120 days then send "a two sentence congratulations email" vs "the black and
white legal PDF" ([founder post](https://medium.com/welcomehr/introducing-welcome-bringing-the-offer-closing-and-compensation-data-experience-out-of-the-dark-f7d5a189e5d5)).
Had Compensation Scenarios benchmarked against the existing team, native signing + countersigning.

### Carta Total Comp Offer Letter — the best-documented reference
"Elegant, fully interactive offer statement." The admin setup guide reveals the strongest legal-engineering
patterns in the category ([setup guide](https://support.carta.com/kb/guide/en/how-to-configure-offer-letter-settings-S7riP14ns0/Steps/3725169)):
**(a) a confidentiality dial** — equity display mode "company value + PPS" vs "PPS only" (hides company
value); **(b) caveats as schema, not prose** — per-equity-type default footnote language, editable per
row; **(c) a mandatory disclaimer acknowledgment** before the product activates; (d) strike from the
latest 409A or custom; (e) built-in equity FAQ; (f) up to **three preset packages** (cash-heavy ↔
equity-heavy) and growth-based "Comp Projection" charts. Design lineage: Carta's 2016 "A Better Offer
Letter" — equity education inline, projected values disclosed with "if we don't know the numbers… we say
so" ([Medium](https://medium.com/@cartainc/a-better-job-offer-letter-803e36daae30)). Criticism: a
729-comment LinkedIn thread arguing equity-as-total-comp is "careless and deceptive" — the category's
core controversy.

### Pave Visual Offer Letter
Candidate page: hero → stacked total-rewards bar → equity module with a literal **share-price slider**
(the asset is named `visual-offer-letter-share-price-slider`) → benefits; cool blue/white enterprise-modern
([product](https://www.pave.com/products/visual-offer-letter)).

### Levels.fyi Interactive Offers — best public pricing signal
Free (static fields) → Plus (**equity scenario modeling is the paywall line**) → Premium (commission
modeling) → Enterprise (custom domain). **Candidates must verify email to access offers** — the clearest
per-viewer access gate in the category; public demo offer available
([offerings](https://www.levels.fyi/offerings/interactive-offers)).

### Aeqium Interactive Offer Letters
Equity offer simulator + band-compliance checks; donut/stacked total-comp ring + scenario chart; indigo
SaaS look ([product](https://www.aeqium.com/product/interactive-offer-letters)).

### Rippling / Ashby
Rippling Recruiting Pro: interactive earnings-over-time views, offers auto-generated from approved bands,
acceptance triggers onboarding; offer-expiry workflow recipes. Ashby: ATS-native e-sign, conditional
approval chains, substitution tokens — **no equity visualization**, which is why Complete/Pave/Levels.fyi
all integrate on top of it.

### Total-rewards statements
ChartHop ("beautiful, branded, visual compensation letters"); **Sequoia (consulting) Total Rewards
Statements** — interactive statements that "model out various equity scenarios" with controlled
company-wide access ([sequoia.com](https://www.sequoia.com/platform/total-rewards-statements/));
Pave's always-on portals.

### Qwilr (sales-room mechanic, brief)
The confidential-link pattern: unguessable link secrets, **password protection, link expiry, view-time
limits, per-viewer section-level analytics**, view notifications (~$35–59/user/mo)
([pricing](https://qwilr.com/pricing/)). No watermarking. This is the access-control grammar a shared
Proposition link would emulate.

**Category observations.** (1) The candidate-page grammar has converged: personal hero → headline
total value → stacked breakdown → equity deep-dive with scenario control → education blocks → story →
accept CTA; the Proposition maps onto it 1:1. (2) The scenario control is a **slider or preset multiple,
never free-form input** — bounded controls double as expectation management; labeled detents beat a
continuous range. (3) Caveats as structured per-component footnotes (Carta) is the best
legal-engineering pattern found — directly applicable to the verbatim legal corpus. (4) Confidentiality
features are coarse everywhere (Carta's PPS-only mode, Levels.fyi email gates, Qwilr expiry); **no vendor
offers watermarking** — Comp Studio's watermarked draft is ahead of the commercial category. (5) The
category's loudest criticism is gross notional values at optimistic multiples with buried caveats — the
net-of-strike + "discussion draft" discipline is stricter than any commercial product and is the thing to
preserve, with disclaimers adjacent to every interactive number, not in a footer.

---

## Cross-cutting findings

**Advisor-specific tooling.** FAST (above) is a checkbox agreement, not software. Cooley GO has a free
advisor-agreement generator (questionnaire → Word/PDF with options/RSA + ~2-yr vesting + IP
assignment); Clerky treats advisors as consultants (paperwork workflow); Common Paper has no advisor
standard — but its **fixed "Standard Terms" + one-page variable Cover Page** structure is exactly Comp
Studio's verbatim-corpus + variable-deal-terms split. Online advisor calculators (Cake, Capbase) are thin
marketing tools; none model net-of-strike or tokens.

**Governance/consent UX.** Carta's pattern is the documented benchmark: **owner-gate (legal review
before the board sees anything) → per-approver "n of m" progress toward unanimous consent →
evidence embedded in the consent object → immutable stored record**. Zeck's contribution is the
"pre-vote" (async approval before the meeting). Explicit RAG status chips are *rarer* in board tools than
project tools — Comp Studio's Red/Amber/Green register is closer to compliance-checklist idiom, which
is fine, but the per-approver progress + embedded evidence ideas are worth borrowing.

**Scenario-modeling UX.** Carta's three-view decomposition (breakpoints / sensitivity range / point
payout) is the cleanest published structure for an exit explorer. The football-field chart is an
investment-banking convention: floating horizontal bars per valuation method on a shared axis, with a
vertical marker for the proposed value — analytical value is visual triangulation (overlap = confidence)
([CFI](https://corporatefinanceinstitute.com/resources/financial-modeling/football-field-chart-template/)).
Runway (FP&A) is the design-celebrated scenario tool: instant recompute, human-readable formulas,
side-by-side scenarios without duplicating the model.

**Net-of-strike calculators.** Secfi's exit calculator leads with take-home **after strike cost AND
federal/state/AMT tax**, and reduces input friction by importing from Carta or parsing uploaded grant
docs; its suite is **six small single-question tools** rather than one mega-form
([Secfi](https://secfi.com/tools/stock-option-exit-calculator)). ESO Fund interleaves explainer prose with
the inputs it explains and runs a blanket footer disclaimer ("does not provide legal, financial, or tax
advice") ([ESO](https://www.esofund.com/calculator)). Harness frames scenario dimensions as
plain-English questions ("Does it matter where I live when the exit occurs?").

**Design-led fintech aesthetics.** The Mercury teardown is the concrete playbook for calm data-density
([teardown](https://blakecrosley.com/guides/design/mercury)): money as a first-class typographic element
(balances: 28px / weight 500 / −0.5px tracking / line-height 1.0), body line-height 1.625, a deliberately
desaturated palette with **one** unusual accent ("trust through design quality, not color psychology"),
hairline borders. Typography literature is unanimous on **tabular lining figures** for any money column.
The serif-display + sans-UI + tabular-numerals combination Comp Studio already uses (Fraunces + Inter)
matches the documented direction of design-led fintech; Compound's editorial "Manual" shows the
book-like register for equity content.

---

## Feature comparison matrix

Legend: ● full · ◐ partial · — none. (Sunset products excluded.)

| Capability | Carta | Pulley | Ledgy | Cake | Vestd | Pave | Ravio | Carta TC | Magna | CB Token Mgr | Toku | Complete | Levels.fyi | **Comp Studio** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multi-round dilution modeling | ● | ● | ● | ● | ◐ | — | — | — | — | — | — | — | — | ● |
| Exit waterfall / breakpoints | ● | ● | ● | ◐ | — | — | — | — | — | — | — | — | — | ● |
| Named, saved scenario sets | ● | ◐ | ◐ | ● | — | — | — | — | — | — | — | — | — | ● |
| Net-of-strike framing as default | ◐ | ◐ | ◐ | ◐ | — | — | ◐ | — | — | — | — | — | — | ● |
| Token grants / vesting admin | — | ● | — | — | — | — | — | — | ● | ● | ● | — | — | ◐ |
| Token TGE-FDV scenario valuation | — | — | — | — | — | — | — | — | — | — | ◐* | — | — | ● |
| Equity+token unified view | — | ● | — | — | — | — | — | — | ◐ | ◐ | ◐ | — | — | ● |
| Comp benchmarks (employee) | — | — | — | ◐ | — | ● | ● | ● | — | — | — | ◐ | ● | — |
| Advisor comp benchmarks/bands | ◐ data | ◐ guide | — | ◐ guide | ◐ | — | — | ◐ data | — | — | — | — | — | ● FAST |
| Compa-ratio / guardrails | — | — | — | — | — | ◐ | ◐ | ● | — | — | — | ◐ | — | ● |
| Board consent / approval workflow | ● | ◐ | ◐ | ◐ | — | ◐ | — | — | ◐ | ◐ | — | — | — | ● |
| Governance RAG checklist | — | — | — | — | — | — | — | — | — | — | — | — | — | ● |
| Recipient-facing scenario explorer | ◐ | ● | ◐ | ◐ | — | ● | — | ● | ◐ | ◐ | — | ● | ● | ● |
| Interactive offer/proposition page | ◐ | ◐ | — | — | — | ● | — | ● | — | — | — | ● | ● | ● |
| Structured per-figure disclaimers | ● | — | — | — | — | ◐ | — | ● | — | — | — | ◐ | ◐ | ● |
| Watermarked confidential output | — | — | — | — | — | — | — | — | — | — | — | — | — | ● |
| Print/PDF document fidelity | ◐ | ◐ | ◐ | ◐ | — | ◐ | — | ◐ | — | — | — | ◐ | ◐ | ● |
| Audit trail | ● | ● | ● | ◐ | ◐ | ◐ | — | — | ◐ | ● | ● | — | — | ● |

\* Toku's "Token Compensation Value Calculator" is announced/coming soon.
† **Forgd** (not in the matrix; see FORGD_DEEP_DIVE.md): ● token TGE-FDV scenario valuation and price
simulation at protocol level · ◐ named scenarios (single path + attainability slider) · — per-recipient
view, equity, net-of-strike, governance, comp benchmarks. Its template is a live source for advisor
token norms (2.5–3% of supply, 12mo lock, 24mo unlock).

---

## Patterns worth borrowing → for the Comp Studio redesign

1. **Carta's consent triad for Governance:** legal-owner gate → "n of m approved" progress → evidence
   embedded *inside* the checklist item (inline the figure being approved, not a link out) → immutable
   record. Layer this onto the existing RAG register.
2. **The three-view exit explorer** (breakpoints / sensitivity curve / point payout) as the organizing
   structure for Board's scenario analytics — three tabs over one engine call.
3. **Bounded scenario controls with labeled detents** (Pave's share-price slider, Carta's preset packages):
   the Proposition slider should snap to named anchors (Conservative / Base / Aggressive / TGE FDV)
   rather than glide continuously — bounded controls double as expectation management.
4. **Caveats as schema** (Carta's per-equity-type footnotes): bind each verbatim legal sentence to the
   figures it qualifies as numbered footnotes, rendered adjacent on screen and in print.
5. **Confidentiality dial + access grammar:** Carta's "PPS-only" display mode, Levels.fyi's email
   verification, Qwilr's expiring/password links + per-viewer analytics — the design vocabulary for the
   Share flow and the planned auth wave. Watermarking remains Comp Studio's unique edge.
6. **Vested ≠ Unlocked, always both visible** (Coinbase Token Manager): keep token vest and unlock as
   two distinct series in every timeline; add per-stakeholder tax-residency columns (already present —
   keep them prominent, it's the token-category norm).
7. **Recipient-first emotional core, de-crypto'd** (Magna email login, Pulley portal): the Proposition is the
   product's heart; one per-advisor page: total grant → vested-to-date → next date that matters →
   value at the selected scenario.
8. **FAST-grid as the comp picker:** present tier selection as the stage × engagement matrix advisors
   already recognize (with the 2-row v2 values, noting the legacy Strategic tier), with the proposed grant
   plotted as a marker inside the band range bar (the Workleap/Carta band idiom).
9. **Net number as headline, gross→net bridge as the supporting waterfall** (Secfi): Comp Studio already
   leads with net; make the strike/dilution bridge a first-class chart on Advisors.
10. **Money as a typographic element** (Mercury): a dedicated numeric style (size/weight/tracking/lh
    tuned for figures), desaturated single-accent palette — validates and sharpens the existing
    Fraunces-figure + amber-accent system.
11. **Many small single-question surfaces over one mega-form** (Secfi's six tools): keep one decision per
    view; resist consolidating Configure into a dashboard maze.
12. **Comp philosophy as settings** (Carta Total Comp): percentile/band targets as Configure-level policy
    that the rest of the app re-derives — matches the guardrail/value-band open decisions in spec Part 17.

## Pitfalls to avoid (documented failures elsewhere)

1. **State-label ambiguity** — Carta's "Canceled or Terminated" collapsing opposite legal states; every
   lifecycle state in Comp Studio needs a visually distinct treatment.
2. **Depth behind setup ceremony** — Pulley's "difficult setup for modeling," Pave's "more than needed to
   reach details"; keep modeling zero-setup from first paint.
3. **Gross-value optimism with buried caveats** — the category's core controversy (729-comment Carta
   thread); never let a gross or undiluted figure headline; keep disclaimers adjacent to numbers.
4. **Undiscoverable features** — Pulley users not finding option management without tutorials; the ⌘K
   palette and inline affordances must carry discovery.
5. **Export rigidity** — Ravio's "rigid export options" complaint; auditability (CSV/Excel of any table, the
   existing print discipline) is a trust feature in this audience.
6. **Crypto-native friction** — wallet-gated UX (Hedgey) fails non-crypto advisors; keep token figures in
   fiat-first framing with token counts secondary.
7. **Dashboard-itis** — the most-praised tools in every category win on "easy from day one" and guided
   flows, not configurability; Comp Studio's opinionated reading-column is the right bet.

---

## Source register (primary fetches)

Cap table: [Carta scenario modeling](https://carta.com/equity-management/cap-table/scenario-modeling/) ·
[Carta waterfall docs](https://support.carta.com/s/article/scenario-modeling-for-companies-waterfall-modeling) ·
[Carta board consents](https://carta.com/product-updates/how-carta-does-board-consents/) ·
[Pulley waterfalls](https://pulley2025.pulley.com/blog-posts/introducing-waterfalls-for-private-equity-llcs) ·
[Pulley advisory shares](https://pulley.com/guides/advisory-shares) ·
[Ledgy automation](https://ledgy.com/equity-plan-automation) ·
[Cake modeling](https://www.cakeequity.com/blog/advanced-cap-table-modeling) ·
[Eqvista waterfall](https://eqvista.com/waterfall-analysis/) ·
[AngelList sunset](https://www.angellist.com/blog/the-future-of-cap-tables) ·
[Vestd Agile Partnerships](https://www.vestd.com/agile-partnerships/) ·
[Diligent Equity](https://www.equityeffect.com/blog/diligent-equity-releases-llc-cap-table-and-waterfall-features/)
Benchmarking: [Pave Visual Offer Letter](https://www.pave.com/products/visual-offer-letter) ·
[OpenComp pricing](https://www.opencomp.com/pricing-plans) ·
[Ravio benchmarking](https://ravio.com/compensation-benchmarking) ·
[Deel × Assemble](https://www.deel.com/blog/deel-acquires-assemble/) ·
[Compa methodology](https://www.compa.ai/blog/how-compa-levels-and-matches-thousands-of-offers-from-the-best-tech-companies) ·
[Carta Total Comp](https://support.carta.com/s/article/total-comp) ·
[Carta advisor data](https://carta.com/learn/startups/founding-team/advisor/) ·
[Workleap Compensation](https://workleap.com/compensation) · [FAST](https://fi.co/fast)
Token: [Magna](https://www.magna.so/) · [Coinbase Token Manager](https://www.coinbase.com/tokenmanager) ·
[Toku](https://www.toku.com/) · [Pulley token](https://pulley.com/products/cap-table-management/token-cap-tables) ·
[Hedgey docs](https://hedgey.gitbook.io/hedgey-community-docs/hedgey/vesting-plans) ·
[Sablier](https://sablier.com/) · [Streamflow](https://streamflow.finance/) ·
[Dragonfly token comp](https://medium.com/dragonfly-research/token-compensation-for-web3-startups-47621640a6ba) ·
[Dragonfly comp report](https://dccr.dragonfly.xyz/report)
Offers: [Complete](https://www.complete.so/offers) ·
[Carta offer-letter setup](https://support.carta.com/kb/guide/en/how-to-configure-offer-letter-settings-S7riP14ns0/Steps/3725169) ·
[Carta "A Better Offer Letter"](https://medium.com/@cartainc/a-better-job-offer-letter-803e36daae30) ·
[Levels.fyi Interactive Offers](https://www.levels.fyi/offerings/interactive-offers) ·
[Aeqium offers](https://www.aeqium.com/product/interactive-offer-letters) ·
[Welcome → BambooHR](https://www.heywelcome.com/blog/welcome-has-been-acquired-by-bamboohr) ·
[Sequoia TRS](https://www.sequoia.com/platform/total-rewards-statements/) · [Qwilr pricing](https://qwilr.com/pricing/)
Cross-cutting: [Cooley GO advisor agreement](https://www.cooleygo.com/documents/form-advisor-agreement/) ·
[Carta board resolutions](https://carta.com/blog/board-resolutions/) ·
[CFI football field](https://corporatefinanceinstitute.com/resources/financial-modeling/football-field-chart-template/) ·
[Secfi exit calculator](https://secfi.com/tools/stock-option-exit-calculator) ·
[ESO Fund calculator](https://www.esofund.com/calculator) ·
[Mercury design teardown](https://blakecrosley.com/guides/design/mercury) ·
[Runway modeling](https://runway.com/product/modeling)

**Caveats.** Pricing figures are point-in-time (2025–26) and several are third-party estimates. Token
advisor-allocation norms (3–5% category / ~0.25% per advisor) come from secondary sources after
Liquifi's primary dataset went offline — treat as directional. No independent UX reviews exist for
Magna, Toku, Hedgey, Sablier, Streamflow, or Complete; their UX descriptions rest on vendor materials
and screenshots.
