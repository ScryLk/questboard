"use client";

// Gate de auth para o fluxo /play/[code]/**. Sem login, redireciona
// imediato pra /login com returnUrl preservando query params. Mostra
// shell de carregamento enquanto Clerk inicializa ou o redirect dispara.
//
// Centraliza a checagem que era duplicada em page.tsx + new-character/**.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Props {
  children: React.ReactNode;
}

export function PlayAuthGate({ children }: Props) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) return;
    const returnUrl =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    router.replace(`/login?redirect_url=${encodeURIComponent(returnUrl)}`);
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A0A0F]">
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando sessão...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
