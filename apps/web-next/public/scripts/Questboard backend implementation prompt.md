# QuestBoard — Backend Implementation Prompt

> Implementar e fechar o backend completo do QuestBoard, sustentando o frontend Next.js já em produção em `apps/web-next`. Stack mandatória definida em `CLAUDE.md §2`. **Pagamento NÃO está no escopo** — `apps/api/src/modules/billing/` fica como stub até segunda ordem.
>
> ⚠️ **Leia este prompt INTEIRO antes de começar.**
> ⚠️ **Tudo em pt-BR.** Comentários, mensagens de erro, migrations, logs.
> ⚠️ Backend já existe em scaffold (~4800 linhas, 14 módulos, 39 models Prisma, Clerk auth, Socket.IO). Este prompt é o **contrato de fechamento** — não recomeçar do zero, **fechar os gaps** descritos na §3.

---

## 0. Avisos legais e de escopo

### 0.1 O que NÃO está no escopo

- **Pagamento (Mercado Pago / Stripe / billing real)** — manter `apps/api/src/modules/billing/` como módulo stub: endpoints retornam 501 com mensagem "Em breve" e o webhook continua válido pra desenvolvimento futuro. Modelos `Subscription` e `Plan` permanecem no schema (informacionais).
- **Mobile nativa (Expo)** — arquivada em `_legacy/mobile/`. Não construir endpoints exclusivos.
- **Recursos fora do MVP**: chase rules, mass combat, voice/VAD multimodal completa, geração de cenários complexos com IA, notificações push complexas (FCM stub OK).
- **Trocar Clerk por outra solução de auth.** Clerk já está plugado e funcionando. Não migrar.

### 0.2 Princípios de ouro (não negociáveis)

1. **`CELL_SIZE = 64`** — sempre via `@questboard/constants`. Jamais hardcoded.
2. **Servidor é authoritative.** Posição de token, HP, fog, dados, SAN — tudo persistido e validado no servidor. Cliente faz optimistic update mas SEMPRE aceita correção.
3. **Dados são rolados no servidor** com `crypto.getRandomValues()`. Nunca `Math.random()`. Cliente envia notação (`"1d20+5"`), servidor responde resultado.
4. **Zod schemas vêm de `@questboard/validators`.** Nunca duplicar entre front e back. Backend importa direto do package.
5. **Permissões por role + plan checadas em todo handler** (REST e Socket.IO). Roles: `GM`, `CO_GM`, `PLAYER`, `SPECTATOR`. Planos: `FREE`, `AVENTUREIRO`, `LENDARIO`, `PLAYER_PLUS`.
6. **Tudo em pt-BR.** Mensagens de erro, comentários, migrations.
7. **Logs estruturados** (pino) sempre que tocar request body, action de jogo, ou error path.
8. **Engine de jogo (`@questboard/game-engine`) é puro.** Backend importa e usa (combat resolution, derived stats). Nunca duplicar lógica.

### 0.3 Idioma

| Camada | Língua |
|--------|--------|
| Mensagens de erro / toasts ao usuário | **pt-BR** |
| Logs estruturados (pino) | inglês curto (action verbs) |
| Comentários no código | **pt-BR** (curtos, no formato dos existentes) |
| Migrations Prisma — descrição | **pt-BR** |
| Slugs de events Socket.IO | inglês kebab-case |
| Slugs de rotas REST | inglês kebab-case |

---

## 1. LEIA antes de qualquer edição

1. `CLAUDE.md` no root — regras de ouro, planos, eventos Socket.IO esperados (§8), permissões por role (§10), Redis keys (§7).
2. `apps/web-next/public/scripts/Questboard dnd5e rules prompt.md` — sistema D&D 5e (engine puro existe, falta persistir).
3. `apps/web-next/public/scripts/Questboard cosmic horror rules prompt.md` — sistema Horror Investigativo (mesma situação).
4. `apps/web-next/public/scripts/Questboard attack damage prompt.md` — fluxo de ataque/dano (server resolve).
5. `packages/db/prisma/schema.prisma` — 39 models já definidos. Não duplicar.
6. `apps/api/src/server.ts` — bootstrap atual com 14 módulos registrados.
7. `apps/api/src/middleware/auth.ts` — Clerk verifyToken via Bearer.
8. `packages/game-engine/src/` — engine puro (dnd5e + cosmic-horror + dice + grid + combat).
9. `packages/validators/src/` — Zod schemas (fonte única de validação).

---

## 2. Stack confirmada

| Camada | Tecnologia | Status |
|--------|------------|--------|
| HTTP framework | Fastify 5 | ✅ instalado |
| ORM / DB | Prisma 6 + PostgreSQL 16 | ✅ instalado |
| Cache / Pub-sub / queues | Redis (ioredis) | ✅ instalado |
| Realtime | Socket.IO 4 | ✅ instalado |
| Background jobs | BullMQ | ✅ instalado |
| Storage | Cloudflare R2 (AWS S3 SDK) | ✅ instalado |
| Auth | Clerk (`@clerk/backend`) + Svix webhooks | ✅ plugado |
| IA | Gemini 2.5 Flash (Google AI) | ❌ **falta plugar** |
| Push (mobile) | Firebase Admin (FCM) | ✅ instalado, stub |
| Validação | Zod (de `@questboard/validators`) | ✅ disponível |

---

## 3. Estado atual (auditoria)

### 3.1 Já implementado

**REST endpoints** (cobertos):

- **Sessions**: CRUD + lifecycle (start/end/pause/resume/join/leave/kick) + audit-log + phases.
- **Maps**: CRUD por sessão + tokens CRUD + fog/walls/lights GET/PUT.
- **Combat**: start/end/next-turn + participantes + damage/heal.
- **Character**: CRUD + resources patch.
- **Chat**: messages + dice (rest endpoint, sem socket event).
- **Audio**: por-sessão controles + library.
- **Campaign**: CRUD + members + join.
- **Narrative**: nodes/edges (story flow).
- **User / Admin / Search / Webhook**: existem.

**Socket.IO handlers existentes**: `session`, `map`, `token`, `fog`, `combat`, `chat`, `audio`, `phase`.

