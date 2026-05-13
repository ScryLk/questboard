"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/lib/settings-store";
import { useProfileStore } from "@/stores/profileStore";
import {
  SettingsSection,
  SettingsInput,
  SettingsRadio,
} from "../controls";
import {
  Camera,
  ChevronRight,
  ExternalLink,
  Loader2,
  LogOut,
  Palette,
  Trash2,
} from "lucide-react";
import { CosmeticPreview } from "@/components/profile/cosmetic-preview";
import { CosmeticSelectorModal } from "@/components/profile/cosmetic-selector-modal";
import { HandleSection } from "./HandleSection";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { updateProfile as patchProfile, uploadAvatar } from "@/lib/profile-api";

/** Debounce simples por chave — evita spam de PATCH quando o usuário
 *  digita. */
function useDebouncedSync<T>(
  value: T,
  onSync: (v: T) => Promise<void>,
  delayMs = 800,
) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => {
      void onSync(value);
    }, delayMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}

export function ProfileSection() {
  const { profile, updateProfile } = useSettingsStore();
  const publicProfile = useProfileStore((s) => s.profile);
  const openCosmeticSelector = useProfileStore((s) => s.openCosmeticSelector);
  const { user } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hidrata email do Clerk uma vez (read-only — não editável aqui).
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !profile.email) {
      updateProfile({ email: user.primaryEmailAddress.emailAddress });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function pushProfile(input: { displayName?: string; bio?: string }) {
    setSyncing(true);
    setSyncError(null);
    try {
      await patchProfile(input);
    } catch (err) {
      setSyncError(
        (err as { message?: string }).message ?? "Falha ao salvar.",
      );
    } finally {
      setSyncing(false);
    }
  }

  // Sync displayName/bio debounced.
  useDebouncedSync(profile.displayName, async (v) => {
    if (v) await pushProfile({ displayName: v });
  });
  useDebouncedSync(profile.bio, async (v) => {
    await pushProfile({ bio: v ?? "" });
  });

  async function handleAvatarFile(file: File) {
    setUploadingAvatar(true);
    setSyncError(null);
    try {
      const r = await uploadAvatar(file);
      updateProfile({ avatar: r.avatarUrl });
    } catch (err) {
      setSyncError(
        (err as { message?: string }).message ?? "Falha no upload.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSignOut() {
    await clerk.signOut(() => router.push("/login"));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">
            Perfil e Conta
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas informações pessoais e segurança.
          </p>
        </div>
        {syncing && (
          <span className="flex items-center gap-1 text-[11px] text-brand-muted">
            <Loader2 className="h-3 w-3 animate-spin" />
            Salvando...
          </span>
        )}
        {syncError && (
          <span className="text-[11px] text-rose-300">{syncError}</span>
        )}
      </div>

      <SettingsSection title="Foto de Perfil">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <Camera className="h-6 w-6" />
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleAvatarFile(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="cursor-pointer rounded-lg bg-brand-accent/10 px-3 py-1.5 text-sm text-brand-accent hover:bg-brand-accent/20 disabled:opacity-50"
            >
              Alterar
            </button>
            {profile.avatar && (
              <button
                type="button"
                onClick={() => updateProfile({ avatar: null })}
                disabled={uploadingAvatar}
                className="cursor-pointer rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-400 hover:bg-white/10 disabled:opacity-50"
              >
                Remover
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-brand-muted">
          PNG, JPG ou WebP. Máx 5 MB.
        </p>
      </SettingsSection>

      <HandleSection />

      <SettingsSection title="Informações">
        <SettingsInput
          label="Nome de Exibição"
          description="Nome visível para outros jogadores e mestres."
          value={profile.displayName}
          onChange={(v) => updateProfile({ displayName: v })}
          placeholder="Seu nome"
        />
        <div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-300">
              Email
            </span>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-gray-500 outline-none"
            />
            <p className="mt-1 text-[11px] text-brand-muted">
              Pra mudar o email, use{" "}
              <button
                type="button"
                onClick={() => clerk.openUserProfile()}
                className="cursor-pointer underline hover:text-white"
              >
                Gerenciar conta
              </button>
              .
            </p>
          </label>
        </div>
        <SettingsInput
          label="Título / Bio"
          description="Aparece no seu perfil público."
          value={profile.bio}
          onChange={(v) => updateProfile({ bio: v })}
          placeholder="Mestre de RPG desde 2015"
        />
      </SettingsSection>

      <SettingsSection title="Pronome">
        <SettingsRadio
          label="Gênero do Pronome"
          description="Como o app se refere a você."
          value={profile.pronouns}
          onChange={(v) => updateProfile({ pronouns: v })}
          options={[
            { value: "masculine", label: "Masculino", description: "Mestre, Jogador" },
            { value: "feminine", label: "Feminino", description: "Mestra, Jogadora" },
            { value: "neutral", label: "Neutro", description: "Mestre, Jogador/a" },
          ]}
          columns={3}
        />
      </SettingsSection>

      <SettingsSection title="Papel Padrão">
        <SettingsRadio
          label="Papel"
          value={profile.defaultRole}
          onChange={(v) => updateProfile({ defaultRole: v })}
          options={[
            { value: "gm", label: "Mestre (GM)", description: "Acesso a ferramentas de criação" },
            { value: "player", label: "Jogador", description: "Acesso a fichas e sessões" },
            { value: "both", label: "Ambos", description: "Alternar conforme necessário" },
          ]}
        />
      </SettingsSection>

      <SettingsSection title="Cosméticos do Perfil">
        <CosmeticPreview
          equipped={publicProfile.equipped}
          displayName={publicProfile.displayName}
          avatarUrl={publicProfile.avatarUrl}
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => openCosmeticSelector("frame")}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent/10 px-3 py-1.5 text-sm text-brand-accent hover:bg-brand-accent/20"
          >
            <Palette className="h-4 w-4" />
            Personalizar
          </button>
          <Link
            href={`/u/${publicProfile.username}`}
            className="flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Perfil Público
          </Link>
        </div>
      </SettingsSection>

      <CosmeticSelectorModal />

      <SettingsSection title="Segurança">
        <ActionRow
          label="Alterar Senha"
          onClick={() => clerk.openUserProfile()}
        />
        <ActionRow
          label="Autenticação em 2 fatores"
          badge={user?.twoFactorEnabled ? "ON" : "OFF"}
          onClick={() => clerk.openUserProfile()}
        />
        <ActionRow
          label="Sessões ativas"
          onClick={() => clerk.openUserProfile()}
        />
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 w-full cursor-pointer rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-4 py-2.5 text-sm text-brand-danger hover:bg-brand-danger/10"
        >
          <LogOut className="mr-2 inline-block h-4 w-4" />
          Desconectar deste dispositivo
        </button>
      </SettingsSection>

      <SettingsSection title="Conta">
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-medium text-white">
              Plano atual: Gratuito
            </span>
            <p className="mt-0.5 text-xs text-gray-500">
              Upgrade para desbloquear recursos premium.
            </p>
          </div>
          <Link
            href="/billing"
            className="cursor-pointer rounded-lg bg-brand-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-accent-hover"
          >
            Upgrade
          </Link>
        </div>
        <div className="border-t border-white/5 pt-3">
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Tem certeza? Sua conta será marcada pra remoção. Esta ação é irreversível.",
                )
              ) {
                clerk.openUserProfile();
              }
            }}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-brand-danger hover:bg-brand-danger/5"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir conta
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}

function ActionRow({
  label,
  badge,
  onClick,
}: {
  label: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/5"
    >
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span
            className={`rounded px-2 py-0.5 text-xs ${
              badge === "ON"
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-white/10 text-gray-400"
            }`}
          >
            {badge}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
    </button>
  );
}
