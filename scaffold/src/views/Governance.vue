<script setup lang="ts">
// COM-141 (F21 / O13 / spec Δ7): the Governance Table v4 as software — a RED/AMBER/GREEN checklist
// of every pre-condition that gates a grant. Tracking surface only: no gating semantics here (the
// follow-on issue), no engine reads, no money. Canonical row text is seed-only (governance.ts);
// the four user-owned fields (status / owner / evidence / note) edit inline and persist.
import { computed, ref } from "vue";
import { Badge, Button, FormControl } from "frappe-ui";
import { useStudio } from "../store";
import type { ComplianceItem, RagStatus } from "../governance";
import { CONSENT_MATRIX, CONSENT_FACTS } from "../consents";
import { MAX_AUDIT_EVENTS } from "../audit";

// COM-166: right-status → badge theme (live = the gating state, amber attention)
const RIGHT_THEME: Record<string, string> = {
  live: "orange",
  extinguished: "gray",
  none: "green",
};
import PageHeader from "../components/PageHeader.vue";
import Panel from "../components/Panel.vue";

const { explainConsent, store, setGovItem, removeDecision } = useStudio();
// COM-165: the decision artefacts, newest first
const decisions = computed(() => [...(store.S.decisions || [])].reverse());
// COM-170: the audit tail, newest first (display caps at 50; the slice keeps MAX_AUDIT_EVENTS)
// UXS-O (UXP 5.1): which item is offering the optional why right now
const whyFor = ref("");
const whyDraft = ref("");
function submitWhy(it: any) {
  explainConsent(it.ref, it.title, whyDraft.value);
  whyFor.value = "";
  whyDraft.value = "";
}

const auditTail = computed(() => [...store.audit].reverse().slice(0, 50));
const AUDIT_THEME: Record<string, string> = {
  justification: "gray",
  grant: "blue",
  review: "green",
  stage: "gray",
  round: "orange",
  valuation: "orange",
  proposition: "blue",
  decision: "green",
  introduction: "gray",
};
const fAuditTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const advisorName = (id?: string) =>
  id ? store.S.advisors.find((a) => a.id === id)?.name || "" : "";

const STATUSES: { key: RagStatus; label: string; on: string; dot: string }[] = [
  { key: "red", label: "Red", on: "bg-surface-red-2 text-ink-red-3", dot: "var(--ink-red-3)" },
  {
    key: "amber",
    label: "Amber",
    on: "bg-surface-amber-2 text-ink-amber-strong",
    dot: "var(--ink-amber-3)",
  },
  {
    key: "green",
    label: "Green",
    on: "bg-surface-green-2 text-ink-green-3",
    dot: "var(--ink-green-3)",
  },
];
const dotOf = (s: RagStatus) => STATUSES.find((x) => x.key === s)!.dot;

const groups = computed(() => {
  const out: { label: string; items: ComplianceItem[] }[] = [];
  store.gov.items.forEach((it) => {
    const g = out.find((x) => x.label === it.group);
    if (g) g.items.push(it);
    else out.push({ label: it.group, items: [it] });
  });
  return out;
});
const counts = computed(() => {
  const c = { red: 0, amber: 0, green: 0 } as Record<RagStatus, number>;
  store.gov.items.forEach((it) => c[it.status]++);
  return c;
});

// One row's editor open at a time — the page stays a readable register, not a form wall.
const editingId = ref<string | null>(null);
const toggleEdit = (id: string) => (editingId.value = editingId.value === id ? null : id);

// Meta line under each title: deadline · owner · note, only what's set — no empty slots.
const meta = (it: ComplianceItem) =>
  [it.when, it.owner && `Owner · ${it.owner}`, it.note].filter(Boolean);
// Trust boundary on the one user-entered URL: only http(s) becomes a clickable href —
// anything else (javascript:, file:, a bare doc id) stays plain text in the meta line.
const evidenceHref = (it: ComplianceItem) =>
  /^https?:\/\//i.test(it.evidence.trim()) ? it.evidence.trim() : "";
</script>

