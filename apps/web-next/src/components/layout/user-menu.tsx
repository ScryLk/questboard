"use client";

// Menu de conta no header. Substitui o <UserButton /> do Clerk pra
// exibir o handle (Name#TAG) como identidade primária + ações:
//  - "Gerenciar conta" abre o modal de perfil do Clerk
//  - "Sair" desconecta
// O avatar vem do Clerk (imageUrl); o nome/handle vem do nosso
// backend (já que Clerk não conhece o tag).

import { useEffect, useRef, useState } from "react";
import { Check, Copy, LogOut, Settings, User } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getMyHandle, type MyHandleDto } from "@/lib/handle-api";

export function UserMenu() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState<MyHandleDto | null>(null);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Carrega o handle uma vez quando o user logar. Falha silenciosa —
  // se o backend não estiver acessível, cai no email do Clerk.
  useEffect(() => {
    if (!isLoaded || !user) return;
    let mounted = true;
    void getMyHandle()
      .then((h) => {
        if (mounted) setHandle(h);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isLoaded, user]);

  if (!isLoaded || !user) {
    // Shell pra evitar CLS enquanto o Clerk carrega.
    return <div className="h-8 w-8 animate-pulse rounded-full bg-white/5" />;
  }

  const initial = (
    handle?.username?.[0] ??
    user.firstName?.[0] ??
    user.username?.[0] ??
    user.primaryEmailAddress?.emailAddress?.[0] ??
    "?"
  ).toUpperCase();

  const email = user.primaryEmailAddress?.emailAddress ?? "";

  async function copyHandle() {
    if (!handle || !navigator.clipboard) return;
    await navigator.clipboard.writeText(handle.handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSignOut() {
    await clerk.signOut(() => router.push("/login"));
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 bg-emerald-700/40 text-sm font-semibold text-white transition-colors hover:border-white/20"
        aria-label="Menu de conta"
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt={handle?.username ?? "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#111116] shadow-2xl">
          {/* Header — handle + email */}
          <div className="border-b border-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700/40 text-sm font-semibold text-white">
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0 flex-1">
                {handle ? (
                  <div className="flex items-center gap-1">
                    <span className="truncate font-semibold text-white">
                      {handle.username}
                    </span>
                    <span className="text-sm text-brand-muted">
                      #{handle.tag}
                    </span>
                    <button
                      type="button"
                      onClick={copyHandle}
                      className="ml-auto cursor-pointer rounded p-1 text-brand-muted hover:bg-white/10 hover:text-white"
                      aria-label="Copiar handle"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="truncate font-semibold text-white">
                    {user.firstName ?? user.username ?? "Conta"}
                  </div>
                )}
                <div className="truncate text-xs text-brand-muted">
                  {email}
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <nav className="p-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/settings");
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-brand-text hover:bg-white/[0.04]"
            >
              <User className="h-4 w-4 text-brand-muted" />
              Editar identidade
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                clerk.openUserProfile();
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-brand-text hover:bg-white/[0.04]"
            >
              <Settings className="h-4 w-4 text-brand-muted" />
              Gerenciar conta
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
