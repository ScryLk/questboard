import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, TextInput, Divider, Badge } from "@questboard/ui";
import {
  SUPPORTED_SYSTEMS,
  SYSTEM_LABELS,
  type SupportedSystem,
} from "@questboard/shared";

type Step = "system" | "basic" | "attributes" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "system", label: "Sistema" },
  { key: "basic", label: "Básico" },
  { key: "attributes", label: "Atributos" },
  { key: "review", label: "Revisão" },
];

const DEFAULT_ATTRIBUTES = [
  { key: "str", label: "Força", value: 10 },
  { key: "dex", label: "Destreza", value: 10 },
  { key: "con", label: "Constituição", value: 10 },
  { key: "int", label: "Inteligência", value: 10 },
  { key: "wis", label: "Sabedoria", value: 10 },
  { key: "cha", label: "Carisma", value: 10 },
];

function StepIndicator({ current, steps }: { current: Step; steps: typeof STEPS }) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-fast ${
              i <= currentIdx
                ? "bg-accent text-text-inverse"
                : "bg-elevated text-text-muted"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-sm hidden sm:inline ${
              i <= currentIdx ? "text-text-primary" : "text-text-muted"
            }`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-px ${
                i < currentIdx ? "bg-accent" : "bg-border-default"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function CharacterCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("system");
  const [system, setSystem] = useState<SupportedSystem | null>(null);
  const [name, setName] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [race, setRace] = useState("");
  const [level, setLevel] = useState("1");
  const [backstory, setBackstory] = useState("");
  const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES);

  const updateAttribute = (key: string, delta: number) => {
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.key === key
          ? { ...attr, value: Math.max(1, Math.min(20, attr.value + delta)) }
          : attr
      )
    );
  };

  const canNext = () => {
    if (step === "system") return system !== null;
    if (step === "basic") return name.trim().length > 0;
    return true;
  };

  const nextStep = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };

  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  const handleCreate = () => {
    // TODO: POST to API
    navigate("/characters");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          Criar Personagem
        </h1>
        <p className="text-text-secondary mt-1">Dê vida ao seu próximo herói</p>
      </div>

      <StepIndicator current={step} steps={STEPS} />

      <Card>
        <div className="space-y-5">
          {/* Step: System */}
          {step === "system" && (
            <div className="space-y-4">
              <h2 className="text-lg font-display font-semibold text-text-primary">
                Escolha o sistema
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {SUPPORTED_SYSTEMS.map((sys) => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => setSystem(sys)}
                    className={`p-4 rounded-lg border text-left transition-all duration-fast ${
                      system === sys
                        ? "border-accent bg-accent-muted"
                        : "border-border-default bg-surface hover:border-border-hover"
                    }`}
                  >
                    <span className="text-sm font-semibold text-text-primary">
                      {SYSTEM_LABELS[sys]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Basic info */}
          {step === "basic" && (
            <div className="space-y-4">
              <h2 className="text-lg font-display font-semibold text-text-primary">
                Informações básicas
              </h2>
              <TextInput
                value={name}
                onChangeText={setName}
                label="Nome do personagem"
                placeholder="Ex: Thorin Escudo de Ferro"
                maxLength={60}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  value={race}
                  onChangeText={setRace}
                  label="Raça"
                  placeholder="Ex: Anão"
                />
                <TextInput
                  value={characterClass}
                  onChangeText={setCharacterClass}
                  label="Classe"
                  placeholder="Ex: Guerreiro"
                />
              </div>
              <TextInput
                value={level}
                onChangeText={setLevel}
                label="Nível"
                type="number"
                placeholder="1"
              />
              <TextInput
                value={backstory}
                onChangeText={setBackstory}
                label="Backstory"
                placeholder="Conte a história do seu personagem..."
                multiline
                rows={4}
                maxLength={500}
              />
            </div>
          )}

          {/* Step: Attributes */}
          {step === "attributes" && (
            <div className="space-y-4">
              <h2 className="text-lg font-display font-semibold text-text-primary">
                Atributos
              </h2>
              <p className="text-sm text-text-muted">
                Ajuste os atributos do seu personagem (1-20)
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {attributes.map((attr) => {
                  const modifier = Math.floor((attr.value - 10) / 2);
                  return (
                    <div
                      key={attr.key}
                      className="bg-elevated rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          {attr.label}
                        </div>
                        <div className="text-xs text-text-muted">
                          Mod: {modifier >= 0 ? "+" : ""}
                          {modifier}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateAttribute(attr.key, -1)}
                          className="w-8 h-8 rounded-md bg-surface border border-border-default text-text-primary hover:bg-hover flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-lg font-bold text-text-primary">
                          {attr.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateAttribute(attr.key, 1)}
                          className="w-8 h-8 rounded-md bg-surface border border-border-default text-text-primary hover:bg-hover flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <div className="space-y-4">
              <h2 className="text-lg font-display font-semibold text-text-primary">
                Revisão
              </h2>
              <div className="bg-elevated rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Sistema</span>
                  <Badge variant="accent">
                    {system ? SYSTEM_LABELS[system] : "—"}
                  </Badge>
                </div>
                <Divider />
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Nome</span>
                  <span className="text-text-primary font-medium">{name || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Raça / Classe</span>
                  <span className="text-text-primary">
                    {race || "—"} / {characterClass || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Nível</span>
                  <span className="text-text-primary">{level}</span>
                </div>
                <Divider />
                <div className="grid grid-cols-3 gap-2">
                  {attributes.map((attr) => (
                    <div key={attr.key} className="text-center">
                      <div className="text-xs text-text-muted">{attr.label}</div>
                      <div className="text-lg font-bold text-text-primary">
                        {attr.value}
                      </div>
                    </div>
                  ))}
                </div>
                {backstory && (
                  <>
                    <Divider />
                    <div>
                      <span className="text-text-muted text-sm">Backstory</span>
                      <p className="text-text-secondary text-sm mt-1">{backstory}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onPress={step === "system" ? () => navigate("/characters") : prevStep}
        >
          {step === "system" ? "Cancelar" : "Voltar"}
        </Button>
        {step === "review" ? (
          <Button variant="primary" onPress={handleCreate}>
            Criar Personagem
          </Button>
        ) : (
          <Button variant="primary" disabled={!canNext()} onPress={nextStep}>
            Próximo
          </Button>
        )}
      </div>
    </div>
  );
}
