import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600", "900"] });

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
      <body className={`${inter.variable} ${cinzel.variable} antialiased`}>{children}</body>
    </html>
  );
}
