/* ---------- 1. "You're up next" nudges ---------- */
/* which agenda items concern this device's person/roles */
function itemIsMine(it){
  if(!it) return false;
  var names=myNameKeys(), rs=myRoles(), inList=function(k){ return asList(k).some(function(n){return names.indexOf(nkey(n))>=0;}); };
  if(rs.indexOf(it.role)>=0 && it.role!=="coord" || (it.role==="coord"&&rs.indexOf("coord")>=0)) return true;
  if(inList(it.role)) return true;
  if(it.x==="speakers" && (inList("speakers")||rs.indexOf("speaker")>=0&&inList("speakers"))) return true;
  if(it.x==="keynote" && inList("keynote")) return true;
  if(it.x==="ttevals" && inList("ttevals")) return true;
  if(it.x==="evals" && (inList("sevals")||inList("ttevals")||["timer","ah","gram"].some(function(r){ return rs.indexOf(r)>=0; }))) return true;
  return false;
}
function itemLabel(it){ var w=whoFor(it.role); return arole(it.role).n+(w?" ("+w+")":"")+(it.text?" — "+String(it.text).split(" — ")[0].split(". ")[0]:""); }
var lastNudge="";
function checkNudge(){
  if(!S.run||!S.run.cur||L.role==="tmod") return;
  var c=curItem(); if(!c.cur) return;
  var key=c.cur.id+"|"+(c.next?c.next.id:"");
  if(key===lastNudge) return; var first=!lastNudge; lastNudge=key; if(first) return;
  var msg="", buzzP=null;
  if(itemIsMine(c.cur)){ msg="🎤 You're on now: "+itemLabel(c.cur); buzzP=[300,120,300]; }
  else if(c.next&&itemIsMine(c.next)){ var mins=hm2min(rt(c.next)), cm=hm2min(rt(c.cur)); msg="⏭ You're up next: "+itemLabel(c.next)+(mins!=null&&cm!=null&&mins>cm?" (about "+(mins-cm)+" min)":""); buzzP=[120,80,120]; }
  if(!msg) return;
  try{ if(navigator.vibrate&&buzzP) navigator.vibrate(buzzP); }catch(e){}
  var el=document.getElementById("nudge"); if(el){ el.textContent=msg; el.classList.add("on"); clearTimeout(el._t); el._t=setTimeout(function(){ el.classList.remove("on"); },15000); }
}
setInterval(checkNudge,1000);

