import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    // TODO: Clerk auth
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-base"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-accent">QuestBoard</Text>
          <Text className="text-text-secondary text-sm mt-2">
            Crie sua conta e comece a jogar
          </Text>
        </View>

        <Text className="text-sm font-medium text-text-secondary mb-1.5">Nome</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Nome de aventureiro"
          placeholderTextColor="#5A5A6E"
          className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-4"
        />

        <Text className="text-sm font-medium text-text-secondary mb-1.5">E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          placeholderTextColor="#5A5A6E"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-4"
        />

        <Text className="text-sm font-medium text-text-secondary mb-1.5">Senha</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#5A5A6E"
          secureTextEntry
          className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-6"
        />

        <TouchableOpacity
          onPress={handleRegister}
          className="bg-accent rounded-md py-3 items-center mb-4"
        >
          <Text className="text-text-inverse font-semibold">Criar conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center"
        >
          <Text className="text-accent text-sm">Já tem conta? Faça login</Text>
        </TouchableOpacity>

        <Text className="text-text-muted text-xs text-center mt-6">
          Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
