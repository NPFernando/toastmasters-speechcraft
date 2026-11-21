/* ---------- ⋯ More menu ---------- */
(function(){
  var b=document.getElementById("moreBtn"), m=document.getElementById("moreMenu");
  var layout=window.matchMedia("(max-width:640px)");
  function isOpen(){ return m.classList.contains("on"); }
  function setOpen(open,restore){
    var mobile=document.querySelector('[data-nav="more"]'), wasOpen=isOpen();
    m.classList.toggle("on",open);
    b.setAttribute("aria-expanded",String(open));
    mobile?.setAttribute("aria-expanded",String(open));
    if(open){ m.scrollTop=0; document.getElementById("moreTitle").focus({preventScroll:true}); }
    else if(wasOpen&&restore) (layout.matches?mobile:b)?.focus();
  }
  b.addEventListener("click",function(){ setOpen(!isOpen(),true); });
  document.getElementById("moreClose").addEventListener("click",function(){ setOpen(false,true); });
  m.addEventListener("click",function(e){
    if(e.target.closest("#mset")||!e.target.closest(".mi")) return;
    setTimeout(function(){ setOpen(false,m.contains(document.activeElement)); },0);
  });
  document.addEventListener("click",function(e){ if(!e.target.closest(".morewrap,[data-nav=more]")) setOpen(false); });
  document.addEventListener("focusin",function(e){ if(isOpen()&&!e.target.closest(".morewrap,[data-nav=more]")) setOpen(false); });
  window.openMoreMenu=function(){ setOpen(!isOpen(),true); };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&isOpen()){ e.preventDefault(); setOpen(false,true); } });
})();
/* ❓ How to use: kept in ⋯ More so it doesn't take space on every screen */
(function(){
  var M=document.getElementById("howModal");
  document.getElementById("howBtn").addEventListener("click",function(){ M.classList.add("on"); var c=document.getElementById("howClose"); if(c) c.focus(); });
  M.addEventListener("click",function(e){ if(e.target===M||e.target.closest("#howClose")) M.classList.remove("on"); });
})();
