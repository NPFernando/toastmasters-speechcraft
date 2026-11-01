// Table Topics speakers are shared out between evaluators; one person's roles follow the same speaker.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C); await T.addMembers(C, ["Rashmi", "Afraa", "Upeksha", "Danushka", "Laurel", "Misfar"]);
  await C.fill("[data-rpadd-in=ttevals]", "Rashmi, Afraa"); await C.click("[data-rpadd=ttevals]");
  const Q = await T.device(b); await T.join(Q, code, "Upeksha", ["ttm"]);
  const A = await T.device(b); await T.join(A, code, "Afraa", ["ah", "tteval"]);
  const M = await T.device(b); await T.join(M, code, "Misfar", ["timer"]);
  await Q.fill("#topicInput", "Best advice\nA place you love\nYour hero\nA small habit"); await Q.click("#addTopics");
  for (const n of ["Danushka", "Laurel", "Misfar"]) { await Q.click("[data-tact=pick]"); await Q.fill("#callName", n); await Q.click('button:has-text("Call speaker")'); await T.sleep(300); }
  await T.eventually(async () => JSON.stringify(await Q.$$eval("[data-ttev]", (e) => e.map((x) => x.dataset.ttev + ">" + x.value))) === JSON.stringify(["Danushka>Rashmi", "Laurel>Afraa", "Misfar>Rashmi"]), "speakers shared out to the evaluator with the fewest");
  // Timer starts Danushka: Afraa's Ah-Counter and TT-evaluator tabs both follow
  await M.click("[data-tab=tt]");
  await T.eventually(async () => (await M.$$("#view tr[data-id]")).length >= 3, "Timer has the called speakers");
  const rowId = await M.$$eval("#view tr[data-id]", (trs) => { const tr = trs.find((r) => (r.querySelector("[data-edit=name]") || {}).value === "Danushka"); return tr && tr.dataset.id; });
  T.assert.ok(rowId, "Danushka is on the Timer's Table Topics list");
  await M.click('#view tr[data-id="' + rowId + '"] [data-act=start]');
  await T.eventually(async () => /Speaking now: Danushka/.test((await A.innerText("#roles")).replace(/\s+/g, " ")), "linked roles follow the Timer");
  await A.click("[data-rtab=tteval]");
  T.assert.strictEqual(await A.$eval("[data-evsel].active", (e) => e.dataset.evsel), "Danushka");
  await A.click('[data-evsel="Laurel"]'); await A.click("[data-rtab=ah]");
  await T.eventually(async () => /Following Laurel/.test((await A.innerText("#roles")).replace(/\s+/g, " ")), "choosing in one role selects in the other");
  T.noErrors(C, Q, A, M);
};
