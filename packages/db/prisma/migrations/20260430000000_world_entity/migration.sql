-- Mundo: NPCs, locais, facções e lore por campanha. Discriminator
-- único (`kind`) — UI agrupa em tabs (frontend já existe em
-- apps/web-next/src/lib/world-store.ts).

-- CreateEnum
CREATE TYPE "WorldEntityKind" AS ENUM ('NPC', 'LOCATION', 'FACTION', 'LORE');

-- CreateEnum
CREATE TYPE "WorldDisposition" AS ENUM ('FRIENDLY', 'NEUTRAL', 'HOSTILE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "WorldEntity" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "kind" "WorldEntityKind" NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "subtitle" VARCHAR(200),
    "description" TEXT NOT NULL,
    "location" VARCHAR(200),
    "disposition" "WorldDisposition",
    "notes" TEXT,
    "characterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorldEntity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorldEntity_campaignId_kind_idx" ON "WorldEntity"("campaignId", "kind");

-- CreateIndex
CREATE INDEX "WorldEntity_authorId_idx" ON "WorldEntity"("authorId");

-- AddForeignKey
ALTER TABLE "WorldEntity"
  ADD CONSTRAINT "WorldEntity_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldEntity"
  ADD CONSTRAINT "WorldEntity_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldEntity"
  ADD CONSTRAINT "WorldEntity_characterId_fkey"
  FOREIGN KEY ("characterId") REFERENCES "Character"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
