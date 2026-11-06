/* ---------- Round Robin Master ---------- */
function rrById(id){ return S.rrq.find(function(q){return q.id===id;}); }
/* One question for everyone. The Round Robin Master adds people to the Timer's queue one at a time
   (tap a name or 🎲 pick at random); a queued person can be taken off the queue again. */
function rrHidden(n){ return (S.rrcur.hide||[]).indexOf(nkey(n))>=0; }
function rrHTML(){
  var cur=rrById(S.rrcur.id), h='<section class="card">';
  if(!cur){
    h+='<div class="curtopic empty"><div class="lbl">Round Robin question</div><div style="margin:6px 0 10px">Everyone answers the same question.</div>'+
       '<textarea class="t" id="rrQ" rows="2" aria-label="Round Robin question" placeholder="e.g. What is one thing that made you smile this week?">'+esc((S.rrq.filter(function(q){return !q.used;})[0]||{}).text||"")+'</textarea>'+
       '<div class="row" style="margin-top:8px"><button class="btn go big1" id="rrStart">▶ Start the Round Robin</button></div></div>';
    return h+'</section>';
  }
  var mine=S.rows.rr.filter(function(r){return r.qid===cur.id;}), stOf={};
  mine.forEach(function(r){ var k=nkey(r.name), st=rowState(r); if(!stOf[k]||st==="running"||(st==="done"&&stOf[k].st!=="running")) stOf[k]={st:st,r:r}; });
  var answered=Object.keys(stOf), nDone=answered.filter(function(k){return stOf[k].st==="done";}).length, live=mine.find(function(r){return rowState(r)==="running";});
  var nQ=answered.filter(function(k){return stOf[k].st==="idle";}).length;
  var pool=rrPool(), left=pool.filter(function(n){return answered.indexOf(nkey(n))<0;});
  h+='<div class="curtopic"><div class="lbl">Round Robin question · the same for everyone</div><div class="txt" id="rrQText">'+esc(cur.text)+'</div>'+
     (S.rrcur.last?'<div class="rrpick" aria-live="polite">🎲 <b>'+esc(S.rrcur.last)+'</b></div>':'')+
     '<div class="row"><button class="btn go big1" id="rrRandom"'+(left.length?'':' disabled')+'>🎲 Pick next at random</button><button class="btn" id="rrShow">📺 Show on screen</button><button class="linkbtn" id="rrEdit">Edit question</button></div>'+
     '<div class="saved" style="margin-top:6px">'+(pool.length?(left.length?(pool.length-left.length)+' of '+pool.length+' have had a turn or are queued · '+left.length+' to go':'🎉 Everyone has had a turn'):'No one '+(rrHereOnly()?'checked in or connected yet — untick “Only people here”':'on the agenda or member list yet'))+'</div></div>';
  h+='<div class="rrstat" aria-live="polite">'+(live?'🎙 <b>'+esc(live.name)+'</b> is speaking':'Waiting for the Timer')+' · ✓ '+nDone+' done'+(nQ?' · ⏳ '+nQ+' queued':'')+'</div>';
  var people=uniq(pool.concat(mine.map(function(r){return r.name;})));
  var memberK={}; memberNames().forEach(function(n){ memberK[nkey(n)]=1; });
  h+='<h2 class="sec">Participants <span class="cnt">tap a name to add them to the Timer’s queue · tap ⏳ again to take them off</span></h2><div class="chips">'+
     (people.length?people.map(function(n){ var k=nkey(n), x=stOf[k], st=x?x.st:"";
       var lbl={running:'🎙 ',done:'✓ ',idle:'⏳ '}[st]||'';
       var tip=st==="idle"?"Queued — tap to take off the queue":st==="running"?"Speaking now":st==="done"?"Done":"Tap to add to the Timer’s queue";
       return '<span class="chip word rrchip'+(x?' active':'')+(st==="running"?' rrlive':'')+'"><button class="kname" data-rrcall="'+esc(n)+'" title="'+tip+'"'+(st==="running"||st==="done"?' aria-disabled="true"':'')+'>'+lbl+esc(n)+(st==="done"?' <small>'+fmt(elapsed(x.r,now()))+'</small>':'')+'</button>'+
         (!memberK[k]&&!x?'<button data-rrforget="'+esc(n)+'" title="Remove this name from the list" aria-label="Remove '+esc(n)+'">✕</button>':'')+'</span>'; }).join(""):'<span class="muted">The Coordinator\'s member list appears here.</span>')+
     '</div><div class="row" style="margin-top:8px"><input class="t" id="rrGuest" list="roster" autocomplete="off" placeholder="Guest name"><button class="btn" id="rrGuestAdd">+ Add to queue</button>'+
     '<label class="tgl"><input type="checkbox" id="rrHere"'+(rrHereOnly()?' checked':'')+'> <span>Only people here (checked in or connected)</span></label></div>';
  h+='<div class="row" style="margin-top:14px"><button class="linkbtn" id="rrReset" title="Clear the question to start a new Round Robin">Finish this Round Robin and start a new one</button></div>';
  return h+'</section>';
}
/* who can be picked: the member list (and names used before), optionally only people here today */
function rrHereOnly(){ if(L.rrHere!=null) return !!L.rrHere; return uniq(meetingNames().concat(S.names)).some(function(n){ return present(n)||isOnlineName(n); }); }
function rrPool(){ var all=uniq(meetingNames().concat(S.names)).filter(function(n){return !rrHidden(n);}); return rrHereOnly()?all.filter(function(n){ return present(n)||isOnlineName(n); }):all; }
function rrLeft(){ var cur=rrById(S.rrcur.id); if(!cur) return []; var done=S.rows.rr.filter(function(r){return r.qid===cur.id;}).map(function(r){return nkey(r.name);}); return rrPool().filter(function(n){ return done.indexOf(nkey(n))<0; }); }
function rrRandom(){ var left=rrLeft(); if(!left.length){ alert("Everyone has had a turn."); return null; } var n=left[Math.floor(Math.random()*left.length)]; rrCall(n); return n; }
function rrCall(name,quiet){
  var cur=rrById(S.rrcur.id); if(!cur||!name) return;
  var ex=S.rows.rr.find(function(r){return r.qid===cur.id&&nkey(r.name)===nkey(name);});
  if(ex){ if(!quiet&&rowState(ex)==="idle"){ if(S.rrcur.last&&nkey(S.rrcur.last)===nkey(name)){ S.rrcur.last=""; tick(S.rrcur); } removeItem(["rows","rr"],ex.id,name+" (off the queue)"); } return; }
  var ak="rr:"+cur.id+":"+nkey(name);
  if(rrHidden(name)){ S.rrcur.hide=S.rrcur.hide.filter(function(k){return k!==nkey(name);}); tick(S.rrcur); }
  if(!quiet){ S.rrcur.last=name; tick(S.rrcur); }
  var r=newRow("rr",name); r.ak=ak; r.qid=cur.id; S.rows.rr.push(r); addName(S,name); commit();
}

(function(){ document.getElementById("view").addEventListener("change",function(e){ if(e.target.id==="rrHere"&&L.role==="rrm"){ L.rrHere=e.target.checked; saveL(); renderAll(); } }); })();
function rrStart(text){ text=String(text||"").trim(); if(!text){ var el=document.getElementById("rrQ"); if(el) el.focus(); return; } var q={id:uid(),text:text,used:true,ord:maxOrd(S.rrq)+1,u:now()}; S.rrq.push(q); S.rrcur.id=q.id; S.rrcur.last=""; tick(S.rrcur); commit(); }
function rrForget(name){ var hid=(S.rrcur.hide||[]).slice(); if(hid.indexOf(nkey(name))<0) hid.push(nkey(name)); S.rrcur.hide=hid; tick(S.rrcur); commit(); offerUndo("“"+name+"” removed from the list",function(){ S.rrcur.hide=(S.rrcur.hide||[]).filter(function(k){return k!==nkey(name);}); tick(S.rrcur); }); }
