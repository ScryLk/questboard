import { Gamepad2 } from "lucide-react";

export default function GameplayPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Gamepad2 className="mx-auto h-16 w-16 text-gray-600" />
        <h2 className="mt-4 font-heading text-2xl font-bold text-white">
          Mesa Virtual (VTT)
        </h2>
        <p className="mt-2 max-w-md text-gray-400">
          A mesa virtual de jogo com mapa interativo, tokens, dados e chat em tempo real será integrada aqui. Inicie uma sessão para começar.
        </p>
        <button className="mt-6 rounded-lg bg-brand-accent px-6 py-3 text-sm font-medium text-white hover:bg-brand-accent/80">
          Iniciar Sessão
        </button>
      </div>
    </div>
  );
}
