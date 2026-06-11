# Competitive Landscape — Functionality & UI/UX Survey

**Date:** 2026-06-11 · **Purpose:** ground the UX improvement issues (see
`UX_IMPROVEMENT_PLAN.md`) in documented prior art before filing them on Linear.
**Method:** four parallel research tracks (cap-table platforms · comp
benchmarking tools · advisor/token-comp platforms · offer & scenario-modeling
UX), ~30 products surveyed via product docs, release notes, demos, and review
sites (G2/Capterra/Trustpilot). Every claim cited at point of use; per-track
source lists at the bottom of each section.

**Headline:** no product on the market combines Comp Studio's three pillars —
(1) dual equity+token advisor packages net of strike, (2) governance-gated
watermarked proposition letters, (3) scenario-set exit modeling. Each pillar
individually has strong prior art to borrow from; the combination is the moat.

---

## Track 1 — Cap-table & equity management platforms

### Carta (depth)
- **Functionality:** cap table, 409A, scenario modeling with three waterfall
  tools — breakpoint analysis (table of exit valuations where each class
  participates), sensitivity analysis (payout-vs-exit line chart), payout
  modeling (single-scenario proceeds table). Financing models are "cap table
  versions": stackable pro-forma scenarios in a **sandbox layered over the live
  cap table**, with inspectable formulas + Excel export.
- **UI/UX:** dense tables-first admin w/ sidebar nav. The employee portal is the
  reference recipient surface: portfolio cards → grant detail with **horizontal
  vesting bars (cliff in grey, schedules overlaid)**, milestone timeline, an
  equity calculator w/ custom share price, and an **Exercise Simulator** (preset
  chips "Exercise All Vested"/"Customize", pre-tax cost, NSO/AMT estimates,
  "View Details" drill-downs).
- **Reviews:** G2 4.5. Praised: holder-view clarity. Complaints: admins "lost in
  the weeds," **opaque simulation numbers** (users want the assumptions),
  painful audit reporting, pricing friction.
