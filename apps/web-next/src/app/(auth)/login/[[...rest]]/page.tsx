"use client";

// Tela de login customizada. Usa useSignIn do Clerk (email/senha +
// OAuth Apple/Google/X). Layout vem do AuthShell compartilhado.
//
// Flow:
//   1. Usuário digita email+senha → signIn.create()
//   2. Se status === "complete" → setActive + redirect
//   3. Se status === "needs_first_factor" com email_code disponível
//      (email não verificado), prepara o factor e troca pro step
//      de verificação por código.
//   4. Usuário cola código → signIn.attemptFirstFactor → setActive
//
// `[[...rest]]` segue como catch-all pra Clerk rotear sub-fluxos
// (factor-one, sso-callback, etc).

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, Lock, Mail } from "lucide-react";
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
  if (!raw.startsWith("/") || raw.startsWith("//")) return DEFAULT_REDIRECT;
  return raw;
}

type Step = "credentials" | "verify-email" | "verify-2fa";
type TwoFactorMethod = "totp" | "backup_code" | "phone_code";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successRedirect = safeRedirectUrl(searchParams.get("redirect_url"));

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod>("totp");
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
        return;
      }

      // Email não verificado é o caso mais comum aqui — Clerk dev
      // pede verificação na primeira entrada. Detecta o factor e
      // dispara envio do código.
      if (attempt.status === "needs_first_factor") {
        const emailFactor = attempt.supportedFirstFactors?.find(
          (f) => f.strategy === "email_code",
        ) as { emailAddressId: string } | undefined;
        if (emailFactor?.emailAddressId) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          setStep("verify-email");
          setError(null);
          return;
        }
      }

      if (attempt.status === "needs_second_factor") {
        // Conta com 2FA. Detecta o método disponível e roteia pro
        // step de código. Se phone_code é o factor, dispara
        // prepareSecondFactor primeiro pra mandar o SMS.
        const factors = attempt.supportedSecondFactors ?? [];
        const phone = factors.find((f) => f.strategy === "phone_code") as
          | { phoneNumberId: string }
          | undefined;
        if (phone?.phoneNumberId) {
          await signIn.prepareSecondFactor({
            strategy: "phone_code",
            phoneNumberId: phone.phoneNumberId,
          });
          setTwoFactorMethod("phone_code");
        } else if (factors.find((f) => f.strategy === "backup_code")) {
          setTwoFactorMethod("backup_code");
        } else {
          // TOTP é o default — não precisa preparar. Se Clerk não
          // listou nenhum factor, tenta TOTP mesmo assim: o usuário
          // pode ter app autenticador configurado direto no painel.
          setTwoFactorMethod("totp");
        }
        setStep("verify-2fa");
        setCode("");
        return;
      }

      setError(`Verificação adicional necessária (${attempt.status}).`);
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Não foi possível entrar. Verifique email e senha.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    setError(null);
    setPending(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push(successRedirect);
      } else {
        setError(`Verificação incompleta (${attempt.status}).`);
      }
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Código inválido ou expirado.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  async function handleVerifyTwoFactor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    setError(null);
    setPending(true);
    try {
      const attempt = await signIn.attemptSecondFactor({
        strategy: twoFactorMethod,
        code,
      });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push(successRedirect);
      } else {
        setError(`Verificação incompleta (${attempt.status}).`);
      }
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Código 2FA inválido.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    if (!isLoaded) return;
    setError(null);
    try {
      const emailFactor = signIn.supportedFirstFactors?.find(
        (f) => f.strategy === "email_code",
      ) as { emailAddressId: string } | undefined;
      if (!emailFactor?.emailAddressId) {
        setError("Não foi possível reenviar — recomece o login.");
        return;
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      });
    } catch (err) {
      const message =
        (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
        "Falha ao reenviar.";
      setError(message);
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

  if (step === "verify-2fa") {
    const methodLabel =
      twoFactorMethod === "totp"
        ? "do app autenticador"
        : twoFactorMethod === "backup_code"
          ? "de backup"
          : "enviado por SMS";
    const methodHint =
      twoFactorMethod === "totp"
        ? "Abra Google Authenticator, Authy ou outro app autenticador configurado pra essa conta."
        : twoFactorMethod === "backup_code"
          ? "Um dos códigos salvos quando você ativou o 2FA."
          : "Verifique o SMS no celular cadastrado.";
    const isBackup = twoFactorMethod === "backup_code";

    // Reset completo: limpa todo state + recarrega a página pra
    // abandonar o signIn object intermediário do Clerk. Sem isso,
    // tentar logar de novo pode reaproveitar o status antigo.
    function fullReset() {
      window.location.assign(
        successRedirect === DEFAULT_REDIRECT
          ? "/login"
          : `/login?redirect_url=${encodeURIComponent(successRedirect)}`,
      );
    }

    return (
      <AuthShell>
        <button
          type="button"
          onClick={fullReset}
          className="mb-2 inline-flex cursor-pointer items-center gap-1 text-xs text-brand-muted hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar
        </button>

        <h1 className="text-center text-2xl font-bold text-white">
          Autenticação em 2 fatores
        </h1>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Digite o código {methodLabel}.
        </p>
        <p className="mt-1 text-center text-[11px] text-brand-muted/70">
          {methodHint}
        </p>

        <form onSubmit={handleVerifyTwoFactor} className="mt-6 space-y-3">
          <Field
            icon={<KeyRound className="h-4 w-4" />}
            type="text"
            value={code}
            onChange={(v) =>
              setCode(
                isBackup
                  ? v.replace(/[^A-Za-z0-9-]/g, "").slice(0, 16)
                  : v.replace(/\D/g, "").slice(0, 6),
              )
            }
            placeholder={isBackup ? "código de backup" : "código de 6 dígitos"}
            autoComplete="one-time-code"
            inputMode={isBackup ? "text" : "numeric"}
            maxLength={isBackup ? 16 : 6}
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
            disabled={
              !isLoaded ||
              pending ||
              code.length < (isBackup ? 6 : 6)
            }
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

        {/* Alternar pra backup code se 2FA via TOTP/SMS falhar */}
        {twoFactorMethod !== "backup_code" && (
          <button
            type="button"
            onClick={() => {
              setTwoFactorMethod("backup_code");
              setCode("");
              setError(null);
            }}
            className="mt-4 w-full cursor-pointer text-center text-xs text-brand-muted hover:text-white"
          >
            Perdeu o acesso ao autenticador? Usar código de backup
          </button>
        )}
      </AuthShell>
    );
  }

  if (step === "verify-email") {
    function fullResetEmail() {
      window.location.assign(
        successRedirect === DEFAULT_REDIRECT
          ? "/login"
          : `/login?redirect_url=${encodeURIComponent(successRedirect)}`,
      );
    }
    return (
      <AuthShell>
        <button
          type="button"
          onClick={fullResetEmail}
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

        <form onSubmit={handleVerifyCode} className="mt-6 space-y-3">
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
