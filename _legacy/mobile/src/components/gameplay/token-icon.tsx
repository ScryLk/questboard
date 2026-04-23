import { memo } from "react";
import {
  User,
  Crown,
  Bot,
  Sword,
  Wand2,
  Shield,
  Skull,
  UserPlus,
  Crosshair,
  Swords,
} from "lucide-react-native";

const ICON_MAP: Record<string, typeof User> = {
  user: User,
  crown: Crown,
  bot: Bot,
  sword: Sword,
  wand: Wand2,
  shield: Shield,
  skull: Skull,
  "user-plus": UserPlus,
  crosshair: Crosshair,
  swords: Swords,
};

interface TokenIconProps {
  name: string;
  size: number;
  color: string;
}

function TokenIconInner({ name, size, color }: TokenIconProps) {
  const Icon = ICON_MAP[name] || User;
  return <Icon size={size} color={color} />;
}

export const TokenIcon = memo(TokenIconInner);
