# Speechcraft Meeting Roles

A single HTML page for running Speechcraft meetings at **Dijital Team Colombo**. It covers four meeting roles:

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
| 🗣 **Speech Evaluator** / 💬 **Table Topic Evaluator** | "Your speakers" first (assigned by the Coordinator or "Assign to me"), with speech titles and objectives; Commend · Recommend · Commend + ratings kept as a private draft until **Submit** |
| 🙋 **Member / Audience** | Check in, vote, send anonymous notes to speakers, open a printable personal feedback card |

One **Meeting report** combines every role and can be saved as a PDF.

### Real meetings change on the day

- **One person, several roles:** tap **＋ Role** to hold more than one role on a device and switch with one tap. If the agenda lists you in several roles, the page offers to add them. Small panels keep your other jobs at hand: Ah-Counter buttons and the Grammarian's Word of the Day +1 for whoever is speaking, and the Timer's live bar.
- **Header:** 🏠 Home, connection status, **⋯ More** (Save backup, Restore, New meeting, About & clean up) and Meeting report. **ℹ️ About** explains the app and has **🧹 Clean up** for after a practice run: **Clear meeting** (keeps members, PIN and settings) or **Reset device** (deletes everything this browser saved and leaves the meeting).
- **Start screen:** type your name first; roles the agenda gives you today appear at the top under ⭐, the rest are grouped (Running the meeting · Timing & reports · Speakers & evaluators · Audience).
- **Timer phone:** the screen stays on while a speaker is timed and the phone vibrates at green, amber and red (no sound).
- **💬 Role list for WhatsApp:** the Coordinator gets the week's role message written from the agenda (date, time, venue, role players, speakers with evaluators, Table Topics evaluators; open roles ask for volunteers), ready to copy or share to the group.
- **End of meeting:** the Coordinator taps **🏁 Finish meeting**. Every role player gets a prompt with a quick check of their role (e.g. a timer still running, evaluations not submitted, Word of the Day missing, votes not revealed) and taps **Yes, done**. The Coordinator sees each role live as waiting, in progress or complete, with any notes. Then **⤓ Save meeting record** downloads the final member list, role players, agenda, times, reports and votes (feedback stays encrypted). If a browser loses its data, **⤒ Import meeting record** brings it all back on every connected device; unlock with the same Coordinator PIN or recovery code.
- **Who's coming:** members reply In person / Online / Can't make it, with a note such as "leaving at 8 pm". The Coordinator sees clashes ("can't make it — reassign") and reassigns role players and evaluators.
- **Running order:** the Toastmaster can move an item to the end (e.g. a late keynote) or skip it; everyone's "Now" line follows.
- **Hand-over:** role data is shared, so whoever takes over a role carries on. **📋 Copy report text** gives a WhatsApp-ready summary for the Timer, Ah-Counter, Grammarian and General Evaluator.

### Voting

When the General Evaluator opens voting, a vote bar appears on every connected device: Best Prepared Speaker, Best Table Topics Speaker, Best Evaluator and Best Role Player, one vote per device per award. Results stay hidden until the Toastmaster taps **Reveal winners**, then they appear on every screen together.

### Private feedback

Evaluations and audience notes can only be read by the speaker they are for. Each speaker sets a **feedback PIN** once (Member / Audience → My feedback card). This creates a personal key: the public part is shared with the meeting and the private part is locked with the PIN (PBKDF2 + AES-GCM), so the speaker can open their card on any device. Evaluations stay as a draft on the evaluator's device until they tap **Submit**. Evaluators' and members' devices then encrypt feedback for that speaker (ECDH P-256 + AES-GCM) before it is synced, so every other device only holds unreadable data. The General Evaluator and the meeting report show only who evaluated whom. If a speaker hasn't set a PIN yet, feedback waits on the writer's device and is sent automatically once they do. The Coordinator can reset a forgotten PIN, but feedback encrypted for the old PIN can't be recovered.

### Coordinator PIN

The Coordinator area is locked with a 4–8 digit PIN. When it is first set, a one-time **recovery code** is shown: keep it with the coordinator handover notes. To hand over, share the PIN or unlock and use **Change PIN**. This is a lock against casual changes; because everything runs in the browser without a server, it isn't strong security.

## Use it

Open **https://npfernando.github.io/toastmasters-speechcraft/** on any phone or laptop (or download `index.html` and open it offline in Chrome, Edge or Safari). No install or login.

## Getting started at a meeting

1. **Pick your role.** The page opens on a welcome screen: choose Timer, Table Topics Master, Ah-Counter or Grammarian and type your name. Your device then shows only your role (use **Change role** at the top to switch).
2. **Host or join.** One person (usually the Timer) taps **Host meeting & get code** and shares the 6-character code, or taps **Copy invite link** and sends the link in WhatsApp. Everyone else types the code and taps **Join** (the invite link fills the code in for them).
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
