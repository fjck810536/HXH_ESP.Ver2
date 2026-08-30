const app=document.getElementById('app');
let stackRun=0;

function dockMultiConfirm(){
  const dock=app?.querySelector('.question-dock');
  const confirm=app?.querySelector('.confirm-dock');
  if(!dock||!confirm||confirm.parentElement===dock)return;
  dock.appendChild(confirm);
  dock.classList.add('has-confirm');
}

/* Locked single-select motion. Do not change without explicitly reopening single-choice UI. */
function animatePush(items,before,{duration,easing}){
  items.forEach(el=>{
    const a=before.get(el),b=el.getBoundingClientRect();
    if(!a||!b)return;
    const dx=a.left-b.left,dy=a.top-b.top;
    if(Math.abs(dx)<.5&&Math.abs(dy)<.5)return;
    el.animate(
      [{transform:`translate3d(${dx}px,${dy}px,0)`},{transform:'translate3d(0,0,0)'}],
      {duration,easing,fill:'both'}
    );
  });
}

function easeOutCubic(t){return 1-Math.pow(1-t,3);}

function animateScrollTo(scroll,target,duration){
  const start=scroll.scrollTop;
  const delta=target-start;
  if(Math.abs(delta)<.5){scroll.scrollTop=target;return;}
  const begin=performance.now();
  function frame(now){
    const p=Math.min(1,(now-begin)/duration);
    scroll.scrollTop=start+delta*easeOutCubic(p);
    if(p<1)requestAnimationFrame(frame);
    else scroll.scrollTop=target;
  }
  requestAnimationFrame(frame);
}

function animateGroupShift(box,dy,duration){
  if(Math.abs(dy)<.5)return;
  const anim=box.animate(
    [{transform:`translate3d(0,${dy}px,0)`},{transform:'translate3d(0,0,0)'}],
    {duration,easing:'cubic-bezier(.2,.72,.28,1)',fill:'both'}
  );
  anim.finished.then(()=>anim.cancel()).catch(()=>{});
}

function animateIncoming(el,duration,lift,easing){
  const anim=el.animate(
    [{opacity:0,transform:`translate3d(0,${lift}px,0)`},{opacity:1,transform:'translate3d(0,0,0)'}],
    {duration,easing,fill:'both'}
  );
  anim.finished.then(()=>anim.cancel()).catch(()=>{});
}

function revealStack(){
  const box=app?.querySelector('.options');
  const scroll=app?.querySelector('.option-scroll');
  if(!box||!scroll||box.dataset.stackReady==='1')return;
  box.dataset.stackReady='1';
  const run=++stackRun;
  const items=[...box.children];
  if(!items.length)return;

  const isMulti=box.classList.contains('multi-options');

  items.forEach(el=>{
    el.classList.add('stack-bubble','stack-hidden');
    el.getAnimations().forEach(a=>a.cancel());
  });

  requestAnimationFrame(()=>{scroll.scrollTop=0;});

  if(isMulti){
    /*
      MULTI SELECT ONLY:
      - no per-item FLIP transforms on old options
      - short stacks move as one group
      - overflowing stacks move by smooth scroll only
      This prevents accumulated transforms from looking like collisions/jitter.
    */
    const motion=220;
    const gap=300;
    const shown=[];

    function showMulti(index){
      if(run!==stackRun||!box.isConnected||index>=items.length)return;
      const incoming=items[index];
      const beforeBox=box.getBoundingClientRect();
      const beforeScroll=scroll.scrollTop;

      /* Clear any completed child animations before the next layout measurement. */
      shown.forEach(el=>el.getAnimations().forEach(a=>a.cancel()));

      incoming.classList.remove('stack-hidden');
      const afterBox=box.getBoundingClientRect();
      const target=Math.max(0,scroll.scrollHeight-scroll.clientHeight);

      if(target>beforeScroll+.5){
        animateScrollTo(scroll,target,motion);
      }else{
        animateGroupShift(box,beforeBox.top-afterBox.top,motion);
      }

      animateIncoming(incoming,motion,30,'cubic-bezier(.2,.72,.28,1)');
      shown.push(incoming);

      if(index+1<items.length)setTimeout(()=>showMulti(index+1),gap);
    }

    setTimeout(()=>showMulti(0),110);
    return;
  }

  /* SINGLE SELECT: locked centered-stack behavior. */
  const timing={push:70,incoming:70,gap:75,easing:'linear',lift:28};
  const shown=[];

  function showSingle(index){
    if(run!==stackRun||!box.isConnected||index>=items.length)return;
    const incoming=items[index];
    const before=new Map(shown.map(el=>[el,el.getBoundingClientRect()]));

    incoming.classList.remove('stack-hidden');
    incoming.getBoundingClientRect();
    animatePush(shown,before,{duration:timing.push,easing:timing.easing});
    animateIncoming(incoming,timing.incoming,timing.lift,timing.easing);
    shown.push(incoming);

    if(index+1<items.length)setTimeout(()=>showSingle(index+1),timing.gap);
  }

  setTimeout(()=>showSingle(0),55);
}

function enhanceQuestion(){
  dockMultiConfirm();
  revealStack();
}

const observer=new MutationObserver(()=>enhanceQuestion());
if(app){observer.observe(app,{childList:true,subtree:true});enhanceQuestion();}
