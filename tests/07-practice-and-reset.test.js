// Practice meeting is separate from the real one; Reset device clears everything.
const T = require("./lib");
module.exports = async (b) => {
  const p = await T.device(b, { url: T.FILE });
  await p.click("#wSolo"); await T.pickWho(p, "Naveen", ["coord"]);
  await T.setCoordPin(p, "9999"); await T.addMembers(p, ["Real Person"]);
  await p.click("#moreBtn"); await p.click("#practiceBtn"); await p.waitForLoadState("load");
  T.assert.ok(p.url().includes("as=practice"));
  await p.click("#wSolo"); await T.pickWho(p, "Janani Kumar", ["coord"]);
  await T.eventually(() => p.isVisible("[data-ag=venue]"), "practice Coordinator unlocked (PIN 1234)");
  T.assert.strictEqual((await p.$$("[data-mdel]")).length, 10, "ten sample members");
  T.assert.ok(!(await p.innerText("#view")).includes("Real Person"), "real data not visible in practice");
  await p.click("#prLeave"); await p.waitForLoadState("load");
  T.assert.ok((await p.innerText("body")).includes("Real Person"), "real data back after leaving practice");
  await p.click("#moreBtn"); await p.click("#aboutBtn"); await p.click("#cleanDevice"); await p.waitForLoadState("load");
  await p.click("#wSolo"); await T.pickWho(p, "", ["coord"]);
  T.assert.ok(await p.isVisible("#pin1"), "after reset the PIN is gone");
  T.noErrors(p);
};