- **Borrow:** sandbox-vs-canonical scenario layering · payout-vs-FDV sensitivity
  line as the canonical "what's it worth" chart · a **show-the-formula
  affordance** (directly answers Carta's #1 complaint) · grey-cliff vesting bars.

### Pulley (depth)
- **Functionality:** cap table + pro-forma modeling, waterfalls, 409A, board
  approvals. **Unique: unified equity + token cap tables side-by-side** — token
  vesting, lockups, TGE states (pre-TGE/vested/locked/unlocked), distribution
  integrations, in-house token valuations, per-holder portals. Models are saved,
  named, shareable; Excel export keeps formulas.
- **UI/UX:** positioned as the "cleaner Carta": spreadsheet-like tables,
  **real-time dilution recalc as you adjust variables**, drafts staging area
  before securities hit the live table; onboarding repeatedly praised.
- **Borrow:** the dual-instrument side-by-side view (validates Comp Studio's
  core domain) · saved named scenario models · lockup/unlock displayed as a
  first-class dimension next to vesting.

### Ledgy (depth)
- **Functionality:** EU-centric cap table, **full transaction history with the
  justifying document attached to each transaction/grant**, IFRS 2 expensing,
  exit-distribution modeling, role-based access, 70+ HRIS integrations.
- **UI/UX:** "best employee dashboard" positioning. The standout:
  **company-approved scenario sets — conservative / moderate / aggressive —
  shared to employees, who can also input a custom valuation**. Comp Studio's
  three cases are an established industry idiom, shipped verbatim by Ledgy.
- **Borrow:** recipient-adjustable custom valuation on top of preset cases ·
  document-attached audit entries · per-stakeholder configured views.

### AngelList (Stack), Cake, Vestd, SeedLegals, Astrella, Eqvista
- **AngelList:** the **board-consent state machine** — generate consents from
  .docx templates with variables → optional attorney-review gate → e-sign →
  status tracking, exhibits attached; drafts staging w/ "Include Drafts" toggle;
  **admin "preview as stakeholder"**.
- **Cake:** the recipient app ("My Cake") is a deliberately **separate surface**
  from the cap table — mobile-first, goal visualizations; 2024-25 redesign moved
  valuations "front and center."
- **Vestd:** conditional/performance vesting as a grant attribute; named
  read-only guest roles (accountant/lawyer).
- **SeedLegals:** **documents are the source of truth** — the cap table derives
  from generated legal agreements (model → artifact binding, the same direction
  as Comp Studio's proposition letter).
- Astrella/Eqvista: enterprise/budget tiers, not UX references.

### Track-1 synthesis
1. **Two-surface architecture is universal**: dense admin workspace vs. simple
   recipient surface with one headline value + vesting bar + timeline.
2. **Scenario = named, saved, layered object** — never live mutation of the
   canonical record.
3. **Conservative/base/aggressive is an established idiom** (Ledgy verbatim).
4. **Canonical chart vocabulary:** vesting = horizontal segmented bars (grey
   cliff); sensitivity = payout-vs-exit line; breakpoints/payouts = tables;
   grants = milestone timeline.
5. **Trust = inspectability** — formula access is the most-wanted missing
   feature in the market leader.
6. **Audit entries bind to their governing artifact** (Ledgy, AngelList).

Sources: carta.com/blog/scenario-modeling · carta.com/equity-management/waterfall-modeling ·
support.europe.carta.com (employee dashboard) · esofund.com/blog/understanding-equity-portals-carta ·
g2.com/products/carta-carta/reviews · pulley.com/products/{crypto,fundraising/fundraising-modeling,cap-table-management} ·
valueaddvc.com (Carta vs Pulley vs AngelList) · ledgy.com/blog/scenario-modelling-for-equity ·
ledgy.com/{cap-table,company-pricing,employee-equity-communications} ·
help.angelliststack.com (board-consents, issuing-equity, stakeholder-management) ·
cakeequity.com (employee-motivation, product-updates) · vestd.com/features ·
gitnux.org · youstartups.com · zendikt.com · story.law.

---

## Track 2 — Comp benchmarking, planning & total-rewards tools

### Pave (depth)
- **Functionality:** real-time benchmarks from 9,000+ integrated companies
  ("give-to-get"), ML-blended market pricing, band generation with
  **preview-before-commit** scenario modeling, merit cycles w/ budgets and
  approvals, Total Rewards portal, **Visual Offer Letter**.
- **UI/UX:** band tooling previews impact on affected employees before changes
  land; flags ranges drifting from market. Total Rewards shows place-in-band
  per person + a **share-price slider** for equity what-ifs. The Visual Offer
  Letter is a branded interactive page: stacked total-comp breakdown +
  vesting-timeline × share-price-scenario controls.
- **Reviews:** G2 4.7 — UI friendlier than the HRIS; weak compliance/history
  depth vs Workday.

### Carta Total Comp (depth) — **the provenance reference**
- **Functionality:** private-market benchmarks (1M+ employees), 25th–90th
  percentiles by role/level/geo/valuation, per-element target percentiles
  (e.g. 75th salary / 25th equity), compa-ratio vs plan target, **quarterly
  versioned benchmarks**, custom bands.
- **UI/UX — the standout pattern:** hover a band → **benchmark-confidence
  tooltip**; click → Job Breakdown Modal with confidence visualized on **three
  axes: sample size, recency, goodness-of-fit**. Benchmark refreshes are
  versioned: an "Update available" bubble → **preview the new version's impact
  on your Scorecard → explicitly accept**; a version dropdown toggles latest vs
  plan-pinned.
- **Borrow:** three-axis confidence chips for our benchmark anchors;
  accept-with-preview refresh (never silent updates) — this exceeds our current
  "12mo old — re-verify" text flag.

### Complete (complete.so) (depth) — **the offer-page reference**
- **Functionality:** interactive offer portals, total-rewards statements,
  leveling, band management, planning cycles with approval chains.
- **UI/UX:** offers are recipient-facing branded micro-sites ordered
  *story → people → total-comp hero → component breakdown → interactive upside
  modeling*, with **education inline next to each number** ("Dilution and
  funding," "Options vs RSUs"), sliders modeling exit/valuation scenarios, and
  an admin **"Preview as employee"** toggle. Guardrails framed as
  friction-removal: in-band offers skip approval cycles. Claims 30% higher
  acceptance; case study: 3 hrs saved/offer, +20% acceptance.

### Ravio · Figures · OpenComp · Assemble · Aeqium · Barley · Comprehensive
- **Ravio:** bands rendered with a **live market-target reference line** so
  band-vs-market drift is glanceable; placement views filterable; outlier ID.
- **Figures:** data freshness as an explicit, dated property (monthly refresh
  marketed as an axis) — supports our staleness design.
- **OpenComp:** a persistent **program-health strip** (budget burn, market
  position, % below range); offers with pre-approval paths.
- **Assemble (→Deel):** merit matrices from performance × compa-ratio;
  **audience-specific dashboards** (C-suite/HR/manager/employee/candidate).
- **Aeqium:** **per-audience disclosure dials** (show band? percentile? FDV
  assumptions?) instead of binary share/hide; recipient-portal scenario modeling.
- **Barley:** every guardrail breach paired with a **quantified remediation
  cost** ("cost to bring to band: $X").
- **Comprehensive.io:** range *penetration* (0–100% through band) as the numeric
  companion to the placement dot.

### Track-2 synthesis
1. **Band-placement UI converges on one idiom:** horizontal band bar
   (min–mid–max) + person dot + compa-ratio/range-penetration number +
   percentile markers + live market reference line; out-of-band = colored dot
   + quantified fix cost. Our band-placement chart (COM-179) should adopt this
   grammar exactly.
2. **Carta owns the best provenance UI** — versioned benchmarks, confidence
   tooltips, accept-with-preview. Adopting it would exceed most commercial tools.
3. **Recipient equity views are interactive + educational + scenario-driven**,
   with "illustrative, not binding" labeling — exactly our discussion-draft
   framing.
4. **Guardrails as workflow accelerators**: in-band = clean path, out-of-band =
   triggers review; not just red badges. Surface breaches in a health strip,
   quantify the delta.
5. **Gap:** none of these handle token comp or net-of-strike. Patterns transfer
   at UI level, not domain level.

Sources: pave.com/products/{market-pricing,visual-offer-letter} · pave.com blog ·
g2.com/compare/pave-vs-workday-compensation · releasenotes.carta.com (confidence
metrics, quarterly refresh, version selector) · carta.com/blog/compensation-bands ·
complete.so/{offers,customers/hummingbird} + seed announcement · ravio.com/bands ·
figures.hr · selectsoftwarereviews.com/reviews/opencomp · deel.com/blog (Assemble) ·
aeqium.com/{plans,product/employee-portal} · barley.io (analytics) ·
comprehensive.io/products/compensation-management.

---

## Track 3 — Advisor frameworks + token compensation platforms

### Magna (magna.so) (depth)
- **Functionality:** token cap table, on/off-chain vesting, **vesting (legal)
  tracked separately from unlocks (liquidity)**, tax withholding (Rippling),
  SAFT/document tracking, conditional grants, geofenced airdrops,
  cancel-and-reclaim, multisig/custodian support. $2.4B TVL.
- **UI/UX — the per-grant detail reference:** Allocation Detail Page anatomy =
  header summary (allocated/unlocked/funded/received) → **Allocation Timeline**
  → Unlock Dates table → **prose Unlock Terms** ("25% at year 1 then monthly…")
  → wallet. Recipient statuses are an explicit enum: *Up To Date / Claim
  Available / Pending Airdrop / Cancelled* — CTA only when actionable.

### Liquifi → Coinbase Token Manager (depth)
- **Functionality:** **vesting + lockup tracked together** ("match your legal
  agreements"), per-country grant agreements, KPMG tax engine, claim-or-push
  distribution, governance voting while locked, 10k+ stakeholder batching.
  Acquired by Coinbase 2025 (Uniswap Foundation, OP Labs, Ethena, Zora).
- **UI/UX — the chart reference:** line chart of vesting+lockup with a
  **vertical "Today" marker and a hover popover decomposing vested / unlocked /
  withheld / net received** at that date. Grant cards show vesting AND unlocking
  progress + location/tax rate.

### Toku (depth)
- **Functionality:** token grant admin + tax compliance in 100+ countries;
  **valuation captured at each vest/unlock event** per policy; 83(b) tracking;
  RTA/RTU + double-trigger; **10b5-1-style pre-approved token trading plans**;
  immutable audit trails; sits under ADP/Workday.
- **Borrow:** valuation-at-event discipline (quantity + timestamp + valuation
  policy per audit event) — the compliance analogue of our FDV engine.

### Pulley tokens · Streamflow · Sablier · FAST · AdvisoryCloud · Carta consents
- **Pulley:** the only platform marketing **equity + tokens in one offer
  letter**, e-signed in-platform; custom lockups in addition to vesting.
- **Streamflow:** vesting models incl. milestone & price-based; white-label
  claim portals; immutable contracts with public proof links.
- **Sablier:** distribution **curves** (linear/cliff/exponential/tranches);
  CSV bulk + **pre-deploy simulations**; recipient sees full schedule +
  withdrawable balance.
- **Tokenomist (docs.unlocks.app):** the market-idiom unlock chart —
  **cumulative stacked-area by allocation bucket**, toggleable series, FDV/
  circulating-supply header strip, non-cumulative bar mode to spot cliffs,
  striped "TBD" bars for uncertain assumptions + a Historical Changes panel.
- **FAST (fi.co/fast):** still just a PDF matrix (3 stages × engagement →
  0.15–1.00%); no tooling ecosystem. Carta benchmarks: pre-seed median 0.21%,
  seed 0.11%, A+ 0.05–0.15%. Cooley GO: think in monthly basis points.
  **Comp Studio fills a real tooling gap here.**
- **AdvisoryCloud:** advisor sourcing only, severe billing complaints — confirms
  the gap, not a pattern source.
- **Carta board consents:** consents **auto-drafted from grant data** (incl.
  409A summary + FMV graph) → legal-review gate → publish → mobile e-sign →
  executed consent **bi-directionally linked** to the grant ("Board Details" tab).

### Track-3 synthesis
1. **Token-vesting charts: two idioms** — (a) market: stacked-area unlocks by
   bucket w/ FDV header (Tokenomist) for the aggregate pool/DilutionPath view;
   (b) grant: "Today"-marker line w/ vested/unlocked/withheld/net popover
   (Liquifi) for the per-advisor timeline.
2. **Dual-instrument:** Pulley side-by-side is the only prior art; nobody
   renders one combined package value — Comp Studio's net-package framing is
   differentiated. Magna's detail anatomy (summary → timeline → dates table →
   prose terms) is the best per-grant layout to mirror.
3. **Vesting ≠ lockup, co-plotted** is the industry-standard data model.
4. **Consent workflow:** copy Carta's shape — generated from grant data,
   explicit review gate, status visible on the grant, permanent grant↔consent
   link. Magna's recipient status enum is the template for lifecycle states.

Sources: docs.magna.so (admin-app-views, products) · liquifi.finance ·
coinbase.com/tokenmanager + acquisition blog · toku.com/{token-grant-administration,
token-compensation-primer} · pulley.com/products/cap-table-management/token-cap-tables ·
streamflow.finance · sablier.com/vesting · docs.unlocks.app/features/token-page/overview ·
fi.co/fast · equitymatrix.io · cooleygo.com/advice-advisor-option-grants ·
carta.com/blog/board-resolutions + releasenotes.carta.com (consent↔grant links) ·
trustpilot.com/review/www.advisorycloud.com.

---

## Track 4 — Offer presentation & scenario-modeling UX

### Complete (offer UX — see also Track 2)
- Narrative-first page order: *who you'll work with → company story → total-comp
  hero → breakdown → interactive upside modeling*; education inline beside each
  number; sliders recompute personal upside live; "preview as candidate."
- **Weakness that validates us:** no draft/version governance concept at all.

### Causal (causal.app, now Lucanet)
- Variable-based models; scenarios as first-class switcher with **side-by-side
  comparison columns**; input *ranges* → Monte Carlo → **shaded uncertainty
  bands** instead of three discrete cases; read-only shareable dashboards.
- **Weakness that validates us:** **no scenario locking / "approved plan"
  concept** — scenarios editable forever (called out by Runway's comparison);
  the company was absorbed into Lucanet. Comp Studio's governance/watermark
  concept is exactly this missing layer.

### Runway (runway.com) — **the scenario-lifecycle reference**
- Scenarios as **git-like branches of "Main"**: auto-draft on first edit →
  "Save draft as" named scenario → **Compare & merge** (admin-gated, diff
  review) → or discard. Scenario settings can disable pulls/merge/edits =
  **locked scenario** for budget-vs-actuals.
- Two comparison modes: **tabular** (scenarios as columns/rows + Variance and
  Variance% columns) and **graphical** (overlay lines on one driver chart).
  Searchable scenario-picker pill. Plans capture the **"why"** per scenario.
  Instant drill-in from any number to its drivers.

### Carta Exercising Simulator · Secfi
- Carta: scenario **preset chips** ("Exercise All Vested"/"Customize"),
  date-driven vesting recompute, cost/tax summary on top, "View Details"
  drill-downs per cost.
- Secfi Exercise Timing Planner: structurally our exit slider — adjust exit
  value → exercise cost, taxes, net gains update; "now vs at exit" two-column
  compare. Secfi's positioning: "Carta is where they view equity, not where
  they decide" — the decision layer is the product.

### DocSend · PandaDoc — watermark & version binding
- **DocSend:** per-link **dynamic watermarks** (viewer email/IP/date), tile/
  rotation/opacity with live preview; persistent links propagate new versions;
  no watermarks on signed docs.
- **PandaDoc:** no native UI watermarking — **"DRAFT until approved" watermarks
  tied to approval state is a top user request**; sealed-vs-customizable PDF
  split (`/download-protected` returns one immutable sealed render); editing a
  sent doc demotes it to draft and voids signatures.
- **Borrow:** watermark bound to a state machine (we already do this — COM-167);
  add the **sealed-render split**: one immutable artifact per issued version,
  draft renders regenerable; **edits after issuance demote to draft**.

### Track-4 synthesis
1. **The combined pattern no one ships:** Complete's narrative offer ×
   Runway's scenario lock × DocSend's state-bound watermark = Comp Studio's
   exact shape. The integration is the differentiator.
2. **Scenario comparison convention:** switcher pill + overlay chart lines +
   variance table columns — not full-page duplication.
3. **Sliders are table stakes**; differentiators are preset anchor chips and
   showing bands/ranges, not just the point under the thumb.
4. **Version-binding norm:** immutable sealed artifact per issued version;
   edits demote state.

Sources: complete.so/offers + blog + TechCrunch 2022 · cfoshortlist.com/vendors/causal ·
runway.com/blog/choosing-between-runway-and-causal · docs.runway.com/{concepts/scenarios,
guides/modeling/bva} · runway.com/product-updates/lock-scenarios-for-bva-analysis ·
releasenotes.carta.com (exercising simulator) · secfi.com/tools/exercise-timing-planner ·
help.dropbox.com/share/dropbox-docsend-watermarks · pandadoc.uservoice.com (watermark
request) · developers.pandadoc.com (download-protected).

---

# Cross-track pattern library → UX plan mapping

| Pattern (source) | Maps to `UX_IMPROVEMENT_PLAN.md` |
|---|---|
| Sandbox/named-scenario layering, never live mutation (Carta, Pulley, Runway) | WS-C feedback+undo · validates the scenario-set design (COM-143/147/148) |
| Branch → compare → **lock** scenario lifecycle + per-scenario "why" (Runway) | WS-C · future scenario-set issue; pairs with COM-176 rationale capture |
| Show-the-formula / inspectability (Carta complaint, Pulley export) | new candidate issue: "how this number was computed" popover (engine trace) |
| Preview-before-commit + impact preview (Pave, Carta TC refresh) | WS-C — extend to baseline edits (4.2) |
| Accept-with-preview **versioned benchmarks** + 3-axis confidence chips (Carta TC) | upgrade of COM-182 provenance (currently a text flag) |
| Band bar + dot + compa-ratio + market reference line + quantified fix cost (Ravio, Barley, Comprehensive) | upgrade of COM-179 band-placement chart; WS-G guardrail presentation (1.5/2.8) |
| Guardrails as workflow accelerators: in-band = clean, out-of-band = review path (Complete, OpenComp) | WS-C/WS-G — reframe Board warnings (1.5) + health-strip instead of banner (1.4) |
| Two-surface architecture + "preview as recipient" (all of Track 1, AngelList, Complete) | new candidate issue on the Proposition view (6.x) |
| Narrative offer order: story → hero → breakdown → interactive (Complete) | Proposition letter; move the exit slider *into* the letter flow (6.x) |
| Preset anchor chips above sliders + cost drill-down (Carta simulator, Secfi) | WS-E/exit-slider fix (1.7) |
| Shaded low/base/high bands on trajectory charts (Causal) | WS-F chart sweep — alternative to three discrete lines |
| "Today" marker + vested/unlocked/withheld/net popover (Liquifi) | per-advisor vesting timeline (COM-149 upgrade) |
| Stacked-area unlock chart + FDV header strip + striped TBD bars (Tokenomist) | DilutionPath/pool aggregate view |
| Grant-detail anatomy: summary → timeline → dates table → prose terms (Magna) | Instruments tab layout (7.5) |
| Lifecycle status enum w/ CTA-only-when-actionable (Magna) | pipeline stage chips + legend (7.4) |
| Consent generated from grant data + review gate + grant↔consent link (Carta, AngelList) | Governance audit-log binding (5.4) + COM-166/167 evolution |
| Sealed immutable render per issued version; edits demote to draft (PandaDoc/DocSend) | COM-174 version binding + 6.5 version affordance |
| Audit entry bound to its justifying document (Ledgy) | WS audit-log issue (5.4) |
| Per-audience disclosure dials (Aeqium) | future sharing/auth work (COM-34/35 era) |

## Where Comp Studio is already ahead (defend, don't dilute)
- Net-of-strike, dual-instrument package framing (no commercial prior art).
- Governance-state-bound watermark (PandaDoc users beg for this; Causal died
  without a locked-plan concept).
- Scenario-set walk-forward engine with FDV cases (admin token tools treat
  price as policy, not exploration).
- Verbatim legal corpus embedded at point of use (Toku's primer is a content
  page; ours is in the artifact).

## Where the market is clearly ahead (adopt)
- Benchmark provenance UI (Carta TC) · band-placement grammar (Ravio/Barley) ·
  scenario lock + variance compare (Runway) · recipient-surface separation +
  preview-as-recipient (everyone) · inline education next to numbers
  (Complete) · token chart idioms (Liquifi/Tokenomist) · formula
  inspectability (the gap Carta refuses to close).
