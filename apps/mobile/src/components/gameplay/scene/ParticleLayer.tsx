import { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import type { ParticleEffect } from "../../../types/scene";

interface ParticleLayerProps {
  effect: ParticleEffect;
  intensity?: number; // 0-1, default 1
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Particle Configs ───────────────────────────────────

interface ParticleConfig {
  count: number;
  sizeRange: [number, number];
  color: string;
  opacityRange: [number, number];
  shape: "circle" | "line";
  lineHeight?: number;
}

const CONFIGS: Record<ParticleEffect, ParticleConfig> = {
  mist: {
    count: 8,
    sizeRange: [60, 120],
    color: "rgba(255,255,255,0.08)",
    opacityRange: [0.05, 0.15],
    shape: "circle",
  },
  rain: {
    count: 40,
    sizeRange: [1, 1],
    color: "rgba(150,180,255,0.3)",
    opacityRange: [0.2, 0.4],
    shape: "line",
    lineHeight: 20,
  },
  embers: {
    count: 20,
    sizeRange: [3, 6],
    color: "rgba(255,120,30,0.6)",
    opacityRange: [0.4, 0.6],
    shape: "circle",
  },
  snow: {
    count: 30,
    sizeRange: [4, 8],
    color: "rgba(255,255,255,0.7)",
    opacityRange: [0.4, 0.9],
    shape: "circle",
  },
  dust: {
    count: 15,
    sizeRange: [5, 10],
    color: "rgba(200,180,150,0.15)",
    opacityRange: [0.1, 0.2],
    shape: "circle",
  },
};

// ─── Helpers ────────────────────────────────────────────

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

// ─── Animated Particles ─────────────────────────────────

interface ParticleData {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  size: number;
  startX: number;
  startY: number;
}

function createParticles(config: ParticleConfig): ParticleData[] {
  return Array.from({ length: config.count }, () => {
    const size = randInt(config.sizeRange[0], config.sizeRange[1]);
    const startX = rand(0, SCREEN_W);
    const startY = rand(0, SCREEN_H);
    return {
      x: new Animated.Value(startX),
      y: new Animated.Value(startY),
      opacity: new Animated.Value(rand(config.opacityRange[0], config.opacityRange[1])),
      size,
      startX,
      startY,
    };
  });
}

// ─── Animation Factories ────────────────────────────────

function animateMist(particles: ParticleData[]) {
  particles.forEach((p) => {
    const duration = rand(8000, 15000);
    const driftX = rand(-80, 80);
    const driftY = rand(-30, 30);

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(p.x, {
            toValue: p.startX + driftX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: p.startY + driftY,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: rand(0.08, 0.15),
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: rand(0.02, 0.06),
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(p.x, {
            toValue: p.startX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: p.startY,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  });
}

function animateRain(particles: ParticleData[]) {
  particles.forEach((p) => {
    const duration = rand(400, 800);
    const startY = rand(-40, -20);
    p.y.setValue(startY);
    p.x.setValue(rand(0, SCREEN_W));

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: SCREEN_H + 20,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: p.startX + rand(10, 30),
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.y, {
          toValue: startY,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(p.x, {
          toValue: rand(0, SCREEN_W),
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  });
}

function animateEmbers(particles: ParticleData[]) {
  particles.forEach((p) => {
    const duration = rand(2000, 4000);
    p.y.setValue(SCREEN_H + 10);
    p.x.setValue(rand(0, SCREEN_W));
    p.opacity.setValue(0);

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: rand(-20, SCREEN_H * 0.3),
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: p.startX + rand(-40, 40),
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: rand(0.4, 0.8),
              duration: duration * 0.3,
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: duration * 0.7,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Reset
        Animated.timing(p.y, { toValue: SCREEN_H + 10, duration: 0, useNativeDriver: true }),
        Animated.timing(p.x, { toValue: rand(0, SCREEN_W), duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  });
}

function animateSnow(particles: ParticleData[]) {
  particles.forEach((p) => {
    const duration = rand(3000, 6000);
    const startY = rand(-30, -10);
    const driftX = rand(-30, 30);
    p.y.setValue(startY);
    p.x.setValue(rand(0, SCREEN_W));

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: SCREEN_H + 20,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.x, {
              toValue: p.startX + driftX,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(p.x, {
              toValue: p.startX - driftX,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Reset
        Animated.timing(p.y, { toValue: startY, duration: 0, useNativeDriver: true }),
        Animated.timing(p.x, { toValue: rand(0, SCREEN_W), duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  });
}

function animateDust(particles: ParticleData[]) {
  particles.forEach((p) => {
    const duration = rand(5000, 10000);
    const driftX = rand(-50, 50);
    const driftY = rand(-50, 50);

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(p.x, {
            toValue: p.startX + driftX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: p.startY + driftY,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: rand(0.15, 0.25),
              duration: duration * 0.4,
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: rand(0.02, 0.08),
              duration: duration * 0.6,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(p.x, { toValue: p.startX, duration, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: p.startY, duration, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  });
}

const ANIMATE_FN: Record<ParticleEffect, (p: ParticleData[]) => void> = {
  mist: animateMist,
  rain: animateRain,
  embers: animateEmbers,
  snow: animateSnow,
  dust: animateDust,
};

// ─── Component ──────────────────────────────────────────

function ParticleLayerInner({ effect }: ParticleLayerProps) {
  const config = CONFIGS[effect];
  const particlesRef = useRef<ParticleData[]>(createParticles(config));
  const particles = particlesRef.current;

  useEffect(() => {
    ANIMATE_FN[effect](particles);
  }, [effect, particles]);

  const isLine = config.shape === "line";

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            isLine
              ? {
                  position: "absolute" as const,
                  width: p.size,
                  height: config.lineHeight ?? 20,
                  backgroundColor: config.color,
                  borderRadius: 1,
                  transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                    { rotate: "12deg" },
                  ],
                  opacity: p.opacity,
                }
              : {
                  position: "absolute" as const,
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: config.color,
                  transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                  ],
                  opacity: p.opacity,
                },
          ]}
        />
      ))}
    </View>
  );
}

export const ParticleLayer = memo(ParticleLayerInner);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
