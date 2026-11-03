// Round Robin: one question; the Round Robin Master picks people at random (each person once) or queues everyone
// left in a random order; "only people here" limits the draw to people checked in or connected.
const T = require("./lib");
const queued = (p) => p.$$eval(".chip", (cs) => cs.filter((c) => c.textContent.includes("⏳")).map((c) => c.textContent.replace("⏳", "").trim()));
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C);
  await T.addMembers(C, ["Amal", "Bhagya", "Chathura", "Dilini"]);
  const R = await T.device(b, { phone: true });
  await T.join(R, code, "Dilini", ["rrm"]);
  await R.fill("#rrInput", "What made you smile this week?"); await R.click("#rrAdd"); await R.click("#rrNext");
  // only people here: of the members, only Dilini is connected
  await T.eventually(async () => await R.isChecked("#rrHere"), "only-people-here is on when people are connected");
  await T.eventually(async () => /0 of 1 have had a turn/.test(await R.innerText("#view")), "pool is the members here (Dilini)");
  await R.uncheck("#rrHere");
  await T.eventually(async () => /0 of 4 have had a turn · 4 to go/.test(await R.innerText("#view")), "pool is everyone on the list");
  // two random picks: two different people, the latest shown big
  await R.click("#rrRandom");
  await T.eventually(async () => (await queued(R)).length === 1, "first person queued");
  await R.click("#rrRandom");
  await T.eventually(async () => (await queued(R)).length === 2, "second person queued");
  const q = await queued(R);
  T.assert.notStrictEqual(q[0], q[1], "two different people");
  await T.eventually(async () => /🎲/.test(await R.innerText(".rrpick")), "picked name shown big");
  T.assert.match(await R.innerText("#view"), /2 of 4 have had a turn · 2 to go/);
  // the rest in a random order
  await R.click("#rrShuffleAll");
  await T.eventually(async () => /🎉 Everyone has had a turn/.test(await R.innerText("#view")), "everyone queued");
  T.assert.ok(await R.isDisabled("#rrRandom"));
  // the Timer has them all queued for this question
  const M = await T.device(b);
  await T.join(M, code, "Gihan", ["timer"]);
  await M.click("[data-tab=rr]");
  await T.eventually(async () => (await M.$$("#view tr[data-id]")).length === 4, "four queued on the Timer");
  T.noErrors(C, R, M);
};
