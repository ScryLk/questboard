"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CloudFog,
  Eraser,
  Flag,
  Heart,
  HelpCircle,
  MapPin,
  PaintBucket,
  Plus,
  Ruler,
  Skull,
  Star,
  StickyNote,
  Sun,
  Target,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { TokenAlignment } from "@/lib/gameplay-mock-data";
import type { NoteColor } from "@/lib/gameplay-mock-data";

interface CellContextMenuProps {
  cellX: number;
  cellY: number;
  x: number;
  y: number;
  onClose: () => void;
}

type PopoverView = null | "addToken" | "marker" | "note";

export function CellContextMenu({ cellX, cellY, x, y, onClose }: CellContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setActiveTool = useGameplayStore((s) => s.setActiveTool);
  const fogCells = useGameplayStore((s) => s.fogCells);
  const addFogCells = useGameplayStore((s) => s.addFogCells);
  const removeFogCells = useGameplayStore((s) => s.removeFogCells);
  const paintTerrain = useGameplayStore((s) => s.paintTerrain);
  const clearCell = useGameplayStore((s) => s.clearCell);
  const addToast = useGameplayStore((s) => s.addToast);
  const addRulerPoint = useGameplayStore((s) => s.addRulerPoint);
  const setRulerActive = useGameplayStore((s) => s.setRulerActive);
  const addMarker = useGameplayStore((s) => s.addMarker);
  const addNote = useGameplayStore((s) => s.addNote);
  const addToken = useGameplayStore((s) => s.addToken);

  const isFogged = fogCells.has(`${cellX},${cellY}`);
  const [popover, setPopover] = useState<PopoverView>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (popover) setPopover(null);
        else onClose();
      }
    }
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, popover]);

  function MenuItem({
    icon: Icon,
    label,
    shortcut,
    onClick,
  }: {
    icon: typeof Plus;
    label: string;
    shortcut?: string;
    onClick?: () => void;
  }) {
    return (
      <button
        onClick={() => { onClick?.(); }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text transition-colors hover:bg-white/[0.05]"
      >
        <Icon className="h-3 w-3 shrink-0 text-brand-muted" />
        <span className="flex-1">{label}</span>
        {shortcut && (
          <span className="text-[10px] text-brand-muted">{shortcut}</span>
        )}
      </button>
    );
  }

  // ── Popovers ──

  if (popover === "addToken") {
    return (
      <div ref={ref} className="fixed z-50 min-w-[260px] rounded-lg border border-brand-border bg-[#16161D] p-3 shadow-xl" style={{ left: x, top: y }}>
        <AddTokenPopover
          cellX={cellX}
          cellY={cellY}
          onCancel={() => setPopover(null)}
          onSubmit={(data) => {
            addToken({ ...data, x: cellX, y: cellY });
            addToast(`${data.name} adicionado em (${cellX}, ${cellY})`);
            onClose();
          }}
        />
      </div>
    );
  }

  if (popover === "marker") {
    return (
      <div ref={ref} className="fixed z-50 min-w-[240px] rounded-lg border border-brand-border bg-[#16161D] p-3 shadow-xl" style={{ left: x, top: y }}>
        <MarkerPopover
          onCancel={() => setPopover(null)}
          onSubmit={(data) => {
            addMarker({ id: `marker_${Date.now()}`, x: cellX, y: cellY, ...data });
            addToast(`Marcador em (${cellX}, ${cellY})`);
            onClose();
          }}
        />
      </div>
    );
  }

  if (popover === "note") {
    return (
      <div ref={ref} className="fixed z-50 min-w-[240px] rounded-lg border border-brand-border bg-[#16161D] p-3 shadow-xl" style={{ left: x, top: y }}>
        <NotePopover
          onCancel={() => setPopover(null)}
          onSubmit={(data) => {
            addNote({ id: `note_${Date.now()}`, x: cellX, y: cellY, ...data });
            addToast(`Nota em (${cellX}, ${cellY})`);
            onClose();
          }}
        />
      </div>
    );
  }

  // ── Main menu ──

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[200px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-1 text-[10px] text-brand-muted">
        Celula ({cellX}, {cellY})
      </div>
      <div className="mx-2 my-0.5 h-px bg-brand-border" />

      <MenuItem
        icon={Plus}
        label="Adicionar Token Aqui"
        onClick={() => setPopover("addToken")}
      />
      <MenuItem
        icon={MapPin}
        label="Marcar Ponto"
        onClick={() => setPopover("marker")}
      />
      <MenuItem
        icon={StickyNote}
        label="Nota no Mapa"
        onClick={() => setPopover("note")}
      />
      <div className="mx-2 my-0.5 h-px bg-brand-border" />
      <MenuItem
        icon={Ruler}
        label="Medir Daqui"
        shortcut="R"
        onClick={() => {
          setActiveTool("ruler");
          addRulerPoint({ x: cellX, y: cellY });
          setRulerActive(true);
          onClose();
        }}
      />
      <MenuItem
        icon={Target}
        label="AOE Daqui"
        shortcut="A"
        onClick={() => {
          setActiveTool("aoe");
          onClose();
        }}
      />
      <div className="mx-2 my-0.5 h-px bg-brand-border" />
      <MenuItem
        icon={PaintBucket}
        label="Pintar Celula"
        onClick={() => {
          paintTerrain(cellX, cellY);
          addToast(`Terreno aplicado em (${cellX}, ${cellY})`);
          onClose();
        }}
      />
      <MenuItem
        icon={Eraser}
        label="Limpar Celula"
        onClick={() => {
          clearCell(cellX, cellY);
          addToast(`Celula (${cellX}, ${cellY}) limpa`);
          onClose();
        }}
      />
      <div className="mx-2 my-0.5 h-px bg-brand-border" />
      <MenuItem
        icon={CloudFog}
        label="Fog Aqui"
        onClick={() => {
          if (!isFogged) {
            addFogCells([{ x: cellX, y: cellY }]);
            addToast(`Nevoa aplicada em (${cellX}, ${cellY})`);
          } else {
            addToast(`Celula ja tem nevoa`);
          }
          onClose();
        }}
      />
      <MenuItem
        icon={Sun}
        label="Revelar Aqui"
        onClick={() => {
          if (isFogged) {
            removeFogCells([{ x: cellX, y: cellY }]);
            addToast(`Celula (${cellX}, ${cellY}) revelada`);
          } else {
            addToast(`Celula ja esta revelada`);
          }
          onClose();
        }}
      />
    </div>
  );
}

