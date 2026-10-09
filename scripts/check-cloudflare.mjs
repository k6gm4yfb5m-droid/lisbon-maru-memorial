// Exercise the compiled production worker with isolated local D1/R2 storage.
// Never connects to the hosted database or uploads test data to the live site.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./sites-env.mjs";

const state = mkdtempSync(path.join(os.tmpdir(), "memorial-cloudflare-"));
const wrangler = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
const config = "dist/server/wrangler.json";
const built = JSON.parse(readFileSync(config, "utf8"));
assert.equal(built.name, "lisbon-maru-memorial", "Run a default independent build before its local tests.");
const migration = spawnSync(process.execPath, [wrangler, "d1", "migrations", "apply", "DB", "--local", "--persist-to", state, "--config", config], { encoding: "utf8" });
if (migration.status !== 0) {
  rmSync(state, { recursive: true, force: true });
  throw new Error(migration.stderr || migration.stdout);
}
const server = spawn(process.execPath, [wrangler, "dev", "--config", config, "--local", "--persist-to", state, "--ip", "127.0.0.1", "--port", "0", "--inspector-port", "0"], { stdio: ["ignore", "pipe", "pipe"] });
let output = "";
try {
  const base = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Local worker did not start: ${output}`)), 30000);
    const consume = chunk => {
      output += chunk;
      const match = output.match(/Ready on (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    };
    server.stdout.on("data", consume);
    server.stderr.on("data", consume);
    server.once("error", error => { clearTimeout(timeout); reject(error); });
    server.once("exit", code => { clearTimeout(timeout); reject(new Error(`Local worker exited ${code}: ${output}`)); });
  });
  const request = (url, options = {}) => fetch(`${base}${url}`, options);
  const cookie = response => response.headers.get("set-cookie")?.split(";")[0];
  assert.equal((await request("/?lang=zh")).status, 200);
  assert.equal((await request("/maps/world.geojson")).status, 200);
  const empty = await request("/api/reflections");
  assert.equal(empty.status, 200);
  assert.equal((await empty.json()).total, 0);
  const owner = cookie(empty);
  assert.ok(owner);
  const reflectionId = crypto.randomUUID();
  const form = new FormData();
  form.set("payload", JSON.stringify({ id: reflectionId, name: "", message: "", locale: "zh" }));
  form.append("attachments", new File([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jdaoAAAAASUVORK5CYII=", "base64")], "memorial.png", { type: "image/png" }));
  const saved = await request("/api/reflections", { method: "POST", headers: { Cookie: owner, Origin: base }, body: form });
  assert.equal(saved.status, 201, await saved.clone().text());
  const entry = (await saved.json()).entry;
  assert.equal(entry.message, "");
  assert.equal(entry.attachments.length, 1);
  const image = await request(entry.attachments[0].url);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/png");
  const other = await request("/api/reflections", { headers: { "oai-authenticated-user-id": "fake-user", "oai-authenticated-user-email": "fake@example.com" } });
  assert.equal((await other.json()).entries[0].mine, false);
  const otherOwner = cookie(other);
  const denied = await request(`/api/reflections?id=${reflectionId}`, { method: "DELETE", headers: { Cookie: otherOwner, Origin: base } });
  assert.equal(denied.status, 404);
  assert.equal((await request(`/api/reflections?id=${reflectionId}`, { method: "DELETE", headers: { Cookie: owner, Origin: "https://other.example" } })).status, 403);
  const personId = JSON.parse(readFileSync("data/casualties.json", "utf8"))[0].id;
  for (let i = 0; i < 2; i++) {
    const tribute = await request("/api/tributes", { method: "POST", headers: { Cookie: owner, Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ personId }) });
    assert.equal(tribute.status, 200);
    assert.equal((await tribute.json()).count, 1);
  }
  assert.equal((await request(`/api/reflections?id=${reflectionId}`, { method: "DELETE", headers: { Cookie: owner, Origin: base } })).status, 200);
  assert.equal((await request(entry.attachments[0].url)).status, 404);
  assert.equal((await (await request("/api/reflections")).json()).total, 0);
  console.log("Independent worker passed: page, local map, image-only upload, download, ownership, cross-origin protection, deletion, and tribute deduplication.");
} finally {
  const stopped = new Promise(resolve => server.once("exit", resolve));
  server.kill("SIGTERM");
  await Promise.race([stopped, new Promise(resolve => setTimeout(resolve, 5000))]);
  if (server.exitCode === null) server.kill("SIGKILL");
  rmSync(state, { recursive: true, force: true });
}
