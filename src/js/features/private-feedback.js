/* ---------- private feedback: evaluations and notes only the speaker can read ----------
   Each speaker has an ECDH (P-256) key pair. The public key is shared with the meeting; the private
   key is shared only in a form locked with the speaker's own feedback PIN (PBKDF2 → AES-GCM), so the
   speaker can unlock it on any device. Evaluations and notes are encrypted to the speaker's public key
   on the writer's device before they are synced, so every other device only holds unreadable data. */
var PBKDF_ITER=250000, privCache={};
function b64(buf){ var s="",b=new Uint8Array(buf); for(var i=0;i<b.length;i++) s+=String.fromCharCode(b[i]); return btoa(s); }
function unb64(s){ var b=atob(s),u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
function cryptoOK(){ return !!(window.crypto&&crypto.subtle); }
function keyRec(name){ return S.keys.find(function(k){ return k.id==="k|"+nkey(name) && k.pub && k.pub.x; }); }
function hasPriv(name){ var r=keyRec(name), p=(L.privKeys||{})[nkey(name)]; return !!(r&&p&&p.x===r.pub.x); }
function pinKey(pin,salt){
  return crypto.subtle.importKey("raw",new TextEncoder().encode(String(pin)),"PBKDF2",false,["deriveKey"]).then(function(base){
    return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:PBKDF_ITER,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
  });
}
function rememberPriv(name,jwk,x){ L.privKeys=L.privKeys||{}; L.privKeys[nkey(name)]={jwk:jwk,x:x}; saveL(); delete privCache[nkey(name)]; }
function forgetPriv(name){ if(L.privKeys) delete L.privKeys[nkey(name)]; saveL(); delete privCache[nkey(name)]; }
function createSpeakerKey(name,pin){
  if(!cryptoOK()) return Promise.reject(new Error("This browser can't encrypt here. Open the page from the website link."));
  var salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12)), pubJwk, privJwk;
  return crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveKey"])
    .then(function(k){ return Promise.all([crypto.subtle.exportKey("jwk",k.publicKey),crypto.subtle.exportKey("jwk",k.privateKey)]); })
    .then(function(j){ pubJwk={kty:j[0].kty,crv:j[0].crv,x:j[0].x,y:j[0].y}; privJwk=j[1]; return pinKey(pin,salt); })
    .then(function(ak){ return crypto.subtle.encrypt({name:"AES-GCM",iv:iv},ak,new TextEncoder().encode(JSON.stringify(privJwk))); })
    .then(function(ct){
      var id="k|"+nkey(name), ex=S.keys.find(function(k){return k.id===id;});
      var rec={id:id,name:name,pub:pubJwk,salt:b64(salt),iv:b64(iv),wrapped:b64(ct),ord:ex?ex.ord:S.keys.length+1,u:Math.max(now(),ex?(ex.u||0)+1:0)};
      if(ex) Object.assign(ex,rec); else S.keys.push(rec);
      rememberPriv(name,privJwk,pubJwk.x); commit(); flushPending(); return true;
    });
}
function unlockSpeaker(name,pin){
  var r=keyRec(name); if(!r) return Promise.reject(new Error("No feedback PIN set for "+name+"."));
  return pinKey(pin,unb64(r.salt))
    .then(function(ak){ return crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(r.iv)},ak,unb64(r.wrapped)); })
    .then(function(pt){ rememberPriv(name,JSON.parse(new TextDecoder().decode(pt)),r.pub.x); return true; },
          function(){ throw new Error("Wrong PIN."); });
}
function privKey(name){
  var k=nkey(name); if(privCache[k]) return privCache[k];
  var p=(L.privKeys||{})[k]; if(!p) return Promise.reject(new Error("locked"));
  privCache[k]=crypto.subtle.importKey("jwk",p.jwk,{name:"ECDH",namedCurve:"P-256"},false,["deriveKey"]);
  return privCache[k];
}
function encryptFor(name,obj){
  var r=keyRec(name); if(!r) return Promise.reject(new Error("no key"));
  var iv=crypto.getRandomValues(new Uint8Array(12)), eph, epk;
  return Promise.all([crypto.subtle.importKey("jwk",r.pub,{name:"ECDH",namedCurve:"P-256"},false,[]),crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveKey"])])
    .then(function(a){ eph=a[1]; return Promise.all([crypto.subtle.deriveKey({name:"ECDH",public:a[0]},eph.privateKey,{name:"AES-GCM",length:256},false,["encrypt"]),crypto.subtle.exportKey("jwk",eph.publicKey)]); })
    .then(function(a){ epk={kty:a[1].kty,crv:a[1].crv,x:a[1].x,y:a[1].y}; return crypto.subtle.encrypt({name:"AES-GCM",iv:iv},a[0],new TextEncoder().encode(JSON.stringify(obj))); })
    .then(function(ct){ return {epk:epk,iv:b64(iv),ct:b64(ct),kx:r.pub.x}; });
}
function decryptFor(name,enc){
  return Promise.all([privKey(name),crypto.subtle.importKey("jwk",enc.epk,{name:"ECDH",namedCurve:"P-256"},false,[])])
    .then(function(a){ return crypto.subtle.deriveKey({name:"ECDH",public:a[1]},a[0],{name:"AES-GCM",length:256},false,["decrypt"]); })
    .then(function(k){ return crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(enc.iv)},k,unb64(enc.ct)); })
    .then(function(pt){ return JSON.parse(new TextDecoder().decode(pt)); });
}

