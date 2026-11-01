/* ---------- install as an app ---------- */
var installEvt=null;
function isStandalone(){ try{ return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone===true; }catch(e){ return false; } }
function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1); }
function updateInstallBtn(){ var b=document.getElementById("installBtn"); if(!b) return; var web=window.isSecureContext && location.protocol!=="file:"; b.hidden=!web || isStandalone() || !(installEvt||isIOS()); }
if("serviceWorker" in navigator && window.isSecureContext && location.protocol!=="file:"){ window.addEventListener("load",function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); }); }
window.addEventListener("beforeinstallprompt",function(e){ e.preventDefault(); installEvt=e; updateInstallBtn(); });
window.addEventListener("appinstalled",function(){ installEvt=null; updateInstallBtn(); showToastMsg("📲 Installed — open Speechcraft from your home screen"); });
document.getElementById("installBtn").addEventListener("click",function(){
  if(installEvt){ installEvt.prompt(); installEvt.userChoice.then(function(){ installEvt=null; updateInstallBtn(); }); return; }
  if(isIOS()) alert("To install on iPhone or iPad:\n\n1. Tap the Share button (square with an arrow) in Safari\n2. Choose \u201cAdd to Home Screen\u201d\n3. Tap Add");
});
updateInstallBtn();
