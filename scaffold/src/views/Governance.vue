<script setup lang="ts">
// COM-141 (F21 / O13 / spec Δ7): the Governance Table v4 as software — a RED/AMBER/GREEN checklist
// of every pre-condition that gates a grant. Tracking surface only: no gating semantics here (the
// follow-on issue), no engine reads, no money. Canonical row text is seed-only (governance.ts);
// the four user-owned fields (status / owner / evidence / note) edit inline and persist.
import { computed, ref } from "vue";
import { Button, FormControl } from "frappe-ui";
import { useStudio } from "../store";
import type { ComplianceItem, RagStatus } from "../governance";
import PageHeader from "../components/PageHeader.vue";
import Panel from "../components/Panel.vue";

const { store, setGovItem } = useStudio();

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
                    @click="setGovItem(it.id, { status: s.key })"
                  >
                    {{ s.label }}
                  </button>
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
  </div>
</template>
