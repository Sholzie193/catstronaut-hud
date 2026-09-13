import {clamp} from './motion.mjs';

export function initEffects() {
  const stage = document.querySelector('.orbit-stage');
  if (stage) initLanding(stage);
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

// The cat film owns the entire scroll sequence. Only the final green horizon is added.
function initLanding(stage) {
  const limb=stage.querySelector('.earth-limb');
  let progress=0;
  function update(){
    const p=document.documentElement.dataset.motion==='paused'?0:progress;
    const landing=clamp((p-.72)/.28);
    limb.style.transform=`translateY(${105-landing*81}%) rotate(${-16+landing*16}deg) scale(${.8+landing*.3})`;
    stage.classList.toggle('is-landing',landing>.5);
    stage.classList.toggle('has-landed',p>(stage.clientWidth<601?.9:.965));
  }
  stage.addEventListener('orbit:progress',event=>{progress=event.detail;update();});
  document.addEventListener('cat:motion',update);
  const resize=new ResizeObserver(update);resize.observe(stage);
  update();
}
