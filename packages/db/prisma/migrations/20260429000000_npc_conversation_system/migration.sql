-- Sistema de conversa com NPC (modo SCRIPTED). Modos AI/HYBRID
-- (CLAUDE.md §6.3) ficam pra sprint futura quando o backend Gemini
-- subir.

-- CreateEnum
CREATE TYPE "NpcDialogueMode" AS ENUM ('SCRIPTED', 'AI', 'HYBRID');

-- CreateEnum
CREATE TYPE "ConversationSpeaker" AS ENUM ('NPC', 'PLAYER', 'GM_OVERRIDE');

-- AlterTable Character — campos de diálogo
ALTER TABLE "Character"
  ADD COLUMN "dialogueEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "dialogueGreeting" TEXT,
  ADD COLUMN "dialogueFarewell" TEXT,
  ADD COLUMN "dialogueNotes" TEXT;

-- CreateTable NpcDialogueBranch
CREATE TABLE "NpcDialogueBranch" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcDialogueBranch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NpcDialogueBranch_characterId_idx" ON "NpcDialogueBranch"("characterId");

-- AddForeignKey
ALTER TABLE "NpcDialogueBranch"
  ADD CONSTRAINT "NpcDialogueBranch_characterId_fkey"
  FOREIGN KEY ("characterId") REFERENCES "Character"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Conversation
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "npcId" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "mode" "NpcDialogueMode" NOT NULL DEFAULT 'SCRIPTED',
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "contextSnapshot" JSONB,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_sessionId_idx" ON "Conversation"("sessionId");

-- CreateIndex
CREATE INDEX "Conversation_npcId_idx" ON "Conversation"("npcId");

-- AddForeignKey
ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_npcId_fkey"
  FOREIGN KEY ("npcId") REFERENCES "Character"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable ConversationMessage
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "speaker" "ConversationSpeaker" NOT NULL,
    "text" TEXT NOT NULL,
    "branchId" TEXT,
    "detectedEmotion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_idx" ON "ConversationMessage"("conversationId");

-- AddForeignKey
ALTER TABLE "ConversationMessage"
  ADD CONSTRAINT "ConversationMessage_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
