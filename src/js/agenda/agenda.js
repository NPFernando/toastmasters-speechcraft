/* ---------- agenda, role players, coordinator, toastmaster run-sheet ---------- */
var AROLES=[
  {k:"president",n:"President"},{k:"saa",n:"Sergeant at Arms"},{k:"tmod",n:"Toastmaster of the Day"},{k:"ge",n:"General Evaluator"},
  {k:"ttm",n:"Table Topics Master"},{k:"rrm",n:"Round Robin Master"},{k:"keynote",n:"Educational Presenter / Keynote"},
  {k:"timer",n:"Timer"},{k:"ah",n:"Ah-Counter"},{k:"gram",n:"Grammarian"},
  {k:"speakers",n:"Prepared Speakers",multi:true},{k:"sevals",n:"Speech Evaluators",multi:true},{k:"ttevals",n:"Table Topics Evaluators",multi:true},
  {k:"coord",n:"Speechcraft Coordinator"}
];
var XTRAS=[{k:"",n:"—"},{k:"speakers",n:"List prepared speakers"},{k:"evals",n:"List reports & evaluators"},{k:"keynote",n:"Keynote speaker & topic"},{k:"ttevals",n:"List Table Topics evaluators"}];
var CLUB_MISSION="We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self-confidence and personal growth.";
function defaultItems(){
  return [
    ["17:30","president","Call the meeting to order. National Anthem. Introduce the Toastmaster of the Day and hand over the session.",""],
    ["17:40","tmod","Introduction. Invite the General Evaluator to introduce the team.",""],
    ["17:45","ge","Introduce the Timer (1 min), Ah-Counter (1 min) and Grammarian (2 min). Hand over to the Toastmaster.",""],
    ["17:50","tmod","Introduce the Round Robin Master.",""],
    ["17:52","rrm","Explain and run the Round Robin session. Return control to the Toastmaster.",""],
    ["18:00","keynote","KEYNOTE PRESENTATION — the Toastmaster introduces the keynote speaker.","keynote"],
    ["18:40","tmod","Prepared Speech Session — introduce the speech objectives and the speakers.","speakers"],
    ["18:45","tmod","Introduce the Table Topics Master and hand over the session.",""],
    ["18:47","ttm","Table Topics Session — explain the session and introduce the evaluators (2 min × 3). Return control to the Toastmaster.","ttevals"],
    ["18:55","tmod","Introduce the General Evaluator and hand over the session.",""],
    ["18:57","ge","Evaluation Session — call for reports and evaluations. General comments on the meeting. Return control to the Toastmaster.","evals"],
    ["19:15","tmod","Final remarks and return control to the President.",""],
    ["19:20","president","Closing remarks and adjourn the meeting.",""],
    ["19:30","coord","Discussion with participants on meeting remarks. Call for role players for the next meeting.",""]
  ].map(function(x,i){ return {id:"d"+(i+1),time:x[0],role:x[1],text:x[2],x:x[3],ord:i+1}; });
}
function defaultAgenda(){ return {title:"Dijital Team Batch 4",no:"",venue:"",next:"",ktopic:"",korg:"",assign:{},items:defaultItems(),u:0}; }
function arole(k){ return AROLES.find(function(a){return a.k===k;}); }
function assigned(k){ var v=S.agenda.assign[k]; return Array.isArray(v)?v.filter(Boolean):(v?String(v):""); }
function asList(k){ var v=assigned(k); return Array.isArray(v)?v:(v?[v]:[]); }
function hm2min(t){ var m=String(t||"").match(/^(\d{1,2}):(\d{2})/); return m?(+m[1])*60+(+m[2]):null; }
function fmtHM(t){ var m=hm2min(t); if(m==null) return ""; var h=Math.floor(m/60), mm=m%60; return ((h+11)%12+1)+":"+String(mm).padStart(2,"0")+(h<12?" am":" pm"); }
function itemsSorted(){ return S.agenda.items.slice().sort(function(a,b){ return (hm2min(a.time)||0)-(hm2min(b.time)||0) || a.ord-b.ord; }); }
