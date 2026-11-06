/* ---------- one person, several roles on the same device ---------- */
function roleObj(id){ return ROLES.find(function(x){return x.id===id;}); }
function myRoles(){ if(!Array.isArray(L.roles)||!L.roles.length) L.roles=[L.role]; if(L.roles.indexOf(L.role)<0) L.roles.push(L.role); return L.roles; }
function switchRole(id){ L.view="role"; myRoles(); if(L.roles.indexOf(id)<0) L.roles.push(id); L.role=id; saveL(); NET.hello(); renderAll(); window.scrollTo(0,0); }
function dropRole(id){ myRoles(); if(L.roles.length<2) return; L.roles=L.roles.filter(function(r){return r!==id;}); if(L.role===id) L.role=L.roles[0]; saveL(); NET.hello(); renderAll(); }
/* roles the agenda gives this person today */
function agendaRoleNames(role){
  switch(role){
    case "keynote": return asList("keynote").concat(S.presentations.map(function(p){ return p.name; }));
    case "speaker": return asList("speakers").concat(S.assigns.map(function(a){ return a.speaker; }));
    case "seval": return asList("sevals").concat(S.assigns.map(function(a){ return a.evaluator; }));
    case "tteval": return asList("ttevals").concat(S.ttassign.map(function(a){ return a.evaluator; }));
    case "member": return [];
    default: return asList(role);
  }
}
function agendaNames(){
  return uniq(ROLES.flatMap(function(role){ return agendaRoleNames(role.id); }));
}
function meetingNames(){ return uniq(memberNames().concat(agendaNames())); }
function agendaRolesFor(name){
  if(!name) return [];
  var key=nkey(name);
  return ROLES.filter(function(role){
    return agendaRoleNames(role.id).some(function(assignedName){ return nkey(assignedName)===key; });
  }).map(function(role){ return role.id; });
}
function roleTabsHTML(){
  var rs=myRoles(), h='<div class="rtabs">';
  rs.forEach(function(id){ var r=roleObj(id); h+='<button class="rtab'+(id===L.role?' on':'')+'" data-rtab="'+id+'">'+r.icon+' '+esc(r.name)+(rs.length>1&&id!==L.role?'<span class="rx" data-rdrop="'+id+'" title="Remove this role from this device">✕</span>':'')+'</button>'; });
  h+='<button class="rtab add" data-radd title="Add another role on this device">＋ Role</button></div>';
  var miss=agendaRolesFor(L.me||myName()).filter(function(r){ return rs.indexOf(r)<0; });
  if(miss.length) h+='<div class="rsuggest">📋 The agenda also has you as '+miss.map(function(r){var o=roleObj(r);return o.icon+' '+esc(o.name);}).join(", ")+' <button class="btn sm" data-raddall="'+miss.join(",")+'">Add '+(miss.length>1?'them':'it')+'</button></div>';
  return h;
}
/* compact panels for your other roles, so you can do both at once */
function speakingNowName(){ var r=runningList()[0]; return r?baseName(displayName(r.r,r.i)):""; }
function companionHTML(){
  var rs=myRoles(), h="";
  if(rs.indexOf("ah")>=0 && L.role!=="ah"){
    var who=speakingNowName()||((S.ahRows.find(function(r){return r.id===L.ahSel;})||{}).name||"");
    var rec=who?S.ahRows.find(function(r){return nkey(r.name)===nkey(who);}):null;
    h+='<div class="cmp"><b>🔢 Ah-Counter</b> <span class="muted">'+(who?esc(who)+(speakingNowName()?' (speaking now)':''):'— no one speaking')+'</span><div class="cmpbtns">'+
       (who?S.fill.words.map(function(w){ return '<button class="cmpb" data-cmpah="'+esc(w)+'" data-who="'+esc(who)+'">'+esc(w)+' <b>'+((rec&&rec.c[w])||0)+'</b></button>'; }).join(""):'')+'</div></div>';
  }
  if(rs.indexOf("gram")>=0 && L.role!=="gram"){
    var g=personNow(); var gr=g?S.gramRows.find(function(r){return nkey(r.name)===nkey(g);}):null;
    h+='<div class="cmp"><b>📝 Grammarian</b> <span class="muted">'+(g?esc(g)+' (speaking now)':'— no one speaking')+'</span><div class="cmpbtns">'+
       (g?'<button class="cmpb" data-cmpgram="'+esc(g)+'">+1 Word of the Day'+(S.gram.wotd?' “'+esc(S.gram.wotd)+'”':'')+' <b>'+((gr&&gr.w)||0)+'</b></button>':'')+'</div></div>';
  }
  return h;
}
function renderCompanion(){ var el=document.getElementById("companion"); if(!el) return; var h=companionHTML(); el.innerHTML=h; el.classList.toggle("on",!!h); }

