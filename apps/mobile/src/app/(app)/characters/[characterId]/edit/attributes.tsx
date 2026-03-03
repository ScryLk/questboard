import { useCallback, useMemo } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { useCharacterStore } from "../../../../../lib/character-store";
import {
  ABILITY_ORDER,
  formatModifier,
  getModifier,
  computeHP,
  computeBaseAC,
  computeInitiative,
} from "../../../../../lib/data/dnd5e/abilities";
import { EditScreenHeader } from "../../../../../components/character/EditScreenHeader";
import { AbilityScoreEditor } from "../../../../../components/character/AbilityScoreEditor";
import type { AbilityKey } from "../../../../../lib/data/dnd5e/types";
import type { CharacterAbility } from "../../../../../lib/character-types";

export default function EditAttributesScreen() {
  const router = useRouter();
  const draft = useCharacterStore((s) => s.editDraft);
  const updateDraft = useCharacterStore((s) => s.updateDraft);
  const saveDraft = useCharacterStore((s) => s.saveDraft);
  const discardDraft = useCharacterStore((s) => s.discardDraft);

  const handleSave = useCallback(() => {
    router.back();
    setTimeout(saveDraft, 100);
  }, [saveDraft, router]);

  const handleCancel = useCallback(() => {
    router.back();
    setTimeout(discardDraft, 100);
  }, [discardDraft, router]);

  const handleScoreChange = useCallback(
    (key: AbilityKey, value: number) => {
      if (!draft) return;
      const abilities = { ...draft.abilities };
      abilities[key] = { ...abilities[key], score: value, modifier: getModifier(value) };
      updateDraft({ abilities });
    },
    [draft, updateDraft],
  );

  const handleSaveToggle = useCallback(
    (key: AbilityKey, value: boolean) => {
      if (!draft) return;
      const abilities = { ...draft.abilities };
      abilities[key] = { ...abilities[key], saveProficiency: value };
      updateDraft({ abilities });
    },
    [draft, updateDraft],
  );

  // Derived stats preview
  const derivedStats = useMemo(() => {
    if (!draft) return null;
    const conScore = draft.abilities.con.score;
    const dexScore = draft.abilities.dex.score;
    return {
      hp: computeHP(draft.hitDice.die, conScore, draft.level),
      ac: computeBaseAC(dexScore),
      initiative: computeInitiative(dexScore),
      profBonus: draft.proficiencyBonus,
    };
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <EditScreenHeader
        title="Editar Atributos"
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ability score editors */}
        <YStack gap={8} marginTop={8}>
          {ABILITY_ORDER.map((key) => {
            const ability: CharacterAbility = draft.abilities[key];
            return (
              <AbilityScoreEditor
                key={key}
                ability={key}
                score={ability.score}
                saveProficiency={ability.saveProficiency}
                onScoreChange={(v) => handleScoreChange(key, v)}
                onSaveToggle={(v) => handleSaveToggle(key, v)}
              />
            );
          })}
        </YStack>

        {/* Legend */}
        <XStack gap={16} marginTop={12} paddingHorizontal={4}>
          <XStack gap={4} alignItems="center">
            <Text fontSize={9} fontWeight="700" color="#6C5CE7">
              SLV
            </Text>
            <Text fontSize={10} color="#5A5A6E">
              = Salvaguarda proficiente
            </Text>
          </XStack>
        </XStack>

        {/* Derived stats */}
        {derivedStats && (
          <YStack
            marginTop={20}
            backgroundColor="#1C1C24"
            borderRadius={10}
            borderWidth={1}
            borderColor="#2A2A35"
            padding={14}
            gap={8}
          >
            <Text fontSize={12} fontWeight="700" color="#5A5A6E" marginBottom={2}>
              STATS DERIVADOS
            </Text>
            <XStack gap={16} flexWrap="wrap">
              <DerivedStat label="HP Base" value={String(derivedStats.hp)} />
              <DerivedStat label="CA Base" value={String(derivedStats.ac)} />
              <DerivedStat label="Iniciativa" value={formatModifier(derivedStats.initiative)} />
              <DerivedStat label="Prof." value={`+${derivedStats.profBonus}`} />
            </XStack>
          </YStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DerivedStat({ label, value }: { label: string; value: string }) {
  return (
    <YStack alignItems="center" gap={2}>
      <Text fontSize={16} fontWeight="700" color="#E8E8ED">
        {value}
      </Text>
      <Text fontSize={10} color="#5A5A6E">
        {label}
      </Text>
    </YStack>
  );
}
