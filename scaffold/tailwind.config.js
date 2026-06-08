// ESM config — the frappe-ui preset is ESM-only (no `require` condition in its exports), so a
// .cjs config fails. Tailwind v3 loads this via jiti. We ADOPT the frappe-ui Espresso preset as
// the design system (it sets the colour/font/radius/shadow scale + Inter). Keep Tailwind v3 (the
// preset is v3-only). Brand tweaks, if any, go in `theme.extend` below.
import frappeUIPreset from 'frappe-ui/tailwind'

export default {
  presets: [frappeUIPreset],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts}',
    './node_modules/frappe-ui/src/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      // Optional Raiku brand accents layered on top of the Espresso palette.
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
