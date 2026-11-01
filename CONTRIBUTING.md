# Changing the app

The app is one HTML file (`index.html`) so it can be downloaded, opened offline and hosted on GitHub Pages. **Don't edit `index.html` directly** — it's built from the source in `src/`.

## Layout

| Path | What it is |
|---|---|
| `src/app.html` | The app source: HTML, CSS and JavaScript. Edit this. |
| `src/build.py` | Builds `index.html` by inlining the logos and libraries. |
| `src/assets/` | Toastmasters and Dijital Team logos (as data URIs). |
| `src/vendor/` | Bundled libraries (Trystero for encrypted peer-to-peer sync, qrcode-generator) — see its README. |
| `index.html` | The built app (published by GitHub Pages). |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Install-as-an-app files and offline helper. |
| `tests/` | Multi-device browser tests and a local test relay. |
| `.github/ISSUE_TEMPLATE/` | 🐞 Problem and 💡 Idea forms used by the in-app reports. |
| `docs/` | Dry-run checklist and other notes. |

## Make a change

1. Edit `src/app.html`.
2. Build: `python3 src/build.py` (writes `index.html`).
3. Test (needs Node 20+):
   ```
   cd tests
   npm install
   npx playwright install chromium
   npm test              # all tests, about a minute
   npm test -- 02        # just the timer test
   ```
4. Commit `src/app.html` **and** the rebuilt `index.html` together, then push. GitHub Pages updates the live site within a minute or two.

Every push runs the **Tests** workflow (Actions tab): it checks that `index.html` was rebuilt from `src/` and runs all the tests. A red ✗ on the commit means something broke — open the run to see which test and why.

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
| `09-member-types` | Speechcrafter / Toastmaster / Guest types, club, start-screen groups, awards eligibility and its switch syncing |

## Tips

- Open `index.html?as=test1` and `index.html?as=test2` in two tabs to act as two separate devices on one computer (each `as=` gets its own storage).
- Add `?relay=ws://127.0.0.1:7000` and run `node tests/relay.js` to connect devices through the local test relay instead of the public ones.
- Bump `APP_VERSION` in `src/app.html` (and the cache name in `sw.js` when the file list changes) for each release.
