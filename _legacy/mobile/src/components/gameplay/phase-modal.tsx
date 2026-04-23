import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps, BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import { X, ArrowRight, Clock } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { usePhaseStore } from "../../stores/phaseStore";
import {
  PHASE_META,
  ALL_PHASE_TYPES,
} from "../../constants/phaseTransitions";
import type { PhaseType, SessionPhase } from "../../types/phase";

// ── Handle ──

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ── Mini Confirm ──

function MiniConfirm({
  targetType,
  onConfirm,
  onCancel,
}: {
  targetType: PhaseType;
  onConfirm: (label: string) => void;
  onCancel: () => void;
}) {
  const meta = PHASE_META[targetType];
  const [label, setLabel] = useState(meta.label);

  return (
    <YStack
      borderWidth={1}
      borderColor="rgba(255,255,255,0.1)"
      backgroundColor="rgba(255,255,255,0.03)"
      borderRadius={12}
      padding={12}
      gap={10}
    >
      <XStack alignItems="center" gap={6}>
        <ArrowRight size={14} color="#5A5A6E" />
        <Text fontSize={13} fontWeight="600" color="#E8E8ED">
          Transicionar para{" "}
          <Text color={meta.color}>{meta.label}</Text>?
        </Text>
      </XStack>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Nome da fase"
        placeholderTextColor="#3A3A4E"
        style={styles.labelInput}
      />
      <XStack gap={8}>
        <Stack
          flex={1}
          backgroundColor="#6C5CE7"
          borderRadius={10}
          paddingVertical={10}
          alignItems="center"
          pressStyle={{ opacity: 0.8 }}
          onPress={() => onConfirm(label)}
        >
          <Text fontSize={12} fontWeight="700" color="white">
            Confirmar
          </Text>
        </Stack>
        <Stack
          flex={1}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.08)"
          borderRadius={10}
          paddingVertical={10}
          alignItems="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={onCancel}
        >
          <Text fontSize={12} color="#5A5A6E">
            Cancelar
          </Text>
        </Stack>
      </XStack>
    </YStack>
  );
}

// ── History Item ──

