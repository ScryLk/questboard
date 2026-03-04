import QRCode from "react-native-qrcode-svg";
import { Stack, Text } from "tamagui";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export function QRCodeDisplay({
  value,
  size = 200,
  label,
}: QRCodeDisplayProps) {
  return (
    <Stack alignItems="center" gap={12}>
      <Stack
        borderRadius={16}
        backgroundColor="white"
        padding={16}
        alignItems="center"
        justifyContent="center"
      >
        <QRCode
          value={value}
          size={size}
          backgroundColor="#FFFFFF"
          color="#000000"
          ecl="M"
        />
      </Stack>
      {label && (
        <Text fontSize={13} color="$textMuted" textAlign="center">
          {label}
        </Text>
      )}
    </Stack>
  );
}
