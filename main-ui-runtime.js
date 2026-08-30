const app=document.getElementById('app');
let stackRun=0;

function dockMultiConfirm(){
  const dock=app?.querySelector('.question-dock');
  const confirm=app?.querySelector('.confirm-dock');
  if(!dock||!confirm||confirm.parentElement===dock)return;
  dock.appendChild(confirm);
  dock.classList.add('has-confirm');
}

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

function pinToBottom(scroll){
  const target=Math.max(0,scroll.scrollHeight-scroll.clientHeight);
  scroll.scrollTop=target;
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
  const timing=isMulti
    ? {push:150,incoming:170,gap:170,easing:'cubic-bezier(.2,.72,.28,1)',lift:34}
    : {push:70,incoming:70,gap:75,easing:'linear',lift:28};

  items.forEach(el=>{
    el.classList.add('stack-bubble','stack-hidden');
    el.getAnimations().forEach(a=>a.cancel());
  });

  requestAnimationFrame(()=>{scroll.scrollTop=0;});
  const shown=[];

  function showOne(index){
    if(run!==stackRun||!box.isConnected||index>=items.length)return;
    const incoming=items[index];
    const before=new Map(shown.map(el=>[el,el.getBoundingClientRect()]));

    incoming.classList.remove('stack-hidden');
    incoming.getBoundingClientRect();

    // Multi-select follows the newest item at the bottom. Single-select must stay a true centered stack.
    if(isMulti){
      pinToBottom(scroll);
      incoming.getBoundingClientRect();
    }
    animatePush(shown,before,{duration:timing.push,easing:timing.easing});

    incoming.animate(
      [{opacity:0,transform:`translate3d(0,${timing.lift}px,0)`},{opacity:1,transform:'translate3d(0,0,0)'}],
      {duration:timing.incoming,easing:timing.easing,fill:'both'}
    );
    shown.push(incoming);

    if(index+1<items.length)setTimeout(()=>showOne(index+1),timing.gap);
  }

  setTimeout(()=>showOne(0),isMulti?80:55);
}

function enhanceQuestion(){
  dockMultiConfirm();
  revealStack();
}

const observer=new MutationObserver(()=>enhanceQuestion());
if(app){observer.observe(app,{childList:true,subtree:true});enhanceQuestion();}
