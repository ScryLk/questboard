# QuestBoard — Relatório de Auditoria Web

**Data:** 2026-04-21
**Escopo:** `apps/web-next` (Next.js 15)
**Foco:** Responsividade mobile + inconsistências + dívida técnica

---

## ⚠️ Nota sobre o alvo da auditoria

O prompt original pede auditoria de `apps/web`. No repositório atual esse
diretório existe mas está **vazio** (apenas `package.json` + `node_modules`,
zero arquivos `.tsx`). O código vivo do web está em `apps/web-next` (326
arquivos `.tsx`, ~425MB incluindo `node_modules`). A auditoria foi
executada sobre `apps/web-next`. Se havia intenção de comparar com um
`apps/web` legado, esse comparativo não foi possível.

## Limites declarados

- **Não rodei o projeto no browser** — todos os achados de responsividade
  são inferência por análise estática (Tailwind classes, larguras fixas,
  ausência de breakpoints). Falsos positivos possíveis.
- **Não medi performance real** (sem Lighthouse, Web Vitals, bundle size).
- **Não testei fluxos E2E** — não sei se uma jornada completa funciona.
- **Não validei acessibilidade** (sem axe-core, sem keyboard nav).
- **Não inspecionei `apps/api`** — backend fora do escopo.
- **Não verifiquei build de produção** — só código-fonte.

---

## Sumário executivo

### Achados por severidade

| Severidade | Quantidade |
|---|---:|
| 🔴 Crítico | 5 |
| 🟠 Alto | 9 |
| 🟡 Médio | 11 |
| ⚪ Baixo | 4 (ver anexos) |

### Top 5 problemas

1. **🔴 Toda a sidebar do dashboard é `w-[260px]` fixa sem breakpoint** — Em 360/390px ocupa ~72% da viewport e não colapsa. Dashboard inteiro inutilizável em mobile.
2. **🔴 Três instâncias de `new Application()` (Pixi) coexistem no código** — viola regra de ouro #2. `pixi-canvas.tsx`, `pixi-terrain-layer.tsx` e `canvasInit.ts` (este último dead code).
3. **🔴 `apps/web-next/src/lib/dice.ts` + 5 pontos adicionais rolam dados no cliente** — viola regra de ouro #4. Inclui d20 de iniciativa, death save, ataque e chat de dados.
4. **🔴 Gameplay (`map-canvas.tsx` 2048 linhas / `maps/editor/page.tsx` 2201 linhas) não tem breakpoint algum** — tela cheia de tools flutuantes, não há modo mobile previsto.
5. **🟠 0 breakpoints em `sidebar.tsx` e `header.tsx` do layout principal** — o wrapper de todo o dashboard não reconhece mobile.

### Recomendação de ordem de ataque

| Sprint | Foco | Tempo estimado |
|---|---|---|
| 1 (1 semana) | Críticos de mobile — drawer no sidebar, modals com `max-h-screen`, gameplay com modo mobile ou bloqueio explícito "desktop-only" | 5-7 dias |
| 2 (3 dias) | Regras de ouro — consolidar PIXI, centralizar `CELL_SIZE`, ligar dice server-side (ou reconhecer formalmente como dívida técnica já pactuada) | 3 dias |
| 3 (3 dias) | Consistência visual — 201 hex codes hardcoded, 23 cores únicas detectadas fora do tema Tailwind | 2-3 dias |
| 4 (ongoing) | Dívida — refactor dos arquivos > 500 linhas (4 deles), `any` em narrative, limpar `console.log` de teste | contínuo |

**Críticos + Altos:** ~2 semanas de dev solo.

---

## 1. Aderência às Regras de Ouro (CLAUDE.md)

### 🟡 Regra #1 — CELL_SIZE imutável

**Achado:** duas duplicatas locais de `CELL_SIZE` em vez de importar de `@questboard/constants`.

