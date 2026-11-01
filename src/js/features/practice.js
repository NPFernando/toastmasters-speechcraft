/* ---------- practice meeting: a sample meeting in its own storage on this device ---------- */
var PRACTICE=(NS===".practice");
function practiceUrl(on){ var u=new URL(location.href); if(on) u.searchParams.set("as","practice"); else u.searchParams.delete("as"); u.hash=""; return u.toString(); }
var SAMPLE_NAMES=["Amal Perera","Bhagya Silva","Chathura Fernando","Dilini Jayasinghe","Eshan Rodrigo","Fathima Rizvi","Gihan de Mel","Hiruni Wickrama","Isuru Bandara","Janani Kumar"];
/* one-time repair: older versions could copy the practice meeting's sample data into a device's real meeting
   (typing a practice code into the normal app). Only acts when at least 8 of the 10 sample names are present together. */
function cleanSampleLeak(){
  if(PRACTICE) return;
  var sk={}; SAMPLE_NAMES.forEach(function(n){ sk[nkey(n)]=1; });
  var hits=S.members.list.filter(function(m){return sk[nkey(m.name)];});
  if(hits.length<8) return;
  S.members.list=S.members.list.filter(function(m){return !sk[nkey(m.name)];}); tick(S.members);
  S.names=S.names.filter(function(n){return !sk[nkey(n)];});
  var A=S.agenda, changed=false;
  Object.keys(A.assign||{}).forEach(function(k){ var v=A.assign[k];
    if(Array.isArray(v)){ var w=v.filter(function(n){return !sk[nkey(n)];}); if(w.length!==v.length){ A.assign[k]=w; changed=true; } }
    else if(v&&sk[nkey(v)]){ delete A.assign[k]; changed=true; } });
  if(A.title==="Practice Meeting"){ A.title=defaultAgenda().title; changed=true; } if(A.no==="P1"){ A.no=""; changed=true; } if(A.venue==="Training room"){ A.venue=""; changed=true; }
  if(changed) tick(A);
  ["speeches","assigns","attend","rsvp"].forEach(function(c){ (S[c]||[]).slice().forEach(function(x){ if(sk[nkey(x.name||x.speaker||"")]){ S.dead[x.id]=Math.max(now(),(x.u||0)+1); } }); S[c]=(S[c]||[]).filter(function(x){ return !sk[nkey(x.name||x.speaker||"")]; }); });
  var ST=["What would you do with an extra hour every day?","Describe your perfect weekend","A skill you would like to learn and why","What is your favourite food?","Name a place you would like to visit"];
  ["topics","rrq"].forEach(function(c){ S[c].slice().forEach(function(x){ if(ST.indexOf(x.text)>=0) S.dead[x.id]=Math.max(now(),(x.u||0)+1); }); S[c]=S[c].filter(function(x){return ST.indexOf(x.text)<0;}); });
  if(S.gram.wotd==="Curious"&&S.gram.meaning==="Eager to know or learn something"){ S.gram.wotd=""; S.gram.meaning=""; tick(S.gram); }
  Object.keys(S.people).forEach(function(k){ if(sk[nkey(S.people[k])]){ S.people[k]=""; S.peopleU[k]=now(); } });
  if(L.me&&sk[nkey(L.me)]){ L.me=""; L.myNames={}; saveL(); }
  /* the sample Coordinator PIN (1234): clear it so the real organiser sets their own */
  if(S.pin&&S.pin.hash) sha("pin|"+S.pin.salt+"|1234").then(function(h){ if(h===S.pin.hash){ S.pin={hash:"",rhash:"",salt:"",u:now()}; L.coordOK=null; saveL(); commit(); renderAll(); } });
  commit(); setTimeout(function(){ showToastMsg("Removed practice sample data from this device"); },800);
}
function seedPractice(){
  if(!PRACTICE || L.practiceSeeded || S.members.list.length) return;
  var names=["Amal Perera","Bhagya Silva","Chathura Fernando","Dilini Jayasinghe","Eshan Rodrigo","Fathima Rizvi","Gihan de Mel","Hiruni Wickrama","Isuru Bandara","Janani Kumar"];
  S.members.list=names.map(function(n){ return {id:uid(),name:n}; }); tick(S.members);
  S.meta.week="Week 3 of 10"; S.meta.date=todayISO(); tick(S.meta);
  S.agenda.title="Practice Meeting"; S.agenda.no="P1"; S.agenda.venue="Training room";
  var A=S.agenda.assign; A.president="Amal Perera"; A.tmod="Bhagya Silva"; A.ge="Chathura Fernando"; A.timer="Dilini Jayasinghe"; A.ah="Eshan Rodrigo"; A.gram="Fathima Rizvi"; A.ttm="Gihan de Mel"; A.rrm="Hiruni Wickrama"; A.saa="Isuru Bandara"; A.coord="Janani Kumar";
  A.speakers=["Isuru Bandara","Janani Kumar"]; A.sevals=["Amal Perera","Gihan de Mel"]; A.ttevals=["Bhagya Silva","Eshan Rodrigo"]; tick(S.agenda);
  [["Isuru Bandara","My first job"],["Janani Kumar","Why I love cricket"]].forEach(function(x,i){ S.speeches.push({id:"sp|"+nkey(x[0]),name:x[0],type:"ps",title:x[1],obj:"",lim:"",ord:i+1,u:now()}); });
  S.assigns.push({id:"as|"+nkey("Isuru Bandara"),speaker:"Isuru Bandara",evaluator:"Amal Perera",ord:1,u:now()},{id:"as|"+nkey("Janani Kumar"),speaker:"Janani Kumar",evaluator:"Gihan de Mel",ord:2,u:now()});
  ["What would you do with an extra hour every day?","Describe your perfect weekend","A skill you would like to learn and why"].forEach(function(t,i){ S.topics.push({id:uid(),text:t,speaker:"",used:false,usedAt:null,rowId:null,ord:i+1,u:now()}); });
  ["What is your favourite food?","Name a place you would like to visit"].forEach(function(t,i){ S.rrq.push({id:uid(),text:t,used:false,ord:i+1,u:now()}); });
  S.gram.wotd="Curious"; S.gram.meaning="Eager to know or learn something"; tick(S.gram);
  names.forEach(function(n){ addName(S,n); });
  L.practiceSeeded=true; saveL(); applyAgenda();
  setPin("1234");
}
function practiceBarHTML(){
  return '<b>🎓 Practice meeting</b><span>Sample data on this device only — the real meeting isn’t touched. Coordinator PIN: <b>1234</b></span>'+
    '<span class="row"><button class="btn sm" id="prReset">↺ Start over</button><button class="btn sm" id="prLeave">Leave practice</button></span>';
}
(function(){
  var bar=document.getElementById("practiceBar");
  if(PRACTICE){ bar.innerHTML=practiceBarHTML(); bar.classList.add("on"); document.body.classList.add("practice"); }
  bar.addEventListener("click",function(e){
    if(e.target.closest("#prLeave")){ try{ stopNet(true); }catch(err){} location.href=practiceUrl(false); }
    else if(e.target.closest("#prReset")){ if(!confirm("Start the practice meeting over with fresh sample data?")) return; resetting=true; try{ stopNet(true); }catch(err){} [KEY,LKEY].forEach(function(k){ try{ localStorage.removeItem(k); }catch(err){} }); location.href=practiceUrl(true); }
  });
  var pb=document.getElementById("practiceBtn"); if(pb) pb.addEventListener("click",function(){ if(PRACTICE) return; location.href=practiceUrl(true); });
})();
