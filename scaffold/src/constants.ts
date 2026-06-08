// UI constants ported from reference/advisor-comp-studio.tsx (category + tier palettes). These are
// presentation data, NOT engine logic (the engine stays frozen). SCEN_COLORS lives in the engine.
export const CAT: Record<string, { label: string; color: string }> = {
  capital: { label: 'Capital', color: '#9C4A0C' },
  customer: { label: 'Customer', color: '#C46A1F' },
  partnership: { label: 'Partnership', color: '#3E5C76' },
  governance: { label: 'Governance', color: '#6B7F6E' },
};
export const CAT_OPTIONS = Object.entries(CAT).map(([value, v]) => ({ label: v.label, value }));
export const TIER_COLOR = ['#3E5C76', '#C46A1F', '#9C4A0C', '#6B7F6E'];
