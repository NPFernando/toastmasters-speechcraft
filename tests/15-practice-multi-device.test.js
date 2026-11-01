// Practice meeting on several devices: the invite link/QR joins in practice mode; typing a practice code into the
// normal app moves that phone into practice mode instead of mixing sample data into its real meeting.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b, { url: T.URL + "&as=practice" });
  const code = await T.host(C, "Janani Kumar", ["coord"]);
  // invite link (what the QR holds) keeps practice mode
  const A = await T.device(b, { phone: true, url: T.URL + "&as=practice#join=" + code });
  await A.waitForSelector("#wGrid", { timeout: 20000 });
  T.assert.ok(await A.isVisible("#practiceBar.on"), "invite link opens in practice mode");
  await A.click('[data-wname="Dilini Jayasinghe"]'); await A.click("#wNext"); await A.click("[data-tipsdone]", { timeout: 1500 }).catch(() => {});
  T.assert.match(await A.innerText(".rtabs"), /Timer/, "sample role pre-selected from the practice agenda");
  // a phone with real data types the practice code
  const B = await T.device(b);
  await T.solo(B, "Real Person", ["timer"]);
  const realBefore = await T.stored(B);
  await B.click("#homeBtn"); if (!(await B.isVisible("#wCode"))) await B.click("[data-wstep=connect], #wBack, #wJoinOther").catch(() => {});
  await B.fill("#wCode", code); await B.click("#wJoin");
  await T.eventually(async () => /as=practice/.test(B.url()), "typed practice code switches to practice mode", 20000);
  await B.waitForSelector("#wGrid", { timeout: 20000 });
  T.assert.ok(await B.isVisible("#practiceBar.on"));
  T.assert.ok(!/Amal Perera|Dilini Jayasinghe/.test(await T.stored(B)), "real data has no sample names");
  T.assert.ok(realBefore.includes("Real Person") && (await T.stored(B)).includes("Real Person"), "real data kept");
  await T.eventually(async () => /Dilini Jayasinghe/.test(await C.innerText("#roles")), "practice host sees the practice phone");
  T.noErrors(C, A);
};
