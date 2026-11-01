/* ---------- evaluator (Speech / Table Topics) ---------- */
function evKind(){ return L.role==="tteval"?"tt":"ps"; }
function evId(kind,speaker,by){ return "e|"+kind+"|"+nkey(speaker)+"|"+nkey(by||devId()); }
function timesFor(name){
  var out=[];
  SESSIONS.forEach(function(s){ S.rows[s.id].forEach(function(r){ if(rowState(r)!=="idle" && nkey(baseName(r.name))===nkey(name)) out.push({s:s,r:r,sec:elapsed(r,now()),st:status(s.id,r,now())}); }); });
  return out;
}
function evaluatorOf(speaker){ var a=S.assigns.find(function(x){return x.id==="as|"+nkey(speaker);}); return a&&a.evaluator?a.evaluator:""; }
function setAssign(speaker,evaluator){ var a=upsert(["assigns"],"as|"+nkey(speaker),{speaker:speaker,evaluator:""}); a.speaker=speaker; a.evaluator=evaluator||""; tick(a); applyAgenda(); commit(); }
/* Table Topics: each speaker can be given to one Table Topics Evaluator; an evaluator can have several speakers */
function ttEvaluatorOf(speaker){ var a=S.ttassign.find(function(x){return x.id==="tta|"+nkey(speaker);}); return a&&a.evaluator?a.evaluator:""; }
function setTTAssign(speaker,evaluator){ var a=upsert(["ttassign"],"tta|"+nkey(speaker),{speaker:speaker,evaluator:""}); a.speaker=speaker; a.evaluator=evaluator||""; tick(a); commit(); }
function ttLoad(ev){ return S.ttassign.filter(function(a){return nkey(a.evaluator)===nkey(ev);}).length; }
function autoAssignTT(speaker){
  if(!speaker||ttEvaluatorOf(speaker)) return; var evs=asList("ttevals").filter(function(e){return nkey(e)!==nkey(speaker);}); if(!evs.length) return;
  var best=evs.slice().sort(function(a,b){ return ttLoad(a)-ttLoad(b) || evs.indexOf(a)-evs.indexOf(b); })[0];
  var a=upsert(["ttassign"],"tta|"+nkey(speaker),{speaker:speaker,evaluator:""}); a.speaker=speaker; a.evaluator=best; tick(a);
}
function anyEvaluatorOf(kind,n){ return kind==="ps"?evaluatorOf(n):ttEvaluatorOf(n); }
function evStatusOf(kind,n,me){ var dd=(L.evDrafts||{})[evId(kind,n,me)]; if((dd&&dd.submitted)||S.evals.some(function(e){return e.id===evId(kind,n,me)&&e.done&&e.state!=="writing";})) return "done"; if(dd&&(dd.c1||dd.r||dd.c2)) return "writing"; return "todo"; }
function evalProgressHTML(kind,list,me){
  if(!list.length) return "";
  var c={done:0,writing:0,todo:0}; list.forEach(function(n){ c[evStatusOf(kind,n,me)]++; });
  return '<div class="evprog"><b>'+list.length+' speaker'+(list.length===1?'':'s')+'</b> · <span class="st-q">✓ '+c.done+' submitted</span> · ✏️ '+c.writing+' writing · '+c.todo+' to do</div>';
}
function refreshEvProg(){
  var el=document.querySelector("#view .evprog"); if(!el) return; var kind=evKind(), me=myName();
  var list=kind==="ps"?preparedSpeakers().filter(function(n){return me&&nkey(evaluatorOf(n))===nkey(me);}):ttSpeakers().filter(function(n){return me&&nkey(ttEvaluatorOf(n))===nkey(me);});
  var tmp=document.createElement("div"); tmp.innerHTML=evalProgressHTML(kind,list,me); if(tmp.firstChild) el.innerHTML=tmp.firstChild.innerHTML;
}
function evaluatorChoices(){ return uniq(asList("sevals").concat(memberNames())); }
function assignTableHTML(){
  var sp=preparedSpeakers(); if(!sp.length) return "";
  var opts=evaluatorChoices();
  return '<h2 class="sec">🔗 Who evaluates whom <span class="cnt">evaluators can also tap "Assign to me"</span></h2><div class="rp">'+sp.map(function(n){
    var cur=evaluatorOf(n), t=speechTitle(n);
    return '<div class="rprow"><span class="rpl">'+esc(n)+(t?'<div class="spt" style="padding:0">“'+esc(t)+'”</div>':'')+'</span><div class="rpv"><select class="t" data-assign="'+esc(n)+'" aria-label="Evaluator for '+esc(n)+'"><option value="">— not assigned —</option>'+opts.map(function(o){return '<option'+(nkey(o)===nkey(cur)?' selected':'')+'>'+esc(o)+'</option>';}).join("")+(cur&&!opts.some(function(o){return nkey(o)===nkey(cur);})?'<option selected>'+esc(cur)+'</option>':'')+'</select></div></div>';
  }).join("")+'</div>';
}
function evalHTML(){
  var kind=evKind(), me=myName(), list=kind==="ps"?preparedSpeakers():ttSpeakers();
  L.evSel=L.evSel||{}; var sel=L.evSel[kind];
  var h='<section class="card">';
  if(!me) h+='<div class="note" style="margin:0 0 10px">Type your name in <b>Your name</b> above, so each speaker knows who evaluated them.</div>';
  var chip=function(n){ var dd=(L.evDrafts||{})[evId(kind,n,me)], done=!!(dd&&dd.submitted)||S.evals.some(function(e){return e.id===evId(kind,n,me)&&e.done;}), t=kind==="ps"?speechTitle(n):"", ev=anyEvaluatorOf(kind,n);
    return '<button class="chip spchip'+(nkey(sel)===nkey(n)?' active':'')+'" data-evsel="'+esc(n)+'">'+(done?'✓ ':'')+esc(n)+(t?'<span class="c">“'+esc(t)+'”</span>':'')+(ev&&nkey(ev)!==nkey(me)?'<span class="c">evaluator: '+esc(ev)+'</span>':'')+'</button>'; };
  if(kind==="ps"){
    var mine=list.filter(function(n){return me&&nkey(evaluatorOf(n))===nkey(me);}), rest=list.filter(function(n){return mine.indexOf(n)<0;});
    h+='<h2 class="sec" style="margin-top:0">⭐ Your speakers</h2>'+evalProgressHTML("ps",mine,me)+'<div class="chips">'+(mine.length?mine.map(chip).join(""):'<span class="muted">No one assigned to you yet. Tap a speaker below and choose <b>Assign to me</b>, or ask the Coordinator.</span>')+'</div>';
    h+='<h2 class="sec">Other prepared speakers</h2><div class="chips">'+(rest.length?rest.map(chip).join(""):'<span class="muted">'+(list.length?'—':'The Coordinator\'s prepared speakers appear here.')+'</span>');
  } else {
    var tmine=list.filter(function(n){return me&&nkey(ttEvaluatorOf(n))===nkey(me);}), trest=list.filter(function(n){return tmine.indexOf(n)<0;});
    h+='<h2 class="sec" style="margin-top:0">⭐ Your Table Topics speakers</h2>'+evalProgressHTML("tt",tmine,me)+'<div class="chips">'+(tmine.length?tmine.map(chip).join(""):'<span class="muted">'+(list.length?'None given to you yet. Tap a speaker below and choose <b>Assign to me</b>.':'Speakers appear here as the Table Topics Master calls them, shared out between the evaluators.')+'</span>')+'</div>';
    h+='<h2 class="sec">Other Table Topics speakers</h2><div class="chips">'+(trest.length?trest.map(chip).join(""):'<span class="muted">—</span>');
  }
  h+='</div><div class="row" style="margin-top:8px"><input class="t" id="evAddIn" list="roster" autocomplete="off" placeholder="Someone else? Type a name"><button class="btn" id="evAdd">+ Add</button></div>';
  if(sel){
    var e=(L.evDrafts||{})[evId(kind,sel,me)]||{c1:"",r:"",c2:"",rate:{}};
    var other=!((L.evDrafts||{})[evId(kind,sel,me)]) && S.evals.some(function(x){return x.id===evId(kind,sel,me)&&x.done;});
    var stl=speechTitle(sel), sob=(speechRec(sel)||{}).obj;
    var tm=timesFor(sel).filter(function(x){ return kind==="ps"?x.s.id==="ps":x.s.id==="tt"; });
    var asg=anyEvaluatorOf(kind,sel);
    h+='<div class="selcard"><div class="hd"><b>'+esc(sel)+(stl&&kind==="ps"?' <span class="spt">“'+esc(stl)+'”</span>':'')+'</b>'+(tm.length?'<span class="pill">⏱ '+fmt(tm[0].sec)+' · '+esc(tm[0].st.text)+'</span>':'')+'</div>'+
       (true?'<div class="row" style="margin:-4px 0 8px"><span class="saved">'+(asg?'Assigned evaluator: <b>'+esc(asg)+'</b>':'No evaluator assigned')+'</span>'+(me&&nkey(asg)!==nkey(me)?'<button class="btn sm" id="assignMe">Assign to me</button>':'')+(me&&nkey(asg)===nkey(me)?'<button class="btn sm" id="unassignMe">Unassign me</button>':'')+'</div>':'')+
       (sob&&kind==="ps"?'<div class="note" style="margin:0 0 6px"><b>Speaker\'s objectives:</b> '+esc(sob)+'</div>':'')+
       evBox("c1","👍 Commend","What worked well? Be specific, e.g. a strong opening story, good eye contact.",e.c1)+
       evBox("r","💡 Recommend","One or two things to try next time, e.g. pause before the key point.",e.r)+
       evBox("c2","🌟 Commend","An encouraging close: the overall impression and what to keep doing.",e.c2)+
       '<div class="rates">'+[["content","Content & structure"],["delivery","Voice & body language"],["confidence","Confidence"]].map(function(x){
         var v=(e.rate||{})[x[0]]||0; return '<div class="rate"><span>'+x[1]+'</span><div>'+[1,2,3,4,5].map(function(i){ return '<button class="star'+(i<=v?' on':'')+'" data-rate="'+x[0]+'" data-v="'+i+'">★</button>'; }).join("")+'</div></div>';
       }).join("")+'</div>'+(other?'<div class="note">You already sent an evaluation for '+esc(sel)+' from another device. It\'s encrypted, so it can\'t be shown here. Submitting here replaces it.</div>':'')+'<div class="saved" id="evState">'+evStateText(sel,e)+'</div><div class="row" id="evSubmitWrap" style="margin-top:8px">'+evSubmitBtn(e)+'</div></div>';
  }
  return h+'</section>';
}
function evBox(f,label,hint,val){ return '<label class="f evbox"><b>'+label+'</b><textarea class="t" data-evf="'+f+'" rows="3" placeholder="'+esc(hint)+'">'+esc(val||"")+'</textarea></label>'; }

