# QuestBoard — Sistema de Ataque e Dano

> Implementação do fluxo completo: clica espada → seleciona alvo(s) → rola ataque → rola dano → aplica HP.
> Servidor é authoritative. Animação 3D cobre latência. Modo manual e digital coexistem.
> **Tudo em pt-BR.** Stack respeitando `CLAUDE.md`.

---

## 0. Decisões já tomadas (não revisitar)

| Decisão | Escolha | Observação |
|---|---|---|
| Fluxo | Ataque → Dano (d20 clássico) | 5e como ouro padrão; T20 e Ordem usam mesmo motor |
| Input | Manual + Digital | Toggle por **rolagem inteira**, não por dado |
| Alvos | Multi-alvos no MVP | **Sem teste de resistência por alvo no MVP** (corte tático) |
| Animação | 3D | `@3d-dice/dice-box` (canvas separado sobre Pixi) |
| Sistema | 5e default; T20/Ordem reutilizam motor | Cthulhu = FREEFORM (não usa esse fluxo) |

### Cortes táticos do MVP (escopo controlado)

- **Sem teste de resistência multi-alvo** (Reflexos pra metade, etc). Multi-alvo no MVP = GM aplica dano cheio em todos os selecionados. Resistência fica pra fase 2.
- **Sem resistência/imunidade/vulnerabilidade por tipo** de dano. Dano é dano. Tipos (fogo, gelo, etc) são apenas **metadata visual**.
- **Sem ataques de oportunidade automáticos.** Se GM quer, dispara manualmente.
- **Sem condições aplicadas no dano** (envenenado, atordoado). Só HP.
- **Vantagem/desvantagem (5e)** entra no MVP. **Crítico expandido (T20)** entra. **Exposição (Ordem)** fica pra fase 2.

---

## 1. LEIA antes de qualquer edição

1. `CLAUDE.md` — regras de ouro 3 (servidor authoritative), 4 (dados no servidor), 5 (Zod compartilhado), 7 (socket handlers), 8 (permissões).
2. `apps/api/src/modules/combat/` — lógica de combate atual (turnos, HP).
3. `apps/api/src/modules/chat/` — broadcast de mensagens (vamos integrar resultados ao chat).
4. `packages/engine/` — funções puras (sem IO).
5. `packages/validators/` — schemas Zod (não duplicar).
6. `packages/socket/` — eventos tipados (vamos adicionar).
7. `apps/web/app/(dashboard)/gameplay/[id]/_components/` — UI do gameplay.

---

## 2. Modelo conceitual

```
Atacante (Token)
    │
    ├─ clica ícone "Atacar" no radial
    ├─ entra em "modo seleção de alvo" (cursor crosshair)
    ├─ clica 1+ tokens alvo (até MAX_TARGETS_PER_ATTACK)
    │
    ▼
[Modal de Ataque]
    │
    ├─ Ataque selecionado: "Espada Longa" (do inventário/ficha) OU "Ataque livre"
    ├─ Modificadores: vantagem / desvantagem / nenhum
    ├─ Modo: 🎲 Digital | ✍️ Manual
    │
    ▼
Servidor processa:
    - Para cada alvo:
      - Rola 1d20 (ou 2d20 keep highest/lowest)
      - Compara com CA do alvo (ou "GM decide acerto" se modo livre)
      - Se acerta: rola dano (XdY+Z, dobra dados se crítico natural 20)
      - Aplica dano no HP via combat:apply-damage
    │
    ▼
Broadcast resultado:
    - Animação 3D dispara em todos os clientes simultaneamente
    - Resultado aparece no chat com card visual
    - HP do alvo atualiza ao terminar animação
```

---

## 3. Modelo de dados

### 3.1 Schema Prisma

