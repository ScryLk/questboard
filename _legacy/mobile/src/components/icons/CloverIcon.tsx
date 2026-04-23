import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function CloverIcon({ size = 24, color = "#E8E8ED", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* Top petal */}
      <Path d="M12 12C12 12 12 8 9 6C6 4 4 6 4 9C4 12 8 12 12 12z" />
      {/* Right petal */}
      <Path d="M12 12C12 12 16 12 18 9C20 6 18 4 15 4C12 4 12 8 12 12z" />
      {/* Bottom petal */}
      <Path d="M12 12C12 12 12 16 15 18C18 20 20 18 20 15C20 12 16 12 12 12z" />
      {/* Left petal */}
      <Path d="M12 12C12 12 8 12 6 15C4 18 6 20 9 20C12 20 12 16 12 12z" />
      {/* Stem */}
      <Path d="M12 16l-2 6" />
    </Svg>
  );
}
