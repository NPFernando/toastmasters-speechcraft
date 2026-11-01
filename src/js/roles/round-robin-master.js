/* ---------- Round Robin Master ---------- */
function rrById(id){ return S.rrq.find(function(q){return q.id===id;}); }
function rrHTML(){
  var cur=rrById(S.rrcur.id), rem=S.rrq.filter(function(q){return !q.used;}), used=S.rrq.filter(function(q){return q.used;});
  var h='<section class="card">';
  if(cur){
    var answered=S.rows.rr.filter(function(r){return r.qid===cur.id;}).map(function(r){return nkey(r.name);});
    h+='<div class="curtopic"><div class="lbl">Current question</div><div class="txt">'+esc(cur.text)+'</div><div class="row"><button class="btn" id="rrShow">📺 Show on screen</button><button class="btn" id="rrNext">Next question ▶</button></div></div>';
    var people=uniq(memberNames().concat(S.names));
    h+='<h2 class="sec">Participants <span class="cnt">tap a name to queue them on the Timer (20-second bell)</span></h2><div class="chips">'+
       (people.length?people.map(function(n){ var a=answered.indexOf(nkey(n))>=0; return '<button class="chip'+(a?' active':'')+'" data-rrcall="'+esc(n)+'">'+(a?'✓ ':'')+esc(n)+'</button>'; }).join(""):'<span class="muted">The Coordinator\'s member list appears here.</span>')+
       '</div><div class="row" style="margin-top:8px"><input class="t" id="rrGuest" list="roster" autocomplete="off" placeholder="Guest name"><button class="btn" id="rrGuestAdd">+ Queue</button></div>';
  } else {
    h+='<div class="curtopic empty"><div style="margin-bottom:10px">'+(rem.length?'Start with the first question.':'Add your Round Robin questions below.')+'</div>'+(rem.length?'<button class="btn go big1" id="rrNext">▶ First question</button>':'')+'</div>';
  }
  h+='<h2 class="sec">Prepare questions</h2><textarea class="t" id="rrInput" placeholder="One question per line, e.g.\nWhat is one thing that made you smile this week?"></textarea><div class="row" style="margin-top:8px"><button class="btn primary" id="rrAdd">+ Add questions</button><span class="saved">'+rem.length+' remaining · '+used.length+' asked</span></div>';
  h+='<ul class="tlist">'+S.rrq.map(function(q,i){ return '<li data-rqid="'+q.id+'" class="'+(q.id===S.rrcur.id?'cur':'')+'"><span class="n">'+(i+1)+'</span><span style="flex:1'+(q.used&&q.id!==S.rrcur.id?';color:var(--muted)':'')+'">'+esc(q.text)+'</span><button class="btn sm" data-rqact="pick">Ask</button><button class="iconbtn" data-rqact="del">✕</button></li>'; }).join("")+'</ul>';
  return h+'</section>';
}
function rrPick(id){ var q=rrById(id); if(!q) return; q.used=true; tick(q); S.rrcur.id=id; tick(S.rrcur); commit(); if(document.getElementById("stage").classList.contains("on")) renderStage(); }
function rrNextQ(){ var nx=S.rrq.find(function(q){return !q.used;}); if(nx) rrPick(nx.id); else alert("No more questions."); }
function rrCall(name){
  var cur=rrById(S.rrcur.id); if(!cur||!name) return;
  var ak="rr:"+cur.id+":"+nkey(name); if(S.rows.rr.some(function(r){return r.ak===ak;})) return;
  var r=newRow("rr",name); r.ak=ak; r.qid=cur.id; S.rows.rr.push(r); addName(S,name); commit();
}

