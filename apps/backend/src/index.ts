import app from "./app";
import { ENV } from "./config/env";

const PORT = ENV.PORT || 8000;

process.on("SIGINT", async () => {
  console.log(`SIGINT received: Closing connections`);
  process.exit(0);
});

const server = app.listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT}`);
});

export { server };
