/* ---------- co-organisers: invite someone to edit the meeting set-up with you ----------
   The Coordinator creates a personal invite code for each co-organiser. Only a hash of it is shared
   with the meeting. Their device unlocks the Coordinator area with it, without knowing the PIN,
   and the Coordinator can remove that access at any time. */
var lastInvite=null;
function coRec(id){ return S.coorg.find(function(c){return c.id===id;}); }
function coActive(){ return S.coorg.filter(function(c){return !c.revoked;}); }
function myCo(){ var m=/^co:([^:]+):(.+)$/.exec(L.coordOK||""); if(!m) return null; var c=coRec(m[1]); return c&&!c.revoked&&c.hash===m[2]?c:null; }
function isMainCoord(){ return !!(S.pin.hash && L.coordOK===S.pin.hash); }
function inviteCodeFmt(c){ return c.slice(0,4)+"-"+c.slice(4); }
function createInvite(name){
  var code=(makeCode()+makeCode()).slice(0,8), salt=uid();
  return sha("co|"+salt+"|"+code).then(function(h){
    var rec={id:uid(),name:name,salt:salt,hash:h,by:myName()||"Coordinator",at:now(),revoked:false,ord:maxOrd(S.coorg)+1,u:now()};
    S.coorg.push(rec); lastInvite={id:rec.id,name:name,code:code}; commit();
  }).catch(function(e){ alert(e.message||e); });
}
function tryCoCode(code){
  code=cleanCode(code); if(code.length!==8) return Promise.resolve(false);
  var list=coActive(); if(!list.length) return Promise.resolve(false);
  return Promise.all(list.map(function(c){ return sha("co|"+c.salt+"|"+code).then(function(h){ return h===c.hash?c:null; }); })).then(function(r){
    var c=r.filter(Boolean)[0]; if(!c) return false;
    L.coordOK="co:"+c.id+":"+c.hash; delete L.pendingCo; if(!L.me&&c.name) L.me=c.name; saveL(); NET.hello(); renderAll(); showToastMsg("✓ You're a co-organiser — you can edit the meeting set-up"); return true;
  }).catch(function(){ return false; });
}
/* an invite link opened before the meeting data has arrived: keep trying as it syncs */
setInterval(function(){ if(L.pendingCo && !coordUnlocked() && coActive().length) tryCoCode(L.pendingCo); },1500);
function coLink(code){ return NET.code ? roleLink(NET.code,"coord")+"&co="+code : ""; }
function coorgHTML(){
  var main=isMainCoord(), me=myCo(), h='<section class="card" style="margin-top:12px"><h2 class="sec" style="margin-top:0">👥 Co-organisers <span class="cnt">edit the agenda, role players and members with you</span></h2>';
  if(me) h+='<div class="note" style="margin-top:0">You’re a co-organiser'+(me.by?' (invited by '+esc(me.by)+')':'')+'. Changes you make sync to everyone.</div>';
  var list=S.coorg;
  if(list.length) h+='<div class="glist">'+list.map(function(c){
    var on=!c.revoked && (NET.peers||[]).some(function(p){ var rl=Array.isArray(p.roles)?p.roles:[p.role]; return rl.indexOf("coord")>=0 && nkey(p.name)===nkey(c.name); });
    return '<div class="grow'+(c.revoked?'':' on')+'"><div><b>'+esc(c.name)+'</b> <span class="saved">'+(c.revoked?'· access removed':on?'· <span class="dotg"></span>editing now':'· invited')+'</span></div>'+
      (main&&!c.revoked?'<button class="btn sm ghost" data-corevoke="'+c.id+'">Remove access</button>':'')+'</div>';
  }).join("")+'</div>';
  else if(main) h+='<div class="note" style="margin-top:0">No co-organisers yet.</div>';
  if(main){
    if(lastInvite && coRec(lastInvite.id) && !coRec(lastInvite.id).revoked){
      var link=coLink(lastInvite.code);
      h+='<div class="selcard" style="margin-top:10px;text-align:center"><b>Invite for '+esc(lastInvite.name)+'</b>'+
        (link?'<div class="qrwrap">'+qrSvg(link)+'<div class="saved">They scan this with their phone camera. It opens the meeting and unlocks the set-up for them.</div></div><div class="row" style="justify-content:center"><button class="btn" data-cocopy="link">Copy invite link</button></div>':
              '<div class="note">Start or join the meeting first (connection button at the top) so their device can sync with yours.</div>')+
        '<div class="saved" style="margin-top:8px">Or they open the page, choose 🗂 Coordinator, join the meeting and type this invite code:</div><div class="code" style="font-size:26px">'+inviteCodeFmt(lastInvite.code)+'</div>'+
        '<div class="saved">The code is shown only now. They don’t need your PIN.</div><button class="linkbtn" data-codone style="margin-top:6px">Done</button></div>';
    }
    h+='<div class="row" style="margin-top:10px"><input class="t" id="coName" list="memberlist" autocomplete="off" placeholder="Co-organiser’s name"><button class="btn primary" id="coInvite">+ Invite</button></div>';
  }
  return h+'</section>';
}
(function(){
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    var t=e.target, b;
    if(L.role!=="coord") return;
    if(t.closest("#coUnlock")){ var v=document.getElementById("coCode").value; tryCoCode(v).then(function(ok){ if(!ok){ if(!coActive().length){ L.pendingCo=cleanCode(v); saveL(); showToastMsg("Waiting for the meeting data… join the meeting so the invite can be checked"); } else alert("That invite code doesn’t match. Ask the Coordinator for a new one."); } }); return; }
    if(!coordUnlocked()) return;
    if(t.closest("#coInvite")){ var n=(document.getElementById("coName").value||"").trim(); if(!n){ document.getElementById("coName").focus(); return; } if(coActive().some(function(c){return nkey(c.name)===nkey(n);})&&!confirm(n+" already has access. Create a new invite for them?")) return; createInvite(n); return; }
    if((b=t.closest("[data-corevoke]"))){ var c=coRec(b.dataset.corevoke); if(c&&confirm("Remove "+c.name+"’s access to the meeting set-up?")){ c.revoked=true; tick(c); if(lastInvite&&lastInvite.id===c.id) lastInvite=null; commit(); } return; }
    if((b=t.closest("[data-cocopy]"))){ if(lastInvite) copyText(coLink(lastInvite.code)); return; }
    if(t.closest("[data-codone]")){ lastInvite=null; renderAll(); return; }
  });
  V.addEventListener("keydown",function(e){ if(e.key!=="Enter") return; if(e.target.id==="coName"){ e.preventDefault(); document.getElementById("coInvite").click(); } else if(e.target.id==="coCode"){ e.preventDefault(); document.getElementById("coUnlock").click(); } });
})();
