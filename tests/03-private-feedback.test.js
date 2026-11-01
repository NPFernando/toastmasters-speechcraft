// Evaluations are encrypted for the speaker: only the speaker (with their PIN) can read them.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C); await T.addMembers(C, ["Ziony", "Rashmi"]);
  await C.fill("[data-rpadd-in=speakers]", "Ziony"); await C.click("[data-rpadd=speakers]");
  await C.fill("[data-rpadd-in=sevals]", "Rashmi"); await C.click("[data-rpadd=sevals]");
  await C.selectOption('[data-assign="Ziony"]', "Rashmi");
  const Z = await T.device(b, { phone: true });
  await T.join(Z, code, "Ziony", ["speaker"]);
  await Z.fill("[data-sp=title]", "The day I learned to fail");
  await Z.fill("#fbPin1", "753159"); await Z.fill("#fbPin2", "753159"); await Z.click("#fbCreate");
  const E = await T.device(b);
  await T.join(E, code, "Rashmi", ["seval"]);
  await E.click('[data-evsel="Ziony"]');
  await T.eventually(async () => /learned to fail/.test(await E.innerText(".selcard")), "evaluator sees the speech title");
  await E.fill("[data-evf=c1]", "SECRET-ABC123 great opener");
  await T.sleep(1500); await E.click("#evSubmit");
  await T.eventually(async () => /1 submitted evaluation/.test(await Z.innerText("#view")), "speaker gets the evaluation");
  await Z.click("#cardOpen");
  await T.eventually(async () => /SECRET-ABC123/.test(await Z.innerText("#report")), "speaker can read it");
  for (const p of [C, Z, E]) T.assert.ok(!(await T.stored(p)).includes("SECRET-ABC123"), "no plaintext in synced data");
  T.assert.ok(!(await C.evaluate(() => localStorage.getItem("speechcraftFeedback") || "")).includes("SECRET"), "coordinator has no copy");
  T.noErrors(C, Z, E);
};
