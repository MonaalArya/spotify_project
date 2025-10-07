import express, { Application, Request, Response } from "express";
import compression from "compression";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";

import authRouter from "./routes/auth.routes";

const app: Application = express();

// middlewares
//include rateLimit module later on
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: false,
    credentials: true,
  })
);

// limit payload size and form submissions size
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// avoid multiple query params
app.use(hpp());

app.use("/api/auth", authRouter);

export default app;
