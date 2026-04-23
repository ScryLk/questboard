# CLAUDE.md — QuestBoard

> Leia este arquivo INTEIRO antes de qualquer edição.
> Ele é a fonte de verdade do projeto.

---

## 1. O que é o QuestBoard

Plataforma all-in-one para RPG de mesa. O mestre conduz a sessão pelo web
(Next.js), os jogadores participam pelo mobile (Expo) ou pelo browser
(`questboard.gg/play/[código]`). Experiência cinematográfica: fog of war,
iluminação dinâmica, trilha sonora sincronizada, NPCs com IA, comportamento
de multidão, chat multi-canal.

**Princípio de negócio:** quem paga é o mestre. Jogadores nunca são bloqueados.

---

## 2. Stack técnica

### Mobile nativa — ARQUIVADO

> **Status (2026-04-21)**: stack mobile nativa arquivada em
> `_legacy/mobile/`. Decisão: consolidar em um único app Next.js
> responsivo. Usuários no celular acessam via browser
> (`questboard.gg/play/[code]`). Código preservado pra eventual retomada
> com distribuição nativa (App Store/Play Store) — ressuscita com
> `git mv _legacy/mobile apps/mobile` e reinstalar deps.
>
> Enquanto arquivado: **novas features não replicam pro mobile**, e a
> regra #10 abaixo perde aplicação prática. Web é exclusivamente
> Tailwind + shadcn.

### Web — GM + Player (`apps/web-next`)
| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Canvas/Mapa | **Pixi.js** (UM único PIXI.Application) |
| Estado | Zustand (persistência injetada via localStorage) |
| Realtime | Socket.IO client |
| Animações | Framer Motion |
| Ícones | lucide-react |
| Responsividade | Mesmo app serve desktop (GM) e mobile (player via browser) — breakpoints Tailwind |

### Player View (`questboard.gg/play/[code]`)
- Mesma base `apps/web-next`, rota pública
- Sem instalação — estilo Jackbox
- Usuários de smartphone abrem no browser do celular

### Backend (`apps/api`)
| Camada | Tecnologia |
|--------|------------|
| Framework | Fastify 5 |
| ORM | Prisma 6 |
| DB | PostgreSQL 16 |
| Cache | Redis |
| Realtime | Socket.IO v4 |
| Queue | BullMQ |
| Storage | Cloudflare R2 |
| Auth | JWT (access + refresh) |
| Validação | Zod (schemas de `@questboard/validators`) |
| Pagamento | Mercado Pago (Pix, cartão, boleto) |
| IA | Gemini 2.5 Flash |
| Push | Firebase Cloud Messaging |

### Packages compartilhados
```
packages/
  types/        → @questboard/types       (interfaces TS)
  validators/   → @questboard/validators  (Zod schemas — fonte única)
  constants/    → @questboard/constants   (CELL_SIZE=64, enums, planos)
  api-client/   → @questboard/api-client  (HTTP client tipado)
  store/        → @questboard/store       (Zustand stores — persistência injetada)
  socket/       → @questboard/socket      (Socket.IO client tipado)
  utils/        → @questboard/utils       (helpers puros, zero IO)
  engine/       → @questboard/engine      (lógica de jogo — funções puras)
```

---

## 3. Regras de ouro — NUNCA violar

1. **CELL_SIZE = 64** — constante imutável de `@questboard/constants`.
   Jamais usar 32, 64, 128 hardcoded em qualquer arquivo.

2. **Um único PIXI.Application** no gameplay web. Layers são `PIXI.Container`,
   nunca `PIXI.Application` separados. `useEffect` do Pixi DEVE ter cleanup
   (`app.destroy`) e guard (`if (pixiRef.current) return`).

3. **Servidor é authoritative** — dados de jogo (posição de token, HP, fog,
   dados) são validados e persistidos no servidor. Cliente faz optimistic update
   mas SEMPRE aceita correção do servidor.

4. **Dados não são rolados no cliente** — `dice:roll { notation }` vai para
   o servidor, servidor usa `crypto.getRandomValues()`, broadcast do resultado.

5. **Zod schemas em `@questboard/validators`** — nunca duplicar schemas entre
   front e back. O backend valida com o mesmo schema que o front usa.

