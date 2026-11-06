/* ---------- printable agenda (same layout as the club's agenda sheet) ---------- */
function ordinal(n){ var v=n%100; return n+((v>10&&v<14)?"th":({1:"st",2:"nd",3:"rd"}[n%10]||"th")); }
function isoDate(iso){ var p=String(iso||"").split("-"); return p.length===3?new Date(+p[0],+p[1]-1,+p[2]):null; }
function agDateLong(iso){ var d=isoDate(iso); if(!d) return iso||""; return ordinal(d.getDate())+" "+d.toLocaleDateString("en-AU",{month:"long"})+" "+d.getFullYear()+" ("+d.toLocaleDateString("en-AU",{weekday:"long"})+")"; }
function agDateShort(iso){ var d=isoDate(iso); if(!d) return iso||""; return ordinal(d.getDate())+" of "+d.toLocaleDateString("en-AU",{month:"long"}); }
var AG_SIDE=[["president","President"],["saa","Sergeant at Arms"],["tmod","Toastmaster"],["ttm","Table Topics Master"],["keynote","Keynote Presenter"],["rrm","Round Robin Master"],["ge","General Evaluator"],["timer","Timer"],["ah","Ah-Counter"],["gram","Grammarian"],["speakers","Prepared Speakers"],["sevals","Speech Evaluator"],["ttevals","Table Topics Evaluator"],["coord","Speechcraft Coordinator"]];
function agLines(arr){ return arr.map(function(x){ return '<div class="agl">'+x+'</div>'; }).join(""); }
function agExtraHTML(x,item){
  if(x==="speakers"){ var sp=uniq(asList("speakers").concat(S.speeches.filter(function(s){return s.type!=="tt";}).map(function(s){return s.name;}))); if(!sp.length) return "";
    return '<div class="agsub">'+agLines(sp.map(function(n){ var t=speechTitle(n), e=evaluatorOf(n); return esc(n)+(t?' – “'+esc(t)+'”':'')+(e?' <span class="agev">· evaluator '+esc(e)+'</span>':''); }))+'</div>'; }
  if(x==="keynote"){var p=presentationOf(item&&item.id||keynoteItems()[0]&&keynoteItems()[0].id);return p?'<div class="agsub">'+agLines([esc(p.name||assigned("keynote")||"")+(p.organization?" ("+esc(p.organization)+")":""),esc(p.topic||"")])+'</div>':"";}
  if(x==="ttevals"){ var tv=asList("ttevals"); return tv.length?'<div class="agsub">'+agLines(tv.map(esc))+'</div>':""; }
  if(x==="evals"){
    var h="", rep=["timer","ah","gram"].filter(function(k){return assigned(k);}).map(function(k){ return esc(arole(k).n)+' – '+esc(assigned(k)); });
    if(rep.length) h+='<div class="agsub"><div class="agh">Call for reports:</div>'+agLines(rep)+'</div>';
    var pairs=(S.assigns||[]).filter(function(a){return a.evaluator;}), se=pairs.length?pairs.map(function(a){ return esc(a.evaluator)+' <span class="agev">(for '+esc(a.speaker)+')</span>'; }):asList("sevals").map(esc);
    if(se.length) h+='<div class="agsub"><div class="agh">Prepared Speech evaluations –</div>'+agLines(se)+'</div>';
    var te=asList("ttevals"); if(te.length) h+='<div class="agsub"><div class="agh">Table Topics evaluations –</div>'+agLines(te.map(function(ev){ var sp=S.ttassign.filter(function(a){return nkey(a.evaluator)===nkey(ev);}).map(function(a){return a.speaker;}); return esc(ev)+(sp.length?' <span class="agev">(for '+esc(sp.join(", "))+')</span>':''); }))+'</div>';
    return h;
  }
  return "";
}
function agActivityHTML(it){
  var txt=String(it.text||""), A=S.agenda;
  if(it.role==="coord" && A.next){ var nd=agDateShort(A.next); txt=/next meeting\.?$/i.test(txt)?txt.replace(/next meeting\.?$/i,"next meeting on "+nd+"."):txt+" Next meeting: "+nd+"."; }
  var i=txt.indexOf(" — "), h;
  h = i>0 ? '<b class="aghd">'+esc(txt.slice(0,i))+'</b><div>'+esc(txt.slice(i+3).charAt(0).toUpperCase()+txt.slice(i+4))+'</div>' : esc(txt);
  return h+agExtraHTML(it.x,it);
}
function buildAgendaDoc(){
  var A=S.agenda, tm=document.querySelector(".logo img").src;
  var h='<div class="agdoc"><div class="aghead"><img src="'+tm+'" alt="Toastmasters International"><div><div class="agt1">SPEECHCRAFT PROGRAM</div><div class="agt2">'+esc(A.title||GROUP)+'</div><div class="agt3">Agenda for Speechcraft Program'+(A.no?' - No '+esc(A.no):'')+'</div></div></div>';
  h+='<div class="agmeta"><b>Date:</b> '+esc(agDateLong(S.meta.date)||"—")+(A.venue?'<br><b>Venue:</b> '+esc(A.venue):'')+(S.meta.week?'<br><b>Week:</b> '+esc(S.meta.week):'')+'</div>';
  h+='<div class="aggrid"><div><div class="agbox"><b>Club Mission</b><div class="agmission">'+CLUB_MISSION+'</div></div><div class="agbox"><b class="rpt">Role Players</b>';
  AG_SIDE.forEach(function(a){ var v=asList(a[0]); if(!v.length) return; h+='<div class="agrp"><div class="agrpn">'+a[1]+'</div>'+v.map(function(n){return '<div>'+esc(n)+'</div>';}).join("")+'</div>'; });
  h+='</div></div><table class="agtab"><thead><tr><th>Time</th><th>Role Player</th><th>Activity</th></tr></thead><tbody>';
  var last="";
  itemsSorted().forEach(function(it){
    var t=fmtHM(it.time);
    h+='<tr><td>'+(t!==last?t:'')+'</td><td>'+arole(it.role).n+'</td><td>'+agActivityHTML(it)+'</td></tr>';
    last=t;
  });
  h+='</tbody></table></div>';
  h+='</div>';
  document.getElementById("report").innerHTML=h;
}
function fitAgenda(){
  var doc=document.querySelector("#report .agdoc"); if(!doc) return;
  var m=doc.cloneNode(true); m.classList.add("agmeas"); document.getElementById("report").appendChild(m);
  var h=m.scrollHeight; m.remove();
  var z=h>1015?Math.max(0.6,Math.floor(1015/h*100)/100):1; doc.style.setProperty("--agz",z); doc.dataset.fit=z;
}
function openAgendaPrint(){
  buildAgendaDoc();
  document.getElementById("repPick").innerHTML='<b style="font-size:14px">Agenda'+(S.agenda.no?' – No '+esc(S.agenda.no):'')+'</b>';
  document.getElementById("reportWrap").classList.add("on"); document.getElementById("reportWrap").dataset.kind="agenda";
  fitAgenda();
}

