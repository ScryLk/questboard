// ── Worldbuilding Types ──

export type NPCDisposition = "hostile" | "neutral" | "friendly" | "ally";
export type LocationType = "city" | "town" | "village" | "dungeon" | "wilderness" | "landmark" | "building" | "region";
export type FactionAlignment = "good" | "neutral" | "evil" | "chaotic";

export interface WorldNPC {
  id: string;
  sessionId: string;
  name: string;
  race: string;
  occupation: string;
  description: string;
  personality: string;
  disposition: NPCDisposition;
  locationId: string | null;
  factionId: string | null;
  avatarUrl: string | null;
  statBlockId: string | null;
  isAlive: boolean;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldLocation {
  id: string;
  sessionId: string;
  name: string;
  type: LocationType;
  description: string;
  parentId: string | null;
  mapId: string | null;
  imageUrl: string | null;
  population: number | null;
  government: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Faction {
  id: string;
  sessionId: string;
  name: string;
  description: string;
  alignment: FactionAlignment;
  leaderId: string | null;
  headquartersId: string | null;
  goals: string;
  iconUrl: string | null;
  color: string;
  memberCount: number | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoreEntry {
  id: string;
  sessionId: string;
  title: string;
  content: string;
  category: "history" | "religion" | "magic" | "culture" | "geography" | "politics" | "legend";
  isPlayerVisible: boolean;
  relatedNPCs: string[];
  relatedLocations: string[];
  relatedFactions: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldRelationship {
  id: string;
  fromId: string;
  fromType: "npc" | "faction" | "location";
  toId: string;
  toType: "npc" | "faction" | "location";
  relationship: string;
  description: string;
}
