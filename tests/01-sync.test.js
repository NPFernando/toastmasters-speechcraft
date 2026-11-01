// Devices connect with a meeting code; set-up syncs; online list counts people, not devices.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  T.assert.match(code, /^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
  await T.setCoordPin(C);
  await T.addMembers(C, ["Afraa", "Rashmi", "Laurel"]);
  await T.setRole(C, "ah", "Afraa");
  const A = await T.device(b, { phone: true });
  await A.fill("#wCode", code); await A.click("#wJoin");
  await A.waitForSelector("[data-wname]", { timeout: 20000 });
  T.assert.deepStrictEqual((await A.$$eval("[data-wname]", (e) => e.map((x) => x.dataset.wname))).sort(), ["Afraa", "Laurel", "Rashmi"], "member names reach the new phone");
  await A.click('[data-wname="Afraa"]');
  T.assert.deepStrictEqual(await A.$$eval("#wGrid .rolecard.active", (e) => e.map((x) => x.dataset.wrole)), ["ah"], "today's role is pre-ticked");
  await A.click("#wNext");
  const A2 = await T.device(b, { phone: true });
  await T.join(A2, code, "Afraa", ["ah"]);
  await T.eventually(async () => /2 online/.test(await C.innerText("#connTxt")), "two people online (Afraa's two devices count once)");
  await T.eventually(async () => /2 devices/.test(await C.innerText("#roles")), "Afraa shown with 2 devices");
  T.noErrors(C, A, A2);
};
