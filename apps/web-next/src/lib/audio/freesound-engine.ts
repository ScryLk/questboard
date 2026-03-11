// ── Freesound SFX Engine ──
// Searches Freesound API for best-rated sounds, downloads MP3 previews,
// caches in IndexedDB, and plays via Web Audio API AudioBuffers.

import { audioEngine } from "./audio-engine";
import type { SFXDefinition } from "./sfx-definitions";

const FREESOUND_BASE = "https://freesound.org/apiv2";
const API_KEY = process.env.NEXT_PUBLIC_FREESOUND_API_KEY;
const DB_NAME = "questboard-sfx-cache";
const DB_STORE = "audio-buffers";
const DB_VERSION = 1;

// ── Types ──

interface FreesoundSound {
  id: number;
  name: string;
  duration: number;
  avg_rating: number;
  num_ratings: number;
  username: string;
  license: string;
  previews: {
    "preview-hq-mp3": string;
    "preview-lq-mp3": string;
    "preview-hq-ogg": string;
    "preview-lq-ogg": string;
  };
}

interface CachedEntry {
  id: string;
  arrayBuffer: ArrayBuffer;
  meta: SoundMeta | null;
  cachedAt: number;
}

export interface SoundMeta {
  freesoundId: number;
  name: string;
  author: string;
  license: string;
}

export type LoadingStatus = "pending" | "loading" | "loaded" | "error";

// ── Engine ──

class FreesoundSFXEngine {
  // In-memory AudioBuffer cache (ready to play)
  private bufferCache = new Map<string, AudioBuffer>();

  // Sound metadata (for credits/attribution)
  private soundMeta = new Map<string, SoundMeta>();

  // Loading status per SFX
  private statusMap = new Map<string, LoadingStatus>();
  private statusListeners = new Set<() => void>();

  // ═══════════════════════════
  // LOAD ALL SFX
  // ═══════════════════════════

  async loadAllSFX(
    definitions: SFXDefinition[],
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<void> {
    if (!API_KEY) {
      console.warn("[SFX] No Freesound API key configured (NEXT_PUBLIC_FREESOUND_API_KEY)");
      return;
    }

    const total = definitions.length;
    let loaded = 0;

    // Load with concurrency limit to respect rate limits
    const concurrency = 4;
    const queue = [...definitions];

    const worker = async () => {
      while (queue.length > 0) {
        const def = queue.shift()!;
        await this.loadSFX(def);
        loaded++;
        onProgress?.(loaded, total);
      }
    };

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);
  }

  async loadSFX(def: SFXDefinition): Promise<void> {
    // 1. Check in-memory cache
    if (this.bufferCache.has(def.id)) {
      this.setStatus(def.id, "loaded");
      return;
    }

    // 2. Check IndexedDB cache
    try {
      const cached = await this.getFromIndexedDB(def.id);
      if (cached?.arrayBuffer) {
        await audioEngine.init();
        const buffer = await audioEngine.context.decodeAudioData(cached.arrayBuffer.slice(0));
        this.bufferCache.set(def.id, buffer);
        if (cached.meta) this.soundMeta.set(def.id, cached.meta);
        this.setStatus(def.id, "loaded");
        return;
      }
    } catch {
      // IndexedDB failed, continue to fetch
    }

    // 3. Search Freesound API
    this.setStatus(def.id, "loading");

    try {
      const sound = await this.searchBestSound(def);
      if (!sound) {
        console.warn(`[SFX] No sound found for "${def.id}" (query: "${def.query}")`);
        this.setStatus(def.id, "error");
        return;
      }

      // 4. Download preview MP3
      const previewUrl = sound.previews["preview-hq-mp3"];
      const response = await fetch(previewUrl);
      if (!response.ok) {
        this.setStatus(def.id, "error");
        return;
      }
      const arrayBuffer = await response.arrayBuffer();

      // 5. Decode into AudioBuffer
      await audioEngine.init();
      const buffer = await audioEngine.context.decodeAudioData(arrayBuffer.slice(0));
      this.bufferCache.set(def.id, buffer);

      // 6. Save metadata
      const meta: SoundMeta = {
        freesoundId: sound.id,
        name: sound.name,
        author: sound.username,
        license: sound.license,
      };
      this.soundMeta.set(def.id, meta);

      // 7. Persist to IndexedDB
      await this.saveToIndexedDB(def.id, arrayBuffer, meta);

      this.setStatus(def.id, "loaded");
    } catch (err) {
      console.error(`[SFX] Error loading "${def.id}":`, err);
      this.setStatus(def.id, "error");
    }
  }

  // ═══════════════════════════
  // SEARCH BEST SOUND
  // ═══════════════════════════

  private async searchBestSound(def: SFXDefinition): Promise<FreesoundSound | null> {
    const queries = [def.query, ...def.fallbackQueries];

    for (const query of queries) {
      const results = await this.searchFreesound(query, def.filter);
      if (!results || results.length === 0) continue;

      // Filter by duration and rating
      const filtered = results.filter(
        (s) =>
          s.duration >= def.minDuration &&
          s.duration <= def.maxDuration &&
          (s.avg_rating >= def.minRating || s.num_ratings === 0),
      );

      if (filtered.length > 0) {
        // Sort by quality score: rating * log(num_ratings + 1)
        return filtered.sort((a, b) => {
          const scoreA = a.avg_rating * Math.log(a.num_ratings + 1);
          const scoreB = b.avg_rating * Math.log(b.num_ratings + 1);
          return scoreB - scoreA;
        })[0];
      }
    }

    return null;
  }

