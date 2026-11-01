/* ---------- 10-week progress: the Coordinator collects each week's meeting record ---------- */
var PKEY="speechcraftProgress"+NS;
function progLoad(){ try{ return JSON.parse(lsGet(PKEY)||"{}")||{}; }catch(e){ return {}; } }
function progSave(p){ lsSet(PKEY,JSON.stringify(p)); }
var PROG_ROLES=[["president","President"],["saa","Sergeant at Arms"],["tmod","Toastmaster"],["ge","General Evaluator"],["timer","Timer"],["ah","Ah-Counter"],["gram","Grammarian"],["ttm","Table Topics Master"],["rrm","Round Robin Master"]];
var PROG_TRY=["tmod","ge","timer","ah","gram","ttm","speaker","evaluator"];
var PROG_TRY_N={tmod:"Toastmaster",ge:"General Evaluator",timer:"Timer",ah:"Ah-Counter",gram:"Grammarian",ttm:"Table Topics Master",speaker:"Prepared speech",evaluator:"Evaluator"};
/* summarise one meeting (uses the normal helpers by briefly swapping in that meeting's data) */
function summarise(st){
  var keep=S, out=null;
  try{
    S=normalize(clone(st)); var t=now();
    var o={mid:S.mid,date:S.meta.date||"",week:S.meta.week||"",no:S.agenda.no||"",roles:{},speeches:[],tt:[],evals:[],ah:{},wotd:{},awards:[],present:[]};
    var addRole=function(n,k){ if(!n) return; var key=String(n).trim(); (o.roles[key]=o.roles[key]||[]).push(k); };
    PROG_ROLES.forEach(function(r){ asList(r[0]).forEach(function(n){ addRole(n,r[0]); }); });
    S.rows.ps.forEach(function(r,i){ if(rowState(r)!=="done") return; var n=baseName(displayName(r,i)), st2=status("ps",r,t); o.speeches.push({name:n,title:speechTitle(n),sec:elapsed(r,t),ok:!!st2.ok}); addRole(n,"speaker"); });
    asList("speakers").forEach(function(n){ if(!o.speeches.some(function(x){return nkey(x.name)===nkey(n);})) addRole(n,"speaker"); });
    S.rows.tt.forEach(function(r,i){ if(rowState(r)!=="done") return; o.tt.push({name:baseName(displayName(r,i)),sec:elapsed(r,t),ok:!!status("tt",r,t).ok}); });
    var evs=uniq(asList("sevals").concat(asList("ttevals"),S.assigns.map(function(a){return a.evaluator;}))); evs.forEach(function(n){ addRole(n,"evaluator"); o.evals.push(n); });
    S.ahRows.forEach(function(r){ o.ah[r.name]=ahTotal(r); });
    S.gramRows.forEach(function(r){ if(r.w) o.wotd[r.name]=r.w; });
    if(S.vote.state==="shown") VCATS.forEach(function(c){ tally(c.k).winners.forEach(function(w){ o.awards.push({cat:c.n,name:w.name}); }); });
    o.present=uniq(S.attend.filter(function(a){return a.mid===S.mid&&a.present;}).map(function(a){return a.name;}));
    Object.keys(o.roles).forEach(function(n){ o.roles[n]=uniq(o.roles[n]); });
    out=o;
  }catch(e){ out=null; }
  S=keep; return out;
}
function progMeetings(){
  var p=progLoad(), cur=summarise(S); if(cur&&(cur.speeches.length||Object.keys(cur.roles).length)) p[cur.mid]=Object.assign(cur,{current:true});
  return Object.keys(p).map(function(k){return p[k];}).sort(function(a,b){ return (a.date||"").localeCompare(b.date||"") || (a.week||"").localeCompare(b.week||""); });
}
function progPeople(ms){
  var ppl={}, get=function(n){ var k=nkey(n); if(!k) return null; return ppl[k]=ppl[k]||{name:String(n).trim(),weeks:{},roles:{},speeches:[],tt:0,awards:[],fillers:0,wotd:0}; };
  memberNames().forEach(get);
  ms.forEach(function(m,i){
    var wk=i;
    m.present.forEach(function(n){ var p=get(n); if(p) p.weeks[wk]=p.weeks[wk]||[]; });
    Object.keys(m.roles).forEach(function(n){ var p=get(n); if(!p) return; p.weeks[wk]=(p.weeks[wk]||[]).concat(m.roles[n]); m.roles[n].forEach(function(r){ p.roles[r]=(p.roles[r]||0)+1; }); });
    m.speeches.forEach(function(s){ var p=get(s.name); if(p) p.speeches.push({w:(m.week||"").replace(/^Week (\d+).*$/,"W$1")||m.date,title:s.title,sec:s.sec,ok:s.ok}); });
    m.tt.forEach(function(s){ var p=get(s.name); if(p){ p.tt++; p.weeks[wk]=p.weeks[wk]||[]; } });
    m.awards.forEach(function(a){ var p=get(a.name); if(p) p.awards.push(a.cat.replace(/^Best /,"")+" ("+((m.week||"").replace(/^Week (\d+).*$/,"W$1")||m.date)+")"); });
    Object.keys(m.ah).forEach(function(n){ var p=get(n); if(p) p.fillers+=m.ah[n]; });
    Object.keys(m.wotd).forEach(function(n){ var p=get(n); if(p) p.wotd+=m.wotd[n]; });
  });
  return Object.keys(ppl).map(function(k){return ppl[k];}).filter(function(p){ return L.progAll || memberKind(p.name)==="sc"; }).sort(function(a,b){return a.name.localeCompare(b.name);});
}
var ROLE_ICON={president:"🔔",saa:"🛎",tmod:"🎩",ge:"🧭",timer:"⏱",ah:"🔢",gram:"📝",ttm:"🎤",rrm:"🔁",speaker:"🎙",evaluator:"🗣"};
function progTableHTML(ms,ppl,print){
  var h='<table class="prog"><thead><tr><th>Name</th>'+ms.map(function(m,i){ return '<th class="c" title="'+esc(m.date)+'">'+esc((m.week||"").replace(/^Week (\d+).*$/,"W$1")||("#"+(i+1)))+'</th>'; }).join("")+'<th>Prepared speeches</th><th class="c">Table Topics</th><th>Awards</th>'+(print?'':'<th>Still to try</th>')+'</tr></thead><tbody>';
  ppl.forEach(function(p){
    var todo=PROG_TRY.filter(function(r){ return r==="speaker"?!p.speeches.length&&!p.roles.speaker:!p.roles[r]; });
    h+='<tr><td><b>'+esc(p.name)+'</b>'+kindBadge(p.name)+'<div class="saved">'+Object.keys(p.weeks).length+' of '+ms.length+' meetings</div></td>'+
      ms.map(function(m,i){ var w=p.weeks[i]; return '<td class="c pw">'+(w?(w.length?uniq(w).map(function(r){return '<span title="'+esc(PROG_TRY_N[r]||r)+'">'+(ROLE_ICON[r]||"•")+'</span>';}).join(""):'✓'):'<span class="muted">·</span>')+'</td>'; }).join("")+
      '<td>'+(p.speeches.length?p.speeches.map(function(s){ return esc(s.w)+(s.title?' “'+esc(s.title)+'”':'')+' '+fmt(s.sec)+(s.ok?' ✓':' ✗'); }).join('<br>'):'<span class="muted">—</span>')+'</td>'+
      '<td class="c">'+(p.tt||'<span class="muted">—</span>')+'</td><td>'+(p.awards.length?'🏆 '+esc(p.awards.join(", ")):'<span class="muted">—</span>')+'</td>'+
      (print?'':'<td class="saved">'+(todo.length?esc(todo.map(function(r){return PROG_TRY_N[r];}).join(", ")):'✓ tried them all')+'</td>')+'</tr>';
  });
  return h+'</tbody></table>';
}
function progressHTML(){
  var ms=progMeetings(), ppl=progPeople(ms);
  var h='<details class="card" id="progCard" style="margin-top:12px"'+(L.progOpen?' open':'')+'><summary><h2 class="sec" style="margin:0;display:inline-flex">📈 Speechcraft progress <span class="cnt">'+ms.length+' meeting'+(ms.length===1?'':'s')+'</span></h2></summary>';
  h+='<div class="note" style="margin-top:8px">Add each week’s saved meeting record (🏁 End of meeting → Save meeting record). This meeting is included automatically. Records are kept on this device only.</div>';
  h+='<div class="row" style="margin:8px 0"><button class="btn primary" id="progAdd">⤒ Add meeting records</button><input type="file" id="progFile" accept=".json,application/json" multiple hidden>'+(ms.length?'<button class="btn" id="progPrint">📄 Print progress</button>':'')+'<label class="tgl"><input type="checkbox" id="progAll"'+(L.progAll?' checked':'')+'> <span>Include Toastmasters &amp; guests</span></label></div>';
  if(ms.length) h+='<div class="chips">'+ms.map(function(m){ return '<span class="chip word">'+esc(m.week||"Meeting")+' · '+esc(m.date)+(m.current?' <i>(this meeting)</i>':'<button data-progdel="'+esc(m.mid)+'" title="Remove this record">✕</button>')+'</span>'; }).join("")+'</div>';
  if(ms.length && ppl.length) h+='<div class="progwrap">'+progTableHTML(ms,ppl,false)+'</div><div class="saved" style="margin-top:6px">'+Object.keys(ROLE_ICON).map(function(k){return ROLE_ICON[k]+' '+(PROG_TRY_N[k]||{president:"President",saa:"Sergeant at Arms",rrm:"Round Robin Master"}[k]);}).join(" · ")+' · ✓ attended</div>';
  return h+'</details>';
}
function progPrint(){
  var ms=progMeetings(), ppl=progPeople(ms), tm=document.querySelector(".logo img").src;
  document.getElementById("report").innerHTML='<div class="rlogos"><img src="'+tm+'" alt="Toastmasters International"><img src="'+document.querySelector(".logo.co img").src+'" alt="Dijital Team"></div><h2>Speechcraft Progress</h2><div class="sub">'+esc(GROUP)+' · '+ms.length+' meetings</div>'+progTableHTML(ms,ppl,true);
  document.getElementById("repPick").innerHTML='<b style="font-size:14px">Speechcraft progress</b>';
  var w=document.getElementById("reportWrap"); w.dataset.kind="progress"; w.classList.add("on");
}
(function(){
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    var t=e.target, b;
    if(L.role!=="coord"||!coordUnlocked()) return;
    if(t.closest("#progCard > summary")){ L.progOpen=!document.getElementById("progCard").open; saveL(); return; }
    if(t.closest("#progAdd")){ var f=document.getElementById("progFile"); f.value=""; f.click(); return; }
    if(t.closest("#progPrint")){ progPrint(); return; }
    if((b=t.closest("[data-progdel]"))){ var p=progLoad(), pk=b.dataset.progdel, psnap=clone(p[pk]); delete p[pk]; progSave(p); renderAll(); offerUndo("Removed from progress",function(){ var p2=progLoad(); p2[pk]=psnap; progSave(p2); }); return; }
  });
  V.addEventListener("change",function(e){
    if(e.target.id==="progAll"){ L.progAll=e.target.checked; saveL(); renderAll(); return; }
    if(e.target.id!=="progFile") return; var files=Array.prototype.slice.call(e.target.files||[]); if(!files.length) return;
    var p=progLoad(), added=0, bad=0, n=files.length;
    files.forEach(function(file){ var rd=new FileReader(); rd.onload=function(){ try{ var d=JSON.parse(rd.result), st=d&&d.app==="speechcraft-meeting"&&d.state; var sm=st&&summarise(st); if(sm){ delete sm.current; p[sm.mid]=sm; added++; } else bad++; }catch(err){ bad++; } if(--n===0){ progSave(p); L.progOpen=true; saveL(); renderAll(); showToastMsg("📈 Added "+added+" meeting record"+(added===1?"":"s")+(bad?" · "+bad+(bad===1?" file wasn’t a meeting record":" files weren’t meeting records"):"")); } }; rd.readAsText(file); });
  });
})();
