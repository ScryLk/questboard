"use client";

// Tela de login customizada. Usa useSignIn do Clerk (email/senha +
// OAuth Apple/Google/X), com layout próprio espelhando o design da
// referência: card centralizado em fundo escuro + corner circuits.
//
// ClerkProvider já está montado em app/layout.tsx; aqui só
// consumimos o hook. `[[...rest]]` segue como catch-all pra Clerk
// rotear sub-fluxos (factor-one, sso-callback, etc).

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail } from "lucide-react";
import { useSignIn } from "@clerk/nextjs/legacy";
import type { OAuthStrategy } from "@clerk/types";

const OAUTH_REDIRECT = "/login/sso-callback";
const SUCCESS_REDIRECT = "/dashboard";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<OAuthStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    setError(null);
    setPending(true);
    try {
      const attempt = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push(SUCCESS_REDIRECT);
      } else {
        setError("Verificação adicional necessária. Tente novamente.");
      }
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Não foi possível entrar. Verifique email e senha.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  async function handleOAuth(strategy: OAuthStrategy) {
    if (!isLoaded || oauthPending) return;
    setError(null);
    setOauthPending(strategy);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: OAUTH_REDIRECT,
        redirectUrlComplete: SUCCESS_REDIRECT,
      });
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Falha ao iniciar login social.";
      setError(message);
      setOauthPending(null);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0F] px-4 py-10">
      <CornerCircuits />

      <main className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#111116]/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex justify-center">
          <LogoMark />
        </div>

        <h1 className="text-center text-2xl font-bold text-white">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Ainda não tem conta?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-white hover:text-brand-accent"
          >
            Cadastrar
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <Field
            icon={<Mail className="h-4 w-4" />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="endereço de email"
            autoComplete="email"
            required
          />
          <Field
            icon={<Lock className="h-4 w-4" />}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="senha"
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isLoaded || pending || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-accent px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-brand-muted">
          <span className="h-px flex-1 bg-white/5" />
          ou
          <span className="h-px flex-1 bg-white/5" />
        </div>

        <div id="clerk-captcha" />

        <div className="grid grid-cols-3 gap-2">
          <OAuthButton
            label="Apple"
            onClick={() => handleOAuth("oauth_apple")}
            disabled={!isLoaded || oauthPending !== null}
            loading={oauthPending === "oauth_apple"}
          >
            <AppleIcon className="h-5 w-5" />
          </OAuthButton>
          <OAuthButton
            label="Google"
            onClick={() => handleOAuth("oauth_google")}
            disabled={!isLoaded || oauthPending !== null}
            loading={oauthPending === "oauth_google"}
          >
            <GoogleIcon className="h-5 w-5" />
          </OAuthButton>
          <OAuthButton
            label="X"
            onClick={() => handleOAuth("oauth_x")}
            disabled={!isLoaded || oauthPending !== null}
            loading={oauthPending === "oauth_x"}
          >
            <XIcon className="h-4 w-4" />
          </OAuthButton>
        </div>
      </main>

      <Link
        href="/"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs text-brand-muted hover:text-white"
      >
        Voltar ao início
      </Link>
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────

interface FieldProps {
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
}

function Field({
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: FieldProps) {
  return (
    <label className="relative flex items-center">
      <span className="pointer-events-none absolute left-3 text-brand-muted">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-lg border border-white/10 bg-[#0D0D12] px-3 py-3 pl-10 text-sm text-white outline-none placeholder:text-brand-muted focus:border-brand-accent/60"
      />
    </label>
  );
}

interface OAuthButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  children: React.ReactNode;
}

function OAuthButton({
  label,
  onClick,
  disabled,
  loading,
  children,
}: OAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Entrar com ${label}`}
      className="flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-3 text-white transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

function LogoMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#1A1A24] to-[#0D0D12] shadow-inner">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="url(#logo-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="40 60"
          strokeDashoffset="10"
        />
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#9BA8FF" />
            <stop offset="100%" stopColor="#5C7BFF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ── Circuit decorations nos cantos ─────────────────────────────

function CornerCircuits() {
  return (
    <>
      {/* Top-left */}
      <div className="pointer-events-none absolute left-0 top-0 hidden h-48 w-72 md:block">
        <CircuitSvg className="h-full w-full" rotate="0" />
      </div>
      {/* Top-right */}
      <div className="pointer-events-none absolute right-0 top-0 hidden h-48 w-72 md:block">
        <CircuitSvg className="h-full w-full" rotate="90" />
      </div>
      {/* Bottom-left */}
      <div className="pointer-events-none absolute bottom-0 left-0 hidden h-48 w-72 md:block">
        <CircuitSvg className="h-full w-full" rotate="270" />
      </div>
      {/* Bottom-right */}
      <div className="pointer-events-none absolute bottom-0 right-0 hidden h-48 w-72 md:block">
        <CircuitSvg className="h-full w-full" rotate="180" />
      </div>
    </>
  );
}

function CircuitSvg({
  className,
  rotate,
}: {
  className?: string;
  rotate: string;
}) {
  return (
    <svg
      viewBox="0 0 300 200"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 60 L80 60 L120 100 L300 100"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect
        x="20"
        y="40"
        width="60"
        height="40"
        rx="6"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
        fill="rgba(255,255,255,0.02)"
      />
      {/* dots inside chip */}
      {Array.from({ length: 12 }).map((_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        return (
          <circle
            key={i}
            cx={30 + col * 9}
            cy={52 + row * 10}
            r="1"
            fill="rgba(255,255,255,0.15)"
          />
        );
      })}
      {/* endpoint dot on the trace */}
      <circle cx="82" cy="60" r="2" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

// ── Brand icons ─────────────────────────────────────────────────

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M16.365 12.49c-.02-2.09 1.7-3.09 1.78-3.14-.97-1.42-2.49-1.61-3.03-1.64-1.29-.13-2.52.76-3.18.76-.65 0-1.67-.74-2.74-.72-1.41.02-2.71.82-3.43 2.08-1.47 2.54-.37 6.3 1.05 8.36.69 1.01 1.51 2.14 2.59 2.1 1.04-.04 1.44-.67 2.69-.67 1.25 0 1.6.67 2.7.65 1.12-.02 1.83-1.02 2.51-2.04.79-1.17 1.12-2.31 1.13-2.37-.02-.01-2.17-.83-2.19-3.32-.02-2.08 1.7-3.07 1.78-3.12-.97-1.42-2.49-1.59-3.03-1.62zM14.05 5.78c.57-.69.96-1.65.85-2.61-.83.03-1.83.55-2.42 1.23-.53.6-.99 1.59-.86 2.52.92.07 1.86-.46 2.43-1.14z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.12A6.98 6.98 0 0 1 5.45 12c0-.74.13-1.46.36-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.96l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.967 6.817H1.677l7.73-8.835L1.254 2.25H8.08l4.713 6.231zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}
