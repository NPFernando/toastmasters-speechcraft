/* ---------- start ---------- */
if(!sessionOf(L.tab)) L.tab="tt";
if(!ROLES.some(function(r){return r.id===L.role;})) L.role="timer";
if(!Array.isArray(L.roles)||!L.roles.length) L.roles=[L.role]; L.roles=L.roles.filter(function(r){return ROLES.some(function(x){return x.id===r;});}); if(L.roles.indexOf(L.role)<0) L.roles.push(L.role);
seedPractice(); shadowSync(); try{ cleanSampleLeak(); }catch(e){} renderAll(); wake(); save();
function openMeetingInvite(){
  var params=new URLSearchParams(location.hash.slice(1)), code=cleanCode(params.get("join"));
  if(code.length!==6) return false;
  var person=params.get("person"), role=params.get("role"), co=params.get("co");
  if(co){ L.pendingCo=cleanCode(co); saveL(); }
  try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){}
  W.code=code; W.auto=false; W.advance=false; W.add=false; W.inviteRole=null;
  if(params.get("guest")==="1"){ startJoin(code); openWelcome("guest"); return true; }
  if(roleObj(role)){
    W.inviteRole=role;
    if(!L.setup||person){
      L.roles=[role];
      if(person){ L.me=person; L.myNames={}; }
    }
    L.role=role; L.setup=true; saveL();
    W.auto=true;
  } else { W.auto=!!(L.setup&&L.me); W.advance=!W.auto; }
  startJoin(code);
  openWelcome("connect");
  return true;
}
if(!openMeetingInvite()){
  var resumeCode=L.conn&&L.conn.code;
  if(resumeCode){
    if(L.conn.mode==="host") startHost(resumeCode);
    else { W.auto=!!L.setup; W.advance=!L.setup; startJoin(resumeCode); }
    if(!L.setup||L.conn.mode==="join") openWelcome("connect");
  } else if(!L.setup) openWelcome("connect");
}
window.addEventListener("hashchange",openMeetingInvite);
window.addEventListener("pagehide",sayBye);
window.addEventListener("beforeunload",sayBye);
})();
