// Tipos locais — espelham `@questboard/types/cosmic-horror`. Mantidos
// aqui pra evitar dep cruzada (mesmo padrão de attack.ts).

export type AttributeKey =
  | "for"
  | "con"
  | "tam"
  | "des"
  | "apa"
  | "int"
  | "pod"
  | "edu";

export type Attributes = Record<AttributeKey, number>;
