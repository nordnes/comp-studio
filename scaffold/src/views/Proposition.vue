<script setup lang="ts">
// Proposition (Section V) — the print-ready advisor doc. Legal-dense: the caveat corpus is ported
// verbatim (non-voting shares, RTA, deed of adherence, net exercise, the v9 no-CoC-acceleration
// position [COM-139/Δ4 — Plan v9 supersedes the reference TSX on that line], s431/409A by
// residency, HMRC SAV, 9-yr/90-day backstop, investor consents). propText() = plain-text clipboard.
import { computed } from "vue";
import { Avatar, Badge, Button, Divider } from "frappe-ui";
import { useStudio } from "../store";
import {
  fUSD,
  fPct,
  fNum,
  fMult,
  fDate,
  baseScenKey,
  roundLabel,
  FUNDING_ROUND_CARVEOUT,
} from "../engine";
import { CONFIDENTIAL_EYEBROW } from "../constants";
import { grantPreconditions } from "../governance";
import AdvisorPicker from "../components/AdvisorPicker.vue";
import ExitSlider from "../components/ExitSlider.vue";
import Term from "../components/Term.vue";
import EmptyState from "../components/EmptyState.vue";
import PageHeader from "../components/PageHeader.vue";

const { store, selected, flash, addAdvisor, snapshotProposition, removeProposition } = useStudio();
const S = computed(() => store.S);
const sel = computed(() => selected.value?.a);
const c = computed(() => selected.value?.c);
// COM-164 (Δ12): the version register — figures FROZEN at snapshot; the delta line compares the
// live computed base against each sent version (current minus sent).
const versions = computed(() => ((sel.value as any)?.propositions || []) as any[]);
// COM-167: the watermark gate (O13 / success criterion #6)
const precond = computed(() => grantPreconditions(sel.value as any, store.gov));
const sb = computed(() => c.value?.base);
const ms = computed(() => Object.fromEntries(S.value.plan.milestones.map((m) => [m.id, m.label])));
const shown = computed(() => {
  const perf = sel.value?.performance || { achieved: [], targeted: [] };
  return S.value.objectives.filter(
    (o) => perf.achieved?.includes(o.id) || perf.targeted?.includes(o.id),
  );
});

function propText(): string {
  const a = sel.value!,
    cc = c.value!,
    b = sb.value!,
    plan = S.value.plan;
  return [
    `RAIKU LABS — ADVISORY ENGAGEMENT PROPOSITION`,
    `${CONFIDENTIAL_EYEBROW} · ${a.name}`,
    a.sector,
    "",
    `BASE (guaranteed): ${fUSD(cc.baseCaseBase)} net at base case`,
    `  Equity: ${fPct(cc.baseEq, 3)} — ${fNum(cc.baseEq * b.grantN)} options at $${cc.strikePps.toFixed(2)} (net of strike), granted at the bridge, ${plan.equityVestYears}yr/${plan.equityCliff}mo.`,
    `  Tokens: ${fPct(cc.baseTk, 3)} of supply (RTA), valued at TGE FDV (${fMult(plan.scenarios[baseScenKey(plan)].tgeMult)}× ${roundLabel(plan, plan.tgeAnchor)} = ${fUSD(b.fdv)} base).`,
    a.hasCash ? `  Cash: ${fUSD(a.cashAnnual)}/yr post-Series A.` : "",
    "",
    `PERFORMANCE UPLIFT (counts once its gate is reached):`,
    `  Capital: ${fUSD(plan.capitalUplift.per)} introduced adds +${(plan.capitalUplift.pct * 100).toFixed(0)}% of base.`,
    ...shown.value.map(
      (o) =>
        `  ${o.label}: +${(o.uplift * 100).toFixed(0)}% — ${o.trigger} (gate: ${ms.value[o.gate]}).`,
    ),
    `  Earned: +${(cc.earnedUplift * 100).toFixed(0)}% · ceiling +${(cc.ceilUplift * 100).toFixed(0)}%.`,
    "",
    `Net value by scenario: ${cc.scen.map((s: any) => `${s.label} ${fUSD(s.total)}`).join(" · ")}.`,
    targetLine.value,
    `Equity is options struck at the bridge price; values net of exercise cost and dilution through future rounds. A discussion draft, not a binding offer.`,
  ]
    .filter(Boolean)
    .join("\n");
}
async function copyProp() {
  try {
    await navigator.clipboard.writeText(propText());
    flash("Copied");
  } catch {
    flash("Clipboard blocked");
  }
}
function print() {
  window.print();
}

