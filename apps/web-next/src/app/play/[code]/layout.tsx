import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "QuestBoard — Jogar",
  description: "Entre na sua mesa de RPG online",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0F",
};

export default function PlaySessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-full overflow-hidden bg-[#0A0A0F]">
      {children}
    </div>
  );
}
