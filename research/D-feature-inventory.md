# Lane D — Reference-app feature / IA inventory (graded checklist)

> **Authoritative parity inventory.** Every row below is a feature in `reference/advisor-comp-studio.tsx`
> (1529 lines, read in full) that the Vue re-implementation must reproduce. Engine data needs cite
> `engine/engine.ts` exports. The **COM coverage** column maps each feature to a Linear issue from
> `_CONTEXT.md`; rows flagged **GAP / MIS-MAP / UNDER-SPEC** are reconciled in §8.
>
> Legend: ✅ covered & correctly mapped · ⚠️ under-specified (issue exists but omits this) · ❌ no issue
> owns it · 🔀 mis-mapped (issue names a wrong component/behaviour).

Source of truth: `reference/advisor-comp-studio.tsx`. Engine: `engine/engine.ts`. Plan §5 map:
`IMPLEMENTATION_PLAN.md` lines 54–64. COM map: `_CONTEXT.md` lines 37–43.

---

## 0. Cross-cutting verified facts (do not re-derive)

- **Tab IDs ≠ route names ≠ section numbers.** The reference uses internal tab ids
  `overview / package / board / compare / proposition / configure` (line 503). The **route** label for
  `package` is **"Advisors"** (line 503: `['package','II','Advisors']`); plan §5 + router use `/advisors`.
  So **"Advisors view" == `PackageTab` == tab id `package`** throughout. The component is literally named
  `PackageTab` (line 794).
- **Section-number drift inside the reference itself** (flag, do not copy): nav numerals are I–VI in tab
  order (line 503), but the `SectionHead`/eyebrow inside components disagree: `PackageTab` eyebrow =
  "Section I · Package" (line 809), `BoardTab` = "Section II · Board" (919), `CompareTab` =
  "Section III · Compare" (1005), `PropositionTab` = "Section IV · Proposition" (1067), `ConfigureTab` =
  "Section VI · Configure" (1128), `OverviewTab` = "Section I · Overview" (1463). **Two components both
  claim "Section I"** (Overview and Package). The Vue port should pick one numbering scheme — recommend
  matching the nav (I Overview … VI Configure) and fixing the eyebrows. Not owned by any COM issue.
- **Theme palette** `C` (lines 14–21) + category colours `CAT` (22–27) + `SCEN_COLORS`
  (engine line 59) + `TIER_COLOR` (line 1323). Fonts loaded via `StyleInjector` `@import` (line 339):
  Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (mono/eyebrow/tabular). `_CONTEXT.md`
  confirms scaffold loads these via `index.html` instead.
- **Engine is frozen** (22/22). All "data needed" columns are *existing* engine outputs — views must not
  recompute. Key compute entrypoints: `computeBoard()` (engine 283), `computeAdvisor()` (engine 216),
  `walkScenario()` (engine 187), `tgeFdvFor()` (engine 210), `vestedFrac()` (engine 307).

---

## 1. App shell — header, nav, banners, global actions (always mounted)

Component: `App` (line 441), `Banner` (535), `IconBtn` (538), `Footer` (1520), `Mgr` (1280).

