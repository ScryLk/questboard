import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Camera, ShieldAlert } from "lucide-react-native";
import { Stack, Text, YStack } from "tamagui";
import { ScanOverlay } from "./scan-overlay";

interface QRScannerProps {
  onCodeScanned: (code: string) => void;
}

/**
 * Extracts the join code from a QR data string.
 * Accepts:
 * - Full URL: "https://questboard.app/join/B7M2X4" → "B7M2X4"
 * - Full URL: "https://questboard.app/join/QB-7K3M" → "QB-7K3M"
 * - Raw code: "B7M2X4" or "QB-7K3M"
 */
function extractCode(data: string): string | null {
  const trimmed = data.trim();

  // Try URL pattern first
  const urlMatch = trimmed.match(
    /questboard\.app\/join\/([A-Za-z0-9-]+)/,
  );
  if (urlMatch) return urlMatch[1].toUpperCase();

  // Raw code: campaign (QB-XXXX) or session (XXXXXX)
  const raw = trimmed.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (/^QB-?[A-Z0-9]{4}$/.test(raw)) return raw;
  if (/^[A-Z0-9]{6}$/.test(raw) && !raw.startsWith("QB")) return raw;

  return null;
}

export function QRScanner({ onCodeScanned }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      const code = extractCode(data);
      if (!code) return;

      setScanned(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCodeScanned(code);

      // Reset after delay to allow re-scanning if needed
      setTimeout(() => setScanned(false), 3000);
    },
    [scanned, onCodeScanned],
  );

  // Permission not determined yet
  if (!permission) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="#0F0F12">
        <Text color="$textMuted" fontSize={14}>
          Carregando camera...
        </Text>
      </YStack>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="#0F0F12"
        paddingHorizontal={32}
        gap={16}
      >
        <Stack
          height={64}
          width={64}
          borderRadius={20}
          backgroundColor="rgba(108, 92, 231, 0.12)"
          alignItems="center"
          justifyContent="center"
        >
          <ShieldAlert size={32} color="#6C5CE7" />
        </Stack>
        <Text fontSize={16} fontWeight="600" color="$textPrimary" textAlign="center">
          Acesso a camera necessario
        </Text>
        <Text fontSize={14} color="$textMuted" textAlign="center" lineHeight={20}>
          Precisamos da camera para escanear{"\n"}o QR Code da sessao ou campanha.
        </Text>
        <Stack
          height={44}
          paddingHorizontal={24}
          borderRadius={12}
          backgroundColor="$accent"
          alignItems="center"
          justifyContent="center"
          onPress={requestPermission}
          pressStyle={{ opacity: 0.8 }}
          marginTop={8}
        >
          <Stack flexDirection="row" alignItems="center" gap={8}>
            <Camera size={18} color="white" />
            <Text fontSize={14} fontWeight="600" color="white">
              Permitir Camera
            </Text>
          </Stack>
        </Stack>
      </YStack>
    );
  }

  return (
    <Stack flex={1} backgroundColor="#000000">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <ScanOverlay
        torchOn={torchOn}
        onToggleTorch={() => setTorchOn((v) => !v)}
      />
    </Stack>
  );
}
