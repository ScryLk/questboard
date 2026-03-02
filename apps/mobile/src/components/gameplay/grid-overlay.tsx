import { memo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";
import { useGameplayStore } from "../../lib/gameplay-store";

function GridOverlayInner() {
  const gridVisible = useGameplayStore((s) => s.gridVisible);
  const gridSize = useGameplayStore((s) => s.gridSize);
  const mapImage = useGameplayStore((s) => s.mapImage);

  if (!gridVisible || !mapImage) return null;

  const { width, height } = mapImage;
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);

  const verticalLines = [];
  for (let i = 0; i <= cols; i++) {
    const x = i * gridSize;
    verticalLines.push(
      <Line
        key={`v-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />,
    );
  }

  const horizontalLines = [];
  for (let j = 0; j <= rows; j++) {
    const y = j * gridSize;
    horizontalLines.push(
      <Line
        key={`h-${j}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />,
    );
  }

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {verticalLines}
      {horizontalLines}
    </Svg>
  );
}

export const GridOverlay = memo(GridOverlayInner);
