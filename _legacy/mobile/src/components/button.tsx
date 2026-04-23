import { ActivityIndicator } from "react-native";
import { Stack, Text, type StackProps } from "tamagui";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
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

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onPress,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Stack
      onPress={isDisabled ? undefined : onPress}
      alignItems="center"
      justifyContent="center"
      borderRadius={12}
      opacity={isDisabled ? 0.5 : 1}
      pressStyle={isDisabled ? undefined : { opacity: 0.8 }}
      {...variantStyles[variant]}
      {...sizeStyles[size]}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text
          color={variantTextColors[variant]}
          fontSize={sizeTextSizes[size]}
          fontWeight="600"
        >
          {children}
        </Text>
      )}
    </Stack>
  );
}
