/* ---------- agenda timing: move items, set lengths, shift the whole agenda ---------- */
function min2hm(m){ m=((Math.round(m)%1440)+1440)%1440; return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); }
function agDur(list,i){ if(i>=list.length-1) return null; var a=hm2min(list[i].time), b=hm2min(list[i+1].time); return a==null||b==null?null:Math.max(0,b-a); }
function agRenumber(list){ list.forEach(function(it,i){ it.ord=i+1; }); }
function agAdd(it,d){ var m=hm2min(it.time); if(m!=null) it.time=min2hm(m+d); }
function agMove(id,dir){
  var L1=itemsSorted(), i=L1.findIndex(function(x){return x.id===id;}), j=i+dir; if(i<0||j<0||j>=L1.length) return false;
  var lo=Math.min(i,j), a=L1[lo], b=L1[lo+1], start=hm2min(a.time);
  var db=agDur(L1,lo+1); if(db==null) db=agDur(L1,lo)||5;
  if(start!=null){ b.time=min2hm(start); a.time=min2hm(start+db); }
  L1[lo]=b; L1[lo+1]=a; agRenumber(L1); return true;
}
function agSetDur(id,d){
  var L1=itemsSorted(), i=L1.findIndex(function(x){return x.id===id;}), old=agDur(L1,i); if(old==null||!(d>=0)) return false;
  var delta=Math.round(d)-old; if(!delta) return false;
  L1.slice(i+1).forEach(function(it){ agAdd(it,delta); }); agRenumber(L1); return true;
}
function agInsertAfter(id){
  var L1=itemsSorted(), i=L1.findIndex(function(x){return x.id===id;}); if(i<0) return null;
  var cur=L1[i], nx=L1[i+1], m=hm2min(cur.time), t=nx?nx.time:(m!=null?min2hm(m+5):cur.time);
  L1.slice(i+1).forEach(function(it){ agAdd(it,5); });
  var it={id:uid(),time:t,role:"tmod",text:"",x:"",ord:0}; L1.splice(i+1,0,it); S.agenda.items.push(it); agRenumber(L1); return it;
}
function agRemove(id){
  var L1=itemsSorted(), i=L1.findIndex(function(x){return x.id===id;}); if(i<0) return;
  var d=agDur(L1,i); if(d) L1.slice(i+1).forEach(function(it){ agAdd(it,-d); });
  S.agenda.items=S.agenda.items.filter(function(x){return x.id!==id;});
}
function agMoveTo(id,toIdx){ var L1=itemsSorted(), i=L1.findIndex(function(x){return x.id===id;}); if(i<0||toIdx===i) return false; var dir=toIdx>i?1:-1, n=Math.abs(toIdx-i); for(var k=0;k<n;k++) agMove(id,dir); return true; }
(function(){
  var V=document.getElementById("view"), dragId=null;
  function rowOf(e){ return e.target.closest&&e.target.closest(".agedit .agrow"); }
  V.addEventListener("dragstart",function(e){ var h=e.target.closest&&e.target.closest(".agmv"); if(!h||L.role!=="coord"||!coordUnlocked()) return; var r=h.closest(".agrow"); dragId=r.dataset.iid; r.classList.add("dragging"); try{ e.dataTransfer.setData("text/plain",dragId); e.dataTransfer.effectAllowed="move"; e.dataTransfer.setDragImage(r,20,20); }catch(x){} });
  V.addEventListener("dragover",function(e){ var r=rowOf(e); if(!dragId||!r) return; e.preventDefault(); document.querySelectorAll(".agrow.dropb,.agrow.dropa").forEach(function(x){x.classList.remove("dropb","dropa");}); var bx=r.getBoundingClientRect(); r.classList.add(e.clientY<bx.top+bx.height/2?"dropb":"dropa"); });
  V.addEventListener("drop",function(e){ var r=rowOf(e); if(!dragId||!r) return; e.preventDefault();
    var rows=[].slice.call(document.querySelectorAll(".agedit .agrow")), from=rows.findIndex(function(x){return x.dataset.iid===dragId;}), to=rows.indexOf(r);
    if(r.classList.contains("dropa")) to++; if(to>from) to--;
    var id=dragId, snap=orgSnap(); dragId=null; if(agMoveTo(id,to)){ tick(S.agenda); commit(); orgUndoOffer(snap,"Item moved"); } else renderAll(); });
  V.addEventListener("dragend",function(){ dragId=null; document.querySelectorAll(".agrow.dragging,.agrow.dropb,.agrow.dropa").forEach(function(x){x.classList.remove("dragging","dropb","dropa");}); });
})();
function agShiftAll(d){ S.agenda.items.forEach(function(it){ agAdd(it,d); }); }
function agSpanText(){
  var L1=itemsSorted(); if(!L1.length) return "";
  var a=hm2min(L1[0].time), b=hm2min(L1[L1.length-1].time); if(a==null||b==null) return "";
  var len=b-a; return fmtHM(L1[0].time)+" – "+fmtHM(L1[L1.length-1].time)+" · "+(len>=60?Math.floor(len/60)+" h ":"")+(len%60?len%60+" min":"")+" to the last item";
}
/* on the day: the Toastmaster can push the rest of the agenda later or earlier without changing the printed times */
function rt(it){ if(!it) return ""; var a=S.run&&S.run.adj&&S.run.adj[it.id]; if(!a) return it.time; var m=hm2min(it.time); return m==null?it.time:min2hm(m+a); }
function runAdjust(delta){
  var c=curItem(), rest=c.i>=0?c.its.slice(c.i+1):c.its; if(!rest.length||!delta) return;
  S.run.adj=S.run.adj||{}; S.run.by=runBy();
  rest.forEach(function(it){ var v=(S.run.adj[it.id]||0)+delta; if(v) S.run.adj[it.id]=v; else delete S.run.adj[it.id]; });
  tick(S.run); commit();
}
function runRetimeNow(){ var c=curItem(), n=c.cur?c.next:nextLive(c.its,0); if(!n) return; var target=Math.ceil(minutesNow()), m=hm2min(rt(n)); if(m==null) return; runAdjust(target-m); }
