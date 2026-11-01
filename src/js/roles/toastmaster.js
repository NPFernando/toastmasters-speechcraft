/* ---------- Toastmaster of the Day: run-sheet ---------- */
function curItem(){ var its=runItems(); var i=its.findIndex(function(x){return x.id===S.run.cur;}); return {its:its,i:i,cur:i>=0?its[i]:null,next:nextLive(its,i+1)}; }
function minutesNow(){ var d=new Date(); return d.getHours()*60+d.getMinutes()+d.getSeconds()/60; }
function scheduleStatus(){
  var c=curItem(); if(!c.cur) return null;
  var st=S.run.started[c.cur.id], plan=hm2min(rt(c.cur));
  var late = (st!=null&&plan!=null) ? Math.round(((function(){ var d=new Date(st); return d.getHours()*60+d.getMinutes()+d.getSeconds()/60; })())-plan) : 0;
  var overdue = c.next ? Math.round(minutesNow()-hm2min(rt(c.next))) : 0;
  var behind=Math.max(late, overdue>0?overdue:-999);
  var txt, cls;
  if(Math.abs(late)>120 || overdue>180){ return {txt:"",cls:"muted",c:c}; }
  if(behind>=2){ txt="⏰ Running "+behind+" min behind"; cls="st-o"; }
  else if(late<=-2){ txt="Running "+(-late)+" min ahead"; cls="st-q"; }
  else { txt="✓ On time"; cls="st-q"; }
  return {txt:txt,cls:cls,c:c};
}
function itemCard(it,big){
  if(!it) return '<div class="muted">End of agenda.</div>';
  var who=whoFor(it.role), x=extraText(it.x);
  return '<div class="'+(big?'nowtxt':'nexttxt')+'"><span class="tm">'+fmtHM(rt(it))+'</span> <b>'+arole(it.role).n+'</b>'+(who?' · '+esc(who):'')+'</div><div class="'+(big?'nowact':'muted')+'">'+esc(it.text)+'</div>'+(x?'<div class="agx2">'+esc(x).replace(/\n/g,'<br>')+'</div>':'');
}
function tmodHTML(){
  var c=curItem(), ss=scheduleStatus();
  var h='<section class="card"><div class="row" style="justify-content:space-between"><div><span class="bigclock" id="tmClock">'+new Date().toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"})+'</span>'+(ss?' <span class="status '+ss.cls+'" id="tmSched">'+ss.txt+'</span>':'')+'</div>'+
        '<button class="btn" id="agPrint">📄 Agenda</button></div>';
  if(!c.cur&&S.run.endAt&&Object.keys(S.run.started||{}).length){ h+='<div class="note" style="margin-top:12px">🏁 Meeting finished at '+hhmm(S.run.endAt)+'. <button class="linkbtn" id="runStart">Start again</button></div></section>'+runSummaryHTML()+'<section class="card">'; }
  else if(!c.cur){
    h+='<div class="curtopic" style="margin-top:12px"><div class="lbl">First item</div>'+itemCard(c.its[0],true)+'<div class="row" style="margin-top:12px"><button class="btn go big1" id="runStart">▶ Start the meeting</button></div></div>';
  } else {
    h+='<div class="curtopic" style="margin-top:12px"><div class="lbl">Now'+(S.run.started[c.cur.id]?' · started '+new Date(S.run.started[c.cur.id]).toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"}):'')+'</div>'+itemCard(c.cur,true)+'</div>';
    h+='<div class="wcard"><div class="lbl saved">NEXT</div>'+itemCard(c.next,false)+'</div>';
    h+='<div class="row"><button class="btn" id="runPrev">◀ Back</button><button class="btn go big1" id="runNext"'+(c.next?'':' disabled')+'>Next ▶</button>'+(c.next?'':'<button class="btn" id="runEnd">Finish</button>')+'</div>';
    h+=adjCtlHTML();
  }
  h+='<h2 class="sec">Full agenda</h2><ul class="tlist runlist">';
  c.its.forEach(function(it,i){
    var cls=c.i>=0&&i<c.i?"done":i===c.i?"cur":"";
    var sk=isSkipped(it.id), moved=Array.isArray(S.run.order)&&S.run.order.length&&itemsSorted().indexOf(it)!==i;
    h+='<li data-run="'+it.id+'" class="'+cls+(sk?' skipped':'')+'"><span class="n">'+fmtHM(rt(it))+(rt(it)!==it.time?'<br><s class="muted">'+fmtHM(it.time)+'</s>':'')+(moved?'<br><span class="badge on">moved</span>':'')+'</span><span style="flex:1"><b>'+arole(it.role).n+'</b>'+(whoFor(it.role)?' · '+esc(whoFor(it.role)):'')+(sk?' <span class="badge no">skipped</span>':'')+'<br><span class="muted">'+esc(it.text)+'</span></span>'+(cls==="done"?'<span class="donetag">✓</span>':'')+
       (cls!=="done"&&cls!=="cur"?'<span class="runact"><button class="btn sm" data-runend="'+it.id+'" title="Move this item to the end of the meeting">⤵ To end</button><button class="btn sm" data-runskip="'+it.id+'">'+(sk?'↩ Unskip':'⏭ Skip')+'</button></span>':'')+'</li>';
  });
  h+='</ul><div class="note">Tap any item to jump to it. Running late or someone missing? <b>⤵ To end</b> moves an item (e.g. a late keynote) to the end, and <b>⏭ Skip</b> leaves it out. Everyone connected sees the new order. The printed agenda keeps the original plan.</div></section>';
  return h;
}
function runGo(id){ S.run.by=runBy(); S.run.cur=id; if(id && !S.run.started[id]) S.run.started[id]=now(); tick(S.run); commit(); }
/* compact "Now" line for every role */
function renderAgendaLine(){
  var el=document.getElementById("agendaLine"); if(!el) return;
  var ss=scheduleStatus();
  if(!ss||L.role==="tmod"){ el.classList.remove("on"); el.innerHTML=""; return; }
  var who=whoFor(ss.c.cur.role);
  el.innerHTML='📋 <b>Now:</b> '+arole(ss.c.cur.role).n+(who?' ('+esc(who)+')':'')+(ss.c.next?' · <span class="muted">Next '+fmtHM(rt(ss.c.next))+' '+arole(ss.c.next.role).n+'</span>':'')+(ss.txt?' · <span class="'+ss.cls+'">'+ss.txt+'</span>':'');
  el.classList.add("on");
}
setInterval(function(){
  renderAgendaLine();
  var c=document.getElementById("tmClock"); if(c) c.textContent=new Date().toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"});
  var s=document.getElementById("tmSched"), ss=scheduleStatus(); if(s&&ss){ s.textContent=ss.txt; s.className="status "+ss.cls; }
},15000);

