"use client";

// Rodapé canônico de atribuição CC-BY 4.0. Aparece em qualquer card de
// detalhe de conteúdo SRD (regra do prompt §0.2). Versão `inline`
// usada em listagens, versão `card` usada em páginas de detalhe.

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { SrdAttribution } from "@/types/srd";

interface Props {
  attribution: SrdAttribution;
  variant?: "inline" | "card";
  className?: string;
}

export function SrdAttributionFooter({
  attribution,
  variant = "inline",
  className,
}: Props) {
  if (variant === "inline") {
    // Span (não Link) — cards de listagem normalmente são <Link>
    // wrappers, e <a> aninhado é HTML inválido. Atribuição completa
    // fica acessível via /legal/srd-attribution no rodapé da página.
    return (
      <span
        className={`text-[10px] text-brand-muted/70 ${className ?? ""}`}
        title={attribution.text}
      >
        {attribution.text}
      </span>
    );
  }

  return (
    <div
      className={`mt-6 rounded-lg border border-brand-border bg-white/[0.02] px-4 py-3 text-[11px] text-brand-muted ${className ?? ""}`}
    >
      <p>
        Este compêndio inclui material do{" "}
        <a
          href="https://dnd.wizards.com/resources/systems-reference-document"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-accent hover:underline"
        >
          System Reference Document 5.1
        </a>{" "}
        da Wizards of the Coast LLC, licenciado sob{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/legalcode"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-accent hover:underline"
        >
          Creative Commons Attribution 4.0
        </a>
        .
        {attribution.reference && (
          <span className="ml-1 text-brand-muted/70">
            Referência: {attribution.reference}.
          </span>
        )}
      </p>
      <Link
        href="/legal/srd-attribution"
        className="mt-1 inline-flex items-center gap-1 text-[10px] text-brand-accent/80 hover:underline"
      >
        Ver atribuição completa
        <ExternalLink className="h-2.5 w-2.5" />
      </Link>
    </div>
  );
}
