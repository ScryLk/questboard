"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CreateSessionModal } from "@/components/create-session-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-primary">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onCreateSession={() => setCreateOpen(true)} />
        {/* Padding menor em mobile pra conteúdo não ficar espremido. */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
      <CreateSessionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
