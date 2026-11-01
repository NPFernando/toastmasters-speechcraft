/* ---------- start ---------- */
if(!sessionOf(L.tab)) L.tab="tt";
if(!ROLES.some(function(r){return r.id===L.role;})) L.role="timer";
if(!Array.isArray(L.roles)||!L.roles.length) L.roles=[L.role]; L.roles=L.roles.filter(function(r){return ROLES.some(function(x){return x.id===r;});}); if(L.roles.indexOf(L.role)<0) L.roles.push(L.role);
seedPractice(); shadowSync(); try{ cleanSampleLeak(); }catch(e){} renderAll(); wake(); save();
var hashCode=""; try{ var hm=location.hash.match(/join=([A-Za-z0-9-]+)/); if(hm) hashCode=cleanCode(hm[1]); }catch(e){}
var hashGuest=/[#&]guest=1/.test(location.hash);
try{ var hc=location.hash.match(/co=([A-Za-z0-9-]+)/); if(hc){ L.pendingCo=cleanCode(hc[1]); saveL(); } }catch(e){}
var hashRole=""; try{ var hr=location.hash.match(/role=([a-z]+)/); if(hr&&ROLES.some(function(r){return r.id===hr[1];})) hashRole=hr[1]; }catch(e){}
if(hashCode.length===6){ try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){} }
var resumeCode = L.conn&&L.conn.code;
if(hashCode.length===6 && hashGuest){ W.code=hashCode; startJoin(hashCode); openWelcome("guest"); }
else if(hashCode.length===6 && hashRole){
  /* scanned "my role on my phone": take that role, join the meeting and continue once connected */
  if(!L.setup) L.roles=[hashRole]; L.role=hashRole; L.setup=true; saveL(); renderAll();
  W.code=hashCode; W.auto=true; startJoin(hashCode); openWelcome("connect");
}
else if(hashCode.length===6 && !(resumeCode===hashCode)){ W.code=hashCode; startJoin(hashCode); W.advance=true; openWelcome("connect"); }
else if(resumeCode){ if(L.conn.mode==="host") startHost(L.conn.code); else startJoin(L.conn.code); if(!L.setup) openWelcome("connect"); }
else if(!L.setup) openWelcome("connect");
window.addEventListener("pagehide",sayBye);
window.addEventListener("beforeunload",sayBye);
})();
