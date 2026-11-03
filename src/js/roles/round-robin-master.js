/* ---------- Round Robin Master ---------- */
function rrById(id){ return S.rrq.find(function(q){return q.id===id;}); }
function rrHTML(){
  var cur=rrById(S.rrcur.id), rem=S.rrq.filter(function(q){return !q.used;}), used=S.rrq.filter(function(q){return q.used;});
  var h='<section class="card">';
  if(cur){
    var mine=S.rows.rr.filter(function(r){return r.qid===cur.id;}), stOf={};
    mine.forEach(function(r){ var k=nkey(r.name), st=rowState(r); if(!stOf[k]||st==="running"||(st==="done"&&stOf[k].st!=="running")) stOf[k]={st:st,r:r}; });
    var answered=Object.keys(stOf), nDone=answered.filter(function(k){return stOf[k].st==="done";}).length, live=mine.find(function(r){return rowState(r)==="running";});
    var pool=rrPool(), left=pool.filter(function(n){return answered.indexOf(nkey(n))<0;});
    h+='<div class="curtopic"><div class="lbl">Round Robin question</div><div class="txt">'+esc(cur.text)+'</div>'+
       (S.rrcur.last?'<div class="rrpick" aria-live="polite">🎲 <b>'+esc(S.rrcur.last)+'</b></div>':'')+
       '<div class="row"><button class="btn go big1" id="rrRandom"'+(left.length?'':' disabled')+'>🎲 Pick someone at random</button><button class="btn" id="rrShow">📺 Show on screen</button></div>'+
       '<div class="row" style="margin-top:6px"><button class="btn sm" id="rrShuffleAll"'+(left.length>1?'':' disabled')+' title="Queue everyone who hasn’t had a turn on the Timer, in a random order">🔀 Queue everyone left in random order</button>'+
       '<label class="tgl"><input type="checkbox" id="rrHere"'+(rrHereOnly()?' checked':'')+'> <span>Only people here (checked in or connected)</span></label></div>'+
       '<div class="saved" style="margin-top:6px">'+(pool.length?(left.length?(pool.length-left.length)+' of '+pool.length+' have had a turn · '+left.length+' to go':'🎉 Everyone has had a turn'):'No one '+(rrHereOnly()?'checked in or connected yet — untick “Only people here”':'on the member list yet'))+'</div></div>';
    var people=uniq(pool.concat(answered.map(function(k){ var r=mine.find(function(x){return nkey(x.name)===k;}); return r?r.name:k; })));
    h+='<div class="rrstat" aria-live="polite">'+(live?'🎙 <b>'+esc(live.name)+'</b> is speaking — the Timer has started them':'Waiting for the Timer')+' · ✓ '+nDone+' answered'+(answered.length-nDone-(live?1:0)>0?' · ⏳ '+(answered.length-nDone-(live?1:0))+' queued':'')+'</div>';
    h+='<h2 class="sec">Participants <span class="cnt">tap a name to queue them on the Timer · ⏳ queued · 🎙 speaking · ✓ done</span></h2><div class="chips">'+
       (people.length?people.map(function(n){ var a=answered.indexOf(nkey(n))>=0; return '<button class="chip'+(a?' active':'')+(a&&stOf[nkey(n)].st==="running"?' rrlive':'')+'" data-rrcall="'+esc(n)+'">'+(a?{running:'🎙 ',done:'✓ ',idle:'⏳ '}[stOf[nkey(n)].st]||'':'')+esc(n)+(a&&stOf[nkey(n)].st==="done"?' <small>'+fmt(elapsed(stOf[nkey(n)].r,now()))+'</small>':'')+'</button>'; }).join(""):'<span class="muted">The Coordinator\'s member list appears here.</span>')+
       '</div><div class="row" style="margin-top:8px"><input class="t" id="rrGuest" list="roster" autocomplete="off" placeholder="Guest name"><button class="btn" id="rrGuestAdd">+ Queue</button></div>';
  } else {
    h+='<div class="curtopic empty"><div style="margin-bottom:10px">'+(rem.length?'Ready when you are: start the Round Robin with your question.':'Type the Round Robin question below (usually one question for everyone).')+'</div>'+(rem.length?'<button class="btn go big1" id="rrNext">▶ Start the Round Robin</button>':'')+'</div>';
  }
  h+='<h2 class="sec">Prepare the question <span class="cnt">usually one question for everyone; add more only if you want to change it part-way</span></h2><textarea class="t" id="rrInput" placeholder="One question per line, e.g.\nWhat is one thing that made you smile this week?"></textarea><div class="row" style="margin-top:8px"><button class="btn primary" id="rrAdd">+ Add questions</button><span class="saved">'+rem.length+' remaining · '+used.length+' asked</span></div>';
  h+='<ul class="tlist">'+S.rrq.map(function(q,i){ return '<li data-rqid="'+q.id+'" class="'+(q.id===S.rrcur.id?'cur':'')+'"><span class="n">'+(i+1)+'</span><span style="flex:1'+(q.used&&q.id!==S.rrcur.id?';color:var(--muted)':'')+'">'+esc(q.text)+'</span><button class="btn sm" data-rqact="pick">Ask</button><button class="iconbtn" data-rqact="del">✕</button></li>'; }).join("")+'</ul>';
  return h+'</section>';
}
function rrPick(id){ var q=rrById(id); if(!q) return; q.used=true; tick(q); S.rrcur.id=id; tick(S.rrcur); commit(); if(document.getElementById("stage").classList.contains("on")) renderStage(); }
function rrNextQ(){ var nx=S.rrq.find(function(q){return !q.used;}); if(nx) rrPick(nx.id); else alert("No more questions."); }
/* who can be picked: the member list (and names used before), optionally only people here today */
function rrHereOnly(){ if(L.rrHere!=null) return !!L.rrHere; return uniq(memberNames().concat(S.names)).some(function(n){ return present(n)||isOnlineName(n); }); }
function rrPool(){ var all=uniq(memberNames().concat(S.names)); return rrHereOnly()?all.filter(function(n){ return present(n)||isOnlineName(n); }):all; }
function rrLeft(){ var cur=rrById(S.rrcur.id); if(!cur) return []; var done=S.rows.rr.filter(function(r){return r.qid===cur.id;}).map(function(r){return nkey(r.name);}); return rrPool().filter(function(n){ return done.indexOf(nkey(n))<0; }); }
function rrRandom(){ var left=rrLeft(); if(!left.length){ alert("Everyone has had a turn."); return null; } var n=left[Math.floor(Math.random()*left.length)]; rrCall(n); return n; }
function rrShuffleAll(){ var left=rrLeft().slice(); for(var i=left.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=left[i]; left[i]=left[j]; left[j]=t; } left.forEach(function(n){ rrCall(n,true); }); if(left.length){ S.rrcur.last=left[0]; tick(S.rrcur); commit(); } }
function rrCall(name,quiet){
  var cur=rrById(S.rrcur.id); if(!cur||!name) return;
  if(!quiet){ S.rrcur.last=name; tick(S.rrcur); }
  var ak="rr:"+cur.id+":"+nkey(name); if(S.rows.rr.some(function(r){return r.ak===ak;})) return;
  var r=newRow("rr",name); r.ak=ak; r.qid=cur.id; S.rows.rr.push(r); addName(S,name); commit();
}

(function(){ document.getElementById("view").addEventListener("change",function(e){ if(e.target.id==="rrHere"&&L.role==="rrm"){ L.rrHere=e.target.checked; saveL(); renderAll(); } }); })();
