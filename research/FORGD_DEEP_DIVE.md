# Forgd — Token Designer deep-dive (hands-on walkthrough)

**Date:** 2026-06-11 · **Method:** signed-in walkthrough of app.forgd.com (your RKU project), every
Token Designer section visited and screenshotted, plus the platform dashboard, Tools & Services catalog,
and Forgd Academy. This is the strongest adjacent token-modeling reference found in the research — it
materially upgrades the Category-3 (token comp) picture.

## What Forgd is

A free pre-TGE token-launch platform with paid advisory behind it. Core Tools (labeled **Free**): Token
Designer, Tokenomics & Launch Research, Engage a Market Maker (RFQ), Market Maker Leaderboards,
Exchange Listing Research. Revenue model is clearly the full-service advisory ("Bespoke Full-Service
Advisory", "Book a Free Consultation" everywhere) plus a services marketplace (Tools & Services flyout:
Token Unlocks, Smart Contract Development, Token Creation & Mint, Airdrop & Token Streaming, Multi-Sig
Custody, Cashflow Analysis, Growth Capital, Go-to-Market Budgeting, Public Sale/Launchpad, Listing &
Liquidity Academy, Marketing & KOL Support, Launch Checklist, Legal & Compliance / entity formation).
The platform dashboard frames everything as a **pre-TGE program**: Est. TGE Date (with a red "needs
attention" state), Public Token Page status, Market Maker RFQ status, Active Advisor — and a "Pre-TGE
Advisory Phases & Activities Timeline" (six stages of activity cards, e.g. "Tokenomics & Protocol Value
Flows — 5 activities | 25 days", converging on TGE).

## Token Designer — IA and flow

A linear, wizard-like designer with persistent sidebar groups; every page shares the same scaffolding:
**page title + explainer paragraph · "Mark as complete" toggle · green "Readings & Resources" button ·
content cards · grayed "Save & Commit" footer · Prev/Next step links**.

1. **Dashboard** — "your control room": Alerts & Tasks ("Next recommended task"), Token Profile %
   complete, **Token Public Page** card (password-protected share link for exchanges/market makers,
   Not Published state, Preview Page), then live summaries: Distribution donut, Emission stacked-bar,
   Estimated Monthly Demand, Project Valuation (FDV $80M · MC at TGE $12.5M · price $0.080 · supply
   stats), Cumulative Sell Pressure, Price vs MC after post-TGE pop, and a **per-month metrics table**
   (Token Price, Price %Δ, Cumulative Net Buy/Sell, FDV, Market Cap, MC %Δ, Circulating Supply,
   MC-vs-FDV %) with green/red deltas.
2. **Token Profile** (7 steps: Basic Information, Problem & Solution, Mission & Vision, Value Creation,
   Business Model, Finding Product Market Fit, Value Capture) — narrative pages. Pattern: **your
   statement textarea on the left, a "Compare with… [Aave ▾]" exemplar answer on the right with
   Copy-to-Clipboard**. PMF is an "ecosystem assessment" (add ecosystem users: who they are, tasks,
   motivations, incentives) with a friendly empty state ("Create your first ecosystem user").
3. **Modeling** — the core configurators:
   - *Token Distribution Schedule:* editable group rows (name, allocation %, Internal/External type,
     category select, delete) + KPI strip (Total Allocation 100% · 13 groups · 7 internal · 6 external) +
     **Distribution Preview donut with By Group / By Category / Int. vs Ext. tabs** + a green
     validation banner ("Great job. 100% of the total token supply has been allocated.").
   - *Token Emission Schedule:* per-group vesting grid — **% unlock at TGE · lock-up duration · % unlock
     at initial cliff · unlock duration · unlock frequency (daily/monthly)** — above it the stacked-bar
     "Maximum Token Supply | Months Since TGE" emission chart and three computed KPIs (Total Emission
     Duration 36 months · % unlocked at TGE 15.62% · Avg. Annual Inflation 85.68%). Cross-link banner:
     "To edit, add, or remove groups, go to Token Distribution Schedule."
   - *Demand Drivers:* suggested seed rows (Token Buybacks, Governance, Staking) with Category/Type
     (Mechanism|Utility) selects + description; Add New Demand Driver.
   - *Estimating Demand:* per-driver Basic/Advanced calculation, Active toggles, and an **Edit drawer**
     that is the app's most sophisticated form: ① template cards (Token Buy Backs / Governance /
     Staking; selected card inverts to dark) ② estimate type bound to a distribution group (Staking
     Rewards → shows group category, % of supply, emission duration) with a live "Monthly Tokens
     Distributed to Stakers" chart ③ "How do you want to calculate" (Top-Down with explainer; Target
     Revenue $/month; **Growth Factor segmented Conservative/Moderate/Aggressive**; Revenue
     Distributed %; locked Project Duration) ④ comparable-project picker (GMX) with snapshot stats
     (Estimated APR 4% · % of circulating supply staked 65% · staking adoption per 1% yield 19%) ⑤
     % of circulating supply staked in month 1. Save Calculation / Cancel.
