# Lane A — frappe-ui inventory & standalone-safety (static Vue 3 SPA, NO Frappe backend)

**Verdict (one line):** For *this* app — a static Vercel SPA with a bespoke Fraunces/IBM-Plex editorial design and zero frappe-ui usage in the only built view — **frappe-ui is not worth adopting as a UI-component dependency.** Its value (Button/Dialog/FormControl/etc.) is real but small, every one of those components is a thin wrapper over Headless UI + Tailwind that we can reproduce 1:1, its Tailwind preset *forcibly overrides* our palette/fonts/radius/shadows (and bundles Inter), and its headline feature set (data layer, ListView, TextEditor) is either Frappe-backend-bound or dead weight here. Use **Headless UI (`@headlessui/vue`) + `@floating-ui/vue` + Tailwind** as the fallback for the handful of interactive primitives we need.

> Evidence base: published tarball `frappe-ui@0.1.278` (npm `latest`, published 2026-04-25) downloaded and unpacked; `frappe/frappe-ui` GitHub `main` source (currently the `1.0.0-beta.4` line, published 2026-06-08); context7 `/frappe/frappe-ui` docs + migration wiki. Every path/claim below is checked against the **published** package unless flagged "(beta)".

---

## 0. CRITICAL: which version are we even talking about? (read before trusting any path)

There are **two divergent frappe-ui's live right now**, and the plan/scaffold paths were written for neither precisely:

| Channel | Version | Published | Component model | Charts | Notes |
|---|---|---|---|---|---|
| `latest` (npm default `npm i frappe-ui`) | **0.1.278** | 2026-04-25 | Headless UI (`@headlessui/vue ^1.7`) + Popper/tippy | wraps **echarts** (`AxisChart`, `DonutChart`, `ECharts`, `FunnelChart`, `NumberChart`) | This is what `npm i frappe-ui` installs **today**. 524 files, **2.15 MB unpacked**, 55 runtime deps. |
| `beta` | **1.0.0-beta.4** | 2026-06-08 (today) | migrating to **`reka-ui ^2.5`** (Radix-Vue successor) alongside Headless UI | echarts | GitHub `main`. Adds `reka-ui`, TipTap 3.11, bigger surface. Not what `npm i` gives you. |

**Implication for the plan:** "install frappe-ui" (COM-8) is ambiguous and a moving target. If you pin nothing you get 0.1.278 today and possibly 1.0.0 tomorrow (the team is mid-major-bump — 5 betas in ~2 weeks). **If you adopt it at all, pin an exact version.** Verified via `https://registry.npmjs.org/frappe-ui` dist-tags + per-version `time` map.

There is **no built `dist/` in either channel.** The package ships **raw `.ts`/`.vue` source** and `exports['.'] → ./src/index.ts`. Your app's bundler compiles frappe-ui from source. This is central to every claim below (style path, preset path, tree-shaking, peer deps).

---

## 1. Plan-claim verification (TECH_BRIEF / scaffold comments) — 3 of 4 frappe-ui claims are WRONG