  private async searchFreesound(query: string, filter: string): Promise<FreesoundSound[]> {
    if (!API_KEY) return [];

    const params = new URLSearchParams({
      query,
      filter,
      fields: "id,name,duration,previews,avg_rating,num_ratings,username,license",
      sort: "rating_desc",
      page_size: "10",
      token: API_KEY,
    });

    try {
      const response = await fetch(`${FREESOUND_BASE}/search/text/?${params}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.results || [];
    } catch {
      return [];
    }
  }

  // ═══════════════════════════
  // PLAY SFX
  // ═══════════════════════════

  play(sfxId: string, options?: { volume?: number; playbackRate?: number }): void {
    if (!audioEngine.initialized) return;

    const buffer = this.bufferCache.get(sfxId);
    if (!buffer) return;

    const ctx = audioEngine.context;

    // Resume if suspended
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Slight pitch variation to prevent repetitive feel
    source.playbackRate.value = options?.playbackRate ?? (0.95 + Math.random() * 0.1);

    // Per-sound volume
    const gainNode = ctx.createGain();
    gainNode.gain.value = options?.volume ?? 0.5;

    source.connect(gainNode);
    gainNode.connect(audioEngine.sfxOutput);
    source.start(0);
  }

  playWithVariation(sfxId: string, volume?: number): void {
    this.play(sfxId, {
      playbackRate: 0.9 + Math.random() * 0.2,
      volume,
    });
  }

  isLoaded(sfxId: string): boolean {
    return this.bufferCache.has(sfxId);
  }

  // ═══════════════════════════
  // STATUS
  // ═══════════════════════════

  private setStatus(id: string, status: LoadingStatus) {
    this.statusMap.set(id, status);
    this.statusListeners.forEach((fn) => fn());
  }

  getStatus(id: string): LoadingStatus {
    return this.statusMap.get(id) ?? "pending";
  }

  getLoadedCount(): number {
    let count = 0;
    this.statusMap.forEach((s) => {
      if (s === "loaded") count++;
    });
    return count;
  }

  onStatusChange(fn: () => void): () => void {
    this.statusListeners.add(fn);
    return () => this.statusListeners.delete(fn);
  }

  // ═══════════════════════════
  // REPLACE SFX (GM can swap)
  // ═══════════════════════════

  async replaceSFX(sfxId: string, freesoundId: number): Promise<void> {
    if (!API_KEY) return;

    const url = `${FREESOUND_BASE}/sounds/${freesoundId}/?fields=id,name,previews,username,license&token=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch sound");
    const sound = await response.json();

    const previewUrl = sound.previews["preview-hq-mp3"];
    const audioResponse = await fetch(previewUrl);
    const arrayBuffer = await audioResponse.arrayBuffer();

    await audioEngine.init();
    const buffer = await audioEngine.context.decodeAudioData(arrayBuffer.slice(0));
    this.bufferCache.set(sfxId, buffer);

    const meta: SoundMeta = {
      freesoundId: sound.id,
      name: sound.name,
      author: sound.username,
      license: sound.license,
    };
    this.soundMeta.set(sfxId, meta);
    await this.saveToIndexedDB(sfxId, arrayBuffer, meta);
  }

  // ═══════════════════════════
  // CREDITS
  // ═══════════════════════════

  getCredits(): Array<{ sfxId: string } & SoundMeta> {
    const credits: Array<{ sfxId: string } & SoundMeta> = [];
    this.soundMeta.forEach((meta, sfxId) => {
      credits.push({ sfxId, ...meta });
    });
    return credits;
  }

  getMeta(sfxId: string): SoundMeta | undefined {
    return this.soundMeta.get(sfxId);
  }

  // ═══════════════════════════
  // INDEXEDDB CACHE
  // ═══════════════════════════

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToIndexedDB(id: string, arrayBuffer: ArrayBuffer, meta: SoundMeta): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({ id, arrayBuffer, meta, cachedAt: Date.now() } satisfies CachedEntry);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // IndexedDB write failed — non-critical
    }
  }

  private async getFromIndexedDB(id: string): Promise<CachedEntry | null> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(DB_STORE, "readonly");
      const request = tx.objectStore(DB_STORE).get(id);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).clear();
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Non-critical
    }
    this.bufferCache.clear();
    this.soundMeta.clear();
    this.statusMap.clear();
    this.statusListeners.forEach((fn) => fn());
  }

  // Search Freesound for custom GM queries
  async searchCustom(query: string, maxDuration = 5): Promise<FreesoundSound[]> {
    return this.searchFreesound(query, `duration:[0.1 TO ${maxDuration}]`);
  }
}

export const freesoundEngine = new FreesoundSFXEngine();
