"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface JoinCodeModalProps {
  open: boolean;
  onClose: () => void;
}

type DetectedType = "campaign" | "session" | null;
type SubmitState = "idle" | "loading" | "error" | "success";

const MOCK_CODES: Record<string, { type: "campaign" | "session"; label: string }> = {
  QB7K3M: { type: "campaign", label: "Campanha encontrada! Faca login para continuar" },
  QB9M2B: { type: "campaign", label: "Campanha encontrada! Faca login para continuar" },
  QB4T8R: { type: "campaign", label: "Campanha encontrada! Faca login para continuar" },
  B7M2X4: { type: "session", label: "Sessao encontrada! Faca login para continuar" },
  A3K9F2: { type: "session", label: "Sessao encontrada! Faca login para continuar" },
};

export function JoinCodeModal({ open, onClose }: JoinCodeModalProps) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [detectedType, setDetectedType] = useState<DetectedType>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setDigits(["", "", "", "", "", ""]);
      setState("idle");
      setErrorMsg("");
      setDetectedType(null);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  // Detect type as user types
  useEffect(() => {
    const code = digits.join("");
    if (code.length >= 2 && code.startsWith("QB")) {
      setDetectedType("campaign");
    } else if (code.length >= 1 && !code.startsWith("Q")) {
      setDetectedType("session");
    } else {
      setDetectedType(null);
    }
  }, [digits]);

  const isFilled = digits.every((d) => d !== "");

  const handleChange = useCallback(
    (index: number, value: string) => {
      const char = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-1);
      if (!char) return;

      const next = [...digits];
      next[index] = char;
      setDigits(next);
      setState("idle");
      setErrorMsg("");

      // Auto-advance
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace") {
        if (digits[index] === "" && index > 0) {
          const next = [...digits];
          next[index - 1] = "";
          setDigits(next);
          inputRefs.current[index - 1]?.focus();
        } else {
          const next = [...digits];
          next[index] = "";
          setDigits(next);
        }
        e.preventDefault();
      }
      if (e.key === "Enter" && isFilled) {
        handleSubmit();
      }
    },
    [digits, isFilled],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);
      if (pasted.length === 0) return;

      const next = [...digits];
      for (let i = 0; i < pasted.length && i < 6; i++) {
        next[i] = pasted[i];
      }
      setDigits(next);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    },
    [digits],
  );

  const handleSubmit = useCallback(() => {
    const code = digits.join("");
    if (code.length !== 6) return;

    setState("loading");

    setTimeout(() => {
      const match = MOCK_CODES[code];
      if (match) {
        setState("success");
        const formatted = match.type === "campaign" ? `QB-${code.slice(2)}` : code;
        setTimeout(() => {
          onClose();
          router.push(`/login?code=${formatted}`);
        }, 1000);
      } else {
        setState("error");
        setErrorMsg("Codigo nao encontrado");
      }
    }, 800);
  }, [digits, onClose, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-xl font-bold text-brand-text">
          Entrar na Sessao
        </h2>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Digite o codigo que o mestre compartilhou com voce:
        </p>

        {/* OTP-style inputs */}
        <div className="mt-8 flex justify-center gap-3" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-14 w-12 rounded-lg border text-center font-mono text-2xl font-bold uppercase transition-colors focus:outline-none ${
                state === "error"
                  ? "border-brand-danger/50 bg-brand-danger/5 text-brand-danger"
                  : state === "success"
                    ? "border-brand-success/50 bg-brand-success/5 text-brand-success"
                    : "border-brand-border bg-brand-primary text-brand-text focus:border-brand-accent"
              }`}
            />
          ))}
        </div>

        {/* Detection hint */}
        <p className="mt-4 text-center text-xs text-brand-muted">
          {detectedType === "campaign"
            ? "Campanha detectada (QB-XXXX)"
            : detectedType === "session"
              ? "Sessao detectada (XXXXXX)"
              : "Aceita codigo de campanha (QB-XXXX) ou codigo de sessao (XXXXXX)"}
        </p>

        {/* Error / Success */}
        {state === "error" && (
          <p className="mt-3 text-center text-sm text-brand-danger">{errorMsg}</p>
        )}
        {state === "success" && (
          <p className="mt-3 text-center text-sm text-brand-success">
            {MOCK_CODES[digits.join("")]?.label ?? "Encontrado!"}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isFilled || state === "loading"}
          className={`mt-6 w-full rounded-[10px] py-3 text-sm font-semibold transition-colors ${
            !isFilled || state === "loading"
              ? "bg-white/5 text-brand-muted cursor-not-allowed"
              : "bg-brand-accent text-white hover:bg-brand-accent-hover"
          }`}
        >
          {state === "loading" ? "Verificando..." : "Entrar"}
        </button>

        <p className="mt-6 text-center text-sm text-brand-muted">
          Nao tem codigo?{" "}
          <a href="/register" className="text-brand-accent hover:underline">
            Crie sua conta
          </a>
        </p>
      </div>
    </div>
  );
}
