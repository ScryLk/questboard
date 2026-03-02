import { useState } from "react";
import { TextInput } from "react-native";
import { X } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface TagInputProps {
  tags: string[];
  maxTags?: number;
  placeholder?: string;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

export function TagInput({
  tags,
  maxTags = 10,
  placeholder = "Adicionar tag...",
  onAdd,
  onRemove,
}: TagInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit() {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.length === 0) return;
    if (tags.includes(trimmed)) return;
    if (tags.length >= maxTags) return;
    onAdd(trimmed);
    setInput("");
  }

  return (
    <YStack gap={8}>
      {tags.length > 0 && (
        <XStack flexWrap="wrap" gap={8}>
          {tags.map((tag) => (
            <XStack
              key={tag}
              borderRadius={9999}
              backgroundColor="$accentMuted"
              paddingHorizontal={10}
              paddingVertical={4}
              alignItems="center"
              gap={6}
            >
              <Text fontSize={12} fontWeight="600" color="$accent">
                {tag}
              </Text>
              <Stack
                onPress={() => onRemove(tag)}
                hitSlop={4}
                pressStyle={{ opacity: 0.6 }}
              >
                <X size={12} color="#6C5CE7" />
              </Stack>
            </XStack>
          ))}
        </XStack>
      )}

      {tags.length < maxTags && (
        <Stack
          borderRadius={12}
          borderWidth={1}
          borderColor="$border"
          backgroundColor="$bgCard"
          paddingHorizontal={14}
          paddingVertical={12}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            placeholderTextColor="#5A5A6E"
            returnKeyType="done"
            style={{
              color: "#E8E8ED",
              fontSize: 14,
              padding: 0,
            }}
            maxLength={30}
          />
        </Stack>
      )}

      <Text fontSize={11} color="$textMuted">
        {tags.length}/{maxTags} tags
      </Text>
    </YStack>
  );
}
