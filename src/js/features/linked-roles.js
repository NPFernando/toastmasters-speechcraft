/* ---------- one person selected across all your roles ----------
   With several roles on one device (e.g. Ah-Counter + Table Topics Evaluator), choosing a person in
   any role selects the same person in the others. When the Timer starts someone, every role follows. */
var LINK_ROLES=["ah","gram","seval","tteval"];
function linkRoles(){ return myRoles().filter(function(r){ return LINK_ROLES.indexOf(r)>=0; }); }
function counterRow(kind,name){
  var arr=kind==="ah"?S.ahRows:S.gramRows, ex=arr.find(function(r){return nkey(r.name)===nkey(name);});
  if(!ex){ var id=kind+"|"+nkey(name); delete S.dead[id];
    ex = kind==="ah" ? {id:id,name:name,c:{},ord:maxOrd(arr)+1,u:now()} : {id:id,name:name,w:0,good:[],slips:[],ord:maxOrd(arr)+1,u:now()}; arr.push(ex); }
  return ex;
}
function isPrepared(n){ return preparedSpeakers().some(function(x){return nkey(x)===nkey(n);}); }
function isTT(n){ return ttSpeakers().some(function(x){return nkey(x)===nkey(n);}); }
/* returns true if shared data changed (a new Ah/Grammarian row) */
function selectPerson(name,from){
  name=baseName(String(name||"").trim()); if(!name) return false;
  var rs=myRoles(), changed=false;
  L.person={name:name,at:now(),from:from||""};
  if(rs.indexOf("ah")>=0){ var n1=S.ahRows.length, r1=counterRow("ah",name); L.ahSel=r1.id; if(S.ahRows.length!==n1) changed=true; }
  if(rs.indexOf("gram")>=0){ var n2=S.gramRows.length, r2=counterRow("gram",name); L.gramSel=r2.id; if(S.gramRows.length!==n2) changed=true; }
  L.evSel=L.evSel||{};
  if(rs.indexOf("seval")>=0 && (isPrepared(name)||from==="seval")) L.evSel.ps=name;
  if(rs.indexOf("tteval")>=0 && (isTT(name)||from==="tteval")) L.evSel.tt=name;
  L.fsel=name;
  saveL(); if(changed){ remember(name); }
  return changed;
}
function personNow(){ return speakingNowName() || (L.person&&L.person.name) || ""; }
function linkBarHTML(){
  var lr=linkRoles(); if(lr.length<2 || !L.person || !L.person.name) return "";
  var live=speakingNowName()&&nkey(speakingNowName())===nkey(L.person.name);
  var where=lr.filter(function(r){ return r==="ah"||r==="gram"||(r==="seval"&&isPrepared(L.person.name))||(r==="tteval"&&isTT(L.person.name)); });
  return '<div class="linkbar" role="status">🔗 '+(live?'Speaking now: ':'Following ')+'<b>'+esc(L.person.name)+'</b> in '+where.map(function(r){var o=roleObj(r);return '<span title="'+esc(o.name)+'">'+o.icon+' '+esc(o.name)+'</span>';}).join(" · ")+'<button class="iconbtn" data-unlink title="Stop following this person" aria-label="Stop following">✕</button></div>';
}
/* the Timer starting someone moves every linked role to them */
var lastAutoSpeaker="";
setInterval(function(){
  var sp=speakingNowName(); if(!sp){ lastAutoSpeaker=""; return; }
  if(nkey(sp)===nkey(lastAutoSpeaker)) return; lastAutoSpeaker=sp;
  if(!linkRoles().length) return;
  if(L.person&&nkey(L.person.name)===nkey(sp)) return;
  var ch=selectPerson(sp,"timer"); if(ch) commit(); else softRender();
},700);
document.getElementById("roles").addEventListener("click",function(e){ if(e.target.closest("[data-unlink]")){ L.person=null; saveL(); renderAll(); } });
