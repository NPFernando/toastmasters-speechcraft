/* ---------- events ---------- */
document.getElementById("roles").addEventListener("click",function(e){
  if(e.target.closest("[data-change-role]")) openWelcome("role");
  if(e.target.closest("[data-open-phone]")) openPhoneQR();
});
document.getElementById("mWeek").addEventListener("change",function(){ S.meta.week=this.value; tick(S.meta); commitQuiet(); });
document.getElementById("mDate").addEventListener("change",function(){ S.meta.date=this.value; tick(S.meta); commitQuiet(); });
document.getElementById("myName").addEventListener("input",function(){ setMyName(this.value); NET.hello(); });
document.getElementById("myName").addEventListener("change",function(){ renderRoles(); });
document.getElementById("nowStrip").addEventListener("click",function(e){
  var b=e.target.closest("[data-now-add]"); if(!b) return;
  if(L.role==="seval"||L.role==="tteval"){ L.evSel=L.evSel||{}; L.evSel[evKind()]=baseName(b.dataset.nowAdd); if(selectPerson(b.dataset.nowAdd,L.role)) commit(); else { saveL(); renderAll(); } return; }
  addCounterSpeaker(L.role,b.dataset.nowAdd);
});
var liveEl=document.getElementById("live");
liveEl.addEventListener("click",function(e){ var p=e.target.closest('[data-act="livepause"]'); if(p){ var ip=p.closest(".liveitem"), rp=findRow(ip.dataset.sid,ip.dataset.id); if(rp&&rp.paused) resumeRow(ip.dataset.sid,ip.dataset.id); else pauseRow(ip.dataset.sid,ip.dataset.id); return; } var b=e.target.closest('[data-act="livestop"]'); if(!b) return; var it=b.closest(".liveitem"); stopRow(it.dataset.sid,it.dataset.id); });
liveEl.addEventListener("input",function(e){
  var t=e.target; if(t.dataset.edit!=="livename") return;
  var it=t.closest(".liveitem"), r=findRow(it.dataset.sid,it.dataset.id); if(!r) return;
  r.name=t.value; tick(r); commitQuiet();
  var pi=document.querySelector('#view tr[data-id="'+r.id+'"] [data-edit="name"]'); if(pi) pi.value=t.value;
});
liveEl.addEventListener("keydown",function(e){ if(e.key==="Enter"&&e.target.dataset.edit==="livename"){ e.preventDefault(); e.target.blur(); } });
document.addEventListener("change",function(e){ var d=e.target.dataset&&e.target.dataset.edit; if(d==="name"||d==="livename"||d==="tspeaker") remember(e.target.value); });

