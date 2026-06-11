# CRITIQUE.md — prototype vs production, ruthlessly

2026-06-11 · Reviewed live: prod `https://comp-studio-one.vercel.app` vs prototype `http://127.0.0.1:5174/`
(14 pages, `prototype/*.html`). Evidence screenshots in `prototype/screenshots/critique/`
(`prod-*.png` vs `proto-*.png` pairs + flow captures). Criteria: `DESIGN_SYSTEM.md`,
the impeccable skill's anti-slop rules, `UX_IMPROVEMENT_PLAN.md` (what the prototype was supposed to fix),
`research/COMPETITIVE_LANDSCAPE.md` Track 1 (the Pulley bar).

Severity: **P0** broken/embarrassing · **P1** clearly worse than prod · **P2** polish.

---

## Verdict

The product owner is right, and the reason is specific: **the prototype talks about being better
instead of being better.** Its visual shell is a credible Espresso imitation (tokens, Fraunces, reading
column, real scrim, skip link — all faithfully mirrored), but the moment you *use* it, the illusion
collapses in three ways prod never does:

1. **The interactions are narrated, not implemented.** The case switcher toasts "every figure
   recomputed" while the Compare matrix, Overview roster, Board ladder rail, avatar tooltips, chart
   annotations and the advisor "Base active" badge all keep their old numbers. Every Undo button runs
   the same handler: remove the toast, toast "Reverted." — **nothing ever reverts**. Row-action "⋯"
   buttons toast a *description of the menu they would open*. "Save as sent version" — the solid
   primary CTA on the Proposition — has **no handler at all**. The Edit-package tier radios, the
   single most important control in the flagship dialog, are dead. Prod's worst feedback bugs (silent
   refusals, missing undo) were at least honest silence; the prototype actively claims things that
   didn't happen, which reads as *fake* — the deadliest quality signal there is.
2. **It's hollow where prod is deep.** Governance renders 4 of 14 register rows and literally prints
   "… 10 more register items follow the same row grammar." Advisor tabs hold 192–637 characters each
   (the Vesting tab is four ascending rectangles labelled "25%" each — the height encodes nothing).
   The Board has one sparse scatter where prod has scenario-range bars plus grouped upside charts.
   Prod's runbook dialog — its best surface — doesn't exist here at all.
3. **The meta-layer leaks everywhere.** Every page carries a "Patterns applied on this page:
   IMPROVEMENT_PLAN A1 · CLAUDE_DESIGN_PROMPT §5.2 …" footer; body copy cites finding numbers
   ("Auto-grows — never clips (1.11)", "the WS-A P0", "(OpenComp distribution filter)"); a button is
   labelled "Simulate a commit (toast + undo)"; the Board scatter annotates its own workaround
   ("Strategic ×3 (fanned)"). Prod was dinged for one jargon leak (Δ12 in a tooltip, 6.2); the
   prototype made spec-citation its house style. To a product owner this reads as a design document
   cosplaying as a product — i.e. "a worse version of what we have today."

