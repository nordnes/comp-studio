import { createApp } from "vue";
import "frappe-ui/style.css"; // Inter font + Tailwind (base/components/utilities) via the frappe-ui preset
import App from "./App.vue";
import router from "./router";
import "./style.css"; // app overrides — imported AFTER frappe-ui so our rules win
import { installDialogA11y } from "./a11y"; // R4.4: name + size the Dialog chrome's close X

// frappe-ui is ADOPTED as the UI system (Espresso/Inter preset + components + templates) — see
// TECH_BRIEF.md / IMPLEMENTATION_PLAN.md. Import components BY NAME in the views; do NOT call
// app.use(FrappeUI): that plugin opens a socket.io connection + installs the Frappe RPC/resource
// layer (backend-bound), which is wrong for this backendless static SPA. Recipe: research/EMPIRICAL.md.

const app = createApp(App);
app.use(router);
app.mount("#app");
installDialogA11y();
