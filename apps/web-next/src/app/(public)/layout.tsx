"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";

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
          <Link href="/dashboard" className="flex items-center text-brand-text">
            <Logo variant="full" size="sm" priority />
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
