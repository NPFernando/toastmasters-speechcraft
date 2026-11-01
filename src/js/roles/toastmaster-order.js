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

