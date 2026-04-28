# QuestBoard — Sistema de Regras: Horror Investigativo (d100)

> Implementação do motor de regras inspirado em Call of Cthulhu (Chaosium) sem copiar conteúdo proprietário.
> Inclui: motor d100 genérico, ficha investigativa, **sistema de Sanidade automatizado**, bestiário do Mythos Lovecraftiano (domínio público).
> **Tudo em pt-BR.** Stack respeitando `CLAUDE.md`. Arquitetura plugável definida em `questboard-dnd5e-rules-prompt.md`.
>
> ⚠️ **Lê o prompt de D&D 5e antes deste.** A arquitetura plugável de RuleSystem foi estabelecida lá.
> Este prompt assume que `RuleSystem`, `Character.systemId`, schema sistema-aware **já existem**.

---

## 0. Avisos legais — leia primeiro

### 0.1 O que NÃO é este sistema

**Não é** uma reimplementação de "Call of Cthulhu" da Chaosium. Não usamos:
- Nome "Call of Cthulhu" no produto
- Texto descritivo do livro CoC
- Tabelas de skills idênticas ao CoC (similar não é igual)
- Cenários, módulos ou aventuras do CoC
- Ilustrações, fontes, ou layout do livro CoC

### 0.2 O que É legal usar

| Conteúdo | Status | Como usar |
|---|---|---|
| **Mythos Lovecraftiano** (Cthulhu, Dagon, Nyarlathotep, Shoggoth, etc) | Domínio público (Lovecraft, †1937) | Livre, sem atribuição obrigatória |
| **Mecânicas d100 genéricas** (rolar abaixo da skill, sucessos críticos/extremos) | Mecânicas não são copyrightáveis | Implementar com texto próprio |
| **Conceito de Sanidade** | Conceito genérico em horror | Implementar com texto próprio |
| **Termos como "Sorte", "Sanidade", "Investigador"** | Genéricos | Pode usar |
| **OpenQuest SRD** (CC-BY-SA, opção rejeitada) | CC-BY-SA | Não usado por escolha |

### 0.3 Posicionamento do produto

No QuestBoard, esse sistema chama:
- **Nome interno:** `cosmic-horror`
- **Nome exibido:** "Horror Investigativo (d100)"
- **Tagline:** "Para campanhas de investigação cósmica e mistério"
- **NÃO usar:** "Call of Cthulhu", "CoC", "Chaosium" em nenhum lugar do produto.

### 0.4 Atribuição visível

Em rodapé do compêndio cosmic-horror:
```
Sistema "Horror Investigativo" desenvolvido pelo QuestBoard.
Não afiliado a Chaosium Inc. ou Call of Cthulhu®.
Inspirado em obras de H.P. Lovecraft (1890–1937), em domínio público.
```

---

## 1. Decisões já tomadas (não revisitar)

| Decisão | Escolha |
|---|---|
| Abordagem | Motor d100 genérico inspirado em CoC; sem usar OpenQuest SRD |
| Sanidade | Central, automatizada, todo PJ tem SAN |
| Bestiário | ~40 entidades Mythos Lovecraftiano domínio público |
| Ficha | Completa: Sanidade, Sorte, Ocupação, perda de SAN automatizada |
| Loucura | 3 níveis (temporária + indefinida + permanente) |
| Variante Pulp | Não no MVP |
| Nome do sistema | "Horror Investigativo (d100)" — slug `cosmic-horror` |

### 1.1 Cortes táticos do MVP

- **Sem Pulp Cthulhu** (variante heroica)
- **Sem Mythos Magic** completa — apenas conceitos básicos (lançar feitiço custa SAN + MP)
- **Sem cenários históricos detalhados** (1890s vs 1920s vs Modern) — sistema é época-agnóstico
- **Sem regras de perseguição** (chase rules) automatizadas
- **Sem combate em massa** ou veículos
- **Sem regras de organizações secretas** ou backgrounds estendidos
- **~30 ocupações** no MVP (vs 60+ em livros expandidos)
- **~40 skills** no MVP (suficiente pra investigação clássica)
- **~40 entidades** Mythos no bestiário inicial

---

## 2. LEIA antes de qualquer edição

1. `CLAUDE.md` — regras de ouro.
2. `questboard-dnd5e-rules-prompt.md` — **OBRIGATÓRIO** — arquitetura RuleSystem plugável já está definida lá.
3. `questboard-attack-damage-prompt.md` — sistema de combate (vamos integrar).
4. `apps/api/prisma/schema.prisma` — entender Character e RuleSystem existentes.
5. **Conhecimento prévio recomendado** sobre Cthulhu/CoC: ler livremente Wikipedia em "Call of Cthulhu (role-playing game)" e "Basic Roleplaying" pra contexto, mas **não copiar texto**.
6. **Lovecraft em domínio público**: https://www.hplovecraft.com/writings/texts/ — consultar pra descrições do Mythos.

---

## 3. Conceitos centrais do motor d100

### 3.1 Atributos (8 — diferentes de D&D)

| Atributo | Sigla | Descrição em pt-BR | Range |
|---|---|---|---|
| Força | FOR | Capacidade muscular | 15-90 |
| Constituição | CON | Resistência física, saúde | 15-90 |
| Tamanho | TAM | Volume corporal, massa | 40-90 |
| Destreza | DES | Coordenação, agilidade | 15-90 |
| Aparência | APA | Atratividade física, presença | 15-90 |
| Inteligência | INT | Capacidade analítica, memória | 40-90 |
| Poder | POD | Força de vontade, espiritual | 15-90 |
| Educação | EDU | Conhecimento adquirido | 40-90 |

**Diferença fundamental do d20:** atributos vão de ~15 a 90 (não 3-20). São percentuais. Você rola **igual ou abaixo** do valor pra sucesso em testes diretos do atributo.

### 3.2 Características derivadas

