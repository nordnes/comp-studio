// COM-93: the single source of truth for the nav model. The sidebar groups, the ⌘K palette's
// "Go to" list, and the router all consume this array — order here IS the presentation order
// everywhere, so the three surfaces can never drift apart again.
export type NavItem = { to: string; label: string; icon: string; group: string };

export const NAV: NavItem[] = [
  { to: "/overview", label: "Overview", icon: "lucide-layout-grid", group: "Board" },
  { to: "/board", label: "Board", icon: "lucide-users", group: "Board" },
  { to: "/compare", label: "Compare", icon: "lucide-layers", group: "Board" },
  // COM-141: company-level compliance sits with the analyse cluster — a one-item group is the
  // shape the sidebar avoids (see Configure note below).
  { to: "/governance", label: "Governance", icon: "lucide-shield-check", group: "Board" },
  { to: "/advisors", label: "Advisors", icon: "lucide-user", group: "Advisor" },
  { to: "/proposition", label: "Proposition", icon: "lucide-file-text", group: "Advisor" },
  { to: "/configure", label: "Configure", icon: "lucide-settings", group: "Configure" },
];

// Sidebar shape (COM-62 workflow groups): Board (analyse) · Advisor (package & share);
// Configure stays the footer item rather than a one-item group.
export const navGroups = NAV.filter((n) => n.group !== "Configure").reduce<
  { label: string; items: NavItem[] }[]
>((acc, item) => {
  const g = acc.find((x) => x.label === item.group);
  if (g) g.items.push(item);
  else acc.push({ label: item.group, items: [item] });
  return acc;
}, []);

export const configureItem = NAV.find((n) => n.to === "/configure")!;
