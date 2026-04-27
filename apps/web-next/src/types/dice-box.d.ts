// @3d-dice/dice-box não publica @types. Declaração mínima pro consumo
// em DiceCanvas. Tipos efetivos são tratados como `unknown`/wrapper
// dentro do DiceCanvas component.

declare module "@3d-dice/dice-box" {
  type DiceBoxConfig = Record<string, unknown>;

  interface DiceNotation {
    qty: number;
    sides: number;
    value?: number;
    themeColor?: string;
    theme?: string;
  }

  export default class DiceBox {
    constructor(selector: string, config: DiceBoxConfig);
    init(): Promise<void>;
    roll(
      notation: DiceNotation[] | string,
      options?: Record<string, unknown>,
    ): Promise<unknown>;
    add(
      notation: DiceNotation[] | string,
      options?: Record<string, unknown>,
    ): Promise<unknown>;
    clear(): void;
    hide(): void;
    show(): void;
  }
}
