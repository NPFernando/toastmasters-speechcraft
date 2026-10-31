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

- **Online:** open the GitHub Pages link for this repo (if enabled) on any phone or laptop.
- **Offline:** download `index.html` and open it in Chrome, Edge or Safari. No install or login.

## Connect the roles (live sync)

1. Everyone opens the page and taps their role.
2. One person (usually the Timer) taps **Not connected → Host meeting** and reads out the 6-character code.
3. Everyone else taps **Join** and types the code.

Devices then sync live: when the Table Topics Master calls a speaker, they appear in the Timer's list; the Ah-Counter and Grammarian see who is speaking now.

- Devices connect directly to each other over WebRTC, which is always encrypted. The free public [PeerJS](https://peerjs.com/) service only matches devices by code; meeting data doesn't pass through it.
- Each device keeps its own copy, so if the internet drops everyone keeps working and catches up on reconnect.
- Needs internet on every device. If a strict network blocks direct connections, use the same Wi-Fi or a phone hotspot.

## Data and backups

Everything is saved in the browser on each device. Use **⤓ Save backup** after each meeting and **⤒ Restore** to load it on another device.

## Credits

- Connection library: [PeerJS](https://github.com/peers/peerjs) 1.5.4, MIT License, embedded in the page.
- The Toastmasters International logo is used under the Toastmasters brand guidelines for club and Speechcraft materials. It is a trademark of Toastmasters International. The Dijital Team logo belongs to Dijital Team.
