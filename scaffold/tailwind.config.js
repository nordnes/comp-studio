// ESM config — the frappe-ui preset is ESM-only (no `require` condition in its exports), so a
// .cjs config fails. Tailwind v3 loads this via jiti. We ADOPT the frappe-ui Espresso preset as
// the design system (it sets the colour/font/radius/shadow scale + Inter). Keep Tailwind v3 (the
// preset is v3-only). Brand tweaks, if any, go in `theme.extend` below.
import frappeUIPreset from "frappe-ui/tailwind";

export default {
  presets: [frappeUIPreset],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts}",
    "./node_modules/frappe-ui/src/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {
      // Optional Raiku brand accents layered on top of the Espresso palette.
      colors: {
        // COM-38 (a11y): accessible darker amber for accent LABELS/eyebrows. Espresso's amber
        // ink-scale stops at ink-amber-3 (#DB7706 = 2.93:1 on surface-amber-2, fails AA). The
        // value is a theme-aware CSS var defined in src/style.css (dark mode keeps it bright).
        // Bright ink-amber-3 stays for the hero italic + graphical fills/bars/icons.
        "ink-amber-strong": "var(--ink-amber-strong)",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
      },
      // COM-89: the reading-column token (~960px keeps prose at the 65–75ch target). Reading-heavy
      // views (Overview/Advisors/Configure/Proposition + the footer) use max-w-reading; the dense
      // tables (Board/Compare) self-apply max-w-7xl instead.
      maxWidth: {
        reading: "60rem",
      },
    },
  },
  plugins: [],
};
