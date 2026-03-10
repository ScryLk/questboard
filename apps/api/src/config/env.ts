import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // Clerk
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  // Mercado Pago
  MP_ACCESS_TOKEN: z.string().default(""),
  MP_PUBLIC_KEY: z.string().default(""),
  MP_WEBHOOK_SECRET: z.string().default(""),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().default(""),
  R2_ACCESS_KEY_ID: z.string().default(""),
  R2_SECRET_ACCESS_KEY: z.string().default(""),
  R2_BUCKET_NAME: z.string().default("questboard-assets"),
  R2_PUBLIC_URL: z.string().default(""),

  // FCM
  FCM_PROJECT_ID: z.string().default(""),
  FCM_PRIVATE_KEY: z.string().default(""),
  FCM_CLIENT_EMAIL: z.string().default(""),

  // Admin
  SUPER_ADMIN_CLERK_ID: z.string().default(""),

  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
