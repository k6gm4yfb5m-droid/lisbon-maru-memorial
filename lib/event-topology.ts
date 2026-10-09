import { topologyNewTranslations } from "./new-locales";
import { topologyExtraTranslations } from "./extra-locales";
import { historicalFigures, otherRecaptured, rescuedThenRecaptured, historicalSource } from "./historical-data";

export const topologyNodes = [
  {id:"hongkong",kind:"place",x:100,y:145},
  {id:"moji",kind:"place",x:1150,y:110},
  {id:"dongji",kind:"place",x:270,y:310},
  {id:"attack",kind:"attack",x:460,y:350},
  {id:"died",kind:"death",x:280,y:580,value:historicalFigures.died,percent:"46%"},
  {id:"captured",kind:"captive",x:460,y:580,value:otherRecaptured,percent:"33%"},
  {id:"rescued",kind:"survivor",x:660,y:580,value:historicalFigures.rescued,percent:"21%"},
  {id:"rescue",kind:"rescue",x:855,y:395,value:198},
  {id:"recaptured",kind:"captive",x:1040,y:240,value:rescuedThenRecaptured},
  {id:"escaped",kind:"survivor",x:1040,y:580,value:historicalFigures.escaped},
  {id:"britain",kind:"place",x:1140,y:730},
] as const;
export type TopologyNodeId = typeof topologyNodes[number]["id"];
export const topologyCategories = ["planned","actual","place","attack","death","captive","survivor","rescue"] as const;
export type TopologyCategory = typeof topologyCategories[number];
export type TopologySelection = {type:"node";id:TopologyNodeId} | {type:"category";id:TopologyCategory} | null;
export function topologyNodeRadius(kind: typeof topologyNodes[number]["kind"]){return kind==="place" ? 28 : kind==="attack" ? 27 : kind==="rescue" ? 25 : 20;}
type Point = readonly [number,number];
type Curve = readonly [Point,Point,Point,Point];
const mix=(a:Point,b:Point,t:number):Point=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
function splitCurve(p:Curve,t:number):[Curve,Curve]{
  const a=mix(p[0],p[1],t),b=mix(p[1],p[2],t),c=mix(p[2],p[3],t),d=mix(a,b,t),e=mix(b,c,t),f=mix(d,e,t);
  return [[p[0],a,d,f],[f,e,c,p[3]]];
}
function outsideNode(point:Point,node:typeof topologyNodes[number]){
  // Leave only enough clearance for half the highlighted line width.
  const clearance=2+(node.kind==="rescue" ? .75 : 0);
  if(Math.hypot(point[0]-node.x,point[1]-node.y)<topologyNodeRadius(node.kind)+clearance)return false;
  return node.kind!=="place" || Math.hypot(point[0]-node.x-20,point[1]-node.y-19)>=14;
}
// Trim the actual Bézier geometry, including the secondary place circle.
// Lines meet the symbol edges without continuing beneath the filled circles.
function connectedCurve(from:TopologyNodeId,to:TopologyNodeId,controls:readonly [Point,Point]){
  const start=topologyNodes.find(n=>n.id===from)!,end=topologyNodes.find(n=>n.id===to)!;
  const curve:Curve=[[start.x,start.y],...controls,[end.x,end.y]];
  function boundary(node:typeof topologyNodes[number],reverse:boolean){
    let inside=reverse ? 1 : 0,outside=reverse ? 0 : 1;
    for(let i=0;i<40;i++){const t=(inside+outside)/2;if(outsideNode(splitCurve(curve,t)[0][3],node))outside=t;else inside=t;}
    return (inside+outside)/2;
  }
  const first=boundary(start,false),last=boundary(end,true);
  const trimmed=splitCurve(splitCurve(curve,last)[0],first/last)[1];
  const point=(p:Point)=>p.map(value=>value.toFixed(3)).join(" ");
  return `M${point(trimmed[0])} C${point(trimmed[1])} ${point(trimmed[2])} ${point(trimmed[3])}`;
}
// Shared tangents through Dongji, the rescued group, the rescue hub and
// the escape branch keep the route flowing naturally across its nodes.
const edgeDefinitions = [
  {id:"planned",from:"hongkong",to:"moji",kind:"planned",controls:[[430,245],[820,30]],delay:0},
  {id:"departure",from:"hongkong",to:"dongji",kind:"actual",controls:[[150,205],[205,296]],delay:0},
  {id:"incident",from:"dongji",to:"attack",kind:"actual",controls:[[335,324],[405,338]],delay:650},
  {id:"deaths",from:"attack",to:"died",kind:"actual",controls:[[460,462],[347.5,580]],delay:1250},
  {id:"captivity",from:"attack",to:"captured",kind:"actual",controls:[[460,425],[460,505]],delay:1250},
  {id:"rescued-group",from:"attack",to:"rescued",kind:"actual",controls:[[460,462],[585,580]],delay:1250},
  {id:"fishermen",from:"rescued",to:"rescue",kind:"actual",controls:[[735,580],[775,413]],delay:2000},
  {id:"recapture",from:"rescue",to:"recaptured",kind:"actual",controls:[[935,377],[982,252]],delay:2700},
  {id:"escape",from:"rescue",to:"escaped",kind:"actual",controls:[[880,470],[960,580]],delay:2700},
  {id:"homeward",from:"escaped",to:"britain",kind:"actual",controls:[[1120,580],[1140,655]],delay:3350},
] as const;
export const topologyEdges=edgeDefinitions.map(edge=>({...edge,d:connectedCurve(edge.from,edge.to,edge.controls)}));

