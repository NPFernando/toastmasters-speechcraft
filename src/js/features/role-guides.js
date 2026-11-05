/* ---------- printable role guides: one page per role ---------- */
var ROLE_GUIDE={
  coord:{what:"Runs the Speechcraft programme: sets up each meeting, the members and role players, and keeps the records.",
    before:["Add the group’s members once (they’re remembered every week).","Fill in the role players, speakers and their evaluators.","Check the agenda times and print the agenda (📄 Print agenda).","Host the meeting and share the code or QR with everyone."],
    during:["Watch the clashes list for people who can’t come, and reassign roles.","Mark attendance as people arrive.","Invite a co-organiser if someone else is helping you."],
    after:["Lead the discussion and call for next week’s role players.","Tap 🏁 Finish meeting and wait for every role to confirm.","⤓ Save meeting record (keep every week’s file)."],
    app:["Coordinator PIN protects the set-up; keep the recovery code safe.","👥 Co-organisers lets a teammate edit too.","📈 Speechcraft progress shows each member across the 10 weeks."]},
  president:{what:"Opens and closes the meeting and makes members and guests feel welcome.",
    before:["Check your agenda times at the top of your screen.","Prepare a short welcome and any announcements."],
    during:["Call the meeting to order; National Anthem; welcome everyone.","Welcome each guest by name (they’re in the guest list).","Read the club mission and introduce the Toastmaster of the Day."],
    after:["Thank the role players, congratulate the award winners, invite guests to comment.","Announce the next meeting and adjourn."],
    app:["Tick the opening and closing checklists as you go.","Mark guests ✓ Welcomed."]},
  saa:{what:"Prepares the room, greets people and keeps the meeting running smoothly.",
    before:["Set up the room or online link, lectern, mic and projector.","Get the timing lights or cards ready for the Timer.","Put out name badges and the sign-in sheet."],
    during:["Greet members and guests as they arrive and add guests to the list.","Ask everyone to be seated and silence phones.","Introduce the President to open the meeting."],
    after:["Tidy the room and pack away club items."],
    app:["Work through the Before / As people arrive / After checklists.","Guests you add appear on the President’s screen."]},
  tmod:{what:"Hosts the meeting: introduces every part and every role player, and keeps it on time.",
    before:["Read the agenda and speakers’ titles and objectives.","Prepare short introductions and links between sessions."],
    during:["Tap ▶ Start the meeting when the President hands over, then Next ▶ for each part.","Watch the on-time / behind status; move a late item to the end or skip it.","Introduce the speakers with their titles and objectives."],
    after:["Ask the Toastmaster for votes, then reveal the winners.","Hand back to the President."],
    app:["🎯 Focus shows just Now / Next with a big Next ▶ button.","📺 Projector view shows Now / Next on the room screen."]},
  ge:{what:"Evaluates the whole meeting and leads the evaluation team.",
    before:["Check who evaluates whom and that your team is ready."],
    during:["Take notes on everything that happens (and what should have).","Introduce each evaluator; call for the Timer, Ah-Counter and Grammarian reports.","Open and close voting."],
    after:["Give your overall evaluation (about 3 minutes)."],
    app:["The evaluations table shows each speaker’s evaluator and status.","📣 Call for reports gives the reporters’ results."]},
  timer:{what:"Times every speaker and shows the green, amber and red signals.",
    before:["Check the time limits for each session.","Plan speakers ahead with + Add to list (the agenda fills prepared speakers in)."],
    during:["Press ▶ Start when a speaker begins and ■ Stop when they finish.","Show green, amber and red as the screen tells you; your phone vibrates at each signal.","⏸ Pause if the mic or Zoom fails."],
    after:["Give your report: 📋 Copy report text, or read it from the screen."],
    app:["🎯 Focus gives big Start buttons.","Keep the app open; the screen stays awake while timing."]},
  ttm:{what:"Runs Table Topics: gives impromptu topics and calls the speakers.",
    before:["Add your topics, one per line."],
    during:["Explain the rules; pick or 🎲 randomise a topic; 📺 show it on screen.","Type who takes it and tap Call speaker (the Timer gets the name).","Each speaker is shared out to a Table Topics Evaluator; change it in the Used list if needed."],
    after:["Hand back to the Toastmaster."],
    app:["🎯 Focus shows the current topic and Call speaker."]},
  rrm:{what:"Runs the Round Robin: a quick question everyone answers in turn.",
    before:["Add your Round Robin questions."],
    during:["Show the question with 📺; tap each person’s name to queue them on the Timer (20-second bell)."],
    after:["Hand back to the Toastmaster."],
    app:["Names come from the member list; add guests by name."]},
  ah:{what:"Counts filler words and sounds (um, ah, so…) for each speaker.",
    before:["Check the filler words list."],
    during:["When the Timer starts someone, their name appears automatically.","Tap a word each time you hear it."],
    after:["Give your report: 📋 Copy report text."],
    app:["🎯 Focus gives big buttons with Undo.","With another role on the same device, you follow the same speaker in both."]},
  gram:{what:"Introduces the Word of the Day and notes good language and slips.",
    before:["Choose a Word of the Day and its meaning; enter it before the meeting."],
    during:["Introduce the word at the start.","Tap +1 each time a speaker uses it; note great phrases and slips."],
    after:["Give your report: 📋 Copy report text."],
    app:["🎯 Focus gives a big +1 button and quick Good / Slip notes.","The Word of the Day shows on the projector and dashboard."]},
  speaker:{what:"Gives a prepared speech from the Speechcraft programme.",
    before:["Enter your speech title, objectives and time limits.","Set your feedback PIN so only you can read your evaluation."],
    during:["When the Timer starts you, your screen shows your time and signal (⛶ full screen on the lectern)."],
    after:["Unlock your feedback card with your PIN; read your evaluation and notes.","📚 My feedback history keeps every week."],
    app:["Your evaluator sees your title and objectives."]},
  seval:{what:"Evaluates a prepared speech: Commend, Recommend, Commend.",
    before:["Find your speaker under ⭐ Your speakers; read their title and objectives."],
    during:["Write your notes while they speak; it stays a private draft."],
    after:["Give your evaluation, then tap Submit; only the speaker can read it."],
    app:["Assign to me if you weren’t assigned.","With Ah-Counter too, both follow the same speaker."]},
  tteval:{what:"Evaluates Table Topics speakers (often several each).",
    before:["Wait for the Table Topics Master to call speakers; they’re shared out to you."],
    during:["Your speakers show under ⭐ Your Table Topics speakers with progress.","Write Commend · Recommend · Commend for each."],
    after:["Submit each one; only the speaker can read it."],
    app:["Assign to me / Unassign me to take or give back a speaker."]},
  member:{what:"Takes part, votes and gives encouragement.",
    before:["Tap In person / Online / Can’t make it.","Set a feedback PIN to read feedback written for you."],
    during:["Check in when you arrive; vote when voting opens.","Send private notes to speakers."],
    after:["Open your feedback card; 💬 Report a problem or idea if anything didn’t work."],
    app:["Table Topics speakers see their time on their own phone when timed."]}
};
/* Publisher-hosted references; local guidance is labelled separately from International. */
var ROLE_DOC_ROOT="https://www.toastmasters.org/";
var ROLE_DOC_HATS=["Alternative: A Toastmaster Wears Many Hats",ROLE_DOC_ROOT+"resources/a-toastmaster-wears-many-hats"];
var ROLE_DOC_PDF=["Backup PDF: A Toastmaster Wears Many Hats","https://ccdn.toastmasters.org//medias/files/pathways/toastmaster-wears-many-hats/1167d-a-toastmaster-wears-many-hats.pdf"];
var ROLE_DOC_LOCAL=["Local guidance: University of Colombo Gavel Club","https://www.gavel.cmb.ac.lk/making-yourself-useful-at-educational-meetings/"];
var ROLE_DOCS={
  coord:[["Official: Speechcraft FAQ (coordinators)",ROLE_DOC_ROOT+"education/speechcraft/speechcraft-faq"],["Alternative: Speechcraft overview",ROLE_DOC_ROOT+"education/speechcraft"]],
  president:[["Official: Club Leadership Handbook (President)",ROLE_DOC_ROOT+"resources/club-leadership-handbook"],["Alternative: Handbook and language versions",ROLE_DOC_ROOT+"membership/leadership/club-officer-tools/club-leadership-handbook"]],
  saa:[["Official: Club Leadership Handbook (Sergeant at Arms)",ROLE_DOC_ROOT+"resources/club-leadership-handbook"],["Alternative: Handbook and language versions",ROLE_DOC_ROOT+"membership/leadership/club-officer-tools/club-leadership-handbook"]],
  tmod:[["Official: Toastmaster",ROLE_DOC_ROOT+"membership/club-meeting-roles/toastmaster"]],
  ge:[["Official: General Evaluator",ROLE_DOC_ROOT+"membership/club-meeting-roles/general-evaluator"],["Official: General Evaluator Checklist",ROLE_DOC_ROOT+"resources/general-evaluator-checklist"]],
  timer:[["Official: Timer",ROLE_DOC_ROOT+"membership/club-meeting-roles/timer"]],
  ttm:[["Official: Topicsmaster",ROLE_DOC_ROOT+"membership/club-meeting-roles/topicsmaster"]],
  ah:[["Official: Ah-Counter",ROLE_DOC_ROOT+"membership/club-meeting-roles/ah-counter"]],
  gram:[["Official: Grammarian",ROLE_DOC_ROOT+"membership/club-meeting-roles/grammarian"]],
  speaker:[["Official: Meeting Speaker",ROLE_DOC_ROOT+"membership/club-meeting-roles/meeting-speaker"]],
  seval:[["Official: Evaluator",ROLE_DOC_ROOT+"membership/club-meeting-roles/evaluator"]],
  tteval:[["Official: Evaluator (general evaluation guidance)",ROLE_DOC_ROOT+"membership/club-meeting-roles/evaluator"],ROLE_DOC_LOCAL],
  member:[["Official: Club Meeting Roles",ROLE_DOC_ROOT+"membership/club-meeting-roles"],["Official: Table Topics Speaker",ROLE_DOC_ROOT+"membership/club-meeting-roles/table-topics-speaker"]],
  rrm:[ROLE_DOC_LOCAL,["Alternative local URL: University of Colombo Gavel Club","https://www.gavel.cmb.ac.lk/?p=1010"]]
};
function roleDocsHTML(id){
  var links=(ROLE_DOCS[id]||[]).slice();
  if(id!=="coord"&&id!=="president"&&id!=="saa"&&id!=="rrm") links.push(ROLE_DOC_HATS,ROLE_DOC_PDF);
  if(id==="president"||id==="saa") links.push(["Backup PDF: Club Leadership Handbook","https://content.toastmasters.org/image/upload/1310-club-leadership-handbook.pdf"]);
  if(id==="rrm") links.push(["Related International guidance: meeting roles (not a Round Robin manual)",ROLE_DOC_ROOT+"membership/club-meeting-roles"]);
  var note=id==="rrm"?"Round Robin is a local format; these are University of Colombo Gavel Club references, not a Toastmasters International role manual. The two local URLs lead to the same article.":id==="tteval"?"International provides general evaluator guidance; the local reference describes Table Topics evaluations.":"Toastmasters International references. Follow your agreed meeting agenda where local practices differ.";
  return '<div class="role-docs"><h4>Official references &amp; alternatives</h4><p>'+esc(note)+'</p><ul>'+links.map(function(x){return '<li><a href="'+esc(x[1])+'" target="_blank" rel="noopener noreferrer">'+esc(x[0])+'</a></li>';}).join('')+'</ul><p class="saved">Links verified 5 November 2026. Internet access required; alternatives are external links, not offline copies.</p></div>';
}

