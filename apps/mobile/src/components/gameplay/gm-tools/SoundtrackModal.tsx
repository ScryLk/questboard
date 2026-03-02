import { memo, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Heart,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { SubModalSheet } from "./SubModalSheet";
import { FilterPills } from "./FilterPills";
import { SoundtrackMixer } from "./SoundtrackMixer";
import { useGameplayStore } from "../../../lib/gameplay-store";
import { MOCK_SOUNDTRACK_TRACKS } from "../../../lib/gameplay-mock-data";
import type { SoundtrackCategory, SoundtrackTrack } from "../../../lib/gameplay-store";

const CATEGORY_OPTIONS: { key: SoundtrackCategory; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "ambient", label: "Ambiente" },
  { key: "combat", label: "Combate" },
  { key: "exploration", label: "Exploração" },
  { key: "horror", label: "Horror" },
  { key: "dramatic", label: "Dramático" },
  { key: "rest", label: "Descanso" },
];

function formatDuration(seconds: number): string {
  if (seconds === 0) return "Loop";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SoundtrackModalInner({ isOpen }: { isOpen: boolean }) {
  const closeGMToolView = useGameplayStore((s) => s.closeGMToolView);
  const soundtrack = useGameplayStore((s) => s.soundtrack);
  const setCurrentTrack = useGameplayStore((s) => s.setCurrentTrack);
  const togglePlayback = useGameplayStore((s) => s.togglePlayback);
  const setSoundtrackCategory = useGameplayStore((s) => s.setSoundtrackCategory);
  const toggleTrackFavorite = useGameplayStore((s) => s.toggleTrackFavorite);
  const toggleMuteAll = useGameplayStore((s) => s.toggleMuteAll);

  const handleDismiss = useCallback(() => {
    useGameplayStore.setState({ activeGMToolView: null });
  }, []);

  const filteredTracks = useMemo(() => {
    if (soundtrack.activeCategory === "all") return MOCK_SOUNDTRACK_TRACKS;
    return MOCK_SOUNDTRACK_TRACKS.filter(
      (t) => t.category === soundtrack.activeCategory,
    );
  }, [soundtrack.activeCategory]);

  const currentIndex = useMemo(() => {
    if (!soundtrack.currentTrack) return -1;
    return filteredTracks.findIndex((t) => t.id === soundtrack.currentTrack!.id);
  }, [soundtrack.currentTrack, filteredTracks]);

  const handlePrev = useCallback(() => {
    if (filteredTracks.length === 0) return;
    const prevIndex = currentIndex <= 0 ? filteredTracks.length - 1 : currentIndex - 1;
    setCurrentTrack(filteredTracks[prevIndex]);
  }, [currentIndex, filteredTracks, setCurrentTrack]);

  const handleNext = useCallback(() => {
    if (filteredTracks.length === 0) return;
    const nextIndex = currentIndex >= filteredTracks.length - 1 ? 0 : currentIndex + 1;
    setCurrentTrack(filteredTracks[nextIndex]);
  }, [currentIndex, filteredTracks, setCurrentTrack]);

  const handleSelectTrack = useCallback(
    (track: SoundtrackTrack) => {
      if (soundtrack.currentTrack?.id === track.id) {
        togglePlayback();
      } else {
        setCurrentTrack(track);
      }
    },
    [soundtrack.currentTrack, togglePlayback, setCurrentTrack],
  );

  const renderTrack = useCallback(
    ({ item }: { item: SoundtrackTrack }) => {
      const isPlaying = soundtrack.currentTrack?.id === item.id && soundtrack.isPlaying;
      const isCurrent = soundtrack.currentTrack?.id === item.id;

      return (
        <XStack
          height={52}
          alignItems="center"
          gap={10}
          paddingHorizontal={8}
          borderRadius={8}
          backgroundColor={isCurrent ? "rgba(108, 92, 231, 0.08)" : "transparent"}
          pressStyle={{ opacity: 0.7 }}
          onPress={() => handleSelectTrack(item)}
        >
          {/* Play/Pause indicator */}
          <Stack
            width={28}
            height={28}
            borderRadius={14}
            backgroundColor={isPlaying ? "#6C5CE7" : "#1C1C24"}
            borderWidth={1}
            borderColor={isCurrent ? "#6C5CE7" : "#2A2A35"}
            alignItems="center"
            justifyContent="center"
          >
            {isPlaying ? (
              <Pause size={12} color="white" fill="white" />
            ) : (
              <Play size={12} color={isCurrent ? "#6C5CE7" : "#5A5A6E"} fill={isCurrent ? "#6C5CE7" : "#5A5A6E"} />
            )}
          </Stack>

          {/* Track info */}
          <YStack flex={1}>
            <Text
              fontSize={13}
              fontWeight={isCurrent ? "700" : "500"}
              color={isCurrent ? "#E8E8ED" : "#9090A0"}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <XStack gap={6} alignItems="center">
              <Text fontSize={10} color="#5A5A6E">
                {formatDuration(item.duration)}
              </Text>
              {item.isLoop && (
                <Repeat size={9} color="#5A5A6E" />
              )}
            </XStack>
          </YStack>

          {/* Favorite */}
          <Stack
            width={28}
            height={28}
            borderRadius={6}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={(e) => {
              e.stopPropagation();
              toggleTrackFavorite(item.id);
            }}
          >
            <Heart
              size={14}
              color={item.isFavorite ? "#FF6B6B" : "#3A3A45"}
              fill={item.isFavorite ? "#FF6B6B" : "transparent"}
            />
          </Stack>
        </XStack>
      );
    },
    [soundtrack.currentTrack, soundtrack.isPlaying, handleSelectTrack, toggleTrackFavorite],
  );

  const ListHeader = useMemo(
    () => (
      <YStack gap={16} paddingBottom={8}>
        {/* Now Playing card */}
        <YStack
          backgroundColor="#1C1C24"
          borderRadius={12}
          borderWidth={1}
          borderColor={soundtrack.currentTrack ? "#2A2A35" : "#1E1E2A"}
          padding={12}
          gap={10}
        >
          {soundtrack.currentTrack ? (
            <>
              {/* Waveform bars + track name */}
              <XStack alignItems="center" gap={10}>
                <XStack gap={2} alignItems="flex-end" height={20}>
                  {[12, 18, 8, 16, 10].map((h, i) => (
                    <View
                      key={i}
                      style={[
                        styles.waveBar,
                        {
                          height: soundtrack.isPlaying ? h : 4,
                          backgroundColor: soundtrack.isPlaying ? "#6C5CE7" : "#2A2A35",
                        },
                      ]}
                    />
                  ))}
                </XStack>

                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="700" color="#E8E8ED" numberOfLines={1}>
                    {soundtrack.currentTrack.name}
                  </Text>
                  <Text fontSize={10} color="#5A5A6E">
                    {soundtrack.currentTrack.isLoop ? "Loop" : formatDuration(soundtrack.currentTrack.duration)}
                  </Text>
                </YStack>
              </XStack>

              {/* Controls */}
              <XStack justifyContent="center" alignItems="center" gap={20}>
                <Stack
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handlePrev}
                >
                  <SkipBack size={16} color="#9090A0" fill="#9090A0" />
                </Stack>

                <Stack
                  width={44}
                  height={44}
                  borderRadius={22}
                  backgroundColor="#6C5CE7"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.85 }}
                  onPress={togglePlayback}
                >
                  {soundtrack.isPlaying ? (
                    <Pause size={20} color="white" fill="white" />
                  ) : (
                    <Play size={20} color="white" fill="white" />
                  )}
                </Stack>

                <Stack
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handleNext}
                >
                  <SkipForward size={16} color="#9090A0" fill="#9090A0" />
                </Stack>
              </XStack>
            </>
          ) : (
            <Text fontSize={12} color="#5A5A6E" textAlign="center" paddingVertical={8}>
              Nenhuma trilha selecionada
            </Text>
          )}
        </YStack>

        {/* Mixer section */}
        <SoundtrackMixer />

        {/* Separator */}
        <Stack height={1} backgroundColor="#1E1E2A" />

        {/* Category filter */}
        <FilterPills
          options={CATEGORY_OPTIONS}
          selected={soundtrack.activeCategory}
          onChange={setSoundtrackCategory}
          scrollable
        />
      </YStack>
    ),
    [
      soundtrack.currentTrack,
      soundtrack.isPlaying,
      soundtrack.activeCategory,
      handlePrev,
      handleNext,
      togglePlayback,
      setSoundtrackCategory,
    ],
  );

  return (
    <SubModalSheet
      isOpen={isOpen}
      snapPoints={["40%", "75%"]}
      title="Trilha Sonora"
      onBack={closeGMToolView}
      onDismiss={handleDismiss}
      useFlatList
      footer={
        <Stack
          height={40}
          borderRadius={10}
          backgroundColor={soundtrack.isMuted ? "#6C5CE720" : "#FF6B6B20"}
          borderWidth={1}
          borderColor={soundtrack.isMuted ? "#6C5CE740" : "#FF6B6B40"}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={toggleMuteAll}
        >
          <XStack alignItems="center" gap={6}>
            {soundtrack.isMuted ? (
              <>
                <Volume2 size={14} color="#6C5CE7" />
                <Text fontSize={12} fontWeight="600" color="#6C5CE7">
                  Restaurar Som
                </Text>
              </>
            ) : (
              <>
                <VolumeX size={14} color="#FF6B6B" />
                <Text fontSize={12} fontWeight="600" color="#FF6B6B">
                  Silenciar Tudo
                </Text>
              </>
            )}
          </XStack>
        </Stack>
      }
    >
      <BottomSheetFlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SubModalSheet>
  );
}

export const SoundtrackModal = memo(SoundtrackModalInner);

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
});
