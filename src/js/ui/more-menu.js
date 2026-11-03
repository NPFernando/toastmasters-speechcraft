/* ---------- ⋯ More menu ---------- */
(function(){
  var b=document.getElementById("moreBtn"), m=document.getElementById("moreMenu");
  function setOpen(o,fromNav){ if(o){ var r=b.getBoundingClientRect(), nar=window.innerWidth<640||fromNav; m.style.position=nar?"fixed":""; m.style.left=nar?"12px":""; m.style.right=nar?"12px":""; m.style.top=(nar&&!fromNav)?(r.bottom+6)+"px":""; m.style.bottom=fromNav?"calc(78px + env(safe-area-inset-bottom))":""; if(fromNav) m.style.top="auto"; } m.classList.toggle("on",o); b.setAttribute("aria-expanded",o?"true":"false"); }
  b.addEventListener("click",function(e){ e.stopPropagation(); setOpen(!m.classList.contains("on")); });
  m.addEventListener("click",function(e){ if(e.target.closest("#mset")) return; setTimeout(function(){ setOpen(false); },0); });
  document.addEventListener("click",function(e){ if(!e.target.closest(".morewrap")) setOpen(false); });
  window.openMoreMenu=function(fromNav){ setOpen(!m.classList.contains("on"),fromNav); };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") setOpen(false); });
})();
/* ❓ How to use: kept in ⋯ More so it doesn't take space on every screen */
(function(){
  var M=document.getElementById("howModal");
  document.getElementById("howBtn").addEventListener("click",function(){ M.classList.add("on"); var c=document.getElementById("howClose"); if(c) c.focus(); });
  M.addEventListener("click",function(e){ if(e.target===M||e.target.closest("#howClose")) M.classList.remove("on"); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") M.classList.remove("on"); });
})();
