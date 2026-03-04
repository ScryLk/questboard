import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MOCK_CAMPAIGNS } from "../lib/mock-data.js";

type JoinState = "idle" | "loading" | "error" | "success";

export function JoinPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [state, setState] = useState<JoinState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.toUpperCase();
      // Auto-insert "QB-" prefix detection
      if (value.length >= 3 && value.startsWith("QB") && value[2] !== "-") {
        value = "QB-" + value.slice(2);
      }
      setCode(value);
      setState("idle");
      setErrorMsg("");
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!code.trim()) return;

      setState("loading");

      // Simulate API call
      setTimeout(() => {
        const trimmed = code.trim();

        // Check campaign codes (QB-XXXX)
        if (trimmed.startsWith("QB-")) {
          const campaign = MOCK_CAMPAIGNS.find(
            (c) => c.code === trimmed,
          );
          if (campaign) {
            setState("success");
            setTimeout(() => navigate(`/campaign/${campaign.id}`), 500);
            return;
          }
        }

        // Check session codes (6 chars)
        if (trimmed.length === 6 && /^[A-Z0-9]+$/.test(trimmed)) {
          // For now, no mock session codes to validate against directly
          setState("error");
          setErrorMsg("Sessão não encontrada. Verifique o código.");
          return;
        }

        setState("error");
        setErrorMsg("Código inválido. Use QB-XXXX para campanha ou 6 caracteres para sessão.");
      }, 600);
    },
    [code, navigate],
  );

  const isCampaignCode = code.startsWith("QB-");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-primary px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="font-heading text-3xl font-bold text-brand-accent"
          >
            QuestBoard
          </Link>
          <p className="mt-2 text-gray-400">
            Entrar numa Campanha ou Sessão
          </p>
        </div>

        {/* Code Entry */}
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-300">
              Código de Acesso
            </label>
            <p className="mt-1 text-xs text-gray-500">
              {isCampaignCode
                ? "Código de campanha (QB-XXXX) — vinculação permanente"
                : "Código de sessão (6 caracteres) — acesso à sessão ao vivo"}
            </p>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="QB-XXXX ou A3K9F2"
              maxLength={7}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-white placeholder:text-gray-600 focus:border-brand-accent/50 focus:outline-none focus:ring-1 focus:ring-brand-accent/50"
              autoFocus
            />

            {state === "error" && (
              <p className="mt-2 text-center text-sm text-red-400">
                {errorMsg}
              </p>
            )}

            {state === "success" && (
              <p className="mt-2 text-center text-sm text-green-400">
                Encontrado! Redirecionando...
              </p>
            )}

            <button
              type="submit"
              disabled={!code.trim() || state === "loading"}
              className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
                !code.trim() || state === "loading"
                  ? "bg-white/5 text-gray-600"
                  : "bg-brand-accent text-white hover:bg-red-500"
              }`}
            >
              {state === "loading" ? "Verificando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-600">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Já tem campanhas?{" "}
            <Link
              to="/campaign/camp_01"
              className="text-brand-accent hover:underline"
            >
              Ir para o dashboard
            </Link>
          </p>
        </div>

        {/* Help text */}
        <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs font-medium text-gray-400">
            Como funciona?
          </p>
          <ul className="mt-2 space-y-1 text-xs text-gray-500">
            <li>
              <span className="font-mono text-gray-400">QB-XXXX</span> —
              Código da campanha. Você é vinculado permanentemente.
            </li>
            <li>
              <span className="font-mono text-gray-400">XXXXXX</span> —
              Código da sessão. Para entrar numa sessão ao vivo.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
