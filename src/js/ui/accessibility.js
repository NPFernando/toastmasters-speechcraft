/* ---------- accessibility: name every form field and keep focus visible ---------- */
function autoLabel(root){
  (root||document).querySelectorAll("input:not([type=hidden]):not([type=file]),select,textarea").forEach(function(el){
    if((el.labels&&el.labels.length)||el.getAttribute("aria-label")||el.getAttribute("aria-labelledby")) return;
    var t=el.getAttribute("placeholder")||el.getAttribute("title")||(el.closest("[data-sid]")&&el.dataset.edit==="livename"?"Speaker name":"")||(el.dataset.edit?({time:"Time (m:ss)",name:"Speaker name",topic:"Topic",tspeaker:"Speaker"}[el.dataset.edit]||""):"");
    if(!t&&el.tagName==="SELECT"){ var o=el.options&&el.options[0]; t=o?o.textContent:""; }
    if(t) el.setAttribute("aria-label",String(t).split("\n")[0].slice(0,80));
  });
}
/* Keep keyboard focus inside the visible overlay, including nested dialogs. */
(function(){
  var dialogs=Array.from(document.querySelectorAll('body > [role="dialog"]'));
  var app=document.getElementById("app"), active=null, lastFocus=null, openers=new WeakMap();
  var controls='button:not(:disabled),input:not(:disabled):not([type=hidden]),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])';
  function visible(el){ return !!(el&&el.getClientRects().length&&!el.closest("[inert]")); }
  function focus(el){ if(visible(el)){ el.focus({preventScroll:true}); return document.activeElement===el; } return false; }
  function items(dialog){ return Array.from(dialog.querySelectorAll(controls)).filter(visible); }
  function syncDialogs(){
    var open=dialogs.filter(function(d){ return d.classList.contains("on"); });
    var top=open.reduce(function(a,d){ return !a||Number(getComputedStyle(d).zIndex)>=Number(getComputedStyle(a).zIndex)?d:a; },null);
    var previous=active;
    if(top!==previous&&top&&!openers.has(top)) openers.set(top,lastFocus);
    active=top;
    app.inert=!!top;
    dialogs.forEach(function(d){ d.inert=d!==top&&open.includes(d); if(!open.includes(d)&&d!==previous) openers.delete(d); });
    if(document.body.classList.contains("dialog-open")!==!!top) document.body.classList.toggle("dialog-open",!!top);
    if(previous&&previous!==top&&!open.includes(previous)){
      var opener=openers.get(previous);
      openers.delete(previous);
      if(top?.contains(opener||null)&&focus(opener)) return;
      if(!top){
        if(focus(opener)) return;
        if(opener?.closest("#moreMenu")&&(focus(document.getElementById("moreBtn"))||focus(document.querySelector('[data-nav="more"]')))) return;
        focus(document.querySelector('[data-nav][aria-current]'));
        return;
      }
    }
    if(top&&!top.contains(document.activeElement)){
      if(!focus(items(top)[0])) focus(top);
    }
  }
  dialogs.forEach(function(d){ d.tabIndex=-1; });
  document.addEventListener("focusin",function(e){
    var dialog=e.target.closest('[role="dialog"]');
    if(!dialog||dialog===active) lastFocus=e.target;
  });
  var observer=new MutationObserver(function(records){
    var roots=new Set();
    records.forEach(function(record){
      if(Array.from(record.addedNodes).some(function(node){return node.nodeType===1;})) roots.add(record.target);
    });
    roots.forEach(autoLabel);
    if(roots.size||records.some(function(record){ return record.type==="attributes"; })) syncDialogs();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  dialogs.forEach(function(d){ observer.observe(d,{attributes:true,attributeFilter:["class"]}); });
  autoLabel();
  document.addEventListener("keydown",function(e){
    if(!active) return;
    if(e.key==="Escape"){
      if(document.fullscreenElement) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if(active.id==="welcome"){ document.getElementById("wCancel")?.click(); return; }
      if(active.id==="stage") closeStage();
      else if(active.id==="proj") closeProj();
      else active.classList.remove("on");
      return;
    }
    if(e.key!=="Tab") return;
    var list=items(active), current=document.activeElement;
    if(!list.length){ e.preventDefault(); focus(active); return; }
    if(!list.includes(current)||(e.shiftKey&&current===list[0])||(!e.shiftKey&&current===list.at(-1))){
      e.preventDefault();
      focus(e.shiftKey?list.at(-1):list[0]);
    }
  },true);
})();
