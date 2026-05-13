"use client";

// Componente de exibição do handle "Lucas#7H2K". Por default mostra
// só `username` e expõe o tag completo no tooltip + copy-to-clipboard.
// Útil em headers, listas de jogadores, etc.

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  username: string;
  tag: string;
  /** Quando true, mostra `username#tag` inline (sem tooltip). */
  showTag?: boolean;
  /** Classe extra pro container. */
  className?: string;
  /** Quando true, oferece botão de copiar ao lado. */
  copyable?: boolean;
}

export function UserHandle({
  username,
  tag,
  showTag,
  className,
  copyable,
}: Props) {
  const [copied, setCopied] = useState(false);
  const handle = `${username}#${tag.toUpperCase()}`;

  async function copy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (showTag) {
    return (
      <span className={className} title={handle}>
        <span className="text-white">{username}</span>
        <span className="text-brand-muted">#{tag.toUpperCase()}</span>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            className="ml-1 cursor-pointer rounded p-0.5 text-brand-muted hover:bg-white/10 hover:text-white"
            aria-label="Copiar handle"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </span>
    );
  }

  return (
    <span
      className={className}
      title={handle}
      onClick={copyable ? copy : undefined}
    >
      <span className={copyable ? "cursor-pointer" : undefined}>
        {username}
      </span>
    </span>
  );
}
