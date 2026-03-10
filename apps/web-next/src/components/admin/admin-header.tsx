"use client";

import { usePathname } from "next/navigation";

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Usuários",
  "/admin/campaigns": "Campanhas",
  "/admin/sessions": "Sessões",
  "/admin/reports": "Denúncias",
  "/admin/settings": "Configurações",
};

export function AdminHeader() {
  const pathname = usePathname();
  const title = BREADCRUMB_MAP[pathname] ?? "Admin";

  return (
    <header className="flex h-14 items-center border-b border-brand-border bg-brand-sidebar px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-brand-muted">Painel Administrativo</span>
        <span className="text-brand-muted">/</span>
        <span className="font-medium text-brand-text">{title}</span>
      </div>
    </header>
  );
}
