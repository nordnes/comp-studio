# Competitor research index — 13 deep-dives (2026-06-11)

Per-service reports produced by dedicated research agents (exhaustive feature inventories, every claim
cited, [R]/[NR] relevance tags) plus hands-on browser evidence. Companion deliverable:
**../IMPROVEMENT_PLAN.md** — the issue-ready backlog distilled from all of this.

## The reports

| # | Service | File | One-line take | Status note |
|---|---------|------|---------------|-------------|
| 1 | Ledgy | [ledgy.md](ledgy.md) | EU equity-plan automation; 3-value scenario rows; stakeholder-view toggles | Independent; Scale from €3k/yr |
| 2 | Capboard | [capboard.io](capboard.md) | Budget EU cap table; stakeholder portals with self-serve exit simulations | $2/stakeholder/mo; Dec-2024 4× price hike |
| 3 | Pave | [pave.md](pave.md) | Comp suite; Visual Offer Letter with milestone-annotated share-price slider; gross-vs-net config | $1.6B val.; Lite free ≤200 emp |
| 4 | OpenComp | [opencomp.md](opencomp.md) | Benchmarking; the compa-ratio roster grammar (range bar + tick + distribution filter) | ~$4.5k–17k/yr |
| 5 | Compa | [compa.ai](compa.md) | Offer-intelligence network (9M obs.); guardrailed offer desk; auto-approve in-policy | $35k+/yr; $35M Series B Jan 2026 |
| 6 | Aeqium | [aeqium.md](aeqium.md) | AI comp cycles; offer simulator with URL-encoded scenario state; proactive alert cards | quote-only; "half of Pave" |
| 7 | Pequity | [pequity.md](pequity.md) | Comp cycles + offers; Comp Health traffic-light; trigger-matched approvals + activity feed | **Acquired by ADP (Oct 2025)** |
| 8 | Comprehensive | [comprehensive.md](comprehensive.md) | Guided cycles; compa-ratio before/after bars; draft/release letters; free Pay Range Tracker | PEPM, unpublished |
| 9 | Coinbase Token Manager | [coinbase-token-manager.md](coinbase-token-manager.md) | Ex-Liquifi token ops; Vested≠Unlocked twin states; "Today"-cursor schedule chart | Acquired Jul 2025; sales-gated |
| 10 | Hedgey | [hedgey.md](hedgey.md) | Free on-chain vesting NFTs; vesting/lockup as composable layers; persona-fork entry | **Acquired by Anchorage (Dec 2025)**; 2024 $44.7M exploit covered |
| 11 | Complete | [complete.md](complete.md) | Design-led offers + leveling; education blocks inside the offer; preview-as-employee | YC W22; demo-gated |
| 12 | Levels.fyi | [levels-fyi.md](levels-fyi.md) | Consumer data + Interactive Offers; equity modeling as the Free→Plus paywall; email-gated links | Benchmarking $800–4,000/mo |
| 13 | **Forgd** | [../../FORGD_DEEP_DIVE.md](../../FORGD_DEEP_DIVE.md) | Token Designer hands-on: explainer-chart grammar, Quick Adjust deep-links, Perceived-vs-Actual panel | Free core + paid advisory |

Plus: [HANDS-ON-NOTES.md](HANDS-ON-NOTES.md) — live UI evidence (Levels.fyi demo offer + salary pages,
Complete /leveling, Comprehensive tracker + cycle UI, Hedgey app shell). Earlier synthesis across ~30
products: ../COMP_STUDIO_COMPETITIVE_RESEARCH.md.

## Cross-service UI/UX pattern library (deduped, with strongest exemplar)

**Bands & guardrails**
- Horizontal range bar + person/offer tick, numeric label, red/green by position — OpenComp,
  Comprehensive (before/after twin markers), Complete (avatars ON the band), Workleap.
- Below/in/above distribution chip-bar that doubles as a roster filter — OpenComp.
- Traffic-light comp-health chip per person — Pequity.
- In-policy auto-approve vs justification-gated exception, decision logged — Compa, Comprehensive.

**Scenario modeling**
- Named 3-value scenario rows (conservative/probable/optimistic per event) — Ledgy.
- Bounded slider with labeled milestone detents/annotations — Pave; admin-bounded min/max — Ledgy.
- Scenario state in the URL (shareable) — Aeqium.
- One global scenario/percentile selector repainting every chart — Levels.fyi, Forgd.
- Comparable-anchored assumptions with inline stats — Forgd (GMX/Sui/Polkadot), Comprehensive
  (multi-dataset switcher: Comprehensive/Mercer/Comptryx/Salary.com).

**Recipient-facing documents**
- Candidate-page grammar: hero → field cards → total donut + itemized legend → equity deep-dive →
  education blocks → story → CTA — Levels.fyi (live), Complete, Pave, Aeqium, Carta.
- Units-first equity ("8,333 RSUs ~($375k)ⓘ") subordinating the dollar guess — Levels.fyi.
- Education cards INSIDE the document (dilution, options-vs-RSU) — Complete.
- Preview-as-recipient toggle before publishing — Complete, Ledgy ("view as stakeholder").
- Confidentiality dials: hide-total-shares toggle (Ledgy), PPS-only mode (Carta), email-verification gate
  + custom domain (Levels.fyi), password-protected public page w/ Not Published status (Forgd).
- Draft/release state machine — edits invisible until released — Comprehensive.

**Tokens**
- Vested and Unlocked as two simultaneously visible states; "Today" cursor with gross→vested→
  withheld→net popover — Coinbase Token Manager.
- Vesting layer ≠ lockup layer, composable — Hedgey; 12mo lock + 24mo unlock advisor template — Forgd.
- Persona fork (issuer vs recipient) at entry; read-only recipient portfolio link — Hedgey.

**Charts & self-teaching analytics**
- Per-chart "How to read this / What data is used / Quick Adjust→owning configurator" card slots — Forgd.
- Percentile bars in a sequential color ramp + freshness stamp ("Last updated 6/10/2026") — Levels.fyi.
- Sample-size/confidence chip on every benchmark — Comprehensive, Pave.

**Workflow & trust**
- n-of-m consent progress with evidence embedded in the consent object — Carta (prior research).
- All-Activity feed + exportable change history per object — Pequity; dual change+access audit — Capboard.
- Status-chip strips with totals + green/red validation banners ("100% allocated", "Budget: $0 of $23,625",
  "Salaries Reviewed: 0 of 6") — Forgd, Comprehensive.
- "Next recommended task" completion driver — Forgd.
- One-button full-model export (XLS) — Forgd, Capboard, Comprehensive tracker.

## Recurring market criticisms to design against
Setup ceremony before value (Pulley, Pave) · state-label ambiguity (Carta) · rigid exports (Ravio,
OpenComp) · benchmark-match weakness for niche roles (OpenComp, Pave) · gross-value optimism with
buried caveats (category-wide; 729-comment Carta thread) · wallet-gated friction (Hedgey) ·
manual-completion drift (Forgd) · price-hike backlash where pricing is opaque (Capboard).

## Coverage verification
All 12 requested services + Forgd: ✔ each has a dedicated report with feature inventory, UI/UX section,
criticisms, and borrowable patterns. Login-gated apps are documented from primary docs/help-center/
review evidence and flagged as such; public surfaces verified hands-on (HANDS-ON-NOTES.md).
