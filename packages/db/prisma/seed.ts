import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create character templates
  const dnd5eTemplate = await prisma.characterTemplate.upsert({
    where: { system_name: { system: "dnd5e", name: "Standard" } },
    update: {},
    create: {
      system: "dnd5e",
      name: "Standard",
      schema: {
        fields: [
          { key: "class", label: "Classe", type: "text" },
          { key: "race", label: "Raça", type: "text" },
          { key: "level", label: "Nível", type: "number", min: 1, max: 20 },
          { key: "hp", label: "Pontos de Vida", type: "number" },
          { key: "ac", label: "Classe de Armadura", type: "number" },
          { key: "str", label: "Força", type: "number", min: 1, max: 30 },
          { key: "dex", label: "Destreza", type: "number", min: 1, max: 30 },
          { key: "con", label: "Constituição", type: "number", min: 1, max: 30 },
          { key: "int", label: "Inteligência", type: "number", min: 1, max: 30 },
          { key: "wis", label: "Sabedoria", type: "number", min: 1, max: 30 },
          { key: "cha", label: "Carisma", type: "number", min: 1, max: 30 },
        ],
      },
      version: 1,
    },
  });

  const genericTemplate = await prisma.characterTemplate.upsert({
    where: { system_name: { system: "generic", name: "Simple" } },
    update: {},
    create: {
      system: "generic",
      name: "Simple",
      schema: {
        fields: [
          { key: "description", label: "Descrição", type: "textarea" },
          { key: "notes", label: "Notas", type: "textarea" },
        ],
      },
      version: 1,
    },
  });

  // Create some built-in audio tracks
  await prisma.audioTrack.createMany({
    skipDuplicates: true,
    data: [
      { category: "tavern", name: "Taverna Animada", url: "/audio/tavern-lively.mp3", duration: 180, isBuiltin: true },
      { category: "forest", name: "Floresta Calma", url: "/audio/forest-calm.mp3", duration: 240, isBuiltin: true },
      { category: "combat", name: "Batalha Épica", url: "/audio/combat-epic.mp3", duration: 200, isBuiltin: true },
      { category: "dungeon", name: "Masmorra Sombria", url: "/audio/dungeon-dark.mp3", duration: 300, isBuiltin: true },
      { category: "ambient", name: "Chuva", url: "/audio/rain-ambient.mp3", duration: 600, isBuiltin: true },
    ],
  });

  console.log("Seed completed.");
  console.log(`  - D&D 5e template: ${dnd5eTemplate.id}`);
  console.log(`  - Generic template: ${genericTemplate.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
