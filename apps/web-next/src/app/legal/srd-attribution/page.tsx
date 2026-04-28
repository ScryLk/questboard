import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  ScrollText,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Atribuição SRD 5.1 — QuestBoard",
  description:
    "Atribuição obrigatória ao System Reference Document 5.1 da Wizards of the Coast (CC-BY 4.0).",
};

export default function SrdAttributionPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-brand-text">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar
      </Link>

      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-brand-accent">
        <ScrollText className="h-4 w-4" />
        Atribuição legal
      </div>
      <h1 className="font-cinzel text-3xl font-bold text-brand-text">
        SRD 5.1 — Creative Commons BY 4.0
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        Esta página atende ao requisito de atribuição da licença Creative
        Commons. Toda exibição de conteúdo do SRD 5.1 no QuestBoard linka
        aqui.
      </p>

      <section className="mt-8 rounded-xl border border-brand-border bg-white/[0.02] p-5 text-sm leading-relaxed">
        <p>
          Este compêndio inclui material do System Reference Document 5.1
          (&ldquo;SRD 5.1&rdquo;) da Wizards of the Coast LLC, disponível
          em{" "}
          <a
            href="https://dnd.wizards.com/resources/systems-reference-document"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent hover:underline"
          >
            https://dnd.wizards.com/resources/systems-reference-document
          </a>
          .
        </p>
        <p className="mt-3">
          O SRD 5.1 está licenciado sob a{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/legalcode"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent hover:underline"
          >
            Creative Commons Attribution 4.0 International License
          </a>
          .
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
          <div className="mb-2 flex items-center gap-2 text-brand-accent">
            <FileText className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              O que está incluído
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-brand-text/90">
            <li>• Magias do SRD 5.1 (nomes, escolas, descrições)</li>
            <li>• Monstros e seus blocos de status</li>
            <li>• Itens, armas, armaduras e itens mágicos básicos</li>
            <li>• Raças e suas características raciais</li>
            <li>• Classes e progressões básicas</li>
            <li>• Condições e regras de combate</li>
          </ul>
        </div>

        <div className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
          <div className="mb-2 flex items-center gap-2 text-brand-warning">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              O que NÃO está incluído
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-brand-text/90">
            <li>• Conteúdo do Player&rsquo;s Handbook completo</li>
            <li>• Conteúdo do Monster Manual completo</li>
            <li>• Material do Tasha&rsquo;s, Xanathar&rsquo;s, Mordenkainen&rsquo;s</li>
            <li>• Aventuras oficiais (Curse of Strahd, etc.)</li>
            <li>• Imagens e arte oficial</li>
            <li>• Marcas registradas (Forgotten Realms, Drizzt, etc.)</li>
          </ul>
        </div>
      </section>

      <section className="mt-8 space-y-3 text-sm text-brand-text/90">
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Liberdades concedidas pela CC-BY 4.0
        </h2>
        <p>
          A licença CC-BY 4.0 permite ao QuestBoard:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-brand-muted">
          <li>Compartilhar — copiar e redistribuir o material em qualquer suporte ou formato.</li>
          <li>
            Adaptar — remixar, transformar e criar a partir do material para qualquer fim, mesmo que comercial.
          </li>
        </ul>
        <p>
          Em troca, somos obrigados a dar crédito apropriado, fornecer o link
          para a licença e indicar mudanças. É exatamente isso que esta
          página faz, e o que cada card de detalhe SRD reforça com seu
          rodapé linkando para cá.
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-brand-border bg-white/[0.02] p-5">
        <h2 className="mb-2 font-cinzel text-lg font-semibold text-brand-text">
          Outros sistemas
        </h2>
        <p className="text-sm text-brand-muted">
          Tormenta20, Ordem Paranormal e Call of Cthulhu não têm SRD aberto.
          O QuestBoard suporta a estrutura desses sistemas para que GMs
          adicionem conteúdo homebrew nas suas próprias campanhas, mas{" "}
          <strong className="text-brand-text">não distribui nenhum material desses jogos</strong>.
          Para conteúdo oficial, consulte os livros publicados pelas
          editoras detentoras dos direitos.
        </p>
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <a
          href="https://dnd.wizards.com/resources/systems-reference-document"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-accent/10 px-4 py-2 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          SRD 5.1 oficial
        </a>
        <a
          href="https://creativecommons.org/licenses/by/4.0/legalcode"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-4 py-2 text-xs text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Texto legal CC-BY 4.0
        </a>
        <Link
          href="/compendium"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-4 py-2 text-xs text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
        >
          <FileText className="h-3.5 w-3.5" />
          Ir ao compêndio
        </Link>
      </section>
    </div>
  );
}
