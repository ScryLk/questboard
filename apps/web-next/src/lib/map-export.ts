import type { QuestBoardMap } from "./map-types";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50)
    || "mapa";
}

/** Download a QuestBoardMap as a .questmap.json file. */
export function downloadMapJSON(map: QuestBoardMap): void {
  // Strip thumbnail to reduce file size
  const { thumbnail: _, ...exportData } = map;
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(map.name)}.questmap.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download a thumbnail as a PNG file. */
export function downloadMapPNG(thumbnail: string, name: string): void {
  const a = document.createElement("a");
  a.href = thumbnail;
  a.download = `${sanitizeFilename(name)}.png`;
  a.click();
}

/** Parse and validate imported JSON. Returns QuestBoardMap on success or { error } on failure. */
export function parseMapJSON(
  json: string,
): QuestBoardMap | { error: string } {
  try {
    const data = JSON.parse(json);

    // Validate required fields
    if (!data.name || typeof data.name !== "string") {
      return { error: "Campo 'name' ausente ou inválido." };
    }
    if (!data.width || !data.height) {
      return { error: "Campos 'width'/'height' ausentes." };
    }
    if (typeof data.terrain !== "object" || Array.isArray(data.terrain)) {
      // Allow missing terrain (empty map)
      if (data.terrain !== undefined) {
        return { error: "Campo 'terrain' deve ser um objeto." };
      }
    }

    // Normalize and return
    const terrain = data.terrain ?? {};
    const walls = data.walls ?? {};
    const objects = data.objects ?? [];

    return {
      id: "", // Will be assigned by store
      version: data.version ?? 1,
      name: data.name,
      description: data.description ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category ?? "custom",
      thumbnail: null,
      width: Number(data.width),
      height: Number(data.height),
      cellSizeFt: data.cellSizeFt ?? 5,
      terrain,
      walls,
      objects,
      backgroundImage: data.backgroundImage ?? null,
      backgroundOpacity: data.backgroundOpacity ?? 0.5,
      createdAt: 0,
      updatedAt: 0,
      stats: {
        terrainCount: Object.keys(terrain).length,
        wallCount: Object.keys(walls).length,
        objectCount: objects.length,
      },
    } as QuestBoardMap;
  } catch {
    return { error: "JSON inválido." };
  }
}