6. **Stores com persistência injetada** — nunca hardcodar `localStorage` ou
   `MMKV` dentro da store. Injetar o storage como parâmetro.

7. **Todo socket handler tem**: validação Zod do payload → permission check
   pelo `role` → try/catch com log → ack com resultado.

8. **GM e CO_GM** bypassam colisão de token e podem mover qualquer token.
   PLAYER só move seus próprios tokens e passa pela validação de colisão.

9. **Tudo em pt-BR** — mensagens de UI, chat, notificações, narração.

10. **Mobile usa Tamagui**, web usa Tailwind+shadcn. Nunca misturar.

---

## 4. Estrutura de arquivos

```
questboard/
├── apps/
│   ├── mobile/
│   │   └── app/                    # Expo Router (file-based)
│   ├── web/
│   │   ├── app/
│   │   │   ├── (dashboard)/        # Área do GM (autenticado)
│   │   │   │   ├── gameplay/[id]/  # Tela principal VTT
│   │   │   │   └── _components/
│   │   │   │       ├── session/    # Lobby, loading screen
│   │   │   │       ├── map/        # Canvas Pixi.js
│   │   │   │       ├── panels/     # Chat, dados, ficha
│   │   │   │       └── behaviors/  # Comportamento NPCs
│   │   │   └── play/[code]/        # Player view pública
│   │   │       └── _components/
│   │   │           ├── JoinScreen.tsx
│   │   │           ├── LobbyScreen.tsx
│   │   │           ├── GameplayScreen.tsx
│   │   │           ├── NpcDialogScreen.tsx   # Fullscreen RPG clássico
│   │   │           └── SessionLoadingScreen.tsx
│   │   └── hooks/
│   │       ├── useVAD.ts           # Voice activity detection
│   │       └── useTokenMovement.ts # Colisão client-side
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── sessions/
│       │   │   ├── maps/
│       │   │   ├── tokens/
│       │   │   ├── combat/
│       │   │   ├── chat/
│       │   │   ├── npc/            # NpcProfile, conversa, voz, behaviors
│       │   │   └── billing/
│       │   ├── services/
│       │   │   └── BehaviorService.ts  # Tick loop 150ms + paths 500ms
│       │   └── socket/
│       └── prisma/
│           └── schema.prisma
└── packages/
    └── engine/
        ├── collision.ts      # canTokenMoveTo()
        ├── pathfinding.ts    # aStar(), findNearestExit()
        ├── behaviorWalls.ts  # buildEffectiveWallSet()
        ├── steering.ts       # computeNextStateWithPath()
        └── grid.ts           # snapToGrid(), cellToPixel(), pixelToCell()
```

---

## 5. Ciclo de vida da sessão

```
IDLE → LOBBY → LIVE ↔ PAUSED → ENDED / ARCHIVED
```

- Só o GM pode iniciar (`POST /sessions/:id/start`)
- GM pode iniciar com 0 jogadores (modo solo)
- Sessão vai para PAUSED automaticamente se GM desconectar > 60s sem CO_GM
- Redis é limpo ao encerrar. Flush periódico Redis → Postgres a cada 30s
  (ações críticas como HP e fog fazem flush imediato)

---

## 6. Sistemas principais implementados

### 6.1 Colisão de tokens
- Pré-validação no **cliente** via `canTokenMoveTo()` antes de emitir evento
- Servidor valida como segunda barreira
- Token treme (`playWallBumpAnimation`) se bloqueado — não move
- Porta fechada → prompt "Abrir porta?" para jogador

### 6.2 Comportamento de NPCs (BehaviorService)
- **Tick duplo**: movimento a cada 150ms, recálculo A* a cada 500ms
- Behaviors: `IDLE | CROWD | PATROL | GUARD | FLEE | PANIC | RIOT | FOLLOW | SEARCH`
- GM aciona, Gemini gera parâmetros (uma chamada, não no loop)
- `buildEffectiveWallSet(behaviorType)` — PANIC passa por portas normais,
  RIOT arromba portas (exceto mágicas), outros respeitam estado atual
