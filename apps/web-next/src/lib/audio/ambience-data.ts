// ── Bundled Ambience Definitions ──
// These reference audio files that would be placed in public/audio/ambience/
// For now they serve as the metadata catalog; actual files are loaded on demand.

export interface AmbienceTrack {
  id: string;
  name: string;
  file: string;
  tags: string[];
  category: "location" | "situation" | "weather";
  icon: string; // emoji
}

export const BUNDLED_AMBIENCES: AmbienceTrack[] = [
  // Locations
  { id: "amb-dungeon", name: "Dungeon", file: "/audio/ambience/dungeon.mp3", tags: ["dungeon", "cave", "echo"], category: "location", icon: "🏰" },
  { id: "amb-tavern", name: "Taverna", file: "/audio/ambience/tavern.mp3", tags: ["tavern", "indoor", "social"], category: "location", icon: "🍺" },
  { id: "amb-forest", name: "Floresta", file: "/audio/ambience/forest.mp3", tags: ["forest", "outdoor", "nature"], category: "location", icon: "🌲" },
  { id: "amb-cave", name: "Caverna", file: "/audio/ambience/cave.mp3", tags: ["cave", "drip", "echo"], category: "location", icon: "🕳" },
  { id: "amb-city", name: "Cidade", file: "/audio/ambience/city.mp3", tags: ["city", "market", "crowd"], category: "location", icon: "🏘" },
  { id: "amb-ocean", name: "Mar", file: "/audio/ambience/ocean.mp3", tags: ["ocean", "water", "outdoor"], category: "location", icon: "🌊" },
  { id: "amb-swamp", name: "Pântano", file: "/audio/ambience/swamp.mp3", tags: ["swamp", "insects", "wet"], category: "location", icon: "🐸" },
  { id: "amb-crypt", name: "Cripta", file: "/audio/ambience/crypt.mp3", tags: ["crypt", "undead", "eerie"], category: "location", icon: "💀" },

  // Weather
  { id: "amb-rain", name: "Chuva", file: "/audio/ambience/rain.mp3", tags: ["rain", "weather", "outdoor"], category: "weather", icon: "🌧" },
  { id: "amb-storm", name: "Tempestade", file: "/audio/ambience/storm.mp3", tags: ["storm", "thunder", "weather"], category: "weather", icon: "⛈" },
  { id: "amb-wind", name: "Vento", file: "/audio/ambience/wind.mp3", tags: ["wind", "mountain", "outdoor"], category: "weather", icon: "💨" },
  { id: "amb-campfire", name: "Fogueira", file: "/audio/ambience/campfire.mp3", tags: ["fire", "camp", "outdoor"], category: "weather", icon: "🔥" },

  // Situations
  { id: "amb-combat", name: "Combate", file: "/audio/ambience/combat.mp3", tags: ["combat", "battle", "tense"], category: "situation", icon: "⚔" },
  { id: "amb-stealth", name: "Furtividade", file: "/audio/ambience/stealth.mp3", tags: ["stealth", "tense", "quiet"], category: "situation", icon: "🤫" },
  { id: "amb-mystery", name: "Mistério", file: "/audio/ambience/mystery.mp3", tags: ["mystery", "suspense", "eerie"], category: "situation", icon: "🔮" },
  { id: "amb-celebration", name: "Celebração", file: "/audio/ambience/celebration.mp3", tags: ["party", "happy", "crowd"], category: "situation", icon: "🎉" },
];

export const AMBIENCE_CATEGORIES = [
  { id: "location" as const, label: "Locais", icon: "🗺" },
  { id: "weather" as const, label: "Clima", icon: "🌤" },
  { id: "situation" as const, label: "Situações", icon: "🎭" },
];
