/* ---------- bell sound: rings at the Round Robin bell on the speaker's own phone (and, if switched on, on the Timer's device) ---------- */
var AUD=null;
function audioCtx(){ try{ if(!AUD){ var C=window.AudioContext||window.webkitAudioContext; if(!C) return null; AUD=new C(); } return AUD; }catch(e){ return null; } }
/* browsers only allow sound after the person has tapped the page: unlock on the first tap */
function unlockAudio(){ var a=audioCtx(); if(a&&a.state==="suspended") a.resume().catch(function(){}); }
["pointerdown","keydown","touchend"].forEach(function(ev){ document.addEventListener(ev,unlockAudio,{passive:true}); });
function soundReady(){ var a=AUD; return !!(a&&a.state==="running"); }
function ringBell(){
  var a=audioCtx(); if(!a) return false;
  try{
    if(a.state==="suspended") a.resume().catch(function(){});
    var t=a.currentTime+0.02, out=a.createGain(); out.gain.value=0.5; out.connect(a.destination);
    /* a struck bell: a few inharmonic partials with a fast attack and a long fade */
    [[880,1,1.6],[1760,0.45,1.1],[2640,0.25,0.8],[1320,0.2,1.3]].forEach(function(p){
      var o=a.createOscillator(), g=a.createGain(); o.type="sine"; o.frequency.value=p[0];
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(p[1],t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+p[2]);
      o.connect(g); g.connect(out); o.start(t); o.stop(t+p[2]+0.05);
    });
    window.__bellRang=(window.__bellRang||0)+1; return true;
  }catch(e){ return false; }
}
function meBellOn(){ return L.bellSound!==false; }      /* the person speaking: on unless they switch it off */
function timerBellOn(){ return !!L.timerBell; }         /* the Timer's own device: off unless switched on */
function meBellBtn(){ return '<button class="btn sm" data-mebell aria-pressed="'+meBellOn()+'" title="Bell sound on this phone when the Round Robin bell rings">'+(meBellOn()?'🔔 Sound on':'🔕 Sound off')+'</button>'; }
(function(){
  document.getElementById("nowStrip").addEventListener("click",function(e){ var b=e.target.closest("[data-mebell]"); if(!b) return; L.bellSound=!meBellOn(); saveL(); unlockAudio(); b.outerHTML=meBellBtn(); if(meBellOn()) ringBell(); });
  document.getElementById("view").addEventListener("change",function(e){ if(e.target.id==="timerBell"){ L.timerBell=e.target.checked; saveL(); unlockAudio(); if(L.timerBell) ringBell(); } });
})();
