/* ---------- navigation: My role · Now · Agenda (+ Report, More) ---------- */
function curView(){ return L.view==="now"||L.view==="agenda"?L.view:"role"; }
function setView(v){ L.view=v; saveL(); renderAll(); window.scrollTo(0,0); }
function renderNav(){
  var el=document.getElementById("bnav"); if(!el) return;
  var r=roleObj(L.role)||{icon:"👤",name:"Role"}, v=curView();
  var html=[["role",r.icon,"My role"],["now","📡","Now"],["agenda","📋","Agenda"],["report","📄","Report"],["more","⋯","More"]].map(function(item){
    var id=item[0], selected=v===id;
    return '<button data-nav="'+id+'" class="'+(selected?'on':id==="report"||id==="more"?'mob':'')+'"'+
      (selected?' aria-current="page"':'')+(id==="report"?' aria-haspopup="dialog" aria-controls="reportWrap"':'')+
      (id==="more"?' aria-expanded="false" aria-controls="moreMenu"':'')+'><span aria-hidden="true">'+item[1]+'</span>'+item[2]+'</button>';
  }).join("");
  if(el.navHTML!==html){
    var focused=document.activeElement?.dataset.nav;
    el.navHTML=html;
    el.innerHTML=html;
    if(document.getElementById("moreMenu").classList.contains("on")) el.querySelector('[data-nav="more"]').setAttribute("aria-expanded","true");
    if(focused) el.querySelector('[data-nav="'+focused+'"]')?.focus({preventScroll:true});
  }
  document.body.classList.toggle("v-now",v==="now"); document.body.classList.toggle("v-agenda",v==="agenda");
}
document.getElementById("bnav").addEventListener("click",function(e){
  var b=e.target.closest("[data-nav]"); if(!b) return; var n=b.dataset.nav;
  if(n==="report"){ document.getElementById("openReport").click(); return; }
  if(n==="more"){ e.stopPropagation(); openMoreMenu(); return; }
  setView(n);
});

