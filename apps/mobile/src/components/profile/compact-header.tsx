import { Animated } from "react-native";
import { ArrowLeft, Check, MoreHorizontal } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import type { UserProfile } from "@questboard/types";
import { useProfileStore } from "../../lib/profile-store";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface CompactHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  opacity: Animated.AnimatedInterpolation<number>;
  onClose: () => void;
  onMorePress: () => void;
}

export function CompactHeader({
  profile,
  isOwnProfile,
  opacity,
  onClose,
  onMorePress,
}: CompactHeaderProps) {
  const toggleFollow = useProfileStore((s) => s.toggleFollow);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        opacity,
        backgroundColor: "#0F0F12",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
      }}
      pointerEvents="box-none"
    >
      <XStack
        height={52}
        alignItems="center"
        paddingHorizontal={16}
        gap={10}
        marginTop={48}
      >
        <Stack
          padding={4}
          onPress={onClose}
          pressStyle={{ opacity: 0.6 }}
        >
          <ArrowLeft size={20} color="#E8E8ED" />
        </Stack>

        {/* Mini avatar */}
        <Stack
          height={32}
          width={32}
          borderRadius={16}
          backgroundColor="#2A2A35"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={12} fontWeight="700" color="$accent">
            {getInitials(profile.displayName)}
          </Text>
        </Stack>

        <Text
          flex={1}
          fontSize={15}
          fontWeight="600"
          color="$textPrimary"
          numberOfLines={1}
        >
          {profile.displayName}
        </Text>

        {!isOwnProfile && (
          <Stack
            paddingHorizontal={14}
            paddingVertical={6}
            borderRadius={8}
            backgroundColor={
              profile.isFollowing ? "transparent" : "$accent"
            }
            borderWidth={profile.isFollowing ? 1 : 0}
            borderColor={
              profile.isFollowing ? "#2A2A3A" : "transparent"
            }
            onPress={() => toggleFollow(profile.username)}
            pressStyle={{ opacity: 0.8 }}
            flexDirection="row"
            alignItems="center"
            gap={4}
          >
            {profile.isFollowing && (
              <Check size={14} color="$textPrimary" />
            )}
            <Text
              fontSize={13}
              fontWeight="600"
              color={profile.isFollowing ? "$textPrimary" : "white"}
            >
              {profile.isFollowing ? "Seguindo" : "Seguir"}
            </Text>
          </Stack>
        )}

        <Stack
          padding={4}
          onPress={onMorePress}
          pressStyle={{ opacity: 0.6 }}
        >
          <MoreHorizontal size={20} color="#5A5A6E" />
        </Stack>
      </XStack>
    </Animated.View>
  );
}
