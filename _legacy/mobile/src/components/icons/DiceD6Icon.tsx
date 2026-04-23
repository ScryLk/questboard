import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function DiceD6Icon({ size = 24, color = "#E8E8ED", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2L22 8v8l-10 6-10-6V8z" />
      <Path d="M2 8l10 6 10-6" />
      <Path d="M12 14v8" />
    </Svg>
  );
}
