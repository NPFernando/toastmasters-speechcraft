/* ---------- field-level sync for the agenda and member list ----------
   Each agenda field, role player, agenda item and member carries its own change time
   (agenda.fu / members.fu), so two organisers editing different things never overwrite each other. */
var shadowAg=null, shadowMem=null, shadowGE=null;
function geParts(g){var p={};Object.keys(g||{}).forEach(function(k){if(k!=="u"&&k!=="fu") p[k]=js(g[k]);});return p;}
function mergeGENotes(A,B){
 var a=A.genotes,b=B.genotes,fa=a.fu||{},fb=b.fu||{},keys=Object.keys(geParts(a)).concat(Object.keys(geParts(b)),Object.keys(fa),Object.keys(fb));
 var chosen={},times={};keys.forEach(function(k){var ta=Object.prototype.hasOwnProperty.call(fa,k)?fa[k]:(hasFu(a)?0:a.u||0),tb=Object.prototype.hasOwnProperty.call(fb,k)?fb[k]:(hasFu(b)?0:b.u||0);var take=tb>ta||(tb===ta&&js(b[k])>js(a[k])); var src=take?b:a;if(k in src)chosen[k]=clone(src[k]);times[k]=Math.max(ta,tb);});
 chosen.fu=times;chosen.u=Math.max(a.u||0,b.u||0);A.genotes=chosen;
}
function js(x){ return JSON.stringify(x===undefined?null:x); }
function agParts(ag){
  var p={}; Object.keys(ag||{}).forEach(function(f){ if(f!=="items"&&f!=="assign"&&f!=="u"&&f!=="fu") p["f."+f]=js(ag[f]); });
  Object.keys((ag&&ag.assign)||{}).forEach(function(k){ p["as."+k]=js(ag.assign[k]); });
  ((ag&&ag.items)||[]).forEach(function(it){ p["it."+it.id]=js(it); });
  return p;
}
function memParts(m){ var p={"o.tmAwards":js(!!(m&&m.tmAwards))}; ((m&&m.list)||[]).forEach(function(x){ p["m."+x.id]=js(x); }); return p; }
function stampObj(obj,parts,shadow){
  if(!shadow) return false; obj.fu=obj.fu||{}; var t=now(), ch=false;
  Object.keys(parts).concat(Object.keys(shadow)).forEach(function(k){ if(parts[k]!==shadow[k]){ obj.fu[k]=Math.max(t,(obj.fu[k]||0)+1); ch=true; } });
  if(ch) obj.u=Math.max(t,(obj.u||0)+1);
  return ch;
}
function stampFields(){ stampObj(S.agenda,agParts(S.agenda),shadowAg); stampObj(S.members,memParts(S.members),shadowMem); stampObj(S.genotes,geParts(S.genotes),shadowGE); shadowSync(); }
function shadowSync(){ shadowAg=agParts(S.agenda); shadowMem=memParts(S.members); shadowGE=geParts(S.genotes); }
function hasFu(o){ return !!(o&&o.fu&&Object.keys(o.fu).length); }
function mergeAgenda(A,B){
  if(!hasFu(A.agenda)&&!hasFu(B.agenda)){ if((B.agenda.u||0)>(A.agenda.u||0)) A.agenda=clone(B.agenda); return; }
  var a=A.agenda, b=B.agenda, fa=a.fu=a.fu||{}, fb=b.fu||{};
  Object.keys(fb).forEach(function(k){
    if(!((fb[k]||0)>(fa[k]||0))) return; fa[k]=fb[k];
    var key=k.slice(k.indexOf(".")+1), kind=k.slice(0,k.indexOf("."));
    if(kind==="f"){ if(key in b) a[key]=clone(b[key]); else delete a[key]; }
    else if(kind==="as"){ if(b.assign&&key in b.assign) a.assign[key]=clone(b.assign[key]); else delete a.assign[key]; }
    else if(kind==="it"){ var bi=(b.items||[]).find(function(x){return x.id===key;}), ai=a.items.findIndex(function(x){return x.id===key;});
      if(bi){ if(ai>=0) a.items[ai]=clone(bi); else a.items.push(clone(bi)); } else if(ai>=0) a.items.splice(ai,1); }
  });
  a.u=Math.max(a.u||0,b.u||0);
}
function mergeMembers(A,B){
  if(!hasFu(A.members)&&!hasFu(B.members)){ if((B.members.u||0)>(A.members.u||0)) A.members=clone(B.members); return; }
  var a=A.members, b=B.members, fa=a.fu=a.fu||{}, fb=b.fu||{};
  Object.keys(fb).forEach(function(k){
    if(!((fb[k]||0)>(fa[k]||0))) return; fa[k]=fb[k];
    if(k==="o.tmAwards"){ a.tmAwards=!!b.tmAwards; return; }
    var id=k.slice(2), bi=(b.list||[]).find(function(x){return x.id===id;}), ai=a.list.findIndex(function(x){return x.id===id;});
    if(bi){ if(ai>=0) a.list[ai]=clone(bi); else a.list.push(clone(bi)); } else if(ai>=0) a.list.splice(ai,1);
  });
  /* the same name added on two devices at once: keep one */
  var seen={}; a.list=a.list.filter(function(m){ var n=nkey(m.name); if(seen[n]) return false; seen[n]=1; return true; });
  a.u=Math.max(a.u||0,b.u||0);
}
/* mode: undefined = normal; "keep" = ignore the other meeting's data; "adopt" = take the other meeting; "absorb" = join the other meeting and keep our items too */
function mergeInto(A,B,mode){
  if(A===S) stampFields();
  var before=stable(A);
  B.names.forEach(function(n){ addName(A,n); });
  A.attend=mergeColl(A.attend,B.attend,{}); A.keys=mergeColl(A.keys,B.keys,{});
  KEEP_LWW.forEach(function(k){ if(k==="members") mergeMembers(A,B); else if((B[k].u||0)>(A[k].u||0)) A[k]=clone(B[k]); });
  A.actions=mergeColl(A.actions,B.actions,{});
  A.coorg=mergeColl(A.coorg,B.coorg,{}); A.ideas=mergeColl(A.ideas,B.ideas,{}); A.tpls=mergeColl(A.tpls,B.tpls,{});
  Object.keys(A.people).forEach(function(k){ if((B.peopleU[k]||0)>(A.peopleU[k]||0)){ A.people[k]=B.people[k]; A.peopleU[k]=B.peopleU[k]; } });
  if(B.mid!==A.mid && mode==="keep"){ if(A===S) shadowSync(); return stable(A)!==before; }
  if(B.mid!==A.mid && mode==="absorb"){ A.mid=B.mid; A.midU=B.midU; }
  var bNewer = mode==="adopt" || B.midU>A.midU || (B.midU===A.midU && B.mid>A.mid);
  if(B.mid!==A.mid && bNewer){
    A.mid=B.mid; A.midU=B.midU; A.dead=clone(B.dead);
    MEETING_LWW.forEach(function(k){ A[k]=clone(B[k]); });
    COLLS.forEach(function(p){ setColl(A,p,clone(getColl(B,p))); });
  } else if(B.mid===A.mid){
    Object.keys(B.dead).forEach(function(id){ if(!(A.dead[id]>=B.dead[id])) A.dead[id]=B.dead[id]; });
    MEETING_LWW.forEach(function(k){ if(k==="agenda") mergeAgenda(A,B); else if(k==="genotes") mergeGENotes(A,B); else if((B[k].u||0)>(A[k].u||0)) A[k]=clone(B[k]); });
    COLLS.forEach(function(p){ setColl(A,p,mergeColl(getColl(A,p),getColl(B,p),A.dead)); });
  }
  if(A===S) shadowSync();
  return stable(A)!==before;
}

