/* ---------- home, about and clean-up ---------- */
var APP_VERSION="3.11.1 · November 2026";
function aboutHTML(){
  var on=!!NET.mode, coord=L.role==="coord";
  return '<div class="finhead"><h2 class="sec" style="margin:0">ℹ️ About</h2><button class="btn ghost" id="aboutClose">Close</button></div>'+
  '<p style="margin:8px 0 4px"><b>Speechcraft Portal</b> for <b>Dijital Team Colombo</b> · Toastmasters Speechcraft</p>'+
  '<div class="saved">Version '+APP_VERSION+'</div>'+
  '<p class="note">One page for every meeting role: Coordinator, Toastmaster, General Evaluator, Timer, Table Topics Master, Round Robin Master, Ah-Counter, Grammarian, evaluators, speakers and members. Devices connect with a 6-letter meeting code.</p>'+
  '<ul class="note" style="padding-left:18px;margin:4px 0">'+
   '<li>Your data is saved in this browser. There is no server and no account.</li>'+
   '<li>Devices talk to each other directly over an encrypted connection; the meeting code is the key.</li>'+
   '<li>Speaker feedback is encrypted so only that speaker can read it.</li>'+
   '<li>Works on phones and laptops. Use <b>📱 Open on phone</b> to move your role across.</li>'+'<li>Install it: <b>⋯ More → 📲 Install as an app</b> (Android, Chrome, Edge), or in Safari tap Share → <b>Add to Home Screen</b>.</li></ul>'+
  '<div class="saved" style="margin-bottom:4px">Found a problem or have an idea? <b>⋯ More → 💬 Report a problem or idea</b>. Before a first meeting, run the <a href="https://github.com/NPFernando/toastmasters-speechcraft/blob/main/docs/DRY-RUN.md" target="_blank" rel="noopener">15-minute dry run</a>.</div><div class="saved">Source and help: <a href="https://github.com/NPFernando/toastmasters-speechcraft" target="_blank" rel="noopener">github.com/NPFernando/toastmasters-speechcraft</a></div>'+
  '<h3 style="margin:16px 0 0">🧹 Clean up</h3><div class="saved">Use these after a practice run or test.</div><div class="abtgrid">'+
   '<div class="abtrow"><div><b>Start the next meeting</b><div class="saved">Use <b>⋯ More → 🆕 New meeting</b>: it clears this week\'s speakers, times, topics, counts and votes and keeps members, PIN and settings.</div></div></div>'+
   '<div class="abtrow danger"><div><b>Reset this device</b><div class="saved">Deletes everything this browser has saved: meeting, member list, Coordinator PIN, your role, drafts, feedback keys, feedback history and progress records'+(on?'. Leaves the meeting first; the other devices keep their data':'')+'. Save the meeting record first if you might need it.</div></div><button class="btn" id="cleanDevice" style="color:var(--r)">Reset device</button></div>'+
  '</div>'+(coord?'<div class="note" style="margin-top:8px">To remove test members, use ✕ next to each name in the Coordinator member list. To clear test data on every device, start a new meeting code after everyone resets.</div>':'');
}
function openAbout(){ document.getElementById("aboutBox").innerHTML=aboutHTML(); document.getElementById("aboutModal").classList.add("on"); }
function closeAbout(){ document.getElementById("aboutModal").classList.remove("on"); }
document.getElementById("homeBtn").addEventListener("click",function(){ closeAbout(); openWelcome("connect"); });
document.getElementById("homeMi").addEventListener("click",function(){ closeAbout(); openWelcome("connect"); });
document.querySelector(".brand h1").addEventListener("click",function(){ openWelcome("connect"); });
document.getElementById("aboutBtn").addEventListener("click",openAbout);
document.getElementById("aboutModal").addEventListener("click",function(e){
  var t=e.target;
  if(t.id==="aboutModal"||t.closest("#aboutClose")){ closeAbout(); return; }
  if(t.closest("#cleanDevice")){
    if(!confirm("Reset this device?\n\nEverything saved in this browser for this app is deleted: the meeting, member list, Coordinator PIN, your role, drafts and feedback keys."+(NET.mode?"\n\nThis device leaves the meeting. The other devices keep their data.":""))) return;
    if(!confirm("Are you sure? This can't be undone.")) return;
    resetting=true; try{ stopNet(true); }catch(err){}
    [KEY,LKEY,OLDKEY,OLDNAMES,FKEY,PKEY].forEach(function(k){ try{ localStorage.removeItem(k); }catch(err){} });
    resetting=true; S=blank(); L={role:"timer"};
    location.replace(location.pathname+location.search);
  }
});
document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&document.getElementById("aboutModal").classList.contains("on")) closeAbout(); });

