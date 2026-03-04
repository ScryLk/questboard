import Link from "next/link";
import { Swords, ArrowLeft } from "lucide-react";

// Mock session data lookup
const MOCK_SESSIONS: Record<
  string,
  {
    name: string;
    order: number;
    campaignName: string;
    date: string;
    gm: string;
    confirmed: number;
    max: number;
  }
> = {
  B7M2X4: {
    name: "A Torre de Ravenloft",
    order: 13,
    campaignName: "A Maldicao de Strahd",
    date: "Sab 15/03/2026 as 20:00",
    gm: "Lucas Silva",
    confirmed: 3,
    max: 4,
  },
  A3K9F2: {
    name: "Wave Echo Cave",
    order: 4,
    campaignName: "Lost Mine of Phandelver",
    date: "Seg 17/03/2026 as 19:00",
    gm: "Ana Costa",
    confirmed: 2,
    max: 3,
  },
};

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinByCodePage({ params }: JoinPageProps) {
  const { code } = await params;
  const session = MOCK_SESSIONS[code.toUpperCase()];

  return (
    <div className="min-h-screen bg-brand-primary">
      {/* Navbar */}
      <header className="border-b border-brand-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-brand-accent">
            QuestBoard
          </Link>
          <Link
            href="/dashboard"
            className="rounded-[10px] bg-brand-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent-hover"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-20">
        {session ? (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-accent-muted">
              <Swords className="h-10 w-10 text-brand-accent" />
            </div>

            <h1 className="mt-8 text-2xl font-bold text-brand-text">
              Voce foi convidado!
            </h1>

            <div className="mt-8 w-full rounded-2xl border border-brand-border bg-brand-surface p-8 text-center">
              <h2 className="text-xl font-bold text-brand-text">{session.name}</h2>
              <p className="mt-2 text-sm text-brand-muted">
                Sessao #{session.order} - {session.campaignName}
              </p>
              <p className="mt-1 text-sm text-brand-muted">{session.date}</p>

              <div className="mt-6 flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-sm text-brand-muted">Mestre</p>
                  <p className="mt-1 text-sm font-semibold text-brand-text">
                    {session.gm}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-brand-muted">Jogadores confirmados</p>
                  <p className="mt-1 text-sm font-semibold text-brand-text">
                    {session.confirmed}/{session.max}
                  </p>
                </div>
              </div>

              <Link
                href={`/login?code=${code}`}
                className="mt-8 inline-block w-full rounded-[10px] bg-brand-accent py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover"
              >
                Entrar na Sessao
              </Link>
            </div>

            <p className="mt-6 text-sm text-brand-muted">
              Ainda nao tem conta?{" "}
              <a href="/register" className="text-brand-accent hover:underline">
                Crie gratis
              </a>
            </p>
          </>
        ) : (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-danger/10">
              <Swords className="h-10 w-10 text-brand-danger" />
            </div>

            <h1 className="mt-8 text-2xl font-bold text-brand-text">
              Sessao nao encontrada
            </h1>
            <p className="mt-3 text-sm text-brand-muted">
              O codigo &quot;{code}&quot; nao corresponde a nenhuma sessao ativa.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-[10px] border border-brand-border px-6 py-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand-surface-light"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao inicio
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
