# Changing the app

The app is one HTML file (`index.html`) so it can be downloaded, opened offline and hosted on GitHub Pages. **Don't edit `index.html` directly** — it's built from the source in `src/`.

## Layout

| Path | What it is |
|---|---|
| `src/index.template.html` | The page markup (header, menus, dialogs). `%%CSS%%` and `%%JS%%` mark where the styles and script go. |
| `src/css/` | Styles, in the order listed in `src/css/order.txt`. |
| `src/js/` | The app script, one file per feature, in the order listed in `src/js/order.txt`. See *Where things live* below. |
| `src/build.py` | Joins the template, CSS and JS in order and inlines the logos and libraries into `index.html`. It stops if a file isn't listed in `order.txt` or two files define the same function name. |
| `src/assets/` | Toastmasters (WebP, quality 90) and Dijital Team (256-colour PNG) logos as data URIs, embedded once in the header; the Table Topics stage reuses them at runtime. Keep them small: the whole app loads in about 2 s on a slow 3G phone (≈220 KB gzipped). |
| `src/vendor/` | Bundled libraries (Trystero for encrypted peer-to-peer sync, qrcode-generator) — see its README. |
| `index.html` | The built app (published by GitHub Pages). |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Install-as-an-app files and offline helper. |
| `tests/` | Multi-device browser tests and a local test relay. |
| `.github/ISSUE_TEMPLATE/` | 🐞 Problem and 💡 Idea forms used by the in-app reports. |
| `docs/` | Dry-run checklist and other notes. |

## Make a change

1. Edit the file for the feature in `src/js/` (or `src/css/`, `src/index.template.html`). A new file must be added to `order.txt`.
2. Build: `python3 src/build.py` (writes `index.html`).
3. Test (needs Node 20+):
   ```
   cd tests
   npm install
   npx playwright install chromium
   npm test              # all tests, about a minute
   npm test -- 02        # just the timer test
   ```
4. Commit the changed `src/` files **and** the rebuilt `index.html` together, then push. GitHub Pages updates the live site within a minute or two.

Every push runs the **Tests** workflow (Actions tab): it checks that `index.html` was rebuilt from `src/` and runs all the tests. A red ✗ on the commit means something broke — open the run to see which test and why.

## Where things live (`src/js/`)

All files run in one shared scope (one `<script>`, wrapped in a single function), in the order of `order.txt`, so a function in one file can call one in any other. Keep that order: `core/config.js` opens the wrapper and `start/boot.js` closes it and starts the app.

| Folder | What's in it |
|---|---|
| `core/` | Settings and role list (`config`), helpers, meeting state, merging and field-level sync, timer maths, page rendering, the 1-second tick, peer-to-peer sync (`sync`). |
| `roles/` | One screen per role: `timer`, `table-topics-master`, `ah-counter-grammarian`, `toastmaster` (+ `toastmaster-order`), `evaluator`, `general-evaluator`, `round-robin-master`, `speaker`, `participant`, `president-saa`; `shared` has the lists several roles use. |
| `agenda/` | Agenda data and role players, agenda timing (move, lengths, shift), how the agenda ran, the printed agenda, templates. |
| `coordinator/` | PIN, member types, the Coordinator screen and sub-tabs with the health check, dry run and automatic copies, co-organisers, attendance. |
| `features/` | Things several roles use: voting, private feedback and history, finish meeting, meeting record, report, RSVP, practice meeting, progress, role guides, connection check, guest check-in, nudges, next-meeting card, issues & ideas, linked roles, install. |
| `events/` | Click and input handlers for the main screens. |
| `start/` | The start screen (join, who are you), several roles on one device, and `boot` (starts everything). |
| `ui/` | Navigation, focus mode, tips, accessibility helpers, projector view, display settings, ⋯ More, Home/About. |

## What the tests cover

| Test | Checks |
|---|---|
| `01-sync` | Host and join with a code; member list reaches new phones; today's roles pre-ticked; one person on two devices counts once |
| `02-timer` | Start, pause, resume, stop; the speaker's own live card; the report notes pauses |
| `03-private-feedback` | Evaluations are encrypted for the speaker; only they can read them; no plaintext in anyone's synced data |
| `04-organisers` | Co-organiser invite unlocks without the PIN; simultaneous edits by two organisers are all kept; Remove access works |
| `05-table-topics` | Table Topics speakers shared out between evaluators; one person's roles follow the Timer and each other |
| `06-finish-and-record` | Finish meeting prompts and statuses; meeting record restores everything on a new device |
| `07-practice-and-reset` | Practice meeting is separate from real data; Reset device clears everything |
| `08-accessibility` | WCAG 2.1 AA (axe-core) on the main screens in light and dark |
| `10-guests-nudges-templates` | Agenda templates; speaker reminder and calendar file; guest self check-in incl. a guest speaker; "you're up next" nudges |
| `11-agenda-timing` | Move agenda items up/down keeping their length; change a length, shift or re-start the whole agenda; insert/remove items; the Toastmaster's +5 / −5 / "next starts now" on the day without changing the printed times; President/organiser back-up controls; organiser undo; drag to reorder; "How the agenda ran" summary |
| (all) | `lib.js` `coTab(page, "setup"|"agenda"|"people"|"after")` switches the Coordinator sub-tab; `08-accessibility` checks all four |
| `12-undo` | Undo after removing a guest (President) and a filler word (Ah-Counter) |
| `18-round-robin-random` | Round Robin: one question for everyone, random pick one at a time (each person once), take a queued person off the queue, remove a typed-in name, "only people here" |
| `17-round-robin-bell` | Round Robin: the speaker's own phone shows the live clock and rings the bell (Timer's device silent unless switched on); the Round Robin Master's screen follows the Timer (queued → speaking → done) |
| `16-sample-leak-repair` | A device whose real meeting picked up the practice sample data is repaired on load (sample members, speeches, topics and PIN 1234 removed; real members kept) |
| `15-practice-multi-device` | Practice meeting on several devices: invite link stays in practice mode; a typed practice code moves a real phone into practice mode without touching its real data |
| `14-before-the-meeting` | Health check (incl. a phone on the same version), group-chat reminders, dry run banner and clean-up (test members removed, role players kept), automatic copy on Finish meeting |
| `13-new-meeting-carry-over` | New meeting carries role players over and moves the date, week and meeting number on; RSVP folds once answered |
| `09-member-types` | Speechcrafter / Toastmaster / Guest types, club, start-screen groups, awards eligibility and its switch syncing |

## Tips

- Open `index.html?as=test1` and `index.html?as=test2` in two tabs to act as two separate devices on one computer (each `as=` gets its own storage).
- Add `?relay=ws://127.0.0.1:7000` and run `node tests/relay.js` to connect devices through the local test relay instead of the public ones.
- Bump `APP_VERSION` in `src/js/ui/home-about.js` (and the cache name in `sw.js` when the file list changes) for each release.