| # | Plan claim | Reality (verified) | Status |
|---|---|---|---|
| 1 | Tailwind preset: `presets: [require('frappe-ui/src/utils/tailwind.config')]` | **WRONG on two counts.** (a) `src/utils/tailwind.config.js` *exists* in 0.1.278 but is an **explicitly deprecated shim** that prints `'`frappe-ui/src/utils/tailwind.config.js` is deprecated. Use `frappe-ui/tailwind/preset.js` instead.'` and just re-exports the real preset. (b) It is **not in the package `exports` map** → under strict `exports` resolution (Vite/Rollup default) the subpath `frappe-ui/src/utils/...` is *not guaranteed resolvable*; it only works because bundlers often fall back to raw file paths. (c) It's **ESM `export default`**, so `require(...)` is the wrong loader. **Correct, exports-blessed, version-stable path: `import frappeUIPreset from 'frappe-ui/tailwind'`** (maps to `./tailwind/index.js` → `./tailwind/preset.js`). | ❌ FIX |
| 2 | Plugin: `import { FrappeUI } from 'frappe-ui'; app.use(FrappeUI)` | **DANGEROUS for a static SPA.** `FrappeUI` exists and the import is valid, but `app.use(FrappeUI)` with **no options** runs (defaults all `true`): `app.use(resourcesPlugin)` **+** sets `$call` **+** `initSocket(options.socketio)` — i.e. it **opens a socket.io connection and installs the Frappe REST resource layer**. On a backend-less Vercel SPA the socket will fail/retry against your static origin. To use it safely you must call `app.use(FrappeUI, { resources: false, call: false, socketio: false })` — at which point the plugin does **nothing** and is pointless. **Components do not require the plugin** (they're plain SFCs). Verified in `src/utils/plugin.js`. | ❌ FIX / avoid |
| 3 | Styles: `import 'frappe-ui/dist/style.css'` | **WRONG — no `dist/` exists in the published package** (confirmed by unpacking the 0.1.278 tarball: top-level dirs are `frappe icons src tailwind vite` + files; no `dist`). The `exports` map has **no `./dist/...`** entry. **Correct path: `frappe-ui/style.css`** (maps to `./src/style.css`). **But note:** `src/style.css` is `@import './fonts/Inter/inter.css'; @tailwind base; @tailwind components; @tailwind utilities;` → importing it (a) **bundles the Inter font** and (b) **emits the full Tailwind build keyed to frappe-ui's preset.** For our bespoke design we'd want neither. | ❌ FIX (and probably don't import at all) |
| 5 | Data composables assume a Frappe REST/RPC backend → out of scope | **CONFIRMED TRUE.** `utils/call.js` hardcodes `POST /api/method/${method}` with headers `X-Frappe-Site-Name: window.location.hostname` and `X-Frappe-CSRF-Token: window.csrf_token`. `utils/frappeRequest.js` same. `src/data-fetching/` is `useDoc / useList / useDoctype / useNewDoc / useFrappeFetch` — pure Frappe doctype/REST concepts. **OUT OF SCOPE, verified.** | ✅ as planned |

(Claims #4 and #6 are frappe-**charts**, not frappe-ui — Lane B. Not re-verified here.)

**Net:** the exact lines the plan tells COM-8 to paste (`dist/style.css`, `require('frappe-ui/src/utils/tailwind.config')`, bare `app.use(FrappeUI)`) will respectively **404, mis-resolve/warn, and boot a doomed socket.** All three need correction even if we *do* adopt frappe-ui.

---

## 2. Theming — adopting the preset means surrendering the editorial design

The preset is `tailwind/preset.js`; the visual rules live in `tailwind/plugin.js` (a `tailwindcss/plugin`). Verified contents:

- **Forces Inter, globally:** `addBase({ html: { 'font-family': 'InterVar, ' + theme('fontFamily.sans') }, 'html,body,button,p,span,div': { fontVariationSettings: "'opsz' 24, 'cv11' 1" } })`. `cv11`/`opsz` are Inter-specific OpenType features. This is applied via `@tailwind base`, so it **overrides our Fraunces/IBM Plex `<html>` font** unless we re-override after.
- **Replaces the entire color scale:** `theme.colors = colorPalette` (generated from frappe's Figma tokens, in `tailwind/colorPalette.js` / `colors.json`). This **wipes Tailwind's defaults and any palette we set in the same `theme.colors` slot** — our `ink/paper/amber/teal` warm palette would have to be re-added *and* would collide with frappe's semantic `surface-*`/`ink-gray-*`/`outline-*` token names that all the components consume.
- **Overrides `fontSize` (base = 14px, tight line-heights, `fontWeight: 420`), `borderRadius` (DEFAULT 8px), `boxShadow`, `container`.** These are the "Espresso" look; they fight an editorial layout.
- **Dark mode:** `darkMode: ['selector', '[data-theme="dark"]']` — toggled by a `data-theme` attribute, not Tailwind's default `class`. Fine, but it's their convention.
- **Components assume the preset's token names.** Every SFC uses classes like `bg-surface-gray-2`, `text-ink-gray-8`, `border-outline-gray-3`, `focus-visible:ring-outline-gray-3` (seen in `tailwind/plugin.js` `componentStyles` and throughout). **Without the preset, frappe-ui components render unstyled/broken** (those classes don't exist). So it's all-or-nothing: you can't take Button's markup but keep your palette unless you also reproduce ~40 semantic color tokens.

**Conclusion:** the preset is **antithetical** to the project's stated design language. "Adopt frappe-ui components" effectively means "adopt the Espresso/Inter design system, then fight it back toward editorial" — strictly more work than building the ~6 primitives we need against our existing Tailwind config.

**Icons / fonts specifics**
- Icon set: **Feather** (`feather-icons`, via `<FeatherIcon>`) + **Lucide** (`lucide-static` + a `lucideIconsPlugin` that injects `mask-image` utility classes). Importing the preset adds the Lucide plugin. We are not committed to either; our editorial design can use whatever (e.g. Lucide standalone, or inline SVG). No lock-in benefit.
- Fonts: see above — **yes it forces Inter** through both `style.css` (`@import .../inter.css`) and the base layer. We can keep Fraunces/IBM Plex **only by not importing `frappe-ui/style.css` and not using the base-layer font rule** — i.e. by not using the preset as-is.

---

## 3. Distribution / bundle / peer deps

- **Peer deps (BOTH channels): `vue: ">=3.5.0"`, `vue-router: "^4.1.6"`.** ⚠️ **The scaffold pins `vue ^3.4.21` — below frappe-ui's `>=3.5.0` floor.** Adopting frappe-ui forces a Vue bump to ≥3.5. (Verified via `npm view frappe-ui peerDependencies` and the unpacked 0.1.278 `package.json`.) vue-router `^4.3.0` in scaffold satisfies `^4.1.6`. ✅ router OK, ❌ vue floor.
- **Tailwind: v3.** Dev dep + preset are Tailwind **3.x** (`tailwindcss ^3.2.7`; preset uses v3 `tailwindcss/plugin`, `@tailwindcss/forms`, `@tailwindcss/line-clamp`, `@tailwindcss/typography`). Scaffold is Tailwind `^3.4.3` ✅. **frappe-ui is NOT Tailwind v4-ready** in the published line — do not upgrade the app to Tailwind v4 if you depend on the preset.
- **`exports` map (published 0.1.278), authoritative:**
  - `.` → `./src/index.ts` (raw source — the whole barrel)
  - `./style.css` → `./src/style.css`
  - `./editor-style.css` → `./src/components/TextEditor/style.css`
  - `./tailwind` → `./tailwind/index.js` (→ `preset.js`)
  - `./icons` → `./icons/index.ts`, `./vite` → `./vite/index.js`, `./frappe` + `./frappe/drive/*` (Frappe-only), `./tsconfig.base.json`
  - **No `./dist`, no `./components/*`, no `./src/utils/tailwind.config`.** Deep `frappe-ui/src/components/X/X.vue` imports are *not* in `exports` (the migration guide explicitly tells you to stop doing that and use the named barrel export instead).
- **`sideEffects: false`** + barrel of named exports → **tree-shaking is theoretically good**: `import { Button } from 'frappe-ui'` should drop unused components in a production Rollup build. **BUT** because `.` resolves to **raw TS/Vue source**, your build must transpile everything you touch, and the dependency *graph* is huge:
  - **TipTap 3.11 + ProseMirror**: ~**35 `@tiptap/*` packages** + `prosemirror-tables` + `lowlight`/`highlight.js`. Pulled in **only if** you import `TextEditor`/`editor`. We have no rich-text need → **avoid entirely** and it tree-shakes out.
  - **echarts ^5.6** (~1MB min): pulled only via the chart components — and we're using **frappe-charts** instead, so don't import frappe-ui's chart components.
  - **Headless UI** (`@headlessui/vue`), `@floating-ui/dom`, `@popperjs/core`, `tippy.js`, `@vueuse/core`, `dayjs`, `dompurify`, `fuzzysort`, `vue-sonner` (Toast), `feather-icons`, `lucide-static`, `socket.io-client`, `idb-keyval`, `grid-layout-plus`, `reka-ui` (beta). 55 deps total.
  - **Realistic weight if used narrowly** (Button/Dialog/FormControl/Badge/Tooltip/Dropdown/Tabs + their transitive Headless UI/floating-ui/tippy/vueuse): plausibly **~60–120 KB gzipped** of app code — **but the orchestrator's live `vite build` must confirm**; raw-source packages are notoriously easy to over-pull (one stray `import { toast }` drags in `vue-sonner`; one `Combobox` drags `fuzzysort`). The *risk* is a fat barrel, not a guarantee.
- **Standalone feasibility:** It **can** run standalone (the components are plain Vue + Tailwind; the official "frappe-ui-starter" uses exactly the non-Frappe pattern — `app.use(FrappeUI)` + preset + `style.css`, no Desk). The blocker is not "does it work" but "is it *worth it*" given the design clash + raw-source bundle + the fact we'd skip the plugin and most of the surface.

---

## 4. USE / AVOID MATRIX

Legend — **Standalone-safe?** = renders on a static SPA with no Frappe server. "Backend-bound" = assumes Frappe data/resource/auth/socket. **Recommendation** is for *this* project specifically.

### Components

| Component | Standalone-safe? | Where it'd fit in the 6 views | Recommendation & fallback |
|---|---|---|---|
| **Button** | ✅ Yes (Headless-UI-free; plain `<button>` + classes) | Everywhere (Configure actions, Compare, Proposition print/export) | **Reproduce.** ~30-line Vue wrapper over `<button>` + our Tailwind tokens. Adopting it drags the preset for `bg-surface-*`/`ink-*` classes. |
| **Dialog** | ✅ Yes (wraps `@headlessui/vue` Dialog) | Configure (edit round/tier/objective modals), confirm destructive actions | **Fallback: Headless UI `Dialog` directly** (it's a frappe-ui dep anyway). Same a11y, our styling. |
| **ConfirmDialog / `confirmDialog()` / `dialog`** | ✅ Yes (imperative API over Dialog) | "Reset to baseline?", "Discard CSV?" confirmations | Nice-to-have; trivial to hand-roll over Headless UI Dialog. |
| **FormControl** (wrapper: label+input+error, switches type) | ✅ Yes | Configure forms (rounds, scenarios, tiers, milestones, pools) | **Reproduce.** It's a convenience switch over Input/Select/Textarea/Checkbox/Switch; building our own gives consistent editorial form styling. |
| **Input / TextInput** | ✅ Yes | All numeric/text fields in Configure | **Reproduce** (`<input>` + `.form-input` classes). The preset's `.form-input` component-class is what styles it — not free. |
| **Select** | ✅ Yes (native `<select>` + chevron bg from preset) | Tier/profile/scenario pickers | **Reproduce** or use native styled `<select>`. |
| **Textarea** | ✅ Yes | Notes / objective descriptions | Reproduce. |
| **Checkbox** | ✅ Yes | Toggle objectives, gating flags | Reproduce. |
| **Switch** | ✅ Yes (wraps Headless UI Switch) | "Net-of-strike" toggles, performance gating on/off | **Headless UI `Switch`** fallback. |
| **Badge** | ✅ Yes (pure presentational) | Status pills (e.g. "draft", tier labels), Board table tags | **Reproduce** (10-line span). Zero reason to import. |
| **Tooltip** | ✅ Yes (wraps `tippy.js` / floating-ui) | Chart legends, net-vs-gross explainers, FDV caveats | **Fallback: `@floating-ui/vue`** or a tiny tippy wrapper. Useful component but small. |
| **Dropdown** | ✅ Yes (Headless UI Menu + floating-ui) | Row actions, "export as…", scenario menu | **Headless UI `Menu`** fallback. |
| **Tabs / TabButtons** | ✅ Yes | Advisors view sections; Compare sub-views | **Headless UI `TabGroup`** fallback, or simple `v-if` + button row. |
| **Avatar** | ✅ Yes | Advisor identity in package/Board (if we show people) | Reproduce (img/initials). Low value. |
| **Combobox** | ✅ Yes (Headless UI Combobox + `fuzzysort`) | Advisor/tier search-select (if needed) | **Headless UI `Combobox`** fallback. Pulls `fuzzysort` if imported from frappe-ui. |
| **Autocomplete** | ✅ Yes (built on Combobox) | Same as Combobox | Headless UI Combobox fallback. |
| **MultiSelect** | ✅ Yes | Objective multi-pick | Headless UI Combobox (multiple) fallback. |
| **Toast / `toast()` / ToastProvider** | ✅ Yes (wraps **`vue-sonner`**) | "Saved", "CSV imported", "Copied" | **Fallback: `vue-sonner` directly** (or our own). Importing frappe-ui's `toast` drags vue-sonner regardless. |
| **Tooltip/Popover/Dropdown family** | ✅ Yes | Various | All reducible to Headless UI + floating-ui. |
| **DatePicker / Calendar / MonthPicker / TimePicker** | ✅ Yes (uses `dayjs`) | **Low/none** — comp studio is scenario-driven, not date-entry heavy (vesting is computed, not picked) | Skip. If a date field appears, native `<input type=date>` or a small dayjs picker. |
| **ListView / List + List* parts (ListHeader/Row/Footer/…)** | ⚠️ **Renders standalone, but designed around the Frappe list/resource model** (selection banners, group headers, server pagination patterns). Heavy, opinionated, Espresso-styled. | Board table, Compare matrix | **AVOID for our tables.** Our Board/Compare are fixed, computed tables — a plain `<table>` + Tailwind (as Overview already does) is lighter and on-brand. ListView's value is server-driven lists we don't have. |
| **TextEditor** (TipTap 3.11 + ProseMirror, ~35 deps) | ✅ technically | **None** — no rich-text in this tool | **AVOID.** Biggest single bundle risk; do not import. |
| **Tree** | ✅ Yes | None obvious | Skip. |
| **FileUploader** | ⚠️ Component renders, but `FileUploadHandler`/`useFileUpload` target Frappe's `/api/method/upload_file` | CSV import (roadmap) | **AVOID the handler** (Frappe upload endpoint). For roadmap CSV use a plain `<input type=file>` + `FileReader` + your own parser. |
| **Charts: AxisChart / DonutChart / ECharts / FunnelChart / NumberChart** | ✅ render standalone, but wrap **echarts** | The 9 charts (staircase, net-vs-gross, upside, vesting, football-field, mix, waterfall, scatter, grouped bar) | **AVOID — conflicts with the chosen stack.** Project uses **frappe-charts** (`frappe-charts ^1.6.2`, already in scaffold) + custom SVG. Importing frappe-ui's chart components would pull a *second* charting engine (echarts ~1MB). Pick one; the plan already picked frappe-charts. (Aside: if frappe-charts' gaps bite — scatter/waterfall — echarts via frappe-ui is a heavier alternative, but that's Lane B's call.) |
| **Breadcrumbs, Card, Divider, Spinner/LoadingIndicator, Progress/CircularProgressBar, Rating, Slider, Alert, Popover, CommandPalette, KeyboardShortcut(sModal), Sidebar, GridLayout, ItemListRow** | ✅ mostly presentational/standalone | Misc (Card/Divider/Spinner could appear) | Reproduce the 2–3 we want (Card, Spinner, Divider) in a few lines. CommandPalette/Sidebar/GridLayout are app-shell features we don't need. |

### Data layer — **ALL backend-bound, OUT OF SCOPE (confirmed)**

| API | Standalone-safe? | Reason |
|---|---|---|
| `createResource` / `createListResource` / `createDocumentResource` / `createListManager` (`src/resources/*`) | ❌ No | Built on `frappeRequest` → `POST /api/method/...` with `X-Frappe-Site-Name`/CSRF. |
| `useList` / `useDoc` / `useDoctype` / `useNewDoc` / `useFrappeFetch` (`src/data-fetching/*`) | ❌ No | Frappe **doctype**/REST + `idb-keyval` caching of Frappe docs. |
| `call` / `createCall` | ❌ No | Hardcodes `/api/method/${method}` + Frappe headers. |
| `frappeRequest` / `request` / `initSocket` / `resourcesPlugin` | ❌ No | Frappe REST + socket.io to a Frappe site. |
| `FrappeUIProvider` / `Resource.vue` | ❌ effectively | Wire the resource layer into the tree. |

→ **Our state is local** (a Pinia/`reactive` store over `engine/engine.ts`). None of the above applies. Confirmed OUT OF SCOPE, as the plan assumed.

### Theming / tooling exports

| Item | Standalone-safe? | Correct path (verified) | Recommendation |
|---|---|---|---|
| Tailwind preset | ✅ but invasive | `import frappeUIPreset from 'frappe-ui/tailwind'` (NOT `frappe-ui/src/utils/tailwind.config`) | **AVOID** — overrides palette/fonts/radius/shadows (§2). Keep our own Tailwind config. |
| `style.css` | ✅ | `import 'frappe-ui/style.css'` (NOT `dist/style.css`) | **AVOID** — bundles Inter + preset-keyed base layer. |
| `frappe-ui/vite` plugin | ✅ | `frappe-ui/vite` | Provides auto-import/icon plumbing for frappe-ui's own dev; **not needed** for narrow component use. |
| `frappe-ui/icons`, `FeatherIcon`, Lucide plugin | ✅ | `frappe-ui/icons` | No lock-in benefit; use Lucide/inline SVG directly if wanted. |
| `useShortcut`, `usePageMeta`, `debounce`, `fileSize`, `dayjs` re-export, theme utils | ✅ Yes (genuinely backend-free helpers) | named from `frappe-ui` | Minor; not worth the dep — `debounce`/`dayjs` are one-liners/own installs. |

---

## 5. Decisive preliminary verdict

**Do NOT take frappe-ui as a component/theming dependency for the Advisor Comp Studio.** Rationale, in priority order:

1. **Design conflict is structural, not cosmetic.** The preset overrides `theme.colors` wholesale, forces Inter (`InterVar`, `cv11`/`opsz`), and resets `fontSize/borderRadius/boxShadow`. The whole component library is wired to frappe's semantic tokens (`surface-gray-2`, `ink-gray-8`, …). You cannot cherry-pick a styled Button without importing that design system. Our design is explicitly Fraunces/IBM-Plex warm-paper editorial — the opposite aesthetic.
2. **The value we'd actually use is tiny and re-creatable.** The only genuinely useful interactive primitives (Dialog, Dropdown/Menu, Switch, Tabs, Combobox, Tooltip, Toast) are **thin wrappers over `@headlessui/vue` + `@floating-ui/vue` + `vue-sonner`** — libraries we can depend on **directly**, styled with our existing Tailwind config, with the same accessibility and a fraction of the surface. Everything else (Button/Badge/Input/Select/Textarea/Checkbox/Card/Divider/Spinner) is a few lines each — and the only built view (`Overview.vue`) already proves the hand-rolled-HTML-+-Tailwind approach works and looks right.
3. **The headline features are off-target.** Data layer = Frappe-backend-bound (out of scope). ListView = server-list-shaped (our tables are computed). TextEditor = no rich text here (but ~35 TipTap/ProseMirror deps if touched). Charts = a *second* engine (echarts) competing with the chosen frappe-charts.
4. **Operational friction.** Raw-source package (no `dist`) → your build compiles it; **bundle weight is a live risk** with easy footguns. Peer floor `vue >=3.5` forces a Vue bump from the scaffold's `^3.4.21`. The package is mid-major-churn (0.1.278 `latest` vs `1.0.0-beta.4` shipped *today*) — pinning is mandatory and upgrades will hurt.
5. **The plan's integration snippet is wrong anyway** (`dist/style.css` 404s, `require('frappe-ui/src/utils/tailwind.config')` is deprecated/mis-resolving/CJS-vs-ESM, bare `app.use(FrappeUI)` boots a doomed socket). Even the happy path needs rework.

### Recommended fallback stack (headless + Tailwind)
- **Interactive primitives:** `@headlessui/vue` (Dialog, Menu→Dropdown, Switch, TabGroup, Combobox, Listbox, Popover) + **`@floating-ui/vue`** for Tooltip/positioning. Both are already frappe-ui's own deps — proven, tiny, framework-aligned, unstyled (we bring our editorial Tailwind classes).
- **Toasts:** `vue-sonner` directly (or a 40-line custom) — same lib frappe-ui uses.
- **Presentational** (Button, Badge, Input, Select, Textarea, Checkbox, Card, Divider, Spinner, FormControl): hand-rolled Vue SFCs against the existing `tailwind.config.cjs` tokens, matching `Overview.vue`'s established style. Estimate: a `components/ui/` folder, ~1 day, fully on-brand.
- **Icons:** Lucide (standalone `lucide-vue-next`) or inline SVG. No frappe coupling.
- **Charts:** keep frappe-charts + small custom SVG (per plan / Lane B).

**Scaffold cleanups implied (regardless):** remove the commented `import { FrappeUI } from 'frappe-ui'` / `import 'frappe-ui/dist/style.css'` lines in `main.ts`; drop the `./node_modules/frappe-ui/src/**/*` glob from `tailwind.config.cjs` `content` (it scans a package we won't ship); do **not** add the frappe-ui preset. (`frappe-charts` stays — that's the charting decision, separate from frappe-**ui**.)

> If leadership insists on frappe-ui for ecosystem consistency, the **minimum-damage** path is: pin `frappe-ui@0.1.278` exactly, bump `vue` to `^3.5`, import **only named components** you use, do **NOT** import `frappe-ui/style.css`, do **NOT** apply the preset (instead copy the ~3 component-class rules you need — `.form-input` etc. — into your own CSS), and **never** call `app.use(FrappeUI)`. At that point you're using frappe-ui as a worse, heavier Headless UI — which is exactly why the recommendation is to skip it.

---

## 6. Where the live sandbox must confirm (open questions for the orchestrator)
1. **Bundle weight, empirically.** `npm i frappe-ui@0.1.278 vue@^3.5`, build a page importing only `{ Button, Dialog, FormControl, Badge, Tooltip, Dropdown, Tabs }`, and read the Rollup output / `rollup-plugin-visualizer`. Confirm the ~60–120 KB gz estimate and that **no echarts/TipTap/socket.io** leak in.
2. **Strict `exports` resolution.** Confirm whether Vite actually rejects `frappe-ui/src/utils/tailwind.config` (it's not in `exports`) — i.e. prove the plan's path fails, not just warns. Then confirm `frappe-ui/tailwind` resolves.
3. **Does `app.use(FrappeUI)` (bare) throw/spam** on a static origin (socket.io reconnect loop)? Confirms claim #2 severity.
4. **Render parity:** drop a frappe-ui `<Button>`/`<Dialog>` **without** the preset and confirm it renders unstyled/broken (proves the all-or-nothing coupling) — and with the preset, confirm it stomps the Fraunces/paper theme.
5. **Vite+ (`vp`) vs plain `vite`:** confirm both resolve `frappe-ui` identically (the alpha `vp` toolchain shouldn't differ, but it's unverified).
6. **frappe-charts gaps** (scatter #188, waterfall) — Lane B; only relevant here if we'd otherwise reach for frappe-ui's echarts wrappers as the escape hatch.
