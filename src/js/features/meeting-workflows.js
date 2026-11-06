/* Meeting drafts are scoped to a meeting; selections travel with their text. */
function workflowDraft(){if(!L.workflowDraft||L.workflowDraft.mid!==S.mid||!L.workflowDraft.fields)L.workflowDraft={mid:S.mid,fields:{}};return L.workflowDraft.fields;}
function wfDraft(id){return esc(workflowDraft()[id]||'');}
function workflowField(key,label,value,type){return '<label class="f evbox"><b>'+esc(label)+'</b><input class="t" type="'+(type||'text')+'" data-keynote="'+key+'" value="'+esc(value==null?'':value)+'"'+(type==='number'?' step="0.1" min="0.1" max="180"':'')+'></label>';}
function keynoteItems(){return itemsSorted().filter(function(it){return it.role==='keynote';});}
function selectedPresentationItem(){var items=keynoteItems(),draft=workflowDraft();return items.find(function(it){return it.id===draft.keynoteItem;})||items.find(function(it){return it.id===S.run.cur;})||items[0];}
function presentationLimits(minutes){var sec=Number(minutes)*60;return {g:sec>=180?sec-120:Math.round(sec*0.6),a:sec>=180?sec-60:Math.round(sec*0.8),r:sec};}
function presentationOf(itemId){
 if(!itemId)return null;var saved=S.presentations.find(function(p){return p.itemId===itemId;});if(saved)return saved;
 var first=keynoteItems()[0],legacy=first&&first.id===itemId,a=S.agenda,minutes=legacy?Number(a.kminutes||20):20;
 return {id:'presentation|'+itemId,itemId:itemId,name:assigned('keynote')||S.people.keynote||'',topic:legacy?a.ktopic||'':'',objective:legacy?a.kobjective||'':'',intro:legacy?a.kintro||'':'',materials:legacy?a.kmaterials||'':'',minutes:minutes,lim:presentationLimits(minutes),ord:maxOrd(S.presentations)+1,u:0};
}
function editablePresentation(itemId){var p=S.presentations.find(function(p){return p.itemId===itemId;});if(!p){p=presentationOf(itemId);if(p)S.presentations.push(p);}return p;}
function presentationRow(itemId){var first=keynoteItems()[0];return S.rows.ps.find(function(r){return r.presentationItemId===itemId||r.ak==='keynote:'+S.mid+':'+itemId||(first&&first.id===itemId&&r.ak==='keynote:'+S.mid);});}
function validPresentationLimits(lim){return lim&&[lim.g,lim.a,lim.r].every(function(x){return Number.isFinite(x)&&x>0;})&&lim.g<lim.a&&lim.a<lim.r&&lim.r<=10800;}
function keynoteHTML(){
 var items=keynoteItems(),it=selectedPresentationItem();if(!it)return '<section class="card"><h2>Educational Presenter / Keynote</h2><p>Add a keynote agenda item through the Coordinator to prepare a presentation.</p></section>';
 var p=presentationOf(it.id),lim=p.lim||presentationLimits(p.minutes),row=presentationRow(it.id);
 return '<section class="card"><h2>🌟 Educational Presenter / Keynote</h2><label class="f"><b>Presentation agenda item</b><select class="t" id="keynoteItem">'+items.map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===it.id?' selected':'')+'>'+esc(fmtHM(x.time)+' · '+x.text)+'</option>';}).join('')+'</select></label><p class="muted">Each agenda item has its own presentation and Timer entry. Shared with the Toastmaster and Coordinator; separate from prepared-speech awards.</p>'+workflowField('name','Presenter',p.name||myName())+workflowField('ktopic','Topic',p.topic)+workflowField('kobjective','Learning objectives',p.objective)+workflowField('kintro','Introduction for the Toastmaster',p.intro)+workflowField('kmaterials','Materials link or reference',p.materials)+workflowField('kminutes','Target / red minutes (0.1–180)',lim.r/60,'number')+workflowField('kgreen','Green minutes',lim.g/60,'number')+workflowField('kamber','Amber minutes',lim.a/60,'number')+'<p class="saved">Changing the target recalculates signals; adjust green and amber afterwards. Required: 0 &lt; green &lt; amber &lt; red. Requeue an idle entry to apply changes to its timing.</p><button class="btn" id="keynoteQueue">Queue presentation for Timer</button>'+(row?'<p>Timer: '+esc(rowState(row))+(elapsed(row,now())!=null?' · '+fmt(elapsed(row,now())):'')+'</p>':'')+'</section>';
}
function updatePresentationField(key,value){
 var it=selectedPresentationItem();if(!it)return;workflowDraft().keynoteItem=it.id;saveL();var p=editablePresentation(it.id),map={ktopic:'topic',kobjective:'objective',kintro:'intro',kmaterials:'materials',name:'name'};
 if(key==='kminutes'){p.minutes=Number(value);p.lim=presentationLimits(p.minutes);}
 else if(key==='kgreen'||key==='kamber'){p.lim=p.lim||presentationLimits(p.minutes);p.lim[key==='kgreen'?'g':'a']=Number(value)*60;}
 else if(map[key])p[map[key]]=value;else return;tick(p);commitQuiet();
}
function queueKeynote(){
 var it=selectedPresentationItem();if(!it)return;var p=editablePresentation(it.id),name=p.name||myName();if(!name){alert('Enter the presenter name first.');return;}
 var lim=p.lim||presentationLimits(p.minutes);if(!validPresentationLimits(lim)){alert('Use 0 < green < amber < red, with red no more than 180 minutes.');return;}
 var r=presentationRow(it.id);if(r&&rowState(r)!=='idle'){alert('This presentation is already timed or running.');return;}
 if(!r){r=newRow('ps',name+' – Educational presentation');r.id='keynote|'+S.mid+'|'+it.id;delete S.dead[r.id];S.rows.ps.push(r);}r.ak='keynote:'+S.mid+':'+it.id;r.presentationItemId=it.id;r.name=name+' – Educational presentation';r.lim=clone(lim);tick(r);tick(p);commit();
}
function geAgendaHTML(){
 var d=workflowDraft(),items=itemsSorted(),selected=d.geAgendaItem||S.run.cur||(items[0]&&items[0].id)||'',missing=selected&&!items.some(function(it){return it.id===selected;});
 var h='<section class="card"><h2>Agenda observations</h2><label class="f"><b>Agenda item</b><select class="t" id="geAgendaItem">'+(missing?'<option value="'+esc(selected)+'" selected>Removed agenda item — select another</option>':'')+items.map(function(it){return '<option value="'+esc(it.id)+'"'+(selected===it.id?' selected':'')+'>'+esc(fmtHM(it.time)+' · '+arole(it.role).n+' · '+it.text)+'</option>';}).join('')+'</select></label><label class="f"><b>Type</b><select class="t" id="geObservationKind"><option value="commend"'+(d.geObservationKind!=='improve'?' selected':'')+'>Commendation</option><option value="improve"'+(d.geObservationKind==='improve'?' selected':'')+'>Improvement</option></select></label><label class="f"><b>Evidence / suggestion</b><textarea class="t" id="geObservationText">'+wfDraft('geObservationText')+'</textarea></label><button class="btn" id="geObservationAdd">Save observation</button>';
 h+=S.geobs.map(function(o){var a=actionForObservation(o.id);return '<div class="wcard"><b>'+esc(o.itemLabel)+'</b><div>'+esc(o.kind+' · '+o.role+' · '+(o.who||'Unassigned')+' · '+clock(o.at))+'</div><p>'+esc(o.note)+'</p><button class="btn sm" data-observation-action="'+esc(o.id)+'">'+(a?'Open action':'Create follow-up action')+'</button><button class="linkbtn" data-observation-remove="'+esc(o.id)+'">Remove</button></div>';}).join('');return h+'</section>';
}
function actionForObservation(id){return S.actions.find(function(a){return a.source===id;});}
function actionOverdue(a){return !a.archived&&a.state!=='done'&&/^\d{4}-\d{2}-\d{2}$/.test(a.due||'')&&a.due<todayISO();}
function actionsHTML(){
 var edit=L.role==='ge'||(L.role==='coord'&&coordUnlocked()),d=workflowDraft(),editing=S.actions.find(function(a){return a.id===d.actionEdit;}),filter=L.actionFilter||'open';
 var h='<section class="card" id="actionsPanel"><h2>Follow-up actions</h2><p class="muted">Actions stay across meetings. Shared meeting data; exclude private feedback.</p><label class="f"><b>Show actions</b><select class="t" id="actionFilter">'+[['open','Open'],['done','Completed'],['archived','Archived'],['all','All']].map(function(x){return '<option value="'+x[0]+'"'+(filter===x[0]?' selected':'')+'>'+x[1]+'</option>';}).join('')+'</select></label>';
 if(edit)h+='<h3>'+(editing?'Edit action':'New action')+'</h3><label class="f"><b>Action</b><input class="t" id="actionText" value="'+wfDraft('actionText')+'"></label><label class="f"><b>Owner</b><input class="t" id="actionOwner" value="'+wfDraft('actionOwner')+'" list="roster"></label><label class="f"><b>Target meeting date</b><input class="t" type="date" id="actionDue" value="'+wfDraft('actionDue')+'"></label><button class="btn" id="actionAdd">'+(editing?'Save changes':'Add action')+'</button>'+(editing?'<button class="btn" id="actionCancel">Cancel edit</button>':'');
 h+=S.actions.filter(function(a){return filter==='all'||filter==='archived'&&a.archived||!a.archived&&(filter==='done'?a.state==='done':a.state!=='done');}).map(function(a){return '<div class="wcard" data-action-card="'+esc(a.id)+'"><b>'+esc(a.text)+'</b><div>'+esc((a.owner||'Unassigned')+' · '+(a.due||'No target date')+' · '+(a.state||'open')+(a.archived?' · archived':'')+(actionOverdue(a)?' · OVERDUE':''))+'</div>'+(edit?'<button class="btn sm" data-action-edit="'+esc(a.id)+'">Edit</button><button class="btn sm" data-action-toggle="'+esc(a.id)+'">'+(a.state==='done'?'Reopen':'Mark complete')+'</button><button class="btn sm" data-action-archive="'+esc(a.id)+'">'+(a.archived?'Restore':'Archive')+'</button>':'')+'</div>';}).join('');return h+'</section>';
}
function clearActionDraft(){var d=workflowDraft();['actionText','actionOwner','actionDue','actionEdit'].forEach(function(k){delete d[k];});saveL();}
function editWorkflowAction(a){if(!a)return;var d=workflowDraft();d.actionEdit=a.id;d.actionText=a.text;d.actionOwner=a.owner||'';d.actionDue=a.due||'';L.actionFilter='all';saveL();renderAll();var el=document.getElementById('actionsPanel');if(el)el.scrollIntoView({block:'start'});}
function addWorkflowAction(text,owner,due,source){
 text=String(text||'').trim();if(!text)return;var existing=source&&actionForObservation(source);if(existing){editWorkflowAction(existing);return;}
 var a={id:source?'action|'+S.mid+'|'+source:uid(),text:text,owner:owner||'',due:due||'',state:'open',source:source||'',meeting:S.mid,ord:maxOrd(S.actions)+1,u:now()};S.actions.push(a);clearActionDraft();L.actionFilter='open';commit();
}
function workflowReportLines(){var out=S.geobs.map(function(o){return 'Agenda observation — '+o.itemLabel+' — '+o.role+(o.who?' ('+o.who+')':'')+' at '+clock(o.at)+': '+o.note;});S.actions.filter(function(a){return !a.archived;}).forEach(function(a){out.push('Action ['+(a.state||'open')+(actionOverdue(a)?', overdue':'')+']: '+a.text+' — '+(a.owner||'Unassigned')+'; target '+(a.due||'not set'));});return out;}
var HANDOVER_ROLES=['coord','president','tmod','ge','rrm','ttm','keynote'];
function defaultHandoverRole(){
 var c=curItem();if(c.cur&&c.cur.role===L.role){var next=c.its.slice(c.i+1).find(function(it){return !isSkipped(it.id)&&it.role!==L.role&&HANDOVER_ROLES.indexOf(it.role)>=0;});if(next)return next.role;}
 if(['timer','ah','gram','seval','tteval'].indexOf(L.role)>=0)return 'ge';if(L.role==='tmod'||L.role==='saa')return 'president';if(L.role==='president')return 'tmod';return 'tmod';
}
function handoverHTML(){
 var h='<section class="card"><h2>Hand over the floor</h2>',from=myName();
 h+='<label class="f"><b>Hand over to</b><select class="t" id="handoverTarget">'+ROLES.filter(function(r){return r.id!==L.role&&HANDOVER_ROLES.indexOf(r.id)>=0;}).map(function(r){return '<option value="'+r.id+'"'+(r.id===defaultHandoverRole()?' selected':'')+'>'+esc(r.name+(whoFor(r.id)?' · '+whoFor(r.id):''))+'</option>';}).join('')+'</select></label><button class="btn" id="handoverSend"'+(!from?' disabled':'')+'>My part is complete → hand over</button><p class="saved">The recipient accepts the floor. This does not advance the live agenda or stop a running timer.</p>';
 h+=S.handovers.slice().reverse().slice(0,8).map(function(x){return '<div class="wcard">'+esc(x.by+' ('+roleName(x.fromRole)+') → '+roleName(x.toRole)+(x.toName?' · '+x.toName:'')+' · '+clock(x.at)+' · '+x.state)+(x.state==='pending'&&L.role===x.toRole&&(!x.toName||nkey(myName())===nkey(x.toName))?'<button class="btn sm" data-handover-accept="'+esc(x.id)+'">Accept floor</button>':'')+(x.state==='pending'&&nkey(myName())===nkey(x.by)?'<button class="linkbtn" data-handover-cancel="'+esc(x.id)+'">Cancel</button>':'')+'</div>';}).join('');return h+'</section>';
}
function downloadReferencePack(){
 var body=ROLES.map(function(r){return guidePageHTML(r.id);}).join('');
 var html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Speechcraft offline role reference pack</title><style>body{font:16px/1.5 system-ui;margin:2rem;max-width:960px}img{max-width:140px;max-height:70px}.gpage{break-before:page;margin:2rem 0;border-top:1px solid #aaa}a{overflow-wrap:anywhere}h2,h4{color:#004165}@media print{body{margin:0}}</style><h1>Speechcraft offline role reference pack</h1><p>Generated '+esc(todayISO())+' · version '+esc(APP_VERSION)+'. Original portal summaries are available offline. Official manuals are linked for reference and are not reproduced in this pack. External links require internet; obtain permitted personal copies from the publisher before your meeting.</p>'+body+'</html>';
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download='Speechcraft-offline-role-pack-'+todayISO()+'.html';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1000);
}
ROLE_GUIDE.keynote={what:'Delivers an educational presentation or keynote, separate from prepared speeches.',before:['Agree the topic, objectives, duration and introduction with the Toastmaster.','Prepare materials and check equipment.'],during:['Deliver the presentation within the agreed time.','Hand control back to the Toastmaster.'],after:['Share the agreed materials and receive feedback.'],app:['Enter topic, objectives, introduction and a materials reference.','Queue the presentation for the Timer.']};
ROLE_DOCS.keynote=[['Official: Meeting Speaker (general guidance)',ROLE_DOC_ROOT+'membership/club-meeting-roles/meeting-speaker'],['Official: Speechcraft overview',ROLE_DOC_ROOT+'education/speechcraft']];
TIPS.keynote=['Agree topic, objectives and duration.','Add your introduction and materials reference.','Queue the presentation for the Timer and return control to TMOD.'];
ROLE_GUIDE.ge.app.push('Record observations against specific agenda items; create and track follow-up actions.');