function guidePageHTML(id){
  var r=roleObj(id), g=ROLE_GUIDE[id]; if(!r||!g) return "";
  var li=function(a){ return '<ul>'+a.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>'; };
  return '<div class="gpage"><div class="rlogos"><img src="'+document.querySelector(".logo img").src+'" alt="Toastmasters International"><img src="'+document.querySelector(".logo.co img").src+'" alt="Dijital Team"></div>'+
    '<h2>'+r.icon+' '+esc(r.name)+'</h2><div class="sub">'+esc(GROUP)+' · Speechcraft role guide</div><p class="gwhat">'+esc(g.what)+'</p>'+
    '<div class="ggrid"><div><h4>Before the meeting</h4>'+li(g.before)+'</div><div><h4>During</h4>'+li(g.during)+'</div><div><h4>After</h4>'+li(g.after)+'</div><div><h4>In the app</h4>'+li(g.app)+'</div></div>'+
    roleDocsHTML(id)+'<div class="gfoot">Open the app: '+esc(SITE_URL)+' · choose '+r.icon+' '+esc(r.name)+'</div></div>';
}
function openGuides(ids){
  ids=ids&&ids.length?ids:ROLES.map(function(r){return r.id;});
  document.getElementById("report").innerHTML=ids.map(guidePageHTML).join("");
  document.getElementById("repPick").innerHTML='<b style="font-size:14px">Role guide'+(ids.length>1?'s ('+ids.length+')':'')+'</b> <span class="saved">'+(ids.length===1?'<button class="linkbtn" id="guidesAll">Show all roles</button>':'')+'</span>';
  var w=document.getElementById("reportWrap"); w.dataset.kind="guide"; w.classList.add("on");
}
document.getElementById("repPick").addEventListener("click",function(e){ if(e.target.closest("#guidesAll")) openGuides(); });
document.getElementById("guidesBtn").addEventListener("click",function(){ openGuides(); });
document.getElementById("view").addEventListener("click",function(e){ if(e.target.closest("[data-guide]")) openGuides([L.role]); });
