# Claude Design brief — Advisor Comp Studio (Raiku Labs)

High-fidelity design for the complete app. Read everything before designing anything.

---

## 1 · What this product is

**Advisor Comp Studio** is Raiku Labs' internal, confidential web app for modeling advisory-board
compensation: equity options (always shown **net of strike**) plus token allocations, walked through the
company's cap-table across funding scenarios. The output of every screen is a **discussion draft, not a
binding offer** — the app must feel authoritative and financial-grade, never sales-y.

- **Users:** the founder/CEO (primary operator), co-founders, counsel, and — via one printable view — the
  advisors themselves.
- **Mental model:** one *board* (a roster of ~6 advisors) × one *scenario set* (Conservative / Base /
  Aggressive cap-table paths) × a lifecycle (proposed → iterating → agreed → signed, reviews, departures).
- **Tone:** editorial, calm, precise. Think a beautifully typeset board memo that happens to be interactive
  — not a SaaS dashboard. The current app already leans this way (serif display headlines, quiet grays,
  one amber accent); the redesign should sharpen that identity, not flatten it into generic admin UI.
- **Live reference:** https://comp-studio-one.vercel.app (Vue 3 + frappe-ui "Espresso", deployed on Vercel).

## 2 · The assignment

Produce a **high-fidelity design for the entire app**, in **two directions**:

- **Direction A — "Espresso, perfected" (primary).** Keep the existing design system (§3) as a hard
  constraint: Inter + Fraunces, the semantic token palette, the layout grammar. Elevate fidelity, fix every
  known UX defect (§8), and design the missing surfaces (§9). Everything must be implementable with
  frappe-ui components + Tailwind tokens + custom SVG charts.
- **Direction B — exploratory (secondary).** Same IA, content, and non-negotiables (§10), but you may
  propose a fresh visual language: new type pairing, palette, density, chart styling. It must still read as a
  confidential financial instrument and remain buildable as a Vue/Tailwind SPA (no heavy animation
  frameworks, no dark-pattern gloss).

**Scope:** all 7 routes + app shell, all overlays (dialogs, wizard, command palette, toasts, banners), the
print/PDF Proposition and Board-pack templates, empty/loading/error states, and a new auth screen.
**Responsive:** design at 1440 (primary), 1024, 768, and 375. Desktop-first; at 375 the app must remain
fully usable (nav collapses, tables become stacked cards or scroll regions, charts re-rank labels).
**Color mode: light only.** Print designs in pure grayscale-safe form.

## 3 · Current design system (Direction A constraints; Direction B's baseline to consciously depart from)

**Type.** Inter for UI. **Fraunces** (`font-display`) only for page titles, hero figures, and the Proposition.
Exactly two typefaces. Big figures: Fraunces, weight 350, `tabular-nums`. Page titles are sentence-case
editorial statements with a full stop — keep this voice: "The advisory board, at a glance." · "The board, and
what it costs us." · "The board, side by side." · "Governance & consents." · "Base, then performance." ·
"The proposition." · "The plan everything is measured against."

**Color.** Semantic tokens only (`bg-surface-*`, `text-ink-*`, `border-outline-*` — frappe-ui Espresso).
**One accent: amber**, meaning exactly one thing — the current/active case or the brand moment. Status:
green = earned/up · red = down/underwater/destructive · amber = pending/base. Label-weight amber uses
the AA-safe `--ink-amber-strong: #8A4B08`; bright amber is reserved for the Proposition hero italic and
graphical fills. Chart colors come only from the `--chart-*` palette (capital / customer / partnership /
governance / uplift / alt / tint / cash / warning / median).

**Layout grammar (non-negotiable in Direction A).**
1. *Reading column vs wide canvas:* prose/single-subject views (Overview, Advisors, Configure,
   Proposition) live in a 960px reading column; dense table views (Board, Compare) widen to ~1280px.
2. *Borders earn their place:* bordered cards only for interactive surfaces, conclusion surfaces (the amber
   company-cost panel), and form-field groups. Static read-outs are section label + content directly on the
   white canvas, `divide-y` rows. Never nest cards.
3. *Lead with the subject:* the page's primary object (roster, package) first; analysis/charts below.
4. *Settings two-column:* long editing surfaces use a sticky left group-rail + active group's form right.
5. Section labels: one treatment (text-sm, medium, gray-7, sentence case). Amber is never a heading color.

**Numbers.** Always tabular-nums; numeric table columns and their headers right-aligned; dollars in $M on
chart axes; displayed strings rounded, chart geometry never.

## 4 · Information architecture & app shell

