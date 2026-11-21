/* Match the agenda assignment to the signed-in participant before showing a turn cue. */
function liveItemRole(it){
  if(!it) return "";
  return it.rowId?"speaker":it.role;
}
function itemIsMine(it){
  var role=liveItemRole(it);
  if(!roleObj(role)) return false;
  var me=nkey(L.me||myName()), names=it.rowId||role==="keynote"?[whoForItem(it)]:asList(role);
  if(names.some(Boolean)) return names.some(function(name){return nkey(name)===me;});
  return myRoles().includes(role);
}
function itemLabel(it){ var w=whoForItem(it); return arole(it.role).n+(w?" ("+w+")":"")+(it.text?" — "+String(it.text).split(" — ")[0].split(". ")[0]:""); }
function liveRoleStatus(role){
  var c=curItem();
  if(!c.cur) return "";
  if(liveItemRole(c.cur)===role&&itemIsMine(c.cur)) return "On now";
  if(liveItemRole(c.next)===role&&itemIsMine(c.next)) return "Up next";
  if(reportQueue().some(function(entry){return entry.role===role&&isMyLiveReport(entry)&&liveReportState(entry)==="called";})) return "Action needed";
  return "";
}
function liveRoleCueHTML(){
  var c=curItem();
  if(!c.cur) return "";
  var item=itemIsMine(c.cur)?c.cur:itemIsMine(c.next)?c.next:null;
  if(!item) return "";
  var role=liveItemRole(item), details=liveItemExtra(item);
  var row=item.rowId?findRow("ps",item.rowId):item.role==="keynote"?presentationRow(item.id):null;
  if(row) details=[details,limitsLine("ps",row)].filter(Boolean).join(" · ");
  return '<div class="note live-role-cue"><b>'+(item===c.cur?"You’re on now":"You’re up next")+'</b> · '+esc(roleName(role))+
    (item.rowId?' · '+esc(item.text):'')+(details?'<div>'+esc(details)+'</div>':'')+
    '<button class="btn sm" data-live-open-role="'+role+'">Open my role</button></div>';
}
var lastNudge="";
function checkNudge(){
  var c=curItem();
  if(!c.cur){ lastNudge=""; return; }
  var key=JSON.stringify([S.mid,c.cur.id,c.next?.id,whoForItem(c.cur),c.next&&whoForItem(c.next)]);
  if(key===lastNudge) return;
  lastNudge=key;
  var item=itemIsMine(c.cur)?c.cur:itemIsMine(c.next)?c.next:null, el=document.getElementById("nudge");
  clearTimeout(el._t);
  if(!item||!L.setup){ el.classList.remove("on"); return; }
  var role=liveItemRole(item);
  el.innerHTML=esc((item===c.cur?"You’re on now: ":"You’re up next: ")+itemLabel(item))+
    ' <button class="btn sm" data-live-open-role="'+role+'">Open my role</button>';
  el.classList.add("on");
  el._t=setTimeout(function(){ el.classList.remove("on"); },15000);
}
setInterval(checkNudge,1000);
document.getElementById("app").addEventListener("click",function(e){
  var action=e.target.closest("[data-live-open-role]");
  if(!action) return;
  var role=action.dataset.liveOpenRole;
  if(!roleObj(role)||(!myRoles().includes(role)&&!agendaRolesFor(L.me||myName()).includes(role))) return;
  if(!myRoles().includes(role)) saveRoleChoices([role],true);
  if(role==="keynote"){ var c=curItem(); var item=c.cur?.role===role&&itemIsMine(c.cur)?c.cur:c.next; if(item?.role===role) workflowDraft().keynoteItem=item.id; }
  document.getElementById("nudge").classList.remove("on");
  switchRole(role);
});
