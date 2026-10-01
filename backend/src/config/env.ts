import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const cleanStr = (val?: string) => {
  if (!val) return val;
  return val.trim().replace(/^["']|["']$/g, '');
};

const envSchema = z.object({
  PORT: z.preprocess((val) => {
    if (typeof val === 'string') return cleanStr(val);
    return val;
  }, z.coerce.number().default(4000)),
  NODE_ENV: z.preprocess((val) => {
    if (typeof val === 'string') {
      const clean = cleanStr(val)?.toLowerCase();
      if (clean === 'development' || clean === 'dev') return 'development';
      if (clean === 'test') return 'test';
      return 'production';
    }
    return val;
  }, z.enum(['development', 'production', 'test']).default('development')),
  CLIENT_URL: z.preprocess((val) => {
    if (typeof val === 'string') return cleanStr(val);
    return val;
  }, z.string().default('http://localhost:5173')),
  DATABASE_URL: z.preprocess((val) => {
    if (typeof val === 'string') return cleanStr(val);
    return val;
  }, z.string().default('file:./dev.db')),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
