/* Older browsers need help fitting multiline fields to their content. */
(function(){
  if(CSS.supports("field-sizing","content")) return;
  var selector="textarea.t", widths=new WeakMap();
  function fitTextarea(field){
    if(!field.clientWidth) return;
    field.style.height="auto";
    var border=field.offsetHeight-field.clientHeight;
    field.style.height=(field.scrollHeight+border)+"px";
  }
  var observer=new ResizeObserver(function(entries){
    entries.forEach(function(entry){
      var field=entry.target, width=entry.contentRect.width;
      if(width===widths.get(field)) return;
      widths.set(field,width);
      fitTextarea(field);
    });
  });
  function trackTextareas(node,track){
    if(node.nodeType!==1) return;
    function trackField(field){
      if(track&&field.isConnected){ observer.observe(field); fitTextarea(field); }
      else if(!field.isConnected){ observer.unobserve(field); widths.delete(field); }
    }
    if(node.matches(selector)) trackField(node);
    node.querySelectorAll(selector).forEach(trackField);
  }
  new MutationObserver(function(records){
    records.forEach(function(record){
      record.removedNodes.forEach(function(node){trackTextareas(node,false);});
      record.addedNodes.forEach(function(node){trackTextareas(node,true);});
    });
  }).observe(document.body,{childList:true,subtree:true});
  trackTextareas(document.body,true);
  document.addEventListener("input",function(event){
    if(event.target.matches(selector)) fitTextarea(event.target);
  });
})();
