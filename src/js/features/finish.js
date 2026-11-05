/* ---------- finish the meeting: every role confirms it is done ---------- */
var FIN_ROLES=["president","saa","tmod","ge","timer","ttm","rrm","ah","gram","seval","tteval"];
function finRoleName(r){ var o=roleObj(r); return o?o.name:r; }
function finNameFor(r){ return MULTI_ROLES[r] ? ((L.myNames||{})[r]||L.me||"") : (S.people[r]||assigned(r)||""); }
function finId(r,name){ return "f|"+r+"|"+(MULTI_ROLES[r]?nkey(name||devId()):""); }
function finRec(r,name){ var id=finId(r,name); return S.fin.find(function(f){return f.id===id;}); }
/* simple checks: things that are easy to forget before the meeting closes */
function finChecks(r){
  var w=[], me=nkey(finNameFor(r));
  if(r==="president"){ var pl=chkLeft("pres","close",presChecks().close); if(pl.length) w.push("Closing not ticked: "+pl.join("; ")+"."); var nw=S.guests.filter(function(g){return !g.welcomed;}).length; if(nw) w.push(nw+" guest"+(nw>1?"s":"")+" not marked as welcomed."); }
  else if(r==="saa"){ var sl=chkLeft("saa","after",SAA_CHECKS.after); if(sl.length) w.push("After the meeting not ticked: "+sl.join("; ")+"."); }
  else if(r==="timer"){
    var run=runningList(); if(run.length) w.push(run.length+" timer"+(run.length>1?"s are":" is")+" still running.");
    var all=0, noname=0; SESSIONS.forEach(function(s){ S.rows[s.id].forEach(function(x){ if(rowState(x)==="idle") return; all++; if(!String(x.name||"").trim()) noname++; }); });
    if(!all) w.push("No times recorded."); if(noname) w.push(noname+" timed entr"+(noname>1?"ies have":"y has")+" no name.");
  } else if(r==="ttm"){
    var used=S.topics.filter(function(t){return t.used;});
    if(!used.length) w.push("No topics marked as used.");
    var nn=used.filter(function(t){return !String(t.speaker||"").trim();}).length; if(nn) w.push(nn+" used topic"+(nn>1?"s have":" has")+" no speaker name.");
  } else if(r==="ah"){
    if(!S.ahRows.length) w.push("No counts recorded.");
  } else if(r==="gram"){
    if(!String(S.gram.wotd||"").trim()) w.push("Word of the Day isn't set.");
    if(!S.gramRows.length) w.push("No speaker notes recorded.");
  } else if(r==="rrm"){
    if(!S.rrq.length) w.push("No Round Robin questions recorded.");
  } else if(r==="ge"){
    if(!geHasNotes()) w.push("General evaluation notes are empty.");
  } else if(r==="tmod"){
    if(S.vote.state!=="shown") w.push("Voting results haven't been revealed yet.");
  } else if(r==="seval"||r==="tteval"){
    var kind=r==="tteval"?"tt":"ps", open=[];
    Object.keys(L.evDrafts||{}).forEach(function(id){ var d=L.evDrafts[id]; if(d.kind===kind && !d.submitted && (d.c1||d.r||d.c2)) open.push(d.speaker); });
    if(r==="tteval") S.ttassign.forEach(function(a){ if(nkey(a.evaluator)===me && me && evStatusOf("tt",a.speaker,finNameFor(r))!=="done" && open.indexOf(a.speaker)<0) open.push(a.speaker); });
    if(r==="seval") S.assigns.forEach(function(a){ if(nkey(a.evaluator)===me && me){ var sub=S.evals.some(function(e){ return e.kind==="ps" && nkey(e.speaker)===nkey(a.speaker) && e.done && nkey(e.by)===me; }); if(!sub && open.indexOf(a.speaker)<0) open.push(a.speaker); } });
    open.forEach(function(sp){ w.push("Evaluation for "+sp+" not submitted."); });
  }
  return w;
}
/* the roles the Coordinator expects to hear from */
function finExpected(){
  var out=[], seen={};
  var add=function(r,name){ var id=finId(r,name); if(seen[id]) return; seen[id]=1; out.push({r:r,name:name||"",id:id}); };
  ["president","saa","tmod","ge","timer","ttm","rrm","ah","gram"].forEach(function(r){ var n=assigned(r)||S.people[r]; if(n) add(r,n); });
  asList("sevals").forEach(function(n){ add("seval",n); }); S.assigns.forEach(function(a){ if(a.evaluator) add("seval",a.evaluator); });
  asList("ttevals").forEach(function(n){ add("tteval",n); });
  (NET.peers||[]).forEach(function(p){ (Array.isArray(p.roles)&&p.roles.length?p.roles:[p.role]).forEach(function(r){ if(FIN_ROLES.indexOf(r)>=0) add(r,MULTI_ROLES[r]?p.name:(assigned(r)||S.people[r]||p.name)); }); });
  S.fin.forEach(function(f){ add(f.role,f.name); });
  return out;
}
function finOnline(r,name){
  return (NET.peers||[]).some(function(p){ var rl=Array.isArray(p.roles)&&p.roles.length?p.roles:[p.role]; return rl.indexOf(r)>=0 && (!MULTI_ROLES[r] || nkey(p.name)===nkey(name)); });
}
function finStatusHTML(){
  var ex=finExpected(), done=0;
  var rows=ex.map(function(e){
    var f=S.fin.find(function(x){return x.id===e.id;}), st;
    if(f&&f.state==="done"){ done++; st='<span class="badge ok">✓ Complete</span>'+(f.issues&&f.issues.length?' <span class="saved">⚠ '+esc(f.issues.join(" "))+'</span>':''); }
    else if(f&&f.state==="open") st='<span class="badge on">In progress</span>';
    else if(finOnline(e.r,e.name)) st='<span class="badge on">Online · not opened yet</span>';
    else st='<span class="badge no">Waiting · not connected</span>';
    var o=roleObj(e.r);
    return '<tr><td>'+(o?o.icon+' ':'')+esc(finRoleName(e.r))+'</td><td>'+esc(e.name||(f&&f.name)||"—")+'</td><td>'+st+'</td></tr>';
  }).join("");
  var all=ex.length&&done===ex.length;
  return '<div class="row" style="justify-content:space-between;margin-top:6px"><b>'+(all?'✅ All roles complete':done+' of '+ex.length+' roles complete')+'</b><button class="btn ghost" id="finStop">Stop asking</button></div>'+
    (ex.length?'<table class="sumtable" style="margin-top:6px"><tbody>'+rows+'</tbody></table>':'<div class="note">No role players yet. Roles appear here as devices connect.</div>')+
    (all?'<div class="note" style="margin-top:6px">Everyone is done. Save the meeting record now.</div>':'');
}
function endMeetingHTML(){
  var on=S.wrap&&S.wrap.on;
  return '<section class="card" id="endCard" style="margin-'+(on?'bottom':'top')+':12px'+(on?';border-color:var(--a)':'')+'"><h2 class="sec" style="margin-top:0">🏁 End of meeting <span class="cnt">confirm every role is done, then keep a copy</span></h2>'+
    (on?finStatusHTML():'<div class="note" style="margin-top:0"><b>1.</b> Tap <b>Finish meeting</b>. Every role player gets a prompt to check their work, submit anything left and tap <b>Yes, done</b>. You see each role go from waiting to in progress to complete.</div><div class="row" style="margin-top:8px"><button class="btn primary" id="finStart">🏁 Finish meeting</button></div>')+
    '<div class="note" style="margin-top:10px"><b>2.</b> Save the meeting record. It holds the member list, role players, agenda, times, reports and votes (feedback stays encrypted). If a browser loses its data, import the file to bring everything back, on this device and every connected device.</div>'+
    '<div class="row" style="margin-top:8px"><button class="btn go" id="endSave">⤓ Save meeting record</button><button class="btn ghost" id="endImport">⤒ Import meeting record</button></div></section>'+runSummaryHTML();
}
/* the prompt on each role player's device */
function myFinRoles(){ return myRoles().filter(function(r){ return FIN_ROLES.indexOf(r)>=0; }); }
function renderFin(){
  var el=document.getElementById("finSheet"); if(!el) return;
  var mine=S.wrap&&S.wrap.on?myFinRoles():[];
  if(!mine.length){ el.className=""; el.innerHTML=""; return; }
  var changed=false;
  mine.forEach(function(r){ var n=finNameFor(r); if(!finRec(r,n)){ var f=upsert(["fin"],finId(r,n),{role:r,name:n,state:"open"}); f.role=r; f.name=n; f.state="open"; tick(f); changed=true; } });
  if(changed) commitQuiet();
  var pending=mine.filter(function(r){ var f=finRec(r,finNameFor(r)); return !(f&&f.state==="done"); });
  if(L.finMin===S.wrap.at){ el.className="on min"; el.innerHTML='<button class="btn primary" id="finOpen">🏁 '+(pending.length?'Finish your role'+(pending.length>1?'s ('+pending.length+')':''):'Done ✓')+'</button>'; return; }
  var h='<div class="finhead"><b>🏁 The Coordinator is finishing the meeting</b><button class="btn ghost" id="finHide">Later</button></div><div class="saved" style="margin:2px 0 8px">Check your role, submit anything left, then tap <b>Yes, done</b>. Your results go to the Coordinator.</div>';
  mine.forEach(function(r){
    var n=finNameFor(r), f=finRec(r,n), o=roleObj(r), w=finChecks(r), done=f&&f.state==="done";
    h+='<div class="finrow'+(done?' done':'')+'"><div><b>'+(o?o.icon+' ':'')+esc(finRoleName(r))+'</b>'+(n?' · '+esc(n):'')+
      (done?'<div class="saved">✓ Sent to the Coordinator'+(f.issues&&f.issues.length?' (with '+f.issues.length+' note'+(f.issues.length>1?'s':'')+')':'')+'</div>':
       (w.length?'<div class="finwarn">'+w.map(function(x){return '⚠ '+esc(x);}).join('<br>')+'</div>':'<div class="saved">✓ Everything looks complete</div>'))+'</div>'+
      (done?'<button class="btn ghost" data-finundo="'+r+'">Undo</button>':'<button class="btn go" data-findone="'+r+'">Yes, done</button>')+'</div>';
  });
  el.className="on"; el.innerHTML=h;
}
(function(){
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    if(L.role!=="coord"||!coordUnlocked()) return;
    if(e.target.closest("#endSave")) document.getElementById("backupBtn").click();
    else if(e.target.closest("#endImport")) document.getElementById("restoreBtn").click();
    else if(e.target.closest("#finStart")){ autoSaveRecord("Finish meeting"); S.wrap.on=true; S.wrap.at=now(); tick(S.wrap); commit(); window.scrollTo(0,0); }
    else if(e.target.closest("#finStop")){ if(!confirm("Stop asking roles to finish? Their prompts close; answers so far are kept.")) return; S.wrap.on=false; tick(S.wrap); commit(); }
  });
  var F=document.getElementById("finSheet");
  F.addEventListener("click",function(e){
    var t=e.target;
    if(t.closest("#finHide")){ L.finMin=S.wrap.at; saveL(); renderFin(); return; }
    if(t.closest("#finOpen")){ L.finMin=0; saveL(); renderFin(); return; }
    var d=t.closest("[data-findone]");
    if(d){ var r=d.dataset.findone, w=finChecks(r);
      if(w.length && !confirm(finRoleName(r)+":\n\n• "+w.join("\n• ")+"\n\nSend as done anyway? The Coordinator will see these notes.")) return;
      var n=finNameFor(r), f=upsert(["fin"],finId(r,n),{role:r,name:n}); f.role=r; f.name=n; f.state="done"; f.issues=w; f.at=now(); tick(f); commit();
      if(myFinRoles().every(function(x){ var g=finRec(x,finNameFor(x)); return g&&g.state==="done"; })){ L.finMin=S.wrap.at; saveL(); renderFin(); showToastMsg("✓ Thanks! The Coordinator has your results."); }
      return; }
    var u=t.closest("[data-finundo]");
    if(u){ var r2=u.dataset.finundo, n2=finNameFor(r2), g=finRec(r2,n2); if(g){ g.state="open"; g.issues=[]; tick(g); commit(); } }
  });
})();

