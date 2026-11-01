# Bundled libraries

Both are inlined into `index.html` by `src/build.py`, so the app is a single file that works offline.

| File | Library | Version | Licence |
|---|---|---|---|
| `trystero.iife.js` | [Trystero](https://github.com/dmotz/trystero) (Nostr strategy) — encrypted peer-to-peer rooms | 0.26.0 | MIT |
| `qrcode.min.js` | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 1.4.4 | MIT |

`trystero.iife.js` was built with esbuild from `export {joinRoom, selfId, getRelaySockets, defaultRelayUrls} from 'trystero'` as an IIFE with the global name `Trystero`:

```
npx esbuild entry.mjs --bundle --format=iife --global-name=Trystero --minify --outfile=trystero.iife.js
```
