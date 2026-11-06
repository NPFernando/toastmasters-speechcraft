/* ---------- report ---------- */
function fmtDate(iso){ if(!iso) return ""; var p=iso.split("-"); if(p.length!==3) return iso; return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}); }
var REPSECS=[{id:"timer",name:"Timer"},{id:"ttm",name:"Table Topics"},{id:"rrm",name:"Round Robin"},{id:"ah",name:"Ah-Counter"},{id:"gram",name:"Grammarian"},{id:"evals",name:"Evaluations"},{id:"ge",name:"General Evaluator"},{id:"awards",name:"Awards"},{id:"guests",name:"President & guests"},{id:"attend",name:"Attendance"}];
function hasData(k){
  if(k==="timer") return SESSIONS.some(function(s){return S.rows[s.id].length;});
  if(k==="ttm") return S.topics.length>0; if(k==="ah") return S.ahRows.length>0;
  if(k==="rrm") return S.rrq.length>0;
  if(k==="evals") return S.evals.some(function(e){return e.done;});
  if(k==="ge") return geHasNotes();
  if(k==="awards") return S.vote.state==="shown";
  if(k==="guests") return S.guests.length>0||Object.keys(S.pres.chk||{}).length>0;
  if(k==="attend") return S.attend.some(function(a){return a.mid===S.mid&&a.present;});
  return S.gramRows.length>0||!!S.gram.wotd;
}
function renderRepPick(){
  document.getElementById("repPick").innerHTML=REPSECS.map(function(r){
    return '<label><input type="checkbox" data-rep="'+r.id+'"'+(L.rep[r.id]!==false?' checked':'')+(hasData(r.id)?'':' disabled')+'> '+r.name+(hasData(r.id)?'':' <span style="color:#999">(no data)</span>')+'</label>';
  }).join("");
}
function buildReport(){
  var t=now(), m=S.meta, h="";
  var inc=function(k){ return L.rep[k]!==false && hasData(k); };
  h+='<div class="rlogos"><img src="'+document.querySelector(".logo img").src+'" alt="Toastmasters International"><img src="'+document.querySelector(".logo.co img").src+'" alt="Dijital Team"></div>';
  h+='<h2>Speechcraft Meeting Report</h2><div class="sub">'+esc(GROUP)+(m.week?' · '+esc(m.week):'')+'</div>';
  h+='<div class="mgrid"><div><span>Group</span>'+esc(GROUP)+'</div><div><span>Date</span>'+esc(fmtDate(m.date)||"—")+'</div><div><span>Week</span>'+esc(m.week||"—")+'</div><div></div>'+
     AROLES.map(function(a){ var v=asList(a.k).join(", ")||S.people[a.k]||""; return v?'<div><span>'+a.n+'</span>'+esc(v)+'</div>':''; }).join("")+'</div>';
  if(inc("timer")){
    h+='<h4>⏱ Timer’s Report</h4>';
    var totalDone=0,totalOk=0,script=[];
    SESSIONS.forEach(function(s){
      var L2=S.limits[s.id], rows=S.rows[s.id];
      var lim=s.type==="rr"?"Bell at "+fmt(L2.b):s.type==="rep"?"Timer & Ah-Counter 1 min · Grammarian 2 min":"Green "+fmt(L2.g)+" · Amber "+fmt(L2.a)+" · Red "+fmt(L2.r);
      var done=rows.filter(function(r){return rowState(r)!=="idle";}), ok=done.filter(function(r){return rowState(r)==="done"&&status(s.id,r,t).ok;}).length;
      var untimed=rows.filter(function(r){return rowState(r)==="idle";}).map(function(r){return displayName(r,rows.indexOf(r));});
      h+='<h3>'+s.name+'<small>'+lim+'</small></h3>';
      if(!done.length){ h+='<div class="none">No speakers recorded.'+(untimed.length?' Not timed: '+esc(untimed.join(", "))+'.':'')+'</div>'; return; }
      h+='<table><thead><tr><th style="width:34px">#</th><th>Speaker</th><th class="c">Time</th><th>Result</th></tr></thead><tbody>';
      var shown=0;
      rows.forEach(function(r,i){
        if(rowState(r)==="idle") return; shown++;
        var st=status(s.id,r,t), sec=elapsed(r,t), cls=st.ok?"q":(st.cls==="st-o"?"o":(st.cls==="st-u"?"u":""));
        var txt=rowState(r)==="running"?"Still running":st.text;
        h+='<tr><td>'+shown+'</td><td>'+esc(displayName(r,i))+(s.id==="ps"&&speechTitle(baseName(r.name))?'<div style="color:#666;font-size:11px">“'+esc(speechTitle(baseName(r.name)))+'”</div>':'')+'</td><td class="c">'+fmt(sec)+'</td><td class="'+cls+'">'+esc(txt)+esc(pauseNote(r))+(r.manual!=null?' <span style="color:#888;font-weight:400">'+(r.start==null?'(entered manually)':'(adjusted)')+'</span>':'')+'</td></tr>';
      });
      h+='</tbody></table>';
      if(untimed.length) h+='<div style="margin-top:3px;color:#666">Not timed: '+esc(untimed.join(", "))+'</div>';
      var st2=statsText(timeStats([s.id],t),"Segment ran");
      h+='<div style="margin-top:4px;color:#444">'+ok+' of '+done.length+' speakers '+(s.type==="rr"?"within time":"qualified")+'.'+(st2?' &nbsp;·&nbsp; '+esc(st2):'')+'</div>';
      totalDone+=done.length; totalOk+=ok;
      var names=done.filter(function(r){return rowState(r)==="done";}).map(function(r){return displayName(r,rows.indexOf(r))+" "+fmt(elapsed(r,t));});
      if(names.length) script.push(s.name+": "+names.join(", ")+".");
    });
    var all=timeStats(SESSIONS.map(function(s){return s.id;}),t);
    h+='<div class="summary"><b>Overall:</b> '+totalOk+' of '+totalDone+' speakers within their time.';
    if(all.n){
      h+='<table style="margin-top:6px"><thead><tr><th>Session</th><th class="c">Speakers</th><th class="c">Speaking time</th><th>Segment</th></tr></thead><tbody>';
      SESSIONS.forEach(function(s){ var ts=timeStats([s.id],t); if(!ts.n) return; h+='<tr><td>'+s.name+'</td><td class="c">'+ts.n+'</td><td class="c">'+fmtLong(ts.speak)+'</td><td>'+(ts.span!=null?clock(ts.from)+' – '+clock(ts.to)+' ('+fmtLong(ts.span)+')':'—')+'</td></tr>'; });
      h+='<tr style="font-weight:700"><td>Whole meeting</td><td class="c">'+all.n+'</td><td class="c">'+fmtLong(all.speak)+'</td><td>'+(all.span!=null?clock(all.from)+' – '+clock(all.to)+' ('+fmtLong(all.span)+')':'—')+'</td></tr></tbody></table>';
    }
    h+='</div>';
    if(script.length) h+='<div class="script"><b>Report to the meeting</b>\n'+esc(script.join("\n"))+'</div>';
  }
  if(inc("ttm")){
    var used=S.topics.filter(function(x){return x.used;}).sort(function(a,b){return (a.usedAt||0)-(b.usedAt||0);}), rem=remaining();
    h+='<h4>🎤 Table Topics</h4>';
    if(used.length){
      h+='<table><thead><tr><th style="width:34px">#</th><th>Topic</th><th>Speaker</th><th class="c">Time</th></tr></thead><tbody>';
      used.forEach(function(x,i){ var r=x.rowId&&findRow("tt",x.rowId), sec=r?elapsed(r,t):null;
        h+='<tr><td>'+(i+1)+'</td><td>'+esc(x.text)+'</td><td>'+esc(x.speaker||"—")+'</td><td class="c">'+(sec==null?"—":fmt(sec))+'</td></tr>'; });
      h+='</tbody></table>';
    } else h+='<div class="none">No topics used.</div>';
    if(rem.length) h+='<div style="margin-top:4px;color:#555"><b>Unused topics ('+rem.length+'):</b> '+esc(rem.map(function(x){return x.text;}).join(" · "))+'</div>';
  }
  if(inc("ah")){
    var words=S.fill.words.filter(function(w){return S.ahRows.some(function(r){return r.c[w];});}), grand=0;
    h+='<h4>🔢 Ah-Counter’s Report</h4><table><thead><tr><th>Speaker</th>'+words.map(function(w){return '<th class="c">'+esc(w)+'</th>';}).join("")+'<th class="c">Total</th></tr></thead><tbody>';
    S.ahRows.forEach(function(r){ var tot=ahTotal(r); grand+=tot; h+='<tr><td>'+esc(r.name)+'</td>'+words.map(function(w){return '<td class="c">'+(r.c[w]||0)+'</td>';}).join("")+'<td class="c"><b>'+tot+'</b></td></tr>'; });
    h+='</tbody></table><div style="margin-top:4px;color:#444">'+grand+' filler words counted across '+S.ahRows.length+' speakers.'+(S.ahRows.length?' Cleanest: '+esc(S.ahRows.slice().sort(function(a,b){return ahTotal(a)-ahTotal(b);})[0].name)+'.':'')+'</div>';
  }
  if(inc("gram")){
    h+='<h4>📝 Grammarian’s Report</h4>';
    if(S.gram.wotd) h+='<div><b>Word of the Day:</b> '+esc(S.gram.wotd)+(S.gram.meaning?' — '+esc(S.gram.meaning):'')+'</div>'+(S.gram.example?'<div><b>Example:</b> '+esc(S.gram.example)+'</div>':'');
    if(S.gramRows.length){
      h+='<table style="margin-top:6px"><thead><tr><th>Speaker</th><th class="c">WOTD uses</th><th>Great phrases</th><th>Slips / corrections</th></tr></thead><tbody>';
      S.gramRows.forEach(function(r){ h+='<tr><td>'+esc(r.name)+'</td><td class="c">'+(r.w||0)+'</td><td>'+esc(r.good.join("; "))+'</td><td>'+esc(r.slips.join("; "))+'</td></tr>'; });
      h+='</tbody></table>';
      var wsum=S.gramRows.reduce(function(s,r){return s+(r.w||0);},0);
      h+='<div style="margin-top:4px;color:#444">Word of the Day used '+wsum+' time'+(wsum===1?'':'s')+'.</div>';
    }
  }
  if(inc("rrm")){
    h+='<h4>🔁 Round Robin</h4><table><thead><tr><th>Question</th><th>Answered by</th></tr></thead><tbody>'+S.rrq.filter(function(q){return q.used;}).map(function(q){ var who=S.rows.rr.filter(function(r){return r.qid===q.id;}).map(function(r){ var sec=elapsed(r,t); return r.name+(sec!=null?" ("+fmt(sec)+")":""); }); return '<tr><td>'+esc(q.text)+'</td><td>'+esc(who.join(", ")||"—")+'</td></tr>'; }).join("")+'</tbody></table>';
  }
  if(inc("evals")){
    h+='<h4>🗣 Evaluations</h4>';
    h+='<table><thead><tr><th>Speaker</th><th>Type</th><th>Evaluated by</th></tr></thead><tbody>'+S.evals.filter(function(e){return e.done;}).map(function(e){ return '<tr><td>'+esc(e.speaker)+'</td><td>'+(e.kind==="tt"?"Table Topics":"Prepared speech")+'</td><td>'+esc(e.by)+'</td></tr>'; }).join("")+'</tbody></table><div style="color:#666;margin-top:3px">🔒 Evaluation contents are private to each speaker (on their feedback card).</div>';
  }
  if(inc("ge")){ h+='<h4>🧭 General Evaluator</h4>'+geObservationLines().map(function(line){return '<div>'+esc(line)+'</div>';}).join('')+(S.genotes.good?'<div><b>What went well:</b> '+esc(S.genotes.good)+'</div>':'')+(S.genotes.improve?'<div><b>What could be better:</b> '+esc(S.genotes.improve)+'</div>':''); }
  if(inc("awards")){ h+='<h4>🏆 Awards</h4><table><tbody>'+VCATS.map(function(c){ var tl=tally(c.k); return '<tr><td>'+c.n+'</td><td><b>'+esc(tl.winners.map(function(w){return w.name;}).join(" & ")||"—")+'</b></td><td class="c">'+(tl.winners.length?tl.winners[0].n+' votes':'')+'</td></tr>'; }).join("")+'</tbody></table><div style="color:#666;margin-top:3px">'+votersCount()+' voters recorded.</div>'; }
  if(inc("guests")){ var pc2=presChecks(), od=pc2.open.length-chkLeft("pres","open",pc2.open).length, cd=pc2.close.length-chkLeft("pres","close",pc2.close).length;
    h+='<h4>🔔 President &amp; guests</h4><div>Opening '+od+'/'+pc2.open.length+' · Closing '+cd+'/'+pc2.close.length+(S.pres.notes?' · Announcements: '+esc(S.pres.notes):'')+'</div>';
    if(S.guests.length){ h+='<table style="margin-top:4px"><thead><tr><th style="width:34px">#</th><th>Guest</th><th>From / how they heard</th><th class="c">Welcomed</th></tr></thead><tbody>'+S.guests.map(function(g,i){ return '<tr><td>'+(i+1)+'</td><td>'+esc(g.name)+'</td><td>'+esc(g.from||"—")+'</td><td class="c">'+(g.welcomed?'✓':'—')+'</td></tr>'; }).join("")+'</tbody></table>'; }
    else h+='<div class="none">No guests recorded.</div>'; }
  if(inc("attend")){ var pr=S.attend.filter(function(a){return a.mid===S.mid&&a.present;}).map(function(a){return a.name;}); h+='<h4>✅ Attendance</h4><div>'+pr.length+' present: '+esc(pr.join(", "))+'</div>'; }
  if(!REPSECS.some(function(r){return inc(r.id);})) h+='<div class="none" style="margin-top:14px">Nothing selected. Tick a section above that has data.</div>';
  h+='<div class="sign"><span>'+esc(myName()?ROLES.find(function(r){return r.id===L.role;}).name+": "+myName():"")+'</span><span>Generated '+new Date().toLocaleString("en-AU",{dateStyle:"medium",timeStyle:"short"})+'</span></div>';
  document.getElementById("report").innerHTML=h;
}
document.getElementById("openReport").addEventListener("click",function(){
  if(anyRunning()&&!confirm("A speaker is still being timed. Open the report anyway? (They will show as 'Still running'.)")) return;
  renderRepPick(); buildReport(); document.getElementById("reportWrap").dataset.kind="report"; document.getElementById("reportWrap").classList.add("on");
});
document.getElementById("repPick").addEventListener("change",function(e){ var k=e.target.dataset.rep; if(!k) return; L.rep[k]=e.target.checked; saveL(); buildReport(); });
document.getElementById("closeReport").addEventListener("click",function(){ document.getElementById("reportWrap").classList.remove("on"); });
document.getElementById("printReport").addEventListener("click",function(){ var old=document.title; if(document.getElementById("reportWrap").dataset.kind==="card"){ document.title="Speechcraft Feedback "+(document.getElementById("reportWrap").dataset.card||"")+" "+(S.meta.date||""); window.print(); setTimeout(function(){document.title=old;},500); return; }
  if(document.getElementById("reportWrap").dataset.kind==="guide"){ document.title="Speechcraft Role Guides"; window.print(); setTimeout(function(){document.title=old;},500); return; }
  if(document.getElementById("reportWrap").dataset.kind==="agenda"){ document.title="Speechcraft Agenda "+(S.agenda.no?"No "+S.agenda.no+" ":"")+(S.meta.date||""); window.print(); setTimeout(function(){document.title=old;},500); return; } document.title="Speechcraft Report "+(S.meta.date||"")+(S.meta.week?" "+S.meta.week:""); window.print(); setTimeout(function(){document.title=old;},500); });
["reportWrap","connModal"].forEach(function(id){ document.getElementById(id).addEventListener("click",function(e){ if(e.target.id===id) e.target.classList.remove("on"); }); });
document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ document.getElementById("reportWrap").classList.remove("on"); document.getElementById("connModal").classList.remove("on"); closeStage(); } });

