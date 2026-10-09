export const attachmentLimit=3;
export const attachmentByteLimit=5*1024*1024;
export type ReflectionAttachment={id:string;filename:string;contentType:string;size:number;url:string};
export const previewableImage=(type:string)=>['image/jpeg','image/png','image/webp'].includes(type);