**Schema Prisma** (39 models): `User`, `Subscription`, `Plan`, `Campaign`, `CampaignMember`, `Session`, `SessionPlayer`, `Map`, `Token`, `MapWall`, `MapLight`, `FogArea`, `MapLayer`, `Character`, `CharacterTemplate`, `CombatState`, `CombatParticipant`, `Message`, `DiceRoll`, `AudioTrack`, `SessionAudio`, `NarrativeNode`, `NarrativeEdge`, `Note`, `Post`, `PostComment`, `PostReaction`, `TimelineEvent`, `PhaseEvent`, `MapGeneration`, `UserStats`, e mais.

**Auth**: Clerk Bearer token + webhook `user.created/updated` via Svix.

### 3.2 Gaps críticos (alvo deste prompt)

| # | Gap | Bloqueia |
|---|-----|----------|
| 1 | **NPC Conversation system** — models `NpcProfile`, `Conversation`, `ConversationMessage`, `DialogueNode/Edge`. Socket events `npc:thinking`, `npc:message`, `npc:voice-result`. | Conversa scripted (modal frontend já pronto) e modos AI/Hybrid. |
| 2 | **NPC Behavior system** — models `NpcBehavior`, `BehaviorInstance`. Socket events `npc:behavior-tick`, `npc:escaped`, `npc:trapped`, `door:npc-opened/broken`. BehaviorService 150ms tick + 500ms A*. | Comportamento de multidão (CLAUDE.md §6.2). |
| 3 | **Dice authoritative** — `chat.service.ts` linha 91-92 usa `Math.random()`. Substituir por `crypto.getRandomValues()` em todos os pontos. Adicionar Socket event `dice:result`. | Segurança e UX. |
| 4 | **Cosmic-horror character data** — schema `Character.attributes` é JSON genérico. Adicionar campo discriminator `systemSlug` + JSON validado por Zod (`@questboard/validators/characters/{dnd5e,cosmic-horror}`). | Sistema cosmic-horror em produção. |
| 5 | **Permissões centralizadas** — middleware `requireRole(role[])` e `requirePlan(plan)`. Cada handler hoje reimplementa `if (session.ownerId !== user.id)`. | Tech debt + brechas. |
| 6 | **Player view persistence** — schema `SessionPlayer` precisa cobrir personagem escolhido (`characterId`) e estado de movimento staged. Socket precisa retransmitir state ao reconectar. | Player view fim-a-fim. |
| 7 | **Gemini integration** — service `apps/api/src/lib/gemini.ts` + integration em handlers de NPC e mapgen. | NPC AI/Hybrid + map AI. |
| 8 | **Notes / WorldEntity / AudioPlaylist persistence** — frontend tem stores mas backend não tem rotas. Models `Note` existe mas falta endpoint REST + Socket. `WorldEntity` model novo. `AudioPlaylist` model novo. | Notes / Mundo / Playlists fim-a-fim. |
| 9 | **NPC dialog branches** — model `DialogueNode` linkado a `Character.id` quando `category=npc`. CRUD via REST + leitura via Socket no fluxo `converse`. | Modal scripted do frontend tem dados, falta persistir. |
| 10 | **BullMQ workers** — filas existem (`mapGenerationQueue`, `notificationQueue`, `statsQueue`, `pushQueue`, `sessionCleanupQueue`) mas nenhum worker registrado. Criar `bull.workers.ts`. | Background jobs (flush Redis→Postgres a cada 30s, mapgen async, etc). |

---

## 4. Schema Prisma — modelos a adicionar

Adicionar ao `packages/db/prisma/schema.prisma`. Nomenclatura segue o padrão dos existentes.

### 4.1 Conversa com NPC (modos SCRIPTED + AI + HYBRID)

```prisma
enum NpcDialogueMode {
  SCRIPTED   // só galhos pré-escritos
  AI         // 100% Gemini, sem galhos
  HYBRID     // galhos como dicas, Gemini gera dentro do espírito
}

model NpcDialogueBranch {
  id          String    @id @default(cuid())
  characterId String    // FK pra Character (category=npc)
  character   Character @relation("NpcBranches", fields: [characterId], references: [id], onDelete: Cascade)
  trigger     String    // "O que o jogador diz" — texto curto do botão
  response    String    // "O que o NPC responde"
  isFinal     Boolean   @default(false) // encerra conversa após escolha
  order       Int       @default(0)     // ordem de exibição

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([characterId])
}

model Conversation {
  id          String   @id @default(cuid())
  sessionId   String?
  session     Session? @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  npcId       String   // FK pra Character
  npc         Character @relation("NpcConversations", fields: [npcId], references: [id], onDelete: Cascade)
  initiatorId String   // userId que iniciou (player ou GM)
  mode        NpcDialogueMode @default(SCRIPTED)

  // Reputação acumulada com o NPC (-100 a 100). Atualizada a cada msg.
  reputation Int @default(0)

  // Contexto inicial enviado à IA (modo AI/HYBRID): equipamentos visíveis,
  // HP%, raça, etc. Snapshot tirado no `open`.
  contextSnapshot Json?

  isOpen   Boolean   @default(true)
  startedAt DateTime @default(now())
  endedAt  DateTime?

  messages ConversationMessage[]

  @@index([sessionId])
  @@index([npcId])
}

enum ConversationSpeaker {
  NPC
  PLAYER
  GM_OVERRIDE  // GM digitou diretamente como NPC (override)
}

model ConversationMessage {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  speaker        ConversationSpeaker
  text           String

  // Galho usado (modo SCRIPTED). Null quando AI gerou ou quando é
  // mensagem do player em modo AI.
  branchId String?

  // Emoção detectada na voz (modo voice futuro): NEUTRAL, ANGRY, FEARFUL, etc.
  detectedEmotion String?

  createdAt DateTime @default(now())

  @@index([conversationId])
}
```

### 4.2 Behavior de NPCs (CLAUDE.md §6.2)

