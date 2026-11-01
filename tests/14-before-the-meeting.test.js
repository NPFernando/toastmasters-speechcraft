// Before the meeting: health check, group-chat reminders, dry run with one-tap clean-up, automatic meeting-record copies.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C);
  // health check flags what's missing
  await T.eventually(async () => /Ready for the meeting\?[\s\S]*to check/.test(await C.innerText(".health")), "health check shows items to check");
  T.assert.match(await C.innerText(".health"), /Members[\s\S]*None yet/);
  // dry run: banner everywhere, test members marked
  await C.click("#dryStart");
  await T.eventually(async () => /Dry run/.test(await C.innerText(".drybanner")), "dry-run banner on the organiser");
  await T.addMembers(C, ["SC Laurel Senanayake", "SC Rashmi Maneesha", "SC Nimega Dilshara"]);
  await C.fill("#mDate", "2026-11-06"); await C.press("#mDate", "Tab");
  await T.setRole(C, "tmod", "SC Nimega Dilshara"); await T.setRole(C, "timer", "SC Rashmi Maneesha");
  await C.fill("[data-rpadd-in=speakers]", "SC Laurel Senanayake"); await C.click("[data-rpadd=speakers]");
  await C.fill("[data-rpadd-in=sevals]", "SC Rashmi Maneesha"); await C.click("[data-rpadd=sevals]");
  await C.selectOption('[data-assign="SC Laurel Senanayake"]', "SC Rashmi Maneesha");
  const P = await T.device(b, { phone: true });
  await T.join(P, code, "SC Rashmi Maneesha", ["timer"]);
  await T.eventually(async () => /Dry run/.test(await P.innerText("#view")), "dry-run banner on a phone");
  await T.eventually(async () => /Devices[\s\S]*1 other device connected · all on/.test(await C.innerText(".health")), "health check sees the phone on the same version").catch(async (e) => { console.log(await C.innerText(".health")); throw e; });
  // reminders for the group chat
  await C.click("#remCopy");
  const txt = await C.evaluate(() => navigator.clipboard.readText());
  T.assert.match(txt, /SC Laurel Senanayake: Prepared speech[^\n]*Evaluator: SC Rashmi Maneesha/);
  T.assert.match(txt, /SC Nimega Dilshara: Toastmaster of the Day/);
  T.assert.match(txt, /Still needed: [^\n]*Ah-Counter/);
  // some timing happens on the phone, then the organiser saves a copy automatically on Finish meeting
  await P.click("[data-tab=ps]"); await P.click('#view [data-act="start"]'); await T.sleep(1200); await P.click('#view [data-act="stop"]');
  await T.coTab(C, "after"); await C.click("#finStart");
  await T.eventually(async () => /Finish meeting ·/.test(await C.innerText("#view")), "automatic copy listed");
  // finish the dry run: data cleared on every device, test members gone, role players kept
  await T.coTab(C, "setup");
  await C.click("#dryEnd");
  await T.eventually(async () => !(await C.$(".drybanner")), "banner gone on the organiser");
  await T.eventually(async () => !(await P.$(".drybanner")), "banner gone on the phone");
  await T.eventually(async () => !(await P.$('#view [data-act="stop"], #view .done')), "timing cleared on the phone").catch(() => {});
  T.assert.strictEqual(await C.inputValue("[data-rp=tmod]"), "SC Nimega Dilshara", "role players kept");
  await T.coTab(C, "people");
  T.assert.strictEqual((await C.$$("[data-mdel]")).length, 0, "test members removed");
  T.noErrors(C, P);
};
