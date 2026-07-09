"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/users", label: "Users", icon: "👥" },
    { href: "/dashboard/categories", label: "Categories", icon: "🏷️" },
    { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
    { href: "/dashboard/profile", label: "Profile", icon: "⚙️" },
  ],
  organizer: [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/my-events", label: "My Events", icon: "🎪" },
    { href: "/dashboard/my-events/create", label: "Create Event", icon: "➕" },
    { href: "/dashboard/announcements", label: "Announcements", icon: "📣" },
    { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
    { href: "/dashboard/profile", label: "Profile", icon: "⚙️" },
  ],
  participant: [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/tickets", label: "My Tickets", icon: "🎟️" },
    { href: "/dashboard/favorites", label: "Favorites", icon: "❤️" },
    { href: "/dashboard/reviews", label: "My Reviews", icon: "⭐" },
    { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
    { href: "/dashboard/profile", label: "Profile", icon: "⚙️" },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);
  if (!user) return null;

  const items = NAV[user.role];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white md:block">
      <div className="sticky top-[73px] flex h-[calc(100vh-73px)] flex-col justify-between overflow-y-auto p-4">
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 p-4 text-white">
          <p className="text-sm font-semibold capitalize">{user.role} account</p>
          <p className="mt-1 text-xs text-primary-100">Signed in as {user.name}</p>
        </div>
      </div>
    </aside>
  );
}
