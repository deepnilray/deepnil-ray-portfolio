(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const clamp = (v,lo=0,hi=1) => Math.max(lo,Math.min(hi,v));
  const mix = (a,b,t) => a+(b-a)*t;
  const ease = t => { t=clamp(t); return t*t*(3-2*t); };
  const range = (v,a,b) => ease((v-a)/(b-a));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gate=$('#gate'), prologue=$('#prologue'), threshold=$('#threshold'), chapters=$('#chapters');
  const orb=$('#orb-canvas'), ctx=orb.getContext('2d',{alpha:true});
  const heroText=$('#hero-text'), heroCover=$('#hero-cover');
  const frame=$('#threshold-frame'), img=frame.querySelector('img'), giant=$('#threshold-giant');
  const caption=$('.threshold-caption'), text=$('#threshold-text'), paper=$('#threshold-paper');
  const sceneEls=$$('.chapter-visual'), sceneCopies=$$('.chapter-copy');
  const chCount=$('#chapter-count'), chTrack=$('#chapter-track-bar');
  const interlude=$('#interlude-line');
  const progressBar=$('#read-progress');
  const header=$('#header');
  let vw=innerWidth, vh=innerHeight, dpr=1;
  let heroEnd=1, thresholdBegin=1, thresholdTravel=1, chaptersBegin=1, chaptersTravel=1;
  let desired=[0,0,0,0], current=[0,0,0,0];
  let mouseX=0,mouseY=0,mouseTX=0,mouseTY=0, last=0, drawing=true,entered=false;
  const seedRandom = seed => () => {seed=(seed*1664525+1013904223)>>>0; return seed/4294967296;};
  const rng=seedRandom(451);
  const dots=[]; const dust=[];
  const N=1150;
  // Fibonacci spiral: dots distributed almost evenly across a real sphere.
  for(let i=0;i<N;i++) {
    const y=1-2*(i+.5)/N;
    const r=Math.sqrt(Math.max(0,1-y*y));
    const a=i*Math.PI*(3-Math.sqrt(5));
    dots.push({x:r*Math.cos(a),y,z:r*Math.sin(a),shift:rng()*Math.PI*2,kind:rng(),lum:rng()});
  }
  for(let i=0;i<110;i++)dust.push({x:rng(),y:rng(),r:1+rng()*1.9,ph:rng()*Math.PI*2});
  function resize(){
    vw=innerWidth; vh=innerHeight;
    heroEnd=Math.max(1,prologue.offsetHeight-vh);
    thresholdBegin=threshold.getBoundingClientRect().top+scrollY;
    thresholdTravel=Math.max(1,threshold.offsetHeight-vh);
    chaptersBegin=chapters.getBoundingClientRect().top+scrollY;
    chaptersTravel=Math.max(1,chapters.offsetHeight-vh);
    const box=orb.getBoundingClientRect(); dpr=Math.min(devicePixelRatio||1,1.5);
    orb.width=Math.round(box.width*dpr); orb.height=Math.round(box.height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    updateTargets();
  }
  function updateTargets(){
    const s=scrollY;
    desired[0]=clamp(s/heroEnd);
    desired[1]=clamp((s-thresholdBegin)/thresholdTravel);
    desired[2]=clamp((s-chaptersBegin)/chaptersTravel);
    const inter=$('.interlude'); const r=inter.getBoundingClientRect();
    desired[3]=clamp((vh-r.top)/(vh+r.height));
    progressBar.style.transform='scaleX('+clamp(s/Math.max(1,document.documentElement.scrollHeight-vh))+')';
    header.classList.toggle('scrolled',s>70);
  }
  function renderSphere(sec,p){
    if(!ctx) return;
    const width=orb.width/dpr,height=orb.height/dpr;
    ctx.clearRect(0,0,width,height);
    const fade=1-range(p,.62,1.01);
    if(fade<.004)return;
    ctx.globalAlpha=fade;
    const cx=width*.52,cy=height*.52;
    const R=Math.min(width*.35,height*.445);
    const yaw=sec*.24+mouseX*.20, pitch=.20+Math.sin(sec*.15)*.08+mouseY*.14;
    const co=Math.cos(yaw),si=Math.sin(yaw), cp=Math.cos(pitch),sp=Math.sin(pitch);
    const enlarge=1+p*.58;
    ctx.save();ctx.translate(cx,cy);ctx.scale(enlarge,enlarge);
    // A drifting field of individual points behind the orb.
    for(let i=0;i<dust.length;i++){
      const d=dust[i]; const f=.1+.23*(.5+.5*Math.sin(sec*.3+d.ph));
      ctx.globalAlpha=f*fade;ctx.fillStyle='#c1c8bc';ctx.fillRect((d.x-.5)*width*.93,(d.y-.5)*height*.85,d.r,d.r);
    }
    ctx.font=vw<700?'11px Courier New':'12px Courier New';
    ctx.textAlign='center';ctx.textBaseline='middle';
    // Render back to front to preserve sphere volume. ASCII glyphs have a genuine moving 3D position.
    for(let pass=0;pass<2;pass++) for(let i=0;i<dots.length;i++){
      if(vw<700 && i%2)continue;
      const d=dots[i];
      let x=d.x*co-d.z*si, z=d.x*si+d.z*co;
      let y=d.y*cp-z*sp; z=d.y*sp+z*cp;
      if((z>0?1:0)!==pass)continue;
      const perspective=2.75/(2.75-z*.58);
      const X=x*R*perspective, Y=y*R*perspective;
      const value=.32+.56*(z+1)*.5+.10*Math.sin(sec*1.05+d.shift);
      const lumin=clamp(value);
      const character=d.kind>.965?'#':d.kind>.88?'*':d.kind>.70?'+':d.kind>.4?':':'.';
      ctx.globalAlpha=fade*(.13+.8*lumin)*(pass?.95:.4);
      ctx.fillStyle=d.kind>.986?'#ffdcaf':pass?'#d7e4d6':'#76908b';
      ctx.fillText(character,X,Y);
    }
    // A single orbiting accent demonstrates live motion even when scroll is idle.
    const a=sec*.45,xx=Math.cos(a)*R*.88,yy=Math.sin(a)*R*.29;
    ctx.globalAlpha=.95*fade;ctx.fillStyle='#ffe6bb';ctx.shadowColor='#f8d6a6';ctx.shadowBlur=20;
    ctx.beginPath();ctx.arc(xx,yy,3.2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.restore();ctx.globalAlpha=1;
  }
  function paint() {
    const [h,p,c,i]=current;
    const fade=1-range(h,.60,.92);
    heroText.style.transform=`translate3d(0,${(-82*ease(h)).toFixed(2)}px,0) scale(${(1+.028*h).toFixed(4)})`;
    heroText.style.opacity=fade.toFixed(4);
    orb.style.opacity=(1-range(h,.71,1)).toFixed(4);
    heroCover.style.opacity=range(h,.91,1).toFixed(4);
    const f=range(p,.055,.67);
    frame.style.transform=`translate3d(0,0,0) scale(${mix(vw<700?.58:.48,1,f).toFixed(5)})`;
    img.style.transform=`translate3d(${mix(-1.6,1.6,p).toFixed(2)}%,${mix(-2.2,2.2,p).toFixed(2)}%,0) scale(${mix(1.24,1.035,f).toFixed(5)})`;
    giant.style.transform=`translate3d(${mix(0,-vw*.46,p).toFixed(2)}px,-50%,0)`;
    giant.style.opacity=((1-range(p,.32,.69))*range(p,.02,.2)*.45).toFixed(4);
    const show=range(p,.46,.67)*(1-range(p,.79,.94));
    caption.style.opacity=(range(p,.38,.51)*(1-range(p,.88,.96))).toFixed(4);
    text.style.opacity=show.toFixed(4);
    text.style.transform=`translate3d(0,${mix(74,0,range(p,.46,.67)).toFixed(2)}px,0)`;
    paper.style.transform=`translate3d(0,${(100-range(p,.855,1)*100).toFixed(3)}%,0)`;
    // The film chapters crossfade continuously with scroll, not by discrete click-triggered changes.
    const pos=clamp(c*2.44,0,2);
    const n=Math.min(2,Math.floor(pos)),m=ease(pos-n);
    for(let j=0;j<3;j++){
      const weight=j===n?1-m:(j===n+1?m:0);
      const visual=sceneEls[j],copy=sceneCopies[j];
      visual.style.opacity=weight.toFixed(4);
      visual.style.transform=`translate3d(${((pos-j)*-3.5).toFixed(3)}%,${((pos-j)*9).toFixed(2)}px,0) scale(${(1.05+.075*Math.abs(pos-j)).toFixed(4)})`;
      const wordAlpha=j===n ? 1-range(m,.42,.61) : (j===n+1 ? range(m,.56,.76) : 0);
      copy.style.opacity=wordAlpha.toFixed(4);
      copy.style.transform=`translate3d(0,${((j-pos)*90).toFixed(2)}px,0)`;
      copy.style.pointerEvents=wordAlpha>.7?'auto':'none';
      copy.setAttribute('aria-hidden',wordAlpha>.7?'false':'true');
    }
    chCount.innerHTML=String(Math.min(3,n+1)).padStart(2,'0')+' <span>/ 03</span>';
    chTrack.style.transform='scaleX('+clamp(c).toFixed(4)+')';
    interlude.style.transform=`translate3d(0,${mix(80,-60,i).toFixed(2)}px,0)`;
    interlude.style.opacity=String(.45+.55*range(i,.1,.46));
  }
  function animate(timestamp){
    const dt=last?Math.min(.065,(timestamp-last)/1000):.016;last=timestamp;
    const k=reduced.matches?1:1-Math.exp(-dt/0.11);
    for(let j=0;j<current.length;j++)current[j]+= (desired[j]-current[j])*k;
    mouseX+= (mouseTX-mouseX)*Math.min(1,dt*2.0);
    mouseY+= (mouseTY-mouseY)*Math.min(1,dt*2.0);
    paint();
    const activeHero=scrollY<heroEnd+vh;
    if(activeHero)renderSphere(timestamp/1000,current[0]);
    else if(drawing){ctx.clearRect(0,0,orb.width/dpr,orb.height/dpr);drawing=false;}
    if(activeHero)drawing=true;
    if(!reduced.matches) requestAnimationFrame(animate);
  }
  addEventListener('scroll',updateTargets,{passive:true});
  let resizeHandle;
  addEventListener('resize',()=>{clearTimeout(resizeHandle);resizeHandle=setTimeout(resize,120);},{passive:true});
  addEventListener('pointermove',e=>{mouseTX=e.clientX/vw*2-1;mouseTY=e.clientY/vh*2-1;},{passive:true});
  const siteLinks = new Map([
    ['astronomy','chapters'],['mathematics','chapters'],['science','chapters'],['papers','papers'],['research','research'],['about','about'],['contact','contact']
  ]);
  function classify(raw){
    const s=raw.trim().toLowerCase();if(!s)return {section:null,answer:''};
    if(/\b(hello|hi|hey|good morning|greetings)\b/.test(s)&&s.length<40) return {section:'top',answer:'Hello. Welcome to my research journal.'};
    if(/\b(contact|email|reach|linkedin|collaborat\w*|message)\b/.test(s))return {section:'contact',answer:'Contact and collaboration links.'};
    if(/\b(papers?|preprints?|manuscripts?|ssrn|publications?|articles?|journal|writing)\b/.test(s))return {section:'papers',answer:'Selected public writing and research.'};
    if(/\b(math\w*|oeis|sequenc\w*|proof\w*|theorem\w*|number theory|recurrence\w*|algebra)\b/.test(s))return {section:'mathematics',answer:'Mathematics, sequences and proofs.'};
    if(/\b(astro\w*|planets?|asteroids?|stars?|sky|space|cosmology|galax\w*|survey\w*)\b/.test(s))return {section:'astronomy',answer:'Astronomy and observational work.'};
    if(/\b(norcel|communicat\w*|outreach|teaching|team|science)\b/.test(s))return {section:'science',answer:'Science communication and people.'};
    if(/\b(who|about|background|ashoka|biography|yourself)\b/.test(s))return {section:'about',answer:'A short biography.'};
    if(/\b(work|projects?|research|explor\w*|interests?)\b/.test(s))return {section:'research',answer:'Selected research directions.'};
    return {section:null,answer:'Try asking about mathematics, astronomy, publications, NoRCEL or contact.'};
  }
  const dockAnswer=$('#ask-answer'); let feedbackTimer;
  function route(raw){
    const c=classify(raw);if(!c.answer)return;
    dockAnswer.textContent=c.answer;dockAnswer.classList.add('show');
    clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>dockAnswer.classList.remove('show'),5200);
    if(!c.section)return;
    let dest=siteLinks.get(c.section)||c.section;
    if(c.section==='astronomy'||c.section==='mathematics'||c.section==='science'){
      const index={astronomy:0,mathematics:1,science:2}[c.section];
      const s=chaptersBegin+chaptersTravel*(index/2.44);
      scrollTo({top:s,behavior:reduced.matches?'instant':'smooth'});return;
    }
    const target=$('#'+dest);if(target)target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  }
  let gateTimer;
  function enter(q=''){
    if(entered)return;entered=true;document.body.classList.add('entered');
    gate.classList.add('closing');gate.setAttribute('aria-hidden','true');gate.removeAttribute('aria-modal');gate.inert=true;
    clearTimeout(gateTimer);gateTimer=setTimeout(()=>{gate.hidden=true;if(q.trim())route(q);},reduced.matches?0:1230);
  }
  $('#gate-form').addEventListener('submit',e=>{e.preventDefault();enter($('#gate-input').value);});
  $('#gate-skip').addEventListener('click',()=>enter());
  $('#ask-form').addEventListener('submit',e=>{e.preventDefault();const input=$('#ask-input');if(!input.value.trim())return;const q=input.value;input.value='';if(!entered)enter();route(q);});
  const menu=$('#menu-button'),nav=$('#mobile-nav');
  menu.addEventListener('click',()=>{const on=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(on));nav.hidden=!on;});
  nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.hidden=true;menu.setAttribute('aria-expanded','false');}});
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}, {threshold:.08,rootMargin:'0px 0px -8% 0px'});
  $$('.papers-list a,.intro-title,.papers h2,.about-title,.about-detail,.contact h2').forEach(el=>observer.observe(el));
  // If animations are disabled by the visitor, the content is presented immediately.
  if(reduced.matches){current=[0,0,0,0];resize();paint();renderSphere(0,0);}
  else{resize();requestAnimationFrame(animate);}
  if(location.hash&&location.hash!=='#top')enter();
  setTimeout(()=>{if(!entered)$('#gate-input').focus({preventScroll:true});},170);
  // Public debugging hook for deterministic verification of frame-to-frame motion.
  window.__motionDebug=()=>({hero:current[0],image:current[1],chapters:current[2],canvasSize:[orb.width,orb.height],entered});
})();