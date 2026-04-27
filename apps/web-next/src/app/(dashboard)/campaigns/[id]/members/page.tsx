"use client";

// Gestão de membros da campanha. GM pode convidar, mudar role, remover.
// Player vê só a lista + botão "Sair da campanha".

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, LogOut, MoreVertical, UserPlus, X } from "lucide-react";
import { useCampaignStore, MOCK_OWNER_ID } from "@/lib/campaign-store";
import { CampaignSubNav } from "@/components/campaigns/campaign-subnav";
import { InviteMemberPopover } from "@/components/campaigns/invite-member-popover";
import type {
  CampaignMember,
  CampaignMemberRole,
} from "@questboard/types";

const ROLE_LABELS: Record<CampaignMemberRole, string> = {
  GM: "Mestre",
  CO_GM: "Co-mestre",
  PLAYER: "Jogador",
  SPECTATOR: "Espectador",
};

const ROLE_TONE: Record<
  CampaignMemberRole,
  "gold" | "accent" | "muted" | "neutral"
> = {
  GM: "gold",
  CO_GM: "accent",
  PLAYER: "neutral",
  SPECTATOR: "muted",
};

const CHANGEABLE_ROLES: CampaignMemberRole[] = ["CO_GM", "PLAYER", "SPECTATOR"];

export default function CampaignMembersPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const router = useRouter();

  const campaign = useCampaignStore((s) =>
    s.campaigns.find((c) => c.id === id),
  );
  const removeMember = useCampaignStore((s) => s.removeMember);
  const changeRole = useCampaignStore((s) => s.changeMemberRole);
  const leaveCampaign = useCampaignStore((s) => s.leaveCampaign);

  const [inviteOpen, setInviteOpen] = useState(false);

  const currentUserId = MOCK_OWNER_ID;
  const isOwner = campaign?.ownerId === currentUserId;
  const currentMember = campaign?.members.find(
    (m) => m.userId === currentUserId,
  );
  const canManage =
    isOwner ||
    currentMember?.role === "GM" ||
    currentMember?.role === "CO_GM";

  const excludeIds = useMemo(
    () => campaign?.members.map((m) => m.userId) ?? [],
    [campaign?.members],
  );

  if (!campaign) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xs text-brand-muted">Campanha não encontrada.</p>
        <Link
          href="/campaigns"
          className="mt-4 rounded-md bg-brand-accent px-3 py-2 text-xs font-semibold text-white"
        >
          Voltar
        </Link>
      </div>
    );
  }

  function handleRemove(member: CampaignMember) {
    if (!campaign) return;
    if (
      !confirm(
        `Remover ${member.displayName} da campanha? A pessoa pode ser convidada novamente depois.`,
      )
    )
      return;
    removeMember(campaign.id, member.userId);
  }

  function handleLeave() {
    if (!campaign) return;
    if (!confirm(`Sair de "${campaign.name}"?`)) return;
    leaveCampaign(campaign.id, currentUserId);
    router.push("/campaigns");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href={`/campaigns/${campaign.id}`}
        className="inline-flex items-center gap-1 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar para visão geral
      </Link>

      <CampaignSubNav campaignId={campaign.id} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-cinzel text-lg font-bold text-brand-text">
            Membros
          </h1>
          <p className="text-[11px] text-brand-muted">
            {campaign.members.length}{" "}
            {campaign.members.length === 1 ? "pessoa" : "pessoas"} nesta mesa.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
          >
            <UserPlus className="h-4 w-4" />
            Convidar
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {campaign.members.map((m) => (
          <MemberRow
            key={m.userId}
            member={m}
            isCurrentUser={m.userId === currentUserId}
            isOwner={m.userId === campaign.ownerId}
            canManage={canManage}
            onChangeRole={(role) => changeRole(campaign.id, m.userId, role)}
            onRemove={() => handleRemove(m)}
          />
        ))}
      </div>

      {/* Sair da campanha (player não-owner) */}
      {currentMember && !isOwner && (
        <div className="border-t border-brand-border pt-4">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 rounded-md border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-xs font-semibold text-brand-danger transition-colors hover:bg-brand-danger/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair da campanha
          </button>
        </div>
      )}

      {inviteOpen && (
        <InviteMemberPopover
          campaignId={campaign.id}
          excludeUserIds={excludeIds}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}

// ── MemberRow ──

function MemberRow({
  member,
  isCurrentUser,
  isOwner,
  canManage,
  onChangeRole,
  onRemove,
}: {
  member: CampaignMember;
  isCurrentUser: boolean;
  isOwner: boolean;
  canManage: boolean;
  onChangeRole: (role: CampaignMemberRole) => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tone = ROLE_TONE[member.role];

  const initials = member.displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-md border border-brand-border bg-brand-surface px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-xs font-bold text-brand-accent">
        {initials}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-brand-text">
            {member.displayName}
            {isCurrentUser && (
              <span className="ml-1 text-[10px] text-brand-muted">(você)</span>
            )}
          </p>
          {isOwner && (
            <Crown
              className="h-3.5 w-3.5 text-brand-gold"
              aria-label="Dono da campanha"
            />
          )}
        </div>
        <p className="text-[10px] text-brand-muted">
          Entrou em{" "}
          {member.joinedAt.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
          {member.invitedBy === null && " · por código"}
        </p>
      </div>

      <RoleBadge tone={tone}>{ROLE_LABELS[member.role]}</RoleBadge>

      {/* Menu de ações — só pra GM/CO_GM e em membros não-owner */}
      {canManage && !isOwner && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label={`Ações para ${member.displayName}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              {/* click-outside backdrop */}
              <div
                className="fixed inset-0 z-[10]"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-9 z-20 w-44 rounded-md border border-brand-border bg-brand-surface py-1 shadow-2xl">
                <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-muted">
                  Mudar papel
                </div>
                {CHANGEABLE_ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onChangeRole(r);
                      setMenuOpen(false);
                    }}
                    disabled={member.role === r}
                    className={`flex w-full items-center justify-between px-2 py-1.5 text-left text-xs transition-colors disabled:cursor-not-allowed ${
                      member.role === r
                        ? "bg-brand-accent/10 text-brand-accent"
                        : "text-brand-text hover:bg-white/5"
                    }`}
                  >
                    <span>{ROLE_LABELS[r]}</span>
                    {member.role === r && <span>✓</span>}
                  </button>
                ))}
                <div className="my-1 border-t border-brand-border/50" />
                <button
                  onClick={() => {
                    onRemove();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-brand-danger transition-colors hover:bg-brand-danger/10"
                >
                  <X className="h-3.5 w-3.5" />
                  Remover
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RoleBadge({
  tone,
  children,
}: {
  tone: "gold" | "accent" | "muted" | "neutral";
  children: React.ReactNode;
}) {
  const cls =
    tone === "gold"
      ? "border-brand-gold/40 bg-brand-gold/10 text-brand-gold"
      : tone === "accent"
        ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
        : tone === "muted"
          ? "border-brand-border bg-brand-surface-light text-brand-muted"
          : "border-brand-border bg-brand-surface-light text-brand-text";
  return (
    <span
      className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline-block ${cls}`}
    >
      {children}
    </span>
  );
}
