# Coinbase Token Manager (ex-Liquifi) — Deep Dive

**Service:** https://www.coinbase.com/en-gb/tokenmanager · **Researched:** 2026-06-11 (agent deep-dive, cited) · Part of the 12-service competitive survey — see [INDEX.md](INDEX.md).

---

**Research value: high** — Concrete post-acquisition module inventory, the Feb 2026 rebrand, a major competitive shift (Kraken bought Magna), and UI specifics confirming the vesting-chart pattern Comp Studio is porting.

## Positioning & pricing
- **Rebrand:** Liquifi → **Coinbase Token Manager** on **Feb 28, 2026** (acquired July 2025). Positioned as "the institutional standard for token operations," pre- to post-launch. Login moved to a Coinbase URL; the Liquifi social presence folded into Coinbase Institutional.
- **Strategic frame:** part of a full-stack play with **Echo** (capital raising, acquired Oct 2025) + **Prime** (custody) + the exchange — "raise → manage cap table/vesting → custody/trade" in one vendor. "100+ top crypto teams"; Liquifi managed **$8.5B+ token value, 1.3M stakeholders, $1.7B distributed across 174 countries** by end-2024.
- **Pricing:** never public, unchanged post-acquisition. CEO Robin Ji (podcast): no list price — custom B2B quotes by stakeholder count / value moved / implementation depth. Sales-led enterprise access only.

## Feature inventory (by module)
- **Token cap table:** real-time on-chain system of record for grants, **warrants, options, and lockup agreements**; dashboards show vested / unlocked / withheld; positioned for investor reporting + securities compliance and dilution visibility.
- **Vesting & lockups engine:** linear, cliff, backdated, custom; **vesting + lockups tracked together as one status machine to match legal agreements** (their signature claim); templates for complex schedules; can import mid-flight schedules. Two execution modes: smart-contract vesting **or** custodian-integrated (off-chain tracking, distribute from custody).
- **Distributions:** batched transaction engine — bulk transfers/airdrops to 10,000+ stakeholders "as easily as sending an email"; claim-or-push; OTC and in-app token-swap (0x Swap API) for sell-to-cover.
- **Claim portal:** recipient dashboard with schedule chart + claim button; WalletConnect-compatible wallets (MetaMask, Rabby, Ledger, Safe, Phantom…) plus **walletless/account-abstraction onboarding via Dynamic.xyz and ZeroDev** (added 2024 as "embedded wallets").
- **Tax/compliance:** per-country tax withholding config (KPMG engine heritage), per-country token grant agreements (issue + e-sign + document storage), payroll integrations (**Remote, Justworks, Gusto**; Deel partnership), pre-formatted reports per payroll provider.
- **Custody:** Coinbase Prime native, but still multi-custodian: **Anchorage/Porto, Gnosis Safe, Fireblocks, BitGo**. Pitch: vested tokens land with a qualified custodian, not a hot wallet.
- **Chains:** EVM-first on-chain (Ethereum, Polygon, Avalanche, BNB, Arbitrum, Optimism, Ronin, Base et al.; 11 networks added in 2024); **Solana/Cosmos/Celo/Berachain only via the custodian path**, not native contracts.

## Key workflows
1. **Grant lifecycle:** in-app grant creation → country-specific agreement signed → schedule auto-tracks vested vs unlocked vs withheld → tax withheld at unlock → net distributed (push, or recipient claims).
2. **Token launch:** allocation planning → custody setup → TGE-day bulk distribution. Ethena case study: weekend airdrop, 37K txns, 51K wallets, $400M+ volume, <1% support-ticket ratio.
3. **Investor lockups:** enforce transfer restrictions post-vest; deliver directly into qualified custodian accounts.

## UI/UX documentation
- **Signature chart confirmed current:** cumulative vesting/lockup **line chart with a vertical "Today" marker; hover popover decomposes vested / unlocked / withheld / net received** — still the hero visual on liquifi.finance product pages (vesting-and-lockups, distribute).
- **Admin anatomy:** cap-table dashboard (totals by status), schedule templates, in-app grant creation, document repository, distribution batches. **Recipient:** portfolio view across multiple companies' grants, **email notifications when tokens unlock/are claimable**, connect-wallet → view schedule → claim → confirm txn. No public screenshots/videos of the rebranded Coinbase UI yet; product pages are the best visual source. (Caution: `liquifiorg.gitbook.io` / liquifi.org is an unrelated defunct DeFi project — ignore in any further research.)

## Review sentiment
- Sparse public reviews (sales-led product). Customer-side signal is positive but vendor-curated (Ethena, 0x, Uniswap Foundation, OP Labs, Zora).
- **Lock-in critique exists but mostly from competitors:** Streamflow (2026) flags "infrastructure independence" concerns post-Coinbase, EVM-centricity, and missing staking/white-label/mega-airdrop features. No organic customer complaints surfaced.
- **Toku v. Liquifi** trade-secret suit (ex-Toku GC, 25–29K files incl. tax-engine docs): preliminary injunction **denied**; Toku **settled with Liquifi Feb 2026**; claims against the individual dismissed with conditions Mar 2026. Reputational noise, no product impact.