```prisma
// ============================================
// ATTACK / DAMAGE
// ============================================

enum DiceRollMode {
  DIGITAL   // servidor rolou, animação tocou
  MANUAL    // jogador digitou resultado (badge "manual" no histórico)
}

enum AttackAdvantage {
  NORMAL
  ADVANTAGE       // 2d20 keep highest (5e)
  DISADVANTAGE    // 2d20 keep lowest (5e)
}

enum DamageType {
  BLUDGEONING SLASHING PIERCING
  FIRE COLD LIGHTNING THUNDER ACID POISON
  PSYCHIC NECROTIC RADIANT FORCE
  TRUE  // dano puro, sem tipo
}

model Attack {
  id              String           @id @default(cuid())
  sessionId       String
  attackerTokenId String
  attackerUserId  String           // quem disparou (PLAYER ou GM)
  attackName      String           // "Espada Longa", "Ataque Livre", "Bola de Fogo"

  // Configuração
  attackBonus     Int              @default(0)     // +X no d20
  damageNotation  String           // "1d8+3" — fonte de verdade
  damageType      DamageType       @default(TRUE)
  advantage       AttackAdvantage  @default(NORMAL)
  critRangeMin    Int              @default(20)    // 19 pra T20 com arma de crit expandido

  mode            DiceRollMode     @default(DIGITAL)

  createdAt       DateTime         @default(now())

  // Relations
  results         AttackResult[]   // 1 por alvo
  session         Session          @relation(fields: [sessionId], references: [id])

  @@index([sessionId, createdAt])
}

model AttackResult {
  id              String      @id @default(cuid())
  attackId        String
  targetTokenId   String
  targetAc        Int?        // CA do alvo no momento do ataque (snapshot)

  // Rolagem do d20
  d20Rolls        Int[]       // [15] normal, [12, 18] advantage
  d20Final        Int         // valor usado (após advantage/disadvantage)
  totalAttack     Int         // d20Final + attackBonus
  isCrit          Boolean     @default(false)
  isFumble        Boolean     @default(false)     // 1 natural

  hit             Boolean     // true se acertou (totalAttack >= targetAc) OU GM definiu hit manual

  // Rolagem de dano (null se errou)
  damageRolls     Int[]?      // [3, 5] = 2d6
  damageBonus     Int?        // +3 fixo
  damageTotal     Int?        // soma + bonus, **dobrado se crítico nas dados (não no bônus)**

  appliedAt       DateTime?   // null se ainda não foi aplicado ao HP
  appliedDamage   Int?        // pode ser diferente de damageTotal se GM editou antes de aplicar

  attack          Attack      @relation(fields: [attackId], references: [id], onDelete: Cascade)

  @@index([attackId])
}
```

### 3.2 Constants (`packages/constants/src/combat.ts`)

```typescript
export const MAX_TARGETS_PER_ATTACK = 8;        // bola de fogo cabe
export const ATTACK_DICE_MAX = 20;              // 20d6 max numa rolagem (anti-abuso)
export const ATTACK_BONUS_RANGE = { min: -10, max: 30 } as const;
export const DEFAULT_AC = 10;                   // se token sem CA definida
export const DAMAGE_NOTATION_REGEX = /^(\d{1,2})d(4|6|8|10|12|20|100)([+-]\d{1,3})?$/;
export const COMPLEX_NOTATION_REGEX = /^(\d{1,2}d(4|6|8|10|12|20|100)([+-]\d{1,3})?)(\s*\+\s*\d{1,2}d(4|6|8|10|12|20|100)([+-]\d{1,3})?)*$/;
// Suporta "2d6+3" e "2d6+1d4+3"

export const DICE_PHYSICS_DURATION_MS = 2200;   // tempo total de animação 3D
export const DICE_FREEZE_BEFORE_RESULT_MS = 200; // tempo extra antes de revelar
```

---

## 4. Backend (`apps/api/src/modules/combat/`)

### 4.1 Validators (`packages/validators/src/combat.ts`)

```typescript
import { z } from "zod";

const damageNotationSchema = z.string().regex(COMPLEX_NOTATION_REGEX, {
  message: "Notação inválida. Use formato como 1d8+3 ou 2d6+1d4.",
});

export const attackInputSchema = z.object({
  attackerTokenId: z.string().cuid(),
  targetTokenIds: z.array(z.string().cuid()).min(1).max(MAX_TARGETS_PER_ATTACK),
  attackName: z.string().min(1).max(60),
  attackBonus: z.number().int().min(-10).max(30),
  damageNotation: damageNotationSchema,
  damageType: z.enum([...]).default("TRUE"),
  advantage: z.enum(["NORMAL", "ADVANTAGE", "DISADVANTAGE"]).default("NORMAL"),
  critRangeMin: z.number().int().min(15).max(20).default(20),
  mode: z.enum(["DIGITAL", "MANUAL"]).default("DIGITAL"),

  // Apenas se mode=MANUAL — uma entrada por alvo
  manualResults: z.array(z.object({
    targetTokenId: z.string().cuid(),
    d20Final: z.number().int().min(1).max(20).optional(),
    hit: z.boolean(),
    damageTotal: z.number().int().min(0).max(999).optional(),
  })).optional(),
}).refine(
  (data) => data.mode !== "MANUAL" || (data.manualResults && data.manualResults.length === data.targetTokenIds.length),
  { message: "Modo manual exige resultado para cada alvo.", path: ["manualResults"] }
);

export type AttackInput = z.infer<typeof attackInputSchema>;
```

