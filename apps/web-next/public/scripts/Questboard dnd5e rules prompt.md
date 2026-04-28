# QuestBoard — Sistema de Regras D&D 5e (SRD)

> Implementação do motor completo de regras de D&D 5e, com arquitetura plugável pra T20/Ordem/Cthulhu em fases futuras.
> Inclui: compêndio SRD navegável, ficha calculada sistema-aware, IA assistente com SRD em RAG.
> **Tudo em pt-BR.** Stack respeitando `CLAUDE.md`.
>
> ⚠️ **Este é o prompt mais ambicioso do QuestBoard.** Estimativa realista: **6-9 meses para dev solo.** Estruturado em 3 fases para entregas incrementais. Não tente fazer tudo em uma sprint.

---

## 0. Avisos legais — leia primeiro

### 0.1 Licenciamento de conteúdo

| Conteúdo | Licença | Pode usar? |
|---|---|---|
| **SRD 5.1 (Wizards, 2023)** | Creative Commons CC-BY 4.0 | ✅ Sim, com atribuição visível |
| Player's Handbook completo | Copyright Wizards | ❌ Não |
| Monster Manual completo | Copyright Wizards | ❌ Não |
| Conteúdo D&D Beyond | Copyright | ❌ Não |
| Conteúdo Tasha's, Xanathar's | Copyright | ❌ Não |
| **Tormenta20** | Licença Jambô restrita | ❌ Não embutir conteúdo |
| **Ordem Paranormal** | Sem SRD aberto | ❌ Não embutir conteúdo |
| **Call of Cthulhu** | Chaosium proprietary | ❌ Não embutir conteúdo |

### 0.2 Atribuição obrigatória (CC-BY 4.0)

**Em todo lugar onde conteúdo SRD aparece**, exibir:
```
Este compêndio inclui material do System Reference Document 5.1 ("SRD 5.1") da Wizards of the Coast LLC, disponível em https://dnd.wizards.com/resources/systems-reference-document. SRD 5.1 está licenciado sob a Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/legalcode).
```

Página dedicada `/legal/srd-attribution` linkada em todo card de conteúdo SRD.

### 0.3 Sistemas não-5e no MVP

- **Tormenta20, Ordem, Cthulhu**: **arquitetura suporta**, mas **conteúdo é vazio** no MVP. GMs adicionam homebrew. Não importar livros.
- Ficha de Cthulhu/T20/Ordem: usuário preenche manualmente, motor calcula só o que conseguir inferir do schema genérico.

---

## 1. Decisões já tomadas (não revisitar)

| Decisão | Escolha |
|---|---|
| Abordagem | A (motor completo) + B (ficha calculada) + C (IA) |
| Sistemas no MVP | D&D 5e SRD apenas; outros sistemas com schema vazio |
| Fonte do SRD | `5e-bits/5e-database` (GitHub) como base, SRD oficial Wizards pra resolver divergências |
| Ficha | Sistema-aware desde dia 1 |
| IA | Gemini 2.5 Flash (já na stack) com SRD em RAG, gera NPCs/encontros/dicas pro GM |
| Escopo exposto MVP | Atributos, perícias, ataques, magias |

### 1.1 Cortes táticos do MVP (escopo controlado)