```typescript
// packages/engine/src/systems/cosmic-horror/derived.ts

interface CosmicHorrorAttributes {
  for: number; con: number; tam: number; des: number;
  apa: number; int: number; pod: number; edu: number;
}

export function calculateDamageBonus(attrs: { for: number; tam: number }): string {
  // Tabela tradicional CoC mas com nomes próprios
  const sum = attrs.for + attrs.tam;
  if (sum <= 64)  return "-2";        // string porque pode ser "-1d4", "+1d6", etc
  if (sum <= 84)  return "-1";
  if (sum <= 124) return "+0";
  if (sum <= 164) return "+1d4";
  if (sum <= 204) return "+1d6";
  if (sum <= 284) return "+2d6";
  // continua...
}

export function calculateBuild(attrs: { for: number; tam: number }): number {
  const sum = attrs.for + attrs.tam;
  if (sum <= 64)  return -2;
  if (sum <= 84)  return -1;
  if (sum <= 124) return 0;
  if (sum <= 164) return 1;
  if (sum <= 204) return 2;
  if (sum <= 284) return 3;
}

export function calculateHitPoints(attrs: { con: number; tam: number }): number {
  return Math.floor((attrs.con + attrs.tam) / 10);
}

export function calculateMagicPoints(pod: number): number {
  return Math.floor(pod / 5);
}

export function calculateMaxSanity(pod: number): number {
  return pod;  // SAN máxima inicial = POD
}

export function calculateMoveRate(attrs: { for: number; des: number; tam: number; age: number }): number {
  const { for: forAttr, des, tam, age } = attrs;
  let mov: number;
  if (forAttr < tam && des < tam) mov = 7;
  else if (forAttr >= tam && des >= tam || forAttr === tam || des === tam) mov = 8;
  else mov = 9;

  // Penalidade por idade
  if (age >= 80) mov -= 5;
  else if (age >= 70) mov -= 4;
  else if (age >= 60) mov -= 3;
  else if (age >= 50) mov -= 2;
  else if (age >= 40) mov -= 1;

  return Math.max(mov, 1);
}

export function calculateLuck(): number {
  // Sorte é rolada na criação: 3d6 × 5 = 15 a 90
  // Função pura recebe seed pra teste
  // Em produção, server roda no character creation com crypto random
}
```

### 3.3 Sistema de testes (d100)

```typescript
// packages/engine/src/systems/cosmic-horror/skillCheck.ts

export type SkillCheckResult =
  | "EXTREME_SUCCESS"      // d100 ≤ skill/5
  | "HARD_SUCCESS"         // d100 ≤ skill/2
  | "REGULAR_SUCCESS"      // d100 ≤ skill
  | "FAILURE"              // d100 > skill
  | "FUMBLE";              // d100 = 96-100 (skill < 50) OU 100 (skill ≥ 50)

export function evaluateSkillCheck(roll: number, skillValue: number): SkillCheckResult {
  // Fumble
  if (skillValue < 50 && roll >= 96) return "FUMBLE";
  if (skillValue >= 50 && roll === 100) return "FUMBLE";

  if (roll > skillValue) return "FAILURE";

  if (roll <= Math.floor(skillValue / 5)) return "EXTREME_SUCCESS";
  if (roll <= Math.floor(skillValue / 2)) return "HARD_SUCCESS";
  return "REGULAR_SUCCESS";
}

// Dados bônus/penalidade — variante CoC: rola 2d10 das dezenas, escolhe melhor/pior
export function rollWithBonusDie(d100Result: number, bonusDieResult: number): number {
  // d100Result = ex: 73 (tens=70, units=3)
  // bonusDieResult = ex: 40 (tens alternativos)
  // Pega o menor das tens: min(70, 40) = 40 → resultado final = 43
  const units = d100Result % 10;
  const originalTens = Math.floor(d100Result / 10) * 10;
  const newTens = Math.min(originalTens, bonusDieResult);
  return newTens + units;
}

export function rollWithPenaltyDie(d100Result: number, penaltyDieResult: number): number {
  // Mesma lógica mas pega o MAIOR
  const units = d100Result % 10;
  const originalTens = Math.floor(d100Result / 10) * 10;
  const newTens = Math.max(originalTens, penaltyDieResult);
  return newTens + units;
}
```

### 3.4 Diferença chave: oposição entre testes

```typescript
// Sucessos comparam "nível" entre si: extreme > hard > regular > failure
const NIVEL_SUCESSO: Record<SkillCheckResult, number> = {
  FUMBLE: -1, FAILURE: 0, REGULAR_SUCCESS: 1, HARD_SUCCESS: 2, EXTREME_SUCCESS: 3,
};

export function resolveOpposed(
  rollA: number, skillA: number,
  rollB: number, skillB: number,
): "A_WINS" | "B_WINS" | "TIE" {
  const resultA = evaluateSkillCheck(rollA, skillA);
  const resultB = evaluateSkillCheck(rollB, skillB);

  const levelA = NIVEL_SUCESSO[resultA];
  const levelB = NIVEL_SUCESSO[resultB];

  if (levelA > levelB) return "A_WINS";
  if (levelB > levelA) return "B_WINS";
  // Empate: maior valor de skill ganha
  if (skillA > skillB) return "A_WINS";
  if (skillB > skillA) return "B_WINS";
  return "TIE";
}
```

---

## 4. Sistema de Sanidade

### 4.1 Conceitos

| Termo | Significado |
|---|---|
| **SAN** | Sanidade atual (0-99) |
| **SAN máxima** | Limite (POD inicial) |
| **Perda de SAN** | Notação tipo "1/1d6" (1 se passar no teste, 1d6 se falhar) |
| **Loucura temporária** | Perdeu 5+ SAN numa única exposição → some bouts of madness |
| **Loucura indefinida** | Perdeu 1/5 da SAN máxima em 24h → enlouquece por meses |
| **Loucura permanente** | SAN chegou a 0 → personagem perdido pra sempre |
| **Mythos Skill** | Quanto mais sabe sobre Mythos, **menor** SAN máxima possível |

### 4.2 Schema (no `Character.data` quando systemId = cosmic-horror)