const residencyLine = computed(() =>
  sel.value?.taxResidency === "UK"
    ? "As a UK grantee, a s431 election is required within 14 days of exercise (restricted securities)."
    : sel.value?.taxResidency === "US"
      ? "As a US grantee, s83(b)/409A treatment applies."
      : "Tax treatment depends on residency.",
);

// COM-84: the advisor's target outcome for the printed doc — mirrors ExitSlider's lerp over the
// engine's per-scenario exports (no new money math); defaults to the base case when no target is set.
const targetView = computed(() => {
  const s = [...(c.value?.scen || [])].sort((a: any, b: any) => a.exitVal - b.exitVal);
  const base = c.value?.base;
  if (!s.length || !base) return { exitVal: 0, total: 0 };
  const t = (sel.value as any)?.targetExit;
  if (t == null) {
    const row = s.find((x: any) => x.key === base.key) || s[0];
    return { exitVal: row.exitVal, total: row.total };
  }
  if (t <= s[0].exitVal) return { exitVal: s[0].exitVal, total: s[0].total };
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i],
      b = s[i + 1];
    if (t <= b.exitVal) {
      const f = b.exitVal > a.exitVal ? (t - a.exitVal) / (b.exitVal - a.exitVal) : 0;
      return { exitVal: t, total: a.total + (b.total - a.total) * f };
    }
  }
  return { exitVal: s[s.length - 1].exitVal, total: s[s.length - 1].total };
});
const targetLine = computed(
  () =>
    `At a ~${fUSD(targetView.value.exitVal)} exit, this package is worth ~${fUSD(targetView.value.total)} net — net of strike & dilution · not a forecast.`,
);
</script>

