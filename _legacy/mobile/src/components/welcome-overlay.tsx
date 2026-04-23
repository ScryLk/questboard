import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useLoginTransition } from "../lib/login-transition-context";

export function WelcomeOverlay() {
  const { state, userName, complete } = useLoginTransition();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (state === "welcome") {
      // Fade in + scale up
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 1.5s
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          complete();
          // Reset values for next time
          scale.setValue(0.8);
        });
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [state, complete, opacity, scale]);

  if (state !== "welcome") return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Animated.Text style={styles.greeting}>
          Olá, {userName}!
        </Animated.Text>
        <Animated.Text style={styles.subtitle}>
          Bom ter você de volta.
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    width: 280,
    backgroundColor: "#16161C",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A35",
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E8E8ED",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#9090A0",
  },
});
