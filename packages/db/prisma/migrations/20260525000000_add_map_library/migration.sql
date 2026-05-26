-- CreateTable: MapCollection (criado antes pra fk de MapTemplate.collectionId apontar)
CREATE TABLE "MapCollection" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "description" VARCHAR(500),
    "coverMapId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MapTemplate
CREATE TABLE "MapTemplate" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(2000) NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" VARCHAR(40) NOT NULL DEFAULT 'custom',
    "thumbnail" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "cellSizeFt" INTEGER NOT NULL DEFAULT 5,
    "terrain" JSONB NOT NULL DEFAULT '{}',
    "walls" JSONB NOT NULL DEFAULT '{}',
    "objects" JSONB NOT NULL DEFAULT '[]',
    "background" TEXT,
    "bgOpacity" INTEGER NOT NULL DEFAULT 60,
    "stats" JSONB NOT NULL DEFAULT '{}',
    "collectionId" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MapCollection_campaignId_idx" ON "MapCollection"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "MapCollection_campaignId_name_key" ON "MapCollection"("campaignId", "name");

-- CreateIndex
CREATE INDEX "MapTemplate_campaignId_idx" ON "MapTemplate"("campaignId");

-- CreateIndex
CREATE INDEX "MapTemplate_collectionId_idx" ON "MapTemplate"("collectionId");

-- AddForeignKey
ALTER TABLE "MapCollection" ADD CONSTRAINT "MapCollection_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapTemplate" ADD CONSTRAINT "MapTemplate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapTemplate" ADD CONSTRAINT "MapTemplate_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "MapCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