/* evaluator drafts live only on the evaluator's device until they can be sent encrypted */
function evDraft(){ var kind=evKind(), sel=(L.evSel||{})[kind]; if(!sel) return null; var id=evId(kind,sel,myName()); L.evDrafts=L.evDrafts||{}; if(!L.evDrafts[id]) L.evDrafts[id]={kind:kind,speaker:sel,c1:"",r:"",c2:"",rate:{}}; return {id:id,d:L.evDrafts[id]}; }
var markTimers={};
/* while an evaluator is writing, only a "writing" marker is shared: never the content */
function markWriting(id){
  clearTimeout(markTimers[id]);
  markTimers[id]=setTimeout(function(){
    var d=(L.evDrafts||{})[id]; if(!d||d.submitted) return;
    var rec=upsert(["evals"],id,{kind:d.kind,speaker:d.speaker});
    if(rec.state!=="writing"){ rec.by=myName()||"Evaluator"; rec.kind=d.kind; rec.speaker=d.speaker; rec.state="writing"; rec.done=false; rec.enc=null; tick(rec); commitQuiet(); }
  },1200);
}
/* Submit: encrypt the final version for the speaker and share it */
function submitDraft(id,resend){
  var d=(L.evDrafts||{})[id]; if(!d) return Promise.resolve(false);
  d.by=myName()||d.by||"Evaluator";
  if(!resend){ d.submitted=true; d.changed=false; d.submittedAt=now(); }
  saveL(); clearTimeout(markTimers[id]);
  var rec=upsert(["evals"],id,{kind:d.kind,speaker:d.speaker});
  rec.by=d.by; rec.kind=d.kind; rec.speaker=d.speaker; rec.done=true; rec.at=d.submittedAt; delete rec.c1; delete rec.r; delete rec.c2; delete rec.rate;
  if(!keyRec(d.speaker)){ rec.state="queued"; rec.enc=null; rec.pending=true; tick(rec); commit(); return Promise.resolve(false); }
  return encryptFor(d.speaker,{c1:d.c1,r:d.r,c2:d.c2,rate:d.rate||{},kind:d.kind,by:d.by,at:d.submittedAt}).then(function(enc){
    var r2=S.evals.find(function(x){return x.id===id;})||rec;
    r2.enc=enc; r2.state="submitted"; r2.pending=false; r2.done=true; r2.at=d.submittedAt; tick(r2); d.sentKx=enc.kx; saveL(); commit(); return true;
  }).catch(function(){ return false; });
}
function sendNote(to,text){
  if(!keyRec(to)){ L.noteQueue=L.noteQueue||[]; L.noteQueue.push({to:to,text:text}); saveL(); return Promise.resolve(false); }
  return encryptFor(to,{text:text}).then(function(enc){ S.notes.push({id:uid(),to:to,enc:enc,ord:maxOrd(S.notes)+1,u:now()}); commit(); return true; });
}
var flushing=false;
function flushPending(){
  if(flushing||!cryptoOK()) return; flushing=true;
  var jobs=[];
  Object.keys(L.evDrafts||{}).forEach(function(id){ var d=L.evDrafts[id], r=keyRec(d.speaker); if(d.submitted && r && d.sentKx!==r.pub.x) jobs.push(submitDraft(id,true)); });
  var q=(L.noteQueue||[]).slice(), keep=[];
  q.forEach(function(n){ if(keyRec(n.to)) jobs.push(sendNote(n.to,n.text)); else keep.push(n); });
  if(q.length!==keep.length){ L.noteQueue=keep; saveL(); }
  Promise.all(jobs).then(function(){ flushing=false; },function(){ flushing=false; });
}
setInterval(flushPending,5000);
function evStateText(speaker,d){
  d=d||{};
  if(!d.submitted) return '✍ <b>Draft</b> — saved on this device only. Nobody sees it until you tap <b>Submit</b>; then only <b>'+esc(speaker)+'</b> can read it.';
  if(d.changed) return '✏️ You changed this after submitting. Tap <b>Update submission</b> to send the new version.';
  if(!keyRec(speaker)) return '⏳ <b>Submitted</b> — waiting for '+esc(speaker)+' to set up their feedback PIN. It will be delivered automatically, encrypted.';
  return '✅ <b>Submitted</b> '+(d.submittedAt?'at '+new Date(d.submittedAt).toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"})+' ':'')+'— only '+esc(speaker)+' can read it (encrypted).';
}
function evSubmitBtn(d){
  d=d||{};
  if(!d.submitted) return '<button class="btn go big1" id="evSubmit">✅ Submit evaluation</button>';
  if(d.changed) return '<button class="btn go" id="evSubmit">Update submission</button>';
  return '';
}
function refreshEvState(){
  var dr=evDraft(); if(!dr) return;
  var st=document.getElementById("evState"), sb=document.getElementById("evSubmitWrap");
  if(st) st.innerHTML=evStateText(dr.d.speaker,dr.d); if(sb) sb.innerHTML=evSubmitBtn(dr.d);
}
function evalStatusLabel(e){ return e.state==="writing"?"✍ writing":e.state==="queued"?"⏳ submitted, waiting for the speaker's PIN":"✅ submitted"; }
function submittedEvals(name){ return S.evals.filter(function(e){ return nkey(e.speaker)===nkey(name) && e.enc && e.done && (e.state==="submitted"||!e.state); }); }

