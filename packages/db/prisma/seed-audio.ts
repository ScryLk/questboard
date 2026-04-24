// Seed da biblioteca oficial de áudio — 30 faixas (10 AMBIENT + 15 MUSIC + 5 SFX).
//
// ⚠️  Esta fatia grava apenas os METADADOS. Os arquivos .ogg em
//     https://cdn.questboard.gg/audio/official/<channel>/<slug>.ogg
//     são populados manualmente no bucket R2 fora deste seed.
//
// Função é idempotente: usa upsert por id fixo (padrão
// `official_<channel>_<slug>`), então rodar múltiplas vezes não duplica.
//
// Durante o rollout: populamos tanto os campos canônicos novos
// (channel, durationMs, fileSizeBytes, tags, isOfficial) quanto os legacy
// (category, duration, isBuiltin) para não quebrar o audio-panel atual do web.

import type { PrismaClient, AudioChannel } from "@prisma/client";

type OfficialTrack = {
  id: string;
  name: string;
  channel: AudioChannel;
  // Categoria legacy — display string para o audio-panel atual.
  category: string;
  tags: string[];
  durationMs: number;
  // Estimado a ~16KB/s (ogg stereo 128kbps).
  fileSizeBytes: number;
  description?: string;
  urlSlug: string;
};

