import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { connectDB } from "./src/lib/db.js";
import { corsOptions } from "./src/lib/cors.js";
import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import { app, server } from "./src/lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Required behind Render / reverse proxies so secure cookies and protocol headers work reliably
app.set("trust proxy", 1);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "bloop-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

const frontendDistPath = path.join(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

if (process.env.NODE_ENV === "production" && fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", service: "bloop-backend" });
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
