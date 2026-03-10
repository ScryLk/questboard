import { Alert } from "react-native";
import {
  ArrowLeft,
  Calendar,
  Check,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Share2,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
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

function formatJoinDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface HeroSectionProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onClose: () => void;
  onMorePress: () => void;
  onLevelPress?: () => void;
}

export function HeroSection({
  profile,
  isOwnProfile,
  onClose,
  onMorePress,
  onLevelPress,
}: HeroSectionProps) {
  const toggleFollow = useProfileStore((s) => s.toggleFollow);

  const xpPercent = Math.round(
    (profile.currentXP / profile.requiredXP) * 100,
  );

  return (
    <YStack>
      {/* Banner */}
      <Stack height={160} overflow="hidden" backgroundColor="#1A1A2E">

        {/* Floating buttons */}
        <XStack
          position="absolute"
          top={48}
          left={16}
          right={16}
          justifyContent="space-between"
        >
          <Stack
            height={36}
            width={36}
            borderRadius={9999}
            backgroundColor="rgba(0,0,0,0.4)"
            alignItems="center"
            justifyContent="center"
            onPress={onClose}
            pressStyle={{ opacity: 0.6 }}
          >
            <ArrowLeft size={18} color="#FFFFFF" />
          </Stack>

          <Stack
            height={36}
            width={36}
            borderRadius={9999}
            backgroundColor="rgba(0,0,0,0.4)"
            alignItems="center"
            justifyContent="center"
            onPress={onMorePress}
            pressStyle={{ opacity: 0.6 }}
          >
            <MoreHorizontal size={18} color="#FFFFFF" />
          </Stack>
        </XStack>
      </Stack>

      {/* Avatar + Identity */}
      <YStack paddingHorizontal={24}>
        {/* Avatar overlapping banner */}
        <Stack
          height={84}
          width={84}
          borderRadius={9999}
          borderWidth={3}
          borderColor="#0F0F12"
          backgroundColor="#2A2A35"
          marginTop={-42}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={32} fontWeight="700" color="$accent">
            {getInitials(profile.displayName)}
          </Text>
        </Stack>

        {/* Name + username */}
        <Text
          fontSize={18}
          fontWeight="600"
          color="$textPrimary"
          marginTop={8}
        >
          {profile.displayName}
        </Text>
        <Text fontSize={13} color="$textMuted">
          @{profile.username}
        </Text>

        {/* Equipped title */}
        {profile.equippedTitle && (
          <Text
            fontSize={12}
            fontWeight="600"
            color={profile.equippedTitle.color}
            marginTop={4}
          >
            {profile.equippedTitle.label}
          </Text>
        )}

        {/* Level bar (inline) */}
        <XStack
          alignItems="center"
          gap={8}
          marginTop={10}
          onPress={onLevelPress}
          pressStyle={{ opacity: 0.7 }}
        >
          <Text fontSize={12} fontWeight="600" color="$textSecondary">
            Nv. {profile.level}
          </Text>
          <Stack
            flex={1}
            height={6}
            borderRadius={4}
            backgroundColor="#2A2A35"
            overflow="hidden"
          >
            <Stack
              height={6}
              borderRadius={4}
              backgroundColor="$accent"
              width={`${xpPercent}%` as unknown as number}
            />
          </Stack>
          <Text fontSize={11} color="$textMuted">
            {xpPercent}%
          </Text>
        </XStack>
        <Text
          fontSize={11}
          color="$textMuted"
          marginTop={2}
          textAlign="center"
        >
          {profile.currentXP.toLocaleString()} / {profile.requiredXP.toLocaleString()} XP
        </Text>

        {/* Bio */}
        {profile.bio && (
          <Text
            fontSize={13}
            color="#9B9BAF"
            lineHeight={19}
            marginTop={10}
            numberOfLines={3}
          >
            {profile.bio}
          </Text>
        )}

        {/* Location + Joined */}
        <XStack alignItems="center" gap={12} marginTop={8}>
          {profile.location && (
            <XStack alignItems="center" gap={4}>
              <MapPin size={12} color="#5A5A6E" />
              <Text fontSize={12} color="$textMuted">
                {profile.location}
              </Text>
            </XStack>
          )}
          <XStack alignItems="center" gap={4}>
            <Calendar size={12} color="#5A5A6E" />
            <Text fontSize={12} color="$textMuted">
              desde {formatJoinDate(profile.joinedAt)}
            </Text>
          </XStack>
        </XStack>

        {/* Action buttons */}
        <XStack gap={8} marginTop={16}>
          {isOwnProfile ? (
            <>
              <Stack
                flex={1}
                height={44}
                borderRadius={12}
                borderWidth={1}
                borderColor="#2A2A3A"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.8 }}
                onPress={() =>
                  Alert.alert(
                    "Em breve",
                    "Editar perfil estara disponivel em breve!",
                  )
                }
              >
                <Text fontSize={14} fontWeight="600" color="$textPrimary">
                  Editar Perfil
                </Text>
              </Stack>
              <Stack
                height={44}
                paddingHorizontal={16}
                borderRadius={12}
                borderWidth={1}
                borderColor="#2A2A3A"
                alignItems="center"
                justifyContent="center"
                flexDirection="row"
                gap={6}
                pressStyle={{ opacity: 0.8 }}
                onPress={() =>
                  Alert.alert(
                    "Em breve",
                    "Compartilhar perfil estara disponivel em breve!",
                  )
                }
              >
                <Share2 size={16} color="#5A5A6E" />
                <Text fontSize={14} fontWeight="600" color="$textPrimary">
                  Compartilhar
                </Text>
              </Stack>
            </>
          ) : (
            <>
              <Stack
                flex={1}
                height={44}
                borderRadius={12}
                backgroundColor={
                  profile.isFollowing ? "transparent" : "$accent"
                }
                borderWidth={profile.isFollowing ? 1 : 0}
                borderColor={
                  profile.isFollowing ? "#2A2A3A" : "transparent"
                }
                alignItems="center"
                justifyContent="center"
                flexDirection="row"
                gap={6}
                pressStyle={{ opacity: 0.8 }}
                onPress={() => toggleFollow(profile.username)}
              >
                {profile.isFollowing && (
                  <Check size={16} color="$textPrimary" />
                )}
                <Text
                  fontSize={14}
                  fontWeight="600"
                  color={profile.isFollowing ? "$textPrimary" : "white"}
                >
                  {profile.isFollowing ? "Seguindo" : "Seguir"}
                </Text>
              </Stack>

              <Stack
                flex={1}
                height={44}
                borderRadius={12}
                borderWidth={1}
                borderColor="#2A2A3A"
                alignItems="center"
                justifyContent="center"
                flexDirection="row"
                gap={6}
                pressStyle={{ opacity: 0.8 }}
                onPress={() =>
                  Alert.alert(
                    "Em breve",
                    "Mensagens estarao disponiveis em breve!",
                  )
                }
              >
                <MessageSquare size={16} color="#5A5A6E" />
                <Text fontSize={14} fontWeight="600" color="$textPrimary">
                  Mensagem
                </Text>
              </Stack>

              <Stack
                height={44}
                width={44}
                borderRadius={12}
                borderWidth={1}
                borderColor="#2A2A3A"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.8 }}
                onPress={() =>
                  Alert.alert(
                    "Em breve",
                    "Compartilhar perfil estara disponivel em breve!",
                  )
                }
              >
                <Share2 size={16} color="#5A5A6E" />
              </Stack>
            </>
          )}
        </XStack>

        {/* Social counters */}
        <XStack
          justifyContent="space-around"
          marginTop={20}
          paddingBottom={16}
          borderBottomWidth={1}
          borderBottomColor="rgba(255,255,255,0.06)"
        >
          <YStack alignItems="center">
            <Text fontSize={18} fontWeight="700" color="$textPrimary">
              {formatCount(profile.followersCount)}
            </Text>
            <Text fontSize={12} color="$textMuted">
              Seguidores
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text fontSize={18} fontWeight="700" color="$textPrimary">
              {formatCount(profile.followingCount)}
            </Text>
            <Text fontSize={12} color="$textMuted">
              Seguindo
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text fontSize={18} fontWeight="700" color="$textPrimary">
              {profile.campaignsCount}
            </Text>
            <Text fontSize={12} color="$textMuted">
              Campanhas
            </Text>
          </YStack>
        </XStack>
      </YStack>
    </YStack>
  );
}
