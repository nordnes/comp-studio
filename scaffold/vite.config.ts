import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// frappe-ui ships as raw source whose components use `~icons/lucide/*` virtual imports, so its
// Vite plugin is REQUIRED to build. Disable the Frappe-site bits (we are backendless): frappeProxy
// (dev proxy to a Frappe site), jinjaBootData (Frappe Jinja injection), buildConfig (would override
// our dist output to the Frappe app layout).
import frappeui from "frappe-ui/vite";

// Static SPA — no Frappe backend. Output to dist/ for Vercel.
export default defineConfig({
  plugins: [frappeui({ frappeProxy: false, jinjaBootData: false, buildConfig: false }), vue()],
  // R6.1 (panel 006): the full feather set (~76 KB min) ships for TWO icons — alias it to the
  // minimal shim (src/shims/feather-icons.ts). frappe-ui's lucide branch + ~icons imports are
  // untouched; the shim documents how to extend when a new feather-path icon appears.
  resolve: {
    alias: {
      "feather-icons": fileURLToPath(new URL("./src/shims/feather-icons.ts", import.meta.url)),
      // FIX-9 (panel 009 R6.1): headlessui ships only for three frappe-ui components none of
      // which render here (FormControl's static Autocomplete import keeps it reachable) —
      // 27.7 kB of total-JS budget for zero rendered code. See src/shims/headlessui.ts.
      "@headlessui/vue": fileURLToPath(new URL("./src/shims/headlessui.ts", import.meta.url)),
    },
  },
  // terser (2 compress passes) over esbuild-minify — measured ~3% smaller on this codebase,
  // keeping the R6.1 total-JS ceiling honest as M11/M12 surfaces land (panel 005 measured the
  // esbuild build 0.45% over the 1.0 MB budget; terser DEFAULTS came out larger — passes:2 and
  // toplevel mangling are what actually win here).
  build: {
    outDir: "dist",
    target: "es2020",
    minify: "terser",
    terserOptions: {
      compress: { passes: 2 },
      mangle: { toplevel: true },
      format: { comments: false },
    },
  },
  // (the old optimizeDeps include for feather-icons is gone — the alias resolves to ESM source)
});
