import dotenv from "dotenv";

dotenv.config();

const parseAllowedOrigins = () => {
  const raw = process.env.CLIENT_URL;
  if (!raw || !raw.trim()) {
    return ["http://localhost:5173", "http://127.0.0.1:5173", "https://*.vercel.app"];
  }
  return raw
    .split(",")
    .map((entry) => entry.trim().replace(/\/+$/, ""))
    .filter(Boolean);
};

const matchesOriginRule = (origin, rule) => {
  if (rule === "*") return true;
  if (origin === rule) return true;
  if (rule.includes("*")) {
    const escaped = rule
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`).test(origin);
  }
  return false;
};

export const corsOriginValidator = (origin, callback) => {
  if (!origin) return callback(null, true);

  const normalizedOrigin = origin.replace(/\/+$/, "");
  const allowed = parseAllowedOrigins();

  if (process.env.NODE_ENV !== "production") {
    allowed.push("http://localhost:5173", "http://127.0.0.1:5173");
  }

  const isAllowed = allowed.some((rule) =>
    matchesOriginRule(normalizedOrigin, rule)
  );

  if (isAllowed) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

export const corsOptions = {
  origin: corsOriginValidator,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
