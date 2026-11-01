/* ---------- projector / screen-share view ---------- */
function projHTML(){
  var t=now(), run=runningList(), ss=scheduleStatus(), tm=document.querySelector(".logo img").src, co=document.querySelector(".logo.co img").src, main="", cls="";
  if(run.length){ var x=run[0], sec=elapsed(x.r,t), sg=signal(x.sid,sec,x.r); cls=sg||"sn";
    main='<div class="pj-lbl">'+esc(x.s.name)+'</div><div class="pj-name">'+esc(displayName(x.r,x.i))+'</div><div class="pj-clock">'+fmt(sec)+'</div><div class="pj-sig">'+(x.r.paused?"⏸ Paused":sg?sigLabel(sg,x.r):"&nbsp;")+'</div><div class="pj-sub">'+esc(limitsLine(x.sid,x.r))+'</div>';
  } else if(S.vote.state==="shown"){
    main='<div class="pj-lbl">🏆 Award winners</div>'+VCATS.map(function(c){ var w=tally(c.k).winners; return w.length?'<div class="pj-win"><span>'+esc(c.n)+'</span><b>'+esc(w.map(function(z){return z.name;}).join(" & "))+'</b></div>':''; }).join("");
  } else if(S.cur&&S.cur.id&&topicById(S.cur.id)&&!topicById(S.cur.id).used){ var tp=topicById(S.cur.id);
    main='<div class="pj-lbl">Table Topic</div><div class="pj-topic">'+esc(tp.text)+'</div>';
  } else if(ss){ var c=ss.c, who=whoFor(c.cur.role);
    main='<div class="pj-lbl">Now</div><div class="pj-name">'+esc(arole(c.cur.role).n)+'</div>'+(who?'<div class="pj-who">'+esc(who)+'</div>':'')+'<div class="pj-sub">'+esc(String(c.cur.text||"").split(" — ")[0])+'</div>'+(c.next?'<div class="pj-next">Next · '+esc(fmtHM(rt(c.next)))+' '+esc(arole(c.next.role).n)+(whoFor(c.next.role)?' · '+esc(whoFor(c.next.role)):'')+'</div>':'');
  } else {
    main='<div class="pj-lbl">Welcome to</div><div class="pj-name">'+esc(S.agenda.title||GROUP)+'</div><div class="pj-who">Speechcraft'+(S.meta.week?' · '+esc(S.meta.week):'')+'</div><div class="pj-sub">'+esc(fmtDate(S.meta.date)||"")+'</div>'+(guestLink()?'<div class="pj-guest">'+qrSvg(guestLink())+'<div>👋 Guests: scan to check in</div></div>':'');
  }
  var foot=S.gram.wotd?'<div class="pj-wotd"><span>Word of the Day</span><b>'+esc(S.gram.wotd)+'</b>'+(S.gram.meaning?'<i>'+esc(S.gram.meaning)+'</i>':'')+'</div>':'';
  return '<div class="pj-head"><img src="'+tm+'" alt=""><div>'+esc(GROUP)+(S.meta.week?' · '+esc(S.meta.week):'')+'</div><img class="r" src="'+co+'" alt=""></div><div class="pj-main '+cls+'">'+main+'</div>'+foot+
    '<div class="pj-ctl"><button class="btn" data-pjfull>⛶ Full screen</button><button class="btn" data-pjclose>✕ Close</button></div>';
}
var projSig="";
function renderProj(){ var el=document.getElementById("proj"); if(!el.classList.contains("on")) return; var h=projHTML(); if(h!==projSig){ el.innerHTML=h; projSig=h; } }
function openProj(){ projSig=""; var el=document.getElementById("proj"); el.classList.add("on"); renderProj(); try{ if(el.requestFullscreen) el.requestFullscreen().catch(function(){}); }catch(e){} }
function closeProj(){ document.getElementById("proj").classList.remove("on"); try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){} }
document.getElementById("proj").addEventListener("click",function(e){
  if(e.target.closest("[data-pjclose]")) closeProj();
  else if(e.target.closest("[data-pjfull]")){ var el=document.getElementById("proj"); try{ if(document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen(); }catch(err){} }
});
document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&document.getElementById("proj").classList.contains("on")&&!document.fullscreenElement) closeProj(); });
document.getElementById("view").addEventListener("click",function(e){ if(e.target.closest("#projOpen")) openProj(); });
setInterval(renderProj,1000);
document.getElementById("projBtn").addEventListener("click",openProj);