```prisma
enum NpcBehaviorType {
  IDLE
  CROWD
  PATROL
  GUARD
  FLEE
  PANIC
  RIOT
  FOLLOW
  SEARCH
}

model BehaviorInstance {
  id           String  @id @default(cuid())
  sessionId    String
  session      Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  type         NpcBehaviorType
  status       String  @default("active") // active | paused | finished

  // Tokens participantes
  tokenIds     String[] // ids de Token

  // Parâmetros narrativos gerados pela Gemini ao iniciar
  // (alvo de fuga, ponto de patrulha, raio do guard, etc).
  params       Json

  // Cache do estado last-tick — inclui posições, paths, headings.
  // Atualizado em RAM/Redis a cada 150ms; flushado aqui a cada 30s.
  lastSnapshot Json?

  startedAt    DateTime  @default(now())
  endedAt      DateTime?

  @@index([sessionId])
}
```

### 4.3 Notas (já tem `Note`, garantir cobertura)

Conferir se `Note` no schema atual cobre todos os campos do frontend (`apps/web-next/src/lib/notes-store.ts`):

```prisma
// Confirmar/ajustar:
model Note {
  id          String   @id @default(cuid())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  authorId    String   // userId do criador
  title       String
  content     String   @db.Text
  category    String   // "plot" | "item" | "npc" | "general" | "location"
  isGmOnly    Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([campaignId])
  @@index([authorId])
}
```

### 4.4 Mundo (NPCs / Locais / Facções / Lore)

Frontend tem `apps/web-next/src/lib/world-store.ts` com discriminator único `kind`. Adicionar:

```prisma
enum WorldEntityKind {
  NPC          // pode ou não ter Character vinculado
  LOCATION
  FACTION
  LORE
}

enum WorldDisposition {
  FRIENDLY
  NEUTRAL
  HOSTILE
  UNKNOWN
}

model WorldEntity {
  id          String          @id @default(cuid())
  campaignId  String
  campaign    Campaign        @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  authorId    String

  kind        WorldEntityKind
  name        String
  subtitle    String?
  description String          @db.Text
  location    String?         // só pra NPC e Faction
  disposition WorldDisposition?
  notes       String?         @db.Text   // privado pro GM

  // Vínculo opcional com Character (quando kind=NPC e o NPC virou ficha).
  characterId String?
  character   Character?      @relation("WorldNpc", fields: [characterId], references: [id], onDelete: SetNull)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([campaignId, kind])
}
```

### 4.5 Playlists de áudio (preparação fora de sessão)

Frontend já tem `useAudioStore` com soundboard custom. Adicionar persistência:

```prisma
model AudioPlaylist {
  id         String   @id @default(cuid())
  ownerId    String   // userId do GM dono
  campaignId String?  // opcional — playlists podem ser globais do GM
  campaign   Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)

  name       String
  description String?

  // Tracks armazenados como JSON inline. Cada track tem name + url R2.
  tracks Json // Array<{ id, name, url, duration?, tags? }>

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId])
  @@index([campaignId])
}

// Soundboard custom do GM (persistido)
model SoundboardEffect {
  id        String  @id @default(cuid())
  ownerId   String
  campaignId String?
  campaign  Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)

  name      String
  icon      String  // lucide icon name
  url       String  // R2 url do MP3
  category  String  // weather | combat | creature | map | custom

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId])
  @@index([campaignId])
}
```

### 4.6 Player view persistence

Garantir que `SessionPlayer` cobre o que o player view precisa:

```prisma
// Estender:
model SessionPlayer {
  // ... campos existentes
  characterId   String?    // id do Character escolhido pelo player
  character     Character? @relation(fields: [characterId], references: [id], onDelete: SetNull)
  campaignSystem String?   // "dnd5e" | "cosmic-horror" — sincronizado do GM
  isOnline      Boolean    @default(false)
  lastSeenAt    DateTime?
  staged        Json?      // movimento aguardando GM (toX, toY, awaitingGM)
}
```

### 4.7 Mudanças no `Character` para multi-system

```prisma
// Estender Character:
model Character {
  // ... campos existentes
  systemSlug    String  @default("dnd5e")  // "dnd5e" | "cosmic-horror"
  // attributes já é JSON — manter, validar com Zod no controller
  // baseado em systemSlug.

  // Diálogo (NPC)
  dialogueEnabled  Boolean @default(false)
  dialogueGreeting String?
  dialogueFarewell String?
  dialogueNotes    String? @db.Text
  dialogueBranches NpcDialogueBranch[] @relation("NpcBranches")

  // Conversas (histórico)
  conversations Conversation[] @relation("NpcConversations")

  // World entity link (reverso)
  worldEntities WorldEntity[] @relation("WorldNpc")
}
```

### 4.8 Migrations

- Cada bloco acima vira uma migration Prisma separada com nome em pt-BR + slug curto: `20260501_npc_conversation_system`, `20260502_npc_behavior_instance`, `20260503_world_entity`, etc.
- Sempre `npx prisma migrate dev --name <slug>` em dev. Em prod, `npx prisma migrate deploy` via script.
- **Backfill**: Character existentes ganham `systemSlug = "dnd5e"`. Conferir se há dados ANTES e rodar update SQL no migration.

---

## 5. Auth — autorização centralizada

### 5.1 Manter Clerk (não trocar)

`apps/api/src/middleware/auth.ts` já valida Bearer token via Clerk SDK. Manter. **Adicionar**:

### 5.2 Middlewares de autorização

`apps/api/src/middleware/require-role.ts`:

```ts
// Verifica se user.id é GM/CO_GM/PLAYER da sessão (param :id ou body.sessionId).
// Bloqueia com 403 e mensagem em pt-BR.
export function requireRole(roles: SessionRole[]): preHandlerHookHandler;
```

`apps/api/src/middleware/require-plan.ts` (já existe `plan-gate.ts` — auditar e expandir):

```ts
// Verifica plano do user. Tabela:
//   FREE: 2 sessões, 5 jogadores/sessão, 0 mapas IA/mês, sem fog
//   AVENTUREIRO: 8 sessões, 10 jogadores, 20 mapas IA, fog
//   LENDARIO: ilimitado + iluminação dinâmica + NPC AI
//   PLAYER_PLUS: ilimitado de personagens, 5GB vault
//
// Bloqueia com 402 (Payment Required) e mensagem em pt-BR explicando
// limite + plano necessário.
export function requirePlan(min: PlanTier, feature?: PlanFeature): preHandlerHookHandler;
```

### 5.3 Webhook Clerk

