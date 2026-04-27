# QuestBoard — Tema Visual: Cristal Diamante

> **Este documento complementa** `questboard-attack-damage-prompt.md`.
> Ambos devem ser lidos pelo Claude Code antes de implementar.
> O primeiro define a feature. Este define a aparência exata.

---

## 1. Decisão visual

Dados são renderizados como **cristais translúcidos lapidados em tom diamante**, não como dados de plástico opaco tradicionais. Diferencial estético do QuestBoard contra concorrentes (Roll20, Foundry) que usam temas saturados.

- **Faces translúcidas** com transmissão de luz (efeito de vidro/diamante)
- **Bordas/arestas sempre visíveis** — leitura clara mesmo em rotação rápida
- **Números em fill brilhante** com leve emissão (auto-iluminados)
- **Cor varia por contexto** (ataque, dano, elemento, crítico, fumble)
- **Sem cores saturadas de jogo de tabuleiro infantil** — paleta gélida, sofisticada

Demo visual aprovado pelo Lucas — os parâmetros abaixo reproduzem essa estética em produção.

---

## 2. Paleta oficial do tema

### 2.1 Cor primária por contexto

| Contexto | Cor base (cristal) | Brilho (highlight) | Usado em |
|---|---|---|---|
| Ataque (d20) | `#a5f3fc` (cyan-300) | `#67e8f9` (cyan-400) | Toda rolagem de d20 |
| Dano físico | `#f0abfc` (fuchsia-300) | `#e879f9` (fuchsia-400) | Cortante, perfurante, contundente |
| Dano fogo | `#fcd34d` (amber-300) | `#f59e0b` (amber-500) | Bola de Fogo, etc |
| Dano gelo | `#bfdbfe` (blue-200) | `#60a5fa` (blue-400) | Raio de Frio, etc |
| Dano elétrico | `#c4b5fd` (violet-300) | `#8b5cf6` (violet-500) | Raio, etc |
| Dano ácido | `#bef264` (lime-300) | `#84cc16` (lime-500) | Esguicho Ácido |
| Dano necrótico | `#cbd5e1` (slate-300) | `#94a3b8` (slate-400) | Toque Vampírico |
| Dano radiante | `#fde68a` (amber-200) | `#fbbf24` (amber-400) | Castigar Maligno |
| Cura (fase 2) | `#bbf7d0` (green-200) | `#4ade80` (green-400) | Fase 2 |

### 2.2 Overlays especiais

| Estado | Efeito |
|---|---|
| Crítico (20 natural) | Borda dourada `#fde68a` pulsa por 800ms ao revelar; glow intensifica |
| Fumble (1 natural) | Cristal **escurece** por 600ms (`#475569` slate-600 sobreposto), aparenta "rachar" |
| Vantagem (rola 2d20) | Os dois dados rolam juntos, o **descartado** desvanece após revelar |
| Desvantagem | Idem, mas o descartado é o de maior valor |

### 2.3 Cor do número (fill)

Sempre o tom mais claro da família (-50/-100), com leve emissão na cor base:

| Família | Cor do fill | Emissive (glow interno) |
|---|---|---|
| Ataque (cyan) | `#ecfeff` | `#a5f3fc` intensidade 0.4 |
| Dano físico (fuchsia) | `#fae8ff` | `#f0abfc` intensidade 0.4 |
| Dano fogo (amber) | `#fffbeb` | `#fcd34d` intensidade 0.5 |
| Dano gelo (blue) | `#eff6ff` | `#bfdbfe` intensidade 0.4 |
| ... | (segue mesmo padrão) | ... |

---

## 3. Implementação com `@3d-dice/dice-box`

### 3.1 Instalação e setup base

```bash
pnpm add @3d-dice/dice-box --filter @questboard/web
```

```ts
// apps/web/lib/dice-box-config.ts
export const DICE_BOX_CONFIG = {
  assetPath: "/dice/",
  theme: "questboard-crystal",      // tema custom — ver seção 3.2
  scale: 6,
  gravity: 1.2,
  mass: 1,
  friction: 0.85,
  restitution: 0.4,
  shadowTransparency: 0.5,
  enableShadows: true,
  lightIntensity: 0.95,
  spinForce: 6,
  throwForce: 5,
} as const;
```

