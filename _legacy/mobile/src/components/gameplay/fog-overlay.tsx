import { memo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useGameplayStore } from "../../lib/gameplay-store";

function FogOverlayInner() {
  const fogAreas = useGameplayStore((s) => s.fogAreas);
  const gridSize = useGameplayStore((s) => s.gridSize);
  const mapImage = useGameplayStore((s) => s.mapImage);
  const isGM = useGameplayStore((s) => s.isGM);

  if (!mapImage || fogAreas.length === 0) return null;

  const { width, height } = mapImage;

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {fogAreas.map((area) => {
        if (area.revealed) return null;

        const pixelX = area.x * gridSize;
        const pixelY = area.y * gridSize;
        const pixelW = area.width * gridSize;
        const pixelH = area.height * gridSize;

        // GM sees tinted overlay; players see solid black
        const fill = isGM ? "rgba(255, 50, 50, 0.2)" : "rgba(0, 0, 0, 0.92)";

        return (
          <Rect
            key={area.id}
            x={pixelX}
            y={pixelY}
            width={pixelW}
            height={pixelH}
            fill={fill}
          />
        );
      })}
    </Svg>
  );
}

export const FogOverlay = memo(FogOverlayInner);