/* the meeting at a glance, for everyone */
function agendaProgress(){ var its=runItems().filter(function(i){return !isSkipped(i.id);}), done=its.filter(function(i){return S.run.started&&S.run.started[i.id]!=null;}).length; return {done:done,n:its.length}; }
/* green dot for a connected person (text for screen readers); with label: "online" / "not connected" */
function onDot(n,label){ if(!NET.room||!n) return ""; var on=isOnlineName(n); return on?'<i class="dotg" role="img" aria-label="online" title="Connected now"></i>'+(label?'<span class="saved">online</span>':''):(label?'<span class="saved">not connected</span>':''); }
function isOnlineName(n){ return !!n && (NET.peers||[]).some(function(p){ return nkey(p.name)===nkey(n); }); }
function dashboardOnlineHTML(){
  var ppl=NET.room&&NET.status==="on"?onlinePeople():[];
  var heading='<h2 class="sec" style="margin-top:0">🟢 Online <span class="cnt">'+ppl.length+'</span></h2>';
  if(!NET.room||NET.status!=="on"){
    return heading+'<div class="note" style="margin:0">'+esc(NET.msg||"Not connected. Tap the connection button at the top to join the meeting.")+'</div>';
  }
  return heading+'<div class="chips">'+ppl.map(function(p){
    var icons=p.roles.map(function(r){ return roleObj(r)?.icon||""; }).join("");
    return '<span class="chip word">'+icons+' '+esc(p.name||peopleRoleNames(p))+
      (p.devices>1?' <small>· '+p.devices+' devices</small>':'')+'</span>';
  }).join("")+'</div>';
}
function refreshDashboardOnline(){
  var card=document.getElementById("dashboardOnline");
  if(!card) return;
  var html=dashboardOnlineHTML();
  if(card.onlineHTML!==html){ card.onlineHTML=html; card.innerHTML=html; }
}
function dashHTML(){
  var ss=scheduleStatus(), pr=agendaProgress(), h='';
  h+='<section class="card dash-hero"><div class="dh-top"><div><div class="dh-kicker">'+esc(GROUP)+(S.meta.week?' · '+esc(S.meta.week):'')+'</div><div class="dh-title">'+esc(fmtDate(S.meta.date)||"Today’s meeting")+'</div></div>'+
     '<button class="btn" id="projOpen">📺 Projector view</button></div>';
  if(ss){ var c=ss.c, who=whoFor(c.cur.role);
    h+='<div class="dh-now"><div class="dh-lbl">Now</div><div class="dh-item"><b>'+esc(fmtHM(rt(c.cur)))+'</b> '+esc(arole(c.cur.role).n)+(who?' · '+esc(who):'')+'<div class="muted">'+esc(c.cur.text)+'</div></div></div>';
    if(c.next){ var wn=whoFor(c.next.role); h+='<div class="dh-next"><div class="dh-lbl">Next</div><div class="dh-item"><b>'+esc(fmtHM(rt(c.next)))+'</b> '+esc(arole(c.next.role).n)+(wn?' · '+esc(wn):'')+'</div></div>'; }
    if(ss.txt) h+='<div class="'+ss.cls+'" style="margin-top:6px;font-weight:700">'+ss.txt+'</div>';
  } else { var f=runItems()[0]; h+='<div class="dh-now"><div class="dh-lbl">Not started</div><div class="dh-item">The Toastmaster starts the run-sheet when the meeting begins.'+(f?'<div class="muted">First: '+esc(fmtHM(f.time))+' '+esc(arole(f.role).n)+(whoFor(f.role)?' · '+esc(whoFor(f.role)):'')+'</div>':'')+'</div></div>'; }
  h+=liveCtlHTML();
  if(pr.n) h+='<div class="dh-prog"><div class="bar"><i style="width:'+Math.round(pr.done/pr.n*100)+'%"></i></div><span class="saved">'+pr.done+' of '+pr.n+' agenda items</span></div>';
  h+='</section>';
  /* timing so far */
  var tparts=[]; SESSIONS.forEach(function(s){ var done=S.rows[s.id].filter(function(r){return rowState(r)==="done";}); if(done.length){ var ok=done.filter(function(r){return status(s.id,r,now()).ok;}).length; tparts.push('<div class="dstat"><b>'+done.length+'</b><span>'+esc(s.name)+'</span><small>'+ok+' within time</small></div>'); } });
  h+='<div class="dgrid">';
  h+='<section class="card"><h2 class="sec" style="margin-top:0">⏱ Timing</h2>'+(runningList().length?'<div class="saved" style="margin-bottom:6px">Live time is shown at the top of the screen.</div>':'')+(tparts.length?'<div class="dstats">'+tparts.join("")+'</div>':'<div class="note" style="margin:0">No one timed yet.</div>')+'</section>';
  h+='<section class="card" id="dashboardOnline">'+dashboardOnlineHTML()+'</section>';
  var rp=AG_SIDE.filter(function(a){return asList(a[0]).length;});
  h+='<section class="card"><h2 class="sec" style="margin-top:0">👥 Role players</h2>'+(rp.length?'<div class="dplayers">'+rp.map(function(a){ return '<div><span class="muted">'+esc(a[1])+'</span><b>'+asList(a[0]).map(function(n){ return (isOnlineName(n)?'<i class="dotg" title="online"></i>':'')+esc(n)+kindBadge(n); }).join(", ")+'</b></div>'; }).join("")+'</div>':'<div class="note" style="margin:0">The Coordinator hasn’t set the role players yet.</div>')+'</section>';
  h+='<section class="card"><h2 class="sec" style="margin-top:0">📝 Word of the Day</h2>'+(S.gram.wotd?'<div class="dwotd">'+esc(S.gram.wotd)+'</div>'+wordOfDayDetailsHTML():'<div class="note" style="margin:0">The Grammarian will reveal it during the meeting.</div>')+
     '<h2 class="sec">🗳 Voting</h2><div>'+voteStateText()+'</div>'+(S.vote.state==="shown"?winnersLine():'')+'</section>';
  h+='</div>';
  return h;
}
/* the agenda for everyone, with where the meeting is up to */
function agendaViewHTML(){
  var A=S.agenda, c=curItem(), h='<section class="card"><div class="row" style="justify-content:space-between"><h2 class="sec" style="margin:0">📋 Agenda'+(A.no?' · No '+esc(A.no):'')+'</h2><button class="btn" id="agPrint">📄 Print / PDF</button></div>';
  h+='<div class="saved" style="margin:4px 0 10px">'+esc(fmtDate(S.meta.date)||"")+(A.venue?' · '+esc(A.venue):'')+'</div>'+(A.theme?'<p><b>Meeting theme</b> · '+esc(A.theme)+'</p>':'')+'<div class="agv2">';
  runItems().forEach(function(it){
    var who=whoFor(it.role), st=isSkipped(it.id)?"skip":(c.cur&&c.cur.id===it.id)?"cur":(S.run.started&&S.run.started[it.id]!=null)?"done":"";
    var x=agExtraHTML(it.x,it);
    h+='<div class="agv2i '+st+'"><div class="agv2t">'+esc(fmtHM(rt(it)))+'</div><div><div class="agv2r">'+esc(arole(it.role).n)+(who?' · <b>'+esc(who)+'</b>':'')+(st==="cur"?' <span class="badge on">Now</span>':st==="skip"?' <span class="badge no">Skipped</span>':'')+'</div><div class="agv2x">'+agActivityHTML(Object.assign({},it,{x:""}))+'</div>'+(x?'<div class="agv2s">'+x+'</div>':'')+'</div></div>';
  });
  h+='</div>'+(A.next?'<div class="saved" style="margin-top:10px">Next meeting: '+esc(fmtDate(A.next))+'</div>':'')+'</section>';
  return h;
}

