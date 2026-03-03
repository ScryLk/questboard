import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCharacterStore } from "../../../../../lib/character-store";
import { ABILITY_SHORT_LABELS } from "../../../../../lib/data/dnd5e/abilities";
import { EditScreenHeader } from "../../../../../components/character/EditScreenHeader";
import { SpellEditCard } from "../../../../../components/character/SpellEditCard";
import { AddSpellForm } from "../../../../../components/character/AddSpellForm";
import type { AbilityKey } from "../../../../../lib/data/dnd5e/types";
import type { CharacterSpell, SpellcastingInfo, SpellSlot } from "../../../../../lib/character-types";

const CASTER_ABILITIES: AbilityKey[] = ["int", "wis", "cha"];

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

export default function EditSpellsScreen() {
  const router = useRouter();
  const draft = useCharacterStore((s) => s.editDraft);
  const updateDraft = useCharacterStore((s) => s.updateDraft);
  const saveDraft = useCharacterStore((s) => s.saveDraft);
  const discardDraft = useCharacterStore((s) => s.discardDraft);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSave = useCallback(() => {
    router.back();
    setTimeout(saveDraft, 100);
  }, [saveDraft, router]);

  const handleCancel = useCallback(() => {
    router.back();
    setTimeout(discardDraft, 100);
  }, [discardDraft, router]);

  // Spellcasting ability change
  const handleAbilityChange = useCallback(
    (ability: AbilityKey) => {
      if (!draft) return;
      const abilityMod = draft.abilities[ability]?.modifier ?? 0;
      const saveDC = 8 + draft.proficiencyBonus + abilityMod;
      const attackBonus = draft.proficiencyBonus + abilityMod;
      const spellcasting: SpellcastingInfo = { ability, saveDC, attackBonus };
      updateDraft({ spellcasting });
    },
    [draft, updateDraft],
  );

  // Spell slot change
  const handleSlotChange = useCallback(
    (level: number, delta: number) => {
      if (!draft) return;
      const slots = draft.spellSlots.map((s) => {
        if (s.level !== level) return s;
        const newTotal = Math.max(0, Math.min(20, s.total + delta));
        return { ...s, total: newTotal, used: Math.min(s.used, newTotal) };
      });
      // Add new level if not present
      if (!slots.find((s) => s.level === level) && delta > 0) {
        slots.push({ level, total: 1, used: 0 });
        slots.sort((a, b) => a.level - b.level);
      }
      updateDraft({ spellSlots: slots });
    },
    [draft, updateDraft],
  );

  // Add spell
  const handleAddSpell = useCallback(
    (spell: CharacterSpell) => {
      if (!draft) return;
      updateDraft({ spells: [...draft.spells, spell] });
      setShowAddForm(false);
    },
    [draft, updateDraft],
  );

  // Remove spell
  const handleRemoveSpell = useCallback(
    (spellId: string) => {
      if (!draft) return;
      Alert.alert("Remover magia?", "Essa ação não pode ser desfeita.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => updateDraft({ spells: draft.spells.filter((s) => s.id !== spellId) }),
        },
      ]);
    },
    [draft, updateDraft],
  );

  // Toggle prepared
  const handleTogglePrepared = useCallback(
    (spellId: string) => {
      if (!draft) return;
      updateDraft({
        spells: draft.spells.map((s) =>
          s.id === spellId ? { ...s, prepared: !s.prepared } : s,
        ),
      });
    },
    [draft, updateDraft],
  );

  // Group spells by level
  const groupedSpells = useMemo(() => {
    if (!draft) return [];
    const groups: Record<number, CharacterSpell[]> = {};
    for (const spell of draft.spells) {
      if (!groups[spell.level]) groups[spell.level] = [];
      groups[spell.level].push(spell);
    }
    return Object.entries(groups)
      .map(([level, spells]) => ({ level: Number(level), spells }))
      .sort((a, b) => a.level - b.level);
  }, [draft]);

  if (!draft) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
        <Text color="#5A5A6E" fontSize={14} padding={20}>
          Nenhum rascunho ativo
        </Text>
      </SafeAreaView>
    );
  }

  const spellcasting = draft.spellcasting;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <EditScreenHeader
        title="Editar Magias"
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Spellcasting ability */}
        <YStack gap={6} marginTop={8} marginBottom={16}>
          <Text fontSize={12} fontWeight="700" color="#5A5A6E">
            HABILIDADE DE CONJURAÇÃO
          </Text>
          <XStack gap={8}>
            {CASTER_ABILITIES.map((key) => {
              const isActive = spellcasting?.ability === key;
              return (
                <Stack
                  key={key}
                  flex={1}
                  paddingVertical={10}
                  borderRadius={10}
                  backgroundColor={isActive ? "#6C5CE7" : "#1C1C24"}
                  borderWidth={1}
                  borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
                  alignItems="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => handleAbilityChange(key)}
                >
                  <Text
                    fontSize={14}
                    fontWeight="700"
                    color={isActive ? "#FFFFFF" : "#9090A0"}
                  >
                    {ABILITY_SHORT_LABELS[key]}
                  </Text>
                </Stack>
              );
            })}
          </XStack>
          {spellcasting && (
            <XStack gap={16} marginTop={4}>
              <Text fontSize={11} color="#5A5A6E">
                CD: {spellcasting.saveDC}
              </Text>
              <Text fontSize={11} color="#5A5A6E">
                Ataque: +{spellcasting.attackBonus}
              </Text>
            </XStack>
          )}
        </YStack>

        {/* Spell slots */}
        <YStack gap={6} marginBottom={16}>
          <Text fontSize={12} fontWeight="700" color="#5A5A6E">
            ESPAÇOS DE MAGIA
          </Text>
          <YStack gap={6}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
              const slot = draft.spellSlots.find((s) => s.level === level);
              const total = slot?.total ?? 0;
              if (total === 0 && level > 5) return null; // Only show up to 5 by default
              return (
                <XStack
                  key={level}
                  alignItems="center"
                  gap={8}
                  backgroundColor="#1C1C24"
                  borderRadius={8}
                  paddingHorizontal={10}
                  paddingVertical={6}
                >
                  <Text fontSize={12} color="#9090A0" width={50}>
                    Nível {level}
                  </Text>
                  <Stack
                    width={26}
                    height={26}
                    borderRadius={6}
                    backgroundColor="#16161C"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => handleSlotChange(level, -1)}
                  >
                    <Minus size={12} color={total > 0 ? "#9090A0" : "#3A3A45"} />
                  </Stack>
                  <Text fontSize={14} fontWeight="700" color="#E8E8ED" minWidth={24} textAlign="center">
                    {total}
                  </Text>
                  <Stack
                    width={26}
                    height={26}
                    borderRadius={6}
                    backgroundColor="#16161C"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => handleSlotChange(level, 1)}
                  >
                    <Plus size={12} color="#9090A0" />
                  </Stack>
                </XStack>
              );
            })}
          </YStack>
        </YStack>

        {/* Spells by level */}
        {groupedSpells.map(({ level, spells }) => (
          <YStack key={level} gap={6} marginBottom={16}>
            <Text fontSize={12} fontWeight="700" color="#5A5A6E">
              {SPELL_LEVEL_LABELS[level] ?? `Nível ${level}`} ({spells.length})
            </Text>
            <YStack gap={6}>
              {spells.map((spell) => (
                <SpellEditCard
                  key={spell.id}
                  spell={spell}
                  onRemove={() => handleRemoveSpell(spell.id)}
                  onTogglePrepared={() => handleTogglePrepared(spell.id)}
                />
              ))}
            </YStack>
          </YStack>
        ))}

        {/* Add spell toggle / form */}
        {showAddForm ? (
          <YStack gap={8}>
            <AddSpellForm onAdd={handleAddSpell} />
            <Stack
              alignSelf="flex-start"
              paddingHorizontal={12}
              paddingVertical={6}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setShowAddForm(false)}
            >
              <Text fontSize={12} color="#5A5A6E">
                Cancelar
              </Text>
            </Stack>
          </YStack>
        ) : (
          <Stack
            paddingVertical={12}
            borderRadius={10}
            borderWidth={1}
            borderColor="#2A2A35"
            borderStyle="dashed"
            alignItems="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setShowAddForm(true)}
          >
            <XStack gap={6} alignItems="center">
              <Plus size={16} color="#6C5CE7" />
              <Text fontSize={13} color="#6C5CE7" fontWeight="600">
                Adicionar Magia
              </Text>
            </XStack>
          </Stack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