### 3.2 Criar tema custom

`@3d-dice/dice-box` aceita temas custom em `public/dice/themes/{nome-tema}/`. Estrutura mínima:

```
public/dice/themes/questboard-crystal/
├── theme.json
├── theme.config.json
└── (sem texturas — material é puro PBR)
```

**`theme.json`:**

```json
{
  "name": "QuestBoard Crystal",
  "version": "1.0.0",
  "author": "QuestBoard",
  "material": {
    "type": "physical",
    "transmission": 1.0,
    "thickness": 0.5,
    "roughness": 0.05,
    "ior": 2.4,
    "metalness": 0.0,
    "clearcoat": 1.0,
    "clearcoatRoughness": 0.05,
    "color": "#a5f3fc",
    "emissive": "#0d4a5c",
    "emissiveIntensity": 0.15,
    "envMapIntensity": 1.5
  },
  "numbers": {
    "color": "#ecfeff",
    "emissive": "#a5f3fc",
    "emissiveIntensity": 0.4,
    "fontFamily": "DM Sans",
    "fontWeight": 600,
    "depth": 0.05
  }
}
```

> **⚠️ Tarefa de pesquisa pro Claude Code:** o `@3d-dice/dice-box` por padrão usa `MeshStandardMaterial`. Pra usar `MeshPhysicalMaterial` com `transmission` e `ior` (que produzem o efeito diamante real), pode ser necessário:
> 1. **Caminho A — patch interno:** modificar a função de carregamento de tema no dice-box pra detectar `material.type === "physical"` e instanciar `MeshPhysicalMaterial`. Forkar ou contribuir upstream.
> 2. **Caminho B — pós-mount override:** após `diceBox.init()`, iterar pela cena Three.js exposta e substituir os materiais por `MeshPhysicalMaterial` programaticamente.
> 3. **Caminho C — tema com aproximação:** usar `MeshStandardMaterial` com `metalness: 0.7, roughness: 0.05, opacity: 0.65, transparent: true, color: #a5f3fc`. **Não é cristal verdadeiro** mas é 80% do efeito sem hack.
>
> **Recomendação:** começar com **Caminho C** (já fica bonito), avaliar se vale Caminho B em uma sprint posterior.

### 3.3 Múltiplos temas (variantes por contexto)

Criar um tema por família de cor. Estrutura:

```
public/dice/themes/
├── questboard-crystal-cyan/      # ataque (d20)
├── questboard-crystal-fuchsia/   # dano físico
├── questboard-crystal-amber/     # dano fogo
├── questboard-crystal-blue/      # dano gelo
├── questboard-crystal-violet/    # dano elétrico
├── questboard-crystal-lime/      # dano ácido
├── questboard-crystal-slate/     # dano necrótico
└── questboard-crystal-gold/      # dano radiante / crítico
```

Em código, mapear `DamageType` → tema:

```ts
// packages/constants/src/dice-themes.ts
export const DAMAGE_TYPE_TO_DICE_THEME: Record<DamageType, string> = {
  TRUE: "questboard-crystal-fuchsia",
  BLUDGEONING: "questboard-crystal-fuchsia",
  SLASHING: "questboard-crystal-fuchsia",
  PIERCING: "questboard-crystal-fuchsia",
  FIRE: "questboard-crystal-amber",
  COLD: "questboard-crystal-blue",
  LIGHTNING: "questboard-crystal-violet",
  THUNDER: "questboard-crystal-violet",
  ACID: "questboard-crystal-lime",
  POISON: "questboard-crystal-lime",
  PSYCHIC: "questboard-crystal-fuchsia",
  NECROTIC: "questboard-crystal-slate",
  RADIANT: "questboard-crystal-gold",
  FORCE: "questboard-crystal-cyan",
};

export const ATTACK_DICE_THEME = "questboard-crystal-cyan";  // d20 sempre ciano
```

