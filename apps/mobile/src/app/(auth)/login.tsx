import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
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
        {/* Logo */}
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-accent">QuestBoard</Text>
          <Text className="text-text-secondary text-sm mt-2">
            Bem-vindo de volta, aventureiro!
          </Text>
        </View>

        {/* OAuth */}
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-surface border border-border-default rounded-md py-3 items-center mb-3"
        >
          <Text className="text-text-primary font-medium">Continuar com Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-surface border border-border-default rounded-md py-3 items-center mb-6"
        >
          <Text className="text-text-primary font-medium">Continuar com Discord</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-border-default" />
          <Text className="text-text-muted text-xs mx-3">ou</Text>
          <View className="flex-1 h-px bg-border-default" />
        </View>

        {/* Form */}
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
          onPress={handleLogin}
          className="bg-accent rounded-md py-3 items-center mb-4"
        >
          <Text className="text-text-inverse font-semibold">Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          className="items-center"
        >
          <Text className="text-accent text-sm">Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
