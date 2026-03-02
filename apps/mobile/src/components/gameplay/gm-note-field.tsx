import { memo, useState, useEffect, useRef, useCallback } from "react";
import { TextInput } from "react-native";
import { Lock } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

interface GMNoteFieldProps {
  characterId: string;
}

function GMNoteFieldInner({ characterId }: GMNoteFieldProps) {
  const gmNotes = useGameplayStore((s) => s.gmNotes);
  const updateGMNote = useGameplayStore((s) => s.updateGMNote);
  const [text, setText] = useState(gmNotes[characterId] ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef(text);
  textRef.current = text;

  // Sync if characterId changes
  useEffect(() => {
    setText(gmNotes[characterId] ?? "");
  }, [characterId, gmNotes]);

  // Debounced save
  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updateGMNote(characterId, value);
      }, 2000);
    },
    [characterId, updateGMNote],
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        updateGMNote(characterId, textRef.current);
      }
    };
  }, [characterId, updateGMNote]);

  return (
    <YStack gap={6}>
      <XStack alignItems="center" gap={6}>
        <Lock size={12} color="#5A5A6E" />
        <Text fontSize={12} fontWeight="600" color="#5A5A6E">
          Notas do Mestre (só você vê)
        </Text>
      </XStack>
      <Stack
        borderRadius={10}
        backgroundColor="#12121A"
        borderWidth={1}
        borderColor="#2A2A35"
        paddingHorizontal={14}
        paddingVertical={12}
      >
        <TextInput
          value={text}
          onChangeText={handleChange}
          placeholder="Ex: Está mentindo sobre sua origem..."
          placeholderTextColor="#5A5A6E"
          multiline
          style={{
            color: "#E8E8ED",
            fontSize: 13,
            padding: 0,
            minHeight: 60,
            textAlignVertical: "top",
          }}
          maxLength={500}
        />
      </Stack>
    </YStack>
  );
}

export const GMNoteField = memo(GMNoteFieldInner);
