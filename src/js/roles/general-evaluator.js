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
  if(canOpen){ h+='<button class="btn" data-new-voting-round>Start new voting round</button>'; if(st==="closed"||st==="done") h+='<button class="btn go" data-vote-set="open">'+(st==="done"?"Re-open voting":"Open voting")+'</button>'; if(st==="open") h+='<button class="btn stop" data-vote-set="done">Close voting</button>'; }
  if(canReveal){ if(st==="done") h+='<button class="btn go big1" data-vote-set="shown">🏆 Reveal winners</button>'; if(st==="shown") h+='<button class="btn" id="showWinners">Show winners again</button>'; if(st==="open") h+='<span class="saved">The General Evaluator closes voting, then you can reveal the winners.</span>'; }
  h+='<button class="btn" id="openVote">My vote</button></div></div>';
  return h;
}
function geHTML(){
  var h='<section class="card">'+voteControlHTML(true,false)+geObservationsHTML()+geAgendaHTML()+actionsHTML();
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


/* Meeting observations are manual evidence, never inferred from a running timer. */
var GE_SECTIONS=[
  ["Before the meeting",[["ready","Room, equipment and agenda ready"],["team","Evaluation team confirmed and briefed"],["guests","Guests welcomed and meeting format explained"]]],
  ["Meeting opening",[["start","Meeting called to order on time"],["formalities","Scheduled opening formalities completed"],["handover","President introduced TMOD and handed over clearly"],["roles","GE, Timer, Ah-Counter and Grammarian introduced; roles/signals explained"]]],
  ["Round Robin",[["rrIntro","Master explained format, speaking order and timing"],["rrRule","Last-word handover rule explained, when used"],["rrParticipation","Everyone invited to participate"],["rrTiming","Timing signals followed and transitions kept moving"],["rrReturn","Master returned control to TMOD"]]],
  ["Speaking sessions",[["introductions","Prepared speakers, titles, objectives and evaluators introduced"],["transitions","Clear handovers between sessions and speakers"],["keynote","Scheduled educational presentation introduced and delivered"],["topics","Table Topics purpose and timing explained; questions clear and inclusive"]]],
  ["Evaluation and closing",[["reports","GE called scheduled evaluations and team reports"],["quality","Evaluations specific, balanced, encouraging and actionable"],["finish","Agenda kept to time and meeting formally adjourned"],["atmosphere","Supportive atmosphere and audience engagement"]]]
];
var GE_OPEN={};
function gePanel(key,label){ return '<details data-ge-panel="'+esc(key)+'"'+(GE_OPEN[key]?' open':'')+'><summary>'+esc(label)+'</summary>'; }
var GE_STATUS={yes:"Yes",partial:"Partly",no:"No",na:"Not applicable"};
function geField(key,label,type){ return '<label class="f evbox"><b>'+esc(label)+'</b><input class="t" type="'+(type||'text')+'" data-ge="'+esc(key)+'" value="'+esc(S.genotes[key]||'')+'"></label>'; }
function geSelect(key,label){ return '<label class="f evbox"><b>'+esc(label)+'</b><select class="t" data-ge="'+esc(key)+'"><option value="">Not observed</option>'+Object.keys(GE_STATUS).map(function(v){return '<option value="'+v+'"'+(S.genotes[key]===v?' selected':'')+'>'+GE_STATUS[v]+'</option>';}).join('')+'</select></label>'; }
function geObservationLines(){
  var out=[];
  GE_SECTIONS.forEach(function(section){ section[1].forEach(function(item){var k='check_'+item[0], v=S.genotes[k], note=S.genotes[k+'_note']; if(v||note) out.push(section[0]+' — '+item[1]+': '+(GE_STATUS[v]||'Not observed')+(note?' — '+note:''));}); });
  [['plannedStart','Scheduled start'],['actualStart','Actual start'],['plannedEnd','Scheduled end'],['actualEnd','Actual end'],['rrFormat','Round Robin format / agreed rule'],['action','Priority recommendation / next action']].forEach(function(x){if(S.genotes[x[0]]) out.push(x[1]+': '+S.genotes[x[0]]);});
  S.rows.rr.forEach(function(r){var k='rr_'+r.id, last=S.genotes[k+'_last'], first=S.genotes[k+'_first'], result=S.genotes[k+'_result']; if(last||first||result) out.push('Round Robin — '+r.name+': previous speaker’s last word: '+(last||'not recorded')+'; opening word: '+(first||'not recorded')+'; followed agreed rule: '+(GE_STATUS[result]||'Not observed'));});
  workflowReportLines().forEach(function(line){out.push(line);});
  return out;
}
function geHasNotes(){ return !!(S.genotes.good||S.genotes.improve||geObservationLines().length); }
function geObservationsHTML(){
  var h='<h2 class="sec">Meeting observations</h2><p class="muted">Record what you observe. Leave unseen items as Not observed; use Not applicable for activities outside today’s agenda. Notes are shared meeting data, not private feedback.</p>';
  h+='<div class="row">'+geField('plannedStart','Scheduled start','time')+geField('actualStart','Actual start','time')+geField('plannedEnd','Scheduled end','time')+geField('actualEnd','Actual end','time')+'</div>';
  GE_SECTIONS.forEach(function(section){h+=gePanel(section[0],section[0]); section[1].forEach(function(item){var k='check_'+item[0]; h+=geSelect(k,item[1])+geField(k+'_note','Evidence / suggestion: '+item[1]);}); h+='</details>';});
  h+=gePanel('handovers','Round Robin word handovers')+'<p class="muted">Use for the last-word format. Record turns in the observed speaking order; the first speaker may be Not applicable. Names below come from the Timer queue and do not prove speaking order. No audio or automatic word recognition is used.</p>'+geField('rrFormat','Round Robin format / agreed rule');
  if(!S.rows.rr.length) h+='<p class="muted">Add participants through the Round Robin Master to record individual handovers.</p>';
  S.rows.rr.forEach(function(r){var k='rr_'+r.id; h+=gePanel('rr_'+r.id,r.name)+geField(k+'_last','Previous speaker’s last word')+geField(k+'_first','This speaker’s opening word')+geSelect(k+'_result','Followed the agreed handover rule')+'</details>';});
  return h+'</details>'+geField('action','Priority recommendation / next action');
}

document.getElementById("view").addEventListener("toggle",function(e){ if(e.target.dataset.gePanel) GE_OPEN[e.target.dataset.gePanel]=e.target.open; },true);