`apps/api/src/modules/webhook/webhook.routes.ts` já tem `user.created/updated`. **Adicionar `user.deleted`**: marca soft-delete em `User`, anonimiza dados sensíveis, mantém histórico de sessões pra integridade referencial.

### 5.4 Limites centralizados

`apps/api/src/config/plan-limits.ts` já existe. Auditar. Garantir export de:

```ts
export const PLAN_LIMITS: Record<PlanTier, PlanLimits>;
export function checkLimit(plan: PlanTier, feature: PlanFeature, current: number): { ok: boolean; reason?: string };
```

---

## 6. API REST — endpoints a fechar

Endpoints novos a adicionar (existentes ficam como estão, polir se necessário).

### 6.1 NPC dialog branches (modo SCRIPTED)

```
GET    /characters/:id/dialogue-branches            → lista branches (NPC dono)
POST   /characters/:id/dialogue-branches            → cria branch
PATCH  /characters/:id/dialogue-branches/:branchId  → atualiza
DELETE /characters/:id/dialogue-branches/:branchId  → remove
PATCH  /characters/:id/dialogue-branches/reorder    → body: { ids: string[] }
```

Permissão: GM ou owner do character.

### 6.2 Conversas

```
GET    /sessions/:id/conversations           → lista conversas ativas/encerradas
POST   /sessions/:id/conversations           → abre nova { npcId, mode }
GET    /conversations/:cId                   → detalhes + log
POST   /conversations/:cId/messages          → cliente envia { branchId? text? }
                                               servidor processa (scripted/ai/hybrid),
                                               persiste e broadcast via Socket.IO
PATCH  /conversations/:cId/finish            → encerra (mostra farewell)
PATCH  /conversations/:cId/gm-override       → GM digita como NPC (overrides resposta)
```

Permissão: GM, CO_GM, PLAYER da sessão.

### 6.3 Behaviors

```
POST   /sessions/:id/behaviors               → cria { type, tokenIds, params? }
                                               GM aciona, IA gera params,
                                               BehaviorService começa tick loop.
GET    /sessions/:id/behaviors               → lista ativos
PATCH  /behaviors/:bId/pause                 → pausa
PATCH  /behaviors/:bId/resume                → retoma
DELETE /behaviors/:bId                       → encerra (limpa Redis state)
```

Permissão: GM ou CO_GM.

### 6.4 Notas (frontend já consome, falta wire)

```
GET    /campaigns/:id/notes                  → lista escopadas
POST   /campaigns/:id/notes                  → cria
GET    /notes/:nId
PATCH  /notes/:nId
DELETE /notes/:nId
```

Permissão: GM da campanha. Players veem apenas notas com `isGmOnly=false`.

### 6.5 Mundo

```
GET    /campaigns/:id/world                  → list (filter por kind via query)
POST   /campaigns/:id/world                  → cria { kind, name, ... }
GET    /world/:eId
PATCH  /world/:eId
DELETE /world/:eId
POST   /world/:eId/link-character            → cria/atualiza characterId vinculado
```

Permissão: GM/CO_GM da campanha.

### 6.6 Áudio (playlists + soundboard)

```
GET    /audio/playlists                      → playlists do GM
POST   /audio/playlists                      → cria
PATCH  /audio/playlists/:pId
DELETE /audio/playlists/:pId
POST   /audio/playlists/:pId/tracks          → upload via R2 signed URL
DELETE /audio/playlists/:pId/tracks/:trackId

GET    /audio/soundboard                     → soundboard custom do GM
POST   /audio/soundboard                     → cria SFX
PATCH  /audio/soundboard/:sId
DELETE /audio/soundboard/:sId
```

Permissão: owner. Para sincronizar com sessão, o handler `audio:play` no Socket.IO usa o ID do track.

### 6.7 Storage — R2 signed URLs

```
POST   /storage/upload-url                   → body: { kind, filename, contentType, size }
                                               kinds: avatar | map | sprite | audio | handout
                                               valida tamanho/mime, retorna signed URL.
POST   /storage/complete                     → body: { kind, key } — confirma upload e
                                               persiste metadata se aplicável.
```

Permissão: usuário autenticado. Quotas por plano (ver §5.4).

### 6.8 Dice (real-time + authoritative)

`/api/v1/sessions/:id/dice/roll` já existe. **Mudar a implementação interna**:

- Usar `crypto.getRandomValues()` (importar de `@questboard/game-engine/dice`).
- Persistir em `DiceRoll`.
- Emitir `dice:result` via Socket.IO (broadcast pra sessão inteira; secret roll vai só pro GM).
- Resposta REST devolve o resultado também (frontend mostra mesmo se Socket cair).

### 6.9 Personagem multi-system

```
POST   /characters                           → body inclui systemSlug obrigatório.
                                               Backend valida attributes via
                                               @questboard/validators
                                               (dnd5e ou cosmic-horror).
PATCH  /characters/:id                       → idem.
GET    /characters/:id                       → response inclui systemSlug + dados.
```

### 6.10 Player view

```
POST   /sessions/:id/join-as-player          → body: { code, name, characterId? }
                                               cria SessionPlayer, retorna joinToken.
PATCH  /sessions/:id/player/character        → body: { characterId }
                                               troca personagem na lobby.
PATCH  /sessions/:id/player/staged-move      → body: { toX, toY }
                                               persiste staged + emite p/ GM.
DELETE /sessions/:id/player/staged-move      → cancela.
```

Permissão: anônimos (com session code válido) podem `join-as-player`. Após join, usam joinToken.

---

## 7. Socket.IO — fechar cobertura completa

### 7.1 Eventos esperados (CLAUDE.md §8) — adicionar ao que já existe

**Sessão:**
```ts
"session:status-changed" → { sessionId, status, by }
"session:settings-updated" → { sessionId, settings }
"player:joined"           → { sessionId, playerId, name, characterId? }
"player:left"             → { sessionId, playerId, reason }
"player:connected"        → { sessionId, playerId }
"player:disconnected"     → { sessionId, playerId }
```

**Combate (faltando granularidade):**
```ts
"combat:hp-changed" → { sessionId, tokenId, hp, maxHp, delta, by }
```

