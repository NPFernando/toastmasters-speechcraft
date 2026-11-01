/* ---------- live tick ---------- */
setInterval(function(){
  var t=now();
  document.querySelectorAll("#live .liveitem").forEach(function(it){
    var sid=it.dataset.sid, r=findRow(sid,it.dataset.id); if(!r||rowState(r)!=="running") return;
    var sec=elapsed(r,t), sg=signal(sid,sec,r);
    it.querySelector('[data-live="clock"]').textContent=fmt(sec);
    it.querySelector('[data-live="next"]').textContent=nextSignalText(sid,sec,r);
    var pill=it.querySelector('[data-live="pill"]'); pill.className="pill "+(sg||"sn"); pill.textContent=sigLabel(sg,r);
    it.classList.remove("sg","sa","sr"); if(sg) it.classList.add(sg);
    it.querySelector('[data-live="banner"]').textContent=bannerText(sid,sg);
    if(lastSig[r.id]!==undefined && sg && sg!==lastSig[r.id]){ flashItem(it); buzz(sg); }
    lastSig[r.id]=sg;
  });
  document.querySelectorAll("#nowStrip .nowitem").forEach(function(it){
    var sid=it.dataset.sid, r=findRow(sid,it.dataset.id); if(!r||rowState(r)!=="running") return;
    var sec=elapsed(r,t), sg=signal(sid,sec,r);
    if(it.dataset.me){ it.querySelector('[data-live="clock"]').textContent=fmt(sec); var ps=it.querySelector('[data-live="pill"]'); ps.textContent=sigLabel(sg,r); it.querySelector('[data-live="mestat"]').textContent=meStatus(sid,sec,r)+" · "+nextSignalText(sid,sec,r);
      it.classList.remove("sg","sa","sr","sn"); it.classList.add(sg||"sn"); if(lastSig["me"+r.id]!==undefined && sg && sg!==lastSig["me"+r.id]) flashItem(it); lastSig["me"+r.id]=sg; return; }
    it.querySelector('[data-live="clock"]').textContent=fmt(sec);
    var pill=it.querySelector('[data-live="pill"]'); pill.className="pill "+(sg||"sn"); pill.textContent=sigLabel(sg,r);
    it.classList.remove("sg","sa","sr"); if(sg) it.classList.add(sg);
  });
  if(L.role==="timer"){
    var sid=L.tab, ps=document.getElementById("panelStats");
    if(ps && S.rows[sid].some(function(r){return rowState(r)==="running";})) ps.textContent=statsText(timeStats([sid],t),"ran");
    document.querySelectorAll("#view tr[data-id]").forEach(function(tr){
      var r=findRow(sid,tr.dataset.id); if(!r||rowState(r)!=="running") return;
      var sec=elapsed(r,t), tb=tr.querySelector('[data-live="time"]'), st=tr.querySelector('[data-live="status"]');
      if(tb){ tb.textContent=fmt(sec); tb.className="timebox "+signal(sid,sec,r); }
      if(st) st.textContent=status(sid,r,t).text;
    });
  }
},250);

