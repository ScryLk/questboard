"use client";

import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
