// Pool de usuários fake pro invite picker da página de membros.
// Frontend-only. Substituir por /users/search quando backend existir.

export interface MockUser {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export const MOCK_USERS: MockUser[] = [
  { userId: "u_ana", username: "ana", displayName: "Ana Carolina", avatarUrl: null },
  { userId: "u_bia", username: "bia.rpg", displayName: "Beatriz Lima", avatarUrl: null },
  { userId: "u_caio", username: "caioGM", displayName: "Caio Mendes", avatarUrl: null },
  { userId: "u_dani", username: "danielle", displayName: "Danielle Costa", avatarUrl: null },
  { userId: "u_eduardo", username: "edu", displayName: "Eduardo Soares", avatarUrl: null },
  { userId: "u_fer", username: "fernanda", displayName: "Fernanda Oliveira", avatarUrl: null },
  { userId: "u_gabi", username: "gabi.dice", displayName: "Gabriela Rocha", avatarUrl: null },
  { userId: "u_henrique", username: "henrique", displayName: "Henrique Alves", avatarUrl: null },
  { userId: "u_isa", username: "isabela", displayName: "Isabela Martins", avatarUrl: null },
  { userId: "u_julio", username: "julio", displayName: "Júlio Pereira", avatarUrl: null },
];

export function searchMockUsers(query: string, exclude: string[] = []): MockUser[] {
  const q = query.trim().toLowerCase();
  const excludeSet = new Set(exclude);
  return MOCK_USERS.filter((u) => {
    if (excludeSet.has(u.userId)) return false;
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
    );
  }).slice(0, 8);
}

export function findMockUser(userId: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.userId === userId);
}
