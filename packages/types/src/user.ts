export enum Plan {
  FREE = "FREE",
  ADVENTURER = "ADVENTURER",
  LEGENDARY = "LEGENDARY",
}

export interface User {
  id: string;
  externalId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  plan: Plan;
  totalSessions: number;
  totalCharacters: number;
}
