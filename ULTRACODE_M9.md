# ULTRACODE_M9 — Advisor Comp Studio: M9 build-run prompt (ultracode + /loop + /goal, Claude Code **desktop app**)

> **What this is.** A continuous-**goal** run-prompt for implementing the **M9 · UX/UI v2** milestone
> (**COM-73 → COM-138**, 66 issues) in the Claude Code **desktop app**, issue-by-issue, with a strict
> per-issue Definition-of-Done and **a human (Robin) as the sole merge actor**. It's grounded in a verified
> June-2026 Claude Code feature review (CLI ≥ v2.1.166, Opus 4.8).
>
> **How the three mechanics divide labour** (this is the whole design):
> - **`/goal`** = the per-issue driver. One `/goal` per COM issue; it keeps taking turns until the issue's
>   DoD is met **and Claude has STOPPED at the merge gate**. The evaluator reads the *transcript only* — it
>   runs nothing — so every DoD condition must be an **observable fact Claude prints into the transcript**.
> - **`/loop`** = a **read-only** background poller for preview/CI status. Never put a mutating action in it.
> - **`ultracode` / Workflows** = opt-in **cross-issue batch verification** only (sweeps, not edits). On the
>   desktop Code tab the `ultracode` keyword is currently broken (GH #65206) — **trigger via natural language**
>   ("use a workflow to …") or set effort from a CLI session.
>
> Standing rules live in **`CLAUDE.md`**; the build loop + commands in **`DEV_WORKFLOW.md`**; the cross-session
> log in **`memory.md`** (read the latest entry first). The backlog is the **M9** milestone in Linear (COM).

---

## 0. Read first
- **`memory.md`** (latest entry: *"M9 review … 66-issue milestone"*) — current state, the 66 issues, the flagged
  decisions, and the branch reality.
- **`CLAUDE.md`** — locked stack, frozen engine, confidential/net-of-strike, ≤450-LOC/issue, the per-issue DoD.
- **Linear → COM → milestone `M9 · UX/UI v2`** (id `308fd627-11a5-4893-a19f-28104bc001de`) — the 66 issues with
  Problem/Fix/surfaces/theme/lens/effort. Read the issue you're about to build in full.
- **`reference/advisor-comp-studio.tsx`** — the UX/behaviour/legal/IA source of truth (visual = Espresso).

---

## 1. Pre-flight (operator does this **once**, before the march)
1. **Versions/model:** `claude --version` ≥ v2.1.166 · `/model` = **Opus 4.8** · `/config` → **Dynamic workflows ON**.
   Optional for a multi-hour run: set `fallbackModel` (survives rate limits) and enable PushNotification ("ping me
   when an issue is ready to merge").
2. **Permission mode:** `/config` → **Auto-accept-edits** (speeds Write/Edit) — but **keep shell prompting ON** so
   any `git`/deploy command surfaces to you. (Workflows always run in acceptEdits regardless — see §6.)
3. **Preview gate (`.claude/launch.json`)** — point it at the **stable** preview path for this repo
   (the `:5173` dev server crashes under the preview MCP; `vite preview` over `dist` at **:4173** is stable):
   ```jsonc
   // .claude/launch.json
   { "configurations": [
     { "name": "comp-studio", "request": "launch", "type": "node",
       "command": "sh -c 'cd scaffold && npm run build && npm run preview -- --port 4173 --strictPort'",
       "url": "http://localhost:4173" }
   ] }
   ```
   Per-issue visual pass = `( cd scaffold && npm run build )` → reload :4173 → `preview_screenshot` / `preview_eval`.
   If `/verify` can't infer the app, run `/run-skill-generator` once to capture the Vite recipe.
4. **Recurring guardrails (`.claude/loop.md`)** — commit so every resumed/parallel session inherits the checklist:
   ```md
   # Project loop checklist (M9)
   1. `vp check` must be clean for the issue's diff (engine.ts + *.d.ts warnings are pre-existing/expected).
   2. If `node scaffold/engine.test.mjs` or `node engine/engine.test.mjs` ≠ 22/22 → STOP, the engine is frozen.
   3. If a changed view diverges from `reference/advisor-comp-studio.tsx` → screenshot (:4173) + note it.
   4. NEVER auto-merge / push to a deploy branch (`main`, `frosty`). Robin merges.
   ```
5. **The hard merge gate — a `PreToolUse` hook (this is the load-bearing safety, not CLAUDE.md).**
   CLAUDE.md is *advisory*; only a hook can stop an over-eager `/goal` from merging. Add via the `/update-config`
   skill (or `settings.json`). Deny, defense-in-depth:
   - permission **deny-rules** (v2.1.166 globs): `Bash(git push *main*)`, `Bash(git push *frosty*)`,
     `Bash(git merge *)`, `Bash(* --no-verify*)`, `Bash(vercel * --prod*)`.
   - plus a `PreToolUse`/`Bash` hook that `exit 2`s (blocks) when the command matches
     `git push.*(main|frosty)`, `git merge`, `--no-verify`, or a prod deploy — and prints "🚫 merge gate: ask Robin".
   **Test the hook before trusting it** (a buggy hook logs but doesn't block): try `git push origin HEAD:main` and
   confirm it's denied.
6. **Confirm the branch/deploy reality with Robin** (it's in flux — see §3): which branch M9 PRs integrate into,
   and whether Vercel prod is still `frosty` or repointed to `main`.

---

## 2. Locked non-negotiables (mirror of CLAUDE.md — keep these in working memory every issue)
- **Engine FROZEN** — `scaffold/src/engine.ts` + `engine/engine.ts` (both **22/22**). Money is computed only there;
  views never recompute money inline. *Type-only* tweaks are allowed (the two PD2 issues add optional fields);
  **no logic changes**. COM-87 (engine RFC) is **DO NOT BUILD** without Robin's explicit sign-off.
- **Stack PINNED** — frappe-ui **0.1.278 exact**, frappe-charts **1.6.2** (no css; scatter = custom SVG),
  vue ^3.5, vue-router ^4, tailwind ^3.4 (ESM), ts ^5. **Never `app.use(FrappeUI)`**; the frappe-ui **data layer**
  (createResource/useList/useDoc/useCall/frappeRequest/call/initSocket) is **out of scope**. No casual new deps.
- **Confidential, net-of-strike, "discussion draft, not a binding offer."** The legal corpus + benchmark strings
  are **verbatim** — never reword.
- **≤ 450 LOC per COM issue · one issue = one PR linking it (`Fixes COM-NNN`) · tests ship with logic · QA gate
  green before merge.** Append `memory.md` at the end of each issue.
- **Robin is the sole merge actor.** STOP and ask before any merge to a deploy branch.

---

## 3. The goal + sequence
**Goal:** drive **M9 (COM-73 → COM-138)** to Done, one issue at a time, each landing as a PR that closes its issue,
with Robin merging. Backlog themes: per-advisor package editing (PD1), per-advisor scenario projection (PD2),
clean layout & IA (PD3), frappe-ui component adoption, design tokens & theming, visual-system/anti-slop, charts,
editorial/copy, responsive/print/empty hardening.

**Get these decisions from Robin BEFORE building the affected issues:**
- **COM-87** — ENGINE RFC (per-advisor roadmap overrides). Flagged *do-not-assume*; recommend **defer**. Don't touch.
- **COM-104 / COM-105 / COM-96** — adopt-vs-keep-custom for the frappe-ui **Sidebar / CommandPalette / ListView**
  (each documents the trade-off; needs a go/no-go + the mobile-drawer behaviour call before the L-sized rebuild).
- **COM-121** — Fraunces + IBM-Plex typography tension (a decision pack: keep/refine/replace; ship only the safe
  side — drop uppercase group labels, kill the unused IBM-Plex webfont — without Robin's call on the rest).
- **COM-110** — the now-dead `[data-theme=dark]` branch: keep-dormant-and-documented vs descope. (COM-124 gates on it.)

**Recommended order (cheap, high-value, low-risk first):**
1. **Quick decision-grade wins:** COM-97 (right-align numerics) · COM-98 (freeze identity column) ·
   COM-123 (full-precision Compare bar) · COM-109 (`color-scheme`) · COM-132/126 (glossary + eyebrow copy).
2. **PD1 spine:** COM-73 (consolidate the package; move `upliftStartMonth` in) → COM-74 (dirty/Revert) →
   COM-77 (FormControl description/error) → COM-75 → COM-76.
3. **PD2:** COM-82 (additive state spine — type-only on engine + reconcile cascades) → COM-81 (per-advisor case
   override) → COM-83/85/86 → COM-84.
4. **Clean layout & frappe-ui adoption clusters:** COM-88/89/90/95, then the component-adoption set (gated calls
   first), then the visual-system/anti-slop set (COM-113→119, sequencing 116→117 last), charts, editorial, hardening.
5. **Defer:** COM-87 (engine RFC) until/unless Robin approves it as a separate engine change.

**Branch/deploy (confirm in pre-flight #6):** prod currently deploys from **`frosty`** (`5e5e3ec` live); **`main`**
now exists and is current but is **not** yet the repo default nor the Vercel prod branch. **Default working
assumption (override on Robin's word):** branch each issue `claude/com-NNN-*` off **`main`**, open a PR into
`main` (`Fixes COM-NNN`), Robin reviews the Vercel **preview** and merges; the milestone-gate merge to the prod
branch (`frosty`, or `main` once Robin repoints Vercel) is Robin's call. The merge-gate hook blocks pushing/merging
to **both** `main` and `frosty` regardless.

---

## 4. The per-issue DoD `/goal` (paste one per issue; advance the human gate between issues)

First, **Plan Mode** (Shift+Tab ×2): outline the change for COM-NNN and the files it touches (cheap approach review).
Then set the goal (conditions must be **transcript-observable** — print command output; the evaluator runs nothing):

```
/goal  COM-NNN is implementation-complete — ALL of:
  (a) I set the Linear issue COM-NNN to In Progress;
  (b) `vp check` output is in this transcript and is clean for this diff
      (engine.ts + generated *.d.ts warnings are pre-existing/expected);
  (c) `node scaffold/engine.test.mjs` AND `node engine/engine.test.mjs` output in-transcript both show 22/22;
  (d) `( cd scaffold && npm run build )` printed exit 0 in-transcript;
  (e) I rebuilt + reloaded the :4173 preview and pasted a screenshot of the changed surface, and it matches
      reference/advisor-comp-studio.tsx (behaviour/labels/legal) — note any deliberate Espresso divergence;
  (f) `/code-review high --fix` has run and findings are resolved; if this touches confidential/legal copy or
      the engine boundary, `/security-review` has run clean;
  (g) the diff is ≤450 LOC, scoped to COM-NNN only, touches NO engine logic, no app.use(FrappeUI), no data layer;
  (h) I appended a dated memory.md entry and committed it;
  (i) I opened a PR into the integration branch titled to close it (`Fixes COM-NNN`) — and then I STOPPED and
      asked Robin to review the preview + merge. I did NOT merge.
  Or stop after ~25 turns and report exactly what's blocking.
```

Notes baked into the loop: revert generated churn (`scaffold/package-lock.json scaffold/components.d.ts
scaffold/auto-imports.d.ts`) before each commit; after `vp check --fix`, **revert `engine.ts` + `*.d.ts`**
(`.prettierignore` covers them; ~11 advisory frozen-engine warnings are expected). Git/`gh` need
`dangerouslyDisableSandbox: true` + `git -c core.fsmonitor=false …` (the sandbox denies `engine/engine.ts` reads,
so the root engine test also needs sandbox off). Commit footer:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. Linear flips to **Done** automatically via
the `Fixes COM-NNN` keyword on merge.

---

## 5. Background polling (`/loop`) — start once, read-only
```
/loop 3m  If a Vercel preview deploy or a PR check for the current issue is in flight, report its status only.
          Do NOT commit, merge, deploy, or edit. If nothing is in flight, say "idle" and do nothing.
```
Fixed interval (predictable on desktop; self-paced loops behave differently there). **Guard every loop prompt with
"if … then report only"** — ScheduleWakeup re-runs the whole prompt each fire (GH #54086), so any side effect would
repeat. Session-scoped; expires in 7 days; `Esc` to stop. It runs *orthogonally* to the `/goal` march — never the driver.

---

## 6. ultracode / Workflows — opt-in **batch verification** (not the issue driver)
Each COM issue is a small (≤450 LOC) single-area edit — a workflow is overkill there and burns 10–100× tokens.
Reserve multi-agent orchestration for **cross-issue sweeps** where ≥N-way parallelism genuinely helps. On desktop,
invoke in **natural language** (the keyword is broken on the Code tab):

- *"Use a workflow to screenshot every view changed in this milestone and run a **completeness-critic** vs the
  reference artifact — report any surface that diverges or any file that touched `engine/engine.ts`."*
- *"Use a workflow: **adversarially verify** (3 skeptics, 2/3 must agree) that the last 5 merged issues kept the
  engine frozen, stayed ≤450 LOC, and introduced no `app.use(FrappeUI)` / data-layer call."*
- *"**Loop-until-dry** a11y/contrast sweep across all changed views; stop after 2 empty rounds."*

Watch spend + progress in the **`/workflows`** panel (Enter drill · p pause · x stop · **s save as a `/`-command**).
**Caveat:** workflow agents edit in **acceptEdits** regardless of your permission mode — the merge-block hook still
holds (it blocks the *merge*, not edits), but scope each workflow tightly and test on a one-view slice first. Resume
is **same-session only**; closing the app loses in-flight workflow/loop state.

---

## 7. Human gates (defense in depth)
1. **Hook (hard):** `PreToolUse` denies merge / push-to-`main`|`frosty` / `--no-verify` / prod deploy — unbypassable.
2. **Goal condition (soft):** every `/goal` ends at *"STOPPED and asked Robin to merge."*
3. **Permission mode:** shell still prompts → a merge attempt surfaces to you.
4. **Plan Mode** per issue → cheap approach review before any edit.
5. **Side chat (Cmd+;)** → steer mid-march without polluting the `/goal` transcript (note: the main session won't
   see side-chat replies — re-state any decision in the main thread).
6. **`spawn_task` chips** → flag out-of-scope finds (dead code, a real TODO, a security smell) as a background task
   instead of bloating the current issue's PR (keeps the ≤450-LOC / one-issue-one-PR discipline).

---

## 8. Gotchas (desktop-specific, from the verified review)
- **ultracode keyword doesn't trigger on the desktop Code tab** (GH #65206) → use natural language, or set
  `/effort ultracode` from a CLI session and continue in desktop. `/effort xhigh` ≠ ultracode (xhigh = deep
  reasoning, no auto-workflow) — fine for hard single-file issues.
- **`/goal` evaluator runs nothing** — if a condition references a test/build/screenshot, Claude must surface that
  output **into the transcript** first, or the evaluator can't confirm it. One goal per session; bound with "or stop
  after N turns."
- **Preview MCP interactivity is desktop-only**; build→`:4173` preview→reload is the stable path here (NOT `:5173`).
  Screenshots of tall scrolled pages can come back black — resize viewport tall + capture at scroll 0; the preview
  server can drop mid-session (restart it).
- **`/loop`** — fixed interval on desktop; read-only + guarded; 7-day expiry; no catch-up for missed fires.
- **CLAUDE.md is advisory** (and nested CLAUDE.md doesn't reload after `/compact`) — the merge gate **must** be the
  hook; path-scoped rules belong in `.claude/rules/`.

---

## 9. Kickoff (paste after pre-flight §1 is done)
```
Read memory.md (latest entry) + CLAUDE.md + the COM-97 issue. We're starting M9. Confirm: integration branch for
M9 PRs, and whether Vercel prod is still `frosty` or repointed to `main`. Then start COM-97 with Plan Mode, and run
the per-issue /goal from ULTRACODE_M9.md §4. Remember: engine frozen, ≤450 LOC, no data layer, STOP at the merge
gate — I merge. Start the §5 background /loop too.
```

— Authored 2026-06-09 from a verified Claude Code feature review (CLI ≥ v2.1.166, Opus 4.8, desktop app). Treat
ultracode/workflows as an opt-in batch tool, `/goal` as the per-issue driver, `/loop` as a read-only poller, and the
`PreToolUse` hook as the only thing that truly stops a merge. No prod merge without Robin's explicit call.