### 3.4 Disparar rolagem com tema correto

```ts
// apps/web/app/(dashboard)/gameplay/[id]/_components/combat/DiceCanvas.tsx
useEffect(() => {
  if (!config || !diceBoxRef.current) return;

  const box = diceBoxRef.current;
  const damageTheme = DAMAGE_TYPE_TO_DICE_THEME[config.damageType];

  // d20 ataque (1 ou 2 com vantagem) com tema ciano
  const d20Notation = config.results.flatMap(r =>
    r.d20Rolls.map(value => ({ qty: 1, sides: 20, value, theme: ATTACK_DICE_THEME }))
  );

  // dado(s) de dano com tema da cor do tipo
  const damageNotation = config.results.flatMap(r =>
    r.damageRolls.map(value => ({ qty: 1, sides: r.damageSides, value, theme: damageTheme }))
  );

  box.roll([...d20Notation, ...damageNotation])
    .then(() => {
      // crítico: dispara overlay dourado
      if (config.results.some(r => r.isCrit)) triggerCritOverlay();
      if (config.results.some(r => r.isFumble)) triggerFumbleOverlay();
      setTimeout(onAnimationComplete, DICE_FREEZE_BEFORE_RESULT_MS);
    });
}, [config]);
```

---

## 4. Critérios de aceitação visual

Em adição aos critérios do prompt principal, validar:

### 4.1 Estética
- [ ] Dado parece **cristal**, não plástico — bordas visíveis, faces translúcidas (mesmo no Caminho C de aproximação).
- [ ] Número da face frontal é legível em **qualquer ângulo** durante rotação (acima de 120° de tilt).
- [ ] Número **não atravessa** o dado (não aparece espelhado da face oposta).
- [ ] Bordas têm contraste suficiente sobre fundo dark navy (`#04090f`) e sobre fundos claros (settings/preview).
- [ ] Cor do dado **muda visivelmente** entre tipos de dano (teste lado a lado: fogo vs gelo vs ácido devem ser distinguíveis em meio segundo).

### 4.2 Comportamento
- [ ] Crítico aciona overlay dourado pulsando por 800ms.
- [ ] Fumble escurece o cristal por 600ms.
- [ ] Vantagem/desvantagem rola 2 dados, descartado desvanece com fade-out 400ms.
- [ ] Animação total: ~2.2s (dice-box default) + 200ms freeze antes de aplicar HP.
- [ ] `prefers-reduced-motion`: **sem rolagem 3D**, fallback 2D — ver seção 5.

### 4.3 Performance
- [ ] 60fps em iPhone 12 / Pixel 6 com até 8 dados simultâneos (multi-alvo).
- [ ] iPhone SE (2020): toggle 2D liga automaticamente OU dá < 30fps com aviso.
- [ ] Bundle do `dice-box` em chunk separado — não cresce o initial bundle do gameplay.
- [ ] Carregamento dos temas é **lazy** (só carrega o tema do dano usado).

---

## 5. Fallback 2D — variante cristal

Quando 3D desabilitado (setting do usuário, low-end detectado, ou `prefers-reduced-motion`):

### 5.1 Renderização
- SVG inline, **mesma paleta cristal** (não troca pra plástico).
- Forma: hexágono (lê como "dado" universalmente em 2D).
- Stroke: 1.5px na cor base do contexto.
- Fill: `rgba(<cor base>, 0.08)`.
- Número central, fonte DM Sans 600, cor `#ecfeff` com `text-shadow: 0 0 8px <cor base>`.

### 5.2 Animação
- Spinner: hexágono rotaciona 720° em 1s com `cubic-bezier(0.2, 0.8, 0.3, 1)`.
- Número embaralha rapidamente nesse 1s (cycling random a cada 60ms).
- Ao parar: número final aparece com pequeno scale-bounce (1.0 → 1.15 → 1.0 em 250ms).
- Crítico: borda dourada pulsa pós-revelação.

