/* ---------- member types: Speechcrafter, Toastmaster (graduated / visiting), Guest ---------- */
var KINDS={sc:{i:"🎓",n:"Speechcrafter",p:"Speechcrafters"},tm:{i:"⭐",n:"Toastmaster",p:"Toastmasters"},guest:{i:"👋",n:"Guest",p:"Guests"}};
function guessKind(name){ var n=String(name||"").trim(); return /^tm[\s.-]/i.test(n)?"tm":"sc"; }
function memberRec(name){ var k=nkey(name); return S.members.list.find(function(m){ return nkey(m.name)===k; }); }
function agendaMemberId(name){ return "agenda-member|"+nkey(name); }
function populateAgendaMembers(){
  if(L.role!=="coord" || !coordUnlocked() || PRACTICE || S.meta.test) return;
  var added=false, guests=new Set(S.guests.map(function(g){ return nkey(g.name); }));
  agendaNames().forEach(function(name){
    var id=agendaMemberId(name);
    if(memberRec(name) || S.members.fu["m."+id] || guests.has(nkey(name))) return;
    var roles=agendaRolesFor(name);
    S.members.list.push({id:id,name:name,kind:roles.length===1&&roles[0]==="keynote"?"guest":guessKind(name)});
    added=true;
  });
  if(added) commitQuiet();
}
// Record a deletion for the automatic entry even when the saved member had a manual ID.
function excludeAgendaMember(name){
  var key="m."+agendaMemberId(name);
  S.members.fu[key]=Math.max(now(),(S.members.fu[key]||0)+1);
}
function removeMember(id){
  var member=S.members.list.find(function(m){ return m.id===id; });
  if(!member) return;
  excludeAgendaMember(member.name);
  S.members.list=S.members.list.filter(function(m){ return m.id!==id && m.id!==agendaMemberId(member.name); });
  tick(S.members);
  commit();
}
function memberKind(name){ var m=memberRec(name); if(m) return m.kind||guessKind(m.name); if(/^tm[\s.-]/i.test(String(name||""))) return "tm"; return S.guests.some(function(g){return nkey(g.name)===nkey(name);})?"guest":"sc"; }
function kindBadge(name,long){ var k=memberKind(name); if(k==="sc") return ""; var m=memberRec(name); return ' <span class="kbadge k-'+k+'" title="'+KINDS[k].n+(m&&m.club?' · '+esc(m.club):'')+'">'+(k==="tm"?"⭐ TM":"👋 Guest")+(long&&m&&m.club?' · '+esc(m.club):'')+'</span>'; }
function awardEligible(name){ return memberKind(name)!=="tm" || !!S.members.tmAwards; }
function membersEditorHTML(){
  var groups={sc:[],tm:[],guest:[]};
  S.members.list.forEach(function(m){ (groups[m.kind||guessKind(m.name)]||groups.sc).push(m); });
  var h='<div class="saved">Agenda names are added automatically. Remove a one-time guest here to keep them on this meeting’s agenda only.</div>';
  ["sc","tm","guest"].forEach(function(k){
    if(!groups[k].length&&k!=="sc") return;
    h+='<div class="kgroup"><div class="kgh">'+KINDS[k].i+' '+KINDS[k].p+' <span class="cnt">'+groups[k].length+'</span></div><div class="chips">'+
      (groups[k].length?groups[k].map(function(m){ return '<span class="chip word'+(L.memEdit===m.id?' active':'')+'"><button class="kname" data-medit="'+esc(m.id)+'" title="Change type or club">'+esc(m.name)+(m.club?' <small>· '+esc(m.club)+'</small>':'')+'</button><button data-mdel="'+esc(m.id)+'" title="Remove member" aria-label="Remove '+esc(m.name)+'">✕</button></span>'; }).join(""):'<span class="muted">No members yet.</span>')+'</div></div>';
  });
  var ed=L.memEdit&&S.members.list.find(function(m){return m.id===L.memEdit;});
  if(ed){ var ek=ed.kind||guessKind(ed.name);
    h+='<div class="selcard medit"><b>'+esc(ed.name)+'</b><div class="row" style="margin-top:6px"><div class="seg" role="group" aria-label="Member type">'+["sc","tm","guest"].map(function(k){ return '<button data-mkind="'+k+'" class="'+(ek===k?'on':'')+'">'+KINDS[k].i+' '+KINDS[k].n+'</button>'; }).join("")+'</div>'+
      (ek==="tm"?'<input class="t" id="mClub" style="max-width:240px" placeholder="Club, e.g. Dialog TMC" value="'+esc(ed.club||"")+'" aria-label="Club">':'')+'<button class="btn sm" data-mdone>Done</button></div>'+
      '<div class="saved" style="margin-top:4px">'+(ek==="sc"?'Takes part in the 10-week programme: tracked in 📈 Progress and eligible for awards.':ek==="tm"?'Already a Toastmaster (graduated or from another club): can take any role or be the keynote; not tracked in Progress'+(S.members.tmAwards?'.':' and not on the awards ballot.'):'Visiting: can take part and vote; not tracked in Progress.')+'</div></div>';
  }
  h+='<div class="row" style="margin-top:8px"><input class="t" id="memIn" placeholder="Add names, separated by commas (e.g. SC Upeksha Perera, TM Nalin De Abrew)"><select class="t" id="memKind" style="max-width:170px" aria-label="Type for new names"><option value="auto">Type: auto (TM… = Toastmaster)</option><option value="sc">🎓 Speechcrafter</option><option value="tm">⭐ Toastmaster</option><option value="guest">👋 Guest</option></select><button class="btn primary" id="memAdd">+ Add members</button></div>'+
    '<label class="tgl" style="margin-top:8px"><input type="checkbox" id="tmAwards"'+(S.members.tmAwards?' checked':'')+'> <span>Toastmasters can win awards <span class="saved">(off: Speechcraft awards are for Speechcrafters and guests)</span></span></label>';
  return h;
}
(function(){
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    var t=e.target, b; if(L.role!=="coord"||!coordUnlocked()) return;
    if((b=t.closest("[data-medit]"))){ L.memEdit=L.memEdit===b.dataset.medit?null:b.dataset.medit; saveL(); renderAll(); return; }
    if((b=t.closest("[data-mkind]"))){ var m=S.members.list.find(function(x){return x.id===L.memEdit;}); if(m){ m.kind=b.dataset.mkind; if(m.kind!=="tm") delete m.club; tick(S.members); commit(); } return; }
    if(t.closest("[data-mdone]")){ L.memEdit=null; saveL(); renderAll(); return; }
  });
  V.addEventListener("change",function(e){
    if(L.role!=="coord"||!coordUnlocked()) return;
    if(e.target.id==="mClub"){ var m=S.members.list.find(function(x){return x.id===L.memEdit;}); if(m){ m.club=e.target.value.trim(); tick(S.members); commit(); } }
    if(e.target.id==="tmAwards"){ S.members.tmAwards=e.target.checked; tick(S.members); commit(); }
  });
})();
