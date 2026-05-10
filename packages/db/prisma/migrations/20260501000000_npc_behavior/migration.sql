-- NPC Behavior — comportamento autônomo (multidão, fuga, etc).
-- CLAUDE.md §6.2. Estado vive em RAM/Redis durante o tick loop;
-- snapshot persiste aqui a cada 30s + ao encerrar.

-- CreateEnum
CREATE TYPE "NpcBehaviorType" AS ENUM (
  'IDLE', 'CROWD', 'PATROL', 'GUARD',
  'FLEE', 'PANIC', 'RIOT', 'FOLLOW', 'SEARCH'
);

-- CreateEnum
CREATE TYPE "BehaviorStatus" AS ENUM ('ACTIVE', 'PAUSED', 'FINISHED');

-- CreateTable
CREATE TABLE "BehaviorInstance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "NpcBehaviorType" NOT NULL,
    "status" "BehaviorStatus" NOT NULL DEFAULT 'ACTIVE',
    "tokenIds" TEXT[],
    "params" JSONB NOT NULL DEFAULT '{}',
    "lastSnapshot" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "BehaviorInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BehaviorInstance_sessionId_idx" ON "BehaviorInstance"("sessionId");

-- CreateIndex
CREATE INDEX "BehaviorInstance_status_idx" ON "BehaviorInstance"("status");

-- AddForeignKey
ALTER TABLE "BehaviorInstance"
  ADD CONSTRAINT "BehaviorInstance_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
