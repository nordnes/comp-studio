import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// frappe-ui ships as raw source whose components use `~icons/lucide/*` virtual imports, so its
// Vite plugin is REQUIRED to build. Disable the Frappe-site bits (we are backendless): frappeProxy
// (dev proxy to a Frappe site), jinjaBootData (Frappe Jinja injection), buildConfig (would override
// our dist output to the Frappe app layout).
import frappeui from 'frappe-ui/vite';

// Static SPA — no Frappe backend. Output to dist/ for Vercel.
export default defineConfig({
  plugins: [
    frappeui({ frappeProxy: false, jinjaBootData: false, buildConfig: false }),
    vue(),
  ],
  build: { outDir: 'dist', target: 'es2020' },
  // frappe-ui components import feather-icons (CJS); force it into optimizeDeps or Vite DEV throws
  // "feather-icons does not provide an export named 'default'" and nothing renders.
  optimizeDeps: { include: ['feather-icons'] },
});
