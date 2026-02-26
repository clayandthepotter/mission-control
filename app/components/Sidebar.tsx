"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "⚡" },
  { href: "/agents", label: "Agents", icon: "🤖" },
  { href: "/pipeline", label: "Pipeline", icon: "🔄" },
  { href: "/tasks", label: "Tasks", icon: "📋" },
  { href: "/crons", label: "Crons", icon: "⏰" },
  { href: "/skills", label: "Skills", icon: "🧠" },
  { href: "/costs", label: "Costs", icon: "💵" },
  { href: "/finance", label: "Finance", icon: "📊" },
  { href: "/products", label: "Products", icon: "📦" },
  { href: "/docs", label: "Knowledge", icon: "📚" },
  { href: "/notes", label: "Notes", icon: "🗓️" },
  { href: "/activity", label: "Activity", icon: "📝" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r"
      style={{ borderColor: "var(--border)", background: "var(--paper)" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-lg font-bold tracking-tight lp-gradient-text">
          Mission Control
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-2)" }}>
          LeadsPanther Org
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "font-medium"
                  : "hover:opacity-80"
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
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-2)" }}>
        mc.leadspanther.com
      </div>
    </aside>
  );
}
