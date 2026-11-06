/* ---------- state ---------- */
function blank(){
  return { v:2, mid:uid(), midU:now(),
    meta:{week:"",date:todayISO(),u:0},
    people:{coord:"",president:"",saa:"",tmod:"",ge:"",rrm:"",timer:"",ttm:"",ah:"",gram:"",keynote:""}, peopleU:{coord:0,president:0,saa:0,tmod:0,ge:0,rrm:0,timer:0,ttm:0,ah:0,gram:0,keynote:0},
    limits:{tt:{g:60,a:90,r:120},ps:{g:240,a:300,r:360},rr:{b:20},ev:{g:90,a:105,r:120},rep:{g:30,a:45,r:60},u:0},
    members:{list:[],u:0,fu:{}}, coorg:[], ideas:[], tpls:[], pin:{hash:"",rhash:"",salt:"",u:0}, agenda:defaultAgenda(), run:{cur:null,started:{},u:0},
    voterPeople:[], presentations:[], actions:[], geobs:[], handovers:[], evals:[], notes:[], votes:[], rrq:[], speeches:[], assigns:[], rsvp:[], attend:[], keys:[], fin:[], guests:[], ttassign:[], wrap:{on:false,at:0,u:0}, pres:{chk:{},notes:"",u:0}, saa:{chk:{},u:0}, vote:{state:"closed",u:0}, genotes:{good:"",improve:"",u:0}, rrcur:{id:null,u:0},
    rows:{tt:[],ps:[],rr:[],ev:[],rep:[]}, topics:[], cur:{id:null,u:0},
    fill:{words:FILLERS.slice(),u:0}, ahRows:[],
    gram:{wotd:"",meaning:"",u:0}, gramRows:[],
    dead:{}, names:[] };
}
function normalize(st){
  var b=blank(); st=st&&typeof st==="object"?st:{};
  var o={ v:2, mid:String(st.mid||b.mid), midU:+st.midU||0,
    meta:Object.assign(b.meta, st.meta||{}), people:Object.assign(b.people, st.people||{}), peopleU:Object.assign(b.peopleU, st.peopleU||{}),
    limits:Object.assign(b.limits, st.limits||{}), rows:{}, topics:[], cur:Object.assign(b.cur, st.cur||{}),
    fill:Object.assign(b.fill, st.fill||{}), ahRows:[], gram:Object.assign(b.gram, st.gram||{}), gramRows:[],
    dead:(st.dead&&typeof st.dead==="object")?st.dead:{}, names:Array.isArray(st.names)?st.names.filter(function(n){return typeof n==="string";}):[] };
  if(!Array.isArray(o.fill.words)) o.fill.words=FILLERS.slice();
  SESSIONS.forEach(function(s){ var k=s.id; o.rows[k]=Array.isArray(st.rows&&st.rows[k])?st.rows[k]:[]; });
  ["ev","rep"].forEach(function(k){ if(!o.limits[k]) o.limits[k]=blank().limits[k]; });
  ["voterPeople","presentations","actions","geobs","handovers","evals","notes","votes","rrq","speeches","assigns","rsvp","fin","guests","ttassign"].forEach(function(k){ o[k]=Array.isArray(st[k])?st[k]:[]; });
  ["actions","voterPeople"].forEach(function(k){o[k]=o[k].filter(function(x){return x&&typeof x==="object"&&x.id;}).map(function(x){x.u=+x.u||1;x.ord=+x.ord||1;return x;});});
  o.keys=Array.isArray(st.keys)?st.keys.filter(function(k){return k&&k.id;}).map(function(k){ k.u=+k.u||1; k.ord=+k.ord||1; return k; }):[];
  o.evals.forEach(function(e){ if(e&&(e.c1!=null||e.r!=null||e.c2!=null||e.rate)){ if(e.done==null) e.done=!!(e.c1||e.r||e.c2); delete e.c1; delete e.r; delete e.c2; delete e.rate; } });
  o.notes=o.notes.filter(function(n){ return n&&n.enc; });
  o.attend=Array.isArray(st.attend)?st.attend.filter(function(a){return a&&a.id&&a.name;}).map(function(a){ a.u=+a.u||1; a.ord=+a.ord||1; return a; }):[];
  o.vote=Object.assign(b.vote, st.vote||{}); o.genotes=Object.assign(b.genotes, st.genotes||{}); if(!o.genotes.fu){o.genotes.fu={};Object.keys(o.genotes).forEach(function(k){if(k!=="u"&&k!=="fu")o.genotes.fu[k]=o.genotes.u||0;});} o.rrcur=Object.assign(b.rrcur, st.rrcur||{}); o.wrap=Object.assign(b.wrap, st.wrap||{}); o.pres=Object.assign(b.pres, st.pres||{}); o.saa=Object.assign(b.saa, st.saa||{}); if(!o.pres.chk||typeof o.pres.chk!=="object") o.pres.chk={}; if(!o.saa.chk||typeof o.saa.chk!=="object") o.saa.chk={};
  o.members=(st.members&&Array.isArray(st.members.list))?{list:st.members.list.filter(function(m){return m&&m.name;}),u:+st.members.u||0,fu:(st.members.fu&&typeof st.members.fu==="object")?st.members.fu:{},tmAwards:!!st.members.tmAwards}:b.members;
  o.tpls=Array.isArray(st.tpls)?st.tpls.filter(function(x){return x&&x.id&&Array.isArray(x.items);}).map(function(x){ x.u=+x.u||1; x.ord=+x.ord||1; return x; }):[];
  o.ideas=Array.isArray(st.ideas)?st.ideas.filter(function(x){return x&&x.id;}).map(function(x){ x.u=+x.u||1; x.ord=+x.ord||1; return x; }):[];
  o.coorg=Array.isArray(st.coorg)?st.coorg.filter(function(c){return c&&c.id&&c.hash;}).map(function(c){ c.u=+c.u||1; c.ord=+c.ord||1; return c; }):[];
  o.pin=Object.assign(b.pin, st.pin||{});
  o.agenda=Object.assign(b.agenda, st.agenda||{}); if(!Array.isArray(o.agenda.items)) o.agenda.items=defaultItems(); if(!o.agenda.assign||typeof o.agenda.assign!=="object") o.agenda.assign={};
  o.run=Object.assign(b.run, st.run||{}); if(!o.run.started||typeof o.run.started!=="object") o.run.started={};
  o.topics=Array.isArray(st.topics)?st.topics:[]; o.ahRows=Array.isArray(st.ahRows)?st.ahRows:[]; o.gramRows=Array.isArray(st.gramRows)?st.gramRows:[];
  COLLS.forEach(function(p){
    var arr=getColl(o,p).filter(function(x){return x&&typeof x==="object"&&x.id;});
    arr.forEach(function(x,i){ x.id=String(x.id); if(typeof x.ord!=="number") x.ord=i+1; if(typeof x.u!=="number") x.u=1; });
    setColl(o,p,arr);
  });
  o.ahRows.forEach(function(r){ if(!r.c||typeof r.c!=="object") r.c={}; });
  o.gramRows.forEach(function(r){ r.w=+r.w||0; if(!Array.isArray(r.good)) r.good=[]; if(!Array.isArray(r.slips)) r.slips=[]; });
  return o;
}
function load(){
  var raw=lsGet(KEY);
  if(raw){ try{ return normalize(JSON.parse(raw)); }catch(e){} }
  var st=blank(), old=NS===".practice"?null:lsGet(OLDKEY);
  if(old){ try{
    var d=JSON.parse(old);
    st.meta.week=(d.meta&&d.meta.session)||""; st.meta.date=(d.meta&&d.meta.date)||todayISO();
    st.people.timer=(d.meta&&d.meta.timer)||"";
    if(d.limits) st.limits=Object.assign(st.limits,d.limits);
    if(d.rows) ["tt","ps","rr"].forEach(function(k){ st.rows[k]=(d.rows[k]||[]).map(function(r,i){ return {id:String(r.id||uid()),name:r.name||"",start:r.start==null?null:r.start,end:r.end==null?null:r.end,manual:r.manual==null?null:r.manual,ord:i+1,u:1}; }); });
  }catch(e){} }
  try{ (JSON.parse(lsGet(OLDNAMES)||"[]")||[]).forEach(function(n){ addName(st,n); }); }catch(e){}
  return normalize(st);
}
var S=load();
var L=(function(){ try{ return Object.assign({role:"timer",tab:"tt",conn:null,rep:{timer:true,ttm:true,ah:true,gram:true},ahSel:null,gramSel:null}, JSON.parse(lsGet(LKEY)||"{}")); }catch(e){ return {role:"timer",tab:"tt",conn:null,rep:{timer:true,ttm:true,ah:true,gram:true}}; } })();
var resetting=false;
function saveL(){ if(resetting) return; lsSet(LKEY,JSON.stringify(L)); }
function save(){ if(resetting) return; setSaved(lsSet(KEY,JSON.stringify(S))?"Saved on this device":"Auto-save unavailable in this browser"); }
function setSaved(t){ var el=document.getElementById("saved"); if(el) el.textContent=t; }
function commit(){ stampFields(); save(); NET.push(); renderAll(); }
function commitQuiet(){ stampFields(); save(); NET.push(); }

function addName(st,name){
  name=String(name||"").trim(); if(!name) return false;
  if(st.names.some(function(n){return n.toLowerCase()===name.toLowerCase();})) return false;
  st.names.push(name); return true;
}
function remember(name){ if(addName(S,name)){ save(); NET.push(); renderRoster(); } }
function renderRoster(){
  var all=meetingNames().concat(S.names);
  SESSIONS.forEach(function(s){ S.rows[s.id].forEach(function(r){ if(r.name&&r.name.trim()&&!r.ak) all.push(r.name.trim()); }); });
  var seen={}, list=[];
  all.forEach(function(n){ var k=n.toLowerCase(); if(!seen[k]){ seen[k]=1; list.push(n); } });
  document.getElementById("roster").innerHTML=list.map(function(n){return '<option value="'+esc(n)+'">';}).join("");
}
function renderMemberList(){ var el=document.getElementById("memberlist"); if(el) el.innerHTML=meetingNames().map(function(n){return '<option value="'+esc(n)+'">';}).join(""); }

