import type { NarrativeFlowNode, NarrativeFlowEdge } from "@/types/narrative";

// ── Mock: A Maldição de Strahd — Árvore Narrativa ──

export const MOCK_NARRATIVE_NODES: NarrativeFlowNode[] = [
  {
    id: "ch1",
    type: "chapter",
    position: { x: 400, y: 0 },
    data: {
      title: "Ato I · Chegada em Barovia",
      status: "active",
      chapterLabel: "Ato I",
      color: "#10B981",
    },
  },
  {
    id: "evt1",
    type: "event",
    position: { x: 400, y: 120 },
    data: {
      title: "Névoa engole o grupo",
      status: "active",
      description: "O grupo é tragado pela névoa misteriosa ao cruzar a fronteira de Barovia.",
      sessionNumber: 1,
    },
  },
  {
    id: "evt2",
    type: "event",
    position: { x: 400, y: 240 },
    data: {
      title: "Chegada na Vila de Barovia",
      status: "active",
      description: "Os aventureiros encontram a vila desolada e silenciosa.",
      sessionNumber: 1,
    },
  },
  {
    id: "choice1",
    type: "choice",
    position: { x: 400, y: 370 },
    data: {
      title: "Investigar gritos ou ir à taverna?",
      status: "active",
    },
  },
  {
    id: "cons1a",
    type: "consequence",
    position: { x: 200, y: 510 },
    data: {
      title: "Encontro com Ismark",
      status: "active",
      description: "Os aventureiros encontram Ismark na casa de seu pai, pedindo ajuda para proteger Ireena.",
      sessionNumber: 2,
    },
  },
  {
    id: "cons1b",
    type: "consequence",
    position: { x: 600, y: 510 },
    data: {
      title: "Emboscada de lobos",
      status: "discarded",
      description: "Lobos atacam o grupo na estrada escura. Strahd observa de longe.",
    },
  },
  {
    id: "ch2",
    type: "chapter",
    position: { x: 200, y: 650 },
    data: {
      title: "Ato II · O Castelo de Ravenloft",
      status: "active",
      chapterLabel: "Ato II",
      color: "#6C5CE7",
    },
  },
  {
    id: "evt3",
    type: "event",
    position: { x: 200, y: 770 },
    data: {
      title: "Encontro com Strahd",
      status: "active",
      description: "Strahd aparece durante o jantar no castelo, revelando seus planos.",
      sessionNumber: 5,
      gmNotes: "Strahd vai oferecer um acordo falso aqui. Se os jogadores aceitarem, vai para o branch da aliança.",
    },
  },
  {
    id: "choice2",
    type: "choice",
    position: { x: 200, y: 900 },
    data: {
      title: "Atacar Strahd ou negociar?",
      status: "pending",
    },
  },
  {
    id: "cons2a",
    type: "consequence",
    position: { x: 50, y: 1040 },
    data: {
      title: "Strahd foge ferido",
      status: "pending",
      description: "O grupo ataca mas Strahd escapa, jurando vingança.",
    },
  },
  {
    id: "cons2b",
    type: "consequence",
    position: { x: 350, y: 1040 },
    data: {
      title: "Aliança forçada",
      status: "pending",
      description: "Strahd propõe uma aliança sombria com consequências terríveis.",
    },
  },
];

export const MOCK_NARRATIVE_EDGES: NarrativeFlowEdge[] = [
  { id: "e1", source: "ch1", target: "evt1", type: "narrative", data: { status: "active" } },
  { id: "e2", source: "evt1", target: "evt2", type: "narrative", data: { status: "active" } },
  { id: "e3", source: "evt2", target: "choice1", type: "narrative", data: { status: "active" } },
  { id: "e4", source: "choice1", target: "cons1a", type: "narrative", label: "Investigar gritos", data: { status: "active", label: "Investigar gritos" } },
  { id: "e5", source: "choice1", target: "cons1b", type: "narrative", label: "Ir à taverna", data: { status: "discarded", label: "Ir à taverna" } },
  { id: "e6", source: "cons1a", target: "ch2", type: "narrative", data: { status: "active" } },
  { id: "e7", source: "ch2", target: "evt3", type: "narrative", data: { status: "active" } },
  { id: "e8", source: "evt3", target: "choice2", type: "narrative", data: { status: "active" } },
  { id: "e9", source: "choice2", target: "cons2a", type: "narrative", label: "Atacar", data: { status: "pending", label: "Atacar" } },
  { id: "e10", source: "choice2", target: "cons2b", type: "narrative", label: "Negociar", data: { status: "pending", label: "Negociar" } },
];

export const MOCK_VIEWPORT = { x: 0, y: 0, zoom: 0.85 };
