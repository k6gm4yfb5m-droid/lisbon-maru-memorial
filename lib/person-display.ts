// Some supplied CSV rows contain the entire service record in the name column.
// Separate only explicit rank markers; keep the source fields and record IDs intact.
const rankMarker = /\b(?:Lance Sergeant|Leading Seaman|Petty Officer|Seaman Gunner|Able Seaman|Lance Corp\.|C\.P\.O\.\s+Writer|Private|Sapper|Signalman|Gunner|QMS|Corporal)(?=\s|[-\d]|$)/i;
export function personDisplay(person:{name:string;details:string}) {
 const match=rankMarker.exec(person.name);
 if(!match) return {name:person.name,details:person.details};
 return {
  name:person.name.slice(0,match.index).trim().replace(/\s*-\s*$/,""),
  details:[person.name.slice(match.index).trim(),person.details].filter(Boolean).join(" · "),
 };
}
