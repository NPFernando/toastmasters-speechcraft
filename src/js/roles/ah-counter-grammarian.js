function counterFormat(kind){ return L[kind+"Format"]||runningList()[0]?.sid||S.timerTurn?.sid||"other"; }
function ahFormat(){ return counterFormat("ah"); }
function ahFormatName(id){ return sessionOf(id)?.name||"Other / unassigned"; }
function formatRecord(kind,name,format){ return (kind==="ah"?S.ahRows:S.gramRows).find(function(row){ return (row.format||"other")===format&&(nkey(row.name)===nkey(name)||nkey(row.sourceName)===nkey(name)); }); }
function ahRecord(name,format){ return formatRecord("ah",name,format); }
function ahNames(format){
  var names=format==="other"?[]:timerRows(format).map(function(row){return baseName(row.name);});
  if(format==="tt") names=names.concat(ttSpeakers());
  if(format==="ps") names=names.concat(preparedSpeakers());
  return uniq(names.filter(Boolean));
}
function ahTabs(kind){
  kind=kind||"ah";
  return '<label class="f">Speaking format<select class="t" id="'+kind+'Format"><option value="">Follow Timer</option>'+
    SESSIONS.concat([{id:"other",name:ahFormatName("other")}]).map(function(s){
      return '<option value="'+s.id+'"'+(L[kind+"Format"]===s.id?' selected':'')+'>'+esc(s.name)+'</option>';
    }).join("")+'</select></label><h2 class="sec">'+esc(ahFormatName(counterFormat(kind)))+'</h2>';
}
/* ---------- Ah-Counter & Grammarian ---------- */
function selRow(kind){ var arr=kind==="ah"?S.ahRows:S.gramRows, id=kind==="ah"?L.ahSel:L.gramSel; return arr.find(function(x){return x.id===id&&(x.format||"other")===counterFormat(kind);})||null; }
function ahTotal(r){ return S.fill.words.reduce(function(s,w){return s+(r.c[w]||0);},0); }
function speakerPicker(kind){
  var format=counterFormat(kind), arr=(kind==="ah"?S.ahRows:S.gramRows).filter(function(r){return (r.format||"other")===format;}), sel=selRow(kind);
  var suggested=ahNames(format).filter(function(n){return !formatRecord(kind,n,format);});
  var h='<div class="row"><input class="t" id="spkInput" list="roster" autocomplete="off" placeholder="Add speaker name"><button class="btn primary" id="spkAdd">+ Add speaker</button></div>';
  h+='<div class="chips" style="margin-top:10px">';
  if(!arr.length&&!suggested.length) h+='<span class="muted">No speakers yet. Add them above, or tap <b>+ Add / select</b> on whoever is speaking now.</span>';
  arr.forEach(function(r){
    var c= kind==="ah"?ahTotal(r):(r.w||0);
    h+='<button class="chip'+(sel&&sel.id===r.id?' active':'')+'" data-sel="'+r.id+'">'+esc(r.name)+'<span class="c">'+c+'</span></button>';
  });
  suggested.forEach(function(name){ h+='<button class="chip" data-counter-suggest="'+esc(name)+'">'+esc(name)+'</button>'; });
  return h+'</div>';
}
function ahHTML(){
  var sel=selRow("ah"), words=S.fill.words;
  var h='<section class="card">'+ahTabs()+speakerPicker("ah");
  if(sel){
    h+='<div class="selcard"><div class="hd"><label class="f">Speaker name<input class="t" id="ahSpeakerName" value="'+esc(sel.name)+'"></label><span class="pill">Total '+ahTotal(sel)+'</span><button class="iconbtn" data-rowdel="ah" title="Remove speaker">✕</button></div><div class="tapgrid">';
    words.forEach(function(w){ var count=sel.c[w]||0; h+='<div class="tap"><button type="button" class="tap-add" data-word="'+esc(w)+'" aria-label="'+esc("Add one "+w+" ("+count+" counted)")+'"><span class="k">'+count+'</span><span class="w">'+esc(w)+'</span><span aria-hidden="true">+1</span></button><button type="button" class="minus" data-minus="'+esc(w)+'" aria-label="'+esc("Remove one "+w)+'" aria-disabled="'+(count===0)+'">−1</button></div>'; });
    h+='</div></div>';
  } else if(S.ahRows.length) h+='<div class="selcard muted">Select a speaker above to start counting.</div>';
  h+='<details style="margin-top:12px"><summary class="saved" style="cursor:pointer">Words to count ('+words.length+')</summary><div class="chips" style="margin:8px 0">'+
     words.map(function(w){return '<span class="chip word">'+esc(w)+'<button data-wdel="'+esc(w)+'" title="Remove word">✕</button></span>';}).join("")+
     '</div><div class="row"><input class="t" id="wordInput" placeholder="Add a word, e.g. Basically"><button class="btn" id="wordAdd">+ Add word</button></div></details>';
  if(S.ahRows.length){
    var used=words.filter(function(w){return S.ahRows.some(function(r){return r.c[w];});});
    h+='<h2 class="sec">Summary</h2><div style="overflow-x:auto"><table class="sumtable"><thead><tr><th>Speaker</th><th>Format</th>'+used.map(function(w){return '<th>'+esc(w)+'</th>';}).join("")+'<th>Total</th></tr></thead><tbody>';
    S.ahRows.forEach(function(r){ h+='<tr><td>'+esc(r.name)+'</td><td>'+esc(ahFormatName(r.format))+'</td>'+used.map(function(w){return '<td>'+(r.c[w]||0)+'</td>';}).join("")+'<td><b>'+ahTotal(r)+'</b></td></tr>'; });
    h+='</tbody></table></div><div class="row" style="margin-top:8px">'+copyBtn("ah")+'</div>';
  }
  return h+'</section>';
}
var WORD_FIELDS={wotd:"wotd",wotdMeaning:"meaning",wotdExample:"example"};
function wordOfDayDetailsHTML(){
  return (S.gram.meaning?'<div><b>Meaning:</b> '+esc(S.gram.meaning)+'</div>':'')+
    (S.gram.example?'<div><b>Example:</b> '+esc(S.gram.example)+'</div>':'');
}
function revealWordOfDay(){
  if(L.role!=="gram") return;
  var word={};
  for(var id of Object.keys(WORD_FIELDS)){
    var field=document.getElementById(id);
    if(!field||!field.reportValidity()) return;
    var value=field.value.trim();
    if(!value){ field.focus(); return; }
    word[WORD_FIELDS[id]]=value;
  }
  Object.assign(S.gram,word);
  tick(S.gram);
  var draft=wordDraft();
  Object.keys(WORD_FIELDS).forEach(function(id){ delete draft[id]; });
  saveL(); syncWordDraft();
  commit();
}
function gramHTML(){
  var sel=selRow("gram");
  var draft=wordDraft(), labels={wotd:"Word",wotdMeaning:"Meaning",wotdExample:"Example sentence"};
  var h='<section class="card"><h2 class="sec" style="margin-top:0">Word of the Day</h2>'+
    '<div class="saved">'+(S.gram.wotd?'Published: '+esc(S.gram.wotd)+'. Changes stay private until you publish again.':'Only you can read the draft on devices with your feedback PIN unlocked.')+'</div>'+
    draftAccessHTML()+Object.keys(WORD_FIELDS).map(function(id){
      var value=draft[id]??S.gram[WORD_FIELDS[id]];
      return '<label class="lbl" for="'+id+'">'+labels[id]+'</label><input class="t" id="'+id+'" value="'+esc(value)+'" required pattern=".*\\S.*" style="width:100%;margin-bottom:8px">';
    }).join("")+
    '<button class="btn go" id="wotdReveal">'+(S.gram.wotd?'Publish updated word':'Reveal to everyone')+'</button>';
  h+=ahTabs("gram")+speakerPicker("gram");
  if(sel){
    h+='<div class="selcard"><div class="hd"><label class="f">Speaker name<input class="t" id="gramSpeakerName" value="'+esc(sel.name)+'"></label><button class="iconbtn" data-rowdel="gram" title="Remove speaker">✕</button></div>'+
       '<div class="row" style="margin-bottom:12px"><button class="btn go big1" id="wPlus">+1 Word of the Day'+(S.gram.wotd?' (“'+esc(S.gram.wotd)+'”)':'')+'</button><span style="font-size:26px;font-weight:800">'+(sel.w||0)+'</span><button class="btn" id="wMinus" title="Undo one">−1</button></div>'+
       '<div class="row"><input class="t" id="goodInput" placeholder="Great phrase or good use of language"><button class="btn" id="goodAdd">+ Add</button></div>'+
       '<ul class="notes">'+sel.good.map(function(n,i){return '<li><span>✨ '+esc(n)+'</span><button class="iconbtn" data-ndel="good" data-i="'+i+'">✕</button></li>';}).join("")+'</ul>'+
       '<div class="row" style="margin-top:10px"><input class="t" id="slipInput" placeholder="Slip or correction, e.g. “less people” → “fewer people”"><button class="btn" id="slipAdd">+ Add</button></div>'+
       '<ul class="notes">'+sel.slips.map(function(n,i){return '<li><span>✎ '+esc(n)+'</span><button class="iconbtn" data-ndel="slips" data-i="'+i+'">✕</button></li>';}).join("")+'</ul></div>';
  } else if(S.gramRows.length) h+='<div class="selcard muted">Select a speaker above to take notes.</div>';
  if(S.gramRows.length){
    h+='<h2 class="sec">Summary</h2><table class="sumtable"><thead><tr><th>Speaker</th><th>Format</th><th>Word of the Day</th><th>Great phrases</th><th>Slips</th></tr></thead><tbody>';
    S.gramRows.forEach(function(r){ h+='<tr><td>'+esc(r.name)+'</td><td>'+esc(ahFormatName(r.format))+'</td><td>'+(r.w||0)+'</td><td>'+r.good.length+'</td><td>'+r.slips.length+'</td></tr>'; });
    h+='</tbody></table><div class="row" style="margin-top:8px">'+copyBtn("gram")+'</div>';
  }
  return h+'</section>';
}
function addCounterSpeaker(kind,name){
  name=String(name||"").trim(); if(!name) return;
  clearDeviceDraft("spkInput");
  var ex=counterRow(kind,name);
  if(kind==="ah") L.ahSel=ex.id; else L.gramSel=ex.id; selectPerson(name,kind); saveL(); remember(name); commit();
}

