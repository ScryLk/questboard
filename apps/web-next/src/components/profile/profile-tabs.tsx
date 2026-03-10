"use client";

import Link from "next/link";

interface ProfileTabsProps {
  username: string;
  activeTab: "adventurer" | "gm";
}

const TABS = [
  { key: "adventurer" as const, label: "Aventureiro", href: (u: string) => `/u/${u}` },
  { key: "gm" as const, label: "Mestre", href: (u: string) => `/u/${u}/gm` },
];

export function ProfileTabs({ username, activeTab }: ProfileTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1">
      {TABS.map(({ key, label, href }) => (
        <Link
          key={key}
          href={href(username)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === key
              ? "bg-brand-accent/15 text-brand-accent"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
