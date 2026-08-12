import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  ADMIN_IDS: z.string().min(1, 'ADMIN_IDS is required').transform((val) =>
    val.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id))
  ),
  ADMIN_CHANNEL_ID: z.string().optional(),
  ADMIN_CARD_NUMBER: z.string().default('8600 4905 1234 5678'),
  ADMIN_CARD_HOLDER: z.string().default('DINORA SHIRINLIKLARI / ADMIN'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().default('DINORA_SUPER_SECURE_JWT_SECRET_KEY_2026_PRODUCTION'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Environment variable validation error');
}

export const env = parsedEnv.data;
