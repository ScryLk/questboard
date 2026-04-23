import { create } from "zustand";
import type {
  StoryArc,
  StoryEvent,
  ArcStatus,
  EventStatus,
  EventType,
} from "@/types/story";
import { calcCampaignProgress } from "@/types/story";

export type StoryView =
  | "roadmap"
  | "timeline"
  | "kanban"
  | "list"
  | "branching"
  | "encounters";

interface StoryStore {
  arcs: StoryArc[];
  selectedEventId: string | null;
  drawerOpen: boolean;
  view: StoryView;

  setView: (v: StoryView) => void;
  selectEvent: (id: string) => void;
  closeDrawer: () => void;

  addArc: (title: string, color?: string, description?: string) => void;
  updateArc: (id: string, data: Partial<Pick<StoryArc, "title" | "description" | "status" | "color">>) => void;
  deleteArc: (id: string) => void;
  reorderArcs: (from: number, to: number) => void;

  addEvent: (arcId: string, data: { title: string; type?: EventType; description?: string; sessionNumber?: number }) => void;
  updateEvent: (eventId: string, data: Partial<Pick<StoryEvent, "title" | "description" | "type" | "status" | "sessionNumber" | "gmNotes" | "loot" | "linkedNpcIds" | "linkedMapIds" | "linkedEncounterIds">>) => void;
  deleteEvent: (eventId: string) => void;
  moveEvent: (eventId: string, toArcId: string, toIndex: number) => void;