**Dice (faltando inteiramente):**
```ts
"dice:result" → {
  sessionId,
  rolledBy,         // userId
  notation,         // "1d20+5"
  rolls,            // number[] dados individuais
  total,            // resultado final
  modifier,         // bônus aplicado
  context?,         // string livre ("ataque vs goblin", "perícia")
  visibility,       // "public" | "secret"
  isNat20, isNat1,
  at,
}
```

**NPC Conversation (gap inteiro):**
```ts
"npc:conversation-opened" → { conversationId, npcId, mode, initiatorId }
"npc:thinking"            → { conversationId } // mostra "...digitando" pro player
"npc:message"             → { conversationId, message: ConversationMessageDto }
"npc:reputation-changed"  → { conversationId, delta, total }
"npc:conversation-closed" → { conversationId, reason: "finished" | "interrupted" }
"npc:gm-override"         → { conversationId, message } // GM digitou como NPC
```

**NPC Behavior (gap inteiro):**
```ts
"npc:behavior-tick"  → { behaviorId, ts, positions: [{ tokenId, x, y, vx, vy, facing }] }
"npc:escaped"        → { behaviorId, tokenId }
"npc:trapped"        → { behaviorId, tokenId }
"door:npc-opened"    → { doorId, tokenId }
"door:npc-broken"    → { doorId, tokenId }
```

### 7.2 Salas Socket.IO

- `session:<sessionId>` — todos da sessão (GM, players, spectators).
- `session:<sessionId>:gm` — só GM e CO_GM (whispers GM, secret rolls, prep).
- `user:<userId>` — DMs, notificações pessoais.

### 7.3 Validação + permissão

Cada handler segue o template:

```ts
socket.on("token:moved", async (raw, ack) => {
  try {
    // 1. Valida payload com Zod (de @questboard/validators)
    const payload = TokenMovedSchema.parse(raw);
    // 2. Permission check: precisa ser GM/CO_GM, OU player movendo seu próprio token.
    await requireSocketRole(socket, payload.sessionId, ["GM", "CO_GM", "PLAYER"]);
    if (role === "PLAYER") {
      await requireOwnToken(socket.userId, payload.tokenId);
    }
    // 3. Validação de regra: colisão server-side via @questboard/game-engine.
    const ok = await validateTokenMove(payload);
    if (!ok) {
      ack({ ok: false, reason: "Movimento bloqueado por colisão." });
      return;
    }
    // 4. Persiste + broadcast.
    await tokenService.move(payload);
    socket.to(`session:${payload.sessionId}`).emit("token:moved", payload);
    ack({ ok: true });
  } catch (err) {
    log.error({ err, event: "token:moved" });
    ack({ ok: false, reason: err.message });
  }
});
```

Padronizar pra todos os handlers.

### 7.4 Reconexão

Quando socket reconecta (mesmo `userId`):
1. Auth verifica Bearer token.
2. Server lê `SessionPlayer.lastSeenAt`.
3. Se < 60s: re-join nas salas, emite `player:connected`.
4. Se >= 60s: ainda permite; emite `player:joined` (re-aparece).
5. Snapshot completo do estado é pushed via `session:state-snapshot` (novo evento).

---

## 8. NPC Conversation Service (deep dive)

### 8.1 Arquitetura

```
apps/api/src/modules/npc/
├── npc.routes.ts          # rotas REST
├── npc.controller.ts      # handlers
├── npc.service.ts         # lógica (chamada de IA, persistência)
├── dialogue-engine.ts     # SCRIPTED resolver (puro)
└── gemini-client.ts       # wrapper Gemini (ou em apps/api/src/lib/gemini.ts)
```

### 8.2 Modos

#### SCRIPTED
- Frontend manda `branchId`.
- Backend valida, persiste `ConversationMessage` (player + npc), broadcast.
- Sem chamada de IA.
- Latência: < 100ms.

#### AI (plano LENDARIO)
- Frontend manda `text` (mensagem livre).
- Backend monta prompt com:
  - Persona do NPC (nome, descrição, dialogueNotes).
  - Contexto (HP%, equipamento visível, raça/ocupação).
  - Histórico da conversa (últimas 10 mensagens).
- Emite `npc:thinking` imediatamente.
- Chama Gemini 2.5 Flash com system prompt + user message.
- Recebe resposta + emoção + delta de reputação.
- Persiste, atualiza `Conversation.reputation`, broadcast `npc:message`.
- Latência: ~1-2s.

#### HYBRID
- Frontend manda `text`.
- Backend lê branches do NPC como **dicas** pra Gemini ("normalmente diria X em situação Y").
- Gemini gera resposta no espírito do NPC + estilo das branches.
- Persistência idêntica ao modo AI.

### 8.3 Gerador de prompt (modo AI)

`apps/api/src/modules/npc/dialogue-engine.ts`:

```ts
export function buildNpcSystemPrompt(npc: Character, ctx: NpcContext): string;
// Output em pt-BR, com diretivas:
//   - Você é {nome}, {ocupação}.
//   - Personalidade: {dialogueNotes}.
//   - NUNCA quebre persona.
//   - Responda em até 2 parágrafos curtos.
//   - Sempre em pt-BR.
//   - Se o jogador for hostil, demonstrar, mas NPC pode reagir com medo/raiva conforme persona.
```

### 8.4 GM override

GM pode digitar uma mensagem no painel "como NPC". Backend persiste `ConversationMessage.speaker = GM_OVERRIDE`. Broadcast como se fosse NPC mas com badge "GM override" no frontend.

---

## 9. Behavior Service (CLAUDE.md §6.2)

### 9.1 Stack

- Tick loop em **Node.js setInterval** (não BullMQ — tick deve ser preciso e contínuo).
- Worker rodando em processo separado: `apps/api/src/workers/behavior-worker.ts`.
- Estado em RAM + flush periódico em Redis.
- Persiste em Postgres só ao iniciar/encerrar/cada 30s.

### 9.2 Loop

- **150ms**: tick de movimento. Cada token interpola pra próxima célula do path.
- **500ms**: recálculo A* se houver mudança de obstáculos (porta abriu, parede caiu).

### 9.3 buildEffectiveWallSet

`packages/game-engine/src/behavior/walls.ts` (criar):

