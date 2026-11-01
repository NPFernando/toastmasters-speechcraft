# Speechcraft Portal

A single HTML page for running Speechcraft meetings at **Dijital Team Colombo**. It covers every meeting role, connected across phones and laptops with a meeting code:

| Role | What it does |
|---|---|
| 🗂 **Speechcraft Coordinator** | PIN-protected set-up: member list (remembered for every meeting), meeting details, role players and agenda; names fill in on every device; prints the agenda sheet |
| 🔔 **President** | Their agenda times; opening checklist (call to order, anthem, welcome, club mission, introduce the Toastmaster); announcements; guest list with "welcomed" ticks; closing checklist with the award winners |
| 🛎 **Sergeant at Arms** | Before / as people arrive / after checklists (room, lectern, timing lights, badges, greeting, seating, packing up); adds guests to the shared guest list |
| 🎩 **Toastmaster of the Day** | Run-sheet with Now / Next, tap to move on, shows if the meeting is on time or behind; everyone sees a "Now:" line |
| 🧭 **General Evaluator** | Live Timer / Ah-Counter / Grammarian results for the call for reports, evaluation status, meeting notes, opens and closes voting |
| ⏱ **Timer** | Plan speakers, live counter with green / amber / red signal flashes, Table Topics, Prepared Speech, Round Robin, Evaluations and Role reports (Timer and Ah-Counter 1 min, Grammarian 2 min), manual time entry, time totals |
| 🎤 **Table Topics Master** | Prepare topics, random pick, full-screen topic display, record who took each topic, remaining vs used topics |
| 🔢 **Ah-Counter** | Tap counts of filler words (Um, Ah, Er, So, Like…) per speaker, editable word list |
| 📝 **Grammarian** | Word of the Day, uses per speaker, great phrases and slips |
| 🔁 **Round Robin Master** | Question list, show the question full screen, tap each person to queue them on the Timer (20-second bell) |
| 🎙 **Speaker** | Prepared speakers add their speech title, objectives and time limits (used by the Timer), see their result and assigned evaluator, and open their private feedback |
| 🗣 **Speech Evaluator** / 💬 **Table Topics Evaluator** | "Your speakers" first (assigned by the Coordinator or "Assign to me"), with speech titles and objectives; Commend · Recommend · Commend + ratings kept as a private draft until **Submit** |
| 🙋 **Participant** | Check in, vote, send anonymous notes to speakers, open a printable personal feedback card |

One **Meeting report** combines every role and can be saved as a PDF.

### Real meetings change on the day

