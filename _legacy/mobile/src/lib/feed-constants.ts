import type { LucideIcon } from "lucide-react-native";
import { Flame, Heart, Laugh, ScrollText, Skull, Swords } from "lucide-react-native";
import { ReactionType } from "@questboard/types";

export interface ReactionMeta {
  type: ReactionType;
  icon: LucideIcon;
  label: string;
  color: string;
}

export const REACTIONS: ReactionMeta[] = [
  { type: ReactionType.EPIC, icon: Swords, label: "Epico", color: "#6C5CE7" },
  { type: ReactionType.LORE, icon: ScrollText, label: "Lore", color: "#00CEC9" },
  { type: ReactionType.LAUGH, icon: Laugh, label: "Haha", color: "#FDCB6E" },
  { type: ReactionType.RIP, icon: Skull, label: "RIP", color: "#FF6B6B" },
  { type: ReactionType.HYPE, icon: Flame, label: "Hype", color: "#E17055" },
  { type: ReactionType.HEART, icon: Heart, label: "Incrivel", color: "#FF6B9D" },
];

export const REACTION_MAP: Record<ReactionType, ReactionMeta> =
  Object.fromEntries(REACTIONS.map((r) => [r.type, r])) as Record<
    ReactionType,
    ReactionMeta
  >;
