// A co-organiser joins with an invite (no PIN); simultaneous edits by both organisers are all kept.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C); await T.addMembers(C, ["Rashmi", "Laurel"]);
  await T.coTab(C, "people"); await C.fill("#coName", "Upeksha"); await C.click("#coInvite");
  const inv = (await C.innerText(".selcard .code")).trim().replace("-", "");
  const U = await T.device(b, { phone: true, url: T.URL + "#join=" + code + "&role=coord&co=" + inv });
  await T.eventually(async () => (await U.isVisible("#wDone")) && !(await U.isDisabled("#wDone")), "invite link connects", 20000).catch(() => {});
  if (await U.isVisible("#welcome.on")) await U.click("#wDone").catch(() => {});
  await T.eventually(() => U.isVisible("[data-ag=venue]"), "co-organiser unlocked without the PIN", 15000);
  T.assert.ok(!(await U.$("#pinChange")), "co-organiser can't change the PIN");
  await Promise.all([
    (async () => { await T.coTab(C, "setup"); await C.fill("[data-ag=venue]", "Level 12 East Tower WTC"); await C.press("[data-ag=venue]", "Tab"); await T.setRole(C, "tmod", "Rashmi"); await T.addMembers(C, ["Afraa"]); })(),
    (async () => { await U.fill("[data-ag=no]", "06"); await U.press("[data-ag=no]", "Tab"); await T.setRole(U, "ttm", "Laurel"); await T.addMembers(U, ["Danushka"]); })(),
  ]);
  const want = async (p) => (await p.inputValue("[data-ag=venue]")) === "Level 12 East Tower WTC" && (await p.inputValue("[data-ag=no]")) === "06" && (await p.inputValue("[data-rp=tmod]")) === "Rashmi" && (await p.inputValue("[data-rp=ttm]")) === "Laurel" && (await (async () => { await T.coTab(p, "people"); const n = (await p.$$("[data-mdel]")).length; await T.coTab(p, "setup"); return n; })()) === 4;
  await T.eventually(() => want(C), "all simultaneous edits kept on the Coordinator's device", 12000);
  await T.eventually(() => want(U), "all simultaneous edits kept on the co-organiser's device", 12000);
  await T.coTab(C, "people"); await C.click("[data-corevoke]");
  await T.eventually(async () => !(await U.isVisible("[data-ag=venue]")), "Remove access locks the co-organiser out");
  T.noErrors(C, U);
};
