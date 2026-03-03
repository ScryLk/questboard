import { memo, useState } from "react";
import { TextInput } from "react-native";
import { Plus } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterSpell } from "../../lib/character-types";

interface AddSpellFormProps {
  onAdd: (spell: CharacterSpell) => void;
}

const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function AddSpellFormInner({ onAdd }: AddSpellFormProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(0);
  const [school, setSchool] = useState("");
  const [castingTime, setCastingTime] = useState("1 ação");
  const [range, setRange] = useState("Pessoal");
  const [components, setComponents] = useState("V, S");
  const [duration, setDuration] = useState("Instantâneo");
  const [description, setDescription] = useState("");

  const canAdd = name.trim().length >= 2;

  function handleAdd() {
    if (!canAdd) return;
    const spell: CharacterSpell = {
      id: `spell-${Date.now()}`,
      name: name.trim(),
      level,
      school: school.trim() || "Evocação",
      castingTime: castingTime.trim() || "1 ação",
      range: range.trim() || "Pessoal",
      components: components.trim() || "V, S",
      duration: duration.trim() || "Instantâneo",
      description: description.trim(),
      prepared: true,
    };
    onAdd(spell);
    // Reset form
    setName("");
    setLevel(0);
    setSchool("");
    setCastingTime("1 ação");
    setRange("Pessoal");
    setComponents("V, S");
    setDuration("Instantâneo");
    setDescription("");
  }

  return (
    <YStack
      backgroundColor="#16161C"
      borderRadius={10}
      borderWidth={1}
      borderColor="#2A2A35"
      padding={12}
      gap={10}
    >
      <Text fontSize={12} fontWeight="700" color="#5A5A6E">
        ADICIONAR MAGIA
      </Text>

      {/* Name */}
      <InputField
        label="Nome"
        value={name}
        onChange={setName}
        placeholder="Nome da magia"
        maxLength={60}
      />

      {/* Level pills */}
      <YStack gap={4}>
        <Text fontSize={11} color="#5A5A6E">Nível</Text>
        <XStack gap={4} flexWrap="wrap">
          {LEVELS.map((l) => (
            <Stack
              key={l}
              paddingHorizontal={10}
              paddingVertical={5}
              borderRadius={6}
              backgroundColor={level === l ? "#6C5CE7" : "#1C1C24"}
              borderWidth={1}
              borderColor={level === l ? "#6C5CE7" : "#2A2A35"}
              onPress={() => setLevel(l)}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={11} color={level === l ? "#FFFFFF" : "#9090A0"}>
                {l === 0 ? "Truque" : l}
              </Text>
            </Stack>
          ))}
        </XStack>
      </YStack>

      {/* School */}
      <InputField
        label="Escola"
        value={school}
        onChange={setSchool}
        placeholder="Evocação"
        maxLength={30}
      />

      {/* Row: Casting Time + Range */}
      <XStack gap={8}>
        <YStack flex={1}>
          <InputField
            label="Tempo"
            value={castingTime}
            onChange={setCastingTime}
            placeholder="1 ação"
            maxLength={30}
          />
        </YStack>
        <YStack flex={1}>
          <InputField
            label="Alcance"
            value={range}
            onChange={setRange}
            placeholder="Pessoal"
            maxLength={30}
          />
        </YStack>
      </XStack>

      {/* Row: Components + Duration */}
      <XStack gap={8}>
        <YStack flex={1}>
          <InputField
            label="Componentes"
            value={components}
            onChange={setComponents}
            placeholder="V, S"
            maxLength={30}
          />
        </YStack>
        <YStack flex={1}>
          <InputField
            label="Duração"
            value={duration}
            onChange={setDuration}
            placeholder="Instantâneo"
            maxLength={30}
          />
        </YStack>
      </XStack>

      {/* Description */}
      <YStack gap={4}>
        <Text fontSize={11} color="#5A5A6E">Descrição</Text>
        <Stack
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          backgroundColor="#1C1C24"
          paddingHorizontal={10}
          paddingVertical={8}
        >
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Descrição da magia"
            placeholderTextColor="#3A3A45"
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

      {/* Add button */}
      <Stack
        alignSelf="flex-end"
        paddingHorizontal={14}
        paddingVertical={8}
        borderRadius={8}
        backgroundColor={canAdd ? "#6C5CE7" : "#2A2A35"}
        pressStyle={canAdd ? { opacity: 0.7 } : undefined}
        onPress={canAdd ? handleAdd : undefined}
      >
        <XStack gap={4} alignItems="center">
          <Plus size={14} color={canAdd ? "#FFFFFF" : "#5A5A6E"} />
          <Text fontSize={12} fontWeight="600" color={canAdd ? "#FFFFFF" : "#5A5A6E"}>
            Adicionar
          </Text>
        </XStack>
      </Stack>
    </YStack>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <YStack gap={4}>
      <Text fontSize={11} color="#5A5A6E">{label}</Text>
      <Stack
        borderRadius={8}
        borderWidth={1}
        borderColor="#2A2A35"
        backgroundColor="#1C1C24"
        paddingHorizontal={10}
        paddingVertical={8}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#3A3A45"
          style={{ color: "#E8E8ED", fontSize: 13, padding: 0 }}
          maxLength={maxLength}
        />
      </Stack>
    </YStack>
  );
}

export const AddSpellForm = memo(AddSpellFormInner);
