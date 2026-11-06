/* ---------- first-time tips for each role ---------- */
var TIPS={
  coord:["Set your Coordinator PIN, then add the group's members once; they're remembered every week.","Fill in the role players and agenda. Everyone's screens update, and 📄 Print agenda makes the sheet.","At the end, tap 🏁 Finish meeting, then ⤓ Save meeting record."],
  president:["Your agenda times are at the top; tick each opening step as you go.","Add guests as they arrive (or the Sergeant at Arms will) and welcome them by name.","At the close, the award winners appear here once the Toastmaster reveals the votes."],
  saa:["Work through the 'Before the meeting' list while you set up the room.","Add each guest to the shared guest list; the President sees them straight away.","Tick 'After the meeting' when the room is packed up."],
  tmod:["Tap ▶ Start the meeting when the President hands over; then Next ▶ for each agenda item.","The run-sheet shows if you're on time or behind. Running late? +5 min or ⟳ Next starts now moves the rest of the agenda; you can also move a late item to the end or skip it.","Open and reveal the votes from here at the end. 🎯 Focus shows just Now / Next."],
  ge:["Your evaluation team and who evaluates whom are listed for you.","Call for the Timer, Ah-Counter and Grammarian reports; their results appear here.","Open and close voting, and write your overall notes as the meeting goes."],
  timer:["Plan speakers ahead with + Add to list, or just press Start speaker.","Show green, amber and red as the screen tells you; your phone vibrates at each signal.","Copy report text gives your report. 🎯 Focus shows big Start buttons."],
  ttm:["Add your topics before the meeting, one per line.","Pick or 🎲 randomise a topic, show it on screen, then type who takes it and tap Call speaker.","The Timer gets each speaker's name automatically."],
  rrm:["Add your Round Robin questions before the meeting.","Tap a name to queue them on the Timer (20-second bell).","Show the question on screen with 📺 so everyone can read it."],
  ah:["When the Timer starts someone, their name appears here automatically.","Tap a word each time you hear it.","🎯 Focus gives big buttons with Undo. Copy report text gives your report."],
  gram:["Draft the word, meaning and example, then tap Reveal to everyone when you introduce it.","Tap +1 each time a speaker uses it, and note good phrases and slips.","🎯 Focus gives a big +1 button. Copy report text gives your report."],
  speaker:["Add your speech title and objectives so your evaluator and the Toastmaster can see them.","When the Timer starts you, your screen shows your time and the green / amber / red signal.","Set a feedback PIN so only you can read your evaluation."],
  seval:["Your speaker and their speech title are listed under 'Your speakers'.","Write Commend · Recommend · Commend; it stays a private draft.","Tap Submit when you're done; only the speaker can read it."],
  tteval:["Pick each Table Topics speaker you're evaluating.","Write Commend · Recommend · Commend; it stays a private draft.","Tap Submit when you're done; only the speaker can read it."],
  member:["Tap In person / Online / Can't make it so the Coordinator knows.","Vote when voting opens, and send private notes to speakers.","Set a feedback PIN to read the feedback written for you."]
};
function tipsHTML(){
  var r=L.role, t=TIPS[r]; if(!t||curView()!=="role"||inFocus()) return "";
  L.tipsSeen=L.tipsSeen||{}; if(L.tipsSeen[r]&&!L.tipsOpen) return "";
  return '<section class="card tips"><div class="finhead"><b>💡 '+esc(roleObj(r).name)+' in 3 steps</b><span class="row"><button class="btn sm" data-guide>📘 Full guide</button><button class="btn sm" data-tipsdone>Got it</button></span></div><ol>'+t.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ol></section>';
}
document.getElementById("view").addEventListener("click",function(e){ if(e.target.closest("[data-tipsdone]")){ L.tipsSeen=L.tipsSeen||{}; L.tipsSeen[L.role]=1; L.tipsOpen=false; saveL(); renderAll(); } });
document.getElementById("roles").addEventListener("click",function(e){ if(e.target.closest("[data-tips]")){ L.tipsOpen=true; saveL(); renderAll(); window.scrollTo(0,0); } });