<template>
  <div class="mx-auto w-full max-w-reading px-3 sm:px-5 space-y-8">
    <PageHeader
      title="Governance & consents."
      desc="The Governance Table v4 as a live checklist — every pre-condition that gates a grant, with owner, status, and evidence. Tracking state for an internal discussion, not legal advice."
    />

    <!-- The page's one summary figure: where the register stands, in plain counts. -->
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm tabular-nums text-ink-gray-7">
      <span v-for="s in STATUSES" :key="s.key" class="flex items-center gap-1.5">
        <span
          class="inline-block size-2 rounded-full"
          :style="{ background: s.dot }"
          aria-hidden="true"
        />
        {{ counts[s.key] }} {{ s.label.toLowerCase() }}
      </span>
      <span class="text-ink-gray-6">of {{ store.gov.items.length }} items</span>
    </div>

    <section v-for="g in groups" :key="g.label" class="space-y-3">
      <div class="section-label">{{ g.label }}</div>
      <Panel :padded="false">
        <ul class="divide-y divide-outline-gray-1">
          <li v-for="it in g.items" :key="it.id" class="p-4 space-y-2">
            <!-- Mobile stacks the controls under the text — side-by-side squeezes the register
                 copy to half a column -->
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-baseline gap-2">
                  <span
                    class="inline-block size-2 rounded-full shrink-0 self-center"
                    :style="{ background: dotOf(it.status) }"
                    aria-hidden="true"
                  />
                  <span class="text-xs tabular-nums shrink-0 text-ink-gray-6">{{ it.ref }}</span>
                  <span class="text-sm font-medium text-ink-gray-9">{{ it.title }}</span>
                </div>
                <p class="text-p-xs mt-1 leading-relaxed text-ink-gray-6">{{ it.detail }}</p>
                <div
                  v-if="meta(it).length || it.evidence"
                  class="text-xs mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-ink-gray-6"
                >
                  <span v-for="(m, i) in meta(it)" :key="i">{{ m }}</span>
                  <a
                    v-if="evidenceHref(it)"
                    :href="evidenceHref(it)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline underline-offset-2 hover:text-ink-gray-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] rounded-sm"
                    >Evidence ↗</a
                  >
                  <span v-else-if="it.evidence">Evidence · {{ it.evidence }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0 no-print">
                <div
                  role="group"
                  :aria-label="`Status — ${it.title}`"
                  class="flex rounded-md border border-outline-gray-2 overflow-hidden"
                >
                  <button
                    v-for="s in STATUSES"
                    :key="s.key"
                    :aria-pressed="it.status === s.key"
                    class="px-2 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ink-gray-6)]"
                    :class="it.status === s.key ? s.on : 'text-ink-gray-5 hover:bg-surface-gray-1'"
                    @click="
                      setGovItem(it.id, { status: s.key });
                      whyFor = it.id;
                    "
                  >
                    {{ s.label }}
                  </button>
                </div>
                <!-- UXS-O (UXP 5.1): the optional why AT the flip — one line, lands on the
                     audit trail beside the consent event; Esc/blur just drops it -->
                <div v-if="whyFor === it.id" class="mt-1.5 flex items-center gap-2">
                  <FormControl
                    v-model="whyDraft"
                    type="text"
                    size="sm"
                    class="w-72"
                    placeholder="Why? (optional — lands on the audit trail)"
                    aria-label="Status rationale"
                    @keydown.enter="submitWhy(it)"
                    @keydown.escape="((whyFor = ''), (whyDraft = ''))"
                  />
                  <Button size="sm" variant="subtle" label="Record" @click="submitWhy(it)" />
                  <Button
                    size="sm"
                    variant="ghost"
                    theme="gray"
                    label="Skip"
                    @click="((whyFor = ''), (whyDraft = ''))"
                  />
                </div>
                <Button
                  variant="ghost"
                  icon="lucide-pen"
                  label="Edit owner, evidence and note"
                  :aria-expanded="editingId === it.id"
                  @click="toggleEdit(it.id)"
                />
              </div>
            </div>
            <div v-if="editingId === it.id" class="grid sm:grid-cols-3 gap-3 pt-1 no-print">
              <FormControl
                type="text"
                label="Owner"
                size="sm"
                placeholder="Who closes this"
                :model-value="it.owner"
                @update:model-value="(v: string) => setGovItem(it.id, { owner: v })"
              />
              <FormControl
                type="url"
                label="Evidence link"
                size="sm"
                placeholder="https://…"
                :model-value="it.evidence"
                @update:model-value="(v: string) => setGovItem(it.id, { evidence: v })"
              />
              <FormControl
                type="text"
                label="Note"
                size="sm"
                placeholder="Context, dates, blockers"
                :model-value="it.note"
                @update:model-value="(v: string) => setGovItem(it.id, { note: v })"
              />
            </div>
          </li>
        </ul>
      </Panel>
    </section>

    <p class="text-p-xs text-ink-gray-6">
      Source: ESOP workstream pack — Governance Table v4 + open items 1–12 (spec Appendix C.5/C.6).
      Register text is fixed; statuses, owners, evidence and notes are tracking state and save with
      the studio. Internal &amp; confidential.
    </p>

    <!-- COM-166: the A.6 consent matrix as data — definitive, 47 investors reviewed -->
    <section class="space-y-3">
      <div class="section-label">Investor consent matrix · A.6 (definitive — 47 reviewed)</div>
      <Panel :padded="false">
        <ul class="divide-y divide-outline-gray-1">
          <li v-for="e in CONSENT_MATRIX" :key="e.id" class="p-4">
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-sm font-medium text-ink-gray-9">{{ e.name }}</span>
              <span class="text-xs text-ink-gray-6">{{ e.context }}</span>
              <span class="ml-auto flex items-center gap-1.5">
                <Badge :theme="RIGHT_THEME[e.consent]" variant="subtle" size="sm"
                  >consent {{ e.consent }}</Badge
                >
                <Badge
                  :theme="RIGHT_THEME[e.proRata === 'live-uncapped' ? 'live' : e.proRata]"
                  variant="subtle"
                  size="sm"
                  >pro-rata
                  {{ e.proRata === "live-uncapped" ? "live · uncapped" : e.proRata }}</Badge
                >
                <Badge v-if="e.mfn" theme="blue" variant="subtle" size="sm">{{ e.mfn }}</Badge>
              </span>
            </div>
            <ul v-if="e.consentTriggers.length" class="mt-1.5 space-y-0.5">
              <li
                v-for="t in e.consentTriggers"
                :key="t.id"
                class="text-p-xs text-ink-amber-strong"
              >
                Consent required: {{ t.label }}
              </li>
            </ul>
            <p v-if="e.survival" class="text-p-xs text-ink-gray-6 mt-1">{{ e.survival }}</p>
          </li>
        </ul>
      </Panel>
      <p v-for="(f, i) in CONSENT_FACTS" :key="i" class="text-p-xs text-ink-gray-6">{{ f }}</p>
    </section>

    <!-- COM-165: the grant-decision artefacts (B.3) — the defend-it-in-a-board-conversation log -->
    <div v-if="decisions.length">
      <div class="section-label mb-2">Grant decisions · the Ispahani 9-step artefacts</div>
      <div class="divide-y divide-outline-gray-1 text-sm">
        <div v-for="d in decisions" :key="d.id" class="py-2.5">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="tabular-nums text-ink-gray-6 w-24 shrink-0">{{ d.atISO }}</span>
            <span class="text-ink-gray-9">{{ d.subject }}</span>
            <span v-if="advisorName(d.advisorId)" class="text-p-xs text-ink-gray-6"
              >· {{ advisorName(d.advisorId) }}</span
            >
            <span v-if="d.decidedBy" class="text-p-xs text-ink-gray-6"
              >· decided by {{ d.decidedBy }}</span
            >
            <span class="text-p-xs text-ink-gray-6"
              >· {{ d.answers.filter((a: string) => a).length }}/9 steps answered</span
            >
            <button
              aria-label="Remove decision artefact"
              class="ml-auto inline-flex shrink-0 items-center justify-center size-7 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
              @click="removeDecision(d.id)"
            >
              <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
            </button>
          </div>
          <div class="mt-1 space-y-0.5">
            <p v-for="(a, i) in d.answers" v-show="a" :key="i" class="text-p-xs text-ink-gray-7">
              <span class="text-ink-gray-6">{{ i + 1 }}.</span> {{ a }}
            </p>
          </div>
        </div>
      </div>
      <p class="text-p-xs text-ink-gray-6 mt-1">
        Run a new decision from the Board ("New grant decision") — each one leaves this artefact.
      </p>
    </div>

    <!-- COM-170: the append-only audit trail — grant/review/stage/round/valuation changes,
         on the record. No edit or delete controls exist BY DESIGN. -->
    <div v-if="auditTail.length">
      <div class="section-label mb-2">
        Audit log · append-only ({{ store.audit.length }} event{{
          store.audit.length === 1 ? "" : "s"
        }})
      </div>
      <div class="divide-y divide-outline-gray-1 text-sm">
        <div v-for="e in auditTail" :key="e.id" class="py-1.5 flex items-baseline gap-3 flex-wrap">
          <span class="text-xs tabular-nums text-ink-gray-6 w-36 shrink-0">{{
            fAuditTime(e.atISO)
          }}</span>
          <Badge :theme="AUDIT_THEME[e.kind] || 'gray'" variant="subtle" size="sm">{{
            e.kind
          }}</Badge>
          <span class="text-ink-gray-7 shrink-0">{{ e.subject }}</span>
          <span class="text-p-xs text-ink-gray-6">{{ e.summary }}</span>
          <!-- COM-176: the why-note — the rationale recorded WITH the action, rendered with it -->
          <span v-if="e.why" class="basis-full pl-39 text-p-xs italic text-ink-gray-6"
            >why: {{ e.why }}</span
          >
        </div>
      </div>
      <p class="text-p-xs text-ink-gray-6 mt-1">
        Grant, review, pipeline, round, valuation, proposition and decision changes append here —
        there is no edit or delete. The newest {{ MAX_AUDIT_EVENTS }} events are kept locally;
        server-side integrity arrives with M6.
      </p>
    </div>
  </div>
</template>