```typescript
// packages/validators/src/characters/cosmic-horror.ts

export const cosmicHorrorCharacterSchema = z.object({
  // Identidade
  occupation: z.string(),                   // slug, ex: "detective", "professor"
  age: z.number().int().min(15).max(90),
  birthplace: z.string().optional(),
  residence: z.string().optional(),

  // Atributos (15-90)
  attributes: z.object({
    for: z.number().int().min(15).max(99),
    con: z.number().int().min(15).max(99),
    tam: z.number().int().min(40).max(99),
    des: z.number().int().min(15).max(99),
    apa: z.number().int().min(15).max(99),
    int: z.number().int().min(40).max(99),
    pod: z.number().int().min(15).max(99),
    edu: z.number().int().min(40).max(99),
  }),

  // Características derivadas (cache, recalculado)
  hpCurrent: z.number().int().min(0),
  hpMax: z.number().int().min(0),
  mpCurrent: z.number().int().min(0),
  mpMax: z.number().int().min(0),
  luck: z.number().int().min(0).max(99),

  // ⚠️ SANIDADE — central nesse sistema
  sanityCurrent: z.number().int().min(0).max(99),
  sanityMax: z.number().int().min(0).max(99),
  sanityStartingMax: z.number().int().min(0).max(99),  // POD inicial — referência
  mythosKnowledge: z.number().int().min(0).max(99).default(0),  // skill especial
  // sanityMax = 99 - mythosKnowledge

  // Estados de loucura
  madnessState: z.enum(["NONE", "TEMPORARY", "INDEFINITE", "PERMANENT"]).default("NONE"),
  madnessDescription: z.string().optional(),  // ex: "Fobia de água"
  madnessTriggeredAt: z.string().datetime().optional(),
  madnessExpiresAt: z.string().datetime().optional(),  // só em TEMPORARY
  bouts: z.array(z.object({                              // surtos individuais
    description: z.string(),
    triggeredAt: z.string().datetime(),
  })).default([]),
  sanityLossLast24h: z.number().int().min(0).default(0),  // pra detectar loucura indefinida

  // Skills (40 skills no MVP, todas em 0-99)
  skills: z.record(z.string(), z.object({
    value: z.number().int().min(0).max(99),
    halfValue: z.number().int().min(0).max(50),         // cache: floor(value/2)
    extremeValue: z.number().int().min(0).max(20),      // cache: floor(value/5)
    improved: z.boolean().default(false),                // marcou como "usada com sucesso" — improvement na próxima sessão
  })),
  // exemplo: { "spot-hidden": { value: 60, halfValue: 30, extremeValue: 12, improved: false } }

  // Damage bonus e build
  damageBonus: z.string(),  // "+1d4", "-1", etc.
  build: z.number().int(),
  moveRate: z.number().int(),

  // Inventário (simplificado vs D&D)
  cash: z.number().default(0),                            // dinheiro corrente
  cashLevel: z.enum(["DESTITUTE", "POOR", "AVERAGE", "WEALTHY", "RICH", "SUPER_RICH"]).default("AVERAGE"),
  weapons: z.array(z.object({
    name: z.string(),                                     // homebrew permitido
    skillSlug: z.string(),                                // skill usada (firearms-handgun, melee-axe)
    damage: z.string(),                                   // "1d8" ou "1d10+1"
    range: z.string().optional(),                         // "20m" pra firearms
    ammo: z.number().int().optional(),
    malfunction: z.number().int().min(0).max(100).optional(),  // ex: 99-100 = falha mecânica
    notes: z.string().optional(),
  })).default([]),
  belongings: z.array(z.string()).default([]),            // texto livre

  // Backstory (Cthulhu valoriza muito)
  personalDescription: z.string().optional(),
  ideologyBeliefs: z.string().optional(),
  significantPeople: z.string().optional(),
  meaningfulLocations: z.string().optional(),
  treasuredPossessions: z.string().optional(),
  traits: z.string().optional(),
  injuriesScars: z.string().optional(),
  phobiasManias: z.string().optional(),
  arcaneTomesSpells: z.string().optional(),               // tomos arcanos lidos
  encountersWithEntities: z.string().optional(),          // criaturas encontradas

  // Estado de jogo
  isInjured: z.boolean().default(false),                  // dano = HP/2 → ferido
  isDying: z.boolean().default(false),                    // HP <= 0
  isUnconscious: z.boolean().default(false),
});

export type CosmicHorrorCharacter = z.infer<typeof cosmicHorrorCharacterSchema>;
```

### 4.3 Skills no MVP (~40)

Lista canônica em `packages/constants/src/cosmic-horror.ts`:

```typescript
export const COSMIC_HORROR_SKILLS = [
  // Investigação
  { slug: "spot-hidden",     name: "Perceber",          baseValue: 25 },
  { slug: "listen",          name: "Escutar",           baseValue: 20 },
  { slug: "library-use",     name: "Pesquisa em Biblioteca", baseValue: 20 },
  { slug: "investigate",     name: "Investigar",        baseValue: 25 },
  { slug: "track",           name: "Rastrear",          baseValue: 10 },

  // Combate
  { slug: "fighting-brawl",  name: "Lutar (Briga)",     baseValue: 25 },
  { slug: "firearms-handgun", name: "Armas de Fogo (Pistola)", baseValue: 20 },
  { slug: "firearms-rifle",  name: "Armas de Fogo (Rifle)", baseValue: 25 },
  { slug: "dodge",           name: "Esquivar",          baseValue: "DES/2" },  // fórmula

  // Social
  { slug: "charm",           name: "Encantar",          baseValue: 15 },
  { slug: "fast-talk",       name: "Lábia",             baseValue: 5 },
  { slug: "intimidate",      name: "Intimidar",         baseValue: 15 },
  { slug: "persuade",        name: "Persuadir",         baseValue: 10 },
  { slug: "psychology",      name: "Psicologia",        baseValue: 10 },

  // Físico
  { slug: "climb",           name: "Escalar",           baseValue: 20 },
  { slug: "jump",            name: "Saltar",            baseValue: 20 },
  { slug: "swim",            name: "Nadar",             baseValue: 20 },
  { slug: "stealth",         name: "Furtividade",       baseValue: 20 },
  { slug: "drive-auto",      name: "Dirigir Automóvel", baseValue: 20 },
  { slug: "ride",            name: "Cavalgar",          baseValue: 5 },

  // Conhecimento (% começa baixo)
  { slug: "history",         name: "História",          baseValue: 5 },
  { slug: "natural-world",   name: "Mundo Natural",     baseValue: 10 },
  { slug: "occult",          name: "Ocultismo",         baseValue: 5 },
  { slug: "science-biology", name: "Ciência (Biologia)", baseValue: 1 },
  { slug: "science-chemistry", name: "Ciência (Química)", baseValue: 1 },
  { slug: "medicine",        name: "Medicina",          baseValue: 1 },
  { slug: "law",             name: "Direito",           baseValue: 5 },
  { slug: "anthropology",    name: "Antropologia",      baseValue: 1 },
  { slug: "archaeology",     name: "Arqueologia",       baseValue: 1 },

  // Técnicas
  { slug: "first-aid",       name: "Primeiros Socorros", baseValue: 30 },
  { slug: "lockpicking",     name: "Arrombamento",      baseValue: 1 },
  { slug: "mechanical-repair", name: "Reparo Mecânico", baseValue: 10 },
  { slug: "electrical-repair", name: "Reparo Elétrico", baseValue: 10 },
  { slug: "sleight-of-hand", name: "Prestidigitação",   baseValue: 10 },
  { slug: "disguise",        name: "Disfarce",          baseValue: 5 },
  { slug: "navigate",        name: "Navegação",         baseValue: 10 },

  // Especiais
  { slug: "credit-rating",   name: "Status Financeiro", baseValue: 0 },  // definido pela ocupação
  { slug: "language-own",    name: "Idioma Nativo",     baseValue: "EDU" },
  { slug: "language-other",  name: "Idioma (Outro)",    baseValue: 1 },

  // ⚠️ Especial: Mythos
  { slug: "cthulhu-mythos",  name: "Mythos Cósmico",    baseValue: 0, special: true },
  // sanityMax = 99 - cthulhu-mythos
] as const;
```

### 4.4 Engine de Sanidade