The painful irony: several pages *brag in their own UI copy* about fixing prod findings ("Row labels
follow the global case selector — never silently swaps the number under a stale label") while
exhibiting exactly that bug two inches below (A/B panel hardcodes "Net · active case: Base" under
Aggressive). The genuinely good new ideas — health strip, band-strip roster filter, sealed-render
model, tokens unlock grid, auth-state gallery, formula popover — are real and worth keeping, but
they cannot survive contact with a stage switcher that is wired to nothing.

---

## Per-page findings — shared views (vs prod)

### Overview (`prod-overview.png` vs `proto-overview.png`)

| Finding | Sev | Concrete fix |
|---|---|---|
| Roster cards keep Base figures ($7.67M/$5.11M/$2.56M, unlabeled) while the hero shows the Aggressive $78.6M — the page totals $78.6M over cards summing $28.1M | **P0** | Add `data-money` to all six card values + the "+X% at ceiling" lines, or case-label the cards like the hero does ("$7.67M · base") |
| Cards dropped prod's status grammar: prod shows "4 pre-conditions" chip + colored pipeline chip (iterating/proposed/modeled) per advisor; proto reduces to plain text "· iterating" | P1 | Restore the two chips per card (the `status-chip` primitive already exists in tokens.css) |
| Hero spread rendered as three mini progress bars (Conservative/Base/Aggressive) in brand browns — bar length means nothing here (it's three scalar values) | P2 | Use prod's single line "Conservative → Aggressive · $6.87M – $78.6M" under the figure; bars only where length encodes a real ratio |
| "Update available — preview impact" fires a toast describing a preview instead of showing one | P2 | Either render the before/after pool-norm diff inline (two numbers) or drop the button |

### Board (`prod-board.png` vs `proto-board.png`, `proto-board-scatter.png`)

| Finding | Sev | Concrete fix |
|---|---|---|
| Case switch leaves the "Ladder · headcount & spend" rail (Anchor $7.67M / Strategic $15.3M / Board $28.1M), all six avatar hover values, the market-median tooltips and the scatter's "Current net $7.67M" annotation at Base values — directly under a "Company cost · Aggressive · $78.6M" panel, while the toast claims "every figure recomputed" | **P0** | Put every money figure through the one render pass (see Top-10 #1); delete the toast claim |
| Row "⋯" buttons toast "Row menu: Edit package · Model departure · View proposition · Runbook" — a *description* of a menu. "Add" (the solid button) has no handler. "New grant decision" opens a meta-dialog that redirects you to dialogs.html | **P0** | Real dropdown for row actions (4 links — advisor.html anchors are enough); wire Add to the edit-pkg dialog in create mode; put the actual 9-step wizard behind New grant decision (it already exists on dialogs.html — move it) |
| The flagship band-strip interaction is delivered via `title=` attributes (16 on this page): 1s hover delay, browser-styled, invisible to keyboard/touch, and the values are stale per above | P1 | Reuse the existing `.popover` primitive on click/focus of `.band-avatar` (it's already `tabindex`-able); kill every `title=` |
| One chart where prod has three: prod's per-advisor scenario-range bars and the grouped upside charts are gone; the scatter is 6 same-color bubbles in a mostly empty plot with 3 y-ticks | P1 | Port prod's "Scenario range by advisor" rows (trivial: 6 div-bars with min/max labels — proto already draws better band strips); give the scatter gridlines, a labeled x-axis ("Current net $M"), and tier-colored bubbles with a legend |
| Sticky header intercepts clicks on controls scrolled beneath it (observed: band-filter chip click landed on the header) — prod's 5.3 bug, reintroduced | P1 | `scroll-margin-top: 56px` on focusable rows/chips + drop the header's full-width invisible hit area (`pointer-events: none` on the spacer div) |
| "justify…" toasts "Justification recorded — travels with the audit record" without ever asking for the justification (prod has a real inline editor) | P1 | Copy the why-note input pattern Governance already implements (input + Record) |
| "Patterns applied on this page: IMPROVEMENT_PLAN A1 band bar + compa tick · …" footer; spec citations in body copy ("fiat-first framing — IMPROVEMENT_PLAN C2") | P2 | Delete the footer block entirely; sweep body copy for doc citations (see Top-10 #6) |

### Compare (`prod-compare.png` vs `proto-compare.png`)

| Finding | Sev | Concrete fix |
|---|---|---|
| Zero `data-money` on the page: the entire matrix and A/B panel show identical numbers in all three cases. Worse, the A/B row literally reads "Net · **active case: Base** · $7.67M" while the global case is Aggressive — the exact stale-label bug (3.1) the page header copy *brags about fixing* | **P0** | Bind the matrix Net columns + A/B rows to the case table; make "active case:" read the live case name (`data-case-label` already exists for this) |
| Grouped-bar chart is hand-rolled CSS bars: no gridlines, no hover values, only two y-ticks ($10M/$21M), and the legend says "Conservative (left) · Base (middle) · Aggressive (right)" — narrating position instead of designing it | P1 | Either load frappe-charts 1.6.2 from CDN (5 lines) or add 4 gridlines + value-on-hover via the existing popover; legend = color swatch + name, position parenthetical only in the aria-label |
| Scenario-set row ("Main · locked 🔒" / "+ fork a draft set") and "Pin set" are toast stubs; Fork B toasts "Forked Robert → 'Robert v2'" and nothing appears | P1 | Minimum honest version: fork actually clones the visible A/B column with an editable name chip; otherwise cut the row — a fake Runway pattern is worse than none |
| Emoji 🔒 in a state chip (Espresso never uses emoji glyphs in chrome) | P2 | lucide `lock` glyph or the word "locked" |

### Governance (`prod-governance.png` vs `proto-governance.png`)

| Finding | Sev | Concrete fix |
|---|---|---|
| 4 of 14 register rows rendered; the rest replaced by the literal line "… 10 more register items (C-4 → C.6·12) follow the same row grammar" — prod renders all 14 with owner/timing/evidence each | **P0** | Render all 14 rows (the data is in COMP_STUDIO_SPEC_v2 Appendix; same row partial ×10). An ellipsis placeholder in a governance register is the single most embarrassing artifact in the prototype |
| RAG flip updates the radio + why-note but the "9 red · 5 amber · 0 green of 14" summary chips, the row's status dot and its "1 of 2 approved" count all stay stale; the audit log ships a pre-baked "A-1 Bell Rock: amber → green" event that exists *before* you flip anything, and your real flip never lands there | P1 | On flip: recount the three chips from DOM state, swap the row dot class, append a real log row; delete the canned event |
| "Export register" header action: no handler, dead button | P1 | Wire to `window.print()` of the register section or cut it |
| Filter chips ("All · 14") count rows that don't exist (4 rendered) | P2 | Counts must derive from rendered rows — falls out of fixing the P0 |

### Advisors (`prod-advisors.png` vs `proto-advisor.png`, `proto-advisor-vesting*.png`)

| Finding | Sev | Concrete fix |
|---|---|---|
| Edit package: the tier radios (Base/Strategic/Anchor) are completely unwired — clicking Strategic leaves Anchor checked; the "Guardrail before/after (recomputes live as you edit)" markers and "compa before 1.12 → after 1.12" text are hardcoded. The dialog's central promise is fake | **P0** | Wire the radios: on change, move the after-marker (`left:%` on the band strip), swap the compa string from a 3-entry lookup, update the eq/tok line. ~30 lines |
| Case incoherence cluster: sticky chip "Current · $7.67M · compa 1.12" stays at Base under Aggressive; the "Across scenarios" table marks **Base `active`** under Aggressive; the Floor card reads "$21.4M · guaranteed base · Aggressive case" (the floor *is* the base — labeling it with the aggressive net is conceptually wrong) | **P0** | Sticky chip + `active` badge follow `CASE.key`; Floor card always shows the guaranteed base ($7.67M) regardless of case — that's what "floor" means |
| Tab depth: 7 tabs holding 192–637 chars each. Vesting = four rectangles of *ascending height for four equal 25% tranches* in four different chart colors; Mix has no chart; Instruments has no grant table (prod: strike/FMV/count table + runbook launcher); Reviews is prose | P1 | Vesting: equal heights (or cumulative staircase, then label it cumulative), ONE color + year labels; Instruments: real 4-column table (instrument · count · strike · status) + a "Runbook" button; cut tabs you won't fill — 4 deep tabs beat 7 shallow ones |
| The exercise runbook — prod's single best dialog — does not exist anywhere in the prototype (one prose mention) | P1 | Port prod's runbook content as an AppDialog on the Instruments tab (checklist + window gate + outcome table; content can be copied verbatim from the reference) |
| Fake URL chip "/advisors/iraj-ispahani?case=Base&stage=bridge — shareable, restores on refresh" printed above the H1 — it's `advisor.html`, nothing restores; the claim is false and the chip is visual noise above the page title | P1 | Delete the chip. Deep-linking is demonstrated by *doing it* (`?case=` actually read on load — 5 lines), not by writing a fake URL on the canvas |
| Exit slider announces `readonly` to AT — the exact 1.7 defect the prototype's index claims fixed (View-as-advisor checkbox too) | P2 | Remove whatever sets `aria-readonly`; the inputs are real `<input type=range>`/`<input type=checkbox>`, so likely a stray attribute |
| "Schedule review" and "Model departure" dialogs are well-formed (viewport-fit, dim, destructive styling) but commit via lying toast + fake Undo | P2 | Covered by Top-10 #2 |

### Proposition (`prod-proposition.png` vs `proto-proposition.png`, `proto-proposition-print.png`)

| Finding | Sev | Concrete fix |
|---|---|---|
| "Save as sent version" — the page's solid primary action — has **no click handler**. Dead button on the flagship CTA, on the page whose own Dialog-system spec says "the primary button never no-ops" | **P0** | Wire it: demote "draft · live" chip, append a "v2 · sealed" chip, toast with a real link to proposition-v1.html. ~10 lines |
| Print emulation: the interactive exit slider, its "Explore the outcome (drag — it snaps…)" instruction and the preset chips all print — direct DESIGN_SYSTEM §6 violation (control is no-print; its conclusion survives) | P1 | `no-print` the slider block; keep/print the conclusion sentence "$7.67M net at $500M" (the §6/COM-84 pattern); add the recipient fingerprint to `.print-footer` right side |
| Footnote superscripts sprinkled through the letter hero ("$7.67M¹", "eq $2.27M¹·⁴ · tok $5.40M³") make the offer read like an academic paper; prod keeps caveats in the fine-print block | P1 | Max one superscript on the hero figure; fold 1/2/4 into the existing fine-print list (it already restates them) |
| Share dialog "Publish link" toasts "Published to iraj@… · revoke anytime" — nothing published, no link state chip change | P2 | Flip the dialog's link-state chip to "Published · today" and leave it flipped; only then toast |
| Watermark behind hero is masked (good — fixes 6.3) and view-as-advisor genuinely hides internal panels (good) | — | Keep |

### Configure (`prod-configure.png` vs `proto-configure.png`)

| Finding | Sev | Concrete fix |
|---|---|---|
| The denominated NumIn — the WS-E centerpiece — breaks on first contact: the `$` prefix lives *inside* the contenteditable so real typing destroys it (field becomes raw "95M"); commit fires only on blur; **Undo leaves $95.0** (toasts "Reverted.", reverts nothing); the toast claims "strike re-anchors everywhere" on a page with zero bound figures | **P0** | Structure: static `$` outside the editable span; commit on Enter+blur; store prev value and have Undo restore it; re-render the scenario-path table from the new anchor (even a 2-value mock) |
| A button labeled "**Simulate a commit (toast + undo)**" sits in the product UI — test scaffolding presented to the product owner | **P0** | Delete the button; the field's own commit is the demo |
| Section rail (Cap table / Grants & pools / Performance / Benchmarks) are `href="#"` links — no scroll, no active state, while prod's two-column Settings rail is its best-rated surface (4.6) | P1 | Anchor links to real section ids + `aria-current` swap on scroll (or at minimum on click); sticky `top-20` like prod |
| Mark closed / + Add round / set base / Accept v2026-Q2 / Reset: all toast-only, several with fake undo; "Import CSV" and "Download" header actions are dead | P1 | Each needs its minimum honest version: Mark closed flips the row's chip to "closed · actuals"; Add round appends an editable row; Accept v2026-Q2 swaps the pinned chip. Dead header buttons: wire or remove |
| Delete-round confirm dialog grammar is right (named subject, consequence sentence, danger button) | — | Keep — this is the AppDialog promise kept |

---

## Per-page findings — prototype-only pages (own merits + the Pulley bar)

| Page | Finding | Sev | Concrete fix |
|---|---|---|---|
| tokens.html | Unlock grid is genuinely Pulley-grade in shape (labeled units, per-advisor rows, totals row) — but every row is identical (12mo/24mo/monthly/0% ×6), so it reads as filler; and it never recomputes from the stage/case (TGE timing claim says it should re-anchor) | P1 | Differentiate at least one advisor (e.g. Carl 6mo lockup) so the grid demonstrably carries information; bind "Token price at TGE" and Value columns to the case |
| tokens.html | Vested-vs-unlocked chart: hand-drawn polylines with the "vested (service)" label sitting on the line, axis labels clipped at the frame ("Cliff · M12" cut), Today-popover is a static box | P2 | Shift labels to line ends with 8px clearance; viewBox padding 16px; it otherwise reads fine |
| tokens.html | "Forgd models the token, Carta models the equity — nobody models the person's package…" — competitive-positioning essay inside the UI | P2 | Move to the letter/board-pack narrative if anywhere; UI copy explains *this page*, not the market |
| portal.html | Strongest new page: fiat-first hero, bounded scenario chips (live), "next date that matters", twin progress meters, two education `<details>`. Beats the Levels.fyi/Carta portal bar on copy | — | Keep as the reference for tone |
| portal.html | Key-dates and engagement tables render with empty right cells (values truncated/blank at 1460px: "Engagement starts —") and the recipient banner exposes operator chrome (sidebar, case switcher) in what claims to be the advisor's view | P1 | Fill the date column (dates exist on the advisor page); a real recipient view must drop the operator shell — render inside a bordered "device" frame if the shell must stay |
| auth.html | Useful state gallery (sign-in posture, expiry, 404, engine mismatch, skeleton) with the right confidentiality grammar — but every CTA toasts fictional outcomes ("Magic link sent — check your inbox") | P2 | Label the gallery as states ("State: link sent" chip swap on click) instead of claiming side effects |
| dialogs.html | The 9-step wizard (grouped fieldsets, inline validation, focus management) and danger confirm are the best *implemented* interactions in the prototype — but they live on a meta page, while the Board's real "New grant decision" button opens a stub pointing here | P1 | Move the wizard to board.html; keep dialogs.html as internal spec but **out of the product nav** |
| board-pack.html | Print-shaped, numbered sections, case-bound figures (`data-money` works here), confidential footer — close to the Carta board-consent bar | P2 | Add per-advisor token column to the roster table for the Pulley side-by-side claim; date the pack from the live date not a hardcoded one |
| proposition-v1.html | Sealed-render model (immutable render + hash chip + "edits land on the live draft") is the right Ledgy/PandaDoc grammar | P2 | The sha256 chip should be tappable → copy; "Print sealed render" works — keep |
| index.html | A 13-card identical grid (impeccable anti-pattern) whose intro overclaims: "the sidebar Case selector recomputes every figure on every page" — provably false on 5 of 13 pages | P1 | Fix the claim or the code (preferably the code); vary the map: group cards under the three nav groups with one-line "what to test here" |
| sweep.html | Orphan page, not in nav, stale leftovers | P2 | Delete |

---

## Per-flow / action findings

| Flow / action | Verdict | Sev | Concrete fix |
|---|---|---|---|
| ⌘K palette | Works (open, filter, Enter navigates, Escape closes, real scrim). But: results are bare nav links; all six advisor entries link to the same `advisor.html`; no actions/recents (prod groups results with descriptions) | P2 | Add `?advisor=` param so the six entries differ; one "Actions" group (New grant decision, Export) to match prod's depth |
| Case switcher | **The core failure.** Recompute is opt-in per element (`data-money`); coverage: Board 23, tokens 15, board-pack 7, advisor 3, portal 3, overview 1, **compare/governance/configure/proposition 0**. Toast claims "every figure recomputed" and offers an Undo that doesn't undo | **P0** | One JSON case table + one render pass over `[data-money]`; annotate every figure (an hour of grep); Undo restores the previous case; drop the boast from the toast ("Case → Aggressive") |
| Stage switcher | **Wired to nothing.** No listener, no state, no effect on any figure on any page — prod re-prices grants per stage. Pure decoration in the chrome of all 14 pages | **P0** | Either implement one visible effect per page (strike label, round badge, vesting offset) or remove the control — a dead global switcher poisons trust in every live one |
| Undo (all toasts) | `onclick = remove toast; toast('Reverted.')` — universal fake. Verified: bridge edit stays $95.0 after Undo | **P0** | `toast(msg, undoFn)` — pass a closure that actually restores; never print "Reverted." otherwise |
| Edit package dialog | Opens, fits viewport, dims (WS-B grammar holds); tier radios dead, live-recompute claim false, Save toasts | **P0** | See Advisors table |
| New grant decision | Board button → meta-dialog → link to dialogs.html where the real wizard lives. Wizard itself: validation + fieldsets work | P1 | Relocate the wizard; the board button opens it directly |
| Grant decision wizard (on dialogs.html) | Inline error + focus on empty submit (good); records via toast only | P2 | Append a row to the Board's "Grant decisions · history" rail for the session |
| Schedule review / Model departure | Real dialogs, right grammar, destructive styling on roll-off (prod 7.3 fixed); commit = lying toast + fake undo | P1 | Top-10 #2; departure should also strike-through the roster row for the session |
| Exercise runbook | Missing entirely (prod's best dialog) | P1 | Port the content as an AppDialog |
| Exit slider + presets | Drag works, two-tone fill works, presets snap, readout updates; announces `readonly` to AT; on Proposition the slider also prints | P1 | Strip `aria-readonly`; no-print the control per §6 |
| RAG flip + why-note | Flip + why-input + Record appear (the 5.1 fix, genuinely better than prod's silent flip); but summary chips, row dot, n-of-m and audit log never react; canned "amber → green" log entry pre-exists | P1 | Recount chips from DOM; append a real log row on Record |
| Audit-log kind filters | Work (chips filter rows) | — | Keep |
| Board band filter chips | Work (roster filters; click intercepted under sticky header — see Board P1) | P1 | `scroll-margin-top` fix |
| justify… (Board) | Toast claims a justification was recorded; no input ever shown | P1 | Reuse Governance's why-note input |
| Row actions ⋯ | Toast *describes* the menu | **P0** | Real dropdown (4 anchors) |
| View-as-advisor | Works: hides version row + watermark banner + internal panels; toast announces it | — | Keep |
| Version chips | "v1 · sealed 11 Jun" → proposition-v1.html works; sealed page links back to the live draft. Good loop | — | Keep |
| Denominated NumIn | Broken: `$` inside the editable, blur-only commit, fake undo, no re-anchor (toast claims "everywhere") | **P0** | See Configure table |
| Accept-with-preview (benchmarks) | "Accept v2026-Q2" toasts; pinned chip never changes; "keep pinned" dead | P1 | Swap the chip state; re-date the provenance chips |
| Share / Publish | Dialog good (scope dial, recipient fingerprint copy); Publish = fictional toast | P2 | Flip the link-state chip |
| Export XLSX / Export register / Export schedule / Copy / Print (several) | Mix of toast-descriptions ("tabs per section (G1)") and fully dead buttons (Copy, Export register, Import CSV, Download, Pin set, Add, Configure-on-Overview) | P1 | Dead buttons are worse than stubs: every action gets at minimum a state change it can honestly toast; otherwise remove the button |
| Drawer at 375 | Opens with scrim, closes, content stacks without horizontal overflow (Board health strip stacks cleanly) | — | Keep |
| Print views | Proposition: chrome stripped, watermark tiles, confidential footer — but slider prints (§6 violation) and footer lacks the recipient fingerprint; board-pack prints clean | P1 | See Proposition table |
| Sticky header | Click-interception over content scrolled beneath (reproduced); breadcrumb is title-derived only | P1 | Pointer-events fix + scroll-margin |

---

## Top-10 fixes, ranked by impact on perceived quality

| # | Fix | Why it moves the needle | Effort |
|---|---|---|---|
| 1 | **One mock-engine render pass.** Single JSON case×stage table in proto.js; every money figure becomes `data-money`; case AND stage selectors re-render everything (Compare, Governance counts, Configure anchors included). Kill the "every figure recomputed" toast text | The #1 "fake" tell. A prototype of a *recomputing comp engine* whose numbers don't recompute loses the demo in the first 10 seconds | M (½–1d) |
| 2 | **Honest feedback: real Undo, no fictional toasts.** `toast(msg, undoFn)`; every toast names only a state change that is visible on screen; dead-claim toasts ("Published to iraj@…", "Justification recorded") get the real minimal state change first | Lying chrome reads worse than missing features; this is the difference between "prototype" and "vaporware" | S–M |
| 3 | **No dead primaries.** Wire "Save as sent version" (version chip swap), "Add", "Pin set", "Export register", "Import CSV", "Download"; replace row-⋯ toasts with a real dropdown; move the 9-step wizard onto the Board button | Solid-styled buttons that do nothing are the buttons POs click first | M |
| 4 | **Strip the meta-layer from the product surface.** Delete the "Patterns applied" footers; sweep copy for finding/spec citations ("(1.11)", "WS-A P0", "IMPROVEMENT_PLAN C2", "(Pulley recalc bar)", "(fanned)"); delete "Simulate a commit"; delete the fake URL chip; move Dialog system / Auth & states / Prototype map out of the primary nav into a separated "Spec" group at the foot | Highest taste-per-hour in the whole list — this alone removes the "design doc cosplaying as product" smell from all 14 pages | S (hours) |
| 5 | **Render the full Governance register (14/14) and real advisor tab content** (Instruments table + ported runbook dialog; fixed Vesting bars; cut empty tabs) | Hollowness is the second-biggest "worse than prod" driver; prod's depth is its quality | M |
| 6 | **Fix the Edit-package dialog**: wire tier radios → before/after markers + compa text + eq/tok line | The flagship dialog's only job is "recomputes live as you edit"; right now its central control is dead | S |
| 7 | **Fix the NumIn**: `$` outside the editable, Enter commits, preview formats, Undo restores, scenario table re-anchors | WS-E was the named anti-10×-error fix; the prototype version is *less* safe than prod's raw integer (it can eat the unit) | S |
| 8 | **Replace every `title=` tooltip with the existing `.popover`** on click/focus (band avatars, compa ticks, market medians) | Prototype's own stated goal (the prod pass dinged title-tooltips); popover primitive already built | S |
| 9 | **Chart fidelity floor**: scatter gets gridlines + axis title + tier colors; Compare bars get gridlines + hover values (or CDN frappe-charts); Overview drops the meaningless mini-bars | Hand-rolled charts are the "cartoonish" signal vs prod's frappe-charts/SVG | M |
| 10 | **Print + a11y cleanup**: no-print the proposition slider (keep the conclusion line per §6/COM-84), fingerprint in the print footer, remove `aria-readonly` from slider/checkbox, `scroll-margin-top` under the sticky header | Print is prod's crown jewel; the prototype regresses it. Cheap to match | S |

---

## What prod does better — patterns to port back (with screenshots)

1. **Real chart layer** (`prod-board.png`, `prod-compare.png`): frappe-charts grouped bars with axis
   gridlines + custom SVG with annotation discipline. The prototype's CSS-bar/sparse-SVG substitutes
   read as sketches.
2. **Full-depth tables everywhere** (`prod-governance.png`): all 14 register rows with owner/timing/
   evidence; advisor instruments table; roster with per-row "…" *menus that open*.
3. **Status-chip grammar on cards** (`prod-overview.png`): "4 pre-conditions · iterating · Anchor"
   colored chips on every roster card — glanceable state the prototype flattened to gray text.
4. **The exercise runbook & departure dialogs** (prod pass-7 verdict): checklist chips, window gate,
   live outcome table — exemplary; prototype dropped the runbook entirely.
5. **Honest silence over false claims**: prod's failures were missing toasts; it never toasts what
   didn't happen and its Undo (UXS-D timeline, PR #130/#133) actually reverts. That discipline is the
   real bar.
6. **Working deep links** (post-#134 `/advisors/:id`, `?group=`): state in the real URL — vs the
   prototype's painted-on URL chip.
7. **Print path** (`prod-proposition.png`, prod 6.1): controls stripped, conclusions kept, recipient
   fingerprint in the running footer.
8. **One quiet meta-voice**: prod's chrome never cites its own backlog. (Its single 6.2 jargon leak
   was a P2; the prototype institutionalized it.)

## What the prototype does better — keep these when fixing

Health strip + aggregated guardrail callout with quantified delta (Board) · band-strip roster filter ·
RAG why-note at the moment of change · sealed-version model (proposition-v1 + version chips) ·
tokens unlock grid + vested≠unlocked framing · advisor portal narrative + bounded scenario chips ·
auth/system-state gallery · formula popover ("how this number is computed") · AppDialog sizing/scrim
grammar (the dialogs that exist do fit the viewport and dim) · skip link + drawer + status chip
replacing the banner.

---

*Method note: every interaction claim above was reproduced live (screenshots + DOM probes); stale-value
findings were verified by diffing the page text before/after case switches. P0/P1 counts:
Overview 1/1 · Board 2/4 · Compare 1/2 · Governance 1/2 · Advisors 2/4 · Proposition 1/2 ·
Configure 2/2 · proto-only pages 0/5 · cross-cutting flows (case/stage/undo) 3/—.*
