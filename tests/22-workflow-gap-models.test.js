const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
module.exports=async()=>{
 const el={addEventListener(){},scrollIntoView(){}};
 const c={localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>el},console,confirm:()=>true,alert:()=>{}};vm.createContext(c);
 const read=p=>fs.readFileSync(path.join(__dirname,'../src/js',p),'utf8');vm.runInContext(read('core/config.js').replace('(function(){',''),c);
 for(const p of ['core/helpers.js','agenda/agenda.js','core/state.js','core/merge.js','core/field-sync.js','roles/shared.js'])vm.runInContext(read(p),c);
 c.ROLE_GUIDE={ge:{app:[]}};c.ROLE_DOCS={};c.ROLE_DOC_ROOT='https://www.toastmasters.org/';c.TIPS={};c.renderAll=()=>{};c.commit=()=>{};c.commitQuiet=()=>{};c.curItem=()=>({cur:null,its:[],i:-1});c.isSkipped=()=>false;c.roleName=x=>x;c.ROLES=c.ROLES;
 vm.runInContext(read('features/meeting-workflows.js'),c);
 c.S=c.blank();c.L={role:'tmod'};assert.equal(c.defaultHandoverRole(),'president');
 c.curItem=()=>({cur:{role:'tmod'},its:[{role:'tmod'},{id:'skip',role:'keynote'},{id:'end',role:'president'}],i:0});c.isSkipped=id=>id==='skip';assert.equal(c.defaultHandoverRole(),'president');
 c.workflowDraft().geAgendaItem='d2';c.workflowDraft().geObservationKind='improve';c.workflowDraft().geObservationText='Keep me';assert(c.geAgendaHTML().includes('value="d2" selected'));assert(c.geAgendaHTML().includes('value="improve" selected'));c.S.mid='next-meeting';assert.deepStrictEqual(JSON.parse(JSON.stringify(c.workflowDraft())),{});
 c.addWorkflowAction('Fix introduction','Owner','2000-01-01','obs1');c.addWorkflowAction('Fix introduction','Owner','2000-01-01','obs1');assert.equal(c.S.actions.length,1);assert(c.actionOverdue(c.S.actions[0]));c.S.actions[0].archived=true;assert(!c.actionOverdue(c.S.actions[0]));
 const limit=c.presentationLimits(1);assert(limit.g>0&&limit.g<limit.a&&limit.a<limit.r);assert(c.validPresentationLimits(limit));assert(!c.validPresentationLimits({g:0,a:0,r:60}));assert(!c.validPresentationLimits({g:60,a:30,r:90}));
 c.S=c.blank();c.S.agenda.items=[{id:'edu1',role:'keynote',time:'17:30',ord:1},{id:'edu2',role:'keynote',time:'18:00',ord:2}];c.L={};c.editablePresentation('edu1').topic='First';c.editablePresentation('edu2').topic='Second';assert.equal(c.S.presentations.length,2);assert.equal(c.presentationOf('edu1').topic,'First');assert.equal(c.presentationOf('edu2').topic,'Second');
 c.S.members.list=[{id:'one',name:'Alex'},{id:'two',name:'Alex'}];c.L.voterId='member:one';const id=c.voteIdentity();c.S.members.list[0].name='Alex corrected';assert.equal(c.voteIdentity(),id);c.L.voterId='member:two';assert.notEqual(c.voteIdentity(),id);
 c.S.votes=[{id:'old',voter:'person:alex',cat:'ps',choice:'Candidate',u:1}];assert.equal(c.legacyBallots().length,1);c.startVotingRound();assert.equal(c.effectiveVotes().length,0);assert.equal(c.S.votes.length,1);
 const normalized=c.normalize({voterPeople:[null,{id:'guest:x',name:'Alex'}],actions:[null]});assert.equal(normalized.voterPeople.length,1);assert.equal(normalized.actions.length,0);
 console.log('Handover defaults, meeting drafts, action deduplication, signal validation, presentation separation and stable voting IDs passed');
};
