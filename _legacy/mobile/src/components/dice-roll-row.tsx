import { useRef, useState } from "react";
import { Animated } from "react-native";
import { Dices } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import type { AbilityKey, DiceRollResult } from "../lib/data/dnd5e/types";
import { ABILITY_SHORT_LABELS, formatModifier, getModifier } from "../lib/data/dnd5e/abilities";

interface DiceRollRowProps {
  ability: AbilityKey;
  result: DiceRollResult | null;
  racialBonus: number;
  onRoll: () => void;
}

export function DiceRollRow({
  ability,
  result,
  racialBonus,
  onRoll,
}: DiceRollRowProps) {
  const [rolling, setRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState([0, 0, 0, 0]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const finalValue = result ? result.total + racialBonus : null;

  function handleRoll() {
    if (result || rolling) return;
    setRolling(true);

    let cycles = 0;
    const interval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      cycles++;
      if (cycles >= 6) {
        clearInterval(interval);
        setRolling(false);
        onRoll();

        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 50);
  }

  const diceValues = result ? [...result.dice] : rolling ? displayDice : null;

  return (
    <XStack
      alignItems="center"
      gap={8}
      paddingVertical={8}
      paddingHorizontal={4}
    >
      <Text
        fontSize={13}
        fontWeight="600"
        color="$textPrimary"
        width={36}
      >
        {ABILITY_SHORT_LABELS[ability]}
      </Text>

      {diceValues ? (
        <XStack flex={1} alignItems="center" gap={4}>
          {diceValues.map((value, i) => (
            <Stack
              key={i}
              height={28}
              width={28}
              borderRadius={6}
              backgroundColor={
                result && i === result.dropped ? "$border" : "$bgCard"
              }
              borderWidth={1}
              borderColor={
                result && i === result.dropped ? "$danger" : "$border"
              }
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize={13}
                fontWeight="600"
                color={
                  result && i === result.dropped
                    ? "$danger"
                    : "$textPrimary"
                }
                textDecorationLine={
                  result && i === result.dropped ? "line-through" : "none"
                }
              >
                {value}
              </Text>
            </Stack>
          ))}

          {result && (
            <XStack alignItems="center" gap={4} marginLeft={4}>
              <Text fontSize={11} color="$textMuted">
                =
              </Text>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Text fontSize={15} fontWeight="700" color="$textPrimary">
                  {result.total}
                </Text>
              </Animated.View>
              {racialBonus > 0 && (
                <>
                  <Text fontSize={11} color="$accent">
                    +{racialBonus}
                  </Text>
                  <Text fontSize={11} color="$textMuted">
                    =
                  </Text>
                  <Text fontSize={15} fontWeight="700" color="$accent">
                    {finalValue}
                  </Text>
                </>
              )}
            </XStack>
          )}
        </XStack>
      ) : (
        <Stack
          flex={1}
          height={36}
          borderRadius={10}
          backgroundColor="$accentMuted"
          alignItems="center"
          justifyContent="center"
          onPress={handleRoll}
          pressStyle={{ opacity: 0.7, scale: 0.98 }}
        >
          <XStack alignItems="center" gap={6}>
            <Dices size={14} color="#6C5CE7" />
            <Text fontSize={12} fontWeight="600" color="$accent">
              Rolar
            </Text>
          </XStack>
        </Stack>
      )}

      {finalValue !== null && (
        <Text fontSize={11} color="$textMuted" width={30} textAlign="right">
          ({formatModifier(getModifier(finalValue))})
        </Text>
      )}
    </XStack>
  );
}
