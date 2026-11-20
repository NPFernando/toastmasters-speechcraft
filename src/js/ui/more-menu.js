/* ---------- ⋯ More menu ---------- */
(function(){
  var b=document.getElementById("moreBtn"), m=document.getElementById("moreMenu");
  function setOpen(open,fromNav,restore){
    var mobile=document.querySelector('[data-nav="more"]'), wasOpen=m.classList.contains("on");
    var trigger=(fromNav||(!b.getClientRects().length&&mobile))?mobile:b;
    if(open){
      var narrow=trigger===mobile;
      m.style.position=narrow?"fixed":"";
      m.style.left=m.style.right=narrow?"12px":"";
      m.style.top=narrow?"auto":"";
      m.style.bottom=narrow?"calc(66px + env(safe-area-inset-bottom))":"";
    }
    m.classList.toggle("on",open);
    b.setAttribute("aria-expanded",open?"true":"false");
    mobile?.setAttribute("aria-expanded",open?"true":"false");
    if(open) Array.from(m.querySelectorAll("button,a[href]")).find(function(el){return !el.disabled&&el.getClientRects().length;})?.focus();
    else if(wasOpen&&restore) trigger?.focus();
  }
  b.addEventListener("click",function(e){ e.stopPropagation(); setOpen(!m.classList.contains("on"),false,true); });
  m.addEventListener("click",function(e){ if(e.target.closest("#mset")) return; setTimeout(function(){ setOpen(false,false,m.contains(document.activeElement)); },0); });
  document.addEventListener("click",function(e){ if(!e.target.closest(".morewrap")) setOpen(false); });
  window.openMoreMenu=function(fromNav){ setOpen(!m.classList.contains("on"),fromNav,true); };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") setOpen(false,false,true); });
})();
/* ❓ How to use: kept in ⋯ More so it doesn't take space on every screen */
(function(){
  var M=document.getElementById("howModal");
  document.getElementById("howBtn").addEventListener("click",function(){ M.classList.add("on"); var c=document.getElementById("howClose"); if(c) c.focus(); });
  M.addEventListener("click",function(e){ if(e.target===M||e.target.closest("#howClose")) M.classList.remove("on"); });
})();
