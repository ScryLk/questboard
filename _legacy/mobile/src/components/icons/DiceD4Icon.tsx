import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function DiceD4Icon({ size = 24, color = "#E8E8ED", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2L22 20H2z" />
      <Path d="M7 11h10L12 20z" />
    </Svg>
  );
}
