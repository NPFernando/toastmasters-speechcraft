// Timer: start, pause, resume, stop; the speaker sees their own time; the report notes the pause.
const T = require("./lib");
module.exports = async (b) => {
  const M = await T.device(b);
  const code = await T.host(M, "Misfar", ["timer"]);
  const L = await T.device(b, { phone: true });
  await T.join(L, code, "Laurel", ["speaker"]);
  await M.click("[data-tab=ps]");
  await M.fill('#view input[placeholder^="Speaker name"]', "Laurel");
  await M.click("#qstart");
  await T.eventually(async () => /You are speaking/.test(await L.innerText("#nowStrip")), "speaker sees the big live card");
  await T.sleep(2200); await M.click("[data-act=livepause]");
  const c1 = await M.innerText("#live .clock");
  await T.eventually(async () => /PAUSED/i.test(await L.innerText("#nowStrip")), "speaker sees Paused");
  await T.sleep(2000);
  T.assert.strictEqual(await M.innerText("#live .clock"), c1, "clock frozen while paused");
  await M.click("[data-act=livepause]"); await T.sleep(1200);
  await M.click("[data-act=livestop]");
  await T.eventually(async () => !(await L.$("#nowStrip .mecard")), "speaker card goes away after Stop");
  await M.click('button:has-text("Copy report text")');
  const txt = await M.evaluate(() => navigator.clipboard.readText());
  T.assert.match(txt, /Laurel — 0:0\d — .*\(paused 0:0\d\)/, "report notes the pause");
  T.noErrors(M, L);
};
