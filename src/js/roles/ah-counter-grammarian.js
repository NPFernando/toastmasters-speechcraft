/* ---------- Ah-Counter & Grammarian ---------- */
function selRow(kind){ var arr=kind==="ah"?S.ahRows:S.gramRows, id=kind==="ah"?L.ahSel:L.gramSel; return arr.find(function(x){return x.id===id;})||null; }
function ahTotal(r){ return S.fill.words.reduce(function(s,w){return s+(r.c[w]||0);},0); }
function speakerPicker(kind){
  var arr=kind==="ah"?S.ahRows:S.gramRows, sel=selRow(kind);
  var h='<div class="row"><input class="t" id="spkInput" list="roster" autocomplete="off" placeholder="Add speaker name"><button class="btn primary" id="spkAdd">+ Add speaker</button></div>';
  h+='<div class="chips" style="margin-top:10px">';
  if(!arr.length) h+='<span class="muted">No speakers yet. Add them above, or tap <b>+ Add / select</b> on whoever is speaking now.</span>';
  arr.forEach(function(r){
    var c= kind==="ah"?ahTotal(r):(r.w||0);
    h+='<button class="chip'+(sel&&sel.id===r.id?' active':'')+'" data-sel="'+r.id+'">'+esc(r.name)+'<span class="c">'+c+'</span></button>';
  });
  return h+'</div>';
}
function ahHTML(){
  var sel=selRow("ah"), words=S.fill.words;
  var h='<section class="card"><h2 class="sec" style="margin-top:0">Speakers</h2>'+speakerPicker("ah");
  if(sel){
    h+='<div class="selcard"><div class="hd"><b>'+esc(sel.name)+'</b><span class="pill">Total '+ahTotal(sel)+'</span><button class="iconbtn" data-rowdel="ah" title="Remove speaker">✕</button></div><div class="tapgrid">';
    words.forEach(function(w){ h+='<div class="tap" data-word="'+esc(w)+'"><button class="minus" data-minus="'+esc(w)+'" title="Undo one">−</button><div class="k">'+(sel.c[w]||0)+'</div><div class="w">'+esc(w)+'</div></div>'; });
    h+='</div></div>';
  } else if(S.ahRows.length) h+='<div class="selcard muted">Select a speaker above to start counting.</div>';
  h+='<details style="margin-top:12px"><summary class="saved" style="cursor:pointer">Words to count ('+words.length+')</summary><div class="chips" style="margin:8px 0">'+
     words.map(function(w){return '<span class="chip word">'+esc(w)+'<button data-wdel="'+esc(w)+'" title="Remove word">✕</button></span>';}).join("")+
     '</div><div class="row"><input class="t" id="wordInput" placeholder="Add a word, e.g. Basically"><button class="btn" id="wordAdd">+ Add word</button></div></details>';
  if(S.ahRows.length){
    var used=words.filter(function(w){return S.ahRows.some(function(r){return r.c[w];});});
    h+='<h2 class="sec">Summary</h2><div style="overflow-x:auto"><table class="sumtable"><thead><tr><th>Speaker</th>'+used.map(function(w){return '<th>'+esc(w)+'</th>';}).join("")+'<th>Total</th></tr></thead><tbody>';
    S.ahRows.forEach(function(r){ h+='<tr><td>'+esc(r.name)+'</td>'+used.map(function(w){return '<td>'+(r.c[w]||0)+'</td>';}).join("")+'<td><b>'+ahTotal(r)+'</b></td></tr>'; });
    h+='</tbody></table></div><div class="row" style="margin-top:8px">'+copyBtn("ah")+'</div>';
  }
  return h+'</section>';
}
function gramHTML(){
  var sel=selRow("gram");
  var h='<section class="card"><h2 class="sec" style="margin-top:0">Word of the Day</h2><div class="row"><input class="t" id="wotd" placeholder="Word" value="'+esc(S.gram.wotd)+'" style="max-width:260px"><input class="t" id="wotdMeaning" placeholder="Meaning / example sentence" value="'+esc(S.gram.meaning)+'"></div>';
  h+='<h2 class="sec">Speakers</h2>'+speakerPicker("gram");
  if(sel){
    h+='<div class="selcard"><div class="hd"><b>'+esc(sel.name)+'</b><button class="iconbtn" data-rowdel="gram" title="Remove speaker">✕</button></div>'+
       '<div class="row" style="margin-bottom:12px"><button class="btn go big1" id="wPlus">+1 Word of the Day'+(S.gram.wotd?' (“'+esc(S.gram.wotd)+'”)':'')+'</button><span style="font-size:26px;font-weight:800">'+(sel.w||0)+'</span><button class="btn" id="wMinus" title="Undo one">−1</button></div>'+
       '<div class="row"><input class="t" id="goodInput" placeholder="Great phrase or good use of language"><button class="btn" id="goodAdd">+ Add</button></div>'+
       '<ul class="notes">'+sel.good.map(function(n,i){return '<li><span>✨ '+esc(n)+'</span><button class="iconbtn" data-ndel="good" data-i="'+i+'">✕</button></li>';}).join("")+'</ul>'+
       '<div class="row" style="margin-top:10px"><input class="t" id="slipInput" placeholder="Slip or correction, e.g. “less people” → “fewer people”"><button class="btn" id="slipAdd">+ Add</button></div>'+
       '<ul class="notes">'+sel.slips.map(function(n,i){return '<li><span>✎ '+esc(n)+'</span><button class="iconbtn" data-ndel="slips" data-i="'+i+'">✕</button></li>';}).join("")+'</ul></div>';
  } else if(S.gramRows.length) h+='<div class="selcard muted">Select a speaker above to take notes.</div>';
  if(S.gramRows.length){
    h+='<h2 class="sec">Summary</h2><table class="sumtable"><thead><tr><th>Speaker</th><th>Word of the Day</th><th>Great phrases</th><th>Slips</th></tr></thead><tbody>';
    S.gramRows.forEach(function(r){ h+='<tr><td>'+esc(r.name)+'</td><td>'+(r.w||0)+'</td><td>'+r.good.length+'</td><td>'+r.slips.length+'</td></tr>'; });
    h+='</tbody></table><div class="row" style="margin-top:8px">'+copyBtn("gram")+'</div>';
  }
  return h+'</section>';
}
function addCounterSpeaker(kind,name){
  name=String(name||"").trim(); if(!name) return;
  var ex=counterRow(kind,name);
  if(kind==="ah") L.ahSel=ex.id; else L.gramSel=ex.id; selectPerson(name,kind); saveL(); remember(name); commit();
}

