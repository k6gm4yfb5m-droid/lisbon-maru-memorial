import { memorialDb } from "@/db";
import records from "@/data/casualties.json";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export const dynamic = "force-dynamic";
const ids = new Set(records.map(p => p.id));
const jsonHeaders = {"Cache-Control": "no-store"};
const response = (body: unknown, status=200, extra: Record<string,string>={}) => Response.json(body,{status,headers:{...jsonHeaders,...extra}});
function cookieVisitor(request: Request) {
 const id = request.headers.get("cookie")?.split(";").map(v=>v.trim()).find(v=>v.startsWith("lm_visitor="))?.slice(11);
 return id && /^[a-f0-9-]{36}$/.test(id) ? id : null;
}
async function identity(request: Request) {
 const user = await getChatGPTUser();
 if (user) return {id:`user:${user.userId}`,cookie:null};
 const existing = cookieVisitor(request);
 const id = existing || crypto.randomUUID();
 return {id:`visitor:${id}`,cookie: existing ? null : `lm_visitor=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(request.url).protocol==="https:" ? "; Secure" : ""}`};
}
async function readCounts(personId: string, visitorId: string) {
 const db = memorialDb();
 const [count,mine] = await Promise.all([
  db.prepare("SELECT COUNT(*) AS count FROM tributes WHERE person_id = ?").bind(personId).first<{count:number}>(),
  db.prepare("SELECT id FROM tributes WHERE person_id = ? AND visitor_id = ? LIMIT 1").bind(personId,visitorId).first(),
 ]);
 return {count:count?.count || 0,remembered:!!mine};
}
export async function GET(request: Request) {
 const personId = new URL(request.url).searchParams.get("personId");
 if (!personId || !ids.has(personId)) return response({error:"未找到该名单记录。"},404);
 try {
  const visitor = await identity(request);
  return response(await readCounts(personId,visitor.id),200,visitor.cookie ? {"Set-Cookie":visitor.cookie} : {});
 } catch (error) {console.error("Read memorial tributes failed",error);return response({error:"献花记录暂时无法读取，请稍后重试。"},503);}
}
export async function POST(request: Request) {
 const origin = request.headers.get("origin");
 if (origin && origin !== new URL(request.url).origin) return response({error:"请在纪念网站内献花。"},403);
 if (Number(request.headers.get("content-length") || 0)>1024) return response({error:"请求过长。"},413);
 let body: unknown;
 try {body = await request.json();} catch {return response({error:"无效的献花请求。"},400);}
 const personId = (body as {personId?: unknown})?.personId;
 if (typeof personId!=="string" || !ids.has(personId)) return response({error:"未找到该名单记录。"},404);
 try {
  const visitor = await identity(request);
  await memorialDb().prepare("INSERT INTO tributes (id, person_id, visitor_id, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(person_id, visitor_id) DO NOTHING").bind(crypto.randomUUID(),personId,visitor.id,new Date().toISOString()).run();
  return response(await readCounts(personId,visitor.id),200,visitor.cookie ? {"Set-Cookie":visitor.cookie} : {});
 } catch (error) {console.error("Save memorial tribute failed",error);return response({error:"献花未能保存，请稍后重试。"},503);}
}
