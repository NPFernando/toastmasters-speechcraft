/* ---------- voting ---------- */
function renderVoteModal(){
  var st=S.vote.state, h='<h3>🗳 Vote</h3>';
  if(st!=="open"){ h+='<p class="muted">'+voteStateText()+'.</p>'; }
  else {
    h+='<p class="muted" style="margin-top:0">One vote per category on this device. You can change your vote until voting closes.</p>';
    VCATS.forEach(function(c){
      var cands=c.c(), mine=myVote(c.k);
      h+='<div class="wcard"><b>'+c.n+'</b>'+(mine?' <span class="ok">✓</span>':'')+'<div class="chips" style="margin-top:8px">'+
        (cands.length?cands.map(function(p){ return '<button class="chip'+(nkey(mine)===nkey(p.name)?' active':'')+'" data-vcat="'+c.k+'" data-vname="'+esc(p.name)+'">'+esc(p.name)+(p.sub?'<span class="c">'+esc(p.sub)+'</span>':'')+'</button>'; }).join(""):'<span class="muted">No one to vote for yet.</span>')+'</div></div>';
    });
  }
  h+='<div style="text-align:right;margin-top:10px"><button class="btn" id="voteClose">Done</button></div>';
  document.getElementById("voteBox").innerHTML=h;
}
function openVote(){ renderVoteModal(); document.getElementById("voteModal").classList.add("on"); }
function renderVoteBar(){
  var el=document.getElementById("voteBar");
  if(S.vote.state!=="open"){ el.classList.remove("on"); return; }
  var done=VCATS.filter(function(c){return myVote(c.k);}).length;
  el.innerHTML='🗳 <b>Voting is open</b> · '+done+' of '+VCATS.length+' done <button class="btn sm">'+(done===VCATS.length?"Change vote":"Vote now")+'</button>';
  el.classList.add("on");
}
function winnersHTML(){
  var h='<div class="winners"><h2>🏆 Congratulations!</h2>';
  VCATS.forEach(function(c){ var t=tally(c.k); h+='<div class="wcat"><div class="saved">'+c.n+'</div><div class="wname">'+(t.winners.length?t.winners.map(function(w){return esc(w.name);}).join(" &amp; "):'—')+'</div>'+(t.winners.length?'<div class="saved">'+t.winners[0].n+' vote'+(t.winners[0].n===1?'':'s')+(t.winners.length>1?' each (tie)':'')+'</div>':'')+'</div>'; });
  return h+'</div>';
}
function maybeShowWinners(force){
  if(S.vote.state!=="shown") return;
  if(!force && L.seenWin===S.vote.u) return;
  L.seenWin=S.vote.u; saveL();
  document.getElementById("winBox").innerHTML=winnersHTML()+'<div style="text-align:center;margin-top:14px"><button class="btn primary big1" id="winClose">Close</button></div>';
  document.getElementById("winModal").classList.add("on");
}
function setVoteState(st){ S.vote.state=st; tick(S.vote); commit(); }

