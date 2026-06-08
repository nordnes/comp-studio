# memory.md — Advisor Comp Studio running log

> Durable, cross-session memory for agents working this repo. **Append a dated entry at the end of each
> issue/milestone** (what you built, decisions, surprises, next step). Newest at the bottom. Keep it honest
> and concise — this is what the next session reads to get oriented. Standing rules live in `CLAUDE.md`.

---

## 2026-06-08 — Phase 0 (plan hardening) + frappe-ui adoption decision

**State: pre-implementation. Scaffold wired + build-green; no feature views built yet.**

- **Research/hardening done.** Empirically verified the stack in a throwaway sandbox; evidence in
  `research/FINDINGS.md` (+ lane files `A`–`D`, `EMPIRICAL.md`, screenshots). Engine is frozen + **22/22**.
- **Decision (Robin, post-gate): ADOPT `frappe-ui` as-is (Espresso/Inter)** for clean, consistent UI/UX via
  Frappe UI templates. This overrides the Phase-0 recommendation to hand-roll (FINDINGS D2/D3 → see D17/D18).
- **Scaffold re-wired for frappe-ui and verified:** `frappe-ui@0.1.278` + `frappe-charts@1.6.2` installed;
  `vite.config.ts` uses `frappeui({frappeProxy:false,jinjaBootData:false,buildConfig:false})` + `vue()` +
  `optimizeDeps:{include:['feather-icons']}`; ESM `tailwind.config.js` with the `frappe-ui/tailwind` preset
  (stale `tailwind.config.cjs` removed); `main.ts` imports `frappe-ui/style.css` and does **NOT**
  `app.use(FrappeUI)`; `style.css` de-duped (no double `@tailwind`). `npm run build` ✓ green; engine 22/22.
- **Charts decision (unchanged):** `frappe-charts` (corrected bare import, no css) + custom SVG for
  waterfall/scatter/football/vesting/DilutionPath. `frappe-charts` scatter is **not implemented** in 1.6.2.
- **Open product decisions (unresolved — for Robin / first implementer):** see `CLAUDE.md` "Open product
  decisions" / `research/FINDINGS.md` §9 — named multi-board `Mgr` ([COM-32]) port-vs-descope, localStorage
  schema, share mechanism, staircase bar-vs-step, section numbering.

**Next step:** start **M0** per `ULTRACODE_PROMPT.md` — COM-8 (verify the wired scaffold green) → COM-10
(engine + spec) → COM-11 (store: reducer parity + delete cascades + persistence/share) → COM-9 (first Vercel
preview). Then M1 (Configure) onward. Build views with frappe-ui components + the `frappe-ui` Skill.

<!-- Append new entries below this line -->
