import { useState } from "react";
import { Button, Card, Badge, Toggle, ProgressBar, Divider } from "@questboard/ui";
import { Plan, BillingCycle } from "@questboard/shared";

interface PlanCard {
  plan: Plan;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const PLANS: PlanCard[] = [
  {
    plan: Plan.FREE,
    name: "Gratuito",
    description: "Para experimentar a plataforma",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "1 sessão ativa",
      "5 jogadores por sessão",
      "1 personagem por jogador",
      "Upload até 5MB",
      "Chat básico",
    ],
  },
  {
    plan: Plan.ADVENTURER,
    name: "Aventureiro",
    description: "Para mestres dedicados",
    priceMonthly: 1990,
    priceYearly: 19900,
    highlighted: true,
    badge: "Popular",
    features: [
      "5 sessões ativas",
      "10 jogadores por sessão",
      "5 personagens por jogador",
      "Upload até 25MB",
      "3 mapas IA/mês",
      "Fog of War",
      "Trilha sonora",
      "Tracker de Iniciativa",
      "Whisper no chat",
    ],
  },
  {
    plan: Plan.LEGENDARY,
    name: "Lendário",
    description: "Para mestres profissionais",
    priceMonthly: 3990,
    priceYearly: 39900,
    badge: "Melhor valor",
    features: [
      "Sessões ilimitadas",
      "20 jogadores por sessão",
      "Personagens ilimitados",
      "Upload até 100MB",
      "Mapas IA ilimitados",
      "Todos os recursos",
      "Iluminação dinâmica",
      "Linha de visão",
      "NPC Assistant (IA)",
      "Exportação PDF",
      "Sessões públicas",
      "Sessões assíncronas",
    ],
  },
];

function formatPrice(cents: number): string {
  if (cents === 0) return "Grátis";
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function PlanCardComponent({
  plan,
  isYearly,
  currentPlan,
  onSelect,
}: {
  plan: PlanCard;
  isYearly: boolean;
  currentPlan: Plan;
  onSelect: (plan: Plan) => void;
}) {
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const isCurrent = plan.plan === currentPlan;
  const isGold = plan.plan === Plan.LEGENDARY;

  return (
    <Card
      variant={isGold ? "gold" : "default"}
      selected={isCurrent}
      className={plan.highlighted ? "ring-1 ring-accent" : ""}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-display font-bold text-text-primary">
              {plan.name}
            </h3>
            {plan.badge && (
              <Badge variant={isGold ? "gold" : "accent"} size="sm">
                {plan.badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-text-muted">{plan.description}</p>
        </div>

        <div>
          <span className="text-3xl font-display font-extrabold text-text-primary">
            {formatPrice(price)}
          </span>
          {price > 0 && (
            <span className="text-sm text-text-muted ml-1">
              /{isYearly ? "ano" : "mês"}
            </span>
          )}
          {isYearly && price > 0 && (
            <div className="text-xs text-success mt-1">
              Economia de {formatPrice(plan.priceMonthly * 12 - plan.priceYearly)}/ano
            </div>
          )}
        </div>

        <Divider />

        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-success mt-0.5 shrink-0">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isCurrent ? "ghost" : plan.highlighted ? "primary" : "outline"}
          fullWidth
          disabled={isCurrent}
          onPress={() => onSelect(plan.plan)}
        >
          {isCurrent ? "Plano atual" : plan.plan === Plan.FREE ? "Downgrade" : "Assinar"}
        </Button>
      </div>
    </Card>
  );
}

function UsageSection() {
  const usage = [
    { label: "Sessões ativas", used: 2, limit: 5 },
    { label: "Mapas IA (mês)", used: 1, limit: 3 },
    { label: "Armazenamento", used: 12, limit: 25, unit: "MB" },
    { label: "Amigos", used: 8, limit: 50 },
    { label: "Personagens", used: 3, limit: 5 },
  ];

  return (
    <section>
      <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
        Uso do Plano
      </h2>
      <div className="bg-surface border border-border-default rounded-lg p-5 space-y-4">
        {usage.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-text-secondary">{item.label}</span>
              <span className="text-text-primary font-medium">
                {item.used}/{item.limit}
                {item.unit ? ` ${item.unit}` : ""}
              </span>
            </div>
            <ProgressBar value={item.used} max={item.limit} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function BillingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const currentPlan = Plan.ADVENTURER; // TODO: from API

  const handleSelectPlan = (plan: Plan) => {
    // TODO: integrate billing API
    console.log("Selected plan:", plan);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          Planos & Assinatura
        </h1>
        <p className="text-text-secondary mt-1">
          Escolha o melhor plano para suas aventuras
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${!isYearly ? "text-text-primary" : "text-text-muted"}`}
        >
          Mensal
        </span>
        <Toggle checked={isYearly} onToggle={setIsYearly} />
        <span
          className={`text-sm font-medium ${isYearly ? "text-text-primary" : "text-text-muted"}`}
        >
          Anual
        </span>
        {isYearly && (
          <Badge variant="success" size="sm">
            -17%
          </Badge>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCardComponent
            key={plan.plan}
            plan={plan}
            isYearly={isYearly}
            currentPlan={currentPlan}
            onSelect={handleSelectPlan}
          />
        ))}
      </div>

      {/* Usage */}
      <UsageSection />

      {/* Player Plus note */}
      <Card variant="gold">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <h3 className="font-display font-semibold text-text-primary">
              Player Plus
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Ainda não é mestre? Com o Player Plus (R$ 4,90/mês) você ganha benefícios
              extras como personagens ilimitados, exportação de ficha em PDF e destaque no
              perfil — tudo como jogador.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Saiba mais
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
