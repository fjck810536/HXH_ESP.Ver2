const app=document.getElementById('app');
function dockMultiConfirm(){
  const dock=app?.querySelector('.question-dock');
  const confirm=app?.querySelector('.confirm-dock');
  if(!dock||!confirm||confirm.parentElement===dock)return;
  dock.appendChild(confirm);
  dock.classList.add('has-confirm');
}
const observer=new MutationObserver(()=>dockMultiConfirm());
if(app){observer.observe(app,{childList:true,subtree:true});dockMultiConfirm();}