  toggleTask: (eventId: string, taskId: string) => void;
  addTask: (eventId: string, label: string) => void;
  deleteTask: (eventId: string, taskId: string) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function makeEvent(
  arcId: string,
  order: number,
  title: string,
  type: EventType,
  status: EventStatus,
  opts: Partial<StoryEvent> = {},
): StoryEvent {
  return {
    id: `evt_${generateId()}`,
    arcId,
    title,
    type,
    status,
    order,
    linkedNpcIds: [],
    linkedMapIds: [],
    linkedEncounterIds: [],
    loot: [],
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...opts,
  };
}

// ── Mock: A Maldição de Strahd ──
const arc1Events: StoryEvent[] = [
  makeEvent("arc1", 0, "Névoa engole o grupo", "exploration", "completed", {
    sessionNumber: 1,
    description: "O grupo é tragado pela névoa misteriosa de Barovia.",
    tasks: [
      { id: "t1", label: "Preparar descrição atmosférica", isDone: true },
      { id: "t2", label: "Handout do convite de Strahd", isDone: true },
    ],
  }),
  makeEvent("arc1", 1, "Vila de Barovia", "exploration", "completed", {
    sessionNumber: 1,
    description: "Exploração da vila desolada. Encontro com Mary e Ireena.",
    tasks: [
      { id: "t3", label: "Mapa da vila", isDone: true },
      { id: "t4", label: "Ficha da Ireena", isDone: true },
    ],
  }),
  makeEvent("arc1", 2, "Encontro com Ismark", "social", "completed", {
    sessionNumber: 2,
    description: "Ismark pede ajuda para proteger sua irmã Ireena.",
  }),
  makeEvent("arc1", 3, "Funeral de Kolyan", "milestone", "completed", {
    sessionNumber: 2,
    description: "O funeral do borgomestre é interrompido por um ataque de lobos.",
    tasks: [
      { id: "t5", label: "Estatbloco dos lobos", isDone: true },
      { id: "t6", label: "Descrição do cemitério", isDone: true },
      { id: "t7", label: "Diálogo do Padre Donavich", isDone: true },
    ],
  }),
];

const arc2Events: StoryEvent[] = [
  makeEvent("arc2", 0, "Vinhedos do Mago dos Vinhos", "exploration", "completed", {
    sessionNumber: 3,
    description: "O grupo investiga os vinhedos corrompidos.",
  }),
  makeEvent("arc2", 1, "Ossos de St. Andral", "encounter", "completed", {
    sessionNumber: 4,
    description: "Recuperar os ossos sagrados antes do ataque vampírico.",
    tasks: [
      { id: "t8", label: "Mapa da igreja", isDone: true },
      { id: "t9", label: "Estatbloco do vampiro", isDone: true },
    ],
  }),
  makeEvent("arc2", 2, "Festa de Vallaki", "social", "completed", {
    sessionNumber: 5,
    description: "O Festival do Sol Ardente se torna um caos político.",
  }),
  makeEvent("arc2", 3, "Encontro com Rictavio", "revelation", "completed", {
    sessionNumber: 5,
    description: "O misterioso Rictavio revela sua verdadeira identidade.",
  }),
];

const arc3Events: StoryEvent[] = [
  makeEvent("arc3", 0, "O Castelo de Amber", "exploration", "completed", {
    sessionNumber: 6,
    description: "Exploração do Templo de Amber e seus sarcófagos sombrios.",
    tasks: [
      { id: "t10", label: "Mapa do Templo de Amber", isDone: true },
      { id: "t11", label: "Tabela de poderes sombrios", isDone: true },
    ],
  }),
  makeEvent("arc3", 1, "A Espada Solar", "milestone", "in_progress", {
    sessionNumber: 7,
    description: "Os aventureiros buscam a lendária Espada Solar, arma capaz de ferir Strahd.",
    tasks: [
      { id: "t12", label: "Criar mapa do templo escondido", isDone: true },
      { id: "t13", label: "Preparar diálogo com o guardião", isDone: true },
      { id: "t14", label: "Definir traps do templo", isDone: false },
      { id: "t15", label: "Calcular XP e loot", isDone: false },
      { id: "t16", label: "Preparar descrição da espada", isDone: false },
    ],
    loot: ["Espada Solar"],
    gmNotes: "O guardião deve suspeitar que os jogadores são enviados de Strahd. Ele testa a pureza de coração antes de entregar a arma.",
  }),
  makeEvent("arc3", 2, "O Símbolo Sagrado", "exploration", "pending", {
    description: "Localizar o Símbolo Sagrado de Ravenkind nas catacumbas.",
    tasks: [
      { id: "t17", label: "Mapa das catacumbas", isDone: false },
      { id: "t18", label: "Puzzle da cripta", isDone: false },
      { id: "t19", label: "Loot e recompensas", isDone: false },
    ],
    loot: ["Símbolo Sagrado de Ravenkind"],
  }),
  makeEvent("arc3", 3, "Aliança com Ezmerelda", "social", "pending", {
    description: "Convencer Ezmerelda d'Avenir a se juntar na luta contra Strahd.",
  }),
];

const arc4Events: StoryEvent[] = [
  makeEvent("arc4", 0, "Infiltrar Ravenloft", "exploration", "pending", {
    description: "O grupo planeja a infiltração no Castelo Ravenloft.",
    tasks: [
      { id: "t20", label: "Mapa completo do castelo", isDone: false },
      { id: "t21", label: "Posição das armadilhas", isDone: false },
      { id: "t22", label: "Rota de fuga", isDone: false },
    ],
  }),
  makeEvent("arc4", 1, "Confronto com Strahd", "encounter", "pending", {
    description: "A batalha final contra o Conde Strahd von Zarovich.",
    tasks: [
      { id: "t23", label: "Estatbloco do Strahd (modificado)", isDone: false },
      { id: "t24", label: "Fases da luta", isDone: false },
      { id: "t25", label: "Música dramática", isDone: false },
    ],
  }),
  makeEvent("arc4", 2, "Epílogo", "milestone", "pending", {
    description: "O destino de Barovia após a queda (ou vitória) de Strahd.",
  }),
];

const INITIAL_ARCS: StoryArc[] = [
  {
    id: "arc1",
    campaignId: "c1",
    title: "Chegada em Barovia",
    description: "O grupo é tragado pela névoa e descobre os horrores de Barovia.",
    status: "completed",
    order: 0,
    color: "#10B981",
    events: arc1Events,
    createdAt: new Date(),
  },
  {
    id: "arc2",
    campaignId: "c1",
    title: "Explorando os Arredores",
    description: "Investigações em Vallaki e arredores revelam aliados e inimigos.",
    status: "completed",
    order: 1,
    color: "#3B82F6",
    events: arc2Events,
    createdAt: new Date(),
  },
  {
    id: "arc3",
    campaignId: "c1",
    title: "Aliados e Artefatos",
    description: "A busca pelos artefatos lendários capazes de destruir Strahd.",
    status: "in_progress",
    order: 2,
    color: "#8B5CF6",
    events: arc3Events,
    createdAt: new Date(),
  },
  {
    id: "arc4",
    campaignId: "c1",
    title: "Confronto Final",
    description: "A batalha decisiva no Castelo Ravenloft.",
    status: "planned",
    order: 3,
    color: "#EF4444",
    events: arc4Events,
    createdAt: new Date(),
  },
];

export const useStoryStore = create<StoryStore>()((set, get) => ({
  arcs: INITIAL_ARCS,
  selectedEventId: null,
  drawerOpen: false,
  view: "roadmap",

  setView: (v) => set({ view: v }),

  selectEvent: (id) => set({ selectedEventId: id, drawerOpen: true }),

  closeDrawer: () => set({ drawerOpen: false, selectedEventId: null }),

  addArc: (title, color, description) => {
    const arcs = get().arcs;
    const newArc: StoryArc = {
      id: `arc_${generateId()}`,
      campaignId: "c1",
      title,
      description,
      status: "planned",
      order: arcs.length,
      color: color ?? "#6C5CE7",
      events: [],
      createdAt: new Date(),
    };
    set({ arcs: [...arcs, newArc] });
  },

  updateArc: (id, data) => {
    set({
      arcs: get().arcs.map((a) =>
        a.id === id ? { ...a, ...data } : a,
      ),
    });
  },

  deleteArc: (id) => {
    set({ arcs: get().arcs.filter((a) => a.id !== id) });
  },

  reorderArcs: (from, to) => {
    const arcs = [...get().arcs].sort((a, b) => a.order - b.order);
    const [moved] = arcs.splice(from, 1);
    arcs.splice(to, 0, moved);
    set({ arcs: arcs.map((a, i) => ({ ...a, order: i })) });
  },

  addEvent: (arcId, data) => {
    set({
      arcs: get().arcs.map((a) => {
        if (a.id !== arcId) return a;
        const newEvent: StoryEvent = {
          id: `evt_${generateId()}`,
          arcId,
          title: data.title,
          type: data.type ?? "custom",
          status: "pending",
          description: data.description,
          sessionNumber: data.sessionNumber,
          order: a.events.length,
          linkedNpcIds: [],
          linkedMapIds: [],
          linkedEncounterIds: [],
          loot: [],
          tasks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return { ...a, events: [...a.events, newEvent] };
      }),
    });
  },

  updateEvent: (eventId, data) => {
    set({
      arcs: get().arcs.map((a) => ({
        ...a,
        events: a.events.map((e) =>
          e.id === eventId ? { ...e, ...data, updatedAt: new Date() } : e,
        ),
      })),
    });
  },

  deleteEvent: (eventId) => {
    set({
      arcs: get().arcs.map((a) => ({
        ...a,
        events: a.events
          .filter((e) => e.id !== eventId)
          .map((e, i) => ({ ...e, order: i })),
      })),
    });
  },

  moveEvent: (eventId, toArcId, toIndex) => {
    const arcs = get().arcs;
    let movedEvent: StoryEvent | null = null;

    // Remove from source arc
    const withoutEvent = arcs.map((a) => {
      const idx = a.events.findIndex((e) => e.id === eventId);
      if (idx === -1) return a;
      movedEvent = { ...a.events[idx], arcId: toArcId };
      return {
        ...a,
        events: a.events.filter((e) => e.id !== eventId).map((e, i) => ({ ...e, order: i })),
      };
    });

    if (!movedEvent) return;

    // Insert into target arc
    set({
      arcs: withoutEvent.map((a) => {
        if (a.id !== toArcId) return a;
        const events = [...a.events];
        events.splice(toIndex, 0, movedEvent!);
        return { ...a, events: events.map((e, i) => ({ ...e, order: i })) };
      }),
    });
  },

  toggleTask: (eventId, taskId) => {
    set({
      arcs: get().arcs.map((a) => ({
        ...a,
        events: a.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                tasks: e.tasks.map((t) =>
                  t.id === taskId ? { ...t, isDone: !t.isDone } : t,
                ),
                updatedAt: new Date(),
              }
            : e,
        ),
      })),
    });
  },

  addTask: (eventId, label) => {
    set({
      arcs: get().arcs.map((a) => ({
        ...a,
        events: a.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                tasks: [...e.tasks, { id: `task_${generateId()}`, label, isDone: false }],
                updatedAt: new Date(),
              }
            : e,
        ),
      })),
    });
  },

  deleteTask: (eventId, taskId) => {
    set({
      arcs: get().arcs.map((a) => ({
        ...a,
        events: a.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                tasks: e.tasks.filter((t) => t.id !== taskId),
                updatedAt: new Date(),
              }
            : e,
        ),
      })),
    });
  },
}));

// Hook for dashboard integration
export function useStoryProgress() {
  const arcs = useStoryStore((s) => s.arcs);
  const allEvents = arcs.flatMap((a) => a.events);
  return {
    percent: calcCampaignProgress(arcs),
    totalEvents: allEvents.length,
    completedEvents: allEvents.filter((e) => e.status === "completed").length,
    nextEvent: allEvents.find(
      (e) => e.status === "in_progress" || e.status === "pending",
    ),
  };
}
