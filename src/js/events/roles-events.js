/* ---------- events for stage 2 ---------- */
(function(){
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    var t=e.target;
    if(t.closest("#openVote")){ openVote(); return; }
    if(t.closest("#showWinners")){ maybeShowWinners(true); return; }
    var vs=t.closest("[data-vote-set]"); if(vs){ var s=vs.dataset.voteSet; if(s==="shown"&&!confirm("Reveal the winners on every screen now?")) return; setVoteState(s); if(s==="shown") maybeShowWinners(true); return; }
    if(t.closest("#geReport")){ document.getElementById("openReport").click(); return; }
    var ck=t.closest("[data-checkin]"); if(ck){ var n=ck.dataset.checkin; setPresent(n,!present(n)); if(L.role==="member"&&!myName()) setMyName(n); return; }
    if(L.role==="seval"||L.role==="tteval"){
      var es=t.closest("[data-evsel]"); if(es){ L.evSel=L.evSel||{}; L.evSel[evKind()]=es.dataset.evsel; if(selectPerson(es.dataset.evsel,L.role)) commit(); else { saveL(); renderAll(); } return; }
      if(t.closest("#evAdd")){ var v=(document.getElementById("evAddIn").value||"").trim(); if(v){ L.evSel=L.evSel||{}; L.evSel[evKind()]=v; if(selectPerson(v,L.role)) commit(); else { saveL(); renderAll(); } } return; }
      var rb=t.closest("[data-rate]"); if(rb){ var dr=evDraft(); if(!dr) return; dr.d.rate=dr.d.rate||{}; dr.d.rate[rb.dataset.rate]=(dr.d.rate[rb.dataset.rate]===+rb.dataset.v)?0:+rb.dataset.v; if(dr.d.submitted) dr.d.changed=true; else markWriting(dr.id); saveL(); renderAll(); return; }
      if(t.closest("#assignMe")){ var sa=(L.evSel||{})[evKind()]; if(!myName()){ alert("Type your name in Your name at the top first."); return; } var cur=anyEvaluatorOf(evKind(),sa); if(cur&&nkey(cur)!==nkey(myName())&&!confirm(sa+" is assigned to "+cur+". Assign to you instead?")) return; if(evKind()==="tt") setTTAssign(sa,myName()); else setAssign(sa,myName()); return; }
      if(t.closest("#unassignMe")){ var us=(L.evSel||{})[evKind()]; if(evKind()==="tt") setTTAssign(us,""); else setAssign(us,""); return; }
      if(t.closest("#evSubmit")){ var ds=evDraft(); if(!ds) return; var dd2=ds.d; if(!(dd2.c1||dd2.r||dd2.c2)){ alert("Write at least one Commend or Recommend before submitting."); return; } if(!myName()){ alert("Type your name in Your name at the top first, so the speaker knows who evaluated them."); return; } t.disabled=true; submitDraft(ds.id).then(function(){ renderAll(); }); return; }
    }
    if(L.role==="rrm"){
      if(t.closest("#rrStart")){ rrStart((document.getElementById("rrQ")||{}).value); return; }
      if(t.closest("#rrRandom")){ rrRandom(); return; }
      if(t.closest("#rrEdit")){ var cq=rrById(S.rrcur.id); if(!cq) return; var nt=prompt("Round Robin question (the same for everyone):",cq.text); if(nt&&nt.trim()){ cq.text=nt.trim(); tick(cq); commit(); } return; }
      if(t.closest("#rrReset")){ if(confirm("Finish this Round Robin? The question is cleared so you can start a new one. Times already recorded are kept.")){ S.rrcur.id=null; S.rrcur.last=""; tick(S.rrcur); commit(); } return; }
      var rf=t.closest("[data-rrforget]"); if(rf){ rrForget(rf.dataset.rrforget); return; }
      if(t.closest("#rrShow")){ L.stageMode="rr"; openStage(); return; }
      var rc=t.closest("[data-rrcall]"); if(rc){ rrCall(rc.dataset.rrcall); return; }
      if(t.closest("#rrGuestAdd")){ var gi=document.getElementById("rrGuest"); rrCall((gi.value||"").trim()); return; }
    }
    if(L.role==="speaker"){
      var me2=t.closest("[data-spme]"); if(me2){ setMyName(me2.dataset.spme); var s0=mySpeech(); applySpeech(s0); commit(); return; }
    }
    if(L.role==="member"||L.role==="speaker"){
      if(L.role==="speaker") L.cardName=myName();
      if(t.closest("#guestAdd")){ var gn=(document.getElementById("guestIn").value||"").trim(); if(gn){ setPresent(gn,true); if(!myName()) setMyName(gn); } return; }
      if(t.closest("#noteSend")){
        var to=document.getElementById("noteTo").value, tx=(document.getElementById("noteText").value||"").trim();
        if(!to||!tx){ alert("Choose a speaker and write a note."); return; }
        sendNote(to,tx.slice(0,500)).then(function(sent){ var m=document.getElementById("noteMsg"), ta=document.getElementById("noteText"); if(ta) ta.value=""; if(m) m.textContent=sent?"Sent ✓ (anonymous, encrypted)":"Saved ✓ — it will be delivered, encrypted, when "+to+" sets up their feedback PIN"; });
        return;
      }
      if(t.closest("#cardOpen")){ if(L.cardName) buildCard(L.cardName); return; }
      if(t.closest("#fbCreate")){ var a=document.getElementById("fbPin1").value.trim(), b=document.getElementById("fbPin2").value.trim(); if(!/^\d{4,8}$/.test(a)){ alert("Use 4 to 8 digits."); return; } if(a!==b){ alert("The two PINs don't match."); return; } t.disabled=true; createSpeakerKey(L.cardName,a).then(function(){ if(!myName()) setMyName(L.cardName); renderAll(); },function(err){ alert(err.message||err); renderAll(); }); return; }
      if(t.closest("#fbUnlock")){ t.disabled=true; unlockSpeaker(L.cardName,document.getElementById("fbPin").value.trim()).then(function(){ renderAll(); buildCard(L.cardName); },function(err){ alert(err.message||err); renderAll(); }); return; }
      if(t.closest("#fbLock")){ forgetPriv(L.cardName); renderAll(); return; }
    }
  });
  V.addEventListener("input",function(e){
    var t=e.target;
    if(t.dataset.evf){ var dr=evDraft(); if(!dr) return; dr.d[t.dataset.evf]=t.value; if(dr.d.submitted) dr.d.changed=true; else markWriting(dr.id); saveL(); refreshEvState(); refreshEvProg(); return; }
    if(t.dataset.ge){ S.genotes[t.dataset.ge]=t.value; tick(S.genotes); commitQuiet(); return; }
    if(L.role==="speaker"&&(t.dataset.sp==="title"||t.dataset.sp==="obj")){ var s=mySpeech(); if(!s) return; s[t.dataset.sp]=t.value; tick(s); commitQuiet(); return; }
  });
  V.addEventListener("change",function(e){
    if(L.role==="speaker"&&(e.target.dataset.sp==="title"||e.target.dataset.sp==="obj")){ laterRender(); return; }
    if(L.role==="speaker"&&e.target.dataset.sp&&e.target.dataset.sp!=="title"&&e.target.dataset.sp!=="obj"){ var s=mySpeech(); if(!s) return; s[e.target.dataset.sp]=e.target.value; tick(s); applySpeech(s); commit(); return; }
    if(e.target.id==="cardName"){ L.cardName=e.target.value; saveL(); renderAll(); return; } if(e.target.dataset.evf||e.target.dataset.ge) laterRender(); });
  document.getElementById("voteBox").addEventListener("click",function(e){
    var c=e.target.closest("[data-vcat]");
    if(c){ if(S.vote.state!=="open"){ renderVoteModal(); return; } var cat=c.dataset.vcat, v=upsert(["votes"],"v|"+cat+"|"+devId(),{cat:cat,choice:""}); v.choice=(nkey(v.choice)===nkey(c.dataset.vname))?"":c.dataset.vname; tick(v); commit(); renderVoteModal(); return; }
    if(e.target.closest("#voteClose")) document.getElementById("voteModal").classList.remove("on");
  });
  document.getElementById("voteBar").addEventListener("click",openVote);
  document.getElementById("winBox").addEventListener("click",function(e){ if(e.target.closest("#winClose")) document.getElementById("winModal").classList.remove("on"); });
  ["voteModal","winModal"].forEach(function(id){ document.getElementById(id).addEventListener("click",function(e){ if(e.target.id===id) e.target.classList.remove("on"); }); });
})();

/* vibrate the Timer's phone when the signal changes (silent: no sound) */
var BUZZ={sg:[200],sa:[200,120,200],sr:[600,150,600]};
function buzz(sg){ try{ if(myRoles().indexOf("timer")<0||!navigator.vibrate||!BUZZ[sg]) return; navigator.vibrate(BUZZ[sg]); window.__lastBuzz=sg; }catch(e){} }
