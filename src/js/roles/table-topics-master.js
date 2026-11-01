/* ---------- Table Topics Master view ---------- */
function topicById(id){ return S.topics.find(function(x){return x.id===id;}); }
function remaining(){ return S.topics.filter(function(x){return !x.used;}); }
function ttmHTML(){
  var cur=topicById(S.cur.id), rem=remaining(), used=S.topics.filter(function(x){return x.used;});
  var h='<section class="card">';
  if(cur){
    h+='<div class="curtopic"><div class="lbl">Current topic'+(cur.used?' · <span class="called">✓ Called: '+esc(cur.speaker||"")+'</span>':'')+'</div><div class="txt">'+esc(cur.text)+'</div>'+
       '<div class="row"><input class="t" id="callName" list="roster" autocomplete="off" placeholder="Who takes this topic?" value="'+esc(cur.used?"":(cur.speaker||""))+'">'+
       '<button class="btn go" id="callBtn">▶ Call speaker</button><button class="btn" id="showBtn">📺 Show on screen</button><button class="btn" id="randBtn">🎲 Random topic</button></div>'+
       '<div class="note">Calling a speaker marks this topic as used'+(NET.mode?' and adds them to the Timer\'s Table Topics list.':' and adds them to the Table Topics list on the Timer page (on this device, or on the Timer\'s device when connected).')+'</div></div>';
  } else {
    h+='<div class="curtopic empty"><div style="margin-bottom:10px">'+(rem.length?'Pick the next topic: tap <b>🎲 Random topic</b> or <b>Pick</b> on a topic below.':'Add your topics below to get started.')+'</div>'+
       (rem.length?'<button class="btn go big1" id="randBtn">🎲 Random topic</button>':'')+'</div>';
  }
  h+='<h2 class="sec">Prepare topics</h2><textarea class="t" id="topicInput" placeholder="One topic per line, e.g.\nIf you could have dinner with anyone, who would it be?\nThe best advice you ever received"></textarea>'+
     '<div class="row" style="margin-top:8px"><button class="btn primary" id="addTopics">+ Add topics</button><span class="saved">'+rem.length+' remaining · '+used.length+' used</span></div>';
  h+='<h2 class="sec">Remaining <span class="cnt">('+rem.length+')</span></h2><ul class="tlist">';
  if(!rem.length) h+='<li class="muted">No topics waiting.</li>';
  rem.forEach(function(x,i){
    h+='<li data-tid="'+x.id+'" class="'+(S.cur.id===x.id?'cur':'')+'"><span class="n">'+(i+1)+'</span><input class="name" data-edit="topic" value="'+esc(x.text)+'">'+
       '<button class="btn sm" data-tact="pick">Pick</button><button class="iconbtn" data-tact="up" title="Move up">↑</button><button class="iconbtn" data-tact="down" title="Move down">↓</button><button class="iconbtn" data-tact="del" title="Remove topic">✕</button></li>';
  });
  h+='</ul><h2 class="sec">Used <span class="cnt">('+used.length+')</span></h2><ul class="tlist used">';
  if(!used.length) h+='<li class="muted">No topics used yet.</li>';
  used.slice().sort(function(a,b){return (a.usedAt||0)-(b.usedAt||0);}).forEach(function(x,i){
    h+='<li data-tid="'+x.id+'"><span class="n">'+(i+1)+'</span><span class="txt">'+esc(x.text)+'</span><input class="name spk" data-edit="tspeaker" list="roster" autocomplete="off" value="'+esc(x.speaker||"")+'" placeholder="Speaker">'+(x.speaker&&asList("ttevals").length?'<select class="t ttevsel" data-ttev="'+esc(x.speaker)+'" aria-label="Evaluator for '+esc(x.speaker)+'"><option value="">Evaluator…</option>'+uniq(asList("ttevals").concat(ttEvaluatorOf(x.speaker)?[ttEvaluatorOf(x.speaker)]:[])).map(function(ev){ return '<option'+(nkey(ev)===nkey(ttEvaluatorOf(x.speaker))?' selected':'')+'>'+esc(ev)+'</option>'; }).join("")+'</select>':'')+
       '<button class="btn sm" data-tact="show">📺</button><button class="btn sm" data-tact="back" title="Move back to Remaining">↺ Put back</button><button class="iconbtn" data-tact="del" title="Remove topic">✕</button></li>';
  });
  h+='</ul></section>';
  return h;
}
function pickTopic(id){ S.cur.id=id; tick(S.cur); commit(); }
function randomTopic(){
  var rem=remaining().filter(function(x){return x.id!==S.cur.id;}); if(!rem.length) rem=remaining();
  if(!rem.length){ alert("No remaining topics."); return; }
  pickTopic(rem[Math.floor(Math.random()*rem.length)].id);
}
function callSpeaker(){
  var cur=topicById(S.cur.id); if(!cur) return;
  var nm=(document.getElementById("callName").value||"").trim();
  if(!nm){ alert("Type who is taking this topic first."); document.getElementById("callName").focus(); return; }
  cur.speaker=nm; cur.used=true; cur.usedAt=now(); tick(cur); remember(nm); autoAssignTT(nm); if(linkRoles().length) selectPerson(nm,"ttm");
  /* queue them on the Timer's Table Topics list */
  var r=cur.rowId && findRow("tt",cur.rowId);
  if(r){ if(rowState(r)==="idle"){ r.name=nm; tick(r); } }
  else { r=newRow("tt",nm); r.topicId=cur.id; S.rows.tt.push(r); cur.rowId=r.id; }
  commit();
  if(document.getElementById("stage").classList.contains("on")) renderStage();
}
function renderStage(){
  if(L.role==="rrm"){ var q=rrById(S.rrcur.id); document.getElementById("stageLbl").textContent="Round Robin"; document.getElementById("stageTxt").textContent=q?q.text:"No question selected"; document.getElementById("stageSpk").textContent=""; return; }
  document.getElementById("stageLbl").textContent="Table Topic";
  var cur=topicById(S.cur.id);
  document.getElementById("stageTxt").textContent=cur?cur.text:"No topic selected";
  document.getElementById("stageSpk").textContent=cur&&cur.used&&cur.speaker?"🎙 "+cur.speaker:"";
}
function openStage(){ renderStage(); var st=document.getElementById("stage"); st.classList.add("on"); try{ if(st.requestFullscreen) st.requestFullscreen().catch(function(){}); }catch(e){} }
function closeStage(){ document.getElementById("stage").classList.remove("on"); try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){} }

