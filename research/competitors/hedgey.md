# Hedgey — Deep Dive

**Service:** https://hedgey.finance · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Rich public docs, audit reports, postmortems, and 2026 competitor comparisons give concrete grounding on Hedgey's product model, UX, and market position.

## Positioning & Pricing
- **Positioning:** "Free onchain token vesting and lockups for teams, investors, and communities" — EVM-only, DAO/community-flavored, non-custodial public-good model. The 2026 archetype tables tag it "EVM · DAOs · Community/Governance" vs Magna's "Carta for Crypto" and Sablier's "Streaming/Payroll."
- **Acquired by Anchorage Digital, Dec 16 2025** (terms undisclosed). Team launched **hedgeypro.com** — institutional token cap-table management with white-glove onboarding, granular grant-type/tax-election controls, integrated with Anchorage custody. The free core app remains operational, but the independent roadmap is now subordinate to Anchorage's banking strategy.
- **Pricing:** core vesting/lockups/claims **free** (users pay gas only); paid tiers **from ~$150/mo** for PreToken products and investor portfolio management; HedgeyPro is custom/sales-led.

## Feature Inventory (by module)
- **Vesting Plans** (`TokenVestingPlans.sol` + voting variant): revocable by admin; linear/periodic/single unlock; cliff; back/future-dating; optional **post-vesting lockup** (vested but still locked until a date); optional `adminTransferOBO` (admin transfers a plan on behalf of recipient — flagged by Consensys as a centralization risk). Recipient plans are **soulbound by default**.
- **Investor Lockups** (4 contract variants): **immutable/non-revocable**; matrix of transferable × voting. Transferable+voting for investors (can move to custody or sell on secondaries); bound+non-voting for treasury emissions evidence.
- **NFT position model:** every plan is an **ERC-721** minted to the beneficiary; tokens sit in the ERC-721 escrow contract; the NFT carries the schedule data and claim/delegation rights. No oracles — enables composability (splitter contracts for pooled investments, claim-executor DAO contracts). Transferability is a per-product config, not inherent.
- **Governance:** vote/delegate with locked & unvested tokens — onchain (Tally-compatible) and Snapshot strategies.
- **Token Claims (AirClaim/AirStream/AirVest):** Merkle-tree mass distribution with custom claim-page links, end dates, optional cliffs/voting; AirVest streams are revocable.
- **Token Grants & Treasury:** Arbitrum DAO uses it for grants to protocols; treasury lockups evidence emission schedules; DAO treasury swaps (`HedgeyDAOSwap.sol`) and timelocks exist as legacy products.
- **Batch ops:** `BatchPlanner.sol` — multi-recipient plan creation in one transaction.
- **Chains:** Ethereum, Arbitrum, Optimism, Base, Polygon, Avalanche, Gnosis, Celo, BSC, zkSync, Mantle, Fantom, Blast, Boba, Evmos, OKX (~15+ EVM). **No Solana.**
- **PreToken:** pre-TGE allocation mapping + offchain vesting collection, converting to onchain at launch.

## Key Workflows
- **Issuer wizard** (app.hedgey.finance/vesting/create): 4 steps — **Setup → Administration → Details → Completed**, with a live **plan-summary side panel**. Setup: token (dropdown or contract address), unlock frequency (linear/periodic/single), term, cliff, post-vesting-lockup toggle. Administration: transferability, OBO rights. Details: per-recipient address/amount/start-date or **"Import from CSV"** bulk module. Deep **Safe integration** ("View on Safe", dedicated Safe App).
- **CSV integrity check:** for claims, a 2-column CSV (address, amount) builds a Merkle tree; issuers verify the **transaction root against rootchecker.hedgey.finance** before signing — a notable trust-but-verify UX for bulk money operations.
- **Recipient claim UX:** plan auto-appears on wallet connect → "view details" expands full schedule with a **hoverable graph visualizing upcoming unlock dates** → Claim button pulls all currently-vested tokens (pull-based, not auto-push). Claim campaigns get a shareable branded claim page; issuer dashboard shows real-time claimed counts/status.
- **Admin dashboard:** view/manage/revoke active plans (typically operated from a multisig).

## Traction, Audits, Sentiment
- **Users:** Arbitrum DAO, Celo Foundation, Gitcoin, Gnosis, ShapeShift, Index Coop, Collab.Land — "50+ DAOs, 6000+ streams/lockups" (self-reported; no public TVL at Streamflow/Magna scale: $1.4B / $2.4B respectively).
- **Audits:** 5+ (Consensys Diligence ×2, Hacken, Resonance, AuditOne, Salus), per-contract audit table in docs.
- **Incident:** **Apr 19 2024 ClaimCampaigns exploit** — missing allowance revocation in `cancelCampaign()`; flash-loan attack across chains; ~$2M real losses (USDC/NOBL; the "$44–48M" headlines priced illiquid BONUS tokens). 23 of 60 active claim campaigns hit; **vesting/lockup contracts unaffected**; transparent postmortem published. The audited-but-exploited fact is the standing caveat in sentiment.
- **Praise themes:** Celo — "People Ops self-serve… intuitive UI and tight Safe integration"; Gitcoin — simplicity + community mechanics. Criticism (competitor-sourced): EVM gas at scale, revocability-as-centralization, narrower suite than full-stack rivals, post-acquisition roadmap uncertainty.

