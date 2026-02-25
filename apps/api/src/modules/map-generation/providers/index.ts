export * from "./types.js";
export { createOpenAiProvider } from "./openai.provider.js";
export { createStabilityProvider } from "./stability.provider.js";

import type { AiProvider } from "./types.js";
import { createOpenAiProvider } from "./openai.provider.js";
import { createStabilityProvider } from "./stability.provider.js";

const providers: AiProvider[] = [
  createOpenAiProvider(),
  createStabilityProvider(),
];

export function getAvailableProvider(): AiProvider | null {
  return providers.find((p) => p.isAvailable()) ?? null;
}

export function getProviderByName(name: string): AiProvider | null {
  return providers.find((p) => p.name === name && p.isAvailable()) ?? null;
}
