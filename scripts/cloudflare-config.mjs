import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
export const placeholderDatabaseId = "00000000-0000-4000-8000-000000000000";

export function cloudflareConfig(environment = process.env) {
  const name = environment.MEMORIAL_WORKER_NAME || "lisbon-maru-memorial";
  const domain = environment.MEMORIAL_DOMAIN || "";
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(name)) throw new Error("Invalid MEMORIAL_WORKER_NAME.");
  if (domain && !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)) {
    throw new Error("MEMORIAL_DOMAIN must be a hostname, without https:// or a path.");
  }
  return {
    name,
    main: path.join(root, "build/cloudflare-worker.ts"),
    compatibility_date: "2026-05-15",
    compatibility_flags: ["nodejs_compat"],
    workers_dev: !domain,
    ...(domain ? { routes: [{ pattern: domain, custom_domain: true }] } : {}),
    d1_databases: [{
      binding: "DB",
      database_name: environment.MEMORIAL_DB_NAME || "lisbon-maru-memorial",
      database_id: environment.MEMORIAL_DB_ID || placeholderDatabaseId,
      migrations_dir: path.join(root, "drizzle"),
    }],
    r2_buckets: [{
      binding: "BUCKET",
      bucket_name: environment.MEMORIAL_BUCKET_NAME || "lisbon-maru-attachments",
    }],
  };
}

export function requireDeploymentConfig(environment = process.env) {
  const config = cloudflareConfig(environment);
  const id = config.d1_databases[0].database_id;
  if (id === placeholderDatabaseId || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) {
    throw new Error("Set MEMORIAL_DB_ID to your own Cloudflare D1 database ID before deploying.");
  }
  return config;
}
