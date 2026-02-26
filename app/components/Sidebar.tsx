"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { href: "/", label: "Overview", icon: "⚡" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/agents", label: "Agents", icon: "🤖" },
      { href: "/pipeline", label: "Pipeline", icon: "🔄" },
      { href: "/tasks", label: "Tasks", icon: "📋" },
      { href: "/crons", label: "Crons", icon: "⏰" },
      { href: "/activity", label: "Activity", icon: "📝" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { href: "/skills", label: "Skills", icon: "🧠" },
      { href: "/sops", label: "SOPs", icon: "📖" },
      { href: "/docs", label: "Knowledge Base", icon: "📚" },
      { href: "/notes", label: "Notes", icon: "🗓️" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/costs", label: "Costs", icon: "💵" },
      { href: "/finance", label: "Finance", icon: "📊" },
      { href: "/products", label: "Products", icon: "📦" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r h-screen sticky top-0"
      style={{ borderColor: "var(--border)", background: "var(--paper)" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-lg font-bold tracking-tight lp-gradient-text">
          Mission Control
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-2)" }}>
          LeadsPanther Org
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-2)" }}>
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      isActive ? "font-medium" : "hover:opacity-80"
                    }`}
                    style={{
                      background: isActive ? "var(--surface)" : "transparent",
                      color: isActive ? "var(--foreground)" : "var(--muted)",
                      borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                    }}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t shrink-0 flex items-center justify-between text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-2)" }}>
        <span>mc.leadspanther.com</span>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{ background: "var(--surface)" }}
        >
          {theme === "dark" ? "\u2600\ufe0f" : "\ud83c\udf19"}
        </button>
      </div>
    </aside>
  );
}
