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
  var ss=scheduleStatus(), c=curItem(), pr=agendaProgress(), h='';
  h+='<section class="card dash-hero"><div class="dh-top"><div><div class="dh-kicker">'+esc(GROUP)+(S.meta.week?' · '+esc(S.meta.week):'')+'</div><div class="dh-title">'+esc(fmtDate(S.meta.date)||"Today’s meeting")+'</div></div>'+
     '<button class="btn" id="projOpen">📺 Projector view</button></div>';
  if(ss){ var who=whoForItem(c.cur);
    h+='<div class="dh-now"><div class="dh-lbl">Now</div><div class="dh-item"><b>'+esc(fmtHM(rt(c.cur)))+'</b> '+esc(arole(c.cur.role).n)+(who?' · '+esc(who):'')+'<div class="muted">'+esc(c.cur.text)+'</div></div></div>';
    if(c.next){ var wn=whoForItem(c.next), estimate=nextLiveEstimate(c); h+='<div class="dh-next"><div class="dh-lbl">Next</div><div class="dh-item"><b>'+esc(estimate==null?fmtHM(rt(c.next)):'Est. '+fmtHM(min2hm(estimate)))+'</b> '+esc(arole(c.next.role).n)+(wn?' · '+esc(wn):'')+((c.next.rowId||c.next.report)?'<div class="muted">'+esc(c.next.text)+'</div>':'')+'</div></div>'; }
    if(ss.txt) h+='<div class="'+ss.cls+'" style="margin-top:6px;font-weight:700">'+ss.txt+'</div>';
  } else if(S.run.endAt){ h+='<div class="dh-now"><div class="dh-lbl">Meeting finished</div><div class="dh-item">'+esc(hhmm(S.run.endAt))+'</div></div>'; }
  else { var f=nextLive(c.its,0); h+='<div class="dh-now"><div class="dh-lbl">Not started</div><div class="dh-item">The Toastmaster starts the run-sheet when the meeting begins.'+(f?'<div class="muted">First: '+esc(fmtHM(f.time))+' '+esc(arole(f.role).n)+(whoForItem(f)?' · '+esc(whoForItem(f)):'')+'</div>':'')+'</div></div>'; }
  var floor=document.querySelector(".floor-controls");
  var choice=floor?.dataset.item===(S.run.cur||"")&&floor.dataset.role===L.role
    ?{role:document.getElementById("handoverTarget")?.value,name:document.getElementById("handoverRecipient")?.value}:null;
  h+=liveRoleCueHTML()+liveCtlHTML()+liveSubstitutionHTML(c)+handoverHTML(choice);
  if(pr.n) h+='<div class="dh-prog"><div class="bar"><i style="width:'+Math.round(pr.done/pr.n*100)+'%"></i></div><span class="saved">'+pr.done+' of '+pr.n+' agenda items</span></div>';
  h+='</section>'+liveReportQueueHTML(myRoles().includes("ge"));
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
function agendaViewHTML(embedded){
  var A=S.agenda, c=curItem(), editable=liveEditableItems(c.its), h='<section class="card"><div class="row" style="justify-content:space-between"><h2 class="sec" style="margin:0">Live running order</h2><div class="row">'+(canEditLiveAgenda()?'<button class="btn" data-copy-live-agenda>Copy running order</button>':'')+(embedded?'':'<button class="btn" id="agPrint">📄 Print plan / PDF</button>')+'</div></div>';
  h+='<div class="saved" style="margin:4px 0 10px">'+esc(fmtDate(S.meta.date)||"")+(A.venue?' · '+esc(A.venue):'')+'</div>'+(A.theme?'<p><b>Meeting theme</b> · '+esc(A.theme)+'</p>':'')+(editable.length>1?'<p class="saved">Drag future items or use Move earlier and Move later. Times shown are from the plan, with any live time adjustments.</p>':'')+'<div class="agv2">';
  c.its.forEach(function(it){
    var who=whoForItem(it), st=isSkipped(it.id)?"skip":(c.cur&&c.cur.id===it.id)?"cur":(S.run.started&&S.run.started[it.id]!=null)||it.report&&liveReportState(it.report)==="presented"?"done":"";
    var estimate=it.id===c.next?.id?nextLiveEstimate(c):null;
    var x=it.rowId?esc(liveItemExtra(it)):["speakers","evals"].includes(it.x)?"":agExtraHTML(it.x,it);
    var index=editable.indexOf(it), movable=index>=0&&editable.length>1;
    h+='<div class="agv2i '+st+'" data-live-item="'+esc(it.id)+'"'+(movable?' data-live-movable':'')+'><div class="agv2t">'+esc(fmtHM(rt(it)))+(estimate!=null?'<div class="saved">Est. '+esc(fmtHM(min2hm(estimate)))+'</div>':'')+'</div><div><div class="agv2r">'+esc(arole(it.role).n)+(who?' · <b>'+esc(who)+'</b>':'')+(st==="cur"?' <span class="badge on">Now</span>':st==="skip"?' <span class="badge no">Skipped</span>':st==='done'&&it.report&&liveReportState(it.report)==='presented'?' <span class="badge">Presented</span>':'')+'</div><div class="agv2x">'+agActivityHTML(Object.assign({},it,{x:""}))+'</div>'+(x?'<div class="agv2s">'+x+'</div>':'')+(movable?agendaMoveControls(it,index,editable):'')+(index>=0?'<button class="btn sm" data-live-skip="'+esc(it.id)+'">'+(st==='skip'?'Restore item':'Skip item')+'</button>':'')+'</div></div>';
  });
  h+='</div>'+(A.next?'<div class="saved" style="margin-top:10px">Next meeting: '+esc(fmtDate(A.next))+'</div>':'')+'</section>';
  return h;
}