```typescript
// packages/engine/src/systems/cosmic-horror/sanity.ts

export interface SanityLossNotation {
  passLoss: number;        // ex: 1
  failLoss: string;        // ex: "1d6"
}

export function parseSanityLoss(notation: string): SanityLossNotation {
  // "1/1d6" → { passLoss: 1, failLoss: "1d6" }
  const [pass, fail] = notation.split("/");
  return { passLoss: parseInt(pass), failLoss: fail };
}

export interface SanityCheckResult {
  sanityRoll: number;
  sanityCurrent: number;
  passed: boolean;
  lossDealt: number;
  lossRolls?: number[];        // dados rolados se falhou
  triggers: SanityTrigger[];   // o que aconteceu
}

export type SanityTrigger =
  | { type: "BOUT_OF_MADNESS"; description: string }      // perdeu 5+ numa rolagem
  | { type: "INDEFINITE_INSANITY"; description: string }  // perdeu 1/5 SAN max em 24h
  | { type: "PERMANENT_INSANITY" }                        // SAN = 0
  | { type: "TEMP_INSANITY_RECOVERED" };

export function performSanityCheck(
  character: CosmicHorrorCharacter,
  loss: SanityLossNotation,
  random: () => number,
): SanityCheckResult {
  const sanityRoll = Math.floor(random() * 100) + 1;
  const passed = sanityRoll <= character.sanityCurrent;

  let lossDealt: number;
  let lossRolls: number[] | undefined;

  if (passed) {
    lossDealt = loss.passLoss;
  } else {
    const { rolls, total } = rollNotation(loss.failLoss, random);
    lossRolls = rolls;
    lossDealt = total;
  }

  const triggers: SanityTrigger[] = [];
  const newSanity = Math.max(0, character.sanityCurrent - lossDealt);
  const newLossLast24h = character.sanityLossLast24h + lossDealt;

  // Surto de loucura: perdeu 5+ numa única rolagem
  if (lossDealt >= 5 && character.madnessState === "NONE") {
    triggers.push({
      type: "BOUT_OF_MADNESS",
      description: rollMadnessTable(random).description,
    });
  }

  // Loucura indefinida: perdeu >= 1/5 da SAN máxima em 24h
  const fifthOfMax = Math.floor(character.sanityMax / 5);
  if (newLossLast24h >= fifthOfMax && character.madnessState !== "INDEFINITE" && character.madnessState !== "PERMANENT") {
    triggers.push({
      type: "INDEFINITE_INSANITY",
      description: rollIndefiniteInsanityTable(random).description,
    });
  }

  // Loucura permanente: SAN chegou a 0
  if (newSanity === 0) {
    triggers.push({ type: "PERMANENT_INSANITY" });
  }

  return {
    sanityRoll,
    sanityCurrent: newSanity,
    passed,
    lossDealt,
    lossRolls,
    triggers,
  };
}

const MADNESS_BOUTS_TABLE = [
  { roll: [1],     description: "Amnésia (1d10 horas)" },
  { roll: [2],     description: "Pavor incontrolável (foge por 1d10 rodadas)" },
  { roll: [3],     description: "Acessos de violência (ataca o mais próximo)" },
  { roll: [4],     description: "Catatonia (paralisado por 1d10 rodadas)" },
  { roll: [5],     description: "Histeria ou desmaio" },
  { roll: [6],     description: "Fobia recém-adquirida" },
  { roll: [7],     description: "Mania recém-adquirida" },
  { roll: [8],     description: "Delírios (acredita em algo falso)" },
  { roll: [9],     description: "Visão acentuada do impossível" },
  { roll: [10],    description: "Faz algo dramático e bizarro" },
  // ... 10 entradas total no MVP
];

export function rollMadnessTable(random: () => number) {
  const roll = Math.floor(random() * 10) + 1;
  return MADNESS_BOUTS_TABLE.find(e => e.roll.includes(roll))!;
}
```

### 4.5 Recuperação de Sanidade

Ganhos de SAN (raros):
- **Final de cenário:** GM concede 1d6, 1d10 dependendo do mistério resolvido
- **Psicoterapia:** rolagem mensal, +1d3 se sucesso, somado ao max
- **Vitória heróica:** ações que combatem o Mythos podem render SAN

Schema:
```typescript
export interface SanityRestoration {
  amount: number;
  source: "SCENARIO_RESOLUTION" | "PSYCHOTHERAPY" | "HEROIC_ACT" | "GM_AWARD";
  description: string;
}
```

---

## 5. Conteúdo do Bestiário Mythos (~40 entidades de domínio público)

### 5.1 Princípio: apenas Lovecraft puro

Critério inflexível: **só entra entidade explicitamente criada por H.P. Lovecraft** ou citada em obra dele que esteja em domínio público (publicada antes de 1928 nos EUA, com algumas exceções pós-mortem). **Não usar** criações de:

- August Derleth (Tcho-Tcho, Cthugha — ainda em copyright)
- Robert Bloch (criou alguns que estão limítrofes)
- Lin Carter, Brian Lumley (modernos)

### 5.2 Lista canônica MVP (40 entidades)

