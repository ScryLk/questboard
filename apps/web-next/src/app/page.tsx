import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-primary">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-brand-accent">
            QuestBoard
          </h1>
          <nav className="flex gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-12 text-center">
          <h2 className="font-heading text-4xl font-bold text-white">
            Sua mesa de RPG, online
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Crie sessões, gerencie personagens e role dados — tudo em um só lugar.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-block rounded-lg bg-brand-accent px-8 py-3 text-lg font-medium text-white hover:bg-brand-accent/80"
          >
            Começar Agora
          </Link>
        </section>
      </main>
    </div>
  );
}
