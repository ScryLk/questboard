"use client";

// Primitivos visuais compartilhados pelas telas de auth (login +
// cadastro): card centralizado, decorações de circuito nos cantos,
// inputs com ícone, botões OAuth com brand icons.

import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  /** Texto do link no rodapé (ex: "Voltar ao início"). */
  footerLabel?: string;
  footerHref?: string;
}

export function AuthShell({
  children,
  footerLabel = "Voltar ao início",
  footerHref = "/",
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0F] px-4 py-10">
      <CornerCircuits />

      <main className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#111116]/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex justify-center">
          <LogoMark />
        </div>
        {children}
      </main>

      <Link
        href={footerHref}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs text-brand-muted hover:text-white"
      >
        {footerLabel}
      </Link>
    </div>
  );
}

// ── Field ────────────────────────────────────────────────────────

interface FieldProps {
  icon: ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "email";
  maxLength?: number;
  autoFocus?: boolean;
}

export function Field({
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  inputMode,
  maxLength,
  autoFocus,
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
        inputMode={inputMode}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-white/10 bg-[#0D0D12] px-3 py-3 pl-10 text-sm text-white outline-none placeholder:text-brand-muted focus:border-brand-accent/60"
      />
    </label>
  );
}

// ── OAuth button ─────────────────────────────────────────────────

interface OAuthButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  children: ReactNode;
}

export function OAuthButton({
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
      aria-label={`Continuar com ${label}`}
      className="flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-3 text-white transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

// ── Logo + decorações ────────────────────────────────────────────

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

function CornerCircuits() {
  return (
    <>
      <div className="pointer-events-none absolute left-0 top-0 hidden h-48 w-72 md:block">
        <CircuitSvg className="h-full w-full" rotate="0" />
      </div>
      <div className="pointer-events-none absolute right-0 top-0 hidden h-48 w-72 md:block">
        <CircuitSvg className="h-full w-full" rotate="90" />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 hidden h-48 w-72 md:block">
        <CircuitSvg className="h-full w-full" rotate="270" />
      </div>
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
      <circle cx="82" cy="60" r="2" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

// ── Brand icons (Apple, Google, X) ──────────────────────────────

export function AppleIcon({ className }: { className?: string }) {
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

export function GoogleIcon({ className }: { className?: string }) {
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

export function XIcon({ className }: { className?: string }) {
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