```typescript
// packages/constants/src/cosmic-horror-bestiary.ts

export const MYTHOS_BESTIARY_PUBLIC_DOMAIN = [
  // Grandes Antigos
  { slug: "cthulhu",           name: "Cthulhu",              source: "Lovecraft, 'O Chamado de Cthulhu' (1928)", category: "GREAT_OLD_ONE" },
  { slug: "dagon",             name: "Dagon",                source: "Lovecraft, 'Dagon' (1919)", category: "GREAT_OLD_ONE" },
  { slug: "father-dagon",      name: "Pai Dagon",            source: "Lovecraft, 'A Sombra sobre Innsmouth'", category: "GREAT_OLD_ONE" },
  { slug: "mother-hydra",      name: "Mãe Hidra",            source: "Lovecraft, 'A Sombra sobre Innsmouth'", category: "GREAT_OLD_ONE" },
  { slug: "yog-sothoth",       name: "Yog-Sothoth",          source: "Lovecraft, 'O Caso Charles Dexter Ward'", category: "OUTER_GOD" },
  { slug: "azathoth",          name: "Azathoth",             source: "Lovecraft, 'Azathoth' (1922)", category: "OUTER_GOD" },
  { slug: "nyarlathotep",      name: "Nyarlathotep",         source: "Lovecraft, 'Nyarlathotep' (1920)", category: "OUTER_GOD" },
  { slug: "shub-niggurath",    name: "Shub-Niggurath",       source: "Lovecraft, 'O Sussurrador nas Trevas'", category: "OUTER_GOD" },

  // Raças alienígenas / servidores
  { slug: "deep-one",          name: "Profundo",             source: "Lovecraft, 'A Sombra sobre Innsmouth'", category: "ALIEN_RACE" },
  { slug: "deep-one-hybrid",   name: "Híbrido de Profundo",  source: "Idem", category: "ALIEN_RACE" },
  { slug: "shoggoth",          name: "Shoggoth",             source: "Lovecraft, 'Nas Montanhas da Loucura'", category: "ALIEN_RACE" },
  { slug: "elder-thing",       name: "Coisa Antiga",         source: "Lovecraft, 'Nas Montanhas da Loucura'", category: "ALIEN_RACE" },
  { slug: "mi-go",             name: "Mi-Go (Fungos de Yuggoth)", source: "Lovecraft, 'O Sussurrador nas Trevas'", category: "ALIEN_RACE" },
  { slug: "yithian",           name: "Yithian (Grande Raça de Yith)", source: "Lovecraft, 'A Sombra Vinda do Tempo'", category: "ALIEN_RACE" },
  { slug: "flying-polyp",      name: "Pólipo Voador",        source: "Lovecraft, 'A Sombra Vinda do Tempo'", category: "ALIEN_RACE" },
  { slug: "ghoul",             name: "Carniçal",             source: "Lovecraft, 'Pickman's Model'", category: "ALIEN_RACE" },
  { slug: "night-gaunt",       name: "Magro Noturno",        source: "Lovecraft, 'A Busca Onírica de Kadath Desconhecida'", category: "ALIEN_RACE" },

  // Habitantes do Reino dos Sonhos
  { slug: "moon-beast",        name: "Besta Lunar",          source: "Lovecraft, 'A Busca Onírica...'", category: "DREAM_LANDS" },
  { slug: "dhole",             name: "Dhole",                source: "Lovecraft, 'A Busca Onírica...'", category: "DREAM_LANDS" },
  { slug: "gug",               name: "Gug",                  source: "Lovecraft, 'A Busca Onírica...'", category: "DREAM_LANDS" },
  { slug: "zoog",              name: "Zoog",                 source: "Lovecraft, 'A Busca Onírica...'", category: "DREAM_LANDS" },

  // Criaturas menores
  { slug: "byakhee",           name: "Byakhee",              source: "Lovecraft, 'O Festival'", category: "LESSER_SERVITOR" },
  { slug: "color-out-of-space", name: "Cor que Caiu do Céu", source: "Lovecraft, 'A Cor que Caiu do Céu'", category: "ANOMALY" },
  { slug: "hound-of-tindalos", name: "Cão de Tindalos",      source: "Frank Belknap Long, 1929 — verificar status legal antes" },
  { slug: "rat-thing",         name: "Coisa-Rato",           source: "Lovecraft, 'Os Sonhos na Casa da Bruxa'", category: "LESSER_SERVITOR" },
  { slug: "star-vampire",      name: "Vampiro Estelar",      source: "Robert Bloch — VERIFICAR (provavelmente excluir)" },

  // Cultistas humanos (genéricos)
  { slug: "cultist-leader",    name: "Líder de Culto",       source: "Genérico", category: "HUMAN" },
  { slug: "cultist-follower",  name: "Seguidor de Culto",    source: "Genérico", category: "HUMAN" },
  { slug: "armed-thug",        name: "Capanga Armado",       source: "Genérico", category: "HUMAN" },
  { slug: "corrupt-investigator", name: "Investigador Corrupto", source: "Genérico", category: "HUMAN" },

  // Animais (úteis pra Cthulhu)
  { slug: "wolf",              name: "Lobo",                 source: "Genérico", category: "ANIMAL" },
  { slug: "guard-dog",         name: "Cão de Guarda",        source: "Genérico", category: "ANIMAL" },
  { slug: "alligator",         name: "Jacaré",               source: "Genérico", category: "ANIMAL" },
  { slug: "shark",             name: "Tubarão",              source: "Genérico", category: "ANIMAL" },
  { slug: "rat-swarm",         name: "Enxame de Ratos",      source: "Genérico", category: "ANIMAL" },
  { slug: "horse",             name: "Cavalo",               source: "Genérico", category: "ANIMAL" },

  // Outros
  { slug: "feral-human",       name: "Humano Selvagem",      source: "Lovecraft, vários contos", category: "HUMAN_CORRUPTED" },
  { slug: "innsmouth-resident", name: "Residente de Innsmouth", source: "Lovecraft, 'A Sombra sobre Innsmouth'", category: "HUMAN_CORRUPTED" },
  { slug: "lloigor",           name: "Lloigor",              source: "Colin Wilson — VERIFICAR (provavelmente excluir)" },
  { slug: "hunting-horror",    name: "Horror Caçador",       source: "Lovecraft, sugerido em vários", category: "LESSER_SERVITOR" },
  { slug: "shantak",           name: "Shantak",              source: "Lovecraft, 'A Busca Onírica...'", category: "DREAM_LANDS" },
] as const;
```

> ⚠️ **Importante para o Claude Code:** ao criar a lista, fazer uma verificação legal de cada entidade. Algumas marcadas com "VERIFICAR" devem ser **excluídas** se não for possível confirmar status de domínio público. Melhor menos entidades garantidas do que problema legal.

### 5.3 Schema dos monstros

Reaproveita `SrdMonster` do D&D 5e mas com `systemId` apontando pro `cosmic-horror`. Adicionar campos específicos via metadata JSON quando necessário.

```typescript
// Pra Cthulhu, monstros em Schema sãoque devem ter:
interface CosmicHorrorMonsterMetadata {
  sanityCost: string;        // "1d6/1d20" — perda ao ver
  combatStats: {
    fighting: number;        // skill % de luta
    dodge: number;
    weapons: Array<{ name: string; damage: string }>;
    armor: number;
    moveRate: number;
  };
  dread: "MUNDANE" | "UNNATURAL" | "TERRIFYING" | "ELDRITCH" | "INCOMPREHENSIBLE";
  // Mundane = humanos. Incomprehensible = Azathoth (vê-lo é instalouca).
}
```

### 5.4 Atribuição

Cada entidade do bestiário tem footer:
```
Inspirado em criatura de [autor], obra "[título]" ([ano]).
Domínio público nos termos da legislação aplicável.
```

---

## 6. Ocupações (~30 no MVP)

```typescript
export const COSMIC_HORROR_OCCUPATIONS = [
  {
    slug: "antiquarian",
    name: "Antiquário",
    creditRating: { min: 30, max: 70 },
    skillFormula: "EDU x 4",
    skills: ["appraise", "history", "library-use", "language-other", "spot-hidden"],
    optionalSkills: 2,  // escolhe entre lista
  },
  {
    slug: "artist",
    name: "Artista",
    creditRating: { min: 9, max: 50 },
    skillFormula: "EDU x 2 + (DEX or POW) x 2",
    skills: ["art-craft", "history", "natural-world", "psychology", "spot-hidden"],
    optionalSkills: 3,
  },
  {
    slug: "author",
    name: "Escritor",
    creditRating: { min: 9, max: 30 },
    skillFormula: "EDU x 4",
    skills: ["art-craft", "history", "library-use", "natural-world", "language-own", "language-other", "psychology"],
    optionalSkills: 1,
  },
  {
    slug: "criminal",
    name: "Criminoso",
    creditRating: { min: 5, max: 65 },
    skillFormula: "EDU x 2 + (DEX or APA) x 2",
    skills: ["fast-talk", "fighting-brawl", "stealth", "lockpicking"],
    optionalSkills: 4,
  },
  {
    slug: "detective-private",
    name: "Detetive Particular",
    creditRating: { min: 9, max: 30 },
    skillFormula: "EDU x 2 + (DEX or STR) x 2",
    skills: ["art-craft-photography", "disguise", "law", "library-use", "psychology", "spot-hidden", "firearms-handgun"],
    optionalSkills: 1,
  },
  // ... continua até 30 ocupações
] as const;
```

