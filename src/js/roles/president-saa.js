/* ---------- President and Sergeant at Arms ---------- */
function presChecks(){
  var tm=S.people.tmod||assigned("tmod");
  return {
    open:[["order","Call the meeting to order on time"],["anthem","National Anthem"],["welcome","Welcome members and guests (see the guest list below)"],["mission","Share the club mission"],["intro","Introduce the Toastmaster of the Day"+(tm?" ("+tm+")":"")+" and hand over"]],
    close:[["thank","Thank the Toastmaster and every role player"],["awards","Congratulate the award winners"],["guests","Invite guests to share a comment"],["next","Announce the next meeting"+(S.agenda.next?" ("+fmtDate(S.agenda.next)+")":"")],["adjourn","Adjourn the meeting"]]
  };
}
var SAA_CHECKS={
  before:[["room","Room or online meeting link ready"],["lectern","Lectern, microphone and projector set up"],["lights","Timing lights or cards ready for the Timer"],["badges","Name badges and sign-in sheet out"],["agenda","Agenda shared (printed or link)"]],
  during:[["greet","Greet members and guests as they arrive"],["guests","Add guests to the guest list"],["seat","Ask everyone to be seated and silence phones"],["intro","Introduce the President to open the meeting"]],
  after:[["tidy","Room tidied, furniture back in place"],["pack","Equipment and club items packed away"]]
};
function chkList(store,group,items){
  var c=S[store].chk||{}, done=items.filter(function(x){return c[group+"."+x[0]];}).length;
  return '<div class="chklist">'+items.map(function(x){ var k=group+"."+x[0], on=!!c[k];
    return '<label class="chk'+(on?' on':'')+'"><input type="checkbox" data-chk="'+store+'|'+k+'"'+(on?' checked':'')+'> <span>'+esc(x[1])+'</span></label>'; }).join("")+
    '</div><div class="saved" style="margin-top:4px">'+done+' of '+items.length+' done</div>';
}
function chkLeft(store,group,items){ var c=S[store].chk||{}; return items.filter(function(x){return !c[group+"."+x[0]];}).map(function(x){return x[1];}); }
function roleTimes(role){ return itemsSorted().filter(function(i){return i.role===role;}).map(function(i){ return '<div class="ritem"><b>'+esc(fmtHM(i.time))+'</b> '+esc(i.text)+'</div>'; }).join(""); }
function guestsHTML(){
  var h='<h2 class="sec">👋 Guests <span class="cnt">'+S.guests.length+'</span><button class="btn sm" data-gqr style="margin-left:auto">📱 Guest check-in QR</button></h2>'+(L.gqr?guestQRHTML(true):'')+
    '<div class="row"><input class="t" id="gName" autocomplete="off" placeholder="Guest name" style="flex:1 1 160px"><input class="t" id="gFrom" autocomplete="off" placeholder="From / how they heard of us (optional)" style="flex:2 1 200px"><button class="btn primary" id="gAdd">+ Add guest</button></div>';
  if(!S.guests.length) return h+'<div class="note">No guests yet. Add each visitor so the President can welcome them by name.</div>';
  return h+'<div class="glist">'+S.guests.map(function(g){
    return '<div class="grow'+(g.welcomed?' on':'')+'"><div><b>'+esc(g.name)+'</b>'+(g.from?' <span class="saved">· '+esc(g.from)+'</span>':'')+'</div><span class="row"><button class="btn sm'+(g.welcomed?' go':'')+'" data-gwel="'+g.id+'">'+(g.welcomed?'✓ Welcomed':'Welcomed?')+'</button><button class="btn sm ghost" data-gdel="'+g.id+'" title="Remove">✕</button></span></div>';
  }).join("")+'</div>';
}
function winnersLine(){
  if(S.vote.state!=="shown") return '<div class="saved">Award winners appear here once the Toastmaster reveals the votes.</div>';
  var w=VCATS.map(function(c){ var t=tally(c.k); return t.winners.length?c.n+": "+t.winners.map(function(x){return x.name;}).join(" & "):""; }).filter(Boolean);
  return w.length?'<div class="selcard"><b>🏆 Winners</b><br>'+esc(w.join(" · "))+'</div>':'';
}
function presidentHTML(){
  var pc=presChecks(), h='<section class="card">';
  var times=roleTimes("president"); if(times) h+='<h2 class="sec" style="margin-top:0">🔔 Your part of the agenda</h2><div class="ritems">'+times+'</div>';
  h+='<h2 class="sec">Opening</h2>'+chkList("pres","open",pc.open);
  h+='<details class="mission"><summary>Club mission (to read out)</summary><div class="note">'+esc(CLUB_MISSION)+'</div></details>';
  h+='<label class="f" style="margin-top:10px">Announcements<textarea class="t" id="presNotes" rows="2" placeholder="Anything to announce at the opening or close">'+esc(S.pres.notes||"")+'</textarea></label>';
  h+='</section><section class="card" style="margin-top:12px">'+guestsHTML()+'</section>';
  h+='<section class="card" style="margin-top:12px"><h2 class="sec" style="margin-top:0">Closing</h2>'+winnersLine()+chkList("pres","close",pc.close)+'</section>';
  return h;
}
function saaHTML(){
  var h='<section class="card"><h2 class="sec" style="margin-top:0">🛎 Before the meeting</h2>'+chkList("saa","before",SAA_CHECKS.before)+
    '<h2 class="sec">As people arrive</h2>'+chkList("saa","during",SAA_CHECKS.during)+'</section>';
  h+='<section class="card" style="margin-top:12px">'+guestsHTML()+'</section>';
  h+='<section class="card" style="margin-top:12px"><h2 class="sec" style="margin-top:0">After the meeting</h2>'+chkList("saa","after",SAA_CHECKS.after)+'</section>';
  return h;
}
(function(){
  var V=document.getElementById("view");
  V.addEventListener("change",function(e){
    var c=e.target.closest("[data-chk]"); if(!c) return;
    var p=c.dataset.chk.split("|"), st=S[p[0]]; st.chk=st.chk||{}; if(c.checked) st.chk[p[1]]=now(); else delete st.chk[p[1]]; tick(st); commit();
  });
  V.addEventListener("input",function(e){ if(e.target.id==="presNotes"){ S.pres.notes=e.target.value; tick(S.pres); commitQuiet(); } });
  V.addEventListener("click",function(e){
    var t=e.target;
    if(t.closest("#gAdd")){ var n=document.getElementById("gName"), f=document.getElementById("gFrom"), nm=(n.value||"").trim(); if(!nm){ n.focus(); return; }
      if(S.guests.some(function(g){return nkey(g.name)===nkey(nm);})){ showToastMsg(nm+" is already on the guest list"); return; }
      S.guests.push({id:uid(),name:nm,from:(f.value||"").trim(),welcomed:false,ord:maxOrd(S.guests)+1,u:now()}); addName(S,nm); commit(); var n2=document.getElementById("gName"); if(n2) n2.focus(); return; }
    var w=t.closest("[data-gwel]"); if(w){ var g=S.guests.find(function(x){return x.id===w.dataset.gwel;}); if(g){ g.welcomed=!g.welcomed; tick(g); commit(); } return; }
    var d=t.closest("[data-gdel]"); if(d){ var i=S.guests.findIndex(function(x){return x.id===d.dataset.gdel;}); if(i>=0) removeItem(["guests"],S.guests[i].id,S.guests[i].name||"Guest"); return; }
  });
  V.addEventListener("keydown",function(e){ if(e.key==="Enter"&&(e.target.id==="gName"||e.target.id==="gFrom")){ e.preventDefault(); document.getElementById("gAdd").click(); } });
})();