**Sidebar (left, ~208px):** Raiku Labs wordmark + "Internal" badge · Search (⌘K) · board switcher
("Advisory board — working draft") · **Case** select (Conservative/Base/Aggressive) · **Stage** select
(Bridge close → Series A/B/C → TGE) · nav groups — **Board:** Overview, Board, Compare, Governance ·
**Advisor:** Advisors, Proposition · footer: Configure, Share. Design the collapsed/mobile variant.

**Header bar:** breadcrumb left ("Advisory board — working draft / {View} / {Advisor}"), contextual
actions right with overflow menu — Board: *New grant decision · Board pack · Add*; Advisors: *Edit
package · advisor switcher · case selector · Print*; Proposition: *advisor switcher · Print · Copy · Save v1*.
At 1024px these currently collide (truncated "T…") — design the overflow behavior properly.

**Global alert posture — redesign required.** Today a red "Budget warning" banner renders on every view,
permanently consumes ~70px, and is only dismissible on some views. Replace with a compact persistent
status affordance (e.g. header status chip with popover detail + link "Review the pool on the Board"),
dismissible-per-session full banner only on first encounter. Show the warning, alert, and all-clear states.

**Command palette (⌘K):** "Go to" (the 7 routes), advisors, actions. Design it.

## 5 · The seven views (content is real; keep every data element)

### 5.1 Overview — `/overview`
Hero: eyebrow "Net cost · base" → **$28.1M** (Fraunces) → range "Conservative → Aggressive · $6.87M –
$78.6M" → stat triplet (Equity of company 5.50% base pre-uplift · Tokens of supply 3.30% earned ·
Annual cash $0). Roster grid: 6 advisor cards (avatar-initial, name, pre-condition count chip, pipeline
status chip [iterating/proposed/modeled], tier badge [Anchor/Strategic/Base], sector, net $ figure, "eq ·
tok" line, "+N% potential at ceiling" link). Right rail: **Key dates** (90d/180d toggle, empty state: "Nothing
lands in the next 90 days…"), **Pool allocation** (equity 5.50% → 8.05% / 10.00%, tokens 3.30% → 4.83% /
4.50% with earned-vs-ceiling dual bars — currently breaching, shown red), **Benchmark** (FAST band
note + source/staleness line), **To confirm / alerts** list. Footer: base-path line (Bridge $90.0M → Series A
$120.0M → Series B $300.0M → Series C $500.0M · TGE FDV $600.0M) + "How to read these figures"
methodology block — redesign this as a collapsible "About these figures" disclosure shared by all views
(today the full paragraph repeats at the bottom of every screen).

### 5.2 Board — `/board` (wide canvas)
Scenario segmented control (Conservative / **Base** / Aggressive). Roster table: Advisor (avatar, name,
sector) · Tier badge · Base eq % · Earned +% · Net $ · row overflow menu; totals row (Board · 6 — 5.50% —
$28.1M). Right rail: Pool allocation; **Company cost · net to the board** — THE conclusion surface, amber
panel, Conservative $6.87M / Base **$28.1M** / Aggressive $78.6M with a position marker. Below: "Scenario
range by advisor" bars (today nearly invisible — give the track real contrast or merge into the table as a
sparkline column); the **untapped-potential scatter** (bubbles per advisor, headroom-to-ceiling axis —
currently clips bubbles and axis labels; fix geometry, design coincident-bubble fan-out); **generosity
guardrails** panel (compa-ratio numbers need their unit "× vs $50K median" and the ▲/◆/▼ grammar in a
header tooltip, not a distant footnote); day-rate warnings aggregated into ONE roster-level callout listing
affected advisors (today the same amber sentence repeats ×6) with per-row icon + tooltip + inline
"justify" affordance (the one-line justification → audit trail editor is good — keep it). Also: grant-decision
list/history, exercise runbook entry point.

### 5.3 Compare — `/compare` (wide canvas)
Dense comparison table: Advisor · Tier · Base eq · Earned · Ceiling · Spread · Net conservative (red ↓76%) ·
Net base · Net aggressive (green ↑180%) · Cash/yr · **Pin**. Board totals row. Below: "Net value across
scenarios · $M" grouped-bar chart; fork-comparison flow (compare a fork "B" against the working draft —
recently added, needs a designed treatment for the fork chip, warning, and undo). Design pinned-advisor
behavior.

### 5.4 Governance — `/governance`
"Governance & consents." — the Governance Table v4 as a live checklist. Summary chips (9 red · 5 amber ·
0 green of 14 items). Sections A · Pool & resolution, B · Executive grants, C · Bridge & investor rights, plus
consent items (Pantera consent rows), each item: status dot, ID (A-1…), title, VERIFY/REQUIRED/OPEN
description, owner, timing ("before resolution signed"), Red/Amber/Green segmented setter, edit. Include
the audit log and compliance-runbook surfaces. This view is currently the plainest — bring it up to the
editorial standard without making a legal checklist feel decorative.