Lista mínima de ocupações pro MVP: Antiquário, Artista, Escritor, Atleta, Aviador, Bartender, Criminoso, Doutor (Médico), Detetive Particular, Diletante, Engenheiro, Acadêmico, Repórter, Advogado, Bibliotecário, Padre, Militar, Músico, Pintor, Polícia, Pesquisador, Cientista, Marinheiro, Vendedor, Soldado, Estudante, Professor, Tribal, Motorista, Trabalhador.

---

## 7. Combate em Cthulhu (diferenças importantes do D&D)

### 7.1 Princípios

- **Letal:** ataque de revólver na cara → 1d10 de dano. Personagem normal tem ~12 HP. **Pode morrer em 1 round.**
- **Iniciativa simples:** ordem por DES descendente. Sem rolagem.
- **Sem turnos rígidos:** narrativo, GM decide.
- **Esquiva ativa:** todo ataque pode ser esquivado (skill Esquivar). Custa "ação".
- **Maioria dos testes é resistência ou iniciativa, não dano** — combate é raro.

### 7.2 Reuso do sistema de ataque do D&D

O prompt `questboard-attack-damage-prompt.md` foi feito agnóstico ao sistema. Pra Cthulhu, **mudar apenas:**

```typescript
// packages/engine/src/systems/cosmic-horror/combat.ts

export function executeCosmicHorrorAttack(input: CosmicHorrorAttackInput): AttackResult {
  // Atacante rola d100 vs skill da arma
  const attackerRoll = rollD100(crypto);
  const attackerResult = evaluateSkillCheck(attackerRoll, input.attackerSkill);

  // Defensor pode escolher: esquivar OU contra-atacar
  let defenderResult: SkillCheckResult = "FAILURE";
  if (input.defense.type === "DODGE") {
    const dodgeRoll = rollD100(crypto);
    defenderResult = evaluateSkillCheck(dodgeRoll, input.defense.dodgeValue);
  } else if (input.defense.type === "FIGHT_BACK") {
    const fightRoll = rollD100(crypto);
    defenderResult = evaluateSkillCheck(fightRoll, input.defense.fightValue);
  }

  // Quem ganhou o opposed?
  const opposed = resolveOpposed(attackerRoll, input.attackerSkill, /* ... */);

  if (opposed === "A_WINS" || (opposed === "TIE" && attackerResult !== "FAILURE")) {
    // Atacante acertou
    const damage = rollNotation(input.weapon.damage, crypto);
    // Aplicar damage bonus se melee
    if (input.weapon.melee) damage.total += parseDamageBonus(input.attacker.damageBonus);
    return { hit: true, damage: damage.total, ... };
  }

  return { hit: false };
}
```

### 7.3 Crítico em Cthulhu

- **Sucesso Extremo (extreme success):** dobro do dano dos dados (não soma).
- **Sucesso Difícil (hard success):** dano normal.
- **Sucesso Regular:** dano normal mas alvo pode esquivar/contra-atacar mais facilmente.
- **Falha crítica (96-00):** ação dá errado dramaticamente. Arma pode emperrar (malfunction).

---

## 8. Magia Mythos (MVP — escopo mínimo)

No MVP, magia em Cthulhu é simplificada:

### 8.1 Custos

Toda magia tem 3 custos:
- **MP (Magic Points)** — sempre obrigatório
- **SAN (Sanidade)** — quase sempre
- **HP (Hit Points)** — opcionalmente, magias mais poderosas

### 8.2 Schema de feitiço

```prisma
// Reusa SrdSpell mas com metadata específica
{
  systemId: "cosmic-horror",
  ...
  rawData: {
    mpCost: "1d6",
    sanityCost: "1d6",
    hpCost: 0,
    castingTime: "10 minutos",
    requirements: ["Necronomicon ou similar"],
    description: "Causa apparições de servidores dos Outros Deuses..."
  }
}
```

### 8.3 Lista mínima MVP

10 feitiços icônicos do Mythos:
1. **Contatar Cthulhu** — sonhos perturbadores de Cthulhu adormecido
2. **Convocar/Vincular Servidor** — chama servidor menor (byakhee, etc)
3. **Olho de Babbalith** — visão à distância
4. **Sinal de Voor** — proteção contra criaturas do Mythos
5. **Sopro de Mãe Hidra** — ataque com gosma profunda
6. **Vínculo de Yog-Sothoth** — conjura algo de fora
7. **Encolhimento** — encolhe alvo
8. **Empréstimo de Pó** — necromancia
9. **Pergunta a Mortos** — comunicação com falecidos
10. **Selar Portal** — fecha portal entre dimensões

Cada um cria uma `SrdSpell` com `systemId: cosmic-horror`.

---

## 9. Frontend — Diferenças do D&D 5e

### 9.1 Compêndio cosmic-horror

Reuso 95% das telas do D&D 5e. Só muda labels:
- "Magias" → "Feitiços do Mythos"
- "Monstros" → "Entidades"
- "Itens" → "Equipamento" (sem mágicos, mais armas/livros)
- "Raças" → **NÃO EXISTE** (só humanos em Cthulhu) — ocultar tab
- "Classes" → "Ocupações"
- "Condições" → "Estados de Loucura" (loucura temporária, indefinida, etc)

### 9.2 Ficha cosmic-horror

Tabs:
- **Resumo** — stats principais (HP, MP, **SAN destacada com cor**, Sorte)
- **Atributos** — 8 atributos
- **Skills** — lista categorizada (40 skills)
- **Combate** — armas + bônus de dano + esquiva
- **Sanidade** — destaque visual: barra de SAN, max, máxima absoluta (99 - mythos), fobias/manias atuais
- **Backstory** — campos de narrativa (essencial em Cthulhu)
- **Notas**

### 9.3 Componente especial: SanityTracker