function HistoryItem({ phase }: { phase: SessionPhase }) {
  const meta = PHASE_META[phase.type];
  const Icon = meta.icon;

  return (
    <XStack
      alignItems="flex-start"
      gap={10}
      paddingVertical={8}
      paddingHorizontal={8}
      borderRadius={10}
    >
      <Stack
        width={28}
        height={28}
        borderRadius={8}
        backgroundColor={meta.bgColor}
        alignItems="center"
        justifyContent="center"
        marginTop={2}
      >
        <Icon size={13} color={meta.color} />
      </Stack>
      <YStack flex={1} gap={2}>
        <XStack alignItems="center" gap={6}>
          <Text fontSize={12} fontWeight="600" color="#E8E8ED" numberOfLines={1} flex={1}>
            {phase.label}
          </Text>
          {phase.durationMinutes != null && (
            <Text fontSize={10} color="#5A5A6E">
              {phase.durationMinutes}min
            </Text>
          )}
        </XStack>
        {phase.notes && (
          <Text fontSize={10} color="#5A5A6E" numberOfLines={2}>
            {phase.notes}
          </Text>
        )}
      </YStack>
      <Text fontSize={10} color="#5A5A6E" marginTop={2}>
        {phase.startedAt.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </XStack>
  );
}

// ── Timeline Dot ──

function TimelineDot({
  phase,
  isCurrent,
}: {
  phase: SessionPhase;
  isCurrent: boolean;
}) {
  const meta = PHASE_META[phase.type];
  return (
    <Stack
      width={isCurrent ? 14 : 10}
      height={isCurrent ? 14 : 10}
      borderRadius={isCurrent ? 7 : 5}
      backgroundColor={meta.color}
      opacity={isCurrent ? 1 : 0.6}
      borderWidth={isCurrent ? 2 : 0}
      borderColor="rgba(255,255,255,0.2)"
    />
  );
}

// ── Main ──

function PhaseModalInner() {
  const isModalOpen = usePhaseStore((s) => s.isModalOpen);
  const closeModal = usePhaseStore((s) => s.closeModal);
  const current = usePhaseStore((s) => s.current);
  const history = usePhaseStore((s) => s.history);
  const transitionTo = usePhaseStore((s) => s.transitionTo);
  const updateCurrentNotes = usePhaseStore((s) => s.updateCurrentNotes);
  const getSuggestions = usePhaseStore((s) => s.getSuggestions);
  const getElapsedMinutes = usePhaseStore((s) => s.getElapsedMinutes);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [confirmingType, setConfirmingType] = useState<PhaseType | null>(null);
  const [elapsed, setElapsed] = useState(getElapsedMinutes());

  useEffect(() => {
    if (isModalOpen) {
      bottomSheetRef.current?.snapToIndex(0);
      setElapsed(getElapsedMinutes());
      setConfirmingType(null);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isModalOpen, getElapsedMinutes]);

  useEffect(() => {
    if (!isModalOpen) return;
    const interval = setInterval(() => {
      setElapsed(getElapsedMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, [isModalOpen, getElapsedMinutes]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) closeModal();
    },
    [closeModal],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  function handleConfirm(type: PhaseType, label: string) {
    transitionTo(type, label);
    setConfirmingType(null);
  }

  const suggestions = getSuggestions();
  const currentMeta = PHASE_META[current.type];
  const CurrentIcon = currentMeta.icon;
  const allPhases = [...history, current];

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["85%"]}
      index={-1}
      enablePanDownToClose
      enableHandlePanningGesture
      enableContentPanningGesture={false}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBg}
    >
      <YStack flex={1}>
        {/* Header */}
        <XStack
          paddingHorizontal={16}
          paddingVertical={10}
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderBottomColor="rgba(255,255,255,0.06)"
        >
          <Text fontSize={11} fontWeight="800" letterSpacing={1} color="#6C5CE7" textTransform="uppercase">
            Contexto da Sessão
          </Text>
          <Stack
            width={28}
            height={28}
            borderRadius={14}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.6 }}
            onPress={closeModal}
          >
            <X size={16} color="#5A5A6E" />
          </Stack>
        </XStack>

        {/* Scrollable Content */}
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Phase */}
          <YStack gap={10}>
            <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
              Fase Atual
            </Text>
            <XStack
              backgroundColor={currentMeta.bgColor}
              borderWidth={1}
              borderColor={`${currentMeta.color}30`}
              borderRadius={14}
              padding={14}
              alignItems="center"
              gap={10}
            >
              <CurrentIcon size={20} color={currentMeta.color} />
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="700" color={currentMeta.color}>
                  {current.label}
                </Text>
                <XStack alignItems="center" gap={6} marginTop={2}>
                  <Clock size={11} color="#5A5A6E" />
                  <Text fontSize={11} color="#5A5A6E">
                    {elapsed}min · {currentMeta.label}
                  </Text>
                </XStack>
              </YStack>
            </XStack>

            <TextInput
              value={current.notes ?? ""}
              onChangeText={updateCurrentNotes}
              placeholder="Notas desta fase... (opcional)"
              placeholderTextColor="#3A3A4E"
              multiline
              style={styles.notesInput}
            />
          </YStack>

          {/* Suggestions */}
          {confirmingType === null && (
            <YStack gap={8} marginTop={16}>
              <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                Sugestões de Próxima Fase
              </Text>
              {suggestions.map((type) => {
                const meta = PHASE_META[type];
                const Icon = meta.icon;
                return (
                  <XStack
                    key={type}
                    backgroundColor="rgba(255,255,255,0.02)"
                    borderWidth={1}
                    borderColor="rgba(255,255,255,0.04)"
                    borderRadius={12}
                    paddingHorizontal={12}
                    paddingVertical={12}
                    alignItems="center"
                    gap={10}
                    pressStyle={{ opacity: 0.7, backgroundColor: "rgba(255,255,255,0.05)" }}
                    onPress={() => setConfirmingType(type)}
                  >
                    <Stack
                      width={30}
                      height={30}
                      borderRadius={10}
                      backgroundColor={meta.bgColor}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon size={14} color={meta.color} />
                    </Stack>
                    <YStack flex={1}>
                      <Text fontSize={12} fontWeight="600" color="#E8E8ED">
                        {meta.label}
                      </Text>
                      <Text fontSize={10} color="#5A5A6E" marginTop={1}>
                        {meta.description}
                      </Text>
                    </YStack>
                    <ArrowRight size={14} color="#3A3A4E" />
                  </XStack>
                );
              })}
            </YStack>
          )}

          {/* Mini Confirm */}
          {confirmingType !== null && (
            <YStack marginTop={16}>
              <MiniConfirm
                targetType={confirmingType}
                onConfirm={(label) => handleConfirm(confirmingType, label)}
                onCancel={() => setConfirmingType(null)}
              />
            </YStack>
          )}

          {/* All Phases Grid */}
          {confirmingType === null && (
            <YStack gap={8} marginTop={16}>
              <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                Todas as Fases
              </Text>
              <XStack flexWrap="wrap" gap={6}>
                {ALL_PHASE_TYPES.map((type) => {
                  const meta = PHASE_META[type];
                  const Icon = meta.icon;
                  const isActive = type === current.type;
                  return (
                    <Stack
                      key={type}
                      width="48%"
                      borderWidth={1}
                      borderColor={isActive ? `${meta.color}40` : "rgba(255,255,255,0.04)"}
                      backgroundColor={isActive ? meta.bgColor : "rgba(255,255,255,0.02)"}
                      borderRadius={10}
                      paddingHorizontal={10}
                      paddingVertical={10}
                      flexDirection="row"
                      alignItems="center"
                      gap={8}
                      opacity={isActive ? 1 : 0.8}
                      pressStyle={isActive ? undefined : { opacity: 0.6 }}
                      onPress={isActive ? undefined : () => setConfirmingType(type)}
                    >
                      <Icon size={14} color={isActive ? meta.color : "#5A5A6E"} />
                      <Text
                        fontSize={11}
                        fontWeight="600"
                        color={isActive ? meta.color : "#5A5A6E"}
                        numberOfLines={1}
                        flex={1}
                      >
                        {meta.label}
                      </Text>
                    </Stack>
                  );
                })}
              </XStack>
            </YStack>
          )}

          {/* Separator */}
          <Stack
            height={StyleSheet.hairlineWidth}
            backgroundColor="rgba(255,255,255,0.06)"
            marginTop={16}
          />

          {/* History */}
          <YStack gap={10} marginTop={16} paddingBottom={40}>
            <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
              Histórico da Sessão
            </Text>

            {/* Timeline */}
            {allPhases.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timelineContainer}
              >
                {allPhases.map((phase, i) => (
                  <XStack key={phase.id} alignItems="center">
                    {i > 0 && (
                      <Stack
                        width={16}
                        height={1}
                        backgroundColor="rgba(255,255,255,0.1)"
                        marginHorizontal={2}
                      />
                    )}
                    <TimelineDot phase={phase} isCurrent={!phase.endedAt} />
                  </XStack>
                ))}
              </ScrollView>
            )}

            {/* List */}
            {[...history].reverse().map((phase) => (
              <HistoryItem key={phase.id} phase={phase} />
            ))}

            {history.length === 0 && (
              <Text fontSize={11} color="#3A3A4E" textAlign="center" paddingVertical={16} fontStyle="italic">
                Nenhuma fase anterior registrada.
              </Text>
            )}
          </YStack>
        </BottomSheetScrollView>
      </YStack>
    </BottomSheet>
  );
}

export const PhaseModal = memo(PhaseModalInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#111116",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notesInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 10,
    color: "#9090A0",
    fontSize: 13,
    height: 56,
    textAlignVertical: "top",
  },
  labelInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#E8E8ED",
    fontSize: 13,
  },
  timelineContainer: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
