# Coinbase Token Manager (ex-Liquifi) — competitor deep-dive (2026-06-11)

> Relevance tags: **[R]** = relevant to Advisor Comp Studio (advisory equity+token comp modeling, tiers, guardrails, governance checklist, audit log, watermarked Proposition doc) · **[NR]** = not relevant / different problem.

## Snapshot — positioning, acquisition history, target user, pricing

- **What it is:** "The institutional standard for token operations" — an end-to-end token-management platform covering token cap tables, vesting & lockup automation, TGE launch management, bulk distributions, tax withholding, and Prime custody integration. ([coinbase.com/tokenmanager](https://www.coinbase.com/tokenmanager), fetched 2026-06-11)
- **Origin:** Liquifi, founded 2021 by Robin Ji (CEO) and Oliver Tang (CTO), Y Combinator W22, positioned as "the Carta for web3"; **$5M seed (Apr 2022)** led by Dragonfly Capital with Nascent, Alliance DAO, 6th Man Ventures, Robot Ventures, YC, Orange DAO and angels incl. Balaji Srinivasan, Katie Haun, Packy McCormick ([TechCrunch](https://techcrunch.com/podcast/liquifi-is-building-carta-web3-for-crypto-companies-tokens-blockchain/); [TokenInsight](https://tokeninsight.com/en/news/crypto-management-app-liquifi-closes-5-million-funding-round-led-by-dragonfly-capital)).
- **Acquisition:** Coinbase acquired Liquifi on **2025-07-02**, terms undisclosed — Coinbase's 4th acquisition of 2025, after the $2.9B Deribit deal ([CoinDesk](https://www.coindesk.com/business/2025/07/02/coinbase-acquires-token-management-platform-liquifi-for-undisclosed-amount); [The Block](https://www.theblock.co/post/360758/coinbase-acquires-token-operations-startup-liquifi-in-fourth-acquisition-this-year); [Coinbase blog](https://www.coinbase.com/blog/Coinbase-acquires-LiquiFi-the-leading-token-management-platform)). At acquisition Liquifi managed **$8.5B+ in assets**, had processed **$1.7B in transaction volume**, and served **100+ companies** (Gitcoin, Layer3, OP Labs, Ethena, Zora, 0x).
- **Rebrand:** Announced **2026-02-02** (blog by Rick Schonberg & Robin Ji); Liquifi became **Coinbase Token Manager on 2026-02-28**. Pitch: automate vesting & distributions, centralize cap tables, simplify compliance, integrate with Coinbase Prime custody. Pairs with the Oct-2025 **Echo** acquisition for a full stack: raise (Echo) → manage cap table/vesting (Token Manager) → custody/trade (Prime/exchange) ([rebrand blog](https://www.coinbase.com/blog/introducing-coinbase-token-manager-the-next-evolution-of-liquifi)).
- **Target user:** token-issuing teams "from pre-token launch to post-launch" — pre-TGE startups through "mature, global protocols" (Uniswap Foundation, Optimism, Ethena, Starknet, Animoca, Livepeer, SuperRare, Goldfinch, Axelar, Mythical logos on the legacy site; "90+ companies… 400K+ stakeholders" — [archived liquifi.finance, Jan 2025](http://web.archive.org/web/2025/https://www.liquifi.finance/)).
- **Pricing:** Legacy Liquifi FAQ (archived 2025): **4 tiers — Starter | Growth | Scale | Enterprise, starting at $900/mo**, "with variables like number of stakeholders and feature add-ons"; specifics sales-gated ([archived FAQ](http://web.archive.org/web/2025/https://www.liquifi.finance/faqs)). Post-acquisition the Coinbase page publishes **no pricing at all** — only "Request a demo" (currently a Google Form) and "Sign in" to tokenmanager.coinbase.com. [uncertain] whether the $900/mo floor survived the rebrand; no public 2026 price list found.

## Complete feature inventory — by module

**1. Token cap table [R]** — Real-time system of record replacing spreadsheets: "tracks every token grant and lockup"; records grants, warrants, options, and lockup agreements; shows vesting progress, unlocked amounts, withheld tokens, ownership and dilution. Works **pre-token** ("Can I use Liquifi without a token? Of course… token plans… ready to be delivered when your token launches" — archived FAQ). URL: https://www.coinbase.com/blog/introducing-coinbase-token-manager-the-next-evolution-of-liquifi · https://web.archive.org/web/2025/https://www.liquifi.finance/faqs

**2. Vesting & lockup automation [R]** — Core module ("Liquifi Distribute"). Two execution rails: **custodian integrations OR smart-contract-based** vesting/lockups ("Set and forget your token distribution schedules with custodian integrations or smart contract-based vesting and lockups" — coinbase.com/tokenmanager). Schedule types: cliffs, linear, back-/front-weighted, custom; "vesting schedule templates and built-in milestone-based vesting" were "coming soon" in 2025. Distinct, stackable **vesting vs lockup** schedules "to exactly match your legal agreements," with correct token-status tracking for tax/compliance. Supports importing already-running schedules. Smart-contract-free option via Safe multi-sig ([guide](https://www.liquifi.finance/post/token-vesting-without-smart-contracts)). URL: https://web.archive.org/web/2025/https://www.liquifi.finance/vesting-and-lockups

**3. TGE / token launch management [R-partial]** — "Bridges allocation planning to secure custody"; advisory drawn from "100+ token launches"; pre-TGE guidance on allocation types, grant programs, withholding obligations, **83(b) elections**, plus a partner network (market makers, foundation entities, tax accountants, law firms, custody providers, launchpads) at discounted rates (archived FAQ). Legacy site showed a launch-prep diagram: "choosing legal counsel, fundraising, and addressing tax considerations." URL: https://www.coinbase.com/tokenmanager

**4. Bulk distributions / airdrops [NR]** — "Batched transaction engine… send tokens to 10,000+ stakeholders as easily as sending an email." Proof points: Ethena airdrop — 37,000 transactions, 51,000 unique wallets, $400M+ claimed over a weekend, <1% support-ticket ratio; Renzo — $275M to 100k+ users. URL: https://www.liquifi.finance/post/how-ethena-launched-their-token-with-custom-unlocks-and-apis-using-liquifi (archive)

**5. Claim portals [NR/partial]** — Stakeholders click **"Claim"** and elect to receive awards **as tokens or as fiat**; fiat path auto-swaps via 0x Swap API to USDC, off-ramps, and deposits to a bank account in one transaction. Custom-branded claim pages built per client (Ethena: "custom UI claim portal… helped ensure a smooth user experience for users accustomed to the Ethena UI" — Guy Young). URL: https://0x.org/case-studies/liquifi

**6. Tax withholding & payroll [R-partial]** — "Real-time token tax withholdings configured for every country"; country-specific employee withholding rates surfaced per stakeholder; integrates with payroll providers **ADP, JustWorks, Gusto, Deel, Remote, Sequoia, Insperity, TriNet** "and more"; **EOR & global payroll** powered by Deel; **sell-to-cover** via regulated OTC partners. URL: archived FAQ + https://www.liquifi.finance/post/automating-token-tax-withholdings (title via archive)

**7. Compliance / KYC [R-partial]** — "Compliance-first architecture"; qualified-custodian lockup setups for investors; navigating "evolving crypto laws"; compliant airdrop tooling "without writing a line of code." Explicit KYC screening is implied rather than documented publicly. [uncertain] on exact KYC vendor/flow. URL: https://www.coinbase.com/tokenmanager

**8. Stakeholder portal [R — most relevant module]** — Per-grant view with **separate "Vested" and "Unlocked" progress tracks**, withheld amounts, and a schedule chart; stakeholders "log in to their portal and view when their tokens can be claimed/delivered," see upcoming unlocks and history. Documented in screenshots (see UI/UX below). URL: https://www.coinbase.com/tokenmanager

**9. Document management & e-signatures [R]** — Upload your own templates or use built-ins; custom data-request fields (jurisdiction, wallet address, allocation, vesting schedule, lockup, purchase price); send for signature; **"Liquifi automatically keeps your records up to date by creating a token grant upon execution of the agreement"** — document execution and cap-table record are atomically linked. URL: https://www.liquifi.finance/post/token-document-management (archive)

**10. Custody & wallet integrations [NR]** — Coinbase Prime, Anchorage Digital (+ Porto), Gnosis Safe, Fireblocks, BitGo, Squads (was "coming soon"); WalletConnect wallets (MetaMask, Rabby, Ledger, Phantom, Rainbow, Trezor, Coinbase Web3 Wallet); walletless/account-abstraction via Dynamic.xyz and ZeroDev. Chains: Ethereum, Polygon, Avalanche, BNB, Arbitrum, Optimism, Ronin, EON, Scroll; custodian-supported: Solana, Cosmos, Celo, Manta, Root, Berachain, Shardeum. URL: archived FAQ / vesting-and-lockups page.

**11. Reporting / audit / API [R-partial]** — Recordkeeping and historical grant issuance/acceptance records; custom APIs for tracking contracts and token amounts (built for Ethena); monthly recalculate/reissue workflows with "security & accuracy checks." URL: Ethena case study (archive).

**12. OTC sales [NR]** — "Execute large cryptocurrency transactions safely and discreetly with our regulated OTC partners."

## UI/UX documentation

**IA/navigation.** Legacy Liquifi: top nav = Products (6 modules: Vesting and lockups · Global tax withholdings · Token launch management · EOR and global payroll · Airdrops · OTC sales) / Resources (Learn: Blog, Guides; Support: Help center, FAQ) / Log in / "Get in touch." Post-rebrand this collapses to **one marketing page** under coinbase.com/tokenmanager (nav: Request a demo · Sign in · Help · Blog), with the app at **tokenmanager.coinbase.com**. The Coinbase page is far thinner than the legacy site — four feature cards + four value props.

**Key screens (documented via the page's screenshot alt-texts — quoted verbatim):**
- Hero: *"Chart showing upward progress in a staircase-like progression"* (token-balance staircase — same idiom as Comp Studio's valuation staircase chart).
- Vesting card: *"'Employee token grant' screen with Vested and Unlocked categories"* — the admin/stakeholder grant detail separates vesting state from lockup state as two categories.
- Launch card: *"Status bars for various categories"* — allocation buckets tracked with per-category progress bars.
- Airdrop card: *"'Airdrop' action screen with overlapping user avatars and a 'Send tokens' button"* — bulk action framed as a single primary button over a recipient avatar stack.
- Tax card: *"List of users showing their avatar, country, and tax rate"* — the stakeholder table carries **country and tax-rate columns** inline.

**Legacy-site screens (archived alt-texts, Jan 2025):**
- *"Screenshot of the Liquifi app displaying an employee's token grant details, including vesting and unlocking progress, tax withholding, and a visual graph illustrating the vesting and lockup schedule."*
- *"…two progress bars that show the current status of vesting and unlocking progress."*
- *"A line chart displaying a vesting and lockup schedule. A cursor hovers over a vertical line labelled 'Today', with a popover displaying vested, unlocked, withheld, and net quantity of tokens received."* — i.e., a four-figure decomposition (gross → vested → unlocked → withheld → **net received**) at the time cursor.
- *"…three stakeholders, their respective countries, and the applicable tax rates"*; *"A cursor hovering over the 'Send Tokens' button"*; *"interface for selling tokens in exchange for USDC… to handle tax withholding"* (sell-to-cover); *"Diagram outlining the various steps in token launch preparation, such as choosing legal counsel, fundraising, and addressing tax considerations."*

**Claim flow (stakeholder):** grant lands → portal shows Vested/Unlocked tracks → "Claim" → choose tokens or fiat → if fiat: 0x swap to USDC + off-ramp + bank transfer in one transaction (0x case study). For big TGEs, a white-label claim page in the issuer's own brand connects to Liquifi underneath (Ethena).

**Visual tone.** Legacy: clean light fintech SaaS with product screenshots and customer-logo walls. Post-rebrand: Coinbase corporate design system — institutional blue, heavy legal disclaimers (NYDFS licensing, "not… legal, or tax advice"), enterprise voice ("The institutional standard").

## Known criticisms & limitations

Third-party review coverage is **explicitly thin**: no substantive G2/Capterra reviews found; a [SourceForge listing](https://sourceforge.net/software/product/Liquifi/) exists without meaningful user reviews. What can be sourced:
- **Pricing opacity** — sales-gated at Liquifi ($900/mo floor only via FAQ); zero public pricing post-acquisition. [primary/archived FAQ]
- **Loss of self-serve depth post-acquisition** — the legacy product pages, blog (incl. the benchmarks dataset), guides and FAQ now 301-redirect to the single Coinbase marketing page; the knowledge corpus is only reachable via archive. (Observed directly: liquifi.finance/* → coinbase.com/tokenmanager.)
- **Early-integration roughness** — the official "Request a demo" CTA is a **Google Form** (forms.gle) on the Coinbase page, 2026-06-11.
- **Ecosystem-concentration concern** — press framed the deal as Coinbase locking issuers into its raise→manage→custody→list stack (Echo + Token Manager + Prime) ([Decrypt](https://decrypt.co/328192/coinbase-acquires-token-management-platform-liquifi-as-exchange-aims-to-expand-its-services); [The Block](https://www.theblock.co/post/360758/coinbase-acquires-token-operations-startup-liquifi-in-fourth-acquisition-this-year)); much of the post-rebrand coverage is advertorial/press-release content (InsideBitcoins, cryptonews advertorial, 99bitcoins PR), so independent assessment is scarce.
- **No public sandbox/self-serve trial**; institution-only onboarding.

## Data, benchmarks & methodology (Liquifi vesting benchmarks — recovered)

Source: **"Token Vesting and Allocations Industry Benchmarks"** (Robin Ji, 2022-06-15, updated with 2023 data on 2024-03-02), recovered via Wayback ([archived post](http://web.archive.org/web/2025/https://www.liquifi.finance/post/token-vesting-and-allocation-benchmarks)). Methodology: public docs/blog posts cross-checked against on-chain data, normalized through a proposed standard definitions framework (vesting vs lockups vs cliffs treated interchangeably for "duration of preventative selling"); explicitly benchmarked against the Stephanian/Coopahtroopa token-distribution analysis (team allocation 18.6% vs their 17.5%). Headline numbers:
- **Core team 18.8%**, investors 13% avg (**16–19% among projects that actually raised**), treasury ~22%, community/ecosystem **40.5%**, public sales 4.2% (down from 55% in 2017 to ~1% in 2023), **partners & advisors 1.5%** ← directly relevant anchor for Raiku's advisor-pool sizing debate (spec Part 17).
- Vesting: **4-year most common, then 3-year** (>50% of projects on 3–4y); **1-year cliff most common; 26% no cliff**; weighted (front/back-loaded) vesting in **7.8%** of schedules; immediate unlocks in **8.0%**; investor lockups **2–3 years**; minimum ~1-year post-TGE lockup the norm.
- Customer-sourced examples: Goldfinch 12-month US transfer restriction; dYdX 48-month gradual lockup (archived vesting page).
Scale stats published by Liquifi over time: $8B+/$8.5B+ managed, $1.7B+ distributed, 300k→400K+ stakeholders, 80→90→100+ customers ([0x case study](https://0x.org/case-studies/liquifi); archived homepage; [acquisition blog](https://www.coinbase.com/blog/Coinbase-acquires-LiquiFi-the-leading-token-management-platform)).

## Integrations & security/compliance

- **Custody:** Coinbase Prime (native, post-acquisition the headline integration), Anchorage Digital + Porto, Gnosis Safe, Fireblocks, BitGo, Squads. **Payroll/HRIS:** ADP, JustWorks, Gusto, Deel (also EOR), Remote, Sequoia, Insperity, TriNet. **Swaps/off-ramp:** 0x Swap API (vested-token → USDC → fiat, integrated "in 1 day"). **Wallets:** WalletConnect set + walletless via Dynamic.xyz/ZeroDev.
- **Security:** "Liquifi's contracts are fully secure, audited by multiple firms" (legacy marketing, via search snippet of liquifi.finance); option to avoid smart contracts entirely (Safe multi-sig or custodial rails). No public SOC 2 attestation found for Liquifi specifically [uncertain]; post-acquisition it inherits Coinbase's institutional posture — Coinbase, Inc. NYDFS-licensed; Coinbase Custody Trust Company is an NYDFS limited-purpose trust (page disclaimer).
- **Compliance:** per-country withholding tables, qualified-custodian investor lockups, 83(b)/withholding guidance pre-TGE, document/e-sign recordkeeping as audit trail.

## Patterns worth borrowing for Advisor Comp Studio

1. **Twin progress tracks per grant — "Vested" vs "Unlocked."** Render each advisor grant with two stacked progress bars (options vested vs tokens unlocked/exercisable) instead of one blended bar; mirrors our vesting-vs-lockup legal distinction in the trajectory system.
2. **"Today" cursor line on the schedule chart with a decomposition popover** (vested / unlocked / withheld / **net**). Direct analog: a Today marker on the vesting timeline whose popover shows gross → vested → strike cost → **net-of-strike value** per scenario.
3. **Country + tax-rate columns inline in the stakeholder table.** Our advisor roster table can carry tier, compa-ratio, and guardrail-status columns the same way — compliance data as first-class table columns, not a detail page.
4. **Vesting and lockups as separate, stackable schedule objects "to exactly match your legal agreements."** Keep Comp Studio's engine modeling vesting and any transfer-restriction windows as distinct layered schedules rather than one curve.
5. **Document execution auto-creates the ledger record** ("creating a token grant upon execution of the agreement"). When a Proposition is finalized/accepted, auto-append the audit-log entry and lock the scenario snapshot — one source of truth, no manual re-keying.
6. **Schedule templates + custom fields** for fast setup of complex grants → FAST-tier presets that pre-fill schedule, allocation and legal fields, still editable per advisor.
7. **Launch-prep checklist as a first-class diagram** (legal counsel → fundraising → tax steps) → render the governance/consents checklist as a visual stepper with owner + status, not just a list.
8. **Per-category allocation status bars** (launch screen) → show advisor-pool consumption per tier as budget status bars against the 10%/15% pool options.

## Sources

- https://www.coinbase.com/tokenmanager — [primary] (en-gb variant redirects/serves same page)
- https://www.coinbase.com/blog/introducing-coinbase-token-manager-the-next-evolution-of-liquifi — [primary]
- https://www.coinbase.com/blog/Coinbase-acquires-LiquiFi-the-leading-token-management-platform — [primary] (content via search index; direct fetch returned empty)
- http://web.archive.org/web/2025/https://www.liquifi.finance/ — [primary, archived]
- http://web.archive.org/web/2025/https://www.liquifi.finance/faqs — [primary, archived] (pricing, networks, payroll integrations)
- http://web.archive.org/web/2025/https://www.liquifi.finance/vesting-and-lockups — [primary, archived]
- http://web.archive.org/web/2025/https://www.liquifi.finance/post/token-vesting-and-allocation-benchmarks — [primary, archived] (benchmarks dataset)
- http://web.archive.org/web/2025/https://www.liquifi.finance/post/how-ethena-launched-their-token-with-custom-unlocks-and-apis-using-liquifi — [primary, archived]
- http://web.archive.org/web/2025/https://www.liquifi.finance/post/token-document-management — [primary, archived]
- https://0x.org/case-studies/liquifi — [secondary] (partner case study; claim/off-ramp flow, scale stats)
- https://www.coindesk.com/business/2025/07/02/coinbase-acquires-token-management-platform-liquifi-for-undisclosed-amount — [secondary]
- https://www.theblock.co/post/360758/coinbase-acquires-token-operations-startup-liquifi-in-fourth-acquisition-this-year — [secondary]
- https://decrypt.co/328192/coinbase-acquires-token-management-platform-liquifi-as-exchange-aims-to-expand-its-services — [secondary]
- https://techcrunch.com/podcast/liquifi-is-building-carta-web3-for-crypto-companies-tokens-blockchain/ — [secondary]
- https://tokeninsight.com/en/news/crypto-management-app-liquifi-closes-5-million-funding-round-led-by-dragonfly-capital — [secondary]
- https://help.coinbase.com/en/coinbase/introduction-to-coinbase-token-manager-migration-guide — [primary] [uncertain — JS-rendered, content not retrievable without login/browser]
- https://sourceforge.net/software/product/Liquifi/ — [review] (listing only; no substantive reviews)
- https://insidebitcoins.com/press-releases/from-liquifi-to-coinbase-token-manager-a-strategic-evolution · https://advertorial.cryptonews.com/press-releases/coinbase-token-manager-marks-the-next-chapter-for-liquifi/ · https://99bitcoins.com/news/pr-news/coinbase-token-manager-redefines-how-on-chain-token-lifecycles-are-managed/ — [secondary, advertorial/PR — treat with caution]
