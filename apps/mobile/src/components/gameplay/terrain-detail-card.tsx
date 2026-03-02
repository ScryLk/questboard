import { memo, useCallback, useEffect, useRef } from "react";
import {
  Check,
  X,
  Lock,
  Search,
  Hand,
  ArrowUp,
  ArrowDown,
  Shield,
  Eye,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useGameplayStore } from "../../lib/gameplay-store";

function SheetHandle() {
  return (
    <Stack alignItems="center" paddingVertical={12}>
      <Stack
        width={36}
        height={4}
        borderRadius={2}
        backgroundColor="#2A2A35"
      />
    </Stack>
  );
}

function TerrainDetailCardInner() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const viewingTerrainTile = useGameplayStore((s) => s.viewingTerrainTile);
  const closeTerrainDetail = useGameplayStore((s) => s.closeTerrainDetail);
  const investigateTerrain = useGameplayStore((s) => s.investigateTerrain);
  const interactTerrain = useGameplayStore((s) => s.interactTerrain);
  const isGM = useGameplayStore((s) => s.isGM);

  const isOpen = viewingTerrainTile !== null;

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) {
        closeTerrainDetail();
      }
    },
    [closeTerrainDetail],
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );

  if (!viewingTerrainTile) return null;

  const { detail } = viewingTerrainTile;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["32%", "58%"]}
      index={-1}
      onChange={handleChange}
      enablePanDownToClose
      enableHandlePanningGesture
      enableContentPanningGesture={false}
      backgroundStyle={{ backgroundColor: "#16161C" }}
      handleComponent={SheetHandle}
      backdropComponent={renderBackdrop}
    >
      {/* Detail Image */}
      <BottomSheetView>
        {detail.detailImageUrl ? (
          <Stack
            height={100}
            marginHorizontal={16}
            borderRadius={12}
            backgroundColor="#1C1C24"
            overflow="hidden"
          >
            {/* Image placeholder - in production would use Image component */}
            <Stack
              flex={1}
              backgroundColor="#1C1C24"
              alignItems="center"
              justifyContent="center"
            >
              <Eye size={24} color="#5A5A6E" />
            </Stack>
          </Stack>
        ) : null}
      </BottomSheetView>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Name & Description */}
        <YStack gap={6} marginTop={detail.detailImageUrl ? 12 : 0}>
          <Text fontSize={16} fontWeight="600" color="#E8E8ED">
            {detail.name}
          </Text>
          <Text
            fontSize={13}
            color="#9090A0"
            lineHeight={18}
            numberOfLines={3}
          >
            {detail.description}
          </Text>
        </YStack>

        {/* Info pills */}
        <XStack gap={6} marginTop={10} flexWrap="wrap">
          <Stack
            borderRadius={8}
            backgroundColor="#1C1C24"
            paddingHorizontal={10}
            paddingVertical={4}
          >
            <Text fontSize={11} color="#9090A0">
              {detail.difficulty}
            </Text>
          </Stack>
          <Stack
            borderRadius={8}
            backgroundColor="#1C1C24"
            paddingHorizontal={10}
            paddingVertical={4}
          >
            <XStack alignItems="center" gap={4}>
              {detail.elevation > 0 ? (
                <ArrowUp size={10} color="#9090A0" />
              ) : detail.elevation < 0 ? (
                <ArrowDown size={10} color="#9090A0" />
              ) : null}
              <Text fontSize={11} color="#9090A0">
                Elevação {detail.elevation}
              </Text>
            </XStack>
          </Stack>
          {detail.effect && (
            <Stack
              borderRadius={8}
              backgroundColor="rgba(233, 69, 96, 0.12)"
              paddingHorizontal={10}
              paddingVertical={4}
            >
              <Text fontSize={11} color="#E94560" fontWeight="500">
                {detail.effect}
              </Text>
            </Stack>
          )}
        </XStack>

        {/* Perception Section */}
        {detail.perception && (
          <YStack marginTop={16} gap={6}>
            <XStack alignItems="center" gap={6}>
              <Eye size={14} color="#9090A0" />
              <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                Percepção (DC {detail.perception.dc})
              </Text>
            </XStack>

            {detail.perception.passed === true ? (
              <XStack gap={6} alignItems="flex-start">
                <Stack marginTop={2}>
                  <Check size={14} color="#00B894" />
                </Stack>
                <Text fontSize={13} color="#00B894" flex={1} lineHeight={18}>
                  {detail.perception.description}
                </Text>
              </XStack>
            ) : detail.perception.passed === false ? (
              <XStack gap={6} alignItems="center">
                <X size={14} color="#E94560" />
                <Text fontSize={13} color="#E94560">
                  Nada de especial.
                </Text>
              </XStack>
            ) : (
              <Text fontSize={12} color="#5A5A6E">
                Percepção passiva em andamento...
              </Text>
            )}
          </YStack>
        )}

        {/* Investigation Section */}
        {detail.investigation && (
          <YStack marginTop={16} gap={6}>
            <XStack alignItems="center" gap={6}>
              <Search size={14} color="#9090A0" />
              <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                Investigação (DC {detail.investigation.dc})
              </Text>
            </XStack>

            {detail.investigation.investigated ? (
              detail.investigation.passed ? (
                <XStack gap={6} alignItems="flex-start">
                  <Stack marginTop={2}>
                    <Check size={14} color="#00B894" />
                  </Stack>
                  <Text fontSize={13} color="#00B894" flex={1} lineHeight={18}>
                    {detail.investigation.description}
                  </Text>
                </XStack>
              ) : (
                <XStack gap={6} alignItems="center">
                  <X size={14} color="#E94560" />
                  <Text fontSize={13} color="#E94560">
                    Você não encontra nada útil.
                  </Text>
                </XStack>
              )
            ) : (
              <>
                <XStack gap={6} alignItems="center">
                  <Lock size={12} color="#5A5A6E" />
                  <Text fontSize={12} color="#5A5A6E">
                    Não investigado
                  </Text>
                </XStack>
                <Stack
                  height={36}
                  borderRadius={10}
                  borderWidth={1}
                  borderColor="rgba(108, 92, 231, 0.3)"
                  backgroundColor="rgba(108, 92, 231, 0.08)"
                  alignItems="center"
                  justifyContent="center"
                  marginTop={4}
                  onPress={investigateTerrain}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <XStack gap={6} alignItems="center">
                    <Search size={14} color="#6C5CE7" />
                    <Text fontSize={13} fontWeight="600" color="#6C5CE7">
                      Investigar
                    </Text>
                  </XStack>
                </Stack>
              </>
            )}
          </YStack>
        )}

        {/* Interaction Section */}
        {detail.isInteractable && (
          <YStack marginTop={16} gap={6}>
            <XStack alignItems="center" gap={6}>
              <Hand size={14} color="#9090A0" />
              <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                Interação
              </Text>
            </XStack>

            {!detail.interacted ? (
              <Stack
                height={40}
                borderRadius={10}
                backgroundColor="#6C5CE7"
                alignItems="center"
                justifyContent="center"
                onPress={interactTerrain}
                pressStyle={{ opacity: 0.85 }}
              >
                <Text fontSize={14} fontWeight="600" color="white">
                  {detail.interactionLabel ?? "Examinar"}
                </Text>
              </Stack>
            ) : (
              <YStack
                borderRadius={10}
                backgroundColor="rgba(108, 92, 231, 0.08)"
                borderWidth={1}
                borderColor="rgba(108, 92, 231, 0.2)"
                padding={12}
              >
                <Text fontSize={13} color="#9090A0" lineHeight={18}>
                  {detail.interactionResult}
                </Text>
              </YStack>
            )}
          </YStack>
        )}

        {/* GM-only: Lore section */}
        {isGM && detail.lore && (
          <YStack marginTop={16} gap={6}>
            <XStack alignItems="center" gap={6}>
              <Shield size={14} color="#FDCB6E" />
              <Text fontSize={13} fontWeight="600" color="#FDCB6E">
                Lore (apenas GM)
              </Text>
            </XStack>
            <Text fontSize={13} color="#9090A0" lineHeight={18}>
              {detail.lore}
            </Text>
          </YStack>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export const TerrainDetailCard = memo(TerrainDetailCardInner);
