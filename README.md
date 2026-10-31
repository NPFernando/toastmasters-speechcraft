# Speechcraft Meeting Roles

A single HTML page for running Speechcraft meetings at **Dijital Team Colombo**. It covers four meeting roles:

| Role | What it does |
|---|---|
| ⏱ **Timer** | Plan speakers, live counter with green / amber / red signal flashes, Table Topics, Prepared Speech and Round Robin limits, manual time entry, time totals |
| 🎤 **Table Topics Master** | Prepare topics, random pick, full-screen topic display, record who took each topic, remaining vs used topics |
| 🔢 **Ah-Counter** | Tap counts of filler words (Um, Ah, Er, So, Like…) per speaker, editable word list |
| 📝 **Grammarian** | Word of the Day, uses per speaker, great phrases and slips |

One **Meeting report** combines every role and can be saved as a PDF.

## Use it

Open **https://npfernando.github.io/toastmasters-speechcraft/** on any phone or laptop (or download `index.html` and open it offline in Chrome, Edge or Safari). No install or login.

## Getting started at a meeting

1. **Pick your role.** The page opens on a welcome screen: choose Timer, Table Topics Master, Ah-Counter or Grammarian and type your name. Your device then shows only your role (use **Change role** at the top to switch).
2. **Host or join.** One person (usually the Timer) taps **Host meeting & get code** and shares the 6-character code, or taps **Copy invite link** and sends the link in WhatsApp. Everyone else types the code and taps **Join** (the invite link fills the code in for them).
3. **Continue.** Once it shows **✓ Connected**, tap **Continue**. Next time the device opens straight into its role and reconnects to the same meeting.

You can also tap **Continue without connecting** to use a role on its own.

## How the live sync works

Once connected, devices sync live: when the Table Topics Master calls a speaker, they appear in the Timer's list; the Ah-Counter and Grammarian see who is speaking now.

- Devices connect directly to each other over WebRTC, which is always encrypted. The free public [PeerJS](https://peerjs.com/) service only matches devices by code; meeting data doesn't pass through it.
- Each device keeps its own copy, so if the internet drops everyone keeps working and catches up on reconnect.
- Needs internet on every device. If a strict network blocks direct connections, use the same Wi-Fi or a phone hotspot.

## Data and backups

Everything is saved in the browser on each device. Use **⤓ Save backup** after each meeting and **⤒ Restore** to load it on another device.

## Credits

- Connection library: [PeerJS](https://github.com/peers/peerjs) 1.5.4, MIT License, embedded in the page.
- The Toastmasters International logo is used under the Toastmasters brand guidelines for club and Speechcraft materials. It is a trademark of Toastmasters International. The Dijital Team logo belongs to Dijital Team.
