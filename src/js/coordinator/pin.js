/* ---------- coordinator PIN ---------- */
var coordRecovery=null;
function sha(s){
  if(!(window.crypto&&crypto.subtle)) return Promise.reject(new Error("This browser can't check PINs here. Open the page from the website link."));
  return crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)).then(function(b){ return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0");}).join(""); });
}
function coordUnlocked(){ return !!(S.pin.hash && L.coordOK===S.pin.hash) || !!myCo(); }
function setPin(pin){
  var salt=uid(), rec=(makeCode()+makeCode()).slice(0,8);
  return Promise.all([sha("pin|"+salt+"|"+pin),sha("rec|"+salt+"|"+rec)]).then(function(h){
    S.pin={hash:h[0],rhash:h[1],salt:salt,u:Math.max(now(),(S.pin.u||0)+1)};
    L.coordOK=h[0]; saveL(); coordRecovery=rec; commit();
  }).catch(function(e){ alert(e.message||e); });
}
function tryUnlock(val,isRec){
  val=isRec?cleanCode(val):String(val||"").trim();
  return sha((isRec?"rec|":"pin|")+S.pin.salt+"|"+val).then(function(h){
    if(h===(isRec?S.pin.rhash:S.pin.hash)){ L.coordOK=S.pin.hash; saveL(); if(isRec) L.coordForcePin=true; renderAll(); }
    else { alert(isRec?"That recovery code doesn't match.":"Wrong PIN."); }
  }).catch(function(e){ alert(e.message||e); });
}

