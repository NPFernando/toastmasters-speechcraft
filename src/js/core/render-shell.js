/* ---------- rendering: shell ---------- */
var pendingRender=false;
function editingInApp(){ var a=document.activeElement; return a && a.matches && a.matches("input,textarea,select") && a.type!=="file" && (document.getElementById("app").contains(a)); }
/* refresh without losing the person's place: re-focus the same field afterwards */
var lastTyped=0;
document.addEventListener("input",function(){ lastTyped=Date.now(); },true);
function focusKey(el){
  if(!el||!el.matches||!el.matches("input,textarea,select")) return null;
  if(el.id) return "#"+el.id;
  var sel=el.tagName.toLowerCase(); Array.prototype.forEach.call(el.attributes,function(a){ if(/^data-/.test(a.name)) sel+='['+a.name+'="'+CSS.escape(a.value)+'"]'; });
  var host=el.closest("[data-id],[data-iid],[data-tid],[data-rqid]");
  if(host){ var an=["data-id","data-iid","data-tid","data-rqid"].find(function(n){return host.hasAttribute(n);}); sel='['+an+'="'+CSS.escape(host.getAttribute(an))+'"] '+sel; }
  return sel;
}
function renderKeepFocus(){
  var a=document.activeElement, key=focusKey(a), s=null, e=null;
  try{ s=a.selectionStart; e=a.selectionEnd; }catch(x){}
  renderAll();
  if(key){ var n=document.querySelector("#app "+key)||document.querySelector(key); if(n){ n.focus(); try{ if(s!=null) n.setSelectionRange(s,e); }catch(x){} } }
}
setInterval(function(){ if(pendingRender && Date.now()-lastTyped>3000){ pendingRender=false; renderKeepFocus(); } },1000);
function laterRender(){ pendingRender=true; setTimeout(function(){ if(pendingRender && !editingInApp()){ pendingRender=false; renderAll(); } },300); }
function softRender(){ if(editingInApp()){ pendingRender=true; renderLiveOnly(); return; } renderAll(); }
document.addEventListener("focusout",function(){ if(!pendingRender) return; setTimeout(function(){ if(pendingRender && !editingInApp()){ pendingRender=false; renderAll(); } },250); });

