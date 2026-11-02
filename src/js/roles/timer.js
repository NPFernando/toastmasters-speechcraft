/* ---------- Timer view ---------- */
function limitsHTML(s){
  var L2=S.limits[s.id];
  if(s.type==="rep") return '<div class="limits"><span class="saved" style="align-self:center">Each report has its own time: Timer and Ah-Counter 1 min (green 0:30 · amber 0:45 · red 1:00), Grammarian 2 min (green 1:00 · amber 1:30 · red 2:00). The Coordinator\'s role players fill this list in.</span></div>';
  if(s.type==="rr") return '<div class="limits"><div class="lim"><span>🔔</span><span>Bell</span><input data-lim="b" aria-label="Bell at (m:ss)" value="'+fmt(L2.b)+'"></div><span class="saved" style="align-self:center">Within time up to the bell, Overtime after it. The speaker’s own phone rings the bell.</span><label class="tgl" style="align-self:center"><input type="checkbox" id="timerBell"'+(timerBellOn()?' checked':'')+'> <span>🔔 Also ring on this device</span></label></div>';
  return '<div class="limits">'+
    '<div class="lim"><i class="shp" style="color:var(--g)" aria-hidden="true">●</i><span>Green</span><input data-lim="g" aria-label="Green at (m:ss)" value="'+fmt(L2.g)+'"></div>'+
    '<div class="lim"><i class="shp" style="color:var(--a)" aria-hidden="true">▲</i><span>Amber</span><input data-lim="a" aria-label="Amber at (m:ss)" value="'+fmt(L2.a)+'"></div>'+
    '<div class="lim"><i class="shp" style="color:var(--r)" aria-hidden="true">■</i><span>Red</span><input data-lim="r" aria-label="Red at (m:ss)" value="'+fmt(L2.r)+'"></div></div>';
}
function startLabel(sid){
  var q=document.getElementById("qname"), typed=q&&q.value.trim(), nx=firstQueued(sid);
  if(!typed&&nx) return "▶ Start next: "+esc(displayName(nx,S.rows[sid].indexOf(nx)));
  return "▶ Start speaker";
}
function timeStats(sids,t){
  var speak=0,n=0,from=null,to=null;
  sids.forEach(function(sid){ S.rows[sid].forEach(function(r){
    if(rowState(r)==="idle") return; speak+=elapsed(r,t)||0; n++;
    if(r.start!=null){ var e=r.end!=null?r.end:t; if(from==null||r.start<from) from=r.start; if(to==null||e>to) to=e; }
  }); });
  return {speak:speak,n:n,from:from,to:to,span:from!=null?Math.round((to-from)/1000):null};
}
function statsText(ts,label){ if(!ts.n) return ""; var s="Speaking time "+fmtLong(ts.speak); if(ts.span!=null) s+=" · "+label+" "+clock(ts.from)+" – "+clock(ts.to)+" ("+fmtLong(ts.span)+")"; return s; }
function timerHTML(){
  var s=sessionOf(L.tab)||SESSIONS[0], rows=S.rows[s.id], t=now();
  var h='<nav class="tabs">'+SESSIONS.map(function(x){ var rs=S.rows[x.id], run=rs.some(function(r){return rowState(r)==="running";});
      return '<button class="tab'+(x.id===s.id?' active':'')+'" data-tab="'+x.id+'">'+x.name+'<span class="cnt">('+rs.length+')</span>'+(run?'<span class="dot"></span>':'')+'</button>'; }).join("")+'</nav>';
  h+='<section class="card panel">'+limitsHTML(s)+
    '<div class="quick"><input class="t" id="qname" list="roster" autocomplete="off" placeholder="Speaker name (optional, you can add it later)">'+
    '<button class="btn go" id="qstart">'+startLabel(s.id)+'</button>'+
    '<button class="btn" id="qplan" title="Add speakers now and start them later. Separate several names with commas.">+ Add to list</button>'+
    '<button class="btn" id="qadd" title="Forgot to time someone? Add them and type their time">✎ Add time manually</button></div>';
  h+='<table class="log"><thead><tr><th class="n">#</th><th>Name</th><th>Timer</th><th>Time</th><th>Status</th><th></th></tr></thead><tbody>';
  if(!rows.length) h+='<tr><td colspan="6" class="empty">No speakers yet. Plan ahead with <b>+ Add to list</b> (e.g. <i>Nimal, Kasun, Amali</i>), or press <b>Start speaker</b> when someone begins.</td></tr>';
  var nx=firstQueued(s.id);
  rows.forEach(function(r,i){
    var st=rowState(r), sec=elapsed(r,t), sg=signal(s.id,sec,r), stx=status(s.id,r,t), isNext=st==="idle"&&r===nx;
    if(st==="idle"&&r.manual==null) stx={text:isNext?"Next up":"Waiting",cls:"st-queue"};
    var ctl= st==="running"?'<button class="btn sm" data-act="'+(r.paused?'resume':'pause')+'">'+(r.paused?'▶':'⏸')+'</button><button class="btn stop sm" data-act="stop">■ Stop</button>': st==="done"?'<span class="donetag">✓ Done</span>':'<button class="btn go sm" data-act="start">▶ Start</button>';
    var timeCell= st==="running"?'<div class="timebox '+sg+'" data-live="time">'+fmt(sec)+'</div>'
      :'<input class="timebox '+sg+'" data-edit="time" value="'+(sec==null?"":fmt(sec))+'" placeholder="m:ss" title="Type a time as m:ss to set or correct it">';
    h+='<tr data-id="'+r.id+'" class="'+(st==="idle"?"queued":"")+(isNext?" nextup":"")+'"><td class="n">'+(i+1)+'</td>'+
      '<td><input class="name" data-edit="name" list="roster" autocomplete="off" value="'+esc(r.name)+'" placeholder="Speaker '+(i+1)+' (add name)">'+(s.id==="ps"&&speechTitle(baseName(r.name))?'<div class="spt">“'+esc(speechTitle(baseName(r.name)))+'”'+(r.lim?' · '+fmt(r.lim.g)+'–'+fmt(r.lim.r):'')+'</div>':'')+'</td>'+
      '<td class="ctl">'+ctl+'</td><td class="tm">'+timeCell+'</td>'+
      '<td><span class="status '+stx.cls+'" data-live="status">'+esc(stx.text)+'</span>'+(r.manual!=null?'<span class="edited">'+(r.start==null?'✎ entered manually':'✎ edited')+'</span>':'')+'</td>'+
      '<td class="act">'+(st==="idle"?'<button class="iconbtn" data-act="up" title="Move up">↑</button><button class="iconbtn" data-act="down" title="Move down">↓</button>':'')+
      (st==="running"?'':'<button class="iconbtn" data-act="del" title="Remove this speaker">✕</button>')+'</td></tr>';
  });
  h+='</tbody></table>';
  var done=rows.filter(function(r){return rowState(r)==="done";}), ok=done.filter(function(r){return status(s.id,r,t).ok;}).length;
  h+='<div class="foot"><span class="saved">'+done.length+' timed · '+ok+' '+(s.type==="rr"?"within time":"qualified")+' '+copyBtn("timer")+'</span><span class="saved" id="panelStats">'+esc(statsText(timeStats([s.id],t),"ran"))+'</span></div></section>';
  return h;
}
var lastSig={};
function renderLive(){
  var el=document.getElementById("live");
  if(myRoles().indexOf("timer")<0){ el.classList.remove("on"); el.innerHTML=""; return; }
  var t=now(), h="", focusedId=null, a=document.activeElement;
  if(a&&a.dataset&&a.dataset.edit==="livename"){ focusedId=a.closest(".liveitem").dataset.id; }
  runningList().forEach(function(x){
    var sec=elapsed(x.r,t), sg=signal(x.sid,sec,x.r);
    h+='<div class="liveitem '+sg+'" data-sid="'+x.sid+'" data-id="'+x.r.id+'"><div class="clock" data-live="clock">'+fmt(sec)+'</div>'+
      '<div class="who"><input class="livename" data-edit="livename" list="roster" autocomplete="off" value="'+esc(x.r.name)+'" placeholder="Speaker '+(x.i+1)+' – type name"><span>'+x.s.name+' · <span data-live="next">'+nextSignalText(x.sid,sec,x.r)+'</span></span></div>'+
      '<span class="sigbanner" data-live="banner">'+bannerText(x.sid,sg)+'</span><span class="pill '+(sg||"sn")+'" data-live="pill">'+sigLabel(sg,x.r)+'</span>'+
      '<button class="btn" data-act="livepause" title="'+(x.r.paused?'Carry on timing':'Stop the clock for a moment, e.g. a microphone or Zoom problem')+'">'+(x.r.paused?'▶ Resume':'⏸ Pause')+'</button><button class="btn stop" data-act="livestop">■ Stop</button></div>';
  });
  if(focusedId && el.querySelector('.liveitem[data-id="'+focusedId+'"]') && h.indexOf('data-id="'+focusedId+'"')>=0) return; // don't disturb typing
  el.innerHTML=h; el.classList.toggle("on",!!h);
  el.querySelectorAll(".liveitem").forEach(function(it){ var r=findRow(it.dataset.sid,it.dataset.id); if(r&&lastSig[r.id]===undefined) lastSig[r.id]=signal(it.dataset.sid,elapsed(r,t),r); });
}
function flashItem(it){ it.classList.remove("flash"); void it.offsetWidth; it.classList.add("flash"); clearTimeout(it._ft); it._ft=setTimeout(function(){ it.classList.remove("flash"); },3200); }

