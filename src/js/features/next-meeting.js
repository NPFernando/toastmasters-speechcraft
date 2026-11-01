/* ---------- 4. your roles at the next meeting + calendar ---------- */
function myUpcoming(forName){
  var nm=forName||L.me||myName(); if(!nm||(!S.meta.date&&!forName)) return null;
  var today=todayISO();
  if(!forName){ if(S.meta.date<today) return null; if(S.meta.date===today && S.run && S.run.cur) return null; }
  var k=nkey(nm), parts=[];
  agendaRolesFor(nm).forEach(function(r){
    if(r==="speaker"){ var sr=speechRec(nm)||{}, ev=evaluatorOf(nm); parts.push({icon:"🎙",t:"Prepared speech"+(sr.title?" — “"+sr.title+"”":""),d:(sr.lim?"Time "+String(sr.lim).replace("-","–")+" min · ":"")+(ev?"Evaluator: "+ev:"Evaluator not assigned yet")+(sr.title?"":" · add your title and objectives")}); }
    else if(r==="seval"){ var sp=S.assigns.filter(function(a){return nkey(a.evaluator)===k;}).map(function(a){ var t2=speechTitle(a.speaker); return a.speaker+(t2?" (“"+t2+"”)":""); }); parts.push({icon:"🗣",t:"Speech Evaluator",d:sp.length?"Evaluating "+sp.join(", "):"Speaker not assigned yet"}); }
    else if(r==="tteval") parts.push({icon:"💬",t:"Table Topics Evaluator",d:"Speakers are shared out as the Table Topics Master calls them"});
    else { var o=roleObj(r), times=itemsSorted().filter(function(it){return it.role===r;}).map(function(it){return fmtHM(it.time);}); parts.push({icon:o?o.icon:"•",t:o?o.name:r,d:times.length?"On the agenda at "+times.join(", "):""}); }
  });
  if(asList("keynote").some(function(n){return nkey(n)===k;})) parts.unshift({icon:"🌟",t:"Keynote"+(S.agenda.ktopic?" — “"+S.agenda.ktopic+"”":""),d:itemsSorted().filter(function(it){return it.role==="keynote";}).map(function(it){return "At "+fmtHM(it.time);}).join(", ")});
  if(!parts.length) return null;
  var first=itemsSorted()[0];
  return {name:nm,date:S.meta.date,start:first?first.time:"",venue:S.agenda.venue||"",parts:parts,today:S.meta.date===today};
}
function upcomingHTML(compact){
  var u=myUpcoming(); if(!u) return "";
  return '<div class="'+(compact?'wcard ':'card ')+'upc"><div class="finhead"><b>📅 '+(u.today?'Today':esc(fmtDate(u.date)))+(u.start?' · '+esc(fmtHM(u.start)):'')+(u.venue?' · '+esc(u.venue):'')+'</b>'+(compact?'':'<button class="btn sm" data-ics>📅 Add to calendar</button>')+'</div>'+
    '<div class="saved" style="margin:2px 0 6px">'+(u.today?'Your part in today’s meeting':'You’re on at the next meeting')+'</div>'+
    u.parts.map(function(p){ return '<div class="upi"><span>'+p.icon+'</span><div><b>'+esc(p.t)+'</b>'+(p.d?'<div class="saved">'+esc(p.d)+'</div>':'')+'</div></div>'; }).join("")+
    (compact?'<div class="row" style="margin-top:8px"><button class="btn sm" data-ics>📅 Add to calendar</button></div>':'')+'</div>';
}
function icsEsc(s){ return String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n"); }
function downloadICS(){
  var u=myUpcoming(); if(!u) return;
  var d=u.date.replace(/-/g,""), t=(u.start||"17:30").replace(":","")+"00", endMin=(hm2min(u.start||"17:30")||1050)+150, end=String(Math.floor(endMin/60)%24).padStart(2,"0")+String(endMin%60).padStart(2,"0")+"00";
  var body=u.parts.map(function(p){return p.t+(p.d?" — "+p.d:"");}).join("\n")+"\n\nOpen the app: "+SITE_URL;
  var ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Dijital Team Colombo//Speechcraft Portal//EN","BEGIN:VEVENT","UID:"+S.mid+"-"+nkey(u.name).replace(/\W+/g,"")+"@speechcraft","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,""),
    "DTSTART:"+d+"T"+t,"DTEND:"+d+"T"+end,"SUMMARY:"+icsEsc("Speechcraft – "+u.parts.map(function(p){return p.t.split(" — ")[0];}).join(", ")),"LOCATION:"+icsEsc(u.venue),"DESCRIPTION:"+icsEsc(body),
    "BEGIN:VALARM","TRIGGER:-P1D","ACTION:DISPLAY","DESCRIPTION:"+icsEsc("Speechcraft tomorrow: "+u.parts[0].t),"END:VALARM",
    "BEGIN:VALARM","TRIGGER:-PT1H","ACTION:DISPLAY","DESCRIPTION:"+icsEsc("Speechcraft in 1 hour"),"END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"})); a.download="Speechcraft-"+u.date+".ics"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000);
}
document.addEventListener("click",function(e){ if(e.target.closest("[data-ics]")) downloadICS(); if(e.target.closest("[data-gqr]")){ L.gqr=!L.gqr; saveL(); renderAll(); } });
