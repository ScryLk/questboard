// Testes do MediaService — mock leve de Prisma + socket-events.
// Cobre: gates de status, normalização de URL, persistência e
// emissão de socket events.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMediaService } from "../media.service.js";
import { BadRequestError, NotFoundError } from "../../../errors/app-error.js";
import {
  extractVimeoId,
  extractYouTubeId,
  isDirectVideoUrl,
  normalizeMediaUrl,
} from "@questboard/validators";

const emitMediaShow = vi.fn();
const emitMediaHide = vi.fn();

vi.mock("../../../lib/socket-events.js", () => ({
  emitMediaShow: (...args: unknown[]) => emitMediaShow(...args),
  emitMediaHide: (...args: unknown[]) => emitMediaHide(...args),
}));

interface FakeSession {
  id: string;
  status: "IDLE" | "LOBBY" | "LIVE" | "PAUSED" | "ENDED" | "ARCHIVED";
  activeMedia: unknown;
}

function buildPrismaMock(sessions: FakeSession[]) {
  const db = new Map<string, FakeSession>(sessions.map((s) => [s.id, s]));
  return {
    session: {
      findUnique: ({ where }: { where: { id: string } }) => {
        const s = db.get(where.id);
        return Promise.resolve(s ?? null);
      },
      update: ({
        where,
        data,
      }: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => {
        const s = db.get(where.id);
        if (!s) throw new Error("not found");
        // Prisma.JsonNull vira null na in-memory.
        const next: FakeSession = {
          ...s,
          activeMedia:
            data.activeMedia === undefined || data.activeMedia === null
              ? null
              : typeof data.activeMedia === "object" &&
                  data.activeMedia !== null &&
                  // Prisma.JsonNull é um símbolo/objeto sentinela
                  Object.prototype.toString.call(data.activeMedia) ===
                    "[object Object]" &&
                  "_tag" in (data.activeMedia as Record<string, unknown>)
                ? null
                : (data.activeMedia as unknown),
        };
        db.set(where.id, next);
        return Promise.resolve(next);
      },
    },
  };
}

describe("media URL parsers", () => {
  it("extrai videoId de YouTube em formatos comuns", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(
      extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
    expect(
      extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("rejeita URLs não-YouTube", () => {
    expect(extractYouTubeId("https://example.com/")).toBeNull();
    expect(extractYouTubeId("not-a-url")).toBeNull();
  });

  it("extrai videoId de Vimeo", () => {
    expect(extractVimeoId("https://vimeo.com/12345678")).toBe("12345678");
    expect(extractVimeoId("https://www.vimeo.com/87654321/extra")).toBe(
      "87654321",
    );
    expect(extractVimeoId("https://example.com/12345678")).toBeNull();
  });

  it("detecta MP4 / WebM direto", () => {
    expect(isDirectVideoUrl("https://cdn.example.com/clip.mp4")).toBe(true);
    expect(isDirectVideoUrl("https://cdn.example.com/clip.webm")).toBe(true);
    expect(isDirectVideoUrl("https://cdn.example.com/clip.mov")).toBe(false);
    expect(isDirectVideoUrl("https://example.com/")).toBe(false);
  });

  it("normalizeMediaUrl produz embedUrl pra cada provider", () => {
    expect(normalizeMediaUrl("https://youtu.be/dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      embedUrl:
        "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
    });
    expect(normalizeMediaUrl("https://vimeo.com/12345678")).toEqual({
      provider: "vimeo",
      embedUrl: "https://player.vimeo.com/video/12345678?autoplay=1",
    });
    expect(
      normalizeMediaUrl("https://cdn.example.com/clip.mp4"),
    ).toEqual({
      provider: "mp4",
      embedUrl: "https://cdn.example.com/clip.mp4",
    });
    expect(normalizeMediaUrl("https://example.com/index.html")).toEqual({
      provider: "unknown",
      embedUrl: "https://example.com/index.html",
    });
  });
});

describe("MediaService.show", () => {
  beforeEach(() => {
    emitMediaShow.mockReset();
    emitMediaHide.mockReset();
  });

  it("bloqueia quando sessão não existe", async () => {
    const prisma = buildPrismaMock([]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );
    await expect(
      svc.show("missing", "u1", { url: "https://youtu.be/dQw4w9WgXcQ" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("bloqueia quando sessão não está LIVE", async () => {
    const prisma = buildPrismaMock([
      { id: "s1", status: "LOBBY", activeMedia: null },
    ]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );
    await expect(
      svc.show("s1", "u1", { url: "https://youtu.be/dQw4w9WgXcQ" }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(emitMediaShow).not.toHaveBeenCalled();
  });

  it("rejeita URL desconhecida", async () => {
    const prisma = buildPrismaMock([
      { id: "s1", status: "LIVE", activeMedia: null },
    ]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );
    await expect(
      svc.show("s1", "u1", { url: "https://example.com/" }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(emitMediaShow).not.toHaveBeenCalled();
  });

  it("persiste mídia + emite media:show com payload normalizado", async () => {
    const prisma = buildPrismaMock([
      { id: "s1", status: "LIVE", activeMedia: null },
    ]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );

    const result = await svc.show("s1", "user-gm", {
      url: "https://youtu.be/dQw4w9WgXcQ",
      title: "Trailer",
    });

    expect(result.provider).toBe("youtube");
    expect(result.embedUrl).toContain("/embed/dQw4w9WgXcQ");
    expect(result.title).toBe("Trailer");
    expect(result.by).toBe("user-gm");

    expect(emitMediaShow).toHaveBeenCalledTimes(1);
    expect(emitMediaShow).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "s1",
        provider: "youtube",
        title: "Trailer",
        by: "user-gm",
      }),
    );
  });
});

describe("MediaService.hide", () => {
  beforeEach(() => {
    emitMediaShow.mockReset();
    emitMediaHide.mockReset();
  });

  it("bloqueia quando sessão não existe", async () => {
    const prisma = buildPrismaMock([]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );
    await expect(svc.hide("missing", "u1")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("emite media:hide e zera activeMedia (idempotente)", async () => {
    const prisma = buildPrismaMock([
      {
        id: "s1",
        status: "LIVE",
        activeMedia: { provider: "youtube", embedUrl: "x" },
      },
    ]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );

    await svc.hide("s1", "user-gm");

    expect(emitMediaHide).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "s1", by: "user-gm" }),
    );
  });
});

describe("MediaService.getActive", () => {
  it("retorna null quando vazio", async () => {
    const prisma = buildPrismaMock([
      { id: "s1", status: "LIVE", activeMedia: null },
    ]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );
    const r = await svc.getActive("s1");
    expect(r).toBeNull();
  });

  it("retorna payload persistido", async () => {
    const payload = {
      provider: "youtube",
      embedUrl: "x",
      originalUrl: "y",
      startedAt: new Date().toISOString(),
      by: "u1",
    };
    const prisma = buildPrismaMock([
      { id: "s1", status: "LIVE", activeMedia: payload },
    ]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );
    const r = await svc.getActive("s1");
    expect(r).toEqual(payload);
  });

  it("404 quando sessão não existe", async () => {
    const prisma = buildPrismaMock([]);
    const svc = createMediaService(
      prisma as unknown as Parameters<typeof createMediaService>[0],
    );
    await expect(svc.getActive("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
