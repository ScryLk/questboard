"use client";

interface ScreenShakeProps {
  active: boolean;
  children: React.ReactNode;
}

export function ScreenShake({ active, children }: ScreenShakeProps) {
  return (
    <div
      className="flex-1"
      style={{
        display: "flex",
        minHeight: 0,
        overflow: "hidden",
        animation: active ? "screenShake 250ms ease-out" : undefined,
      }}
    >
      {children}

      <style jsx>{`
        @keyframes screenShake {
          0% {
            transform: translate(0, 0);
          }
          20% {
            transform: translate(-2px, 1px);
          }
          40% {
            transform: translate(2px, -1px);
          }
          60% {
            transform: translate(-1px, 2px);
          }
          80% {
            transform: translate(1px, -1px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
}