### 4.2 Engine puro (`packages/engine/src/dice.ts`)

Funções **puras**, sem IO. Servidor usa, testes usam diretamente.

```typescript
import { DAMAGE_NOTATION_REGEX } from "@questboard/constants";

export interface ParsedNotation {
  groups: Array<{ count: number; sides: number; modifier: number }>;
}

export function parseNotation(notation: string): ParsedNotation {
  // "2d6+1d4+3" → { groups: [{count:2, sides:6, modifier:0}, {count:1, sides:4, modifier:3}] }
  // Implementação: split por "+", tentar match em cada parte
  // Se algum grupo não bate, throw
}

export function rollDice(
  count: number,
  sides: number,
  random: () => number,    // injeta crypto.randomInt no servidor; Math.random só pra teste
): number[] {
  return Array.from({ length: count }, () => Math.floor(random() * sides) + 1);
}

export function rollNotation(notation: string, random: () => number): {
  rolls: number[];
  modifier: number;
  total: number;
} {
  const parsed = parseNotation(notation);
  const allRolls: number[] = [];
  let totalMod = 0;

  for (const group of parsed.groups) {
    const rolls = rollDice(group.count, group.sides, random);
    allRolls.push(...rolls);
    totalMod += group.modifier;
  }

  return {
    rolls: allRolls,
    modifier: totalMod,
    total: allRolls.reduce((a, b) => a + b, 0) + totalMod,
  };
}

export function rollD20WithAdvantage(
  advantage: "NORMAL" | "ADVANTAGE" | "DISADVANTAGE",
  random: () => number,
): { rolls: number[]; final: number } {
  if (advantage === "NORMAL") {
    const r = Math.floor(random() * 20) + 1;
    return { rolls: [r], final: r };
  }
  const a = Math.floor(random() * 20) + 1;
  const b = Math.floor(random() * 20) + 1;
  const final = advantage === "ADVANTAGE" ? Math.max(a, b) : Math.min(a, b);
  return { rolls: [a, b], final };
}

export function calculateDamageWithCrit(
  notation: string,
  isCrit: boolean,
  random: () => number,
): { rolls: number[]; modifier: number; total: number } {
  if (!isCrit) return rollNotation(notation, random);

  // Crítico: dobra apenas a quantidade de dados, não o modificador
  // 2d6+3 crit → 4d6+3
  const parsed = parseNotation(notation);
  const allRolls: number[] = [];
  let totalMod = 0;

  for (const group of parsed.groups) {
    const rolls = rollDice(group.count * 2, group.sides, random);
    allRolls.push(...rolls);
    totalMod += group.modifier;
  }

  return { rolls: allRolls, modifier: totalMod, total: allRolls.reduce((a, b) => a + b, 0) + totalMod };
}
```

**Por que injetar `random`:** testes determinísticos (passa `() => 0.5` → sempre rola 11 num d20).

### 4.3 Service (`apps/api/src/modules/combat/attack.service.ts`)

