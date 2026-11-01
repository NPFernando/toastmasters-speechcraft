// Minimal Nostr relay for local testing only (ephemeral, in-memory).
const {WebSocketServer}=require('ws');
const wss=new WebSocketServer({host:'127.0.0.1',port:+(process.env.RELAY_PORT||7000)});
const subs=new Set(); // {ws,id,filters}
const match=(f,ev)=>{
  if(f.kinds&&!f.kinds.includes(ev.kind)) return false;
  if(f.since&&ev.created_at<f.since) return false;
  for(const k of Object.keys(f)) if(k[0]==='#'){ const tag=k.slice(1); const vals=ev.tags.filter(t=>t[0]===tag).map(t=>t[1]); if(!f[k].some(v=>vals.includes(v))) return false; }
  return true;
};
let n=0;
wss.on('connection',ws=>{
  ws.on('message',raw=>{
    let m; try{ m=JSON.parse(raw); }catch{ return; }
    if(m[0]==='EVENT'){ const ev=m[1]; n++; ws.send(JSON.stringify(['OK',ev.id,true,''])); for(const s of subs) if(s.ws.readyState===1 && s.filters.some(f=>match(f,ev))) s.ws.send(JSON.stringify(['EVENT',s.id,ev])); }
    else if(m[0]==='REQ'){ for(const s of [...subs]) if(s.ws===ws&&s.id===m[1]) subs.delete(s); subs.add({ws,id:m[1],filters:m.slice(2)}); ws.send(JSON.stringify(['EOSE',m[1]])); }
    else if(m[0]==='CLOSE'){ for(const s of [...subs]) if(s.ws===ws&&s.id===m[1]) subs.delete(s); }
  });
  ws.on('close',()=>{ for(const s of [...subs]) if(s.ws===ws) subs.delete(s); });
});
console.log('nostr test relay on ws://127.0.0.1:7000');
if(process.env.RELAY_VERBOSE) setInterval(()=>console.log('events',n,'subs',subs.size),10000);