| # | Control / element | Behaviour & data | Ref lines | COM coverage |
|---|---|---|---|---|
| 1.1 | Brand lockup "Raiku Labs" + "Advisory Board · Compensation Studio" eyebrow + **"Internal" pill** | static; pill `title="Internal & confidential"` | 480–484 | ⚠️ COM-25 (baseline shell) / COM-14 — neither explicitly lists the header chrome |
| 1.2 | Status flash text (right of header) | `status` state; `flash()` sets for 2800 ms | 486, 457 | ❌ no issue (part of save/IO UX) |
| 1.3 | **IconBtn: Configure** (jumps to configure tab) | `setTab('configure')` | 487 | ✅ COM-25 |
| 1.4 | **IconBtn: Save** | `persist()` → writes named board to `io` | 488, 458 | ❌ **multi-board save (Mgr) unowned** — see 1.12 |
| 1.5 | **IconBtn: Saved** (toggles `Mgr`, badge = #saved) | `setShowMgr`; badge `Object.keys(saved).length` | 489 | ❌ no issue (saved-board manager) |
| 1.6 | **IconBtn: CSV** (board summary export) | `exportCSV()` — builds roster CSV, **distinct from roadmap CSV** | 490, 463–470 | ❌ no issue owns board-summary CSV export |
| 1.7 | **IconBtn: JSON** (export full state) | `exportJSON()` → `io.download(...json)` | 491, 459 | ⚠️ COM-11 (store/persist) implied, not named |
| 1.8 | **IconBtn: Import** (hidden file input) | `fileRef.click()` → `importJSON` parses + `LOAD` | 492, 460, 475 | ⚠️ COM-11 implied |
| 1.9 | **IconBtn: Copy** (state → clipboard) | `copyState()` → `io.copy(JSON.stringify(S))` | 493, 461 | ⚠️ COM-11 ("copy-to-clipboard" in _CONTEXT) — but that's URL-share; full-state copy is broader |
| 1.10 | **IconBtn: Paste** (clipboard → state) | `pasteState()` → `clipboard.readText` + `LOAD` | 494, 462 | ❌ no issue (paste-to-load) |
| 1.11 | **IconBtn: Reset** | `dispatch LOAD scenario:DEFAULT()` | 495 | ✅ COM-11 (implied) — scaffold `reset()` exists |
| 1.12 | **Saved-board manager `Mgr`** (full dark panel): list saved names, load, delete, "Save as" input | `onLoad/onDel/onSaveAs`; persists `{scenarios, last}` via `io.save` | 514, 1280–1294 | ❌ **NO COM issue** — entire named-multi-board feature is unmapped |
| 1.13 | **Storage-unavailable Banner** | shown when `!STORAGE_OK` | 499, 535 | ⚠️ COM-11 / COM-21 (a11y) — neither names it |
| 1.14 | **Budget-warning Banner** (top) | `board.warnings[0]` (+N more) | 500 | ⚠️ COM-15/COM-26 surface warnings in Board; header banner unowned |
| 1.15 | **Nav tab bar** (6 tabs, roman numerals, active underline, horizontal scroll) | `tab` state; maps `[id,numeral,label]` | 501–511 | ✅ COM-9/router + COM-25 |
| 1.16 | **Footer** legal note (net-of-strike summary, base %, tiers, TGE-FDV basis, $1B caution, "discussion draft") | reads `S.plan.baseGrant`, `S.tiers`, `roundLabel`, `tgeAnchor` | 1520–1528 | ⚠️ COM-20 (proposition+print) is closest but footer is global, not proposition |
| 1.17 | `EmptyState` (no advisors) — used by Overview + non-config tabs | `dispatch ADD_ADV` | 520, 1509–1517 | ⚠️ COM-14 (Overview) — empty state not named |

**IO layer** (`io`, lines 428–438): dual backend `window.storage` (HAS_WS) → `localStorage` (HAS_LS),
`KEY='raiku-advisor-comp-v5'` (line 432). `download/copy` helpers. Scaffold `store.ts` only implements
`localStorage` (no `window.storage`) and has **no named-board layer** (`{scenarios, last}` shape absent).

---

## 2. View I — Overview (`OverviewTab`, line 1450)

Default landing. Plan §5: "KPI band, roster cards, pool allocation, benchmark, alerts; no charts
(numbers + bars-as-divs)."

| # | Element | Data from engine | Ref lines | COM coverage |
|---|---|---|---|---|
| 2.1 | `SectionHead` (eyebrow/title/desc) + Configure CTA button | static + `setTab` | 1463–1465 | ✅ COM-14 |
| 2.2 | **KPI band** (6 `Kpi` cells, grid): Advisors · Net cost base (accent) · Range lo→hi · Equity of company (base, pre-uplift) · Tokens of supply (earned) · Annual cash | `board.rows.length`, `board.cost[baseScenKey]`, `board.cost[lo/hi]`, Σ`baseEq`, `board.sumTk`, `board.sumCash` | 1467–1474, `Kpi` 1447 | ✅ COM-14 |
| 2.3 | **Roster cards** (grid of buttons → open package): name, tier/`$value` pill, sector, baseCaseTotal, eq%·tok%, "+N% potential at ceiling" | `computeAdvisor` per row: `baseCaseTotal`, `eqPct`, `tkPct`, `ceilUplift`,`earnedUplift`; `S.tiers[a.tier].name` | 1480–1488 | ✅ COM-14 |
| 2.4 | Base-path caption (steps → + TGE FDV) | `walkScenario(plan,'base').steps`, `tgeFdvFor` | 1489, 1455 | ✅ COM-14 |
| 2.5 | **PoolAllocation** (shared) — see 7.x | `board.sumEq/sumEqCeil/esopNow`, `sumTk/sumTkCeil/boardBucket` | 1492 | ✅ COM-14 (reuses shared) |
| 2.6 | **Benchmark card**: board base equity, FAST per-head 0.30–1.00%, pool ~5%, **source string** | Σ`baseEq`, `BENCH.advisorPool`, `BENCH.advisorSrc` | 1493–1497 | ⚠️ COM-14 — benchmark text not itemised |
| 2.7 | **"To confirm / alerts" panel** (flags): budget warnings + per-advisor "confirm terms" (regex `/confirm/i` on notes) + TGE-multipliers-unvalidated note + ESOP-at-adoption note | `board.warnings`, `a.notes`, `S.plan.esopStart` | 1456–1460, 1498–1501 | ⚠️ COM-14 — alert-flag logic (esp. notes regex) under-specified |

Charts: **none** (matches plan). Bars are CSS divs inside `PoolAllocation`.

---

## 3. View II — Advisors (`PackageTab`, line 794) — the hero/live-edit view

Plan §5: "left controls (profile, base/tier, performance) · live hero right; show-detail expander."
This is the densest view. Left column `no-print`; right column `print-area`.

### 3a. Header controls
| # | Control | Behaviour | Ref lines | COM coverage |
|---|---|---|---|---|
| 3.1 | `SectionHead` "Base, then performance." | static | 809 | ✅ COM-17 (layout) |
| 3.2 | **StageBadge** (shared) — current-stage `<select>` | `dispatch SET ['plan','currentStage']` over `milestones` | 810, `StageBadge` 555 | ⚠️ COM-18 (controls) — stage badge not named (shared widget) |
| 3.3 | **AdvisorPicker** (shared) — advisor `<select>` | `setSelId` | 810, `AdvisorPicker` 552 | ✅ COM-18 |
| 3.4 | **Print** button (`window.print()`) | package print path | 810 | ✅ COM-31 (print) / 🔀 see §8 — print is in M5 not M3 |
| 3.5 | **ContextStrip** (shared, `no-print`): base-path steps, TGE FDV (mult × anchor), ESOP start→cap | `walkScenario('base')`, `tgeFdvFor`, `esopStart/esopCap` | 812, `ContextStrip` 558 | ⚠️ COM-17 — context strip not named |

### 3b. Left controls — Profile card (lines 817–830)
| # | Control | Field → engine | COM |
|---|---|---|---|
| 3.6 | Name `input.cell` | `setA('name')` | ✅ COM-18 |
| 3.7 | Sector `<select>` (7 `SECTORS`, engine 78) | `setA('sector')` | ✅ COM-18 |
| 3.8 | Engagement (yrs) **NumIn** min1 max10 | `setA('years')` | ✅ COM-18 |
| 3.9 | Start date `input[type=date].dt` | `setA('startDate')` | ✅ COM-18 |
| 3.10 | **Granted at** `<select>` (`roundList`: bridge+rounds) | `setA('grantRound')` → drives `grant.post` strike basis | ✅ COM-18 |
| 3.11 | **Tax residency** `<select>` UK/US/Other | `setA('taxResidency')` → drives s431/409A line in proposition | ⚠️ COM-18 — residency control present but its *legal-line* consequence lives in COM-20 |
| 3.12 | Notes `input.cell` | `setA('notes')` (also feeds Overview "confirm" regex) | ✅ COM-18 |

### 3c. Left controls — Base/denomination card (lines 832–851)
| # | Control | Field → engine | COM |
|---|---|---|---|
| 3.13 | **Mode toggle** `By tier` / `By $ value` | `setA('mode')` → `computeAdvisor` branch (engine 221/228) | ✅ COM-18 |
| 3.14 | (tier mode) "Uniform base X eq · Y tok ×tier" hint | `baseGrant.equityPct/tokenPct` | ✅ COM-18 |
| 3.15 | (tier mode) **Tier picker** (grid of `S.tiers` buttons; name, mult, derived eq/tok) | `setA('tier')`; `bg.equityPct*t.mult` | ✅ COM-18 |
| 3.16 | (tier mode) **EquityBenchmark** (FAST band) — see 6.x | `BENCH.advisorEquity[benchLevelForTier]` | ⚠️ COM-18 — FAST benchmark sub-widget not itemised |
| 3.17 | (value mode) Annual value **NumIn** usd | `setA('annualValue')` | ✅ COM-18 |
| 3.18 | (value mode) **Options/tokens split** `range` 0–1 step .05 | `setA('splitOptions')` → engine 241 | ✅ COM-18 |
| 3.19 | **Cash retainer** checkbox (post-Series A) | `setA('hasCash')` | ✅ COM-18 |
| 3.20 | Annual cash **NumIn** usd (conditional) | `setA('cashAnnual')` | ✅ COM-18 |

### 3d. Left controls — Performance uplift card (lines 853–877) — amber
| # | Control | Field → engine | COM |
|---|---|---|---|
| 3.21 | **Capital introduced by channel**: Equity-round **NumIn** + Token-OTC **NumIn**; live "+X% ⏳" | `setPerf({capitalEquity/capitalToken})` → engine 254–257 (`capRaw/capActive`) | ✅ COM-30 (controls performance) |
| 3.22 | Capital schedule caption (per → +pct, cap, gate) | `plan.capitalUplift.{per,pct,cap,gate}` | ✅ COM-30 |
| 3.23 | **Objectives list** — each: category dot, label, +uplift%, trigger, gate label, "⏳ awaiting gate"; **off/target/earned** tri-state buttons; hover sync | `objState/setObjState` mutates `performance.achieved/targeted`; `stageReached`; `CAT[category]` | 865–874 | ✅ COM-30 |
| 3.24 | Earned / pending / ceiling summary line | `calc.earnedUplift/pendingUplift/ceilUplift` | 875 | ✅ COM-30 |

### 3e. Right hero (print-area) (lines 881–906)
| # | Visual / control | Engine data | Ref lines | COM coverage |
|---|---|---|---|---|
| 3.25 | **PotentialStrip** (4 cells: Floor/Current/Ceiling/Best-case + mini bars) | `baseCaseBase`, `baseCaseTotal`, `baseCaseCeil`, `bestCaseTotal`, `earnedUplift`, `ceilUplift` | 882, `PotentialStrip` 574 | ⚠️ COM-17 — "waterfall" named; PotentialStrip not. See §8 |
| 3.26 | **GrowthWaterfall** (recharts vertical stacked bar; base→capital→objectives→ceiling; solid/hatched/outline states; Current + Ceiling reference lines; hover sync with 3.23) | `calc.base.{fdv,netEqAt,exitVal}`, `baseEq`, `baseTk`, `capRaw/capEarned`, objectives `achieved/targeted`, `CAT` colours; uses `valAt(mult)` | 883, `GrowthWaterfall` 599–660 | ✅ COM-17 (waterfall). **Needs custom SVG** (no native recharts→frappe waterfall) → COM-27 |
| 3.27 | **UpsideCurve** (two charts: Equity net-vs-exit **AreaChart** + Tokens-vs-FDV **LineChart**) — see 5.x detail | `calc.eqPct/tkPct`, `base.{retention,strikeBasis,exitVal,fdv}`, `exitMultiple`, `scen[]`, `BENCH.fdvCaution` | 884, `UpsideCurve` 666–747 | ✅ COM-28 |
| 3.28 | **"Show detail" expander** toggle | `showDetail` state | 885 | ⚠️ COM-29 — expander mechanic not named |
| 3.29 | **VestingTimeline** (stacked stepAfter AreaChart, 48 mo) — see 5.x | `vestedFrac`, `base.{netEqAt,exitVal,fdv}`, vest yrs/cliff, `tgeDate`, `cocAccelPct`, `upliftStartMonth` | 887, `VestingTimeline` 1367–1425 | ✅ COM-29 (vesting) |
| 3.30 | **FootballField** (single-advisor scenario range bar) — see 5.x | `calc.scen[].total`, `baseCaseTotal` | 888, `FootballField` 750–767 | ✅ COM-29 (football) |
| 3.31 | **MixBreakdown** (percentage stacked bar Options/Tokens/Cash) — see 5.x | `baseEqNet`, `tkPct*base.fdv`, `cashTotal` | 889, `MixBreakdown` 1349–1364 | ✅ COM-29 (mix) |
| 3.32 | **DilutionPath** (mini CSS bar chart, base path retention) | `walkScenario('base').steps`, `baseEq`, `retentionBase` | 891, `DilutionPath` 770–791 | ❌ **DilutionPath not in any COM issue** (M3 lists waterfall/upside/vesting/football/mix/instruments — not dilution mini-chart). See §8 |
| 3.33 | **Instruments panel** (net-of-strike rows): Options base-case net · Shares @ bridge · Strike · Exercise cost · Tokens (% · count) · Token value (base FDV) · Vesting; **HMRC SAV / 409A caveat** | `baseEqNet`, `equityShares`, `strikePps`, `exerciseCost`, `tkPct`, `tokenCount`, `base.fdv`, vest | 892–902, `Row` 911 | ✅ COM-29 (instruments) |
| 3.34 | **"View X's proposition"** CTA → proposition tab | `setTab('proposition')` | 905 | ⚠️ COM-20 — cross-nav not named |

---

## 4. View III — Board (`BoardTab`, line 914)

Plan §5: "roster table, scenario ranges, pool allocation, company cost, valuation staircase, potential
scatter; staircase (bar), scatter (SVG), comparison (grouped bar)."

| # | Element | Engine data | Ref lines | COM coverage |
|---|---|---|---|---|
| 4.1 | `SectionHead` + desc + **StageBadge** + **"Board pack" print** btn + **Add** advisor btn | `dispatch ADD_ADV`, `window.print()` | 919–921 | ✅ COM-15 (table) / print → COM-31 |
| 4.2 | **ContextStrip** (shared) | as 3.5 | 922 | ⚠️ COM-15 |
| 4.3 | **ValuationStaircase** (recharts grouped bar: Raiku vs market Median per stage; TGE-FDV caption; `role="img"` aria-label) | `walkScenario('base').steps[].post`, `BENCH.postMoney[id]`, `tgeFdvFor`, `scenarios[base].tgeMult` | 924, `ValuationStaircase` 1297–1321 | ✅ COM-26 (staircase). Plan §5 calls staircase "bar"; §6 risk says **custom SVG** — reconcile |
| 4.4 | **PotentialScatter** (recharts ScatterChart, x=current net, y=headroom, z=capital bubble, tier colours, click→select, `role="img"`) | `baseCaseTotal`, `baseCaseCeil`, `performance.capitalIntroduced`, `a.tier`, `TIER_COLOR` | 925, `PotentialScatter` 1325–1346 | ✅ COM-26 (scatter) — **must be custom SVG** (frappe scatter broken #188) → COM-27 |
| 4.5 | **Roster table** (cols: Advisor+sector, Tier pill, Base eq, Earned (+pending ⏳), Net base-case, delete; row click→select; **board total row**) | per-row `computeAdvisor`: `baseEq`, `earnedUplift`, `pendingUplift`, `baseCaseTotal`; `DEL_ADV` | 929–945 | ✅ COM-15 |
| 4.6 | **Scenario-range-by-advisor** football-field list (lo–hi bar + base tick per advisor) | per row `min/max(scen[].total)`, `baseCaseTotal` | 947–960 | ⚠️ COM-15/COM-26 — this **per-advisor multi-row football field** is distinct from single-advisor FootballField (3.30); not explicitly itemised |
| 4.7 | **PoolAllocation** (shared) — see 7.x | as 2.5 | 963 | ✅ COM-15 |
| 4.8 | **Company cost panel** (per-scenario net cost cells + annual cash) | `board.cost[k]`, `baseScenKey`, `board.sumCash` | 964–971 | ✅ COM-15 |

Charts here: staircase (bar), scatter (SVG), per-advisor range (CSS divs). The plan also lists a
"comparison (grouped bar)" for Board (§5) — but in the reference the **grouped comparison bar lives in
Compare** (5.x below), not Board. Flag in §8.

---

## 5. View IV — Compare (`CompareTab`, line 1001)

Plan §5: "side-by-side matrix + grouped bar."

| # | Element | Engine data | Ref lines | COM coverage |
|---|---|---|---|---|
| 5.1 | `SectionHead` "The board, side by side." | static | 1005 | ✅ COM-19 |
| 5.2 | **Comparison matrix table** (cols: Advisor, Tier, Base eq, Earned, Ceiling, one **Net <scenario>** col per scenario, Cash/yr; **board total row**; row click→select; base-scenario col bolded) | per-row `baseEq`, `earnedUplift`, `ceilUplift`, `scen.find(k).total`, `cash`; `board.cost[k]`, `board.sumCash` | 1006–1024 | ✅ COM-19 |
| 5.3 | **Grouped bar** "Net value across scenarios" (recharts BarChart, one `Bar` per scenario, `SCEN_COLORS`, Legend) | `board.rows[].scen[].total` keyed by label; `scenKeys`, `SCEN_COLORS` (engine 59) | 1025–1039 | ✅ COM-19 (grouped bar) |

`SCEN_COLORS` is the per-scenario palette (used here + in upside-curve reference dots).

---

## 6. View V — Proposition (`PropositionTab`, line 1045)

Plan §5: "print-ready advisor doc + 'how to read this'; no charts." This is the **legal-dense** view.

| # | Element | Engine data / content | Ref lines | COM coverage |
|---|---|---|---|---|
| 6.1 | Header bar (`no-print`): eyebrow + **AdvisorPicker** + **Print** + **Copy** (`propText()`) | `onCopy(propText())`, `window.print()` | 1066–1069 | ✅ COM-20 |
| 6.2 | **propText() plain-text proposition** (clipboard) — full structured text incl. base, equity (options @ strike), tokens "(RTA)", cash, capital uplift, per-objective lines, earned/ceiling, net-by-scenario, "discussion draft, not a binding offer" | `baseCaseBase`, `baseEq`, `grantN`, `strikePps`, `baseTk`, `tgeMult`, `roundLabel(tgeAnchor)`, `fdv`, objectives, `scen[].total` | 1050–1062 | ⚠️ COM-20 — the **plain-text export string** (separate from the rendered doc) is not itemised |
| 6.3 | Print-area doc header (Confidential · Discussion Draft, Raiku Labs, "Prepared for" advisor + sector) | static + `sel` | 1070–1076 | ✅ COM-20 |
| 6.4 | Hero headline ("A N-year engagement, a base that grows…") | `sel.years`, `sel.hasCash` | 1078–1082 | ✅ COM-20 |
| 6.5 | **"How to read this"** explainer block | static legal/UX copy | 1084–1087 | ✅ COM-20 |
| 6.6 | **3 PCells**: Base·net / Current·earned / Ceiling | `baseCaseBase`, `baseCaseTotal`, `baseCaseCeil`, `baseEq`, `baseTk`, `earnedUplift`, `ceilUplift` | 1088–1092, `PCell` 1107 | ✅ COM-20 |
| 6.7 | **Net-value-across-outcomes** scenario cells (per scenario: % kept, total, eq/tok or "underwater") | `calc.scen[].{retention,total,equity,token,underwater}`, `baseScenKey` | 1093–1098 | ✅ COM-20 |
| 6.8 | **Legal footer block** — the densest caveat string (see §6a) | `roundLabel(grantRound)`, vest yrs/cliff, `sel.taxResidency` branch | 1099–1101 | ⚠️ COM-20 — present but **none of the individual legal clauses are enumerated as acceptance criteria** |

### 6a. Legal / caveat strings inventory (must survive the port verbatim-ish)
Every clause below appears in the reference; grouped by location. **Owner: effectively only COM-20**
(proposition+print) for most, plus Footer (global, unowned) and a few in PackageTab/Configure.

| Clause | Exact source string (abridged) | Ref line | Where |
|---|---|---|---|
| Net-of-strike (global) | "all equity values net of strike" / "net of strike" (×12 occurrences) | 1524, passim | Footer + PackageTab + Board desc |
| "Discussion draft, not a binding offer" | "A discussion draft, not a binding offer." / "Confidential discussion draft" / "Confidential · Discussion Draft" (×4) | 1051,1061,1073,1086 | Proposition + Footer |
| Non-voting shares | "Options over ordinary **non-voting** shares (ESOP)" | 1100 | Proposition footer |
| RTA (Restricted Token Award) | "Tokens via **Restricted Token Award**." / "(RTA)" | 1100, 1054 | Proposition + propText |
| Deed of adherence | "exercise binds a **deed of adherence**" | 1100 | Proposition footer |
| Net exercise | "strike at the … price; **net exercise permitted**" | 1100 | Proposition footer |
| CoC at Board discretion | "Change-of-control acceleration is **at Board discretion (not contractual)**" + VestingTimeline tooltip "Board discretion, not guaranteed" | 1100, 1396, 1422 | Proposition + VestingTimeline |
| UK s431 / US 409A by residency | UK→"a **s431 election** … within 14 days of exercise"; US→"**s83(b)/409A** treatment applies"; else "Tax treatment depends on residency." | 1100 | Proposition (residency-branched) |
| HMRC SAV / 409A valuation | "Strike subject to an agreed **HMRC SAV / 409A valuation** before first grant." (also in Instruments panel) | 1100, 901 | Proposition + PackageTab Instruments |
| 9-yr exercise-window backstop | "If no exit by the 9th anniversary, a ≥90-day exercise window opens (Option Certificate 3.6)." | 1100, 1422 | Proposition + VestingTimeline |
| "Subject to required investor consents" | "**Subject to required investor consents.** Not a binding offer or legal/financial advice." | 1100 | Proposition footer |
| Bad-Leaver forfeiture | "Voluntary exit before the 2-year **Bad-Leaver** line forfeits even vested options." | 1422 | VestingTimeline |
| Entity / jurisdiction | "Ackermann Systems Engineering Ltd (t/a Raiku), Cayman Islands." | 1100 | Proposition footer |
| **TGE-multipliers-unvalidated** | "TGE multipliers are working assumptions — validate against tokenomics before sharing externally." + Overview "TGE multipliers (2×/5×/12×) unvalidated" | 1193, 1459 | Configure + Overview |

---

## 7. Shared components (used across views)

| # | Component | Used by | Engine data | Ref lines | COM coverage |
|---|---|---|---|---|---|
| 7.1 | `PoolAllocation` (Equity vs ESOP + Tokens vs board bucket; solid=used, light=ceiling; over-budget red; ecosystem-committed note) | Overview, Board | `sumEq/sumEqCeil/esopNow`, `sumTk/sumTkCeil/boardBucket`, `committedAdvisorTokenPct` | 977–998 | ✅ COM-14/COM-15 (reused) — itemise once |
| 7.2 | `ContextStrip` | Package, Board | `walkScenario('base')`, `tgeFdvFor`, `esopStart/Cap` | 558–571 | ⚠️ unowned as a named widget |
| 7.3 | `StageBadge` | Package, Board | `currentStage` over `milestones` | 555–557 | ⚠️ COM-18 implied |
| 7.4 | `AdvisorPicker` | Package, Proposition | `selId/setSelId` | 552–554 | ✅ COM-18 |
| 7.5 | `NumIn` (inline click-to-edit numeric: usd/pct/pps/mult/num; clamp; Enter/Escape) | Package, Vesting | formats via `fUSD/fPct/fMult/fNum` | 544–550 | ⚠️ COM-18 — the **NumIn inline editor primitive** is load-bearing and not named in any issue |
| 7.6 | `DField` (dark-theme inline numeric editor, Configure variant of NumIn) | Configure | same formatters | 1266–1277 | ⚠️ COM-25 — dark inline editor not named |
| 7.7 | `Field`, `Row`, `SectionHead`, `Kpi`, `PCell`, `ChipRow`, `Banner`, `IconBtn` | various | layout primitives | 551, 911, 541, 1447, 1107, 662, 535, 538 | ⚠️ generally unowned primitives |
| 7.8 | `EquityBenchmark` (FAST band gauge + verdict in/above/below market) | Package (tier mode) | `BENCH.advisorEquity[benchLevelForTier]`, `baseEq` | 1428–1444 | ⚠️ COM-18 — FAST gauge not itemised |
| 7.9 | `ChipRow` (preset-value chip buttons) | UpsideCurve (×2) | active-value match | 662–664 | ⚠️ COM-28 — chip rows not named |

---

## 8. Chart-by-chart data contract (what each visual needs from the engine)

| Chart | Type in ref | Engine inputs (exact) | Replace-with (plan) | COM |
|---|---|---|---|---|
| **GrowthWaterfall** | recharts vertical stacked Bar + ReferenceLines + hatch pattern | `calc.base.{netEqAt,exitVal,fdv}`, `baseEq`, `baseTk`, `capRaw`, `capEarned`, `performance.achieved/targeted`, objectives `uplift/category/gate`, `stageReached`, `CAT` | **custom SVG** (no waterfall in frappe-charts) | COM-17 + COM-27 |
| **UpsideCurve (equity)** | recharts AreaChart (net + optional gross), breakeven ReferenceArea/Line, per-scenario ReferenceLines, selected-V line | `calc.eqPct`, `base.{retention,strikeBasis,exitVal}`, `exitMultiple`, `walkScenario('base').steps`, `scen[].exitVal`, `safeDiv` for breakeven | frappe-charts line/area | COM-28 |
| **UpsideCurve (token)** | recharts LineChart (723–737), `$1B caution` ReferenceArea/Line, selected-FDV line | `calc.tkPct`, `scen[].fdv`, `BENCH.fdvCaution`, `tgeFdvFor` via `base.fdv`, `roundLabel(tgeAnchor)` | frappe-charts line | COM-28 |
| **VestingTimeline** | recharts stacked **stepAfter** AreaChart, 0–48 mo, cliff/Bad-Leaver/TGE/today/CoC ReferenceLines | `vestedFrac(m,yrs,cliff)`, `base.{netEqAt,exitVal,fdv}`, `baseEq`, `eqPct`, `tkPct`, `equityVestYears/Cliff`, `tokenVestYears/Cliff`, `monthsBetween(start,tgeDate)`, `cocAccelPct`, `upliftStartMonth` | SVG or frappe-charts line | COM-29 |
| **FootballField** (single advisor) | CSS abs-positioned range bar + base tick | `calc.scen[].total` (min/max), `baseCaseTotal` | custom SVG/CSS | COM-29 |
| **Board per-advisor range** | CSS range bars (one per advisor) | per-row min/max `scen[].total`, `baseCaseTotal` | custom SVG/CSS | ⚠️ COM-15/26 (under-spec) |
| **MixBreakdown** | CSS percentage stacked bar | `baseEqNet`, `tkPct*base.fdv`, `cashTotal` | frappe-charts percentage | COM-29 |
| **DilutionPath** | CSS flex bar chart | `walkScenario('base').steps[].N`, `baseEq`, `retentionBase` | custom SVG/CSS | ❌ **unowned** |
| **PotentialStrip** | CSS 4-cell + mini bars | `baseCaseBase/Total/Ceil`, `bestCaseTotal`, `earnedUplift`, `ceilUplift` | CSS/numbers | ⚠️ under-spec (folded into COM-17?) |
| **ValuationStaircase** | recharts grouped Bar (Raiku vs Median) | `walkScenario('base').steps[].post`, `BENCH.postMoney`, `tgeFdvFor`, `tgeMult` | bar (plan) / custom SVG (risk note) — **inconsistent** | COM-26 |
| **PotentialScatter** | recharts ScatterChart (x,y,z bubbles, tier colour, click→select) | `baseCaseTotal`, `baseCaseCeil`, `performance.capitalIntroduced`, `a.tier`, `TIER_COLOR` | **custom SVG** (scatter broken #188) | COM-26 + COM-27 |
| **Compare grouped bar** | recharts BarChart (Bar per scenario) | `scen[].total` per row, `SCEN_COLORS` | frappe-charts grouped bar | COM-19 |

---

## 9. View VI — Configure (`ConfigureTab`, line 1112) + dynamic lists & reducer actions

Plan §5: "baseline, rounds (add/remove/rename), scenarios (+ base picker), tiers, milestones,
objectives, pools, roadmap CSV import/export." Dark-themed full-bleed panel.

### 9a. Configure controls
| # | Section | Controls | Reducer/action | Ref lines | COM |
|---|---|---|---|---|---|
| 9.1 | Header + **Done** btn | `setTab('overview')` | — | 1128 | ✅ COM-25 |
| 9.2 | **Roadmap CSV** | Import (hidden file → `parseRoadmapCSV` → `SET_ROADMAP`), Download (`roadmapToCSV` → `io.download`), columns hint | `SET_ROADMAP` (reducer 417) | 1129–1135 | ✅ COM-13 |
| 9.3 | **Bridge** (fixed grant event) | post **DField**, raise **DField**, ESOP-at-adoption `<select>` 10/15%, ESOP cap **DField** | `SET ['plan','bridge',k]`, `SET ['plan','esopStart'/'esopCap']` | 1137–1145 | ✅ COM-25 (baseline) / COM-12 |
| 9.4 | **Rounds** | **Add round** btn; per round: index, label `input`, **delete** (min 1) | `ADD_ROUND` (389), `DEL_ROUND` (396), label via `SET` | 1147–1157 | ✅ COM-12 |
| 9.5 | **Scenario paths** | **Add scenario** btn; per scenario: label `input`, **set base** / ★base toggle, exit/kept/FDV readout, **delete** (min 1); per round: post **DField** + ESOP **DField**; **TGE × DField** | `ADD_SCENARIO` (405), `DEL_SCENARIO` (411), `SET baseScenario`, `SET scenarios.*` | 1159–1187 | ✅ COM-12 |
| 9.6 | **TGE anchor** `<select>` (`roundList`), **Upside exit multiple** DField, **Show benchmarks** checkbox | `SET ['plan','tgeAnchor'/'exitMultiple'/'showBenchmarks']` | 1188–1192 | ✅ COM-12 (anchor/mult) — `showBenchmarks` toggle ⚠️ maybe COM-24/COM-21 |
| 9.7 | **TGE-multipliers-unvalidated** caution line | static | 1193 | ✅ (caveat, see §6a) |
| 9.8 | **Uniform base · tokens & pools** | base equity %, base token %, advisor token pool, committed (ecosystem), board bucket, token supply, **CoC acceleration**, equity vest yrs, **TGE date** | `SET ['plan',k]` / `baseGrant` | 1196–1209 | ✅ COM-24 (objectives+pools+uplift) — but **CoC %, vest yrs, TGE date, token supply** straddle COM-24/COM-23; under-spec |
| 9.9 | **Capital-introduced schedule** | per (usd), adds %base, cap %base, gate `<select>` | `SET ['plan','capitalUplift',k]` | 1211–1219 | ✅ COM-24 (uplift) |
| 9.10 | **Objectives** | **Add** btn; per row: label, category `<select>` (`CAT`), trigger, uplift **DField**, gate `<select>`, **delete** | `ADD_OBJ` (371), `DEL_OBJ` (372, also scrubs advisor refs), `SET objectives.*` | 1221–1235 | ✅ COM-24 |
| 9.11 | **Tiers** | **Add tier** btn; per tier: name, **delete** (min 1), multiplier **DField**, derived "= Equity" | `ADD_TIER` (373), `DEL_TIER` (374, reclamps advisor.tier), `SET tiers.*` | 1237–1247 | ✅ COM-23 |
| 9.12 | **Milestones** | **Add milestone** btn; per ms: index, label `input`, **delete** (min 1); gating note | `ADD_MS` (379), `DEL_MS` (380, reassigns dependent gates), label via `SET` | 1249–1261 | ✅ COM-23 |

### 9b. Reducer actions — complete list (lines 365–425) and ownership
| Action | Effect | Owner |
|---|---|---|
| `LOAD` | `reconcile(scenario)` — load/import/reset/paste | COM-11 (store) ✅ — scaffold has `loadState` |
| `SET` | path-set + structuredClone | COM-11 ✅ — scaffold has `setPath` |
| `ADD_ADV` / `DEL_ADV` | add/remove advisor (DEL nothing else) | COM-11 ✅ — scaffold has both |
| `ADD_OBJ` / `DEL_OBJ` | DEL also scrubs `achieved/targeted` refs across advisors | COM-24 ✅ |
| `ADD_TIER` / `DEL_TIER` | DEL clamps `advisor.tier`; min 1 | COM-23 ✅ |
| `ADD_MS` / `DEL_MS` | DEL reassigns `currentStage`, `capitalUplift.gate`, objective gates to first; min 1 | COM-23 ✅ — **cascade logic is load-bearing, not in issue text** ⚠️ |
| `ADD_ROUND` / `DEL_ROUND` | ADD seeds scenarios from last round (×1.5 post) or defaults; DEL deletes per-scenario round, fixes `tgeAnchor`, advisor `grantRound`→bridge; min 1 | COM-12 ✅ — **cascade logic under-spec** ⚠️ |
| `ADD_SCENARIO` / `DEL_SCENARIO` | ADD clones base scenario; DEL fixes `baseScenario`; min 1 | COM-12 ✅ |
| `SET_ROADMAP` | merge parsed CSV into bridge/esopStart/scenarios | COM-13 ✅ |

**Dynamic structural lists** (all add/remove/rename in Configure, all schema-dynamic in engine):
rounds (9.4), scenarios (9.5), tiers (9.11), milestones (9.12), advisors (4.1/header), objectives (9.10).
Acceptance criterion §7 of plan: "Every structural list is add/remove/rename in Configure" ✅ — all six present.

---

## 10. Persistence / share / print behaviours (cross-view)

| Behaviour | Implementation | Ref lines | COM coverage |
|---|---|---|---|
| **localStorage key** | `KEY = 'raiku-advisor-comp-v5'` (saves `{scenarios, last}` map, NOT raw state) | 432 | ⚠️ **mismatch**: scaffold `store.ts` uses same key but stores **raw `State`**, no `{scenarios,last}` wrapper, no named boards. COM-11 must reconcile schema |
| **`window.storage` backend** | preferred over localStorage when present (artifact host) | 429, 434–435 | ❌ not needed for static SPA — confirm dropped (artifact-only) |
| **base64 URL hash share** | scaffold only: `#s=` `btoa(encodeURIComponent(...))` — **NOT in reference** (reference uses clipboard Copy/Paste instead) | scaffold store 12, 46 | ⚠️ COM-11 / _CONTEXT "base64 URL hash" — this is a *new* feature vs reference, not parity |
| **copy-to-clipboard (full state)** | `io.copy(JSON.stringify(S))` | 461, 437 | ⚠️ COM-11 (clipboard) |
| **paste-from-clipboard** | `clipboard.readText` → `LOAD` | 462 | ❌ unowned |
| **JSON export / import** | `io.download` / `FileReader` | 459–460 | ⚠️ COM-11 |
| **board-summary CSV export** | `exportCSV()` (roster + company-cost rows; **distinct from roadmap CSV**) | 463–470 | ❌ unowned |
| **roadmap CSV import/export** | `parseRoadmapCSV` / `roadmapToCSV` | 1123–1124, engine 157/177 | ✅ COM-13 |
| **named multi-board save/load/delete** (`Mgr`) | `persist(name)`, `io.save({scenarios,last})` | 458, 514, 1280 | ❌ **entirely unowned** |
| **Print paths** | `window.print()` from: Package ("Print"), Board ("Board pack"), Proposition ("Print") | 810, 921, 1068 | ✅ COM-20 (proposition) + ⚠️ COM-31 (mobile+print) — Package/Board print not separately named |
| **Print CSS** | `@media print` (line 358): `body{background:#fff}`, `.no-print{display:none}`, `.print-area{box-shadow:none;border:none}`, `.print-only{display:block}`, `main{padding:0;max-width:none}`, `@page{margin:14mm}`; default `.print-only{display:none}` (359) | 358–359 | ⚠️ COM-31 — exact rules not itemised; **`.print-only` toggled in CSS but no element ever uses the class in JSX → dead rule** |

---

## 11. Benchmarks + their source strings (engine `BENCH`, lines 62–74)

| Benchmark | Value | Source string | Used in |
|---|---|---|---|
| Post-money medians | bridge 24M / A 79M / B 150M / C 300M | "Carta State of Pre-Seed 2025 · ValueAdd VC 2025 round benchmarks" | ValuationStaircase (Median bars) |
| FDV caution | $1B | "Memento Research / The Defiant; MEXC — 2025 TGE performance" | UpsideCurve token caution band, Footer |
| FAST advisor equity bands | standard .15–.25% / strategic .30–.50% / expert .60–1.00% | (band labels: ~5/10/20 hrs/mo) | EquityBenchmark, Overview benchmark |
| Advisor pool | 5% | "Founder Institute FAST matrix; ~5% advisory-pool norm (2025)" | Overview, EquityBenchmark, PoolAllocation note |

Toggle: `plan.showBenchmarks` gates Median bars, $1B band, and benchmark captions. COM coverage of the
benchmark **source strings** is ⚠️ — COM-26 (staircase) and COM-14 (Overview) render them but no issue
calls out preserving the exact attribution text.

---

## 12. GAP TABLE (the graded verdict) — every reference feature → issue

### 12a. ❌ UNOWNED — no COM issue covers these (must add scope)
| Feature | Where | Why it matters |
|---|---|---|
| **Named multi-board save/load/delete (`Mgr` + `{scenarios,last}` IO)** | App header "Saved", lines 514, 1280, 458 | A whole persistence subsystem (save many named boards, switch between them). COM-11 only covers single-state localStorage + URL. **Biggest gap.** |
| **Board-summary CSV export** (`exportCSV`) | header "CSV", 463–470 | Distinct deliverable from roadmap CSV (COM-13). Exports roster + company-cost. |
| **Paste-state-from-clipboard** | header "Paste", 462 | Reference's actual share-in mechanism. |
| **DilutionPath mini-chart** | Package detail, 770–791, 891 | A named visual in the hero; M3 issue list (COM-17/27/28/29) omits it. |
| **Header budget/storage Banners** | 499–500 | Global alert surface; Board-scoped warnings (COM-15/26) ≠ header banner. |
| **Section-numbering fix** (two "Section I") | passim | Reference bug to resolve during port; unowned. |

### 12b. 🔀 MIS-MAPPED — issue references a wrong/absent component
| Issue claim | Reality in reference | Fix |
|---|---|---|
| Plan §5 Board "comparison (grouped bar)" → implies grouped bar lives in **Board** | The grouped comparison bar is in **Compare** (`CompareTab` 1029), not Board. Board's third chart is the **per-advisor range** football-field (CSS). | Re-map: COM-19 owns the grouped bar (Compare); COM-15/26 own Board's per-advisor range. Don't build a grouped bar in Board. |
| Plan §5 Advisors lists "**token-FDV (line)**" as a separate chart | Token-FDV line is the **right half of `UpsideCurve`** (LineChart at 723–737, within 666–747), not a standalone component | COM-28 already owns UpsideCurve (both halves) — ensure COM-28 scope includes the token sub-chart; don't spawn a separate token-line component. |
| Plan §5 + §6 disagree on **ValuationStaircase**: §5 "staircase (bar)" vs §6 risk "custom SVG (no waterfall)" | Reference staircase is a **recharts grouped bar** (Raiku vs Median) — a *bar*, not a stepped SVG. The "no native waterfall / staircase" risk conflates it with the waterfall. | COM-26: build staircase as a **bar** (frappe-charts grouped bar works); reserve custom-SVG (COM-27) for **GrowthWaterfall + PotentialScatter** only. |
| `_CONTEXT` "base64 URL hash" framed as parity | Reference has **no URL-hash share**; it uses clipboard Copy/Paste. URL hash is a *new* scaffold-only feature. | COM-11: treat URL-share as enhancement, and **also** port clipboard Copy/Paste (the actual reference behaviour). |

### 12c. ⚠️ UNDER-SPECIFIED — issue exists but omits load-bearing detail
| Feature | Owning issue | Missing detail |
|---|---|---|
| `NumIn` / `DField` inline click-to-edit numeric primitives (5 formats, clamp, Enter/Escape) | COM-18 / COM-25 | The editor primitive itself — every Configure + Package number depends on it. |
| Reducer **cascade logic** (`DEL_MS` reassigns gates; `DEL_ROUND` fixes tgeAnchor + advisor grantRound; `DEL_TIER` clamps tier; `DEL_OBJ` scrubs advisor refs) | COM-12 / COM-23 / COM-24 | Issues say "add/remove" but not the referential-integrity fixups. Skipping these corrupts state. |
| Legal/caveat clauses (s431/409A by residency, RTA, deed of adherence, net exercise, non-voting, CoC-discretion, HMRC SAV, 9-yr backstop, consents, Bad-Leaver) | COM-20 (+ Footer unowned) | None enumerated as acceptance criteria — easy to drop in port. (Full list §6a.) |
| Benchmark **source attribution strings** | COM-26 / COM-14 | Exact Carta/Memento/Founder-Institute citations must survive. |
| `PotentialStrip`, `ContextStrip`, `StageBadge`, `EquityBenchmark`, `ChipRow`, `EmptyState` shared widgets | COM-17/18/29 (implied) | Named widgets not itemised; risk of omission. |
| Board **per-advisor scenario-range** football field (multi-row) vs single-advisor FootballField | COM-15/26 vs COM-29 | Two different components share the name "football field"; ensure both built. |
| localStorage **schema** (`{scenarios,last}` vs raw State) | COM-11 | Scaffold currently mismatches reference shape (see §10 row 1). |
| Print CSS exact rules + `.print-only` unused class | COM-31 | Rules not itemised; `.print-only` defined but unused (dead). |
| `showBenchmarks` toggle, `cocAccelPct`, vest years/cliffs, `tgeDate`, `tokenSupply` config fields | COM-24/COM-23 | Straddle issue boundaries; ensure each field lands somewhere. |

### 12d. ✅ CLEANLY COVERED (representative — not exhaustive)
Overview KPIs/roster/pool/benchmark (COM-14); Board table + company cost + pool (COM-15); staircase +
scatter (COM-26); Advisors profile/tier/performance controls (COM-18/COM-30); waterfall (COM-17/27);
upside curve (COM-28); vesting/football/mix/instruments (COM-29); Compare matrix + grouped bar (COM-19);
Proposition doc + print + copy (COM-20); Configure rounds/scenarios/tiers/milestones/objectives/pools +
roadmap CSV (COM-12/23/24/13/25); engine reuse + store core mutations (COM-10/11).

---

## 13. Net verdict
The plan's view→component map is **directionally correct and ~85% complete**, but four classes of
problems will bite at build time: (1) an **entire unowned persistence subsystem** (named multi-board
`Mgr` + `{scenarios,last}` IO + board-CSV + paste), (2) the **staircase-vs-waterfall SVG mis-mapping**
(staircase is a bar; only waterfall+scatter need custom SVG), (3) **reducer cascade integrity** treated
as trivial "add/remove" when it carries referential-integrity logic, and (4) the **legal caveat corpus**
(s431/409A/RTA/deed/net-exercise/non-voting/CoC-discretion/HMRC-SAV/consents) with no acceptance
criteria. `DilutionPath`, header banners, and the Board per-advisor range are smaller omissions. The
localStorage schema in the current scaffold already diverges from the reference shape.
