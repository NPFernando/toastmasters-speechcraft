/* ---------- how the agenda ran: planned vs actual length of each item ---------- */
function runSummary(){
  var st=(S.run&&S.run.started)||{}, plan=itemsSorted(), done=plan.filter(function(it){return st[it.id]!=null;}).sort(function(a,b){return st[a.id]-st[b.id];});
  if(!done.length||(done.length<2&&!S.run.endAt)) return null;
  var rows=done.map(function(it,i){
    var start=st[it.id], nx=done[i+1], end=nx?st[nx.id]:(S.run.cur===it.id?now():(S.run.cur?null:S.run.endAt||null));
    var actual=end!=null?Math.round((end-start)/60000):null, pd=agDur(plan,plan.indexOf(it));
    return {it:it,start:start,actual:actual,planned:pd,diff:actual!=null&&pd!=null?actual-pd:null,live:!nx&&S.run.cur===it.id};
  });
  var first=hm2min(plan[0]&&plan[0].time), d0=new Date(rows[0].start), startLate=first==null?null:Math.round(d0.getHours()*60+d0.getMinutes()+d0.getSeconds()/60-first);
  var lastPlan=hm2min(plan[plan.length-1]&&plan[plan.length-1].time), endAt=S.run.cur?null:S.run.endAt, endLate=null;
  if(endAt&&lastPlan!=null){ var de=new Date(endAt); endLate=Math.round(de.getHours()*60+de.getMinutes()-lastPlan); }
  var skipped=plan.filter(function(it){ return st[it.id]==null&&isSkipped(it.id); });
  var over=rows.filter(function(r){return r.diff!=null&&r.diff>=2;}).sort(function(a,b){return b.diff-a.diff;});
  return {rows:rows,startLate:startLate,endAt:endAt,endLate:endLate,skipped:skipped,over:over};
}
function hhmm(ms){ return new Date(ms).toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"}); }
function sgn(n){ return n>0?"+"+n:n<0?"−"+(-n):"0"; }
function lateTxt(n){ return n==null||Math.abs(n)>120?"not at the agenda times":Math.abs(n)<2?"on time":n>0?n+" min late":(-n)+" min early"; }
function itemLabel2(it){ var w=whoFor(it.role); return arole(it.role).n+(w?" · "+w:""); }
function runSummaryHTML(){
  var R=runSummary(); if(!R) return "";
  var h='<section class="card ovsum"><div class="row" style="justify-content:space-between"><h2 class="sec" style="margin:0">⏱ How the agenda ran</h2><button class="btn sm" id="ovCopy">📋 Copy summary</button></div>'+
    '<div class="saved" style="margin:4px 0 8px">Started '+hhmm(R.rows[0].start)+(R.startLate!=null?' ('+lateTxt(R.startLate)+')':'')+(R.endAt?' · finished '+hhmm(R.endAt)+(R.endLate!=null&&Math.abs(R.endLate)<=120?' ('+(R.endLate>0?R.endLate+' min after':R.endLate<0?(-R.endLate)+' min before':'at')+' the last planned item)':''):' · still running')+'</div>';
  if(R.over.length) h+='<div class="lc-over" style="display:block">Biggest overruns: '+R.over.slice(0,3).map(function(r){ return '<b>'+esc(arole(r.it.role).n)+'</b> '+sgn(r.diff)+' min'; }).join(" · ")+'. Consider giving these more time next week.</div>';
  h+='<div class="tblwrap"><table class="sumtable ovt"><thead><tr><th>Started</th><th>Item</th><th>Planned</th><th>Actual</th><th>Over / under</th></tr></thead><tbody>';
  R.rows.forEach(function(r){ var cls=r.diff==null?"":r.diff>=2?"st-o":r.diff<=-2?"st-q":"";
    h+='<tr><td>'+hhmm(r.start)+'</td><td>'+esc(itemLabel2(r.it))+'</td><td>'+(r.planned!=null?r.planned+' min':'—')+'</td><td>'+(r.actual!=null?r.actual+' min'+(r.live?' (so far)':''):'—')+'</td><td class="'+cls+'"><b>'+(r.diff!=null?sgn(r.diff)+' min':'—')+'</b></td></tr>'; });
  h+='</tbody></table></div>';
  if(R.skipped.length) h+='<div class="saved" style="margin-top:6px">Skipped: '+R.skipped.map(function(it){return esc(arole(it.role).n);}).join(", ")+'</div>';
  return h+'</section>';
}
function runSummaryText(){
  var R=runSummary(); if(!R) return "";
  var out=["How the agenda ran — "+(fmtDate(S.meta.date)||""),"Started "+hhmm(R.rows[0].start)+(R.startLate!=null?" ("+lateTxt(R.startLate)+")":"")+(R.endAt?", finished "+hhmm(R.endAt):"")];
  R.rows.forEach(function(r){ out.push(hhmm(r.start)+"  "+itemLabel2(r.it)+": planned "+(r.planned!=null?r.planned:"—")+" min, actual "+(r.actual!=null?r.actual:"—")+" min"+(r.diff!=null?" ("+sgn(r.diff)+")":"")); });
  if(R.skipped.length) out.push("Skipped: "+R.skipped.map(function(it){return arole(it.role).n;}).join(", "));
  return out.join("\n");
}
(function(){ document.getElementById("view").addEventListener("click",function(e){ if(e.target.closest("#ovCopy")) copyText(runSummaryText()); }); })();
function runFinish(){ S.run.by=runBy(); S.run.cur=null; S.run.endAt=now(); tick(S.run); commit(); }
function runBy(){ return L.me||roleName(L.role)||""; }
/* who may move the live agenda: the Toastmaster, plus the President and an unlocked organiser as back-up */
function canRun(){ var rs=(L.roles&&L.roles.length?L.roles:[L.role]); return rs.indexOf("tmod")>=0||rs.indexOf("president")>=0||(rs.indexOf("coord")>=0&&coordUnlocked()); }
function overMin(){ var c=curItem(); if(!c.cur||!c.next) return 0; var m=hm2min(rt(c.next)); return m==null?0:Math.floor(minutesNow()-m); }
/* the same timing controls on the Toastmaster's run-sheet and on the Now tab (Toastmaster, President, organiser) */
function adjCtlHTML(){
  var c=curItem(); if(!c.cur) return "";
  var ov=overMin(), adj=runAdjTotal(), h='';
  if(ov>=2&&ov<180) h+='<div class="lc-over">⏰ <b>'+esc(arole(c.cur.role).n)+'</b> is '+ov+' min past the next item’s time. It stays as Now until someone taps Next.<button class="btn sm" data-lc="now">Move the rest '+ov+' min later</button></div>';
  if(c.next) h+='<div class="lcadj"><span class="saved">Rest of the agenda'+(adj?' · <b>'+(adj>0?adj+' min later':(-adj)+' min earlier')+'</b> than printed':'')+'</span><span class="row"><button class="btn sm" data-lc="plus">+5 min</button><button class="btn sm" data-lc="minus">−5 min</button><button class="btn sm" data-lc="now" title="Make the next item start now and move the rest with it">⟳ Next starts now</button>'+(Object.keys(S.run.adj||{}).length?'<button class="linkbtn" data-lc="reset">Printed times</button>':'')+'</span></div>';
  if(S.run.by) h+='<div class="saved" style="margin-top:4px">Last change by '+esc(S.run.by)+'.</div>';
  return h;
}
function liveCtlHTML(){
  if(!canRun()) return "";
  var c=curItem(), h='<div class="livectl"><div class="lc-h">🎛 Live agenda controls <span class="saved">· the Now item only changes when someone taps Next</span></div>';
  if(!c.cur) return h+'<div class="row"><button class="btn go" data-lc="start">▶ Start the meeting</button></div></div>';
  h+='<div class="row"><button class="btn" data-lc="prev"'+(c.i>0?'':' disabled')+'>◀ Back</button>'+(c.next?'<button class="btn go" data-lc="next">Next ▶</button>':'<button class="btn" data-lc="end">Finish</button>')+'</div>';
  return h+adjCtlHTML()+'</div>';
}
(function(){
  document.getElementById("view").addEventListener("click",function(e){
    var b=e.target.closest("[data-lc]"); if(!b||!canRun()) return;
    var c=curItem(), a=b.dataset.lc;
    if(a==="start"){ var f=nextLive(c.its,0); if(f) runGo(f.id); }
    else if(a==="next"){ if(c.next) runGo(c.next.id); }
    else if(a==="prev"){ if(c.i>0) runGo(c.its[c.i-1].id); }
    else if(a==="plus") runAdjust(5); else if(a==="minus") runAdjust(-5);
    else if(a==="now") runRetimeNow(); else if(a==="reset") runAdjReset(); else if(a==="end") runFinish();
  });
})();
function runAdjReset(){ S.run.by=runBy(); S.run.adj={}; tick(S.run); commit(); }
function runAdjTotal(){ var c=curItem(), n=c.cur?c.next:null; return n&&S.run.adj?(S.run.adj[n.id]||0):0; }
function extraText(x,item){
  if(x==="speakers"){ var sp=uniq(asList("speakers").concat(S.speeches.filter(function(s){return s.type!=="tt";}).map(function(s){return s.name;}))); return sp.length?"Speakers: "+sp.map(function(n){ var t=speechTitle(n); return n+(t?" — “"+t+"”":""); }).join(", "):""; }
  if(x==="keynote"){var p=presentationOf(item&&item.id||keynoteItems()[0]&&keynoteItems()[0].id);return p?(p.name||assigned("keynote")||"")+(p.organization?" ("+p.organization+")":"")+(p.topic?" — "+p.topic:"")+(p.objective?"\nObjectives: "+p.objective:"")+(p.intro?"\nIntroduction: "+p.intro:"")+(p.materials?"\nMaterials: "+p.materials:""):"";}
  if(x==="ttevals"){ var tv=asList("ttevals"); return tv.length?"Evaluators: "+tv.join(", "):""; }
  if(x==="evals"){
    var p=[]; ["timer","ah","gram"].forEach(function(k){ if(assigned(k)) p.push(arole(k).n+" – "+assigned(k)); });
    var se=asList("sevals"), te=asList("ttevals");
    var pairs=(S.assigns||[]).filter(function(a){return a.evaluator;});
    if(pairs.length) p.push("Prepared speech evaluations – "+pairs.map(function(a){return a.evaluator+" (for "+a.speaker+")";}).join(", "));
    else if(se.length) p.push("Prepared speech evaluations – "+se.join(", "));
    if(te.length) p.push("Table Topic evaluations – "+te.join(", "));
    return p.join("\n");
  }
  return "";
}
function whoFor(role){ var v=asList(role); return v.join(", "); }

/* push the agenda's names out to every role and the Timer's queues */
var DEVICE_ROLE_FROM_AGENDA={coord:"coord",president:"president",saa:"saa",tmod:"tmod",ge:"ge",rrm:"rrm",timer:"timer",ttm:"ttm",ah:"ah",gram:"gram"};
function applyAgenda(){
  Object.keys(DEVICE_ROLE_FROM_AGENDA).forEach(function(k){
    var nm=assigned(k); if(nm && S.people[k]!==nm){ S.people[k]=nm; S.peopleU[k]=Math.max(now(),(S.peopleU[k]||0)+1); }
  });
  var want={ps:[],ev:[],rep:[]};
  asList("speakers").forEach(function(n){ want.ps.push({ak:"ps:"+n.toLowerCase(),name:n}); });
  var asg=(S.assigns||[]).filter(function(a){return a.evaluator;});
  asg.forEach(function(a){ want.ev.push({ak:"ev:a:"+nkey(a.speaker),name:a.evaluator+" – evaluating "+a.speaker}); });
  asList("sevals").forEach(function(n){ if(asg.some(function(a){return nkey(a.evaluator)===nkey(n);})) return; want.ev.push({ak:"ev:s:"+n.toLowerCase(),name:n+" – speech evaluation"}); });
  asList("ttevals").forEach(function(n){ want.ev.push({ak:"ev:t:"+n.toLowerCase(),name:n+" – Table Topics evaluation"}); });
  [["timer","Timer's report",{g:30,a:45,r:60}],["ah","Ah-Counter's report",{g:30,a:45,r:60}],["gram","Grammarian's report",{g:60,a:90,r:120}]].forEach(function(x){
    var n=assigned(x[0]); if(n) want.rep.push({ak:"rep:"+x[0],name:n+" – "+x[1],lim:x[2]});
  });
  Object.keys(want).forEach(function(sid){
    var keys={}; want[sid].forEach(function(w){ keys[w.ak]=w; });
    /* drop planned rows that are no longer on the agenda (only if never timed) */
    S.rows[sid].slice().forEach(function(r){ if(r.ak && /^(ps:|ev:|rep:)/.test(r.ak) && !keys[r.ak] && rowState(r)==="idle" && r.manual==null){ S.rows[sid]=S.rows[sid].filter(function(x){return x!==r;}); S.dead[r.id]=Math.max(now(),(r.u||0)+1); } });
    want[sid].forEach(function(w){
      var ex=S.rows[sid].find(function(r){return r.ak===w.ak || (sid==="ps" && !String(r.ak||"").startsWith("keynote:") && nkey(baseName(r.name))===nkey(w.name));});
      if(ex){ if(rowState(ex)==="idle" && ex.name!==w.name){ ex.name=w.name; if(w.lim) ex.lim=w.lim; tick(ex); } return; }
      var r=newRow(sid,w.name); r.ak=w.ak; if(w.lim) r.lim=w.lim; if(sid==="ps"){ var sl=presetLim((speechRec(w.name)||{}).lim); if(sl) r.lim=sl; } S.rows[sid].push(r);
    });
  });
}