function agendaMoveControls(item,index,editable){
  var label=whoForItem(item)||String(item.text||"").split(" — ")[0]||arole(item.role).n;
  return '<div class="row live-move"><span class="live-grip" draggable="true" aria-hidden="true" title="Drag to move">⠿ Drag</span>'+
    [["earlier",index>0],["later",index<editable.length-1]].map(function(action){
      return '<button class="btn sm" data-live-move="'+action[0]+'" data-live-id="'+esc(item.id)+'" aria-label="Move '+esc(label)+' '+action[0]+'"'+(action[1]?'':' aria-disabled="true"')+'>Move '+action[0]+'</button>';
    }).join("")+'</div>';
}
(function(){
  var view=document.getElementById("view"), dragged="", touch=null;
  function target(event){ return event.target.closest("[data-live-movable]"); }
  function clearDrop(){
    view.querySelectorAll(".live-drop-before,.live-drop-after").forEach(function(row){row.classList.remove("live-drop-before","live-drop-after");});
  }
  function dropAfter(event,row){
    var bounds=row.getBoundingClientRect();
    return event.clientY>=bounds.top+bounds.height/2;
  }
  view.addEventListener("dragstart",function(event){
    var row=target(event);
    if(!event.target.matches(".live-grip")||!row||!canEditLiveAgenda()) return;
    dragged=row.dataset.liveItem;
    event.dataTransfer.setData("text/plain",dragged);
    event.dataTransfer.effectAllowed="move";
  });
  view.addEventListener("dragover",function(event){
    var row=target(event);
    if(!dragged) return;
    clearDrop();
    if(!row||row.dataset.liveItem===dragged) return;
    event.preventDefault();
    event.dataTransfer.dropEffect="move";
    row.classList.add(dropAfter(event,row)?"live-drop-after":"live-drop-before");
  });
  view.addEventListener("drop",function(event){
    var row=target(event), id=dragged;
    dragged=""; clearDrop();
    if(!id||!row) return;
    event.preventDefault();
    reorderLiveItem(id,row.dataset.liveItem,dropAfter(event,row));
  });
  view.addEventListener("dragend",function(){ dragged=""; clearDrop(); });
  view.addEventListener("pointerdown",function(event){
    var row=target(event);
    if(event.pointerType!=="touch"||!event.isPrimary||!event.target.matches(".live-grip")||!row||!canEditLiveAgenda()) return;
    touch={pointer:event.pointerId,id:row.dataset.liveItem,startY:event.clientY};
    event.target.setPointerCapture(event.pointerId);
  });
  view.addEventListener("pointermove",function(event){
    if(touch?.pointer!==event.pointerId) return;
    clearDrop();
    if(Math.abs(event.clientY-touch.startY)<8) return;
    var row=document.elementFromPoint(event.clientX,event.clientY)?.closest("[data-live-movable]");
    if(row&&row.dataset.liveItem!==touch.id) row.classList.add(dropAfter(event,row)?"live-drop-after":"live-drop-before");
  });
  view.addEventListener("pointerup",function(event){
    if(touch?.pointer!==event.pointerId) return;
    var move=touch; touch=null; clearDrop();
    if(Math.abs(event.clientY-move.startY)<8) return;
    var row=document.elementFromPoint(event.clientX,event.clientY)?.closest("[data-live-movable]");
    if(row) reorderLiveItem(move.id,row.dataset.liveItem,dropAfter(event,row));
  });
  view.addEventListener("lostpointercapture",function(event){
    if(touch?.pointer===event.pointerId){ touch=null; clearDrop(); }
  });
  view.addEventListener("click",function(event){
    var skip=event.target.closest("[data-live-skip]");
    if(skip){ runToggleSkip(skip.dataset.liveSkip); return; }
    if(event.target.closest("[data-copy-live-agenda]")&&canEditLiveAgenda()){ copyText(liveAgendaText()); return; }
    var button=event.target.closest("[data-live-move]");
    if(!button||button.getAttribute("aria-disabled")==="true") return;
    var items=liveEditableItems(runItems()), id=button.dataset.liveId, after=button.dataset.liveMove==="later";
    var index=items.findIndex(function(it){return it.id===id;});
    var adjacent=index<0?null:items[index+(after?1:-1)];
    if(adjacent) reorderLiveItem(id,adjacent.id,after);
  });
})();

function liveAgendaText(){
  var c=curItem(), estimate=nextLiveEstimate(c);
  return ["Live running order · "+(S.agenda.title||GROUP)].concat(c.its.slice(Math.max(0,c.i)).filter(function(it){
    return !isSkipped(it.id);
  }).map(function(it){
    var time=it.id===c.next?.id&&estimate!=null?"Est. "+fmtHM(min2hm(estimate)):"";
    return [it.id===c.cur?.id?"Now":time,itemLabel(it),liveItemExtra(it).startsWith("Evaluator:")?liveItemExtra(it):""].filter(Boolean).join(" · ");
  })).join("\n");
}
