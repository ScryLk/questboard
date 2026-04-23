import { Text, XStack, Stack } from "tamagui";
import type { TextPostData } from "@questboard/types";

interface TextPostCardProps {
  data: TextPostData;
}

export function TextPostCard({ data }: TextPostCardProps) {
  return (
    <>
      <Text fontSize={15} color="$textPrimary" lineHeight={22}>
        {data.body}
      </Text>
      {data.tags && data.tags.length > 0 && (
        <XStack flexWrap="wrap" gap={6} marginTop={8}>
          {data.tags.map((tag) => (
            <Stack
              key={tag}
              paddingHorizontal={8}
              paddingVertical={3}
              borderRadius={8}
              backgroundColor="rgba(108, 92, 231, 0.12)"
            >
              <Text fontSize={12} color="$accent">
                #{tag}
              </Text>
            </Stack>
          ))}
        </XStack>
      )}
    </>
  );
}