```ts
export function buildEffectiveWallSet(
  walls: MapWall[],
  doors: Door[],
  behaviorType: NpcBehaviorType,
): Set<string> {
  // PANIC passa por portas normais (assume aberta).
  // RIOT arromba portas não-mágicas (assume aberta).
  // Outros respeitam estado atual.
}
```

### 9.4 Eventos emitidos

- A cada tick: `npc:behavior-tick` (broadcast 150ms — pode ser throttled pra 200ms se rede pesar).
- Quando token chega na saída: `npc:escaped`, encerra behavior pra ele.
- Quando sem path possível: `npc:trapped` + entra em modo random-walk.
- Quando door abre/quebra: `door:npc-opened` / `door:npc-broken`.

### 9.5 Performance

- Throttle de broadcast por sessão: máximo 10 eventos/s.
- Posições em `behavior:{id}:positions` (Redis hash) — leitura barata pra hot path.
- Ack-less broadcast (não precisa retornar nada — frontend interpola).

---

## 10. Game engine integration server-side

### 10.1 Onde reutilizar `@questboard/game-engine`

| Cenário | Função | Onde |
|---------|--------|------|
| Roll de dado | `rollNotation(notation, rng)` | `chat.service.ts` (substituir Math.random) |
| Validação de movimento | `canTokenMoveTo` | `token.service.ts` (revalidar antes de persistir) |
| Pathfinding | `aStar` | `behavior-worker.ts` |
| dnd5e derived stats | `dnd5e.deriveDnd5eCharacter` | `character.service.ts` (cache HP/AC ao salvar) |
| Cosmic-horror derived | `cosmicHorror.calculateHitPoints` etc | idem |
| Skill check | `cosmicHorror.evaluateSkillCheck` | combat / dice flow |
| Sanity loss | `cosmicHorror.applySanityLoss` | npc trauma flow |

### 10.2 RNG consistente

`apps/api/src/lib/rng.ts`:

```ts
import { randomInt } from "node:crypto";
export const serverRng = () => randomInt(0, 2 ** 32) / 2 ** 32;
// Passar pra rollNotation(_, serverRng) em todos os pontos.
```

---

## 11. Gemini AI integration

### 11.1 Lib

`apps/api/src/lib/gemini.ts`:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const client = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
export const flashModel = client.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function chatComplete(
  systemPrompt: string,
  history: Array<{ role: "user" | "model"; parts: string }>,
  userMessage: string,
): Promise<string>;

export async function generateMap(prompt: string, opts: MapGenOpts): Promise<MapDefinition>;

export async function generateNpcResponse(
  npc: Character,
  history: ConversationMessage[],
  userMessage: string,
  ctx: NpcContext,
): Promise<{ text: string; emotion: string; reputationDelta: number }>;
```

### 11.2 Env vars

Adicionar a `apps/api/.env.example`:
```
GOOGLE_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_DAILY_QUOTA=1000   # cap por GM por dia (anti-abuso)
```

### 11.3 Plan-gating

- NPC AI / HYBRID exigem plano `LENDARIO`. Middleware `requirePlan` bloqueia.
- Map AI: `AVENTUREIRO` (20/mês) ou `LENDARIO` (∞).
- Counter de uso em `User.aiUsageThisMonth` (campo a adicionar) ou Redis com TTL mensal.

### 11.4 Custo / proteção

- Cap de tokens por chamada (3000 input, 500 output pro modo NPC).
- Timeout 10s.
- Erros de Gemini caem em fallback genérico ("O personagem hesita por um instante…") + log.

---

## 12. Storage R2

### 12.1 Buckets

| Bucket | Uso | Acesso |
|--------|-----|--------|
| `qb-public` | avatars, capa de campanha, soundboard pública | Public CDN |
| `qb-assets` | mapas, sprites, sons da campanha | Signed URL (read+write) |
| `qb-handouts` | handouts privados (pdfs, imagens) | Signed URL only |

### 12.2 Upload flow

1. Frontend chama `POST /storage/upload-url` com kind + filename + contentType.
2. Backend valida quota (size + monthly upload).
3. Backend gera signed URL (PUT, expira em 5min).
4. Frontend faz PUT direto no R2.
5. Frontend chama `POST /storage/complete` com a key resultante.
6. Backend persiste metadata em modelo correspondente (Map.thumbnailKey, AudioPlaylist.tracks[].key, etc).

### 12.3 Quotas

- Free: 100MB total.
- Aventureiro: 2GB.
- Lendário: 50GB.
- Player Plus: 5GB (vault de fichas/handouts).

Erro de quota retorna 413 (Payload Too Large) com mensagem em pt-BR.

---

## 13. Background jobs (BullMQ)

### 13.1 Workers a criar

`apps/api/src/workers/index.ts` — bootstrap separado do server (rodar como processo Node ao lado).

| Queue | Worker | Quando |
|-------|--------|--------|
| `notificationQueue` | manda push/email. | Novo job a cada `player:joined`, `combat:turn-changed` (your turn), invite recebido. |
| `statsQueue` | atualiza `UserStats` (nat20s, playtime, sessões totais). | A cada `dice:result`, `combat:ended`. |
| `mapGenerationQueue` | chama Gemini, parseia, salva em `MapGeneration`, emite `map:generated`. | Quando GM solicita mapa IA. |
| `sessionFlushQueue` | flush Redis (tokens, fog, behavior) → Postgres. | Cron de 30s + on `session:end`. |
| `sessionCleanupQueue` | limpa Redis de sessões ENDED há > 24h. | Cron diário. |
| `aiUsageResetQueue` | zera `User.aiUsageThisMonth` no dia 1 de cada mês. | Cron mensal. |

### 13.2 Bootstrap

```bash
# Em produção, um único processo Node por worker:
node dist/workers/index.js notification
node dist/workers/index.js behavior
node dist/workers/index.js mapgen
```

Ou um único processo que registra todas as filas (mais simples até escalar).

---

## 14. Permissões — matriz de ações

CLAUDE.md §10 já tem a tabela base. **Implementar como decorators / middlewares**:

```ts
// Apenas GM/CO_GM:
fastify.post("/sessions/:id/start", { preHandler: requireRole(["GM"]) }, ...);
fastify.post("/sessions/:id/end",   { preHandler: requireRole(["GM"]) }, ...);
fastify.post("/sessions/:id/behaviors", { preHandler: requireRole(["GM", "CO_GM"]) }, ...);