## Positioning vs Competitors (2026)
- **Magna:** enterprise multi-chain (EVM+Solana+Aptos), $2.4B TVL, 100+ customers, branded claim portals, tax/HRIS integrations (Rippling/Deel), Trail of Bits/Zellic audits — the upmarket "polish + compliance" pole. Hedgey is the free/community pole.
- **Liquifi → Coinbase Token Manager:** compliance-first, tax withholding, Coinbase Prime — institutional EVM.
- **Sablier:** per-second streaming primitive, also NFT-based positions, payroll-flavored.
- **Streamflow:** Solana-native full stack (vesting+locks+airdrops+staking+payments), immutable contracts marketed against Hedgey's revocable-admin model.
- Hedgey's differentiators: **free**, **governance-while-vesting**, **NFT-position composability**, **Safe-native ops**; weaknesses: vesting/lockup-only scope, no Solana, exploit history, Anchorage dependency.

## Takeaways for Comp Studio (workstream-mapped)
1. **(9e vesting timeline)** Hedgey's recipient view leads with a single schedule graph with **hover-to-reveal next-unlock dates** — for our vesting timeline, hover/focus affordances surfacing "next unlock date + amount net of strike" is validated prior art over static charts.
2. **(9e / WS-F)** "**Post-vesting lockup**" is modeled as a first-class, separate layer on top of vesting (vested ≠ unlocked). Our trajectory/timeline visuals should keep vest and lockup/transfer-restriction as two distinct visual layers, matching how the market models advisor token comp.
3. **(9c immutable records)** Hedgey's revocable-vs-immutable split (vesting plans revocable; investor/advisor lockups immutable) and the Streamflow attack on revocability show that **mutability semantics are themselves a trust signal**. Our immutable audit-log records should explicitly tag which scenario inputs are binding-style vs draft-revisable.
4. **(9c)** The **CSV → Merkle-root → independent rootchecker verification** flow is a strong pattern: for any bulk import or signed-off scenario snapshot, offer a deterministic hash/fingerprint the user can independently re-derive — cheap, high-trust auditability.
5. **(WS-F charts)** Competitor charting bar (Magna's "up-to-date vesting charts with upcoming unlocks per allocation", Streamflow's tokenomics dashboard) confirms the table-stakes set: per-allocation unlock calendar + cumulative vest curve + claimed-vs-unclaimed status — our staircase/DilutionPath charts already exceed this, but a per-advisor "unlock calendar" view is a visible gap worth noting.

## Sources
- https://hedgey.finance/ — marketing site, features, FAQ, testimonials
- https://hedgey.finance/claims — Token Claims product page (AirClaim/AirStream/AirVest steps)
- https://hedgey.gitbook.io/hedgey-community-docs — company overview, customer list
- https://hedgey.gitbook.io/hedgey-community-docs/for-developers/technical-documentation/token-vesting — vesting contract architecture (ERC-721 escrow)
- https://hedgey.gitbook.io/hedgey-community-docs/for-developers/technical-documentation/token-lockups — lockup variants, NFT composability
- https://hedgey.gitbook.io/hedgey-community-docs/hedgey/vesting-plans/getting-started/for-issuers — issuer wizard walkthrough
- https://hedgey.gitbook.io/hedgey-community-docs/hedgey/vesting-plans/getting-started/for-recipients — recipient claim UX, graph hover (+ Loom demo)
- https://hedgey.gitbook.io/hedgey-community-docs/hedgey/token-claims/getting-started/for-claims-issuers — CSV + Merkle rootchecker verification
- https://hedgey.gitbook.io/hedgey-community-docs/for-developers/audits — per-contract audit table
- https://app.hedgey.finance/vesting/create — live 4-step creation wizard
- https://diligence.consensys.io/audits/2023/06/hedgey-token-lockup-and-vesting-plans/ — Consensys audit (OBO centralization risk)
- https://medium.com/hedgey/hedgey-exploit-post-mortem-784e9860fd8d — official exploit postmortem
- https://www.certik.com/blog/hedgey-finance-incident-analysis — corrected ~$2M loss figure
- https://www.anchorage.com/insights/anchorage-digital-launches-full-stack-token-management-solution-to-power-next-generation-protocol-growth — acquisition/HedgeyPro announcement
- https://www.theblock.co/post/382876/anchorage-token-lifecycle-management-hedgey-acquisition — acquisition reporting
- https://streamflow.finance/blog/streamflow-vs-hedgey — 2026 competitor comparison (pricing, $150/mo tier) — vendor-biased
- https://www.finance4.net/top-token-vesting-platforms/ — neutral 2026 platform archetype comparison
- https://www.magna.so/blog-posts/is-your-token-launch-ready-for-2026 — Magna positioning/TVL (vendor)

---

## Hands-on browser evidence (2026-06-11)

App structure verified live at app.hedgey.finance (SPA renders wallet-gated; modules in nav): **Vesting Plans (/vesting) · Investor Lockups · Token Claims · Token Grants · Treasury Lockups · Time Locks · LP Lockups**, with "Connect a wallet" gating all data, a "View on Safe" affordance on the Vesting page (Safe-native ops), a disabled "Create a Vesting Plan" CTA until connect, and an entry split asking "Token Manager vs Recipient." Issued vs Received vesting plans are separate sections with connect-prompt empty states.
