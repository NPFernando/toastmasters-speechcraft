/* ---------- helpers ---------- */
function now(){ return Date.now(); }
function uid(){ return now().toString(36)+Math.random().toString(36).slice(2,7); }
function tick(o){ o.u=Math.max(now(),(o.u||0)+1); return o; }
function todayISO(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function fmt(sec){ sec=Math.max(0,Math.round(sec)); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); }
function fmtLong(sec){ sec=Math.max(0,Math.round(sec)); if(sec<3600) return fmt(sec); var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60; return h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"); }
function clock(ms){ return new Date(ms).toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"}); }
function parseTime(str){
  str=String(str||"").trim(); if(!str) return null;
  var m=str.match(/^(\d{1,3})\s*[:.]\s*(\d{1,2})$/);
  if(m){ var s=+m[2]; if(s>59) return NaN; return (+m[1])*60+s; }
  if(/^\d+$/.test(str)) return +str*60;
  return NaN;
}
function stable(o){
  if(Array.isArray(o)) return "["+o.map(stable).join(",")+"]";
  if(o && typeof o==="object") return "{"+Object.keys(o).sort().map(function(k){return JSON.stringify(k)+":"+stable(o[k]);}).join(",")+"}";
  return JSON.stringify(o===undefined?null:o);
}
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function getColl(st,p){ return p.length===2 ? st[p[0]][p[1]] : st[p[0]]; }
function setColl(st,p,v){ if(p.length===2) st[p[0]][p[1]]=v; else st[p[0]]=v; }
function maxOrd(arr){ return arr.reduce(function(m,x){return Math.max(m,x.ord||0);},0); }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); return true; }catch(e){ return false; } }

