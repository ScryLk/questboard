import {
  Dice5,
  Eye,
  MessageCircle,
  Swords,
  Footprints,
  X,
  type LucideIcon,
} from "lucide-react";
import type { RadialActionId } from "@questboard/constants";

// Reusa Lucide — consistente com o resto do app (target-panel, action
// bar, chat, dice). `currentColor` segue a cor do container.

const ICON_MAP: Record<RadialActionId, LucideIcon> = {
  attack: Swords,
  converse: MessageCircle,
  test: Dice5,
  move_to: Footprints,
  inspect: Eye,
};

export function RadialActionIcon({
  id,
  className,
}: {
  id: RadialActionId;
  className?: string;
}) {
  const Icon = ICON_MAP[id];
  return <Icon className={className} aria-hidden />;
}

export function Close({ className }: { className?: string }) {
  return <X className={className} aria-hidden />;
}
