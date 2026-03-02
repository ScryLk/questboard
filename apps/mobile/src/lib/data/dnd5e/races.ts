import {
  User,
  Eye,
  Target,
  Sparkles,
  Moon,
  Swords,
  BookOpen,
  Languages,
  TreePine,
  Sun,
  Footprints,
  Star,
  Mountain,
  Shield,
  Axe,
  Heart,
  Flame,
  Skull,
  Brain,
  Hand,
  Feather,
  Scale,
  Gem,
  Wrench,
  Lightbulb,
  Ear,
  Crosshair,
  Rabbit,
  Lock,
  Wand2,
  Music,
  Drama,
  Move,
} from "lucide-react-native";
import type { Race } from "./types";

export const DND5E_RACES: Race[] = [
  // ─── 1. Humano ───────────────────────────────────────────
  {
    id: "human",
    name: "Humano",
    tagline: "+1 em todos os atributos, versátil e adaptável",
    icon: User,
    abilityBonuses: [
      { ability: "str", bonus: 1 },
      { ability: "dex", bonus: 1 },
      { ability: "con", bonus: 1 },
      { ability: "int", bonus: 1 },
      { ability: "wis", bonus: 1 },
      { ability: "cha", bonus: 1 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Comum", "Uma à escolha"],
    traits: [
      {
        name: "Versátil",
        icon: Star,
        shortDescription: "+1 em todos os atributos",
        description:
          "Humanos recebem +1 em todos os valores de habilidade.",
      },
    ],
    subRaces: [],
    choices: [
      {
        id: "human-extra-language",
        label: "Idioma Adicional",
        type: "language",
        options: [
          { id: "elvish", name: "Élfico" },
          { id: "dwarvish", name: "Anão" },
          { id: "giant", name: "Gigante" },
          { id: "gnomish", name: "Gnômico" },
          { id: "goblin", name: "Goblin" },
          { id: "halfling", name: "Halfling" },
          { id: "orc", name: "Orc" },
          { id: "abyssal", name: "Abissal" },
          { id: "celestial", name: "Celestial" },
          { id: "draconic", name: "Dracônico" },
          { id: "infernal", name: "Infernal" },
          { id: "sylvan", name: "Silvano" },
        ],
      },
    ],
  },

  // ─── 2. Elfo ─────────────────────────────────────────────
  {
    id: "elf",
    name: "Elfo",
    tagline: "+2 Destreza, graciosos e longevos",
    icon: Ear,
    abilityBonuses: [{ ability: "dex", bonus: 2 }],
    size: "Medium",
    speed: 30,
    languages: ["Comum", "Élfico"],
    traits: [
      {
        name: "Visão no Escuro",
        icon: Eye,
        shortDescription: "Enxergar 18m na escuridão",
        description:
          "Você pode enxergar na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      },
      {
        name: "Sentidos Aguçados",
        icon: Target,
        shortDescription: "Proficiência em Percepção",
        description: "Você tem proficiência na perícia Percepção.",
      },
      {
        name: "Ancestralidade Feérica",
        icon: Sparkles,
        shortDescription: "Vantagem contra ser enfeitiçado",
        description:
          "Você tem vantagem em testes de resistência contra ser enfeitiçado e magia não pode colocá-lo para dormir.",
      },
      {
        name: "Transe",
        icon: Moon,
        shortDescription: "4h de meditação = 8h de sono",
        description:
          "Elfos não precisam dormir. Eles meditam profundamente por 4 horas por dia, obtendo o mesmo benefício que um humano obtém com 8 horas de sono.",
      },
    ],
    subRaces: [
      {
        id: "high-elf",
        name: "Alto Elfo",
        abilityBonuses: [{ ability: "int", bonus: 1 }],
        traits: [
          {
            name: "Treinamento Élfico com Armas",
            icon: Swords,
            shortDescription: "Proficiência com espadas e arcos",
            description:
              "Você tem proficiência com espadas longas, espadas curtas, arcos longos e arcos curtos.",
          },
          {
            name: "Truque",
            icon: BookOpen,
            shortDescription: "Um truque de mago à escolha",
            description:
              "Você conhece um truque à sua escolha da lista de magias do mago. Inteligência é o atributo de conjuração.",
          },
          {
            name: "Idioma Adicional",
            icon: Languages,
            shortDescription: "Um idioma extra à escolha",
            description:
              "Você pode falar, ler e escrever um idioma adicional à sua escolha.",
          },
        ],
        choices: [
          {
            id: "high-elf-cantrip",
            label: "Truque de Mago",
            type: "cantrip",
            options: [
              { id: "light", name: "Luz" },
              { id: "mage-hand", name: "Mão Mágica" },
              { id: "mending", name: "Consertar" },
              { id: "message", name: "Mensagem" },
              { id: "minor-illusion", name: "Ilusão Menor" },
              { id: "prestidigitation", name: "Prestidigitação" },
              { id: "ray-of-frost", name: "Raio de Gelo" },
              { id: "shocking-grasp", name: "Toque Chocante" },
              { id: "fire-bolt", name: "Rajada de Fogo" },
              { id: "acid-splash", name: "Borrifar Ácido" },
            ],
          },
        ],
      },
      {
        id: "wood-elf",
        name: "Elfo da Floresta",
        abilityBonuses: [{ ability: "wis", bonus: 1 }],
        traits: [
          {
            name: "Treinamento Élfico com Armas",
            icon: Swords,
            shortDescription: "Proficiência com espadas e arcos",
            description:
              "Você tem proficiência com espadas longas, espadas curtas, arcos longos e arcos curtos.",
          },
          {
            name: "Pés Ligeiros",
            icon: Footprints,
            shortDescription: "Deslocamento base 10,5m",
            description:
              "Seu deslocamento base de caminhada aumenta para 10,5 metros.",
          },
          {
            name: "Máscara da Natureza",
            icon: TreePine,
            shortDescription: "Ocultar-se na natureza",
            description:
              "Você pode tentar se esconder quando estiver levemente obscurecido por vegetação, chuva forte, nevasca, névoa e outros fenômenos naturais.",
          },
        ],
      },
      {
        id: "drow",
        name: "Drow",
        abilityBonuses: [{ ability: "cha", bonus: 1 }],
        traits: [
          {
            name: "Visão no Escuro Superior",
            icon: Eye,
            shortDescription: "Enxergar 36m na escuridão",
            description: "Sua visão no escuro tem alcance de 36 metros.",
          },
          {
            name: "Sensibilidade à Luz Solar",
            icon: Sun,
            shortDescription: "Desvantagem sob luz solar direta",
            description:
              "Você tem desvantagem em jogadas de ataque e testes de Sabedoria (Percepção) baseados em visão quando você, seu alvo ou o que estiver tentando perceber estiver sob luz solar direta.",
          },
          {
            name: "Magia Drow",
            icon: Sparkles,
            shortDescription: "Truque Luzes Dançantes + magias raciais",
            description:
              "Você conhece o truque Luzes Dançantes. Ao atingir o 3º nível, pode conjurar Fogo Feérico uma vez por dia. Ao atingir o 5º nível, pode conjurar Escuridão uma vez por dia. Carisma é o atributo de conjuração.",
          },
          {
            name: "Treinamento Drow com Armas",
            icon: Swords,
            shortDescription: "Proficiência com rapieiras e bestas de mão",
            description:
              "Você tem proficiência com rapieiras, espadas curtas e bestas de mão.",
          },
        ],
      },
    ],
  },

  // ─── 3. Anão ─────────────────────────────────────────────
  {
    id: "dwarf",
    name: "Anão",
    tagline: "+2 Constituição, resilientes e destemidos",
    icon: Mountain,
    abilityBonuses: [{ ability: "con", bonus: 2 }],
    size: "Medium",
    speed: 25,
    languages: ["Comum", "Anão"],
    traits: [
      {
        name: "Visão no Escuro",
        icon: Eye,
        shortDescription: "Enxergar 18m na escuridão",
        description:
          "Você pode enxergar na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      },
      {
        name: "Resiliência Anã",
        icon: Shield,
        shortDescription: "Vantagem contra veneno, resistência a dano de veneno",
        description:
          "Você tem vantagem em testes de resistência contra veneno e tem resistência contra dano de veneno.",
      },
      {
        name: "Treinamento Anão em Combate",
        icon: Axe,
        shortDescription: "Proficiência com machados e martelos",
        description:
          "Você tem proficiência com machados de batalha, machadinhas, martelos leves e martelos de guerra.",
      },
      {
        name: "Conhecimento em Rochas",
        icon: Gem,
        shortDescription: "Dobrar proficiência em História com pedra",
        description:
          "Sempre que você fizer um teste de Inteligência (História) relacionado à origem de trabalhos em pedra, você é considerado proficiente e adiciona o dobro do seu bônus de proficiência ao teste.",
      },
    ],
    subRaces: [
      {
        id: "hill-dwarf",
        name: "Anão da Colina",
        abilityBonuses: [{ ability: "wis", bonus: 1 }],
        traits: [
          {
            name: "Tenacidade Anã",
            icon: Heart,
            shortDescription: "+1 PV por nível",
            description:
              "Seu máximo de pontos de vida aumenta em 1, e aumenta em 1 cada vez que você ganha um nível.",
          },
        ],
      },
      {
        id: "mountain-dwarf",
        name: "Anão da Montanha",
        abilityBonuses: [{ ability: "str", bonus: 2 }],
        traits: [
          {
            name: "Treinamento em Armaduras Anãs",
            icon: Shield,
            shortDescription: "Proficiência com armaduras leves e médias",
            description:
              "Você tem proficiência com armaduras leves e médias.",
          },
        ],
      },
    ],
  },

  // ─── 4. Halfling ─────────────────────────────────────────
  {
    id: "halfling",
    name: "Halfling",
    tagline: "+2 Destreza, sortudos e corajosos",
    icon: Rabbit,
    abilityBonuses: [{ ability: "dex", bonus: 2 }],
    size: "Small",
    speed: 25,
    languages: ["Comum", "Halfling"],
    traits: [
      {
        name: "Sortudo",
        icon: Star,
        shortDescription: "Rerolar 1 natural em d20",
        description:
          "Quando você rolar um 1 natural em uma jogada de ataque, teste de habilidade ou teste de resistência, você pode rerolar o dado e deve usar o novo resultado.",
      },
      {
        name: "Bravura",
        icon: Shield,
        shortDescription: "Vantagem contra ser amedrontado",
        description:
          "Você tem vantagem em testes de resistência contra ser amedrontado.",
      },
      {
        name: "Agilidade Halfling",
        icon: Move,
        shortDescription: "Mover-se através de criaturas maiores",
        description:
          "Você pode mover-se através do espaço de qualquer criatura que seja de um tamanho maior que o seu.",
      },
    ],
    subRaces: [
      {
        id: "lightfoot",
        name: "Pés-Leves",
        abilityBonuses: [{ ability: "cha", bonus: 1 }],
        traits: [
          {
            name: "Furtividade Natural",
            icon: Eye,
            shortDescription: "Esconder-se atrás de criaturas maiores",
            description:
              "Você pode tentar se esconder quando estiver obscurecido por uma criatura que seja pelo menos um tamanho maior que você.",
          },
        ],
      },
      {
        id: "stout",
        name: "Robusto",
        abilityBonuses: [{ ability: "con", bonus: 1 }],
        traits: [
          {
            name: "Resiliência Robusta",
            icon: Shield,
            shortDescription: "Vantagem contra veneno, resistência a dano de veneno",
            description:
              "Você tem vantagem em testes de resistência contra veneno e tem resistência contra dano de veneno.",
          },
        ],
      },
    ],
  },

  // ─── 5. Tiefling ─────────────────────────────────────────
  {
    id: "tiefling",
    name: "Tiefling",
    tagline: "+2 Carisma, +1 Inteligência, herança infernal",
    icon: Flame,
    abilityBonuses: [
      { ability: "cha", bonus: 2 },
      { ability: "int", bonus: 1 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Comum", "Infernal"],
    traits: [
      {
        name: "Visão no Escuro",
        icon: Eye,
        shortDescription: "Enxergar 18m na escuridão",
        description:
          "Você pode enxergar na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      },
      {
        name: "Resistência Infernal",
        icon: Flame,
        shortDescription: "Resistência a dano de fogo",
        description: "Você tem resistência a dano de fogo.",
      },
      {
        name: "Legado Infernal",
        icon: Sparkles,
        shortDescription: "Taumaturgia + magias raciais",
        description:
          "Você conhece o truque Taumaturgia. Ao atingir o 3º nível, pode conjurar Repreensão Infernal como magia de 2º nível uma vez por dia. Ao atingir o 5º nível, pode conjurar Escuridão uma vez por dia. Carisma é o atributo de conjuração.",
      },
    ],
    subRaces: [],
  },

  // ─── 6. Draconato ────────────────────────────────────────
  {
    id: "dragonborn",
    name: "Draconato",
    tagline: "+2 Força, +1 Carisma, sopro dracônico",
    icon: Skull,
    abilityBonuses: [
      { ability: "str", bonus: 2 },
      { ability: "cha", bonus: 1 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Comum", "Dracônico"],
    traits: [
      {
        name: "Arma de Sopro",
        icon: Flame,
        shortDescription: "Ataque de área baseado na ancestralidade",
        description:
          "Você pode usar sua ação para exalar energia destrutiva. O tipo de dano e a forma da área são determinados pela sua ancestralidade dracônica. 2d6 de dano no 1º nível, CD 8 + mod CON + proficiência. Uma vez por descanso curto ou longo.",
      },
      {
        name: "Resistência a Dano",
        icon: Shield,
        shortDescription: "Resistência ao tipo de dano da ancestralidade",
        description:
          "Você tem resistência ao tipo de dano associado à sua ancestralidade dracônica.",
      },
    ],
    subRaces: [],
    choices: [
      {
        id: "draconic-ancestry",
        label: "Ancestralidade Dracônica",
        type: "ancestry",
        options: [
          { id: "black", name: "Negro", description: "Ácido — linha 1,5×9m" },
          { id: "blue", name: "Azul", description: "Relâmpago — linha 1,5×9m" },
          { id: "brass", name: "Latão", description: "Fogo — linha 1,5×9m" },
          { id: "bronze", name: "Bronze", description: "Relâmpago — linha 1,5×9m" },
          { id: "copper", name: "Cobre", description: "Ácido — linha 1,5×9m" },
          { id: "gold", name: "Ouro", description: "Fogo — cone 4,5m" },
          { id: "green", name: "Verde", description: "Veneno — cone 4,5m" },
          { id: "red", name: "Vermelho", description: "Fogo — cone 4,5m" },
          { id: "silver", name: "Prata", description: "Gelo — cone 4,5m" },
          { id: "white", name: "Branco", description: "Gelo — cone 4,5m" },
        ],
      },
    ],
  },

  // ─── 7. Gnomo ────────────────────────────────────────────
  {
    id: "gnome",
    name: "Gnomo",
    tagline: "+2 Inteligência, astutos e inventivos",
    icon: Lightbulb,
    abilityBonuses: [{ ability: "int", bonus: 2 }],
    size: "Small",
    speed: 25,
    languages: ["Comum", "Gnômico"],
    traits: [
      {
        name: "Visão no Escuro",
        icon: Eye,
        shortDescription: "Enxergar 18m na escuridão",
        description:
          "Você pode enxergar na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      },
      {
        name: "Esperteza Gnômica",
        icon: Brain,
        shortDescription: "Vantagem em INT/SAB/CAR contra magia",
        description:
          "Você tem vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma contra magia.",
      },
    ],
    subRaces: [
      {
        id: "forest-gnome",
        name: "Gnomo da Floresta",
        abilityBonuses: [{ ability: "dex", bonus: 1 }],
        traits: [
          {
            name: "Ilusionista Natural",
            icon: Sparkles,
            shortDescription: "Truque Ilusão Menor",
            description:
              "Você conhece o truque Ilusão Menor. Inteligência é o atributo de conjuração para ele.",
          },
          {
            name: "Falar com Pequenos Animais",
            icon: Feather,
            shortDescription: "Comunicar ideias simples com animais Pequenos",
            description:
              "Através de sons e gestos, você pode comunicar ideias simples para animais de tamanho Pequeno ou menor.",
          },
        ],
      },
      {
        id: "rock-gnome",
        name: "Gnomo das Rochas",
        abilityBonuses: [{ ability: "con", bonus: 1 }],
        traits: [
          {
            name: "Conhecimento de Artífice",
            icon: Wrench,
            shortDescription: "Dobrar proficiência em História com itens mágicos/tecnológicos",
            description:
              "Sempre que você fizer um teste de Inteligência (História) relacionado a itens mágicos, objetos alquímicos ou dispositivos tecnológicos, você pode adicionar o dobro do seu bônus de proficiência ao teste.",
          },
          {
            name: "Funileiro",
            icon: Wrench,
            shortDescription: "Construir pequenos dispositivos mecânicos",
            description:
              "Você tem proficiência com ferramentas de funileiro. Usando essas ferramentas, pode gastar 1 hora e 10 po em materiais para construir um dispositivo mecânico Miúdo (CA 5, 1 PV).",
          },
        ],
      },
    ],
  },

  // ─── 8. Meio-Orc ─────────────────────────────────────────
  {
    id: "half-orc",
    name: "Meio-Orc",
    tagline: "+2 Força, +1 Constituição, ferozes e resistentes",
    icon: Axe,
    abilityBonuses: [
      { ability: "str", bonus: 2 },
      { ability: "con", bonus: 1 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Comum", "Orc"],
    traits: [
      {
        name: "Visão no Escuro",
        icon: Eye,
        shortDescription: "Enxergar 18m na escuridão",
        description:
          "Você pode enxergar na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      },
      {
        name: "Ameaçador",
        icon: Skull,
        shortDescription: "Proficiência em Intimidação",
        description: "Você tem proficiência na perícia Intimidação.",
      },
      {
        name: "Resistência Implacável",
        icon: Heart,
        shortDescription: "Cair a 1 PV ao invés de 0, uma vez por descanso longo",
        description:
          "Quando você é reduzido a 0 pontos de vida mas não é morto instantaneamente, você pode cair a 1 ponto de vida ao invés disso. Você não pode usar este recurso novamente até terminar um descanso longo.",
      },
      {
        name: "Ataques Selvagens",
        icon: Crosshair,
        shortDescription: "Dado de dano extra em acerto crítico corpo a corpo",
        description:
          "Quando você obtém um acerto crítico com um ataque corpo a corpo, você pode rolar um dos dados de dano da arma uma vez adicional e adicioná-lo ao dano extra do acerto crítico.",
      },
    ],
    subRaces: [],
  },

  // ─── 9. Meio-Elfo ────────────────────────────────────────
  {
    id: "half-elf",
    name: "Meio-Elfo",
    tagline: "+2 Carisma, +1 em dois outros, versáteis e carismáticos",
    icon: Drama,
    abilityBonuses: [{ ability: "cha", bonus: 2 }],
    size: "Medium",
    speed: 30,
    languages: ["Comum", "Élfico", "Uma à escolha"],
    traits: [
      {
        name: "Visão no Escuro",
        icon: Eye,
        shortDescription: "Enxergar 18m na escuridão",
        description:
          "Você pode enxergar na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse penumbra.",
      },
      {
        name: "Ancestralidade Feérica",
        icon: Sparkles,
        shortDescription: "Vantagem contra ser enfeitiçado",
        description:
          "Você tem vantagem em testes de resistência contra ser enfeitiçado e magia não pode colocá-lo para dormir.",
      },
      {
        name: "Versatilidade em Perícias",
        icon: Star,
        shortDescription: "Proficiência em duas perícias à escolha",
        description:
          "Você ganha proficiência em duas perícias à sua escolha.",
      },
    ],
    subRaces: [],
    choices: [
      {
        id: "half-elf-ability-bonus",
        label: "Bônus de Habilidade",
        type: "ability",
        count: 2,
        options: [
          { id: "str", name: "Força (+1)" },
          { id: "dex", name: "Destreza (+1)" },
          { id: "con", name: "Constituição (+1)" },
          { id: "int", name: "Inteligência (+1)" },
          { id: "wis", name: "Sabedoria (+1)" },
        ],
      },
      {
        id: "half-elf-skills",
        label: "Perícias",
        type: "skill",
        count: 2,
        options: [
          { id: "acrobatics", name: "Acrobacia" },
          { id: "animal-handling", name: "Adestrar Animais" },
          { id: "arcana", name: "Arcanismo" },
          { id: "athletics", name: "Atletismo" },
          { id: "deception", name: "Enganação" },
          { id: "history", name: "História" },
          { id: "insight", name: "Intuição" },
          { id: "intimidation", name: "Intimidação" },
          { id: "investigation", name: "Investigação" },
          { id: "medicine", name: "Medicina" },
          { id: "nature", name: "Natureza" },
          { id: "perception", name: "Percepção" },
          { id: "performance", name: "Atuação" },
          { id: "persuasion", name: "Persuasão" },
          { id: "religion", name: "Religião" },
          { id: "sleight-of-hand", name: "Prestidigitação" },
          { id: "stealth", name: "Furtividade" },
          { id: "survival", name: "Sobrevivência" },
        ],
      },
      {
        id: "half-elf-language",
        label: "Idioma Adicional",
        type: "language",
        options: [
          { id: "dwarvish", name: "Anão" },
          { id: "giant", name: "Gigante" },
          { id: "gnomish", name: "Gnômico" },
          { id: "goblin", name: "Goblin" },
          { id: "halfling", name: "Halfling" },
          { id: "orc", name: "Orc" },
          { id: "abyssal", name: "Abissal" },
          { id: "celestial", name: "Celestial" },
          { id: "draconic", name: "Dracônico" },
          { id: "infernal", name: "Infernal" },
          { id: "sylvan", name: "Silvano" },
        ],
      },
    ],
  },
];
