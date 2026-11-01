/* ---------- Focus mode: only what the role needs right now ---------- */
var FOCUS_ROLES={timer:1,ah:1,gram:1,tmod:1,ttm:1};
function inFocus(){ return curView()==="role" && !!L.focus && !!FOCUS_ROLES[L.role]; }
function focusWho(){ return speakingNowName() || L.fsel || ""; }
function focusPeople(){ return uniq(asList("speakers").concat(S.ahRows.map(function(r){return r.name;}),S.gramRows.map(function(r){return r.name;}),S.topics.filter(function(t){return t.used;}).map(function(t){return t.speaker;}))); }
function focusWhoPicker(who){
  var live=!!speakingNowName(), ppl=focusPeople();
  return '<div class="fwho"><div class="flbl">'+(live?'🎙 Speaking now':'Who are you listening to?')+'</div><div class="fname">'+(who?esc(who):'<span class="muted">Waiting for the Timer…</span>')+'</div>'+
    (!live?'<div class="chips" style="justify-content:center;margin-top:8px">'+ppl.map(function(n){ return '<button class="chip'+(nkey(n)===nkey(who)?' active':'')+'" data-fsel="'+esc(n)+'">'+esc(n)+'</button>'; }).join("")+'<input class="t" id="fselNew" list="roster" autocomplete="off" placeholder="Other name" style="max-width:170px"></div>':'')+'</div>';
}
function focusHTML(){
  var r=L.role, h='<div class="fbar"><b>🎯 Focus · '+esc(roleObj(r).name)+'</b><button class="btn sm" data-focus="off">Show everything</button></div>';
  if(r==="timer"){
    var sid=L.tab||"tt", s=sessionOf(sid)||SESSIONS[0], idle=S.rows[sid].filter(function(x){return rowState(x)==="idle";}).slice(0,4);
    h+='<section class="card fcard"><div class="flbl">'+esc(s.name)+' · '+esc(limitsLine(sid,null))+'</div>'+
       '<div class="seg fseg">'+SESSIONS.map(function(x){ return '<button data-ftab="'+x.id+'" class="'+(x.id===sid?'on':'')+'">'+esc(x.name)+'</button>'; }).join("")+'</div>'+
       (runningList().length?'<div class="note" style="text-align:center">Timing now — use <b>Stop</b> on the live bar above.</div>':'')+
       '<div class="fnext">'+(idle.length?idle.map(function(x){ return '<button class="btn go fbig" data-fstart="'+x.id+'">▶ Start '+esc(displayName(x,S.rows[sid].indexOf(x)))+'</button>'; }).join(""):'<div class="muted" style="text-align:center">No one waiting on this list.</div>')+'</div>'+
       '<div class="row" style="margin-top:10px"><input class="t" id="fNewName" list="roster" autocomplete="off" placeholder="Someone else? Type a name (optional)"><button class="btn primary" data-fstartnew>▶ Start</button></div></section>';
  } else if(r==="ah"){
    var who=focusWho(), rec=who?S.ahRows.find(function(x){return nkey(x.name)===nkey(who);}):null;
    h+='<section class="card fcard">'+focusWhoPicker(who)+(who?'<div class="fgrid">'+S.fill.words.map(function(w){ return '<button class="fbtn" data-fah="'+esc(w)+'"><span>'+esc(w)+'</span><b>'+((rec&&rec.c[w])||0)+'</b></button>'; }).join("")+'</div><div class="row" style="justify-content:center;margin-top:10px"><button class="btn" data-fundo>↶ Undo last</button><span class="saved">Total for '+esc(who)+': '+(rec?ahTotal(rec):0)+'</span></div>':'')+'</section>';
  } else if(r==="gram"){
    var g=focusWho(), gr=g?S.gramRows.find(function(x){return nkey(x.name)===nkey(g);}):null;
    h+='<section class="card fcard">'+focusWhoPicker(g)+(g?'<button class="fbtn fwide" data-fwotd><span>+1 Word of the Day'+(S.gram.wotd?' “'+esc(S.gram.wotd)+'”':'')+'</span><b>'+((gr&&gr.w)||0)+'</b></button>'+
      '<div class="row" style="margin-top:10px"><input class="t" id="fNote" autocomplete="off" placeholder="Phrase or slip you heard"><button class="btn go" data-fnote="good">👍 Good</button><button class="btn" data-fnote="slips">✎ Slip</button></div>'+
      (gr&&(gr.good.length||gr.slips.length)?'<div class="saved" style="margin-top:6px">'+gr.good.length+' good · '+gr.slips.length+' slips noted</div>':''):'')+'</section>';
  } else if(r==="tmod"){
    var c=curItem(), ss=scheduleStatus();
    h+='<section class="card fcard" style="text-align:center">';
    if(c.cur){ var w1=whoFor(c.cur.role); h+='<div class="flbl">Now · '+esc(fmtHM(rt(c.cur)))+'</div><div class="fname">'+esc(arole(c.cur.role).n)+'</div>'+(w1?'<div class="fwho2">'+esc(w1)+'</div>':'')+'<div class="muted" style="margin-top:6px">'+esc(c.cur.text)+'</div>'+(ss?'<div class="'+ss.cls+'" style="margin-top:8px;font-weight:800">'+ss.txt+'</div>':''); }
    else h+='<div class="flbl">Ready</div><div class="fname">Start the meeting</div>';
    if(c.next){ var w2=whoFor(c.next.role); h+='<div class="fnextitem">Next · '+esc(fmtHM(rt(c.next)))+' '+esc(arole(c.next.role).n)+(w2?' · '+esc(w2):'')+'</div>'; }
    h+='<button class="btn primary fbig" style="margin-top:12px" data-frun>'+(c.cur?(c.next?'Next ▶':'End of agenda'):'▶ Start the meeting')+'</button></section>';
  } else if(r==="ttm"){
    var cur=topicById(S.cur.id), rem=remaining();
    h+='<section class="card fcard" style="text-align:center"><div class="flbl">Current topic · '+rem.length+' left</div><div class="ftopic">'+(cur?esc(cur.text):'<span class="muted">No topic picked</span>')+'</div>'+
       '<div class="row" style="justify-content:center;margin-top:10px"><button class="btn" data-frandom>🎲 Random topic</button>'+(cur?'<button class="btn" data-fshow>📺 Show on screen</button>':'')+'</div>'+
       (cur&&!cur.used?'<div class="row" style="margin-top:12px"><input class="t" id="callName" list="roster" autocomplete="off" placeholder="Who is taking this topic?"><button class="btn go" data-fcall>🎤 Call speaker</button></div>':'')+'</section>';
  }
  return h;
}
function fRec(kind,name){ var arr=kind==="ah"?S.ahRows:S.gramRows, ex=arr.find(function(x){return nkey(x.name)===nkey(name);}); if(!ex){ ex=kind==="ah"?{id:uid(),name:name,c:{},ord:maxOrd(arr)+1,u:now()}:{id:uid(),name:name,w:0,good:[],slips:[],ord:maxOrd(arr)+1,u:now()}; arr.push(ex); } return ex; }
var fUndo=null;
(function(){
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    var t=e.target, b;
    if((b=t.closest("[data-focus]"))){ L.focus=b.dataset.focus==="on"; saveL(); renderAll(); window.scrollTo(0,0); return; }
    if(!inFocus()) return;
    if((b=t.closest("[data-ftab]"))){ L.tab=b.dataset.ftab; saveL(); renderAll(); return; }
    if((b=t.closest("[data-fstart]"))){ startRow(L.tab||"tt",b.dataset.fstart); return; }
    if(t.closest("[data-fstartnew]")){ var sid=L.tab||"tt", nm=(document.getElementById("fNewName").value||"").trim(), r=newRow(sid,nm); S.rows[sid].push(r); if(nm) remember(nm); startRow(sid,r.id); return; }
    if((b=t.closest("[data-fsel]"))){ L.fsel=b.dataset.fsel; if(selectPerson(b.dataset.fsel,L.role)) commit(); else { saveL(); renderAll(); } return; }
    if((b=t.closest("[data-fah]"))){ var who=focusWho(); if(!who) return; var rec=fRec("ah",who), w=b.dataset.fah; rec.c[w]=(rec.c[w]||0)+1; tick(rec); fUndo={id:rec.id,w:w}; commit(); return; }
    if(t.closest("[data-fundo]")){ if(!fUndo) return; var r2=S.ahRows.find(function(x){return x.id===fUndo.id;}); if(r2&&r2.c[fUndo.w]>0){ r2.c[fUndo.w]--; tick(r2); commit(); } fUndo=null; return; }
    if(t.closest("[data-fwotd]")){ var g=focusWho(); if(!g) return; var gr=fRec("gram",g); gr.w=(gr.w||0)+1; tick(gr); commit(); return; }
    if((b=t.closest("[data-fnote]"))){ var g2=focusWho(), inp=document.getElementById("fNote"), tx=(inp.value||"").trim(); if(!g2||!tx){ inp.focus(); return; } var gr2=fRec("gram",g2); gr2[b.dataset.fnote].push(tx); tick(gr2); commit(); showToastMsg(b.dataset.fnote==="good"?"👍 Saved for "+g2:"✎ Slip noted for "+g2); return; }
    if(t.closest("[data-frun]")){ var c=curItem(); if(!c.cur){ if(c.its[0]) runGo(c.its[0].id); } else if(c.next) runGo(c.next.id); return; }
    if(t.closest("[data-frandom]")){ randomTopic(); return; }
    if(t.closest("[data-fshow]")){ openStage(); return; }
    if(t.closest("[data-fcall]")){ callSpeaker(); return; }
  });
  V.addEventListener("keydown",function(e){
    if(!inFocus()||e.key!=="Enter") return;
    if(e.target.id==="fselNew"){ var v=(e.target.value||"").trim(); if(v){ L.fsel=v; remember(v); if(selectPerson(v,L.role)) commit(); else { saveL(); renderAll(); } } }
    else if(e.target.id==="fNewName"){ V.querySelector("[data-fstartnew]").click(); }
    else if(e.target.id==="callName"){ V.querySelector("[data-fcall]").click(); }
  });
  V.addEventListener("change",function(e){ if(inFocus()&&e.target.id==="fselNew"){ var v=(e.target.value||"").trim(); if(v){ L.fsel=v; remember(v); if(selectPerson(v,L.role)) commit(); else { saveL(); renderAll(); } } } });
})();
document.getElementById("roles").addEventListener("click",function(e){ if(e.target.closest("[data-focus]")){ L.focus=true; L.view="role"; saveL(); renderAll(); window.scrollTo(0,0); } });
