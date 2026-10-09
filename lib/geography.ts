import { geographyNewTranslations } from "./new-locales";
import { geographyExtraTranslations } from "./extra-locales";
export const wreckCoordinate = {latitude: 30 + 13 / 60 + 44.42 / 3600, longitude: 122 + 45 / 60 + 31.14 / 3600};
export const wreckCoordinateLabel = "30°13′44.42″N 122°45′31.14″E";
// City/island points locate the places schematically; only the wreck uses the reported precise coordinate.
export const geographyStops = [
  {id:"world", longitude:88, latitude:18, scale:268, duration:9000},
  {id:"hongkong", longitude:114.17, latitude:22.30, scale:1050, duration:10000},
  {id:"wreck", longitude:wreckCoordinate.longitude, latitude:wreckCoordinate.latitude, scale:1300, duration:11000},
  {id:"dongji", longitude:122.70, latitude:30.20, scale:1600, duration:11000},
  {id:"moji", longitude:130.96, latitude:33.95, scale:1050, duration:10000},
] as const;
export const voyageLine = [[114.17,22.30],[115.5,22.7],[118.5,24.6],[120.7,26.5],[122.0,28.7],[wreckCoordinate.longitude,wreckCoordinate.latitude]];
export const plannedLine = [[wreckCoordinate.longitude,wreckCoordinate.latitude],[125,30.9],[128,32.1],[130.96,33.95]];
export const geographySources = {
  coordinate:"https://www.thepaper.cn/newsDetail_forward_28673404",
  history:"https://www.lisbonmaru.org.uk/resource/html/Background%2Bto%2Bthe%2Bsinking%2Bof%2Bthe%2Blisbon%2Bmaru",
  destination:"https://www.pen-and-sword.co.uk/blog/remembering-the-lisbon-maru-vj-day-new-films-and-the-forgotten-war-crime-of-1942/",
  map:"https://www.naturalearthdata.com/about/terms-of-use/",
};
export const geographyTranslations = {
 ...geographyNewTranslations,
  ...geographyExtraTranslations,
  zh:{
    nav:"地理与航程",eyebrow:"记忆中的地点",subtitle:"浙江舟山 · 东极岛附近海域 · 里斯本丸号沉船位置",
    introduction:"从地球出发，沿着地点回望这段航程。", globeLabel:"里斯本丸号地理互动地球",countriesLabel:"国家、地区与沉船点图例",globeHint:"点击国家色块、图例或下方地点可互相高亮；左右拖动地球，方向键可转动视角。",play:"自动讲述",pause:"暂停讲述",replay:"从地球开始",previous:"上一个地点",next:"下一个地点",zoomIn:"放大地图",zoomOut:"缩小地图",loading:"正在载入地球地图…",loadError:"地球地图暂时无法载入。地点介绍仍可阅读。",retry:"重新载入地图",placesLabel:"选择讲述地点",storyLabel:"地点讲述",step:"{current} / {total}",auto:"自动讲述中",manual:"手动浏览",finished:"讲述结束",china:"中国",japan:"日本",hk:"香港（英属）",wreck:"沉船点",voyage:"香港（英属）至沉船海域（示意）",planned:"计划赴日方向（示意）",
    names:["地球与东海","香港（英属）","沉船坐标","东极岛一带","门司港 · 日本"],
    roles:["全球视角","启航地点","航程在此终止","渔民营救地点","未抵达的目的地"],
    dates:["1942 · 记忆中的航程","1942年9月27日","1942年10月1—2日","1942年10月2日","原计划赴日本"],
    stories:["从香港到东海，再到日本方向。海上的距离连接着战俘、遇难者与伸出援手的渔民。","里斯本丸号从香港启航，载着1,816名英国战俘，被移送前往日本。","船只于10月1日遭鱼雷击中，次日沉没。这里标示方励采访中给出的沉船坐标。","浙江舟山东极岛一带的青浜岛、庙子湖岛渔民参与营救，救起384人。沉船点位于附近海域。","航程原计划朝向日本门司港。里斯本丸号沉没于途中，未抵达这里。"],
    mapNote:"连线展示地点间的地理关系，并非对实际航迹的精确复原。香港、岛屿与港口标记为概位；沉船点采用上述坐标。底图为现代海岸线示意。",coordinateSource:"沉船坐标：方励采访 · 澎湃新闻",historySource:"航程与营救：LiMMA",destinationSource:"门司港：Richard Graham · Pen & Sword",mapSource:"底图：Natural Earth",
  },
  en:{
    nav:"Places & voyage",eyebrow:"A PLACE IN OUR MEMORY",subtitle:"The Lisbon Maru wreck · Waters near Dongji, Zhoushan, Zhejiang, China",
    introduction:"Begin with the globe, and follow the places connected to this voyage.",globeLabel:"Interactive Lisbon Maru geography globe",countriesLabel:"Country, region and wreck legend",globeHint:"Select a country, legend or place to highlight its counterpart. Drag horizontally or use arrow keys to rotate.",play:"Play the story",pause:"Pause the story",replay:"Begin with the globe",previous:"Previous place",next:"Next place",zoomIn:"Zoom in",zoomOut:"Zoom out",loading:"Loading the globe…",loadError:"The map could not load. The place descriptions remain available.",retry:"Reload the map",placesLabel:"Choose a place",storyLabel:"The story of each place",step:"{current} / {total}",auto:"Playing the story",manual:"Exploring manually",finished:"Story complete",china:"China",japan:"Japan",hk:"Hong Kong (British)",wreck:"Wreck site",voyage:"Hong Kong (British) to the wreck area (schematic)",planned:"Intended onward direction to Japan (schematic)",
    names:["The globe and the East China Sea","Hong Kong (British)","The wreck coordinate","The Dongji islands","Moji Port · Japan"],
    roles:["A global view","Departure","Where the voyage ended","Fishermen’s rescue","The destination never reached"],
    dates:["1942 · Places of remembrance","27 September 1942","1–2 October 1942","2 October 1942","The intended journey to Japan"],
    stories:["Hong Kong, the East China Sea and Japan: places connected by the lives of prisoners, those who died, and fishermen who helped.","The Lisbon Maru departed Hong Kong carrying 1,816 British POWs for transfer to Japan.","Torpedoed on 1 October, the ship sank the next day. The marker uses the wreck coordinate reported in Fang Li’s interview.","Fishermen from Qingbang and Miaozihu in the Dongji islands rescued 384 men. The wreck lies in nearby waters.","The intended journey led towards Moji Port in Japan. The Lisbon Maru sank before reaching it."],
    mapNote:"Lines show geographical relationships, rather than a reconstructed ship track. City, island and port markers are approximate; the wreck uses the coordinate above. The basemap depicts modern coastlines.",coordinateSource:"Wreck coordinate: Fang Li interview · The Paper",historySource:"Voyage and rescue: LiMMA",destinationSource:"Moji: Richard Graham · Pen & Sword",mapSource:"Basemap: Natural Earth",
  },
  ja:{
    nav:"場所と航程",eyebrow:"記憶に刻まれた場所",subtitle:"リスボン丸の沈没位置 · 中国浙江省舟山・東極諸島付近の海域",
    introduction:"地球から、その航程に関わる場所をたどります。",globeLabel:"リスボン丸の地理をたどる地球",countriesLabel:"国・地域・沈没地点の凡例",globeHint:"国の色、凡例、下の場所を選ぶと、対応する部分が強調されます。左右のドラッグや矢印キーで回転できます。",play:"自動でたどる",pause:"自動表示を一時停止",replay:"地球から始める",previous:"前の場所",next:"次の場所",zoomIn:"拡大",zoomOut:"縮小",loading:"地球の地図を読み込んでいます…",loadError:"地図を読み込めません。場所の説明は引き続き読めます。",retry:"地図を再読み込み",placesLabel:"場所を選ぶ",storyLabel:"それぞれの場所の記録",step:"{current} / {total}",auto:"自動で表示しています",manual:"手動で閲覧中",finished:"表示が終了しました",china:"中国",japan:"日本",hk:"香港（英国領）",wreck:"沈没地点",voyage:"香港（英国領）から沈没海域へ（模式図）",planned:"日本へ向かう予定の方向（模式図）",
    names:["地球と東シナ海","香港（英国領）","沈没地点の座標","東極諸島","門司港 · 日本"],
    roles:["世界から見る","出航地","航程が終わった場所","漁民による救助","到達できなかった目的地"],
    dates:["1942 · 記憶をつなぐ航程","1942年9月27日","1942年10月1日–2日","1942年10月2日","日本への移送計画"],
    stories:["香港、東シナ海、そして日本。捕虜、犠牲者、救助にあたった漁民の人生をつなぐ場所をたどります。","リスボン丸は英国人捕虜1,816人を乗せ、日本への移送のため香港を出航しました。","10月1日に魚雷を受け、翌日に沈没しました。方励へのインタビューに記された沈没座標を示しています。","東極諸島の青浜島と廟子湖島の漁民が384人を救助しました。沈没地点は付近の海域にあります。","日本の門司港へ向かう航程が予定されていました。リスボン丸は途中で沈没し、到達しませんでした。"],
    mapNote:"線は場所の地理的な関係を示し、実際の航跡を正確に再現したものではありません。都市・島・港の標識は概位で、沈没地点には上記の座標を使用しています。背景は現代の海岸線です。",coordinateSource:"沈没座標：方励への取材 · 澎湃新聞",historySource:"航程と救助：LiMMA",destinationSource:"門司港：Richard Graham · Pen & Sword",mapSource:"背景地図：Natural Earth",
  },
} as const;
