export interface GenerationRequest {
  mode: "TEXT_TO_MAP" | "VARIATION" | "INPAINT" | "ENHANCE" | "WALLS_DETECT";
  prompt?: string;
  parameters?: Record<string, unknown>;
  sourceImageUrl?: string;
  maskData?: string;
  inpaintPrompt?: string;
}

export interface GenerationResult {
  imageUrl: string;
  width: number;
  height: number;
  provider: string;
  model: string;
  costCents: number;
  metadata?: Record<string, unknown>;
}

export interface WallDetectionResult {
  walls: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    wallType: string;
    isDoor: boolean;
  }>;
  provider: string;
  model: string;
  costCents: number;
}

export interface AiProvider {
  name: string;
  generateMap(request: GenerationRequest): Promise<GenerationResult>;
  detectWalls(imageUrl: string, gridSize: number): Promise<WallDetectionResult>;
  isAvailable(): boolean;
}
