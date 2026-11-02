// Runs every *.test.js with a fresh test relay and browser; exits 1 if any test fails.
const fs = require("fs"), path = require("path");
const T = require("./lib");
(async () => {
  const only = process.argv.slice(2);
  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js") && (!only.length || only.some((o) => f.includes(o)))).sort();
  let failed = 0;
  for (const f of files) {
    const relay = await T.startRelay();
    const b = await T.browserType.launch();
    const t0 = Date.now();
    try { await require(path.join(__dirname, f))(b); console.log("✓ " + f + "  (" + ((Date.now() - t0) / 1000).toFixed(1) + "s)"); }
    catch (e) { failed++; console.log("✗ " + f + "\n    " + String(e && e.message || e).split("\n").slice(0, 6).join("\n    ")); }
    finally { await b.close().catch(() => {}); relay.kill(); await T.sleep(300); }
  }
  console.log("\n" + T.BROWSER + ": " + (files.length - failed) + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})();
