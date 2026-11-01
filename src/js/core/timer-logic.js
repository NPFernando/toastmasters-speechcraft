/* ---------- timer logic ---------- */
function sessionOf(id){ for(var i=0;i<SESSIONS.length;i++) if(SESSIONS[i].id===id) return SESSIONS[i]; }
function elapsed(row,t){ if(row.manual!=null) return row.manual; if(row.start==null) return null; var e=(row.end!=null?row.end:t); return Math.max(0,Math.round((e-row.start-(row.pz||0)-(row.paused?Math.max(0,e-row.paused):0))/1000)); }
function pauseRow(sid,id){ var r=findRow(sid,id); if(!r||rowState(r)!=="running"||r.paused) return; r.paused=now(); tick(r); commit(); }
function resumeRow(sid,id){ var r=findRow(sid,id); if(!r||!r.paused) return; r.pz=(r.pz||0)+Math.max(0,now()-r.paused); r.paused=null; tick(r); commit(); }
function sigLabel(sg,r){ return r&&r.paused?"⏸ Paused":signalName(sg); }
function pauseNote(r){ return r&&r.pz>=1000?' (paused '+fmt(Math.round(r.pz/1000))+')':''; }
function rowState(row){ if(row.start!=null&&row.end==null&&row.manual==null) return "running"; if(row.manual!=null||row.end!=null) return "done"; return "idle"; }
function limOf(sid,row){ return (row&&row.lim)||S.limits[sid]; }
function signal(sid,sec,row){ if(sec==null) return ""; var L2=limOf(sid,row); if(sid==="rr") return sec<=L2.b?"sg":"sr"; if(sec>=L2.r) return "sr"; if(sec>=L2.a) return "sa"; if(sec>=L2.g) return "sg"; return ""; }
/* each signal has its own shape as well as its colour (● green, ▲ amber, ■ red), so it reads without colour */
function signalName(c){ return c==="sg"?"● Green":c==="sa"?"▲ Amber":c==="sr"?"■ Red":"No signal yet"; }
function status(sid,row,t){
  var st=rowState(row), sec=elapsed(row,t);
  if(st==="idle") return {text:"",cls:""};
  if(st==="running") return {text:(row.paused?"⏸ Paused at ":"⏱ Running ")+fmt(sec),cls:"st-run"};
  var L2=limOf(sid,row);
  if(sid==="rr") return sec<=L2.b?{text:"Within time",cls:"st-q",ok:true}:{text:"Overtime (+"+fmt(sec-L2.b)+")",cls:"st-o"};
  if(sec<L2.g) return {text:"Under time (−"+fmt(L2.g-sec)+")",cls:"st-u"};
  if(sec<=L2.r) return {text:"Qualified",cls:"st-q",ok:true};
  return {text:"Overtime (+"+fmt(sec-L2.r)+")",cls:"st-o"};
}
function displayName(row,i){ return row.name&&row.name.trim()?row.name.trim():"Speaker "+(i+1); }
function findRow(sid,id){ return S.rows[sid].find(function(x){return x.id===id;}); }
function newRow(sid,name){ return {id:uid(),name:name||"",start:null,end:null,manual:null,ord:maxOrd(S.rows[sid])+1,u:now()}; }
function runningList(){ var out=[]; SESSIONS.forEach(function(s){ S.rows[s.id].forEach(function(r,i){ if(rowState(r)==="running") out.push({sid:s.id,s:s,r:r,i:i}); }); }); return out; }
function anyRunning(){ return runningList().length>0; }
function firstQueued(sid){ return S.rows[sid].find(function(r){return rowState(r)==="idle";}); }
function startRow(sid,id){ var r=findRow(sid,id); if(!r) return; r.start=now(); r.end=null; r.manual=null; r.pz=0; r.paused=null; tick(r); commit(); wake(); }
function stopRow(sid,id){ var r=findRow(sid,id); if(!r||r.start==null||r.end!=null) return; r.end=now(); if(r.paused){ r.pz=(r.pz||0)+Math.max(0,r.end-r.paused); r.paused=null; } tick(r); commit(); wake(); }
function okToStart(){
  var run=runningList(); if(!run.length) return true;
  var who=run.map(function(x){return displayName(x.r,x.i)+" ("+x.s.name+", "+fmt(elapsed(x.r,now()))+")";}).join(", ");
  if(!confirm(who+" is still being timed.\n\nOK = stop them and start the next speaker\nCancel = keep timing them")) return false;
  var t=now(); run.forEach(function(x){ x.r.end=t; tick(x.r); });
  return true;
}
function nextSignalText(sid,sec,row){ var L2=limOf(sid,row);
  if(sid==="rr") return sec<=L2.b?"bell in "+fmt(L2.b-sec):"over by "+fmt(sec-L2.b);
  if(sec<L2.g) return "green in "+fmt(L2.g-sec); if(sec<L2.a) return "amber in "+fmt(L2.a-sec); if(sec<L2.r) return "red in "+fmt(L2.r-sec); return "over by "+fmt(sec-L2.r); }
