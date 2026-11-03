// Round Robin: the person being timed sees their live clock and hears/sees the bell on their own phone (any role);
// the Round Robin Master's screen follows the Timer live (queued → speaking → done).
const T = require("./lib");
module.exports = async (b) => {
  const M = await T.device(b);
  const code = await T.host(M, "Dilini", ["timer"]);
  const R = await T.device(b, { phone: true });
  await T.join(R, code, "Hiruni Wickrama", ["rrm"]);
  await R.fill("#rrQ", "What made you smile this week?"); await R.click("#rrStart");
  const P = await T.device(b, { phone: true });
  await T.join(P, code, "Eshan Rodrigo", ["member"]);
  await M.click("[data-tab=rr]");
  await M.fill('[data-lim="b"]', "3"); await M.press('[data-lim="b"]', "Tab");
  // the Timer adds and starts the speaker directly: it still counts for the current question on the RRM's screen
  await M.fill("#qname", "Eshan Rodrigo"); await M.click("#qadd");
  await T.eventually(async () => /⏳ Eshan Rodrigo/.test(await R.innerText("#view")), "RRM sees the speaker queued");
  await M.click('#view [data-act="start"]');
  await T.eventually(async () => /Eshan Rodrigo is speaking/.test(await R.innerText(".rrstat")) && /🎙 Eshan Rodrigo/.test(await R.innerText("#view")), "RRM sees them speaking");
  await T.eventually(async () => /You are speaking · Round Robin[\s\S]*Within time[\s\S]*bell in/i.test(await P.innerText("#nowStrip")), "live card before the bell");
  T.assert.match(await P.innerText("#nowStrip"), /Sound on/);
  await T.eventually(async () => /BELL · TIME’S UP/i.test(await P.innerText("#nowStrip")), "bell shown on the speaker's phone", 8000);
  T.assert.match(await P.getAttribute(".mecard", "class"), /\bsr\b/);
  T.assert.ok((await P.evaluate(() => window.__bellRang || 0)) >= 1, "bell sound on the speaker's phone");
  T.assert.strictEqual(await M.evaluate(() => window.__bellRang || 0), 0, "Timer's device silent unless switched on");
  await M.click('#view [data-act="stop"]');
  await T.eventually(async () => /✓ 1 done/.test(await R.innerText(".rrstat")) && /✓ Eshan Rodrigo/.test(await R.innerText("#view")), "RRM sees them done");
  T.noErrors(M, P, R);
};
