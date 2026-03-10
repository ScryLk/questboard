export type Condition =
  | "blinded"
  | "charmed"
  | "deafened"
  | "exhaustion"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious";

export interface ActionEconomy {
  action: boolean; // true = já usou a Ação neste turno
  bonusAction: boolean; // true = já usou a Ação de Bônus
  reaction: boolean; // true = já usou a Reação
  movementUsed: number; // quadrados gastos (inteiros)
  movementMax: number; // velocidade base do token (padrão: 6 quadrados = 30ft)
  isDashing: boolean; // Dash dobra o movimento disponível
}

export interface SpellSlots {
  [level: number]: { used: number; max: number };
}

export interface CustomResource {
  id: string;
  name: string; // ex: "Ki", "Superiority Dice", "Sorcery Points"
  current: number;
  max: number;
  rechargeOn: "short_rest" | "long_rest" | "dawn" | "manual";
  icon?: string; // nome do ícone Lucide
}

export interface CombatantResources {
  // Vida
  hpCurrent: number;
  hpMax: number;
  hpTemp: number; // HP temporário (absorve dano primeiro)
  deathSaves: {
    successes: number; // 0–3
    failures: number; // 0–3
  };

  // Economia de ação
  actionEconomy: ActionEconomy;

  // Magia
  mana?: { current: number; max: number };
  spellSlots?: SpellSlots;
  concentrationSpellId: string | null; // ID da magia de concentração ativa

  // Condições
  conditions: Condition[];

  // Recursos personalizados (Ki, Channel Divinity, etc.)
  customResources: CustomResource[];
}

export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  initiative: number;
  avatarUrl?: string;
  tokenId: string;
  icon: string;
  resources: CombatantResources;
  isActive: boolean; // é o turno deste combatente agora?
  isDead: boolean;
}

// Condições que incapacitam (impedem ações)
export const INCAPACITATING_CONDITIONS: Condition[] = [
  "paralyzed",
  "petrified",
  "stunned",
  "unconscious",
];

export const ALL_CONDITIONS: { id: Condition; label: string; icon: string }[] =
  [
    { id: "blinded", label: "Cego", icon: "eye-off" },
    { id: "charmed", label: "Enfeitiçado", icon: "heart" },
    { id: "deafened", label: "Surdo", icon: "ear-off" },
    { id: "exhaustion", label: "Exaustão", icon: "battery-low" },
    { id: "frightened", label: "Assustado", icon: "alert-triangle" },
    { id: "grappled", label: "Agarrado", icon: "hand" },
    { id: "incapacitated", label: "Incapacitado", icon: "ban" },
    { id: "invisible", label: "Invisível", icon: "ghost" },
    { id: "paralyzed", label: "Paralisado", icon: "lock" },
    { id: "petrified", label: "Petrificado", icon: "mountain" },
    { id: "poisoned", label: "Envenenado", icon: "flask-round" },
    { id: "prone", label: "Caído", icon: "arrow-down" },
    { id: "restrained", label: "Impedido", icon: "link" },
    { id: "stunned", label: "Atordoado", icon: "zap" },
    { id: "unconscious", label: "Inconsciente", icon: "moon" },
  ];

export const DEFAULT_ACTION_ECONOMY: ActionEconomy = {
  action: false,
  bonusAction: false,
  reaction: false,
  movementUsed: 0,
  movementMax: 6,
  isDashing: false,
};

export function createDefaultResources(
  hp: number,
  speed = 30,
): CombatantResources {
  return {
    hpCurrent: hp,
    hpMax: hp,
    hpTemp: 0,
    deathSaves: { successes: 0, failures: 0 },
    actionEconomy: {
      ...DEFAULT_ACTION_ECONOMY,
      movementMax: Math.floor(speed / 5), // 30ft → 6 quadrados
    },
    concentrationSpellId: null,
    conditions: [],
    customResources: [],
  };
}
