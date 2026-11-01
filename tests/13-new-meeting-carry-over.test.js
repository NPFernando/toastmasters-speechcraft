// New meeting: carry this week over as next week's draft (role players kept; date, week and meeting number move on).
// Also: "Coming to this meeting?" folds away once answered.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  await T.solo(C, "Naveen", ["coord"]);
  await T.setCoordPin(C);
  await T.addMembers(C, ["SC Laurel Senanayake", "SC Rashmi Maneesha"]);
  await C.fill("#mDate", "2026-11-06"); await C.press("#mDate", "Tab");
  await C.selectOption("#mWeek", "Week 6 of 10");
  await C.fill("[data-ag=no]", "05"); await C.press("[data-ag=no]", "Tab");
  await T.setRole(C, "tmod", "SC Rashmi Maneesha");
  await C.click("#moreBtn").catch(() => {});
  await C.evaluate(() => document.getElementById("newMeeting").click());
  T.assert.ok(C._dialogs.some((d) => /Carry this week over/.test(d)), "carry-over question asked");
  await T.eventually(async () => (await C.inputValue("#mDate")) === "2026-11-13", "date moves on a week");
  T.assert.strictEqual(await C.inputValue("#mWeek"), "Week 7 of 10");
  T.assert.strictEqual(await C.inputValue("[data-ag=no]"), "06");
  T.assert.strictEqual(await C.inputValue("[data-rp=tmod]"), "SC Rashmi Maneesha", "role players kept as a draft");
  // RSVP folds once answered
  await C.click("#homeBtn"); await C.click("#wChange"); await T.pickWho(C, "SC Laurel Senanayake", ["member"]);
  await C.click('[data-rsvp="in"]');
  await T.eventually(async () => /Coming to this meeting\? In person/.test((await C.innerText("details.fold summary")).replace(/\s+/g, " ")), "RSVP folded with the answer");
  T.noErrors(C);
};
