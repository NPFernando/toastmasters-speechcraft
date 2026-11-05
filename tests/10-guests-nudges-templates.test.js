// Guest self check-in (incl. a guest speaker), "you're up next" nudges, agenda templates, next-meeting reminders + calendar.
const fs = require("fs");
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C);
  await T.addMembers(C, ["SC Laurel Senanayake", "SC Rashmi Maneesha", "SC Nimega Dilshara"]);
  await C.fill("#mDate", "2026-11-06"); await C.press("#mDate", "Tab");
  await T.setRole(C, "tmod", "SC Nimega Dilshara"); await T.setRole(C, "keynote", "TM Nalin De Abrew");
  await C.fill("[data-rpadd-in=speakers]", "SC Laurel Senanayake"); await C.click("[data-rpadd=speakers]");
  await C.fill("[data-rpadd-in=sevals]", "SC Rashmi Maneesha"); await C.click("[data-rpadd=sevals]");
  await C.selectOption('[data-assign="SC Laurel Senanayake"]', "SC Rashmi Maneesha");
  // agenda templates: save a shortened agenda, restore the standard one, load the saved one
  await T.coTab(C, "agenda");
  const nItems = async () => (await C.$$(".agrow")).length;
  const full = await nItems();
  await C.click(".agrow:last-child [data-itdel]"); await C.click(".agrow:last-child [data-itdel]");
  C._answer = "Short week"; await C.click("#tplSave");
  await C.selectOption("#tplSel", "std"); await T.eventually(async () => (await nItems()) === full, "standard template restores all items");
  await C.selectOption("#tplSel", { label: "Short week · " + (full - 2) + " items" }); await T.eventually(async () => (await nItems()) === full - 2, "saved template loads");
  await C.selectOption("#tplSel", "std");
  // speaker sees next week's reminder and can add it to their calendar
  const L = await T.device(b, { phone: true });
  await T.join(L, code, "SC Laurel Senanayake", ["speaker"]);
  await L.fill("[data-sp=title]", "My first job"); await L.press("[data-sp=title]", "Tab");
  await T.eventually(async () => /Prepared speech — “My first job”[\s\S]*Evaluator: SC Rashmi Maneesha/.test(await L.innerText("#view .upc")), "speaker reminder with title and evaluator");
  const [dl] = await Promise.all([L.waitForEvent("download"), L.click("[data-ics]")]);
  const ics = fs.readFileSync(await dl.path(), "utf8");
  T.assert.match(ics, /DTSTART:20261106T173000/); T.assert.match(ics, /SUMMARY:Speechcraft – Prepared speech/); T.assert.match(ics, /TRIGGER:-P1D/);
  // guests check themselves in by QR link; a guest who is on the agenda becomes a Speaker
  const G = await T.device(b, { phone: true, url: T.URL + "#join=" + code + "&guest=1" });
  await T.eventually(async () => !(await G.isDisabled("#gCheck")), "guest form enabled once connected", 20000);
  await G.fill("#gName", "Kasun Perera"); await G.fill("#gFrom2", "LinkedIn"); await G.click("#gCheck");
  await T.eventually(async () => /checked in, Kasun Perera/.test(await G.innerText("#wbox")), "guest checked in");
  await G.click("#gDone");
  T.assert.match(await G.innerText("#roles"), /Participant/);
  const K = await T.device(b, { phone: true, url: T.URL + "#join=" + code + "&guest=1" });
  await T.eventually(async () => !(await K.isDisabled("#gCheck")), "second guest connected", 20000);
  await K.fill("#gName", "TM Nalin De Abrew"); await K.click("#gCheck");
  await T.eventually(async () => /agenda as an educational presenter/.test(await K.innerText("#wbox")), "guest speaker recognised");
  await K.click("#gDone");
  T.assert.match(await K.innerText("#roles"), /Educational Presenter/);
  await T.coTab(C, "people");
  await T.eventually(async () => { const t = await C.innerText("#view"); return /Kasun Perera/.test(t) && /TM Nalin De Abrew/.test(t); }, "guests in the Coordinator's attendance");
  // "you're up next": the Toastmaster moves through the agenda; the speaker is nudged before their session
  const M = await T.device(b); await T.join(M, code, "SC Nimega Dilshara", ["tmod"]);
  await M.click("#runStart");
  for (let i = 0; i < 5; i++) { await M.click("#runNext"); await T.sleep(250); }
  await T.eventually(async () => /You.re up next: Toastmaster of the Day/.test(await L.innerText("#nudge")), "speaker nudged before the Prepared Speech session");
  await T.eventually(async () => /You.re on now: Educational Presenter/.test(await K.innerText("#nudge")), "keynote guest nudged when it's their turn");
  T.noErrors(C, L, G, K, M);
};
