import { memo, useMemo } from "react";
import { Wand2 } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { ABILITY_SHORT_LABELS } from "../../lib/data/dnd5e/abilities";
import type { CharacterSpell, SpellcastingInfo, SpellSlot } from "../../lib/character-types";

interface SpellsSummaryProps {
  spellcasting: SpellcastingInfo;
  spellSlots: SpellSlot[];
  spells: CharacterSpell[];
}

const SPELL_LEVEL_LABELS: Record<number, string> = {
  0: "Truques",
  1: "Nível 1",
  2: "Nível 2",
  3: "Nível 3",
  4: "Nível 4",
  5: "Nível 5",
  6: "Nível 6",
  7: "Nível 7",
  8: "Nível 8",
  9: "Nível 9",
};

function SpellsSummaryInner({ spellcasting, spellSlots, spells }: SpellsSummaryProps) {
  const groupedSpells = useMemo(() => {
    const groups: Record<number, CharacterSpell[]> = {};
    for (const spell of spells) {
      if (!groups[spell.level]) groups[spell.level] = [];
      groups[spell.level].push(spell);
    }
    return groups;
  }, [spells]);

  const levels = Object.keys(groupedSpells)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <YStack gap={10} paddingHorizontal={20}>
      {/* Spellcasting info */}
      <XStack
        backgroundColor="#1C1C24"
        borderRadius={10}
        borderWidth={1}
        borderColor="#2A2A35"
        paddingHorizontal={12}
        paddingVertical={8}
        gap={12}
        alignItems="center"
      >
        <Wand2 size={14} color="#6C5CE7" />
        <Text fontSize={12} color="#9090A0">
          {ABILITY_SHORT_LABELS[spellcasting.ability]}
        </Text>
        <Text fontSize={12} color="#5A5A6E">|</Text>
        <Text fontSize={12} color="#9090A0">
          CD {spellcasting.saveDC}
        </Text>
        <Text fontSize={12} color="#5A5A6E">|</Text>
        <Text fontSize={12} color="#9090A0">
          Ataque +{spellcasting.attackBonus}
        </Text>
      </XStack>

      {/* Spell slots */}
      {spellSlots.length > 0 && (
        <XStack gap={10} flexWrap="wrap">
          {spellSlots.map((slot) => (
            <XStack key={slot.level} gap={4} alignItems="center">
              <Text fontSize={10} color="#5A5A6E">
                Nv.{slot.level}:
              </Text>
              <XStack gap={2}>
                {Array.from({ length: slot.total }, (_, i) => (
                  <Stack
                    key={i}
                    width={8}
                    height={8}
                    borderRadius={4}
                    backgroundColor={i < slot.total - slot.used ? "#6C5CE7" : "#2A2A35"}
                  />
                ))}
              </XStack>
            </XStack>
          ))}
        </XStack>
      )}

      {/* Spell lists by level */}
      {levels.map((level) => {
        const slotInfo = spellSlots.find((s) => s.level === level);
        const slotLabel = slotInfo
          ? ` (${slotInfo.total - slotInfo.used}/${slotInfo.total} slots)`
          : "";
        const spellList = groupedSpells[level];
        return (
          <YStack key={level} gap={4}>
            <Text fontSize={11} fontWeight="600" color="#5A5A6E">
              {SPELL_LEVEL_LABELS[level] ?? `Nível ${level}`}
              {level > 0 ? slotLabel : ` (${spellList.length})`}:
            </Text>
            <Text fontSize={12} color="#9090A0" lineHeight={18}>
              {spellList.map((s) => s.name).join(" \u00B7 ")}
            </Text>
          </YStack>
        );
      })}
    </YStack>
  );
}

export const SpellsSummary = memo(SpellsSummaryInner);