```typescript
import { randomInt } from "node:crypto";

const cryptoRandom = () => randomInt(0, 1_000_000) / 1_000_000;

export class AttackService {
  async executeAttack(input: AttackInput, actorUserId: string): Promise<AttackWithResults> {
    // 1. Permissões
    await this.validatePermissions(input.attackerTokenId, actorUserId);

    // 2. Lock de combate (regra de ouro do CLAUDE.md)
    const lock = await redis.set(`combat:lock:${input.sessionId}`, "1", "NX", "EX", 5);
    if (!lock) throw new BusinessError("COMBAT_LOCKED", "Outra rolagem em andamento. Aguarde.");

    try {
      // 3. Buscar tokens (atacante + alvos) com CA
      const tokens = await this.tokenRepo.findManyById([input.attackerTokenId, ...input.targetTokenIds]);
      const attacker = tokens.find(t => t.id === input.attackerTokenId);
      const targets = input.targetTokenIds.map(id => tokens.find(t => t.id === id)!);

      // 4. Criar Attack e processar cada alvo
      const attack = await prisma.$transaction(async (tx) => {
        const att = await tx.attack.create({ data: {...input, attackerUserId: actorUserId, sessionId: ...} });

        const results: AttackResult[] = [];
        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];
          const result = input.mode === "DIGITAL"
            ? await this.rollDigital(att, target, input)
            : await this.processManual(att, target, input.manualResults![i]);
          results.push(result);
        }

        return { ...att, results };
      });

      // 5. Broadcast (com diceConfig pra animação)
      this.io.to(`session:${input.sessionId}`).emit("attack:rolled", {
        attack,
        diceConfig: this.buildDiceConfig(attack),  // pra animação 3D
      });

      // 6. Aplicar dano nos HPs (servidor authoritative — emite combat:hp-changed)
      // **IMPORTANTE:** delay esse passo no client end (espera animação acabar pra atualizar HP visualmente)
      // Server emite imediatamente; client decide quando aplicar visualmente.
      for (const result of attack.results) {
        if (result.hit && result.damageTotal) {
          await this.combatService.applyDamage({
            tokenId: result.targetTokenId,
            damage: result.damageTotal,
            sessionId: input.sessionId,
            sourceAttackId: attack.id,
          });
        }
      }

      return attack;
    } finally {
      await redis.del(`combat:lock:${input.sessionId}`);
    }
  }

  private async rollDigital(att: Attack, target: Token, input: AttackInput): Promise<AttackResult> {
    // d20 com advantage
    const d20 = rollD20WithAdvantage(input.advantage, cryptoRandom);
    const totalAttack = d20.final + input.attackBonus;
    const isCrit = d20.final >= input.critRangeMin;
    const isFumble = d20.final === 1;

    const targetAc = target.armorClass ?? DEFAULT_AC;
    const hit = !isFumble && (isCrit || totalAttack >= targetAc);

    let damageRolls: number[] = [];
    let damageTotal = 0;
    let damageBonus = 0;

    if (hit) {
      const dmg = calculateDamageWithCrit(input.damageNotation, isCrit, cryptoRandom);
      damageRolls = dmg.rolls;
      damageBonus = dmg.modifier;
      damageTotal = dmg.total;
    }

    return prisma.attackResult.create({ data: {
      attackId: att.id,
      targetTokenId: target.id,
      targetAc,
      d20Rolls: d20.rolls,
      d20Final: d20.final,
      totalAttack,
      isCrit,
      isFumble,
      hit,
      damageRolls: hit ? damageRolls : null,
      damageBonus: hit ? damageBonus : null,
      damageTotal: hit ? damageTotal : null,
    }});
  }

  private async processManual(att: Attack, target: Token, manual: ManualResultInput): Promise<AttackResult> {
    // Modo manual: confiar no que o jogador digitou.
    // Marcar mode=MANUAL no histórico (visível no chat e na ficha do GM).
    return prisma.attackResult.create({ data: {
      attackId: att.id,
      targetTokenId: target.id,
      targetAc: target.armorClass ?? DEFAULT_AC,
      d20Rolls: manual.d20Final ? [manual.d20Final] : [],
      d20Final: manual.d20Final ?? 0,
      totalAttack: (manual.d20Final ?? 0) + att.attackBonus,
      isCrit: manual.d20Final === 20,
      isFumble: manual.d20Final === 1,
      hit: manual.hit,
      damageTotal: manual.damageTotal ?? null,
      damageRolls: [],     // não temos dados individuais no manual
      damageBonus: 0,
    }});
  }

  private buildDiceConfig(attack: AttackWithResults): DiceConfig {
    // Configuração pra animação 3D no client.
    // Se DIGITAL: client roda animação com os valores predefinidos
    // Se MANUAL: animação não toca (badge "manual" aparece direto)
    if (attack.mode === "MANUAL") return { skip: true };

    return {
      results: attack.results.map(r => ({
        targetId: r.targetTokenId,
        d20Rolls: r.d20Rolls,
        damageRolls: r.damageRolls ?? [],
        sides: this.extractSidesFromNotation(attack.damageNotation),
      })),
    };
  }
}
```

