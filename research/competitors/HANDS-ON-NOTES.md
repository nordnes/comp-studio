# Hands-on browser evidence — public surfaces (2026-06-11)

Live walkthrough in Chrome of every publicly accessible surface among the 12 targets (no signups/logins,
per policy). Screenshot *files* could not be persisted this session (extension limitation), so each screen
is documented precisely below. Forgd's full signed-in walkthrough is separate: ../../FORGD_DEEP_DIVE.md.

## Levels.fyi — live demo offer (levels.fyi/employers/offer, embedded in the Employer Portal)
- **Employer Portal IA** (left rail, signed-out visible): TOTAL REWARDS — Compensation Percentiles,
  Competitive Intelligence, Data Explorer · TALENT ACQUISITION — Company Profile, Interactive Offers
  (active), Talent Pool.
- **Offer page:** photographic hero banner; confetti animation raining over the whole page; **light/dark
  toggle and a "Select a company" theme switcher** (re-brands the demo live). "Congratulations, Jason! 🎉"
  + prose ("…join the Mobile team at Ramp! … decision from you by December 30, 2026").
- Field cards row: Title (Software Engineer) · Level (Senior) · Start Date · Employment Type · Location
  ("New York, NY (hybrid)") — quiet gray label-over-value cards.
- **Overview — "First Year Total Compensation":** donut (dark-green/lime/periwinkle palette) + itemized
  legend: Base Salary $230,000 · **Equity (First Year) 8,333 RSUs ⓘ ~($375,000)** (units first, dollar
  value subordinated with ~ and ⓘ tooltip) · On-target Bonus $13,800 "6% of Base" · Sign On $30,000 ·
  Relocation $15,000. Total **animates as a count-up** ($25,344 → $663,778 over ~20s of observation).
- Page header strip: "Hiring someone soon?… Offers can be created standalone or automatically with
  Ashby & Greenhouse ATS integration!" + Book a Demo / + Create an Offer.

## Levels.fyi — public salary page (t/software-engineer/locations/united-kingdom)
- Hero stat card: **£87,774 MEDIAN TOTAL COMP** + three horizontal percentile bars in a green ramp
  (25TH% £60.1K · 75TH% £126K · 90TH% £171K) + "All Levels" dropdown; CTAs "💪 Contribute Your
  Salary" / "View Jobs"; SEO sentence with **"Last updated: 6/10/2026"** freshness stamp.
- "Recently Submitted Salaries" table: dark header row — Company (Location | Date) · Level Name (Tag) ·
  Years of Experience (Total / At Company) · **Total Compensation (GBP) (Base | Stock (yr) | Bonus)**;
  search-within-table + "Table Filter"; Subscribe bell; + Add Compensation; **skeleton shimmer rows**
  while data loads; floating bottom-right "Negotiate →" pill.

## Complete — /leveling (public marketing with real product screenshots)
- Visual tone: ink-purple serif display headline ("Skip the guesswork on understanding levels"),
  lavender-tinted cards, purple accent chips, soft shadows — the design-led register.
- **Band card:** "Engineering: Level 1 (Junior)" viewed as "Manager" (eyebrow chip) — a horizontal band
  with **employee avatars positioned along it** and Min / Mid / Max ticks below; one avatar ringed
  (selected person).
- **Leveling roster:** filter chips "Level: all · Location: San Francisco · Job Family: Engineering · Tier: T4";
  table Title / Level / Band where Band renders as a purple range bar per row (SE I → Principal).
- **Person card:** avatar + name, fields Level · Salary · Location · **Compa ratio** · Notes · "Last updated
  2mo ago".
- **Ladder card:** "Engineering" L1–L6 vertical ladder (Junior, Developer, Proficient, Skilled, Expert,
  Advisory) with per-level headcounts.
- **"Share with recruiters"** card: scoped share (To: person, message with a Link) — per-audience
  permissioning of the leveling view ("Tailor who sees what… controlling visibility of levels").

## Comprehensive — homepage + public benchmarking app
- Marketing claims rendered with G2 Winter-2026 badges (High Performer / Best Support / Easiest To Do
  Business With). Cookie banner: left untouched (no consent given).
- **Comp-cycle product screenshot:** dark-green app chrome; breadcrumb "Q2 Cycle > Amber Smith's
  Team"; **stepper tabs** Promotions / Salary [Next →] / Bonus Awards / Equity Grants / Summary; status
  chips "**Salaries Reviewed: 0 out of 6**" and "**Budget: $0 out of $23,625**"; roster columns Employee ·
  Job Profile · Performance Rating · Salary · **Compa Ratio Before/After** (a mini range bar per row with
  gray "before" and colored "after" markers + numeric labels, red when worse e.g. 0.62, green when ≥1) ·
  Proposed Raise ($ and % dual inputs with "10.00% Suggested" ghost hints).
- **Public Pay Range Tracker** (app.comprehensive.io/benchmarking/postings, no login): header search
  "Search By: [Family & Level | Job Title]" + family/level combo selects; **Salary Range card** — Low
  $140,000 / **Mid $163,500** (emphasized center card) / High $187,000 connected by a line with "14%"
  gap chips; percentile dropdown (50th); "View Data Points ⌄". **Level Comparison ladder**: IC1–IC6 then
  M3–M6 rows, each with name + YOE range + one-line definition, **sample-size chip ("Very Large",
  "391 Data Points")**, bookmark icon, Low/Mid/High columns, active level row highlighted. Left rail:
  FILTERS (Location, Company Stage, **Age of Data**, Industry, Company) · **DATASETS switcher
  (Comprehensive, Mercer, Comptryx, Salary.com)** · TOOLS (Saved benchmarks, Custom jobs) · Export
  Data button.

## Hedgey — app.hedgey.finance (public shell, wallet-gated beyond)
- **Persona fork on entry:** "Let's get started. What type of user are you?" → two cards, **Token Manager**
  ("how my team can use token vesting, investor lockups, distributions…") vs **Recipient** ("I have
  received vesting from my team…"), playful line illustrations, Get Started each; below: "Are you
  pre-token, or planning to launch?" tertiary path.
- Left rail products: Vesting Plans · Investor Lockups · Token Claims · Token Grants · Treasury Lockups ·
  Time Locks · LP Lockups; single blue **"Connect a wallet"** button is the only auth.
- Light, friendly fintech look (not crypto-dark); rounded sans (Quicksand-like) wordmark "Hedgey.";
  blue privacy-consent bar (Privacy settings / Accept all) — left untouched.

## Not reachable hands-on
- Capboard demo, Pequity, Aeqium, Pave, OpenComp, Compa, Coinbase Token Manager admin apps —
  all login-gated; covered from docs/marketing/review evidence in their per-service reports.
