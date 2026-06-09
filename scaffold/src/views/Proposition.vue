<script setup lang="ts">
// Proposition (Section V) — the print-ready advisor doc. Legal-dense: the caveat corpus is ported
// verbatim (non-voting shares, RTA, deed of adherence, net exercise, CoC at Board discretion, s431/409A
// by residency, HMRC SAV, 9-yr/90-day backstop, investor consents). propText() = plain-text clipboard.
import { computed } from "vue";
import { Avatar, Button, Divider } from "frappe-ui";
import { useStudio } from "../store";
import { fUSD, fPct, fNum, fMult, baseScenKey, roundLabel } from "../engine";
import AdvisorPicker from "../components/AdvisorPicker.vue";
import Term from "../components/Term.vue";

const { store, selected, flash } = useStudio();
const S = computed(() => store.S);
const sel = computed(() => selected.value?.a);
const c = computed(() => selected.value?.c);
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
    `Confidential discussion draft · ${a.name}`,
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
</script>

<template>
  <div v-if="!sel || !c" class="text-center py-24 text-ink-gray-6">
    Add an advisor to prepare a proposition.
  </div>
  <div v-else class="space-y-8">
    <div class="flex justify-between items-center flex-wrap gap-3 no-print">
      <div class="text-sm text-ink-gray-6">Proposition</div>
      <div class="flex items-center gap-2">
        <AdvisorPicker />
        <Button
          variant="subtle"
          theme="gray"
          icon-left="lucide-printer"
          label="Print"
          @click="print"
        />
        <Button
          variant="subtle"
          theme="gray"
          icon-left="lucide-copy"
          label="Copy"
          @click="copyProp"
        />
      </div>
    </div>

    <div class="print-area bg-surface-white rounded border border-outline-gray-2">
      <div class="px-8 sm:px-12 py-10 border-b border-outline-gray-1">
        <div class="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div class="text-sm text-ink-gray-6">Confidential · Discussion Draft</div>
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
          <h1
            class="font-display leading-tight text-ink-gray-9"
            style="font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 350"
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

        <div
          class="p-5 text-p-sm max-w-3xl rounded bg-surface-amber-2 border border-outline-amber-2 text-ink-gray-7 leading-relaxed"
        >
          <div class="text-sm text-ink-amber-strong mb-2">How to read this</div>
          Your options are priced at today's share value, so their <b>net</b> worth is the upside
          <i>above</i> that price — at a modest exit they can be worth little, which is normal for
          options; the value is in the climb. Tokens are a fixed share of supply with no exercise
          cost. Equity dilutes as Raiku raises later rounds (tokens don't). The package
          <b>grows</b> as you hit objectives — each counts once its milestone is reached. The three
          scenarios are a deliberately wide range, not a forecast.
        </div>

        <!-- COM-64: the proposition's hero band diverges from the dashboard KPI bands — hairline-only
             (no amber fill), more generous spacing, larger Fraunces — so the document reads calmer and
             more letterpress than the working tool. Current stays marked by amber INK, not a fill block. -->
        <div class="grid md:grid-cols-3 border-y border-outline-gray-1">
          <div class="p-10 border-r border-outline-gray-1">
            <div class="flex items-baseline gap-3 mb-6">
              <span class="text-xs text-ink-gray-5">i</span
              ><span class="text-sm text-ink-gray-6">Base · net</span>
            </div>
            <div
              class="font-display tabular-nums text-ink-gray-9"
              style="font-size: 2.8rem; font-weight: 350; line-height: 1"
            >
              {{ fUSD(c.baseCaseBase) }}
            </div>
            <div class="text-p-xs mt-6 text-ink-gray-6">
              {{ fPct(c.baseEq, 2) }} equity + {{ fPct(c.baseTk, 3) }} tokens
            </div>
          </div>
          <div class="p-10 border-r border-outline-gray-1">
            <div class="flex items-baseline gap-3 mb-6">
              <span class="text-xs text-ink-amber-strong">ii</span
              ><span class="text-sm text-ink-amber-strong">Current · earned</span>
            </div>
            <div
              class="font-display tabular-nums text-ink-gray-9"
              style="font-size: 2.8rem; font-weight: 350; line-height: 1"
            >
              {{ fUSD(c.baseCaseTotal) }}
            </div>
            <div class="text-p-xs mt-6 text-ink-gray-6">
              {{
                c.earnedUplift > 0
                  ? `+${(c.earnedUplift * 100).toFixed(0)}% earned`
                  : "no uplift yet"
              }}
            </div>
          </div>
          <div class="p-10">
            <div class="flex items-baseline gap-3 mb-6">
              <span class="text-xs text-ink-gray-5">iii</span
              ><span class="text-sm text-ink-gray-6">Ceiling</span>
            </div>
            <div
              class="font-display tabular-nums text-ink-gray-9"
              style="font-size: 2.8rem; font-weight: 350; line-height: 1"
            >
              {{ fUSD(c.baseCaseCeil) }}
            </div>
            <div class="text-p-xs mt-6 text-ink-gray-6">
              +{{ (c.ceilUplift * 100).toFixed(0) }}% over base
            </div>
          </div>
        </div>

        <div>
          <div class="text-sm text-ink-gray-6 mb-2">
            Net value across outcomes · <Term k="netOfStrike">net of strike</Term> & dilution
          </div>
          <div class="grid grid-cols-3 gap-px bg-surface-gray-2 rounded overflow-hidden">
            <div
              v-for="s in c.scen"
              :key="s.key"
              class="p-6"
              :class="s.key === baseScenKey(S.plan) ? 'bg-surface-amber-2' : 'bg-surface-white'"
            >
              <div
                class="text-xs mb-2"
                :class="s.key === baseScenKey(S.plan) ? 'text-ink-amber-strong' : 'text-ink-gray-6'"
              >
                {{ s.label }} · {{ fPct(s.retention, 0) }} kept
              </div>
              <div class="font-display text-2xl tabular-nums text-ink-gray-9">
                {{ fUSD(s.total) }}
              </div>
              <div class="text-p-xs mt-2 text-ink-gray-6">
                eq {{ s.underwater ? "underwater" : fUSD(s.equity) }} · tok {{ fUSD(s.token) }}
              </div>
            </div>
          </div>
        </div>

        <Divider class="my-4" />
        <div class="text-p-xs text-ink-gray-6 leading-relaxed">
          Ackermann Systems Engineering Ltd (t/a Raiku), Cayman Islands. Options over ordinary
          non-voting shares (ESOP), strike at the {{ roundLabel(S.plan, c.grantRound) }} price; net
          exercise permitted. Tokens via Restricted Token Award. Equity vests
          {{ S.plan.equityVestYears }}yr/{{ S.plan.equityCliff }}mo annually with a 1-year cliff;
          exercise binds a deed of adherence. Change-of-control acceleration is at Board discretion
          (not contractual). {{ residencyLine }} Strike subject to an agreed HMRC SAV / 409A
          valuation before first grant. If no exit by the 9th anniversary, a ≥90-day exercise window
          opens (Option Certificate 3.6). Subject to required investor consents. Not a binding offer
          or legal/financial advice.
        </div>
      </div>
    </div>
  </div>
</template>
