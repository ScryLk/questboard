import { useRef, useEffect } from "react";
import { ActivityIndicator, Animated } from "react-native";
import { Stack, Text, type StackProps } from "tamagui";

type ButtonState = "idle" | "loading" | "success" | "error";
type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ActionButtonProps {
  children: string;
  variant?: Variant;
  size?: Size;
  state?: ButtonState;
  disabled?: boolean;
  onPress?: () => void;
  successText?: string;
  errorText?: string;
}

const variantStyles: Record<Variant, StackProps> = {
  primary: { backgroundColor: "$accent" },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "$border",
  },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: "$danger" },
};

const variantTextColors: Record<Variant, string> = {
  primary: "$white",
  outline: "$textPrimary",
  ghost: "$textSecondary",
  danger: "$white",
};

const sizeStyles: Record<Size, StackProps> = {
  sm: { paddingHorizontal: 16, paddingVertical: 8 },
  md: { paddingHorizontal: 24, paddingVertical: 12 },
  lg: { paddingHorizontal: 24, paddingVertical: 16 },
};

const sizeTextSizes: Record<Size, number> = {
  sm: 14,
  md: 16,
  lg: 16,
};

const stateOverrides: Record<ButtonState, StackProps | null> = {
  idle: null,
  loading: null,
  success: { backgroundColor: "$success" },
  error: { backgroundColor: "$danger" },
};

export function ActionButton({
  children,
  variant = "primary",
  size = "md",
  state = "idle",
  disabled = false,
  onPress,
  successText = "Pronto!",
  errorText = "Erro",
}: ActionButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || state === "loading";

  useEffect(() => {
    if (state === "success" || state === "error") {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state, scale]);

  const stateStyle = stateOverrides[state];
  const displayText =
    state === "success"
      ? successText
      : state === "error"
        ? errorText
        : children;

  const textColor =
    state === "success" || state === "error"
      ? "$white"
      : variantTextColors[variant];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Stack
        onPress={isDisabled ? undefined : onPress}
        alignItems="center"
        justifyContent="center"
        borderRadius={12}
        opacity={isDisabled ? 0.5 : 1}
        pressStyle={isDisabled ? undefined : { opacity: 0.8 }}
        {...variantStyles[variant]}
        {...sizeStyles[size]}
        {...(stateStyle ?? {})}
      >
        {state === "loading" ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text
            color={textColor}
            fontSize={sizeTextSizes[size]}
            fontWeight="600"
          >
            {displayText}
          </Text>
        )}
      </Stack>
    </Animated.View>
  );
}
