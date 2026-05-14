"use client";

// Tela de login customizada. Usa useSignIn do Clerk (email/senha +
// OAuth Apple/Google/X). Layout vem do AuthShell compartilhado.
//
// `[[...rest]]` segue como catch-all pra Clerk rotear sub-fluxos
// (factor-one, sso-callback, etc).

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail } from "lucide-react";
import { useSignIn } from "@clerk/nextjs/legacy";
import type { OAuthStrategy } from "@clerk/types";
import {
  AppleIcon,
  AuthShell,
  Field,
  GoogleIcon,
  OAuthButton,
  XIcon,
} from "../../_components/auth-shell";

const OAUTH_REDIRECT = "/login/sso-callback";
const DEFAULT_REDIRECT = "/dashboard";

/** Whitelist de prefixos pra `redirect_url` — evita open redirect. */
function safeRedirectUrl(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT;
  // Apenas paths internos (começam com "/" e não com "//"
  // pra rejeitar protocol-relative URLs).
  if (!raw.startsWith("/") || raw.startsWith("//")) return DEFAULT_REDIRECT;
  return raw;
}

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successRedirect = safeRedirectUrl(searchParams.get("redirect_url"));

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
        router.push(successRedirect);
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
        redirectUrlComplete: successRedirect,
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
    <AuthShell>
      <h1 className="text-center text-2xl font-bold text-white">
        Bem-vindo de volta
      </h1>
      <p className="mt-2 text-center text-sm text-brand-muted">
        Ainda não tem conta?{" "}
        <Link
          href={
            successRedirect === DEFAULT_REDIRECT
              ? "/sign-up"
              : `/sign-up?redirect_url=${encodeURIComponent(successRedirect)}`
          }
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
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-accent px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
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
    </AuthShell>
  );
}