- **Sem subclasses de níveis altos** (>11) no MVP da ficha. Subclasses básicas (até nível 11) sim. Acima, esconde com "em breve".
- **Sem multiclasse** no MVP. Personagem tem 1 classe.
- **Sem itens mágicos do DMG** (Dungeon Master's Guide). Apenas SRD (que tem ~50 itens mágicos básicos).
- **Sem encantamentos custom** de armadura/arma. Item mágico é fixo.
- **Sem regras opcionais** (variant rules, healing surges, ações de bônus customizadas).
- **Sem combate em massa** ou regras de exército.
- **Sem condições aplicadas em massa** (envenenado, atordoado etc) — visual no token, sem efeito automático no MVP.

---

## 2. Roadmap em 3 fases

### Fase 1 — Compêndio SRD navegável (4-6 semanas)

**Entrega:** usuário pode pesquisar magias, monstros, itens, raças, classes, perícias do SRD diretamente no app. Não há ficha ainda. Não há IA ainda.

- Importar 5e-database via script
- Exibir como compêndio navegável em pt-BR (com tradução automática + revisão humana posterior)
- Card detalhado pra cada entrada (magia mostra escola, nível, alcance, etc)
- Busca rápida com filtros
- Atribuição CC-BY visível

**Por que essa fase primeiro:** dado é fundação. Ficha e IA dependem dele. Se errar a estrutura agora, refaz tudo depois.

### Fase 2 — Ficha calculada sistema-aware (8-12 semanas)

**Entrega:** usuário cria personagem 5e na ficha. Sistema calcula CA, modificadores, perícias, slots de magia, ataques. Conecta com sistema de combate (já existente).

- Schema de Character plugável por sistema
- Wizard de criação ("Crie seu personagem 5e em 10 passos")
- Ficha viva com auto-cálculo
- Upload customizado de classe/raça homebrew
- T20/Ordem/Cthulhu: schema genérico vazio, GM preenche manualmente

### Fase 3 — IA assistente (4-8 semanas)

**Entrega:** GM pergunta em pt-BR e Gemini responde usando SRD em RAG. Gera NPCs balanceados, sugere encontros, explica regras, sugere builds.

- Embeddings do SRD via Gemini
- Pinecone/pgvector pra retrieval
- Endpoints de geração com streaming
- UI integrada ao painel do GM

---

## 3. LEIA antes de qualquer edição

1. `CLAUDE.md` — seções 2 (stack), 3 (regras de ouro), 5 (lifecycle), 12 (planos).
2. `apps/api/src/modules/sessions/`, `apps/api/src/modules/combat/` — integração com features existentes.
3. `apps/api/prisma/schema.prisma` — entender Character e User antes de inserir.
4. `packages/validators/`, `packages/types/`, `packages/constants/` — onde inserir contratos compartilhados.
5. https://github.com/5e-bits/5e-database — fonte primária. Estrutura JSON dos dados.
6. https://dnd.wizards.com/resources/systems-reference-document — fonte secundária pra divergências.
7. https://5e.tools/ — referência visual (não copiar conteúdo).

---

# FASE 1 — Compêndio SRD Navegável

## 4. Modelo de dados

### 4.1 Princípio: schema agnóstico de sistema

Toda entidade tem `systemId` referenciando `RuleSystem`. Conteúdo 5e referencia o sistema 5e. Conteúdo homebrew de T20 referencia o sistema T20. **Mesma tabela serve todos.**

```prisma
model RuleSystem {
  id            String        @id @default(cuid())
  slug          String        @unique  // "dnd5e", "tormenta20", "ordem-paranormal", "cthulhu"
  name          String        // "D&D 5ª Edição"
  shortName     String        // "D&D 5e"
  edition       String?       // "5.1 SRD"
  publisher     String?       // "Wizards of the Coast"
  licenseType   String?       // "CC-BY-4.0", "PROPRIETARY", "NONE"
  iconUrl       String?
  bannerUrl     String?

  // Capacidades (motor saber o que esse sistema suporta)
  hasAttributes Boolean       @default(true)
  hasClasses    Boolean       @default(true)
  hasRaces      Boolean       @default(true)
  hasSpells     Boolean       @default(true)
  hasArmor      Boolean       @default(true)
  hasSanity     Boolean       @default(false)  // Cthulhu
  diceEngine    String        @default("d20")  // "d20", "d100", "freeform"

  // Schema da ficha (JSON Schema)
  characterSchema Json         // schema completo da ficha desse sistema

  isPublished   Boolean       @default(false)  // GMs só veem sistemas publicados
  createdAt     DateTime      @default(now())

  classes       SrdClass[]
  races         SrdRace[]
  spells        SrdSpell[]
  monsters      SrdMonster[]
  items         SrdItem[]
  features      SrdFeature[]
  conditions    SrdCondition[]
  characters    Character[]
}
```

### 4.2 Conteúdo SRD genérico

```prisma
enum SrdContentSource {
  OFFICIAL_SRD          // direto do SRD 5.1
  HOMEBREW_PUBLIC       // homebrew compartilhado pela comunidade
  HOMEBREW_CAMPAIGN     // homebrew restrito a uma campanha
  HOMEBREW_PRIVATE      // só do criador
}

model SrdSpell {
  id              String           @id @default(cuid())
  systemId        String
  source          SrdContentSource @default(OFFICIAL_SRD)
  ownerId         String?          // null se OFFICIAL; userId se homebrew
  campaignId      String?          // se HOMEBREW_CAMPAIGN

  slug            String           // "magic-missile"
  name            String           // "Mísseis Mágicos"
  nameEn          String?          // "Magic Missile" — pra busca cross-language
  level           Int              // 0-9
  school          String           // "Evocation"
  castingTime     String           // "1 ação"
  range           String           // "120 pés"
  components      String[]         // ["V", "S"]
  materialComponent String?
  duration        String           // "Instantâneo"
  description     String           @db.Text
  higherLevels    String?          @db.Text  // "Em níveis superiores: ..."
  ritual          Boolean          @default(false)
  concentration   Boolean          @default(false)

  // Metadados estruturados (pra cálculos)
  damageDice      String?          // "1d4+1" (Mísseis Mágicos)
  damageType      String?          // "FORCE"
  saveAttribute   String?          // "DEX" pra Bola de Fogo
  attackType      String?          // "RANGED_SPELL", "MELEE_SPELL", "NONE"

  classes         String[]         // ["wizard", "sorcerer"] — slugs
  rawData         Json             // dados originais não-parsados (referência)

  attribution     String?          // "SRD 5.1 §X.Y"
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  system          RuleSystem       @relation(fields: [systemId], references: [id])

  @@unique([systemId, slug, source])
  @@index([systemId, level])
  @@index([systemId, name])
}

model SrdMonster {
  id              String           @id @default(cuid())
  systemId        String
  source          SrdContentSource @default(OFFICIAL_SRD)
  ownerId         String?
  campaignId      String?

  slug            String
  name            String
  nameEn          String?
  size            String           // "Tiny", "Small", "Medium", "Large", ...
  type            String           // "humanoid", "dragon", "fiend", ...
  alignment       String

  // Stats
  armorClass      Int
  armorClassDescription String?    // "16 (cota de malha)"
  hitPoints       Int
  hitDice         String           // "5d8 + 5"
  speed           Json             // { walk: 30, fly: 60, swim: 0 }

  attributes      Json             // { str: 18, dex: 14, con: 16, int: 8, wis: 10, cha: 12 }
  savingThrows    Json?            // { str: 7, con: 5 }
  skills          Json?            // { perception: 4, stealth: 6 }
  damageResistances String[]
  damageImmunities  String[]
  conditionImmunities String[]
  damageVulnerabilities String[]
  senses          Json             // { darkvision: 60, passive_perception: 12 }
  languages       String[]
  challengeRating Float            // 0.125, 0.25, 0.5, 1, 2, ..., 30
  experiencePoints Int

  // Habilidades, ações, ações lendárias
  specialAbilities Json?           // [{ name, description }]
  actions         Json?            // [{ name, description, damageDice, attackBonus }]
  legendaryActions Json?
  reactions       Json?

  imageUrl        String?
  rawData         Json
  attribution     String?

  system          RuleSystem       @relation(fields: [systemId], references: [id])

  @@unique([systemId, slug, source])
  @@index([systemId, challengeRating])
  @@index([systemId, type])
  @@index([systemId, name])
}

model SrdItem {
  id              String           @id @default(cuid())
  systemId        String
  source          SrdContentSource @default(OFFICIAL_SRD)
  ownerId         String?
  campaignId      String?

  slug            String
  name            String
  nameEn          String?
  category        String           // "WEAPON", "ARMOR", "ADVENTURING_GEAR", "MAGIC_ITEM", "TOOL"
  subcategory     String?          // "MARTIAL_MELEE", "MEDIUM_ARMOR", etc.

  cost            Json?            // { quantity: 50, unit: "gp" }
  weight          Float?

  // Armas
  damageDice      String?          // "1d8"
  damageType      String?          // "SLASHING"
  weaponProperties String[]        // ["versatile", "two-handed"]
  weaponRange     Json?            // { normal: 30, long: 90 }

  // Armaduras
  armorClass      Json?            // { base: 16, dexBonus: false, maxDexBonus: 0 } pra cota de placas
  strengthRequirement Int?
  stealthDisadvantage Boolean      @default(false)

  // Mágico
  rarity          String?          // "COMMON", "UNCOMMON", "RARE", "VERY_RARE", "LEGENDARY", "ARTIFACT"
  requiresAttunement Boolean       @default(false)
  description     String?          @db.Text

  rawData         Json
  attribution     String?

  system          RuleSystem       @relation(fields: [systemId], references: [id])

  @@unique([systemId, slug, source])
  @@index([systemId, category])
}

model SrdRace {
  id              String           @id @default(cuid())
  systemId        String
  source          SrdContentSource @default(OFFICIAL_SRD)

  slug            String
  name            String
  nameEn          String?
  size            String
  speed           Int

  abilityBonuses  Json             // { str: 2, dex: 1 } — bônus aplicado nos atributos
  age             String?
  alignment       String?
  languageBase    String[]
  languageOptions Int              @default(0)

  traits          Json             // [{ name, description }] — traços raciais (Visão no Escuro, etc)
  subraces        Json?            // [{ name, abilityBonuses, traits }]

  description     String?          @db.Text
  rawData         Json
  attribution     String?

  system          RuleSystem       @relation(fields: [systemId], references: [id])

  @@unique([systemId, slug, source])
}

model SrdClass {
  id              String           @id @default(cuid())
  systemId        String
  source          SrdContentSource @default(OFFICIAL_SRD)

  slug            String
  name            String
  nameEn          String?

  hitDie          Int              // 6, 8, 10, 12 (d6, d8, d10, d12)
  primaryAbility  String[]         // ["str"] pra Guerreiro
  savingThrowProficiencies String[] // ["str", "con"]
  armorProficiencies String[]      // ["light", "medium", "heavy", "shield"]
  weaponProficiencies String[]     // ["simple", "martial"]
  toolProficiencies String[]
  skillChoiceCount Int             // 2 perícias entre as opções
  skillChoices    String[]

  startingEquipment Json
  spellcasting    Json?            // { ability: "INT", castMode: "PREPARED", spellList: "wizard" }

  // Tabela de progressão por nível (1-20)
  levelTable      Json             // [{ level, proficiencyBonus, features: [...], spellSlots: {...} }]

  subclasses      Json             // [{ slug, name, levels: [{ level, features }] }]

  description     String?          @db.Text
  rawData         Json
  attribution     String?

  system          RuleSystem       @relation(fields: [systemId], references: [id])

  @@unique([systemId, slug, source])
}

model SrdFeature {
  id              String           @id @default(cuid())
  systemId        String
  source          SrdContentSource @default(OFFICIAL_SRD)

  slug            String
  name            String
  nameEn          String?
  description     String           @db.Text

  // Origem
  classSlug       String?
  subclassSlug    String?
  raceSlug        String?
  levelGranted    Int?

  // Mecânica (best-effort — features complexas viram texto)
  rechargeOn      String?          // "SHORT_REST", "LONG_REST", "SHORT_OR_LONG_REST"
  uses            Json?            // { value: "wisModifier", min: 1, max: 5 }

  rawData         Json
  attribution     String?

  system          RuleSystem       @relation(fields: [systemId], references: [id])

  @@unique([systemId, slug, source])
}

model SrdCondition {
  id              String           @id @default(cuid())
  systemId        String
  source          SrdContentSource @default(OFFICIAL_SRD)

  slug            String           // "blinded", "charmed", "poisoned", ...
  name            String
  nameEn          String?
  description     String           @db.Text

  iconName        String?          // ícone lucide-react pra exibir no token
  rawData         Json
  attribution     String?

  system          RuleSystem       @relation(fields: [systemId], references: [id])

  @@unique([systemId, slug, source])
}
```

### 4.3 Constantes (`packages/constants/src/dnd5e.ts`)

```typescript
export const DND5E_SYSTEM_SLUG = "dnd5e";

export const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type Ability = typeof ABILITIES[number];

export const ABILITY_LABELS_PT: Record<Ability, string> = {
  str: "Força", dex: "Destreza", con: "Constituição",
  int: "Inteligência", wis: "Sabedoria", cha: "Carisma",
};

export const SKILLS_BY_ABILITY: Record<Ability, string[]> = {
  str: ["athletics"],
  dex: ["acrobatics", "sleight-of-hand", "stealth"],
  con: [],
  int: ["arcana", "history", "investigation", "nature", "religion"],
  wis: ["animal-handling", "insight", "medicine", "perception", "survival"],
  cha: ["deception", "intimidation", "performance", "persuasion"],
};

export const PROFICIENCY_BONUS_BY_LEVEL: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};

export const XP_BY_LEVEL: Record<number, number> = {
  1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500,
  6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000,
  11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000,
  16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000,
};
```

## 5. Importador do SRD

### 5.1 Estrutura

```
apps/api/scripts/srd-importer/
├── src/
│   ├── index.ts                    # entry point
│   ├── sources/
│   │   ├── 5eDatabase.ts           # clone https://github.com/5e-bits/5e-database
│   │   └── officialSrd.ts          # parse SRD 5.1 PDF (manual)
│   ├── transformers/
│   │   ├── spells.ts
│   │   ├── monsters.ts
│   │   ├── items.ts
│   │   ├── races.ts
│   │   ├── classes.ts
│   │   └── features.ts
│   ├── translators/
│   │   ├── ptBR.ts                 # tradução automática Gemini + manual review
│   │   └── glossary.ts             # termos canônicos pt-BR ("hit points" → "pontos de vida")
│   ├── divergenceResolver.ts       # 5e-database vs SRD oficial
│   └── attribution.ts              # gera string CC-BY pra cada item
├── data/
│   ├── 5e-database/                # submodule git
│   ├── srd-5.1.pdf                 # baixado manualmente
│   └── glossary-pt-br.json         # termos canônicos
├── package.json
└── README.md
```

### 5.2 Pipeline

```bash
pnpm srd:fetch          # clona 5e-database, baixa PDF SRD oficial
pnpm srd:transform      # parseia, normaliza, deduplica
pnpm srd:translate      # auto-traduz com Gemini, gera diff pra revisão
pnpm srd:review         # interface CLI pra revisar traduções
pnpm srd:import         # insere no Postgres com attribution
pnpm srd:verify         # confere counts contra esperado: ~360 magias, ~330 monstros
```

### 5.3 Estratégia de tradução

- **Termos canônicos**: glossário oficial pt-BR (Jambô usa termos consagrados em Tormenta — não copiar mas referenciar para coerência: "hit points" = "pontos de vida", não "PVs").
- **Auto-tradução com Gemini Flash**: barata, rápida.
- **Cache**: nunca traduz a mesma string 2x.
- **Revisão humana opcional**: CLI mostra original + tradução + permite editar.
- **Fallback**: se sem tradução pt-BR, exibe inglês com aviso `(em tradução)`.

### 5.4 Resolvendo divergências (5e-database vs SRD oficial)

Casos comuns:
- 5e-database tem dados que **não estão no SRD** (ex: classes proibidas pelo OGL antigo). **Excluir.**
- SRD tem item que 5e-database não cobriu. **Adicionar manualmente** num arquivo `manual-additions.json`.
- Texto descritivo difere. **SRD oficial é fonte de verdade.**

Output do importador inclui relatório `divergences.md` listando o que foi resolvido.

## 6. API REST de compêndio

```
GET  /systems                                 lista sistemas (5e + outros vazios)
GET  /systems/:slug                           detalhes do sistema

GET  /systems/dnd5e/spells                    lista magias (paginado, filtros)
GET  /systems/dnd5e/spells/:slug              detalhe
GET  /systems/dnd5e/monsters                  ?cr=1-5&type=dragon
GET  /systems/dnd5e/monsters/:slug
GET  /systems/dnd5e/items                     ?category=ARMOR&rarity=RARE
GET  /systems/dnd5e/items/:slug
GET  /systems/dnd5e/races                     lista raças
GET  /systems/dnd5e/races/:slug
GET  /systems/dnd5e/classes
GET  /systems/dnd5e/classes/:slug
GET  /systems/dnd5e/conditions
GET  /systems/dnd5e/features                  ?classSlug=wizard

GET  /systems/dnd5e/search?q=fireball         busca cross-content (FTS Postgres)

# Homebrew (autenticado)
POST   /systems/:slug/spells                  GM cria magia homebrew
PATCH  /systems/:slug/spells/:id              edita (próprio)
DELETE /systems/:slug/spells/:id              remove (próprio)
GET    /campaigns/:id/homebrew                lista homebrew da campanha
```

### 6.1 Filtros e busca

- **Postgres FTS** com índice `tsvector` em `name`, `nameEn`, `description`.
- Filtros tipados: nível de magia, escola, classe, CR de monstro, tipo, raridade de item.
- Paginação cursor-based (não offset — performance em listas grandes).
- Cache Redis 1h pra listas (invalida em CUD).

## 7. Frontend — Compêndio

### 7.1 Rotas

```
apps/web/app/(dashboard)/compendium/
├── page.tsx                        # /compendium — landing por sistema
├── [systemSlug]/
│   ├── page.tsx                    # overview do sistema (badges de contagem)
│   ├── spells/
│   │   ├── page.tsx                # lista
│   │   └── [slug]/page.tsx
│   ├── monsters/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── items/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── races/
│   ├── classes/
│   ├── conditions/
│   └── features/
└── search/page.tsx                 # busca global
```

### 7.2 UX (mobile-first 390px)

- **Lista virtualizada** (react-virtual) — D&D 5e SRD tem ~360 magias, listar todas crasha mobile sem virtualização.
- **Filtros em sheet** (drawer mobile, sidebar desktop).
- **Card de magia/monstro/item** em layout vertical.
- **Detalhes em página dedicada** (não modal — usuário pode compartilhar URL: `/compendium/dnd5e/spells/fireball`).
- **Footer com atribuição CC-BY** em cada página de detalhe SRD.
- **Busca global** com keyboard shortcut Cmd+K (desktop) / botão flutuante (mobile).

### 7.3 Card de monstro (referência)

```
┌─ Goblin ─────────────────────────────┐
│ Pequeno · Humanoide (goblinoide)      │
│ ──────────────────────────────────── │
│ CA 15 (armadura de couro, escudo)    │
│ HP 7 (2d6)                           │
│ Velocidade 9 m                       │
│ ──────────────────────────────────── │
│ FOR 8 (-1)  DES 14 (+2)  CON 10 (+0) │
│ INT 10 (+0) SAB 8 (-1)   CAR 8 (-1)  │
│ ──────────────────────────────────── │
│ Visão no Escuro 18 m                 │
│ Idiomas: Comum, Goblinoide           │
│ ND 1/4 (50 XP)                       │
│ ──────────────────────────────────── │
│ ▸ Fuga Ágil                          │
│ ▸ Cimitarra (corpo a corpo)          │
│   +4 atq, 1d6+2 cortante             │
│ ▸ Arco Curto (à distância)           │
│   +4 atq, 1d6+2 perfurante           │
│ ──────────────────────────────────── │
│ [+ Adicionar à sessão] [Editar]      │
│                                      │
│ SRD 5.1 · CC-BY 4.0                  │
└──────────────────────────────────────┘
```

Botão "Adicionar à sessão" (só visível pra GM) — instancia o monstro como `Token` na sessão atual com stats já preenchidos.

---

# FASE 2 — Ficha Calculada Sistema-Aware

## 8. Modelo de Character plugável

### 8.1 Schema Prisma

```prisma
model Character {
  id            String         @id @default(cuid())
  ownerId       String         // user dono
  campaignId    String?        // ficha vive numa campanha (do prompt anterior)
  systemId      String         // referencia RuleSystem

  name          String
  portraitUrl   String?

  // Dados sistema-específicos vivem aqui (JSON validado por Zod no backend)
  data          Json           // shape varia por systemSlug

  // Cálculos derivados (cache, recalcula em cada update)
  derived       Json?          // { ac: 18, hp: 45, modifiers: {...}, attacks: [...] }

  isPublic      Boolean        @default(false)
  archivedAt    DateTime?

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  owner         User           @relation(fields: [ownerId], references: [id])
  campaign      Campaign?      @relation(fields: [campaignId], references: [id])
  system        RuleSystem     @relation(fields: [systemId], references: [id])

  @@index([ownerId])
  @@index([campaignId, systemId])
}
```

### 8.2 Schema da ficha 5e (`packages/validators/src/characters/dnd5e.ts`)

```typescript
import { z } from "zod";

export const dnd5eCharacterSchema = z.object({
  // Identidade
  level: z.number().int().min(1).max(20),
  classSlug: z.string(),         // "fighter"
  subclassSlug: z.string().optional(),
  raceSlug: z.string(),
  subraceSlug: z.string().optional(),
  background: z.string(),
  alignment: z.string().optional(),

  // Atributos base (antes de bônus de raça)
  attributes: z.object({
    str: z.number().int().min(3).max(20),
    dex: z.number().int().min(3).max(20),
    con: z.number().int().min(3).max(20),
    int: z.number().int().min(3).max(20),
    wis: z.number().int().min(3).max(20),
    cha: z.number().int().min(3).max(20),
  }),

  // Pontos de vida
  hpMax: z.number().int().min(1),       // user define ao subir nível
  hpCurrent: z.number().int().min(0),
  hpTemp: z.number().int().min(0).default(0),
  hitDiceUsed: z.number().int().min(0).default(0),

  // Proficiências (subset do que a classe oferece)
  skillProficiencies: z.array(z.string()),
  expertiseSkills: z.array(z.string()).default([]),  // Ladino dobra bônus
  savingThrowProficiencies: z.array(z.enum(ABILITIES)),
  toolProficiencies: z.array(z.string()).default([]),
  languages: z.array(z.string()),

  // Inventário
  equipment: z.array(z.object({
    itemSlug: z.string(),                    // referencia SrdItem
    quantity: z.number().int().min(1).default(1),
    equipped: z.boolean().default(false),    // armadura/arma equipada conta no cálculo
    attuned: z.boolean().default(false),
    notes: z.string().optional(),
  })),

  // Magias
  spells: z.array(z.object({
    spellSlug: z.string(),
    prepared: z.boolean().default(true),     // mago/clérigo precisam preparar
  })).default([]),
  spellSlotsExpended: z.record(z.string(), z.number().int().min(0)).default({}),
  // { "1": 2, "3": 1 } = 2 slots de nível 1 e 1 de nível 3 gastos

  // Recursos de classe
  resources: z.array(z.object({
    name: z.string(),                        // "Ki", "Inspiração Bárdica", "Ação Surto"
    current: z.number().int().min(0),
    max: z.number().int().min(0),
    rechargeOn: z.enum(["SHORT_REST", "LONG_REST", "DAWN", "MANUAL"]),
  })).default([]),

  // Recursos de morte
  deathSavesSuccesses: z.number().int().min(0).max(3).default(0),
  deathSavesFailures: z.number().int().min(0).max(3).default(0),

  // Notas e personalidade
  personalityTraits: z.string().optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  notes: z.string().optional(),
});

export type Dnd5eCharacter = z.infer<typeof dnd5eCharacterSchema>;
```

### 8.3 Engine de cálculo

`packages/engine/src/systems/dnd5e/`:

```typescript
// abilityModifier.ts
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// proficiencyBonus.ts
export function proficiencyBonus(level: number): number {
  return PROFICIENCY_BONUS_BY_LEVEL[level];
}

// armorClass.ts
export interface ArmorClassContext {
  attributes: { dex: number; con?: number; wis?: number };
  equippedArmor?: SrdItem;
  equippedShield?: SrdItem;
  classSlug: string;
  classFeatures: SrdFeature[];
  bonusModifiers: Array<{ source: string; value: number }>;
}

export function calculateArmorClass(ctx: ArmorClassContext): {
  total: number;
  breakdown: Array<{ source: string; value: number }>;
} {
  const dexMod = abilityModifier(ctx.attributes.dex);
  let breakdown: Array<{ source: string; value: number }> = [];
  let base = 10 + dexMod;
  breakdown.push({ source: "Base (10 + Des)", value: base });

  // Armadura
  if (ctx.equippedArmor) {
    const armor = ctx.equippedArmor.armorClass as { base: number; dexBonus: boolean; maxDexBonus?: number };
    if (armor.dexBonus) {
      const cappedDex = armor.maxDexBonus !== undefined
        ? Math.min(dexMod, armor.maxDexBonus)
        : dexMod;
      base = armor.base + cappedDex;
      breakdown = [{ source: `${ctx.equippedArmor.name} (${armor.base}${armor.maxDexBonus !== undefined ? ` + Des limitada a ${armor.maxDexBonus}` : ' + Des'})`, value: base }];
    } else {
      base = armor.base;
      breakdown = [{ source: ctx.equippedArmor.name, value: base }];
    }
  } else {
    // Defesa Sem Armadura — Bárbaro: 10 + Des + Con
    if (ctx.classSlug === "barbarian") {
      base = 10 + dexMod + abilityModifier(ctx.attributes.con!);
      breakdown = [{ source: "Defesa Sem Armadura (Bárbaro)", value: base }];
    }
    // Monge: 10 + Des + Sab
    else if (ctx.classSlug === "monk") {
      base = 10 + dexMod + abilityModifier(ctx.attributes.wis!);
      breakdown = [{ source: "Defesa Sem Armadura (Monge)", value: base }];
    }
  }

  // Escudo
  if (ctx.equippedShield) {
    base += 2;
    breakdown.push({ source: ctx.equippedShield.name, value: 2 });
  }

  // Bônus extras
  for (const bonus of ctx.bonusModifiers) {
    base += bonus.value;
    breakdown.push(bonus);
  }

  return { total: base, breakdown };
}

// skillModifier.ts
export function calculateSkillModifier(
  skill: string,
  attributes: Record<Ability, number>,
  proficient: boolean,
  expertise: boolean,
  level: number,
): number {
  const ability = getAbilityForSkill(skill);  // do SKILLS_BY_ABILITY
  const abilityMod = abilityModifier(attributes[ability]);
  const profBonus = proficient ? proficiencyBonus(level) : 0;
  const expertiseBonus = expertise ? proficiencyBonus(level) : 0;
  return abilityMod + profBonus + expertiseBonus;
}

// attackBonus.ts
export interface AttackContext {
  weapon: SrdItem;
  attributes: Record<Ability, number>;
  level: number;
  proficient: boolean;
  fightingStyle?: string;
}

export function calculateAttackBonus(ctx: AttackContext): {
  bonus: number;
  damageBonus: number;
  ability: Ability;
} {
  const isFinesse = ctx.weapon.weaponProperties.includes("finesse");
  const isRanged = ctx.weapon.subcategory?.includes("RANGED");

  let ability: Ability;
  if (isRanged) ability = "dex";
  else if (isFinesse) {
    // usa o maior entre Força e Destreza
    ability = abilityModifier(ctx.attributes.str) >= abilityModifier(ctx.attributes.dex) ? "str" : "dex";
  } else ability = "str";

  const abilityMod = abilityModifier(ctx.attributes[ability]);
  const profBonus = ctx.proficient ? proficiencyBonus(ctx.level) : 0;

  return {
    bonus: abilityMod + profBonus,
    damageBonus: abilityMod,
    ability,
  };
}

// spellSlots.ts (tabela do SRD)
export function getSpellSlotsByClassAndLevel(classSlug: string, level: number, subclass?: string): Record<number, number> {
  // tabela completa do SRD pra cada classe
  // wizard, sorcerer, bard, cleric, druid, warlock (especial), ranger, paladin (meia-progressão)
  // eldritch knight (fighter), arcane trickster (rogue) — meia-progressão de truques
}

// derive.ts — orquestrador
export function deriveDnd5eCharacter(
  data: Dnd5eCharacter,
  srdData: { class: SrdClass; race: SrdRace; items: SrdItem[]; spells: SrdSpell[] }
): Dnd5eDerivedStats {
  // chama cada calculator e retorna estrutura completa pra ficha viva
  return {
    armorClass: calculateArmorClass(...),
    initiative: abilityModifier(data.attributes.dex) + ...,
    hitPointsMax: ...,
    proficiencyBonus: proficiencyBonus(data.level),
    skills: ALL_SKILLS.map(s => ({ skill: s, modifier: calculateSkillModifier(...) })),
    savingThrows: ABILITIES.map(...),
    attacks: data.equipment.filter(e => e.equipped && isWeapon).map(e => ({
      name: e.item.name,
      bonus: calculateAttackBonus(...),
      damage: ...,
    })),
    spellSlots: getSpellSlotsByClassAndLevel(...),
    spellSaveDc: 8 + proficiencyBonus + abilityModifier(spellcastingAbility),
    spellAttackBonus: proficiencyBonus + abilityModifier(spellcastingAbility),
  };
}
```

### 8.4 Quando recalcular

- Ao salvar `Character.data` (sempre — derived é cache).
- Ao mudar conteúdo SRD referenciado (raro — emit `srd:updated` → recalcular fichas afetadas em batch).
- Ao trocar item equipado (UI dispara mutation com optimistic update).

### 8.5 Wizard de criação

Multi-step (10 passos):

1. Sistema (5e)
2. Raça (escolhe raça, subraça se houver)
3. Classe (escolhe classe, subclasse no nível 3)
4. Background
5. Atributos (point buy ou rolagem 4d6dl)
6. Perícias (escolher subset oferecido pela classe + background)
7. Equipamento inicial (escolher entre as opções da classe)
8. Magias (se classe conjura — escolher truques + magias preparadas)
9. Detalhes (nome, alinhamento, traços de personalidade)
10. Revisão e confirmação

Cada step:
- Valida com Zod
- Pré-popula próximo step baseado em escolhas (ex: classe Mago → step 7 oferece equipamento de Mago)
- Pode voltar e editar

### 8.6 Ficha viva

Tela `/characters/[id]`:

```
┌─ Cabeçalho ──────────────────────────┐
│ [retrato] Aelar · Elfo · Mago Nv 5    │
│           Sábio Acólito · Caótico Bom │
│           HP: 28/32 · CA 12 · Iniciat: +3 │
└──────────────────────────────────────┘

┌─ Tabs ───────────────────────────────┐
│ [Atributos] [Combate] [Magias] [Inv] │
│ [Habilidades] [Notas]                 │
└──────────────────────────────────────┘

[atributos: 6 cards FOR/DES/CON/INT/SAB/CAR]
[perícias: lista com clique pra rolar]
[teste de salvação: 6 botões]
[ataques: lista, clique pra rolar (integra com prompt de ataque/dano)]
[magias: por nível, slots visuais]
[inventário: itens equipados/não equipados]
```

**Auto-cálculo visível**: tooltip em cada valor mostra como foi calculado.
Exemplo: hover na CA 17 mostra "Cota de malha (16) + Escudo (+2) - 1 (Cota = max Des +2, mas Des é +0)".

---

# FASE 3 — IA Assistente com SRD em RAG

## 9. Arquitetura RAG

```
┌────────────┐                         ┌──────────────┐
│   Usuário  │ ─── pergunta pt-BR ───→ │  GM Console  │
└────────────┘                         └──────┬───────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ /api/ai/query│
                                       └──────┬───────┘
                                              │
                          ┌───────────────────┼──────────────────┐
                          ▼                   ▼                  ▼
                  ┌────────────┐      ┌────────────┐    ┌────────────┐
                  │  pgvector  │      │   Gemini   │    │   Cache    │
                  │ (embeds)   │      │   2.5 Flash│    │  Redis     │
                  └────────────┘      └────────────┘    └────────────┘
```

### 9.1 Pipeline

1. **Chunkar SRD em pedaços de ~512 tokens** com metadata (tipo, slug, nome).
2. **Gerar embeddings** com `text-embedding-004` (Gemini) ou `gemini-embedding-exp-03-07`.
3. **Armazenar em pgvector** (Postgres extension) — evita Pinecone, mantém stack.
4. **Query do usuário** → embedding → top-K similares (cosine distance).
5. **Prompt template** com chunks recuperados + pergunta → Gemini Flash.
6. **Stream resposta** pra UI com SSE.
7. **Cache de queries comuns** em Redis (1h TTL).

### 9.2 Schema

```prisma
model SrdChunk {
  id            String                    @id @default(cuid())
  systemId      String
  contentType   String                    // "spell", "monster", "rule", "item"
  contentSlug   String                    // referência ao SRD original
  content       String                    @db.Text
  metadata      Json                      // { name, level, school, etc. }
  embedding     Unsupported("vector(768)") // pgvector
  createdAt     DateTime                  @default(now())

  @@index([systemId, contentType])
}
```

### 9.3 Casos de uso (MVP de IA)

| Caso | Prompt UI | Endpoint |
|---|---|---|
| **Explicar regra** | "Como funciona Ataque de Oportunidade?" | `/api/ai/explain` |
| **Gerar NPC** | "Crie um goblin chefe ND 3" | `/api/ai/generate-npc` |
| **Sugerir encontro** | "Encontro pra grupo de 4 personagens nível 5" | `/api/ai/suggest-encounter` |
| **Sugerir build** | "Build de Mago controlador 5e" | `/api/ai/suggest-build` |
| **Resumir magia** | (botão "Resumir" em cada magia) | `/api/ai/summarize-spell` |
| **Tradução de termo** | "O que é 'Pact of the Chain'?" | `/api/ai/glossary` |

### 9.4 Geração estruturada

Para casos como "Gerar NPC", a resposta deve ser **JSON estruturado** que valida contra Zod e pode virar `SrdMonster` direto:

```typescript
// Prompt instrui Gemini: "Responda APENAS com JSON no formato:"
const generatedNpcSchema = z.object({
  name: z.string(),
  size: z.string(),
  type: z.string(),
  challengeRating: z.number(),
  armorClass: z.number(),
  hitPoints: z.number(),
  speed: z.object({ walk: z.number(), fly: z.number().optional() }),
  attributes: z.object({ str: z.number(), dex: z.number(), /* ... */ }),
  actions: z.array(z.object({ name: z.string(), description: z.string() })),
});

// Service valida → mostra preview pra GM → GM aprova → cria como SrdMonster (HOMEBREW_CAMPAIGN)
```

### 9.5 Custos e limites

- Gemini Flash 2.5 é barato (~$0.075/1M tokens input, $0.30/1M output em 2025).
- Estimativa: 1 query média = ~3K tokens input + 500 output = $0.0004.
- **Limite por plano:**
  - **FREE:** 5 queries/dia (atrai ao Aventureiro)
  - **AVENTUREIRO:** 50/dia
  - **LENDÁRIO:** ilimitado (rate limit 1/segundo anti-abuso)
- Tracking via `AiUsage` table. Reset diário às 00:00 UTC.

### 9.6 UX

- **Painel "Mestre IA"** no sidebar do gameplay (só GM).
- Quick-actions: botões pré-prontos ("Gerar NPC", "Sugerir encontro", "Explicar regra")
- Free-form chat com histórico por sessão.
- Resposta com cards clicáveis (NPC gerado tem botão "Adicionar à sessão" → cria token).
- Streaming visível (incrementa caracter por caracter).
- Atribuição "Powered by Gemini · usa SRD 5.1 (CC-BY 4.0)" no rodapé.

---

## 10. Permissões e segurança

### 10.1 Permissões

| Ação | OWNER campanha | CO_GM | PLAYER | SPECTATOR |
|---|:-:|:-:|:-:|:-:|
| Ver compêndio público | ✓ | ✓ | ✓ | ✓ |
| Criar homebrew na campanha | ✓ | ✓ | ✗ | ✗ |
| Criar ficha 5e | ✓ | ✓ | ✓ | ✗ |
| Editar própria ficha | ✓ | ✓ | ✓ | ✗ |
| Editar ficha alheia | ✓ | ✓ | ✗ | ✗ |
| Usar IA (queries) | ✓* | ✓* | ✗ | ✗ |
| Adicionar monstro à sessão | ✓ | ✓ | ✗ | ✗ |

*PLAYER não usa IA por padrão. GM pode habilitar via `campaign.allowPlayerAI`.

### 10.2 Anti-abuso IA

- Rate limit por plano + IP secundário.
- Queries com termos suspeitos (jailbreak attempts) viram log + bloqueio temporário do user.
- Sistema de report — qualquer usuário pode reportar resposta inadequada → revisão.

### 10.3 LGPD

- Conversas com IA contêm dados pessoais? Pode conter (notas de campanha do GM).
- Opt-out de logging: setting "Não armazenar minhas conversas com IA".
- Ao deletar conta, deletar `AiQuery` + `AiUsage` em cascade.
- Não enviar dados de PII pra Gemini sem consentimento explícito.

---

## 11. Performance e escalabilidade

### 11.1 Compêndio
- Listagem `GET /spells` deve retornar 50 itens em < 100ms (índice composto + cursor).
- Detalhe individual em < 50ms.
- Cache Redis 1h em listas; invalidação em CUD.

### 11.2 Ficha
- Recálculo derived: < 50ms client-side (engine puro). Backend recalcula no save.
- `GET /characters/:id` retorna data + derived em < 80ms.

### 11.3 IA
- Query → primeira palavra na resposta: < 1.5s (Gemini Flash + retrieval pgvector).
- Resposta completa: 3-8s típico.
- Streaming via SSE (não websocket — não precisa bidir aqui).

### 11.4 Importador
- Job offline. Sem requisito de tempo. Pode levar 30min na primeira execução.

---

## 12. Critérios de aceitação por fase

### Fase 1 — Compêndio (entrega independente)

- [ ] `pnpm srd:import` popula DB com **>= 350 magias, >= 320 monstros, >= 100 itens, >= 9 raças, >= 12 classes, >= 14 condições**.
- [ ] Cada conteúdo SRD tem `attribution` válida CC-BY 4.0.
- [ ] Página `/legal/srd-attribution` existe e está linkada de cada card.
- [ ] Compêndio navegável em pt-BR (auto-tradução pode ter lacunas, mas inglês é fallback explícito).
- [ ] Busca FTS retorna resultados em < 200ms.
- [ ] Lista virtualizada — não trava ao rolar 360 magias em iPhone 12.
- [ ] GM pode adicionar monstro à sessão (cria Token com stats SRD).
- [ ] Homebrew CRUD funciona com permissões (campaignId).

### Fase 2 — Ficha (depende da Fase 1)

- [ ] Wizard de 10 steps cria personagem 5e válido.
- [ ] Auto-cálculo correto pra: CA, modificadores de atributo, perícias, ataques, slots de magia, save DC, attack bonus.
- [ ] Tooltip mostra breakdown de cada cálculo.
- [ ] Trocar arma equipada recalcula ataque em < 100ms.
- [ ] Trocar armadura recalcula CA em < 100ms.
- [ ] Defesa Sem Armadura de Bárbaro/Monge funciona.
- [ ] Ficha integra com sistema de combate (clicar em ataque dispara prompt do `questboard-attack-damage-prompt.md`).
- [ ] Ficha de T20/Ordem/Cthulhu carrega schema vazio sem crashar.

### Fase 3 — IA (depende da Fase 1)

- [ ] Embeddings de SRD geradas e armazenadas em pgvector.
- [ ] Query "como funciona ataque de oportunidade" retorna resposta correta com citação ao SRD.
- [ ] "Gerar goblin chefe ND 3" produz JSON válido que pode virar SrdMonster homebrew.
- [ ] "Encontro pra grupo nível 5" sugere combinações balanceadas.
- [ ] Streaming SSE funciona (caractere por caractere).
- [ ] Limites por plano respeitados (FREE bloqueado após 5/dia).
- [ ] LGPD: opt-out de logging funciona.
- [ ] Atribuição "Powered by Gemini" + SRD CC-BY visível.

---

## 13. Fora do escopo (declarado, fica pra fase 4+)

- **Multiclasse** (Mago/Clérigo)
- **Subclasses de níveis 11+** (Way of the Astral Self do Monge, etc.)
- **Itens mágicos do DMG** (apenas SRD no MVP)
- **Combate em massa** (Bestiary mass combat)
- **Variant rules** (flanking, gritty realism)
- **Conditions com efeitos automáticos** (envenenado aplicar dano automático em turno)
- **Sub-races além das do SRD** (apenas as 9 do SRD oficial)
- **Backgrounds além dos do SRD**
- **Tormenta20/Ordem/Cthulhu com conteúdo** (apenas estrutura vazia no MVP)
- **D&D 2024 (One D&D)** — usar apenas 5e clássico (2014)
- **Importar Roll20/Foundry** characters
- **Print de ficha PDF** (Aventureiro/Lendário podem ter — fase 4)
- **Compartilhamento público de ficha** com URL única

---

## 14. Ordem de implementação

### Sprint 1-2 (Fase 1 — fundação)
1. Migration: RuleSystem, Srd* tables com pgvector extension habilitada.
2. Importador básico: 5e-database → Postgres (sem tradução ainda, em inglês).
3. API REST `/systems/dnd5e/{spells,monsters,...}`.
4. Frontend compêndio com listas virtualizadas + filtros.
5. Página de atribuição CC-BY.

### Sprint 3 (Fase 1 — refinamento)
6. Auto-tradução com Gemini + glossário pt-BR.
7. Resolução de divergências contra SRD oficial.
8. Busca FTS Postgres.
9. CRUD de homebrew na campanha.
10. "Adicionar à sessão" pra monstros.

### Sprint 4-5 (Fase 2 — ficha)
11. Schema Character plugável + dnd5e schema Zod.
12. Engine puro de cálculo (`packages/engine/src/systems/dnd5e/`).
13. Testes unitários do engine (>= 95% coverage).
14. Wizard de 10 steps.
15. Ficha viva com tabs.

### Sprint 6 (Fase 2 — refinamento)
16. Tooltips de breakdown.
17. Integração com combate (clicar ataque → prompt de dano).
18. Edição de equipamento equipado.
19. Inventário com peso e capacidade.

### Sprint 7-8 (Fase 3 — IA)
20. Pipeline de embeddings: chunkar + indexar SRD em pgvector.
21. Endpoint `/api/ai/query` com retrieval.
22. Streaming SSE.
23. Casos de uso: explicar, gerar NPC, sugerir encontro.
24. UI do painel Mestre IA.
25. Limites por plano + tracking de uso.

### Sprint 9 (polish)
26. Telemetria (qual conteúdo SRD é mais consultado, quais queries IA).
27. Cache otimização.
28. Performance audit (mobile fluido).
29. Documentação pt-BR pra usuários.

**Cada sprint termina com:** TS limpo (`tsc --noEmit`), testes verdes, commit em pt-BR descritivo, deploy em staging com smoke test E2E.

---

## 15. Pendências para o Lucas decidir antes de começar

1. **pgvector ou Pinecone pra embeddings?**
   *Sugiro pgvector — mantém stack, sem custo de SaaS adicional. Pinecone seria caro e desnecessário no início.*

2. **Auto-tradução do SRD: revisão humana opcional ou obrigatória antes de publicar?**
   *Sugiro opcional. Lança com auto-tradução (~80% boa), com flag "tradução em revisão", e usuários reportam erros via thumbs-down.*

3. **GMs podem editar conteúdo SRD oficial diretamente? (não — só criar homebrew baseado nele).**
   *Sugiro **não**. Conteúdo OFFICIAL_SRD é read-only. GM pode duplicar como HOMEBREW_CAMPAIGN e editar.*

4. **Quanto tempo cabe pra fase 1 antes de avaliar?**
   *Sugiro 4 semanas. Se passar disso, simplificar (skip tradução automática, lança em inglês).*

5. **Limite IA do FREE: 5/dia confirma? Ou 0 (só pago tem)?**
   *Sugiro 5/dia — hooka usuário FREE ao valor da feature pra converter.*

6. **Embeddings e queries IA podem ser logadas pra debug? (LGPD)**
   *Sugiro **sim com opt-out**. Default ligado, setting clara pra desligar. Necessário pra debugar.*