const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const routes = require("./routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

// ── Global middlewares ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (_, res) =>
  res.json({ status: "ok", service: "Eduverse API" }),
);

// ── API routes ─────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── 404 & error handler ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
