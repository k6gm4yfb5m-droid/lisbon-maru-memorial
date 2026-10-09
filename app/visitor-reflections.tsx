"use client";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MessageSquare, Send, Trash2, Paperclip, FileText, Download, X } from 'lucide-react';
import { languageTags, numberLocales, type Locale } from '@/lib/i18n';
import { visitorReflectionTranslations, reflectionAttachmentTranslations } from '@/lib/visitor-reflections';
import { attachmentLimit, attachmentByteLimit, previewableImage, type ReflectionAttachment } from '@/lib/reflection-attachments';
type Entry={id:string;name:string;message:string;locale:Locale;createdAt:number;mine:boolean;attachments:ReflectionAttachment[]};
type DraftFile={id:string;file:File};
function fileSize(size:number,locale:Locale){const scale=size<1024?0:size<1024*1024?1:2,units=locale==='fr'?['o','Ko','Mo']:['B','KB','MB'];return `${(size/1024**scale).toLocaleString(numberLocales[locale],{maximumFractionDigits:1})} ${units[scale]}`;}
function DraftAttachment({file,locale,disabled,onRemove}:{file:File;locale:Locale;disabled:boolean;onRemove:()=>void}){
 const [url,setUrl]=useState<string|null>(null),t=reflectionAttachmentTranslations[locale];
 useEffect(()=>{if(!previewableImage(file.type))return;const url=URL.createObjectURL(file);setUrl(url);return()=>URL.revokeObjectURL(url);},[file]);
 return <li>{url?<img src={url} alt={file.name}/>:<FileText size={20} aria-hidden="true"/>}<span dir="auto">{file.name}<small>{fileSize(file.size,locale)}</small></span><button type="button" aria-label={`${t.removeFile}: ${file.name}`} disabled={disabled} onClick={onRemove}><X size={16}/></button></li>;
}
export default function VisitorReflections({locale}:{locale:Locale}){
 const t={...visitorReflectionTranslations[locale],...reflectionAttachmentTranslations[locale]};
 const [files,setFiles]=useState<DraftFile[]>([]),[fileError,setFileError]=useState<'fileCount'|'fileSize'|null>(null);
 const fileInput=useRef<HTMLInputElement>(null);
 const [name,setName]=useState(''),[message,setMessage]=useState(''),[entries,setEntries]=useState<Entry[]>([]),[total,setTotal]=useState(0),[page,setPage]=useState(0),[revision,setRevision]=useState(0);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState<string|null>(null),[confirm,setConfirm]=useState<string|null>(null);
 const [error,setError]=useState<'readError'|'saveError'|'deleteError'|'wait'|null>(null),[status,setStatus]=useState<'saved'|'deleted'|null>(null);
 const pendingId=useRef<string|null>(null);
 useEffect(()=>{
  const abort=new AbortController();setLoading(true);
  fetch(`/api/reflections?page=${page}`,{signal:abort.signal,cache:'no-store'}).then(async response=>{if(!response.ok)throw new Error('read');return await response.json() as {entries:Entry[];total:number};}).then(data=>{setEntries(data.entries);setTotal(data.total);setError(value=>value==='readError'?null:value);}).catch(()=>{if(!abort.signal.aborted)setError('readError');}).finally(()=>{if(!abort.signal.aborted)setLoading(false);});
  return()=>abort.abort();
 },[page,revision]);
 async function save(event:FormEvent){
  event.preventDefault();if((!message.trim()&&!files.length)||saving)return;
  setSaving(true);setError(null);setStatus(null);pendingId.current??=crypto.randomUUID();
  try{
   const payload=JSON.stringify({id:pendingId.current,name,message,locale}),form=new FormData();form.set('payload',payload);for(const item of files)form.append('attachments',item.file);
   const response=await fetch('/api/reflections',{method:'POST',...(files.length?{body:form}:{headers:{'Content-Type':'application/json'},body:payload})});
   if(!response.ok){const result=await response.json().catch(()=>null) as {error?:string}|null;if(result?.error==='fileCount'||result?.error==='fileSize')setFileError(result.error);else setError(response.status===429?'wait':'saveError');return;}
   setMessage('');setFiles([]);setFileError(null);pendingId.current=null;setPage(0);setRevision(value=>value+1);setStatus('saved');
  }catch{setError('saveError');}finally{setSaving(false);}
 }
 async function remove(id:string){
  setDeleting(id);setError(null);setStatus(null);
  try{
   const response=await fetch(`/api/reflections?id=${encodeURIComponent(id)}`,{method:'DELETE'});
   if(!response.ok)throw new Error('delete');
   setConfirm(null);setStatus('deleted');if(entries.length===1&&page>0)setPage(value=>value-1);else setRevision(value=>value+1);
  }catch{setError('deleteError');}finally{setDeleting(null);}
 }
 const busy=saving||!!deleting;
 return <section id="visitor-reflections" className="visitor-reflections" aria-labelledby="visitor-reflections-title">
  <div className="visitor-reflections-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="visitor-reflections-title">{t.title}</h2><p>{t.intro}</p></div>
  <div className="visitor-reflections-layout">
   <form className="visitor-reflection-form" onSubmit={save}>
    <MessageSquare size={24} strokeWidth={1.4} aria-hidden="true"/>
    <label htmlFor="reflection-name">{t.name}</label><input id="reflection-name" value={name} maxLength={40} placeholder={t.namePlaceholder} disabled={saving} onChange={event=>{setName(event.target.value);pendingId.current=null;}} autoComplete="nickname"/>
    <label htmlFor="reflection-message">{t.message}</label><textarea id="reflection-message" rows={6} maxLength={2000} value={message} placeholder={t.placeholder} disabled={saving} onChange={event=>{setMessage(event.target.value);pendingId.current=null;}} aria-describedby="reflection-public-note reflection-ownership"/>
    <div className="reflection-file-picker">
     <input ref={fileInput} type="file" multiple hidden aria-label={t.addFiles} disabled={saving} onChange={event=>{
      const selected=Array.from(event.target.files||[]);event.target.value='';if(!selected.length)return;
      if(files.length+selected.length>attachmentLimit){setFileError('fileCount');return;}
      if(selected.some(file=>!file.size||file.size>attachmentByteLimit)){setFileError('fileSize');return;}
      setFiles(current=>[...current,...selected.map(file=>({id:crypto.randomUUID(),file}))]);setFileError(null);pendingId.current=null;
     }}/>
     <button type="button" className="reflection-add-files" disabled={saving||files.length>=attachmentLimit} onClick={()=>fileInput.current?.click()} aria-describedby="reflection-file-note"><Paperclip size={16}/>{t.addFiles}</button>
     <p id="reflection-file-note">{t.attachmentNote}</p>
     {!!files.length&&<ul className="reflection-draft-files" aria-label={t.attachments}>{files.map(item=><DraftAttachment key={item.id} file={item.file} locale={locale} disabled={saving} onRemove={()=>{setFiles(current=>current.filter(file=>file.id!==item.id));setFileError(null);pendingId.current=null;}}/>)}</ul>}
     {fileError&&<p className="reflection-file-error" role="alert">{t[fileError]}</p>}
    </div>
    <div className="reflection-form-actions"><span>{message.length.toLocaleString(numberLocales[locale])} / {(2000).toLocaleString(numberLocales[locale])}</span><button type="submit" disabled={busy||loading||(!message.trim()&&!files.length)}><Send size={16}/>{saving?t.saving:t.save}</button></div>
    <p id="reflection-public-note">{t.notice}</p><p id="reflection-ownership">{t.ownership}</p>
    <div className="reflection-feedback" aria-live="polite">{status&&<p>{t[status]}</p>}{error&&<p role="alert">{t[error]}{error==='readError'&&<button type="button" onClick={()=>setRevision(value=>value+1)}>{t.retry}</button>}</p>}</div>
   </form>
   <div className="visitor-reflection-wall" aria-busy={loading}>
    <div className="reflection-wall-heading"><h3>{t.list}</h3><span>{total.toLocaleString(numberLocales[locale])} {t.count}</span></div>
    {loading?<p className="reflection-empty">{t.loading}</p>:error==='readError'?<p className="reflection-empty">{t.readError}</p>:entries.length===0?<p className="reflection-empty">{t.empty}</p>:<ol className="reflection-list">{entries.map(entry=><li key={entry.id}>
     <article className="reflection-entry"><header><strong dir="auto">{entry.name||t.anonymous}</strong>{entry.mine&&<span>{t.mine}</span>}<time dateTime={new Date(entry.createdAt).toISOString()}>{new Intl.DateTimeFormat(numberLocales[locale],{dateStyle:'medium'}).format(entry.createdAt)}</time></header>{entry.message&&<p lang={languageTags[entry.locale]} dir="auto">{entry.message}</p>}
      {!!entry.attachments?.length&&<ul className="reflection-attachments" aria-label={t.attachments}>{entry.attachments.map(file=><li key={file.id}>
       {previewableImage(file.contentType)&&<a href={file.url} target="_blank" rel="noreferrer" aria-label={file.filename}><img src={file.url} alt={file.filename} loading="lazy"/></a>}
       <a className="reflection-file-download" href={`${file.url}&download=1`} download={file.filename}><Download size={16}/><span dir="auto">{file.filename}<small>{t.download} · {fileSize(file.size,locale)}</small></span></a>
      </li>)}</ul>}
      {entry.mine&&<div className="reflection-delete">{confirm===entry.id?<><span>{t.confirm}</span><button type="button" disabled={busy} onClick={()=>remove(entry.id)}>{deleting===entry.id?t.deleting:t.yes}</button><button type="button" disabled={busy} onClick={()=>setConfirm(null)}>{t.cancel}</button></>:<button type="button" disabled={busy} onClick={()=>setConfirm(entry.id)}><Trash2 size={14}/>{t.delete}</button>}</div>}
     </article>
    </li>)}</ol>}
    <nav className="reflection-pagination" aria-label={t.page}><button type="button" disabled={page===0||loading||busy} onClick={()=>{setConfirm(null);setPage(value=>value-1);}}>{t.previous}</button><span>{(page+1).toLocaleString(numberLocales[locale])} / {Math.max(1,Math.ceil(total/4)).toLocaleString(numberLocales[locale])}</span><button type="button" disabled={(page+1)*4>=total||loading||busy} onClick={()=>{setConfirm(null);setPage(value=>value+1);}}>{t.next}</button></nav>
   </div>
  </div>
 </section>;
}
