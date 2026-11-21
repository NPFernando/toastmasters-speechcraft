/* Live agenda entries keep their identities when the running order changes. */
function plannedRunItems(){
  var base=itemsSorted(), block=base.find(function(it){return it.x==="speakers";});
  var scheduled=new Set(asList("speakers").map(nkey)), start=hm2min(block?.time);
  var speeches=S.rows.ps.filter(function(row){
    return String(row.name||"").trim()&&!String(row.ak||"").startsWith("keynote:")&&(block||scheduled.has(nkey(baseName(row.name))));
  }).map(function(row){
    var name=baseName(row.name), time=start==null?"":min2hm(start);
    if(start!=null) start+=Math.ceil(limOf("ps",row).r/60)+1;
    return {id:preparedItemId(row),rowId:row.id,role:"speakers",name:name,time:time,text:speechTitle(name)||"Prepared speech",x:""};
  });
  base.splice(block?base.indexOf(block)+1:base.length,0,...speeches);
  return base;
}
function preparedItemId(row){ return "prepared|"+row.id; }
function runItems(){
  var base=plannedRunItems(), byId=new Map(base.map(function(it){return [it.id,it];}));
  var order=Array.isArray(S.run.order)?S.run.order:[];
  var out=Array.from(new Set(order)).map(function(id){return byId.get(id);}).filter(Boolean);
  var placed=new Set(out.map(function(it){return it.id;}));
  base.forEach(function(it,i){
    if(placed.has(it.id)) return;
    var previous=i>0?out.findIndex(function(entry){return entry.id===base[i-1].id;}):-1;
    out.splice(previous+1,0,it);
  });
  return out;
}
function isSkipped(id){ return !!(S.run.skip&&S.run.skip[id]); }
function nextLive(its,from){ for(var j=from;j<its.length;j++) if(!isSkipped(its[j].id)) return its[j]; return null; }
function previousLive(its,from){ for(var j=from;j>=0;j--) if(!isSkipped(its[j].id)) return its[j]; return null; }
function canEditLiveAgenda(){ var roles=myRoles(); return roles.includes("tmod")||(roles.includes("coord")&&coordUnlocked()); }
function liveEditableItems(items){
  if(!canEditLiveAgenda()||(!S.run.cur&&S.run.endAt)) return [];
  var boundary=items.reduce(function(last,it,i){
    return it.id===S.run.cur||S.run.started[it.id]!=null?i:last;
  },-1);
  return items.slice(boundary+1).filter(function(it){
    var row=it.rowId?findRow("ps",it.rowId):it.role==="keynote"?presentationRow(it.id):null;
    return !row||rowState(row)==="idle";
  });
}
function reorderLiveItem(id,targetId,after){
  var items=runItems(), editable=liveEditableItems(items);
  if(id===targetId||!editable.some(function(it){return it.id===id;})||!editable.some(function(it){return it.id===targetId;})) return false;
  var order=items.map(function(it){return it.id;}).filter(function(value){return value!==id;});
  order.splice(order.indexOf(targetId)+(after?1:0),0,id);
  if(order.every(function(value,i){return value===items[i].id;})) return false;
  S.run.order=order;
  S.run.orderU=Math.max(now(),(S.run.orderU||S.run.u||0)+1);
  commit(); return true;
}
function runMoveEnd(id){
  var last=liveEditableItems(runItems()).at(-1);
  if(last) reorderLiveItem(id,last.id,true);
}
function runToggleSkip(id){
  if(!liveEditableItems(runItems()).some(function(it){return it.id===id;})) return;
  S.run.skip=S.run.skip||{};
  if(S.run.skip[id]) delete S.run.skip[id]; else S.run.skip[id]=true;
  S.run.by=runBy(); tick(S.run); commit();
}
function queuedPreparedRows(){
  return orderPreparedTimerRows(S.rows.ps).filter(function(row){
    return rowState(row)==="idle"&&String(row.name||"").trim()&&!String(row.ak||"").startsWith("keynote:")&&!isSkipped(preparedItemId(row));
  });
}
function preparedTimerSkipped(row){
  var itemId=row.presentationItemId;
  if(!itemId&&String(row.ak||"").startsWith("keynote:")){
    itemId=keynoteItems().find(function(it){return presentationRow(it.id)===row;})?.id;
  }
  return isSkipped(itemId||preparedItemId(row));
}
function orderPreparedTimerRows(rows){
  var rank=new Map();
  runItems().forEach(function(it,i){
    var id=it.rowId||(it.role==="keynote"?presentationRow(it.id)?.id:null);
    if(id) rank.set(id,i);
  });
  var upcoming=rows.filter(function(row){return rowState(row)==="idle"&&rank.has(row.id);});
  upcoming.sort(function(a,b){return rank.get(a.id)-rank.get(b.id);});
  var index=0;
  return rows.map(function(row){return rowState(row)==="idle"&&rank.has(row.id)?upcoming[index++]:row;});
}
function movePreparedSpeaker(id,destination){
  var editable=new Set(liveEditableItems(runItems()).map(function(it){return it.id;}));
  var queue=queuedPreparedRows().filter(function(row){return editable.has(preparedItemId(row));});
  var from=queue.findIndex(function(row){return row.id===id;});
  if(from>0) reorderLiveItem(preparedItemId(queue[from]),preparedItemId(queue[destination==="next"?0:from-1]),false);
}
function preparedRunHTML(edit){
  var queue=queuedPreparedRows(), movable=new Set(liveEditableItems(runItems()).map(function(it){return it.id;})), before=false;
  if(!queue.length) return "";
  return '<section class="card"><h2 class="sec">Upcoming prepared speakers</h2><ol>'+queue.map(function(row){
    var name=baseName(row.name), evaluator=evaluatorOf(name), title=speechTitle(name);
    var canMove=movable.has(preparedItemId(row)), buttons=edit&&before&&canMove;
    if(canMove) before=true;
    return '<li><b>'+esc(name)+'</b>'+(title?' · '+esc(title):'')+
      (evaluator?' · Evaluator: '+esc(evaluator):'')+
      (buttons?' <button class="btn sm" data-speech-order="'+esc(row.id)+'" data-destination="up" aria-label="Move up '+esc(name)+'">Move up</button>'+
        ' <button class="btn sm" data-speech-order="'+esc(row.id)+'" data-destination="next" aria-label="Speak next: '+esc(name)+'">Speak next</button>':'')+'</li>';
  }).join("")+'</ol></section>';
}
