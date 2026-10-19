(()=>{'use strict';
const section=document.getElementById('observatory');if(!section)return;
const $=id=>document.getElementById(id);
const canvas=$('star-canvas'),lens=$('obs-lens'),ctx=canvas.getContext('2d',{alpha:false});
const starName=$('star-name'),subtitle=$('star-subtitle'),raLabel=$('star-ra'),decLabel=$('star-dec'),magLabel=$('star-mag'),specLabel=$('star-spectral'),feedback=$('star-feedback');
const search=$('star-search'),suggestions=$('star-suggestions'),selectedLabel=$('obs-target-badge');
const latInput=$('obs-lat'),lonInput=$('obs-lon'),altaz=$('obs-altaz');
const fovLabel=$('obs-fov-label'),countLabel=$('obs-count'),lensTitle=$('lens-title');
const DEG=Math.PI/180,RAD=180/Math.PI;
const mod=(x,n)=>((x%n)+n)%n;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ROWS=(window.SKYCAT||[]).filter(s=>Number.isFinite(s[0])&&Number.isFinite(s[1]));
const catalog=[];const unique=new Set();
for (const row of ROWS){const [ra,dec,mag,spectral,name,con]=row;const key=`${ra.toFixed(3)}-${dec.toFixed(3)}`;if(unique.has(key))continue;unique.add(key);catalog.push({ra,dec,mag,spectral,name,con});}
catalog.sort((a,b)=>a.mag-b.mag);
const named=catalog.filter(s=>s.name).sort((a,b)=>a.name.localeCompare(b.name));
const byName=new Map(named.map(s=>[s.name.toLowerCase(),s]));
const types={O:'Blue',B:'Blue-white',A:'White',F:'White-yellow',G:'Yellow',K:'Orange',M:'Red'};
const colors={O:'#a9c1ff',B:'#becfff',A:'#fffdf7',F:'#fff4e6',G:'#ffefc2',K:'#ffceaa',M:'#ff9f87'};
const constellations={Ori:'Orion',CMa:'Canis Major',Cyg:'Cygnus',Lyr:'Lyra',UMa:'Ursa Major',UMi:'Ursa Minor',Sco:'Scorpius',Aur:'Auriga',Boo:'Boötes',Vir:'Virgo',Aql:'Aquila',Cas:'Cassiopeia',Tau:'Taurus',Cru:'Crux',Cen:'Centaurus',Car:'Carina',Gem:'Gemini',Leo:'Leo',And:'Andromeda',Peg:'Pegasus',Per:'Perseus',Her:'Hercules',Sgr:'Sagittarius',PsA:'Piscis Austrinus'};
const names=['Sirius','Vega','Polaris','Betelgeuse','Rigel','Aldebaran','Arcturus','Deneb','Antares'];
for(const s of named){const o=document.createElement('option');o.value=s.name;suggestions.appendChild(o);}
let width=420,height=420,cx=210,cy=210,radius=200,deviceScale=1;
let centerRA=5.9194,centerDec=7.4072,fov=54,target=byName.get('betelgeuse')||catalog[0];
let visible=false,active=true,labelsOn=true,frame=0,lastStamp=0,tracked=new Map(),drag=null,pinchDist=0,renderedPositions=[],moveTo=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function announce(msg){feedback.textContent=msg;}
function hours(v){let h=mod(v,24),n=Math.floor(h),m=Math.round((h-n)*60);if(m===60){n=(n+1)%24;m=0;}return`${String(n).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`;}
function signed(v){return (v>=0?'+':'−')+Math.abs(v).toFixed(2)+'°';}
function selected(star,msg){if(!star)return;target=star;starName.textContent=star.name||`${star.con} star`;subtitle.textContent=`${constellations[star.con]||star.con} · spectral class ${star.spectral} (${(types[star.spectral]||'stellar').toLowerCase()})`;
raLabel.textContent=hours(star.ra);decLabel.textContent=signed(star.dec);magLabel.textContent=star.mag.toFixed(2);specLabel.textContent=star.spectral;
selectedLabel.textContent='TARGET LOCKED';if(msg)announce(msg);updateAltAz();}
function jd(date){return date.getTime()/86400000+2440587.5;}
function updateAltAz(){if(!target)return;const lat=Number(latInput.value),lon=Number(lonInput.value);if(latInput.value===''||lonInput.value===''||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){altaz.textContent='Enter valid latitude and longitude to estimate the current altitude and azimuth.';return;}
const d=jd(new Date())-2451545;
const gmst=mod(280.46061837+360.98564736629*d,360),ha=mod(gmst+lon-target.ra*15+180,360)-180;
const phi=lat*DEG,dec=target.dec*DEG,H=ha*DEG;
const alt=Math.asin(clamp(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H),-1,1));
const az=mod(Math.atan2(-Math.sin(H),Math.tan(dec)*Math.cos(phi)-Math.sin(phi)*Math.cos(H))*RAD,360);
altaz.textContent=`Approx. altitude ${signed(alt*RAD)} · bearing ${az.toFixed(1)}° (${alt>=0?'above':'below'} horizon). Refraction and epoch shifts not included.`;
}
function resize(){const rect=lens.getBoundingClientRect();width=Math.round(rect.width);height=Math.round(rect.height);radius=Math.min(width,height)*.49;cx=width/2;cy=height/2;deviceScale=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(width*deviceScale);canvas.height=Math.round(height*deviceScale);ctx.setTransform(deviceScale,0,0,deviceScale,0,0);renderSky(performance.now());}
function project(raHours,decDegrees){const a=raHours*15*DEG,d=decDegrees*DEG,ra0=centerRA*15*DEG,d0=centerDec*DEG,da=Math.atan2(Math.sin(a-ra0),Math.cos(a-ra0));
const den=Math.sin(d0)*Math.sin(d)+Math.cos(d0)*Math.cos(d)*Math.cos(da);
if(den<=0)return null;
const ux=Math.cos(d)*Math.sin(da)/den;
const uy=(Math.sin(d)*Math.cos(d0)-Math.cos(d)*Math.sin(d0)*Math.cos(da))/den;
const scale=radius/Math.tan(fov*.5*DEG);
const x=cx+ux*scale,y=cy-uy*scale;
return Math.hypot(x-cx,y-cy)<radius+18?{x,y,scale}:null;
}
const edges=[['Betelgeuse','Bellatrix'],['Bellatrix','Mintaka'],['Mintaka','Alnilam'],['Alnilam','Alnitak'],['Alnitak','Saiph'],['Saiph','Rigel'],['Rigel','Mintaka'],['Betelgeuse','Meissa'],['Alnilam','Betelgeuse'],['Dubhe','Merak'],['Merak','Phecda'],['Phecda','Megrez'],['Megrez','Alioth'],['Alioth','Mizar'],['Mizar','Alkaid'],['Schedar','Caph'],['Schedar','Gamma Cas'],['Gamma Cas','Ruchbah'],['Ruchbah','Segin'],['Deneb','Sadr'],['Sadr','Gienah'],['Sadr','Delta Cyg'],['Vega','Deneb'],['Deneb','Altair']];
function drawLine(a,b){ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
function drawAtmosphere(){const g=ctx.createRadialGradient(cx,cy*.75,5,cx,cy,radius*1.2);g.addColorStop(0,'#192a3c');g.addColorStop(.6,'#0c1628');g.addColorStop(1,'#030913');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
const t=ctx.createRadialGradient(cx*.65,cy*.55,0,cx*.65,cy*.55,radius*.9);t.addColorStop(0,'rgba(53,85,117,.10)');t.addColorStop(1,'rgba(22,30,44,0)');ctx.fillStyle=t;ctx.fillRect(0,0,width,height);
}
function renderSky(now){if(!width||!ctx)return;
ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,2*Math.PI);ctx.clip();drawAtmosphere();
// Sky coordinate guide circles (reference map, not a photo).
ctx.lineWidth=.7;ctx.strokeStyle='rgba(174,200,218,.092)';for(let f=1;f<=3;f++){ctx.beginPath();ctx.arc(cx,cy,radius*f/4,0,2*Math.PI);ctx.stroke();}
ctx.beginPath();ctx.moveTo(cx-radius,cy);ctx.lineTo(cx+radius,cy);ctx.moveTo(cx,cy-radius);ctx.lineTo(cx,cy+radius);ctx.stroke();
const positions=new Map();const projected=[];
for(const s of catalog){const p=project(s.ra,s.dec);if(!p)continue;positions.set(s.name,p);projected.push({...p,star:s});}
ctx.beginPath();ctx.strokeStyle='rgba(135,165,202,.21)';ctx.lineWidth=1;
for(const [a,b] of edges){const pa=positions.get(a),pb=positions.get(b);if(pa&&pb)drawLine(pa,pb);}ctx.stroke();
renderedPositions=projected;
const t=now*.001;
for(const p of projected){const s=p.star;const norm=clamp(1.5-s.mag*.11,.3,1.95);const r=clamp(norm*1.6,1,5.4);
const twinkle=reduced?1:(.94+.06*Math.sin(t*1.4+s.ra*6+s.dec));
const c=colors[s.spectral]||'#e1e5ff';
ctx.globalAlpha=clamp((1.3-s.mag*.09)*twinkle,.35,1);
if(s.mag<=2.6){const halo=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*7);halo.addColorStop(0,'rgba(188,214,255,.22)');halo.addColorStop(1,'rgba(188,214,255,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(p.x,p.y,r*7,0,2*Math.PI);ctx.fill();}
ctx.fillStyle=c;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();

}
if(labelsOn){
 const occupied=[];ctx.font=`${width<430?10:11}px ui-monospace,monospace`;ctx.textBaseline='middle';
 for(const p of projected){const s=p.star;if(!s.name)continue;
  if(s.mag>(width<460?2.3:(fov<56?3.9:2.2))&&s!==target)continue;
  let x=p.x+9,y=p.y-9,tw=ctx.measureText(s.name).width;
  if(x+tw>width-15){x=p.x-tw-10;}if(y<16)y=p.y+13;
  const box={x:x-3,y:y-8,w:tw+6,h:16};
  if(occupied.some(b=>box.x<b.x+b.w&&box.x+box.w>b.x&&box.y<b.y+b.h&&box.y+box.h>b.y))continue;
  occupied.push(box);ctx.globalAlpha=s===target?1:clamp((4.7-s.mag)/4,.52,.96);
  ctx.fillStyle='#d0e4eb';ctx.fillText(s.name,x,y);
 }
 ctx.globalAlpha=1;
}
if(target){const p=project(target.ra,target.dec);if(p){ctx.globalAlpha=1;ctx.strokeStyle='rgba(221,243,226,.92)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,11+Math.sin(now*.0018)*1.5,0,2*Math.PI);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x+16,p.y);ctx.lineTo(p.x+24,p.y);ctx.moveTo(p.x-16,p.y);ctx.lineTo(p.x-24,p.y);ctx.stroke();}}
ctx.globalAlpha=1;ctx.restore();fovLabel.textContent=`FIELD ${Math.round(fov)}°`;lensTitle.textContent=`CENTER ${hours(centerRA).toUpperCase()} · ${signed(centerDec)}`;countLabel.textContent=`${catalog.length} CATALOGUED STARS · J2000`;
}
function locate(name){const key=name.trim().toLowerCase();return byName.get(key)||named.find(s=>s.name.toLowerCase().startsWith(key))||null;}
function fly(star){if(!star)return;selected(star,`Pointing at ${star.name}. Drag or zoom to explore nearby stars.`);const targetRA=star.ra,targetDec=star.dec;
const d=mod(targetRA-centerRA+12,24)-12;
moveTo={fromRA:centerRA,fromDec:centerDec,fromFov:fov,dRA:d,toDec:targetDec,toFov:Math.min(fov,44),start:performance.now(),duration:reduced?0:1050};}
function zoom(multiplier){fov=clamp(fov*multiplier,9,105);moveTo=null;renderSky(performance.now());}
function update(now){if(!active)return;
requestAnimationFrame(update);if(!visible)return;
if(moveTo){let u=moveTo.duration?clamp((now-moveTo.start)/moveTo.duration,0,1):1;u=1-Math.pow(1-u,4);centerRA=mod(moveTo.fromRA+moveTo.dRA*u,24);centerDec=moveTo.fromDec+(moveTo.toDec-moveTo.fromDec)*u;fov=moveTo.fromFov+(moveTo.toFov-moveTo.fromFov)*u;if(u>=.9999)moveTo=null;}
if(now-lastStamp>40||moveTo){lastStamp=now;renderSky(now);}
}
const obs=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){resize();lastStamp=0;}},{threshold:.015});obs.observe(section);
addEventListener('resize',()=>resize(),{passive:true});
$('star-search-form').addEventListener('submit',e=>{e.preventDefault();const q=search.value.trim(),s=locate(q);if(!s){announce(`“${q}” is not in this named-star selection. Try Sirius, Vega, or Polaris.`);return;}fly(s);});
document.querySelectorAll('[data-target]').forEach(btn=>btn.addEventListener('click',()=>{const s=locate(btn.dataset.target);if(s){search.value=s.name;fly(s);}}));
$('obs-zoom-in').addEventListener('click',()=>zoom(.7));$('obs-zoom-out').addEventListener('click',()=>zoom(1.4));$('obs-reset').addEventListener('click',()=>{fov=54;moveTo=null;fly(locate('Betelgeuse'));});
$('obs-label-toggle').addEventListener('click',e=>{labelsOn=!labelsOn;e.currentTarget.setAttribute('aria-pressed',String(labelsOn));e.currentTarget.querySelector('span').textContent=labelsOn?'ON':'OFF';renderSky(performance.now());});
lens.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.13:.885)},{passive:false});
function distance(p1,p2){return Math.hypot(p1.x-p2.x,p1.y-p2.y);}
let dragMoved=false;
lens.addEventListener('pointerdown',e=>{lens.setPointerCapture(e.pointerId);tracked.set(e.pointerId,{x:e.clientX,y:e.clientY});if(tracked.size===1){drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};dragMoved=false;}if(tracked.size===2){pinchDist=distance(...[...tracked.values()].slice(0,2));drag=null;}});
lens.addEventListener('pointermove',e=>{if(!tracked.has(e.pointerId))return;const prev=tracked.get(e.pointerId);tracked.set(e.pointerId,{x:e.clientX,y:e.clientY});if(tracked.size===2){const [p1,p2]=[...tracked.values()];const d=distance(p1,p2);if(pinchDist){fov=clamp(fov*pinchDist/d,9,105);moveTo=null;}pinchDist=d;renderSky(performance.now());return;}
if(!drag)return;const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6)dragMoved=true;
const scale=radius/Math.tan(fov/2*DEG);centerRA=mod(centerRA-(dx/scale)*RAD/(15*Math.max(.13,Math.cos(centerDec*DEG))),24);centerDec=clamp(centerDec+(dy/scale)*RAD,-86,86);moveTo=null;renderSky(performance.now());});
function onRelease(e){if(!tracked.has(e.pointerId))return;tracked.delete(e.pointerId);if(tracked.size===0&&drag&&!dragMoved){const rect=canvas.getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;
let best=null,dist=17;for(const p of renderedPositions){const dd=Math.hypot(p.x-x,p.y-y);if(dd<dist){best=p.star;dist=dd;}}
if(best){selected(best,`${best.name}: catalogued star selected.`);}}if(tracked.size<2)pinchDist=0;drag=null;}
lens.addEventListener('pointerup',onRelease);lens.addEventListener('pointercancel',onRelease);lens.addEventListener('lostpointercapture',onRelease);
[latInput,lonInput].forEach(el=>el.addEventListener('input',updateAltAz));
$('obs-use-location').addEventListener('click',()=>{if(!navigator.geolocation){altaz.textContent='Your browser does not support geolocation.';return;}
altaz.textContent='Requesting location permission…';navigator.geolocation.getCurrentPosition(pos=>{latInput.value=pos.coords.latitude.toFixed(3);lonInput.value=pos.coords.longitude.toFixed(3);updateAltAz();},()=>altaz.textContent='Location access was not granted. You can enter coordinates manually.',{enableHighAccuracy:false,timeout:12000,maximumAge:600000});});
selected(target);resize();requestAnimationFrame(update);
// Lightweight test interface; no external network calls or tracking.
window.__starFinderTest={find:locate,project,fly,zoom,get state(){return{ra:centerRA,dec:centerDec,fov,selected:target&&target.name,count:catalog.length,viewCount:renderedPositions.length,labelsOn}}};
})();