### 4.4 Eventos socket

Adicionar em `packages/socket/src/events.ts`:

```typescript
// Cliente → servidor
"attack:execute": { input: AttackInput }
"attack:cancel-pending": { attackId: string }   // se ataque ficou orfão

// Servidor → cliente
"attack:rolled": {
  attack: AttackWithResults;
  diceConfig: DiceConfig;
}
"attack:applied": {
  attackId: string;
  results: { targetId: string; finalHp: number }[];
}
```

### 4.5 Permissões

| Ação | GM | CO_GM | PLAYER (dono do atacante) | PLAYER (outro) |
|---|:-:|:-:|:-:|:-:|
| Atacar com token próprio | ✓ | ✓ | ✓ | ✗ |
| Atacar com token alheio | ✓ | ✓ | ✗ | ✗ |
| Modo MANUAL | ✓ | ✓ | ✓** | ✗ |
| Editar dano antes de aplicar | ✓ | ✓ | ✗ | ✗ |
| Atacar com NPC | ✓ | ✓ | ✗ | ✗ |

** PLAYER pode usar modo MANUAL **a menos que** a campanha tenha configuração `enforceDigitalRolls: true`. Validar no service.

---

## 5. Frontend (`apps/web`)

### 5.1 Arquitetura de componentes

```
apps/web/app/(dashboard)/gameplay/[id]/_components/
├── combat/
│   ├── AttackFlow.tsx                    // controlador do flow
│   ├── TargetSelectionOverlay.tsx        // overlay no Pixi pra selecionar alvos
│   ├── AttackModal.tsx                   // modal principal (config do ataque)
│   ├── AttackModeToggle.tsx              // 🎲 Digital | ✍️ Manual
│   ├── ManualInputPanel.tsx              // formulário modo manual
│   ├── DigitalConfigPanel.tsx            // config rápida modo digital
│   ├── DiceCanvas.tsx                    // wrapper do dice-box (canvas overlay)
│   ├── AttackResultCard.tsx              // card no chat com resultado
│   └── HitMissBadge.tsx                  // visual de acerto/erro/crítico
├── radial/
│   └── TokenRadialMenu.tsx               // já existe — adiciona handler do botão atacar
└── chat/
    └── messages/
        └── AttackMessage.tsx             // renderização do AttackResultCard no chat
```

### 5.2 Fluxo de UX (mobile-first 390px)

**Estado 1 — Idle:** token selecionado, radial visível.

**Estado 2 — Modo seleção de alvo:** ao clicar espada no radial:
- Cursor vira crosshair
- Tokens válidos (CA definida ou NPC) ficam com glow vermelho ao hover
- Bottom sheet: "Selecione até 8 alvos" + botão **Confirmar** (disabled até ≥1 alvo) + **Cancelar**
- Tap em token = adiciona/remove dos selecionados (badge numerado)

**Estado 3 — Modal de ataque** (ao confirmar seleção):

```
┌─ Atacar [N alvos] ───────────────────┐
│ [🎲 Digital] [✍️ Manual]              │  ← toggle topo
│                                      │
│ Tipo de ataque                       │
│ [Espada Longa ▼]                     │  ← combo: ataques da ficha + "Personalizado"
│                                      │
│ Dano                                 │
│ Notação: [ 1d8+3        ]            │
│ Tipo: [Cortante ▼]                   │
│                                      │
│ Bônus de ataque: [ +5 ]               │
│ Vantagem: [Normal ▼]                  │
│                                      │
│ Crítico em: [20+ ▼]                   │  ← T20 pode escolher 19+
│                                      │
│ ─────────────────────────────────── │
│                                      │
│ [Cancelar]            [Rolar Ataque] │
└──────────────────────────────────────┘
```

**Modo Manual:** ao alternar pra ✍️, o modal substitui campos por:

