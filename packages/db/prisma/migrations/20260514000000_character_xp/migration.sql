-- Adiciona XP acumulado ao Character. Default 0 — usuários existentes
-- começam sem progresso até o GM/sistema atribuir XP via sessão.
ALTER TABLE "Character" ADD COLUMN "currentXp" INTEGER NOT NULL DEFAULT 0;
