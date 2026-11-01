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
  AROLES.forEach(function(a){ asList(a.k).forEach(function(n){ var r=rsvpOf(n); if(r&&(r.status==="no"||r.note)) out.push({role:a.n,name:n,status:r.status,note:r.note}); }); });
  S.assigns.forEach(function(a){ var r=a.evaluator&&rsvpOf(a.evaluator); if(r&&r.status==="no") out.push({role:"Evaluator for "+a.speaker,name:a.evaluator,status:"no",note:r.note}); });
  return out;
}
function availabilityHTML(){
  var cl=roleClashes(), all=S.rsvp.filter(function(r){return r.status;});
  if(!all.length && !cl.length) return "";
  var h='<section class="card" style="margin-bottom:12px"><h2 class="sec" style="margin-top:0">📅 Availability & role changes</h2>';
  if(cl.length) h+='<div class="clash">'+cl.map(function(x){ return '<div>'+(x.status==="no"?'⚠ <b>'+esc(x.name)+'</b> ('+esc(x.role)+') can\'t make it — reassign below':'ℹ️ <b>'+esc(x.name)+'</b> ('+esc(x.role)+')')+(x.note?' · “'+esc(x.note)+'”':'')+'</div>'; }).join("")+'</div>';
  h+='<div class="chips" style="margin-top:8px">'+all.map(function(r){ var o=RSVP_OPTS.find(function(x){return x[0]===r.status;}); return '<span class="chip word">'+(r.status==="no"?'✕ ':r.status==="online"?'💻 ':'✓ ')+esc(r.name)+'<span class="c">'+(o?o[1]:'')+(r.note?' · '+esc(r.note):'')+'</span></span>'; }).join("")+'</div>';
  return h+'</section>';
}
function rsvpBadge(name){ var r=name&&rsvpOf(name); if(!r||!r.status) return ""; return r.status==="no"?' <span class="badge no">can\'t make it</span>':r.status==="online"?' <span class="badge on">online</span>':''; }

