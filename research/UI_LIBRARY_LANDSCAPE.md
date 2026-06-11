# UI Library & Template Landscape — Adoption Survey

**Date:** 2026-06-11 · **Purpose:** find ready-made components, app-shell
layouts, and templates we can adopt to reach stellar UI quickly — evaluated
against the locked stack (Vue 3.5 · Vite 5 · **Tailwind 3.4 pin** · frappe-ui
0.1.278 / Espresso · reka-ui primitives). Three research tracks: Vue-native
libraries · Tailwind kits & templates · frappe-ui ecosystem depth. ~25
libraries/kits surveyed, all claims cited. Companion to
`research/COMPETITIVE_LANDSCAPE.md` and `UX_IMPROVEMENT_PLAN.md`.

---

## TL;DR — the recommended path (cheapest → heaviest)

1. **Fix the P0 inside the stack (near-zero cost).** frappe-ui 0.1.278 is
   already the **latest npm release** — there is no pin upgrade to chase. The
   stuck `body{pointer-events:none}` bug has a **named upstream fix**: reka-ui's
   `useBodyScrollLock` nextTick race ([reka-ui #2480](https://github.com/unovue/reka-ui/issues/2480)),
   fixed in [v2.9.1](https://github.com/unovue/reka-ui/commit/ec98d6b8) (Mar 2026).
   frappe-ui declares `reka-ui: ^2.5.0`, so a **lockfile bump to ≥2.9.1 requires
   zero code changes**. Add a small overlay watchdog (clear body inline
   pointer-events when the overlay stack reaches zero — the pattern the
   Radix/shadcn community converged on). → resolves **WS-A**.
2. **Adopt more frappe-ui — we under-use what we already pay for.**
   - **`Sidebar` component** (shipped in 0.1.27x, collapsible + mobile
     breakpoint) and Gameplan as the canonical app-shell donor (frappe-ui is
     co-developed against it). → feeds **WS-H** (1024 header overlap, overflow
     actions).
   - **`bare` Dialog pattern + imperative `dialog.confirm/alert/prompt`** —
     the v1 Dialog spec deliberately leaves tall-dialog scroll to apps; the
     sanctioned pattern is `bare` + own max-height/scrollable body (exactly the
     Gameplan/Helpdesk settings-modal migration case). → shapes **WS-B**.
   - **ECharts chart components already in our dependency tree**: `AxisChart` /
     `DonutChart` / `NumberChart` are Espresso-styled, dark-mode aware, and use
     `grid.containLabel: true` — ECharts' built-in fix for axis-label clipping,
     plus `markLine`/`markArea` + `labelLayout` collision avoidance for
     annotations. `echarts ^5.6.0` is a hard dependency of our pinned frappe-ui,
     so adopting them adds **no new package**. → replaces most of **WS-F**;
     keep custom SVG only for waterfall/football-field.
   - Watch the **frappe-ui v1 release** (API-frozen, overlay-stabilization
     workstream in flight; documented migration aliases: `options`→flat props,
     `#body`→`bare`).
3. **Quarry patterns, not packages, for layouts** (the Tailwind 3.4 pin is the
   gate — nearly every maintained kit is now Tailwind v4-only):
   - **Tailwind Plus Application UI** ($299 one-time, internal use OK): 500+
     blocks with **first-class Vue 3 markup** — app shells, settings pages,
     dense table patterns, dialogs, empty states. Adapt markup to Espresso
     tokens; **do not adopt `@headlessui/vue`** (frozen at 1.7, effectively
     abandoned) — keep frappe-ui as the interactivity layer.
   - **Vristo** (~$32, ThemeForest): the rare commercial **Vue 3 + Tailwind
     3.4** dashboard still on our line — sidebar/layout/table pages to
     cannibalize.
   - **HyperUI + Wind UI** (free MIT HTML quarries): tables, empty states,
     description lists; framework-free markup is easiest to re-skin.
4. **If a real component gap demands a package: PrimeVue, nothing else.**
   The only top-tier library that is simultaneously (a) Tailwind 3.4-compatible
   (JS plugin), (b) **not reka-ui-based** (custom a11y stack — escapes our bug
   class entirely), (c) incrementally adoptable beside frappe-ui (design-token
   CSS vars + `cssLayer`, no imposed preflight), and (d) the owner of the best
   `DataTable` in the Vue ecosystem (frozen columns, virtual scroll). Use it
   surgically (e.g., a future heavy-table view), not as a second design system.
5. **Full-replacement endgame (only if the stack lock is ever revisited):**
   Nuxt UI v4 — 125+ components, the ex-Pro dashboard/settings templates now
   free, works outside Nuxt — but requires Tailwind v4 and is reka-based (same
   overlay bug class). Migration cost: high. Not recommended now.

---

## Track 1 — Vue 3-native component libraries

| Library | Components | App shells/templates | TW 3.4 | Primitives / overlay bug | Health | Verdict |
|---|---|---|---|---|---|---|
| **PrimeVue 4.5** | 90+; best-in-class DataTable (frozen cols, virtual scroll), Dialog w/ scrollable content, Toast w/ actions, Stepper, Skeleton, Chart.js wrapper | Sakai shell (free MIT, 5.0.0 Feb 2026); premium $39–590 | ✅ JS plugin for v3 | **Custom a11y stack — escapes reka bug** | Very active, PrimeTek-funded | **Best incremental add** |
| **shadcn-vue 2.4** | ~50 + blocks; Command palette, Sonner toasts, vee-validate forms; **table = DIY on TanStack** | Free blocks (sidebar shells, dashboards) | ✅ v3 fully supported | **reka-ui — same bug class** (patchable in owned code; version-mixing with frappe-ui's reka is a documented trigger) | Active | Best style continuity; tables cost effort |
| **Nuxt UI v4.6** | 125+ incl. CommandPalette, TanStack Table, dashboard components | Strongest free templates (ex-Pro merged in) | ❌ **TW v4 required** | reka-ui — bug reported in their own tracker | Active | Full replacement only |
| Vuetify 4 | 80+, excellent shell | Many themes | ⚠️ coexistence guide targets TW4; Material opinion clashes w/ Espresso | Custom | Healthiest by numbers | Poor style fit |
| Quasar 2 | 70–80 + shell | Yes | ❌ literal class-name collisions (`hidden`, `block`) | Custom | Active | Worst TW fit |
| Naive UI 2.44 | 90+, virtualized tables | — | Neutral (CSS-in-JS, no global reset) | Custom | Spare-time maintenance | Viable, unexciting |
| Element Plus | Enterprise tables/dialogs | — | ⚠️ preflight friction | Custom | Active | Replacement-only |
| Ant Design Vue | — | — | — | — | **Dormant (last release Nov 2024)** | Avoid |
| Ark UI Vue 5.36 | 45+ headless | — | ✅ (headless) | Zag.js statecharts — but Presence still observes DOM animations; Vue exit-animation + teardown bugs ([ark #2739](https://github.com/chakra-ui/ark/issues/2739), [#2744](https://github.com/chakra-ui/ark/issues/2744)) | Active, low issue count | Not a clean escape either |
| Headless UI Vue | — | — | — | **Abandoned** (v2 React-only, [#3682](https://github.com/tailwindlabs/headlessui/issues/3682)) | — | Avoid |

**Cross-cutting:** every reka-based library (frappe-ui, shadcn-vue, Nuxt UI)
inherits the body pointer-events lock risk; PrimeVue (custom) and Ark UI
(Zag.js) are the architecture-level escapes — but Ark has its own
transition-coupled teardown bugs, so **patched reka-ui is not strictly worse
than any alternative**. Harden, don't swap.

## Track 2 — Tailwind kits, templates, dashboards

**The structural finding: the kit ecosystem has moved to Tailwind v4.** On the
3.4 pin: adopt patterns (HTML to re-skin), not packages.

| Kit | What's in the box | Vue | TW 3.4 | Verdict |
|---|---|---|---|---|
| **Tailwind Plus (App UI)** | 500+ blocks: app shells, settings pages, tables, dialogs, empty states, auth | ✅ first-class Vue 3 markup (+ HTML) | ⚠️ markup targets v4.2 — minor back-porting | **Best pattern source.** Skip `@headlessui/vue` dep |
| Catalyst | React kit | ❌ React-only; license bars porting | — | Avoid |
| **Vristo** (~$32) | Vue 3 dashboard, multiple sidebar layouts, ApexCharts | ✅ real Vue 3 codebase | ✅ **TW 3.4** | **Rare TW3-line commercial option** — cannibalize layouts |
| Flowbite Vue | Modals/tables/sidebars | ⚠️ v0.2+ = TW4; TW3 line frozen at 0.1.9 | ❌ | Avoid as dependency |
| Preline | Huge free tier | Copy-paste HTML + vanilla-JS plugin (SPA friction) | ⚠️ v2.x only | Pattern quarry at most |
| daisyUI 5 | Semantic classes | Framework-agnostic | ❌ v5 = TW4 | Skip |
| **HyperUI / Wind UI** | Free MIT app components, empty states, tables | HTML | ⚠️ HyperUI rebuilt for v4 (back-port); Wind UI TW3-era | **Good free quarries** |
| Tremor | 35+ React data components | ❌ no Vue port | — | The Vue gap is real; nearest Vue analogue is Nuxt UI/shadcn-vue |
| TailAdmin Vue | 500+ comps, 7 dashboards | ✅ | ❌ V2 = TW4 (V1 legacy) | Skip |
| Mosaic Lite Vue | Free Chart.js dashboard | ✅ | ✅ | Single-maintainer, stale — reference only |
| Midone | 30+ Zag-based comps | ✅ | ❌ now TW4 | Skip |
| Metronic 9 TW | Enterprise, KTUI JS runtime | ⚠️ HTML-only + manual Vue guide | — | Would fight frappe-ui; avoid |
| Penguin UI / Float UI / Sira / Notus / Argon | — | Alpine/thin/stale | — | Avoid |

**Chart engines in kits:** ApexCharts dominates (Flowbite/Preline/TailAdmin/
Vristo/Tailwick); none ship ECharts — kit charts would add a second engine,
whereas frappe-ui's ECharts components add none.

## Track 3 — frappe-ui ecosystem depth (full findings)

- **0.1.278 = npm latest** ([registry](https://registry.npmjs.org/frappe-ui/latest));
  main is heading to an API-frozen **v1** with an explicit overlay/floating
  stabilization workstream and a formal [Dialog spec](https://raw.githubusercontent.com/frappe/frappe-ui/main/spec/dialog.md)
  (11 width-only sizes, `bare` escape hatch, `after-leave`, keyframe
  enter/exit on reka `data-state`).
- **Unused adoptable surface in our pinned version:** `Sidebar` (collapsible,
  mobile breakpoint, [PR #341](https://github.com/frappe/frappe-ui/commit/782b397d18163a0525a45f6aea614255e1d82e6a)) ·
  ECharts `AxisChart`/`DonutChart`/`NumberChart` ([docs](https://ui.frappe.io/docs/components/charts),
  `containLabel: true` in [eChartOptions.ts](https://cdn.jsdelivr.net/npm/frappe-ui@0.1.248/src/components/Charts/eChartOptions.ts)) ·
  ListView virtualization · Tree · imperative dialog helpers (v1).
- **App-shell donors:** Gameplan (canonical; frappe-ui co-developed against
  it) · [LMS DesktopLayout.vue](https://github.com/frappe/lms/blob/99a00eea/frontend/src/components/Layouts/DesktopLayout.vue)
  (minimal flex shell).
- **Overlay-bug verdict:** reka ≥2.9.1 lockfile bump (allowed by `^2.5.0`) +
  app-level watchdog; remaining open upstream issues:
  [#1540](https://github.com/unovue/reka-ui/issues/1540) (pointer-events-by-design
  complaint), [#2403](https://github.com/unovue/reka-ui/issues/2403)
  (animation-coordination edge cases) — the watchdog covers both.
- **Charts comparison:** ECharts (via frappe-ui) solves clipping+annotations
  with zero new deps (~300KB gz, already declared) > Unovis (real Vue support,
  lighter, fewer annotation primitives) > ApexCharts (modular now, manual
  overlap handling) > Chart.js (smallest, no collision handling — doesn't fix
  our pains). frappe-charts 1.6.2 is the *source* of the pain, not fixable.

---

## Mapping to `UX_IMPROVEMENT_PLAN.md` workstreams

| Workstream | Adoption decision from this survey |
|---|---|
| WS-A overlay P0 | reka-ui ≥2.9.1 lockfile bump + overlay watchdog (no library swap) |
| WS-B AppDialog | frappe-ui `bare` Dialog pattern + max-h/scroll body; crib dialog markup from Tailwind Plus |
| WS-C feedback+undo | no library needed — frappe-ui Toast supports actions; discipline issue |
| WS-D router | n/a (Vue Router work) |
| WS-E money entry | build on frappe-ui FormControl; no kit ships denominated inputs |
| WS-F charts | **migrate clipping-pain charts to frappe-ui ECharts components** (already in tree); keep custom SVG for waterfall/football-field |
| WS-G info design | patterns from Tailwind Plus (description lists, empty states) + competitive doc patterns |
| WS-H app shell/a11y | frappe-ui `Sidebar` + Gameplan header pattern; Tailwind Plus app-shell blocks as reference |
| Future heavy tables | PrimeVue DataTable, adopted surgically per-view if ListView hits its ceiling |

**Bottom line:** the locked stack already contains most of what "ready-made"
buys — the fastest route to stellar UI is using frappe-ui fully (Sidebar,
ECharts charts, bare dialogs, v1 patterns), patching the one upstream bug, and
quarrying Tailwind Plus/Vristo markup for layout polish. PrimeVue is the
escape valve for genuine component gaps; Nuxt UI v4 is the only credible
full-replacement endgame and costs a Tailwind-4 migration.
