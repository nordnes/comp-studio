// R6.3 (rubric): the PINNED stress fixture — a 25-advisor × 4-grant board, loadable via
// ?fixture=25x4 (the store's bootstrap lazy-imports this module; it never enters the entry
// bundle). Deterministic: ids/names/quantities derive from the index, no randomness, so a
// keystroke-latency measurement is reproducible run to run.
export function board25x4() {
  const SECTORS = [
    "Asset Management — Hedge Funds & Family Offices",
    "Capital Markets & Banking",
    "Technology & FinTech",
    "Regulatory & Legal",
  ];
  const advisors = Array.from({ length: 25 }, (_, i) => {
    const n = i + 1;
    const grants = [
      {
        id: `fx-${n}-eq`,
        instrument: "option",
        round: "bridge",
        quantity: 200 + n * 7,
        curve: "cert-v3",
        vestStartISO: "2026-06-01",
        lifecycle: "granted",
      },
      {
        id: `fx-${n}-eq2`,
        instrument: "option",
        round: "seriesA",
        quantity: 100 + n * 3,
        curve: "cert-v3",
        vestStartISO: "2026-09-01",
        lifecycle: "draft",
      },
      {
        id: `fx-${n}-tk`,
        instrument: "rta",
        round: "bridge",
        quantity: 1_000_000 + n * 50_000,
        curve: "rta",
        vestStartISO: "2026-06-01",
        lifecycle: "granted",
      },
      {
        id: `fx-${n}-cash`,
        instrument: "cash",
        round: "bridge",
        valueUSD: 10_000 + n * 1_000,
        curve: "cert-v3",
        vestStartISO: "2026-06-01",
        lifecycle: "granted",
      },
    ];
    return {
      id: `fx-a${n}`,
      name: `Fixture Advisor ${String(n).padStart(2, "0")}`,
      sector: SECTORS[i % SECTORS.length],
      mode: "tier",
      tier: i % 3,
      years: 4,
      splitOptions: 0.65,
      annualValue: 50_000 + n * 5_000,
      hasCash: false,
      cashAnnual: 0,
      startDate: "2026-06-01",
      upliftStartMonth: 6,
      grantRound: "bridge",
      taxResidency: n % 2 ? "UK" : "US",
      notes: "",
      grants,
    };
  });
  return { name: "Stress fixture · 25 × 4", advisors };
}
