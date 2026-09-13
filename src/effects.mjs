import {clamp} from './motion.mjs';

// Separate decorative depth from the footage: the original cat remains scroll-controlled.
export function flightEnvelope(seconds) {
  return seconds >= 0 && seconds < 2.2 ? Math.sin(seconds / 2.2 * Math.PI) ** 1.4 : 0;
}
export function initEffects() {
  const stage = document.querySelector('.orbit-stage');
  if (stage) initSpace(stage);
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  document.querySelectorAll('.note-art,.visit-ticket,.service-illustration').forEach(el => {
    el.addEventListener('pointermove', e => {
      if (!finePointer.matches || document.documentElement.dataset.motion === 'paused') return;
      const box = el.getBoundingClientRect();
      el.style.setProperty('--tilt-x', `${clamp((e.clientY-box.top)/box.height,0,1)*-16+8}deg`);
      el.style.setProperty('--tilt-y', `${clamp((e.clientX-box.left)/box.width,0,1)*20-10}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    });
  });
}

function initSpace(stage) {
  const canvas = stage.querySelector('#stardust'), ctx = canvas.getContext('2d');
  const jump = stage.querySelector('.space-jump');
  if (!ctx) { jump.hidden = true; return; }
  const rings = stage.querySelector('.orbital-system');
  const limb = stage.querySelector('.earth-limb');
  const word = stage.querySelector('.space-word span');
  let width=1,height=1,p=0,last=0,clock=0,raf=0,jumpTime=-1,visible=false,suspended=false;
  let targetX=0,targetY=0,mouseX=0,mouseY=0,lastPaint=0;
  const reduced = () => document.documentElement.dataset.motion === 'paused';
  // Stable particles survive resizing and scrolling; only the drawing surface changes.
  const stars = Array.from({length:110}, (_,i) => ({
    x: Math.sin(i*127.1+2)*1.7,
    y: Math.sin(i*311.7+7)*1.25,
    z: ((i*73)%109)/109*1.8+.2,
    size: i%7===0?1.5:.65,
    hue: i%5===0?'210,233,133':'184,220,233'
  }));
  function resize(){
    width=stage.clientWidth;height=stage.clientHeight;
    const dpr=Math.min(devicePixelRatio||1,width<601?1.25:1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);lastPaint=0;queue();
  }
  function sync(){
    const running=visible&&!document.hidden&&!reduced()&&!suspended;
    stage.classList.toggle('effects-resting',!running);
    jump.disabled=reduced();
    jump.title=reduced()?'Resume motion to try the space jump':'Take a little flight';
    if(!running){cancelAnimationFrame(raf);raf=0;last=0;jumpTime=-1;stage.style.setProperty('--jump','0');jump.removeAttribute('aria-busy');jump.querySelector('b').textContent='Space jump';ctx.clearRect(0,0,width,height);}
    else queue();
  }
  function queue(){if(!raf&&visible&&!document.hidden&&!reduced()&&!suspended)raf=requestAnimationFrame(frame);}
  function frame(now){
    raf=0;
    if(!visible||document.hidden||reduced()||suspended)return;
    // Drawing at 30 fps bounds decorative work; the original scroll renderer is independent.
    if(now-lastPaint<30){queue();return;}
    lastPaint=now;
    const dt=last?clamp((now-last)/1000,0,.06):0;last=now;clock+=dt;
    if(jumpTime>=0){jumpTime+=dt;if(jumpTime>=2.2){jumpTime=-1;jump.removeAttribute('aria-busy');jump.querySelector('b').textContent='Space jump';}}
    const flight=flightEnvelope(jumpTime);
    mouseX+=(targetX-mouseX)*.09;mouseY+=(targetY-mouseY)*.09;
    stage.style.setProperty('--pointer-x',`${mouseX*18}px`);
    stage.style.setProperty('--pointer-y',`${mouseY*13}px`);
    stage.style.setProperty('--jump',flight.toFixed(3));
    stage.style.setProperty('--ring-turn',`${p*165+clock*3}deg`);
    stage.style.setProperty('--ring-pitch',`${58+p*32+mouseY*10}deg`);
    stage.style.setProperty('--ring-yaw',`${-24+p*80+mouseX*12}deg`);
    rings.style.opacity=String((1-clamp((p-.79)/.18))*.8);
    const landing=clamp((p-.72)/.28);
    limb.style.transform=`translateY(${105-landing*81}%) rotate(${-16+landing*16}deg) scale(${.8+landing*.3})`;
    stage.classList.toggle('is-landing',landing>.5);stage.classList.toggle('has-landed',p>(width<601?.9:.965));
    word.style.setProperty('--word-flight',`${flight*30}px`);
    ctx.clearRect(0,0,width,height);
    const count=width<601?65:stars.length,cx=width*(width<901?.5:.67)+mouseX*35,cy=height*.42+mouseY*24;
    for(let i=0;i<count;i++){
      const s=stars[i];s.z-=dt*(.045+flight*1.8);
      if(s.z<.13)s.z+=1.9;
      const x=cx+s.x*width*.38/s.z,y=cy+s.y*height*.42/s.z;
      const prevZ=s.z+(.006+flight*.13),px=cx+s.x*width*.38/prevZ,py=cy+s.y*height*.42/prevZ;
      if(x < -60 || x>width+60 || y < -60 || y>height+60)continue;
      const alpha=clamp((2-s.z)*.35+.1,0,.7)*(x<width*.45?.5:1);
      ctx.strokeStyle=`rgba(${s.hue},${alpha})`;ctx.fillStyle=ctx.strokeStyle;
      ctx.lineWidth=s.size;
      if(flight>.05){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}
      else {ctx.beginPath();ctx.arc(x,y,s.size/s.z*.65,0,Math.PI*2);ctx.fill();}
    }
    queue();
  }
  stage.addEventListener('orbit:progress',e=>{p=e.detail;queue();});
  stage.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    const box=stage.getBoundingClientRect();targetX=clamp((e.clientX-box.left)/box.width)*2-1;targetY=clamp((e.clientY-box.top)/box.height)*2-1;
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  jump.addEventListener('click',()=>{
    if(reduced()||jumpTime>=0)return;
    jumpTime=0;jump.setAttribute('aria-busy','true');jump.querySelector('b').textContent='In flight';queue();
  });
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});io.observe(stage);
  const ro=new ResizeObserver(resize);ro.observe(stage);
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('cat:motion',sync);
  window.addEventListener('pagehide',()=>{suspended=true;sync();});
  window.addEventListener('pageshow',()=>{suspended=false;sync();});
  resize();sync();
}
