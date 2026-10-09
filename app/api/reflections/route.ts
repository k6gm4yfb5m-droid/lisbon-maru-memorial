import { memorialDb, memorialFiles } from "@/db";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { validLocale } from "@/lib/i18n";
import { attachmentLimit, attachmentByteLimit } from "@/lib/reflection-attachments";
export const dynamic = "force-dynamic";
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const reply=(body:unknown,status=200,cookie:string|null=null)=>Response.json(body,{status,headers:{"Cache-Control":"no-store",...(cookie?{"Set-Cookie":cookie}:{})}});
async function visitor(request:Request){
 const user=await getChatGPTUser();
 if(user)return {id:`user:${user.userId}`,cookie:null};
 const stored=request.headers.get("cookie")?.split(";").map(v=>v.trim()).find(v=>v.startsWith("lm_visitor="))?.slice(11);
 const existing=stored && uuid.test(stored) ? stored : null,id=existing || crypto.randomUUID();
 return {id:`visitor:${id}`,cookie:existing?null:`lm_visitor=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(request.url).protocol==="https:"?"; Secure":""}`};
}
type Row={id:string;visitor_id:string;name:string;message:string;locale:string;created_at:number};
type AttachmentRow={id:string;reflection_id:string;filename:string;content_type:string;byte_size:number;object_key:string};
async function publicRows(db:D1Database,rows:Row[],owner:string){
 const attachments=rows.length?(await db.prepare(`SELECT id, reflection_id, filename, content_type, byte_size FROM reflection_attachments WHERE reflection_id IN (${rows.map(()=>'?').join(',')}) ORDER BY id`).bind(...rows.map(row=>row.id)).all<AttachmentRow>()).results:[];
 return rows.map(row=>({id:row.id,name:row.name,message:row.message,locale:row.locale,createdAt:row.created_at,mine:row.visitor_id===owner,attachments:attachments.filter(file=>file.reflection_id===row.id).map(file=>({id:file.id,filename:file.filename,contentType:file.content_type,size:file.byte_size,url:`/api/reflections/attachment?id=${file.id}`}))}));
}
const foreign=(request:Request)=>{const origin=request.headers.get("origin");return (origin && origin!==new URL(request.url).origin) || request.headers.get("sec-fetch-site")==="cross-site";};
class OversizedBody extends Error{}
async function boundedBody(request:Request,limit:number){
 if(Number(request.headers.get('content-length')||0)>limit)throw new OversizedBody();
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new OversizedBody();}chunks.push(value);}}finally{reader.releaseLock();}
 const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.byteLength;}return result;
}
function imageType(bytes:Uint8Array){
 if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value))return 'image/png';
 if(bytes.length>=12&&new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')return 'image/webp';
 return 'application/octet-stream';
}
export async function GET(request:Request){
 const page=Number(new URL(request.url).searchParams.get("page")||0);
 if(!Number.isInteger(page)||page<0||page>10000)return reply({error:"invalid"},400);
 try{
  const owner=await visitor(request),db=memorialDb();
  const [rows,total]=await Promise.all([db.prepare("SELECT id, visitor_id, name, message, locale, created_at FROM visitor_reflections ORDER BY created_at DESC, id DESC LIMIT 4 OFFSET ?").bind(page*4).all<Row>(),db.prepare("SELECT COUNT(*) AS count FROM visitor_reflections").first<{count:number}>()]);
  return reply({entries:await publicRows(db,rows.results,owner.id),total:total?.count||0},200,owner.cookie);
 }catch(error){console.error("Load visitor reflections failed",error);return reply({error:"unavailable"},503);}
}
export async function POST(request:Request){
 if(foreign(request))return reply({error:"forbidden"},403);
 let body,files:File[]=[];
 try{
  const multipart=request.headers.get('content-type')?.startsWith('multipart/form-data'),bytes=await boundedBody(request,multipart?attachmentLimit*attachmentByteLimit+65536:16384);
  if(multipart){
   const form=await new Response(bytes,{headers:{'Content-Type':request.headers.get('content-type')!}}).formData(),payload=form.get('payload');
   if(typeof payload!=='string'||payload.length>16384)return reply({error:'invalid'},400);
   body=JSON.parse(payload);
   const values=form.getAll('attachments');if(values.some(value=>typeof value==='string'))return reply({error:'invalid'},400);files=values as File[];
  }else body=JSON.parse(new TextDecoder().decode(bytes));
 }catch(error){return reply({error:"invalid"},error instanceof OversizedBody?413:400);}
 if(files.length>attachmentLimit)return reply({error:'fileCount'},400);
 if(files.some(file=>file.size>attachmentByteLimit||file.size===0))return reply({error:'fileSize'},400);
 if(!body || typeof body!=="object" || typeof body.id!=="string" || !uuid.test(body.id) || typeof body.name!=="string" || body.name.trim().length>40 || typeof body.message!=="string" || (!body.message.trim()&&!files.length) || body.message.trim().length>2000 || !validLocale(body.locale))return reply({error:"invalid"},400);
 const uploaded:string[]=[];
 try{
  const owner=await visitor(request),db=memorialDb();
  const existing=await db.prepare("SELECT id, visitor_id, name, message, locale, created_at FROM visitor_reflections WHERE id = ?").bind(body.id).first<Row>();
  if(existing)return existing.visitor_id===owner.id?reply({entry:(await publicRows(db,[existing],owner.id))[0]},200,owner.cookie):reply({error:"forbidden"},403);
  const ownerHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(owner.id)))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const attachments=[];
  for(let i=0;i<files.length;i++){
   const file=files[i],bytes=new Uint8Array(await file.arrayBuffer()),contentType=imageType(bytes),id=`${body.id}-${i}`,key=`reflections/${body.id}/${ownerHash}/${i}`;
   const filename=file.name.replace(/[\x00-\x1f\x7f/\\]/g,'_').trim().slice(0,120)||'attachment';
   await memorialFiles().put(key,bytes,{httpMetadata:{contentType}});uploaded.push(key);
   attachments.push({id,key,filename,contentType,size:file.size});
  }
  // The record and its file metadata commit together. Stable IDs make retries idempotent.
  const now=Date.now(),statements=[db.prepare("INSERT INTO visitor_reflections (id, visitor_id, name, message, locale, created_at) SELECT ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM visitor_reflections WHERE visitor_id = ? AND created_at > ?) < 3 ON CONFLICT(id) DO NOTHING").bind(body.id,owner.id,body.name.trim(),body.message.trim(),body.locale,now,owner.id,now-60000)];
  for(const file of attachments)statements.push(db.prepare("INSERT INTO reflection_attachments (id, reflection_id, filename, content_type, byte_size, object_key) SELECT ?, id, ?, ?, ?, ? FROM visitor_reflections WHERE id = ? AND visitor_id = ? ON CONFLICT(id) DO NOTHING").bind(file.id,file.filename,file.contentType,file.size,file.key,body.id,owner.id));
  const result=await db.batch(statements);
  const row=await db.prepare("SELECT id, visitor_id, name, message, locale, created_at FROM visitor_reflections WHERE id = ?").bind(body.id).first<Row>();
  if(!row||row.visitor_id!==owner.id){if(uploaded.length)await memorialFiles().delete(uploaded);return reply({error:row?'forbidden':'wait'},row?403:429,owner.cookie);}
  return reply({entry:(await publicRows(db,[row],owner.id))[0]},result[0].meta.changes?201:200,owner.cookie);
 }catch(error){
  // Remove unattached objects after a rolled-back operation, without deleting committed uploads.
  if(uploaded.length){try{const committed=await memorialDb().prepare("SELECT object_key FROM reflection_attachments WHERE reflection_id = ?").bind(body.id).all<{object_key:string}>(),keys=uploaded.filter(key=>!committed.results.some(file=>file.object_key===key));if(keys.length)await memorialFiles().delete(keys);}catch(cleanup){console.error('Reflection attachment cleanup failed',cleanup);}}
  console.error("Save visitor reflection failed",error);return reply({error:"unavailable"},503);
 }
}
export async function DELETE(request:Request){
 if(foreign(request))return reply({error:"forbidden"},403);
 const id=new URL(request.url).searchParams.get("id");if(!id||!uuid.test(id))return reply({error:"invalid"},400);
 try{
  const owner=await visitor(request),db=memorialDb();
  const own=await db.prepare("SELECT id FROM visitor_reflections WHERE id = ? AND visitor_id = ?").bind(id,owner.id).first();
  if(!own)return reply({error:'missing'},404,owner.cookie);
  const files=await db.prepare("SELECT object_key FROM reflection_attachments WHERE reflection_id = ?").bind(id).all<{object_key:string}>();
  if(files.results.length)await memorialFiles().delete(files.results.map(file=>file.object_key));
  const result=await db.prepare("DELETE FROM visitor_reflections WHERE id = ? AND visitor_id = ?").bind(id,owner.id).run();
  return result.meta.changes?reply({deleted:true},200,owner.cookie):reply({error:"missing"},404,owner.cookie);
 }catch(error){console.error("Delete visitor reflection failed",error);return reply({error:"unavailable"},503);}
}
