# UI/UX Improvement Plan — Comp Studio

Rolling log from the 10-pass browser review loop (started 2026-06-11, prod build
`be1da3f` at https://comp-studio-one.vercel.app). Each pass uses the app as a real
user via the Cursor browser, logs findings here, and ends with a prioritized,
adoption-first plan (frappe-ui components / app-shell patterns over custom builds).

**Skill baseline installed for this work** (in `~/.agents/skills/`): `impeccable`
(pbakaus — flagship design/critique/audit suite), `web-design-guidelines` (Vercel
Web Interface Guidelines review), `fixing-accessibility` (ibelick), `baseline-ui`
(ibelick — Tailwind hygiene), plus the pre-existing `frontend-skill` (Anthropic),
`frappe-ui`, and the ce-frontend-design / ce-design-* subagents.

Severity: **P0** broken/blocking · **P1** clearly hurts use · **P2** polish.

---

# EXECUTIVE SYNTHESIS (Pass 10 — final)

10 passes complete: ~50 findings deduped into 8 workstreams below. (The file
contains a few duplicate pass sections from a parallel reviewer; their findings
agree and are folded in here.) Overall: **the product's content, legal corpus,
print path, ⌘K palette, Configure layout and lifecycle-dialog content are
genuinely strong.** The weaknesses are systemic, not cosmetic — one overlay
lifecycle bug, one missing feedback discipline, one router gap — which is good
news: a handful of structural fixes clears most of the list.

## The one P0

**Overlay lifecycle wedging (2.1 · 3.2 · 7.3 · 8.2-dup).** reka-ui overlays gate
teardown on `transitionend`; when transitions are throttled or interrupted the
app is left with `body { pointer-events: none }` (observed 30s mouse-dead),
invisible-but-open dialogs, and a drawer that re-opens after navigation. Fix:
never gate overlay visibility/teardown on animation completion — state-driven
visibility, timeout fallbacks, drawer close on `router.afterEach`, body-style
restoration guard.

## Workstreams → proposed issues (each ≤450 LOC)

| # | Workstream | Folds in | Core fix |
|---|-----------|----------|----------|
| WS-A | **Overlay lifecycle hardening** (P0) | 2.1, 3.2, 7.3, 8.2-dup | State-driven overlay teardown + pointer-events guard + drawer reset on route change. |
| WS-B | **Shared AppDialog** (P1) | 1.2, 2.3, 2.5, 7.2-dup, 8.4 | One wrapper on frappe-ui `Dialog`: `max-h-[85vh]`, sticky header/footer, scrollable body, `bg-black/40` backdrop, semantic z-index scale. Every dialog inherits. |
| WS-C | **Feedback + undo discipline** (P1) | 4.2, 5.1, 7.1, 7.2, 2.4, 4.5, 7.3-dup | Every consequential mutation gets: toast + Undo (extend the UXS-D timeline to baseline edits, RAG flips, deletes); guardrail refusals persist inline at the control; empty-form submits show inline `FormControl` errors; no scroll-jumps on in-page state changes. |
| WS-D | **Router: deep links + loading** (P1) | 1.1, 1.3, 2.2, 3.8 | `/advisors/:slug` + case/stage in query; `scrollBehavior` reset; route-level skeleton fallback for lazy chunks; breadcrumb from the nav model (no flash). |
| WS-E | **Denominated money entry** (P1) | 4.1, 4.3, 4.4 | NumIn edits in display units ("90.0" + M suffix, accepts "95M"), live formatted preview, hover affordance, SR value exposure. The anti-10×-error issue. |
| WS-F | **Chart geometry sweep** (P2) | 1.6, 1.8, 2.7, 2.8, 2.6-dup, 3.7 | Clamp annotations/bubbles to plot boxes, collision-shift labels, annotation lanes, unit-label the guardrail column, active-case highlight in grouped bars. |
| WS-G | **Information design + copy** (P2) | 1.4, 1.5, 1.12, 3.1, 3.3, 3.4, 3.6, 6.2–6.5, 7.4, 8.4-dup | Banner → compact dismissible status chip; aggregate repeated guardrail warnings into one summary callout (reuse Governance's chip pattern); methodology popover written once; A/B headers + Δ column + case-bound labels; stage legend; jargon sweep (Δn/B.3/straw-man out of tooltips). |
| WS-H | **App-shell header + a11y batch** (P2) | 8.1, 1.10, 1.9, 8.2, 9.1–9.4, 9.6, 5.2, 5.3, 1.7, 1.13 | Gameplan header pattern: actions collapse into `More actions` <1280px (kills the 1024 overlap); skip link; heading outline fix; named icon buttons; radiogroup RAG; un-readonly the slider; `scroll-margin-top`. |

Suggested Linear breakdown: WS-A and WS-B as one issue each (S/M); WS-C split
into "undo extension" + "inline validation & refusal persistence"; WS-D one
issue; WS-E one issue; WS-F/G/H one sweep issue each — **9 issues, all ≤450 LOC.**

## Keep-as-reference (verified strengths)
Print/watermark path (6.1) · ⌘K palette (9.5) · Configure two-column layout +
empty-state copy (4.6) · runbook/departure dialog content (7.5, 7.1-dup) ·
Compare matrix (pass 3) · append-only audit log + honest disclosures (5.5) ·
mobile drawer + 375 layout (8.2/8.3).

---

## Pass 1 — Shell, Overview, Advisor detail, Edit-package editor (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 1.1 | P1 | Router | Advisor detail is not deep-linkable: opening Iraj lands on bare `/advisors` — refresh/share loses the selected advisor. Same for case/stage state. | Route params: `/advisors/:slug` (+ query for case/stage). Vue Router param-driven state, sidebar/palette links updated. |
| 1.2 | P1 | Edit package dialog | Dialog is taller than the viewport: the header ("Edit package · Iraj Ispahani") and the Close button render off-screen above the fold; only body + footer visible. | Adopt frappe-ui `Dialog` scroll grammar: max-h constrained panel, sticky header + sticky footer, scrollable body. |
| 1.3 | P1 | Router | Scroll position persists across route changes — navigating Advisors→Board lands mid-page in the guardrails section. | `scrollBehavior() { return { top: 0 } }` in the router (keep saved position only for back/forward). |
| 1.4 | P1 | Global banner | "Budget warning" banner renders on every view, permanently eats ~70px, and is dismissible on Board (X) but not elsewhere — inconsistent. | One global dismissible banner (persist dismissal per session) or collapse to a compact status chip in the header with popover detail. |
| 1.5 | P1 | Board guardrails | The identical amber "Day-rate reality: ~$53K/day implied…" warning repeats verbatim for all 6 advisors + per-row `justify` links — a wall of red/amber noise. | Aggregate: one roster-level callout listing affected advisors; keep per-row indicator as a small icon + tooltip. |
| 1.6 | P2 | Board scatter / Upside charts | Label clipping: rotated Y-axis label "Headroom to c…" cut; "Aggressive" annotation clipped at right edge of token chart; "$1B caution" chip touches plot edge; scatter bubbles overlap axis text. | Add chart padding/clamp annotations inside the plot box in the custom SVG components. |
| 1.7 | P2 | Exit slider | Track renders near-fully dark both sides of the thumb — no visual fill vs remainder distinction; AX tree reports the slider as `readonly`. | Two-tone track (filled vs rest), remove readonly state, keyboard arrows adjust value. |
| 1.8 | P2 | Trajectory chart | "TGE / Next review due / Cliff" annotations stack at the same x and collide. | Stagger annotation lanes or collapse into one marker with a multi-line tooltip. |
| 1.9 | P2 | Advisor detail CTA | "View Iraj's proposition" is a full-bleed black bar spanning the reading column — reads as a footer, heaviest element on the page. | frappe-ui `Button` (solid, normal width, right-aligned in a section footer row). |
| 1.10 | P2 | Header (advisor view) | Top-right is cramped: "Edit package" + advisor switcher + truncated overflow ("T…") at 1024px. | Move advisor switcher into the breadcrumb line (Gameplan pattern); overflow actions into the existing `More actions` dropdown. |
| 1.11 | P2 | Editor form | Notes textarea clips its content (no auto-grow, no expand affordance); Referee/Supervisor inputs unlabeled-looking empty grays. | frappe-ui `Textarea` with auto-rows; placeholder copy for empty optional fields. |
| 1.12 | P2 | All views | "How to read these figures" + long methodology paragraphs repeat at the bottom of every view — heavy reading load on every screen. | Collapse into a shared `<details>`/popover ("About these figures") component; write once. |
| 1.13 | P2 | Search button | Visible label renders "⌘ + K" but the AX name reads "Search K" / "Search + K" inconsistently. | Wrap the kbd hint in `aria-hidden`, give the button `aria-label="Search"` + `aria-keyshortcuts="Meta+K"`. |

**Pass-1 verdict:** the bones are good (clear IA, editorial hierarchy, consistent
Espresso look). The biggest lived-experience drags are: no deep links, the
ever-present banner, warning noise on Board, and the overflowing edit dialog.

### Adoption shortlist (running)
- frappe-ui `Dialog` (constrained + sticky header/footer) for Edit package, Schedule review, runbook dialogs.
- Gameplan/Helpdesk app-shell header pattern: breadcrumb-left, actions-right with overflow menu — fixes 1.10.
- frappe-ui `Tooltip`/`Popover` for guardrail `justify` affordances and methodology notes.

---

## Pass 2 — Board deep pass: grant decision, board pack, guardrails (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 2.1 | P1 | Routing/perf | Cold navigation to `/board` renders a blank white main area for ~1–2s (lazy route chunk, no skeleton/spinner); breadcrumb also drops the "Board" segment while loading. | Route-level `Suspense` fallback: skeleton blocks (frappe-ui has the gray-surface idiom) + keep breadcrumb static from the nav model. |
| 2.2 | P1 | All dialogs | Systemic with 1.2: the "New grant decision" dialog also overflows the viewport (title + close button off-screen, subject row clipped under the banner) and the backdrop barely dims — page content shows through bright, modal boundary unclear. | One shared Dialog wrapper: `max-h-[85vh]`, internal scroll, sticky header/footer, proper `bg-black/40` overlay. Fix once, every dialog inherits. |
| 2.3 | P1 | Grant decision | Clicking "Record decision" on an empty form produces **no visible feedback** — no inline field errors, no visible toast (one mounts off-viewport per the AX tree), dialog just sits there. | Inline `FormControl` error on Subject + focus the failing field; toasts must mount above dialogs (z-index scale) and within the viewport. |
| 2.4 | P2 | Grant decision step 8 | Dangling "Live:" label with no data after it (ux-sweep OB-11, confirmed live at prod tip). | Hide the Live line when the computed reserve context is empty. |
| 2.5 | P2 | Board header | "Board pack" click gives no in-page response (likely fires `print()` directly) — no busy state, no confirmation, nothing announced. | Brief toast/"Preparing pack…" state before print; disabled state while preparing. |
| 2.6 | P2 | Board | "Scenario range by advisor" bars are near-invisible: light-gray track on white with a 1px orange tick. The data (range $1.87M–$21.4M) is doing real work but reads as decoration. | Stronger track contrast + thicker marker; or merge into the roster table as a sparkline column. |
| 2.7 | P2 | Board scatter | Confirmed from pass 1: rotated axis label clipped ("Headroom to c…"), bubbles overlap the legend/axis text at the top-left cluster. | Pad the SVG viewBox; collision-shift labels. |

**Pattern emerging:** dialogs and feedback are the weak layer (sizing, backdrop,
validation visibility, silent actions) — one shared Dialog + Toast discipline fixes
a whole class. Charts need a clipping/padding sweep.

### Adoption shortlist (additions)
- Shared `AppDialog` wrapper around frappe-ui `Dialog` (max-h, sticky chrome, real overlay) → kills 1.2, 2.2, 2.3-display.
- Semantic z-index scale (dropdown → sticky → modal → toast) per the impeccable layout rule.

---

## Pass 2 — Board deep pass: charts, grant decision, guardrails (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 2.1 | P0 | Global (intermittent) | After a direct load of `/board`, `document.body` computed `pointer-events: none` for ~30s — every header action ("New grant decision", "Board pack", "Add") was mouse-dead with zero visual cue (full opacity, no disabled state) — then self-cleared. No inline style or matching CSS rule found afterwards; likely an overlay/toaster (reka-ui dismissable-layer or sonner) holding body pointer-events past its lifetime. | Reproduce + instrument: watch `body` style mutations on load; pin the offending layer; ensure overlay teardown always restores pointer-events. This is the kind of bug users report as "the app randomly stops responding". |
| 2.2 | P1 | Router / lazy chunks | Direct navigation to `/board` renders a fully blank content area (banner + footer only) for 1s+ while the route chunk loads — no skeleton, no spinner. | Add a router-level loading fallback (frappe-ui `Spinner` or a lightweight skeleton of the page header) via `defineAsyncComponent` loading component or a `router.beforeResolve` progress bar. |
| 2.3 | P1 | New grant decision dialog | Same dialog overflow as 1.2: the title ("New grant decision · the Ispahani 9 steps") and Close button clip above the viewport; the Subject row is half-hidden under the banner. Confirms the issue is systemic to the Dialog wrapper, not one form. | Fix once in the shared dialog component (max-h + sticky header/footer + scrollable body). |
| 2.4 | P1 | New grant decision dialog | Clicking "Record decision" with an empty form does nothing: no validation message, no field highlight, no toast. Silent rejection on the primary action. | Inline `FormControl` error on Subject ("Subject is required"), focus the field, `aria-live` announcement. |
| 2.5 | P2 | All dialogs | Backdrop barely/not dimmed — background stays full-brightness, so the modal context is weak and the clipped header (2.3) is easy to miss. | Standard overlay: `bg-black/40` backdrop (frappe-ui Dialog default). |
| 2.6 | P2 | 9-step wizard | The Ispahani sequence renders as one flat 9-textarea form. Step 8 shows a dangling "Live:" with no data (OB-11 confirmed in prod). Steps 1–9 + helper prose = a very long undifferentiated scroll. | Group steps into 3 fieldsets (or a real stepper); suppress the "Live:" row when there's no live figure. |
| 2.7 | P2 | Untapped-potential scatter | The Anchor bubble renders half OUTSIDE the plot top edge; Robert/Martin/Kerim bubbles overlap into one unreadable blob; y-axis tick labels collide with the rotated "Headroom to ceiling" label. | Clamp bubble centers to the plot box minus radius; jitter/fan-out coincident bubbles or switch to a labeled beeswarm; move axis title above the plot. |
| 2.8 | P2 | Generosity guardrails | Right column shows bare numbers (38.33, 25.55, 12.78) with no unit — they're compa-ratios but the ▲/◆/▼ grammar is only explained in a footnote far below. | Label the column ("× vs $50K median") and put the grammar in a header tooltip. |
| 2.9 | — | Guardrails `justify` | Positive: the inline justification editor (one-line input → audit trail) is a good pattern. The problem stays the ×7 repetition of the same amber sentence (1.5). | Keep the editor; aggregate the warnings. |

**Pass-2 verdict:** Board's table + panels are solid; the chart row needs geometry
fixes; the dialog system needs one structural fix (constrained height, dim, sticky
chrome, inline validation); and the body pointer-events freeze is the single
scariest defect found so far.

---

## Pass 3 — Compare, A/B packages, scenario switching (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 3.1 | P1 | A/B panel | With the global case set to Aggressive, the row still reads "Base case (net)" but shows the Aggressive figure ($21.4M) — the label says one scenario while the number follows another. Decision-grade data with a misleading label. | Bind the row label to the active case ("Current case (net) · Aggressive") or always show the true base alongside. |
| 3.2 | P1 | Global | The pointer-events freeze (2.1) reproduced a second time: immediately after closing the board-switcher dropdown with Escape, `body` computed `pointer-events:none` and a sidebar click was rejected; it cleared within ~1s this time. Pattern: reka-ui dismissable-layer keeps body locked during/after overlay close; the 30s variant on /board load is the same mechanism wedged. | Same investigation as 2.1 — audit every `DismissableLayer`/modal `:modal=true` usage; ensure no overlay mounts invisibly on route load. |
| 3.3 | P2 | Compare matrix | The per-row delta chips (↓76% / ↑180%) are identical on every row — they restate the scenario-level spread six times; they look advisor-specific but aren't. | Show the deltas once in the column header; keep cells to dollar values. |
| 3.4 | P2 | Compare matrix | Tier names are color-coded (Anchor orange, Strategic olive, Base brown) with no legend anywhere on the view; colors don't match the chart palette below (navy/brown/teal). | One tier→color mapping shared by table + charts, or drop tier colors in the table (the word is enough). |
| 3.5 | P2 | Compare matrix | Only "Spread" is a clickable header (sort?) — nothing signals sortability; other columns aren't interactive. | Either adopt frappe-ui ListView column sorting across the numeric columns or remove the lone header button. |
| 3.6 | P2 | A/B panel | The two value columns have no column headers — the A/B names live only in the pickers above; with two same-tier advisors the columns are guess-work after scrolling. No Δ column either, which is the entire job of A/B. | Add column headers (advisor names) + a delta column. |
| 3.7 | P2 | Grouped bar chart | "Conservative" bars are nearly invisible at this scale (tiny dark slivers); the active-case underline in the legend didn't visibly update when the global case changed to Aggressive. | Log-ish secondary axis is overkill — instead show value labels on hover + highlight the active case series; verify the legend underline binds to state. |
| 3.8 | P2 | Routing | Blank-content flash on direct `/compare` load — third route confirming 2.2 is systemic. | Same router-level loading fallback. |

**Pass-3 verdict:** Compare's matrix is the strongest table in the app; the A/B
tool underdelivers (no headers, no delta, mislabeled case row), and the freeze bug
now has a reproducible trigger (overlay dismissal) — that's the one to fix first.

---

## Pass 4 — Configure: baseline surface, scenario editor (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 4.1 | P1 | NumIn (all Configure money fields) | Editing "$90.0M" Bridge post-money opens a raw `90000000` — the user edits unformatted integers and must count zeros on the single most consequential number in the model (the strike anchor). One missed zero = a silent 10× error everywhere. | Denominated editing: keep the display unit ("90.0" + fixed "M" suffix, or accept "95M"/"95m" shorthand) with live formatted preview; thousands separators at minimum. |
| 4.2 | P1 | NumIn commit | Committing the bridge edit produced **no toast and no undo** — the engine silently re-anchored every figure in the app. The UXS-D per-toast undo only covers flows that toast; baseline edits don't. | Toast every baseline-plan commit ("Bridge post-money → $95.0M · Undo") reusing the UXS-D timeline; these are the highest-blast-radius edits in the product. |
| 4.3 | P2 | Configure | Editability is invisible: committed values render as plain text (no border, no hover tint visible) until clicked. New users won't know the plan is editable in place. | Subtle affordance on hover/focus (underline-dotted or pencil-on-hover) + one-line hint at the section top. |
| 4.4 | P2 | NumIn a11y | The click-to-edit buttons expose only the field label ("Bridge post") as AX name — the current value isn't announced to screen readers in display mode. | `aria-label="Bridge post-money: $90.0M"` or a visually-hidden value span. |
| 4.5 | P2 | Scenario cards | "set base" chip-button vs "★ base" state is subtle; the destructive "Delete scenario" trash sits one icon away from it with no confirm. | Confirm dialog (or undo toast) on scenario/round delete; clearer selected-state treatment. |
| 4.6 | — | Configure | Positives: the two-column settings layout with section nav is the cleanest surface in the app; CSV import/download up top; the saved-sets empty state ("save the current scenario grid… '$90m floor per strategy memo'") is exemplary empty-state copy. | Use this view as the layout/empty-state reference for the rest. |

**Pass-4 verdict:** Configure's structure is the app's best, but the editing
mechanics around the most dangerous numbers are the weakest: raw-integer entry,
invisible affordance, and silent, un-undoable commits.

---

## Pass 5 — Governance: register, RAG statuses, consents, audit log (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 5.1 | P1 | RAG status buttons | Flipping A-1 Amber→Green is a single click with zero feedback — no toast, no undo, no why-note prompt — yet it changes grant-precondition gating app-wide (Overview chips, Proposition watermark). The audit log records the what but the why-note only exists behind the separate pencil editor. | On flip: toast with Undo (reuse UXS-D timeline) + inline optional "why" input (the guardrail COM-176 built, surfaced at the moment of change). |
| 5.2 | P2 | RAG controls | 14 rows × 3 independent toggle buttons = 42 unrelated buttons in the AX tree; semantics should be one radiogroup per row ("Status: A-1") with three options. | Wrap each triple in `role=radiogroup` + `aria-label` per item; arrow-key cycling. |
| 5.3 | P2 | Sticky header | Rows scrolled under the sticky app header still own their click targets — a click at that position lands on the header overlay (intercepted during the pass). Keyboard focus also tucks rows under the header (no `scroll-margin-top`). | Add `scroll-margin-top` matching the header height to row containers/focusables. |
| 5.4 | P2 | Audit log | The append-only log sits at the absolute bottom of Governance with no event count in the nav and no kind-filter; it will be unusable at hundreds of events (1000-cap). | Promote to its own tab/section with kind filter chips (grant/review/consent/…) — frappe-ui ListView fits. |
| 5.5 | — | Governance | Positives: the register's grouped sections, the "9 red · 5 amber · 0 green of 14" summary chips, the consent-matrix chip grammar, and the honest "no edit or delete… server-side integrity arrives with M6" disclosure are all excellent. | Keep; reuse the summary-chip pattern on Board for guardrails (fixes 1.5). |

**Pass-5 verdict:** Governance is content-strong and the best-explained surface;
its gap is the same one as Configure's — consequential single-click mutations with
no acknowledgment, undo, or rationale capture at the moment of change.

---

## Pass 6 — Proposition + print/watermark path (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 6.1 | — | Print path | Positive, verified via print-media emulation: app chrome (sidebar, header, banner) fully stripped; the "PRE-CONDITIONS OUTSTANDING" watermark survives into print; the running footer carries "Confidential · Discussion draft, not a binding offer" + "Prepared for … · date"; the Plan-v9 CoC sentence is in the fine print. This is the most production-grade path in the app. | Keep as the print reference. |
| 6.2 | P2 | Header actions | "Save v1" is a cryptic primary label, and its tooltip leaks internal spec jargon verbatim: "Snapshot this proposition as the next sent version (Δ12 — the straw-man artefact)". Users don't know Δ12 or 'straw-man artefact'. | Label "Save as sent version"; tooltip in user language ("Freezes this letter as v1 for the audit trail; later edits create v2"). Sweep all tooltips/labels for spec-citation leakage (Δn, B.3, F-numbers). |
| 6.3 | P2 | Letter hero | The diagonal watermark text collides with the hero headline ("…OUTSTANDING" runs through "a base that grows") — intentional crop-proofing, but at screen sizes it reads as a rendering glitch; in print emulation the watermark is faint and only one diagonal was visible in the page body. | On screen: drop watermark opacity behind the hero block or mask behind text; in print: verify the triple-diagonal density actually tiles every page. |
| 6.4 | P2 | Outcome table | "Conservative · $300.0M exit · 32% kept" rows: '% kept' appears with no nearby explanation (dilution retention) — the explainer lives in other views. | One-line footnote or `net of strike & dilution` link-popover on first use in the letter. |
| 6.5 | P2 | Versioning affordance | Nothing on the view shows whether a version already exists / which version is current — "Save v1" implies none, but there's no version list/history surfaced here (it lives in the pipeline binding flow). | Small version chip row ("No sent versions yet" / "v1 sent 11 Jun") linking to the pipeline binding. |

**Pass-6 verdict:** the letter and its print path are the app's crown jewel; the
remaining gaps are jargon leakage on the version action and watermark/hero
collision at screen sizes.

---

## Pass 7 — Lifecycle flows: runbook, departure, pipeline (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 7.1 | — | Exercise runbook + Model departure dialogs | Positive: both are exemplary — fit the viewport, properly dimmed backdrop, visible header/close, status-chip checklists (blocked/action/ok), live outcome tables, plain-language disclaimers. Proof the dialog system is fine at medium height: the 1.2/2.3 overflow defect is specific to tall dialogs missing a max-height + scrollable body. | Constrain only the tall dialogs (Edit package, grant decision) to the runbook/departure pattern. |
| 7.2 | P2 | Dialog backdrops | The dim is inconsistent: runbook/departure dim correctly; Edit package and grant decision render against a nearly full-brightness page. Two different overlay treatments are in the codebase. | Unify on the dimmed variant (refines 2.5). |
| 7.3 | P2 | Model departure | "Record departure (roll off)" — "recording it commits the numbers" — is a plain primary button with no confirm and no undo for a roll-off that lapses awards. | Danger-variant button + the toast-undo timeline, or a one-line type-to-confirm for bad-leaver outcomes. |
| 7.4 | P2 | A11y pattern | Recurring: interactive controls report `readonly`/wrong semantics to AT — the exit slider, and now all six bad-leaver limb checkboxes. Visually clickable, announced as read-only. | Audit the custom control wrappers; remove `readonly`/`aria-readonly` from interactive states. |
| 7.5 | P2 | Instruments tab | The runbook launcher is a bare "▷" glyph at the end of the grant row — aria-label exists ("Exercise runbook for this grant") but sighted users get no hint. | Text button ("Runbook") or icon+tooltip; the row also duplicates strike/FMV with the same number twice ($1,572.95 / $1,572.95) without explaining they coincide at the bridge. |

**Pass-7 verdict:** the lifecycle dialogs are the strongest interaction surfaces
found so far — the fix list is mostly consistency (overlay treatment, destructive
styling, readonly semantics), not redesign.

---

## Pass 7 — Lifecycle flows: pipeline, runbook, stage guardrails (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 7.1 | P1 | Pipeline → signed | The COM-174 guardrail works (stage bounced back to "iterating" without a bound letter version) but its explanation is an **ephemeral toast that was already gone seconds later**, and no inline bind row remained in the DOM. A user who blinks sees the dropdown silently snap back with zero explanation. | Refusals must persist: inline error row under the Pipeline control with the bind-a-version affordance, not (only) a toast. |
| 7.2 | P1 | Stage select | Choosing a stage option also scroll-jumped the page from the Instruments section back to the top — disorienting context loss on top of the silent refusal. | Don't reset scroll on in-page state changes; keep the user anchored at the control. |
| 7.3 | P1 | Dialog system (root cause candidate) | The runbook dialog was open in the AX tree but **invisible in screenshots**, and once self-dismissed without user action. Combined with 2.1/3.2: overlay enter/leave transitions wedge when rAF/transitions are throttled (background tab, busy main thread) — reka-ui keeps `body{pointer-events:none}` until `transitionend`, which explains the 30s mouse-dead window. | Audit overlay transitions: gate visibility on state, not transition completion; add `transition-behavior`/timeout fallbacks so dismissal always completes; never let content visibility depend on an animation having run. |
| 7.4 | P2 | Pipeline stage options | The 8-stage taxonomy (modeled/proposed/iterating/referenced/offer-issued/signed/active/rolled-off) renders as bare lowercase words — no descriptions, no legend (OB-9 still open in prod). | Option descriptions in the dropdown (frappe-ui Select slots) + a stage legend popover. |
| 7.5 | — | Exercise runbook | Positive: the runbook content is excellent — window gate ("blocked … next backstop 2035-06-01"), jurisdictional checklist (s431, deed-of-adherence), cash-free routes, and the honest "display truth, no Board discretion simulated" framing. | Keep; fix only the dialog chrome (2.3/2.5). |

**Pass-7 verdict:** the lifecycle guardrails compute correctly but communicate
ephemerally. Refusals and consequences need to persist at the point of action. The
overlay-transition wedge (7.3) is now the unifying diagnosis for the freeze bug.

---

## Pass 8 — Responsive: 375 / 768 walkthrough (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 8.1 | — | 375 + 768 | Positive: **zero horizontal page overflow** at 375 and 768 on Overview/Board/Advisors (`scrollWidth == innerWidth`); the roster table correctly scrolls inside its own `overflow-x-auto` container; cards stack cleanly; action buttons wrap. The COM-31 hardening holds in prod. | Keep. |
| 8.2 | P1 | Mobile nav drawer | After a route navigation at 375, the nav drawer was **open without any user action**, scrimming the whole page until Escape. Most likely the same overlay state/transition wedging as 7.3 (drawer state not reset on route change / transition never completing). | Close the drawer on `router.afterEach`; same overlay-teardown hardening as 7.3. |
| 8.3 | P2 | Mobile breadcrumb | At 375 the breadcrumb truncates the *page* name ("…draft / Overv") — the least useful truncation; the board name is the redundant part. | Truncate the board segment first (`min-w-0` + `truncate` on the first crumb; keep the leaf intact). |
| 8.4 | P2 | Mobile banner | The budget warning consumes ~110px at 375 (3 lines + link) before any content — worse than desktop (1.4). | Same fix as 1.4: compact dismissible chip on mobile. |
| 8.5 | P2 | Unexpected route change | During the pass the view moved from /board to the Advisors detail without an intentional click (possibly focus/Escape interaction with the drawer). Couldn't pin a repro; flagging for the keyboard pass. | Re-test in pass 9 with focus tracing. |

**Pass-8 verdict:** responsive layout is in good shape — the real mobile risks are
the overlay/drawer lifecycle (8.2, same family as 7.3) and banner real estate.

---

## Pass 8 — Responsive: 375 / 768 / 1024 (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 8.1 | P1 | Advisor header @1024 | The header action cluster (Edit package · advisor switcher · case selector · Print) wraps to a second row that **renders on top of the budget banner**, while the breadcrumb truncates to "…/ Iraj Ispa". Visible overlap glitch at a common laptop width. | Collapse secondary actions into the existing `More actions` menu below ~1280px (Gameplan header pattern); give the header `flex-wrap` real vertical room instead of overlaying. |
| 8.2 | — | 375 | Positive: mobile holds up — drawer nav with dimmed backdrop works, Board table gracefully drops to 3 columns, no horizontal overflow (COM-31 fixes hold). Minor: the header action buttons wrap with the black "Add" stranded on its own line. | Group the three Board actions into one overflow menu at <480px. |
| 8.3 | — | 768 / 1024 | Positive: no horizontal scroll and zero overflowing elements measured on Board/Advisors at 768 and 1024 (`scrollWidth` audit clean). | — |
| 8.4 | P2 | Drawer vs dialogs | The mobile drawer ships a proper dimmed backdrop — confirming the dialogs' missing dim (2.5) is an inconsistency, not a style choice. | Same overlay treatment everywhere. |

**Pass-8 verdict:** responsive is in good shape below 768; the one real defect is
the 1024 header overlap on the advisor view.

---

## Pass 9 — Keyboard + screen-reader (2026-06-11)

| # | Sev | Where | Finding | Recommended fix (adoption-first) |
|---|-----|-------|---------|----------------------------------|
| 9.1 | P2 | Global | No skip-to-content link: keyboard users tab through ~13 sidebar stops (search, board switcher, case, stage, 7 nav items, share, more) before reaching content on every view. | "Skip to content" link as first focusable; `href="#main"`. |
| 9.2 | P2 | Heading outline | The document heading order is H3 "Board", H3 "Advisor" (sidebar group labels) **before** the page H1, with no H2s anywhere — a screen-reader outline that starts at level 3 and inverts. | Sidebar group labels aren't headings: make them `div` + `aria-hidden` or `role=presentation`; introduce H2s for major page sections. |
| 9.3 | P2 | Icon buttons | 2 buttons with no accessible name (banner dismiss X among them). | `aria-label="Dismiss budget warning"` etc. |
| 9.4 | P2 | First tab stop | The first Tab lands on a focusable scroll container (the sidebar wrapper) with no visible focus indicator. | Remove the wrapper from tab order or give scrollable regions a visible focus ring. |
| 9.5 | — | ⌘K palette | Positive: opens from anywhere, focus moves into the search input, Tab is trapped inside the dialog, Escape closes, results grouped with descriptions. Landmarks (aside/nav/header/main/footer + labeled breadcrumb) and `lang` are all present. | Keep. |
| 9.6 | P2 | Carry-overs | Confirmed again this pass: exit slider announces `readonly` (1.7); RAG toggles need radiogroup semantics (5.2); search button AX name garbles the kbd hint (1.13). | As logged. |

**Pass-9 verdict:** the a11y skeleton (landmarks, palette, focus trap) is solid;
the gaps are entry friction (no skip link, wrapper tab stop), naming (icon
buttons, kbd hint), and an inverted heading outline.

---

## Loop status — COMPLETE (10/10 passes, 2026-06-11)
1. Shell/Overview/editor ✓ · 2. Board ✓ · 3. Compare ✓ · 4. Configure ✓ ·
5. Governance ✓ · 6. Proposition/print ✓ · 7. Lifecycle ✓ · 8. Responsive ✓ ·
9. Keyboard/SR ✓ · 10. Synthesis ✓ (see EXECUTIVE SYNTHESIS at the top).
Next step: file the 9 proposed issues on Linear (M14 candidate) and start with
WS-A (the P0) + WS-B.

**Competitive grounding (2026-06-11):** `research/COMPETITIVE_LANDSCAPE.md` —
~30 products across 4 tracks documented (functionality + UI/UX, cited), with a
pattern→workstream mapping table. Issues filed from this plan should cite the
relevant pattern rows.

**Library/template grounding (2026-06-11):** `research/UI_LIBRARY_LANDSCAPE.md`
— ~25 libraries/kits surveyed against the locked stack. Headlines: the P0 has a
shipped upstream fix (reka-ui ≥2.9.1 lockfile bump, zero code change); frappe-ui
already ships unused Sidebar + ECharts chart components (containLabel kills the
clipping pain); Tailwind Plus/Vristo are the pattern quarries; PrimeVue is the
only TW3.4-compatible non-reka escape valve for component gaps.

---

## Cross-reference — fixed on the deploy branch (2026-06-11, the UXS batch series)

Mapping this loop's findings → merged PRs (the parallel ux-sweep's 69 verified findings
shipped in the same series). Verified by per-batch Playwright probes on the built app.

| Workstream / finding | PR | What shipped |
|---|---|---|
| WS-A P0 (2.1/3.2 body freeze) | #126 | pointer-events watchdog — clears a body lock no living overlay justifies (the reka transitionend wedge); drawer reset already rode the route watch. Invisible-dialog hardening still open. |
| WS-B (1.2/2.3-display/2.5-partial) | #121, #125 | Edit-package internal scroll + 375 select fix; overlay z-stack above the chrome; every dialog gets a DialogDescription; confirms get a real Cancel. Backdrop-dim unification still open. |
| WS-C (4.2/5.1/7.1/7.2/2.4/7.3) | #130, #133, #128 | plan-baseline commits toast+Undo; RAG flips toast+Undo+why (gov rides the undo timeline); signed-refusal persists inline; stage picks don't scroll-jump; wizard inline validation + focus; departure button reads destructive. |
| WS-D (1.1/1.3/2.2/3.8) + 1.4/8.4 | #134 | /advisors/:id? + /proposition/:id? deep links; scroll reset; cold-chunk skeleton; banner collapses to a status chip. |
| WS-E (4.1/4.3/4.4) | #130 | NumIn 95M/1.5k shorthand + live preview + hover hint + AX value. |
| WS-F (2.7/2.8/2.6/1.6-part) | #131 | scatter clamp + coincident fan-out + horizontal axis title; compa units; ≥11px SVG floor; range-band contrast; A/B headers + Δ column; pool select overflow. |
| WS-G (1.5/2.9/3.1/3.3-title/3.6/6.2/6.4 + sweep copy set) | #128, #131, #132 | amber collapse (one roster callout per kind); A/B case-bound labels + Δ; jargon out of the Save tooltip; '% kept' explainer; grant-round-true letter text; doc-status editable; Add-advisor unified; ?group= in the URL; C.6.n numbering. |
| WS-H (8.1/1.13/9.3 + sweep a11y set) | #127, #133 | AA token floor (axe critical 0, contrast-serious 0); one focus vocabulary + sidebar ring; named dismissals; Search AX name + shortcuts; 1024 header grows instead of overlaying; Runbook gets a visible label. |
| Money/data truth (sweep AP-2/C2/CGC-1/CGC-2/OB-6/AP-1/C1/AP-3) | #119–#124 | by-value top-ups derive real counts; recorded departures move the money; per-toast undo timeline; Save-as checkpoints; Fork B repaired; dismissal reverts by default; case-lens label coherence. |

**Still open** (good first issues for the Linear filing): WS-A invisible-dialog/transition
hardening beyond the watchdog · WS-B backdrop-dim unification + shared AppDialog extraction ·
1.9 proposition CTA weight · 1.10 header overflow menu <1280 · 1.11 textarea autogrow ·
1.12 methodology popover · 2.6-wizard fieldset grouping · 3.4 tier-color legend · 3.7 grouped-bar
active-case highlight · 5.2 RAG radiogroup · 5.4 audit-log tab+filter · 6.3 watermark/hero
collision · 6.5 version chip row · 8.3 breadcrumb truncation order · 9.1 skip link · 9.2 heading
outline · 9.4 wrapper tab stop · 1.7/7.4 readonly slider+checkbox semantics.