```tsx
// apps/web/app/(dashboard)/characters/[id]/_components/cosmic-horror/SanityTracker.tsx

export function SanityTracker({ character }: { character: CosmicHorrorCharacter }) {
  const sanityPercent = (character.sanityCurrent / character.sanityMax) * 100;
  const colorClass =
    sanityPercent > 60 ? "text-emerald-400" :
    sanityPercent > 30 ? "text-amber-400" :
    sanityPercent > 0  ? "text-red-500" :
                         "text-purple-500 animate-pulse";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm uppercase tracking-wider text-slate-400">Sanidade</h3>
        <span className={cn("text-2xl font-syne", colorClass)}>
          {character.sanityCurrent} / {character.sanityMax}
        </span>
      </div>

      {/* Barra com 3 zonas: verde, ambar, vermelho */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
        <div
          className={cn("h-full transition-all", colorClass)}
          style={{ width: `${sanityPercent}%` }}
        />
        {/* Marcadores: 1/5 da máx (limiar de loucura indefinida) */}
        <div
          className="absolute top-0 h-full w-px bg-amber-300/50"
          style={{ left: `${(character.sanityMax / 5) / character.sanityMax * 100}%` }}
        />
      </div>

      {character.madnessState !== "NONE" && (
        <div className="rounded bg-purple-900/30 border border-purple-500/30 p-2 text-xs">
          <strong className="text-purple-400">{translateMadness(character.madnessState)}</strong>
          {character.madnessDescription && <p className="text-slate-300">{character.madnessDescription}</p>}
        </div>
      )}

      <button className="qb-btn-ghost w-full">Disparar Teste de Sanidade</button>
    </div>
  );
}
```

### 9.4 Modal de teste de Sanidade

Quando GM ativa "1d6/1d20 SAN check" em todos os jogadores ou em um:

```
┌─ Teste de Sanidade ────────────────┐
│ Você viu: [GM digita o que]        │
│ Perda: 1d6 / 1d20                  │
│                                    │
│ Sua SAN atual: 65                  │
│                                    │
│ [Rolar dado de Sanidade]           │
│                                    │
│ → Resultado: 78 (FALHOU)           │
│ → Perda: 14 (1d20 = 14)            │
│ → SAN: 65 → 51                     │
│                                    │
│ ⚠️ SURTO DE LOUCURA detectado      │
│ "Você desenvolve uma fobia         │
│  recém-adquirida de água"          │
│ Duração: 1d10 horas                │
│                                    │
│ [Aceitar]                          │
└────────────────────────────────────┘
```

Se múltiplos surtos/loucuras simultâneos, exibir em sequência.

### 9.5 Indicador de SAN no token

No mapa, token de PJ Cthulhu tem indicador discreto:
- **Verde**: SAN > 60% do max
- **Amarelo**: SAN 30-60%
- **Vermelho pulsante**: SAN < 30%
- **Roxo**: enlouqueceu (qualquer estado de loucura)

GM e o próprio jogador veem a cor. Outros jogadores **não veem** (sanidade é informação privada — opção de campanha pra ativar visibilidade pública).

---

## 10. Integração com IA (Fase 3 do prompt D&D)

A IA vai entender Cthulhu também — não duplica esforço, **só precisa ter o conteúdo do `systemId: cosmic-horror` indexado em pgvector**.

### 10.1 Casos de uso específicos

| Caso | Prompt UI |
|---|---|
| "Sugerir cenário de horror investigativo" | Gera mistério em 4 atos |
| "Gerar cultista" | NPC com ocupação, motivações, links com Mythos |
| "Inventar entidade Mythos" | **NÃO** — pode pisar em copyright. Só sugerir variações de entidades públicas |
| "Como aplicar perda de SAN nesse momento?" | Recomenda notação baseada em descrição |
| "Sugerir consequência de loucura" | Rolagens narrativas, fobias, manias |

### 10.2 Disclaimer de IA

Toda resposta de IA em sistema cosmic-horror inclui:
> *Este sistema é inspirado em obras de H.P. Lovecraft (domínio público). Sugestões da IA podem incluir elementos do Mythos público — não use para gerar conteúdo proprietário de Chaosium ou outras editoras.*

---

## 11. Permissões (igual ao D&D, mas SAN é dado sensível)

### 11.1 Visibilidade de Sanidade

| Quem | Pode ver SAN | Pode editar SAN |
|---|---|---|
| OWNER (GM) | Todos os PJs | Todos |
| CO_GM | Todos os PJs | Todos |
| PLAYER (próprio personagem) | Sim, sempre | Não diretamente — só via teste |
| PLAYER (personagem de outro) | **Não** (default) | Não |
| SPECTATOR | Não | Não |

Setting `campaign.publicSanity = true` permite players verem SAN um do outro. Default `false`.

### 11.2 Setting de campanha cosmic-horror

```typescript
campaign.systemSettings.cosmicHorror = {
  publicSanity: false,
  pulpMode: false,           // não no MVP
  startingSanityRoll: false, // se true, rola 3d6×5 para SAN inicial; se false, usa POD direto
  enforcedSanityChecks: true, // GM pode forçar testes em tela; players não recusam
};
```

---

## 12. Engine — testes unitários obrigatórios

```typescript
// packages/engine/__tests__/systems/cosmic-horror/

describe("evaluateSkillCheck", () => {
  it("01-extreme em skill 50 (extreme = 10)", () => {
    expect(evaluateSkillCheck(5, 50)).toBe("EXTREME_SUCCESS");
  });
  it("25-hard em skill 50 (hard = 25)", () => {
    expect(evaluateSkillCheck(25, 50)).toBe("HARD_SUCCESS");
  });
  it("96-fumble em skill 49", () => {
    expect(evaluateSkillCheck(96, 49)).toBe("FUMBLE");
  });
  it("100-fumble em skill 99", () => {
    expect(evaluateSkillCheck(100, 99)).toBe("FUMBLE");
  });
  it("99-failure em skill 50", () => {
    expect(evaluateSkillCheck(99, 50)).toBe("FAILURE");
  });
});

describe("performSanityCheck", () => {
  it("dispara surto se perdeu 5+ numa rolagem", () => {
    const result = performSanityCheck(charDummy, parseSanityLoss("1/1d6"), () => 0.99);
    // Falha (rola alto), perde 1d6 → assume 6 dano → triggers BOUT_OF_MADNESS
    expect(result.triggers.some(t => t.type === "BOUT_OF_MADNESS")).toBe(true);
  });

  it("dispara loucura indefinida se perdeu >= 1/5 SAN max em 24h", () => {
    const char = { ...charDummy, sanityMax: 70, sanityLossLast24h: 12 };
    // 1/5 de 70 = 14. Perdeu 12 antes, perde mais 3 = 15 → trigger
    const result = performSanityCheck(char, parseSanityLoss("3/1d6"), () => 0.01);  // passa
    expect(result.triggers.some(t => t.type === "INDEFINITE_INSANITY")).toBe(false);  // ainda passou
    // Rodar novamente com falha:
    const result2 = performSanityCheck(char, parseSanityLoss("1/1d6"), () => 0.99);
    expect(result2.triggers.some(t => t.type === "INDEFINITE_INSANITY")).toBe(true);
  });

  it("dispara loucura permanente em SAN 0", () => {
    const char = { ...charDummy, sanityCurrent: 1 };
    const result = performSanityCheck(char, parseSanityLoss("1/1d6"), () => 0.99);
    expect(result.sanityCurrent).toBe(0);
    expect(result.triggers.some(t => t.type === "PERMANENT_INSANITY")).toBe(true);
  });
});

describe("calculateDamageBonus", () => {
  it.each([
    [{ for: 30, tam: 30 }, "-2"],
    [{ for: 50, tam: 50 }, "+0"],
    [{ for: 80, tam: 80 }, "+1d4"],
  ])("%j → %s", (attrs, expected) => {
    expect(calculateDamageBonus(attrs)).toBe(expected);
  });
});
```

