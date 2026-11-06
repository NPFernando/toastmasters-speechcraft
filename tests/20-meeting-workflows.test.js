const T=require('./lib'),fs=require('fs'),os=require('os'),path=require('path');
const read=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('speechcraftMeeting.v2')));
module.exports=async b=>{
 const E=await T.device(b);await T.solo(E,'Presenter',['keynote']);
 await E.fill('[data-keynote="ktopic"]','Useful feedback');await E.fill('[data-keynote="kobjective"]','Give actionable feedback');await E.fill('[data-keynote="kminutes"]','15');await E.click('#keynoteQueue');
 let s=await read(E);T.assert.equal(s.rows.ps.length,1);T.assert.equal(s.rows.ps[0].lim.r,900);T.assert.match(s.rows.ps[0].ak,/^keynote:/);
 // Change through the public role selector.
 await E.click('#homeBtn');await E.click('#wChange');await T.pickWho(E,'Evaluator',['ge']);
 await E.fill('#geObservationText','Introduction was clear');await E.click('#geObservationAdd');
 T.assert.equal((await read(E)).geobs.length,1);await E.click('[data-observation-action]');T.assert.equal((await read(E)).actions.length,1);
 await E.click('[data-action-toggle]');T.assert.equal((await read(E)).actions[0].state,'done');
 await E.selectOption('#handoverTarget','tmod');await E.click('#handoverSend');T.assert.equal((await read(E)).handovers[0].state,'pending');
 await E.click('#homeBtn');await E.click('#wChange');await T.pickWho(E,'Host',['tmod']);await E.click('[data-handover-accept]');T.assert.equal((await read(E)).handovers[0].state,'accepted');
 // Follow-up actions survive a new meeting, observations and handovers do not.
 await E.evaluate(()=>document.getElementById('newMeeting').click());s=await read(E);T.assert.equal(s.actions.length,1);T.assert.equal(s.geobs.length,0);T.assert.equal(s.handovers.length,0);
 await E.evaluate(()=>document.getElementById('guidesBtn').click());const [dl]=await Promise.all([E.waitForEvent('download'),E.click('[data-reference-pack]')]);
 const f=path.join(os.tmpdir(),'sc-offline-'+Date.now()+'.html');await dl.saveAs(f);const html=fs.readFileSync(f,'utf8');T.assert(html.includes('Educational Presenter / Keynote'));T.assert(html.includes('Official manuals are linked'));fs.unlinkSync(f);
 // Two phones claiming the same voting name share one ballot per category.
 const C=await T.device(b);const code=await T.host(C,'Coordinator',['coord']);await T.setCoordPin(C);await T.addMembers(C,['Voter','Candidate']);
 await C.fill('[data-rpadd-in=speakers]','Candidate');await C.click('[data-rpadd=speakers]');
 const G=await T.device(b),G2=await T.device(b);await T.join(G,code,'Evaluator',['ge']);await T.join(G2,code,'Evaluator',['ge']);
 await Promise.all([G.fill('[data-ge="good"]','Warm welcome'),G2.fill('[data-ge="improve"]','Clearer handovers')]);
 await T.eventually(async()=>{const a=await read(G),b=await read(G2);return a.genotes.good==='Warm welcome'&&a.genotes.improve==='Clearer handovers'&&b.genotes.good==='Warm welcome'&&b.genotes.improve==='Clearer handovers';},'independent GE fields merge');
 await G.click('[data-vote-set="open"]');
 const A=await T.device(b),B=await T.device(b);await T.join(A,code,'Voter',['member']);await T.join(B,code,'Voter',['member']);
 await A.click('#voteBar');const voterId=(await read(C)).members.list.find(m=>m.name==='Voter').id;await A.selectOption('#voterIdentity','member:'+voterId);await A.click('[data-vcat="ps"]');
 await T.eventually(async()=>(await read(B)).votes.length===1,'first ballot syncs');
 await B.click('#voteBar');await B.selectOption('#voterIdentity','member:'+voterId);await B.click('[data-vcat="ps"]'); // toggles the same person's choice off
 await T.eventually(async()=>(await read(A)).votes.length===1&&(await read(A)).votes[0].choice==='', 'second device edits same ballot');
 await B.click('[data-vcat="ps"]');await T.eventually(async()=>(await read(A)).votes[0].choice==='Candidate','same ballot restored');
 s=await read(A);T.assert.equal(s.votes[0].participantId,'member:'+voterId);T.assert.equal(s.votes.length,1);
 T.noErrors(E,C,G,G2,A,B);
};
