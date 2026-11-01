/* ---------- General Evaluator ---------- */
function reportsSummary(){
  var t=now(), out=[];
  var tim=[]; SESSIONS.forEach(function(s){ var d=S.rows[s.id].filter(function(r){return rowState(r)==="done";}); if(!d.length) return; var ok=d.filter(function(r){return status(s.id,r,t).ok;}).length; tim.push(s.name+": "+ok+"/"+d.length+" on time"); });
  out.push(["⏱ Timer",assigned("timer")||S.people.timer,tim.join(" · ")||"No times yet"]);
  var ah=S.ahRows.map(function(r){return r.name+" "+ahTotal(r);}); out.push(["🔢 Ah-Counter",assigned("ah")||S.people.ah,ah.join(" · ")||"No counts yet"]);
  var gw=S.gramRows.reduce(function(s,r){return s+(r.w||0);},0); out.push(["📝 Grammarian",assigned("gram")||S.people.gram,(S.gram.wotd?"Word of the Day “"+S.gram.wotd+"” used "+gw+"×":"No Word of the Day yet")+(S.gramRows.length?" · notes on "+S.gramRows.length+" speakers":"")]);
  return out;
}
function voteControlHTML(canOpen,canReveal){
  var st=S.vote.state, h='<div class="selcard"><div class="hd"><b>🗳 Voting</b><span class="pill">'+votersCount()+' voted</span></div><div style="margin-bottom:8px">'+voteStateText()+'</div><div class="row">';
  if(canOpen){ if(st==="closed"||st==="done") h+='<button class="btn go" data-vote-set="open">'+(st==="done"?"Re-open voting":"Open voting")+'</button>'; if(st==="open") h+='<button class="btn stop" data-vote-set="done">Close voting</button>'; }
  if(canReveal){ if(st==="done") h+='<button class="btn go big1" data-vote-set="shown">🏆 Reveal winners</button>'; if(st==="shown") h+='<button class="btn" id="showWinners">Show winners again</button>'; if(st==="open") h+='<span class="saved">The General Evaluator closes voting, then you can reveal the winners.</span>'; }
  h+='<button class="btn" id="openVote">My vote</button></div></div>';
  return h;
}
function geHTML(){
  var h='<section class="card">'+voteControlHTML(true,false);
  h+='<h2 class="sec">📣 Call for reports</h2><div class="sumlist">'+reportsSummary().map(function(x){ return '<div><b>'+x[0]+'</b>'+(x[1]?' · '+esc(x[1]):'')+'<div class="muted">'+esc(x[2])+'</div></div>'; }).join("")+'</div><div class="row" style="margin-top:6px"><button class="btn" id="geReport">📄 Open full report</button>'+copyBtn("ge")+'</div>';
  h+='<h2 class="sec">🗣 Evaluations</h2><table class="sumtable"><thead><tr><th>Speaker</th><th>Type</th><th>Assigned</th><th>Status</th></tr></thead><tbody>';
  var rows=preparedSpeakers().map(function(n){return [n,"ps"];}).concat(ttSpeakers().map(function(n){return [n,"tt"];}));
  if(!rows.length) h+='<tr><td colspan="4" class="muted">No speakers yet.</td></tr>';
  rows.forEach(function(x){ var by=S.evals.filter(function(e){return e.kind===x[1]&&nkey(e.speaker)===nkey(x[0])&&(e.done||e.state==="writing");}).map(function(e){return e.by+" — "+evalStatusLabel(e);}); h+='<tr><td>'+esc(x[0])+(x[1]==="ps"&&speechTitle(x[0])?'<div class="spt" style="padding:0">“'+esc(speechTitle(x[0]))+'”</div>':'')+'</td><td>'+(x[1]==="ps"?"Prepared":"Table Topics")+'</td><td>'+esc(anyEvaluatorOf(x[1],x[0])||"—")+'</td><td>'+(by.length?esc(by.join("; ")):'<span class="muted">—</span>')+'</td></tr>'; });
  h+='</tbody></table><div class="note">🔒 Evaluations are encrypted: only each speaker can read their own.</div>';
  h+='<h2 class="sec">🧭 My notes on the meeting</h2><label class="f evbox"><b>What went well</b><textarea class="t" data-ge="good" rows="3" placeholder="e.g. started on time, warm welcome, clear introductions">'+esc(S.genotes.good)+'</textarea></label>'+
     '<label class="f evbox"><b>What could be better</b><textarea class="t" data-ge="improve" rows="3" placeholder="e.g. Table Topics ran over; speak closer to the microphone">'+esc(S.genotes.improve)+'</textarea></label>';
  return h+'</section>';
}

