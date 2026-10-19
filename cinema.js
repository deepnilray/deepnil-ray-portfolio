(()=>{'use strict';
const $=sel=>document.querySelector(sel);
const all=sel=>[...document.querySelectorAll(sel)];
const clamp=v=>Math.min(1,Math.max(0,v));
const fade=(x,a,b)=>{let t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const light=$('#cinema-light'),glow=$('.cinema-glow'),film=$('#film-index'),act=$('#film-act'),night=$('.nightfall'),head=$('#header'), papers=$('#writing');
const chapters=all('.chapter'), archive=$('.papers');
const sectionLabels=[['#opening','01 / INTRODUCTION'],['#transition','02 / THE UNIVERSE'],['#work','03 / THE QUESTIONS'],['#reel','04 / RESEARCH'],['#observations','05 / ASTRONOMY'],['#patterns','06 / MATHEMATICS'],['#people','07 / SCIENCE COMMUNICATION'],['#writing','08 / PUBLICATIONS'],['#about','09 / BIOGRAPHY'],['#contact','10 / CONNECT'],['#nightfall','11 / NIGHTFALL'],['#observatory','12 / THE OBSERVATORY']].map(([s,label])=>[document.querySelector(s),label]).filter(x=>x[0]);
let scroll=window.scrollY, mx=.67,my=.42,pointerX=mx,pointerY=my,last=0,need=true;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollChange=()=>{need=true};
addEventListener('scroll',scrollChange,{passive:true});addEventListener('resize',scrollChange,{passive:true});
addEventListener('pointermove',e=>{pointerX=e.clientX/innerWidth;pointerY=e.clientY/innerHeight;need=true},{passive:true});
let currentAct='';
const inside=(el,mid)=>{let r=el.getBoundingClientRect();return r.top<mid&&r.bottom>mid};
function tick(now){requestAnimationFrame(tick);
 if(document.hidden)return;
 const dt=Math.min(64,Math.max(0,now-last));last=now;
 const dest=scrollY;const k=reduced.matches?1:1-Math.exp(-dt/135);
 scroll+=(dest-scroll)*k;
 mx+=(pointerX-mx)*.045;my+=(pointerY-my)*.045;
 if(Math.abs(scroll-dest)>.3||Math.abs(mx-pointerX)>.002||Math.abs(my-pointerY)>.002)need=true;
 if(!need)return;need=false;
 const vh=Math.max(1,innerHeight), center=scroll+vh*.52;
 const section=sectionLabels.findLast(([el])=>el.offsetTop<center)||sectionLabels[0];
 if(section && section[1]!==currentAct){currentAct=section[1];act.textContent=currentAct;}
 const index=(sectionLabels.findIndex(x=>x[1]===currentAct)+1)/Math.max(1,sectionLabels.length);
 film.style.setProperty('--film-line',index.toFixed(3));
 const archiveStart=archive.offsetTop,archiveEnd=archiveStart+archive.offsetHeight;
 const paper=scroll>archiveStart-vh*.15&&scroll<archiveEnd-vh*.12;
 film.classList.toggle('paper',paper);head.classList.toggle('paper-head',paper);document.body.classList.toggle('in-observatory',scroll>$('#observatory').offsetTop-innerHeight*.25);
 const inNight=scroll>=night.offsetTop-vh*.7;
 const w=paper?1:0;
 glow.style.transform=`translate3d(${((mx-.5)*innerWidth*.26).toFixed(1)}px,${((my-.5)*innerHeight*.22).toFixed(1)}px,0)`;
 
 light.style.setProperty('--cinema-warm',w);
 light.style.setProperty('--cinema-light',String(paper?.1:inNight?.65:.48));
 light.style.setProperty('--light-angle',((mx-.5)*26).toFixed(2)+'deg');
 const enterArchive=fade(scroll,archiveStart-vh*.5,archiveStart+vh*.6);
 archive.style.setProperty('--archive-ray',String(.1+enterArchive*.5));
 archive.style.setProperty('--archive-move',((1-enterArchive)*-220).toFixed(0)+'px');
 for(const ch of chapters){
  const top=ch.offsetTop;
  const p=clamp((scroll-top+vh*.35)/(ch.offsetHeight-vh*.3));
  const a=fade(p,.02,.24)*(1-fade(p,.7,.99));
  ch.style.setProperty('--shot-opacity',Math.max(.09,a).toFixed(3));
  ch.style.setProperty('--shot-shift',((1-fade(p,.02,.38))*35-fade(p,.68,.99)*34).toFixed(2)+'px');
  const img=ch.querySelector('.chapter-visual img');
  if(img && scroll>top-vh && scroll<top+ch.offsetHeight+vh){img.style.transform=`translate3d(0,${((p-.5)*-8).toFixed(2)}%,0) scale(1.2)`;}
 }
 const np=clamp((scroll-night.offsetTop)/Math.max(1,night.offsetHeight-vh));
 night.style.setProperty('--night-p',np.toFixed(4));
 night.style.setProperty('--night-copy',(fade(np,.12,.47)*(1-fade(np,.91,1))).toFixed(4));
 }
 requestAnimationFrame(tick);
})();