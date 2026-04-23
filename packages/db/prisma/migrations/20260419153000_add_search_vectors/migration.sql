-- ─── Extensões ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ─── Enums novos ───────────────────────────────────────────
CREATE TYPE "MapVisibility" AS ENUM ('PUBLIC', 'GM_ONLY');
CREATE TYPE "NoteVisibility" AS ENUM ('PUBLIC', 'GM_ONLY', 'PRIVATE');
CREATE TYPE "NoteCategory" AS ENUM ('PLOT', 'ITEM', 'NPC', 'GENERAL', 'LOCATION');

-- ─── Map: visibility ───────────────────────────────────────
ALTER TABLE "Map"
  ADD COLUMN "visibility" "MapVisibility" NOT NULL DEFAULT 'GM_ONLY';

-- ─── Character: hidden ─────────────────────────────────────
ALTER TABLE "Character"
  ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT TRUE;

-- ─── Note: tabela nova ─────────────────────────────────────
CREATE TABLE "Note" (
  "id"         TEXT             NOT NULL,
  "campaignId" TEXT             NOT NULL,
  "authorId"   TEXT             NOT NULL,
  "title"      VARCHAR(200)     NOT NULL,
  "content"    TEXT             NOT NULL,
  "category"   "NoteCategory"   NOT NULL DEFAULT 'GENERAL',
  "visibility" "NoteVisibility" NOT NULL DEFAULT 'GM_ONLY',
  "createdAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3)     NOT NULL,
  "deletedAt"  TIMESTAMP(3),
  CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Note"
  ADD CONSTRAINT "Note_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Note"
  ADD CONSTRAINT "Note_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

CREATE INDEX "Note_campaignId_idx"             ON "Note"("campaignId");
CREATE INDEX "Note_authorId_idx"               ON "Note"("authorId");
CREATE INDEX "Note_campaignId_visibility_idx"  ON "Note"("campaignId", "visibility");

-- ─── Imutável wrapper para unaccent (necessário em GENERATED) ──
-- unaccent é STABLE; tsvector generated exige IMMUTABLE.
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$$ SELECT public.unaccent('public.unaccent', $1) $$;

-- ─── Map: tsvector + índices ───────────────────────────────
ALTER TABLE "Map" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', immutable_unaccent(coalesce("name", ''))), 'A') ||
    setweight(to_tsvector('portuguese', immutable_unaccent(coalesce("description", ''))), 'B')
  ) STORED;

CREATE INDEX "Map_search_vector_idx" ON "Map" USING GIN ("search_vector");
CREATE INDEX "Map_name_trgm_idx"     ON "Map" USING GIN ("name" gin_trgm_ops);

-- ─── Character: tsvector + índices ─────────────────────────
ALTER TABLE "Character" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', immutable_unaccent(coalesce("name", ''))), 'A')
  ) STORED;

CREATE INDEX "Character_search_vector_idx" ON "Character" USING GIN ("search_vector");
CREATE INDEX "Character_name_trgm_idx"     ON "Character" USING GIN ("name" gin_trgm_ops);

-- ─── Note: tsvector + índices ──────────────────────────────
ALTER TABLE "Note" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', immutable_unaccent(coalesce("title", ''))), 'A') ||
    setweight(to_tsvector('portuguese', immutable_unaccent(coalesce("content", ''))), 'B')
  ) STORED;

CREATE INDEX "Note_search_vector_idx" ON "Note" USING GIN ("search_vector");
CREATE INDEX "Note_title_trgm_idx"    ON "Note" USING GIN ("title" gin_trgm_ops);

-- ─── Session: tsvector + índices ───────────────────────────
ALTER TABLE "Session" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', immutable_unaccent(coalesce("name", ''))), 'A') ||
    setweight(to_tsvector('portuguese', immutable_unaccent(coalesce("description", ''))), 'B')
  ) STORED;

CREATE INDEX "Session_search_vector_idx" ON "Session" USING GIN ("search_vector");
CREATE INDEX "Session_name_trgm_idx"     ON "Session" USING GIN ("name" gin_trgm_ops);
