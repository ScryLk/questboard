import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { mediaUploadSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";
import { BadRequestError, ForbiddenError } from "../../errors/app-error.js";

export async function mediaUploadRoutes(app: FastifyInstance) {
  // ── Request Upload URL ──
  // In production, this would generate a presigned URL for R2/S3
  app.post("/upload/request", async (request, reply) => {
    const input = mediaUploadSchema.parse(request.body);

    // Validate file size based on purpose
    const maxSizes: Record<string, number> = {
      chat_attachment: 10,
      handout_image: 20,
      character_avatar: 5,
      custom_audio: 50,
    };

    const maxMb = maxSizes[input.purpose] ?? 10;
    if (input.fileSizeMb > maxMb) {
      throw new BadRequestError(`Arquivo excede o limite de ${maxMb}MB para ${input.purpose}`);
    }

    // Validate mime types
    const allowedMimes: Record<string, string[]> = {
      chat_attachment: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"],
      handout_image: ["image/jpeg", "image/png", "image/webp"],
      character_avatar: ["image/jpeg", "image/png", "image/webp"],
      custom_audio: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/mp4"],
    };

    const allowed = allowedMimes[input.purpose] ?? [];
    if (!allowed.includes(input.mimeType)) {
      throw new BadRequestError(`Tipo de arquivo não permitido: ${input.mimeType}`);
    }

    // Generate a stub upload URL (in production: presigned R2/S3 URL)
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const key = `uploads/${request.user.id}/${input.purpose}/${uploadId}/${input.fileName}`;

    return reply.send(createSuccessResponse({
      uploadId,
      uploadUrl: `/api/v1/upload/${uploadId}`,
      fileUrl: `https://cdn.questboard.app/${key}`,
      expiresIn: 3600,
    }));
  });

  // ── Confirm Upload ──
  app.post("/upload/:uploadId/confirm", async (request, reply) => {
    const { uploadId } = request.params as { uploadId: string };

    // In production: verify the upload was completed in R2/S3, run virus scan, generate thumbnails
    return reply.send(createSuccessResponse({
      uploadId,
      status: "confirmed",
    }));
  });
}
