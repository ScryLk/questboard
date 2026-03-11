import {
  Sword,
  Swords,
  Target,
  Wand2,
  Sparkles,
  Flame,
  Snowflake,
  Zap,
  Shield,
  Heart,
  Eye,
  ScrollText,
  FlaskConical,
  Hand,
  Skull,
  Axe,
  Search,
  type LucideIcon,
} from "lucide-react-native";

export const ABILITY_ICONS: Record<string, LucideIcon> = {
  // Weapons
  sword: Sword,
  dagger: Swords,
  axe: Axe,
  bow: Target,
  hammer: Axe, // no dedicated hammer icon, reuse axe
  spear: Sword,
  staff: Wand2,

  // Spells
  wand: Wand2,
  spell: Sparkles,
  fire: Flame,
  snowflake: Snowflake,
  lightning: Zap,
  heart: Heart,
  skull: Skull,
  eye: Eye,
  shield: Shield,
  sparkles: Sparkles,

  // Items
  scroll: ScrollText,
  potion: FlaskConical,
  fist: Hand,

  // Skills
  search: Search,
};

export function getAbilityIcon(key: string): LucideIcon {
  return ABILITY_ICONS[key] ?? Zap;
}
