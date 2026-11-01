// ↩ Undo after an accidental removal, for every role (not just organisers)
const T = require("./lib");
module.exports = async (b) => {
  const P = await T.device(b, { phone: true });
  await T.solo(P, "Laurel", ["president", "ah"]);
  // President: remove a guest, then undo
  await P.fill("#gName", "Kasun Perera"); await P.click("#gAdd");
  await T.eventually(async () => /Kasun Perera/.test(await P.innerText("#view")), "guest added");
  await P.click("[data-gdel]");
  await T.eventually(async () => !/Kasun Perera/.test(await P.innerText("#view")), "guest removed");
  await P.click("#toastUndo");
  await T.eventually(async () => /Kasun Perera/.test(await P.innerText("#view")), "guest back after undo");
  // Ah-Counter: remove a filler word, then undo
  await P.click('[data-rtab="ah"]');
  await P.click("summary:has-text(\"Words to count\")");
  const w = await P.getAttribute("[data-wdel]", "data-wdel");
  await P.click(`[data-wdel="${w}"]`);
  await T.eventually(async () => !(await P.$(`[data-wdel="${w}"]`)), "word removed");
  T.assert.match(await P.innerText("#toast"), /removed/);
  await P.click("#toastUndo");
  await T.eventually(async () => !!(await P.$(`[data-wdel="${w}"]`)), "word back after undo");
  T.noErrors(P);
};
