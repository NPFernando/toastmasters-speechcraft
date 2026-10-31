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

- Devices find each other through public [Nostr](https://nostr.com/) relays, using several at once so one relay being down doesn't matter, via [Trystero](https://github.com/dmotz/trystero). This is the same approach other peer-to-peer apps on GitHub Pages use.
- The meeting code is the room password: the short set-up messages on the relays are encrypted with it, so only people with the code can connect.
- After that, devices talk directly to each other over WebRTC, which is always end-to-end encrypted. Meeting data never passes through the relays.
- Everyone connects to everyone, so the meeting keeps going even if the person who started it closes their page.
- Each device keeps its own copy, so if the internet drops everyone keeps working and catches up on reconnect.
- Needs internet on every device. If a strict network blocks direct connections, use the same Wi-Fi or a phone hotspot.

## Data and backups

Everything is saved in the browser on each device. Use **⤓ Save backup** after each meeting and **⤒ Restore** to load it on another device.

## Credits

- Connection library: [Trystero](https://github.com/dmotz/trystero) 0.26.0 (Nostr strategy, includes @noble/secp256k1), MIT License, embedded in the page.
- The Toastmasters International logo is used under the Toastmasters brand guidelines for club and Speechcraft materials. It is a trademark of Toastmasters International. The Dijital Team logo belongs to Dijital Team.
