import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuestBoard — Sua mesa de RPG, online",
  description: "Crie sessões, gerencie personagens e role dados — tudo em um só lugar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
