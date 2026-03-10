import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Animated, Easing, StyleSheet, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import {
  MapPin,
  AlertTriangle,
  Search,
  CloudRain,
  Skull,
  X,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { usePhaseStore } from "../../stores/phaseStore";
import { triggerHaptic } from "../../lib/haptics/haptic-triggers";
import { playSound, stopSound } from "../../services/soundManager";
import { ParticleLayer } from "./scene/ParticleLayer";
import {
  SCENE_TYPE_META,
  SCENE_SOUND_MAP,
  SCENE_REACTION_EMOJIS,
} from "../../constants/sceneConfig";
import type { SceneType, SceneReactionEmoji } from "../../types/scene";

// ─── Progress Bar ───────────────────────────────────────

function ProgressBar({
  duration,
  color,
  onComplete,
}: {
  duration: number;
  color: string;
  onComplete: () => void;
}) {
  const width = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: 0,
      duration: duration * 1000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [width, duration, onComplete]);

  return (
    <View style={styles.progressContainer}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: width.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

// ─── Reaction Bar ───────────────────────────────────────

function ReactionBar() {
  const addSceneReaction = useGameplayStore((s) => s.addSceneReaction);

  const handleReaction = useCallback(
    (emoji: SceneReactionEmoji) => {
      addSceneReaction(emoji);
      triggerHaptic("scene-reaction");
    },
    [addSceneReaction],
  );

  return (
    <XStack
      position="absolute"
      bottom={60}
      right={16}
      gap={6}
      zIndex={10}
    >
      {SCENE_REACTION_EMOJIS.map(({ emoji }) => (
        <Stack
          key={emoji}
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor="rgba(0,0,0,0.6)"
          borderWidth={1}
          borderColor="rgba(255,255,255,0.15)"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7, scale: 1.1 }}
          onPress={() => handleReaction(emoji)}
        >
          <Text fontSize={16}>{emoji}</Text>
        </Stack>
      ))}
    </XStack>
  );
}

// ─── GM Controls ────────────────────────────────────────

function GMControls({ onDismiss }: { onDismiss: () => void }) {
  return (
    <XStack
      position="absolute"
      bottom={24}
      left={16}
      right={16}
      justifyContent="center"
      zIndex={10}
    >
      <Stack
        paddingHorizontal={20}
        paddingVertical={10}
        borderRadius={10}
        backgroundColor="rgba(0,0,0,0.7)"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.15)"
        pressStyle={{ opacity: 0.7 }}
        onPress={onDismiss}
      >
        <XStack alignItems="center" gap={6}>
          <X size={14} color="#E8E8ED" />
          <Text fontSize={12} fontWeight="600" color="#E8E8ED">
            Encerrar para todos
          </Text>
        </XStack>
      </Stack>
    </XStack>
  );
}

// ─── Type-Specific Content Renderers ────────────────────

function CinematicContent({
  title,
  subtitle,
  contentOpacity,
  titleTranslateY,
  imageScale,
}: {
  title: string;
  subtitle?: string;
  contentOpacity: Animated.Value;
  titleTranslateY: Animated.Value;
  imageScale: Animated.Value;
}) {
  return (
    <>
      <Animated.View style={[styles.letterbox, { opacity: contentOpacity }]} />
      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: contentOpacity,
            transform: [{ scale: imageScale }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ translateY: titleTranslateY }] }}>
          <Text
            fontSize={32}
            fontWeight="800"
            color="#E8E8ED"
            textAlign="center"
            lineHeight={40}
            style={styles.textShadow}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              fontSize={16}
              color="#9090A0"
              fontStyle="italic"
              textAlign="center"
              marginTop={8}
            >
              {subtitle}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.letterbox, { opacity: contentOpacity }]} />
    </>
  );
}

