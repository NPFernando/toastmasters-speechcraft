// Round Robin: one question for everyone; the Round Robin Master adds people to the Timer's queue one at a time
// (tap a name or pick at random, each person once), can take a queued person off again, and can remove a typed-in name.
const T = require("./lib");
const chipsWith = (p, mark) => p.$$eval(".rrchip [data-rrcall]", (cs, m) => cs.filter((c) => c.textContent.includes(m)).map((c) => c.textContent.replace(m, "").trim()), mark);
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C);
  await T.addMembers(C, ["Amal", "Bhagya", "Chathura", "Dilini"]);
  const R = await T.device(b, { phone: true });
  await T.join(R, code, "Dilini", ["rrm"]);
  // one question, started from the empty screen; no question list or "next question"
  await R.fill("#rrQ", "What made you smile this week?"); await R.click("#rrStart");
  await T.eventually(async () => /the same for everyone[\s\S]*What made you smile this week\?/i.test(await R.innerText("#view")), "question shown");
  T.assert.ok(!(await R.$("#rrNext")) && !(await R.$("#rrShuffleAll")), "no next-question or queue-all buttons");
  // only people here: of the members, only Dilini is connected
  await T.eventually(async () => await R.isChecked("#rrHere"), "only-people-here is on when people are connected");
  await T.eventually(async () => /0 of 1 have had a turn/.test(await R.innerText("#view")), "pool is the members here (Dilini)");
  await R.uncheck("#rrHere");
  await T.eventually(async () => /0 of 4 have had a turn or are queued · 4 to go/.test(await R.innerText("#view")), "pool is everyone on the list");
  // random picks: one at a time, different people
  await R.click("#rrRandom");
  await T.eventually(async () => (await chipsWith(R, "⏳")).length === 1, "first person queued");
  await R.click("#rrRandom");
  await T.eventually(async () => (await chipsWith(R, "⏳")).length === 2, "second person queued");
  const q = await chipsWith(R, "⏳");
  T.assert.notStrictEqual(q[0], q[1], "two different people");
  await T.eventually(async () => /🎲/.test(await R.innerText(".rrpick")), "picked name shown big");
  // tap a queued person again: off the queue (with undo)
  await R.click(`.rrchip [data-rrcall="${q[1]}"]`);
  await T.eventually(async () => (await chipsWith(R, "⏳")).length === 1, "taken off the queue");
  T.assert.match(await R.innerText("#toast"), /off the queue/);
  // a typed-in guest name can be removed from the list (members can't)
  await R.fill("#rrGuest", "123"); await R.click("#rrGuestAdd");
  await T.eventually(async () => (await chipsWith(R, "⏳")).includes("123"), "guest queued");
  await R.click('.rrchip [data-rrcall="123"]');
  await T.eventually(async () => !!(await R.$('[data-rrforget="123"]')), "remove button once off the queue");
  await R.click('[data-rrforget="123"]');
  await T.eventually(async () => !(await R.$('.rrchip [data-rrcall="123"]')), "guest name removed");
  T.assert.ok(!(await R.$('[data-rrforget="Amal"]')), "members have no remove button");
  // the Timer gets exactly the queued person for this question
  const M = await T.device(b);
  await T.join(M, code, "Gihan", ["timer"]);
  await M.click("[data-tab=rr]");
  await T.eventually(async () => (await M.$$("#view tr[data-id]")).length === 1, "one queued on the Timer");
  T.noErrors(C, R, M);
};
