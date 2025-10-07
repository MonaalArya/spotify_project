import { createClient } from "redis";
import { ENV } from "../config/env";

export const redis_client = createClient({
  url: ENV.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error("Max retries exceeded");
      return Math.min(retries * 100, 3000);
    },
  },
}).on("error", (err) => console.error("Redis Client Error", err));

export async function connectRedis(): Promise<void> {
  try {
    if (!redis_client.isReady) {
      await redis_client.connect();
      console.log("Connected to Redis");
    }
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
}
