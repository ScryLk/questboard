"use client";

import { useState } from "react";
import Link from "next/link";
import { Map, Swords, Users } from "lucide-react";
import { JoinCodeModal } from "@/components/join-code-modal";

const FEATURES = [
  {
    icon: Map,
    title: "Mapas Interativos",
    description: "Crie mapas com IA e terrenos exploraveis",
  },
  {
    icon: Swords,
    title: "Combate em Tempo Real",
    description: "Initiative tracker, rolagens e HP ao vivo",
  },
  {
    icon: Users,
    title: "Jogar de Qualquer Lugar",
    description: "Mobile ou desktop, mesma experiencia",
  },
];

export default function LandingPage() {
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-primary">
      {/* Navbar */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-brand-border bg-brand-primary/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold text-brand-accent">
            QuestBoard
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-brand-muted transition-colors hover:text-brand-text">
              Recursos
            </a>
            <a href="#pricing" className="text-sm text-brand-muted transition-colors hover:text-brand-text">
              Precos
            </a>
            <a href="#about" className="text-sm text-brand-muted transition-colors hover:text-brand-text">
              Sobre
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setJoinOpen(true)}
              className="rounded-[10px] border border-brand-border px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-surface-light"
            >
              Entrar com Codigo
            </button>
            <Link
              href="/dashboard"
              className="rounded-[10px] bg-brand-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent-hover"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <section className="text-center">
          <h1 className="font-heading text-5xl leading-tight font-bold tracking-tight text-brand-text md:text-6xl">
            Sua mesa de RPG, online
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-muted">
            Crie sessoes, gerencie personagens e role dados — tudo em um so lugar.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-[10px] bg-brand-accent px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-accent-hover"
            >
              Comecar Agora
            </Link>
            <button
              onClick={() => setJoinOpen(true)}
              className="rounded-[10px] border border-brand-border px-8 py-3.5 text-base font-semibold text-brand-text transition-colors hover:bg-brand-surface-light"
            >
              Entrar com Codigo
            </button>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-32">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-brand-border bg-brand-surface p-8 transition-colors hover:border-brand-accent/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-brand-accent-muted">
                    <Icon className="h-6 w-6 text-brand-accent" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-brand-text">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
          <p className="text-sm text-brand-muted">QuestBoard 2026</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-brand-muted transition-colors hover:text-brand-text">
              Termos
            </a>
            <a href="#" className="text-sm text-brand-muted transition-colors hover:text-brand-text">
              Privacidade
            </a>
            <a href="#" className="text-sm text-brand-muted transition-colors hover:text-brand-text">
              Contato
            </a>
          </div>
        </div>
      </footer>

      {/* Join Modal */}
      <JoinCodeModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