function ChapterContent({
  title,
  subtitle,
  chapter,
  contentOpacity,
  lineWidth,
  titleTranslateY,
  subtitleOpacity,
}: {
  title: string;
  subtitle?: string;
  chapter?: string;
  contentOpacity: Animated.Value;
  lineWidth: Animated.Value;
  titleTranslateY: Animated.Value;
  subtitleOpacity: Animated.Value;
}) {
  return (
    <Animated.View style={[styles.centerContent, { opacity: contentOpacity }]}>
      <YStack alignItems="center" gap={8} paddingHorizontal={32}>
        <Animated.View
          style={{
            height: 1,
            backgroundColor: "#C9A84C",
            opacity: 0.6,
            width: lineWidth,
          }}
        />
        {chapter && (
          <Text
            fontSize={12}
            fontWeight="600"
            color="#5A5A6E"
            letterSpacing={4}
            textTransform="uppercase"
          >
            {chapter}
          </Text>
        )}
        <Animated.View style={{ transform: [{ translateY: titleTranslateY }] }}>
          <Text
            fontSize={32}
            fontWeight="800"
            color="#E8E8ED"
            textAlign="center"
            lineHeight={40}
          >
            {title}
          </Text>
        </Animated.View>
        <Animated.View
          style={{
            height: 1,
            backgroundColor: "#C9A84C",
            opacity: 0.6,
            width: lineWidth,
          }}
        />
        {subtitle && (
          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text
              fontSize={14}
              color="#8A8A9A"
              fontStyle="italic"
              textAlign="center"
              paddingHorizontal={20}
            >
              {subtitle}
            </Text>
          </Animated.View>
        )}
      </YStack>
    </Animated.View>
  );
}

function LocationContent({
  title,
  subtitle,
  tags,
  contentOpacity,
  contentTranslateY,
}: {
  title: string;
  subtitle?: string;
  tags?: string[];
  contentOpacity: Animated.Value;
  contentTranslateY: Animated.Value;
}) {
  const meta = SCENE_TYPE_META.location;
  return (
    <Animated.View
      style={[
        styles.centerContent,
        {
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
        },
      ]}
    >
      <YStack alignItems="center" gap={10} paddingHorizontal={32}>
        <MapPin size={24} color={meta.color} />
        <Text
          fontSize={28}
          fontWeight="700"
          color="#E8E8ED"
          textAlign="center"
        >
          {title}
        </Text>
        {subtitle && (
          <Text fontSize={14} color="#9090A0" textAlign="center">
            {subtitle}
          </Text>
        )}
        {tags && tags.length > 0 && (
          <>
            <View style={styles.divider} />
            <XStack gap={8} flexWrap="wrap" justifyContent="center">
              {tags.map((tag, i) => (
                <View key={i} style={styles.locationPill}>
                  <Text fontSize={11} color={meta.color}>
                    {tag}
                  </Text>
                </View>
              ))}
            </XStack>
          </>
        )}
      </YStack>
    </Animated.View>
  );
}

function MysteryContent({
  title,
  subtitle,
  contentOpacity,
  revealedChars,
}: {
  title: string;
  subtitle?: string;
  contentOpacity: Animated.Value;
  revealedChars: number;
}) {
  const meta = SCENE_TYPE_META.mystery;
  const visibleTitle = title.slice(0, revealedChars);
  const showCursor = revealedChars < title.length;

  return (
    <Animated.View style={[styles.centerContent, { opacity: contentOpacity }]}>
      <YStack alignItems="center" gap={10} paddingHorizontal={32}>
        <Search size={24} color={meta.color} />
        <Text
          fontSize={28}
          fontWeight="700"
          color="#E8E8ED"
          textAlign="center"
        >
          {visibleTitle}
          {showCursor && (
            <Text color={meta.color} fontWeight="400">
              |
            </Text>
          )}
        </Text>
        {revealedChars >= title.length && subtitle && (
          <Text fontSize={14} color="#9090A0" textAlign="center">
            {subtitle}
          </Text>
        )}
      </YStack>
    </Animated.View>
  );
}

function DangerContent({
  title,
  subtitle,
  contentOpacity,
  contentScale,
  borderPulse,
}: {
  title: string;
  subtitle?: string;
  contentOpacity: Animated.Value;
  contentScale: Animated.Value;
  borderPulse: Animated.Value;
}) {
  const meta = SCENE_TYPE_META.danger;
  return (
    <>
      {/* Pulsing border */}
      <Animated.View
        style={[
          styles.dangerBorder,
          {
            borderColor: meta.color,
            opacity: borderPulse,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: contentOpacity,
            transform: [{ scale: contentScale }],
          },
        ]}
      >
        <YStack alignItems="center" gap={12}>
          <Stack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="rgba(255,68,68,0.15)"
            alignItems="center"
            justifyContent="center"
          >
            <AlertTriangle size={40} color={meta.color} />
          </Stack>
          <Text
            fontSize={28}
            fontWeight="900"
            color={meta.color}
            textAlign="center"
            textTransform="uppercase"
          >
            {title}
          </Text>
          {subtitle && (
            <Text fontSize={14} color="#E8E8ED" textAlign="center">
              {subtitle}
            </Text>
          )}
        </YStack>
      </Animated.View>
    </>
  );
}

