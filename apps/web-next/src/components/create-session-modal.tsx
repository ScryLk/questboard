"use client";

import { useCallback, useState } from "react";
import {
  CheckCircle,
  Copy,
  Download,
  Link2,
  Mail,
  Maximize2,
  MessageCircle,
  Ruler,
  Send,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { QRCodeModal } from "@/components/qr/qr-code-modal";
import { useMapScale, type UnitSystem } from "@/lib/map-scale-store";

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
}

type ModalStep = "form" | "confirmation";

const MOCK_PLAYERS = [
  { id: "p1", name: "Maria Santos", character: "Eldrin", checked: true },
  { id: "p2", name: "Pedro Costa", character: "Kira Ironfist", checked: true },
  { id: "p3", name: "Ana Costa", character: "Zael", checked: true },
  { id: "p4", name: "Joao Oliveira", character: "Theron", checked: true },
];

const MOCK_MAPS = [
  "Torre de Ravenloft",
  "Taverna do Dragao",
  "Floresta Svalich",
  "Nenhum",
];

const DURATIONS = ["2 horas", "3 horas", "4 horas", "5 horas", "6 horas"];

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function CreateSessionModal({ open, onClose }: CreateSessionModalProps) {
  const [step, setStep] = useState<ModalStep>("form");
  const [title, setTitle] = useState("A Torre de Ravenloft");
  const [date, setDate] = useState("2026-03-15");
  const [time, setTime] = useState("20:00");
  const [duration, setDuration] = useState("3 horas");
  const [selectedMap, setSelectedMap] = useState("Torre de Ravenloft");
  const [notes, setNotes] = useState("");
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const unitSystem = useMapScale((s) => s.unitSystem);
  const unitsPerCell = useMapScale((s) => s.unitsPerCell);
  const setScale = useMapScale((s) => s.setScale);
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrFullscreen, setQrFullscreen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
      const res = await fetch(`${apiUrl}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "web-dev-user",
        },
        body: JSON.stringify({
          name: title,
          system: "dnd5e",
          maxPlayers: players.filter((p) => p.checked).length + 1,
          isPublic: false,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.inviteCode) {
        setGeneratedCode(data.data.inviteCode);
        setStep("confirmation");
      } else {
        // Fallback to local code if API fails
        setGeneratedCode(generateCode());
        setStep("confirmation");
      }
    } catch {
      // Fallback to local code if API unreachable
      setGeneratedCode(generateCode());
      setStep("confirmation");
    } finally {
      setCreating(false);
    }
  }, [creating, title, players]);

  const handleClose = useCallback(() => {
    setStep("form");
    setCodeCopied(false);
    setLinkCopied(false);
    onClose();
  }, [onClose]);

  const togglePlayer = useCallback((id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)),
    );
  }, []);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }, [generatedCode]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`questboard.app/join/${generatedCode}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [generatedCode]);

  const shareText = `QuestBoard — Sessao de RPG!\n\n${title}\n${(() => { const d = new Date(date + "T" + time); return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }) + " as " + time; })()}\n\nEntre com o codigo: ${generatedCode}\nOu acesse: questboard.app/join/${generatedCode}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`questboard.app/join/${generatedCode}`)}&text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Convite QuestBoard — ${title}`)}&body=${encodeURIComponent(shareText)}`;

  const formattedDate = (() => {
    const d = new Date(date + "T" + time);
    return d.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " as " + time;
  })();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className={`w-full overflow-y-auto rounded-2xl border border-brand-border bg-brand-surface ${
          step === "form"
            ? "max-h-[90vh] max-w-[640px]"
            : "max-w-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {step === "form" ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
              <h2 className="text-lg font-bold text-brand-text">
                Criar Nova Sessao
              </h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">
                  Titulo *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-brand-border bg-brand-primary px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-text">
                    Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-primary px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-text">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-primary px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">
                  Duracao estimada
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-lg border border-brand-border bg-brand-primary px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Map */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">
                  Mapa (opcional)
                </label>
                <select
                  value={selectedMap}
                  onChange={(e) => setSelectedMap(e.target.value)}
                  className="w-full rounded-lg border border-brand-border bg-brand-primary px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
                >
                  {MOCK_MAPS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Players */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">
                  Jogadores
                </label>
                <div className="space-y-2">
                  {players.map((player) => (
                    <label
                      key={player.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-brand-border bg-brand-primary px-4 py-2.5 transition-colors hover:border-brand-accent/30"
                    >
                      <input
                        type="checkbox"
                        checked={player.checked}
                        onChange={() => togglePlayer(player.id)}
                        className="h-4 w-4 rounded border-brand-border accent-brand-accent"
                      />
                      <span className="text-sm text-brand-text">
                        {player.name}
                      </span>
                      <span className="text-sm text-brand-muted">
                        ({player.character})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Escala do mapa — campanha-level, persiste em localStorage
                  via map-scale-store (regra #6). Aplica a todos os mapas
                  da campanha. Default IMPERIAL/5 = D&D 5e compat. */}
              <div className="rounded-lg border border-brand-border bg-brand-primary/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-brand-accent" />
                  <span className="text-sm font-medium text-brand-text">
                    Escala do mapa
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-brand-muted">
                      Sistema de unidade
                    </label>
                    <select
                      value={unitSystem}
                      onChange={(e) => {
                        const next = e.target.value as UnitSystem;
                        // Muda pra default sensato ao alternar sistema.
                        const defaultValue =
                          next === "IMPERIAL"
                            ? 5
                            : next === "METRIC"
                              ? 1.5
                              : 1;
                        setScale(next, defaultValue);
                      }}
                      className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                    >
                      <option value="IMPERIAL">Imperial (ft)</option>
                      <option value="METRIC">Métrico (m)</option>
                      <option value="ABSTRACT">Abstrato (célula)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-brand-muted">
                      Por célula
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={unitsPerCell}
                        disabled={unitSystem === "ABSTRACT"}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!Number.isFinite(v) || v <= 0) return;
                          setScale(unitSystem, v);
                        }}
                        className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent disabled:opacity-40"
                      />
                      <span className="text-xs text-brand-muted">
                        {unitSystem === "IMPERIAL"
                          ? "ft"
                          : unitSystem === "METRIC"
                            ? "m"
                            : "célula"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] italic text-brand-muted/70">
                  D&amp;D 5e = 5ft · Tormenta 20 / CoC 7e = 1.5m · mapas de
                  cidade podem usar 10m+
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">
                  Notas de preparacao
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
                  placeholder="Preparar encontro na torre, NPC Strahd aparece..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-brand-border px-6 py-4">
              <button
                onClick={handleClose}
                className="rounded-[10px] border border-brand-border px-5 py-2.5 text-sm font-medium text-brand-text transition-colors hover:bg-brand-surface-light"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || creating}
                className={`rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
                  !title.trim() || creating
                    ? "cursor-not-allowed bg-white/5 text-brand-muted"
                    : "bg-brand-accent hover:bg-brand-accent-hover"
                }`}
              >
                {creating ? "Criando..." : "Criar Sessao"}
              </button>
            </div>
          </>
        ) : (
          /* Confirmation step — compact 2-column, no scroll */
          <div className="relative p-6">
            {/* Close X */}
            <button
              onClick={handleClose}
              className="absolute right-5 top-5 rounded-lg p-1 text-brand-muted transition-colors hover:text-brand-text"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header — inline, left-aligned */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-success/15">
                  <CheckCircle className="h-4 w-4 text-brand-success" />
                </div>
                <p className="text-brand-text">
                  <span className="text-xl font-semibold">Sessao Criada!</span>
                  <span className="ml-2 text-base text-brand-muted">{title}</span>
                </p>
              </div>
              <p className="ml-11 mt-0.5 text-[13px] text-brand-muted">{formattedDate}</p>
            </div>

            {/* Two-column container */}
            <div className="flex flex-col items-stretch gap-4 sm:flex-row">
              {/* Left column — Code */}
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-brand-border bg-[#0A0A0F] p-5">
                <p className="text-[10px] uppercase tracking-[2px] text-brand-muted">
                  Codigo da Sessao
                </p>
                <p className="mt-2 font-mono text-[28px] font-bold leading-none tracking-[6px] text-brand-text">
                  {generatedCode}
                </p>

                <div className="mt-3 flex w-full flex-col gap-1.5">
                  <button
                    onClick={handleCopyCode}
                    className={`flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      codeCopied
                        ? "border-brand-success/30 bg-brand-success/10 text-brand-success"
                        : "border-[#2A2A35] bg-[#1C1C24] text-brand-text hover:bg-white/5"
                    }`}
                  >
                    {codeCopied ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {codeCopied ? "Copiado!" : "Copiar Codigo"}
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className={`flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      linkCopied
                        ? "border-brand-success/30 bg-brand-success/10 text-brand-success"
                        : "border-[#2A2A35] bg-[#1C1C24] text-brand-text hover:bg-white/5"
                    }`}
                  >
                    {linkCopied ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" />
                    )}
                    {linkCopied ? "Copiado!" : "Copiar Link"}
                  </button>
                </div>
              </div>

              {/* Right column — QR Code */}
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-brand-border bg-[#0A0A0F] p-5">
                <div className="rounded-lg bg-white p-3" data-qr-container>
                  {/* @ts-expect-error React 19 type mismatch with qrcode.react */}
                  <QRCodeSVG
                    value={`https://questboard.app/join/${generatedCode}`}
                    size={148}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="mt-2 text-xs text-brand-muted">
                  Escaneie para entrar
                </p>
                <div className="mt-2.5 flex gap-1.5">
                  <button
                    onClick={() => {
                      const container = document.querySelector("[data-qr-container]");
                      const svg = container?.querySelector("svg");
                      if (!svg) return;
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement("canvas");
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return;
                      const img = new Image();
                      img.onload = () => {
                        canvas.width = 400;
                        canvas.height = 400;
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(0, 0, 400, 400);
                        ctx.drawImage(img, 0, 0, 400, 400);
                        const link = document.createElement("a");
                        link.download = `questboard-sessao-${generatedCode}.png`;
                        link.href = canvas.toDataURL("image/png");
                        link.click();
                      };
                      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
                    }}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-[#2A2A35] bg-[#1C1C24] px-2.5 text-xs font-medium text-brand-text transition-colors hover:bg-white/5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Baixar QR
                  </button>
                  <button
                    onClick={() => setQrFullscreen(true)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-[#2A2A35] bg-[#1C1C24] px-2.5 text-xs font-medium text-brand-text transition-colors hover:bg-white/5"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Ampliar
                  </button>
                </div>
              </div>
            </div>

            {/* Footer — share + dashboard link in one row */}
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-[#25D366]/[0.12] px-3 text-xs font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/[0.2]"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-[#0088CC]/[0.12] px-3 text-xs font-medium text-[#0088CC] transition-colors hover:bg-[#0088CC]/[0.2]"
                >
                  <Send className="h-3.5 w-3.5" />
                  Telegram
                </a>
                <a
                  href={emailUrl}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-brand-muted/[0.12] px-3 text-xs font-medium text-brand-muted transition-colors hover:bg-brand-muted/[0.2]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              </div>
              <button
                onClick={handleClose}
                className="text-[13px] font-medium text-brand-accent transition-colors hover:underline"
              >
                Ir para o Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen QR Modal */}
      <QRCodeModal
        open={qrFullscreen}
        onClose={() => setQrFullscreen(false)}
        value={`https://questboard.app/join/${generatedCode}`}
        title={title}
        subtitle={`Sessao #13`}
        code={generatedCode}
      />
    </div>
  );
}
