// Agenda timing: move items up/down keeping their length, change a length (everything after moves),
// shift the whole agenda, insert an item; on the day the Toastmaster pushes the rest later without changing the printed times.
const T = require("./lib");
const rows = (p) => p.$$eval(".agrow", (rs) => rs.map((r) => ({ id: r.dataset.iid, time: r.querySelector(".agtime").value, dur: (r.querySelector(".agdur") || {}).value || null, text: r.querySelector(".agtext").value })));
const add = (hm, d) => { const [h, m] = hm.split(":").map(Number); const t = h * 60 + m + d; return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C);
  const r0 = await rows(C);
  T.assert.ok(r0.length > 8, "standard agenda loaded");
  T.assert.strictEqual(r0[r0.length - 1].dur, null, "last item shows 'end'");

  // ▲ on item 3: it takes item 2's slot, keeps its own length; item 2 follows straight after
  await C.click(`[data-iid="${r0[2].id}"] [data-agmv="-1"]`);
  await T.eventually(async () => (await rows(C))[1].id === r0[2].id, "item moved up");
  let r1 = await rows(C);
  T.assert.strictEqual(r1[1].time, r0[1].time, "moved item starts in the earlier slot");
  T.assert.strictEqual(r1[1].dur, r0[2].dur, "moved item keeps its length");
  T.assert.strictEqual(r1[2].id, r0[1].id); T.assert.strictEqual(r1[2].time, add(r0[1].time, +r0[2].dur));
  T.assert.strictEqual(r1[3].time, r0[3].time, "items after the pair are unchanged");
  // ▼ puts it back
  await C.click(`[data-iid="${r0[2].id}"] [data-agmv="1"]`);
  await T.eventually(async () => JSON.stringify((await rows(C)).map((r) => r.id + r.time)) === JSON.stringify(r0.map((r) => r.id + r.time)), "moved back to the original times");

  // length of the first item +5 → every later item 5 min later
  await C.fill(`[data-iid="${r0[0].id}"] .agdur`, String(+r0[0].dur + 5)); await C.press(`[data-iid="${r0[0].id}"] .agdur`, "Tab");
  await T.eventually(async () => (await rows(C))[1].time === add(r0[1].time, 5), "later items moved");
  r1 = await rows(C);
  T.assert.strictEqual(r1[0].time, r0[0].time); T.assert.strictEqual(r1[r1.length - 1].time, add(r0[r0.length - 1].time, 5));
  // whole agenda −5 and start time
  await C.click('[data-agshift="-5"]');
  await T.eventually(async () => (await rows(C))[0].time === add(r0[0].time, -5), "shift all −5");
  await C.fill("#agStart", "18:00"); await C.press("#agStart", "Tab");
  await T.eventually(async () => (await rows(C))[0].time === "18:00", "start time moves everything");
  r1 = await rows(C);
  T.assert.strictEqual(r1[1].time, add("18:00", +r1[0].dur));
  T.assert.match(await C.innerText("#agSpan"), /6:00 pm – /);
  // ＋ inserts a 5-minute item below and pushes the rest
  await C.click(`[data-iid="${r1[0].id}"] [data-agins]`);
  await T.eventually(async () => (await rows(C)).length === r1.length + 1, "item inserted");
  const r2 = await rows(C);
  T.assert.strictEqual(r2[1].time, r1[1].time); T.assert.strictEqual(r2[1].dur, "5"); T.assert.strictEqual(r2[2].id, r1[1].id); T.assert.strictEqual(r2[2].time, add(r1[1].time, 5));
  T.assert.ok(await C.evaluate(() => document.activeElement && document.activeElement.classList.contains("agtext")), "focus goes to the new item's text");
  await C.click(`[data-iid="${r2[1].id}"] [data-itdel]`);
  await T.eventually(async () => JSON.stringify((await rows(C)).map((r) => r.id + r.time)) === JSON.stringify(r1.map((r) => r.id + r.time)), "removing the item moves the rest back up");

  // the Toastmaster: running late → +5 min for the rest; printed agenda keeps the planned times
  const M = await T.device(b, { phone: true });
  await T.join(M, code, "SC Nimega Dilshara", ["tmod"]);
  await T.eventually(async () => (await M.$$("[data-run]")).length === r1.length, "run-sheet synced");
  await M.click("#runStart");
  await M.click('[data-runadj="5"]');
  await T.eventually(async () => /5 min later/.test(await M.innerText(".runadj")), "Toastmaster sees the adjustment");
  const second = await M.innerText(`[data-run="${r1[1].id}"] .n`);
  T.assert.match(second, new RegExp(fmt(add(r1[1].time, 5)))); T.assert.match(second, new RegExp(fmt(r1[1].time)), "original time shown struck through");
  T.assert.match(await M.innerText(".wcard"), new RegExp(fmt(add(r1[1].time, 5))), "Next card shows the new time");
  await T.eventually(async () => /"adj":\{[^}]*"/.test(await T.stored(C)) && (await T.stored(C)).includes(r1[1].id), "adjustment synced to the coordinator");
  T.assert.strictEqual((await rows(C))[1].time, r1[1].time, "planned agenda unchanged");
  await M.click("#runRetime");
  await T.eventually(async () => { const n = await M.evaluate(() => { const d = new Date(); return Math.ceil(d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60); }); const hm = String(Math.floor(n / 60) % 24).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0"); return new RegExp(fmt(hm)).test(await M.innerText(".wcard")); }, "next item re-timed to now");
  await M.click("#runAdjReset");
  await T.eventually(async () => !/later|earlier/.test(await M.innerText(".runadj")), "back to printed times");
  T.noErrors(C, M);
};
function fmt(hm) { const [h, m] = hm.split(":").map(Number); return ((h + 11) % 12 + 1) + ":" + String(m).padStart(2, "0") + (h < 12 ? " am" : " pm"); }
