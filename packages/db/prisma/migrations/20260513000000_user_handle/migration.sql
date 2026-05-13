-- ── User Handle (Name#TAG estilo Riot) ──────────────────────────
--
-- 1) Adiciona colunas (tag + cooldown tracking)
-- 2) Backfill: gera tag pra todos os usuários existentes; preenche
--    username se for NULL (a partir do email)
-- 3) Torna username NOT NULL
-- 4) Remove o unique global de username
-- 5) Cria unique funcional case-insensitive em (LOWER(username), UPPER(tag))

-- 1) Colunas novas
ALTER TABLE "User"
  ADD COLUMN "tag" VARCHAR(5),
  ADD COLUMN "usernameChangedAt" TIMESTAMP(3),
  ADD COLUMN "tagChangedAt" TIMESTAMP(3),
  ADD COLUMN "tagRerollsUsed" INTEGER NOT NULL DEFAULT 0;

-- 2a) Backfill username quando NULL (a partir do email, máx 30 chars,
--     normalizado pra [a-z0-9_-]). Colisões resolvidas no passo 2c.
UPDATE "User"
SET "username" = LEFT(
  REGEXP_REPLACE(LOWER(SPLIT_PART(email, '@', 1)), '[^a-z0-9_-]', '', 'g'),
  30
)
WHERE "username" IS NULL OR LENGTH(TRIM("username")) = 0;

-- 2b) Fallback pros que ficaram vazios mesmo depois (email inválido)
UPDATE "User"
SET "username" = 'player' || SUBSTR("id", 1, 6)
WHERE "username" IS NULL OR LENGTH(TRIM("username")) = 0;

-- 2c) Gera tag de 4 chars do alfabeto seguro [A-HJ-NP-Z2-9] pra cada
--     usuário. Pseudo-aleatório via MD5 do id; suficiente pra backfill.
--     Usuários podem rerolar depois.
UPDATE "User"
SET "tag" = (
  SELECT STRING_AGG(
    SUBSTR('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ((get_byte(digest("id" || gs.n::text, 'sha256'), 0)) % 32) + 1, 1),
    ''
  )
  FROM generate_series(0, 3) gs(n)
)
WHERE "tag" IS NULL;

-- Garante extensão pgcrypto pra digest() (no-op se já existe)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Refaz o backfill agora com pgcrypto garantido (case onde digest falhou)
UPDATE "User"
SET "tag" = (
  SELECT STRING_AGG(
    SUBSTR('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ((get_byte(digest("id" || gs.n::text, 'sha256'), 0)) % 32) + 1, 1),
    ''
  )
  FROM generate_series(0, 3) gs(n)
)
WHERE "tag" IS NULL OR LENGTH("tag") < 4;

-- 3) Torna colunas NOT NULL agora que estão preenchidas
ALTER TABLE "User"
  ALTER COLUMN "username" SET NOT NULL,
  ALTER COLUMN "tag" SET NOT NULL;

-- 4) Remove o unique global de username (agora pode repetir)
DROP INDEX IF EXISTS "User_username_key";

-- 5) Unique funcional: pares (username, tag) case-insensitive
CREATE UNIQUE INDEX "User_handle_unique"
  ON "User" (LOWER("username"), UPPER("tag"));

-- 6) Index pra busca/autocomplete por prefixo de username (LIKE)
CREATE INDEX "User_username_lower_idx"
  ON "User" (LOWER("username"));
