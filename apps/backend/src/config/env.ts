import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().url(),
});

export const ENV = envSchema.parse(process.env);