4. **Valuation — FDV & Maximum Token Supply:** select comparable projects (Sui, Polkadot, Radix) →
   Avg FDV $3.03B / Avg MC $1.54B + **Comparables MC-vs-FDV scatter (project logos as data points)**;
   "Likelihood to achieve FDV" **slider (75%)** → Projected FDV; manual FDV ($80M) + max supply (1B) →
   computed **Token price at TGE $0.080** and **Market Cap at TGE $12.5M** (price × circulating);
   "Sanitized Tokenomics" review section repeating distribution/emission.
5. **Performance Simulations** (5 steps, each = explainer-left/chart-right + "How to adjust this chart"
   quick-links):
   - *Modeling Supply & Demand:* monthly supply (red, negative) vs demand (green, positive) step chart.
   - *Optimizing Circulating Supply:* tabs — Monthly % Increase to Circulating Supply (line) and
     **Launch and Growth KPIs** (panels with at-TGE / 1mo / 1yr / 3yr columns: Avg. Annual Inflation
     0%→156%→142%→0%; Incremental Demand Required to Achieve Price Equilibrium $12.5M/$1.62M/…;
     % of Max Supply in Circulation; **USD Value of Tokens Introduced to Circulation in red negatives**).
   - *Modeling Sell Pressure:* "Cost Basis and Potential Sources of Sell Pressure" — configure each
     group's seller type (Aggressive = sells 100% on receipt; Conservative = sells a small portion) and
     cost basis; output is a **cumulative stacked negative bar chart** with a per-group legend carrying
     values (Advisors −$2M · Core Contributors −$10M · Seed Investors −$8M · Staking Rewards −$8M …).
   - *Simulating Price Discovery:* tabs Monthly Sell and Buy Pressure / Price Discovery Simulation;
     supply/demand delta → daily price impact; **Dynamic Price toggle** (static TGE price vs dynamic
     daily simulation).
   - *Simulating post-TGE Pops:* explainer card defining the "pop" with **Positive UX / Negative UX**
     labeled chart thumbnails; a candle chart of the first 10 days; and the standout panel —
     **"Perceived User Experience" vs "Actual User Experience"** (cost basis for buyer $0.080; returns at
     7d −10% / 30d +34% / 1y +1% / 2y −36% / 3y 0%, red/green).
6. **Publish — Create Project Summary:** elevator pitch, capital raised-to-date, FDV from previous
   rounds, founder name/bio/team — feeds the password-protected **public token page**.

**Export:** persistent sidebar card "Export Your Design → Get an .XLS file with all the details."
**Academy:** 100+ FAQ-style lessons in ~20 numbered "101" topics (Tokenomics 101 (45), Market Making
101 (90), Exchange Listing 101 (37) …) + 8-lesson guided "Plan my Token Launch" with chapter rail,
inline diagrams (primary→secondary market valuation step chart), accordion sub-sections, share links.

## UI/UX observations

- **Visual tone:** institutional fintech-light — near-white canvas, ink-navy sidebar, one blue accent,
  dark CTA buttons, green success banners, monospace chart titles ("Maximum Token Supply | Months
  Since TGE"). Chart palette is muted multi-hue (13 groups need 13 colors — legends carry values to
  compensate). Geometric blueprint illustrations on explainer cards.