- NPCs com path fogem para saída; sem path → caos aleatório + `npc:trapped`
- Saídas: DOOR (porta do mapa) | ZONE (área delimitada pelo GM) | MAP_EDGE
- Eventos: `door:npc-opened`, `door:npc-broken`, `npc:escaped`, `npc:trapped`
- Portas arrombadas (`RIOT`) ficam `DESTROYED` — não fecham mais

### 6.3 Conversa com NPC
- Modos: `SCRIPTED` | `AI` | `HYBRID`
- IA usa Gemini 2.5 Flash com system prompt dinâmico
- Contexto inclui: equipamentos visíveis, HP%, arma desembainhada, raça,
  reputação, estilo de fala detectado, histórico da conversa
- **Voz (VAD)**: `useVAD` (web) + `useVADMobile` (Expo) detectam início/fim
  de fala automaticamente (silêncio 1.2s encerra). Áudio → Gemini multimodal
  (transcrição + emoção + resposta NPC em UMA chamada). Sem preview — direto.
- Emocoes detectadas: `ANGRY | FEARFUL | SAD | JOYFUL | CALM | NERVOUS |
  DESPERATE | CONTEMPTUOUS | NEUTRAL`
- GM monitora conversa em tempo real + pode digitar como NPC (override)
- Reputação -100 a 100 atualizada a cada mensagem

### 6.4 Fog of War
- 3 estados: Hidden → Explored → Visible
- Auto-reveal ao mover token de PC (raycasting com paredes)
- Fog state no Redis como delta (não estado completo) para performance
- Writes via pipeline Redis para evitar race condition

### 6.5 Combate
- Redis `SETNX combat:lock:{sessionId}` TTL 3s em TODOS os handlers
- Servidor authoritative para HP (nunca cliente)
- Token ↔ Ficha sync bidirecional

### 6.6 Canvas Pixi.js
- Um único `PIXI.Application` com `resizeTo: container`
- `worldContainer` recebe pan/zoom. `uiLayer` fora do worldContainer (fixo)
- `ResizeObserver` redimensiona ao colapsar painéis
- Interpolação `lerp(sprite.pos, target.pos, 0.15)` no ticker (60fps suave)
- Câmera reseta ao trocar de cena (`centerCamera()`)

---

## 7. Redis — chaves e TTLs

```
# Com TTL obrigatório:
combat:lock:{sessionId}          TTL 3-5s
session:{id}:typing:{userId}     TTL 3s

# Sem TTL (vivem enquanto sessão está LIVE):
session:{id}:state               Hash: status, activeMapId, combatActive
session:{id}:presence            Hash: userId → { isOnline, socketId }
map:{mapId}:tokens               Hash: tokenId → { x, y, rotation }
map:{mapId}:fog                  String: JSON delta
behavior:{id}:positions          Hash: tokenId → { x, y, vx, vy, facing }
behavior:{id}:paths              Hash: tokenId → JSON Array<{x,y}> | null
behavior:{id}:state              Hash: status, phase, tickCount
```

---

## 8. Socket events — referência rápida

```
# Sessão
session:status-changed    session:settings-updated
player:joined             player:left
player:connected          player:disconnected

# Mapa / Tokens
token:moved               token:added
token:removed             fog:updated

# Combate
combat:started            combat:ended
combat:turn-changed       combat:hp-changed

# Comportamento NPC
npc:behavior-tick         { behaviorId, timestamp, positions[] }
npc:escaped               { behaviorId, tokenId }
npc:trapped               { behaviorId, tokenId }
door:npc-opened           { doorId, tokenId }
door:npc-broken           { doorId, tokenId }

# Conversa NPC
npc:thinking              { conversationId }
npc:message               { conversationId, message }
npc:voice-result          { conversationId, playerMessage, npcMessage }
npc:reputation-changed    { conversationId, delta, total }

# Chat / Dados
chat:message              dice:result
```

---

## 9. Planos e limites

