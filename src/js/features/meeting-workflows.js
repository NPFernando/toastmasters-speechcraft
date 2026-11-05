/* Educational presentation, agenda observations, persistent actions and explicit handovers. */
function workflowField(key,label,value,type){return '<label class="f evbox"><b>'+esc(label)+'</b><input class="t" type="'+(type||'text')+'" data-keynote="'+key+'" value="'+esc(value||'')+'"></label>';}
function keynoteHTML(){
 var a=S.agenda, row=S.rows.ps.find(function(r){return r.ak==='keynote:'+S.mid;});
 return '<section class="card"><h2>🌟 Educational Presenter / Keynote</h2><p class="muted">Shared with the Toastmaster and Coordinator. This presentation is separate from prepared-speech awards.</p>'+workflowField('ktopic','Topic',a.ktopic)+workflowField('kobjective','Learning objectives',a.kobjective)+workflowField('kintro','Introduction for the Toastmaster',a.kintro)+workflowField('kmaterials','Materials link or reference',a.kmaterials)+workflowField('kminutes','Target minutes (1–180)',a.kminutes||20,'number')+'<button class="btn" id="keynoteQueue">Queue presentation for Timer</button>'+(row?'<p>Timer: '+esc(rowState(row))+(elapsed(row,now())!=null?' · '+fmt(elapsed(row,now())):'')+'</p>':'')+'</section>';
}
function queueKeynote(){
 var name=myName()||assigned('keynote');if(!name){alert('Enter your name first.');return;}
 var mins=Number(S.agenda.kminutes||20);if(!Number.isFinite(mins)||mins<1||mins>180){alert('Use a target of 1–180 minutes.');return;}
 var ak='keynote:'+S.mid,r=S.rows.ps.find(function(x){return x.ak===ak;});
 if(r&&rowState(r)!=='idle'){alert('The presentation is already timed or running.');return;}
 if(!r){r=newRow('ps',name+' – Educational presentation');r.ak=ak;S.rows.ps.push(r);}
 r.name=name+' – Educational presentation';r.lim={g:Math.max(0,mins*60-120),a:Math.max(0,mins*60-60),r:mins*60};tick(r);commit();
}
function geAgendaHTML(){
 var h='<section class="card"><h2>Agenda observations</h2><label class="f"><b>Agenda item</b><select class="t" id="geAgendaItem">'+itemsSorted().map(function(it){return '<option value="'+esc(it.id)+'"'+(S.run.cur===it.id?' selected':'')+'>'+esc(fmtHM(it.time)+' · '+arole(it.role).n+' · '+it.text)+'</option>';}).join('')+'</select></label><label class="f"><b>Type</b><select class="t" id="geObservationKind"><option value="commend">Commendation</option><option value="improve">Improvement</option></select></label><label class="f"><b>Evidence / suggestion</b><textarea class="t" id="geObservationText"></textarea></label><button class="btn" id="geObservationAdd">Save observation</button>';
 h+=S.geobs.map(function(o){return '<div class="wcard"><b>'+esc(o.itemLabel)+'</b><div>'+esc(o.kind+' · '+o.role+' · '+(o.who||'Unassigned')+' · '+clock(o.at))+'</div><p>'+esc(o.note)+'</p><button class="btn sm" data-observation-action="'+esc(o.id)+'">Create follow-up action</button><button class="linkbtn" data-observation-remove="'+esc(o.id)+'">Remove</button></div>';}).join('');return h+'</section>';
}
function actionsHTML(){
 var edit=L.role==='ge'||(L.role==='coord'&&coordUnlocked());
 var h='<section class="card"><h2>Follow-up actions</h2><p class="muted">Actions stay across meetings. Shared meeting data; exclude private feedback.</p>';
 if(edit)h+='<label class="f"><b>Action</b><input class="t" id="actionText"></label><label class="f"><b>Owner</b><input class="t" id="actionOwner" list="roster"></label><label class="f"><b>Target meeting date</b><input class="t" type="date" id="actionDue"></label><button class="btn" id="actionAdd">Add action</button>';
 h+=S.actions.map(function(a){return '<div class="wcard"><b>'+esc(a.text)+'</b><div>'+esc((a.owner||'Unassigned')+' · '+(a.due||'No target date')+' · '+(a.state||'open'))+'</div>'+(edit?'<button class="btn sm" data-action-toggle="'+esc(a.id)+'">'+(a.state==='done'?'Reopen':'Mark complete')+'</button>':'')+'</div>';}).join('');return h+'</section>';
}
function addWorkflowAction(text,owner,due,source){if(!String(text||'').trim())return;S.actions.push({id:uid(),text:String(text).trim(),owner:owner||'',due:due||'',state:'open',source:source||'',meeting:S.mid,ord:maxOrd(S.actions)+1,u:now()});commit();}
function workflowReportLines(){
 var out=S.geobs.map(function(o){return 'Agenda observation — '+o.itemLabel+' — '+o.role+(o.who?' ('+o.who+')':'')+' at '+clock(o.at)+': '+o.note;});
 S.actions.forEach(function(a){out.push('Action ['+(a.state||'open')+']: '+a.text+' — '+(a.owner||'Unassigned')+'; target '+(a.due||'not set'));});
 return out;
}
function defaultHandoverRole(){if(['timer','ah','gram','seval','tteval'].indexOf(L.role)>=0)return 'ge';if(L.role==='president')return 'tmod';return 'tmod';}
function handoverHTML(){
 var h='<section class="card"><h2>Hand over the floor</h2>',from=myName();
 h+='<label class="f"><b>Hand over to</b><select class="t" id="handoverTarget">'+ROLES.filter(function(r){return r.id!==L.role&&['coord','president','tmod','ge','rrm','ttm','keynote'].indexOf(r.id)>=0;}).map(function(r){return '<option value="'+r.id+'"'+(r.id===defaultHandoverRole()?' selected':'')+'>'+esc(r.name+(whoFor(r.id)?' · '+whoFor(r.id):''))+'</option>';}).join('')+'</select></label><button class="btn" id="handoverSend"'+(!from?' disabled':'')+'>My part is complete → hand over</button><p class="saved">The recipient accepts the floor. This does not advance the live agenda or stop a running timer.</p>';
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
 document.getElementById('voteBox').addEventListener('input',function(e){if(e.target.id==='voterName'){L.voterName=e.target.value.trim();saveL();}});
 document.getElementById('repPick').addEventListener('click',function(e){if(e.target.closest('[data-reference-pack]'))downloadReferencePack();});
 var V=document.getElementById('view');
 V.addEventListener('input',function(e){if(e.target.dataset.keynote&&L.role==='keynote'){var k=e.target.dataset.keynote;S.agenda[k]=e.target.value;tick(S.agenda);commitQuiet();}});
 V.addEventListener('click',function(e){
  var t=e.target;
  if(t.closest('#keynoteQueue')&&L.role==='keynote'){queueKeynote();return;}
  var ho=t.closest('[data-handover-accept],[data-handover-cancel]');if(ho){var id=ho.dataset.handoverAccept||ho.dataset.handoverCancel,x=S.handovers.find(function(o){return o.id===id;});if(!x||x.state!=='pending')return;if(ho.dataset.handoverAccept&&L.role===x.toRole&&(!x.toName||nkey(myName())===nkey(x.toName))){x.state='accepted';x.acceptedBy=myName();x.acceptedAt=now();}else if(ho.dataset.handoverCancel&&nkey(myName())===nkey(x.by)){x.state='cancelled';}else return;tick(x);commit();return;}
  if(t.closest('#handoverSend')&&myName()){
   var target=document.getElementById('handoverTarget').value, c=curItem(),existing=S.handovers.find(function(x){return x.state==='pending'&&x.fromRole===L.role&&nkey(x.by)===nkey(myName());});if(existing){alert('Your previous handover is still pending. Cancel it or ask the recipient to accept.');return;}
   S.handovers.push({id:uid(),fromRole:L.role,toRole:target,toName:whoFor(target),by:myName(),itemId:c.cur?c.cur.id:'',at:now(),state:'pending',ord:maxOrd(S.handovers)+1,u:now()});commit();return;
  }
  if(L.role!=='ge'&&!(L.role==='coord'&&coordUnlocked()))return;
  if(t.closest('#geObservationAdd')){var it=S.agenda.items.find(function(i){return i.id===document.getElementById('geAgendaItem').value;}),note=document.getElementById('geObservationText').value.trim();if(!it||!note)return;S.geobs.push({id:uid(),itemId:it.id,itemLabel:it.text,role:arole(it.role).n,who:whoFor(it.role),kind:document.getElementById('geObservationKind').value,note:note,at:now(),by:myName(),ord:maxOrd(S.geobs)+1,u:now()});commit();return;}
  var oa=t.closest('[data-observation-action]');if(oa){var o=S.geobs.find(function(x){return x.id===oa.dataset.observationAction;});if(o)addWorkflowAction(o.note,o.who,S.agenda.next,o.id);return;}
  var rem=t.closest('[data-observation-remove]');if(rem){removeItem(['geobs'],rem.dataset.observationRemove,'Observation');return;}
  if(t.closest('#actionAdd')){addWorkflowAction(document.getElementById('actionText').value,document.getElementById('actionOwner').value,document.getElementById('actionDue').value);return;}
  var at=t.closest('[data-action-toggle]');if(at){var a=S.actions.find(function(x){return x.id===at.dataset.actionToggle;});if(a){a.state=a.state==='done'?'open':'done';tick(a);commit();}}
 });
})();
