import { memorialDb, memorialFiles } from '@/db';
import { previewableImage } from '@/lib/reflection-attachments';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const url=new URL(request.url),id=url.searchParams.get('id');
 if(!id||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[0-2]$/.test(id))return new Response('Not found',{status:404});
 try{
  const file=await memorialDb().prepare('SELECT a.filename, a.content_type, a.object_key FROM reflection_attachments a JOIN visitor_reflections r ON r.id = a.reflection_id WHERE a.id = ?').bind(id).first<{filename:string;content_type:string;object_key:string}>();
  if(!file)return new Response('Not found',{status:404});
  const object=await memorialFiles().get(file.object_key);if(!object)return new Response('Not found',{status:404});
  const inline=previewableImage(file.content_type)&&url.searchParams.get('download')!=='1';
  return new Response(object.body,{headers:{'Content-Type':file.content_type,'Content-Length':String(object.size),'Content-Disposition':`${inline?'inline':'attachment'}; filename="attachment"; filename*=UTF-8''${encodeURIComponent(file.filename).replace(/'/g,'%27')}`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'"}});
 }catch(error){console.error('Load reflection attachment failed',error);return Response.json({error:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
