import { createContext, useContext, useRef, type ReactNode } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { GestureType } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from "react-native-reanimated";
import { useGameplayStore } from "../../lib/gameplay-store";

// Context to share the map pan gesture ref with child components (TokenLayer)
const MapPanRefContext = createContext<React.MutableRefObject<
  GestureType | undefined
> | null>(null);
export function useMapPanRef() {
  return useContext(MapPanRefContext);
}

const SCREEN = Dimensions.get("window");
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

interface Props {
  children?: ReactNode;
}

export function MapCanvas({ children }: Props) {
  const mapImage = useGameplayStore((s) => s.mapImage);
  const panRef = useRef<GestureType | undefined>(undefined);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Saved state for gesture start
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .withRef(panRef)
    .minDistance(10)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd((e) => {
      translateX.value = withDecay({
        velocity: e.velocityX,
        deceleration: 0.997,
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        deceleration: 0.997,
      });
    })
    .minPointers(1)
    .maxPointers(2);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const composed = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    doubleTapGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const mapW = mapImage?.width ?? SCREEN.width;
  const mapH = mapImage?.height ?? SCREEN.height;

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Map background */}
        {mapImage?.url ? (
          <Animated.Image
            source={{ uri: mapImage.url }}
            style={{ width: mapW, height: mapH }}
            resizeMode="cover"
          />
        ) : (
          <Animated.View
            style={[styles.placeholder, { width: mapW, height: mapH }]}
          />
        )}

        {/* Overlay layers: grid, tokens, fog */}
        <MapPanRefContext.Provider value={panRef}>
          {children}
        </MapPanRefContext.Provider>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    backgroundColor: "#12121A",
  },
});
