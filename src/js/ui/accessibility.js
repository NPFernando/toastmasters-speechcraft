/* ---------- accessibility: name every form field and keep focus visible ---------- */
function autoLabel(root){
  (root||document).querySelectorAll("input:not([type=hidden]):not([type=file]),select,textarea").forEach(function(el){
    if((el.labels&&el.labels.length)||el.getAttribute("aria-label")||el.getAttribute("aria-labelledby")) return;
    var t=el.getAttribute("placeholder")||el.getAttribute("title")||(el.closest("[data-sid]")&&el.dataset.edit==="livename"?"Speaker name":"")||(el.dataset.edit?({time:"Time (m:ss)",name:"Speaker name",topic:"Topic",tspeaker:"Speaker"}[el.dataset.edit]||""):"");
    if(!t&&el.tagName==="SELECT"){ var o=el.options&&el.options[0]; t=o?o.textContent:""; }
    if(t) el.setAttribute("aria-label",String(t).split("\n")[0].slice(0,80));
  });
}
new MutationObserver(function(){ autoLabel(document.getElementById("app")); autoLabel(document.getElementById("welcome")); }).observe(document.body,{childList:true,subtree:true});
