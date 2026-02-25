import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, Divider } from "@questboard/ui";

type AuthMode = "login" | "register";

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = () => {
    // TODO: Integrate Clerk auth
    navigate("/");
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <div className="text-4xl font-display font-extrabold text-accent mb-2">
          QuestBoard
        </div>
        <p className="text-text-secondary text-sm">
          {mode === "login" ? "Bem-vindo de volta, aventureiro!" : "Crie sua conta e comece a jogar"}
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-border-default p-6 space-y-4">
        {/* OAuth buttons */}
        <Button variant="outline" fullWidth onPress={handleSubmit}>
          Continuar com Google
        </Button>
        <Button variant="outline" fullWidth onPress={handleSubmit}>
          Continuar com Discord
        </Button>

        <Divider label="ou" />

        {mode === "register" && (
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Nome de aventureiro"
            label="Nome"
          />
        )}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          label="E-mail"
          type="email"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          label="Senha"
          type="password"
        />

        <Button variant="primary" fullWidth onPress={handleSubmit}>
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {mode === "login"
              ? "Não tem conta? Cadastre-se"
              : "Já tem conta? Faça login"}
          </button>
        </div>
      </div>

      <p className="text-center text-text-muted text-xs mt-4">
        Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.
      </p>
    </div>
  );
}
