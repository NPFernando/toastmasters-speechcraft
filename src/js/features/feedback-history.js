/* ---------- my feedback history: every week on this device ----------
   Evaluations and notes are kept exactly as they arrived (encrypted for the speaker), so the
   history can only be read after unlocking with the speaker's feedback PIN. Times, filler counts,
   Word of the Day and awards are kept as plain summaries. */
var FKEY="speechcraftFeedback"+NS;
function histLoad(){ try{ return JSON.parse(lsGet(FKEY)||"{}")||{}; }catch(e){ return {}; } }
function histSave(h){ lsSet(FKEY,JSON.stringify(h)); }
function histCapture(name){
  if(!name||S.meta.test) return; var k=nkey(name), H=histLoad(), mine=H[k]=H[k]||{name:name,meetings:{}};
  var ev=submittedEvals(name).map(function(e){ return {by:e.by||"",kind:e.kind||"",enc:e.enc}; });
  var nt=S.notes.filter(function(n){return nkey(n.to)===k&&n.enc;}).map(function(n){ return {enc:n.enc}; });
  var tm=timesFor(name).filter(function(x){return rowState(x.r)==="done";}).map(function(x){ return {s:x.s.name,sec:x.sec,res:x.st.text}; });
  var ah=S.ahRows.find(function(r){return nkey(r.name)===k;}), g=S.gramRows.find(function(r){return nkey(r.name)===k;});
  var won=S.vote.state==="shown"?VCATS.filter(function(c){ return tally(c.k).winners.some(function(w){return nkey(w.name)===k;}); }).map(function(c){return c.n;}):[];
  if(!ev.length&&!nt.length&&!tm.length&&!won.length) return;
  var rec={date:S.meta.date||"",week:S.meta.week||"",title:speechTitle(name),times:tm,ah:ah?ahTotal(ah):null,wotd:g?(g.w||0):null,good:g?g.good.slice():[],slips:g?g.slips.slice():[],awards:won,evals:ev,notes:nt};
  var prev=mine.meetings[S.mid]; if(prev&&JSON.stringify(prev)===JSON.stringify(rec)) return;
  mine.meetings[S.mid]=rec; histSave(H);
}
function histMeetings(name){ var m=(histLoad()[nkey(name)]||{}).meetings||{}; return Object.keys(m).map(function(id){ return Object.assign({mid:id},m[id]); }).sort(function(a,b){ return (b.date||"").localeCompare(a.date||""); }); }
function openHistory(name){
  var ms=histMeetings(name), unlocked=hasPriv(name), kx=keyRec(name)&&keyRec(name).pub.x;
  var h='<div class="rlogos"><img src="'+document.querySelector(".logo img").src+'" alt="Toastmasters International"><img src="'+document.querySelector(".logo.co img").src+'" alt="Dijital Team"></div><h2>My Speechcraft feedback — '+esc(name)+'</h2><div class="sub">'+ms.length+' meeting'+(ms.length===1?'':'s')+' on this device</div>';
  if(!ms.length) h+='<div class="none" style="margin-top:12px">Nothing saved yet. Each meeting where you speak or get feedback is added here automatically.</div>';
  ms.forEach(function(m,i){
    h+='<h3>'+esc(m.week||"Meeting")+' · '+esc(fmtDate(m.date))+'</h3>'+(m.title?'<div>Speech: <b>“'+esc(m.title)+'”</b></div>':'');
    if(m.times.length) h+='<div>⏱ '+m.times.map(function(t){ return esc(t.s)+' '+fmt(t.sec)+' — '+esc(t.res); }).join(' · ')+'</div>';
    var bits=[]; if(m.ah!=null) bits.push('🔢 '+m.ah+' filler'+(m.ah===1?'':'s')); if(m.wotd) bits.push('📝 Word of the Day ×'+m.wotd); if(m.awards.length) bits.push('🏆 '+m.awards.join(", ")); if(bits.length) h+='<div>'+esc(bits.join(" · "))+'</div>';
    if(m.good.length) h+='<div><b>Great phrases:</b> '+esc(m.good.join("; "))+'</div>'; if(m.slips.length) h+='<div><b>To polish:</b> '+esc(m.slips.join("; "))+'</div>';
    if(m.evals.length||m.notes.length) h+='<div id="hist'+i+'" class="histpriv"><div class="none">'+(unlocked?'Decrypting…':'🔒 '+m.evals.length+' evaluation'+(m.evals.length===1?'':'s')+' and '+m.notes.length+' note'+(m.notes.length===1?'':'s')+' — unlock with your feedback PIN to read them.')+'</div></div>';
  });
  document.getElementById("report").innerHTML=h;
  document.getElementById("repPick").innerHTML='<b style="font-size:14px">My feedback history – '+esc(name)+'</b>';
  var w=document.getElementById("reportWrap"); w.dataset.kind="card"; w.dataset.card=name; w.classList.add("on");
  if(!unlocked) return;
  ms.forEach(function(m,i){
    if(!m.evals.length&&!m.notes.length) return;
    var dec=function(x){ return x.enc&&x.enc.kx===kx?decryptFor(name,x.enc).catch(function(){return null;}):Promise.resolve(null); };
    Promise.all([Promise.all(m.evals.map(dec)),Promise.all(m.notes.map(dec))]).then(function(r){
      var html=r[0].map(function(x,j){ if(!x) return '<div class="none">An evaluation that can’t be read with your current PIN.</div>'; var rt=x.rate||{};
        return '<div class="evcard"><div class="saved">'+(x.kind==="tt"?"Table Topics":"Prepared speech")+' · by '+esc(m.evals[j].by||x.by||"Evaluator")+'</div>'+(x.c1?'<div><b>Commend:</b> '+esc(x.c1)+'</div>':'')+(x.r?'<div><b>Recommend:</b> '+esc(x.r)+'</div>':'')+(x.c2?'<div><b>Commend:</b> '+esc(x.c2)+'</div>':'')+
          ((rt.content||rt.delivery||rt.confidence)?'<div class="saved">Content '+(rt.content||"–")+'/5 · Delivery '+(rt.delivery||"–")+'/5 · Confidence '+(rt.confidence||"–")+'/5</div>':'')+'</div>'; }).join("");
      var notes=r[1].filter(Boolean).map(function(x){return '<li>'+esc(x.text)+'</li>';}).join("");
      var el=document.getElementById("hist"+i); if(el) el.innerHTML=html+(notes?'<div><b>💌 Notes:</b><ul>'+notes+'</ul></div>':'');
    });
  });
}
function histButtonHTML(name){ var n=histMeetings(name).length; return '<button class="btn" data-history="'+esc(name)+'">📚 My feedback history'+(n?' ('+n+')':'')+'</button>'; }
document.getElementById("view").addEventListener("click",function(e){ var b=e.target.closest("[data-history]"); if(b) openHistory(b.dataset.history); });
