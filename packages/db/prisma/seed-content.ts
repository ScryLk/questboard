// ── Seed de conteúdo de mesa (dev) ─────────────────────────────
//
// Popula o DB com dados de teste pra demonstrar fluxo end-to-end:
// 1 campanha do GM, jogadores convidados, 2 PCs por jogador, 5 NPCs
// do GM. Idempotente — re-rodar não duplica.
//
// Uso:
//   DATABASE_URL=... pnpm tsx packages/db/prisma/seed-content.ts
//   DATABASE_URL=... pnpm tsx packages/db/prisma/seed-content.ts --gm=lucas@example.com
//
// Sem flag --gm, usa o primeiro usuário com `isActive=true`.

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ── Fixtures de personagens ────────────────────────────────────

const PC_FIXTURES: Array<{
  name: string;
  race: string;
  class: string;
  level: number;
  currentXp: number;
  attributes: Record<string, number>;
}> = [
  {
    name: "Eldrin Folhaprata",
    race: "Elfo",
    class: "Mago",
    level: 3,
    currentXp: 900,
    attributes: { str: 8, dex: 14, con: 12, int: 18, wis: 13, cha: 10 },
  },
  {
    name: "Thorin Martelo de Pedra",
    race: "Anão",
    class: "Guerreiro",
    level: 3,
    currentXp: 900,
    attributes: { str: 17, dex: 12, con: 16, int: 10, wis: 13, cha: 8 },
  },
  {
    name: "Lyra Sussurro",
    race: "Halfling",
    class: "Ladino",
    level: 3,
    currentXp: 900,
    attributes: { str: 10, dex: 18, con: 12, int: 13, wis: 14, cha: 12 },
  },
  {
    name: "Mira Coraçãodeleão",
    race: "Humano",
    class: "Clérigo",
    level: 3,
    currentXp: 900,
    attributes: { str: 13, dex: 10, con: 14, int: 11, wis: 17, cha: 13 },
  },
];

const NPC_FIXTURES: Array<{
  name: string;
  race: string;
  class: string;
  level: number;
  attributes: Record<string, number>;
  notes: string;
}> = [
  {
    name: "Strahd von Zarovich",
    race: "Vampiro",
    class: "Mago/Guerreiro",
    level: 15,
    attributes: { str: 18, dex: 18, con: 18, int: 20, wis: 15, cha: 18 },
    notes: "Senhor de Barovia. Anfitrião sinistro do Castelo Ravenloft.",
  },
  {
    name: "Madame Eva",
    race: "Vistani",
    class: "Vidente",
    level: 8,
    attributes: { str: 8, dex: 12, con: 13, int: 16, wis: 20, cha: 16 },
    notes: "Vidente do acampamento Vistani na Encruzilhada Tser. Lê o destino com o Tarokka.",
  },
  {
    name: "Ireena Kolyana",
    race: "Humana",
    class: "Aristocrata",
    level: 4,
    attributes: { str: 11, dex: 13, con: 12, int: 13, wis: 14, cha: 16 },
    notes: "Filha adotiva do burgomestre de Vallaki. Alvo da obsessão de Strahd.",
  },
  {
    name: "Pidlwick II",
    race: "Autômato",
    class: "Bobo",
    level: 2,
    attributes: { str: 7, dex: 14, con: 10, int: 10, wis: 8, cha: 10 },
    notes: "Boneco de madeira animado de Lady Wachter. Inquietantemente prestativo.",
  },
  {
    name: "Lobo do Crepúsculo",
    race: "Lobo Atroz",
    class: "Bestial",
    level: 5,
    attributes: { str: 18, dex: 15, con: 16, int: 4, wis: 12, cha: 7 },
    notes: "Servo de Strahd. Caça em alcateia ao crepúsculo.",
  },
];