function renderAll(){
  pendingRender=false; renderNav(); renderProj();
  renderMeta(); renderRoles(); renderRoster();
  renderLive(); renderNow();
  var v=document.getElementById("view");
  document.body.classList.toggle("focus",inFocus());
  if(curView()!=="role") v.innerHTML=curView()==="now"?dashHTML():agendaViewHTML();
  else if(inFocus()) v.innerHTML=focusHTML();
  else if(L.role==="coord"){ var cu=coordUnlocked(), won=cu&&S.wrap.on; var ct=coTab(); v.innerHTML=(won?endMeetingHTML():"")+coordHTML()+(cu&&ct==="after"?actionsHTML():"")+(cu?(ct==="setup"?healthHTML()+availabilityHTML():ct==="people"?coorgHTML()+attendanceHTML()+feedbackPinsHTML():ct==="after"?(won?"":endMeetingHTML())+autoRecHTML()+progressHTML()+ideasHTML():""):""); }
  else if(L.role==="tmod") v.innerHTML=(S.vote.state!=="closed"?'<section class="card" style="margin-bottom:12px">'+voteControlHTML(false,true)+'</section>':'')+tmodHTML();
  else if(L.role==="ge") v.innerHTML=geHTML();
  else if(L.role==="seval"||L.role==="tteval") v.innerHTML=evalHTML();
  else if(L.role==="rrm") v.innerHTML=rrHTML();
  else if(L.role==="member") v.innerHTML=memberHTML();
  else if(L.role==="president") v.innerHTML=presidentHTML();
  else if(L.role==="saa") v.innerHTML=saaHTML();
  else if(L.role==="keynote") v.innerHTML=keynoteHTML();
  else if(L.role==="speaker") v.innerHTML=speakerHTML();
  else if(L.role==="timer") v.innerHTML=timerHTML();
  else if(L.role==="ttm") v.innerHTML=ttmHTML();
  else if(L.role==="ah") v.innerHTML=ahHTML();
  else v.innerHTML=gramHTML();
  if(curView()==="role") v.insertAdjacentHTML("beforeend",handoverHTML());
  var tp=tipsHTML(); if(tp) v.insertAdjacentHTML("afterbegin",tp);
  var db=dryBannerHTML(); if(db) v.insertAdjacentHTML("afterbegin",db);
  if(curView()==="role" && !inFocus() && L.role!=="coord" && !(S.run&&S.run.cur)){ var up=upcomingHTML(false); if(up) v.insertAdjacentHTML("afterbegin",up); }
  if(L.role==="speaker"||L.role==="member"){ try{ histCapture(L.role==="speaker"?myName():(L.cardName||"")); }catch(e){} }
  if(document.getElementById("stage").classList.contains("on")) renderStage();
  renderAgendaLine(); renderMemberList(); renderVoteBar(); renderFin(); maybeShowWinners(false); flushPending(); checkNewFeedback(); renderCompanion();
  if(document.getElementById("voteModal").classList.contains("on")) renderVoteModal();
  renderConnBtn();
  if(document.getElementById("welcome").classList.contains("on")&&W.step==="role"){ var ae=document.activeElement; if(ae&&ae.id==="wName") wRefreshWho(); else renderWelcome(); }
}
function renderLiveOnly(){ renderFin(); renderNow(); renderCompanion(); renderAgendaLine(); renderVoteBar(); maybeShowWinners(false); renderConnBtn(); renderRoles(); if(document.getElementById("voteModal").classList.contains("on")) renderVoteModal(); }
function renderMeta(){
  var w=document.getElementById("mWeek"), d=document.getElementById("mDate"), n=document.getElementById("myName");
  if(document.activeElement!==w) w.value=S.meta.week||"";
  if(document.activeElement!==d) d.value=S.meta.date||"";
  if(document.activeElement!==n) n.value=myName();
  var r=ROLES.find(function(x){return x.id===L.role;});
  document.getElementById("myNameLbl").textContent="Your name ("+r.name+")";
}
function renderRoles(){
  var r=ROLES.find(function(x){return x.id===L.role;});
  var team=ROLES.filter(function(x){return x.id!==L.role && S.people[x.id];}).map(function(x){return x.icon+" "+esc(S.people[x.id]);});
  var sub;
  if(NET.mode && NET.status==="on" && NET.peers.length){
    var ppl=onlinePeople(), online=ppl.map(function(p){ var rl=p.roles.map(roleObj).filter(Boolean); return '<span class="onl">'+rl.map(function(r){return r.icon;}).join("")+" "+esc(p.name||(rl[0]?rl[0].name:"Device"))+(p.host?' <i>(host)</i>':'')+(p.devices>1?' <i>· '+p.devices+' devices</i>':'')+'</span>'; });
    sub='<span class="dotg"></span><b>'+ppl.length+' online</b> · '+online.join(" · ");
  } else if(NET.mode){ sub='<span class="doty"></span>'+esc(NET.msg||"Connecting…"); }
  else sub=team.length?'Team: '+team.join(" · ")+' · <i>not connected</i>':'Your role on this device · not connected';
  document.getElementById("roles").innerHTML=roleTabsHTML()+linkBarHTML()+'<div class="me">'+r.icon+' <b>'+r.name+'</b>'+(myName()?' · '+esc(myName()):'')+
    '<small>'+sub+'</small></div><button class="btn sm" data-open-phone title="Show a QR code to open your role on your phone">📱 Open on phone</button>'+(FOCUS_ROLES[L.role]?'<button class="btn sm" data-focus="on" title="Show only what this role needs right now">🎯 Focus</button>':'')+(TIPS[L.role]?'<button class="btn sm" data-tips title="Show the tips for this role again">💡 Tips</button>':'')+'<button class="btn sm" data-change-role>Change role</button>';
}
/* the speaker's own live card: big clock and the Timer's signal colour on their device */
function myNameKeys(){ var a=[myName(),L.me]; Object.keys(L.myNames||{}).forEach(function(k){ a.push(L.myNames[k]); }); return uniq(a.filter(function(n){return n&&String(n).trim();}).map(nkey)); }
function limitsLine(sid,row){ var L2=limOf(sid,row); return sid==="rr"?"Bell at "+fmt(L2.b):"Green "+fmt(L2.g)+" · Amber "+fmt(L2.a)+" · Red "+fmt(L2.r); }
function meStatus(sid,sec,row){ var L2=limOf(sid,row);
  if(sid==="rr") return sec<=L2.b?"Keep going":"Time's up — finish now";
  if(sec<L2.g) return "Keep going"; if(sec<L2.a) return "✓ You've qualified"; if(sec<L2.r) return "Start wrapping up"; return "Finish now — over time"; }