### 5.5 Advisors — `/advisors` (deep-linkable: design as `/advisors/:slug`)
"Base, then performance." + confidentiality subline ("Internal & confidential · net of strike, pre-tax ·
discussion draft, not a binding offer."). Base-path line. **Package card:** Base (Anchor · 3×), Options/tokens
65%/35%, Sector, Engagement (4 yrs · from 1 Jun 2026), Granted at, Tax residency, Cash, Performance
(+0% · ceil +70%) + red outstanding-pre-conditions paragraph + Pipeline stage select + "Model departure"
+ Edit package. **Floor / Current / Ceiling** tri-panel ($7.67M / $7.67M / $13.0M, current highlighted
amber). Across-scenarios table (Net/Equity/Tokens × Conservative/Base [tagged]/Aggressive). Then the
analysis read: scenario range bar, **vesting timeline** (dual curves), **trajectory chart** (TGE / next review /
cliff annotations currently collide — design staggered annotation lanes), **exit slider** (two-tone track,
keyboard-operable), upside curve, football field, band placement, mix breakdown, review panel
(schedule/record reviews), departure modeling. CTA "View {name}'s proposition" as a normal right-aligned
button, not the current full-width black bar.

### 5.6 Proposition — `/proposition` (the advisor-facing document; screen + print are first-class equals)
"The proposition." Interactive header card: **$7.67M** "net at ~$500.0M exit · eq $2.27M · tok $5.40M",
scenario slider Conservative—Base—Aggressive. Watermark state: amber notice listing outstanding
pre-conditions + a diagonal "PRE-CONDITIONS OUTSTANDING" watermark across the document until
governance is green. The document itself: letterhead (Confidential · Discussion draft | Raiku Labs ·
Advisory Engagement Proposition | Prepared for {advisor, with role}), editorial hero ("An invitation to the
founding advisory board" eyebrow → "A 4-year engagement, *a base that grows*" — serif + amber italic),
package terms, scenario outcomes, vesting, key dates, legal corpus, signature/next-steps block. Design
the **print template**: page margins, per-page running confidentiality footer with recipient fingerprint,
interactive controls hidden but their *conclusions* preserved as printed sentences, grayscale-safe charts.
Versioning: "Save v1" / "Copy".

### 5.7 Configure — `/configure` (settings two-column)
"The plan everything is measured against." Left rail groups: **Cap table** (Bridge · rounds · scenarios),
**Grants & pools** (uniform base · capital), **Performance** (objectives · tiers · milestones) — plus board
management, data import/export, reset. Right: Roadmap CSV import/download row (with column hint),
Bridge panel (post-money $90.0M, raise $5.00M, ESOP-at-adoption 10%/15% select, ESOP cap 20%),
Rounds cards (Series A/B/C, "Mark closed", delete) + "Add round", grant-timing prose, **Scenario paths**
cards (Conservative — exit $300.0M · 32% kept · FDV $200.0M; per-round post-money/ESOP grid; TGE ×;
"set base"; liquidity-event toggle) + "Add scenario", valuation records, advisor value bands, cash-floor
policy, review cadence. Numeric inputs, destructive-action confirms, undo toasts.

## 6 · Overlay & component layer (one system, designed once)

- **Dialog system — the single biggest defect class.** Every dialog (Edit package, New grant decision,
  Schedule review, Departure, runbook, confirm-destroy) must be max-height-constrained (~85vh), sticky
  header (title + close) and sticky footer (actions), scrollable body, real dimmed backdrop (~black/40).
  Today titles render off-screen above the viewport and the backdrop barely dims. Design the canonical
  dialog at three sizes + a long-form example.
- **Grant decision wizard ("the Ispahani 9 steps")** — currently nine flat textareas in one scroll. Design a
  grouped stepper (3 fieldsets or a true 9-step rail), inline validation ("Subject is required" + field focus),
  the "Live:" computed-context row (hidden when empty), and a record-confirmation state.
- **Forms:** inline field errors (red text under field — the system has no error prop, so design the pattern),
  auto-growing textareas, placeholder copy for empty optional fields, labeled units on every bare number.
- **Toasts** above all overlays; success/undo/error variants. **Empty states** (key dates, audit log, no
  advisors). **Loading:** route-level skeletons (header + content blocks) — cold navigation currently shows
  a 1–2s blank white page. **Banners/status chips** per §4. **Term tooltips:** a `<Term>` component
  underlines jargon (TGE FDV, net of strike, compa-ratio…) with definition popovers — keep and style it.

## 7 · Charts (14 — design a coherent family)

frappe-charts (styled to match): GrowthWaterfall, UpsideCurve, ValuationStaircase (grouped bar),
EquityBenchmark, the Compare grouped bar. Custom SVG: VestingTimeline (dual curves), DilutionPath,
FootballField, TrajectoryView, ExitSlider, ScenarioTable, MixBreakdown, KeyDatesRadar, PoolAllocation
(dual earned/ceiling bars), untapped-potential scatter. Rules: every series gets a **non-color channel**
(position, dash, initial) for color-blind/print safety; SVG text ≥11px rendered; dollar axes in $M; annotations
and bubbles must live inside the plot box (design the padding/clamp/collision behavior explicitly — label
clipping is a known recurring defect); tooltips with full-precision values; `role="img"` + descriptive label.

## 8 · Known UX defects the design must resolve (from the June 2026 review log)

1. Permanent banner eating 70px on every view; inconsistent dismissal. → §4 status posture.
2. Dialogs taller than the viewport, clipped titles, weak backdrop. → §6.
3. Silent primary actions: empty-form "Record decision" does nothing visible; "Board pack" gives no
   busy/confirmation state. → inline validation + toast/busy patterns.
4. Warning noise: identical amber day-rate sentence ×6 + per-row links. → aggregate + icon/tooltip.
5. Chart geometry: clipped rotated axis labels, bubbles outside the plot, colliding annotations
   (TGE/review/cliff), near-invisible range bars. → §7 rules + redesigned scatter/trajectory/range bars.
6. Exit slider: no fill/remainder distinction, reads as readonly. → two-tone, keyboard-operable.
7. No deep links (advisor/case/stage state lost on refresh) → design assumes `/advisors/:slug` + sticky
   case/stage context in shell.
8. Methodology paragraphs repeated on every view → shared collapsible disclosure.
9. Cramped header actions at 1024px → breadcrumb-line advisor switcher + overflow menu.
10. "View proposition" black bar; unlabeled compa-ratio numbers; 9-textarea wizard — all per §5–6.

## 9 · New surfaces to design (not yet built)

- **Auth screen** (Supabase email sign-in is the planned wave): minimal, on-brand, confidentiality framing
  front and center; signed-out state for every deep link; a session-expired interrupt. Today the app is
  public — the design should make the privacy posture visible (who's signed in, sidebar identity).
- **Share flow** (the sidebar "Share" item): what sharing a working draft means — design the dialog
  (recipient, scope, watermark implications).
- **Board pack** print template (multi-page: cover with confidentiality block, roster, per-advisor pages,
  governance register, methodology appendix) with running footers.
- **404 / error / engine-mismatch** states.

## 10 · Non-negotiables (both directions)

1. Legal corpus strings are verbatim and locked. Every advisor-facing/printable surface carries the
   confidentiality eyebrow ("Internal & confidential…") and "discussion draft, not a binding offer."
   Never design these away; design them *well*.
2. Every equity figure is **net of strike** — labels must keep saying so.
3. The CoC line follows Plan rules v9: no automatic/discretionary change-of-control acceleration;
   acquirer roll-over possible; vested options remain exercisable per plan rules.
4. WCAG AA: text contrast (no information in light gray under gray-6 equivalents), visible focus rings,
   ≥32px touch targets, keyboard-operable charts/sliders/rows, confirm-vs-undo destructive grammar.
5. Tabular numerals everywhere; right-aligned numeric columns; rounded display, exact geometry.
6. Terminology is fixed: net of strike, TGE FDV, FD, ESOP, compa-ratio, Anchor/Strategic/Base tiers,
   Conservative/Base/Aggressive, the Ispahani 9 steps, pre-conditions, board token bucket.
7. Implementable: frappe-ui-compatible component shapes, Tailwind-token styling, SVG charts. No
   bespoke 3D, no animation-dependent meaning.

## 11 · Deliverables

For **each direction**: app shell + all 7 views at 1440; Overview, Board, Advisors, Proposition additionally
at 768 and 375; the dialog system (3 sizes + wizard); command palette; toast/banner/status set; loading
skeleton + empty + error states; auth screen; Proposition print spread (2 pages) + Board-pack cover;
chart-family style sheet (all 14 thumbnails); and a token sheet (type scale, spacing, color roles, status
grammar). Annotate interaction states (hover/focus/active/disabled) on one exemplar of each component.

**Acceptance check:** every element named in §5 appears somewhere; every defect in §8 is visibly
resolved; every rule in §10 holds on every frame. When a trade-off is forced, optimize for: (1) trust &
legibility of the numbers, (2) calm screens with one clear subject, (3) print fidelity, (4) density.
