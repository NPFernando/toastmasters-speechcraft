/* ---------- live sync between devices ----------
   Devices find each other through public Nostr relays (several at once, for redundancy) using Trystero,
   then talk directly over WebRTC data channels, which are always encrypted. The meeting code is used
   as the room password, so even the connection set-up messages on the relays are encrypted with it. */
var APP_ID="dijitalteam-speechcraft-v2";
var NET={room:null,act:null,mode:null,code:"",status:"off",msg:"",info:{},peers:[],synced:false,decided:false,pushT:null,relayT:null,
  push:function(){ if(!NET.room||!NET.synced) return; clearTimeout(NET.pushT); NET.pushT=setTimeout(function(){ sendAll({t:"state",state:S}); },120); },
  hello:function(){ if(!NET.room) return; sendAll({t:"who",role:L.role,roles:myRoles(),name:myName(),v:APP_VERSION}); refreshPeers(); }
};
function flags(m){ m.host=NET.mode==="host"; m.synced=NET.synced||NET.mode==="host"; if(PRACTICE) m.pr=1; return m; }
function sendAll(m){ try{ if(NET.act) NET.act.send(flags(m)); }catch(e){} }
function sendTo(pid,m){ try{ if(NET.act) NET.act.send(flags(m),{target:pid}); }catch(e){} }
var timerClockProbe=null;
function probeTimerClock(){
  var active=runningList()[0], peer=active?.r.clockOwner, t=now();
  if(!NET.synced||!peer||peer===timerClockOwner()||!NET.info[peer]) return;
  if(timerClockProbe?.peer===peer&&t-timerClockProbe.sent<3000) return;
  timerClockProbe={peer:peer,sent:t};
  sendTo(peer,{t:"timer-clock-request",sent:t});
}
function makeCode(){ var A="ABCDEFGHJKMNPQRSTUVWXYZ23456789", s="", r=new Uint8Array(6); (window.crypto||window.msCrypto).getRandomValues(r); for(var i=0;i<6;i++) s+=A[r[i]%A.length]; return s; }
function fmtCode(c){ return c.slice(0,3)+"-"+c.slice(3); }
function cleanCode(s){ return String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,""); }
function setStatus(st,msg){ NET.status=st; NET.msg=msg||""; refreshDashboardOnline(); renderConnBtn(); renderRoles(); if(document.getElementById("connModal").classList.contains("on")) renderConnBox(); refreshWelcome(); }
/* the same person on several devices (e.g. laptop + phone) counts once */
function onlinePeople(){
  var out=[], by={};
  (NET.peers||[]).forEach(function(p){
    var rl=Array.isArray(p.roles)&&p.roles.length?p.roles.slice():[p.role];
    var k=String(p.name||"").trim()?"n|"+nkey(p.name):"r|"+rl.slice().sort().join(",");
    var g=by[k]; if(!g){ g=by[k]={name:p.name||"",roles:[],host:false,me:false,devices:0}; out.push(g); }
    rl.forEach(function(r){ if(g.roles.indexOf(r)<0) g.roles.push(r); });
    g.host=g.host||!!p.host; g.me=g.me||!!p.me; g.devices++;
  });
  return out;
}
function devTag(g){ return g.devices>1?' <span class="saved">· '+g.devices+' devices</span>':''; }
function peopleRoleNames(g){ return g.roles.map(roleName).join(" + "); }
function refreshPeers(){
  var t=now(), list=[{role:L.role,roles:myRoles(),name:myName(),host:NET.mode==="host",me:true}];
  Object.keys(NET.info).forEach(function(id){ var p=NET.info[id]; if(t-p.last<20000) list.push(p); });
  NET.peers=list; refreshHealth();
  /* who's connected changed: refresh the Coordinator's role-player dots */
  var osig=list.map(function(p){return nkey(p.name||"");}).sort().join("|");
  if(osig!==NET.onSig){ NET.onSig=osig; if(L.role==="coord"&&curView()==="role"&&coTab()==="setup") laterRender(); }
  if(NET.room){
    if(NET.mode==="join"&&NET.synced&&list.length===1) NET.awaitingSnapshot=true;
    if(NET.mode==="host" || (list.length>1 && NET.synced&&!NET.awaitingSnapshot)) setStatus("on");
    else if(list.length>1) setStatus("wait","Connected to a device. Waiting for the shared meeting data…");
    else if(NET.status!=="wait") setStatus("wait", NET.synced?"Waiting for the others to reconnect…":"Looking for meeting "+fmtCode(NET.code)+"…");
    else { refreshDashboardOnline(); renderConnBtn(); renderRoles(); refreshWelcome(); }
  }
}
function relayCount(){ try{ var m=Trystero.getRelaySockets(); return Object.keys(m).filter(function(k){ return m[k]&&m[k].readyState===1; }).length; }catch(e){ return -1; } }
function startMeeting(code,asHost){
  stopNet(true);
  if(typeof Trystero==="undefined"){ setStatus("err","The connection library didn't load."); return; }
  NET.mode=asHost?"host":"join"; NET.code=code; NET.info={}; NET.peers=[]; L.lastCode=code; L.lastHost=!!asHost; NET.synced=!!asHost; NET.awaitingSnapshot=!asHost; NET.lastSync=0; NET.decided=!!asHost;
  L.conn={mode:NET.mode,code:code}; saveL();
  var cfg={appId:APP_ID,password:"dtc-speechcraft|"+code};
  try{ var q=new URLSearchParams(location.search).get("relay"); if(q) cfg.relayConfig={urls:[q],redundancy:1}; }catch(e){}
  try{ NET.room=Trystero.joinRoom(cfg,"meeting-"+code.toLowerCase()); }
  catch(e){ setStatus("err","Couldn't start the connection: "+(e&&e.message||e)); return; }
  var room=NET.room;
  NET.act=room.makeAction("m");
  NET.act.onMessage=function(data,ctx){ if(NET.room===room) onMsg(ctx&&ctx.peerId,data); };
  room.onPeerJoin=function(pid){
    if(NET.room!==room) return;
    sendHello(pid);
    if(NET.awaitingSnapshot) sendTo(pid,{t:"state-request"});
  };
  room.onPeerLeave=function(pid){ if(NET.room===room){ delete NET.info[pid]; refreshPeers(); } };
  setStatus(asHost?"on":"wait", asHost?"":"Looking for meeting "+fmtCode(code)+"…");
  refreshPeers();
  clearTimeout(NET.relayT);
  NET.relayT=setTimeout(function check(){
    if(!NET.room) return;
    var n=relayCount();
    if(n===0 && NET.peers.length<2) setStatus("wait","Can't reach the matchmaking network yet – check this device's internet connection…");
    else if(NET.mode==="join" && NET.peers.length<2) setStatus("wait","Looking for meeting "+fmtCode(code)+"… make sure the code is right and the host's page is open.");
    NET.relayT=setTimeout(check,8000);
  },8000);
}
function startHost(code){ startMeeting(code,true); }
function startJoin(code){ startMeeting(code,false); }
function stopNet(keep){
  if(!keep) NET.reconnecting=false;
  clearTimeout(NET.relayT); clearTimeout(NET.pushT);
  if(NET.room){ try{ sendAll({t:"bye"}); }catch(e){} var r=NET.room; NET.room=null; NET.act=null; try{ r.leave(); }catch(e){} }
  NET.info={}; NET.peers=[]; NET.synced=false; timerClockProbe=null;
  if(!keep){ NET.mode=null; NET.code=""; L.conn=null; saveL(); setStatus("off"); renderAll(); }
}
function sendHello(pid){
  var message={t:"hello",role:L.role,roles:myRoles(),name:myName(),v:APP_VERSION};
  if(NET.synced) message.state=S;
  sendTo(pid,message);
}
var prSwitching=false;
function onMsg(pid,m){
  if(!pid||!m||typeof m!=="object") return;
  /* never mix the practice meeting with real data: a real device that joins a practice code moves into practice mode; a practice device ignores a real meeting */
  if(!!m.pr!==PRACTICE){
    /* only a joining device reacts, and only to the host; the host just ignores the wrong kind of device */
    if(NET.mode==="host"||!m.host) return;
    if(m.pr&&!PRACTICE){ if(!prSwitching&&NET.code){ prSwitching=true; var code=NET.code; try{ stopNet(true); }catch(e){} showToastMsg("That’s a practice meeting — opening it in practice mode"); setTimeout(function(){ location.href=practiceUrl(true)+"#join="+fmtCode(code); },600); } }
    else if(!m.pr&&PRACTICE){ if(!prSwitching){ prSwitching=true; try{ stopNet(true); }catch(e){} alert("That code is a real meeting, not the practice meeting.\n\nTap “Leave practice” first, then join with the code."); prSwitching=false; } }
    return;
  }
  var known=NET.info[pid];
  if(m.t==="bye"){ delete NET.info[pid]; refreshPeers(); return; }
  if(m.t==="hello"||m.t==="who"||m.t==="ping"||!known){
    NET.info[pid]={roles:Array.isArray(m.roles)?m.roles.slice(0,12).map(String):(known&&known.roles)||null,role:String(m.role||(known&&known.role)||"").slice(0,10),name:String(m.name!=null?m.name:(known&&known.name)||"").slice(0,60),host:!!m.host,v:String(m.v||(known&&known.v)||"").slice(0,40),last:now()};
    if(!known && m.t!=="hello") sendHello(pid);
    refreshPeers();
  } else { known.last=now(); known.host=!!m.host; if(Array.isArray(m.roles)) known.roles=m.roles.slice(0,12).map(String); }
  if(m.t==="timer-clock-request"){ sendTo(pid,{t:"timer-clock-response",sent:m.sent,clock:now()}); return; }
  if(m.t==="timer-clock-response"){
    if(timerClockProbe?.peer===pid&&timerClockProbe.sent===m.sent) recordTimerClockOffset(pid,m.sent,m.clock,now());
    return;
  }
  if(m.t==="pingrt"){ sendTo(pid,{t:"pongrt",ts:m.ts}); return; }
  if(m.t==="pongrt"){ CC.rtt[pid]=Math.max(0,now()-(+m.ts||now())); renderCC(); return; }
  if(m.t==="state-request"){ if(NET.synced) sendTo(pid,{t:"state",state:S}); return; }
  if(!m.state||typeof m.state.mid!=="string"||!m.state.mid||!(m.host||m.synced)) return;
  var remote; try{ remote=normalize(clone(m.state)); }catch(e){ return; }
  var changed=false;
  var newMeeting=remote.mid!==S.mid;
  if(newMeeting){
    /* Only an already synced peer can provide the first copy. After that, the host can switch meetings. */
    if(NET.synced&&(NET.mode==="host"||!m.host)) return;
    if(!PRACTICE) autoSaveRecord("Before joining "+fmtCode(NET.code),true);
    S=remote;
    timerConflictMessage="";
    reconcileTimerTurns(S);
    selectRolesForNewMeeting();
    shadowSync();
    changed=true;
  } else {
    changed=mergeInto(S,remote);
  }
  var first=!NET.synced||NET.awaitingSnapshot;
  NET.synced=true; NET.awaitingSnapshot=false; NET.reconnecting=false; NET.lastSync=now();
  if(L.syncedMid!==S.mid){ L.syncedMid=S.mid; saveL(); }
  probeTimerClock();
  if(changed){ save(); softRender(); wake(); }
  if(first||newMeeting){ refreshPeers(); NET.hello(); }
  W.inviteRole=null;
  if(stable(S)!==stable(remote)) sendTo(pid,{t:"state",state:S});
}
/* Retry the initial snapshot separately from transport liveness. */
setInterval(function(){
  if(!NET.room) return;
  sendAll({t:"ping",role:L.role,roles:myRoles(),name:myName()});
  if(NET.awaitingSnapshot) sendAll({t:"state-request"});
  probeTimerClock();
  refreshPeers();
},5000);
window.addEventListener("offline",function(){
  if(NET.mode!=="join"||!NET.room) return;
  NET.reconnecting=NET.synced;
  stopNet(true);
  setStatus("wait","Network disconnected. Reconnecting when you’re back online…");
});
window.addEventListener("online",function(){
  if(NET.mode==="join"&&!NET.room&&NET.code) startJoin(NET.code);
});
function sayBye(){ if(NET.room) sendAll({t:"bye"}); }
function describeMeeting(st){
  var parts=[], sp=0; SESSIONS.forEach(function(s){ sp+=st.rows[s.id].length; });
  if(sp) parts.push(sp+" timer speaker"+(sp>1?"s":"")); if(st.topics.length) parts.push(st.topics.length+" topic"+(st.topics.length>1?"s":""));
  if(st.ahRows.length) parts.push(st.ahRows.length+" Ah-Counter speaker"+(st.ahRows.length>1?"s":"")); if(st.gramRows.length||st.gram.wotd) parts.push("Grammarian notes");
  return "Data from "+(st.meta.week||"another meeting")+" ("+parts.join(", ")+")";
}
function roleName(id){ var r=ROLES.find(function(x){return x.id===id;}); return r?r.icon+" "+r.name:"Device"; }
function syncStatusLabel(){
  if(!NET.mode) return "Not connected";
  if(NET.status==="err") return "Connection problem";
  if(NET.status==="on") return NET.mode==="host"&&NET.peers.length<2?"Hosting":"Synced";
  if(NET.synced||NET.reconnecting) return "Reconnecting";
  return NET.peers.length>1?"Waiting for meeting data":"Connecting";
}
function renderConnBtn(){
  var b=document.getElementById("connBtn"), tx=document.getElementById("connTxt");
  b.className="conn"+(NET.status==="on"?" on":NET.status==="wait"?" wait":NET.status==="err"?" err":"");
  tx.textContent=syncStatusLabel()+(NET.mode?" · "+fmtCode(NET.code):"")+(NET.status==="on"&&NET.peers.length>1?" · "+onlinePeople().length+" online":"");
  b.title=NET.lastSync?"Last meeting data received at "+new Date(NET.lastSync).toLocaleTimeString():syncStatusLabel();
}
function renderConnBox(){
  var h="", box=document.getElementById("connBox"), title=NET.mode+":"+NET.code+":"+NET.synced;
  if(!NET.mode){
    h+='<h3>Connect devices</h3><p class="muted" style="margin-top:0">Link the Timer, Table Topics Master, Ah-Counter and Grammarian so everyone sees the same speakers, topics and results live.</p>'+
       '<div class="card" style="margin-bottom:10px"><b>Host this meeting</b><div class="saved" style="margin:4px 0 8px">Usually the Coordinator or Timer. You get a code and QR for the others.</div><button class="btn primary" id="hostBtn">Host meeting &amp; get code</button></div>'+
       '<div class="card"><b>Join a meeting</b><div class="saved" style="margin:4px 0 8px">Type the code the host gives you.</div><div class="row"><input class="t" id="joinCode" placeholder="e.g. K7Q-M4P" maxlength="9" style="text-transform:uppercase;letter-spacing:2px;font-weight:700"><button class="btn primary" id="joinBtn">Join</button></div></div>';
  } else {
    h+='<h3>'+(NET.mode==="host"?"You're hosting this meeting":(NET.synced?"Connected to meeting":"Joining meeting"))+'</h3>';
    var live='<div role="status"><b>'+syncStatusLabel()+'</b>'+
      (NET.lastSync?' <span class="saved">· Last meeting data received at '+esc(new Date(NET.lastSync).toLocaleTimeString())+'</span>':'')+'</div>';
    if(NET.status!=="on") live+='<div class="'+(NET.status==="err"?"connerr":"saved")+'">'+esc(NET.msg||"Connecting…")+'</div>';
    if(NET.peers.length){ var ppl=onlinePeople(); live+='<b>Online: '+ppl.length+' '+(ppl.length===1?'person':'people')+' on '+NET.peers.length+' device'+(NET.peers.length===1?'':'s')+'</b><ul class="devlist">'+ppl.map(function(p){ return '<li>'+peopleRoleNames(p)+(p.name?' — '+esc(p.name):'')+devTag(p)+(p.me?' <span class="saved">(you)</span>':'')+(p.host?' <span class="saved">(started the meeting)</span>':'')+'</li>'; }).join("")+'</ul>'; }
    var devices=box.querySelector(".conn-devices");
    if(box.connectionTitle===title&&devices){
      if(devices.liveHTML!==live){ devices.innerHTML=live; devices.liveHTML=live; }
      return;
    }
    var link=inviteLink(NET.code), qr=qrSvg(link);
    h+='<section class="conn-share card'+(qr?'':' no-qr')+'" aria-label="Share this meeting"><div class="conn-invite">'+
      '<h4>Invite others</h4><div class="saved">Share this code or copy the invite link.</div>'+
      '<div class="code">'+fmtCode(NET.code)+'</div>'+
      '<div class="row"><button class="btn" id="copyCode">Copy code</button><button class="btn primary" id="copyLink">Copy invite link</button></div></div>'+
      (qr?'<figure class="conn-qr"><figcaption>Scan to join</figcaption>'+qr+'</figure>':'')+
      '<div id="connCopyStatus" class="saved" role="status"></div></section>';
    h+='<section class="conn-devices" aria-label="Connected devices">'+live+'</section>';
  }
  h+='<details class="note conn-help"><summary>How devices connect</summary><p>Devices need internet access and exchange meeting data directly over encrypted WebRTC. Public Nostr relays help devices find each other. If an office network blocks the connection, try a phone hotspot. You can close this page while others stay connected.</p></details>'+
     '<div class="row conn-footer">'+(NET.mode?'<button class="btn danger" id="leaveBtn">Leave meeting</button>':'')+'<button class="btn" id="connClose">Close</button></div>';
  box.connectionTitle=title;
  box.innerHTML=h;
  if(NET.mode) box.querySelector(".conn-devices").liveHTML=live;
}
document.getElementById("connBtn").addEventListener("click",function(){ renderConnBox(); document.getElementById("connModal").classList.add("on"); var j=document.getElementById("joinCode"); if(j) j.focus(); });
document.getElementById("connBox").addEventListener("click",function(e){
  var t=e.target;
  if(t.closest("#hostBtn")){ startHost(makeCode()); renderConnBox(); }
  else if(t.closest("#joinBtn")){ var c=cleanCode(document.getElementById("joinCode").value); if(c.length!==6){ alert("The code has 6 letters/numbers, e.g. K7Q-M4P."); return; } document.getElementById("connModal").classList.remove("on"); W.code=c; W.advance=!L.setup; W.auto=!!L.setup; startJoin(c); openWelcome("connect"); }
  else if(t.closest("#leaveBtn")){ if(confirm("Leave this meeting on this device? The others stay connected, and you keep your data.")){ stopNet(false); renderConnBox(); } }
  else if(t.closest("#copyCode,#copyLink")){
    var copyingCode=!!t.closest("#copyCode"), status=document.getElementById("connCopyStatus");
    Promise.resolve().then(function(){ return navigator.clipboard.writeText(copyingCode?fmtCode(NET.code):inviteLink(NET.code)); }).then(function(){
      status.textContent=copyingCode?"Meeting code copied.":"Invite link copied.";
    },function(){ status.textContent="Couldn’t copy. Share the meeting code shown above."; });
  }
  else if(t.closest("#connClose")) document.getElementById("connModal").classList.remove("on");
});
document.getElementById("connBox").addEventListener("keydown",function(e){ if(e.key==="Enter"&&e.target.id==="joinCode"){ e.preventDefault(); document.getElementById("joinBtn").click(); } });

