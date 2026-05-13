"use client";

// Tela de cadastro customizada. Usa useSignUp do Clerk (email/senha
// + OAuth Apple/Google/X). Fluxo em duas etapas:
//   1. cria attempt + envia código por email
//   2. usuário cola código → ativa sessão e redireciona pro dashboard
//
// `[[...rest]]` catch-all pra Clerk rotear sub-fluxos.

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { useSignUp } from "@clerk/nextjs/legacy";
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
const SUCCESS_REDIRECT = "/dashboard";

type Step = "form" | "verify";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<OAuthStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Não foi possível criar a conta.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    setError(null);
    setPending(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push(SUCCESS_REDIRECT);
      } else {
        setError("Código inválido. Tente novamente.");
      }
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Falha na verificação do código.";
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
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: OAUTH_REDIRECT,
        redirectUrlComplete: SUCCESS_REDIRECT,
      });
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Falha ao iniciar cadastro social.";
      setError(message);
      setOauthPending(null);
    }
  }

  async function resendCode() {
    if (!isLoaded) return;
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Não foi possível reenviar o código.";
      setError(message);
    }
  }

  if (step === "verify") {
    return (
      <AuthShell footerLabel="Voltar ao início" footerHref="/">
        <button
          type="button"
          onClick={() => {
            setStep("form");
            setCode("");
            setError(null);
          }}
          className="mb-2 inline-flex cursor-pointer items-center gap-1 text-xs text-brand-muted hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar
        </button>

        <h1 className="text-center text-2xl font-bold text-white">
          Confirme seu email
        </h1>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Enviamos um código de 6 dígitos pra{" "}
          <span className="text-white">{email}</span>.
        </p>

        <form onSubmit={handleVerify} className="mt-6 space-y-3">
          <Field
            icon={<KeyRound className="h-4 w-4" />}
            type="text"
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="código de 6 dígitos"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            required
          />

          {error && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isLoaded || pending || code.length < 6}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-accent px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Confirmar e entrar"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={resendCode}
          className="mt-4 w-full cursor-pointer text-center text-xs text-brand-muted hover:text-white"
        >
          Não recebeu? Reenviar código
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-center text-2xl font-bold text-white">
        Crie sua conta
      </h1>
      <p className="mt-2 text-center text-sm text-brand-muted">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-white hover:text-brand-accent"
        >
          Entrar
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
          placeholder="senha (mínimo 8 caracteres)"
          autoComplete="new-password"
          required
        />
        <Field
          icon={<Lock className="h-4 w-4" />}
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="repetir senha"
          autoComplete="new-password"
          required
        />

        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="text-[11px] text-rose-300">
            As senhas não conferem.
          </p>
        )}

        {error && (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            !isLoaded ||
            pending ||
            !email ||
            password.length < 8 ||
            password !== confirmPassword
          }
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-accent px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
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

      <p className="mt-4 text-center text-[10px] text-brand-muted">
        Ao criar uma conta você concorda com nossos{" "}
        <Link href="/legal/terms" className="underline hover:text-white">
          Termos
        </Link>{" "}
        e{" "}
        <Link href="/legal/privacy" className="underline hover:text-white">
          Privacidade
        </Link>
        .
      </p>
    </AuthShell>
  );
}