function meCardHTML(x,sec,sg){
  return '<div class="mecard nowitem '+(sg||"sn")+'" data-sid="'+x.sid+'" data-id="'+x.r.id+'" data-me="1"><div class="mehead"><span>🎙 You are speaking · '+esc(x.s.name)+'</span><span class="row" style="gap:4px">'+(x.sid==="rr"?meBellBtn():'')+'<button class="btn sm" data-mefull title="Fill the screen, e.g. phone on the lectern">⛶ Full screen</button></span></div>'+
    '<div class="meclock" data-live="clock">'+fmt(sec)+'</div><div class="mesig" data-live="pill">'+sigLabel(sg,x.r)+'</div>'+
    '<div class="mestat" data-live="mestat">'+esc(meStatus(x.sid,sec,x.r))+' · '+esc(nextSignalText(x.sid,sec,x.r))+'</div><div class="melim">'+esc(limitsLine(x.sid,x.r))+'</div></div>';
}
document.getElementById("nowStrip").addEventListener("click",function(e){ var b=e.target.closest("[data-mefull]"); if(!b) return; var c=b.closest(".mecard"); try{ if(document.fullscreenElement) document.exitFullscreen(); else if(c.requestFullscreen) c.requestFullscreen(); }catch(err){} });
/* who is speaking now (from the Timer) — shown on the other roles */
function renderNow(){
  var el=document.getElementById("nowStrip");
  if(myRoles().indexOf("timer")>=0){ el.classList.remove("on"); el.innerHTML=""; return; }
  var run=runningList(), t=now(), h="";
  var fs=document.fullscreenElement; if(fs && el.contains(fs) && run.some(function(x){return x.r.id===fs.dataset.id;})) return;
  var mine=myNameKeys();
  run.forEach(function(x){
    var sec=elapsed(x.r,t), sg=signal(x.sid,sec,x.r);
    if(mine.indexOf(nkey(baseName(x.r.name)))>=0){ h+=meCardHTML(x,sec,sg); return; }
    var add = (L.role==="ah"||L.role==="gram"||L.role==="seval"||L.role==="tteval") ? '<button class="btn sm" data-now-add="'+esc(displayName(x.r,x.i))+'">+ Add / select</button>' : '';
    h+='<div class="nowitem '+sg+'" data-sid="'+x.sid+'" data-id="'+x.r.id+'"><div class="clock" data-live="clock">'+fmt(sec)+'</div>'+
       '<div class="nm">🎙 '+esc(displayName(x.r,x.i))+'<span>Speaking now · '+x.s.name+'</span></div><span class="pill '+(sg||"sn")+'" data-live="pill">'+sigLabel(sg,x.r)+'</span>'+add+'</div>';
  });
  el.innerHTML=h; el.classList.toggle("on",!!h);
}

