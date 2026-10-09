import { unitNewNames } from "./new-locales";
import { extraUnitNames } from "./extra-locales";
import records from "@/data/casualties.json";
import type { Locale } from "./i18n";
// Explicit names and curated spelling variants found in the supplied CSV.
// No unit is inferred from rank, service number or biography. Source fields remain unchanged.
export const unitDefinitions = [
 {id:"hong-kong-singapore-artillery",name:"Hong Kong & Singapore Royal Artillery",pattern:/\bHong Kong\s*(?:&\s*)?Singapore Royal Artillery\b/i},
 {id:"hong-kong-naval-volunteer-reserve",name:"Hong Kong Royal Naval Volunteer Reserve",pattern:/\bHong Kong Royal Naval Volunteer Reserve\b/i},
 {id:"naval-dockyard-police",name:"Royal Naval Dockyard Police",pattern:/\bRoyal Naval Dockyard Police\b/i},
 {id:"hong-kong-dockyard-defence",name:"Hong Kong Dockyard Defence Corps",pattern:/\bHong Kong Dockyard Defence Corp[sa]\b/i},
 {id:"hong-kong-police",name:"Hong Kong Police Force",pattern:/\bHong Kong Police Force\b/i},
 {id:"army-medical-corps",name:"Royal Army Medical Corps",pattern:/\bRoyal Army Medical Corps\b/i},
 {id:"army-dental-corps",name:"Royal Army Dental Corps",pattern:/\bRoyal Army Dental Corps\b/i},
 {id:"royal-marines",name:"Royal Marines",pattern:/\bRoyal Marines\b/i},
 {id:"royal-signals",name:"Royal Corps of Signals",pattern:/\bRoyal Corp[se] of Sign(?:als|els|aln|ale)\b/i},
 {id:"royal-artillery",name:"Royal Artillery",pattern:/\bRoyal Artillery\b/i},
 {id:"royal-navy",name:"Royal Navy",pattern:/\bRoyal [NBHR]avy\b/i},
 {id:"royal-scots",name:"Royal Scots",pattern:/\b(?:Royal Scot[sae]|Boyal Scots)\b/i},
 {id:"middlesex",name:"Middlesex",pattern:/\b(?:Middlesex|Middlese|Kiddlesex)\b/i},
 {id:"royal-engineers",name:"Royal Engineers",pattern:/\bRoyal Engineer[sa]\b/i},
 {id:"st-john-ambulance",name:"St John Ambulance",pattern:/\bSt John Ambulance\b/i},
 {id:"merchant-navy",name:"Merchant Navy",pattern:/\bMerchant Navy\b/i},
] as const;
export type UnitId = typeof unitDefinitions[number]["id"] | "other";
export function identifyUnit(person: {name: string; details: string}): UnitId {
 const source = `${person.name} ${person.details}`;
 return unitDefinitions.find(unit=>unit.pattern.test(source))?.id || "other";
}
const otherNames = {zh:"其他",en:"Other",ja:"その他",fr:"Autres",ko:"기타"};
export function unitName(id: UnitId, locale: Locale): string {
 if(locale === "es" || locale === "ar") return unitNewNames[locale][id];
 if(locale === "fr" || locale === "ko") return extraUnitNames[locale][id];
 return id === "other" ? otherNames[locale] : unitDefinitions.find(unit=>unit.id===id)!.name;
}
export const memorialRecords = records.map(person=>({...person,unitId:identifyUnit(person)}));
export const unitGroups = [...unitDefinitions.map(unit=>({id:unit.id as UnitId,name:unit.name})).sort((a,b)=>a.name.localeCompare(b.name)),{id:"other" as UnitId,name:"Other"}].map(unit=>({...unit,count:memorialRecords.filter(person=>person.unitId===unit.id).length})).filter(unit=>unit.count>0);
