import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-primary">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-surface p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-brand-accent">
            QuestBoard
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Faça login para acessar sua mesa de RPG.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10">
            Continuar com Google
          </button>
          <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10">
            Continuar com Discord
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
