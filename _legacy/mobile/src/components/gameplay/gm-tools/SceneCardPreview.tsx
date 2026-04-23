import { memo } from "react";
import { StyleSheet, View } from "react-native";
import {
  MapPin,
  AlertTriangle,
  Search,
  CloudRain,
} from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";
import { SCENE_TYPE_META } from "../../../constants/sceneConfig";
import type { SceneCard, SceneType } from "../../../types/scene";

interface SceneCardPreviewProps {
  card: Partial<SceneCard> & { type: SceneType };
}

function SceneCardPreviewInner({ card }: SceneCardPreviewProps) {
  const hasContent = !!card.title?.trim();
  const meta = SCENE_TYPE_META[card.type];

  if (!hasContent) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text fontSize={12} color="#5A5A6E" textAlign="center">
            Preencha os campos para ver o preview
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.previewBox, getBackgroundStyle(card.type)]}>
        {/* Type-specific content */}
        {card.type === "cinematic" && (
          <>
            <View style={styles.letterbox} />
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingHorizontal={16}
              gap={4}
            >
              <Text
                fontSize={16}
                fontWeight="800"
                color="#E8E8ED"
                textAlign="center"
                numberOfLines={2}
              >
                {card.title}
              </Text>
              {card.subtitle && (
                <Text
                  fontSize={10}
                  color="#9090A0"
                  fontStyle="italic"
                  textAlign="center"
                  numberOfLines={2}
                >
                  {card.subtitle}
                </Text>
              )}
            </YStack>
            <View style={styles.letterbox} />
          </>
        )}

        {card.type === "chapter" && (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal={16}
            gap={4}
          >
            <View style={styles.goldLine} />
            {card.chapter && (
              <Text
                fontSize={8}
                fontWeight="600"
                color="#5A5A6E"
                letterSpacing={2}
                textTransform="uppercase"
              >
                {card.chapter}
              </Text>
            )}
            <Text
              fontSize={16}
              fontWeight="800"
              color="#E8E8ED"
              textAlign="center"
              numberOfLines={2}
            >
              {card.title}
            </Text>
            <View style={styles.goldLine} />
            {card.subtitle && (
              <Text
                fontSize={9}
                color="#8A8A9A"
                fontStyle="italic"
                textAlign="center"
                numberOfLines={2}
              >
                {card.subtitle}
              </Text>
            )}
          </YStack>
        )}

        {card.type === "location" && (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal={16}
            gap={6}
          >
            <MapPin size={16} color={meta.color} />
            <Text
              fontSize={14}
              fontWeight="700"
              color="#E8E8ED"
              textAlign="center"
              numberOfLines={2}
            >
              {card.title}
            </Text>
            {card.subtitle && (
              <Text
                fontSize={9}
                color="#9090A0"
                textAlign="center"
                numberOfLines={2}
              >
                {card.subtitle}
              </Text>
            )}
            {card.tags && card.tags.length > 0 && (
              <XStack gap={4} flexWrap="wrap" justifyContent="center">
                {card.tags.slice(0, 3).map((tag, i) => (
                  <View key={i} style={styles.tagPill}>
                    <Text fontSize={7} color={meta.color}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </XStack>
            )}
          </YStack>
        )}

        {card.type === "mystery" && (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal={16}
            gap={6}
          >
            <Search size={16} color={meta.color} />
            <Text
              fontSize={14}
              fontWeight="700"
              color="#E8E8ED"
              textAlign="center"
              numberOfLines={2}
              style={{ opacity: 0.6 }}
            >
              {card.title}
            </Text>
            {card.subtitle && (
              <Text
                fontSize={9}
                color="#9090A0"
                textAlign="center"
                numberOfLines={2}
                style={{ opacity: 0.4 }}
              >
                {card.subtitle}
              </Text>
            )}
            <View style={[styles.progressBar, { backgroundColor: `${meta.color}40` }]}>
              <View style={[styles.progressFill, { backgroundColor: meta.color, width: "60%" }]} />
            </View>
          </YStack>
        )}

        {card.type === "danger" && (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal={16}
            gap={6}
          >
            <AlertTriangle size={24} color={meta.color} />
            <Text
              fontSize={16}
              fontWeight="900"
              color={meta.color}
              textAlign="center"
              textTransform="uppercase"
              numberOfLines={2}
            >
              {card.title}
            </Text>
            {card.subtitle && (
              <Text
                fontSize={9}
                color="#E8E8ED"
                textAlign="center"
                numberOfLines={2}
              >
                {card.subtitle}
              </Text>
            )}
          </YStack>
        )}

        {card.type === "flashback" && (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal={16}
            gap={4}
          >
            {/* Grain dots overlay */}
            <View style={styles.grainOverlay} />
            <Text
              fontSize={14}
              fontWeight="700"
              color="#C8C0A8"
              fontStyle="italic"
              textAlign="center"
              numberOfLines={2}
            >
              {card.title}
            </Text>
            {card.subtitle && (
              <Text
                fontSize={9}
                color="#8A8A7A"
                fontStyle="italic"
                textAlign="center"
                numberOfLines={2}
              >
                {card.subtitle}
              </Text>
            )}
          </YStack>
        )}

        {card.type === "weather" && (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal={16}
            gap={6}
          >
            <CloudRain size={20} color={meta.color} />
            <Text
              fontSize={14}
              fontWeight="800"
              color="#E8E8ED"
              textAlign="center"
              textTransform="uppercase"
              numberOfLines={2}
            >
              {card.title}
            </Text>
            {card.subtitle && (
              <Text
                fontSize={9}
                color="#9090A0"
                textAlign="center"
                numberOfLines={2}
              >
                {card.subtitle}
              </Text>
            )}
            {card.tags && card.tags.length > 0 && (
              <XStack gap={4} flexWrap="wrap" justifyContent="center">
                {card.tags.slice(0, 3).map((tag, i) => (
                  <View key={i} style={[styles.tagPill, { borderColor: `${meta.color}40` }]}>
                    <Text fontSize={7} color={meta.color}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </XStack>
            )}
          </YStack>
        )}

        {/* Type accent border */}
        {card.type === "danger" && (
          <View
            style={[
              styles.accentBorder,
              { borderColor: `${meta.color}50` },
            ]}
          />
        )}
      </View>
    </View>
  );
}

function getBackgroundStyle(type: SceneType) {
  switch (type) {
    case "cinematic":
      return { backgroundColor: "rgba(0, 0, 0, 0.9)" };
    case "chapter":
      return { backgroundColor: "#0A0A0F" };
    case "location":
      return { backgroundColor: "rgba(0, 20, 15, 0.85)" };
    case "mystery":
      return { backgroundColor: "rgba(10, 10, 30, 0.9)" };
    case "danger":
      return { backgroundColor: "rgba(30, 0, 0, 0.9)" };
    case "flashback":
      return { backgroundColor: "rgba(20, 20, 18, 0.9)" };
    case "weather":
      return { backgroundColor: "rgba(10, 15, 30, 0.9)" };
    default:
      return { backgroundColor: "rgba(0, 0, 0, 0.85)" };
  }
}

export const SceneCardPreview = memo(SceneCardPreviewInner);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  placeholder: {
    height: 160,
    borderRadius: 12,
    backgroundColor: "#0F0F12",
    borderWidth: 1,
    borderColor: "#2A2A35",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  previewBox: {
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
  },
  letterbox: {
    height: 18,
    backgroundColor: "#000",
  },
  goldLine: {
    width: 50,
    height: 1,
    backgroundColor: "#C9A84C",
    opacity: 0.6,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,184,148,0.3)",
    backgroundColor: "rgba(0,184,148,0.08)",
  },
  progressBar: {
    width: "60%",
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(139,105,20,0.06)",
  },
  accentBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: 12,
  },
});