<template>
  <!-- COM-133: the shared teaching empty state replaces the bare one-liner -->
  <EmptyState
    v-if="!sel || !c"
    icon="lucide-file-text"
    title="No advisor to propose to yet."
    body="Add an advisor and the proposition letter builds itself from their live package — net of strike, ready to print."
  >
    <Button
      variant="solid"
      theme="gray"
      icon-left="lucide-plus"
      label="Add advisor"
      class="mt-2"
      @click="addAdvisor"
    />
  </EmptyState>
  <div v-else class="mx-auto w-full max-w-reading px-3 sm:px-5 space-y-8">
    <!-- COM-127: the shared editorial PageHeader (screen chrome only — no-print keeps the printed
         letter to its own masthead). Print is the page's ONE primary; Copy demotes to ghost. -->
    <div class="no-print">
      <PageHeader title="The proposition.">
        <template #actions>
          <AdvisorPicker />
          <Button
            variant="solid"
            theme="gray"
            icon-left="lucide-printer"
            label="Print"
            @click="print"
          />
          <Button
            variant="ghost"
            theme="gray"
            icon-left="lucide-copy"
            label="Copy"
            @click="copyProp"
          />
          <Button
            variant="ghost"
            theme="gray"
            icon-left="lucide-git-commit-horizontal"
            :label="`Save v${(versions[versions.length - 1]?.version || 0) + 1}`"
            title="Snapshot this proposition as the next sent version (Δ12 — the straw-man artefact)"
            @click="snapshotProposition(sel.id)"
          />
        </template>
      </PageHeader>
    </div>

    <!-- COM-164 (Δ12): the version register — what was SENT, frozen; the negotiation's audit
         trail. Screen chrome only (no-print: the letter stays clean). -->
    <div v-if="versions.length" class="no-print">
      <div class="section-label mb-2">Proposition versions · the straw-man trail</div>
      <div class="divide-y divide-outline-gray-1 text-sm">
        <div v-for="v in versions" :key="v.id" class="py-2 flex items-center gap-3 flex-wrap">
          <Badge theme="gray" variant="subtle">v{{ v.version }}</Badge>
          <span class="tabular-nums text-ink-gray-9 w-24 shrink-0">{{ fDate(v.atISO) }}</span>
          <span class="tabular-nums text-p-xs text-ink-gray-7">
            {{ fUSD(v.figures.baseCaseTotal) }} base · {{ fUSD(v.figures.baseCaseCeil) }} ceiling ·
            {{ fPct(v.figures.eqPct, 2) }} eq · {{ fPct(v.figures.tkPct, 2) }} tok
          </span>
          <span
            class="tabular-nums text-p-xs"
            :class="
              c.baseCaseTotal - v.figures.baseCaseTotal >= 0 ? 'text-ink-green-3' : 'text-ink-red-3'
            "
          >
            {{ c.baseCaseTotal - v.figures.baseCaseTotal >= 0 ? "+" : ""
            }}{{ fUSD(c.baseCaseTotal - v.figures.baseCaseTotal) }} vs current
          </span>
          <span v-if="v.note" class="text-p-xs text-ink-gray-6">{{ v.note }}</span>
          <button
            aria-label="Remove proposition version"
            class="ml-auto inline-flex shrink-0 items-center justify-center size-7 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
            @click="removeProposition(sel.id, v.id)"
          >
            <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p class="text-p-xs text-ink-gray-6 mt-1">
        Figures are frozen at send time — the plan keeps moving under a live negotiation, so each
        version records exactly what went out (and the delta shows how far the live package has
        drifted since).
      </p>
    </div>

    <!-- COM-47: exit-valuation explorer (no-print) — lets the recipient feel the upside on screen.
         COM-84: it now persists the chosen exit (sel.targetExit); the DOCUMENT carries its own
         target-outcome sentence below, so the component's print line is suppressed here. -->
    <ExitSlider :c="c" :sel="sel" :print-line="false" tone="quiet" />

    <div class="print-area bg-surface-white rounded border border-outline-gray-2 relative">
      <!-- COM-167 (success criterion #6): the letter can always be printed, but it carries the
           watermark until every gating pre-condition is GREEN — on screen AND in print. The
           diagonal repeats so any cropped screenshot still shows it; the banner names what is
           outstanding. aria-hidden on the decoration; the banner is the accessible text. -->
      <template v-if="!precond.ok">
        <div
          class="pointer-events-none absolute inset-0 overflow-hidden select-none"
          aria-hidden="true"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="absolute left-1/2 w-[140%] -translate-x-1/2 -rotate-[24deg] text-center font-display text-3xl uppercase tracking-[0.35em] text-ink-amber-strong opacity-[0.13]"
            :style="{ top: `${i * 26 - 8}%` }"
          >
            Pre-conditions outstanding
          </div>
        </div>
        <div
          class="px-8 sm:px-12 py-2.5 border-b border-outline-amber-2 bg-surface-amber-1 text-p-xs text-ink-amber-strong"
        >
          Watermarked — pre-conditions outstanding: {{ precond.outstanding.join(" · ") }}. The
          watermark lifts when the Governance register is green and checks clear.
        </div>
      </template>
      <div class="px-8 sm:px-12 py-10 border-b border-outline-gray-1">
        <div class="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div class="text-sm text-ink-gray-6">{{ CONFIDENTIAL_EYEBROW }}</div>
            <div class="font-display text-2xl mt-2 text-ink-gray-9">Raiku Labs</div>
            <div class="text-sm mt-1 text-ink-gray-6">Advisory Engagement Proposition</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-ink-gray-6">Prepared for</div>
            <div class="flex items-center justify-end gap-2 mt-2">
              <Avatar :label="sel.name" size="sm" />
              <span class="font-display text-xl text-ink-gray-9">{{ sel.name }}</span>
            </div>
            <div class="text-p-xs mt-1 max-w-xs text-ink-gray-6">{{ sel.sector }}</div>
          </div>
        </div>
      </div>

      <div class="px-8 sm:px-12 py-12 space-y-12">
        <div class="max-w-3xl">
          <div class="text-sm text-ink-amber-strong mb-6">
            An invitation to the founding advisory board
          </div>
          <!-- COM-116: .figure-lg with the fluid clamp + display leading kept as the inline override
               (figure utilities set line-height:1, right for numbers, too tight for this 3-line h1) -->
          <h1
            class="figure-lg text-ink-gray-9"
            style="font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.25"
          >
            A {{ sel.years }}-year engagement,<br /><span
              class="font-display italic text-ink-amber-3"
              >a base that grows</span
            ><br />with what you build.
          </h1>
          <p class="mt-8 text-p-base max-w-2xl text-ink-gray-6 leading-relaxed">
            Every founding advisor starts on the same guaranteed base in options and protocol
            tokens{{ sel.hasCash ? ", with a cash retainer post-Series A" : "" }}. On top of that
            base, the package grows as you help Raiku hit its objectives — capital, customers,
            partnerships, governance — reviewed at six and twelve months.
          </p>
        </div>

        <!-- COM-118: explainer is structure, not the current case — quiet neutral panel -->
        <div
          class="p-5 text-p-sm max-w-3xl rounded bg-surface-gray-1 border border-outline-gray-1 text-ink-gray-7 leading-relaxed"
        >
          <div class="section-label mb-2">How to read this</div>
          Your options are priced at today's share value, so their <b>net</b> worth is the upside
          <i>above</i> that price — at a modest exit they can be worth little, which is normal for
          options; the value is in the climb. Tokens are a fixed share of supply with no exercise
          cost. Equity dilutes as Raiku raises later rounds (tokens don't). The package
          <b>grows</b> as you hit objectives — each counts once its milestone is reached. The three
          scenarios are a deliberately wide range, not a forecast.
        </div>

        <!-- COM-64 → COM-114: ONE statement + ONE data read. The guaranteed base is the document's
             only headline; growth (Current/Ceiling) and the scenario spread are a single quiet
             reference table — a letter's enclosure, not a second dashboard. Current stays marked by
             amber INK; the roman ordinals are gone. Layout only — the legal corpus is untouched. -->
        <div class="border-y border-outline-gray-1 py-10 space-y-8">
          <div>
            <div class="section-label mb-3">Guaranteed base · net of strike</div>
            <div class="figure-lg text-ink-gray-9">{{ fUSD(c.baseCaseBase) }}</div>
            <div class="text-p-sm mt-3 text-ink-gray-6">
              {{ fPct(c.baseEq, 2) }} equity + {{ fPct(c.baseTk, 3) }} tokens
            </div>
          </div>
          <table class="w-full max-w-2xl text-sm">
            <tbody class="divide-y divide-outline-gray-1">
              <tr>
                <td class="py-2.5 pr-4 text-ink-amber-strong">Current · earned</td>
                <td
                  class="py-2.5 tabular-nums text-right font-medium text-ink-gray-9 whitespace-nowrap"
                >
                  {{ fUSD(c.baseCaseTotal) }}
                </td>
                <td class="py-2.5 pl-6 text-p-xs text-ink-gray-6 hidden sm:table-cell">
                  {{
                    c.earnedUplift > 0
                      ? `+${(c.earnedUplift * 100).toFixed(0)}% earned`
                      : "no uplift yet"
                  }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 pr-4 text-ink-gray-7">Ceiling · all objectives</td>
                <td
                  class="py-2.5 tabular-nums text-right font-medium text-ink-gray-9 whitespace-nowrap"
                >
                  {{ fUSD(c.baseCaseCeil) }}
                </td>
                <td class="py-2.5 pl-6 text-p-xs text-ink-gray-6 hidden sm:table-cell">
                  +{{ (c.ceilUplift * 100).toFixed(0) }}% over base
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td colspan="3" class="pt-6 pb-1 text-sm text-ink-gray-6">
                  Net value across outcomes ·
                  <Term k="netOfStrike">net of strike</Term> &amp; dilution
                </td>
              </tr>
            </tbody>
            <tbody class="divide-y divide-outline-gray-1">
              <tr v-for="s in c.scen" :key="s.key">
                <td
                  class="py-2.5 pr-4"
                  :class="
                    s.key === baseScenKey(S.plan) ? 'text-ink-amber-strong' : 'text-ink-gray-7'
                  "
                >
                  {{ s.label }} · {{ fPct(s.retention, 0) }} kept
                </td>
                <td
                  class="py-2.5 tabular-nums text-right font-medium text-ink-gray-9 whitespace-nowrap"
                >
                  {{ fUSD(s.total) }}
                </td>
                <td class="py-2.5 pl-6 text-p-xs text-ink-gray-6 hidden sm:table-cell">
                  eq {{ s.underwater ? "underwater" : fUSD(s.equity) }} · tok {{ fUSD(s.token) }}
                </td>
              </tr>
            </tbody>
          </table>
          <!-- COM-84: the explored target outcome survives into the document the advisor keeps -->
          <p class="text-p-sm text-ink-gray-7">{{ targetLine }}</p>
        </div>

        <Divider class="my-4" />
        <div class="text-p-xs text-ink-gray-6 leading-relaxed">
          Ackermann Systems Engineering Ltd (t/a Raiku), Cayman Islands. Options over ordinary
          non-voting shares (ESOP), strike at the {{ roundLabel(S.plan, c.grantRound) }} price; net
          exercise permitted. Tokens via Restricted Token Award. Equity vests
          {{ S.plan.equityVestYears }}yr/{{ S.plan.equityCliff }}mo annually with a 1-year cliff;
          exercise binds a deed of adherence. No automatic or discretionary change-of-control
          acceleration under the plan (Plan rules v9); on a change of control the acquirer may roll
          over awards, and vested options remain exercisable per the plan rules.
          <template v-if="sb?.tokenAsEquity"
            >Under this scenario a liquidity event precedes TGE: token awards convert 1:1 into
            equity — all protocol value accrues to equity, net of the same dilution walk.
          </template>
          {{ residencyLine }}
          <template v-if="S.plan.valuation"
            >Strike per the agreed {{ S.plan.valuation.basis }} valuation of
            {{ fDate(S.plan.valuation.dateISO) }} ({{ fUSD(S.plan.valuation.ppsUSD) }}/share).
          </template>
          <template v-else
            >Strike subject to an agreed HMRC SAV / 409A valuation before first grant.
          </template>
          Exercise is available during Board-determined liquidity windows; if no Exit Event occurs
          before the 9th anniversary of grant, the Company shall open an Exercise Period of at least
          90 days, on at least 30 days' written notice, ending no later than the day before the 10th
          anniversary (Option Certificate 3.6). Net exercise is available at Board discretion on the
          holder's written request (Rule 4.5); sell-to-cover is holder-elected with surplus proceeds
          accounted to the holder (Rule 7.4(a)). {{ FUNDING_ROUND_CARVEOUT }} Subject to required
          investor consents. Not a binding offer or legal/financial advice.
        </div>
      </div>
    </div>
  </div>
</template>