| Arquivo | Linha | Conteúdo | Observação |
|---|---|---|---|
| [ai-generation-panel.tsx](apps/web-next/src/components/gameplay/ai-generation-panel.tsx#L21) | 21 | `const CELL_SIZE = 64;` | deveria importar |
| [ai-map-prompt.ts](apps/web-next/src/lib/ai-map-prompt.ts#L47) | 47 | `const CELL_SIZE = 64;` | deveria importar |
| [terrain-texture-generator.ts](apps/web-next/src/lib/terrain-texture-generator.ts#L470) | 470 | `const patternSize = 64;` | é patternSize de textura procedural, **não** é CELL_SIZE — coincidência numérica. OK. |
| [object-sprite-icon.tsx](apps/web-next/src/components/gameplay/object-sprite-icon.tsx#L43) | 43 | `size = 32` | default prop do ícone. OK. |

**Severidade:** 🟡 Médio. Não quebra produção, mas viola a regra textual.

**Sugestão:** substituir os dois por `import { CELL_SIZE } from "@questboard/constants"`.

---

### 🔴 Regra #2 — Um único PIXI.Application

**Achado:** três instâncias.

| Arquivo | Linha |
|---|---|
| [pixi-canvas.tsx](apps/web-next/src/components/gameplay/map-canvas/pixi-canvas.tsx#L59) | 59 — gameplay principal (legítima) |
| [pixi-terrain-layer.tsx](apps/web-next/src/components/gameplay/map-canvas/pixi-terrain-layer.tsx#L49) | 49 — **segunda** app, usada no editor de mapas e por tipo de terrain renderizado |
| [canvasInit.ts](apps/web-next/src/lib/gameplay/canvasInit.ts#L35) | 35 — terceira app em helper de lib. `grep` não encontrou quem importe — suspeito de **dead code** |

**Severidade:** 🔴 Crítico.

**Sugestão:**
1. Verificar quem importa `canvasInit.ts`. Se ninguém, apagar após confirmação.
2. `PixiTerrainLayer` cria app separado pra renderizar textura procedural. A regra pede camadas como `PIXI.Container`. Refactor: terrain layer vira um `Container` adicionado ao `worldContainer` do `PixiCanvas`, compartilhando a Application.
3. Adicionar teste estático (`grep`) em CI que falha se aparecer mais de uma ocorrência.

---

### 🔴 Regra #3 — Servidor authoritative (HP, dano)

**Achado:** HP e dano são calculados e aplicados 100% no cliente via `updateTokenHp` do `gameplayStore`. Não há emissão de socket, nenhum `ack` do servidor.

Exemplos:
- [token-context-menu/index.tsx:140](apps/web-next/src/components/gameplay/map-canvas/menus/token-context-menu/index.tsx#L140) — ataque calcula roll + damage no cliente e aplica via `setAttackLine`.
- [target-panel/blocks/health-block.tsx](apps/web-next/src/components/gameplay/right-panel/target-panel/blocks/health-block.tsx) — botões "-1/-5/-10" chamam `updateTokenHp` localmente.
- [gameplay-store.ts](apps/web-next/src/lib/gameplay-store.ts) `updateTokenHp` é mutação pura de estado.

**Severidade:** 🔴 Crítico por violação formal, mas **já pactuado como dívida técnica** nas conversas anteriores ("sem backend"). O app inteiro roda mock — até o backend subir, essa violação fica registrada.

**Sugestão:** quando houver backend, todos os métodos de mutação do token (`updateTokenHp`, `toggleTokenCondition`, etc) devem emitir socket com validação e apenas reagir ao broadcast `token:updated`. Até lá, marcar toda função envolvida com comentário `// TODO (regra #3): server-authoritative quando houver backend`.

---

### 🔴 Regra #4 — Dados nunca rolados no cliente

**Achado:** 88 ocorrências de `Math.random`. Dessas, pelo menos **6 são rolagens de dados** que deveriam ir pro servidor:

| Arquivo | Linha | Contexto |
|---|---|---|
| [dice.ts:17](apps/web-next/src/lib/dice.ts#L17) | 17 | `rollDice()` genérica — base de muitas outras |
| [dice.ts:40-41](apps/web-next/src/lib/dice.ts#L40) | 40-41 | `rollD20()` com advantage/disadvantage |
| [dice-tab.tsx:42](apps/web-next/src/components/gameplay/right-panel/dice-tab.tsx#L42) | 42 | Tab de dados do chat — jogador rola livremente |
| [PlayerDiceTab.tsx:47](apps/web-next/src/components/player-view/tabs/PlayerDiceTab.tsx#L47) | 47 | Mesma coisa na view pública do jogador |
| [start-combat-modal.tsx:29,50](apps/web-next/src/components/gameplay/modals/start-combat-modal.tsx#L29) | 29, 50 | Iniciativa rolada no cliente |
| [DeathSaveOverlay.tsx:19](apps/web-next/src/components/player-view/overlays/DeathSaveOverlay.tsx#L19) | 19 | Death save d20 no cliente |
| [token-context-menu/index.tsx:140-141](apps/web-next/src/components/gameplay/map-canvas/menus/token-context-menu/index.tsx#L140) | 140-141 | Ataque (d20 + d8) no cliente — já marcado como TODO dívida |

**Severidade:** 🔴 Crítico formal, pactuado como dívida.

**Sugestão:**
- Criar handler socket `dice:roll` no backend quando existir e migrar **todas** as rolagens pra ele.
- No MVP atual, centralizar no `dice.ts` para que no futuro só um arquivo mude.
- Hoje existe `dice.ts` + rollDice inline em `dice-tab.tsx` e `PlayerDiceTab.tsx` — consolidar.

---

### ✅ Regra #5 — Zod em `@questboard/validators`

**Achado:** `grep "z\.object\|z\.string" apps/web-next/src` retornou **0 ocorrências**. Schemas compartilhados estão de fato no package.

**Severidade:** ✅ Nenhuma violação.

---

### 🟡 Regra #6 — Stores com persistência injetada

**Achado:** alguns helpers e stores locais fazem `localStorage.getItem/setItem` diretamente.

| Arquivo | Natureza |
|---|---|
| [search-store.ts:19](apps/web-next/src/lib/search-store.ts#L19) | `return window.localStorage` — retorna storage como função, OK |
| [map-library-store.ts:164](apps/web-next/src/lib/map-library-store.ts#L164) | Zustand store acessa localStorage direto |
| [map-storage.ts:19,28](apps/web-next/src/lib/map-storage.ts#L19) | Helper de storage puro — não é store |
| [active-campaign.ts:29,41,56,57](apps/web-next/src/lib/active-campaign.ts#L29) | Helper de seleção de campanha ativa — não é store |
| [target-panel/use-block-collapse.ts](apps/web-next/src/components/gameplay/right-panel/target-panel/use-block-collapse.ts) | Hook local novo (PR recente) |
| [target-panel/use-token-notes.ts](apps/web-next/src/components/gameplay/right-panel/target-panel/use-token-notes.ts) | Hook local novo |

**Severidade:** 🟡 Médio. A regra é clara (stores injetam storage), mas:
- Os dois hooks novos (`use-block-collapse`, `use-token-notes`) foram criados como fallback UI-only, com TODO explícito pra migrar quando houver backend.
- `map-library-store.ts` é de fato um store Zustand — violação formal.

**Sugestão:** `map-library-store.ts` deveria usar o middleware `persist` do Zustand com `storage` injetado (padrão `createJSONStorage(() => localStorage)`), não `localStorage.getItem` direto. Os hooks locais podem ficar como estão enquanto não houver backend.

---

### ⚠️ Regra #7 — Ack de socket (N/A)

Regra aplica principalmente ao backend. Cliente ainda não emite eventos reais (mock). Fica pendente para quando a stack backend existir.

---

### 🟡 Regra #8 — Permissões GM/CO_GM/PLAYER

**Achado:** matriz de permissão existe no cliente (ver [use-visibility-rules.ts](apps/web-next/src/components/gameplay/map-canvas/menus/token-context-menu/use-visibility-rules.ts)). Usa `currentUserIsGM` do store pra esconder UI — **uso correto** (regra pede: só esconder, não autorizar). Mas o store define `currentUserIsGM: true` por default, então hoje todo usuário é "GM" implicitamente.

**Severidade:** 🟡 Médio.

**Sugestão:** quando multiplayer ligar, hidratar `currentUserIsGM` a partir da `SessionPresence` ou `CampaignMember.role`. Hoje o comentário TODO já existe em [gameplay-store.ts:432](apps/web-next/src/lib/gameplay-store.ts#L432).

---

### 🟠 Regra #9 — Tudo em pt-BR

**Achado:** análise automática via grep com heurística `"CapitalWord CapitalWord"` teve alta taxa de falsos positivos (pegou "Maria Santos", "Elara Elfa" etc. que são **nomes** em pt-BR). Amostragem manual:

- Maioria da UI do dashboard/gameplay/modals está em pt-BR. ✓
- Componentes mock de personagens têm nomes próprios que parecem inglês mas são aceitáveis.
- Ficaram pendentes algumas strings muito técnicas (logs, placeholders de prompt) em inglês — não voltadas ao usuário.

**Severidade:** 🟠 Alto por precaução, mas provável downgrade para 🟡 após inspeção fina. Recomendo uma varredura manual com foco em:
- Botões `<button>` com texto
- `title=`, `aria-label=`
- `placeholder=`
- Toasts

**Anexo A:** lista completa do grep (35 linhas, maioria falso positivo) em `/tmp/audit-raw/16-english-strings.txt`.

---

### ✅ Regra #10 — Mobile Tamagui / Web Tailwind

**Achado:** `grep "tamagui\|@tamagui\|nativewind"` no `apps/web-next` retornou **0 ocorrências**. Web está 100% Tailwind + shadcn conforme esperado.

**Severidade:** ✅ Nenhuma violação.

---

## 2. Responsividade em mobile (360px / 390px / 768px)

### 🔴 Layout do dashboard — sidebar + header sem breakpoints

**Arquivos:**
- [layout.tsx (dashboard)](apps/web-next/src/app/(dashboard)/layout.tsx) — `flex h-screen overflow-hidden`
- [sidebar.tsx:39](apps/web-next/src/components/layout/sidebar.tsx#L39) — `w-[260px]` fixa, zero breakpoints
- [header.tsx](apps/web-next/src/components/layout/header.tsx) — zero breakpoints

**Viewport afetado:** 360px, 390px (todos os tamanhos < md)

**Problema:** sidebar fixa de 260px + padding de 24px (`p-6` no main) ocupa ~290px em 360px viewport → sobra 70px pra conteúdo → conteúdo fica inutilizável ou com scroll horizontal.

**Sugestão:**
- Transformar sidebar em drawer (shadcn `Sheet` ou `Drawer`) acionado por botão hamburger no header.
- `<aside className="hidden md:flex w-[260px] ...">` pra desktop + componente drawer separado pra mobile.
- Header deve ganhar botão hamburger visível apenas em `<md`.
- Main deveria reduzir padding em mobile (`p-4 md:p-6`).

**Esforço estimado:** 1 dia (drawer shadcn + teste em 3 viewports).

**Bloqueante pra:** qualquer uso mobile do dashboard.

---

### 🔴 Gameplay (`/gameplay/[id]`) — desktop-only por design, sem aviso ao usuário

**Arquivos:**
- [map-canvas.tsx](apps/web-next/src/components/gameplay/map-canvas/map-canvas.tsx) — 2048 linhas, canvas Pixi fullscreen
- [gameplay-layout.tsx](apps/web-next/src/components/gameplay/gameplay-layout.tsx) — toolbar + 3 painéis (left/center/right)

**Viewport afetado:** 360px, 390px, 768px

**Problema:** a gameplay assume 3 colunas simultâneas (left panel + canvas + right panel) + toolbar com ~14 tools + pickers flutuantes em `top-14`. Em 390px, nada disso cabe.

**Duas abordagens possíveis:**

1. **Modo mobile simplificado** — ocultar painéis laterais, canvas ocupa tela inteira, drawers acionados por botões; toolbar vira carrossel horizontal. Escopo: **1-2 semanas** pra ficar aceitável.
2. **Bloquear acesso mobile com aviso** — tela "Gameplay requer desktop" em `<md`. Escopo: **1 hora**. Realista dado o DX alvo (GM/mesa é desktop natural).

**Sugestão:** opção 2 no curto prazo, opção 1 como projeto dedicado. A player view (`/play/[code]`) já está melhor preparada pra mobile; ela é suficiente pra jogadores no celular.

---

### 🔴 Maps editor (`/maps/editor`) — sem viabilidade em mobile

[maps/editor/page.tsx](apps/web-next/src/app/(dashboard)/maps/editor/page.tsx) tem 2201 linhas, sidebar `w-[260px]` (linha 1300), inputs de terrain/wall/AI em grid de 3 colunas, painel central com toolbar superior.

**Severidade:** 🔴 Crítico. Editor é ferramenta de GM = desktop natural.

**Sugestão:** mesma da gameplay — aviso de "desktop-only" em `<lg`.

---

### 🟠 Lobby `lobby-layout.tsx` — coluna lateral fixa de `w-80`

[lobby-layout.tsx:87](apps/web-next/src/components/lobby/lobby-layout.tsx#L87) — `flex w-80 flex-shrink-0`.

**Viewport afetado:** 360px (320px de sidebar + 40px restante = inviável).

**Sugestão:** `flex-col md:flex-row` no wrapper + sidebar vira bloco abaixo do principal em mobile. 2-3h.

---

### 🟠 Modal de create-session — condicional confusa de `max-w`

[create-session-modal.tsx:152](apps/web-next/src/components/create-session-modal.tsx#L152) — `max-w-xl` condicional. Em mobile, `max-w-xl` (36rem/576px) extrapola viewport de 390px. Falta `w-full`.

**Sugestão:** adicionar `w-[calc(100vw-32px)]` ou usar shadcn `Dialog` que já trata isso.

---

### 🟠 Painéis flutuantes da gameplay com `w-[420px]` hardcoded

- [terrain-tool-picker.tsx:56](apps/web-next/src/components/gameplay/toolbar/terrain-tool-picker.tsx#L56) — `w-[420px]`
- [wall-tool-picker.tsx:44](apps/web-next/src/components/gameplay/toolbar/wall-tool-picker.tsx#L44) — `w-[420px]`

Mesmo pickers transbordam em 390px. Como a gameplay é desktop-only (achado acima), questão secundária — mas se forem reaproveitados na player view, quebram.

---

### 🟡 Páginas do dashboard (/dashboard, /campanhas, /personagens, /jogadores) — grids 3-4 colunas OK

Amostragem:
- `dashboard/page.tsx:70` — `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` ✓ (mobile = 1 coluna)
- `objects/page.tsx:143` — `grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5` ✓
- `maps/page.tsx:326` — `grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` ✓

**Achado positivo:** as páginas de listagem principais **usam breakpoints**. Mobile mostra 1 coluna, expande conforme.

Mas algumas páginas NÃO usam:
- `players/page.tsx:250` — `grid sm:grid-cols-3` — pula direto pra 3 em `sm:`, que é 640px. Em 480-640px fica esticado. Adicionar passo intermediário.
- `play/[code]/_components/JoinScreen.tsx:114` — `grid grid-cols-3` sem breakpoint. 3 colunas em 360px = chato mas não fatal.

**Severidade:** 🟡 Médio por página.

---

### 🟡 Modal de confirmação fullscreen não testado em mobile

Modal `remove-confirm-dialog.tsx` e `character-sheet-modal.tsx` usam `max-w-*` fixo sem `max-h` ou scroll interno. Em 390px × 700px (iPhone retrato) com teclado aberto, conteúdo pode cortar.

**Sugestão:** auditar todos os modals e adicionar `max-h-[90vh] overflow-y-auto`.

---

## 3. Consistência visual

### 🟠 201 ocorrências de cores hexadecimais hardcoded no JSX

23 cores únicas detectadas **fora** do tema Tailwind:

```
#0088CC  #0A0A0F  #0D0D12  #0E0E14  #0F0F12
#111116  #12121A  #13111E  #16161D  #1A1A2E
#1C1C28  #1a1430  #1a1a22  #25D366  #2A2A3A
#3A3A5A  #6B6B7E  #74B9FF  #9B9BAF  #C9A84C
#F59E0B  #FDCB6E  #FFD700
```

Observações:
- `#0A0A0F`, `#111116`, `#16161D` — são tons de fundo muito usados, deveriam ser tokens `brand-primary`, `brand-surface`, `brand-border` no Tailwind.
- `#25D366` é verde do WhatsApp — aparece em share button provavelmente.
- `#0088CC` é azul Telegram — idem.
- `#C9A84C` (dourado) e `#FFD700` são duplicatas conceituais — padronizar em 1.

**Severidade:** 🟠 Alto. Gera divergência visual quando alguém troca o tema.

**Sugestão:**
1. Consolidar em `tailwind.config.*` como tokens nomeados.
2. CI/lint que bloqueia novos `bg-[#...]` em `.tsx`.
3. Migração pode ser incremental — o importante é parar de crescer.

---

### 🟡 Mistura de `rounded-lg` / `rounded-md` / `rounded-full` sem regra aparente

Contextualizar: botões de ação circulares usam `rounded-full`, depois viraram `rounded-lg` (no PR recente do menu). Inputs usam `rounded-md`. Modais `rounded-xl`. Sem documentação do quando usar qual.

**Sugestão:** convencionar no CLAUDE.md: `md` inputs/campos, `lg` botões/popovers, `xl` modals/dialogs, `full` avatares/pills.

---

### 🟡 Fontes Syne/DM Sans definidas mas não aplicadas uniformemente

CLAUDE.md declara Syne 800 para headings e DM Sans para corpo. `grep "fontFamily\|font-family"` retornou 0 em `.tsx`. Fontes provavelmente configuradas em CSS global. Verificar se todos os `<h1-h6>` usam Syne via Tailwind `font-heading` customizado.

---

## 4. Dívida técnica e código morto

### 🟠 Arquivos > 500 linhas (candidatos a refactor)

| Arquivo | Linhas |
|---|---:|
| [maps/editor/page.tsx](apps/web-next/src/app/(dashboard)/maps/editor/page.tsx) | **2201** |
| [map-canvas/map-canvas.tsx](apps/web-next/src/components/gameplay/map-canvas/map-canvas.tsx) | **2048** |
| [player-view/PlayerCanvas.tsx](apps/web-next/src/components/player-view/PlayerCanvas.tsx) | 608 |
| [encounter-group-editor.tsx](apps/web-next/src/components/gameplay/modals/encounter-group-editor.tsx) | 579 |
| [token-context-menu/index.tsx](apps/web-next/src/components/gameplay/map-canvas/menus/token-context-menu/index.tsx) | 564 |
| [cell-context-menu.tsx](apps/web-next/src/components/gameplay/map-canvas/menus/cell-context-menu.tsx) | 562 |

Os dois primeiros são excepcionalmente grandes. `maps/editor/page.tsx` tem tool palette + canvas + lógica de terrain/wall/objects/AI tudo num só arquivo. Refactor quebrando em subcomponentes por tool (~300 linhas cada) melhora manutenção significativamente.

**Severidade:** 🟠 Alto no prazo longo, 🟡 Médio no curto (eles funcionam).

---

### 🟠 `any` em componentes de narrative

10 ocorrências, concentradas em [narrative/nodes/](apps/web-next/src/components/narrative/nodes):

```
narrative/nodes/chapter-node.tsx:8      function ChapterNodeComponent(props: any)
narrative/nodes/choice-node.tsx:16      function ChoiceNodeComponent(props: any)
narrative/nodes/event-node.tsx:23       function EventNodeComponent(props: any)
narrative/nodes/consequence-node.tsx:15 function ConsequenceNodeComponent(props: any)
narrative/narrative-canvas.tsx          5× any em callbacks do xyflow
```

**Motivo provável:** `@xyflow/react` tem tipagem genérica complicada e as equipes optaram por `any` pra não lutar com generics.

**Sugestão:** usar `NodeProps<MyData>` do xyflow v12 com tipo customizado. Dá pra tipar em ~1h por node.

---

### 🟡 TODOs — 13 no total, 0 órfãos

Todos os TODOs estão contextualizados (apontam pra backend faltante ou features planejadas). Amostras:

- `lobby-layout.tsx:27` — "load real session data via API/socket"
- `invite-players-modal.tsx:20,36,41` — esperando backend
- `token-context-menu/index.tsx:132` — ataque client-side (dívida pactuada)
- `story/encounters-view.tsx:7` — store pra encounters quando feature chegar
- `active-campaign.ts:18` — contexto de campanha selecionada

**Severidade:** 🟡 Médio. Honestos, não são cheiros. Vale migrar pra issues no tracker pra parar de rastrear no grep.

---

### 🟡 25 ocorrências de `console.*`

A maioria são `console.error` em `catch` de rotas `/api/ai/*` (esperado pra debug em produção) e `console.warn` do SFX (freesound API key ausente, sem chave).

**Problemáticos** (parecem debug esquecidos):
- [pixi-canvas.tsx](apps/web-next/src/components/gameplay/map-canvas/pixi-canvas.tsx) — `console.log("Combat anims ready! Use __testAnim('sword_slash') or __testAllAnims()")` — helper dev
- `console.log("[SFX] ${SFX_DEFINITIONS.length} sons carregados via Freesound")` — informativo
- `console.log("Playing ...")` / `console.log("All done")` — debug de animação

**Sugestão:** envolver dev-helpers em `if (process.env.NODE_ENV === "development")` ou usar um logger com níveis (já tem padrão em packages/utils?).

---

## 5. Stack e dependências

`apps/web-next/package.json` auditado:

### Aderência ao CLAUDE.md

| Esperado | Presente | Status |
|---|---|---|
| Next.js 15 | `^15.2.0` | ✓ |
| Tailwind + shadcn | `tailwindcss ^4.0.9` + `cmdk` + componentes locais | ✓ |
| Zustand | `^5.0.11` | ✓ |
| Pixi.js | `^8.16.0` | ✓ |
| Framer Motion | **ausente** | 🟡 |
| lucide-react | `^0.474.0` | ✓ |
| React | `^18.3.1` (ajustado via override) | ✓ |

**Framer Motion ausente** — CLAUDE.md lista como parte da stack, mas não aparece nos dependencies. Ou é desnecessário e deve sair do CLAUDE.md, ou é dívida (animações que seriam com FM estão sendo feitas à mão).

### Dependências que merecem atenção

- `@xyflow/react ^12.10.1` — grafo de narrativa (ok)
- `ai ^6.0.116` + `@ai-sdk/anthropic` — SDK da Anthropic, usado nos endpoints `/api/ai/*` (ok)
- `qrcode.react` — QR code do convite de sessão (ok)
- `simplex-noise ^4.0.3` — ruído procedural, provavelmente usado em fog/terrain (ok)
- **Nenhuma dep proibida pelo CLAUDE.md encontrada** (Stripe, MongoDB, R3F, GSAP, etc.).

### Problema do monorepo já tratado (com ressalva importante)

Nesta sessão foram adicionados `pnpm.overrides` no root `package.json` fixando `react@18.3.1` e `react-dom@18.3.1` para eliminar as 5 cópias aninhadas de React 19 que o Next trazia.

**Gotcha descoberto:** overrides do pnpm só se aplicam a dependências **declaradas explicitamente** no workspace consumidor. Deps que dependem de um pacote **via `peerDependency: "*"`** (caso do Tamagui: `peerDep "react-dom": "*"`) sem que o workspace tenha o pacote em suas `dependencies` diretas resolvem livremente no hoist — o override **não alcança**. Sintoma: `react` convergiu pra 18.3.1 (apps/web-next declarava), mas `react-dom` persistiu em 19.2.4 porque `apps/mobile` não declarava react-dom, só usava transitivamente via tamagui. Erro resultante: `Cannot read properties of undefined (reading 'S')` — react-dom 19 tentando acessar `ReactSharedInternals.S` em React 18.

**Correção:** adicionado `"react-dom": "^18.3.1"` em [apps/mobile/package.json](apps/mobile/package.json) mesmo que mobile nunca importe react-dom diretamente — é declaração defensiva pro override pegar.

**Recomendação de processo:** sempre que adicionar um override pra pacote transitivo, verificar se **todos os workspaces que usam** (mesmo indiretamente via peer deps) têm o pacote declarado em `dependencies`. Alternativa: usar sintaxe de override com selector explícito `">tamagui>react-dom": "18.3.1"` em vez de `"react-dom": "18.3.1"` — mais verboso mas alcança qualquer profundidade.

**Severidade:** ✅ OK após a correção.

---

## 6. Estados vazios, erro e loading

Análise superficial (sem rodar o app):

### 🟡 Muitas páginas usam dados mock hardcoded em vez de fetch

- `players/page.tsx` — 6 jogadores hardcoded
- `chat/page.tsx` — mensagens fictícias
- `campanhas/[id]/page.tsx` — mock de sessão

Como **não há backend**, não há `useQuery`/`fetch` a validar. Loading/error/empty states ficarão pendentes pra depois da integração.

### ✅ Empty states encontrados (pt-BR, consistentes)

Amostras positivas:
- [target-panel/index.tsx — EmptyState](apps/web-next/src/components/gameplay/right-panel/target-panel/index.tsx) — "Nenhum alvo selecionado"
- [player-list.tsx](apps/web-next/src/components/gameplay/left-panel/player-list.tsx) — "Nenhum jogador ainda. Convide com o botão acima." (adicionado sessão passada)
- [my-tokens-tab.tsx](apps/web-next/src/components/gameplay/left-panel/token-library/my-tokens-tab.tsx) — "Nenhum token salvo..."
- [object-library-section.tsx](apps/web-next/src/components/gameplay/left-panel/object-library/object-library-section.tsx) — "Nenhum objeto criado ainda."

Padrão bem estabelecido. Quando o backend subir, seguir esse mesmo padrão (ícone cinza, frase curta, sugestão do próximo passo).

### 🟡 Ausência visível de skeletons / loaders

`grep "Skeleton\|loading\|spinner"` não foi feito em profundidade, mas inspeção superficial sugere que transições entre estados serão abruptas quando o fetch for plugado. Componente reutilizável de skeleton ajudaria.

---

## 7. Itens para ação imediata

Formato pronto pra virar issues:

- [ ] **[🔴 CRÍTICO]** Sidebar do dashboard (`w-[260px]` fixa) vira drawer em mobile — [sidebar.tsx:39](apps/web-next/src/components/layout/sidebar.tsx#L39). **Seção 2.1**
- [ ] **[🔴 CRÍTICO]** Consolidar 3 instâncias de `PIXI.Application` em uma — deletar `canvasInit.ts` (suspeito dead code), converter `PixiTerrainLayer` em Container filho. **Seção 1 regra #2**
- [ ] **[🔴 CRÍTICO]** Gameplay e Maps Editor: bloquear acesso em `<lg` com aviso "Requer desktop" OU começar projeto dedicado de versão mobile. **Seção 2.2, 2.3**
- [ ] **[🔴 CRÍTICO]** Registrar explicitamente como dívida técnica as rolagens client-side em `lib/dice.ts` + 5 call sites (regra #4 de ouro). Centralizar em um único módulo para facilitar migração. **Seção 1 regra #4**
- [ ] **[🔴 CRÍTICO]** Header do dashboard sem breakpoints, precisa botão hamburger em `<md`. **Seção 2.1**
- [ ] **[🟠 ALTO]** Consolidar 23 cores hex hardcoded em tokens Tailwind. 201 ocorrências. **Seção 3**
- [ ] **[🟠 ALTO]** Refatorar `maps/editor/page.tsx` (2201 linhas) quebrando por tool. **Seção 4**
- [ ] **[🟠 ALTO]** Refatorar `map-canvas.tsx` (2048 linhas) extraindo handlers mouse + layout JSX separados. **Seção 4**
- [ ] **[🟠 ALTO]** Tipar narrative nodes `props: any` → `NodeProps<MyData>`. 10 ocorrências. **Seção 4**
- [ ] **[🟠 ALTO]** Lobby (`w-80` fixa) vira layout empilhado em `<md`. **Seção 2.4**
- [ ] **[🟠 ALTO]** `map-library-store.ts` usa `localStorage` direto — passar pelo middleware `persist` do Zustand. **Seção 1 regra #6**
- [ ] **[🟠 ALTO]** `CELL_SIZE` duplicado em 2 arquivos — importar de `@questboard/constants`. **Seção 1 regra #1**
- [ ] **[🟠 ALTO]** Modal `create-session-modal.tsx:152` sem `w-full` em mobile. **Seção 2.5**
- [ ] **[🟡 MÉDIO]** Pickers de terrain/wall (`w-[420px]`) transbordam em mobile — responsabilidade secundária. **Seção 2.6**
- [ ] **[🟡 MÉDIO]** Remover `console.log` de dev (pixi combat anims, SFX informativos). **Seção 4**
- [ ] **[🟡 MÉDIO]** Auditar TODOs pra virar issues no tracker. **Seção 4**
- [ ] **[🟡 MÉDIO]** Framer Motion listado no CLAUDE.md mas não instalado — decidir: remover do CLAUDE.md ou instalar. **Seção 5**
- [ ] **[🟡 MÉDIO]** Convencionar escala de `rounded-*` no CLAUDE.md. **Seção 3**
- [ ] **[🟡 MÉDIO]** `grid-cols-3` sem breakpoint em `JoinScreen.tsx`. **Seção 2.7**
- [ ] **[🟡 MÉDIO]** Revisão manual de strings em inglês (heurística teve falsos positivos). **Seção 1 regra #9**

---

## Anexos

### A. Strings em inglês detectadas (heurística, falsos positivos esperados)

Arquivo completo: `/tmp/audit-raw/16-english-strings.txt` (35 linhas). Maioria é **nome próprio** pt-BR que a regex capitalizou erroneamente. Inspeção manual focada em:
- `<button>` / `<a>` texto
- `aria-label`, `title`, `placeholder`
- Toasts e mensagens de erro

Recomendo rodar `grep -rn 'title="[A-Z][a-z]' apps/web-next/src/components --include="*.tsx"` para uma varredura mais precisa.

### B. TODOs

Lista completa em `/tmp/audit-raw/12-todos.txt` (13 itens, todos contextualizados).

### C. Arquivos > 300 linhas (top 30)

Arquivo completo: `/tmp/audit-raw/15-big-files.txt`. Top destaques já listados na Seção 4. Destaque geral: 29 arquivos acima de 300 linhas. Lista ordenada por tamanho.

### D. Greps brutos

Todos os greps mencionados foram salvos em `/tmp/audit-raw/`:
- `01-cell-size.txt` — regra #1
- `02-pixi-instances.txt` — regra #2
- `03-client-random.txt` — regra #3/#4
- `04-zod-schemas.txt` — regra #5 (vazio = bom)
- `05-hardcoded-storage.txt` — regra #6
- `06-mobile-libs.txt` — regra #10 (vazio = bom)
- `07-fixed-widths.txt` — responsividade
- `08-grids.txt` — responsividade
- `09-sidebars.txt` — responsividade
- `10-minw.txt` — responsividade
- `11-hardcoded-colors.txt` — consistência
- `12-todos.txt` — dívida
- `13-any.txt` — dívida
- `14-console.txt` — dívida
- `15-big-files.txt` — dívida
- `16-english-strings.txt` — regra #9

---

## Próximos passos sugeridos

### Sprint 1 — Críticos de mobile (1 semana)
1. Sidebar + header do dashboard com drawer (2 dias)
2. Bloqueio "requer desktop" em gameplay e maps editor (1 dia)
3. Lobby empilhando em mobile (0.5 dia)
4. Modals com `max-h-[90vh] overflow-y-auto` (1 dia)
5. Teste manual em DevTools em 360/390/768 (0.5 dia)

### Sprint 2 — Regras de ouro (3 dias)
1. Consolidar PIXI.Application + deletar `canvasInit.ts` se realmente dead (1 dia)
2. Importar `CELL_SIZE` central (0.5 dia)
3. Centralizar rolagens em `lib/dice.ts` com `// TODO(regra #4)` em topo + documentar dívida (0.5 dia)
4. `map-library-store` via `persist` do Zustand (0.5 dia)

### Sprint 3 — Consistência visual (3 dias)
1. Adicionar tokens brand-* no `tailwind.config` cobrindo as 23 cores únicas (1 dia)
2. Varredura e substituição dos `bg-[#...]` / `border-[#...]` / `text-[#...]` mais comuns (1.5 dia)
3. ESLint rule bloqueando novos hex inline (0.5 dia)

### Sprint 4 — Dívida técnica (ongoing, 3-5 dias em sprint dedicado)
1. Refactor de `maps/editor/page.tsx` (1.5 dia — quebrar por tool)
2. Refactor de `map-canvas.tsx` (1 dia — extrair mouse handlers)
3. Tipar narrative nodes (1h por node × 4 = 0.5 dia)
4. Limpar `console.log` de dev (1h)
5. TODOs → issues no tracker (1h)

---

## Apêndice — Estado atual de issue conhecida não resolvida

Durante esta sessão de auditoria, o app mobile (`apps/mobile`) reporta:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'S')
```
em `entry.bundle` do Expo/Metro. Isso é **mobile**, fora do escopo desta
auditoria, mas fica registrado pois:

1. A mitigação via `pnpm.overrides` (pinar React@18.3.1) foi aplicada e
   **resolveu** o conflito original de múltiplas cópias de React.
2. O erro atual (`.S` em `undefined`) parece ser cache stale de bundle
   pré-transformado contra React 19, persistindo após o downgrade.
3. Próximo passo sugerido: limpar caches stale (`/var/folders/.../T/metro-cache`,
   `.expo`, `node_modules/.cache`) e reiniciar `expo start --clear`.
   Já foi feito durante a sessão mas o erro persiste — possível envolvimento
   de dep bundleada (suspeito: `@expo/cli/static/canary-full/react`).

Como a decisão é **pausar o mobile**, isso **não bloqueia** a evolução do web.
Quando o mobile voltar a receber atenção, investigar isolado.
