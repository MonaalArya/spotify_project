import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.url({
    message: "DATABASE_URL must be a valid URL",
  }),
  REDIS_URL: z.url({
    message: "REDIS_URL must be a valid Redis URL",
  }),
  MAIL_USER: z.email(),
  MAIL_PASS: z.string(),
});
