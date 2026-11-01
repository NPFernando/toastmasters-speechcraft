/* ---------- issues & ideas from members ----------
   Anyone can send a problem, idea or "I like this" from the app. It syncs with the meeting into a
   list the Coordinator and co-organisers review; from there each one becomes a GitHub issue in the
   app's repository (prefilled issue form). Members with a GitHub account can post directly. */
var REPO_URL="https://github.com/NPFernando/toastmasters-speechcraft";
var FB_TYPES={bug:{i:"🐞",n:"Problem"},idea:{i:"💡",n:"Idea"},praise:{i:"👍",n:"I like this"}};
var fbDraft={type:"bug"};
function deviceInfo(){
  var u=navigator.userAgent, os=/android/i.test(u)?"Android":/iphone|ipad|ipod/i.test(u)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)?"iPhone/iPad":/windows/i.test(u)?"Windows":/mac os/i.test(u)?"Mac":/linux/i.test(u)?"Linux":"Other";
  var br=/edg\//i.test(u)?"Edge":/chrome|crios/i.test(u)?"Chrome":/firefox|fxios/i.test(u)?"Firefox":/safari/i.test(u)?"Safari":"Browser";
  return os+" · "+br+" · "+window.innerWidth+"px wide"+(isStandalone()?" · installed app":"")+(PRACTICE?" · practice":"");
}
function myRolesText(){ return myRoles().map(function(r){var o=roleObj(r);return o?o.name:r;}).join(", "); }
function ghIssueUrl(x){
  var cut=function(s,n){ s=String(s||""); return s.length>n?s.slice(0,n)+"…":s; }, p=new URLSearchParams();
  if(x.type==="idea"||x.type==="praise"){ p.set("template","idea.yml"); p.set("title",(x.type==="praise"?"[Praise] ":"[Idea] ")+cut(x.title,90)); p.set("idea",cut(x.text,1800)); if(x.steps) p.set("why",cut(x.steps,800)); }
  else { p.set("template","bug.yml"); p.set("title","[Problem] "+cut(x.title,90)); p.set("what",cut(x.text,1800)); if(x.steps) p.set("steps",cut(x.steps,800)); if(x.device) p.set("device",x.device); }
  if(x.role) p.set("role",x.role); p.set("version",x.version||APP_VERSION); if(x.by) p.set("from",x.by);
  if(x.type==="praise") p.set("labels","praise,from-app");
  return REPO_URL+"/issues/new?"+p.toString();
}
function fbFormHTML(){
  var d=fbDraft, T=FB_TYPES;
  return '<div class="finhead"><h2 class="sec" style="margin:0">💬 Report a problem or idea</h2><button class="btn ghost" id="fbClose">Close</button></div>'+
    '<div class="seg" role="group" aria-label="Type" style="margin:10px 0">'+Object.keys(T).map(function(k){ return '<button data-fbtype="'+k+'" class="'+(d.type===k?'on':'')+'">'+T[k].i+' '+T[k].n+'</button>'; }).join("")+'</div>'+
    '<label class="f">'+(d.type==="bug"?"What went wrong? (short)":d.type==="idea"?"Your idea (short)":"What do you like?")+'<input class="t" id="fbTitle" maxlength="120" value="'+esc(d.title||"")+'" placeholder="'+(d.type==="bug"?"e.g. Timer stopped when my phone locked":d.type==="idea"?"e.g. Show the speaker\'s photo on the projector":"e.g. The Focus mode for Ah-Counter")+'"></label>'+
    '<label class="f" style="margin-top:8px">Details<textarea class="t" id="fbText" rows="4" placeholder="'+(d.type==="bug"?"What did you see? What did you expect?":"Tell us more")+'">'+esc(d.text||"")+'</textarea></label>'+
    (d.type!=="praise"?'<label class="f" style="margin-top:8px">'+(d.type==="bug"?"Steps to make it happen again (optional)":"Why it would help (optional)")+'<textarea class="t" id="fbSteps" rows="2">'+esc(d.steps||"")+'</textarea></label>':'')+
    '<label class="f" style="margin-top:8px">Your name (optional)<input class="t" id="fbBy" value="'+esc(d.by!=null?d.by:(myName()||L.me||""))+'"></label>'+
    '<label class="tgl" style="margin-top:8px"><input type="checkbox" id="fbDev"'+(d.dev===false?'':' checked')+'> <span>Include role and device: <span class="saved">'+esc(myRolesText()+" · "+deviceInfo()+" · v"+APP_VERSION)+'</span></span></label>'+
    '<div class="row" style="margin-top:12px"><button class="btn primary" id="fbSend">📨 Send to the organisers</button><button class="btn" id="fbGithub" title="Opens GitHub with this filled in (needs a GitHub account)">Post on GitHub ↗</button></div>'+
    '<div class="saved" style="margin-top:6px">'+(NET.mode&&NET.status==="on"?'Sends now to the Coordinator\'s review list.':'Saved on this device; it reaches the organisers next time you join a meeting.')+' No account needed. The organisers turn it into a GitHub issue to track the fix.</div>';
}
function fbCollect(){
  var g=function(id){ var el=document.getElementById(id); return el?el.value.trim():""; }, dev=document.getElementById("fbDev").checked;
  fbDraft.title=g("fbTitle"); fbDraft.text=g("fbText"); fbDraft.steps=g("fbSteps"); fbDraft.by=g("fbBy"); fbDraft.dev=dev;
  return {type:fbDraft.type,title:fbDraft.title,text:fbDraft.text,steps:fbDraft.steps,by:fbDraft.by,role:dev?myRolesText():"",device:dev?deviceInfo():"",version:APP_VERSION};
}
function openFb(){ document.getElementById("fbBox").innerHTML=fbFormHTML(); document.getElementById("fbModal").classList.add("on"); setTimeout(function(){ var t=document.getElementById("fbTitle"); if(t) t.focus(); },50); }
function closeFb(){ document.getElementById("fbModal").classList.remove("on"); }
(function(){
  var M=document.getElementById("fbModal");
  M.addEventListener("click",function(e){
    var t=e.target, b;
    if(t.id==="fbModal"||t.closest("#fbClose")){ closeFb(); return; }
    if((b=t.closest("[data-fbtype]"))){ fbCollect(); fbDraft.type=b.dataset.fbtype; document.getElementById("fbBox").innerHTML=fbFormHTML(); return; }
    if(t.closest("#fbSend")||t.closest("#fbGithub")){
      var x=fbCollect(); if(!x.title&&!x.text){ document.getElementById("fbTitle").focus(); return; }
      if(!x.title) x.title=x.text.split(/\n/)[0].slice(0,80);
      if(t.closest("#fbGithub")){ window.open(ghIssueUrl(x),"_blank","noopener"); return; }
      S.ideas.push(Object.assign(x,{id:uid(),at:now(),status:"new",ord:maxOrd(S.ideas)+1,u:now()})); commit();
      fbDraft={type:fbDraft.type}; closeFb(); showToastMsg("📨 Thanks! Sent to the organisers"+(NET.mode&&NET.status==="on"?"":" (when you next connect)")); return;
    }
  });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&M.classList.contains("on")) closeFb(); });
  document.getElementById("fbBtn").addEventListener("click",openFb);
})();
/* review list for the Coordinator and co-organisers */
function ideasHTML(){
  var list=S.ideas.filter(function(x){return x.status!=="removed";}).sort(function(a,b){ var o={new:0,github:1,done:2}; return (o[a.status]-o[b.status])||(b.at-a.at); });
  var nNew=list.filter(function(x){return x.status==="new";}).length;
  var h='<details class="card" id="ideasCard" style="margin-top:12px"'+(L.ideasOpen||nNew?' open':'')+'><summary><h2 class="sec" style="margin:0;display:inline-flex">💬 Issues &amp; ideas <span class="cnt">'+(nNew?'<span class="badge on">'+nNew+' new</span> ':'')+list.length+' total</span></h2></summary>';
  h+='<div class="note" style="margin-top:8px">Sent by members from ⋯ More → Report a problem or idea. Tap <b>Create GitHub issue</b> to add one to the <a href="'+REPO_URL+'/issues" target="_blank" rel="noopener">app’s issue list</a> (opens GitHub filled in; you need to be signed in), then mark it done when fixed.</div>';
  if(!list.length) h+='<div class="note">Nothing yet.</div>';
  list.forEach(function(x){ var T=FB_TYPES[x.type]||FB_TYPES.idea;
    h+='<div class="idea '+x.status+'"><div class="idea-h"><b>'+T.i+' '+esc(x.title||T.n)+'</b><span class="badge '+(x.status==="new"?"on":x.status==="done"?"ok":"")+'">'+({new:"New",github:"On GitHub",done:"Done"}[x.status]||x.status)+'</span></div>'+
      (x.text?'<div class="idea-t">'+esc(x.text)+'</div>':'')+(x.steps?'<div class="idea-t saved">'+(x.type==="bug"?"Steps: ":"Why: ")+esc(x.steps)+'</div>':'')+
      '<div class="saved">'+esc([x.by||"Anonymous",x.role,x.device,fmtDate(new Date(x.at).toISOString().slice(0,10))].filter(Boolean).join(" · "))+'</div>'+
      '<div class="row" style="margin-top:6px">'+(x.status!=="done"?'<button class="btn sm primary" data-idgh="'+x.id+'">Create GitHub issue ↗</button><button class="btn sm" data-iddone="'+x.id+'">✓ Done</button>':'<button class="btn sm" data-idreopen="'+x.id+'">Reopen</button>')+'<button class="btn sm ghost" data-iddel="'+x.id+'">Remove</button></div></div>';
  });
  if(list.length) h+='<div class="row" style="margin-top:8px"><button class="btn" id="ideasCopy">📋 Copy all as text</button></div>';
  return h+'</details>';
}
(function(){
  var V=document.getElementById("view");
  V.addEventListener("click",function(e){
    var t=e.target, b, x;
    if(L.role!=="coord"||!coordUnlocked()) return;
    if(t.closest("#ideasCard > summary")){ L.ideasOpen=!document.getElementById("ideasCard").open; saveL(); return; }
    var find=function(id){ return S.ideas.find(function(z){return z.id===id;}); };
    if((b=t.closest("[data-idgh]"))&&(x=find(b.dataset.idgh))){ window.open(ghIssueUrl(x),"_blank","noopener"); x.status="github"; tick(x); commit(); return; }
    if((b=t.closest("[data-iddone]"))&&(x=find(b.dataset.iddone))){ x.status="done"; tick(x); commit(); return; }
    if((b=t.closest("[data-idreopen]"))&&(x=find(b.dataset.idreopen))){ x.status="new"; tick(x); commit(); return; }
    if((b=t.closest("[data-iddel]"))&&(x=find(b.dataset.iddel))){ if(!confirm("Remove “"+(x.title||"this item")+"” from the list?")) return; x.status="removed"; tick(x); commit(); return; }
    if(t.closest("#ideasCopy")){ copyText(S.ideas.filter(function(z){return z.status!=="removed";}).map(function(z){ var T=FB_TYPES[z.type]||FB_TYPES.idea; return T.i+" "+T.n+" ["+z.status+"] "+(z.title||"")+(z.text?"\n"+z.text:"")+(z.steps?"\n"+z.steps:"")+"\n— "+[z.by||"Anonymous",z.role,z.device].filter(Boolean).join(" · "); }).join("\n\n")); return; }
  });
})();
