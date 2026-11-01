/* ---------- navigation: My role · Now · Agenda (+ Report, More) ---------- */
function curView(){ return L.view==="now"||L.view==="agenda"?L.view:"role"; }
function setView(v){ L.view=v; saveL(); renderAll(); window.scrollTo(0,0); }
function renderNav(){
  var el=document.getElementById("bnav"); if(!el) return;
  var r=roleObj(L.role)||{icon:"👤",name:"Role"}, v=curView();
  el.innerHTML='<button data-nav="role" class="'+(v==="role"?"on":"")+'"><span>'+r.icon+'</span>My role</button>'+
    '<button data-nav="now" class="'+(v==="now"?"on":"")+'"><span>📡</span>Now</button>'+
    '<button data-nav="agenda" class="'+(v==="agenda"?"on":"")+'"><span>📋</span>Agenda</button>'+
    '<button data-nav="report" class="mob"><span>📄</span>Report</button>'+
    '<button data-nav="more" class="mob"><span>⋯</span>More</button>';
  document.body.classList.toggle("v-now",v==="now"); document.body.classList.toggle("v-agenda",v==="agenda");
}
document.getElementById("bnav").addEventListener("click",function(e){
  var b=e.target.closest("[data-nav]"); if(!b) return; var n=b.dataset.nav;
  if(n==="report"){ document.getElementById("openReport").click(); return; }
  if(n==="more"){ e.stopPropagation(); openMoreMenu(true); return; }
  setView(n);
});

/* the meeting at a glance, for everyone */
function agendaProgress(){ var its=runItems().filter(function(i){return !isSkipped(i.id);}), done=its.filter(function(i){return S.run.started&&S.run.started[i.id]!=null;}).length; return {done:done,n:its.length}; }
function isOnlineName(n){ return !!n && (NET.peers||[]).some(function(p){ return nkey(p.name)===nkey(n); }); }
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
  var ppl=onlinePeople();
  h+='<section class="card"><h2 class="sec" style="margin-top:0">🟢 Online <span class="cnt">'+(NET.mode?ppl.length:0)+'</span></h2>'+(NET.mode&&ppl.length?'<div class="chips">'+ppl.map(function(p){ return '<span class="chip word">'+p.roles.map(function(r){var o=roleObj(r);return o?o.icon:"";}).join("")+' '+esc(p.name||peopleRoleNames(p))+(p.devices>1?' <small>· '+p.devices+'</small>':'')+'</span>'; }).join("")+'</div>':'<div class="note" style="margin:0">Not connected. Tap the connection button at the top to join the meeting.</div>')+'</section>';
  var rp=AG_SIDE.filter(function(a){return asList(a[0]).length;});
  h+='<section class="card"><h2 class="sec" style="margin-top:0">👥 Role players</h2>'+(rp.length?'<div class="dplayers">'+rp.map(function(a){ return '<div><span class="muted">'+esc(a[1])+'</span><b>'+asList(a[0]).map(function(n){ return (isOnlineName(n)?'<i class="dotg" title="online"></i>':'')+esc(n)+kindBadge(n); }).join(", ")+'</b></div>'; }).join("")+'</div>':'<div class="note" style="margin:0">The Coordinator hasn’t set the role players yet.</div>')+'</section>';
  h+='<section class="card"><h2 class="sec" style="margin-top:0">📝 Word of the Day</h2>'+(S.gram.wotd?'<div class="dwotd">'+esc(S.gram.wotd)+'</div>'+(S.gram.meaning?'<div class="muted">'+esc(S.gram.meaning)+'</div>':''):'<div class="note" style="margin:0">The Grammarian hasn’t set it yet.</div>')+
     '<h2 class="sec">🗳 Voting</h2><div>'+voteStateText()+'</div>'+(S.vote.state==="shown"?winnersLine():'')+'</section>';
  h+='</div>';
  return h;
}
/* the agenda for everyone, with where the meeting is up to */
function agendaViewHTML(){
  var A=S.agenda, c=curItem(), h='<section class="card"><div class="row" style="justify-content:space-between"><h2 class="sec" style="margin:0">📋 Agenda'+(A.no?' · No '+esc(A.no):'')+'</h2><button class="btn" id="agPrint">📄 Print / PDF</button></div>';
  h+='<div class="saved" style="margin:4px 0 10px">'+esc(fmtDate(S.meta.date)||"")+(A.venue?' · '+esc(A.venue):'')+'</div><div class="agv2">';
  runItems().forEach(function(it){
    var who=whoFor(it.role), st=isSkipped(it.id)?"skip":(c.cur&&c.cur.id===it.id)?"cur":(S.run.started&&S.run.started[it.id]!=null)?"done":"";
    var x=agExtraHTML(it.x);
    h+='<div class="agv2i '+st+'"><div class="agv2t">'+esc(fmtHM(rt(it)))+'</div><div><div class="agv2r">'+esc(arole(it.role).n)+(who?' · <b>'+esc(who)+'</b>':'')+(st==="cur"?' <span class="badge on">Now</span>':st==="skip"?' <span class="badge no">Skipped</span>':'')+'</div><div class="agv2x">'+agActivityHTML(Object.assign({},it,{x:""}))+'</div>'+(x?'<div class="agv2s">'+x+'</div>':'')+'</div></div>';
  });
  h+='</div>'+(A.next?'<div class="saved" style="margin-top:10px">Next meeting: '+esc(fmtDate(A.next))+'</div>':'')+'</section>';
  return h;
}

