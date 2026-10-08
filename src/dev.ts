import "dotenv/config";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    port: { type: "string" },
  },
});

if (values.port !== undefined) {
  const port = Number(values.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("--port must be an integer between 1 and 65535");
  }
  process.env.PORT = String(port);
}

console.log(`[Startup] Loading app on port ${process.env.PORT || "3000"}`);
await import("../server/_core/index");