// ── Helpers ────────────────────────────────────────────────────

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function findGm(emailHint: string | null) {
  if (emailHint) {
    const u = await prisma.user.findFirst({
      where: { email: emailHint, isActive: true },
      select: { id: true, email: true, displayName: true },
    });
    if (!u) throw new Error(`Usuário ${emailHint} não encontrado.`);
    return u;
  }
  const u = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, displayName: true },
  });
  if (!u) throw new Error("Nenhum usuário ativo no DB.");
  return u;
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  const gmEmail = process.argv
    .find((a) => a.startsWith("--gm="))
    ?.slice("--gm=".length) ?? null;

  const gm = await findGm(gmEmail);
  console.log(`▸ GM: ${gm.displayName} (${gm.email})`);

  // Outros usuários ativos = candidatos a player.
  const otherPlayers = await prisma.user.findMany({
    where: { isActive: true, id: { not: gm.id } },
    select: { id: true, email: true, displayName: true },
  });
  console.log(`▸ Players candidatos: ${otherPlayers.length}`);

  // ── Campanha ──────────────────────────────────────────────
  const campaignName = "A Maldição de Strahd";
  let campaign = await prisma.campaign.findFirst({
    where: { ownerId: gm.id, name: campaignName, deletedAt: null },
  });
  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        ownerId: gm.id,
        name: campaignName,
        description:
          "Os heróis são puxados para a Terra das Brumas e devem enfrentar o Senhor de Barovia, Strahd von Zarovich.",
        system: "dnd5e",
        code: generateInviteCode().slice(0, 6),
        isPublic: false,
        maxPlayers: 5,
        tags: ["horror", "dnd5e", "gótico"],
      },
    });
    console.log(`▸ Campanha criada: ${campaign.name} (${campaign.id})`);
  } else {
    console.log(`▸ Campanha já existe: ${campaign.name}`);
  }

  // Garante que o GM está como CampaignMember GM
  await prisma.campaignMember.upsert({
    where: { campaignId_userId: { campaignId: campaign.id, userId: gm.id } },
    create: { campaignId: campaign.id, userId: gm.id, role: "GM" },
    update: { role: "GM", leftAt: null },
  });

  // Adiciona outros como PLAYER
  for (const p of otherPlayers) {
    await prisma.campaignMember.upsert({
      where: {
        campaignId_userId: { campaignId: campaign.id, userId: p.id },
      },
      create: { campaignId: campaign.id, userId: p.id, role: "PLAYER" },
      update: { leftAt: null },
    });
    console.log(`▸ Player vinculado à campanha: ${p.displayName}`);
  }

  // ── PCs (2 por player) ────────────────────────────────────
  const playerPool = otherPlayers.length > 0 ? otherPlayers : [gm];
  let pcIndex = 0;
  for (const player of playerPool) {
    for (let i = 0; i < 2 && pcIndex < PC_FIXTURES.length; i++, pcIndex++) {
      const fx = PC_FIXTURES[pcIndex]!;
      const exists = await prisma.character.findFirst({
        where: {
          userId: player.id,
          campaignId: campaign.id,
          name: fx.name,
          deletedAt: null,
        },
      });
      if (exists) {
        console.log(`  · PC já existe: ${fx.name} (${player.displayName})`);
        continue;
      }
      await prisma.character.create({
        data: {
          userId: player.id,
          campaignId: campaign.id,
          system: "dnd5e",
          name: fx.name,
          race: fx.race,
          class: fx.class,
          level: fx.level,
          currentXp: fx.currentXp,
          attributes: fx.attributes as unknown as Prisma.InputJsonValue,
          hidden: false,
        },
      });
      console.log(
        `  + PC criado: ${fx.name} (${fx.race} ${fx.class} Nv ${fx.level}) → ${player.displayName}`,
      );
    }
  }

  // ── NPCs (criados pelo GM) ────────────────────────────────
  for (const fx of NPC_FIXTURES) {
    const exists = await prisma.character.findFirst({
      where: {
        userId: gm.id,
        campaignId: campaign.id,
        name: fx.name,
        deletedAt: null,
      },
    });
    if (exists) {
      console.log(`  · NPC já existe: ${fx.name}`);
      continue;
    }
    await prisma.character.create({
      data: {
        userId: gm.id,
        campaignId: campaign.id,
        system: "dnd5e",
        name: fx.name,
        race: fx.race,
        class: fx.class,
        level: fx.level,
        attributes: fx.attributes as unknown as Prisma.InputJsonValue,
        notes: fx.notes,
        hidden: true, // NPCs ficam escondidos do compendium público
        dialogueEnabled: true,
        dialogueGreeting: `${fx.name} olha pra você atentamente.`,
      },
    });
    console.log(
      `  + NPC criado: ${fx.name} (${fx.race} ${fx.class} Nv ${fx.level})`,
    );
  }

  console.log("✔ Seed de conteúdo finalizado.");
}

main()
  .catch((err) => {
    console.error("✗ Falha no seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