(function(){
 document.getElementById('repPick').addEventListener('click',function(e){if(e.target.closest('[data-reference-pack]'))downloadReferencePack();});
 var V=document.getElementById('view'),draftKeys=['geObservationText','geAgendaItem','geObservationKind','actionText','actionOwner','actionDue'];
 V.addEventListener('input',function(e){if(draftKeys.indexOf(e.target.id)>=0){
   var draft=workflowDraft();
   draft[e.target.id]=e.target.value;
   if(e.target.id==='geObservationText'){
    draft.geAgendaItem=document.getElementById('geAgendaItem').value;
    draft.geObservationKind=document.getElementById('geObservationKind').value;
   }
   saveL();
  }if(e.target.dataset.keynote&&(L.role==='keynote'||L.role==='coord'&&coordUnlocked()))updatePresentationField(e.target.dataset.keynote,e.target.value);});
 V.addEventListener('change',function(e){
  var id=e.target.id;if(draftKeys.indexOf(id)>=0){workflowDraft()[id]=e.target.value;saveL();}
  if(id==='actionFilter'){L.actionFilter=e.target.value;saveL();renderAll();}
  if(id==='keynoteItem'){workflowDraft().keynoteItem=e.target.value;saveL();renderAll();}
  if(e.target.dataset.keynote==='kminutes'){var it=selectedPresentationItem(),p=it&&presentationOf(it.id);if(p){['g','a'].forEach(function(k){var el=V.querySelector('[data-keynote="'+(k==='g'?'kgreen':'kamber')+'"]');if(el)el.value=p.lim[k]/60;});}}
 });
 V.addEventListener('click',function(e){
  var t=e.target;if(t.closest('#keynoteQueue')&&(L.role==='keynote'||L.role==='coord'&&coordUnlocked())){queueKeynote();return;}
  var ho=t.closest('[data-handover-accept],[data-handover-cancel]');if(ho){var id=ho.dataset.handoverAccept||ho.dataset.handoverCancel,x=S.handovers.find(function(o){return o.id===id;});if(!x||x.state!=='pending')return;if(ho.dataset.handoverAccept&&L.role===x.toRole&&(!x.toName||nkey(myName())===nkey(x.toName))){x.state='accepted';x.acceptedBy=myName();x.acceptedAt=now();}else if(ho.dataset.handoverCancel&&nkey(myName())===nkey(x.by)){x.state='cancelled';}else return;tick(x);commit();return;}
  if(t.closest('#handoverSend')&&myName()){var target=document.getElementById('handoverTarget').value,c=curItem(),existing=S.handovers.find(function(x){return x.state==='pending'&&x.fromRole===L.role&&nkey(x.by)===nkey(myName());});if(existing){alert('Your previous handover is still pending. Cancel it or ask the recipient to accept.');return;}S.handovers.push({id:uid(),fromRole:L.role,toRole:target,toName:whoFor(target),by:myName(),itemId:c.cur?c.cur.id:'',at:now(),state:'pending',ord:maxOrd(S.handovers)+1,u:now()});commit();return;}
  if(L.role!=='ge'&&!(L.role==='coord'&&coordUnlocked()))return;
  if(t.closest('#geObservationAdd')){var it=S.agenda.items.find(function(i){return i.id===document.getElementById('geAgendaItem').value;}),note=document.getElementById('geObservationText').value.trim();if(!it){alert('Choose an existing agenda item.');return;}if(!note)return;delete workflowDraft().geObservationText;saveL();S.geobs.push({id:uid(),itemId:it.id,itemLabel:it.text,role:arole(it.role).n,who:whoFor(it.role),kind:document.getElementById('geObservationKind').value,note:note,at:now(),by:myName(),ord:maxOrd(S.geobs)+1,u:now()});commit();return;}
  var oa=t.closest('[data-observation-action]');if(oa){var o=S.geobs.find(function(x){return x.id===oa.dataset.observationAction;});if(o)addWorkflowAction(o.note,o.who,S.agenda.next,o.id);return;}
  var rem=t.closest('[data-observation-remove]');if(rem){removeItem(['geobs'],rem.dataset.observationRemove,'Observation');return;}
  if(t.closest('#actionCancel')){clearActionDraft();renderAll();return;}
  if(t.closest('#actionAdd')){var d=workflowDraft(),editing=S.actions.find(function(a){return a.id===d.actionEdit;}),text=document.getElementById('actionText').value.trim(),owner=document.getElementById('actionOwner').value,due=document.getElementById('actionDue').value;if(!text)return;if(editing){editing.text=text;editing.owner=owner;editing.due=due;tick(editing);clearActionDraft();commit();}else addWorkflowAction(text,owner,due);return;}
  var ae=t.closest('[data-action-edit]');if(ae){editWorkflowAction(S.actions.find(function(a){return a.id===ae.dataset.actionEdit;}));return;}
  var at=t.closest('[data-action-toggle]');if(at){var a=S.actions.find(function(x){return x.id===at.dataset.actionToggle;});if(a){a.state=a.state==='done'?'open':'done';tick(a);commit();}return;}
  var ar=t.closest('[data-action-archive]');if(ar){var a=S.actions.find(function(x){return x.id===ar.dataset.actionArchive;});if(a){a.archived=!a.archived;tick(a);commit();}}
 });
})();
