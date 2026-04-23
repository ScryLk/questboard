import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Camera,
  Heart,
  Moon,
  Shield,
  Sword,
  TrendingUp,
  Wand2,
  Crosshair,
  Zap,
  Footprints,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCharacterStore } from "../../../../lib/character-store";
import { formatModifier } from "../../../../lib/data/dnd5e/abilities";
import { SheetSection } from "../../../../components/character/SheetSection";
import { SpellsSummary } from "../../../../components/character/SpellsSummary";
import { InventorySummary } from "../../../../components/character/InventorySummary";
import { AttributeGrid } from "../../../../components/gameplay/attribute-grid";
import { SkillsList } from "../../../../components/gameplay/skills-list";
import { FeaturesList } from "../../../../components/gameplay/features-list";
import type { FullCharacter } from "../../../../lib/character-types";

const AVATAR_ICON_MAP: Record<string, typeof Wand2> = {
  wand: Wand2,
  sword: Sword,
  crosshair: Crosshair,
};

function getHpColor(ratio: number): string {
  if (ratio > 0.5) return "#00B894";
  if (ratio > 0.25) return "#FDCB6E";
  return "#FF6B6B";
}

export default function CharacterSheetScreen() {
  const { characterId } = useLocalSearchParams<{ characterId: string }>();
  const router = useRouter();
  const characters = useCharacterStore((s) => s.characters);
  const loadCharacters = useCharacterStore((s) => s.loadCharacters);
  const shortRest = useCharacterStore((s) => s.shortRest);
  const longRest = useCharacterStore((s) => s.longRest);
  const startEdit = useCharacterStore((s) => s.startEdit);

  // Load characters on mount if needed
  useEffect(() => {
    if (Object.keys(characters).length === 0) {
      loadCharacters();
    }
  }, [characters, loadCharacters]);

  const character = characters[characterId ?? ""];

  const [backstoryExpanded, setBackstoryExpanded] = useState(false);

  // Map CharacterSkill[] → CharacterSheetSkill[] for the existing SkillsList component
  const sheetSkills = useMemo(() => {
    if (!character) return [];
    return character.skills.map((s) => ({
      name: s.name,
      modifier: s.modifier,
      proficient: s.proficiency !== "none",
    }));
  }, [character]);

  // Map CharacterFeature[] → CharacterSheetFeature[] for the existing FeaturesList component
  const sheetFeatures = useMemo(() => {
    if (!character) return [];
    return character.features.map((f) => ({
      name: f.name,
      description: f.description,
      uses: f.uses ? { current: f.uses.current, max: f.uses.max } : null,
    }));
  }, [character]);

  // Saving throws summary
  const savingThrows = useMemo(() => {
    if (!character) return "";
    const LABELS: Record<string, string> = {
      str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
    };
    return Object.entries(character.abilities)
      .filter(([, a]) => a.saveProficiency)
      .map(([key, a]) => `${LABELS[key]} ${formatModifier(a.modifier + character.proficiencyBonus)}`)
      .join(", ");
  }, [character]);

  const handleEdit = useCallback(
    (section: string) => {
      if (!characterId) return;
      startEdit(characterId);
      router.push(`/(app)/characters/${characterId}/edit/${section}`);
    },
    [characterId, startEdit, router],
  );

  const handleShortRest = useCallback(() => {
    if (!characterId) return;
    Alert.alert(
      "Descanso Curto",
      `${character?.name} faz um descanso curto. Features de descanso curto serão restauradas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => shortRest(characterId),
        },
      ],
    );
  }, [characterId, character, shortRest]);

  const handleLongRest = useCallback(() => {
    if (!characterId) return;
    Alert.alert(
      "Descanso Longo",
      `${character?.name} faz um descanso longo. HP, spell slots e todas as features serão restaurados.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => longRest(characterId),
        },
      ],
    );
  }, [characterId, character, longRest]);

  const handleLevelUp = useCallback(() => {
    Alert.alert("Subir de Nível", "Wizard de level up em breve!");
  }, []);

  if (!character) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text color="#5A5A6E" fontSize={14}>
            Personagem não encontrado
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  const hpRatio = character.hp.max > 0 ? character.hp.current / character.hp.max : 0;
  const hpColor = getHpColor(hpRatio);
  const AvatarIcon = AVATAR_ICON_MAP[character.avatarIcon] ?? Sword;
  const xpNext = getXpForLevel(character.level + 1);
  const xpPercent = xpNext > 0 ? Math.min(100, (character.xp / xpNext) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <XStack paddingHorizontal={16} paddingVertical={10} alignItems="center" gap={12}>
        <Stack
          width={36}
          height={36}
          borderRadius={10}
          backgroundColor="#1C1C24"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#9090A0" />
        </Stack>
        <YStack flex={1}>
          <Text fontSize={16} fontWeight="700" color="#E8E8ED" numberOfLines={1}>
            {character.name}
          </Text>
          <Text fontSize={12} color="#5A5A6E">
            {character.raceName} {character.className} {"\u00B7"} Nível {character.level}
          </Text>
        </YStack>
      </XStack>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Portrait + Summary */}
        <SheetSection title="Resumo" onEdit={() => handleEdit("basics")}>
          <XStack paddingHorizontal={20} gap={16}>
            {/* Portrait */}
            <Stack
              width={100}
              height={120}
              borderRadius={14}
              borderWidth={2}
              borderColor="#2A2A35"
              backgroundColor="#1C1C24"
              alignItems="center"
              justifyContent="center"
            >
              {character.avatarUrl ? null : (
                <>
                  <AvatarIcon size={36} color="#6C5CE7" strokeWidth={1.5} />
                  <Camera size={12} color="#5A5A6E" style={{ marginTop: 6 }} />
                </>
              )}
            </Stack>

            {/* Stats */}
            <YStack flex={1} gap={6}>
              {/* HP */}
              <XStack alignItems="center" gap={6}>
                <Heart size={12} color={hpColor} fill={hpColor} />
                <Text fontSize={13} fontWeight="700" color="#E8E8ED">
                  {character.hp.current}/{character.hp.max}
                </Text>
                {character.hp.temp > 0 && (
                  <Text fontSize={11} color="#6C5CE7">
                    +{character.hp.temp} temp
                  </Text>
                )}
              </XStack>
              <Stack height={4} borderRadius={2} backgroundColor="#1A1A24" overflow="hidden">
                <Stack
                  width={`${Math.round(hpRatio * 100)}%`}
                  height={4}
                  borderRadius={2}
                  backgroundColor={hpColor}
                />
              </Stack>

              {/* Quick stats */}
              <XStack gap={12} marginTop={4} flexWrap="wrap">
                <XStack gap={3} alignItems="center">
                  <Shield size={11} color="#5A5A6E" />
                  <Text fontSize={12} color="#9090A0">
                    CA {character.ac}
                  </Text>
                </XStack>
                <XStack gap={3} alignItems="center">
                  <Zap size={11} color="#5A5A6E" />
                  <Text fontSize={12} color="#9090A0">
                    Init {formatModifier(character.initiative)}
                  </Text>
                </XStack>
                <XStack gap={3} alignItems="center">
                  <Footprints size={11} color="#5A5A6E" />
                  <Text fontSize={12} color="#9090A0">
                    {character.speed} pés
                  </Text>
                </XStack>
              </XStack>

              {/* XP bar */}
              {character.xp > 0 && (
                <YStack gap={2} marginTop={4}>
                  <Text fontSize={10} color="#5A5A6E">
                    XP: {character.xp.toLocaleString()} / {xpNext.toLocaleString()}
                  </Text>
                  <Stack height={3} borderRadius={1.5} backgroundColor="#1A1A24" overflow="hidden">
                    <Stack
                      width={`${xpPercent}%`}
                      height={3}
                      borderRadius={1.5}
                      backgroundColor="#6C5CE7"
                    />
                  </Stack>
                </YStack>
              )}
            </YStack>
          </XStack>
        </SheetSection>

        {/* Separator */}
        <Stack height={1} backgroundColor="#1E1E2A" marginHorizontal={20} marginBottom={16} />

        {/* Attributes */}
        <SheetSection title="Atributos" onEdit={() => handleEdit("attributes")}>
          <AttributeGrid abilities={character.abilities} />
          {savingThrows && (
            <Text fontSize={11} color="#5A5A6E" paddingHorizontal={20} marginTop={8}>
              Salvaguardas: {savingThrows}
            </Text>
          )}
        </SheetSection>

        {/* Skills */}
        <SheetSection title="Perícias" onEdit={() => handleEdit("skills")}>
          <SkillsList skills={sheetSkills} />
        </SheetSection>

        {/* Spells (only if caster) */}
        {character.spellcasting && (
          <SheetSection title="Magias" onEdit={() => handleEdit("spells")}>
            <SpellsSummary
              spellcasting={character.spellcasting}
              spellSlots={character.spellSlots}
              spells={character.spells}
            />
          </SheetSection>
        )}

        {/* Inventory */}
        <SheetSection title="Inventário" onEdit={() => handleEdit("inventory")}>
          <InventorySummary
            coins={character.coins}
            inventory={character.inventory}
            carryCapacity={character.carryCapacity}
          />
        </SheetSection>

        {/* Features */}
        <SheetSection title="Habilidades" onEdit={() => handleEdit("features")}>
          <FeaturesList features={sheetFeatures} />
        </SheetSection>

        {/* Backstory */}
        <SheetSection title="História" onEdit={() => handleEdit("backstory")}>
          <YStack gap={8} paddingHorizontal={20}>
            {/* Background badge */}
            <Stack
              alignSelf="flex-start"
              borderRadius={6}
              backgroundColor="rgba(108,92,231,0.1)"
              paddingHorizontal={8}
              paddingVertical={3}
            >
              <Text fontSize={11} color="#6C5CE7">
                {character.backstory.backgroundName}
              </Text>
            </Stack>

            {/* Personality fields */}
            {character.backstory.personalityTraits.length > 0 && (
              <YStack gap={2}>
                <Text fontSize={11} fontWeight="600" color="#5A5A6E">
                  Traço
                </Text>
                <Text fontSize={12} color="#9090A0" fontStyle="italic">
                  "{character.backstory.personalityTraits[0]}"
                </Text>
              </YStack>
            )}
            {character.backstory.ideal && (
              <YStack gap={2}>
                <Text fontSize={11} fontWeight="600" color="#5A5A6E">
                  Ideal
                </Text>
                <Text fontSize={12} color="#9090A0" fontStyle="italic">
                  "{character.backstory.ideal}"
                </Text>
              </YStack>
            )}
            {character.backstory.bond && (
              <YStack gap={2}>
                <Text fontSize={11} fontWeight="600" color="#5A5A6E">
                  Vínculo
                </Text>
                <Text fontSize={12} color="#9090A0" fontStyle="italic">
                  "{character.backstory.bond}"
                </Text>
              </YStack>
            )}
            {character.backstory.flaw && (
              <YStack gap={2}>
                <Text fontSize={11} fontWeight="600" color="#5A5A6E">
                  Fraqueza
                </Text>
                <Text fontSize={12} color="#9090A0" fontStyle="italic">
                  "{character.backstory.flaw}"
                </Text>
              </YStack>
            )}

            {/* Backstory text */}
            {character.backstory.backstory && (
              <YStack gap={2}>
                <Text fontSize={11} fontWeight="600" color="#5A5A6E">
                  Backstory
                </Text>
                <Text
                  fontSize={12}
                  color="#9090A0"
                  lineHeight={18}
                  numberOfLines={backstoryExpanded ? undefined : 3}
                >
                  {character.backstory.backstory}
                </Text>
                {character.backstory.backstory.length > 150 && (
                  <Text
                    fontSize={11}
                    color="#6C5CE7"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => setBackstoryExpanded((v) => !v)}
                  >
                    {backstoryExpanded ? "ver menos" : "ver mais"}
                  </Text>
                )}
              </YStack>
            )}
          </YStack>
        </SheetSection>

        {/* Notes */}
        {character.notes && (
          <SheetSection title="Notas" onEdit={() => handleEdit("backstory")}>
            <Text fontSize={12} color="#9090A0" lineHeight={18} paddingHorizontal={20}>
              {character.notes}
            </Text>
          </SheetSection>
        )}

        {/* Spacer for footer */}
        <Stack height={80} />
      </ScrollView>

      {/* Quick Actions Footer */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal={16}
        paddingVertical={12}
        paddingBottom={36}
        backgroundColor="rgba(15,15,18,0.95)"
        borderTopWidth={1}
        borderTopColor="#1E1E2A"
      >
        <XStack gap={8}>
          <Stack
            flex={1}
            height={44}
            borderRadius={12}
            backgroundColor="rgba(108,92,231,0.12)"
            borderWidth={1}
            borderColor="rgba(108,92,231,0.3)"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7, scale: 0.97 }}
            onPress={handleShortRest}
          >
            <XStack alignItems="center" gap={5}>
              <Moon size={14} color="#A29BFE" />
              <Text fontSize={12} fontWeight="600" color="#A29BFE">
                Curto
              </Text>
            </XStack>
          </Stack>
          <Stack
            flex={1}
            height={44}
            borderRadius={12}
            backgroundColor="rgba(108,92,231,0.12)"
            borderWidth={1}
            borderColor="rgba(108,92,231,0.3)"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7, scale: 0.97 }}
            onPress={handleLongRest}
          >
            <XStack alignItems="center" gap={5}>
              <Moon size={14} color="#A29BFE" />
              <Text fontSize={12} fontWeight="600" color="#A29BFE">
                Longo
              </Text>
            </XStack>
          </Stack>
          <Stack
            flex={1}
            height={44}
            borderRadius={12}
            backgroundColor="rgba(0,184,148,0.12)"
            borderWidth={1}
            borderColor="rgba(0,184,148,0.3)"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7, scale: 0.97 }}
            onPress={handleLevelUp}
          >
            <XStack alignItems="center" gap={5}>
              <TrendingUp size={14} color="#00B894" />
              <Text fontSize={12} fontWeight="600" color="#00B894">
                Nível
              </Text>
            </XStack>
          </Stack>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}

// ─── XP Thresholds (D&D 5e) ─────────────────────────────

const XP_THRESHOLDS: Record<number, number> = {
  2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000, 7: 23000,
  8: 34000, 9: 48000, 10: 64000, 11: 85000, 12: 100000,
  13: 120000, 14: 140000, 15: 165000, 16: 195000, 17: 225000,
  18: 265000, 19: 305000, 20: 355000, 21: 999999,
};

function getXpForLevel(level: number): number {
  return XP_THRESHOLDS[level] ?? 999999;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F12",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
});
