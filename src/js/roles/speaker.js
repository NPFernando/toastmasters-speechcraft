/* ---------- Speaker role: my speech, my timing, my result, my private feedback ---------- */
var LIMIT_PRESETS=[["","Standard for the session"],["2-3","2–3 min"],["3-5","3–5 min"],["4-6","4–6 min"],["5-7","5–7 min"],["6-8","6–8 min"]];
function presetLim(p){ var m=String(p||"").match(/^(\d+)-(\d+)$/); if(!m) return null; var g=+m[1]*60, r=+m[2]*60; return {g:g,a:Math.round((g+r)/2),r:r}; }
function speechRec(name){ return S.speeches.find(function(s){ return s.id==="sp|"+nkey(name); }); }
function speechTitle(name){ var s=speechRec(name); return s&&s.title?s.title:""; }
function mySpeech(){ var me=myName(); if(!me) return null; var id="sp|"+nkey(me), s=S.speeches.find(function(x){return x.id===id;}); if(!s){ s={id:id,name:me,type:"ps",title:"",obj:"",lim:"",ord:maxOrd(S.speeches)+1,u:now()}; S.speeches.push(s); } return s; }
function applySpeech(s){
  if(!s||!s.name) return;
  var lim=presetLim(s.lim);
  if(s.type==="ps"){
    var rows=S.rows.ps.filter(function(r){ return nkey(baseName(r.name))===nkey(s.name); });
    if(!rows.length){ var r=newRow("ps",s.name); r.ak="spk:"+nkey(s.name); if(lim) r.lim=lim; S.rows.ps.push(r); }
    rows.forEach(function(r){ if(rowState(r)!=="idle") return; if(lim) r.lim=lim; else delete r.lim; tick(r); });
  }
}
function feedbackCounts(name){ return {ev:submittedEvals(name).length, notes:S.notes.filter(function(n){return nkey(n.to)===nkey(name)&&n.enc;}).length}; }
function checkNewFeedback(){
  if(L.role!=="speaker"&&L.role!=="member") return;
  var nm=L.role==="speaker"?myName():L.cardName; if(!nm) return;
  var c=feedbackCounts(nm), tot=c.ev+c.notes; L.fbSeen=L.fbSeen||{}; var k=nkey(nm);
  if(L.fbSeen[k]==null){ L.fbSeen[k]=tot; saveL(); return; }
  if(tot>L.fbSeen[k]){ L.fbSeen[k]=tot; saveL(); showToastMsg("📬 New feedback for you — open your feedback card"); }
}
function showToastMsg(msg){ var t=document.getElementById("toast"); document.getElementById("toastMsg").textContent=msg; document.getElementById("toastUndo").style.display="none"; t.classList.add("on"); clearTimeout(undoTimer); undoTimer=setTimeout(function(){ t.classList.remove("on"); document.getElementById("toastUndo").style.display=""; },6000); }
function feedbackBlockHTML(cn){ return feedbackBlock0(cn)+'<div class="row" style="margin-top:8px">'+histButtonHTML(cn)+'</div>'; }
function feedbackBlock0(cn){
  var h="";
  if(!cryptoOK()) return '<div class="connerr">This browser can\'t do encryption here. Open the page from the website link.</div>';
  if(!keyRec(cn)) return '<div class="selcard"><b>Create your feedback PIN</b><div class="saved" style="margin:4px 0 8px">4–8 digits. Only someone with this PIN can read your evaluations and notes, on any device. Set it before the meeting so feedback reaches you straight away.</div><div class="row"><input class="t" id="fbPin1" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN" style="max-width:160px"><input class="t" id="fbPin2" type="password" inputmode="numeric" maxlength="8" placeholder="Repeat PIN" style="max-width:160px"><button class="btn primary" id="fbCreate">Create PIN</button></div></div>';
  var c=feedbackCounts(cn);
  h+='<div class="saved" style="margin:6px 0">📬 '+c.ev+' submitted evaluation'+(c.ev===1?'':'s')+' · '+c.notes+' note'+(c.notes===1?'':'s')+' from the audience</div>';
  if(!hasPriv(cn)) return h+'<div class="selcard"><b>Unlock your feedback</b><div class="row" style="margin-top:8px"><input class="t" id="fbPin" type="password" inputmode="numeric" maxlength="8" placeholder="Your feedback PIN" style="max-width:180px"><button class="btn primary" id="fbUnlock">Unlock</button></div><div class="saved" style="margin-top:6px">Forgot it? Ask the Coordinator to reset your PIN. Feedback sent for the old PIN can\'t be recovered.</div></div>';
  return h+'<div class="row" style="margin-top:8px"><button class="btn primary" id="cardOpen">Open my feedback card</button><button class="btn" id="fbLock" title="Remove your key from this device">🔒 Lock on this device</button></div>';
}
function speakerHTML(){
  var me=myName(), h='<section class="card">';
  if(!me){
    h+='<h2 class="sec" style="margin-top:0">Who are you?</h2><div class="chips">'+memberNames().map(function(n){return '<button class="chip" data-spme="'+esc(n)+'">'+esc(n)+'</button>';}).join("")+'</div><div class="saved" style="margin-top:6px">Or type your name in <b>Your name</b> above.</div></section>';
    return h;
  }
  var s=speechRec(me)||{type:"ps",title:"",obj:"",lim:""};
  var myEv=evaluatorOf(me);
  h+='<h2 class="sec" style="margin-top:0">🎙 My prepared speech</h2><div class="saved">Table Topics speakers are chosen on the day by the Table Topics Master.</div>'+(myEv?'<div style="margin-top:6px">Your evaluator: <b>'+esc(myEv)+'</b></div>':'');
  {
    h+='<label class="f" style="margin-top:10px">Speech title<input class="t" data-sp="title" value="'+esc(s.title)+'" placeholder="e.g. The day I learned to fail"></label>'+
       '<label class="f" style="margin-top:8px">Objectives (optional — read out by the Toastmaster, guides your evaluator)<textarea class="t" data-sp="obj" rows="2" placeholder="e.g. Use vocal variety; open with a story">'+esc(s.obj)+'</textarea></label>'+
       '<label class="f" style="margin-top:8px">My time limits<select class="t" data-sp="lim" style="max-width:260px">'+LIMIT_PRESETS.map(function(p){return '<option value="'+p[0]+'"'+((s.lim||"")===p[0]?' selected':'')+'>'+p[1]+'</option>';}).join("")+'</select></label>'+
       '<div class="saved" style="margin-top:6px">Your title and objectives show for the Toastmaster, Timer, evaluators and in the report. Your time limits set the Timer\'s green / amber / red for you.</div>';
  }
  h+=rsvpHTML(me);
  var tm=timesFor(me);
  h+='<h2 class="sec">⏱ My result</h2>'+(tm.length?tm.map(function(x){ return '<div><b>'+x.s.name+':</b> '+fmt(x.sec)+' · <span class="'+(x.st.cls||"")+'">'+esc(x.st.text)+'</span></div>'; }).join(""):'<div class="muted">Appears here after the Timer stops you.</div>');
  h+='<h2 class="sec">📄 My feedback <span class="cnt">🔒 private</span></h2><div class="saved">Evaluations reach you when your evaluator taps Submit. Audience notes arrive as they are sent.</div>'+feedbackBlockHTML(me);
  return h+'</section>';
}
function feedbackPinsHTML(){
  var ms=memberNames(); if(!ms.length) return "";
  var h='<section class="card" style="margin-top:12px"><h2 class="sec" style="margin-top:0">🔒 Private feedback PINs <span class="cnt">speakers set these themselves in Participant → My feedback card</span></h2><div class="chips">';
  ms.forEach(function(n){ var k=keyRec(n); h+='<span class="chip word">'+(k?'🔒 ':'○ ')+esc(n)+(k?'<button data-keyreset="'+esc(n)+'" title="Reset this PIN">reset</button>':'')+'</span>'; });
  return h+'</div><div class="note">Resetting a PIN lets the speaker set a new one, but feedback encrypted for the old PIN can no longer be read.</div></section>';
}

