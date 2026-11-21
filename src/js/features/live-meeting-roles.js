/* Public report coordination. Private evaluation text stays in the feedback workflow. */
function reportQueue(){
  var entries=[];
  function addReport(role,name,speaker,turn,timerKey){
    if(!name) return;
    var id="report|"+JSON.stringify([role,nkey(name),nkey(speaker),turn||""]);
    if(entries.some(function(entry){return entry.id===id;})) return;
    entries.push({id:id,role:role,name:name,speaker:speaker||"",turn:turn||"",timerKey:timerKey});
  }
  ["timer","ah","gram"].forEach(function(role){addReport(role,assigned(role)||S.people[role],"","","rep:"+role);});
  [["ps","seval","sevals"],["tt","tteval","ttevals"]].forEach(function(group){
    var pairs=activeEvaluatorPairs(group[0]);
    pairs.forEach(function(pair){addReport(group[1],pair.evaluator,pair.speaker,pair.turnId,group[0]==="ps"?"ev:a:"+nkey(pair.speaker):"ev:tt:"+pair.id);});
    asList(group[2]).forEach(function(name){
      if(!pairs.some(function(pair){return nkey(pair.evaluator)===nkey(name);})) addReport(group[1],name,"","",(group[0]==="ps"?"ev:s:":"ev:t:")+name.toLowerCase());
    });
  });
  return entries;
}
function reportItemId(entry){ return "agenda-report|"+entry.timerKey; }
function orderedReportQueue(){
  var rank=new Map(runItems().map(function(it,i){return [it.id,i];}));
  return reportQueue().sort(function(a,b){return (rank.get(reportItemId(a))??Infinity)-(rank.get(reportItemId(b))??Infinity);});
}
function isMyLiveReport(entry){ return nkey(entry.name)===nkey(L.me||myName()); }
function liveReportState(entry){ return S.liveReports.find(function(record){return record.id===entry.id;})?.state||"waiting"; }
function liveReportQueueHTML(manager){
  var reports=orderedReportQueue().filter(function(entry){return manager||isMyLiveReport(entry);});
  if(!reports.length) return "";
  var control=manager&&!reports.some(function(entry){return liveReportState(entry)==="called";})?reports.find(function(entry){return liveReportState(entry)==="ready"&&!isSkipped(reportItemId(entry));}):null;
  return '<section class="card live-report-queue"><h2 class="sec">'+(manager?"Evaluation report queue":"My meeting reports")+'</h2>'+
    (control?'<button class="btn primary" data-report-id="'+esc(control.id)+'" data-report-state="called">Call next ready report</button>':'')+
    '<ul class="tlist">'+reports.map(function(entry){
      var state=liveReportState(entry), labels={waiting:"Waiting",ready:"Ready",called:"Called",presented:"Presented"};
      var mine=isMyLiveReport(entry), team=["timer","ah","gram"].includes(entry.role);
      function button(action,label){
        return '<button class="btn sm" data-report-id="'+esc(entry.id)+'" data-report-state="'+action+'">'+label+'</button>';
      }
      return '<li><div><b>'+esc(roleName(entry.role))+'</b> · '+esc(entry.name)+(entry.speaker?' · for '+esc(entry.speaker):'')+
        ' <span class="badge '+(state==="called"||state==="ready"?'on':'')+'">'+labels[state]+'</span></div><div class="row">'+
        (mine&&state==="waiting"?button("ready","Mark ready"):"")+
        (manager&&state!=="called"&&state!=="presented"&&!isSkipped(reportItemId(entry))?button("called","Call report"):"")+
        ((manager||mine)&&state!=="presented"?button("presented","Mark presented"):"")+
        (manager&&state==="presented"?button("ready","Reopen"):"")+
        (manager&&team?copyBtn(entry.role):!team&&mine?'<button class="btn sm" data-report-evaluation="'+esc(entry.id)+'">Open evaluation</button>':"")+
        '</div></li>';
    }).join("")+'</ul></section>';
}
function substitutionRoles(c){
  var entries=[];
  function addSubstitution(key,name,label,itemId){
    if(entries.some(function(entry){return entry.key===key&&entry.name===name;})) return;
    entries.push({key:key,name:name,label:label,itemId:itemId||""});
  }
  [c.cur,c.next].filter(Boolean).forEach(function(it){
    if(!it.rowId&&it.role!=="keynote") return;
    var row=it.rowId?findRow("ps",it.rowId):presentationRow(it.id);
    if(row&&rowState(row)!=="idle") return;
    addSubstitution(it.rowId?"speakers":"keynote|"+it.id,whoForItem(it),arole(it.role).n,it.id);
  });
  var finished=new Set(S.rows.ps.filter(function(row){return rowState(row)!=="idle"&&!String(row.ak||"").startsWith("keynote:");}).map(function(row){return nkey(baseName(row.name));}));
  AROLES.forEach(function(role){
    if(role.k==="keynote") return;
    asList(role.k).forEach(function(name){
      if(role.k!=="speakers"||!finished.has(nkey(name))) addSubstitution(role.k,name,role.n);
    });
  });
  c.its.filter(function(it){return it.role==="keynote"&&!S.run.started[it.id];}).forEach(function(it){
    var row=presentationRow(it.id);
    if(!row||rowState(row)==="idle") addSubstitution("keynote|"+it.id,whoForItem(it),String(it.text||"").split(" — ")[0]||arole(it.role).n,it.id);
  });
  [["ps","evaluation|"],["tt","topics|"]].forEach(function(group){
    activeEvaluatorPairs(group[0]).forEach(function(pair){addSubstitution(group[1]+pair.id,pair.evaluator,"Evaluator for "+pair.speaker);});
  });
  return entries;
}
function substituteLiveRole(entry,name){
  if(!canEditLiveAgenda()||!name||nkey(entry.name)===nkey(name)||rsvpOf(name)?.status==="no") return false;
  if(!entry.key.startsWith("keynote|")) return replaceRolePlayer(entry.key,entry.name,name);
  var row=presentationRow(entry.itemId);
  if(row&&rowState(row)!=="idle") return false;
  var presentation=editablePresentation(entry.itemId);
  if(!presentation) return false;
  presentation.name=name; tick(presentation);
  if(row){ row.name=name+" – Educational presentation"; tick(row); }
  commit(); return true;
}
function liveSubstitutionHTML(c){
  if(!canEditLiveAgenda()||(!c.cur&&S.run.endAt)) return "";
  var roles=substitutionRoles(c);
  if(!roles.length) return "";
  var connected=NET.room&&NET.status==="on"?onlinePeople().map(function(person){return person.name;}):[];
  var checkedIn=attendLive().filter(function(record){return record.mid===S.mid;}).map(function(record){return record.name;});
  var candidates=uniq(connected.concat(checkedIn,meetingNames())).filter(function(name){return rsvpOf(name)?.status!=="no";});
  if(!candidates.length) return "";
  var oldForm=document.getElementById("liveSubstitution");
  function options(values,oldValue){
    return values.map(function(x){return '<option value="'+esc(x[0])+'"'+(x[0]===oldValue?' selected':'')+'>'+esc(x[1])+'</option>';}).join("");
  }
  return '<details id="liveSubstitution" class="fold"'+(oldForm?.open?' open':'')+'><summary>Substitute a role player</summary><div class="row">'+
    '<label class="f"><b>Role player</b><select class="t" id="liveReplaceRole">'+options(roles.map(function(entry){
      return [JSON.stringify([entry.key,entry.name]),entry.label+" · "+(entry.name||"Unassigned")];
    }),document.getElementById("liveReplaceRole")?.value)+'</select></label>'+
    '<label class="f"><b>Replacement</b><select class="t" id="liveReplacement"><option value="">Choose a participant</option>'+options(candidates.map(function(name){
      return [name,name+(connected.some(function(person){return nkey(person)===nkey(name);})?" · Connected":
        checkedIn.some(function(person){return nkey(person)===nkey(name);})?" · Checked in":"")];
    }),document.getElementById("liveReplacement")?.value)+'</select></label><button class="btn" id="liveReplace">Reassign</button></div></details>';
}
document.getElementById("view").addEventListener("click",function(e){
  var button=e.target.closest("[data-report-state],[data-report-evaluation],#liveReplace");
  if(!button) return;
  if(button.id==="liveReplace"){
    var role=document.getElementById("liveReplaceRole"), replacement=document.getElementById("liveReplacement");
    var entry=substitutionRoles(curItem()).find(function(item){return JSON.stringify([item.key,item.name])===role.value;});
    if(entry&&substituteLiveRole(entry,replacement.value)){ document.getElementById("liveReplacement").value=""; showToastMsg("Role reassigned"); }
    else{ replacement.focus(); showToastMsg("Choose an available replacement for this role"); }
    return;
  }
  var report=reportQueue().find(function(entry){return entry.id===(button.dataset.reportId||button.dataset.reportEvaluation);});
  if(!report) return;
  var mine=isMyLiveReport(report), manager=myRoles().includes("ge"), current=liveReportState(report), action=button.dataset.reportState;
  if(button.dataset.reportEvaluation&&mine){
    if(report.speaker){ L.evSel=L.evSel||{}; L.evSel[report.role==="seval"?"ps":"tt"]=report.turn?"tt-turn:"+encodeURIComponent(report.turn):report.speaker; }
    if(!myRoles().includes(report.role)) saveRoleChoices([report.role],true);
    switchRole(report.role);
    return;
  }
  if(!(action==="ready"&&(mine&&current==="waiting"||manager&&current==="presented")||
    action==="called"&&manager&&current!=="presented"&&!isSkipped(reportItemId(report))||
    action==="presented"&&(manager||mine))) return;
  var record=upsert(["liveReports"],report.id,{});
  record.state=action; tick(record); commit();
});
