import { z } from "zod";

export const updateExplorationSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  playerTokenControl: z.enum(["free", "request"]).optional(),
  showPathTrail: z.boolean().optional(),
  pathTrailDuration: z.number().min(0).optional(),
  pathTrailColor: z.string().max(20).optional(),
  autoRevealFog: z.boolean().optional(),
  revealMode: z.enum(["token_vision", "gm_manual"]).optional(),
  exploredFogOpacity: z.number().min(0).max(1).optional(),
  hiddenFogOpacity: z.number().min(0).max(1).optional(),
  defaultVisionRadius: z.number().min(1).max(100).optional(),
  visionRadiusUnit: z.enum(["cells", "ft", "m"]).optional(),
  sharedVision: z.boolean().optional(),
  allowDoorInteraction: z.boolean().optional(),
  doorInteractionRange: z.number().min(0).optional(),
  allowObjectInteraction: z.boolean().optional(),
  objectInteractionRange: z.number().min(0).optional(),
  cameraFollowToken: z.boolean().optional(),
  cameraFollowSmoothing: z.number().min(0).max(1).optional(),
  allowFreeCamera: z.boolean().optional(),
  cameraBoundsRestrict: z.boolean().optional(),
  ambientSoundEnabled: z.boolean().optional(),
  footstepSoundEnabled: z.boolean().optional(),
  interactionSoundEnabled: z.boolean().optional(),
});

export const mapTransitionSchema = z.object({
  targetMapId: z.string(),
  tokenIds: z.array(z.string()).optional(),
  spawnPoint: z.object({ x: z.number(), y: z.number() }).optional(),
  transitionEffect: z.enum(["fade", "slide", "portal", "instant"]).default("fade"),
  narrationText: z.string().max(500).optional(),
});

export const saveCameraPositionSchema = z.object({
  cameraX: z.number(),
  cameraY: z.number(),
  cameraZoom: z.number().min(0.1).max(10),
});

export type UpdateExplorationSettingsInput = z.infer<typeof updateExplorationSettingsSchema>;
export type MapTransitionInput = z.infer<typeof mapTransitionSchema>;
