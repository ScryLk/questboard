// ── Class Icon & Color Utilities ──
// Maps DND5E_CLASSES string icon names to Lucide React Native components

import {
  Sword,
  Axe,
  Shield,
  Crosshair,
  Hand,
  Eye,
  BookOpen,
  Zap,
  Skull,
  Star,
  TreePine,
  Music,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { CLASS_COLORS } from "@questboard/constants";

const ICON_MAP: Record<string, LucideIcon> = {
  Sword,
  Axe,
  Shield,
  Crosshair,
  Hand,
  Eye,
  BookOpen,
  Zap,
  Skull,
  Star,
  TreePine,
  Music,
};

export function getClassIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Sword;
}

export function getClassColor(classId: string): string {
  return CLASS_COLORS[classId] ?? "#6C5CE7";
}
