# Legacy audit — Wave 5 (COM-28 · COM-21 · COM-31)

**Date:** 2026-06-11 · **Auditor:** independent read-only audit agent
**Method:** static evidence (Grep/Read of `scaffold/src`) + live playwright probes against the built
preview at `http://[::1]:4173` (probe scripts `/tmp/claude/pw/audit-w5*.mjs`, screenshots
`/tmp/claude/pw/audit-w5-*.png`). Scopes taken from `IMPLEMENTATION_PLAN.md:407-433` (authoritative
while Linear is down). Fresh contexts booted the seeded 6-advisor roster as expected.

## Cross-issue summary

| Issue | Verdict | One-liner |
|---|---|---|
| COM-28 UpsideCurve | **RESIDUAL** | Both halves + breakeven + selected-exit marker shipped; the $1B caution band, per-scenario markers, and ChipRow presets are missing (known simplifications, never back-filled). The app footer still *promises* a caution band no chart draws. |
| COM-21 Colour-blind + a11y | **CLOSEABLE** | All five lines verified live: role=img/aria on every chart, non-colour encodings, role=alert banners, 10/10 focus rings, dark-toggle renders coherently (frappe-ui token branch). |
| COM-31 Mobile + print | **RESIDUAL (1 real gap)** | Print rules + all three print paths + drawer + spacing rhythm verified; no chart-legend clipping at 375px. But `/overview` overflows to **461px** at a 375px viewport (a second non-Board offender besides Board's known 572px), plus 2–23px breadcrumb spill on 3 routes. |

---

## COM-28 — UpsideCurve (both halves)

| Scope line | Verdict | Evidence |
|---|---|---|
| Equity net-vs-exit AREA + tokens-vs-FDV LINE in ONE component | **SHIPPED** | `scaffold/src/components/UpsideCurve.vue` holds both halves: equity area (custom SVG path, :33-42, :116-125) + token line (`FrappeChart type="line"`, :204-211). Live: both render on `/advisors` (probe PASS ×3). *Note:* the equity half is custom SVG per COM-57 (frappe-charts can't draw vertical markers/x-regions), not `regionFill` — a deliberate, recorded substitution (`memory.md` 2026-06-09 COM-57 entry); functionally equivalent area. |
| Breakeven marker | **SHIPPED** | Labelled dashed vertical + underwater x-band, `UpsideCurve.vue:91-143`; live SVG contains the text node `breakeven` (probe PASS). |
| $1B caution band (`yRegions`/`yMarkers`) | **GAP** | No visual band/marker anywhere: `lineOpts` (UpsideCurve.vue:51-54) has no `yMarkers`/`yRegions`; live token-chart SVG contains no caution text/region (probe FAIL, by design of the probe). Only the conditional caption survives (:212-218, gated on `plan.showBenchmarks`). The reference draws `ReferenceArea`+`ReferenceLine "$1B caution"` (`reference/advisor-comp-studio.tsx:731-732`). **Aggravator:** the shell footer legal text still says "shown **as a caution band**" (`App.vue:496-497`) — the copy promises a visual that doesn't exist. |
| Per-scenario markers + selected-exit marker | **PARTIAL → GAP** | Selected-exit marker SHIPPED on the equity half (COM-47/COM-84 ExitSlider → `markerExit`, UpsideCurve.vue:45-48, :144-163; live: marker circle present). Per-scenario markers ABSENT on both halves (`props.c.scen` is used only to scale `topFdv`, :55-60; live equity-SVG text nodes = `[breakeven, $5.88M, $0, $0, $500.0M, $1.00B]` — no scenario labels). The token half has neither scenario nor selected markers (reference: per-scenario `ReferenceLine`s + `selFdv` marker, tsx:719, :733-734). |
| ChipRow presets (TabButtons/Button row) | **GAP (superseded?)** | No chips: zero buttons inside the Upside panel (live probe); no `ChipRow`/`TabButtons` in UpsideCurve or near it. Recorded as a KNOWN SIMPLIFICATION (`memory.md:103-104`, again :180). The COM-47 ExitSlider (`ExitSlider.vue`) functionally supersedes the *equity-half* presets (continuous scenario-range scrub + persisted target), but the *token-half* FDV presets have no equivalent. If Robin ratifies the slider as the replacement, this line shrinks to the token half only. |
| Explicitly NO separate token-line chart component | **SHIPPED** | The token line lives inside UpsideCurve via the generic `FrappeChart.vue` wrapper; the only other FrappeChart consumers are Compare (grouped bars) and Board (staircase) — no standalone token-line component exists. |

**Verdict: RESIDUAL.** Gaps, sized:
1. **$1B caution band on the token chart — S/M.** frappe-charts has no x-axis markers, so this needs either a `yMarkers` axis-flip trick or (cleaner, consistent with COM-57) porting the token half to the same custom-SVG kit and drawing the band + label from `BENCH.fdvCaution`. Until then either ship it or soften the footer's "shown as a caution band" line (App.vue:497) — currently a copy/feature mismatch.
2. **Per-scenario markers (both halves) + selected marker on the token half — M.** Equity half is custom SVG already (cheap to add vertical per-scenario ticks from `c.scen`); token half blocked by the same frappe-charts x-marker limitation as (1).
3. **ChipRow presets — S (decision) or M (port).** Recommend a decision record: "ExitSlider supersedes the equity presets; token-half presets land with (1)/(2)" — then this line closes by supersession.

---

## COM-21 — Colour-blind safety + a11y

| Scope line | Verdict | Evidence |
|---|---|---|
| Charts carry `role="img"` + aria-labels | **SHIPPED** | Wrapper: `FrappeChart.vue:89` (`role="img"` + `aria-label` when given; COM-44). Custom SVG: UpsideCurve.vue:88-89/:210, VestingTimeline.vue:124-125, TrajectoryView.vue:87-88, GrowthWaterfall.vue:109-110, FootballField.vue:25, EquityBenchmark.vue:29-30, Board scatter :546, Board staircase labelled at the Panel level (Board.vue:461-462), Compare grouped bars :258/:418. Live: 0 bare chart SVGs on `/board` and `/compare` (probe PASS). |
| Non-colour encodings on chart semantics | **SHIPPED** | Breakeven = dashed line + text label "breakeven" (UpsideCurve.vue:127-143); underwater = shaded band + caption text (:194-197) + a literal "equity underwater" Badge in ScenarioTable.vue:81-86 and "underwater" text in ExerciseRunbook.vue:67-68 / Proposition.vue:362; waterfall states = solid/faded/outline with the in-chart legend "solid earned · faded pending gate · outline available" (GrowthWaterfall.vue:102, visible in the print screenshot); VestingTimeline legend uses dash-pattern swatches (:203-210); pending state is a text chip not an emoji/colour (COM-65). |
| Alert banner a11y | **SHIPPED** | frappe-ui `Alert` renders `role="alert"` (`scaffold/node_modules/frappe-ui/src/components/Alert/Alert.vue:65`); used for storage + budget banners (App.vue:453, :460) and Overview "To confirm / alerts" (Overview.vue:271). Live: 2 `[role=alert]` nodes on `/overview` with the seeded over-budget roster. |
| Focus states survive (focus-visible rings) | **SHIPPED** | Live keyboard survey on `/advisors`: **10/10** tabbed elements (search trigger, board switcher, selects, nav items) show a visible outline and/or ring (probe PASS). App-level backstops: `.range-input:focus-visible` (style.css:80-83) and SVG-group outline for scatter bubbles (style.css:137-145, COM-41). |
| Dark-mode check (`[data-theme=dark]`) | **SHIPPED (informational)** | Setting `document.documentElement.dataset.theme='dark'` flips frappe-ui's semantic tokens: app root goes `rgb(15,15,15)` with ink `rgb(248,248,248)`; `/overview`, `/advisors`, `/board` all render coherently — screenshots `audit-w5-dark-{overview,advisors,board}.png`, no layout breakage, tables/figures legible. Caveats (not breakage): the app is **light-only by decision** (COM-110, style.css:112-114 — dark token branches deliberately deleted; `color-scheme: light` at :106), and frappe-charts' internal axis ink (`rgb(85,91,81)`) + the `--chart-*` light-literal hexes don't re-theme — charts keep light-theme inks under the toggle. Acceptable under "semantic-token styling should hold; main views don't break". |

**Verdict: CLOSEABLE.** Draft evidence comment:

> **Verified closed by the W5 legacy audit (2026-06-11, live probes on :4173 + static sweep).**
> (1) Every chart is screen-reader addressable: the FrappeChart wrapper emits `role="img"`+`aria-label`
> (FrappeChart.vue:89) and all seven custom-SVG charts carry their own (UpsideCurve/Vesting/Trajectory/
> Waterfall/FootballField/EquityBenchmark/Board-scatter); live probe found 0 bare chart SVGs on /board
> and /compare. (2) Chart semantics carry non-colour encodings: dashed+labelled breakeven, shaded
> underwater band + "equity underwater" text badge, solid/faded/outline waterfall legend, dash-swatch
> vesting legend, text "pending" chips. (3) Alert banners are `role="alert"` (frappe-ui Alert) — 2 live
> on /overview. (4) Keyboard focus: 10/10 tabbed shell/nav elements show focus-visible rings live;
> `.range-input` and SVG-group outlines are styled explicitly (style.css:80,139). (5) Dark toggle: setting
> `data-theme=dark` re-themes via frappe-ui tokens with no breakage on /overview /advisors /board
> (screenshots attached); the app remains light-only by COM-110, with chart inks deliberately unthemed.

---

## COM-31 — Mobile + print

| Scope line | Verdict | Evidence |
|---|---|---|
| `@media print` rules ported (`.no-print`/`.print-area` + `@page` 14mm) | **SHIPPED** | style.css:158-213 — `.no-print{display:none}` :162, `.print-area` cleanup + break-inside rules :168-185, `@page{margin:14mm}` :210-212; plus the COM-59 `.print-running` confidentiality band :190-209. |
| Dead `.print-only` rule NOT present | **SHIPPED (evolved)** | No *dead* rule exists: `.print-only` (style.css:151-155, :165-167) was deliberately **revived with a real consumer** by COM-84 — the ExitSlider's print-only target-outcome sentence (`ExitSlider.vue:128-131`), confirmed rendering under print emulation on /advisors ("At a ~$500.0M exit, this package is worth ~$7.67M net…"). The criterion's intent (no defined-but-unused CSS) holds. |
| All three print paths work | **SHIPPED** | Buttons live: Advisors "Print" (Advisors.vue:201 → `window.print()` :111), Board "Board pack" (Board.vue:280 → :87), Proposition "Print" (Proposition.vue:151 → :84) — all found by probe. Print-media emulation screenshots `audit-w5-print-{proposition,advisors}.png`: on both routes ALL `.no-print` nodes compute `display:none` (6 and 9 resp.), `.print-area` visible, `.print-running` band `display:flex` with the confidential + per-recipient line; structure sane (clean letter on /proposition incl. watermark + legal corpus; chrome-free package doc on /advisors). |
| Responsive nav (mobile drawer) | **SHIPPED** | App.vue:267-284 (scrim + off-canvas `aside`, `inert` focus containment COM-135) + hamburger :429-441 (`aria-label="Open navigation"`, `aria-expanded`). Live at 375px: hamburger visible, `aria-expanded false→true`, drawer translates in with scrim, nav items reachable (3 probe PASSes). |
| `px-3 sm:px-5` spacing rhythm | **SHIPPED** | Header/banner/footer rows App.vue:428,452,459,484; every view container: Advisors.vue:169, Proposition.vue:140, Overview.vue:144, Governance.vue:93, Board.vue:262, EmptyState.vue:11. |
| Chart legends don't clip at 375px (sweep all routes; Board 572 known) | **SHIPPED for legends / GAP for layout** | Legend/chart clip: **zero** chart-SVG overflows vs container on all 7 routes at 375px (probe `chartClips=[]` everywhere; frappe-charts ellipsizes long x-labels rather than clipping). 375px sweep of `scrollWidth`: `/advisors` 375 ✓ · `/proposition` 375 ✓ · `/board` **572 (the KNOWN legacy roster-table width)** · **`/overview` 461 — a second real offender**: the roster-card column (`div.lg:col-span-2` grid, 449px wide; widest child the absolute `rounded-full` range bar, right=470) · `/governance` 398, `/configure` 382, `/compare` 377 — all three are the **header breadcrumb** spilling 2–23px (the active-crumb router-link, e.g. right=398 on /governance); Compare's data table itself scrolls correctly inside its `overflow-x-auto`. |

**Verdict: RESIDUAL.** Print (all three paths), nav, spacing and legend behaviour are done and evidenced; what remains is mobile-width only:
1. **`/overview` horizontal overflow at 375px (461px scrollWidth) — S.** The roster-card grid + its absolute range-bar fill don't compress below ~449px; needs a `min-w-0`/wrap pass on the Overview roster cards. Not covered by the Board 572px known-legacy carve-out.
2. **Breadcrumb spill (+2…23px) on /governance, /configure, /compare — S (cosmetic).** Long board name + crumb in the h-12 header row; `min-w-0` + truncate on the crumb container likely suffices.

If Robin prefers, COM-31 could close on its print/nav core with the two mobile-width items split to a new S issue — but as scoped ("Mobile + print"), the audit verdict is RESIDUAL.

---

## Probe artifacts

- `/tmp/claude/pw/audit-w5.mjs` — main probe (24/25 PASS; the 1 FAIL is the COM-28 caution-band gap, asserted intentionally)
- `/tmp/claude/pw/audit-w5b.mjs` — 375px overflow offender identification
- `/tmp/claude/pw/audit-w5c.mjs` — dark-mode computed-colour sampling
- Screenshots: `audit-w5-dark-{overview,advisors,board}.png`, `audit-w5-print-{proposition,advisors}.png`, `audit-w5-dark-table.png`
