export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export function scenePose(p,mobile=false){p=clamp(p);return{frame:Math.round(p*95),introOpacity:1-clamp((p-.07)/.2),introX:-p*(mobile?130:280),introZ:-p*1100,introRotate:-p*40,wordOpacity:clamp((p-.2)/.11)*(1-clamp((p-.64)/.12)),wordX:(.49-p)*(mobile?800:2300),wordY:Math.sin(p*Math.PI*2)*(mobile?35:70),wordZ:(p-.5)*750,wordRotate:(.49-p)*110,outroOpacity:clamp((p-.76)/.13),outroY:70*(1-clamp((p-.76)/.2)),chapter:p<.3?0:p<.75?1:2};}
export function subjectFocus(frame){const points=[[0,.55],[24,.50],[42,.31],[64,.58],[80,.53],[95,.50]];for(let i=1;i<points.length;i++){if(frame<=points[i][0]){const [a,x]=points[i-1],[b,y]=points[i];const t=clamp((frame-a)/(b-a));return x+(y-x)*t}}return .5;}

// Frame-rate-independent damping matches the original player's short settling motion.
export function advanceFrame(current,target,dt){return current+(target-current)*(1-Math.exp(-clamp(dt,0,.064)/.045));}
export function framePriorities(current,target){
 const center=Math.round(clamp(current,0,95)),goal=Math.round(clamp(target,0,95)),direction=Math.sign(goal-center)||1;
 return [...new Set([center,center+direction,center-direction,goal,...Array.from({length:24},(_,i)=>center+direction*(i+1)),...Array.from({length:8},(_,i)=>center-direction*(i+1)),...Array.from({length:96},(_,i)=>i).sort((a,b)=>Math.abs(a-center)-Math.abs(b-center))])].filter(i=>i>=0&&i<96);
}
export function initOrbit(){
 const story=document.querySelector('.orbit-story');if(!story)return;
 const stage=story.querySelector('.orbit-stage'),canvas=story.querySelector('#orbit-canvas');
 const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});if(!ctx)return;
 const intro=story.querySelector('.hero-start'),word=story.querySelector('.space-word'),outro=story.querySelector('.orbit-outro');
 const caption=story.querySelector('#chapter-copy'),count=story.querySelector('.scene-count'),seal=story.querySelector('.flight-seal');
 const bitmaps=new Map(),blobs=new Map(),fetching=new Set(),decoding=new Set(),failed=new Set();
 const constrained=navigator.connection?.saveData;
 const base=innerWidth<=800||constrained?'mobile':'desktop',maxDecoded=24;
 let raf=0,lastTime=0,smooth=0,target=0,lastDraw=-1,lastFocus=-1,visible=true,suspended=false;
 let mobile=innerWidth<=600,stageTop=0,travel=1,alive=true,paused=document.documentElement.dataset.motion==='paused';
 let priority=[],priorityKey='',chapter=-1;
 function allowed(){return alive&&!paused&&!suspended&&!document.hidden&&visible;}
 function positionSeal(w,h,x,y,cw,ch){
   seal.style.left=`${(x+w*.906)/cw*100}%`;seal.style.top=`${(y+h*.815)/ch*100}%`;seal.style.width=`${w*.09/cw*100}%`;
 }
 function posterSeal(){const box=canvas.parentElement,cw=box.clientWidth,ch=box.clientHeight,scale=Math.max(cw/1440,ch/810),w=1440*scale,h=810*scale;positionSeal(w,h,(cw-w)*(mobile?.58:innerWidth>=1700?.60:.62),(ch-h)/2,cw,ch);}
 function crop(w,h,focus){return canvas.height>canvas.width*.8?clamp(canvas.width*.5-w*focus,canvas.width-w,0):(canvas.width-w)*.62;}
 function draw(index){
   const bitmap=bitmaps.get(index);if(!bitmap||!canvas.width)return;
   const scale=Math.max(canvas.width/bitmap.width,canvas.height/bitmap.height),w=bitmap.width*scale,h=bitmap.height*scale;
   const focus=subjectFocus(smooth),x=crop(w,h,focus),y=(canvas.height-h)/2;
   if(index===lastDraw&&Math.abs(focus-lastFocus)<.00025)return;
   ctx.drawImage(bitmap,x,y,w,h);positionSeal(w,h,x,y,canvas.width,canvas.height);
   lastDraw=index;lastFocus=focus;stage.dataset.ready='true';canvas.dataset.frame=String(index);
 }
 function evict(){
   if(bitmaps.size<=maxDecoded)return;
   const wanted=Math.round(smooth),keys=[...bitmaps.keys()].filter(i=>i!==lastDraw&&i!==wanted).sort((a,b)=>Math.abs(b-smooth)-Math.abs(a-smooth));
   while(bitmaps.size>maxDecoded&&keys.length){const i=keys.shift();bitmaps.get(i).close();bitmaps.delete(i);}
 }
 async function fetchFrame(index){
   fetching.add(index);
   try{const response=await fetch(`/assets/sequence/${base}/frame_${String(index).padStart(3,'0')}.webp`);if(!response.ok)throw Error('Unavailable frame');const blob=await response.blob();if(alive)blobs.set(index,blob);}
   catch{failed.add(index);}
   finally{fetching.delete(index);if(allowed()){pump();queue();}}
 }
 async function decodeFrame(index){
   decoding.add(index);
   try{const bitmap=await createImageBitmap(blobs.get(index));if(!alive){bitmap.close();return;}bitmaps.set(index,bitmap);evict();}
   catch{failed.add(index);}
   finally{decoding.delete(index);if(allowed()){pump();queue();}}
 }
 function pump(){
   if(!allowed())return;
   const key=`${Math.round(smooth)}:${Math.round(target)}`;
   if(key!==priorityKey){priorityKey=key;priority=framePriorities(smooth,target);}
   // Keep the whole compressed film warm, instead of waiting for each scroll event.
   const loading=constrained?priority.slice(0,18):priority;
   for(const i of loading){if(fetching.size>=4)break;if(!blobs.has(i)&&!fetching.has(i)&&!failed.has(i))void fetchFrame(i);}
   // Decode a forward/backward window ahead of playback; compressed frames stay reusable.
   for(const i of priority.slice(0,18)){if(decoding.size>=2)break;if(blobs.has(i)&&!bitmaps.has(i)&&!decoding.has(i)&&!failed.has(i))void decodeFrame(i);}
 }
 function frame(now){
   raf=0;if(!allowed())return;
   const dt=lastTime?Math.min((now-lastTime)/1000,.064):1/60;lastTime=now;
   target=clamp((scrollY-stageTop)/travel)*95;
   smooth=advanceFrame(smooth,target,dt);if(Math.abs(target-smooth)<.015)smooth=target;
   const p=smooth/95,pose=scenePose(p,mobile);
   intro.style.opacity=pose.introOpacity;intro.style.transform=`translateX(${pose.introX}px) translateZ(${pose.introZ}px) rotateY(${pose.introRotate}deg)`;intro.inert=pose.introOpacity<.15;
   word.style.opacity=pose.wordOpacity;word.style.transform=`translate3d(${pose.wordX}px,${pose.wordY}px,${pose.wordZ}px) rotateY(${pose.wordRotate}deg) rotateZ(${-8+p*13}deg)`;
   outro.style.opacity=pose.outroOpacity;outro.style.transform=`translateY(${pose.outroY}px)`;
   stage.style.setProperty('--progress',String(p));stage.dispatchEvent(new CustomEvent('orbit:progress',{detail:p}));
   if(chapter!==pose.chapter){chapter=pose.chapter;caption.textContent=['For the curious. And the cautious.','Brave little beings. Big feelings.','A world of care. Right here.'][chapter];count.textContent=`0${chapter+1} / 03`;}
   const desired=Math.round(smooth);
   // Never flash an arbitrary distant frame when a request completes out of order.
   if(bitmaps.has(desired))draw(desired);
   else {const nearest=[...bitmaps.keys()].filter(i=>Math.abs(i-desired)<=3).sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired))[0];if(nearest!==undefined&&Math.abs(nearest-desired)<Math.abs(lastDraw-desired))draw(nearest);}
   pump();if(Math.abs(target-smooth)>.015)queue();else lastTime=0;
 }
 function queue(){if(!raf&&allowed())raf=requestAnimationFrame(frame);}
 function measure(){
   mobile=innerWidth<=600;const rect=story.getBoundingClientRect();stageTop=scrollY+rect.top-parseFloat(getComputedStyle(stage).top||0);travel=Math.max(1,story.offsetHeight-stage.offsetHeight);
   const box=canvas.parentElement,dpr=Math.min(devicePixelRatio||1,mobile?1.5:1.6),w=Math.round(box.clientWidth*dpr),h=Math.round(box.clientHeight*dpr);
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;const previous=lastDraw;lastDraw=-1;lastFocus=-1;if(!paused)draw(previous);}
   if(paused||lastDraw<0)posterSeal();queue();
 }
 function stop(){cancelAnimationFrame(raf);raf=0;lastTime=0;}
 const ro=new ResizeObserver(measure);ro.observe(canvas.parentElement);ro.observe(story);
 const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){measure();pump();queue();}else stop();});io.observe(stage);
 const motion=()=>{paused=document.documentElement.dataset.motion==='paused';if(paused){stop();intro.inert=false;posterSeal();}else{measure();pump();queue();}};
 const visibility=()=>{if(document.hidden)stop();else{pump();queue();}};
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',measure,{passive:true});document.addEventListener('cat:motion',motion);document.addEventListener('visibilitychange',visibility);
 window.addEventListener('pagehide',()=>{suspended=true;stop();});window.addEventListener('pageshow',()=>{suspended=false;measure();pump();queue();});
 measure();pump();
 return()=>{alive=false;stop();ro.disconnect();io.disconnect();bitmaps.forEach(b=>b.close());bitmaps.clear();blobs.clear();window.removeEventListener('scroll',queue);window.removeEventListener('resize',measure);document.removeEventListener('cat:motion',motion);document.removeEventListener('visibilitychange',visibility);};
}
