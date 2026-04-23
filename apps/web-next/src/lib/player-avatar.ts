// Avatar determinístico pra qualquer userId — gradient + iniciais.
// Mesmo id sempre gera o mesmo gradient (não muda entre reloads).

const GRADIENTS: [string, string][] = [
  ["#7C5CFC", "#2DD4BF"], // roxo → teal (identidade QB)
  ["#F59E0B", "#EF4444"], // âmbar → vermelho
  ["#10B981", "#3B82F6"], // verde → azul
  ["#C9A84C", "#7C5CFC"], // dourado → roxo
  ["#EC4899", "#8B5CF6"], // pink → violeta
  ["#06B6D4", "#10B981"], // ciano → verde
  ["#F97316", "#EAB308"], // laranja → amarelo
  ["#6366F1", "#EC4899"], // indigo → pink
];

function simpleHash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

export function getAvatarGradient(userId: string): [string, string] {
  return GRADIENTS[simpleHash(userId) % GRADIENTS.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