var view=document.getElementById("view");
function quickStart(){
  var sid=L.tab, q=document.getElementById("qname"), nx=firstQueued(sid);
  if(!okToStart()) return;
  if(!q.value.trim()&&nx){ startRow(sid,nx.id); }
  else { var r=newRow(sid,q.value.trim()); remember(r.name); S.rows[sid].push(r); q.value=""; startRow(sid,r.id); }
  var q2=document.getElementById("qname"); if(q2) q2.focus();
}
function planSpeakers(){
  var sid=L.tab, q=document.getElementById("qname"), names=q.value.split(/[,;\n]+/).map(function(n){return n.trim();}).filter(Boolean);
  if(!names.length) S.rows[sid].push(newRow(sid,""));
  names.forEach(function(n){ S.rows[sid].push(newRow(sid,n)); addName(S,n); });
  q.value=""; commit(); var q2=document.getElementById("qname"); if(q2) q2.focus();
}
view.addEventListener("click",function(e){
  var t=e.target;
  /* timer */
  var tb=t.closest("[data-tab]"); if(tb){ L.tab=tb.dataset.tab; saveL(); renderAll(); return; }
  if(t.closest("#qstart")){ quickStart(); return; }
  if(t.closest("#qplan")){ planSpeakers(); return; }
  if(t.closest("#qadd")){
    var q=document.getElementById("qname"), nr=newRow(L.tab,q.value.trim()); remember(nr.name); S.rows[L.tab].push(nr); q.value=""; commit();
    var ti=document.querySelector('#view tr[data-id="'+nr.id+'"] [data-edit="time"]'); if(ti) ti.focus(); return;
  }
  var b=t.closest("[data-act]");
  if(b && b.closest("tr")){
    var sid=L.tab, id=b.closest("tr").dataset.id, act=b.dataset.act, r=findRow(sid,id);
    if(act==="start"){ if(okToStart()) startRow(sid,id); }
    else if(act==="stop") stopRow(sid,id);
    else if(act==="pause") pauseRow(sid,id);
    else if(act==="resume") resumeRow(sid,id);
    else if(act==="del") removeItem(["rows",sid],id,displayName(r,S.rows[sid].indexOf(r)));
    else if(act==="up"||act==="down") moveItem(["rows",sid],id,act==="up"?-1:1);
    return;
  }
  /* topics master */
  if(t.closest("#addTopics")){
    var ta=document.getElementById("topicInput"), lines=ta.value.split(/\n+/).map(function(x){return x.trim();}).filter(Boolean);
    var o=maxOrd(S.topics); lines.forEach(function(x){ S.topics.push({id:uid(),text:x,speaker:"",used:false,usedAt:null,rowId:null,ord:++o,u:now()}); });
    ta.value=""; commit(); return;
  }
  if(t.closest("#randBtn")){ randomTopic(); return; }
  if(t.closest("#callBtn")){ callSpeaker(); return; }
  if(t.closest("#showBtn")){ openStage(); return; }
  var ta2=t.closest("[data-tact]");
  if(ta2){
    var tid=ta2.closest("[data-tid]").dataset.tid, tp=topicById(tid), a=ta2.dataset.tact;
    if(a==="pick") pickTopic(tid);
    else if(a==="up"||a==="down") moveItem(["topics"],tid,a==="up"?-1:1);
    else if(a==="del"){ if(S.cur.id===tid){ S.cur.id=null; tick(S.cur);} removeItem(["topics"],tid,"Topic"); }
    else if(a==="back"){ tp.used=false; tp.usedAt=null; tick(tp); commit(); }
    else if(a==="show"){ S.cur.id=tid; tick(S.cur); commit(); openStage(); }
    return;
  }
  /* counters */
  var kind=L.role;
  if(t.closest("#spkAdd")){ addCounterSpeaker(kind,document.getElementById("spkInput").value); return; }
  var ch=t.closest("[data-sel]"); if(ch){ if(kind==="ah") L.ahSel=ch.dataset.sel; else L.gramSel=ch.dataset.sel; var sr0=selRow(kind); if(sr0&&selectPerson(sr0.name,kind)) commit(); else { saveL(); renderAll(); } return; }
  var rd=t.closest("[data-rowdel]"); if(rd){ var sr=selRow(kind); if(sr) removeItem([kind==="ah"?"ahRows":"gramRows"],sr.id,sr.name); return; }
  var mn=t.closest("[data-minus]"); if(mn){ var s1=selRow("ah"), w=mn.dataset.minus; if(s1&&s1.c[w]>0){ s1.c[w]--; tick(s1); commit(); } return; }
  var tp2=t.closest("[data-word]"); if(tp2){ var s2=selRow("ah"), w2=tp2.dataset.word; if(s2){ s2.c[w2]=(s2.c[w2]||0)+1; tick(s2); commit(); var nt=document.querySelector('#view [data-word="'+CSS.escape(w2)+'"]'); if(nt) nt.classList.add("bump"); } return; }
  var wd=t.closest("[data-wdel]"); if(wd){ var wsnap=S.fill.words.slice(); offerUndo("“"+wd.dataset.wdel+"” removed",function(){ S.fill.words=wsnap; tick(S.fill); }); S.fill.words=S.fill.words.filter(function(x){return x!==wd.dataset.wdel;}); tick(S.fill); commit(); return; }
  if(t.closest("#wordAdd")){ var wi=document.getElementById("wordInput"), nw=wi.value.trim(); if(nw&&S.fill.words.indexOf(nw)<0){ S.fill.words.push(nw); tick(S.fill); commit(); } return; }
  if(t.closest("#wPlus")){ var g=selRow("gram"); if(g){ g.w=(g.w||0)+1; tick(g); commit(); } return; }
  if(t.closest("#wMinus")){ var g2=selRow("gram"); if(g2&&g2.w>0){ g2.w--; tick(g2); commit(); } return; }
  if(t.closest("#goodAdd")||t.closest("#slipAdd")){
    var isGood=!!t.closest("#goodAdd"), inp=document.getElementById(isGood?"goodInput":"slipInput"), g3=selRow("gram"), v=inp.value.trim();
    if(g3&&v){ g3[isGood?"good":"slips"].push(v); tick(g3); commit(); var again=document.getElementById(isGood?"goodInput":"slipInput"); if(again) again.focus(); } return;
  }
  var nd=t.closest("[data-ndel]"); if(nd){ var g4=selRow("gram"); if(g4){ var nk=nd.dataset.ndel, nsnap=clone(g4[nk]); g4[nk].splice(+nd.dataset.i,1); tick(g4); commit(); offerUndo("Note removed",function(){ g4[nk]=nsnap; tick(g4); }); } return; }
});
view.addEventListener("keydown",function(e){
  if(e.key!=="Enter") return; var id=e.target.id;
  var map={qname:quickStart, spkInput:function(){ addCounterSpeaker(L.role,e.target.value); }, wordInput:function(){ document.getElementById("wordAdd").click(); },
    goodInput:function(){ document.getElementById("goodAdd").click(); }, slipInput:function(){ document.getElementById("slipAdd").click(); }, callName:callSpeaker };
  if(map[id]){ e.preventDefault(); map[id](); return; }
  if(e.target.matches("input")){ e.preventDefault(); e.target.blur(); }
});
view.addEventListener("input",function(e){
  var t=e.target;
  if(t.id==="qname"){ var b=document.getElementById("qstart"); if(b) b.innerHTML=startLabel(L.tab); return; }
  if(t.dataset.edit==="name"){ var r=findRow(L.tab,t.closest("tr").dataset.id); r.name=t.value; tick(r); commitQuiet();
    var li=document.querySelector('#live .liveitem[data-id="'+r.id+'"] [data-edit="livename"]'); if(li) li.value=t.value; return; }
  if(t.dataset.edit==="topic"){ var tp=topicById(t.closest("[data-tid]").dataset.tid); tp.text=t.value; tick(tp); commitQuiet(); return; }
  if(t.dataset.ttev!=null){ setTTAssign(t.dataset.ttev,t.value); return; }
  if(t.dataset.edit==="tspeaker"){ var tp2=topicById(t.closest("[data-tid]").dataset.tid); tp2.speaker=t.value; tick(tp2); commitQuiet(); return; }
  if(t.id==="wotd"||t.id==="wotdMeaning"){ S.gram[t.id==="wotd"?"wotd":"meaning"]=t.value; tick(S.gram); commitQuiet(); return; }
});
view.addEventListener("change",function(e){
  var t=e.target, sid=L.tab;
  if(t.dataset.edit==="time"){
    var r=findRow(sid,t.closest("tr").dataset.id), v=parseTime(t.value);
    if(v===null){ if(r.manual!=null){ r.manual=null; tick(r); } commit(); return; }
    if(isNaN(v)){ t.classList.add("bad"); t.title="Check time: use m:ss with seconds 0–59"; return; }
    if(elapsed(r,now())!==v){ r.manual=v; tick(r); }
    commit(); return;
  }
  if(t.dataset.lim){
    var v2=parseTime(t.value), L2=S.limits[sid];
    if(v2==null||isNaN(v2)){ t.value=fmt(L2[t.dataset.lim]); return; }
    if(t.value.indexOf(":")<0&&t.value.indexOf(".")<0&&sid==="rr") v2=+t.value;
    L2[t.dataset.lim]=v2; tick(S.limits);
    if(sid!=="rr"&&!(L2.g<=L2.a&&L2.a<=L2.r)) setSaved("Check limits: green ≤ amber ≤ red");
    commit(); return;
  }
  if(t.dataset.edit==="tspeaker"||t.dataset.edit==="topic"){ laterRender(); }
});
document.getElementById("toastUndo").addEventListener("click",undoRemove);
document.getElementById("stageClose").addEventListener("click",closeStage);
/* the stage reuses the header logos (embedded once) */
(function(){ var st=document.getElementById("stage"), hl=document.querySelectorAll("header .logo img, .logo img"); if(hl.length>=2){ st.querySelector("img.l").src=hl[0].src; st.querySelector("img.r").src=hl[1].src; } })();
document.getElementById("stageRandom").addEventListener("click",function(){ if(L.role==="rrm") rrRandom(); else randomTopic(); renderStage(); });
document.addEventListener("fullscreenchange",function(){ if(!document.fullscreenElement) document.getElementById("stage").classList.remove("on"); });

