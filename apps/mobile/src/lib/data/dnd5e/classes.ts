import {
  Sword,
  Shield,
  Axe,
  Flame,
  BookOpen,
  Wand2,
  Zap,
  Skull,
  Music,
  TreePine,
  Crosshair,
  Heart,
  Target,
  Hand,
  Eye,
  Moon,
  Star,
  Footprints,
  Swords,
  Scale,
  Feather,
} from "lucide-react-native";
import type { CharacterClass } from "./types";

export const ROLE_LABELS: Record<string, string> = {
  martial: "Combatente",
  caster: "Conjurador",
  hybrid: "Híbrido",
  support: "Suporte",
};

export const ROLE_COLORS: Record<string, string> = {
  martial: "#E94560",
  caster: "#6C5CE7",
  hybrid: "#00B894",
  support: "#FDCB6E",
};

export const DND5E_CLASSES: CharacterClass[] = [
  // ─── 1. Guerreiro ────────────────────────────────────────
  {
    id: "fighter",
    name: "Guerreiro",
    tagline: "Mestre das armas e táticas de combate",
    icon: Sword,
    color: "#E94560",
    hitDie: 10,
    primaryAbilities: ["str", "con"],
    savingThrows: ["str", "con"],
    armorProficiencies: ["Todas as armaduras", "Escudos"],
    weaponProficiencies: ["Armas simples", "Armas marciais"],
    skillChoices: {
      count: 2,
      options: [
        "Acrobacia",
        "Adestrar Animais",
        "Atletismo",
        "História",
        "Intuição",
        "Intimidação",
        "Percepção",
        "Sobrevivência",
      ],
    },
    features: [
      {
        name: "Estilo de Combate",
        description:
          "Você adota um estilo de combate particular como sua especialidade.",
        level: 1,
        choices: {
          id: "fighting-style-fighter",
          label: "Estilo de Combate",
          options: [
            {
              id: "archery",
              name: "Arquearia",
              description:
                "+2 nas jogadas de ataque com armas de ataque à distância.",
            },
            {
              id: "defense",
              name: "Defesa",
              description: "+1 na CA enquanto estiver usando armadura.",
            },
            {
              id: "dueling",
              name: "Duelismo",
              description:
                "+2 no dano com arma corpo a corpo em uma mão, sem outra arma.",
            },
            {
              id: "great-weapon",
              name: "Combate com Armas Grandes",
              description:
                "Rerolar 1 ou 2 no dano com armas de duas mãos.",
            },
            {
              id: "protection",
              name: "Proteção",
              description:
                "Impor desvantagem no ataque a aliado adjacente com escudo.",
            },
            {
              id: "two-weapon",
              name: "Combate com Duas Armas",
              description:
                "Adicionar mod de habilidade ao dano do segundo ataque.",
            },
          ],
        },
      },
      {
        name: "Retomar o Fôlego",
        description:
          "No seu turno, pode usar uma ação bônus para recuperar pontos de vida igual a 1d10 + seu nível de guerreiro. Uma vez por descanso curto ou longo.",
        level: 1,
      },
    ],
    role: "martial",
    complexity: "simple",
  },

  // ─── 2. Bárbaro ──────────────────────────────────────────
  {
    id: "barbarian",
    name: "Bárbaro",
    tagline: "Fúria primitiva e resistência inabalável",
    icon: Axe,
    color: "#FF6B6B",
    hitDie: 12,
    primaryAbilities: ["str", "con"],
    savingThrows: ["str", "con"],
    armorProficiencies: ["Armaduras leves", "Armaduras médias", "Escudos"],
    weaponProficiencies: ["Armas simples", "Armas marciais"],
    skillChoices: {
      count: 2,
      options: [
        "Adestrar Animais",
        "Atletismo",
        "Intimidação",
        "Natureza",
        "Percepção",
        "Sobrevivência",
      ],
    },
    features: [
      {
        name: "Fúria",
        description:
          "Em combate, você luta com ferocidade primitiva. No seu turno, pode entrar em fúria como ação bônus. Ganha vantagem em testes de Força, resistência a dano de concussão/perfuração/corte, +2 dano de fúria. Dura 1 minuto, 2 usos por descanso longo.",
        level: 1,
      },
      {
        name: "Defesa sem Armadura",
        description:
          "Sem armadura, sua CA é 10 + modificador de Destreza + modificador de Constituição. Você pode usar escudo.",
        level: 1,
      },
    ],
    role: "martial",
    complexity: "simple",
  },

  // ─── 3. Paladino ─────────────────────────────────────────
  {
    id: "paladin",
    name: "Paladino",
    tagline: "Guerreiro sagrado imbuído de poder divino",
    icon: Shield,
    color: "#FFD93D",
    hitDie: 10,
    primaryAbilities: ["str", "cha"],
    savingThrows: ["wis", "cha"],
    armorProficiencies: ["Todas as armaduras", "Escudos"],
    weaponProficiencies: ["Armas simples", "Armas marciais"],
    skillChoices: {
      count: 2,
      options: [
        "Atletismo",
        "Intuição",
        "Intimidação",
        "Medicina",
        "Persuasão",
        "Religião",
      ],
    },
    features: [
      {
        name: "Sentido Divino",
        description:
          "Como ação, até o final do seu próximo turno, você sabe a localização de qualquer celestial, corruptor ou morto-vivo a até 18 metros. 1 + mod CAR usos por descanso longo.",
        level: 1,
      },
      {
        name: "Cura pelas Mãos",
        description:
          "Você tem uma reserva de poder curativo igual a 5 × nível de paladino. Como ação, pode tocar uma criatura e restaurar pontos de vida gastando da reserva. Também pode gastar 5 pontos para curar uma doença ou neutralizar um veneno.",
        level: 1,
      },
    ],
    role: "hybrid",
    complexity: "moderate",
  },

  // ─── 4. Ranger ───────────────────────────────────────────
  {
    id: "ranger",
    name: "Ranger",
    tagline: "Guerreiro da natureza e caçador habilidoso",
    icon: Crosshair,
    color: "#00B894",
    hitDie: 10,
    primaryAbilities: ["dex", "wis"],
    savingThrows: ["str", "dex"],
    armorProficiencies: ["Armaduras leves", "Armaduras médias", "Escudos"],
    weaponProficiencies: ["Armas simples", "Armas marciais"],
    skillChoices: {
      count: 3,
      options: [
        "Adestrar Animais",
        "Atletismo",
        "Furtividade",
        "Intuição",
        "Investigação",
        "Natureza",
        "Percepção",
        "Sobrevivência",
      ],
    },
    features: [
      {
        name: "Inimigo Favorito",
        description:
          "Você tem vantagem em testes de Sabedoria (Sobrevivência) para rastrear seus inimigos favoritos, assim como em testes de Inteligência para lembrar informações sobre eles.",
        level: 1,
        choices: {
          id: "favored-enemy",
          label: "Inimigo Favorito",
          options: [
            { id: "aberrations", name: "Aberrações", description: "Criaturas bizarras do Além" },
            { id: "beasts", name: "Bestas", description: "Animais e criaturas naturais" },
            { id: "celestials", name: "Celestiais", description: "Seres dos planos superiores" },
            { id: "constructs", name: "Constructos", description: "Criaturas artificiais e golems" },
            { id: "dragons", name: "Dragões", description: "Dragões e criaturas dracônicas" },
            { id: "elementals", name: "Elementais", description: "Seres dos planos elementais" },
            { id: "fey", name: "Feéricos", description: "Criaturas do Feywild" },
            { id: "fiends", name: "Corruptores", description: "Demônios e diabos" },
            { id: "giants", name: "Gigantes", description: "Gigantes e raças gigantes" },
            { id: "monstrosities", name: "Monstruosidades", description: "Criaturas antinaturais" },
            { id: "oozes", name: "Gosmas", description: "Criaturas amorfas" },
            { id: "plants", name: "Plantas", description: "Criaturas vegetais animadas" },
            { id: "undead", name: "Mortos-vivos", description: "Zumbis, esqueletos e espectros" },
          ],
        },
      },
      {
        name: "Explorador Natural",
        description:
          "Você é particularmente familiar com um tipo de ambiente natural e é adepto a viajar e sobreviver em tais regiões. Terreno difícil não reduz o deslocamento do grupo, o grupo não pode se perder exceto por meios mágicos, e você encontra o dobro de alimento.",
        level: 1,
        choices: {
          id: "natural-explorer",
          label: "Terreno Favorito",
          options: [
            { id: "arctic", name: "Ártico", description: "Tundra gelada e neve" },
            { id: "coast", name: "Costa", description: "Praias e regiões litorâneas" },
            { id: "desert", name: "Deserto", description: "Dunas e terras áridas" },
            { id: "forest", name: "Floresta", description: "Florestas temperadas e tropicais" },
            { id: "grassland", name: "Planície", description: "Pradarias e savanas" },
            { id: "mountain", name: "Montanha", description: "Terrenos montanhosos" },
            { id: "swamp", name: "Pântano", description: "Brejos e manguezais" },
            { id: "underdark", name: "Subterrâneo", description: "Cavernas e masmorras" },
          ],
        },
      },
    ],
    role: "hybrid",
    complexity: "moderate",
  },

  // ─── 5. Monge ────────────────────────────────────────────
  {
    id: "monk",
    name: "Monge",
    tagline: "Mestre das artes marciais e da disciplina",
    icon: Hand,
    color: "#74B9FF",
    hitDie: 8,
    primaryAbilities: ["dex", "wis"],
    savingThrows: ["str", "dex"],
    armorProficiencies: [],
    weaponProficiencies: ["Armas simples", "Espadas curtas"],
    skillChoices: {
      count: 2,
      options: [
        "Acrobacia",
        "Atletismo",
        "Furtividade",
        "História",
        "Intuição",
        "Religião",
      ],
    },
    features: [
      {
        name: "Defesa sem Armadura",
        description:
          "Sem armadura e sem escudo, sua CA é 10 + modificador de Destreza + modificador de Sabedoria.",
        level: 1,
      },
      {
        name: "Artes Marciais",
        description:
          "Seu treinamento em artes marciais permite dominar estilos de combate que usam golpes desarmados e armas de monge (armas simples corpo a corpo + espadas curtas). Dado de dano: d4 no 1º nível. Pode usar DES ao invés de FOR para ataques. Golpe desarmado bônus após Ataque.",
        level: 1,
      },
    ],
    role: "martial",
    complexity: "moderate",
  },

  // ─── 6. Ladino ───────────────────────────────────────────
  {
    id: "rogue",
    name: "Ladino",
    tagline: "Mestre da furtividade e das perícias",
    icon: Eye,
    color: "#2D3436",
    hitDie: 8,
    primaryAbilities: ["dex"],
    savingThrows: ["dex", "int"],
    armorProficiencies: ["Armaduras leves"],
    weaponProficiencies: [
      "Armas simples",
      "Bestas de mão",
      "Espadas longas",
      "Rapieiras",
      "Espadas curtas",
    ],
    skillChoices: {
      count: 4,
      options: [
        "Acrobacia",
        "Atletismo",
        "Atuação",
        "Enganação",
        "Furtividade",
        "Intimidação",
        "Intuição",
        "Investigação",
        "Percepção",
        "Persuasão",
        "Prestidigitação",
      ],
    },
    features: [
      {
        name: "Especialização",
        description:
          "Escolha duas de suas perícias com proficiência, ou uma perícia com proficiência e suas ferramentas de ladrão. Seu bônus de proficiência é dobrado para qualquer teste de habilidade que use essas proficiências.",
        level: 1,
        choices: {
          id: "expertise-rogue",
          label: "Especialização (2 perícias)",
          options: [
            { id: "acrobatics", name: "Acrobacia", description: "Dobrar proficiência em Acrobacia" },
            { id: "athletics", name: "Atletismo", description: "Dobrar proficiência em Atletismo" },
            { id: "deception", name: "Enganação", description: "Dobrar proficiência em Enganação" },
            { id: "stealth", name: "Furtividade", description: "Dobrar proficiência em Furtividade" },
            { id: "insight", name: "Intuição", description: "Dobrar proficiência em Intuição" },
            { id: "investigation", name: "Investigação", description: "Dobrar proficiência em Investigação" },
            { id: "perception", name: "Percepção", description: "Dobrar proficiência em Percepção" },
            { id: "persuasion", name: "Persuasão", description: "Dobrar proficiência em Persuasão" },
            { id: "sleight-of-hand", name: "Prestidigitação", description: "Dobrar proficiência em Prestidigitação" },
            { id: "performance", name: "Atuação", description: "Dobrar proficiência em Atuação" },
            { id: "intimidation", name: "Intimidação", description: "Dobrar proficiência em Intimidação" },
            { id: "thieves-tools", name: "Ferramentas de Ladrão", description: "Dobrar proficiência com ferramentas de ladrão" },
          ],
        },
      },
      {
        name: "Ataque Furtivo",
        description:
          "Uma vez por turno, você pode causar 1d6 de dano extra a uma criatura que acertar com um ataque se tiver vantagem na jogada de ataque, ou se outro inimigo da criatura estiver a 1,5m dela. A arma deve ser de acuidade ou à distância.",
        level: 1,
      },
      {
        name: "Gíria de Ladrão",
        description:
          "Você aprendeu a gíria de ladrão, uma mistura secreta de dialeto, jargão e código que permite esconder mensagens em conversas aparentemente normais. Apenas criaturas que conheçam a gíria podem entender.",
        level: 1,
      },
    ],
    role: "martial",
    complexity: "moderate",
  },

  // ─── 7. Mago ─────────────────────────────────────────────
  {
    id: "wizard",
    name: "Mago",
    tagline: "Estudioso da magia arcana e conhecimento oculto",
    icon: BookOpen,
    color: "#6C5CE7",
    hitDie: 6,
    primaryAbilities: ["int"],
    savingThrows: ["int", "wis"],
    armorProficiencies: [],
    weaponProficiencies: [
      "Adagas",
      "Dardos",
      "Fundas",
      "Bordões",
      "Bestas leves",
    ],
    skillChoices: {
      count: 2,
      options: [
        "Arcanismo",
        "História",
        "Intuição",
        "Investigação",
        "Medicina",
        "Religião",
      ],
    },
    features: [
      {
        name: "Conjuração",
        description:
          "Como estudioso da magia arcana, você possui um grimório contendo magias que mostram os primeiros vislumbres de seu verdadeiro poder. Você começa com 3 truques e 6 magias de 1º nível. Inteligência é seu atributo de conjuração.",
        level: 1,
      },
      {
        name: "Recuperação Arcana",
        description:
          "Uma vez por dia, ao terminar um descanso curto, você pode recuperar espaços de magia gastos. Os espaços recuperados podem ter um nível combinado igual ou inferior à metade do seu nível de mago (arredondado para cima), e nenhum deles pode ser de 6º nível ou superior.",
        level: 1,
      },
    ],
    role: "caster",
    complexity: "complex",
  },

  // ─── 8. Feiticeiro ───────────────────────────────────────
  {
    id: "sorcerer",
    name: "Feiticeiro",
    tagline: "Magia inata fluindo através do sangue",
    icon: Zap,
    color: "#E17055",
    hitDie: 6,
    primaryAbilities: ["cha"],
    savingThrows: ["con", "cha"],
    armorProficiencies: [],
    weaponProficiencies: [
      "Adagas",
      "Dardos",
      "Fundas",
      "Bordões",
      "Bestas leves",
    ],
    skillChoices: {
      count: 2,
      options: [
        "Arcanismo",
        "Enganação",
        "Intuição",
        "Intimidação",
        "Persuasão",
        "Religião",
      ],
    },
    features: [
      {
        name: "Conjuração",
        description:
          "Você nasceu com magia correndo em suas veias. Você começa com 4 truques e 2 magias de 1º nível conhecidas. Carisma é seu atributo de conjuração.",
        level: 1,
      },
      {
        name: "Origem Arcana",
        description:
          "A fonte do seu poder mágico inato. Sua origem concede recursos adicionais ao atingir certos níveis.",
        level: 1,
        choices: {
          id: "sorcerous-origin",
          label: "Origem Arcana",
          options: [
            {
              id: "draconic",
              name: "Linhagem Dracônica",
              description:
                "Magia nascida de um dragão ancestral. +1 PV por nível, CA 13 + DES sem armadura.",
            },
            {
              id: "wild-magic",
              name: "Magia Selvagem",
              description:
                "Magia caótica e imprevisível. Efeitos aleatórios podem ocorrer ao conjurar magias.",
            },
          ],
        },
      },
    ],
    role: "caster",
    complexity: "moderate",
  },

  // ─── 9. Bruxo ────────────────────────────────────────────
  {
    id: "warlock",
    name: "Bruxo",
    tagline: "Poder arcano concedido por um pacto sobrenatural",
    icon: Skull,
    color: "#A29BFE",
    hitDie: 8,
    primaryAbilities: ["cha"],
    savingThrows: ["wis", "cha"],
    armorProficiencies: ["Armaduras leves"],
    weaponProficiencies: ["Armas simples"],
    skillChoices: {
      count: 2,
      options: [
        "Arcanismo",
        "Enganação",
        "História",
        "Intimidação",
        "Investigação",
        "Natureza",
        "Religião",
      ],
    },
    features: [
      {
        name: "Magia de Pacto",
        description:
          "Seu patrono arcano concede a habilidade de conjurar magias. Você começa com 2 truques e 2 magias de 1º nível conhecidas. Carisma é seu atributo de conjuração. Espaços de magia recuperam em descanso curto.",
        level: 1,
      },
      {
        name: "Patrono Transcendental",
        description:
          "Você fez um pacto com um ser de outro plano de existência. Seu patrono concede poderes e magias adicionais.",
        level: 1,
        choices: {
          id: "otherworldly-patron",
          label: "Patrono Transcendental",
          options: [
            {
              id: "archfey",
              name: "O Arquifada",
              description:
                "Um ser do Feywild. Magias de charme, ilusão e encantamento da floresta.",
            },
            {
              id: "fiend",
              name: "O Corruptor",
              description:
                "Um demônio ou diabo dos planos inferiores. PV temporários ao derrotar inimigos.",
            },
            {
              id: "great-old-one",
              name: "O Grande Antigo",
              description:
                "Uma entidade cósmica além da compreensão. Telepatia e poderes psíquicos.",
            },
          ],
        },
      },
    ],
    role: "caster",
    complexity: "complex",
  },

  // ─── 10. Clérigo ─────────────────────────────────────────
  {
    id: "cleric",
    name: "Clérigo",
    tagline: "Campeão divino guiado pela fé",
    icon: Star,
    color: "#FDCB6E",
    hitDie: 8,
    primaryAbilities: ["wis"],
    savingThrows: ["wis", "cha"],
    armorProficiencies: ["Armaduras leves", "Armaduras médias", "Escudos"],
    weaponProficiencies: ["Armas simples"],
    skillChoices: {
      count: 2,
      options: [
        "História",
        "Intuição",
        "Medicina",
        "Persuasão",
        "Religião",
      ],
    },
    features: [
      {
        name: "Conjuração",
        description:
          "Como condutor do poder divino, você pode conjurar magias de clérigo. Você começa com 3 truques e prepara magias de 1º nível a cada dia. Sabedoria é seu atributo de conjuração.",
        level: 1,
      },
      {
        name: "Domínio Divino",
        description:
          "Escolha um domínio relacionado à sua divindade. Seu domínio concede magias de domínio e outros recursos.",
        level: 1,
        choices: {
          id: "divine-domain",
          label: "Domínio Divino",
          options: [
            {
              id: "knowledge",
              name: "Conhecimento",
              description:
                "Aprendizado e informação. Idiomas e perícias adicionais.",
            },
            {
              id: "life",
              name: "Vida",
              description:
                "Cura e vitalidade. Curas mais eficientes e armaduras pesadas.",
            },
            {
              id: "light",
              name: "Luz",
              description:
                "Fogo e radiância. Truque Luz e Flare de Proteção como reação.",
            },
            {
              id: "nature",
              name: "Natureza",
              description:
                "Poder dos elementos e animais. Truque de druida e armaduras pesadas.",
            },
            {
              id: "tempest",
              name: "Tempestade",
              description:
                "Relâmpago e trovão. Armaduras pesadas e armas marciais. Retaliação elétrica.",
            },
            {
              id: "trickery",
              name: "Trapaça",
              description:
                "Engano e ilusão. Bênção do Trapaceiro concede vantagem em Furtividade.",
            },
            {
              id: "war",
              name: "Guerra",
              description:
                "Combate e conquista. Armas marciais e armaduras pesadas. Ataques bônus guiados.",
            },
          ],
        },
      },
    ],
    role: "support",
    complexity: "moderate",
  },

  // ─── 11. Druida ──────────────────────────────────────────
  {
    id: "druid",
    name: "Druida",
    tagline: "Guardião da natureza e mestre das formas selvagens",
    icon: TreePine,
    color: "#55EFC4",
    hitDie: 8,
    primaryAbilities: ["wis"],
    savingThrows: ["int", "wis"],
    armorProficiencies: [
      "Armaduras leves (não-metálicas)",
      "Armaduras médias (não-metálicas)",
      "Escudos (não-metálicos)",
    ],
    weaponProficiencies: [
      "Clavas",
      "Adagas",
      "Dardos",
      "Azagaias",
      "Maças",
      "Bordões",
      "Cimitarras",
      "Foices",
      "Fundas",
      "Lanças",
    ],
    skillChoices: {
      count: 2,
      options: [
        "Arcanismo",
        "Adestrar Animais",
        "Intuição",
        "Medicina",
        "Natureza",
        "Percepção",
        "Religião",
        "Sobrevivência",
      ],
    },
    features: [
      {
        name: "Druídico",
        description:
          "Você conhece o Druídico, a linguagem secreta dos druidas. Você pode falar e deixar mensagens ocultas nesta língua. Apenas druidas podem entendê-la.",
        level: 1,
      },
      {
        name: "Conjuração",
        description:
          "Através da essência divina da natureza, você pode conjurar magias de druida. Você começa com 2 truques e prepara magias de 1º nível a cada dia. Sabedoria é seu atributo de conjuração.",
        level: 1,
      },
    ],
    role: "caster",
    complexity: "complex",
  },

  // ─── 12. Bardo ───────────────────────────────────────────
  {
    id: "bard",
    name: "Bardo",
    tagline: "Artista mágico que inspira aliados",
    icon: Music,
    color: "#FD79A8",
    hitDie: 8,
    primaryAbilities: ["cha"],
    savingThrows: ["dex", "cha"],
    armorProficiencies: ["Armaduras leves"],
    weaponProficiencies: [
      "Armas simples",
      "Bestas de mão",
      "Espadas longas",
      "Rapieiras",
      "Espadas curtas",
    ],
    toolProficiencies: ["Três instrumentos musicais à escolha"],
    skillChoices: {
      count: 3,
      options: [
        "Acrobacia",
        "Adestrar Animais",
        "Arcanismo",
        "Atletismo",
        "Atuação",
        "Enganação",
        "Furtividade",
        "História",
        "Intimidação",
        "Intuição",
        "Investigação",
        "Medicina",
        "Natureza",
        "Percepção",
        "Persuasão",
        "Prestidigitação",
        "Religião",
        "Sobrevivência",
      ],
    },
    features: [
      {
        name: "Conjuração",
        description:
          "Você aprendeu a tecer magia através de palavras e música. Você começa com 2 truques e 4 magias de 1º nível conhecidas. Carisma é seu atributo de conjuração.",
        level: 1,
      },
      {
        name: "Inspiração Bárdica",
        description:
          "Você pode inspirar outros através de palavras ou música. Como ação bônus, conceda um dado de Inspiração Bárdica (d6) a uma criatura a até 18m. Nos próximos 10 minutos, ela pode adicionar o dado a um teste de habilidade, jogada de ataque ou teste de resistência. Usos iguais ao mod CAR por descanso longo.",
        level: 1,
      },
    ],
    role: "support",
    complexity: "moderate",
  },
];
