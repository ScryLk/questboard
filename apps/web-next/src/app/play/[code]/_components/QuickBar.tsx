"use client";

import { Dices, Crosshair, Hand, Moon } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function QuickBar() {
  const setActiveTab = usePlayerViewStore((s) => s.setActiveTab);
  const setPanelVisible = usePlayerViewStore((s) => s.setPanelVisible);
  const sendSignal = usePlayerViewStore((s) => s.sendSignal);

  const handleDice = () => {
    setActiveTab("dados");
    setPanelVisible(true);
  };

  const handleMyToken = () => {
    // This triggers centering via the PlayerCanvas "Go to my token" logic
    setPanelVisible(false);
  };

  const handleSignal = () => {
    sendSignal("hand_raised");
  };

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-white/5 bg-[#0D0D12] px-3 py-2">
      <QuickButton
        icon={<Dices className="h-4 w-4" />}
        label="Rolar"
        onClick={handleDice}
      />
      <QuickButton
        icon={<Crosshair className="h-4 w-4" />}
        label="Meu Token"
        onClick={handleMyToken}
      />
      <QuickButton
        icon={<Hand className="h-4 w-4" />}
        label="Sinalizar"
        onClick={handleSignal}
      />
      <QuickButton
        icon={<Moon className="h-4 w-4" />}
        label="Descanso"
        onClick={() => {}}
      />
    </div>
  );
}

function QuickButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-brand-muted transition-colors active:bg-white/5 active:text-brand-accent"
    >
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  );
}
