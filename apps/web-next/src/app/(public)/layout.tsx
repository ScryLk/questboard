"use client";

import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-y-auto bg-brand-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-brand-border bg-brand-primary/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-brand-text">
            <Swords className="h-5 w-5 text-brand-accent" />
            <span className="font-heading text-sm font-bold">QuestBoard</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
