import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function DiceD10Icon({ size = 24, color = "#E8E8ED", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2L21 9L18 20H6L3 9z" />
      <Path d="M3 9h18" />
      <Path d="M12 2v18" />
    </Svg>
  );
}
