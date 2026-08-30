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

function animateIncoming(el,duration,lift,easing){
  const anim=el.animate(
    [{opacity:0,transform:`translate3d(0,${lift}px,0)`},{opacity:1,transform:'translate3d(0,0,0)'}],
    {duration,easing,fill:'both'}
  );
  anim.finished.then(()=>anim.cancel()).catch(()=>{});
}

function revealMulti(box,scroll,items,run){
  /*
    MULTI SELECT ONLY:
    Remove every option from layout first, then append exactly one option per tick.
    No FLIP, no group transform, no smooth scroll, no animation on old options.
  */
  items.forEach(el=>{
    el.getAnimations().forEach(a=>a.cancel());
    el.classList.add('stack-bubble');
    el.classList.remove('stack-hidden');
  });

  box.replaceChildren();
  scroll.scrollTop=0;

  /* Fast continuous stepping: preserve one-by-one append, halve the cadence. */
  const gap=85;
  const incomingDuration=90;

  function showOne(index){
    if(run!==stackRun||!box.isConnected||index>=items.length)return;
    const incoming=items[index];

    box.appendChild(incoming);

    /* Keep only the newest option visible at the bottom once content overflows. */
    const target=Math.max(0,scroll.scrollHeight-scroll.clientHeight);
    scroll.scrollTop=target;

    animateIncoming(incoming,incomingDuration,14,'cubic-bezier(.2,.72,.28,1)');

    if(index+1<items.length)setTimeout(()=>showOne(index+1),gap);
  }

  setTimeout(()=>showOne(0),40);
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
  if(isMulti){
    revealMulti(box,scroll,items,run);
    return;
  }

  /* SINGLE SELECT: locked centered-stack behavior. */
  items.forEach(el=>{
    el.classList.add('stack-bubble','stack-hidden');
    el.getAnimations().forEach(a=>a.cancel());
  });
  requestAnimationFrame(()=>{scroll.scrollTop=0;});

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