---

## 13. Critérios de aceitação

### 13.1 Backend

- [ ] `RuleSystem.slug = "cosmic-horror"` criado com `diceEngine = "d100"`.
- [ ] `pnpm test packages/engine/cosmic-horror` verde com >= 95% coverage em `skillCheck`, `sanity`, `derived`.
- [ ] **NENHUMA referência** a "Call of Cthulhu", "CoC", "Chaosium" em código, comentários, ou comentários de migration. Auditoria com `grep -r "call of cthulhu\|chaosium" --include="*.ts"` deve retornar vazio.
- [ ] Validação Zod `cosmicHorrorCharacterSchema` testada com casos válidos e inválidos.
- [ ] Performance: criação de personagem com auto-cálculo < 200ms.
- [ ] Bestiário de 40 entidades importado, **todas com origem documentada**.

### 13.2 Frontend

- [ ] Compêndio acessível em `/compendium/cosmic-horror`.
- [ ] Tab "Raças" oculta no compêndio.
- [ ] Tab "Ocupações" no lugar de "Classes".
- [ ] Wizard de criação de personagem em 8 steps específicos:
  1. Identidade (nome, idade, sexo, residência)
  2. Atributos (point buy ou rolagem 3d6×5)
  3. Ocupação
  4. Skills (alocar pontos da ocupação + interesse pessoal)
  5. Backstory (3 campos mínimos)
  6. Equipamento inicial
  7. Sanidade inicial e Sorte rolada
  8. Revisão
- [ ] `SanityTracker` exibido em destaque na ficha.
- [ ] Modal de teste de sanidade dispara surto/indefinida/permanente conforme cálculo.
- [ ] Token no mapa exibe indicador de SAN (gradiente de cor).
- [ ] Mobile-first 390px.

### 13.3 Integração com sistema existente

- [ ] Engine de combate (do prompt de ataque/dano) **adapta automaticamente** baseado em `system.diceEngine`.
- [ ] D&D 5e usa fluxo d20 + ataque/dano.
- [ ] cosmic-horror usa fluxo d100 + opposed roll + esquiva.
- [ ] Mesma UI de modal de ataque, com campos diferentes.
- [ ] IA assistente (Fase 3 do D&D) responde queries cosmic-horror se conteúdo indexado.

### 13.4 Legal / qualidade

- [ ] Rodapé em todas as páginas cosmic-horror com aviso legal.
- [ ] Página `/legal/cosmic-horror-attribution` lista todas as entidades com origem.
- [ ] Auditoria final com advogado (recomendado) antes de release público.

---

## 14. Fora do escopo (declarado, fica pra fase 4+)

- **Pulp Cthulhu** (variante heroica)
- **Mythos Magic completa** (>10 feitiços, sistema de aprendizado de tomos, etc)
- **Cenários históricos** automáticos (1890s/1920s/Modern com equipamento da época)
- **Chase rules** (regras de perseguição)
- **Combate em massa**
- **Investigação automatizada** (mesh dos clues)
- **Backgrounds estendidos** (>30 ocupações)
- **Skills além das ~40** do MVP
- **Mythos não-Lovecraft** (Derleth Mythos, Ramsey Campbell, Brian Lumley)
- **Bestiário >40** (até validar tração)
- **Variantes regionais** (Innsmouth, Arkham, Dunwich específicas)
- **Geração automática de cenário com IA** (caro, complicado de balancear)

---

## 15. Ordem de implementação

### Sprint 1 (fundação)
1. Migration: `RuleSystem` row pra cosmic-horror, validar índices.
2. Validators Zod completos: `cosmicHorrorCharacterSchema`, opposedRollInput, sanityLossInput.
3. Engine puro: `skillCheck`, `derived`, `sanity` com 95%+ coverage.
4. Constants: skills (40), occupations (30), bestiário (40).

### Sprint 2 (compêndio)
5. Importador estruturado dos 40 monstros Mythos (HARDCODED — não é SRD pra parsear).
6. Importador de ocupações.
7. Lista de feitiços (10 hardcoded).
8. Frontend compêndio cosmic-horror, reuso D&D.

### Sprint 3 (ficha)
9. Wizard de criação de personagem cosmic-horror (8 steps).
10. Ficha viva com tabs.
11. `SanityTracker` componente.
12. Modal de teste de sanidade com automação.

### Sprint 4 (combate + integração)
13. Adaptar prompt de ataque/dano: `system.diceEngine = "d100"` mostra UI diferente.
14. Implementar opposed roll na UI.
15. Esquiva e contra-ataque.
16. Token indicator de SAN.
17. Integrar com IA (indexar conteúdo cosmic-horror em pgvector).
18. Telemetria de uso.

**Cada sprint termina com:** TS limpo, testes verdes, commit pt-BR, deploy staging com smoke test.

---

## 16. Pendências para o Lucas decidir antes de começar

1. **Entidades "VERIFICAR" do bestiário (Cão de Tindalos, Vampiro Estelar, Lloigor) — incluir ou excluir?**
   *Sugiro **excluir todas as marcadas com VERIFICAR** por segurança. 37 entidades garantidas é mais do que suficiente pra MVP.*

2. **Sistema de Sorte (Luck) — pode "gastar" Luck pra alterar rolagens?**
   *Sim. CoC clássico permite gastar Luck pra empurrar resultado um pouco. Implementar como botão "Usar Sorte: -X pontos pra +X na rolagem".*

3. **Idioma da ficha — sempre pt-BR ou permitir alternar com inglês?**
   *Sugiro pt-BR fixo no MVP. Tradução de inglês só se demanda explícita aparecer.*

4. **Bouts of Madness e Indefinite Insanity têm tabelas pré-feitas — usar quais?**
   *Tabelas próprias, escritas em pt-BR pelo Lucas. **Nunca copiar do livro CoC.** Sugestão: 10 entradas básicas por tabela, expandir conforme feedback.*

5. **GM pode "forçar" teste de sanidade em todos os PCs simultaneamente?**
   *Sim — feature útil. UI: botão "Disparar SAN check pra todos" → todos veem modal. Settings podem desabilitar.*

6. **Dano em Cthulhu aplica direto no HP (sem CA, etc)?**
   *Sim. Cthulhu não tem CA. Dano aplica direto, descontado armadura (raro). Ferida grave = HP/2 → cai inconsciente, rola Constituição pra não morrer.*