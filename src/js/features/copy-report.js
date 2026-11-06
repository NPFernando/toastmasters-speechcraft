/* ---------- copy a role's report as text ---------- */
function reportText(role){
  var t=now(), L1=[], hd=GROUP+(S.meta.week?" · "+S.meta.week:"")+(S.meta.date?" · "+S.meta.date:"");
  if(role==="timer"){
    L1.push("⏱ Timer's report — "+hd);
    SESSIONS.forEach(function(s){ var d=S.rows[s.id].filter(function(r){return rowState(r)==="done";}); if(!d.length) return; L1.push(""); L1.push(s.name+":"); d.forEach(function(r,i){ L1.push("• "+displayName(r,i)+" — "+fmt(elapsed(r,t))+" — "+status(s.id,r,t).text+pauseNote(r)); }); });
  } else if(role==="ah"){
    L1.push("🔢 Ah-Counter's report — "+hd);
    S.ahRows.forEach(function(r){ var w=S.fill.words.filter(function(x){return r.c[x];}).map(function(x){return x+" "+r.c[x];}); L1.push("• "+r.name+": "+(w.join(", ")||"none")+" (total "+ahTotal(r)+")"); });
  } else if(role==="gram"){
    L1.push("📝 Grammarian's report — "+hd); if(S.gram.wotd) L1.push("Word of the Day: "+S.gram.wotd+(S.gram.meaning?" — "+S.gram.meaning:""));
    if(S.gram.wotd && S.gram.example) L1.push("Example: "+S.gram.example);
    S.gramRows.forEach(function(r){ L1.push("• "+r.name+": WOTD ×"+(r.w||0)+(r.good.length?"; great: "+r.good.join("; "):"")+(r.slips.length?"; to polish: "+r.slips.join("; "):"")); });
  } else if(role==="ge"){
    L1.push("🧭 General Evaluator's notes — "+hd);
    geObservationLines().forEach(function(line){ L1.push("• "+line); });
    reportsSummary().forEach(function(x){ L1.push("• "+x[0].replace(/^\S+\s/,"")+(x[1]?" ("+x[1]+")":"")+": "+x[2]); });
    if(S.genotes.good) L1.push("What went well: "+S.genotes.good); if(S.genotes.improve) L1.push("What could be better: "+S.genotes.improve);
  }
  return L1.join("\n");
}
function copyText(txt){
  var done=function(){ showToastMsg("📋 Copied — paste it wherever you need it"); };
  try{ navigator.clipboard.writeText(txt).then(done,function(){ fallback(); }); }catch(e){ fallback(); }
  function fallback(){ var ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); done(); }catch(e){ alert(txt); } ta.remove(); }
}
function copyBtn(role){ return '<button class="btn sm" data-copyrep="'+role+'">📋 Copy report text</button>'; }

/* events */
(function(){
  document.getElementById("roles").addEventListener("click",function(e){
    var t=e.target;
    var dr=t.closest("[data-rdrop]"); if(dr){ e.stopPropagation(); dropRole(dr.dataset.rdrop); return; }
    var rt=t.closest("[data-rtab]"); if(rt){ switchRole(rt.dataset.rtab); return; }
    if(t.closest("[data-radd]")){ W.add=true; openWelcome("role"); return; }
    var ra=t.closest("[data-raddall]"); if(ra){ ra.dataset.raddall.split(",").forEach(function(r){ if(L.roles.indexOf(r)<0) L.roles.push(r); }); saveL(); NET.hello(); renderAll(); return; }
  });
  document.getElementById("companion").addEventListener("click",function(e){
    var a=e.target.closest("[data-cmpah]");
    if(a){ var who=a.dataset.who, w=a.dataset.cmpah, rec=S.ahRows.find(function(r){return nkey(r.name)===nkey(who);});
      if(!rec){ rec={id:uid(),name:who,c:{},ord:maxOrd(S.ahRows)+1,u:now()}; S.ahRows.push(rec); }
      rec.c[w]=(rec.c[w]||0)+1; tick(rec); commit(); return; }
    var g=e.target.closest("[data-cmpgram]");
    if(g){ var who2=g.dataset.cmpgram, gr=S.gramRows.find(function(r){return nkey(r.name)===nkey(who2);});
      if(!gr){ gr={id:uid(),name:who2,w:0,good:[],slips:[],ord:maxOrd(S.gramRows)+1,u:now()}; S.gramRows.push(gr); }
      gr.w=(gr.w||0)+1; tick(gr); commit(); return; }
  });
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    var t=e.target;
    var cp=t.closest("[data-copyrep]"); if(cp){ copyText(reportText(cp.dataset.copyrep)); return; }
    var rv=t.closest("[data-rsvp]"); if(rv){ var nm=rv.dataset.rname, cur=rsvpOf(nm); setRsvp(nm,(cur&&cur.status===rv.dataset.rsvp)?"":rv.dataset.rsvp,null); commit(); return; }
    if(L.role==="tmod"){
      var me=t.closest("[data-runend]"); if(me){ e.stopPropagation(); runMoveEnd(me.dataset.runend); return; }
      var sk=t.closest("[data-runskip]"); if(sk){ e.stopPropagation(); runToggleSkip(sk.dataset.runskip); return; }
    }
  },true);
  V.addEventListener("input",function(e){ if(e.target.id==="rsvpNote"){ setRsvp(e.target.dataset.rname,null,e.target.value); commitQuiet(); } });
})();

