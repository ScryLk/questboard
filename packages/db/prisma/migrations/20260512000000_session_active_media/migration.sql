-- Mídia ativa por sessão (vídeo broadcast pra todos os jogadores).
-- Null quando nada está sendo exibido. GM controla via REST + Socket.

ALTER TABLE "Session" ADD COLUMN "activeMedia" JSONB;
