import { env } from "cloudflare:workers";
export function memorialDb(): D1Database {
 if (!env.DB) throw new Error("Memorial database unavailable");
 return env.DB;
}
export function memorialFiles(): R2Bucket {
 if (!env.BUCKET) throw new Error("Memorial file storage unavailable");
 return env.BUCKET;
}
