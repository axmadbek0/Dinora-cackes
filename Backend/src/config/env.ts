import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Default admin IDs as fallback
const DEFAULT_ADMIN_IDS = ['998812534', '8420880825', '8520722787'];

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  ADMIN_ID1: z.string().optional().default('998812534'),
  ADMIN_ID2: z.string().optional().default('8420880825'),
  ADMIN_ID3: z.string().optional().default('8520722787'),
  ADMIN_IDS: z.string().optional().default('998812534,8420880825,8520722787'),
  ADMIN_CHANNEL_ID: z.string().optional(),
  ADMIN_CARD_NUMBER: z.string().default('8600000000000000'),
  ADMIN_CARD_HOLDER: z.string().default('DINORA A.'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FRONTEND_WEB_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('DINORA_SUPER_SECURE_JWT_SECRET_KEY_2026_PRODUCTION'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Environment variable validation error');
}

const raw = parsedEnv.data;

// Collect all unique admin IDs (both individual and aggregated)
const adminIdSet = new Set<string>();

if (raw.ADMIN_ID1) adminIdSet.add(raw.ADMIN_ID1.trim());
if (raw.ADMIN_ID2) adminIdSet.add(raw.ADMIN_ID2.trim());
if (raw.ADMIN_ID3) adminIdSet.add(raw.ADMIN_ID3.trim());

if (raw.ADMIN_IDS) {
  raw.ADMIN_IDS.split(',').forEach((id) => {
    const clean = id.trim();
    if (clean) adminIdSet.add(clean);
  });
}

// Ensure defaults if empty
if (adminIdSet.size === 0) {
  DEFAULT_ADMIN_IDS.forEach((id) => adminIdSet.add(id));
}

const adminIdStrings = Array.from(adminIdSet);
const adminIdNumbers = adminIdStrings.map((id) => Number(id)).filter((n) => !isNaN(n));

export const env = {
  ...raw,
  ADMIN_ID1: raw.ADMIN_ID1 || '998812534',
  ADMIN_ID2: raw.ADMIN_ID2 || '8420880825',
  ADMIN_ID3: raw.ADMIN_ID3 || '8520722787',
  ADMIN_IDS: adminIdNumbers,
  ADMIN_ID_STRINGS: adminIdStrings,
};

export type EnvConfig = typeof env;

/**
 * Check if a telegramId belongs to any authorized admin
 */
export function isTelegramAdmin(telegramId?: number | string | bigint | null): boolean {
  if (!telegramId) return false;
  const idStr = String(telegramId).trim();
  const idNum = Number(telegramId);

  return (
    env.ADMIN_ID_STRINGS.includes(idStr) ||
    env.ADMIN_IDS.includes(idNum) ||
    idStr === env.ADMIN_ID1 ||
    idStr === env.ADMIN_ID2 ||
    idStr === env.ADMIN_ID3
  );
}
