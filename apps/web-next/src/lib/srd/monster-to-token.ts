// ── Helper: SrdMonster → GameToken ──
//
// Converte um monstro do compêndio em um token pra gameplay-store. O
// objetivo é que GM clique "Adicionar à sessão" no compêndio e o
// monstro apareça no mapa com stats já preenchidos. Spawn é no centro
// do viewport atual; GM arrasta depois pra posição ideal.

import { useGameplayStore } from "@/lib/gameplay-store";
import type { SrdMonster } from "@/types/srd";

const SIZE_TO_CELLS: Record<SrdMonster["size"], number> = {
  tiny: 1,
  small: 1,
  medium: 1,
  large: 2,
  huge: 3,
  gargantuan: 4,
};

/** Adiciona o monstro como token no mapa. Retorna o id do token novo
 *  e dispara um toast com Desfazer. Default position: centro do
 *  viewport visível (ou (1, 1) se viewport não está pronto). */
export function addMonsterToSession(monster: SrdMonster): string {
  const store = useGameplayStore.getState();
  const center = store.getViewportCenter?.() ?? { x: 1, y: 1 };

  const tokenId = `token_${monster.slug}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 5)}`;

  store.addToken({
    id: tokenId,
    name: monster.name,
    x: Math.max(0, center.x),
    y: Math.max(0, center.y),
    alignment: "hostile",
    hp: monster.hitPoints,
    maxHp: monster.hitPoints,
    ac: monster.armorClass,
    size: SIZE_TO_CELLS[monster.size],
    // Conversão metros → ft (5e usa ft como unidade base no engine).
    // 1 célula = 5ft = 1.5m.
    speed: Math.round((monster.speed.walk / 1.5) * 5),
  });

  store.addToast(
    `${monster.name} adicionado à cena em (${center.x}, ${center.y}).`,
    {
      label: "Remover",
      onClick: () => {
        const tokens = useGameplayStore.getState().tokens;
        const exists = tokens.find((t) => t.id === tokenId);
        if (exists) {
          useGameplayStore.setState({
            tokens: tokens.filter((t) => t.id !== tokenId),
          });
        }
      },
    },
  );

  return tokenId;
}
