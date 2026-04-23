import { memo } from "react";
import { StyleSheet } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { GameAbility, ActionCostType } from "../../../types/ability";
import { getAbilityIcon } from "../../../engine/ability-icon-map";

// ─── Action Cost Colors ───────────────────────────────────

const ACTION_COST_CONFIG: Record<
  ActionCostType,
  { label: string; color: string; bg: string }
> = {
  action: { label: "Ação", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  bonus_action: { label: "Bônus", color: "#FDCB6E", bg: "rgba(253,203,110,0.12)" },
  reaction: { label: "Reação", color: "#4FC3F7", bg: "rgba(79,195,247,0.12)" },
  free: { label: "Livre", color: "#9090A0", bg: "rgba(144,144,160,0.12)" },
  movement: { label: "Mov.", color: "#6C5CE7", bg: "rgba(108,92,231,0.12)" },
  none: { label: "", color: "#9090A0", bg: "transparent" },
};

// ─── Category Labels ──────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  weapon: "Arma",
  spell: "Magia",
  feature: "Feature",
  item: "Item",
  skill_check: "Perícia",
};

// ─── Action Cost Pill ─────────────────────────────────────

function ActionCostPill({ cost }: { cost: ActionCostType }) {
  const config = ACTION_COST_CONFIG[cost];
  if (!config.label) return null;

  return (
    <Stack
      backgroundColor={config.bg}
      borderRadius={4}
      paddingHorizontal={6}
      paddingVertical={2}
    >
      <Text fontSize={8} fontWeight="700" color={config.color} textTransform="uppercase">
        {config.label}
      </Text>
    </Stack>
  );
}

// ─── Resource Cost Label ──────────────────────────────────

function ResourceLabel({ ability }: { ability: GameAbility }) {
  if (ability.resourceCosts.length === 0) return null;

  const cost = ability.resourceCosts[0];
  let label = "";

  switch (cost.type) {
    case "spell_slot":
      label = `Slot ${cost.level}`;
      break;
    case "feature_use":
      label = "Uso";
      break;
    case "item_charge":
      label = "×1";
      break;
    default:
      return null;
  }

  return (
    <Text fontSize={8} color="#5A5A6E">
      {label}
    </Text>
  );
}

// ─── Compact Card (for lists) ─────────────────────────────

function AbilityCardCompactInner({
  ability,
  onPress,
}: {
  ability: GameAbility;
  onPress: () => void;
}) {
  const Icon = getAbilityIcon(ability.iconKey);
  const config = ACTION_COST_CONFIG[ability.actionCost];

  return (
    <Stack
      width="48%"
      borderWidth={1}
      borderColor={
        ability.available
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.04)"
      }
      backgroundColor={
        ability.available
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.01)"
      }
      borderRadius={12}
      padding={12}
      gap={4}
      opacity={ability.available ? 1 : 0.4}
      pressStyle={
        ability.available
          ? { opacity: 0.7, backgroundColor: "rgba(255,255,255,0.06)" }
          : undefined
      }
      onPress={ability.available ? onPress : undefined}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Icon size={16} color={config.color} />
        <ActionCostPill cost={ability.actionCost} />
      </XStack>
      <Text
        fontSize={12}
        fontWeight="600"
        color={ability.available ? "#E8E8ED" : "#3A3A4E"}
        numberOfLines={1}
      >
        {ability.name}
      </Text>
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={9} color="#5A5A6E">
          {CATEGORY_LABELS[ability.category] ?? ability.category}
        </Text>
        <ResourceLabel ability={ability} />
      </XStack>
    </Stack>
  );
}

export const AbilityCardCompact = memo(AbilityCardCompactInner);

// ─── Tag Pill ─────────────────────────────────────────────

function TagPill({ tag }: { tag: string }) {
  return (
    <Stack
      backgroundColor="rgba(108,92,231,0.12)"
      borderRadius={4}
      paddingHorizontal={6}
      paddingVertical={2}
    >
      <Text fontSize={8} fontWeight="600" color="#6C5CE7" textTransform="uppercase">
        {tag}
      </Text>
    </Stack>
  );
}

// ─── Full Card (for detail sheet) ─────────────────────────

