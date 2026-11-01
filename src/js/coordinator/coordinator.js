/* ---------- coordinator view ---------- */
function memberNames(){ return S.members.list.map(function(m){return m.name;}); }
/* ---------- before the meeting: health check, reminders, dry run; automatic meeting-record copies ---------- */
var RKEY="speechcraftRecords"+NS, autoLastSig="";
function recLoad(){ try{ return JSON.parse(localStorage.getItem(RKEY)||"[]")||[]; }catch(e){ return []; } }
function meetingHasContent(st){ st=st||S; var n=0; SESSIONS.forEach(function(x){ n+=(st.rows[x.id]||[]).filter(function(r){return rowState(r)!=="idle";}).length; }); return n>0||st.topics.length>0||st.evals.length>0||Object.keys((st.run&&st.run.started)||{}).length>0; }
function autoSaveRecord(why){
  try{
    if(!myRoles().some(function(r){return r==="coord";})||!meetingHasContent()) return false;
    var sig=stable(S); if(sig===autoLastSig) return false; autoLastSig=sig;
    var list=recLoad().filter(function(r){ return r.sig!==sig.length+":"+S.mid+":"+(S.u||0); });
    var data=JSON.stringify({app:"speechcraft-meeting",version:2,savedAt:new Date().toISOString(),state:S});
    list.unshift({at:now(),why:why||"",mid:S.mid,label:(S.meta.week||"")+(S.meta.date?" · "+fmtDate(S.meta.date):"")+(S.meta.test?" · dry run":""),sig:sig.length+":"+S.mid+":"+(S.u||0),data:data});
    /* one copy per meeting for the newest moment, max 5 */
    var seen={}; list=list.filter(function(r){ var k=r.mid+"|"+r.why; if(seen[k]) return false; seen[k]=1; return true; }).slice(0,5);
    for(var tries=0;tries<5;tries++){ try{ localStorage.setItem(RKEY,JSON.stringify(list)); return true; }catch(e){ list.pop(); if(!list.length) return false; } }
  }catch(e){}
  return false;
}
setInterval(function(){ if(L.role==="coord"||myRoles().indexOf("coord")>=0) autoSaveRecord("Every 10 minutes"); },600000);
window.addEventListener("pagehide",function(){ autoSaveRecord("App closed"); });
function autoRecHTML(){
  var list=recLoad();
  return '<section class="card" style="margin-top:12px"><h2 class="sec" style="margin-top:0">🗄 Automatic copies on this device</h2><div class="saved" style="margin-bottom:6px">This device keeps the last 5 meeting records by itself: every 10 minutes during a meeting, when you tap Finish meeting, before New meeting, and when the app closes. Still save the meeting record each week.</div>'+
    (list.length?list.map(function(r,i){ return '<div class="grow"><div><b>'+esc(r.label||"Meeting")+'</b><div class="saved">'+esc(new Date(r.at).toLocaleString("en-AU",{dateStyle:"medium",timeStyle:"short"}))+(r.why?' · '+esc(r.why):'')+' · '+Math.round(r.data.length/1024)+' KB</div></div><span class="row"><button class="btn sm" data-arec-dl="'+i+'">⤓ Download</button><button class="btn sm" data-arec-rs="'+i+'">⤒ Restore</button></span></div>'; }).join(""):'<div class="muted">None yet. Copies start once the meeting has some timing or results.</div>')+'</section>';
}
function remNames(){
  var out=[], seen={}; function add(n){ if(n&&!seen[nkey(n)]){ seen[nkey(n)]=1; out.push(n); } }
  AROLES.forEach(function(a){ if(a.k!=="coord") asList(a.k).forEach(add); }); S.assigns.forEach(function(a){ add(a.speaker); add(a.evaluator); });
  return out;
}
function remindersText(){
  var first=itemsSorted()[0], A=S.agenda;
  var t=["📣 "+(A.title||"Speechcraft")+" – "+GROUP+(S.meta.week?" ("+S.meta.week+")":""),
    (S.meta.date?agDateLong(S.meta.date):"Date to be confirmed")+(first?" · "+fmtHM(first.time):"")+(A.venue?" · "+A.venue:""),"","Role players — please check your part:"];
  remNames().forEach(function(n){ var u=myUpcoming(n); if(!u) return; t.push("• "+n+": "+u.parts.map(function(p){ return p.t+(p.d?" ("+p.d+")":""); }).join("; ")); });
  var miss=healthRows().filter(function(r){return r.key==="roles";});
  if(miss.length&&miss[0].st!=="ok") t.push("","Still needed: "+miss[0].list.join(", ")+". Reply if you can take one.");
  t.push("","Open the app before the meeting: https://npfernando.github.io/toastmasters-speechcraft/");
  return t.join("\n");
}
function healthRows(){
  var rows=[], today=todayISO(), its=itemsSorted();
  rows.push(S.meta.date?(S.meta.date<today?{st:"warn",t:"Meeting date",d:fmtDate(S.meta.date)+" is in the past — set this week’s date (top of the page)"}:{st:"ok",t:"Meeting date",d:fmtDate(S.meta.date)+(S.meta.week?" · "+S.meta.week:"")}):{st:"no",t:"Meeting date",d:"Not set (top of the page)"});
  var ms=memberNames().length; rows.push({st:ms?"ok":"no",t:"Members",d:ms?ms+" on the list":"None yet — add them on 👥 People",tab:ms?"":"people"});
  var used={}; its.forEach(function(it){ used[it.role]=1; });
  var need=AROLES.filter(function(a){ return !a.multi&&a.k!=="coord"&&(used[a.k]||["timer","ah","gram","saa"].indexOf(a.k)>=0)&&!asList(a.k).length; }).map(function(a){return a.n;});
  rows.push({key:"roles",st:need.length?"warn":"ok",t:"Role players",d:need.length?"Not filled: "+need.join(", "):"Every role on the agenda has someone",list:need,tab:need.length?"setup":""});
  var sp=asList("speakers"), noEv=sp.filter(function(n){return !evaluatorOf(n);});
  if(sp.length) rows.push({st:noEv.length?"warn":"ok",t:"Speakers and evaluators",d:noEv.length?"No evaluator yet for "+noEv.join(", "):sp.length+" speaker"+(sp.length===1?"":"s")+", each with an evaluator",tab:noEv.length?"setup":""});
  else rows.push({st:"warn",t:"Prepared speakers",d:"None on the agenda yet",tab:"setup"});
  var empty=its.filter(function(it){return !String(it.text||"").trim();}).length, zero=its.filter(function(it,i){return agDur(its,i)===0;}).length;
  rows.push({st:(empty||zero)?"warn":"ok",t:"Agenda",d:its.length+" items · "+(agSpanText()||"no times")+(empty?" · "+empty+" without an activity":"")+(zero?" · "+zero+" with 0 min":""),tab:(empty||zero)?"agenda":""});
  if(!NET.room) rows.push({st:"warn",t:"Meeting code",d:"Not hosting yet — tap Host meeting (🏠 Home) and share the code or QR"});
  else {
    var rs=relayStatus(); rows.push({st:rs.open?"ok":"no",t:"Connection",d:rs.open?"Hosting "+fmtCode(NET.code)+" · relays reachable":"Relays not reachable — try another network"});
    var peers=Object.keys(NET.info).map(function(id){return NET.info[id];}).filter(function(p){return now()-p.last<20000;});
    var old=peers.filter(function(p){return p.v&&p.v!==APP_VERSION;}), unk=peers.filter(function(p){return !p.v;});
    rows.push({st:(old.length||unk.length)?"warn":"ok",t:"Devices",d:peers.length+" other device"+(peers.length===1?"":"s")+" connected"+(old.length||unk.length?" · on an older copy: "+old.concat(unk).map(function(p){return p.name||roleName(p.role);}).join(", ")+" — close and reopen the app":(peers.length?" · all on v"+APP_VERSION.split(" ")[0]:""))});
  }
  rows.push(S.meta.test?{st:"warn",t:"Dry run",d:"Test mode is on — tap Finish dry run & clean up before the real meeting"}:{st:"ok",t:"Dry run",d:"Not in test mode"});
  return rows;
}
function healthHTML(){
  var rows=healthRows(), bad=rows.filter(function(r){return r.st!=="ok";}).length, ic={ok:"✅",warn:"⚠️",no:"❌"};
  return '<details class="card health"'+(bad?' open':'')+'><summary><h2 class="sec" style="margin:0;display:inline">🩺 Ready for the meeting?</h2> <span class="'+(bad?'st-o':'st-q')+'"><b>'+(bad?bad+' to check':'All set')+'</b></span></summary>'+
    '<table class="sumtable cct" style="margin-top:8px"><tbody>'+rows.map(function(r){ return '<tr><td>'+ic[r.st]+'</td><td><b>'+esc(r.t)+'</b></td><td>'+esc(r.d)+(r.tab&&r.tab!==coTab()?' <button class="linkbtn" data-cotab="'+r.tab+'">Fix</button>':'')+'</td></tr>'; }).join("")+'</tbody></table>'+
    '<div class="row" style="margin-top:10px"><button class="btn" id="remCopy">📋 Copy reminders for the group chat</button>'+(S.meta.test?'<button class="btn go" id="dryEnd">✓ Finish dry run & clean up</button>':'<button class="btn" id="dryStart">🧪 Start a dry run</button>')+'</div>'+
    '<div class="saved" style="margin-top:6px">'+(S.meta.test?'Dry run: every device shows a test banner, feedback history isn’t kept, and members you add now are marked as test members.':'A dry run marks this meeting as a test so it can be cleared in one tap afterwards (see the 15-minute checklist in the repo).')+'</div></details>';
}
function refreshHealth(){ try{ var el=document.querySelector("#view .health"); if(!el) return; var open=el.open; var d=document.createElement("div"); d.innerHTML=healthHTML(); var n=d.firstChild; n.open=open; el.replaceWith(n); }catch(e){} }
function dryBannerHTML(){ return S.meta&&S.meta.test?'<div class="drybanner" role="status">🧪 <b>Dry run</b> — test data. The organiser clears it with “Finish dry run & clean up”.</div>':''; }
(function(){
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    var t=e.target, b;
    if((b=t.closest("[data-arec-dl]"))){ var r=recLoad()[+b.dataset.arecDl]; if(!r) return; var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([r.data],{type:"application/json"})); a.download="Speechcraft-meeting-record-auto-"+new Date(r.at).toISOString().slice(0,16).replace(/[:T]/g,"-")+".json"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000); return; }
    if((b=t.closest("[data-arec-rs]"))){ var r2=recLoad()[+b.dataset.arecRs]; if(!r2) return; try{ restoreData(JSON.parse(r2.data)); }catch(x){ alert("That copy couldn't be read."); } return; }
    if(L.role!=="coord"||!coordUnlocked()) return;
    if(t.closest("#remCopy")){ copyText(remindersText()); setSaved("Reminders copied — paste them in the group chat"); return; }
    if(t.closest("#dryStart")){ if(!confirm("Start a dry run?\n\nThis meeting is marked as a test on every connected device. When you finish, one tap clears it.")) return; S.meta.test=true; tick(S.meta); commit(); return; }
    if(t.closest("#dryEnd")){
      var tm=S.members.list.filter(function(m){return m.test;});
      if(!confirm("Finish the dry run and clean up?\n\n• Clears this meeting’s speakers, times, topics, counts, feedback and votes on every connected device\n• Removes today’s test attendance"+(tm.length?"\n• Removes "+tm.length+" test member"+(tm.length===1?"":"s")+" ("+tm.map(function(m){return m.name;}).join(", ")+")":"")+"\n\nMembers, PIN, agenda, role players and settings are kept.")) return;
      var mid=S.mid;
      S.attend.forEach(function(a){ if(a.mid===mid){ a.void=true; a.present=false; a.u=Math.max(now(),(a.u||0)+1); } });
      if(tm.length){ S.members.list=S.members.list.filter(function(m){return !m.test;}); tick(S.members); }
      var keepAssign=clone(S.agenda.assign), keepAssigns=clone(S.assigns||[]), keepMeta={date:S.meta.date,week:S.meta.week}, keepNo=S.agenda.no, keepNext=S.agenda.next;
      newMeetingCore(false);
      S.agenda.assign=keepAssign; S.agenda.no=keepNo; S.agenda.next=keepNext; S.assigns=keepAssigns; S.meta.date=keepMeta.date; S.meta.week=keepMeta.week; delete S.meta.test; tick(S.meta); tick(S.agenda); applyAgenda(); commit();
      setSaved("Dry run cleared — ready for the real meeting"); return;
    }
  });
})();
/* Coordinator area split into sub-tabs */
var CO_TABS=[["setup","⚙️","Set-up"],["agenda","📋","Agenda"],["people","👥","People"],["after","🏁","After"]];
function coTab(){ return CO_TABS.some(function(t){return t[0]===L.coTab;})?L.coTab:"setup"; }
function coTabsHTML(ct){ return '<div class="cotabs" role="tablist" aria-label="Coordinator sections">'+CO_TABS.map(function(t){ return '<button role="tab" aria-selected="'+(ct===t[0])+'" class="'+(ct===t[0]?'on':'')+'" data-cotab="'+t[0]+'"><span aria-hidden="true">'+t[1]+'</span> '+t[2]+'</button>'; }).join("")+'</div>'; }
(function(){ document.getElementById("view").addEventListener("click",function(e){ var b=e.target.closest("[data-cotab]"); if(!b) return; L.coTab=b.dataset.cotab; saveL(); renderAll(); }); })();
function coordHTML(){
  var h='<section class="card">';
  if(!S.pin.hash && (L.pendingCo || (NET.mode && !NET.synced))){
    h+='<h2 class="sec" style="margin-top:0">⏳ Getting the meeting set-up…</h2><p class="muted" style="margin:0">'+(L.pendingCo?'Your invite will unlock the set-up as soon as the meeting data arrives.':'Waiting for the meeting data from the other devices.')+'</p></section>';
    return h;
  }
  if(!S.pin.hash){
    h+='<h2 class="sec" style="margin-top:0">🔒 Set a coordinator PIN</h2><p class="muted" style="margin-top:0">Only someone with this PIN can change the agenda, role players and member list. If the coordinator changes, hand over the PIN or set a new one here.</p>'+
       '<div class="row"><input class="t" id="pin1" type="password" inputmode="numeric" placeholder="New PIN (4–8 digits)" maxlength="8" style="max-width:220px"><input class="t" id="pin2" type="password" inputmode="numeric" placeholder="Repeat PIN" maxlength="8" style="max-width:220px"><button class="btn primary" id="pinSet">Set PIN</button></div></section>';
    return h;
  }
  if(!coordUnlocked()){
    h+='<h2 class="sec" style="margin-top:0">🔒 Coordinator area is locked</h2><p class="muted" style="margin-top:0">Enter the coordinator PIN to edit the agenda, role players and members.</p>'+
       '<div class="row"><input class="t" id="pinIn" type="password" inputmode="numeric" placeholder="PIN" maxlength="8" style="max-width:200px"><button class="btn primary" id="pinUnlock">Unlock</button></div>'+
       '<div class="selcard" style="margin-top:12px"><b>👥 Invited as a co-organiser?</b><div class="saved" style="margin:2px 0 8px">Type the invite code the Coordinator gave you.</div><div class="row"><input class="t" id="coCode" placeholder="Invite code (8 characters)" maxlength="10" style="max-width:220px;text-transform:uppercase" value="'+esc(L.pendingCo?inviteCodeFmt(L.pendingCo):'')+'"><button class="btn primary" id="coUnlock">Unlock</button></div></div>'+
       '<details style="margin-top:12px"><summary class="saved" style="cursor:pointer">Forgot the PIN? Use the recovery code</summary><div class="row" style="margin-top:8px"><input class="t" id="recIn" placeholder="Recovery code (8 characters)" maxlength="10" style="max-width:240px;text-transform:uppercase;letter-spacing:2px"><button class="btn" id="recUnlock">Unlock</button></div></details>'+
       '</section>'+agendaPreviewHTML();
    return h;
  }
  if(coordRecovery){
    h+='<div class="selcard" style="border-color:var(--a)"><b>Write down this recovery code</b><div class="code" style="font-size:30px">'+coordRecovery.slice(0,4)+'-'+coordRecovery.slice(4)+'</div><div class="saved">It unlocks the coordinator area if the PIN is forgotten. It is shown only once. Take a screenshot or keep it with the coordinator handover notes.</div><div style="text-align:right;margin-top:8px"><button class="btn" id="recDone">I\'ve saved it</button></div></div>';
  }
  if(L.coordForcePin){
    h+='<div class="selcard" style="border-color:var(--a)"><b>Set a new PIN</b><div class="saved" style="margin:4px 0 8px">You unlocked with the recovery code. Choose a new PIN now.</div><div class="row"><input class="t" id="pin1" type="password" inputmode="numeric" placeholder="New PIN" maxlength="8" style="max-width:200px"><input class="t" id="pin2" type="password" inputmode="numeric" placeholder="Repeat PIN" maxlength="8" style="max-width:200px"><button class="btn primary" id="pinSet">Save new PIN</button></div></div>';
  }
  var A=S.agenda;
  h+='<div class="row" style="justify-content:space-between"><h2 class="sec" style="margin:0">🗂 Meeting set-up</h2><div class="row"><button class="btn" id="agPrint">📄 Print agenda</button>'+(isMainCoord()?'<button class="btn" id="pinChange">Change PIN</button>':'<span class="badge on" style="align-self:center">Co-organiser</span>')+'<button class="btn" id="coordLock">🔒 Lock</button></div></div>';
  if(!NET.room) h+='<div class="note" style="margin-bottom:8px">Tip: start a meeting (top of the page) and share its code or QR in your group chat before the meeting. Everyone who joins gets this agenda and their names automatically.</div>';
  var CT=coTab();
  h+=coTabsHTML(CT);
  if(CT==="setup"&&!memberNames().length) h+='<div class="note">Start by adding the group’s members on <button class="linkbtn" data-cotab="people">👥 People</button>. Role players are chosen from that list.</div>';
  if(CT==="setup") h+='<div class="meta" style="margin-top:10px">'+
     '<label class="f">Program title<input class="t" data-ag="title" value="'+esc(A.title)+'"></label>'+
     '<label class="f">Meeting no<input class="t" data-ag="no" value="'+esc(A.no)+'" placeholder="e.g. 05"></label>'+
     '<label class="f">Venue<input class="t" data-ag="venue" value="'+esc(A.venue)+'" placeholder="e.g. Level 12 East Tower WTC"></label>'+
     '<label class="f">Next meeting date<input class="t" type="date" data-ag="next" value="'+esc(A.next)+'"></label></div>';
  /* members */
  var ms=memberNames();
  if(CT==="people") h+='<h2 class="sec">👥 Members <span class="cnt">('+ms.length+') · remembered for every meeting · tap a name to set Speechcrafter / Toastmaster / Guest</span></h2>'+membersEditorHTML();
  /* role players */
  if(CT==="setup"){
  h+='<h2 class="sec">🎭 Role players</h2><div class="rp">';
  AROLES.forEach(function(a){
    if(a.multi){
      var v=asList(a.k);
      h+='<div class="rprow"><span class="rpl">'+a.n+'</span><div class="rpv"><div class="chips">'+v.map(function(n,i){ return '<span class="chip word">'+esc(n)+rsvpBadge(n)+'<button data-rpdel="'+a.k+'" data-i="'+i+'">✕</button></span>'; }).join("")+'</div>'+
         '<div class="row" style="margin-top:4px"><input class="t" data-rpadd-in="'+a.k+'" list="memberlist" autocomplete="off" placeholder="Add a name"><button class="btn sm" data-rpadd="'+a.k+'">+ Add</button></div></div></div>';
    } else {
      h+='<div class="rprow"><span class="rpl">'+a.n+rsvpBadge(assigned(a.k))+'</span><div class="rpv"><input class="t" data-rp="'+a.k+'" list="memberlist" autocomplete="off" value="'+esc(assigned(a.k))+'" placeholder="Pick a member or type a guest\'s name"></div></div>';
    }
  });
  h+='<div class="rprow"><span class="rpl">Keynote topic</span><div class="rpv row"><input class="t" data-ag="ktopic" value="'+esc(A.ktopic)+'" placeholder="e.g. Effective use of Humor"><input class="t" data-ag="korg" value="'+esc(A.korg)+'" placeholder="Club / organisation (optional)"></div></div></div>';
  h+=assignTableHTML();
  h+='<div class="note">Role players fill in automatically on every device: names for each role, the Timer\'s Prepared Speech, Evaluations and Role reports lists, and the report header.</div>';
  }
  /* agenda items */
  if(CT==="agenda"){
  var AGL=itemsSorted();
  h+='<h2 class="sec">📋 Agenda</h2>'+tplHTML()+
    '<div class="agtools"><label class="agst">Start at <input class="t" type="time" id="agStart" aria-label="Agenda start time" value="'+esc(AGL[0]?AGL[0].time:"")+'"></label>'+
    '<span class="seg" role="group" aria-label="Move the whole agenda"><button data-agshift="-5" title="Move every item 5 minutes earlier">−5 min</button><button data-agshift="5" title="Move every item 5 minutes later">+5 min</button></span>'+
    '<span class="saved" id="agSpan">'+esc(agSpanText())+'</span></div>'+
    '<div class="note" style="margin-top:4px">▲▼ (or drag ▲▼ on a laptop) moves an item and keeps how long it runs. Changing the <b>min</b> of an item moves everything after it. <b>＋</b> inserts a 5-minute item below and <b>✕</b> removes one; the items after it move to suit.</div><div class="agedit">';
  AGL.forEach(function(it,i){
    var du=agDur(AGL,i);
    h+='<div class="agrow" data-iid="'+it.id+'"><span class="agmv" draggable="true" title="Drag to move (or use ▲▼)"><button data-agmv="-1" title="Move up" aria-label="Move up"'+(i?'':' disabled')+'>▲</button><button data-agmv="1" title="Move down" aria-label="Move down"'+(i<AGL.length-1?'':' disabled')+'>▼</button></span>'+
       '<input class="t agtime" type="time" data-it="time" aria-label="Time" value="'+esc(it.time)+'">'+
       (du==null?'<span class="agdurw agend">end</span>':'<label class="agdurw"><input class="t agdur" type="number" inputmode="numeric" min="0" max="240" data-agdur value="'+du+'" aria-label="Length in minutes"><span>min</span></label>')+
       '<select class="t agrole" data-it="role" aria-label="Role">'+AROLES.filter(function(a){return !a.multi;}).map(function(a){ return '<option value="'+a.k+'"'+(it.role===a.k?' selected':'')+'>'+a.n+'</option>'; }).join("")+'</select>'+
       '<textarea class="t agtext" data-it="text" rows="2" aria-label="Activity">'+esc(it.text)+'</textarea>'+
       '<select class="t agx" data-it="x" title="Add names automatically" aria-label="Add names automatically">'+XTRAS.map(function(x){ return '<option value="'+x.k+'"'+((it.x||"")===x.k?' selected':'')+'>'+x.n+'</option>'; }).join("")+'</select>'+
       '<span class="agacts"><button class="iconbtn" data-agins title="Insert an item below" aria-label="Insert an item below">＋</button><button class="iconbtn" data-itdel title="Remove item" aria-label="Remove item">✕</button></span></div>';
  });
  h+='</div><div class="row" style="margin-top:8px"><button class="btn" id="itAdd">+ Add agenda item</button></div>';
  }
  h+='</section>';
  return h;
}
function agendaPreviewHTML(){
  var A=S.agenda, h='<section class="card" style="margin-top:12px"><h2 class="sec" style="margin-top:0">📋 Agenda'+(A.no?' · No '+esc(A.no):'')+'</h2>';
  itemsSorted().forEach(function(it){ var who=whoFor(it.role); h+='<div class="agview"><b>'+fmtHM(it.time)+'</b><span>'+arole(it.role).n+(who?' · '+esc(who):'')+'</span><div class="muted">'+esc(it.text)+(extraText(it.x)?'<br>'+esc(extraText(it.x)).replace(/\n/g,'<br>'):'')+'</div></div>'; });
  return h+'<div class="row" style="margin-top:8px"><button class="btn" id="agPrint">📄 Print agenda</button></div></section>';
}

