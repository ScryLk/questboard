import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Badge, Avatar, ProgressBar } from "@questboard/ui";
import { SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

// Mock data
const MOCK_CHARACTERS = [
  {
    id: "1",
    name: "Thorin Escudo de Ferro",
    system: "dnd5e" as SupportedSystem,
    class: "Guerreiro Nv.8",
    avatarUrl: null,
    hp: { current: 72, max: 95 },
    lastPlayed: "2026-02-22T20:00:00",
  },
  {
    id: "2",
    name: "Aelar Ventolivre",
    system: "dnd5e" as SupportedSystem,
    class: "Ranger Nv.5",
    avatarUrl: null,
    hp: { current: 38, max: 42 },
    lastPlayed: "2026-02-20T19:00:00",
  },
  {
    id: "3",
    name: "Dante Cavaleiro da Tormenta",
    system: "tormenta20" as SupportedSystem,
    class: "Cavaleiro Nv.6",
    avatarUrl: null,
    hp: { current: 55, max: 55 },
    lastPlayed: "2026-02-18T21:00:00",
  },
];

function CharacterCard({ character }: { character: (typeof MOCK_CHARACTERS)[number] }) {
  const hpPercent = Math.round((character.hp.current / character.hp.max) * 100);

  return (
    <Card interactive>
      <div className="flex items-start gap-4">
        <Avatar
          size="lg"
          src={character.avatarUrl ?? undefined}
          fallback={character.name[0]}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary truncate">
            {character.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {character.class} • {SYSTEM_LABELS[character.system]}
          </p>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">HP</span>
              <span className="text-text-primary font-medium">
                {character.hp.current}/{character.hp.max}
              </span>
            </div>
            <ProgressBar value={character.hp.current} max={character.hp.max} />
          </div>

          <p className="text-xs text-text-muted mt-2">
            Jogado em{" "}
            {new Date(character.lastPlayed).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function CharactersPage() {
  const [filter, setFilter] = useState<"all" | SupportedSystem>("all");

  const filtered =
    filter === "all"
      ? MOCK_CHARACTERS
      : MOCK_CHARACTERS.filter((c) => c.system === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Personagens
          </h1>
          <p className="text-text-secondary mt-1">
            {MOCK_CHARACTERS.length} personagens criados
          </p>
        </div>
        <Link to="/characters/create">
          <Button variant="primary" size="sm">
            + Novo Personagem
          </Button>
        </Link>
      </div>

      {/* System filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-fast ${
            filter === "all"
              ? "bg-accent text-text-inverse"
              : "bg-elevated text-text-secondary hover:bg-hover"
          }`}
        >
          Todos
        </button>
        {(Object.entries(SYSTEM_LABELS) as [SupportedSystem, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-fast ${
                filter === key
                  ? "bg-accent text-text-inverse"
                  : "bg-elevated text-text-secondary hover:bg-hover"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Character list */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((character) => (
          <Link key={character.id} to={`/characters/${character.id}`}>
            <CharacterCard character={character} />
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg mb-4">Nenhum personagem encontrado</p>
          <Link to="/characters/create">
            <Button variant="primary">Criar Personagem</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
