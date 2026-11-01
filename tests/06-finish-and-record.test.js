// Finish meeting: each role confirms; the meeting record restores everything on a new device.
const fs = require("fs"), os = require("os"), path = require("path");
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C); await T.addMembers(C, ["Misfar", "Afraa"]);
  await T.setRole(C, "timer", "Misfar"); await T.setRole(C, "ah", "Afraa");
  const M = await T.device(b); await T.join(M, code, "Misfar", ["timer"]);
  await C.click("#finStart");
  await T.eventually(async () => /The Coordinator is finishing the meeting/.test(await M.innerText("#finSheet")), "Timer gets the finish prompt");
  T.assert.match(await M.innerText("#finSheet"), /No times recorded/, "simple check shown");
  await M.click("[data-findone=timer]");
  await T.eventually(async () => /Timer\s+Misfar\s+✓ Complete/.test(await C.innerText("#endCard")), "Coordinator sees Timer complete");
  T.assert.match(await C.innerText("#endCard"), /Ah-Counter\s+Afraa\s+Waiting/);
  const [dl] = await Promise.all([C.waitForEvent("download"), C.click("#endSave")]);
  const file = path.join(os.tmpdir(), "sc-record-" + Date.now() + ".json"); await dl.saveAs(file);
  const fresh = await T.device(b, { url: T.FILE });
  await fresh.click("#wSolo"); await T.pickWho(fresh, "Naveen", ["coord"]);
  await fresh.setInputFiles("#restoreFile", file);
  await fresh.fill("#pinIn", "2468"); await fresh.click("#pinUnlock");
  await T.eventually(async () => (await fresh.inputValue("[data-rp=timer]")) === "Misfar", "record restores the role players");
  fs.unlinkSync(file);
  T.noErrors(C, M, fresh);
};