```
┌─ Atacar [3 alvos] · Manual ──────────┐
│                                      │
│ Goblin 1                             │
│ d20 natural: [ 15 ]                  │
│ ☑ Acertou   ☐ Errou                  │
│ Dano: [ 7 ]                          │
│                                      │
│ Goblin 2                             │
│ d20 natural: [ 4 ]                   │
│ ☐ Acertou   ☑ Errou                  │
│                                      │
│ Goblin 3                             │
│ d20 natural: [ 20 ]  ⭐ Crítico       │
│ ☑ Acertou   ☐ Errou                  │
│ Dano: [ 14 ]                         │
│                                      │
│ ⚠️ Resultados manuais ficam marcados  │
│ no histórico.                        │
│                                      │
│ [Cancelar]            [Aplicar]      │
└──────────────────────────────────────┘
```

**Estado 4 — Animação:** ao confirmar (modo digital):
- Modal fecha
- DiceCanvas overlay aparece (canvas separado, posição fixa centralizado)
- Dados 3D rolam por ~2.2s (tempo determinado pelo backend antes de aplicar HP)
- Som de dado caindo (toca `dice-roll.mp3` se áudio habilitado)
- Resultado vai aparecendo: cada dado pousa, mostra valor

**Estado 5 — Resultado no chat:**
- AttackResultCard aparece no chat com:
  - Nome do atacante + alvo(s)
  - Por alvo: ícone de hit/miss/crit/fumble + número do d20 + total + dano
  - Badge "Manual" se mode=MANUAL
  - Tooltip com detalhamento (rolls individuais)

**Estado 6 — Aplicação:**
- HP do alvo "drena" visualmente (animação de barra de HP descendo)
- Floating damage number sobe do token (`-7` em vermelho)
- Token treme se sofreu crítico (`playCritShakeAnimation`)

### 5.3 Integração com `@3d-dice/dice-box`

```bash
pnpm add @3d-dice/dice-box --filter @questboard/web
```

```tsx
// apps/web/app/(dashboard)/gameplay/[id]/_components/combat/DiceCanvas.tsx
"use client";
import { useEffect, useRef } from "react";
import DiceBox from "@3d-dice/dice-box";

interface Props {
  config: DiceConfig | null;
  onAnimationComplete: () => void;
}

export function DiceCanvas({ config, onAnimationComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diceBoxRef = useRef<DiceBox | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const diceBox = new DiceBox("#dice-box-container", {
      assetPath: "/dice/",            // copiar assets do package em postinstall
      theme: "default",
      themeColor: "#2dd4bf",          // teal do design system
      offscreen: true,
      scale: 6,
      gravity: 1,
      mass: 1,
      friction: 0.8,
    });

    diceBox.init().then(() => {
      diceBoxRef.current = diceBox;
    });

    return () => {
      diceBox.clear();
      // dice-box não tem destroy oficial — guardar ref pra evitar leak
    };
  }, []);

  useEffect(() => {
    if (!config || !diceBoxRef.current) return;

    const notation = buildDiceBoxNotation(config);
    const predefinedResults = config.results.flatMap(r => [...r.d20Rolls, ...r.damageRolls]);

    diceBoxRef.current
      .roll(notation, { results: predefinedResults })  // dice-box suporta predefined results
      .then(() => {
        setTimeout(onAnimationComplete, DICE_FREEZE_BEFORE_RESULT_MS);
      });
  }, [config]);

  return (
    <div
      ref={containerRef}
      id="dice-box-container"
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden
    />
  );
}
```

> **Detalhe crítico:** `@3d-dice/dice-box` aceita resultados pré-definidos como segundo argumento. **Servidor envia os números, animação só visualiza eles.** Isso resolve o problema de servidor authoritative + animação local sem fake.

### 5.4 Trade-offs do dice-box

- **Tamanho:** ~400KB gzipped (Three.js + Cannon-es). Lazy import no chunk de combate.
- **Mobile:** roda OK em iPhone 12+. iPhone 8 e Android low-end vão sofrer. Toggle nas settings: "Desativar animação 3D" → fallback 2D.
- **WebGL contexto:** dice-box usa canvas próprio; coexiste com Pixi sem conflito (canvases separados, z-index distinto).
- **Acessibilidade:** sempre exibir resultado no chat **mesmo durante animação** (em modo somente-leitura) pra screen reader.

### 5.5 Fallback 2D (acessibilidade + low-end)

