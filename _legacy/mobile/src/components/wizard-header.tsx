import { useRouter } from "expo-router";
import { ArrowLeft, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { SYSTEM_LABELS } from "../lib/mock-data";

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  systemId?: string | null;
  onBack?: () => void;
  onClose?: () => void;
}

export function WizardHeader({
  currentStep,
  totalSteps,
  stepLabel,
  systemId,
  onBack,
  onClose,
}: WizardHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  const handleBack = onBack ?? (() => router.back());
  const handleClose =
    onClose ??
    (() => {
      router.replace("/(app)/(tabs)/characters");
    });

  return (
    <YStack paddingTop={insets.top} backgroundColor="$bg">
      <XStack
        height={52}
        alignItems="center"
        paddingHorizontal={16}
        justifyContent="space-between"
      >
        <Stack
          onPress={handleBack}
          padding={8}
          hitSlop={8}
          pressStyle={{ opacity: 0.6 }}
        >
          <ArrowLeft size={22} color="#E8E8ED" />
        </Stack>

        <Text fontSize={16} fontWeight="700" color="$textPrimary">
          Passo {currentStep} de {totalSteps}
        </Text>

        {systemId ? (
          <Stack
            borderRadius={8}
            backgroundColor="$accentMuted"
            paddingHorizontal={10}
            paddingVertical={4}
          >
            <Text fontSize={12} fontWeight="600" color="$accent">
              {SYSTEM_LABELS[systemId] ?? systemId}
            </Text>
          </Stack>
        ) : (
          <Stack
            onPress={handleClose}
            padding={8}
            hitSlop={8}
            pressStyle={{ opacity: 0.6 }}
          >
            <X size={22} color="#5A5A6E" />
          </Stack>
        )}
      </XStack>

      <Stack height={4} backgroundColor="$border" marginHorizontal={16} borderRadius={9999}>
        <Stack
          height={4}
          width={`${Math.round(progress * 100)}%`}
          backgroundColor="$accent"
          borderRadius={9999}
        />
      </Stack>

      <Text
        fontSize={18}
        fontWeight="700"
        color="$textPrimary"
        paddingHorizontal={16}
        paddingTop={12}
        paddingBottom={8}
      >
        {stepLabel}
      </Text>
    </YStack>
  );
}
