import { z } from "zod";

const EnvSchema = z.object({
  HOST: z.url(),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
});

export const env = EnvSchema.parse(process.env);
