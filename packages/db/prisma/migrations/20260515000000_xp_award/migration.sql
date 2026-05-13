-- ── XP Award (audit trail) ───────────────────────────────────
-- Cada award/subtraction de XP gera uma linha. Preserva histórico
-- mesmo se Character for soft-deleted (cascade só no hard delete).

CREATE TABLE "XpAward" (
  "id"           TEXT NOT NULL,
  "characterId"  TEXT NOT NULL,
  "awardedById"  TEXT NOT NULL,
  "sessionId"    TEXT,
  "delta"        INTEGER NOT NULL,
  "reason"       VARCHAR(500),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "XpAward_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "XpAward_characterId_createdAt_idx"
  ON "XpAward" ("characterId", "createdAt");
CREATE INDEX "XpAward_sessionId_idx"
  ON "XpAward" ("sessionId");

ALTER TABLE "XpAward"
  ADD CONSTRAINT "XpAward_characterId_fkey"
  FOREIGN KEY ("characterId") REFERENCES "Character"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
