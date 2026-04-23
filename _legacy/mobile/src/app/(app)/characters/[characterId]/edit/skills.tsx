import { useCallback, useMemo } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCharacterStore } from "../../../../../lib/character-store";
import { ABILITY_SHORT_LABELS, ABILITY_ORDER, getModifier } from "../../../../../lib/data/dnd5e/abilities";
import { SKILLS_BY_ABILITY } from "../../../../../lib/data/dnd5e/skills";
import { EditScreenHeader } from "../../../../../components/character/EditScreenHeader";
import { SkillEditRow } from "../../../../../components/character/SkillEditRow";
import type { AbilityKey } from "../../../../../lib/data/dnd5e/types";
import type { SkillProficiency } from "../../../../../lib/character-types";

export default function EditSkillsScreen() {
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

  const handleProficiencyChange = useCallback(
    (skillName: string, newProf: SkillProficiency) => {
      if (!draft) return;
      const abilityMod = (key: AbilityKey) => draft.abilities[key]?.modifier ?? 0;
      const profBonus = draft.proficiencyBonus;

      const skills = draft.skills.map((s) => {
        if (s.name !== skillName) return s;
        let mod = abilityMod(s.ability);
        if (newProf === "proficient") mod += profBonus;
        else if (newProf === "expertise") mod += profBonus * 2;
        return { ...s, proficiency: newProf, modifier: mod };
      });
      updateDraft({ skills });
    },
    [draft, updateDraft],
  );

  // Group skills by ability
  const groupedSkills = useMemo(() => {
    if (!draft) return [];
    return ABILITY_ORDER
      .filter((key) => SKILLS_BY_ABILITY[key]?.length > 0)
      .map((key) => {
        const abilitySkillNames = SKILLS_BY_ABILITY[key].map((s) => s.name);
        const skills = draft.skills.filter((s) => abilitySkillNames.includes(s.name));
        return { ability: key, skills };
      })
      .filter((g) => g.skills.length > 0);
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
        title="Editar Perícias"
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Legend */}
      <XStack paddingHorizontal={24} paddingBottom={8} gap={16}>
        <XStack gap={4} alignItems="center">
          <Stack width={10} height={10} borderRadius={5} borderWidth={2} borderColor="#3A3A45" />
          <Text fontSize={10} color="#5A5A6E">Nenhuma</Text>
        </XStack>
        <XStack gap={4} alignItems="center">
          <Stack width={10} height={10} borderRadius={5} backgroundColor="#6C5CE7" />
          <Text fontSize={10} color="#5A5A6E">Proficiente</Text>
        </XStack>
        <XStack gap={4} alignItems="center">
          <Stack width={10} height={10} borderRadius={5} backgroundColor="#00B894" />
          <Text fontSize={10} color="#5A5A6E">Expertise</Text>
        </XStack>
      </XStack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {groupedSkills.map(({ ability, skills }) => (
          <YStack key={ability} marginBottom={12}>
            {/* Ability group header */}
            <XStack
              paddingHorizontal={24}
              paddingVertical={6}
              backgroundColor="#16161C"
            >
              <Text fontSize={11} fontWeight="700" color="#5A5A6E">
                {ABILITY_SHORT_LABELS[ability]} ({draft.abilities[ability].score})
              </Text>
            </XStack>

            {/* Skills in this group */}
            {skills.map((skill) => (
              <SkillEditRow
                key={skill.name}
                name={skill.name}
                ability={skill.ability}
                proficiency={skill.proficiency}
                modifier={skill.modifier}
                onProficiencyChange={(p) => handleProficiencyChange(skill.name, p)}
              />
            ))}
          </YStack>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
