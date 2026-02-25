import { z } from "zod";

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
  deviceName: z.string().max(100).optional(),
});

export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
