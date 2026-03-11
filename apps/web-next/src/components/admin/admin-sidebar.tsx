"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Castle,
  Gamepad2,
  Flag,
  Settings,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/campaigns", label: "Campanhas", icon: Castle },
  { href: "/admin/sessions", label: "Sessões", icon: Gamepad2 },
  { href: "/admin/reports", label: "Denúncias", icon: Flag },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-brand-border bg-brand-sidebar">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-brand-border px-5 py-4">
        <ShieldAlert className="h-5 w-5 text-brand-danger" />
        <span className="text-lg font-bold text-brand-text">Admin</span>
        <span className="ml-auto rounded-md bg-brand-danger/15 px-2 py-0.5 text-[10px] font-semibold text-brand-danger">
          Super Admin
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Painel
        </p>
        <nav className="flex flex-col gap-0.5">
          {ADMIN_NAV.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-accent-muted text-brand-accent"
                    : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Back to Dashboard */}
      <div className="border-t border-brand-border px-3 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}