function AbilityCardFullInner({
  ability,
  onUse,
}: {
  ability: GameAbility;
  onUse?: () => void;
}) {
  const Icon = getAbilityIcon(ability.iconKey);
  const config = ACTION_COST_CONFIG[ability.actionCost];

  return (
    <YStack gap={12}>
      {/* Header */}
      <XStack alignItems="center" gap={10}>
        <Stack
          width={40}
          height={40}
          borderRadius={10}
          backgroundColor={config.bg}
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={20} color={config.color} />
        </Stack>
        <YStack flex={1}>
          <Text fontSize={16} fontWeight="700" color="#E8E8ED">
            {ability.name}
          </Text>
          <Text fontSize={11} color="#5A5A6E">
            {ability.source}
          </Text>
        </YStack>
        <ActionCostPill cost={ability.actionCost} />
      </XStack>

      {/* Tags */}
      {ability.tags.length > 0 && (
        <XStack flexWrap="wrap" gap={4}>
          {ability.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </XStack>
      )}

      {/* Description */}
      <Text fontSize={13} color="#9090A0" lineHeight={20}>
        {ability.description}
      </Text>

      {/* Rolls */}
      {ability.rolls.length > 0 && (
        <YStack
          gap={6}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.06)"
          borderRadius={8}
          padding={10}
          backgroundColor="rgba(255,255,255,0.02)"
        >
          <Text fontSize={9} fontWeight="700" color="#5A5A6E" textTransform="uppercase" letterSpacing={1}>
            Rolagens
          </Text>
          {ability.rolls.map((roll, i) => (
            <XStack key={i} alignItems="center" justifyContent="space-between">
              <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                {roll.formula}
              </Text>
              <Text fontSize={11} color="#9090A0">
                {roll.label}
                {roll.damageType ? ` (${roll.damageType})` : ""}
              </Text>
            </XStack>
          ))}
        </YStack>
      )}

      {/* Range + Target */}
      <XStack gap={16}>
        <YStack>
          <Text fontSize={9} fontWeight="700" color="#5A5A6E" textTransform="uppercase">
            Alcance
          </Text>
          <Text fontSize={12} color="#E8E8ED">
            {ability.range}
          </Text>
        </YStack>
        <YStack>
          <Text fontSize={9} fontWeight="700" color="#5A5A6E" textTransform="uppercase">
            Alvo
          </Text>
          <Text fontSize={12} color="#E8E8ED">
            {ability.targetType === "self"
              ? "Próprio"
              : ability.targetType === "single"
                ? "Único"
                : ability.targetType === "area"
                  ? "Área"
                  : ability.targetType === "multi"
                    ? "Múltiplos"
                    : "—"}
          </Text>
        </YStack>
        {ability.spellLevel !== undefined && (
          <YStack>
            <Text fontSize={9} fontWeight="700" color="#5A5A6E" textTransform="uppercase">
              Nível
            </Text>
            <Text fontSize={12} color="#E8E8ED">
              {ability.spellLevel === 0 ? "Truque" : ability.spellLevel}
            </Text>
          </YStack>
        )}
      </XStack>

      {/* Resource costs */}
      {ability.resourceCosts.length > 0 && (
        <XStack gap={8}>
          {ability.resourceCosts.map((cost, i) => (
            <Stack
              key={i}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.06)"
              borderRadius={6}
              paddingHorizontal={8}
              paddingVertical={4}
            >
              <Text fontSize={10} color="#9090A0">
                {cost.type === "spell_slot"
                  ? `Slot Nível ${cost.level}`
                  : cost.type === "feature_use"
                    ? "1 Uso"
                    : cost.type === "item_charge"
                      ? "1 Item"
                      : cost.type}
              </Text>
            </Stack>
          ))}
        </XStack>
      )}

      {/* Unavailable reason */}
      {!ability.available && ability.unavailableReason && (
        <Text fontSize={11} color="#FF6B6B" fontStyle="italic">
          {ability.unavailableReason}
        </Text>
      )}

      {/* Use button */}
      {onUse && (
        <Stack
          backgroundColor={ability.available ? "#6C5CE7" : "rgba(255,255,255,0.05)"}
          borderRadius={12}
          paddingVertical={14}
          alignItems="center"
          opacity={ability.available ? 1 : 0.4}
          pressStyle={ability.available ? { opacity: 0.8 } : undefined}
          onPress={ability.available ? onUse : undefined}
        >
          <Text fontSize={14} fontWeight="700" color={ability.available ? "white" : "#5A5A6E"}>
            {ability.available ? "Usar Habilidade" : "Indisponível"}
          </Text>
        </Stack>
      )}
    </YStack>
  );
}

export const AbilityCardFull = memo(AbilityCardFullInner);
