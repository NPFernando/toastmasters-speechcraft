/* ---------- welcome: pick role, then host / join ---------- */
var W={step:"role",role:null,code:""};
var ROLE_DESC={keynote:"Educational topic, objectives, introduction, materials and presentation timing",president:"Opens and closes the meeting, welcomes guests by name",saa:"Room set-up, greets members and guests, packs up",speaker:"Your speech title, time limits, result and private feedback",ge:"Calls for reports, tracks evaluations, opens voting",rrm:"Round Robin questions; queues each person on the Timer",seval:"Commend / Recommend / Commend for prepared speakers",tteval:"Commend / Recommend / Commend for Table Topics speakers",member:"Check in, vote, send notes, see your feedback card",coord:"Sets up the agenda, role players and members (PIN)",tmod:"Runs the meeting: Now / Next, on time or behind",timer:"Times every speaker and shows the signals",ttm:"Runs Table Topics and calls the speakers",ah:"Counts filler words for each speaker",gram:"Word of the Day, great phrases and slips"};
var SITE_URL="https://npfernando.github.io/toastmasters-speechcraft/";
function baseUrl(){ return (/^https?:/.test(location.protocol) ? location.origin+location.pathname : SITE_URL)+(NS===".practice"?"?as=practice":""); }
function inviteLink(code){ return baseUrl()+"#join="+fmtCode(code); }
function roleLink(code,role){ return inviteLink(code)+"&role="+role; }
function qrSvg(text){ try{ var q=qrcode(0,"M"); q.addData(text); q.make(); return '<div class="qr">'+q.createSvgTag({cellSize:4,margin:2,scalable:true,alt:"QR code"})+'</div>'; }catch(e){ return ""; } }
/* 📱 open my role on another device: same meeting, same role, data comes across through the sync */
function renderPhoneQR(){
  var r=ROLES.find(function(x){return x.id===L.role;}), h='<h3>📱 Open '+r.name+' on another device</h3>';
  if(!NET.room){
    h+='<p class="muted">Your phone gets this role\'s data through a meeting connection. Start one now (it also lets the other roles join), then scan the code.</p><button class="btn primary big1" id="qrStart">Start meeting &amp; show QR</button>';
  } else {
    var link=roleLink(NET.code,L.role);
    h+='<p class="muted" style="margin-top:0">Scan with your phone camera. It opens as <b>'+r.icon+' '+r.name+'</b> in meeting <b>'+fmtCode(NET.code)+'</b>, and all the data comes across. Keep this page open until the phone shows ✓ Connected.</p>'+
       '<div class="qrwrap">'+qrSvg(link)+'</div><div class="row" style="justify-content:center"><button class="btn" id="qrCopy">Copy link</button></div>'+
       '<div class="saved" style="margin-top:6px;word-break:break-all">'+esc(link)+'</div>'+
       (NET.status!=="on"?'<div class="saved" style="margin-top:6px">'+esc(NET.msg||"Connecting…")+'</div>':'');
  }
  h+='<div style="text-align:right;margin-top:12px"><button class="btn" id="qrClose">Close</button></div>';
  document.getElementById("qrBox").innerHTML=h;
}
function openPhoneQR(){ renderPhoneQR(); document.getElementById("qrModal").classList.add("on"); }
document.getElementById("qrBox").addEventListener("click",function(e){
  var t=e.target;
  if(t.closest("#qrStart")){ startHost(makeCode()); renderPhoneQR(); }
  else if(t.closest("#qrCopy")){ try{ navigator.clipboard.writeText(roleLink(NET.code,L.role)); t.textContent="Copied ✓"; }catch(err){} }
  else if(t.closest("#qrClose")) document.getElementById("qrModal").classList.remove("on");
});
document.getElementById("qrModal").addEventListener("click",function(e){ if(e.target.id==="qrModal") e.target.classList.remove("on"); });
function openWelcome(step){ W.name=null; W.step=step||"connect"; W.fresh=!L.setup; W.sel=[]; document.getElementById("welcome").classList.add("on"); renderWelcome(); }
function closeWelcome(){ L.view="role"; L.setup=true; saveL(); document.getElementById("welcome").classList.remove("on"); renderAll(); window.scrollTo(0,0); }
function refreshWelcome(){
  if(document.getElementById("welcome").classList.contains("on") && W.step==="guest" && !W.guestDone){ var gc=document.getElementById("gCheck"); if(gc){ var ok=NET.status==="on"&&NET.synced; gc.disabled=!ok; if(gc.nextElementSibling) gc.nextElementSibling.textContent=ok?"":(NET.msg||"Connecting to the meeting…"); } }
  if(document.getElementById("welcome").classList.contains("on") && W.step==="connect"){
    renderWelcome();
    if(W.auto && NET.status==="on" && (NET.peers.length>1||NET.mode==="host")){ W.auto=false; setTimeout(closeWelcome,900); }
    else if(W.advance && NET.status==="on" && NET.synced && NET.peers.length>1){ W.advance=false; setTimeout(function(){ if(W.step==="connect"){ W.step="role"; renderWelcome(); } },700); }
  }
  if(document.getElementById("qrModal").classList.contains("on")) renderPhoneQR();
}
var ROLE_GROUPS=[["Running the meeting",["coord","president","tmod","ge","saa"]],["Timing & reports",["timer","ttm","rrm","ah","gram"]],["Speakers & evaluators",["keynote","speaker","seval","tteval"]],["Audience",["member"]]];
function wName(){ return W.name!=null?W.name:(L.setup?(L.me||myName()||""):(L.me||"")); }
function roleCardHTML(r,today){
  var on=(W.sel||[]).indexOf(r.id)>=0, holder=S.people[r.id]||assigned(r.id)||"", nm=wName();
  var other=holder&&!MULTI_ROLES[r.id]&&nkey(holder)!==nkey(nm)?holder:"";
  return '<button class="rolecard'+(on?' active':'')+(today.indexOf(r.id)>=0?' mine':'')+'" data-wrole="'+r.id+'" aria-pressed="'+on+'"><span class="ic">'+r.icon+'</span><div><b>'+r.name+'</b><span class="rdesc">'+ROLE_DESC[r.id]+'</span>'+
    (today.indexOf(r.id)>=0?'<span class="today">⭐ Yours today</span>':other?'<span class="taken">'+esc(other)+'</span>':'')+'</div><span class="tick" aria-hidden="true">✓</span></button>';
}
function roleGridHTML(today){
  var h='';
  if(today.length) h+='<div class="rgh">⭐ Your roles today</div><div class="rolegrid">'+today.map(function(id){return roleCardHTML(roleObj(id),today);}).join("")+'</div>';
  ROLE_GROUPS.forEach(function(g){
    var ids=g[1].filter(function(id){return today.indexOf(id)<0;}); if(!ids.length) return;
    h+='<div class="rgh">'+(today.length?'Other roles · ':'')+esc(g[0])+'</div><div class="rolegrid">'+ids.map(function(id){return roleCardHTML(roleObj(id),today);}).join("")+'</div>';
  });
  return h;
}
function wTodayText(t){ return t.length?'⭐ The agenda has you as '+t.map(function(r){return roleObj(r).name;}).join(", ")+'.'+(t.some(function(r){return (W.sel||[]).indexOf(r)<0;})?' <button class="linkbtn" id="wSelToday">Select '+(t.length>1?'them':'it')+'</button>':''):'Choose one or more roles.'; }
function wStartLabel(){
  var s=W.sel||[]; if(!s.length) return W.add?"Choose a role to add":"Choose your role";
  var o=roleObj(s[0]); return (W.add?"Add ":"Start: ")+o.icon+" "+o.name+(s.length>1?" +"+(s.length-1):"")+" →";
}
function wNamesHTML(){
  var ms=meetingNames(), nm=wName();
  var h='<div class="wlbl">Your name</div>';
  if(ms.length){ var nb=function(n){ return '<button class="chip'+(nkey(n)===nkey(nm)?' active':'')+'" data-wname="'+esc(n)+'">'+esc(n)+kindBadge(n)+'</button>'; };
    var scs=ms.filter(function(n){return memberKind(n)==="sc";}), others=ms.filter(function(n){return memberKind(n)!=="sc";});
    h+='<div class="chips wnames">'+scs.map(nb).join("")+'</div>'+(others.length?'<div class="wlbl" style="margin-top:2px">⭐ Toastmasters · 👋 Guests</div><div class="chips wnames">'+others.map(nb).join("")+'</div>':''); }
  h+='<input class="t" id="wName" list="roster" autocomplete="off" placeholder="'+(ms.length?'Not on the list? Type your name':'Type your name')+'" value="'+esc(ms.some(function(n){return nkey(n)===nkey(nm);})?"":nm)+'">';
  return h;
}
function connStatusHTML(){
  var on=NET.status==="on", n=Math.max(onlinePeople().length,1), h='<div class="wcard" style="text-align:center"><div class="saved">'+(NET.mode==="host"?"Your meeting code — share it with the other roles":"Meeting code")+'</div><div class="code">'+fmtCode(NET.code)+'</div>';
  h+= on ? '<div class="ok">✓ '+(NET.mode==="host"?"Meeting open":"Connected")+' · '+n+' '+(n===1?'person':'people')+' online</div>' : '<div class="'+(NET.status==="err"?"connerr":"saved")+'">'+esc(NET.msg||"Connecting…")+'</div>';
  if(NET.peers.length>1) h+='<ul class="devlist" style="text-align:left">'+onlinePeople().map(function(p){ return '<li>'+peopleRoleNames(p)+(p.name?' — '+esc(p.name):'')+devTag(p)+(p.host?' <span class="saved">(host)</span>':'')+'</li>'; }).join("")+'</ul>';
  if(NET.mode==="host"){ var link=inviteLink(NET.code); h+='<div class="qrwrap">'+qrSvg(link)+'<div class="saved">Others scan this with their phone camera to join</div></div><div class="row" style="justify-content:center;margin-top:6px"><button class="btn" id="wCopyCode">Copy code</button><button class="btn" id="wCopyLink">Copy invite link</button></div>'; }
  return h+'</div>';
}
function welcomeBackHTML(){ var w=welcomeBack0(); return w?w+upcomingHTML(true):""; }
function welcomeBack0(){
  if(!L.setup) return "";
  var nm=L.me||myName(), rs=myRoles().map(roleObj).filter(Boolean); if(!nm&&!rs.length) return "";
  var last=L.lastCode&&!NET.mode?L.lastCode:"";
  return '<div class="wcard wback"><div class="wbh">👋 Welcome back'+(nm?', <b>'+esc(nm)+'</b>':'')+'</div><div class="saved">'+rs.map(function(r){return r.icon+' '+r.name;}).join(" + ")+'</div>'+
    '<div class="row" style="margin-top:10px">'+(NET.mode?'<button class="btn primary big1" id="wDone">Continue →</button>':(last?'<button class="btn primary big1" id="wRejoin">↻ Rejoin '+fmtCode(last)+'</button>':'')+'<button class="btn'+(last?'':' primary')+'" id="wSolo2">Continue'+(last?' offline':'')+'</button>')+'<button class="linkbtn" id="wChange">Change name or role</button></div></div>';
}
function renderWelcome(){
  if(W.step==="guest"){ renderGuestWelcome(); return; }
  var tm=document.querySelector(".logo img").src, co=document.querySelector(".logo.co img").src, who=W.step==="role";
  var h='<div class="wlogos"><img src="'+tm+'" alt="Toastmasters International"><img class="co" src="'+co+'" alt="Dijital Team"></div>'+
        '<h2>Speechcraft Portal</h2><p class="lead">Dijital Team Colombo'+(S.meta.week?' · '+esc(S.meta.week):'')+'</p>';
  if(!W.add) h+='<div class="steps"><button class="stp'+(who?'':' on')+'" id="wToJoin">① Join the meeting</button><span>›</span><span class="stp'+(who?' on':'')+'">② Who are you?</span></div>';
  if(!who){
    if(!W.fresh) h+=welcomeBackHTML();
    if(NET.mode){
      h+=connStatusHTML();
      h+='<div class="wfoot sticky"><button class="linkbtn" id="wLeave">'+(NET.mode==="host"?"Cancel this meeting":"Use a different code")+'</button><button class="btn primary big1" id="wNextWho"'+(NET.mode==="host"||NET.status==="on"&&NET.synced?'':' disabled')+'>Next →</button></div>';
    } else {
      h+='<div class="wcard"><b class="t">Join a meeting</b><div class="saved" style="margin:4px 0 10px">Scan the host’s QR code with your phone camera, or type the code.</div>'+
         '<div class="row"><input class="t" id="wCode" placeholder="e.g. K7Q-M4P" maxlength="9" autocomplete="off" aria-label="Meeting code" value="'+esc(W.code?fmtCode(W.code):"")+'" style="text-transform:uppercase;letter-spacing:3px;font-weight:800;font-size:20px"><button class="btn primary big1" id="wJoin">Join</button></div></div>'+
         '<div class="wcard"><b class="t">Start a new meeting</b><div class="saved" style="margin:4px 0 10px">Usually the Coordinator or Timer. You get a code and QR for the others.</div><button class="btn big1" id="wHost">Host meeting &amp; get code</button></div>'+
         '<div class="wfoot"><span class="row"><button class="linkbtn" id="wSolo">Continue without connecting</button>'+(PRACTICE?'':'<button class="linkbtn" id="wPractice">🎓 Practice meeting</button>')+'</span><span class="saved">🔒 Encrypted direct connection · needs internet</span></div>';
    }
  } else {
    var today=agendaRolesFor(wName().trim());
    if(W.add) h+='<div class="wcard" style="margin-bottom:8px"><b>＋ Add a role</b><div class="saved">Pick the extra role you’re doing today. Your other roles stay open.</div></div>';
    else h+=wNamesHTML();
    h+='<div class="saved" id="wToday" style="margin:10px 0 2px">'+wTodayText(today)+'</div><div id="wGrid">'+roleGridHTML(today)+'</div>';
    h+='<div class="wfoot sticky">'+(W.add?'<button class="linkbtn" id="wCancel">Cancel</button>':'<button class="linkbtn" id="wToJoin2">‹ Meeting</button>')+'<button class="btn primary big1" id="wNext"'+((W.sel||[]).length?'':' disabled')+'>'+wStartLabel()+'</button></div>';
  }
  if(!who) h+='<div class="wlinks"><button class="linkbtn" id="wReport">💬 Report a problem or idea</button><a class="linkbtn" href="'+REPO_URL+'" target="_blank" rel="noopener">Open on GitHub ↗</a><a class="linkbtn" href="'+REPO_URL+'/issues" target="_blank" rel="noopener">Known issues &amp; ideas ↗</a></div>';
  document.getElementById("wbox").innerHTML=h;
}
function wRefreshWho(){ var t=agendaRolesFor(wName().trim()), g=document.getElementById("wGrid"); if(g) g.innerHTML=roleGridHTML(t); var tt=document.getElementById("wToday"); if(tt) tt.innerHTML=wTodayText(t); var nb=document.getElementById("wNext"); if(nb){ nb.textContent=wStartLabel(); nb.disabled=!(W.sel||[]).length; } document.querySelectorAll("[data-wname]").forEach(function(c){ c.classList.toggle("active",nkey(c.dataset.wname)===nkey(wName())); }); }
function wFinish(){
  var sel=(W.sel||[]).slice(); if(!sel.length) return;
  var nmEl=document.getElementById("wName"), nm=W.name!=null?String(W.name).trim():(nmEl?nmEl.value.trim():"");
  if(W.add){ myRoles(); sel.forEach(function(r){ if(L.roles.indexOf(r)<0) L.roles.push(r); }); L.role=sel[0]; W.add=false; }
  else { L.roles=sel; L.role=sel[0]; }
  if(nm){ var keep=L.role; sel.forEach(function(r){ L.role=r; if(nm!==myName()) setMyName(nm); }); L.role=keep; L.me=nm; }
  saveL(); NET.hello(); closeWelcome();
}
var wbox=document.getElementById("wbox");
wbox.addEventListener("input",function(e){ if(e.target.id!=="wName") return; W.name=e.target.value; wRefreshWho(); });
wbox.addEventListener("click",function(e){
  var t=e.target, b;
  if(t.closest("#wPractice")){ location.href=practiceUrl(true); return; }
  if(t.closest("#wReport")){ openFb(); return; }
  if((b=t.closest("[data-wrole]"))){ var r=b.dataset.wrole; W.sel=W.sel||[]; var i=W.sel.indexOf(r); if(i>=0) W.sel.splice(i,1); else W.sel.push(r); wRefreshWho(); return; }
  if((b=t.closest("[data-wname]"))){ W.name=b.dataset.wname; var ni=document.getElementById("wName"); if(ni) ni.value=""; var td=agendaRolesFor(W.name); if(!W.add) W.sel=td.slice(); wRefreshWho(); return; }
  if(t.closest("#wSelToday")){ W.sel=uniq((W.sel||[]).concat(agendaRolesFor(wName().trim()))); wRefreshWho(); return; }
  if(t.closest("#wNext")){ wFinish(); return; }
  if(t.closest("#wNextWho")||t.closest("#wChange")){ W.step="role"; renderWelcome(); return; }
  if(t.closest("#wToJoin")||t.closest("#wToJoin2")){ if(W.add) return; W.step="connect"; renderWelcome(); return; }
  if(t.closest("#wCancel")){ W.add=false; closeWelcome(); return; }
  if(t.closest("#wJoin")){ var code=cleanCode(document.getElementById("wCode").value); if(code.length!==6){ alert("The meeting code has 6 letters/numbers, e.g. K7Q-M4P."); return; } W.code=code; W.advance=true; startJoin(code); renderWelcome(); return; }
  if(t.closest("#wHost")){ startHost(makeCode()); renderWelcome(); return; }
  if(t.closest("#wRejoin")){ var lc=L.lastCode; W.code=lc; if(L.lastHost) startHost(lc); else startJoin(lc); W.auto=true; renderWelcome(); return; }
  if(t.closest("#wSolo2")){ closeWelcome(); return; }
  if(t.closest("#wSolo")){ if(L.setup&&!W.fresh){ closeWelcome(); return; } W.step="role"; renderWelcome(); return; }
  if(t.closest("#wDone")){ closeWelcome(); return; }
  if(t.closest("#wLeave")){ stopNet(false); W.code=""; W.step="connect"; document.getElementById("welcome").classList.add("on"); renderWelcome(); return; }
  if(t.closest("#wCopyCode")){ try{ navigator.clipboard.writeText(fmtCode(NET.code)); t.textContent="Copied ✓"; }catch(err){} return; }
  if(t.closest("#wCopyLink")){ try{ navigator.clipboard.writeText(inviteLink(NET.code)); t.textContent="Link copied ✓"; }catch(err){} return; }
});
wbox.addEventListener("keydown",function(e){
  if(e.key!=="Enter") return;
  if(e.target.id==="wCode"){ e.preventDefault(); document.getElementById("wJoin").click(); }
  if(e.target.id==="wName"){ e.preventDefault(); var b=document.getElementById("wNext"); if(b&&!b.disabled) b.click(); }
});

