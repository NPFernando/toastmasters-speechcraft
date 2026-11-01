/* ---------- coordinator & toastmaster events ---------- */
(function(){
  var V=document.getElementById("view");
  function agChanged(){ tick(S.agenda); }
  V.addEventListener("click",function(e){
    var t=e.target;
    if(t.closest("#agPrint")){ openAgendaPrint(); return; }
    if(L.role==="tmod"){
      var c=curItem();
      if(t.closest("#runStart")){ if(c.its[0]) runGo(c.its[0].id); return; }
      if(t.closest("#runNext")){ if(c.next) runGo(c.next.id); return; }
      if(t.closest("#runPrev")){ if(c.i>0) runGo(c.its[c.i-1].id); return; }
      if(t.closest("#runEnd")){ runFinish(); return; }
      var li=t.closest("[data-run]"); if(li){ runGo(li.dataset.run); return; }
      return;
    }
    if(L.role!=="coord") return;
    if(t.closest("#pinSet")){ if(S.pin.hash && !isMainCoord() && !L.coordForcePin){ return; }
      var a=document.getElementById("pin1").value.trim(), b=document.getElementById("pin2").value.trim();
      if(!/^\d{4,8}$/.test(a)){ alert("Use 4 to 8 digits for the PIN."); return; }
      if(a!==b){ alert("The two PINs don't match."); return; }
      L.coordForcePin=false; saveL(); setPin(a); return;
    }
    if(t.closest("#pinUnlock")){ tryUnlock(document.getElementById("pinIn").value,false); return; }
    if(t.closest("#recUnlock")){ tryUnlock(document.getElementById("recIn").value,true); return; }
    if(t.closest("#recDone")){ coordRecovery=null; renderAll(); return; }
    if(t.closest("#coordLock")){ L.coordOK=null; saveL(); renderAll(); return; }
    if(t.closest("#pinChange")){ if(!isMainCoord()) return; L.coordForcePin=true; saveL(); renderAll(); var p=document.getElementById("pin1"); if(p) p.focus(); return; }
    if(!coordUnlocked()) return;
    if(t.closest("#memAdd")){
      var inp=document.getElementById("memIn"), names=inp.value.split(/[,;\n]+/).map(function(x){return x.trim();}).filter(Boolean), added=0;
      var mk=(document.getElementById("memKind")||{}).value||"auto";
      names.forEach(function(n){ if(!S.members.list.some(function(m){return m.name.toLowerCase()===n.toLowerCase();})){ S.members.list.push(Object.assign({id:uid(),name:n,kind:mk==="auto"?guessKind(n):mk},S.meta.test?{test:true}:{})); added++; } });
      if(added){ tick(S.members); commit(); } var again=document.getElementById("memIn"); if(again){ again.value=""; again.focus(); } return;
    }
    var kr=t.closest("[data-keyreset]"); if(kr){ var nm=kr.dataset.keyreset; if(!confirm("Reset "+nm+"'s feedback PIN?\n\nThey can set a new one, but feedback encrypted for the old PIN can't be read any more.")) return; var rec=S.keys.find(function(k){return k.id==="k|"+nkey(nm);}); if(rec){ rec.pub=null; rec.wrapped=""; tick(rec); commit(); } return; }
    var md=t.closest("[data-mdel]"); if(md){ S.members.list=S.members.list.filter(function(m){return m.id!==md.dataset.mdel;}); tick(S.members); commit(); return; }
    var ra=t.closest("[data-rpadd]"); if(ra){
      var k=ra.dataset.rpadd, box=document.querySelector('[data-rpadd-in="'+k+'"]'), v=(box.value||"").trim(); if(!v) return;
      var arr=asList(k); v.split(/[,;]+/).map(function(x){return x.trim();}).filter(Boolean).forEach(function(n){ if(arr.indexOf(n)<0) arr.push(n); });
      S.agenda.assign[k]=arr; agChanged(); applyAgenda(); commit(); var b2=document.querySelector('[data-rpadd-in="'+k+'"]'); if(b2) b2.focus(); return;
    }
    var rd=t.closest("[data-rpdel]"); if(rd){ var k2=rd.dataset.rpdel, arr2=asList(k2); arr2.splice(+rd.dataset.i,1); S.agenda.assign[k2]=arr2; agChanged(); applyAgenda(); commit(); return; }
    if(t.closest("[data-itdel]")){ var id=t.closest("[data-iid]").dataset.iid; agRemove(id); agChanged(); commit(); return; }
    var mv=t.closest("[data-agmv]"); if(mv){ var r0=mv.closest("[data-iid]").dataset.iid; if(agMove(r0,+mv.dataset.agmv)){ agChanged(); commit(); var nb=document.querySelector('[data-iid="'+r0+'"] [data-agmv="'+mv.dataset.agmv+'"]'); if(nb&&!nb.disabled) nb.focus(); } return; }
    if(t.closest("[data-agins]")){ var ni=agInsertAfter(t.closest("[data-iid]").dataset.iid); if(ni){ agChanged(); commit(); var ta=document.querySelector('[data-iid="'+ni.id+'"] .agtext'); if(ta) ta.focus(); } return; }
    var sh=t.closest("[data-agshift]"); if(sh){ agShiftAll(+sh.dataset.agshift); agChanged(); commit(); return; }
    if(t.closest("#itAdd")){ var its=itemsSorted(), last=its[its.length-1]; var tm=last?last.time:"17:30"; S.agenda.items.push({id:uid(),time:tm,role:"tmod",text:"",x:"",ord:maxOrd(S.agenda.items)+1}); agChanged(); commit(); return; }
  });
  V.addEventListener("input",function(e){
    var t=e.target; if(L.role!=="coord"||!coordUnlocked()) return;
    if(t.dataset.ag && t.tagName!=="SELECT" && t.type!=="date"){ S.agenda[t.dataset.ag]=t.value; agChanged(); commitQuiet(); return; }
    if(t.dataset.it==="text"){ var it=S.agenda.items.find(function(x){return x.id===t.closest("[data-iid]").dataset.iid;}); if(it){ it.text=t.value; agChanged(); commitQuiet(); } return; }
  });
  V.addEventListener("change",function(e){
    var t=e.target; if(L.role!=="coord"||!coordUnlocked()) return;
    if(t.dataset.ag){ S.agenda[t.dataset.ag]=t.value; agChanged(); commitQuiet(); return; }
    if(t.dataset.assign!=null){ setAssign(t.dataset.assign,t.value); return; }
    if(t.dataset.rp){ var v=t.value.trim(); if(v) S.agenda.assign[t.dataset.rp]=v; else delete S.agenda.assign[t.dataset.rp]; agChanged(); applyAgenda(); commit(); return; }
    if(t.dataset.agdur!=null){ if(agSetDur(t.closest("[data-iid]").dataset.iid,parseInt(t.value,10))){ agChanged(); commit(); } else renderAll(); return; }
    if(t.id==="agStart"){ var f0=itemsSorted()[0], a0=f0&&hm2min(f0.time), b0=hm2min(t.value); if(a0!=null&&b0!=null&&a0!==b0){ agShiftAll(b0-a0); agChanged(); commit(); } return; }
    if(t.dataset.it && t.dataset.it!=="text"){ var it=S.agenda.items.find(function(x){return x.id===t.closest("[data-iid]").dataset.iid;}); if(it){ it[t.dataset.it]=t.value; agChanged(); commit(); } return; }
    if(t.dataset.it==="text"){ laterRender(); }
  });
  V.addEventListener("keydown",function(e){
    if(e.key!=="Enter") return; var t=e.target;
    if(t.id==="pinIn"){ e.preventDefault(); document.getElementById("pinUnlock").click(); }
    else if(t.id==="recIn"){ e.preventDefault(); document.getElementById("recUnlock").click(); }
    else if(t.id==="pin2"){ e.preventDefault(); document.getElementById("pinSet").click(); }
    else if(t.id==="memIn"){ e.preventDefault(); document.getElementById("memAdd").click(); }
    else if(t.dataset&&t.dataset.rpaddIn){ e.preventDefault(); document.querySelector('[data-rpadd="'+t.dataset.rpaddIn+'"]').click(); }
  });
})();

