/* ---------- voting ---------- */
function renderVoteModal(){
  var st=S.vote.state, h='<h3>🗳 Vote</h3>';
  if(st!=="open"){ h+='<p class="muted">'+voteStateText()+'.</p>'; }
  else {
    h+='<p class="muted" style="margin-top:0">Select the same participant ID on every device. Renaming a participant does not create another ballot. IDs distinguish people with the same name; selection is not authentication.</p>';
    h+=voterIdentityHTML();
    VCATS.forEach(function(c){
      var cands=c.c(), mine=myVote(c.k);
      h+='<div class="wcard"><b>'+c.n+'</b>'+(mine?' <span class="ok">✓</span>':'')+'<div class="chips" style="margin-top:8px">'+
        (cands.length?cands.map(function(p){ return '<button class="chip'+(nkey(mine)===nkey(p.name)?' active':'')+'" '+(!voteIdentity()||legacyBallots().length?' disabled':'')+' data-vcat="'+c.k+'" data-vname="'+esc(p.name)+'">'+esc(p.name)+(p.sub?'<span class="c">'+esc(p.sub)+'</span>':'')+'</button>'; }).join(""):'<span class="muted">No one to vote for yet.</span>')+'</div></div>';
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


function voterIdentityHTML(){
 var people=votingPeople(),chosen=voteIdentity(),d=L.voterDraft||{};
 return '<label class="f"><b>Your participant identity</b><select class="t" id="voterIdentity"><option value="">Select your identity…</option>'+people.map(function(p){return '<option value="'+esc(p.id)+'"'+(p.id===chosen?' selected':'')+'>'+esc(p.name+' · '+p.label+' · ID '+p.id)+'</option>';}).join('')+'</select></label><p class="saved">Use the same ID across devices. For a roster name correction, ask the Coordinator; the ID stays the same.</p>'+(legacyBallots().length?'<p class="note">Older name/device ballots exist. The General Evaluator must start a new voting round before ID-based voting.</p>':'')+'<details><summary>Not listed, or need a separate identity with the same name?</summary><label class="f"><b>Full name</b><input class="t" id="newVoterName" value="'+esc(d.name||'')+'"></label><label class="f"><b>Distinguishing label (club or affiliation)</b><input class="t" id="newVoterLabel" value="'+esc(d.label||'')+'"></label><button class="btn" id="registerVoter">Create participant ID</button><p class="saved">Create an identity once; select that existing ID on your other devices.</p></details>';
}
(function(){var box=document.getElementById('voteBox');
 box.addEventListener('input',function(e){if(e.target.id==='newVoterName'||e.target.id==='newVoterLabel'){L.voterDraft=L.voterDraft||{};L.voterDraft[e.target.id==='newVoterName'?'name':'label']=e.target.value;saveL();}});
 box.addEventListener('change',function(e){if(e.target.id==='voterIdentity'){L.voterId=e.target.value;saveL();renderVoteModal();}});
 box.addEventListener('click',function(e){if(!e.target.closest('#registerVoter')||S.vote.state!=='open')return;var name=document.getElementById('newVoterName').value.trim(),label=document.getElementById('newVoterLabel').value.trim();if(!name){alert('Enter a full name.');return;}if(votingPeople().some(function(p){return nkey(p.name)===nkey(name);})&&!label){alert('This name is already listed. Select the existing ID, or enter a distinguishing label for another person.');return;}var same=S.voterPeople.find(function(p){return nkey(p.name)===nkey(name)&&nkey(p.label)===nkey(label)&&!p.archived;});var p=same||{id:'guest:'+uid(),name:name,label:label,ord:maxOrd(S.voterPeople)+1,u:now()};if(!same)S.voterPeople.push(p);L.voterId=p.id;L.voterDraft={};saveL();commit();renderVoteModal();});
})();
