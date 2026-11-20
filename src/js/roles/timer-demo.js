/* Demo signals use the meeting's limits and never create a Timer entry. */
var TIMER_DEMO_MS=90000;
function timerDemoSteps(sid){
  var limits=limOf(sid);
  if(sid==="rr") return [{name:"Within time",sec:Math.max(0,limits.b-1),signal:"sg"},{name:"Time’s up · Bell",sec:limits.b,signal:"sr"}];
  return [{name:"Before green",sec:Math.max(0,limits.g-1),signal:""},{name:"Green",sec:limits.g,signal:"sg"},
    {name:"Amber",sec:limits.a,signal:"sa"},{name:"Red",sec:limits.r,signal:"sr"}];
}
function currentTimerDemo(){
  var demo=S.timerDemo, session=sessionOf(demo.sid);
  if(!session||!demo.until||now()>=demo.until||anyRunning()) return null;
  var step=timerDemoSteps(session.id)[demo.step];
  return step?{session:session,step:step,index:demo.step}:null;
}
function timerDemoControls(sid){
  var demo=currentTimerDemo(), active=demo&&demo.session.id===sid;
  return '<section class="card"><div class="row">'+
    '<button class="btn" id="timerDemoStart"'+(anyRunning()?' disabled':'')+'>'+(active?'Restart live demo':'Start live demo')+'</button>'+
    (demo?'<button class="btn" id="timerDemoEnd">End demo</button>':'')+'</div>'+
    (active?'<div class="row" role="group" aria-label="Demo signals">'+timerDemoSteps(sid).map(function(step,index){
      return '<button class="btn sm" data-demo-step="'+index+'" aria-pressed="'+(demo.index===index)+'">'+esc(step.name)+'</button>';
    }).join("")+'</div>':'')+
    '<p class="saved">Demo for '+esc(sessionOf(sid).name)+'. Everyone connected sees the selected signal.</p></section>';
}
function setTimerDemo(sid,step){
  if(L.role!=="timer"||anyRunning()||!sessionOf(sid)||!timerDemoSteps(sid)[step]) return;
  S.timerDemo.sid=sid;
  S.timerDemo.step=step;
  S.timerDemo.until=now()+TIMER_DEMO_MS;
  tick(S.timerDemo);
  commit();
}
function renderTimerDemo(){
  var el=document.getElementById("timerDemoDisplay"), demo=currentTimerDemo();
  var html="";
  if(demo){
    var step=demo.step, session=demo.session;
    html='<div class="card mecard '+(step.signal||"sn")+'"><div class="mehead">Timer demo · '+esc(session.name)+'</div>'+
      '<div class="meclock">'+fmt(step.sec)+'</div><div class="mesig">'+esc(step.name)+'</div>'+
      '<div class="melim">'+esc(limitsLine(session.id))+'</div>'+
      (session.id==="rr"&&step.signal==="sr"?'<button class="btn sm" id="timerDemoBell">Hear demo bell</button>':'')+'</div>';
  }
  if(el.demoMarkup!==html){ el.demoMarkup=html; el.innerHTML=html; renderProj(); }
}
document.getElementById("timerDemoDisplay").addEventListener("click",function(e){
  if(e.target.closest("#timerDemoBell")) ringBell();
});
document.getElementById("view").addEventListener("click",function(e){
  if(L.role!=="timer") return;
  if(e.target.closest("#timerDemoStart")) setTimerDemo(L.tab,0);
  var step=e.target.closest("[data-demo-step]");
  if(step) setTimerDemo(L.tab,Number(step.dataset.demoStep));
  if(e.target.closest("#timerDemoEnd")){ S.timerDemo.until=0; tick(S.timerDemo); commit(); }
});
