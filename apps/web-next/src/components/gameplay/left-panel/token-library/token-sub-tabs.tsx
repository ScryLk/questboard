"use client";

export type TokenSubTab = "mine" | "compendium" | "groups";

interface TokenSubTabsProps {
  active: TokenSubTab;
  onChange: (tab: TokenSubTab) => void;
}

const TABS: Array<{ key: TokenSubTab; label: string }> = [
  { key: "mine", label: "Meus" },
  { key: "compendium", label: "Compendio" },
  { key: "groups", label: "Grupos" },
];

export function TokenSubTabs({ active, onChange }: TokenSubTabsProps) {
  return (
    <div className="flex gap-0.5 px-2 pb-1.5">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
            active === key
              ? "bg-brand-accent/20 text-brand-accent"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