// ── AddToken Popover ──

const ALIGNMENTS: { value: TokenAlignment; label: string }[] = [
  { value: "player", label: "Jogador" },
  { value: "hostile", label: "Hostil" },
  { value: "ally", label: "Aliado" },
  { value: "neutral", label: "Neutro" },
];

const SIZES = [1, 2, 3, 4];

function AddTokenPopover({
  cellX,
  cellY,
  onCancel,
  onSubmit,
}: {
  cellX: number;
  cellY: number;
  onCancel: () => void;
  onSubmit: (data: { name: string; alignment: TokenAlignment; hp: number; maxHp: number; ac: number; size: number }) => void;
}) {
  const [name, setName] = useState("");
  const [alignment, setAlignment] = useState<TokenAlignment>("hostile");
  const [hp, setHp] = useState(10);
  const [ac, setAc] = useState(10);
  const [size, setSize] = useState(1);

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold text-brand-text">Adicionar Token</span>

      <input
        autoFocus
        placeholder="Nome do token"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-7 rounded border border-brand-border bg-brand-primary px-2 text-xs text-brand-text outline-none focus:border-brand-accent"
      />

      <div>
        <span className="mb-1 block text-[10px] text-brand-muted">Tipo</span>
        <div className="flex flex-wrap gap-1">
          {ALIGNMENTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setAlignment(value)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                alignment === value
                  ? "bg-brand-accent text-white"
                  : "bg-white/[0.04] text-brand-muted hover:bg-white/[0.08]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <span className="mb-1 block text-[10px] text-brand-muted">HP</span>
          <input
            type="number"
            value={hp}
            onChange={(e) => setHp(Number(e.target.value))}
            className="h-7 w-full rounded border border-brand-border bg-brand-primary px-2 text-xs text-brand-text outline-none focus:border-brand-accent"
          />
        </div>
        <div className="flex-1">
          <span className="mb-1 block text-[10px] text-brand-muted">CA</span>
          <input
            type="number"
            value={ac}
            onChange={(e) => setAc(Number(e.target.value))}
            className="h-7 w-full rounded border border-brand-border bg-brand-primary px-2 text-xs text-brand-text outline-none focus:border-brand-accent"
          />
        </div>
      </div>

      <div>
        <span className="mb-1 block text-[10px] text-brand-muted">Tamanho</span>
        <div className="flex gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                size === s
                  ? "bg-brand-accent text-white"
                  : "bg-white/[0.04] text-brand-muted hover:bg-white/[0.08]"
              }`}
            >
              {s}x{s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button onClick={onCancel} className="px-2 py-1 text-[10px] text-brand-muted transition-colors hover:text-brand-text">
          Cancelar
        </button>
        <button
          onClick={() => {
            if (!name.trim()) return;
            onSubmit({ name: name.trim(), alignment, hp, maxHp: hp, ac, size });
          }}
          disabled={!name.trim()}
          className="rounded-md bg-brand-accent px-3 py-1 text-[10px] font-medium text-white transition-colors hover:bg-brand-accent-hover disabled:opacity-40"
        >
          Criar
        </button>
      </div>
    </div>
  );
}

// ── Marker Popover ──

const MARKER_TYPES = [
  { value: "flag" as const, icon: Flag, label: "Bandeira" },
  { value: "alert" as const, icon: AlertTriangle, label: "Alerta" },
  { value: "question" as const, icon: HelpCircle, label: "Duvida" },
  { value: "star" as const, icon: Star, label: "Estrela" },
  { value: "skull" as const, icon: Skull, label: "Caveira" },
  { value: "heart" as const, icon: Heart, label: "Coracao" },
];

const MARKER_COLORS = [
  "#FF4444", "#4488FF", "#00B894", "#FDCB6E", "#6C5CE7", "#FFFFFF",
];

function MarkerPopover({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (data: { type: "flag" | "alert" | "question" | "star" | "skull" | "heart"; color: string; label?: string; gmOnly: boolean }) => void;
}) {
  const [type, setType] = useState<"flag" | "alert" | "question" | "star" | "skull" | "heart">("flag");
  const [color, setColor] = useState("#FF4444");
  const [label, setLabel] = useState("");
  const [gmOnly, setGmOnly] = useState(false);

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold text-brand-text">Marcar Ponto</span>

      <div>
        <span className="mb-1 block text-[10px] text-brand-muted">Tipo</span>
        <div className="flex flex-wrap gap-1">
          {MARKER_TYPES.map(({ value, icon: Icon, label: l }) => (
            <button
              key={value}
              title={l}
              onClick={() => setType(value)}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                type === value
                  ? "bg-brand-accent text-white"
                  : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1 block text-[10px] text-brand-muted">Cor</span>
        <div className="flex gap-1">
          {MARKER_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full transition-shadow ${
                color === c ? "ring-2 ring-white/40" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <input
        placeholder="Label (opcional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="h-7 rounded border border-brand-border bg-brand-primary px-2 text-xs text-brand-text outline-none focus:border-brand-accent"
      />

      <div className="flex gap-1">
        <button
          onClick={() => setGmOnly(false)}
          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
            !gmOnly ? "bg-brand-accent text-white" : "bg-white/[0.04] text-brand-muted hover:bg-white/[0.08]"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setGmOnly(true)}
          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
            gmOnly ? "bg-brand-accent text-white" : "bg-white/[0.04] text-brand-muted hover:bg-white/[0.08]"
          }`}
        >
          So GM
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button onClick={onCancel} className="px-2 py-1 text-[10px] text-brand-muted transition-colors hover:text-brand-text">
          Cancelar
        </button>
        <button
          onClick={() => onSubmit({ type, color, label: label.trim() || undefined, gmOnly })}
          className="rounded-md bg-brand-accent px-3 py-1 text-[10px] font-medium text-white transition-colors hover:bg-brand-accent-hover"
        >
          Marcar
        </button>
      </div>
    </div>
  );
}

