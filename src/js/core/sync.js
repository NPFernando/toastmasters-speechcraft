/* ---------- live sync between devices ----------
   Devices find each other through public Nostr relays (several at once, for redundancy) using Trystero,
   then talk directly over WebRTC data channels, which are always encrypted. The meeting code is used
   as the room password, so even the connection set-up messages on the relays are encrypted with it. */
var APP_ID="dijitalteam-speechcraft-v2";
var NET={room:null,act:null,mode:null,code:"",status:"off",msg:"",info:{},peers:[],synced:false,decided:false,pushT:null,relayT:null,
  push:function(){ if(!NET.room) return; clearTimeout(NET.pushT); NET.pushT=setTimeout(function(){ sendAll({t:"state",state:S}); },120); },
  hello:function(){ if(!NET.room) return; sendAll({t:"who",role:L.role,roles:myRoles(),name:myName(),v:APP_VERSION}); refreshPeers(); }
};
function flags(m){ m.host=NET.mode==="host"; m.synced=NET.synced||NET.mode==="host"; if(PRACTICE) m.pr=1; return m; }
function sendAll(m){ try{ if(NET.act) NET.act.send(flags(m)); }catch(e){} }
function sendTo(pid,m){ try{ if(NET.act) NET.act.send(flags(m),{target:pid}); }catch(e){} }
function makeCode(){ var A="ABCDEFGHJKMNPQRSTUVWXYZ23456789", s="", r=new Uint8Array(6); (window.crypto||window.msCrypto).getRandomValues(r); for(var i=0;i<6;i++) s+=A[r[i]%A.length]; return s; }
function fmtCode(c){ return c.slice(0,3)+"-"+c.slice(3); }
function cleanCode(s){ return String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,""); }
function setStatus(st,msg){ NET.status=st; NET.msg=msg||""; renderConnBtn(); renderRoles(); if(document.getElementById("connModal").classList.contains("on")) renderConnBox(); refreshWelcome(); }
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
    if(list.length>1 || NET.mode==="host") setStatus("on");
    else if(NET.status!=="wait") setStatus("wait", NET.synced?"Waiting for the others to reconnect…":"Looking for meeting "+fmtCode(NET.code)+"…");
    else { renderConnBtn(); renderRoles(); refreshWelcome(); }
  }
}
function relayCount(){ try{ var m=Trystero.getRelaySockets(); return Object.keys(m).filter(function(k){ return m[k]&&m[k].readyState===1; }).length; }catch(e){ return -1; } }
function startMeeting(code,asHost){
  stopNet(true);
  if(typeof Trystero==="undefined"){ setStatus("err","The connection library didn't load."); return; }
  NET.mode=asHost?"host":"join"; NET.code=code; NET.info={}; NET.peers=[]; L.lastCode=code; L.lastHost=!!asHost; NET.synced=!!asHost; NET.decided=!!asHost;
  L.conn={mode:NET.mode,code:code}; saveL();
  var cfg={appId:APP_ID,password:"dtc-speechcraft|"+code};
  try{ var q=new URLSearchParams(location.search).get("relay"); if(q) cfg.relayConfig={urls:[q],redundancy:1}; }catch(e){}
  try{ NET.room=Trystero.joinRoom(cfg,"meeting-"+code.toLowerCase()); }
  catch(e){ setStatus("err","Couldn't start the connection: "+(e&&e.message||e)); return; }
  NET.act=NET.room.makeAction("m");
  NET.act.onMessage=function(data,ctx){ onMsg(ctx&&ctx.peerId,data); };
  NET.room.onPeerJoin=function(pid){ sendTo(pid,{t:"hello",role:L.role,roles:myRoles(),name:myName(),v:APP_VERSION,state:S}); };
  NET.room.onPeerLeave=function(pid){ delete NET.info[pid]; refreshPeers(); };
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
  clearTimeout(NET.relayT); clearTimeout(NET.pushT);
  if(NET.room){ try{ sendAll({t:"bye"}); }catch(e){} var r=NET.room; NET.room=null; NET.act=null; try{ r.leave(); }catch(e){} }
  NET.info={}; NET.peers=[];
  if(!keep){ NET.mode=null; NET.code=""; L.conn=null; saveL(); setStatus("off"); renderAll(); }
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
    if(!known && m.t!=="hello") sendTo(pid,{t:"hello",role:L.role,roles:myRoles(),name:myName(),v:APP_VERSION,state:S});
    refreshPeers();
  } else { known.last=now(); known.host=!!m.host; if(Array.isArray(m.roles)) known.roles=m.roles.slice(0,12).map(String); }
  if(m.t==="pingrt"){ sendTo(pid,{t:"pongrt",ts:m.ts}); return; }
  if(m.t==="pongrt"){ CC.rtt[pid]=Math.max(0,now()-(+m.ts||now())); renderCC(); return; }
  if(m.t==="ping") return;
  if(m.state&&typeof m.state==="object"){
    var remote; try{ remote=normalize(clone(m.state)); }catch(e){ return; }
    var meSynced=NET.synced||NET.mode==="host", themSynced=!!(m.synced||m.host), mode;
    if(remote.mid!==S.mid){
      if(meSynced && !themSynced) mode="keep";                 /* they'll take our meeting */
      else if(!meSynced && !themSynced) mode="keep";           /* two newcomers: wait for the meeting */
      else if(!meSynced && themSynced){                         /* first contact with the meeting */
        if(NET.decided || meetingEmpty(S) || (L.syncedMid===S.mid && remote.midU>S.midU)) mode="adopt";
        else mode = confirm(describeMeeting(S)+" is on this device.\n\nOK = bring it into this meeting\nCancel = discard it and use the meeting's data") ? "absorb" : "adopt";
        NET.decided=true;
      }
    }
    var changed=mergeInto(S,remote,mode);
    if(S.mid===remote.mid && (themSynced||meSynced)){ if(!NET.synced){ NET.synced=true; refreshPeers(); } if(L.syncedMid!==S.mid){ L.syncedMid=S.mid; saveL(); } }
    if(changed){ save(); softRender(); wake(); }
    if(stable(S)!==stable(remote)) sendTo(pid,{t:"state",state:S});
  }
}
/* heartbeat: keep the online list honest when a phone locks or loses signal */
setInterval(function(){ if(!NET.room) return; sendAll({t:"ping",role:L.role,roles:myRoles(),name:myName()}); refreshPeers(); },5000);
function sayBye(){ if(NET.room) sendAll({t:"bye"}); }
function describeMeeting(st){
  var parts=[], sp=0; SESSIONS.forEach(function(s){ sp+=st.rows[s.id].length; });
  if(sp) parts.push(sp+" timer speaker"+(sp>1?"s":"")); if(st.topics.length) parts.push(st.topics.length+" topic"+(st.topics.length>1?"s":""));
  if(st.ahRows.length) parts.push(st.ahRows.length+" Ah-Counter speaker"+(st.ahRows.length>1?"s":"")); if(st.gramRows.length||st.gram.wotd) parts.push("Grammarian notes");
  return "Data from "+(st.meta.week||"another meeting")+" ("+parts.join(", ")+")";
}
function roleName(id){ var r=ROLES.find(function(x){return x.id===id;}); return r?r.icon+" "+r.name:"Device"; }
function renderConnBtn(){
  var b=document.getElementById("connBtn"), tx=document.getElementById("connTxt");
  b.className="conn"+(NET.status==="on"?" on":NET.status==="wait"?" wait":NET.status==="err"?" err":"");
  if(!NET.mode) tx.textContent="Not connected";
  else if(NET.status==="on") tx.textContent=fmtCode(NET.code)+" · "+Math.max(onlinePeople().length,1)+" online";
  else tx.textContent=NET.status==="err"?"Connection problem":"Connecting "+fmtCode(NET.code)+"…";
}
function renderConnBox(){
  var h="";
  if(!NET.mode){
    h+='<h3>Connect devices</h3><p class="muted" style="margin-top:0">Link the Timer, Table Topics Master, Ah-Counter and Grammarian so everyone sees the same speakers, topics and results live.</p>'+
       '<div class="card" style="margin-bottom:10px"><b>Host this meeting</b><div class="saved" style="margin:4px 0 8px">Usually the Coordinator or Timer. You get a code and QR for the others.</div><button class="btn primary" id="hostBtn">Host meeting &amp; get code</button></div>'+
       '<div class="card"><b>Join a meeting</b><div class="saved" style="margin:4px 0 8px">Type the code the host gives you.</div><div class="row"><input class="t" id="joinCode" placeholder="e.g. K7Q-M4P" maxlength="9" style="text-transform:uppercase;letter-spacing:2px;font-weight:700"><button class="btn primary" id="joinBtn">Join</button></div></div>';
  } else {
    h+='<h3>'+(NET.mode==="host"?"You're hosting this meeting":"Connected to meeting")+'</h3>';
    h+='<div class="saved">Share the code, or let people scan a QR code below with their phone camera.</div>';
    h+='<div class="code">'+fmtCode(NET.code)+'</div>';
    if(NET.status!=="on") h+='<div class="'+(NET.status==="err"?"connerr":"saved")+'">'+esc(NET.msg||"Connecting…")+'</div>';
    if(NET.peers.length){ var ppl=onlinePeople(); h+='<b>Online: '+ppl.length+' '+(ppl.length===1?'person':'people')+' on '+NET.peers.length+' device'+(NET.peers.length===1?'':'s')+'</b><ul class="devlist">'+ppl.map(function(p){ return '<li>'+peopleRoleNames(p)+(p.name?' — '+esc(p.name):'')+devTag(p)+(p.me?' <span class="saved">(you)</span>':'')+(p.host?' <span class="saved">(started the meeting)</span>':'')+'</li>'; }).join("")+'</ul>'; }
    var rr=ROLES.find(function(x){return x.id===L.role;});
    h+='<div class="qrpair"><div><b>Others join</b>'+qrSvg(inviteLink(NET.code))+'<div class="saved">They scan, then pick their role</div></div>'+
       '<div><b>📱 My role on my phone</b>'+qrSvg(roleLink(NET.code,L.role))+'<div class="saved">Opens as '+rr.icon+' '+rr.name+' with the same data</div></div></div>';
    h+='<div class="row" style="justify-content:space-between;margin-top:10px"><span class="row"><button class="btn" id="copyCode">Copy code</button><button class="btn" id="copyLink">Copy invite link</button></span><button class="btn" id="leaveBtn">Leave meeting</button></div>';
  }
  h+='<div class="note">🔒 Devices connect directly to each other and the link is encrypted (WebRTC). Public Nostr relays only help devices find each other, and even those messages are encrypted with your meeting code. Your meeting data never passes through them. Needs internet on every device. If a strict office network blocks it, use the same Wi-Fi or a phone hotspot. Anyone can close the page; the others stay connected.</div>'+
     '<div style="text-align:right;margin-top:10px"><button class="btn" id="connClose">Close</button></div>';
  document.getElementById("connBox").innerHTML=h;
}
document.getElementById("connBtn").addEventListener("click",function(){ renderConnBox(); document.getElementById("connModal").classList.add("on"); var j=document.getElementById("joinCode"); if(j) j.focus(); });
document.getElementById("connBox").addEventListener("click",function(e){
  var t=e.target;
  if(t.closest("#hostBtn")){ startHost(makeCode()); renderConnBox(); }
  else if(t.closest("#joinBtn")){ var c=cleanCode(document.getElementById("joinCode").value); if(c.length!==6){ alert("The code has 6 letters/numbers, e.g. K7Q-M4P."); return; } startJoin(c); renderConnBox(); }
  else if(t.closest("#leaveBtn")){ if(confirm("Leave this meeting on this device? The others stay connected, and you keep your data.")){ stopNet(false); renderConnBox(); } }
  else if(t.closest("#copyCode")){ try{ navigator.clipboard.writeText(fmtCode(NET.code)); t.textContent="Copied"; }catch(err){} }
  else if(t.closest("#copyLink")){ try{ navigator.clipboard.writeText(inviteLink(NET.code)); t.textContent="Link copied"; }catch(err){} }
  else if(t.closest("#connClose")) document.getElementById("connModal").classList.remove("on");
});
document.getElementById("connBox").addEventListener("keydown",function(e){ if(e.key==="Enter"&&e.target.id==="joinCode"){ e.preventDefault(); document.getElementById("joinBtn").click(); } });