function FlashbackContent({
  title,
  subtitle,
  contentOpacity,
  grainOpacity,
}: {
  title: string;
  subtitle?: string;
  contentOpacity: Animated.Value;
  grainOpacity: Animated.Value;
}) {
  return (
    <>
      {/* Grain overlay */}
      <Animated.View style={[styles.grainOverlay, { opacity: grainOpacity }]} />
      {/* Vignette */}
      <View style={styles.vignetteOverlay} />
      <Animated.View style={[styles.centerContent, { opacity: contentOpacity }]}>
        <YStack alignItems="center" gap={8} paddingHorizontal={32}>
          <Text
            fontSize={28}
            fontWeight="700"
            color="#C8C0A8"
            fontStyle="italic"
            textAlign="center"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              fontSize={14}
              color="#8A8A7A"
              fontStyle="italic"
              textAlign="center"
            >
              {subtitle}
            </Text>
          )}
        </YStack>
      </Animated.View>
    </>
  );
}

function WeatherContent({
  title,
  subtitle,
  tags,
  contentOpacity,
}: {
  title: string;
  subtitle?: string;
  tags?: string[];
  contentOpacity: Animated.Value;
}) {
  const meta = SCENE_TYPE_META.weather;
  return (
    <Animated.View style={[styles.centerContent, { opacity: contentOpacity }]}>
      <YStack alignItems="center" gap={10} paddingHorizontal={32}>
        <CloudRain size={32} color={meta.color} />
        <Text
          fontSize={28}
          fontWeight="800"
          color="#E8E8ED"
          textAlign="center"
          textTransform="uppercase"
        >
          {title}
        </Text>
        {subtitle && (
          <Text fontSize={14} color="#9090A0" textAlign="center">
            {subtitle}
          </Text>
        )}
        {tags && tags.length > 0 && (
          <XStack gap={8} flexWrap="wrap" justifyContent="center">
            {tags.map((tag, i) => (
              <View key={i} style={[styles.locationPill, { borderColor: `${meta.color}40` }]}>
                <Text fontSize={11} color={meta.color}>
                  {tag}
                </Text>
              </View>
            ))}
          </XStack>
        )}
      </YStack>
    </Animated.View>
  );
}

// ─── Main Overlay ───────────────────────────────────────

