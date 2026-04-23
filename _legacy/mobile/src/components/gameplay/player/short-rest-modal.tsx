import { memo, useState } from "react";
import { Heart } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../../lib/gameplay-store";
import { MOCK_CHARACTER_SHEET } from "../../../lib/gameplay-mock-data";

interface ShortRestModalProps {
  onClose: () => void;
}

function ShortRestModalInner({ onClose }: ShortRestModalProps) {
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const tokens = useGameplayStore((s) => s.tokens);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const addMessage = useGameplayStore((s) => s.addMessage);

  const sheet = MOCK_CHARACTER_SHEET;
  const token = myTokenId ? tokens[myTokenId] : null;
  const hpCurrent = token?.hp?.current ?? sheet.hp.current;
  const hpMax = token?.hp?.max ?? sheet.hp.max;

  const [hitDiceRemaining, setHitDiceRemaining] = useState(sheet.hitDice?.current ?? 0);
  const [currentHp, setCurrentHp] = useState(hpCurrent);
  const hitDiceMax = sheet.hitDice?.max ?? 0;
  const hitDie = sheet.hitDice?.die ?? "d6";
  const conMod = sheet.abilities.con?.modifier ?? 0;

  const handleSpendHitDice = () => {
    if (hitDiceRemaining <= 0) return;

    // Roll hit die + CON mod
    const dieSides = parseInt(hitDie.replace("d", ""), 10) || 6;
    const roll = Math.floor(Math.random() * dieSides) + 1;
    const healing = Math.max(1, roll + conMod);

    const newHp = Math.min(hpMax, currentHp + healing);
    setCurrentHp(newHp);
    setHitDiceRemaining((prev) => prev - 1);

    if (myTokenId) {
      updateTokenHp(myTokenId, healing);
    }

    addMessage({
      id: `msg-${Date.now()}`,
      channel: "GENERAL",
      type: "dice_roll",
      content: "Descanso Curto — Hit Dice",
      senderName: sheet.name.split(",")[0],
      senderIcon: token?.icon ?? "sword",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      diceResult: {
        formula: `1${hitDie}+${conMod}`,
        rolls: [roll],
        total: healing,
        label: `Hit Dice (${hitDie}+${conMod})`,
      },
    });
  };

  return (
    <YStack
      backgroundColor="rgba(255,255,255,0.03)"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.08)"
      borderRadius={16}
      padding={16}
      gap={12}
    >
      <Text fontSize={14} fontWeight="700" color="#E8E8ED">
        Descanso Curto (1 hora)
      </Text>

      <Text fontSize={12} color="#9090A0">
        Recupere HP gastando Hit Dice.
      </Text>

      {/* Hit Dice info */}
      <XStack alignItems="center" gap={8}>
        <Text fontSize={12} color="#5A5A6E">
          Hit Dice disponíveis:
        </Text>
        <XStack gap={4}>
          {Array.from({ length: hitDiceMax }).map((_, i) => (
            <Stack
              key={i}
              width={10}
              height={10}
              borderRadius={5}
              backgroundColor={i < hitDiceRemaining ? "#6C5CE7" : "rgba(255,255,255,0.08)"}
              borderWidth={1}
              borderColor={i < hitDiceRemaining ? "rgba(108,92,231,0.5)" : "rgba(255,255,255,0.05)"}
            />
          ))}
        </XStack>
        <Text fontSize={11} color="#5A5A6E">
          ({hitDie})
        </Text>
      </XStack>

      {/* Current HP */}
      <XStack alignItems="center" gap={6}>
        <Heart size={14} color="#FF6B6B" fill="#FF6B6B" />
        <Text fontSize={14} fontWeight="700" color="#FF6B6B">
          {currentHp}/{hpMax}
        </Text>
      </XStack>

      {/* Buttons */}
      <XStack gap={8}>
        <Stack
          flex={1}
          backgroundColor={hitDiceRemaining > 0 && currentHp < hpMax ? "#6C5CE7" : "rgba(108,92,231,0.3)"}
          borderRadius={10}
          paddingVertical={12}
          alignItems="center"
          opacity={hitDiceRemaining > 0 && currentHp < hpMax ? 1 : 0.5}
          pressStyle={hitDiceRemaining > 0 && currentHp < hpMax ? { opacity: 0.8 } : undefined}
          onPress={hitDiceRemaining > 0 && currentHp < hpMax ? handleSpendHitDice : undefined}
        >
          <Text fontSize={12} fontWeight="700" color="white">
            Gastar 1 Hit Dice
          </Text>
        </Stack>

        <Stack
          flex={1}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.08)"
          borderRadius={10}
          paddingVertical={12}
          alignItems="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
        >
          <Text fontSize={12} color="#5A5A6E">
            Concluir Descanso
          </Text>
        </Stack>
      </XStack>
    </YStack>
  );
}

export const ShortRestModal = memo(ShortRestModalInner);
