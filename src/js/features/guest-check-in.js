/* ---------- 2. guest self check-in ---------- */
function guestLink(){ return NET.code? inviteLink(NET.code)+"&guest=1" : ""; }
function guestQRHTML(compact){
  var link=guestLink(); if(!link) return '<div class="note">Start or join the meeting first; then guests can scan a code to check themselves in.</div>';
  return '<div class="qrwrap'+(compact?' gqr':'')+'">'+qrSvg(link)+'<div class="saved">Guests: scan with your phone camera to check in</div></div>';
}
function guestSpeakerRole(name){ var k=nkey(name); if(asList("keynote").some(function(n){return nkey(n)===k;})) return "keynote"; if(asList("speakers").some(function(n){return nkey(n)===k;})) return "speaker"; return ""; }
function applyGuestCheckIn(g){
  if(!S.guests.some(function(x){return nkey(x.name)===nkey(g.name);}) && !memberRec(g.name)) S.guests.push({id:"g|"+nkey(g.name),name:g.name,from:g.from||"",welcomed:false,self:true,ord:maxOrd(S.guests)+1,u:now()});
  addName(S,g.name); setPresent(g.name,true);
}
function renderGuestWelcome(){
  var tm=document.querySelector(".logo img").src, co=document.querySelector(".logo.co img").src, on=NET.status==="on"&&NET.synced;
  var h='<div class="wlogos"><img src="'+tm+'" alt="Toastmasters International"><img class="co" src="'+co+'" alt="Dijital Team"></div><h2>Welcome! 👋</h2><p class="lead">'+esc(GROUP)+' · Speechcraft'+(S.meta.week?' · '+esc(S.meta.week):'')+'</p>';
  if(W.guestDone){
    h+='<div class="wcard"><b>✓ You’re checked in, '+esc(W.guestDone.name)+'.</b><div class="saved" style="margin-top:4px">'+(W.guestDone.role==="keynote"?'You’re on today’s agenda as an educational presenter: add your topic and queue your presentation for the Timer.':W.guestDone.role==="speaker"?'You’re on today’s agenda as a speaker: your phone will show your time while you speak. Set a feedback PIN to read your evaluation privately.':'You can follow the meeting, vote for the awards and send encouraging notes to speakers.')+'</div></div><div class="wfoot"><span></span><button class="btn primary big1" id="gDone">Open the meeting →</button></div>';
  } else {
    h+='<div class="wcard"><label class="f">Your name<input class="t" id="gName" autocomplete="name" placeholder="First and last name"></label>'+
      '<label class="f" style="margin-top:8px">Where are you from / how did you hear about us? <span class="saved">(optional)</span><input class="t" id="gFrom2" placeholder="e.g. LinkedIn, a friend, Dialog TMC"></label>'+
      '<div class="row" style="margin-top:12px"><button class="btn primary big1" id="gCheck"'+(on?'':' disabled')+'>✓ Check in</button><span class="saved">'+(on?'':esc(NET.msg||"Connecting to the meeting…"))+'</span></div></div>'+
      '<div class="wfoot"><button class="linkbtn" id="gNotGuest">I’m a member, not a guest</button><span class="saved">🔒 No account needed</span></div>';
  }
  document.getElementById("wbox").innerHTML=h;
}
document.getElementById("wbox").addEventListener("click",function(e){
  if(W.step!=="guest") return; var t=e.target;
  if(t.closest("#gCheck")){ var n=(document.getElementById("gName").value||"").trim(); if(!n){ document.getElementById("gName").focus(); return; }
    var from=(document.getElementById("gFrom2").value||"").trim(), role=guestSpeakerRole(n);
    L.me=n; L.roles=role?[role,"member"]:["member"]; L.role=L.roles[0]; L.myNames={member:n,speaker:n}; L.setup=true; saveL();
    applyGuestCheckIn({name:n,from:from}); NET.hello(); W.guestDone={name:n,role:role}; renderGuestWelcome(); return; }
  if(t.closest("#gDone")){ W.step="role"; closeWelcome(); return; }
  if(t.closest("#gNotGuest")){ W.step="role"; W.fresh=true; renderWelcome(); return; }
});
document.getElementById("wbox").addEventListener("keydown",function(e){ if(W.step==="guest"&&e.key==="Enter"&&(e.target.id==="gName"||e.target.id==="gFrom2")){ e.preventDefault(); var b=document.getElementById("gCheck"); if(b&&!b.disabled) b.click(); } });

