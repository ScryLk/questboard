import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Zap, Wand2 } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useSessionCreationStore } from "../../../../lib/session-creation-store";

interface ModeCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  onPress: () => void;
}

function ModeCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  onPress,
}: ModeCardProps) {
  return (
    <Stack
      borderRadius={14}
      borderWidth={1}
      borderColor="$border"
      backgroundColor="$bgCard"
      padding={20}
      gap={14}
      onPress={onPress}
      pressStyle={{ opacity: 0.85, scale: 0.98 }}
    >
      <Stack
        height={52}
        width={52}
        borderRadius={14}
        backgroundColor={iconBg}
        alignItems="center"
        justifyContent="center"
      >
        <Icon size={26} color={iconColor} />
      </Stack>
      <YStack gap={4}>
        <Text fontSize={18} fontWeight="700" color="$textPrimary">
          {title}
        </Text>
        <Text fontSize={13} color="$textMuted" lineHeight={18}>
          {description}
        </Text>
      </YStack>
    </Stack>
  );
}

export default function SessionModeSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setMode, reset } = useSessionCreationStore();

  function handleQuick() {
    reset();
    setMode("quick");
    router.push("/(app)/sessions/create/quick");
  }

  function handleWizard() {
    reset();
    setMode("wizard");
    router.push("/(app)/sessions/create/step1");
  }

  function handleBack() {
    router.back();
  }

  return (
    <YStack flex={1} backgroundColor="$bg" paddingTop={insets.top}>
      {/* Header */}
      <XStack
        height={52}
        alignItems="center"
        paddingHorizontal={16}
      >
        <Stack
          onPress={handleBack}
          padding={8}
          hitSlop={8}
          pressStyle={{ opacity: 0.6 }}
        >
          <ArrowLeft size={22} color="#E8E8ED" />
        </Stack>
      </XStack>

      <YStack paddingHorizontal={24} gap={8}>
        <Text fontSize={26} fontWeight="700" color="$textPrimary">
          Criar Sessão
        </Text>
        <Text fontSize={14} color="$textMuted" marginBottom={24}>
          Como você quer criar sua mesa?
        </Text>

        <YStack gap={14}>
          <ModeCard
            icon={Zap}
            iconColor="#6C5CE7"
            iconBg="rgba(108, 92, 231, 0.1)"
            title="Criação Rápida"
            description="Crie uma mesa em segundos com o essencial: nome, sistema e jogadores."
            onPress={handleQuick}
          />

          <ModeCard
            icon={Wand2}
            iconColor="#00B894"
            iconBg="rgba(0, 184, 148, 0.1)"
            title="Wizard Detalhado"
            description="Configure cada detalhe da sua mesa: regras, ambientação, convites e mais."
            onPress={handleWizard}
          />
        </YStack>
      </YStack>
    </YStack>
  );
}
