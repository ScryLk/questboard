import type { PlayerStatus } from "@/lib/gameplay-mock-data";

interface StatusDotProps {
  status: PlayerStatus;
  size?: number;
}

const STATUS_COLORS: Record<PlayerStatus, string> = {
  online: "#00B894",
  away: "#FDCB6E",
  offline: "#5A5A6E",
};

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: STATUS_COLORS[status],
      }}
    />
  );
}