// PLAYER pode mover só seu próprio token:
fastify.patch("/tokens/:id/position", {
  preHandler: [
    requireRole(["GM", "CO_GM", "PLAYER"]),
    requireOwnTokenIfPlayer
  ],
}, ...);

// Plano-gated:
fastify.post("/maps/generate", {
  preHandler: [requireRole(["GM"]), requirePlan("AVENTUREIRO", "ai-mapgen")],
}, ...);
```

---

## 15. Validação (Zod)

### 15.1 Princípio

Todas as rotas REST e Socket.IO validam input com schemas de `@questboard/validators`. Quando o schema não existe, criar **lá** (não no backend).

### 15.2 Schemas a adicionar em `@questboard/validators/src/`:

- `npc/dialogue-branch.ts` (CRUD branches).
- `npc/conversation.ts` (open, message, finish).
- `npc/behavior.ts` (start, params).
- `world/entity.ts` (CRUD por kind).
- `notes/note.ts` (CRUD).
- `audio/playlist.ts` + `audio/soundboard-effect.ts`.
- `socket/dice-result.ts` + `socket/npc-events.ts`.

Convenção: cada schema em arquivo próprio, `export const xxxSchema = z.object({...})`, `export type Xxx = z.infer<typeof xxxSchema>`.

---

## 16. Testes

### 16.1 Cobertura mínima

| Camada | Tipo | Cobertura |
|--------|------|-----------|
| Service (lógica de negócio) | Unit (vitest) | ≥ 80% nos serviços novos (npc, behavior, dice) |
| Controller (validação + delegação) | Integration (testes de rota com Fastify inject) | smoke test por endpoint |
| Socket.IO handlers | Integration (cliente fake + servidor inject) | flows críticos: token:move, dice:result, npc:message |
| Engine puro | Unit | já está em 100% (manter) |

### 16.2 Mock vs real

- Postgres em Docker ou test container (`testcontainers`). Sem mock de query.
- Redis: ioredis-mock OK pra unit; real em integration.
- Gemini: stub no test env (responde texto fixo). Apenas health check chama API real.
- R2: localstack ou stub (`__mocks__`).

---

## 17. Observabilidade

### 17.1 Logs (pino)

- Todo handler loga: `{ event, userId, sessionId, durationMs, ok }`.
- Erros logam stack + payload sanitizado (sem senha/token).
- Em prod, logs em JSON; em dev, pretty.

### 17.2 Health checks

```
GET /health           → { status: "ok" }
GET /health/db        → check Prisma
GET /health/redis     → check Redis ping
GET /health/r2        → check head bucket
GET /health/gemini    → check 1 token completion (cache 5min)
```

### 17.3 Métricas (futuro)

Stub para Prometheus. Por ora não bloqueia. Apenas garantir que pino está estruturado pra fácil parseamento.

### 17.4 Sentry (opcional)

Integrar `@sentry/node` no `errorHandler` se DSN env existir. Skipa quando ausente.

---

## 18. Deploy

### 18.1 Plataforma

CLAUDE.md §14: VPS Hostinger (KVM), Nginx reverse proxy, PM2, PostgreSQL + Redis no mesmo VPS inicialmente.

### 18.2 Processos

```
pm2 start ecosystem.config.cjs
# Iniciaria:
#   - api      (Fastify + Socket.IO)
#   - workers  (BullMQ + Behavior tick loop)
#   - prisma-migrate (one-shot via deploy script)
```

### 18.3 Env vars (consolidar `.env.example`)

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgres://...
REDIS_URL=redis://...

CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_PUBLIC=qb-public
R2_BUCKET_ASSETS=qb-assets
R2_BUCKET_HANDOUTS=qb-handouts
R2_PUBLIC_BASE=https://...

GOOGLE_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_DAILY_QUOTA=1000

FCM_SERVICE_ACCOUNT=...   # JSON inline ou path

CORS_ORIGIN=https://questboard.gg,https://staging.questboard.gg
```

### 18.4 Migrations em deploy

```bash
pnpm --filter @questboard/db prisma migrate deploy
pm2 restart api workers
```

Nunca rodar `migrate dev` em prod.

---

## 19. Critérios de aceitação

### 19.1 Backend "pronto" significa:

- [ ] Schema Prisma cobre todos os models listados em §4. Migrations em pt-BR, sem `--create-only` (todas aplicadas).
- [ ] `pnpm typecheck` limpo no monorepo (zero erro em `apps/api` e `packages/db`, `packages/validators`).
- [ ] Todos os endpoints REST listados em §6 implementados, com Zod validation e role-based guards.
- [ ] Todos os eventos Socket.IO listados em §7 emitidos pelos handlers correspondentes, com permissão por sala.
- [ ] NPC Conversation: scripted funcional fim-a-fim (frontend já manda `branchId`, backend persiste e broadcast).
- [ ] NPC Behavior: ao menos PATROL, FLEE e PANIC funcionando com tick loop real, eventos emitidos, e tokens movendo no canvas do frontend.
- [ ] Dice rolls: `crypto.getRandomValues` + `dice:result` event chegando no frontend (substituindo o mock client-side).
- [ ] Auth Clerk com middlewares `requireRole` e `requirePlan` aplicados em **todos** os endpoints de mutação.
- [ ] Player view sync funciona: jogador entra via `/play/<code>`, escolhe ou cria personagem, joga, fecha browser, volta — não perde nada.
- [ ] Tests verdes em CI (vitest no `apps/api`).
- [ ] Health endpoints respondem em < 200ms.
- [ ] Logs estruturados em todo handler (event + duration + outcome).
- [ ] `.env.example` completo, sem segredos reais.
- [ ] Deploy via PM2 documentado em `apps/api/README.md`.

### 19.2 Não bloqueia o "pronto":

- AI map generation (deixar fila criada, processor stub que retorna 501).
- Voice/VAD multimodal (CLAUDE.md §6.3) — fora do MVP.
- Mercado Pago real — webhook stub OK.

---

## 20. Ordem de implementação (sprints)

### Sprint 1 — fundação de auth e permissões (1 semana)

