import { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Sparkles, Flame, Snowflake, Zap as ZapIcon, Shield, Wind } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Stack, Text, XStack, YStack } from "tamagui";

interface Spell {
  id: string;
  name: string;
  level: number;
  range: string;
  damage?: string;
  description: string;
  school: string;
}

interface SpellPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCast: (spellId: string) => void;
}

const MOCK_SPELLS: Spell[] = [
  { id: "fire-bolt", name: "Fire Bolt", level: 0, range: "120ft", damage: "2d10 fogo", description: "Projétil de fogo", school: "Evocação" },
  { id: "ray-frost", name: "Ray of Frost", level: 0, range: "60ft", damage: "2d8 gelo", description: "Raio gélido que reduz velocidade", school: "Evocação" },
  { id: "mage-hand", name: "Mage Hand", level: 0, range: "30ft", description: "Mão espectral para manipular objetos", school: "Conjuração" },
  { id: "shield", name: "Shield", level: 1, range: "Pessoal", description: "+5 CA até o próximo turno (Reação)", school: "Abjuração" },
  { id: "magic-missile", name: "Magic Missile", level: 1, range: "120ft", damage: "3×1d4+1 força", description: "3 projéteis que acertam automaticamente", school: "Evocação" },
  { id: "thunderwave", name: "Thunderwave", level: 1, range: "Pessoal (cubo 15ft)", damage: "2d8 trovão", description: "Onda de força que empurra criaturas", school: "Evocação" },
  { id: "misty-step", name: "Misty Step", level: 2, range: "Pessoal", description: "Teleportar 30ft (Ação Bônus)", school: "Conjuração" },
  { id: "scorching-ray", name: "Scorching Ray", level: 2, range: "120ft", damage: "3×2d6 fogo", description: "3 raios de fogo", school: "Evocação" },
  { id: "fireball", name: "Fireball", level: 3, range: "150ft (esfera 20ft)", damage: "8d6 fogo", description: "Explosão de fogo em área", school: "Evocação" },
];

const MOCK_SLOTS = [
  { level: 1, used: 2, total: 4 },
  { level: 2, used: 1, total: 3 },
  { level: 3, used: 0, total: 2 },
];

const LEVEL_TABS = ["Cantrips", "Nv.1", "Nv.2", "Nv.3"];

function getSpellIcon(school: string) {
  switch (school) {
    case "Evocação": return Flame;
    case "Abjuração": return Shield;
    case "Conjuração": return Wind;
    default: return Sparkles;
  }
}

function SpellPickerSheetInner({ isOpen, onClose, onCast }: SpellPickerSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (isOpen) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
    ),
    [],
  );

  const filteredSpells = MOCK_SPELLS.filter((s) => s.level === activeTab);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={["75%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <XStack alignItems="center" gap={8} marginBottom={12}>
          <Sparkles size={18} color="#6C5CE7" />
          <Text fontSize={17} fontWeight="700" color="#E8E8ED">
            CONJURAR MAGIA
          </Text>
        </XStack>

        {/* Spell slots */}
        <XStack gap={8} marginBottom={16}>
          {MOCK_SLOTS.map((slot) => {
            const remaining = slot.total - slot.used;
            return (
              <XStack key={slot.level} alignItems="center" gap={4} backgroundColor="rgba(108, 92, 231, 0.1)" paddingHorizontal={8} paddingVertical={4} borderRadius={6}>
                <Text fontSize={11} color="#9090A0">Nv.{slot.level}:</Text>
                {Array.from({ length: slot.total }).map((_, i) => (
                  <Stack
                    key={i}
                    width={6}
                    height={6}
                    borderRadius={3}
                    backgroundColor={i < remaining ? "#6C5CE7" : "#2A2A35"}
                  />
                ))}
              </XStack>
            );
          })}
        </XStack>

        {/* Level tabs */}
        <XStack gap={4} marginBottom={16}>
          {LEVEL_TABS.map((tab, i) => (
            <Stack
              key={tab}
              flex={1}
              height={32}
              borderRadius={8}
              backgroundColor={activeTab === i ? "rgba(108, 92, 231, 0.2)" : "rgba(255,255,255,0.04)"}
              borderWidth={activeTab === i ? 1 : 0}
              borderColor="rgba(108, 92, 231, 0.3)"
              alignItems="center"
              justifyContent="center"
              onPress={() => setActiveTab(i)}
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={12} fontWeight={activeTab === i ? "700" : "500"} color={activeTab === i ? "#6C5CE7" : "#5A5A6E"}>
                {tab}
              </Text>
            </Stack>
          ))}
        </XStack>

        {/* Spell list */}
        {filteredSpells.map((spell) => {
          const Icon = getSpellIcon(spell.school);
          return (
            <Stack
              key={spell.id}
              borderRadius={12}
              backgroundColor="rgba(255, 255, 255, 0.03)"
              paddingHorizontal={16}
              paddingVertical={12}
              marginBottom={8}
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCast(spell.id);
                onClose();
              }}
            >
              <XStack alignItems="center" gap={12}>
                <Icon size={18} color="#6C5CE7" />
                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="600" color="#E8E8ED">
                    {spell.name}
                  </Text>
                  <Text fontSize={11} color="#5A5A6E">
                    {spell.level === 0 ? "Cantrip" : `Nível ${spell.level}`} · {spell.range}
                    {spell.damage ? ` · ${spell.damage}` : ""}
                  </Text>
                </YStack>
              </XStack>
            </Stack>
          );
        })}

        {filteredSpells.length === 0 && (
          <Text fontSize={13} color="#5A5A6E" textAlign="center" marginTop={24}>
            Nenhuma magia neste nível
          </Text>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export const SpellPickerSheet = memo(SpellPickerSheetInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#16161C",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleIndicator: {
    backgroundColor: "#3A3A4E",
    width: 36,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});
