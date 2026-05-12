// Tela de login. Usa o componente <SignIn /> do Clerk (suporta
// email/senha + OAuth providers configurados no painel Clerk).
//
// O ClerkProvider em app/layout.tsx aponta `signInUrl="/login"` e
// `signInFallbackRedirectUrl="/dashboard"`, então tudo cai aqui
// quando o middleware bloqueia uma rota privada.
//
// O `[[...rest]]` é catch-all opcional necessário pra Clerk lidar
// com sub-rotas internas (factor-one, factor-two, sso-callback).

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-primary px-4 py-10">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-brand-accent">
          QuestBoard
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Faça login para acessar sua mesa de RPG.
        </p>
      </div>

      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-brand-surface border border-white/10 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton:
              "border border-white/10 bg-white/5 text-white hover:bg-white/10",
            socialButtonsBlockButtonText: "text-white font-medium",
            formFieldLabel: "text-gray-300",
            formFieldInput:
              "bg-white/[0.04] border border-white/10 text-white",
            formButtonPrimary:
              "bg-brand-accent hover:bg-brand-accent/85 text-white",
            footerActionLink: "text-brand-accent hover:text-brand-accent/80",
            identityPreviewText: "text-gray-300",
            identityPreviewEditButton:
              "text-brand-accent hover:text-brand-accent/80",
          },
        }}
        routing="path"
        path="/login"
      />

      <Link
        href="/"
        className="text-xs text-gray-500 hover:text-gray-300"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
