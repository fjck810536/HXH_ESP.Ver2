const app=document.getElementById('app');
let stackRun=0;

function dockMultiConfirm(){
  const dock=app?.querySelector('.question-dock');
  const confirm=app?.querySelector('.confirm-dock');
  if(!dock||!confirm||confirm.parentElement===dock)return;
  dock.appendChild(confirm);
  dock.classList.add('has-confirm');
}

function animatePush(items,before){
  items.forEach(el=>{
    const a=before.get(el),b=el.getBoundingClientRect();
    if(!a||!b)return;
    const dx=a.left-b.left,dy=a.top-b.top;
    if(Math.abs(dx)<.5&&Math.abs(dy)<.5)return;
    el.animate(
      [{transform:`translate3d(${dx}px,${dy}px,0)`},{transform:'translate3d(0,0,0)'}],
      {duration:320,easing:'cubic-bezier(.2,.72,.28,1)',fill:'both'}
    );
  });
}

function revealStack(){
  const box=app?.querySelector('.options');
  const scroll=app?.querySelector('.option-scroll');
  if(!box||!scroll||box.dataset.stackReady==='1')return;
  box.dataset.stackReady='1';
  const run=++stackRun;
  const items=[...box.children];
  if(!items.length)return;

  items.forEach(el=>{
    el.classList.add('stack-bubble','stack-hidden');
    el.getAnimations().forEach(a=>a.cancel());
  });

  // The initial state is genuinely centered. No pre-alignment at the top and no forced scroll-to-bottom.
  requestAnimationFrame(()=>{scroll.scrollTop=0;});
  const shown=[];

  function showOne(index){
    if(run!==stackRun||!box.isConnected||index>=items.length)return;
    const incoming=items[index];
    const before=new Map(shown.map(el=>[el,el.getBoundingClientRect()]));
    incoming.classList.remove('stack-hidden');

    // Force the new centered layout, then animate the already-arrived bubbles from their old positions.
    incoming.getBoundingClientRect();
    animatePush(shown,before);
    incoming.animate(
      [{opacity:0,transform:'translate3d(0,88px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],
      {duration:430,easing:'cubic-bezier(.18,.70,.24,1)',fill:'both'}
    );
    shown.push(incoming);

    if(index+1<items.length){
      const gap=items.length>=9?330:390;
      setTimeout(()=>showOne(index+1),gap);
    }
  }

  setTimeout(()=>showOne(0),120);
}

function enhanceQuestion(){
  dockMultiConfirm();
  revealStack();
}

const observer=new MutationObserver(()=>enhanceQuestion());
if(app){observer.observe(app,{childList:true,subtree:true});enhanceQuestion();}
