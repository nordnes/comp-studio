// R6.1 (rubric, panel 006): a minimal feather-icons surface. frappe-ui's FeatherIcon imports
// the FULL feather set (~76 KB minified) but this app renders exactly TWO icons through the
// feather path — CommandPalette's 'search' and the Dropdown submenu 'chevron-right' (every
// other icon is a lucide CSS class; Button/Dialog chrome use the lucide branch or ~icons
// imports). The vite alias points 'feather-icons' here; FeatherIcon.vue reads
// feather.icons[name].{attrs, contents} and falls back to 'circle' for unknown names, so the
// fallback icon ships too. Adding a new feather-path icon = one entry here (the validator
// console-warns in dev when a name is missing — the signal to extend this map).
const ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  class: "feather",
};
const CONTENTS: Record<string, string> = {
  search:
    '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
  "chevron-right": '<polyline points="9 18 15 12 9 6"></polyline>',
  "chevron-down": '<polyline points="6 9 12 15 18 9"></polyline>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
  circle: '<circle cx="12" cy="12" r="10"></circle>',
};
const icons = Object.fromEntries(
  Object.entries(CONTENTS).map(([name, contents]) => [
    name,
    { name, contents, attrs: { ...ATTRS, class: `feather feather-${name}` } },
  ]),
);
export default { icons };