1. `requireRole` middleware (sessão).
2. `requirePlan` middleware completo (limites).
3. Webhook `user.deleted` no Clerk.
4. Refatorar 3-5 endpoints existentes pra usar os middlewares (validar padrão).
5. Testes de role/plan.

### Sprint 2 — dice authoritative + Socket.IO completo (1 semana)

1. Substituir `Math.random` por `crypto.getRandomValues` em `chat.service.ts` e onde mais usar.
2. Importar engine `rollNotation` server-side.
3. Adicionar `dice:result` Socket event.
4. Adicionar `combat:hp-changed`, `session:status-changed`, `session:settings-updated`, `player:connected/disconnected`.
5. Frontend ajusta listeners (já tem stubs).

### Sprint 3 — NPC Dialogue scripted (1 semana)

1. Migration `NpcDialogueBranch`, `Conversation`, `ConversationMessage`.
2. CRUD branches REST.
3. Conversation REST (open / message / finish / gm-override).
4. Socket events `npc:thinking`, `npc:message`, `npc:conversation-opened/closed`.
5. Frontend troca o store local pelo backend (mantém modal existente).

### Sprint 4 — Cosmic-horror + character multi-system + notes/world (1 semana)

1. Migration `Character.systemSlug` + Zod multi-system validation.
2. Backfill de characters existentes pra `dnd5e`.
3. Notes REST (CRUD).
4. WorldEntity migration + REST.
5. Frontend troca stores locais pelo backend.

### Sprint 5 — NPC Behavior service (1-2 semanas)

1. Migration `BehaviorInstance`.
2. Worker `behavior-worker.ts` com tick loop.
3. `buildEffectiveWallSet` engine.
4. A* + steering integrados.
5. Eventos `npc:behavior-tick`, `npc:escaped`, `npc:trapped`, `door:*`.
6. Tests de integração com cliente fake.

### Sprint 6 — Gemini integration (1 semana)

1. `apps/api/src/lib/gemini.ts`.
2. NPC AI mode + HYBRID mode.
3. Quota counter + plan gating.
4. Map AI generation worker (queue real).

### Sprint 7 — Storage R2 + audio playlists (1 semana)

1. Endpoint `POST /storage/upload-url` + `complete`.
2. AudioPlaylist + SoundboardEffect REST.
3. Quotas por plano.
4. Frontend troca uploads de file:// por R2 signed URLs.

### Sprint 8 — Player view backend (1 semana)

1. `join-as-player` endpoint anônimo com session code.
2. `SessionPlayer.characterId` + `staged` field.
3. Socket reconexão com state snapshot.
4. Frontend troca BroadcastChannel mock por Socket.IO real.

### Sprint 9 — Polimento + testes + deploy (1 semana)

1. Cobertura ≥ 80% nos services novos.
2. Health endpoints.
3. PM2 ecosystem + script de deploy.
4. Documentação de operação no `apps/api/README.md`.
5. Smoke test em staging.

**Cada sprint termina com:** typecheck limpo, testes verdes, commit em pt-BR, deploy staging com smoke manual de cabo a rabo.

---

## 21. Pendências para o Lucas decidir antes de começar

1. **Modo de NPC Conversation default**:
    *Recomendado: SCRIPTED. AI/HYBRID são opt-in pelo GM por NPC e exigem plano LENDARIO.*

2. **Plan-gating estrito ou soft?**
    *Recomendado: estrito (HTTP 402 + mensagem clara). UX permite upgrade no spot.*

3. **Quota de IA — diária ou mensal?**
    *Recomendado: diária (1000 tokens output/dia/GM no plano Aventureiro; ilimitado no Lendário).*

4. **Suporte a OAuth (Google/Discord)?**
    *Recomendado: depois. Clerk já suporta; ativar quando houver demanda.*

5. **Behavior tick rate — 150ms ou 200ms?**
    *Recomendado: 200ms em prod (menor pressão de rede, fluido o suficiente). 150ms em dev pra precisão.*

6. **Sentry / error tracking?**
    *Recomendado: sim em prod. Stub se DSN ausente.*

7. **Testes E2E (Playwright)?**
    *Recomendado: depois do MVP backend. Por ora, integration tests cobrem.*

8. **Soft delete generalizado?**
    *Recomendado: User (LGPD), Campaign, Character. Outros usam cascade hard.*

9. **Multi-region ou single VPS?**
    *Recomendado: single VPS (BR sudeste) até atingir 100 GMs ativos/dia.*

10. **AI prompt em pt-BR ou bilíngue?**
     *Recomendado: pt-BR puro (Gemini 2.5 Flash mantém qualidade). System prompt e usuário em pt-BR.*

---

## 22. Anti-padrões a evitar

- ❌ Math.random em qualquer lugar do path autoritativo (dados, RNG de behavior, sorteios).
- ❌ Validação ad-hoc — sempre Zod, sempre via `@questboard/validators`.
- ❌ Lógica de jogo duplicada entre client e server — engine é fonte única.
- ❌ Mensagens de erro em inglês para usuário final.
- ❌ Logs com payload bruto contendo tokens, senhas, ou conteúdo de chat (privacidade).
- ❌ Endpoints sem auth (exceto `/health` e webhooks com signature).
- ❌ Persistir frequentemente o estado de behavior no Postgres (use Redis + flush 30s).
- ❌ `await` em loop dentro de handler — paraleliza com `Promise.all` quando possível.
- ❌ Migrations destrutivas sem backup script (DROP COLUMN com dados → fazer rename + nullable + backfill + drop).
- ❌ Permitir broadcast de eventos privados (secret rolls, GM whispers) na sala genérica.

---

## 23. Glossário

- **GM**: Game Master, dono da sessão, role com poderes amplos.
- **CO_GM**: ajudante do GM, mesmas permissões exceto end/delete session.
- **PLAYER**: jogador, controla seu personagem.
- **SPECTATOR**: assiste sem interagir.
- **Behavior**: comportamento autônomo de NPC (multidão, fuga, etc).
- **Branch**: galho de diálogo scripted (opção do jogador → resposta do NPC).
- **Conversation**: instância ativa de diálogo com NPC (tem histórico).
- **Authoritative**: servidor é a fonte de verdade; cliente faz optimistic mas reverte se servidor discordar.

---

**Fim do prompt. Boa implementação.**
