import { Alert, Share } from "react-native";
import { Copy, Share2 } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface InviteCodeDisplayProps {
  code: string;
  onCopy?: () => void;
  onShare?: () => void;
}

export function InviteCodeDisplay({
  code,
  onCopy,
  onShare,
}: InviteCodeDisplayProps) {
  function handleCopy() {
    if (onCopy) {
      onCopy();
      return;
    }
    Alert.alert("Copiado!", `Código ${code} copiado para a área de transferência.`);
  }

  function handleShare() {
    if (onShare) {
      onShare();
      return;
    }
    Share.share({
      message: `Entre na minha sessão no QuestBoard! Código: ${code}`,
    });
  }

  return (
    <YStack
      borderRadius={14}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      padding={20}
      alignItems="center"
      gap={16}
    >
      <Text fontSize={12} color="$textMuted" fontWeight="600">
        CÓDIGO DE CONVITE
      </Text>

      <XStack gap={8}>
        {code.split("").map((char, i) => (
          <Stack
            key={i}
            height={48}
            width={40}
            borderRadius={10}
            backgroundColor="$accentMuted"
            borderWidth={1}
            borderColor="$accent"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={22} fontWeight="700" color="$accent">
              {char}
            </Text>
          </Stack>
        ))}
      </XStack>

      <XStack gap={12}>
        <Stack
          flex={1}
          height={44}
          borderRadius={12}
          backgroundColor="$accentMuted"
          alignItems="center"
          justifyContent="center"
          onPress={handleCopy}
          pressStyle={{ opacity: 0.7 }}
        >
          <XStack alignItems="center" gap={6}>
            <Copy size={16} color="#6C5CE7" />
            <Text fontSize={14} fontWeight="600" color="$accent">
              Copiar
            </Text>
          </XStack>
        </Stack>

        <Stack
          flex={1}
          height={44}
          borderRadius={12}
          backgroundColor="$accentMuted"
          alignItems="center"
          justifyContent="center"
          onPress={handleShare}
          pressStyle={{ opacity: 0.7 }}
        >
          <XStack alignItems="center" gap={6}>
            <Share2 size={16} color="#6C5CE7" />
            <Text fontSize={14} fontWeight="600" color="$accent">
              Compartilhar
            </Text>
          </XStack>
        </Stack>
      </XStack>
    </YStack>
  );
}
