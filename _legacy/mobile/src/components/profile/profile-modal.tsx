import { useCallback, useRef, useState } from "react";
import { Animated, Modal, PanResponder, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, YStack } from "tamagui";
import { useProfileStore } from "../../lib/profile-store";
import { HeroSection } from "./hero-section";
import { ProfileTabs, type ProfileTabId } from "./profile-tabs";
import { LevelDetailSheet } from "./level-detail-sheet";
import { CompactHeader } from "./compact-header";
import { AdventurerTab } from "./adventurer-tab";
import { PostsTab } from "./posts-tab";
import { GMTab } from "./gm-tab";
import { ProfileContextMenu } from "./profile-context-menu";

const DISMISS_THRESHOLD = 120;
const COMPACT_HEADER_OFFSET = 200;

export function ProfileModal() {
  const currentUsername = useProfileStore((s) => s.currentUsername);
  const profiles = useProfileStore((s) => s.profiles);
  const isLoading = useProfileStore((s) => s.isLoading);
  const closeProfile = useProfileStore((s) => s.closeProfile);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showLevelSheet, setShowLevelSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabId>("adventurer");

  const translateY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [COMPACT_HEADER_OFFSET - 40, COMPACT_HEADER_OFFSET],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          const raw = gestureState.dy;
          const clamped =
            raw > 80 ? 80 + (raw - 80) * 0.4 : raw;
          translateY.setValue(clamped);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: 800,
            duration: 280,
            useNativeDriver: true,
          }).start(() => {
            closeProfile();
            translateY.setValue(0);
            setActiveTab("adventurer");
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 300,
          }).start();
        }
      },
    }),
  ).current;

  const visible = currentUsername !== null;
  const profile = currentUsername ? profiles[currentUsername] : null;
  const isOwnProfile = profile?.id === "user-1";

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 800,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      closeProfile();
      translateY.setValue(0);
      setActiveTab("adventurer");
    });
  }, [closeProfile, translateY]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "#0F0F12",
          transform: [{ translateY }],
        }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* Drag handle */}
          <YStack
            alignItems="center"
            paddingVertical={8}
            {...panResponder.panHandlers}
          >
            <Stack
              height={4}
              width={36}
              borderRadius={9999}
              backgroundColor="#3A3A4A"
            />
          </YStack>

          {profile ? (
            <>
              {/* Compact header (appears on scroll) */}
              <CompactHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                opacity={compactHeaderOpacity}
                onClose={handleClose}
                onMorePress={() => setShowContextMenu(true)}
              />

              <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                stickyHeaderIndices={[1]}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
              >
                <HeroSection
                  profile={profile}
                  isOwnProfile={isOwnProfile}
                  onClose={handleClose}
                  onMorePress={() => setShowContextMenu(true)}
                  onLevelPress={() => setShowLevelSheet(true)}
                />

                <ProfileTabs
                  activeTab={activeTab}
                  onChangeTab={setActiveTab}
                  showGMTab={profile.isGM}
                />

                {/* Tab content */}
                <YStack minHeight={400} paddingHorizontal={16} paddingTop={16}>
                  {activeTab === "adventurer" && (
                    <AdventurerTab
                      stats={profile.stats}
                      characters={profile.featuredCharacters}
                      achievements={profile.featuredAchievements}
                      campaigns={profile.recentCampaigns}
                    />
                  )}
                  {activeTab === "posts" && (
                    <PostsTab
                      posts={profile.posts}
                      isOwnProfile={isOwnProfile}
                    />
                  )}
                  {activeTab === "gm" && (
                    <GMTab
                      gmStats={profile.gmStats}
                      campaigns={profile.gmCampaigns}
                      reviews={profile.gmReviews}
                      tags={profile.gmTags}
                      isOwnProfile={isOwnProfile}
                    />
                  )}
                </YStack>
              </Animated.ScrollView>

              <LevelDetailSheet
                visible={showLevelSheet}
                profile={profile}
                onClose={() => setShowLevelSheet(false)}
              />

              <ProfileContextMenu
                visible={showContextMenu}
                username={profile.username}
                isOwnProfile={isOwnProfile}
                onClose={() => setShowContextMenu(false)}
              />
            </>
          ) : isLoading ? (
            <YStack flex={1} alignItems="center" justifyContent="center" />
          ) : null}
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}
