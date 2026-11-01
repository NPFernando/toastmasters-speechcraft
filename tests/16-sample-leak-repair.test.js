// A device whose real meeting picked up the practice sample data (older versions) is repaired on load:
// sample members, roles, speeches, topics and the sample PIN go; real members stay.
const T = require("./lib");
module.exports = async (b) => {
  const p = await T.device(b, { url: T.FILE + "?as=practice" });
  await p.click("#wSolo"); await T.pickWho(p, "Janani Kumar", ["coord"]);
  // simulate the old leak: practice data plus one real member copied into the real meeting's storage
  await p.evaluate(() => { const st = JSON.parse(localStorage.getItem("speechcraftMeeting.v2.practice")); st.members.list.push({ id: "real1", name: "Naveen Fernando" }); localStorage.setItem("speechcraftMeeting.v2", JSON.stringify(st)); });
  await p.goto(T.FILE);
  await p.click("#wSolo"); await p.waitForSelector("#wGrid");
  const who = await p.innerText("#wbox");
  T.assert.ok(!/Amal Perera|Janani Kumar/.test(who), "sample names gone from Who are you?");
  T.assert.match(who, /Naveen Fernando/, "real member kept");
  const st = JSON.parse(await T.stored(p));
  T.assert.strictEqual(st.speeches.length, 0); T.assert.strictEqual(st.topics.length, 0);
  T.assert.ok(!st.pin.hash, "sample PIN 1234 cleared");
  T.assert.notStrictEqual(st.agenda.title, "Practice Meeting");
  // the practice meeting itself is untouched
  T.assert.ok(/Amal Perera/.test(await p.evaluate(() => localStorage.getItem("speechcraftMeeting.v2.practice"))));
  T.noErrors(p);
};
