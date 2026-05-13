import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { SettingsEffects } from "@/components/settings/settings-effects";
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
    <ClerkProvider
      localization={ptBR}
      appearance={{
        variables: {
          colorPrimary: "#6C5CE7",
          colorBackground: "#0A0A0F",
          colorInputBackground: "#16161D",
          colorInputText: "#FFFFFF",
          colorText: "#FFFFFF",
        },
      }}
      signInUrl="/login"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="pt-BR">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0A0A0F" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={`${inter.variable} ${cinzel.variable} antialiased`}>
          <SettingsEffects />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
