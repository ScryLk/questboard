import type { TokenAlignment } from "@/lib/gameplay-mock-data";

// Mapeamento: compendium creature ID → sprite PNG em /questboard-caracteres/
export const CREATURE_SPRITES: Record<string, string> = {
  "giant-spider": "/questboard-caracteres/aranha.png",
  assassin: "/questboard-caracteres/assassino.png",
  bandit: "/questboard-caracteres/bandido.png",
  bugbear: "/questboard-caracteres/bugbear.png",
  knight: "/questboard-caracteres/cavaleiro.png",
  cultist: "/questboard-caracteres/cultista.png",
  "mind-flayer": "/questboard-caracteres/devoradormentes.png",
  "young-red-dragon": "/questboard-caracteres/dragaojoven.png",
  skeleton: "/questboard-caracteres/esqueleto.png",
  ghoul: "/questboard-caracteres/gnoll-carcereiro.png",
  goblin: "/questboard-caracteres/goblin.png",
  "goblin-boss": "/questboard-caracteres/goblinchefe.png",
  guard: "/questboard-caracteres/guarda.png",
  hobgoblin: "/questboard-caracteres/hobgoblin.png",
  kobold: "/questboard-caracteres/kobold.png",
  wolf: "/questboard-caracteres/lobo.png",
  "dire-wolf": "/questboard-caracteres/loboterrivel.png",
  mage: "/questboard-caracteres/mago.png",
  mimic: "/questboard-caracteres/mimico.png",
  minotaur: "/questboard-caracteres/minotauro.png",
  ogre: "/questboard-caracteres/ogro.png",
  orc: "/questboard-caracteres/orc.png",
  commoner: "/questboard-caracteres/plebeu.png",
  troll: "/questboard-caracteres/troll.png",
  owlbear: "/questboard-caracteres/ursocoruja.png",
  zombie: "/questboard-caracteres/zumbi.png",
};

// Cores dos olhos por alignment (índole)
export const ALIGNMENT_EYE_COLORS: Record<TokenAlignment, string> = {
  hostile: "#FF2222",
  ally: "#22FF66",
  neutral: "#C0C0C0",
  player: "#22FF66",
};

export const ALIGNMENT_LABELS: Record<TokenAlignment, string> = {
  hostile: "Hostil",
  ally: "Aliado",
  neutral: "Neutro",
  player: "Jogador",
};
