import { envSchema } from "../validators/env.validator";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const ENV = envSchema.parse(process.env);
