import type { DiceStats } from "@questboard/types";

const DIE_TYPES = [
  { key: "d4" as const, label: "d4", color: "bg-gray-500" },
  { key: "d6" as const, label: "d6", color: "bg-blue-500" },
  { key: "d8" as const, label: "d8", color: "bg-green-500" },
  { key: "d10" as const, label: "d10", color: "bg-yellow-500" },
  { key: "d12" as const, label: "d12", color: "bg-orange-500" },
  { key: "d20" as const, label: "d20", color: "bg-brand-accent" },
  { key: "d100" as const, label: "d100", color: "bg-purple-500" },
];

export function SessionDiceStats({ stats }: { stats: DiceStats }) {
  const maxCount = Math.max(
    ...DIE_TYPES.map((d) => stats[d.key]),
    1,
  );

  return (
    <div className="rounded-xl border border-white/5 bg-surface-light">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Dados</h3>
      </div>
      <div className="p-4">
        {/* Bar chart */}
        <div className="flex items-end gap-2" style={{ height: 120 }}>
          {DIE_TYPES.map((die) => {
            const count = stats[die.key];
            const height = Math.max(
              (count / maxCount) * 100,
              count > 0 ? 8 : 0,
            );
            return (
              <div
                key={die.key}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-[10px] text-gray-400">
                  {count}
                </span>
                <div
                  className={`w-full rounded-t ${die.color}/60`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] font-medium text-gray-500">
                  {die.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {stats.totalRolls}
            </p>
            <p className="text-[10px] text-gray-400">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-400">
              {stats.nat20s}
            </p>
            <p className="text-[10px] text-gray-400">Nat 20</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-400">{stats.nat1s}</p>
            <p className="text-[10px] text-gray-400">Nat 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
