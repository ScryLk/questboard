// Pool de usuários fake pro invite picker da página de membros.
// Frontend-only. Substituir por /users/search quando backend existir.

export interface MockUser {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export const MOCK_USERS: MockUser[] = [];

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
