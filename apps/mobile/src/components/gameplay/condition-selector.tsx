import { memo, useState } from "react";
import { CirclePlus, X } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { DND5E_CONDITIONS, CONDITIONS_MAP } from "../../lib/data/dnd5e/conditions";

// ─── Condition Badges ────────────────────────────────────

interface ConditionBadgesProps {
  conditions: string[];
  onRemove?: (conditionId: string) => void;
  editable: boolean;
}

function ConditionBadgesInner({ conditions, onRemove, editable }: ConditionBadgesProps) {
  if (conditions.length === 0) return null;

  return (
    <XStack flexWrap="wrap" gap={6}>
      {conditions.map((condId) => {
        const cond = CONDITIONS_MAP[condId];
        if (!cond) return null;
        const Icon = cond.icon;
        return (
          <XStack
            key={condId}
            alignItems="center"
            gap={4}
            borderRadius={8}
            backgroundColor="#1A1A24"
            borderWidth={1}
            borderColor="#2A2A35"
            paddingHorizontal={8}
            paddingVertical={4}
          >
            <Icon size={12} color="#FDCB6E" />
            <Text fontSize={11} fontWeight="500" color="#E8E8ED">
              {cond.name}
            </Text>
            {editable && onRemove && (
              <Stack
                onPress={() => onRemove(condId)}
                pressStyle={{ opacity: 0.6 }}
                padding={2}
              >
                <X size={10} color="#5A5A6E" />
              </Stack>
            )}
          </XStack>
        );
      })}
    </XStack>
  );
}

export const ConditionBadges = memo(ConditionBadgesInner);

// ─── Condition Selector ──────────────────────────────────

interface ConditionSelectorProps {
  currentConditions: string[];
  onToggle: (conditionId: string) => void;
}

function ConditionSelectorInner({ currentConditions, onToggle }: ConditionSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <YStack gap={8}>
      <Stack
        alignSelf="flex-start"
        flexDirection="row"
        alignItems="center"
        gap={4}
        paddingHorizontal={10}
        paddingVertical={6}
        borderRadius={8}
        backgroundColor="#1A1A24"
        borderWidth={1}
        borderColor="#2A2A35"
        pressStyle={{ opacity: 0.7 }}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <CirclePlus size={14} color="#6C5CE7" />
        <Text fontSize={12} fontWeight="500" color="#6C5CE7">
          {isExpanded ? "Fechar" : "Condição"}
        </Text>
      </Stack>

      {isExpanded && (
        <XStack flexWrap="wrap" gap={6}>
          {DND5E_CONDITIONS.map((cond) => {
            const isActive = currentConditions.includes(cond.id);
            const Icon = cond.icon;
            return (
              <Stack
                key={cond.id}
                flexDirection="row"
                alignItems="center"
                gap={4}
                borderRadius={8}
                backgroundColor={isActive ? "#2D2557" : "#16161C"}
                borderWidth={1}
                borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
                paddingHorizontal={10}
                paddingVertical={6}
                pressStyle={{ opacity: 0.7 }}
                onPress={() => onToggle(cond.id)}
              >
                <Icon size={12} color={isActive ? "#6C5CE7" : "#5A5A6E"} />
                <Text
                  fontSize={11}
                  fontWeight="500"
                  color={isActive ? "#E8E8ED" : "#9090A0"}
                >
                  {cond.name}
                </Text>
              </Stack>
            );
          })}
        </XStack>
      )}
    </YStack>
  );
}

export const ConditionSelector = memo(ConditionSelectorInner);