function SceneCardOverlayInner() {
  const visible = useGameplayStore((s) => s.sceneCardVisible);
  const card = useGameplayStore((s) => s.sceneCard);
  const hideSceneCard = useGameplayStore((s) => s.hideSceneCard);
  const isGM = useGameplayStore((s) => s.isGM);

  const [canDismiss, setCanDismiss] = useState(true);
  const [revealedChars, setRevealedChars] = useState(0);

  // Animated values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.9)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const borderPulse = useRef(new Animated.Value(0.3)).current;
  const grainOpacity = useRef(new Animated.Value(0.03)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1.0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;

  const resetAnimations = useCallback(() => {
    overlayOpacity.setValue(0);
    contentOpacity.setValue(0);
    contentScale.setValue(0.9);
    flashOpacity.setValue(0);
    titleTranslateY.setValue(20);
    subtitleOpacity.setValue(0);
    borderPulse.setValue(0.3);
    grainOpacity.setValue(0.03);
    lineWidth.setValue(0);
    imageScale.setValue(1.0);
    contentTranslateY.setValue(30);
    setRevealedChars(0);
  }, [overlayOpacity, contentOpacity, contentScale, flashOpacity, titleTranslateY, subtitleOpacity, borderPulse, grainOpacity, lineWidth, imageScale, contentTranslateY]);

  // Dismiss handler
  const handleDismiss = useCallback(() => {
    if (!canDismiss) return;

    // Stop any playing sound
    if (card?.atmosphere.soundKey) {
      stopSound(card.atmosphere.soundKey);
    }

    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      resetAnimations();
      hideSceneCard();
    });
  }, [canDismiss, card, overlayOpacity, resetAnimations, hideSceneCard]);

  // Main animation effect
  useEffect(() => {
    if (!visible || !card) return;

    resetAnimations();
    const type = card.type;
    const meta = SCENE_TYPE_META[type];

    // ─── Phase integration ──────────────────
    if (type === "chapter") {
      usePhaseStore.getState().transitionTo("narration", card.title);
    }

    // ─── Haptics ────────────────────────────
    const hapticEvent = `scene-${type}` as const;
    triggerHaptic(hapticEvent);

    // Danger burst: 3x haptic
    if (type === "danger") {
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
    }

    // ─── Sound ──────────────────────────────
    if (card.atmosphere.soundKey) {
      const soundConfig = SCENE_SOUND_MAP[card.atmosphere.soundKey];
      if (soundConfig?.uri) {
        playSound(card.atmosphere.soundKey, soundConfig.uri, soundConfig.volume);
      }
    }

    // ─── Player cooldown ────────────────────
    if (!isGM) {
      setCanDismiss(false);
      const cooldown = setTimeout(() => setCanDismiss(true), 2000);
      return () => clearTimeout(cooldown);
    } else {
      setCanDismiss(true);
    }

    // ─── Type-specific animations ───────────
    const timers: ReturnType<typeof setTimeout>[] = [];

    switch (type) {
      case "cinematic": {
        // Fade in overlay
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();

        // Letterbox + content with delay
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(titleTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start();
        }, 400);

        // Ken Burns zoom
        Animated.timing(imageScale, {
          toValue: 1.05,
          duration: (card.timing.holdDuration + 1) * 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start();
        break;
      }

      case "chapter": {
        // Fade in bg
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        // Decorative lines grow
        const lineTimer = setTimeout(() => {
          Animated.timing(lineWidth, {
            toValue: 60,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }, 300);
        timers.push(lineTimer);

        // Title reveal
        const titleTimer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(titleTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 15,
              stiffness: 200,
            }),
          ]).start();
        }, 500);
        timers.push(titleTimer);

        // Subtitle fade
        const subTimer = setTimeout(() => {
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }, 900);
        timers.push(subTimer);
        break;
      }

      case "location": {
        // Slide up
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(contentTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 12,
            stiffness: 150,
          }),
        ]).start();
        break;
      }

      case "mystery": {
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();

        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        // Typewriter effect
        const typewriterInterval = setInterval(() => {
          setRevealedChars((prev) => {
            if (prev >= card.title.length) {
              clearInterval(typewriterInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 50);

        return () => clearInterval(typewriterInterval);
      }

      case "danger": {
        // Red flash first
        Animated.sequence([
          Animated.timing(flashOpacity, {
            toValue: 0.6,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(flashOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        // Overlay + content pop
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();

        Animated.parallel([
          Animated.spring(contentScale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 8,
            stiffness: 200,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        // Border pulse loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(borderPulse, {
              toValue: 0.8,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(borderPulse, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ).start();
        break;
      }

      case "flashback": {
        // Flicker sequence
        Animated.sequence([
          Animated.timing(overlayOpacity, { toValue: 0.8, duration: 60, useNativeDriver: true }),
          Animated.timing(overlayOpacity, { toValue: 0.2, duration: 60, useNativeDriver: true }),
          Animated.timing(overlayOpacity, { toValue: 0.9, duration: 60, useNativeDriver: true }),
          Animated.timing(overlayOpacity, { toValue: 0.3, duration: 60, useNativeDriver: true }),
          Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();

        const contentTimer = setTimeout(() => {
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        }, 400);
        timers.push(contentTimer);

        // Periodic grain flicker
        const grainInterval = setInterval(() => {
          Animated.sequence([
            Animated.timing(grainOpacity, {
              toValue: Math.random() * 0.04 + 0.02,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();
        }, 4000);

        return () => clearInterval(grainInterval);
      }

      case "weather": {
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        // Random lightning flashes
        const lightningInterval = setInterval(() => {
          if (Math.random() > 0.5) {
            Animated.sequence([
              Animated.timing(flashOpacity, {
                toValue: 0.3,
                duration: 60,
                useNativeDriver: true,
              }),
              Animated.timing(flashOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }, 3000);

        return () => clearInterval(lightningInterval);
      }
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [visible, card, isGM, overlayOpacity, contentOpacity, contentScale, flashOpacity, titleTranslateY, subtitleOpacity, borderPulse, grainOpacity, lineWidth, imageScale, contentTranslateY, resetAnimations]);

  if (!visible || !card) return null;

  const type = card.type;
  const meta = SCENE_TYPE_META[type];

  return (
    <>
      {/* Flash layer (danger, weather lightning) */}
      <Animated.View
        style={[
          styles.flashLayer,
          {
            opacity: flashOpacity,
            backgroundColor: type === "danger" ? "#FF4444" : "#FFFFFF",
          },
        ]}
      />

      {/* Main overlay */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity },
          getOverlayBg(type),
        ]}
      >
        <Pressable style={styles.pressable} onPress={handleDismiss}>
          {/* Particles */}
          {card.atmosphere.particles && (
            <ParticleLayer effect={card.atmosphere.particles} />
          )}

          {/* Content by type */}
          {type === "cinematic" && (
            <CinematicContent
              title={card.title}
              subtitle={card.subtitle}
              contentOpacity={contentOpacity}
              titleTranslateY={titleTranslateY}
              imageScale={imageScale}
            />
          )}
          {type === "chapter" && (
            <ChapterContent
              title={card.title}
              subtitle={card.subtitle}
              chapter={card.chapter}
              contentOpacity={contentOpacity}
              lineWidth={lineWidth}
              titleTranslateY={titleTranslateY}
              subtitleOpacity={subtitleOpacity}
            />
          )}
          {type === "location" && (
            <LocationContent
              title={card.title}
              subtitle={card.subtitle}
              tags={card.tags}
              contentOpacity={contentOpacity}
              contentTranslateY={contentTranslateY}
            />
          )}
          {type === "mystery" && (
            <MysteryContent
              title={card.title}
              subtitle={card.subtitle}
              contentOpacity={contentOpacity}
              revealedChars={revealedChars}
            />
          )}
          {type === "danger" && (
            <DangerContent
              title={card.title}
              subtitle={card.subtitle}
              contentOpacity={contentOpacity}
              contentScale={contentScale}
              borderPulse={borderPulse}
            />
          )}
          {type === "flashback" && (
            <FlashbackContent
              title={card.title}
              subtitle={card.subtitle}
              contentOpacity={contentOpacity}
              grainOpacity={grainOpacity}
            />
          )}
          {type === "weather" && (
            <WeatherContent
              title={card.title}
              subtitle={card.subtitle}
              tags={card.tags}
              contentOpacity={contentOpacity}
            />
          )}
        </Pressable>

        {/* Reactions (player only, after cooldown) */}
        {!isGM && canDismiss && <ReactionBar />}

        {/* GM controls */}
        {isGM && <GMControls onDismiss={handleDismiss} />}

        {/* Progress bar */}
        {card.timing.autoDismiss && (
          <ProgressBar
            duration={card.timing.holdDuration}
            color={meta.color}
            onComplete={handleDismiss}
          />
        )}
      </Animated.View>
    </>
  );
}

function getOverlayBg(type: SceneType) {
  switch (type) {
    case "cinematic":
      return { backgroundColor: "rgba(0, 0, 0, 0.88)" };
    case "chapter":
      return { backgroundColor: "#0A0A0F" };
    case "location":
      return { backgroundColor: "rgba(5, 15, 10, 0.88)" };
    case "mystery":
      return { backgroundColor: "rgba(8, 8, 20, 0.92)" };
    case "danger":
      return { backgroundColor: "rgba(26, 0, 0, 0.92)" };
    case "flashback":
      return { backgroundColor: "rgba(15, 15, 12, 0.92)" };
    case "weather":
      return { backgroundColor: "rgba(8, 10, 20, 0.88)" };
    default:
      return { backgroundColor: "rgba(0, 0, 0, 0.85)" };
  }
}

export const SceneCardOverlay = memo(SceneCardOverlayInner);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  pressable: {
    flex: 1,
  },
  flashLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 210,
    pointerEvents: "none",
  },
  letterbox: {
    height: 72,
    backgroundColor: "#000",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  textShadow: {
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  divider: {
    width: "60%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 4,
  },
  locationPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,184,148,0.3)",
    backgroundColor: "rgba(0,184,148,0.08)",
  },
  dangerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    zIndex: 201,
    pointerEvents: "none",
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(139,105,20,0.04)",
    zIndex: 1,
    pointerEvents: "none",
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 30,
    borderColor: "rgba(0,0,0,0.6)",
    borderRadius: 0,
    zIndex: 1,
    pointerEvents: "none",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    zIndex: 10,
  },
  progressFill: {
    height: "100%",
  },
});
