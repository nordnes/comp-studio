// FIX-9 (panel 009 R6.1): the @headlessui/vue shim — the same budget pattern as the feather
// shim (panel 006). frappe-ui declares headlessui as a dependency, but only THREE of its
// components import it (Autocomplete, ListFilter/NestedPopover, its own CommandPalette) and
// NONE of them render in this app: FormControl statically imports Autocomplete yet we never
// pass type="autocomplete", ListFilter is unused, and the app's ⌘K palette runs on reka-ui
// primitives (CommandPalette.vue, FIX-9). The real library cost 27.7 kB of the 1.0 MB total-JS
// budget for zero rendered code. If a surface ever NEEDS one of these (e.g. a FormControl
// autocomplete), remove the alias in vite.config.ts — the dependency is still installed.
import { defineComponent, h } from "vue";

const stub = (name: string) =>
  defineComponent({
    name: `HeadlessuiStub${name}`,
    inheritAttrs: false,
    setup(_, { slots }) {
      // renderless passthrough — enough to mount without error if ever reached; the slot
      // contract (v-slot props) is intentionally absent because nothing renders these.
      return () => h("div", { "data-headlessui-stub": name }, slots.default?.({}));
    },
  });

export const Combobox = stub("Combobox");
export const ComboboxInput = stub("ComboboxInput");
export const ComboboxOption = stub("ComboboxOption");
export const ComboboxOptions = stub("ComboboxOptions");
export const ComboboxButton = stub("ComboboxButton");
export const Popover = stub("Popover");
export const PopoverButton = stub("PopoverButton");
export const PopoverPanel = stub("PopoverPanel");