- **The wizard discipline is the product.** Every configurator: Mark-as-complete toggle, Readings &
  Resources, Prev/Next, Save & Commit. Progress gamification ("0% Completed", "Next recommended
  task") drives completion.
- **Explainer-first chart cards:** every simulation chart ships with two fixed prose blocks — "How should
  you read this chart?" and "What data is being used to create this chart?" — plus "How to adjust this
  chart" deep-links (Quick Adjust ⇒ opens the relevant configurator). Self-teaching analytics.
- **Cross-linked engine:** edits propagate dashboard-wide ("come back here to check how your changes
  have impacted other aspects"); banners route you to the owning configurator instead of duplicating
  editing surfaces.
- **Comparables as a first-class input:** pick reference projects (Sui/Polkadot/Radix; GMX for staking)
  and the app shows their stats inline and uses them to seed averages — "anchor your assumption to a
  named real project" rather than a free-form guess.
- **Templates pre-populate everything** (Base Layer template seeded 13 groups with industry-standard
  numbers: Advisors 2.5–3%, 12mo lock, 24mo monthly unlock), so the first-run experience is a filled-in
  model, not a blank form.
- **Weaknesses observed:** the long per-group emission grid is dense and unlabeled-units in places;
  chart y-axes use raw monospace labels; the 13-color stacked charts are not color-blind safe (no
  non-color channel); statement pages (Problem/Solution etc.) are filler-feeling; "Mark as complete" is
  manual rather than derived; no per-recipient view at all; everything is single-scenario (one FDV path —
  scenario comparison only via the attainability slider and pop simulation, not named scenario sets).

## What it means for the research conclusions

1. **Correction to the Category-3 gap claim.** Forgd *does* do token scenario valuation — FDV → price at
   TGE → simulated price/MC paths — at the **protocol level**. The white space for Comp Studio narrows
   but holds: Forgd has **no per-recipient lens** (an advisor's 0.25% never becomes "your grant is worth
   $X net at the Base path"), no equity leg, no net-of-strike concept, no governance/consent layer, and
   no per-advisor document output. Comp Studio sits exactly in that unoccupied seam: Forgd models the
   token; Carta models the equity; nobody models the *person's package* across both.
2. **Advisor norms confirmed from a live template:** Forgd's Base Layer template allocates **Advisors
   2.5–3% of supply, 0% at TGE, 12-month lockup, 24-month monthly unlock** — a concrete, current
   calibration point for Comp Studio's token bucket defaults (board bucket 4.50% sits at the generous
   end of the template range; the 12+24 shape matches the Dragonfly guidance).

## Patterns worth borrowing for Comp Studio

1. **"How to read this figure" as a fixed card slot** — Forgd's explainer-left/chart-right grammar is a
   stronger version of Comp Studio's repeated methodology footer: per-chart, structured ("how to read"
   / "what data"), and paired with **deep-links to the configurator that owns each input** (the
   "Quick Adjust" pattern → Comp Studio: chart → owning Configure section).
2. **Perceived vs Actual UX panel** (post-TGE pops) — presenting the same numbers from the buyer's
   psychological vantage is exactly the Proposition's job; a "what the advisor sees at signing vs at
   vesting milestones" twin panel would be novel and honest.
3. **Comparable-anchored assumptions** — bind each scenario assumption to a named reference (FAST
   band, Carta advisor medians, comparable token launches) shown inline with its stats, instead of bare
   numbers; Forgd's logo-scatter of comparables is a compact, credible visual.
4. **Validation banners with totals** ("100% allocated · 13 groups · 7 internal/6 external") — Comp
   Studio's pool-allocation and budget checks could adopt the green/red full-width banner + KPI strip.
5. **Completion model** — "Mark as complete" + "Next recommended task" turns a multi-surface model
   into a guided program; Comp Studio's governance checklist could drive an equivalent "next blocking
   item" card on Overview.
6. **Password-protected public share page with Not Published status** — Forgd's share artifact maps to
   the Proposition share flow (status chip, preview, copy link, explicit publish step).
7. **XLS export of the whole design** — the auditability-export pattern (one button, everything).

## Anti-patterns to avoid

- 13-series stacked charts with color as the only channel (violates Comp Studio's COM-51 rule — keep it).
- Manual "Mark as complete" that can drift from reality — derive state where possible.
- Single-scenario modeling with the scenario knob buried in a slider — Comp Studio's named
  Conservative/Base/Aggressive sets are strictly better; keep them first-class.
- Essay-prompt pages (Problem/Solution…) that gate progress without feeding the model.

**Sources:** hands-on session, 2026-06-11 — app.forgd.com/project/…/token-designer (dashboard, token-profile/*,
modeling/*, valuation-documenting/*, adjusting/*), app.forgd.com (platform dashboard, Tools & Services),
app.forgd.com/academy. Figures shown are from the RKU workspace seeded with Forgd's Base Layer template.
