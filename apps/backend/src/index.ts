import app from "./app";
import { ENV } from "./config/env";
import { redis_client, connectRedis } from "./utils/redis-client";

const PORT = ENV.PORT || 8000;

process.on("SIGINT", async () => {
  console.log(`SIGINT received: Closing connections`);
  process.exit(0);
});

let server: import("http").Server | undefined;
server = undefined;

async function startServer() {
  await connectRedis();
  const server = app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
  });
  return server;
}

async function gracefulShutdown(signal: NodeJS.Signals) {
  console.log(`Received ${signal}, Shutting down...`);

  // Close HTTP server
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
    });
  }

  // Close Redis
  try {
    if (redis_client.isOpen) {
      await redis_client.quit();
      console.log("Redis connection closed");
    }
  } catch (error) {
    console.error("Error closing Redis:", error);
  }
  process.exit(0);
}

// Listen for signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

(async () => {
  try {
    server = await startServer();
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

export { server };
