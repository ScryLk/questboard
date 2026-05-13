"use client";

// Callback OAuth do Clerk. Esta rota é o `redirectUrl` passado pro
// `signIn.authenticateWithRedirect` na página de login. O componente
// `AuthenticateWithRedirectCallback` lê o state da URL e finaliza o
// fluxo (cria sessão e redireciona pro destino).

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SsoCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F] text-brand-muted">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
        <p className="text-sm">Concluindo login...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