- **One person, several roles:** tap **＋ Role** to hold more than one role on a device and switch with one tap. If the agenda lists you in several roles, the page offers to add them. Small panels keep your other jobs at hand: Ah-Counter buttons and the Grammarian's Word of the Day +1 for whoever is speaking, and the Timer's live bar.
- **Speechcrafters, Toastmasters and guests:** in the Coordinator's member list, tap a name to set its type: 🎓 **Speechcrafter** (the 10-week programme), ⭐ **Toastmaster** (already graduated or from another club, with their club name), or 👋 **Guest**. Names starting "TM " are detected as Toastmasters. Anyone can take any role (keynote, coordinator, evaluator…). Toastmasters and guests show a badge and their own group on the start screen; 📈 Progress tracks Speechcrafters (switch to include everyone); and Toastmasters aren't on the awards ballot unless the Coordinator ticks **Toastmasters can win awards**.
- **One person across all your roles:** with several roles on one device (e.g. Ah-Counter + Table Topics Evaluator), choosing a person in any role selects the same person in your other roles: the Ah-Counter and Grammarian switch to them and the evaluator tab opens their evaluation. When the Timer starts someone, every linked role follows. A **🔗 Following …** bar shows who is selected (✕ to stop). Two devices of the same person never create duplicate rows.
- **Table Topics Evaluators with several speakers:** when the Table Topics Master calls a speaker, they're shared out to the Table Topics Evaluator with the fewest so far; the TTM can change it from the Used list, and evaluators can **Assign to me**. Each evaluator sees **⭐ Your Table Topics speakers** with progress ("3 speakers · ✓ 1 submitted · ✏️ 1 writing · 1 to do"). The General Evaluator's table, the finish check and the printed agenda show who evaluates whom.
- **⏸ Pause / ▶ Resume** (Timer): stop the clock for a microphone or Zoom problem. The pause doesn't count toward the speaker's time, every screen shows "⏸ Paused", and the report notes it, e.g. "(paused 0:35)".
- **🎓 Practice meeting** (⋯ More, or "Try a practice meeting first" on the start screen): a sample meeting with ten example members, role players, speeches, topics and a Word of the Day, so new Speechcrafters can try every role. It's kept separately on the device (Coordinator PIN 1234) and never touches the real meeting; **Start over** or **Leave practice** at any time.
- **📲 Install as an app** (⋯ More on Android / Chrome / Edge; on iPhone: Share → Add to Home Screen): home-screen icon, opens full screen, and loads even with weak or no signal. Connecting devices still needs internet.
- **📈 Speechcraft progress** (Coordinator): add each week's saved meeting record to see, for every member, the meetings attended, roles taken per week, prepared speeches with time and result, Table Topics, awards and the roles they haven't tried yet. **Print progress** for the graduation file. Kept on the Coordinator's device only.
- **📚 My feedback history** (Speaker / Member feedback card): every meeting where you spoke or got feedback is kept on your device — times, filler count, Word of the Day, phrases, awards, and your evaluations and notes. Evaluations stay encrypted in the history and are readable only after unlocking with your feedback PIN.
- **📘 Role guides** (⋯ More, or 📘 Full guide on a role's tips): one printable page per role — what it does before, during and after the meeting, and which buttons to use.
- **🔌 Connection check** (⋯ More): whether this device reaches the connection relays and the other devices (with round-trip time), and supports encryption, keeping the screen awake, vibration and saving. **Copy results** to include in a problem report.
- **💬 Report a problem or idea** (⋯ More): see [Issues and ideas](#issues-and-ideas).
- **Signals readable without colour:** every signal also has its own shape (● Green, ▲ Amber, ■ Red) on the Timer, the live bar, the speaker's card and the projector, and the Timer's time boxes change border (solid, dashed, double), so colour-blind role players and anyone far from the screen can tell them apart.
- **Accessibility:** every screen passes an automated WCAG 2.1 AA check (axe-core) in light and dark mode: labelled form fields, contrast, a visible keyboard focus ring, and reduced motion when the device asks for it.
- **Look:** Toastmasters brand colours (Loyal Blue, True Maroon, Happy Yellow). **⋯ More → Display** sets Auto / Light / Dark and **Bigger text** for this device.
- **Sections:** **My role · Now · Agenda** (plus Report and More). On phones this is a bottom tab bar.
  - **📡 Now** — the meeting at a glance: Now / Next from the Toastmaster's run-sheet, progress through the agenda, timing so far, who's online, role players (● online), Word of the Day and voting.
  - **📋 Agenda** — the full agenda for everyone with the current item highlighted, done and skipped items marked, and **📄 Print / PDF**.
- **📺 Projector view** (Now, or ⋯ More): full screen for the room screen or a Zoom share. Shows the speaker's clock in green / amber / red while timing, the Table Topic, the award winners once revealed, otherwise Now / Next; Word of the Day along the bottom.
- **🎯 Focus** (Timer, Ah-Counter, Grammarian, Toastmaster, Table Topics Master): hides everything except what the role needs right now — big Start buttons, a big filler-word grid with Undo, a big +1 Word of the Day, a big Now / Next with Next ▶, or the current topic with Call speaker.
- **💡 Tips:** three quick steps the first time each role is opened; 💡 Tips in the role bar shows them again.
- **Header:** 🏠 Home, connection status, **⋯ More** (Save backup, Restore, New meeting, About & clean up) and Meeting report. **ℹ️ About** explains the app and has **🧹 Clean up** for after a practice run: **Clear meeting** (keeps members, PIN and settings) or **Reset device** (deletes everything this browser saved and leaves the meeting).
- **Start screen (2 steps):** ① **Join the meeting**: scan the host's QR or type the code, host a new meeting, try the 🎓 practice meeting, or continue offline. Opening an invite link joins automatically. Returning devices get **👋 Welcome back** with one-tap **Continue** or **↻ Rejoin** the last meeting. ② **Who are you?**: tap your name from the member list (or type it); the roles the agenda gives you are starred and pre-ticked, and you can tick several roles at once. The **Start** button stays in view. The start screen also has **💬 Report a problem or idea**, **Open on GitHub** and **Known issues & ideas**.
- **Speaker sees their own time:** when the Timer starts someone, that person's device (Speaker, or Member called for Table Topics or an evaluation) shows a big live clock that turns green, amber and red with the signals, their status ("Keep going", "✓ You've qualified", "Start wrapping up", "Finish now") and the time to the next signal. **⛶ Full screen** fills the phone, e.g. on the lectern.
- **Timer phone:** the screen stays on while a speaker is timed and the phone vibrates at green, amber and red (no sound).
- **End of meeting:** the Coordinator taps **🏁 Finish meeting**. Every role player gets a prompt with a quick check of their role (e.g. a timer still running, evaluations not submitted, Word of the Day missing, votes not revealed) and taps **Yes, done**. The Coordinator sees each role live as waiting, in progress or complete, with any notes. Then **⤓ Save meeting record** downloads the final member list, role players, agenda, times, reports and votes (feedback stays encrypted). If a browser loses its data, **⤒ Import meeting record** brings it all back on every connected device; unlock with the same Coordinator PIN or recovery code.
- **Who's coming:** members reply In person / Online / Can't make it, with a note such as "leaving at 8 pm". The Coordinator sees clashes ("can't make it — reassign") and reassigns role players and evaluators.
- **Running order:** the Toastmaster can move an item to the end (e.g. a late keynote) or skip it; everyone's "Now" line follows.
- **Hand-over:** role data is shared, so whoever takes over a role carries on. **📋 Copy report text** gives a text summary to paste anywhere for the Timer, Ah-Counter, Grammarian and General Evaluator.

### Voting

When the General Evaluator opens voting, a vote bar appears on every connected device: Best Prepared Speaker, Best Table Topics Speaker, Best Evaluator and Best Role Player, one vote per device per award. Results stay hidden until the Toastmaster taps **Reveal winners**, then they appear on every screen together.

### Private feedback

Evaluations and audience notes can only be read by the speaker they are for. Each speaker sets a **feedback PIN** once (Participant → My feedback card). This creates a personal key: the public part is shared with the meeting and the private part is locked with the PIN (PBKDF2 + AES-GCM), so the speaker can open their card on any device. Evaluations stay as a draft on the evaluator's device until they tap **Submit**. Evaluators' and members' devices then encrypt feedback for that speaker (ECDH P-256 + AES-GCM) before it is synced, so every other device only holds unreadable data. The General Evaluator and the meeting report show only who evaluated whom. If a speaker hasn't set a PIN yet, feedback waits on the writer's device and is sent automatically once they do. The Coordinator can reset a forgotten PIN, but feedback encrypted for the old PIN can't be recovered.

### Issues and ideas

Members tap **⋯ More → 💬 Report a problem or idea**, choose 🐞 Problem, 💡 Idea or 👍 I like this, and tap **Send to the organisers**. No account is needed: it syncs with the meeting (or the next time the device joins one) into **💬 Issues & ideas** in the Coordinator area. The Coordinator or a co-organiser reviews each one and taps **Create GitHub issue**, which opens this repository's [issue form](https://github.com/NPFernando/toastmasters-speechcraft/issues/new/choose) already filled in (what happened, steps, role, device, app version, who sent it). Issues are labelled `bug` or `idea` plus `from-app`, so they can be tracked, discussed and closed when fixed; mark the item ✓ Done in the app. Members with a GitHub account can also tap **Post on GitHub** to file it directly.

### Co-organisers (more than one Coordinator)

The Coordinator can invite teammates to help, for example one person sets up next session's roles and another handles sudden changes on the day. In the Coordinator area, **👥 Co-organisers → type a name → + Invite** shows a QR code, an invite link and an 8-character invite code (shown once). The co-organiser scans the QR (or joins the meeting as 🗂 Coordinator and types the code) and the set-up unlocks on their device without the PIN. Co-organisers can edit the agenda, role players and members, but can't change the PIN or invite others. The Coordinator sees who is editing now and can **Remove access** at any time. Only a hash of each invite code is shared with the meeting.

Edits sync field by field: each agenda detail, role player, agenda item and member has its own change time, so two organisers editing different things at the same moment both keep their changes. If both change the same field, the later change wins.

### Coordinator PIN

The Coordinator area is locked with a 4–8 digit PIN. When it is first set, a one-time **recovery code** is shown: keep it with the coordinator handover notes. To hand over, share the PIN or unlock and use **Change PIN**. This is a lock against casual changes; because everything runs in the browser without a server, it isn't strong security.

> **Before the first real meeting:** run the [15-minute dry run](docs/DRY-RUN.md) with real phones. **To change the app:** see [CONTRIBUTING.md](CONTRIBUTING.md); every push runs the automated tests.

## Use it

Open **https://npfernando.github.io/toastmasters-speechcraft/** on any phone or laptop (or download `index.html` and open it offline in Chrome, Edge or Safari). No install or login.

## Getting started at a meeting

1. **Pick your role.** The page opens on a welcome screen: choose Timer, Table Topics Master, Ah-Counter or Grammarian and type your name. Your device then shows only your role (use **Change role** at the top to switch).
2. **Host or join.** One person (usually the Timer) taps **Host meeting & get code** and shares the 6-character code, or taps **Copy invite link** and sends the link to the group. Everyone else types the code and taps **Join** (the invite link fills the code in for them).
3. **Continue.** Once it shows **✓ Connected**, tap **Continue**. Next time the device opens straight into its role and reconnects to the same meeting.

You can also tap **Continue without connecting** to use a role on its own.

### QR codes

- **Others join:** after starting a meeting, a QR code appears. Others scan it with their phone camera; the page opens with the meeting code filled in and they pick their role.
- **Your role on your phone:** tap **📱 Open on phone** next to your role. Scan the QR code with your phone and it opens the same role in the same meeting, with all the data, without any setup. Keep the first device open until the phone shows ✓ Connected.

## How the live sync works

Once connected, devices sync live: when the Table Topics Master calls a speaker, they appear in the Timer's list; the Ah-Counter and Grammarian see who is speaking now.

- Devices find each other through public [Nostr](https://nostr.com/) relays, using several at once so one relay being down doesn't matter, via [Trystero](https://github.com/dmotz/trystero). This is the same approach other peer-to-peer apps on GitHub Pages use.
- The meeting code is the room password: the short set-up messages on the relays are encrypted with it, so only people with the code can connect.
- After that, devices talk directly to each other over WebRTC, which is always end-to-end encrypted. Meeting data never passes through the relays.
- Everyone connects to everyone, so the meeting keeps going even if the person who started it closes their page.
- Each device keeps its own copy, so if the internet drops everyone keeps working and catches up on reconnect.
- Needs internet on every device. If a strict network blocks direct connections, use the same Wi-Fi or a phone hotspot.

## Data and backups

Everything is saved in the browser on each device. Use **⤓ Save backup** after each meeting and **⤒ Restore** to load it on another device.

## Credits

- QR codes: [QR Code Generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 by Kazuhiko Arase, MIT License, embedded in the page. "QR Code" is a registered trademark of DENSO WAVE INCORPORATED.
- Connection library: [Trystero](https://github.com/dmotz/trystero) 0.26.0 (Nostr strategy, includes @noble/secp256k1), MIT License, embedded in the page.
- The Toastmasters International logo is used under the Toastmasters brand guidelines for club and Speechcraft materials. It is a trademark of Toastmasters International. The Dijital Team logo belongs to Dijital Team.