## Competitive position vs Magna/Toku (2026)
- The independent mid-market has collapsed into exchange stacks: **Kraken/Payward acquired Magna Feb 18, 2026** (160+ clients, $60B peak TVL — larger TVL than Liquifi; multi-chain incl. Solana-native, white-label claims, staking; now the ops layer of "Kraken 360"). Coinbase vs Kraken is now the defining axis; **Toku remains independent** but is really an EOR/tax-payroll company that adjoins rather than replaces Token Manager (Magna even integrates Toku for withholding). Streamflow owns Solana-native.

## Takeaways for Comp Studio
1. **WS-F / 9e — the "Today"-marker vesting chart is still the category-defining visual in 2026:** cumulative line/area, vertical Today rule, hover popover decomposing **vested → unlocked → withheld → net**. Comp Studio's 9e timeline should replicate exactly this four-way decomposition (net-of-strike maps naturally onto Liquifi's "withheld→net" step).
2. **WS-G — model vesting and lockups as one combined status machine, not two charts:** Liquifi's core info-design claim is that token status (granted/vested/unlocked/withheld/net) mirrors the *legal agreement*, so finance and recipients read one source of truth. Comp Studio's grant detail should present a single status decomposition rather than separate vesting and lockup views.
3. **9c — "system of record replacing spreadsheets" is the trust pitch, and it rests on immutability + reconciliation:** Liquifi/Magna both sell the real-time cap table as the anti-spreadsheet. Comp Studio's sealed versions/immutable records are the internal-tool analog — lean into "one sealed source of truth per scenario" framing.
4. **Recipient-grade legibility drives adoption:** Liquifi's <1% support-ticket ratio on a $400M airdrop is attributed to a self-explanatory recipient portal (schedule chart + notify-on-unlock + claim). For Comp Studio, the advisor-facing draft view should be readable standalone by a non-finance advisor.
5. **No pricing/feature pressure to match:** these are sales-led enterprise execution platforms (distribution, custody, tax). Comp Studio's modeling/scenario layer (TGE FDV cases, governance consents) sits *upstream* of all of them — none of Token Manager/Magna/Toku does offer-stage scenario modeling, so there is no prior art to copy there beyond the visualization grammar.

## Sources
- https://www.coinbase.com/blog/introducing-coinbase-token-manager-the-next-evolution-of-liquifi — rebrand announcement, module list, Echo tie-in
- https://www.coinbase.com/tokenmanager — current product page (modules, "100+ teams", batched engine)
- https://www.liquifi.finance/vesting-and-lockups — vesting+lockup model, custodians, wallets, FAQ
- https://www.liquifi.finance/old-home — per-country grants, notifications, audits (Quantstamp/Macro/Sherlock)
- https://insidebitcoins.com/press-releases/from-liquifi-to-coinbase-token-manager-a-strategic-evolution — cap-table detail, Prime custody framing, 80-country tax partners
- https://99bitcoins.com/news/pr-news/coinbase-token-manager-redefines-how-on-chain-token-lifecycles-are-managed/ — payroll integrations (Remote/Justworks/Gusto), $8.5B figure
- https://streamflow.finance/blog/best-token-distribution-platforms-in-2026-top-5-solutions-compared — competitor critique, EVM-centricity, lock-in concerns (vendor source)
- https://blog.kraken.com/news/payward-acquires-magna + https://www.coindesk.com/business/2026/02/18/kraken-continues-acquisition-streak-by-buying-token-management-firm-magna-ahead-of-ipo-push + https://www.magna.so/magna-kraken-acquisition-faq — Magna/Kraken deal, $60B TVL, Kraken 360
- https://www.theaccountantquits.com/podcast/on-token-based-compensation — Robin Ji on custom pricing
- https://outposts.io/article/liquifi-2024-year-in-review-growth-and-innovation-in-token-a0b5423d-1832-479b-924c-1b37d686a327 — 2024 metrics, Ethena airdrop stats, embedded wallets
- https://0x.org/case-studies/liquifi — 0x Swap API integration, positioning quote
- https://blockworks.co/news/lawsuit-crypto-firms-confidential-info-sharing + https://www.hcamag.com/us/specialization/employment-law/delaware-court-keeps-ex-legal-chiefs-fee-fight-alive-against-toku/575259 — Toku v. Liquifi status (settled Feb 2026)

 I'm pulling together the research across all dimensions into a structured digest, keeping it around 1500 tokens. I need to be careful about the typosquat domain and cite the official liquifi.finance pages instead of the mirror site. The structure will cover research value, positioning and pricing, feature breakdown by module, key workflows, UI/UX documentation, review sentiment, and takeaways mapped to the comparison studio framework.
