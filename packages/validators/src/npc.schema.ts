// ── Conversa com NPC (modo SCRIPTED no MVP) ──
//
// Branches são CRUD-eados pelo GM no editor de personagem. Conversas
// são instâncias ativas durante uma sessão — abertas pelo player ao
// clicar "Conversar" no menu radial. Modos AI/HYBRID dependem de
// backend Gemini (CLAUDE.md §6.3, sprint futura).

import { z } from "zod";

export const NPC_DIALOGUE_MODES = ["SCRIPTED", "AI", "HYBRID"] as const;
export const CONVERSATION_SPEAKERS = ["NPC", "PLAYER", "GM_OVERRIDE"] as const;

// ── Branches ─────────────────────────────────────────────

export const dialogueBranchCreateSchema = z.object({
  trigger: z.string().min(1).max(500),
  response: z.string().min(1).max(2000),
  isFinal: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const dialogueBranchUpdateSchema = dialogueBranchCreateSchema.partial();

export const dialogueBranchReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(50),
});

// ── Abertura de conversa ─────────────────────────────────

export const conversationOpenSchema = z.object({
  npcId: z.string().min(1),
  /** Modo da conversa. SCRIPTED (default) usa só branches pré-escritos.
   *  AI/HYBRID exigem plano LENDARIO + backend Gemini configurado. */
  mode: z.enum(NPC_DIALOGUE_MODES).default("SCRIPTED"),
});

// ── Mensagem na conversa ─────────────────────────────────

export const conversationMessageInputSchema = z
  .object({
    /** Modo SCRIPTED: jogador escolhe uma branch existente. */
    branchId: z.string().min(1).optional(),
    /** Modo AI/HYBRID: jogador digita livremente. Não suportado no MVP. */
    text: z.string().min(1).max(2000).optional(),
  })
  .refine(
    (v) => Boolean(v.branchId) !== Boolean(v.text),
    "Forneça `branchId` (modo SCRIPTED) ou `text` (modo AI), nunca ambos.",
  );

// ── GM override (digita como NPC) ────────────────────────

export const conversationGmOverrideSchema = z.object({
  text: z.string().min(1).max(2000),
});

// ── Tipos ────────────────────────────────────────────────

export type DialogueBranchCreate = z.infer<typeof dialogueBranchCreateSchema>;
export type DialogueBranchUpdate = z.infer<typeof dialogueBranchUpdateSchema>;
export type DialogueBranchReorder = z.infer<typeof dialogueBranchReorderSchema>;
export type ConversationOpenInput = z.infer<typeof conversationOpenSchema>;
export type ConversationMessageInput = z.infer<
  typeof conversationMessageInputSchema
>;
export type ConversationGmOverrideInput = z.infer<
  typeof conversationGmOverrideSchema
>;
