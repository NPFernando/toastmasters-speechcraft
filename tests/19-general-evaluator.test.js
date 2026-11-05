const {device,solo,assert,noErrors}=require('./lib');
module.exports=async function(b){
 const p=await device(b,{phone:true}); await solo(p,'Evaluator',['ge']);
 await p.locator('summary').filter({hasText:'Meeting opening'}).click();
 await p.selectOption('[data-ge="check_start"]','partial');
 await p.fill('[data-ge="actualStart"]','17:35'); await p.press('[data-ge="actualStart"]','Tab');
 await p.fill('[data-ge="check_start_note"]','Opened five minutes late'); await p.press('[data-ge="check_start_note"]','Tab');
 // Seed a saved queue entry through the persistence boundary, not private app scope.
 await p.evaluate(()=>{const k='speechcraftMeeting.v2',s=JSON.parse(localStorage.getItem(k)); s.rows.rr.push({id:'handover-test',name:'Speaker <one>',start:null,end:null,manual:null,ord:1,u:Date.now()});localStorage.setItem(k,JSON.stringify(s));});
 await p.reload();
 await p.locator('summary').filter({hasText:'Round Robin word handovers'}).click();
 await p.locator('summary').filter({hasText:'Speaker <one>'}).click();
 await p.fill('[data-ge="rr_handover-test_last"]','garden');
 await p.fill('[data-ge="rr_handover-test_first"]','Garden');
 await p.selectOption('[data-ge="rr_handover-test_result"]','yes');
 await p.click('[data-copyrep="ge"]');
 const text=await p.evaluate(()=>navigator.clipboard.readText());
 assert(text.includes('Opened five minutes late')); assert(text.includes('garden')); assert(text.includes('Actual start: 17:35'));
 await p.click('#geReport');
 await p.check('[data-rep="ge"]');
 assert((await p.locator('#report').textContent()).includes('Opened five minutes late'));
 await p.reload();
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('speechcraftMeeting.v2')).genotes['rr_handover-test_first']),'Garden');
 await p.evaluate(()=>{const k='speechcraftMeeting.v2',s=JSON.parse(localStorage.getItem(k));s.genotes={good:'Existing notes',improve:'',u:1};localStorage.setItem(k,JSON.stringify(s));});
 await p.reload();assert.equal(await p.inputValue('[data-ge="good"]'),'Existing notes');
 noErrors(p);
};
