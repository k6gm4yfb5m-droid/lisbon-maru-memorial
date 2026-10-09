import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { requireDeploymentConfig } from "./cloudflare-config.mjs";
import "./sites-env.mjs";

const task = process.argv[2];
const configFile = fileURLToPath(new URL("../vite.cloudflare.config.ts", import.meta.url));
const migrationConfig = fileURLToPath(new URL("../.cloudflare/wrangler.json", import.meta.url));
const builtConfig = fileURLToPath(new URL("../dist/server/wrangler.json", import.meta.url));

function wrangler(args) {
  const result = spawnSync(process.execPath, [
    fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url)), ...args,
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

if (task === "build") {
  process.env.NODE_ENV = "production";
  const { createBuilder } = await import("vite");
  await (await createBuilder({ configFile })).buildApp();
} else if (task === "dev") {
  const { createServer } = await import("vite");
  const server = await createServer({ configFile, server: { host: "127.0.0.1", port: 5174, strictPort: true } });
  await server.listen();
  server.printUrls();
} else if (["check", "migrate", "deploy"].includes(task)) {
  const config = requireDeploymentConfig();
  if (task === "check") {
    console.log("Independent hosting configuration is complete. No resources were changed.");
  } else if (task === "migrate") {
    mkdirSync(new URL("../.cloudflare/", import.meta.url), { recursive: true });
    writeFileSync(migrationConfig, JSON.stringify(config, null, 2));
    wrangler(["d1", "migrations", "apply", "DB", "--remote", "--config", migrationConfig]);
  } else {
    const built = JSON.parse(readFileSync(builtConfig, "utf8"));
    // Refuse to deploy a Sites build or a stale database binding by accident.
    if (built.name !== config.name || built.d1_databases?.[0]?.database_id !== config.d1_databases[0].database_id || built.r2_buckets?.[0]?.bucket_name !== config.r2_buckets[0].bucket_name) {
      throw new Error("Build with npm run build:cloudflare using the current hosting settings before deploying.");
    }
    wrangler(["deploy", "--config", builtConfig]);
  }
} else {
  throw new Error("Expected build, dev, check, migrate, or deploy.");
}