### 5.3 Exemplo de markup

```tsx
// apps/web/app/(dashboard)/gameplay/[id]/_components/combat/DiceFallback2D.tsx
function CrystalDie2D({ value, kind, theme }: Props) {
  const stroke = THEME_COLORS[theme].base;
  const fill = THEME_COLORS[theme].fill;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="qb-die-2d">
      <polygon
        points="36,4 64,20 64,52 36,68 8,52 8,20"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        style={{ filter: `drop-shadow(0 0 6px ${stroke})` }}
      />
      <text
        x="36" y="44"
        fontFamily="DM Sans"
        fontWeight="600"
        fontSize="22"
        fill="#ecfeff"
        textAnchor="middle"
        style={{ textShadow: `0 0 8px ${stroke}` }}
      >
        {value}
      </text>
    </svg>
  );
}
```

---

## 6. Sons combinando com o tema

Atualizar a lista de sons da seção 7 do prompt principal — substituir sons "de plástico/madeira" por timbres cristalinos:

| Evento | Arquivo | Descrição |
|---|---|---|
| Início rolagem | `crystal-shake.mp3` | Cristais entrechocando-se levemente |
| Pouso de cada dado | `crystal-clink.mp3` | Tinido alto e curto, agudo |
| Acerto normal | `crystal-tap.mp3` | Tap seco, sem ressonância longa |
| Crítico | `crystal-chime-bright.mp3` | Acorde ascendente curto, glissando ascendente |
| Fumble | `crystal-crack.mp3` | Som de vidro rachando (curto, sem quebra) |
| Dano aplicado | `crystal-pulse.mp3` | Pulso grave + harmônico agudo |

Fontes recomendadas (todas livres ou licenciáveis):
- [Freesound](https://freesound.org/) — busca por "crystal", "glass tap", "chime"
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/) — categoria "magic"
- Evitar: sons de "dice rolling" tradicionais (madeira, plástico) — quebram a coerência estética

---

## 7. Aviso de implementação

**O Caminho C (aproximação com `MeshStandardMaterial`) é aceitável para o MVP.** O cristal "real" com refração de luz e transmissão de luz é um upgrade visual de fase 2.

Se o Claude Code não conseguir alcançar o efeito ideal no `@3d-dice/dice-box` em uma sprint, o critério de aceitação é:

> **"Visualmente parece cristal/diamante para um observador não-técnico em 2 segundos de visualização."**

Não é "fisicamente correto Three.js". É vibe certa.

Se for necessário escolher entre **fidelidade física** e **prazo**, sempre escolher prazo. O dice-box já tem ótimos padrões — começar com `metalness: 0.7, roughness: 0.05, opacity: 0.65, transparent: true` e iterar.

---

## 8. Resumo das decisões finais

| Item | Escolha |
|---|---|
| Estilo dos dados | Cristal/diamante translúcido com bordas visíveis |
| Renderização 3D | `@3d-dice/dice-box` com tema custom `questboard-crystal-*` |
| Material PBR | Caminho C (aproximação) no MVP, Caminho B em fase 2 |
| Variação por contexto | Tema diferente por `DamageType` (8 variantes de cor) |
| Crítico | Overlay dourado pulsando 800ms |
| Fumble | Cristal escurece 600ms |
| Fallback 2D | Hexágono SVG mesma paleta + spinner 1s |
| Sons | Tinidos cristalinos (não madeira/plástico) |
| Performance alvo | 60fps em iPhone 12, fallback automático em SE |

---

## 9. Como mandar pro Claude Code

```
LEIA AMBOS os documentos antes de começar:
1. questboard-attack-damage-prompt.md   (feature completa)
2. questboard-attack-damage-visual-theme.md  (este documento — aparência)

Implemente conforme o prompt principal, aplicando o tema visual deste documento.
Em caso de conflito de instruções, este documento (visual) prevalece sobre
o prompt principal nas decisões estéticas — APENAS estéticas. Lógica, schema,
permissões e arquitetura seguem o prompt principal.
```