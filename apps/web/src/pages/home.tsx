import { Button, Card } from "@questboard/ui";
import { SUPPORTED_SYSTEMS, SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

export function HomePage() {
  return (
    <div className="min-h-screen bg-brand-primary">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-brand-accent">
            QuestBoard
          </h1>
          <nav className="flex gap-4">
            <Button variant="ghost" size="sm">
              Sessões
            </Button>
            <Button variant="primary" size="sm">
              Criar Sessão
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-12 text-center">
          <h2 className="font-heading text-4xl font-bold text-white">
            Sua mesa de RPG, online
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Crie sessões, gerencie personagens e role dados — tudo em um só
            lugar.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SUPPORTED_SYSTEMS.map((system) => (
            <Card key={system}>
              <h3 className="font-heading text-lg font-semibold text-white">
                {SYSTEM_LABELS[system as SupportedSystem]}
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Templates e regras para {SYSTEM_LABELS[system as SupportedSystem]}
              </p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
