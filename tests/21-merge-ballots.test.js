const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
module.exports=async()=>{
 const c={localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>({})},console};vm.createContext(c);
 const read=p=>fs.readFileSync(path.join(__dirname,'../src/js',p),'utf8');
 vm.runInContext(read('core/config.js').replace('(function(){',''),c);
 for(const p of ['core/helpers.js','agenda/agenda.js','core/state.js','core/merge.js','core/field-sync.js','roles/shared.js'])vm.runInContext(read(p),c);
 const clone=x=>JSON.parse(JSON.stringify(x));
 let a=c.blank(),b=clone(a);a.genotes={good:'Warm welcome',improve:'',fu:{good:100,improve:0},u:100};b.genotes={good:'',improve:'Clear introductions',fu:{good:0,improve:100},u:100};
 c.mergeGENotes(a,b);assert.equal(a.genotes.good,'Warm welcome');assert.equal(a.genotes.improve,'Clear introductions');
 let left=c.blank(),right=clone(left);left.genotes={good:'A',fu:{good:42},u:42};right.genotes={good:'B',fu:{good:42},u:42};const l=clone(left),r=clone(right);c.mergeGENotes(left,right);c.mergeGENotes(r,l);assert.deepStrictEqual(clone(left.genotes),clone(r.genotes));
 c.S=c.blank();c.S.votes=[{id:'v|ps|one',voter:'person:alex',cat:'ps',choice:'Candidate',u:1},{id:'v|ps|two',voter:'person:alex',cat:'ps',choice:'Other',u:2}];assert.equal(c.tally('ps').list.length,1);assert.equal(c.tally('ps').winners[0].name,'Other');assert.equal(c.votersCount(),1);
 c.S.rows.ps=[{id:'educational',name:'Educator – Educational presentation',ak:'keynote:123'}];assert.equal(c.preparedSpeakers().length,0);
 a=c.blank();b=clone(a);a.actions=[{id:'a',text:'Follow up',u:1,ord:1}];b.actions=[{id:'b',text:'Other',u:2,ord:2}];c.mergeInto(a,b);assert.equal(a.actions.length,2);
 const legacy=c.normalize({genotes:{good:'Legacy',improve:'Keep this',u:100}});assert.equal(legacy.genotes.fu.improve,100);assert(Array.isArray(legacy.actions));assert(Array.isArray(legacy.geobs));
 console.log('Independent GE merge, equal-clock convergence, ballot deduplication, action merge and legacy normalization passed');
};
