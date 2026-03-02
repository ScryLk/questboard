import { memo, useCallback, useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Stack, Text, XStack } from "tamagui";

const HP_DELTAS = [-10, -5, -1, 1, 5, 10];

interface HPBarCompactProps {
  current: number;
  max: number;
  editable: boolean;
  onDelta: (delta: number) => void;
}

function HPBarCompactInner({ current, max, editable, onDelta }: HPBarCompactProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const hpPercent = max > 0 ? Math.round((current / max) * 100) : 0;
  const hpColor =
    hpPercent > 50 ? "#00B894" : hpPercent > 25 ? "#F9CA24" : "#FF4444";

  const handleCustomSubmit = useCallback(() => {
    const val = parseInt(customValue, 10);
    if (!isNaN(val) && val !== 0) {
      onDelta(val);
    }
    setCustomValue("");
    setPopoverOpen(false);
  }, [customValue, onDelta]);

  return (
    <>
      {/* HP Bar (thin, tappable) */}
      <Stack
        marginHorizontal={16}
        marginTop={6}
        height={4}
        borderRadius={2}
        backgroundColor="#2A2A35"
        overflow="hidden"
        {...(editable
          ? {
              pressStyle: { opacity: 0.7 },
              onPress: () => setPopoverOpen(!popoverOpen),
            }
          : {})}
      >
        <Stack
          height={4}
          borderRadius={2}
          width={`${hpPercent}%` as any}
          backgroundColor={hpColor}
        />
      </Stack>

      {/* HP Popover */}
      {popoverOpen && editable && (
        <XStack
          marginHorizontal={16}
          marginTop={4}
          height={36}
          backgroundColor="#1C1C24"
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          alignItems="center"
          justifyContent="center"
          gap={4}
          paddingHorizontal={4}
        >
          {HP_DELTAS.map((delta) => (
            <Stack
              key={delta}
              paddingHorizontal={6}
              height={28}
              borderRadius={6}
              backgroundColor={
                delta < 0 ? "rgba(255,68,68,0.1)" : "rgba(0,184,148,0.1)"
              }
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.6 }}
              onPress={() => onDelta(delta)}
            >
              <Text
                fontSize={12}
                fontWeight="600"
                color={delta < 0 ? "#FF4444" : "#00B894"}
              >
                {delta > 0 ? `+${delta}` : delta}
              </Text>
            </Stack>
          ))}
          <TextInput
            value={customValue}
            onChangeText={setCustomValue}
            placeholder="±"
            placeholderTextColor="#5A5A6E"
            keyboardType="numeric"
            autoFocus
            onSubmitEditing={handleCustomSubmit}
            onBlur={() => setPopoverOpen(false)}
            maxLength={4}
            style={styles.hpInput}
          />
        </XStack>
      )}
    </>
  );
}

export const HPBarCompact = memo(HPBarCompactInner);

const styles = StyleSheet.create({
  hpInput: {
    width: 44,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#12121A",
    borderWidth: 1,
    borderColor: "#2A2A35",
    color: "#E8E8ED",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    padding: 0,
  },
});
