/* ---------- Stage 2: evaluators, General Evaluator, voting, Round Robin, members ---------- */
var MULTI_ROLES={seval:1,tteval:1,member:1,speaker:1};
function myName(){ if(L.role==="keynote") return S.people.keynote||assigned("keynote")||L.me||""; if(L.role==="coord"){ var mc=myCo(); if(mc) return mc.name; } return MULTI_ROLES[L.role] ? ((L.myNames||{})[L.role]||L.me||"") : (S.people[L.role]||""); }
function setMyName(v){ if(L.role==="coord"&&myCo()){ var mc=myCo(); mc.name=String(v||"").trim()||mc.name; tick(mc); commitQuiet(); return; } return setMyName0(v); }
function setMyName0(v){
  if(v) L.me=v;
  if(MULTI_ROLES[L.role]){ L.myNames=L.myNames||{}; L.myNames[L.role]=v; saveL(); renderRoles(); NET.hello(); }
  else { S.people[L.role]=v; S.peopleU[L.role]=Math.max(now(),(S.peopleU[L.role]||0)+1); commitQuiet(); }
}
function devId(){ if(!L.devId){ L.devId=uid(); saveL(); } return L.devId; }
function nkey(n){ return String(n||"").trim().toLowerCase(); }
function uniq(arr){ var s={},o=[]; arr.forEach(function(n){ n=String(n||"").trim(); if(!n) return; var k=nkey(n); if(!s[k]){ s[k]=1; o.push(n); } }); return o; }
function baseName(n){ return String(n||"").split(" – ")[0].trim(); }
function upsert(path,id,init){ var arr=getColl(S,path), x=arr.find(function(e){return e.id===id;}); if(!x){ x=Object.assign({id:id,ord:maxOrd(arr)+1,u:now()},init||{}); delete S.dead[id]; arr.push(x); } return x; }

/* who can be voted for / evaluated */
function preparedSpeakers(){ return uniq(asList("speakers").concat(S.rows.ps.filter(function(r){ return !r.ak||r.ak.indexOf("ps:")===0; }).map(function(r){ return baseName(r.name); }))); }
function ttSpeakers(){ return uniq(S.topics.filter(function(t){return t.used;}).map(function(t){return t.speaker;}).concat(S.rows.tt.filter(function(r){return rowState(r)!=="idle";}).map(function(r){return baseName(r.name);}))); }
function evaluatorNames(){ return uniq(asList("sevals").concat(asList("ttevals")).concat(S.evals.map(function(e){return e.by;}))); }
function rolePlayerList(){
  var out=[], seen={};
  ["tmod","ge","ttm","rrm","timer","ah","gram"].forEach(function(k){
    var n=assigned(k)||S.people[k]; if(!n) return; var key=nkey(n);
    if(seen[key]){ seen[key].roles.push(arole(k).n); return; }
    seen[key]={name:n,roles:[arole(k).n]}; out.push(seen[key]);
  });
  return out;
}
var VCATS=[
  {k:"ps",n:"Best Prepared Speaker",c:function(){ return preparedSpeakers().filter(awardEligible).map(function(n){return {name:n};}); }},
  {k:"tt",n:"Best Table Topics Speaker",c:function(){ return ttSpeakers().filter(awardEligible).map(function(n){return {name:n};}); }},
  {k:"ev",n:"Best Evaluator",c:function(){ return evaluatorNames().filter(awardEligible).map(function(n){return {name:n};}); }},
  {k:"role",n:"Best Role Player",c:function(){ return rolePlayerList().filter(function(p){return awardEligible(p.name);}).map(function(p){return {name:p.name,sub:p.roles.join(", ")};}); }}
];
function votingPeople(){
 var list=S.members.list.map(function(m){return {id:'member:'+m.id,name:m.name,label:m.club||'Member'};});
 return list.concat(S.voterPeople.filter(function(p){return !p.archived;}).map(function(p){return {id:p.id,name:p.name,label:p.label||'Guest / participant'};}));
}
function voterKey(id){return 'participant:'+encodeURIComponent(id);}
function voteIdentity(){var id=L.voterId||'';return votingPeople().some(function(p){return p.id===id;})?id:'';}
function votingRound(){return S.vote.round||'initial';}
function currentBallots(){return S.votes.filter(function(v){return (v.round||'initial')===votingRound();});}
function legacyBallots(){return currentBallots().filter(function(v){return !v.participantId;});}
function effectiveVotes(){var by={};currentBallots().forEach(function(v){var key=(v.participantId||v.voter||v.id.split('|').slice(2).join('|'))+'|'+v.cat,old=by[key];if(!old||v.u>old.u||(v.u===old.u&&v.id>old.id))by[key]=v;});return Object.keys(by).map(function(k){return by[k];});}
function myVote(cat){var id=voteIdentity();if(!id)return '';var v=effectiveVotes().find(function(x){return x.cat===cat&&x.participantId===id;});return v?v.choice:'';}
function castVote(cat,choice){
 if(S.vote.state!=='open'||!VCATS.some(function(c){return c.k===cat&&c.c().some(function(n){return nkey(n.name)===nkey(choice);});}))return;
 var who=voteIdentity();if(!who){alert('Select your participant identity before voting.');return;}
 if(legacyBallots().length){alert('Older ballots use names or devices. Ask the General Evaluator to start a new voting round.');return;}
 var key=voterKey(who),round=votingRound(),id='v|'+round+'|'+cat+'|'+key,v=upsert(['votes'],id,{cat:cat,participantId:who,voter:key,round:round,choice:''});
 v.choice=nkey(v.choice)===nkey(choice)?'':choice;tick(v);commit();
}
function tally(cat){var c={};effectiveVotes().forEach(function(v){if(v.cat===cat&&v.choice){var k=nkey(v.choice);c[k]=c[k]||{name:v.choice,n:0};c[k].n++;}});var list=Object.keys(c).map(function(k){return c[k];}).sort(function(a,b){return b.n-a.n;});var top=list.length?list[0].n:0;return {list:list,winners:list.filter(function(x){return x.n===top&&top>0;})};}
function votersCount(){var s={};effectiveVotes().forEach(function(v){if(v.choice)s[v.participantId||v.voter||v.id.split('|').slice(2).join('|')]=1;});return Object.keys(s).length;}
function startVotingRound(){if(!confirm('Start a new voting round? Current results are retained in the meeting record but excluded from the new tally. Everyone must vote again.'))return;S.vote.round=uid();S.vote.state='open';tick(S.vote);commit();}
function voteStateText(){ return {closed:"Voting not open yet",open:"🗳 Voting is open",done:"Voting closed — waiting for the Toastmaster to reveal",shown:"🏆 Winners revealed"}[S.vote.state]||""; }