// ── Note Popover ──

const NOTE_COLOR_OPTIONS: { value: NoteColor; label: string; hex: string }[] = [
  { value: "yellow", label: "Amarelo", hex: "#FDCB6E" },
  { value: "blue", label: "Azul", hex: "#4488FF" },
  { value: "green", label: "Verde", hex: "#00B894" },
  { value: "pink", label: "Rosa", hex: "#FF6B6B" },
];

function NotePopover({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (data: { text: string; color: NoteColor; gmOnly: boolean }) => void;
}) {
  const [text, setText] = useState("");
  const [color, setColor] = useState<NoteColor>("yellow");
  const [gmOnly, setGmOnly] = useState(false);

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold text-brand-text">Nota no Mapa</span>

      <textarea
        autoFocus
        rows={3}
        maxLength={200}
        placeholder="Escreva uma nota..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="resize-none rounded border border-brand-border bg-brand-primary px-2 py-1.5 text-xs text-brand-text outline-none focus:border-brand-accent"
      />
      <span className="text-right text-[10px] text-brand-muted">{text.length}/200</span>

      <div>
        <span className="mb-1 block text-[10px] text-brand-muted">Cor</span>
        <div className="flex gap-1">
          {NOTE_COLOR_OPTIONS.map(({ value, label, hex }) => (
            <button
              key={value}
              title={label}
              onClick={() => setColor(value)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                color === value
                  ? "ring-2 ring-white/40"
                  : ""
              }`}
              style={{ backgroundColor: hex + "30", color: hex }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => setGmOnly(false)}
          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
            !gmOnly ? "bg-brand-accent text-white" : "bg-white/[0.04] text-brand-muted hover:bg-white/[0.08]"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setGmOnly(true)}
          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
            gmOnly ? "bg-brand-accent text-white" : "bg-white/[0.04] text-brand-muted hover:bg-white/[0.08]"
          }`}
        >
          So GM
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button onClick={onCancel} className="px-2 py-1 text-[10px] text-brand-muted transition-colors hover:text-brand-text">
          Cancelar
        </button>
        <button
          onClick={() => {
            if (!text.trim()) return;
            onSubmit({ text: text.trim(), color, gmOnly });
          }}
          disabled={!text.trim()}
          className="rounded-md bg-brand-accent px-3 py-1 text-[10px] font-medium text-white transition-colors hover:bg-brand-accent-hover disabled:opacity-40"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
