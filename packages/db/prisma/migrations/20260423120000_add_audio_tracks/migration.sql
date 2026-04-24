-- CreateEnum
CREATE TYPE "AudioChannel" AS ENUM ('AMBIENT', 'MUSIC', 'SFX');

-- AlterTable
ALTER TABLE "AudioTrack" ADD COLUMN     "channel" "AudioChannel" NOT NULL DEFAULT 'AMBIENT',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "durationMs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fileSizeBytes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isOfficial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "AudioTrack_ownerId_channel_idx" ON "AudioTrack"("ownerId", "channel");

-- CreateIndex
CREATE INDEX "AudioTrack_isOfficial_channel_idx" ON "AudioTrack"("isOfficial", "channel");

-- CreateIndex
CREATE INDEX "AudioTrack_tags_idx" ON "AudioTrack" USING GIN ("tags");

-- AddForeignKey
ALTER TABLE "AudioTrack" ADD CONSTRAINT "AudioTrack_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
