/** A quiet, code-native field of light above the sea. No historical imagery is fabricated. */
export default function RitualLight() {
 return <div className="ritual-light" aria-hidden="true"><svg viewBox="0 0 800 620" preserveAspectRatio="xMidYMid slice">
  <defs>
   <radialGradient id="ritual-glow"><stop stopColor="#e9dfbf" stopOpacity=".48"/><stop offset=".28" stopColor="#b9d8cd" stopOpacity=".1"/><stop offset="1" stopColor="#b9d8cd" stopOpacity="0"/></radialGradient>
   <linearGradient id="ritual-reflection" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ede2bf" stopOpacity=".45"/><stop offset="1" stopColor="#ede2bf" stopOpacity="0"/></linearGradient>
  </defs>
  <circle className="ritual-aura" cx="400" cy="215" r="200" fill="url(#ritual-glow)"/>
  <g className="ritual-orbits" fill="none" stroke="#c6d6ce" strokeWidth=".65">
   <circle cx="400" cy="215" r="92" opacity=".17"/><circle cx="400" cy="215" r="151" opacity=".12"/><circle cx="400" cy="215" r="212" opacity=".07"/>
  </g>
  <path d="M400 190 L400 242 M374 215 L426 215" stroke="#efdfba" strokeWidth=".7" opacity=".65"/>
  <circle cx="400" cy="215" r="3" fill="#fff2d5"/>
  {Array.from({length:38},(_,i)=>{const angle=i*2.39996,r=60+((i*43)%183);return <circle key={i} className="ritual-spark" cx={400+Math.cos(angle)*r} cy={215+Math.sin(angle)*r*.78} r={i%4===0?1.6:.9} fill={i%3===0?"#e0c79b":"#c0d6d2"} style={{animationDelay:`${-i*.37}s`}}/>;})}
  <path d="M399 292 L371 590 L429 590 L401 292 Z" fill="url(#ritual-reflection)" opacity=".18"/>
  <g fill="none" stroke="#bad4cf" strokeWidth=".7">
   {Array.from({length:13},(_,i)=><path key={i} d={`M${40-i*16} ${320+i*21} Q230 ${298+i*21} 400 ${320+i*21} T${760+i*16} ${320+i*21}`} opacity={.2-i*.01}/>)}
  </g>
 </svg></div>;
}