Se setting `disable3DDice = true` ou prefer-reduced-motion detectado:
- Sem dice-box. Modal mostra spinner 2D simples (1s) e revela número.
- Mais leve, igualmente authoritative.
- Mesmo evento `attack:rolled`, mesmo resultado, só sem fancy animation.

### 5.6 Permissões na UI

- PLAYER vê toggle Digital/Manual **só se** `campaign.enforceDigitalRolls === false`. Senão, modo digital trancado.
- PLAYER não vê botão "Editar dano antes de aplicar". GM/CO_GM veem.
- SPECTATOR não vê radial de combate. Só observa rolagens no chat.

---

## 6. Resultado no chat

### 6.1 Card visual

```
┌────────────────────────────────────────────┐
│ ⚔️  Lucas atacou Goblin 1, Goblin 2          │
│     com Espada Longa                         │
│ ──────────────────────────────────────────  │
│ Goblin 1   🎯 18 (15+3) vs CA 13 ✅ ACERTO  │
│            🩸 7 dano (1d8+3 = 4+3)          │
│            HP: 10 → 3                        │
│ ──────────────────────────────────────────  │
│ Goblin 2   🎯 4 (1+3) vs CA 13 ❌ FUMBLE     │
│            (sem dano)                        │
│ ──────────────────────────────────────────  │
│ [Manual] [Detalhes]              5min atrás │
└────────────────────────────────────────────┘
```

### 6.2 Estados visuais

- **Acerto normal:** ✅ verde
- **Acerto crítico:** ⭐ dourado + glow
- **Erro normal:** ❌ cinza
- **Fumble (1 natural):** 💀 vermelho escuro
- **Imune/Resistente:** *(não no MVP)*

---

## 7. Sons

Reaproveitar painel de áudio existente (do print que você mostrou):

- `dice-roll.mp3` ao iniciar animação 3D
- `dice-land.mp3` ao terminar
- `hit.mp3` por alvo acertado
- `miss.mp3` por alvo errado
- `crit.mp3` em crítico (sobrepõe hit)
- `fumble.mp3` em fumble
- `damage-applied.mp3` ao HP atualizar

Tudo respeitando volume mestre/efeitos do painel.

---

## 8. Testes

### 8.1 Unitários (engine puro — `packages/engine/__tests__/`)

```typescript
describe("rollD20WithAdvantage", () => {
  it("ADVANTAGE retorna o maior", () => {
    let i = 0;
    const seq = [0.05, 0.95];  // → [2, 20]
    const r = rollD20WithAdvantage("ADVANTAGE", () => seq[i++]);
    expect(r.final).toBe(20);
    expect(r.rolls).toEqual([2, 20]);
  });
  it("DISADVANTAGE retorna o menor", () => { ... });
});

describe("calculateDamageWithCrit", () => {
  it("crítico dobra dados mas não modificador", () => {
    // 2d6+3 com crit deve rolar 4d6+3
    const r = calculateDamageWithCrit("2d6+3", true, () => 0.5);
    expect(r.rolls.length).toBe(4);
    expect(r.modifier).toBe(3);
  });
});

describe("parseNotation", () => {
  it.each([
    ["1d8+3", { groups: [{ count: 1, sides: 8, modifier: 3 }] }],
    ["2d6+1d4+2", { groups: [{ count: 2, sides: 6, modifier: 0 }, { count: 1, sides: 4, modifier: 2 }] }],
    ["20d6", { groups: [{ count: 20, sides: 6, modifier: 0 }] }],
  ])("parse %s", (input, expected) => {
    expect(parseNotation(input)).toEqual(expected);
  });

  it.each(["", "abc", "21d6", "1d7", "1d6+", "1d6++3"])("rejeita %s", (input) => {
    expect(() => parseNotation(input)).toThrow();
  });
});
```

### 8.2 Integração (rotas/sockets)

- Atacante PLAYER usa próprio token: 200
- Atacante PLAYER usa token alheio: 403
- Modo MANUAL com `enforceDigitalRolls=true`: 403
- Multi-alvo com 9 alvos: 400 (max 8)
- Notação inválida `1d7`: 400
- Concurrent attack (lock): segundo recebe `COMBAT_LOCKED`

### 8.3 E2E (smoke)

