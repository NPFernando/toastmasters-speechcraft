/* ---------- Toastmaster can change the running order on the day ---------- */
function runItems(){
  var base=itemsSorted(), ord=S.run.order;
  if(!Array.isArray(ord)||!ord.length) return base;
  var byId={}; base.forEach(function(it){ byId[it.id]=it; });
  var out=ord.map(function(id){return byId[id];}).filter(Boolean);
  base.forEach(function(it){ if(out.indexOf(it)<0) out.push(it); });
  return out;
}
function isSkipped(id){ return !!(S.run.skip&&S.run.skip[id]); }
function nextLive(its,from){ for(var j=from;j<its.length;j++) if(!isSkipped(its[j].id)) return its[j]; return null; }
function runMoveEnd(id){ var ids=runItems().map(function(x){return x.id;}).filter(function(x){return x!==id;}); ids.push(id); S.run.order=ids; tick(S.run); commit(); }
function runToggleSkip(id){ S.run.skip=S.run.skip||{}; if(S.run.skip[id]) delete S.run.skip[id]; else S.run.skip[id]=true; tick(S.run); commit(); }


/* Prepared speeches share the Timer's queue. Only upcoming prepared rows move. */
function queuedPreparedRows(){
  return S.rows.ps.filter(function(row){
    return rowState(row)==="idle" && row.name.trim() && !String(row.ak||"").startsWith("keynote:");
  });
}
function movePreparedSpeaker(id,destination){
  var queue=queuedPreparedRows(), from=queue.findIndex(function(row){return row.id===id;});
  if(from<=0) return;
  var slots=queue.map(function(row){return S.rows.ps.indexOf(row);});
  var row=queue.splice(from,1)[0];
  queue.splice(destination==="next"?0:from-1,0,row);
  slots.forEach(function(slot,i){ S.rows.ps[slot]=queue[i]; });
  S.rows.ps.forEach(function(entry,i){
    if(entry.ord!==i+1){ entry.ord=i+1; tick(entry); }
  });
  commit();
}
function preparedRunHTML(edit){
  var queue=queuedPreparedRows();
  if(!queue.length) return "";
  return '<section class="card"><h2 class="sec">Upcoming prepared speakers</h2><ol>'+queue.map(function(row,i){
    var name=baseName(row.name), evaluator=evaluatorOf(name), title=speechTitle(name);
    return '<li><b>'+esc(name)+'</b>'+(title?' · '+esc(title):'')+
      (evaluator?' · Evaluator: '+esc(evaluator):'')+
      (edit&&i>0?' <button class="btn sm" data-speech-order="'+esc(row.id)+'" data-destination="up" aria-label="Move up '+esc(name)+'">Move up</button>'+
        ' <button class="btn sm" data-speech-order="'+esc(row.id)+'" data-destination="next" aria-label="Speak next: '+esc(name)+'">Speak next</button>':'')+'</li>';
  }).join("")+'</ol></section>';
}
