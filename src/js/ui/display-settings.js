/* ---------- display settings (per device) ---------- */
function applyDisplay(){
  var r=document.documentElement, th=L.theme||"auto";
  if(th==="auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme",th);
  r.classList.toggle("big",!!L.big);
  document.querySelectorAll("[data-theme-set]").forEach(function(b){ b.classList.toggle("on",b.dataset.themeSet===th); });
  var bt=document.getElementById("bigText"); if(bt) bt.checked=!!L.big;
}
document.getElementById("mset").addEventListener("click",function(e){ var b=e.target.closest("[data-theme-set]"); if(b){ L.theme=b.dataset.themeSet; saveL(); applyDisplay(); } });
document.getElementById("bigText").addEventListener("change",function(e){ L.big=e.target.checked; saveL(); applyDisplay(); });
applyDisplay();