const TRACKS: OfficialTrack[] = [
  // ── AMBIENT (10) ──────────────────────────────────────────────
  { id: "official_ambient_floresta_noturna",   name: "Floresta Noturna",           channel: "AMBIENT", category: "floresta",   tags: ["floresta", "noite"],                     durationMs: 180000, fileSizeBytes: 2880000, urlSlug: "floresta-noturna" },
  { id: "official_ambient_taverna_movimentada", name: "Taverna Movimentada",       channel: "AMBIENT", category: "taverna",    tags: ["taverna", "cidade"],                     durationMs: 150000, fileSizeBytes: 2400000, urlSlug: "taverna-movimentada" },
  { id: "official_ambient_caverna_umida",      name: "Caverna Úmida",              channel: "AMBIENT", category: "caverna",    tags: ["caverna", "subterraneo"],                durationMs: 170000, fileSizeBytes: 2720000, urlSlug: "caverna-umida" },
  { id: "official_ambient_chuva_forte",        name: "Chuva Forte",                channel: "AMBIENT", category: "chuva",      tags: ["chuva", "tempestade"],                   durationMs: 160000, fileSizeBytes: 2560000, urlSlug: "chuva-forte" },
  { id: "official_ambient_fogueira",           name: "Fogueira Crepitante",        channel: "AMBIENT", category: "fogueira",   tags: ["fogueira", "noite", "calmo"],            durationMs: 140000, fileSizeBytes: 2240000, urlSlug: "fogueira-crepitante" },
  { id: "official_ambient_masmorra_sombria",   name: "Masmorra Sombria",           channel: "AMBIENT", category: "masmorra",   tags: ["masmorra", "subterraneo", "sombrio"],    durationMs: 175000, fileSizeBytes: 2800000, urlSlug: "masmorra-sombria" },
  { id: "official_ambient_mercado_cidade",     name: "Mercado de Cidade",          channel: "AMBIENT", category: "cidade",     tags: ["cidade", "dia"],                         durationMs: 130000, fileSizeBytes: 2080000, urlSlug: "mercado-de-cidade" },
  { id: "official_ambient_vento_montanha",     name: "Vento Gelado de Montanha",   channel: "AMBIENT", category: "montanha",   tags: ["montanha", "vento"],                     durationMs: 125000, fileSizeBytes: 2000000, urlSlug: "vento-gelado-de-montanha" },
  { id: "official_ambient_ondas_oceano",       name: "Ondas do Oceano",            channel: "AMBIENT", category: "oceano",     tags: ["oceano", "calmo"],                       durationMs: 180000, fileSizeBytes: 2880000, urlSlug: "ondas-do-oceano" },
  { id: "official_ambient_cemiterio",          name: "Cemitério Assombrado",       channel: "AMBIENT", category: "cemiterio",  tags: ["cemiterio", "sombrio", "misterioso"],    durationMs: 165000, fileSizeBytes: 2640000, urlSlug: "cemiterio-assombrado" },

  // ── MUSIC (15) ────────────────────────────────────────────────
  { id: "official_music_combate_epico",        name: "Combate Épico",              channel: "MUSIC",   category: "combate",    tags: ["combate", "epico"],                      durationMs: 195000, fileSizeBytes: 3120000, urlSlug: "combate-epico" },
  { id: "official_music_batalha_boss",         name: "Batalha contra Boss",        channel: "MUSIC",   category: "combate",    tags: ["boss", "combate", "epico"],              durationMs: 225000, fileSizeBytes: 3600000, urlSlug: "batalha-contra-boss" },
  { id: "official_music_exploracao_tranquila", name: "Exploração Tranquila",       channel: "MUSIC",   category: "exploracao", tags: ["exploracao", "calmo"],                   durationMs: 210000, fileSizeBytes: 3360000, urlSlug: "exploracao-tranquila" },
  { id: "official_music_misterio_suspense",    name: "Mistério e Suspense",        channel: "MUSIC",   category: "misterioso", tags: ["misterioso", "tenso"],                   durationMs: 180000, fileSizeBytes: 2880000, urlSlug: "misterio-e-suspense" },
  { id: "official_music_tema_vitoria",         name: "Tema de Vitória",            channel: "MUSIC",   category: "triunfante", tags: ["triunfante"],                            durationMs: 140000, fileSizeBytes: 2240000, urlSlug: "tema-de-vitoria" },
  { id: "official_music_luto_perda",           name: "Luto e Perda",               channel: "MUSIC",   category: "melancolico", tags: ["melancolico"],                          durationMs: 170000, fileSizeBytes: 2720000, urlSlug: "luto-e-perda" },
  { id: "official_music_perseguicao",          name: "Perseguição Frenética",      channel: "MUSIC",   category: "combate",    tags: ["combate", "tenso"],                      durationMs: 150000, fileSizeBytes: 2400000, urlSlug: "perseguicao-frenetica" },
  { id: "official_music_revelacao_sombria",    name: "Revelação Sombria",          channel: "MUSIC",   category: "sombrio",    tags: ["sombrio", "tenso"],                      durationMs: 165000, fileSizeBytes: 2640000, urlSlug: "revelacao-sombria" },
  { id: "official_music_viagem_epica",         name: "Viagem Épica",               channel: "MUSIC",   category: "exploracao", tags: ["exploracao", "epico"],                   durationMs: 240000, fileSizeBytes: 3840000, urlSlug: "viagem-epica" },
  { id: "official_music_combate_masmorra",     name: "Combate em Masmorra",        channel: "MUSIC",   category: "combate",    tags: ["combate", "masmorra", "sombrio"],        durationMs: 200000, fileSizeBytes: 3200000, urlSlug: "combate-em-masmorra" },
  { id: "official_music_calmaria_tempestade",  name: "Calmaria antes da Tempestade", channel: "MUSIC", category: "tenso",      tags: ["tenso", "calmo"],                        durationMs: 175000, fileSizeBytes: 2800000, urlSlug: "calmaria-antes-da-tempestade" },
  { id: "official_music_tema_heroico",         name: "Tema Heróico",               channel: "MUSIC",   category: "triunfante", tags: ["triunfante", "epico"],                   durationMs: 220000, fileSizeBytes: 3520000, urlSlug: "tema-heroico" },
  { id: "official_music_encontro_magico",      name: "Encontro Mágico",            channel: "MUSIC",   category: "misterioso", tags: ["misterioso"],                            durationMs: 160000, fileSizeBytes: 2560000, urlSlug: "encontro-magico" },
  { id: "official_music_emboscada",            name: "Emboscada!",                 channel: "MUSIC",   category: "combate",    tags: ["combate", "tenso"],                      durationMs: 130000, fileSizeBytes: 2080000, urlSlug: "emboscada" },
  { id: "official_music_descanso_taverna",     name: "Descanso na Taverna",        channel: "MUSIC",   category: "taverna",    tags: ["taverna", "calmo"],                      durationMs: 155000, fileSizeBytes: 2480000, urlSlug: "descanso-na-taverna" },

  // ── SFX (5) ───────────────────────────────────────────────────
  { id: "official_sfx_trovao",                 name: "Trovão Forte",               channel: "SFX",     category: "sfx",        tags: ["trovao", "tempestade"],                  durationMs: 6000,   fileSizeBytes: 96000,   urlSlug: "trovao-forte" },
  { id: "official_sfx_sino_igreja",            name: "Sino da Igreja",             channel: "SFX",     category: "sfx",        tags: ["sino"],                                  durationMs: 4000,   fileSizeBytes: 64000,   urlSlug: "sino-da-igreja" },
  { id: "official_sfx_rugido_dragao",          name: "Rugido de Dragão",           channel: "SFX",     category: "sfx",        tags: ["rugido", "magia"],                       durationMs: 5000,   fileSizeBytes: 80000,   urlSlug: "rugido-de-dragao" },
  { id: "official_sfx_porta_rangendo",         name: "Porta Rangendo",             channel: "SFX",     category: "sfx",        tags: ["porta"],                                 durationMs: 3000,   fileSizeBytes: 48000,   urlSlug: "porta-rangendo" },
  { id: "official_sfx_impacto_espada",         name: "Impacto de Espada",          channel: "SFX",     category: "sfx",        tags: ["espada", "combate"],                     durationMs: 2000,   fileSizeBytes: 32000,   urlSlug: "impacto-de-espada" },
];

function urlFor(channel: AudioChannel, slug: string): string {
  return `https://cdn.questboard.gg/audio/official/${channel.toLowerCase()}/${slug}.ogg`;
}

export async function seedAudio(prisma: PrismaClient): Promise<void> {
  for (const t of TRACKS) {
    const url = urlFor(t.channel, t.urlSlug);
    const durationSec = Math.round(t.durationMs / 1000);

    await prisma.audioTrack.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        url,
        description: t.description ?? null,
        channel: t.channel,
        tags: t.tags,
        durationMs: t.durationMs,
        fileSizeBytes: t.fileSizeBytes,
        isOfficial: true,
        ownerId: null,
        // sync legacy
        category: t.category,
        duration: durationSec,
        isBuiltin: true,
      },
      create: {
        id: t.id,
        name: t.name,
        url,
        description: t.description ?? null,
        channel: t.channel,
        tags: t.tags,
        durationMs: t.durationMs,
        fileSizeBytes: t.fileSizeBytes,
        isOfficial: true,
        ownerId: null,
        category: t.category,
        duration: durationSec,
        isBuiltin: true,
      },
    });
  }

  console.log(`  - Audio: ${TRACKS.length} faixas oficiais seedadas`);
}
