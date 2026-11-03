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
/* a newer version on the website: offer a one-tap update (never reload by itself, e.g. while someone is being timed) */
var updShown=false;
function checkForUpdate(){
  if(updShown||location.protocol==="file:"||!window.fetch) return;
  fetch(location.pathname+"?v="+Date.now(),{cache:"no-store"}).then(function(r){ return r.ok?r.text():""; }).then(function(t){
    var m=t&&t.match(new RegExp("var APP"+"_VERSION=\"(\\d[^\"]*)\"")); if(!m||m[1]===APP_VERSION) return;
    updShown=true; var el=document.createElement("div"); el.className="updbar"; el.setAttribute("role","status");
    el.innerHTML='🆕 A new version of the app is ready ('+esc(m[1].split(" ")[0])+'). <button class="btn sm" id="updNow">Update now</button><button class="linkbtn" id="updLater">Later</button>';
    document.body.appendChild(el);
    el.addEventListener("click",function(e){ if(e.target.id==="updNow"){ if(anyRunning()&&!confirm("Someone is being timed. The timer keeps running after the update, but update now?")) return; location.reload(); } else if(e.target.id==="updLater"){ el.remove(); } });
  }).catch(function(){});
}
setTimeout(checkForUpdate,20000); setInterval(checkForUpdate,300000);
document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="visible") checkForUpdate(); });