export function topologyHighlight(selection:TopologySelection){
  const nodes=new Set<TopologyNodeId>(),edges=new Set<string>();
  if(!selection)return{nodes,edges};
  if(selection.type==="category"){
    if(selection.id==="planned" || selection.id==="actual")topologyEdges.filter(edge=>edge.kind===selection.id).forEach(edge=>{edges.add(edge.id);nodes.add(edge.from);nodes.add(edge.to);});
    else{topologyNodes.filter(node=>node.kind===selection.id).forEach(node=>nodes.add(node.id));topologyEdges.filter(edge=>nodes.has(edge.from)||nodes.has(edge.to)).forEach(edge=>edges.add(edge.id));}
  }else{
    nodes.add(selection.id);
    for(const direction of ["ancestors","descendants"]){
      const queue:TopologyNodeId[]=[selection.id],seen=new Set<TopologyNodeId>();
      while(queue.length){const id=queue.shift()!;if(seen.has(id))continue;seen.add(id);topologyEdges.filter(edge=>(direction==="ancestors" ? edge.to : edge.from)===id).forEach(edge=>{edges.add(edge.id);const next=direction==="ancestors" ? edge.from : edge.to;nodes.add(next);queue.push(next);});}
    }
  }
  return{nodes,edges};
}
export const topologySources={history:historicalSource,fishermen:"https://www.xinhuanet.com/world/2015-09/02/c_1116451062.htm",escape:"https://www.lisbonmaru.org.uk/page/Personal%2Binformation%2Bsheet%2B499",destination:"https://www.pen-and-sword.co.uk/blog/remembering-the-lisbon-maru-vj-day-new-films-and-the-forgotten-war-crime-of-1942/"};
export const topologyTranslations={
 ...topologyNewTranslations,
  ...topologyExtraTranslations,
  zh:{nav:"事件拓扑",eyebrow:"生命之间的联系",title:"一段航程，许多命运。",intro:"从原定航线到沉船与营救，沿着分支回望整个事件。",hint:"点击节点或图例，高亮相关分支并阅读介绍；再次点击或按 Esc 恢复全图。",scrollHint:"左右滑动查看完整拓扑。",diagramLabel:"里斯本丸事件关系拓扑图",legendLabel:"拓扑图图例",selectLabel:"选择事件",overview:"事件全图",reset:"恢复全图",detailLabel:"事件介绍",sourceLink:"查阅相关资料",fishermenUnit:"名渔民",rescuedMeta:"救起384人",categories:{planned:"原定航线",actual:"事件进程",place:"地点",attack:"遇袭与沉没",death:"遇难",captive:"被俘",survivor:"获救 / 脱险",rescue:"渔民营救"},categoryDescriptions:{planned:"香港通往门司的虚线表示计划赴日航程；里斯本丸号未抵达日本。",actual:"实线连接实际发生的事件和后续命运，并非精确海上航迹。",place:"双圆节点表示香港、东极岛、门司和英国；它们连接着航程、营救与归途。",attack:"船只于1942年10月1日遭鱼雷击中，次日沉没。",death:"828人遇难，约占船上英国战俘的46%。",captive:"604人与渔民营救者是当时不同的路径；获渔民营救的384人中，381人后来被重新俘获。",survivor:"384表示获渔民营救的人数；3表示其中逃脱再次被捕的人数，二者不能视为同一种最终命运。",rescue:"198名渔民参与救援，共救起384名英国战俘。"},nodes:{
    hongkong:{title:"香港（英属）",meta:"1942年9月27日 · 1,816名英国战俘",body:"里斯本丸号从香港启航，被移送前往日本。",source:"history"},
    moji:{title:"日本门司港",meta:"未抵达的目的地",body:"原定赴日方向通往门司港。里斯本丸号在途中沉没，虚线没有表示已完成的航程。",source:"destination"},
    dongji:{title:"浙江东极岛一带",meta:"舟山 · 青浜岛与庙子湖岛",body:"沉船点位于附近海域。两岛渔民出海营救，并在岛上照料获救者。",source:"history"},
    attack:{title:"遇袭与沉没",meta:"1942年10月1—2日",body:"船只遭美国潜艇USS Grouper发射的鱼雷击中，次日沉没。这里是命运分支的事件节点。",source:"history"},
    died:{title:"遇难",meta:"828人 · 约46%",body:"828名英国战俘在这段航程、沉没及其相关暴行中丧生。",source:"history"},
    captured:{title:"被俘（不含渔民营救者）",meta:"604人 · 约33%",body:"沿用历史数据板块的分类，由1,816 − 828 − 384计算；与384人的区别是当时的营救路径。",source:"history"},
    rescued:{title:"获中国渔民营救",meta:"384人 · 约21%",body:"这是渔民从海上救起的人数。获救不等于最终脱险：其中381人随后被日军重新俘获。",source:"history"},
    rescue:{title:"渔民营救",meta:"198名渔民 · 救起384人",body:"青浜岛和庙子湖岛渔民反复出海救人，并为获救者提供照料。198是渔民人数，384是获救战俘人数。",source:"fishermen"},
    recaptured:{title:"获救后重新被俘",meta:"381人 · 384 − 3",body:"获渔民营救者中的381人随后被日军重新俘获。这是384人这一组的后续分支。",source:"history"},
    escaped:{title:"逃脱再次被捕",meta:"3人 · 占384人的约0.78%",body:"Fallace、Johnstone和Evans在当地居民帮助下藏身并离岛，经中国内陆脱险。",source:"history"},
    britain:{title:"英国",meta:"后续旅程示意",body:"通往英国的连接线表示后续旅程，并非从东极岛直达英国的航线。Evans的旅程经过印度和加拿大，1945年再到英国。",source:"escape"},
  },note:"这是一张事件关系图，节点大小不代表人数比例，连接线不是精确航迹。46% / 33% / 21%为四舍五入；381与3是384人的子集，不能重复加总。通往英国的连接线表示后续旅程，不表示三人同程直达英国。",sourcesTitle:"历史参考",historySource:"航程与人数 · LiMMA",fishermenSource:"198名渔民 · 新华社亲历者报道",escapeSource:"归途 · Evans个人资料",destinationSource:"门司港 · Richard Graham"},
  en:{nav:"Event topology",eyebrow:"THE CONNECTIONS BETWEEN LIVES",title:"One voyage, many fates.",intro:"Follow the branches from the intended voyage to the sinking, rescue and its aftermath.",hint:"Select a node or legend to highlight related branches and read its story. Select again or press Esc to show all.",scrollHint:"Scroll horizontally to explore the full diagram.",diagramLabel:"Lisbon Maru event topology",legendLabel:"Diagram legend",selectLabel:"Choose an event",overview:"All events",reset:"Show all",detailLabel:"About this event",sourceLink:"Read the source",fishermenUnit:"fishermen",rescuedMeta:"384 POWs rescued",categories:{planned:"Intended voyage",actual:"Events and aftermath",place:"Place",attack:"Attack and sinking",death:"Died",captive:"Captured",survivor:"Rescued / escaped",rescue:"Fishermen’s rescue"},categoryDescriptions:{planned:"The dashed line towards Moji shows the intended voyage. The Lisbon Maru never reached Japan.",actual:"Solid lines connect events and subsequent fates, rather than an exact ship track.",place:"Paired circles mark Hong Kong, Dongji, Moji and the UK, connecting departure, rescue and the homeward journey.",attack:"Torpedoed on 1 October 1942, the ship sank the next day.",death:"828 British POWs died, approximately 46% of those aboard.",captive:"604 separates an initial route from fishermen’s rescue. Of the 384 rescued by fishermen, 381 were later recaptured.",survivor:"384 counts those rescued by fishermen; three counts those who escaped recapture. They are different stages, rather than equivalent final outcomes.",rescue:"198 fishermen took part in saving 384 British POWs."},nodes:{
    hongkong:{title:"Hong Kong (British)",meta:"27 September 1942 · 1,816 British POWs",body:"The Lisbon Maru departed Hong Kong for the transfer of prisoners to Japan.",source:"history"},
    moji:{title:"Moji Port, Japan",meta:"The destination never reached",body:"Moji lay in the intended direction of the voyage. The dashed line represents a plan, not a completed passage.",source:"destination"},
    dongji:{title:"Dongji, Zhejiang",meta:"Zhoushan · Qingbang and Miaozihu",body:"The wreck lies in nearby waters. Fishermen from these islands rescued and cared for the prisoners.",source:"history"},
    attack:{title:"Attack and sinking",meta:"1–2 October 1942",body:"USS Grouper torpedoed the ship, which sank the next day. This event leads to the branches below.",source:"history"},
    died:{title:"Died",meta:"828 people · Approx. 46%",body:"828 British POWs died during the voyage, sinking and associated violence.",source:"history"},
    captured:{title:"Captured, excluding fishermen’s rescue",meta:"604 people · Approx. 33%",body:"Calculated as 1,816 − 828 − 384, following the historical figures section. The distinction is the initial rescue route.",source:"history"},
    rescued:{title:"Rescued by Chinese fishermen",meta:"384 people · Approx. 21%",body:"This counts those brought out of the sea. Rescue was followed by recapture for 381 of them.",source:"history"},
    rescue:{title:"Fishermen’s rescue",meta:"198 fishermen · 384 POWs rescued",body:"Fishermen from Qingbang and Miaozihu repeatedly went out to sea and cared for those rescued. 198 counts rescuers; 384 counts rescued POWs.",source:"fishermen"},
    recaptured:{title:"Rescued, then recaptured",meta:"381 people · 384 − 3",body:"381 of the men rescued by fishermen were subsequently recaptured by Japanese forces. This is a subset of the 384.",source:"history"},
    escaped:{title:"Escaped recapture",meta:"3 people · Approx. 0.78% of 384",body:"Fallace, Johnstone and Evans were sheltered locally and helped off the islands to safety through mainland China.",source:"history"},
    britain:{title:"UK",meta:"The later journey, schematically",body:"This is not a direct voyage from Dongji to the UK. Evans travelled through India and Canada before visiting England in 1945.",source:"escape"},
  },note:"An event relationship diagram: node sizes do not encode numbers and lines are not exact tracks. Percentages are rounded. 381 and three are subsets of 384, not additional totals. The link to UK represents the later journey, not a shared direct voyage by the three escapees.",sourcesTitle:"Historical sources",historySource:"Voyage and figures · LiMMA",fishermenSource:"198 fishermen · Xinhua eyewitness reporting",escapeSource:"Later journey · Evans personal record",destinationSource:"Moji · Richard Graham"},
  ja:{nav:"出来事の関係図",eyebrow:"人々の命をつなぐ出来事",title:"一つの航程、さまざまな運命。",intro:"予定された航程から沈没、救助、その後の出来事まで、分岐をたどります。",hint:"節点や凡例を選ぶと関連する分岐と説明を表示します。再度選ぶかEscで全体に戻ります。",scrollHint:"左右にスクロールして全体をご覧ください。",diagramLabel:"リスボン丸事件の関係図",legendLabel:"関係図の凡例",selectLabel:"出来事を選ぶ",overview:"全体を見る",reset:"全体に戻る",detailLabel:"出来事の説明",sourceLink:"資料を読む",fishermenUnit:"人の漁民",rescuedMeta:"捕虜384人を救助",categories:{planned:"予定された航程",actual:"出来事とその後",place:"場所",attack:"攻撃と沈没",death:"犠牲者",captive:"捕虜・再拘束",survivor:"救助・脱出",rescue:"漁民による救助"},categoryDescriptions:{planned:"門司へ向かう破線は予定された航程です。リスボン丸は日本に到達しませんでした。",actual:"実線は出来事とその後の運命を結び、正確な航跡を表すものではありません。",place:"二つの円は香港、東極諸島、門司、英国を示し、出航、救助、帰途をつなぎます。",attack:"1942年10月1日に魚雷を受け、翌日に沈没しました。",death:"英国人捕虜828人が死亡し、乗船者の約46%にあたります。",captive:"604人は漁民による救助とは異なる当初の経路を示します。漁民が救助した384人のうち381人が再拘束されました。",survivor:"384人は漁民による救助人数、3人は再拘束を免れた人数です。同じ最終結果を表す数字ではありません。",rescue:"漁民198人が英国人捕虜384人を救助しました。"},nodes:{
    hongkong:{title:"香港（英国領）",meta:"1942年9月27日 · 英国人捕虜1,816人",body:"リスボン丸は捕虜を日本へ移送するため香港を出航しました。",source:"history"},
    moji:{title:"日本・門司港",meta:"到達できなかった目的地",body:"門司港は予定された航程の日本側の目的地です。破線は計画を示し、完了した航程ではありません。",source:"destination"},
    dongji:{title:"浙江省・東極諸島",meta:"舟山 · 青浜島と廟子湖島",body:"沈没地点は付近の海域にあります。両島の漁民が捕虜を救助し、島で世話をしました。",source:"history"},
    attack:{title:"攻撃と沈没",meta:"1942年10月1日–2日",body:"米潜水艦USS Grouperによる魚雷攻撃を受け、翌日に沈没しました。ここからその後の運命が分岐します。",source:"history"},
    died:{title:"犠牲者",meta:"828人 · 約46%",body:"航程、沈没、その際の暴力によって英国人捕虜828人が亡くなりました。",source:"history"},
    captured:{title:"拘束（漁民の救助を除く）",meta:"604人 · 約33%",body:"歴史データ欄と同じく1,816 − 828 − 384で算出。当初の救助経路の違いを示します。",source:"history"},
    rescued:{title:"中国漁民による救助",meta:"384人 · 約21%",body:"海から救助された人数です。うち381人はその後、日本軍に再拘束されました。",source:"history"},
    rescue:{title:"漁民による救助",meta:"漁民198人 · 捕虜384人を救助",body:"青浜島と廟子湖島の漁民は繰り返し海に出て救助し、世話をしました。198は救助した側、384は救助された捕虜の人数です。",source:"fishermen"},
    recaptured:{title:"救助後に再拘束",meta:"381人 · 384 − 3",body:"漁民が救助した384人のうち381人が、その後日本軍に再拘束されました。",source:"history"},
    escaped:{title:"再拘束を免れる",meta:"3人 · 384人の約0.78%",body:"Fallace、Johnstone、Evansの3人は島民にかくまわれ、中国大陸へ渡って脱出しました。",source:"history"},
    britain:{title:"英国",meta:"その後の旅路の模式図",body:"英国への線は後続の旅路の模式図です。東極諸島からの直行航路ではありません。Evansはインドやカナダを経て、1945年に英国を訪れました。",source:"escape"},
  },note:"出来事の関係図であり、節点の大きさは人数の比率、線は正確な航跡を表しません。割合は四捨五入。381人と3人は384人の内訳で、重複して合計しません。英国への線は後続の旅路を示し、3人が共に直行したという意味ではありません。",sourcesTitle:"歴史資料",historySource:"航程と人数 · LiMMA",fishermenSource:"漁民198人 · 新華社の証言取材",escapeSource:"その後の旅路 · Evansの記録",destinationSource:"門司港 · Richard Graham"},
} as const;
