/* ---------- who's coming (RSVP) and role clashes ---------- */
var RSVP_OPTS=[["in","In person"],["online","Online"],["no","Can't make it"]];
function rsvpOf(name){ return S.rsvp.find(function(r){ return r.id==="rv|"+nkey(name); }); }
function rsvpHTML(name){
  var h='<h2 class="sec">📅 Coming to this meeting?</h2>';
  if(!name) return h+'<div class="muted">Choose your name first.</div>';
  var r=rsvpOf(name)||{};
  h+='<div class="row">'+RSVP_OPTS.map(function(o){ return '<button class="chip'+(r.status===o[0]?' active':'')+'" data-rsvp="'+o[0]+'" data-rname="'+esc(name)+'">'+o[1]+'</button>'; }).join("")+'</div>'+
     '<div class="row" style="margin-top:6px"><input class="t" id="rsvpNote" data-rname="'+esc(name)+'" value="'+esc(r.note||"")+'" placeholder="Note for the organisers, e.g. leaving at 8 pm"></div>';
  var c={in:0,online:0,no:0}; S.rsvp.forEach(function(x){ if(c[x.status]!=null) c[x.status]++; });
  h+='<div class="saved" style="margin-top:6px">So far: '+c.in+' in person · '+c.online+' online · '+c.no+' can\'t make it</div>';
  /* answered already, or the meeting has started: fold it away so the role's main job comes first */
  if(r.status||(S.run&&S.run.cur)){ var lbl=(RSVP_OPTS.find(function(o){return o[0]===r.status;})||[0,"Not answered"])[1];
    return '<details class="fold"><summary>📅 Coming to this meeting? <b>'+esc(lbl)+'</b> <span class="saved">· change</span></summary>'+h.replace('<h2 class="sec">📅 Coming to this meeting?</h2>','')+'</details>'; }
  return h;
}
function setRsvp(name,status,note){ var r=upsert(["rsvp"],"rv|"+nkey(name),{name:name,status:"",note:""}); r.name=name; if(status!=null) r.status=status; if(note!=null) r.note=note; tick(r); }
function roleClashes(){
  var out=[];
  function add(key,role,name){
    var r=rsvpOf(name);
    if(r&&(r.status==="no"||r.note)) out.push({key:key,role:role,name:name,status:r.status,note:r.note});
  }
  AROLES.forEach(function(a){
    asList(a.k).forEach(function(name){ add(a.k,a.n,name); });
  });
  S.assigns.forEach(function(a){ if(a.evaluator) add("evaluation|"+a.id,"Evaluator for "+a.speaker,a.evaluator); });
  S.ttassign.forEach(function(a){ if(a.evaluator) add("topics|"+a.id,"Table Topics evaluator for "+a.speaker,a.evaluator); });
  return out;
}
function replaceRolePlayer(key,oldName,replacement){
  if(!replacement||nkey(oldName)===nkey(replacement)||rsvpOf(replacement)?.status==="no") return false;
  var pairKey=key.startsWith("evaluation|")?"assigns":key.startsWith("topics|")?"ttassign":null;
  if(pairKey){
    var pair=S[pairKey].find(function(a){return a.id===key.slice(key.indexOf("|")+1);});
    if(!pair||nkey(pair.evaluator)!==nkey(oldName)||nkey(pair.speaker)===nkey(replacement)) return false;
    pair.evaluator=replacement; tick(pair);
  } else {
    var role=AROLES.find(function(a){return a.k===key;}), assignedNames=asList(key);
    if(!role||!assignedNames.some(function(n){return nkey(n)===nkey(oldName);})) return false;
    if(key==="speakers"){
      if(assignedNames.some(function(n){return nkey(n)===nkey(replacement);})||
        S.rows.ps.some(function(row){return nkey(baseName(row.name))===nkey(oldName)&&rowState(row)!=="idle";})) return false;
      var evaluation=S.assigns.find(function(a){return nkey(a.speaker)===nkey(oldName)&&a.evaluator;});
      if(evaluation&&!S.assigns.some(function(a){return nkey(a.speaker)===nkey(replacement)&&a.evaluator;})){
        var newPair=upsert(["assigns"],"as|"+nkey(replacement),{speaker:replacement});
        newPair.evaluator=nkey(evaluation.evaluator)===nkey(replacement)?"":evaluation.evaluator;
        tick(newPair);
      }
      if(evaluation){ evaluation.evaluator=""; tick(evaluation); }
      var queued=S.rows.ps.find(function(row){return row.ak==="ps:"+oldName.toLowerCase()&&rowState(row)==="idle";});
      if(queued&&!S.rows.ps.some(function(row){return nkey(baseName(row.name))===nkey(replacement);})){
        queued.ak="ps:"+replacement.toLowerCase(); queued.name=replacement;
        var limits=presetLim((speechRec(replacement)||{}).lim);
        if(limits) queued.lim=limits; else delete queued.lim;
        tick(queued);
      }
    }
    if(key==="sevals"||key==="ttevals"){
      S[key==="sevals"?"assigns":"ttassign"].forEach(function(a){
        if(nkey(a.evaluator)===nkey(oldName)){ a.evaluator=nkey(a.speaker)===nkey(replacement)?"":replacement; tick(a); }
      });
    }
    var names=uniq(assignedNames.map(function(n){return nkey(n)===nkey(oldName)?replacement:n;}));
    S.agenda.assign[key]=role.multi?names:names[0];
    tick(S.agenda);
  }
  applyAgenda(); commit();
  return true;
}
function availabilityHTML(){
  var cl=roleClashes(), all=S.rsvp.filter(function(r){return r.status;});
  var assignedPeople=uniq(AROLES.flatMap(function(role){return asList(role.k);})
    .concat(S.assigns.map(function(a){return a.evaluator;}),S.ttassign.map(function(a){return a.evaluator;})));
  var h='<section id="availability" class="card" style="margin-bottom:12px"><h2 class="sec" style="margin-top:0">📅 Availability & role changes</h2>';
  if(assignedPeople.length){
    h+='<div class="row"><label>Role player <select class="t" id="absentName">'+assignedPeople.filter(function(n){return rsvpOf(n)?.status!=="no";}).map(function(n){return '<option>'+esc(n)+'</option>';}).join("")+'</select></label>'+
      '<button class="btn sm" id="markAbsent">Mark absent</button></div>';
  }
  if(cl.length) h+='<div class="clash">'+cl.map(function(x){
    return '<div>'+(x.status==="no"?'⚠ ':'ℹ️ ')+'<b>'+esc(x.name)+'</b> ('+esc(x.role)+')'+(x.note?' · “'+esc(x.note)+'”':'')+
      (x.status!=="no"?'':' · Can’t make it <span class="row"><input class="t" list="memberlist" data-replacement aria-label="Replacement for '+esc(x.role)+'" placeholder="Replacement name">'+
      '<button class="btn sm" data-replace-role="'+esc(x.key)+'" data-old-name="'+esc(x.name)+'">Reassign</button></span>')+'</div>';
  }).join("")+'</div>';
  h+='<div class="chips" style="margin-top:8px">'+all.map(function(r){ var o=RSVP_OPTS.find(function(x){return x[0]===r.status;}); return '<span class="chip word">'+(r.status==="no"?'✕ ':r.status==="online"?'💻 ':'✓ ')+esc(r.name)+'<span class="c">'+(o?o[1]:'')+(r.note?' · '+esc(r.note):'')+'</span></span>'; }).join("")+'</div>';
  return h+'</section>';
}
function rsvpBadge(name){ var r=name&&rsvpOf(name); if(!r||!r.status) return ""; return r.status==="no"?' <span class="badge no">can\'t make it</span>':r.status==="online"?' <span class="badge on">online</span>':''; }

