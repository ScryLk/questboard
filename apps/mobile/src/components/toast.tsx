import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Check, X, AlertTriangle, Info } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const toastConfig: Record<ToastType, { icon: typeof Check; bg: string; border: string }> = {
  success: { icon: Check, bg: "$successMuted", border: "$success" },
  error: { icon: X, bg: "$dangerMuted", border: "$danger" },
  warning: { icon: AlertTriangle, bg: "$warningMuted", border: "$warning" },
  info: { icon: Info, bg: "$accentMuted", border: "$accent" },
};

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss(toast.id));
    }, toast.duration ?? 3000);

    return () => clearTimeout(timeout);
  }, [toast.id, toast.duration, onDismiss, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <XStack
        marginHorizontal={16}
        marginBottom={8}
        padding={12}
        borderRadius={12}
        borderWidth={1}
        borderColor={config.border}
        backgroundColor={config.bg}
        alignItems="center"
        gap={10}
      >
        <YStack
          height={24}
          width={24}
          borderRadius={9999}
          backgroundColor={config.border}
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={13} color="white" strokeWidth={3} />
        </YStack>
        <Text flex={1} fontSize={14} color="$textPrimary">
          {toast.message}
        </Text>
      </XStack>
    </Animated.View>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <YStack
      position="absolute"
      top={insets.top + 8}
      left={0}
      right={0}
      zIndex={9999}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </YStack>
  );
}
