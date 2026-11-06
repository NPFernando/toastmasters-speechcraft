/* ---------- Member: check-in, notes, feedback card ---------- */
function attendLive(){ return S.attend.filter(function(a){return !a.void;}); }
function present(name,mid){ return S.attend.some(function(a){ return a.mid===(mid||S.mid) && nkey(a.name)===nkey(name) && a.present; }); }
function setPresent(name,on){
  var id=S.mid+"|"+nkey(name), a=S.attend.find(function(x){return x.id===id;});
  if(!a){ a={id:id,mid:S.mid,week:S.meta.week||"",date:S.meta.date||"",name:name,present:true,ord:S.attend.length+1,u:now()}; S.attend.push(a); }
  a.present=on; a.week=S.meta.week||a.week; a.date=S.meta.date||a.date; tick(a); commit();
}
function memberHTML(){
  var me=myName(), ms=meetingNames(), h='<section class="card">';
  h+='<h2 class="sec" style="margin-top:0">✅ Check in</h2><div class="saved" style="margin-bottom:6px">Tap your name when you arrive.</div><div class="chips">'+
     (ms.length?ms.map(function(n){ var p=present(n); return '<button class="chip'+(p?' active':'')+'" data-checkin="'+esc(n)+'">'+(p?'✓ ':'')+esc(n)+'</button>'; }).join(""):'<span class="muted">The Coordinator adds the member list.</span>')+
     '</div><div class="row" style="margin-top:8px"><input class="t" id="guestIn" placeholder="Guest? Type your name"><button class="btn" id="guestAdd">Check in</button></div>'+
     '<div class="saved" style="margin-top:6px">'+S.attend.filter(function(a){return a.mid===S.mid&&a.present;}).length+' checked in today</div>';
  h+=rsvpHTML(me);
  h+='<h2 class="sec">🗳 Voting</h2><div>'+voteStateText()+'</div>'+(S.vote.state==="open"?'<button class="btn go big1" id="openVote" style="margin-top:8px">Vote now</button>':'')+(S.vote.state==="shown"?'<button class="btn" id="showWinners" style="margin-top:8px">Show winners</button>':'');
  var speakers=uniq(preparedSpeakers().concat(ttSpeakers()).concat(ms));
  h+='<h2 class="sec">💌 Send a note to a speaker</h2><div class="saved" style="margin-bottom:6px">Anonymous and encrypted: only the speaker can read it, on their feedback card.</div>'+
     '<div class="row"><select class="t" id="noteTo" style="max-width:280px" aria-label="Speaker to send a note to"><option value="">Choose a speaker…</option>'+speakers.map(function(n){return '<option>'+esc(n)+'</option>';}).join("")+'</select></div>'+
     '<textarea class="t" id="noteText" rows="2" style="margin-top:6px" placeholder="e.g. Loved your opening story! Try a slower pace at the end."></textarea><div class="row" style="margin-top:6px"><button class="btn primary" id="noteSend">Send note</button><span class="saved" id="noteMsg"></span></div>';
  var cn=L.cardName||"";
  h+='<h2 class="sec">📄 My feedback card <span class="cnt">🔒 private</span></h2><div class="saved" style="margin-bottom:6px">Your times, Ah count, grammar notes, evaluations, notes and awards. Evaluations and notes are encrypted: only you can open them, with your own feedback PIN.</div>'+
     '<div class="row"><select class="t" id="cardName" style="max-width:280px" aria-label="Your name"><option value="">Choose your name…</option>'+uniq(ms.concat(speakers)).map(function(n){return '<option'+(nkey(n)===nkey(cn)?' selected':'')+'>'+esc(n)+'</option>';}).join("")+'</select></div>';
  if(cn) h+=feedbackBlockHTML(cn);
  return h+'</section>';
}
function buildCard(name){
  var t=now(), h='<div class="rlogos"><img src="'+document.querySelector(".logo img").src+'" alt="Toastmasters International"><img src="'+document.querySelector(".logo.co img").src+'" alt="Dijital Team"></div>';
  h+='<h2>Speechcraft Feedback — '+esc(name)+'</h2>'+(speechTitle(name)?'<div style="font-size:15px;margin-top:2px">Speech: <b>“'+esc(speechTitle(name))+'”</b>'+(evaluatorOf(name)?' · Evaluator: '+esc(evaluatorOf(name)):'')+'</div>':'')+'<div class="sub">'+esc(GROUP)+(S.meta.week?' · '+esc(S.meta.week):'')+' · '+esc(fmtDate(S.meta.date)||"")+'</div>';
  var tm=timesFor(name);
  h+='<h4>⏱ Times</h4>'+(tm.length?'<table><thead><tr><th>Session</th><th class="c">Time</th><th>Result</th></tr></thead><tbody>'+tm.map(function(x){ return '<tr><td>'+x.s.name+'</td><td class="c">'+fmt(x.sec)+'</td><td>'+esc(x.st.text)+'</td></tr>'; }).join("")+'</tbody></table>':'<div class="none">No timed speeches.</div>');
  var tp=S.topics.filter(function(x){return x.used&&nkey(x.speaker)===nkey(name);});
  if(tp.length) h+='<div style="margin-top:6px"><b>Table Topic:</b> '+esc(tp.map(function(x){return x.text;}).join(" · "))+'</div>';
  var ah=S.ahRows.find(function(r){return nkey(r.name)===nkey(name);});
  h+='<h4>🔢 Ah-Counter</h4>'+(ah?'<div>'+S.fill.words.filter(function(w){return ah.c[w];}).map(function(w){return esc(w)+' ×'+ah.c[w];}).join(" · ")+' — total '+ahTotal(ah)+'</div>':'<div class="none">Not counted.</div>');
  var g=S.gramRows.find(function(r){return nkey(r.name)===nkey(name);});
  h+='<h4>📝 Grammarian</h4>'+(g?'<div>Word of the Day'+(S.gram.wotd?' (“'+esc(S.gram.wotd)+'”)':'')+': used '+(g.w||0)+'×</div>'+(g.good.length?'<div><b>Great phrases:</b> '+esc(g.good.join("; "))+'</div>':'')+(g.slips.length?'<div><b>To polish:</b> '+esc(g.slips.join("; "))+'</div>':''):'<div class="none">No notes.</div>');
  h+='<h4>🗣 Evaluation <span style="font-weight:400;font-size:12px;color:#666">🔒 private</span></h4><div id="cardEvals"><div class="none">Decrypting…</div></div>';
  h+='<h4>💌 Notes from the audience <span style="font-weight:400;font-size:12px;color:#666">🔒 private</span></h4><div id="cardNotes"><div class="none">Decrypting…</div></div>';
  if(S.vote.state==="shown"){ var won=VCATS.filter(function(c){ return tally(c.k).winners.some(function(w){return nkey(w.name)===nkey(name);}); }).map(function(c){return c.n;}); if(won.length) h+='<h4>🏆 Awards</h4><div><b>'+esc(won.join(", "))+'</b></div>'; }
  var mids=uniq(attendLive().map(function(a){return a.mid;})), mine=attendLive().filter(function(a){return a.present&&nkey(a.name)===nkey(name);}).length;
  if(mids.length) h+='<h4>✅ Attendance</h4><div>Attended '+mine+' of '+mids.length+' recorded meeting'+(mids.length===1?'':'s')+'.</div>';
  h+='<div class="sign"><span></span><span>Generated '+new Date().toLocaleString("en-AU",{dateStyle:"medium",timeStyle:"short"})+'</span></div>';
  document.getElementById("report").innerHTML=h;
  document.getElementById("repPick").innerHTML='<b style="font-size:14px">Feedback card – '+esc(name)+'</b>';
  var w=document.getElementById("reportWrap"); w.dataset.kind="card"; w.dataset.card=name; w.classList.add("on");
  if(!hasPriv(name)){ document.getElementById("cardEvals").innerHTML=document.getElementById("cardNotes").innerHTML='<div class="none">🔒 Locked — unlock with your feedback PIN.</div>'; return; }
  var ev=submittedEvals(name), nt=S.notes.filter(function(n){return nkey(n.to)===nkey(name)&&n.enc;});
  var kx=keyRec(name).pub.x;
  Promise.all(ev.map(function(e){ return e.enc.kx!==kx?Promise.resolve(null):decryptFor(name,e.enc).catch(function(){return null;}); })).then(function(list){
    var html=list.map(function(x,i){ if(!x) return ''; var rt=x.rate||{}; return '<div class="evcard"><div class="saved">'+(x.kind==="tt"?"Table Topics":"Prepared speech")+' · by '+esc(ev[i].by||x.by||"Evaluator")+'</div>'+(x.c1?'<div><b>Commend:</b> '+esc(x.c1)+'</div>':'')+(x.r?'<div><b>Recommend:</b> '+esc(x.r)+'</div>':'')+(x.c2?'<div><b>Commend:</b> '+esc(x.c2)+'</div>':'')+((rt.content||rt.delivery||rt.confidence)?'<div class="saved">Content '+(rt.content||"–")+'/5 · Voice & body '+(rt.delivery||"–")+'/5 · Confidence '+(rt.confidence||"–")+'/5</div>':'')+'</div>'; }).join("");
    var el=document.getElementById("cardEvals"); if(el) el.innerHTML=html||'<div class="none">No evaluation yet.</div>';
  });
  Promise.all(nt.map(function(n){ return n.enc.kx!==kx?Promise.resolve(null):decryptFor(name,n.enc).catch(function(){return null;}); })).then(function(list){
    var items=list.filter(Boolean).map(function(x){return '<li>'+esc(x.text)+'</li>';}).join("");
    var el=document.getElementById("cardNotes"); if(el) el.innerHTML=items?'<ul>'+items+'</ul>':'<div class="none">No notes.</div>';
  });
}

