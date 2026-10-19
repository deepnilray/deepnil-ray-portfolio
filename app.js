(() => {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (x,a=0,b=1) => Math.max(a,Math.min(b,x));
const mix = (a,b,p) => a+(b-a)*p;
const ease = t => { t=clamp(t);return t*t*(3-2*t); };
const range = (v,a,b) => ease((v-a)/(b-a));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width:730px)');
let W=innerWidth,H=innerHeight,lastTime=0,renderScroll=scrollY,mouseX=.55,mouseY=.48,cursorX=-100,cursorY=-100,entered=false,visible=true;
const opening=$('#opening'), transition=$('#transition'),reel=$('#reel');
const stage=$('#opening .opening-stick'), transitionStage=$('.transition-stick');
const header=$('#header'), progress=$('#page-progress'), reelWheel=$('#reel-wheel'), reelCurrent=$('#reel-count'),reelTitle=$('#reel-title'),reelDescr=$('#reel-descr'),reelProgress=$('#reel-progress');
const titles=['The observational sky','The structure of a pattern','Science, shared','The written record'];
const descriptions=['What disappears between the measurements?','What does the recurrence know that its terms do not?','Who gets to take part in discovery?','Where an observation becomes an argument.'];
const canvas=$('#field-canvas'),ctx=canvas.getContext('2d',{alpha:true});
const entryCanvas=$('#entry-canvas'),ectx=entryCanvas.getContext('2d',{alpha:true});
let cw=0,ch=0,ew=0,eh=0,dpr=1;
const points=[];
// Deterministic Fibonacci sphere: the characters actually rotate in 3-space.
for(let i=0;i<960;i++){
 const yy=1-(i+0.5)/960*2, rr=Math.sqrt(1-yy*yy),ang=i*Math.PI*(3-Math.sqrt(5));
 points.push({x:Math.cos(ang)*rr,y:yy,z:Math.sin(ang)*rr,k:i%13});
}
function size(){W=innerWidth;H=innerHeight;dpr=Math.min(1.65,devicePixelRatio||1);
 for(const [c,context,w,h] of [[canvas,ctx,W,H],[entryCanvas,ectx,W,H]]){if(!context)continue;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.width=w+'px';c.style.height=h+'px';context.setTransform(dpr,0,0,dpr,0,0);}
 cw=W;ch=H;ew=W;eh=H;
}
size();addEventListener('resize',size,{passive:true});
const starSeed=(n)=>{let x=Math.sin(n*68.173+31.29)*68453.392;return x-Math.floor(x)};
function drawSphere(context,w,h,time,entry=false){
 if(!context)return;
 context.clearRect(0,0,w,h);
 const scale=Math.min(w,h)*(entry?.24:(mobile.matches?.35:.43));
 const cx=w*(entry?.68:(mobile.matches?.62:.69)),cy=h*(entry?.47:(mobile.matches?.42:.48));
 const spin=time*(entry?.00014:.00016)+(mouseX-.5)*.25;
 const tilt=.22+(mouseY-.5)*.20;
 const c=Math.cos(spin),s=Math.sin(spin),ca=Math.cos(tilt),sa=Math.sin(tilt);
 // Two diffuse projected orbital guides anchor the form visually.
 context.save();context.translate(cx,cy);context.strokeStyle=entry?'rgba(204,226,202,.09)':'rgba(204,226,202,.14)';context.lineWidth=.65;
 for(let i=0;i<3;i++){context.beginPath();context.ellipse(0,0,scale*(1+.11*i),scale*(.32+.06*i),-.35+i*.4,0,Math.PI*2);context.stroke();}
 context.restore();
 context.textAlign='center';context.textBaseline='middle';context.font=`${mobile.matches?9:11}px monospace`;
 const glyphs='·:+*⋆';
 for(let j=0;j<points.length;j++){
  const p=points[j],x=p.x*c+p.z*s,z=-p.x*s+p.z*c;
  const y=p.y*ca-z*sa,depth=p.y*sa+z*ca;
  const f=2.7/(2.7-depth),sx=cx+x*scale*f,sy=cy-y*scale*f;
  if(sx<-20||sx>w+20||sy<-20||sy>h+20)continue;
  const alpha=(entry?.18:.14)+(depth+1)*.18+(starSeed(j+1)>.955?.22:0);
  const pulse=Math.pow(Math.max(0,Math.sin(time*.00165+p.k*.41+depth*2.4)),8);
  const rgb=depth>.15?'210,230,203':'144,179,171';
  context.fillStyle=`rgba(${rgb},${clamp(alpha+pulse*.26,0,.92)})`;
  context.fillText(glyphs[Math.min(4,Math.floor((depth+1)*2.4))],sx,sy);
 }
 // One orbital satellite: a tiny moving proof of continuous time.
 const a=time*.00031,c2x=cx+Math.cos(a)*scale*1.03,c2y=cy+Math.sin(a)*scale*.33;
 context.beginPath();context.arc(c2x,c2y,2.4,0,Math.PI*2);context.fillStyle='#d7e7c8';context.fill();
}
const entry=$('#entry'),entryForm=$('#entry-form'),entryInput=$('#entry-input');
const dock=$('#query'),queryInput=$('#query-input'),queryResp=$('#query-response');
const queryTargets={papers:'#writing',mathematics:'#patterns',astronomy:'#observations',outreach:'#people',about:'#about',contact:'#contact',work:'#reel',hello:'#top'};
function interpret(raw){const t=raw.toLowerCase().trim();if(!t)return null;
 const scores={papers:0,mathematics:0,astronomy:0,outreach:0,about:0,contact:0,work:0,hello:0};
 const dictionaries={
 papers:[/publish|paper|preprint|article|journal|manuscript|writing|ssrn|oeis|citation|reference|publication/,/proof of stanley|mathar|andrica/],
 mathematics:[/math|theorem|recurrence|sequence|integer|number theory|generating function|algebra|proof|combinatoric|prime|conjecture/],
 astronomy:[/astro|space|planet|star|light curve|telescope|sky|survey|asteroid|vvv|vvvx|observation|occultat|dimming|cosmos/],
 outreach:[/norcel|science communication|outreach|institute|public engagement|talk|lecture|education/],
 about:[/who are you|your story|biograph|education|ashoka|yourself|background|personal|profile/],
 contact:[/contact|email|connect|collaborat|hire|reach|linkedin|message|work together/],
 work:[/project|research|what do you do|what are you working|your work|explore|show me/],
 hello:[/^hi\b|^hello\b|^hey\b|^good morning|^greetings|^start|^home|^begin|^open/]
 };
 Object.entries(dictionaries).forEach(([k,patterns])=>patterns.forEach((r,i)=>{if(r.test(t))scores[k]+=i===0?4:2}));
 const best=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];return best[1]>0?best[0]:'unknown';
}
function goTo(selector){const node=$(selector);if(node){node.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});return true}return false;}
function navigate(raw){const target=interpret(raw);
 const messages={papers:'Opening the writing and publications archive.',mathematics:'Taking you to the mathematics work.',astronomy:'Opening the astronomical research.',outreach:'Showing science communication and NoRCEL.',about:'Taking you to the personal biography.',contact:'Opening collaboration links.',work:'Exploring the research index.',hello:'Welcome to the atlas.'};
 if(target==='unknown')return {message:'I can show research, astronomy, maths, papers, NoRCEL, biography, or contact. Try one of those.',ok:false};
 goTo(queryTargets[target]);return {message:messages[target],ok:true};
}
function showResponse(message){queryResp.textContent=message;queryResp.classList.add('shown');}
function enter(initial=''){
 if(entered)return;entered=true;document.body.classList.add('entered');entry.classList.add('leave');dock.classList.add('ready');
 window.setTimeout(()=>{entry.setAttribute('aria-hidden','true');entry.style.display='none';},900);
 if(initial){const result=navigate(initial);showResponse(result.message)}
}
entryForm.addEventListener('submit',ev=>{ev.preventDefault();enter(entryInput.value.trim())});
$('#entry-explore').addEventListener('click',()=>enter());
$('#query-form').addEventListener('submit',ev=>{ev.preventDefault();const v=queryInput.value.trim();if(!v)return;const a=navigate(v);showResponse(a.message);queryInput.value='';});
addEventListener('keydown',e=>{if(e.key==='Escape'){if(!entered){enter();return;}if(document.activeElement===queryInput){queryInput.blur();queryResp.classList.remove('shown');return;}}
 if(e.key==='/'&&entered&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();queryInput.focus();}
});
const menu=$('#menu-toggle'),nav=$('#site-nav');menu.addEventListener('click',()=>{const yes=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',yes);nav.classList.toggle('open',yes)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
// Scroll-driven cards: one control signal governs position, depth, and labels.
const cards=$$('.reel-card'),indexBtns=$$('#reel-index button');
let activeReel=-1,dragY=null;
function updateWheel(p){
 const init=range(p,0,.21),rot=range(p,.16,.95)*3;
 const pos=rot,angle=48,zoom=mix(.56,1,init);
 const h=mobile.matches?Math.min(.56*W,260):Math.min(.35*W,400);
 const radius=h*1.8,ring=h*.72,bow=h*1.25;
 cards.forEach((card,i)=>{
  const d=i-pos;
  const theta=(i/cards.length)*Math.PI*2;
  const rr=(1-init)*ring;
  const ringX=Math.cos(theta)*rr,ringY=Math.sin(theta)*rr;
  const deg=d*angle*Math.PI/180;
  const bowX=-bow*(1-Math.cos(deg));
  const x=mix(ringX,bowX,init),y=ringY*(1-init),z=mix(0,radius*Math.cos(deg)-radius,init);
  const rx=init*d*angle;
  const sc=mix(.44,1,init);
  card.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
  card.style.opacity=(init>.72&&Math.abs(d)>1.65)?'0':'1';card.style.zIndex=String(100-Math.round(Math.abs(d)*20));
  card.tabIndex=(Math.abs(i-Math.round(pos))<1)?0:-1;
 });
 const near=clamp(Math.round(pos),0,3);if(near!==activeReel){activeReel=near;reelCurrent.textContent=`0${near+1} / 04`;reelTitle.textContent=titles[near];reelDescr.textContent=descriptions[near];indexBtns.forEach((b,i)=>{b.classList.toggle('active',i===near);if(i===near)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});}
 reelProgress.style.transform=`scaleX(${p.toFixed(4)})`;
 $('#reel-wheel').style.transform=`translate3d(0,0,${mix(-h*.2,-h*.04,init).toFixed(1)}px)`;
 $('.reel-intro').style.opacity=String(1-range(p,.05,.32)*.53);
}
indexBtns.forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.reel);const limit=reel.offsetHeight-H;const t=(.20+i/3*.73);window.scrollTo({top:reel.offsetTop+limit*t,behavior:reduced.matches?'instant':'smooth'});}));
const scene=$('#reel-scene');scene.addEventListener('pointerdown',e=>{if(e.target.closest('a'))return;dragY=e.clientY});scene.addEventListener('pointerup',e=>{if(dragY===null)return;const delta=e.clientY-dragY;dragY=null;const max=reel.offsetHeight-H;window.scrollTo({top:clamp(scrollY-delta*2.5,reel.offsetTop,reel.offsetTop+max),behavior:reduced.matches?'instant':'smooth'});});
scene.addEventListener('pointercancel',()=>{dragY=null});
let lastScrollValue=0,frameCount=0;
const pointer={x:-100,y:-100};const customCursor=$('#cursor');
addEventListener('pointermove',e=>{mouseX=clamp(e.clientX/W);mouseY=clamp(e.clientY/H);pointer.x=e.clientX;pointer.y=e.clientY;customCursor.style.opacity=e.pointerType==='mouse'?'1':'0';},{passive:true});
document.addEventListener('pointerover',e=>{const b=e.target.closest('a,button,.reel-card');customCursor.classList.toggle('view',!!b)});
document.addEventListener('visibilitychange',()=>{visible=!document.hidden});
function render(t){requestAnimationFrame(render);if(!visible)return;
 let dt=Math.min(50,Math.max(0,t-lastTime));lastTime=t;
 renderScroll+=((scrollY||0)-renderScroll)*(reduced.matches?1:clamp(dt*.017,.03,.35));
 const sy=renderScroll;frameCount++;
 progress.style.transform=`scaleX(${clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-H)).toFixed(4)})`;
 const op=clamp((sy-opening.offsetTop)/Math.max(1,opening.offsetHeight-H));
 stage.style.setProperty('--op',range(op,.06,.92).toFixed(4));
 const tp=clamp((sy-transition.offsetTop)/Math.max(1,transition.offsetHeight-H));
 const exp=range(tp,.04,.5),wipe=range(tp,.87,1);
 const scale=.45+exp*.63;
 $('#transition-image').style.setProperty('--imageScale',scale.toFixed(4));
 $('#transition-image').style.setProperty('--expand',exp.toFixed(4));
 $('#transition-image').style.setProperty('--imagePan',((tp-.5)*2).toFixed(4));
 const word=range(tp,.08,.18)*(1-range(tp,.28,.46));
 $('#transition-word').style.opacity=String(word*.75);
 const question=range(tp,.36,.56)*(1-range(tp,.72,.86));
 $('#transition-question').style.opacity=String(question);
 $('#transition-question').style.transform=`translate3d(0,${((1-question)*20).toFixed(2)}px,0)`;
 $('.transition-caption').style.opacity=String(range(tp,.32,.52)*(1-range(tp,.78,.9))*.95);
 $('#transition-wipe').style.transform=`translate3d(0,${(100.3-wipe*101).toFixed(2)}%,0)`;
 header.classList.toggle('light',sy>transition.offsetTop+transition.offsetHeight-H-40 && sy<$('.end').offsetTop);
 // The work reel uses scroll only, no hijack. It is naturally escapable.
 const rp=clamp((sy-reel.offsetTop)/Math.max(1,reel.offsetHeight-H));
 if(sy>reel.offsetTop-H&&sy<reel.offsetTop+reel.offsetHeight+H)updateWheel(rp);
 if(!reduced.matches && entered && frameCount%2===0 && sy<opening.offsetHeight+H*.5){drawSphere(ctx,cw,ch,t,false)}
 if(!entered && !reduced.matches && frameCount%2===0)drawSphere(ectx,ew,eh,t,true);
 if(customCursor.style.opacity!=='0'){cursorX+=((pointer.x)-cursorX)*.21;cursorY+=((pointer.y)-cursorY)*.21;customCursor.style.transform=`translate3d(${(cursorX-(customCursor.classList.contains('view')?35:14)).toFixed(1)}px,${(cursorY-(customCursor.classList.contains('view')?35:14)).toFixed(1)}px,0)`;}
 if(frameCount%2===0){$$('.chapter-visual').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<0||r.top>H)return;const f=clamp((r.top+r.height/2-H/2)/H,-1,1);el.querySelector('img').style.transform=`translate3d(0,${(-f*4).toFixed(2)}%,0) scale(1.13)`;});}
}
requestAnimationFrame(render);
// Never keep users trapped behind a dialog if the browser has restored their scroll position.
if(location.hash&&location.hash!=='#top'){enter();setTimeout(()=>goTo(location.hash),70)}
})();