| Feature | Free | Aventureiro R$19,90/mês | Lendário R$39,90/mês | Player Plus R$9,90/mês |
|---------|------|------------------------|----------------------|------------------------|
| Sessões | 2 | 8 | ∞ | — |
| Jogadores/sessão | 5 | 10 | ∞ | — |
| Mapas IA/mês | 0 | 20 | ∞ | — |
| Fog of War | ✗ | ✓ | ✓ | — |
| Iluminação Dinâmica | ✗ | ✗ | ✓ | — |
| NPC Assistant AI | ✗ | ✗ | ✓ | — |
| Personagens | 3 | 10 | ∞ | ∞ |
| Vault | ✗ | ✗ | ✗ | 5GB |
| PDF Export | ✗ | ✓ | ✓ | ✓ |

**Planos anuais:** Aventureiro R$199/ano, Lendário R$399/ano, Player Plus R$99/ano.
Downgrade nunca deleta dados — sessions viram ARCHIVED, features desativam.

---

## 10. Permissões por role

| Ação | GM | CO_GM | PLAYER | SPECTATOR |
|------|:--:|:-----:|:------:|:---------:|
| session:start/end | ✓ | ✗ | ✗ | ✗ |
| fog:reveal/hide | ✓ | ✓ | ✗ | ✗ |
| token:move-any | ✓ | ✓ | ✗ | ✗ |
| token:move-own | ✓ | ✓ | ✓ | ✗ |
| behavior:start/stop | ✓ | ✓ | ✗ | ✗ |
| npc:gm-override | ✓ | ✓ | ✗ | ✗ |
| combat:start/end | ✓ | ✓ | ✗ | ✗ |
| combat:update-hp | ✓ | ✓ | ✓* | ✗ |
| dice:roll-secret | ✓ | ✓ | ✗ | ✗ |
| chat:send | ✓ | ✓ | ✓ | ✗ |

*PLAYER só atualiza HP do próprio token.

---

## 11. Falhas conhecidas (documentadas, não corrigidas)

Ver `questboard-gameplay-audit.md` para lista completa de 46 falhas.

**Críticas pendentes:**
- F-06: Race condition no último slot → usar `prisma.$transaction`
- F-11: Jogador fica preso no lobby se sessão já é LIVE → checar status REST no connect
- F-16: Loading screen com timer fixo → aguardar `map:ready` real
- F-31: Canvas duplicado → cleanup no useEffect + guard
- F-41/F-42: Permission check em todos handlers + dice server-side

---

## 12. Prompts de especificação (outputs gerados)

Todos os `.md` de spec estão em `/mnt/user-data/outputs/`:

| Arquivo | Conteúdo |
|---------|----------|
| `questboard-sessions-backend-prompt.md` | Lifecycle, Socket.IO, Redis |
| `questboard-canvas-duplicado-fix.md` | Correção do canvas duplicado |
| `questboard-solo-start-prompt.md` | GM inicia sem jogadores |
| `questboard-session-loading-screen-prompt.md` | Tela de loading animada |
| `questboard-npc-conversation-prompt.md` | Sistema de conversa com NPC |
| `questboard-npc-voice-vad-prompt.md` | Voz com VAD + Gemini multimodal |
| `questboard-npc-behavior-prompt.md` | Comportamento de NPCs em grupo |
| `questboard-collision-pathfinding-behavior-prompt.md` | Colisão + A* + portas |
| `questboard-gameplay-audit.md` | 46 falhas catalogadas com severidade |
| `questboard-auditoria-completa-prompt.md` | Prompt de auditoria end-to-end |

---

## 13. O que fazer antes de qualquer edição

```bash
# 1. Verificar instâncias de PIXI.Application (deve ser 1)
grep -r "new PIXI.Application\|new Application(" apps/web-next/src

# 2. Verificar CELL_SIZE hardcoded (deve ser 0 resultados)
grep -rn "= 32\b\|= 64\b\|= 128\b" packages/engine apps/api/src apps/web-next/src

# 3. Verificar TypeScript
npx tsc --noEmit 2>&1 | head -50

# 4. Verificar migrations pendentes
npx prisma migrate status
```

---

## 14. Infra / Deploy

- **VPS KVM Hostinger** — mesmo padrão do Teki (`tekiia.com`)
- Nginx reverse proxy + SSL Let's Encrypt
- PM2 para processos Node
- PostgreSQL + Redis no mesmo VPS inicialmente
- Cloudflare R2 para assets (mapas, tokens, handouts, áudio)
- Domínio: `questboard.gg`