function bannerText(sid,sg){ if(sid==="rr") return sg==="sr"?"🔔 TIME UP":""; return sg==="sg"?"● SHOW GREEN":sg==="sa"?"▲ SHOW AMBER":sg==="sr"?"■ SHOW RED":""; }

/* generic remove with undo (works for every list, synced via tombstones) */
var undoTimer=null, lastRemoved=null;
function removeItem(path,id,label){
  var arr=getColl(S,path), i=arr.findIndex(function(x){return x.id===id;}); if(i<0) return;
  var item=arr[i]; arr.splice(i,1); S.dead[id]=Math.max(now(),(item.u||0)+1);
  lastRemoved={path:path,item:item}; orgUndo=null; anyUndo=null;
  commit(); wake();
  document.getElementById("toastMsg").textContent=label+" removed";
  var t=document.getElementById("toast"); t.classList.add("on");
  clearTimeout(undoTimer); undoTimer=setTimeout(function(){ t.classList.remove("on"); lastRemoved=null; },7000);
}
var orgUndo=null, anyUndo=null;
/* any role: offer ↩ Undo for a few seconds after removing something; fn puts it back */
function offerUndo(label,fn){
  anyUndo=fn; orgUndo=null; lastRemoved=null;
  var t=document.getElementById("toast"); document.getElementById("toastMsg").textContent=label; document.getElementById("toastUndo").style.display=""; t.classList.add("on");
  clearTimeout(undoTimer); undoTimer=setTimeout(function(){ t.classList.remove("on"); anyUndo=null; },8000);
}
function orgSnap(){ var a=clone(S.agenda); delete a.fu; delete a.u; var m=clone(S.members); delete m.fu; delete m.u; return {a:a,m:m,k:stable({a:a,m:m})}; }
function orgUndoOffer(snap,label){
  orgUndo=snap; lastRemoved=null; anyUndo=null;
  var t=document.getElementById("toast"); document.getElementById("toastMsg").textContent=label; document.getElementById("toastUndo").style.display=""; t.classList.add("on");
  clearTimeout(undoTimer); undoTimer=setTimeout(function(){ t.classList.remove("on"); orgUndo=null; },8000);
}
function orgUndoApply(){
  var u=orgUndo; orgUndo=null; if(!u) return;
  Object.keys(u.a).forEach(function(k){ S.agenda[k]=clone(u.a[k]); }); Object.keys(S.agenda).forEach(function(k){ if(k!=="fu"&&k!=="u"&&!(k in u.a)) delete S.agenda[k]; });
  S.members.list=clone(u.m.list); S.members.tmAwards=u.m.tmAwards;
  tick(S.agenda); tick(S.members); applyAgenda(); clearTimeout(undoTimer); document.getElementById("toast").classList.remove("on"); commit(); showToastMsg("Undone");
}
(function(){
  var V=document.getElementById("view"), pend=null;
  function before(e){
    if(L.role!=="coord"||!coordUnlocked()) return; var t=e.target;
    if(e.type==="change"&&(t.dataset.it==="text"||t.tagName==="TEXTAREA")) return;
    if(e.type==="click"&&!t.closest("button")) return;
    if(t.closest("#toastUndo")) return;
    pend=orgSnap(); setTimeout(function(){ var p=pend; pend=null; if(!p) return; if(stable({a:orgSnapA(),m:orgSnapM()})!==p.k) orgUndoOffer(p,"Change saved"); },0);
  }
  V.addEventListener("click",before,true); V.addEventListener("change",before,true);
})();
function orgSnapA(){ var a=clone(S.agenda); delete a.fu; delete a.u; return a; }
function orgSnapM(){ var m=clone(S.members); delete m.fu; delete m.u; return m; }
function undoRemove(){
  if(anyUndo){ var f=anyUndo; anyUndo=null; clearTimeout(undoTimer); document.getElementById("toast").classList.remove("on"); f(); commit(); renderAll(); showToastMsg("Undone"); return; }
  if(orgUndo){ orgUndoApply(); return; }
  if(!lastRemoved) return; var x=lastRemoved; lastRemoved=null;
  delete S.dead[x.item.id]; tick(x.item);
  var arr=getColl(S,x.path); arr.push(x.item); arr.sort(function(p,q){return p.ord-q.ord;});
  clearTimeout(undoTimer); document.getElementById("toast").classList.remove("on");
  commit(); wake();
}
function moveItem(path,id,dir){
  var arr=getColl(S,path), i=arr.findIndex(function(x){return x.id===id;}), j=i+dir;
  if(i<0||j<0||j>=arr.length) return;
  var a=arr[i], b=arr[j], o=a.ord; a.ord=b.ord; b.ord=o; if(a.ord===b.ord){ a.ord+=dir*0.5; }
  tick(a); tick(b); arr.sort(function(p,q){return p.ord-q.ord;}); commit();
}

/* keep screen awake while timing */
var lock=null;
function wake(){ try{
  if(anyRunning()){ if(!lock&&navigator.wakeLock){ navigator.wakeLock.request("screen").then(function(l){lock=l;l.addEventListener("release",function(){lock=null;});}).catch(function(){}); } }
  else if(lock){ lock.release(); lock=null; }
}catch(e){} }
document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="visible") wake(); });

