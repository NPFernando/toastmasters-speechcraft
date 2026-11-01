/* ---------- merge (for live sync and restore) ---------- */
function mergeColl(a,b,dead){
  var m={};
  a.forEach(function(x){ m[x.id]=x; });
  b.forEach(function(x){ var y=m[x.id]; if(!y||x.u>y.u) m[x.id]=clone(x); });
  var out=Object.keys(m).map(function(k){return m[k];}).filter(function(x){ return !(dead[x.id]>=x.u); });
  out.sort(function(p,q){ return (p.ord-q.ord)||(p.id<q.id?-1:p.id>q.id?1:0); });
  return out;
}
function meetingEmpty(st){ return !COLLS.some(function(p){return getColl(st,p).length;}) && !st.gram.wotd; }
