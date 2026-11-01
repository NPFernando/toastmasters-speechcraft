/* ---------- 3. agenda templates ---------- */
function tplList(){ return [{id:"std",name:"Standard Speechcraft meeting",builtin:true,items:defaultItems()}].concat(S.tpls.filter(function(t){return !t.removed;})); }
function tplHTML(){
  return '<div class="row tplrow"><select class="t" id="tplSel" aria-label="Agenda template" style="max-width:280px"><option value="">Load a template…</option>'+tplList().map(function(t){ return '<option value="'+esc(t.id)+'">'+esc(t.name)+(t.builtin?' (built in)':' · '+t.items.length+' items')+'</option>'; }).join("")+'</select>'+
    '<button class="btn" id="tplSave">💾 Save as template</button>'+(S.tpls.some(function(t){return !t.removed;})?'<button class="linkbtn" id="tplManage">Remove a template</button>':'')+'</div>';
}
(function(){
  var V=document.getElementById("view");
  V.addEventListener("change",function(e){
    if(e.target.id!=="tplSel"||L.role!=="coord"||!coordUnlocked()) return; var id=e.target.value; if(!id) return;
    var t=tplList().find(function(x){return x.id===id;}); e.target.value="";
    if(!t||!confirm("Replace this meeting's agenda items with “"+t.name+"”?\n\nRole players and meeting details are kept.")) return;
    S.agenda.items=clone(t.items).map(function(it,i){ it.id=uid(); it.ord=i+1; return it; }); tick(S.agenda); applyAgenda(); commit(); showToastMsg("📋 Agenda set from “"+t.name+"”");
  });
  V.addEventListener("click",function(e){
    var t=e.target; if(L.role!=="coord"||!coordUnlocked()) return;
    if(t.closest("#tplSave")){ var n=prompt("Name for this agenda template (e.g. Orientation, Graduation):",""); if(!n||!n.trim()) return; n=n.trim();
      var ex=S.tpls.find(function(x){return !x.removed&&nkey(x.name)===nkey(n);});
      var items=clone(itemsSorted()).map(function(it){ return {time:it.time,role:it.role,text:it.text,x:it.x||""}; });
      if(ex){ if(!confirm("Replace the template “"+ex.name+"”?")) return; ex.items=items; tick(ex); } else S.tpls.push({id:"tpl|"+nkey(n),name:n,items:items,removed:false,ord:maxOrd(S.tpls)+1,u:now()});
      commit(); showToastMsg("💾 Saved template “"+n+"”"); return; }
    if(t.closest("#tplManage")){ var live=S.tpls.filter(function(x){return !x.removed;}); var n2=prompt("Type the name of the template to remove:\n\n"+live.map(function(x){return "• "+x.name;}).join("\n"),""); if(!n2) return;
      var r=live.find(function(x){return nkey(x.name)===nkey(n2);}); if(!r){ alert("No template called “"+n2+"”."); return; } r.removed=true; tick(r); commit(); return; }
  });
})();