- GM clica espada → seleciona 1 alvo → confirma → animação roda → HP atualiza
- PLAYER faz attack manual com `enforceDigitalRolls=true` → bloqueado

---

## 9. Critérios de aceitação

### Backend
- [ ] `pnpm test packages/engine` verde com 100% de cobertura em `dice.ts`.
- [ ] Atacar 3 alvos em sequência produz 3 `AttackResult` corretos.
- [ ] Crítico em multi-alvo aplica dobro de dados só nos alvos críticos.
- [ ] Lock Redis funciona — 2 ataques simultâneos não corrompem HP.
- [ ] Modo MANUAL salva `mode=MANUAL` e badge aparece no resultado.
- [ ] `enforceDigitalRolls=true` bloqueia PLAYER no modo manual com erro pt-BR.
- [ ] Validação Zod com mensagens em pt-BR.

### Frontend
- [ ] Fluxo completo funciona em 390px sem scroll horizontal.
- [ ] Animação 3D toca em ~2.2s e revela resultado correto.
- [ ] Modo manual permite digitar resultado e aplica sem animação.
- [ ] Multi-alvo com 4 alvos: animação roda 1x, resultados aparecem em sequência.
- [ ] Setting "Desativar animação 3D" usa fallback 2D.
- [ ] HP do alvo só atualiza visualmente após animação terminar.
- [ ] Badge "Manual" aparece no chat quando aplicável.
- [ ] Acessibilidade: prefers-reduced-motion → fallback 2D automático.

### Performance
- [ ] DiceCanvas lazy-loaded — bundle inicial não cresce > 50KB.
- [ ] Animação 60fps em iPhone 12 / Pixel 6.
- [ ] iPhone SE (2020): toggle 2D → tudo fluido.

---

## 10. Fora do escopo (fase 2)

- Teste de resistência por alvo (Reflexos pra metade)
- Resistência/imunidade/vulnerabilidade por tipo de dano
- Condições aplicadas (envenenado, atordoado)
- Concentração (perde se sofre dano + Constituição)
- Cura (`damageNotation` com valor negativo? ou flow separado?)
- Exposição de Ordem Paranormal (mecânica específica)
- Sanidade (Cthulhu)
- Macros (jogador salva ataque pré-configurado)
- Histórico de ataques na ficha (tab "histórico")
- Replay de animação a partir do chat ("rever esse ataque")

---

## 11. Ordem de implementação sugerida

1. **`packages/engine/src/dice.ts`** com testes unitários — fundação pura.
2. **Migration Prisma** + validators Zod compartilhados.
3. **`AttackService` backend** com mode DIGITAL (sem manual ainda) + permissões.
4. **Eventos socket** e integração com `combat.service`.
5. **Modal `AttackFlow` frontend** modo digital, sem animação 3D ainda (resultado direto no chat).
6. **`AttackResultCard` no chat** com visuais de hit/miss/crit.
7. **`DiceCanvas`** com `@3d-dice/dice-box`. Animação cobre delay.
8. **Modo MANUAL** backend + frontend.
9. **Multi-alvo** UI (target selection overlay no Pixi).
10. **Sons + fallback 2D** + setting de acessibilidade.
11. **Testes integração + E2E smoke** + ajustes finais.

Cada passo: TS limpo, commit em pt-BR, regressão dos anteriores não quebra.

---

## 12. Pendências para o Lucas decidir antes de começar

1. **Cura entra na fase 2 ou no MVP?**
   *Sugiro fase 2 — mesmo flow, mas inverte sinal e tem mecânicas diferentes.*

2. **Botão "Atacar Livre" (sem ficha) ou só ataques pré-configurados?**
   *Sugiro ambos no MVP. Personagem novo sem ficha precisa atacar.*

3. **NPC pode ser dono de um ataque?** (ex: pré-configurar ataque do Goblin na ficha do NPC)
   *Sim, faz sentido. Reaproveita o mesmo modelo `Character` (NPCs são `Character` com flag).*

4. **Tipos de dano são apenas metadata ou já preparar pra resistência?**
   *Sugiro preparar enum agora (`DamageType`) mas usar só pra ícone/cor no MVP. Resistência fica fácil de plugar depois.*

5. **Setting `enforceDigitalRolls` por campanha ou por sessão?**
   *Sugiro campanha — coerência da mesa. Sessão herda.*