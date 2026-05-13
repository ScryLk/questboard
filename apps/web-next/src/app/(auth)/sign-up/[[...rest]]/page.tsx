// Cadastro. Usa <SignUp /> do Clerk com appearance escura. Layout
// próprio espelhando a tela de login pode vir depois — por ora basta
// o flow nativo do Clerk pra criar conta.

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0A0A0F] px-4 py-10">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-[#111116] border border-white/10 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-brand-muted",
            socialButtonsBlockButton:
              "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
            socialButtonsBlockButtonText: "text-white font-medium",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-white/[0.04] border border-white/10 text-white",
            formButtonPrimary:
              "bg-brand-accent hover:bg-brand-accent-hover text-white cursor-pointer",
            footerActionLink: "text-brand-accent hover:text-brand-accent-hover",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
      />

      <Link
        href="/login"
        className="text-xs text-brand-muted hover:text-white"
      >
        Já tem conta? Entrar
      </Link>
    </div>
  );
}
