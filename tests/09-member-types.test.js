// Speechcrafters, Toastmasters (graduated / visiting) and guests: type detection, club, awards, progress, sync.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  await T.setCoordPin(C);
  await T.addMembers(C, ["SC Afraa Faleel", "SC Rashmi Maneesha", "TM Nalin De Abrew"]);
  await T.coTab(C, "people"); await C.fill("#memIn", "Kasun Perera"); await C.selectOption("#memKind", "guest"); await C.click("#memAdd");
  const groups = await C.$$eval(".kgroup", (g) => g.map((x) => x.innerText.replace(/\s+/g, " ")));
  T.assert.ok(groups.some((g) => /Toastmasters 1 TM Nalin De Abrew/.test(g)), "TM… detected as a Toastmaster: " + groups);
  T.assert.ok(groups.some((g) => /Guests 1 Kasun Perera/.test(g)), "guest group");
  await T.coTab(C, "people"); await C.click('[data-medit]:has-text("Nalin")'); await C.fill("#mClub", "Dialog TMC"); await C.press("#mClub", "Tab");
  await T.eventually(async () => /Dialog TMC/.test((await C.$$eval(".kgroup", (g) => g.map((x) => x.innerText))).join(" ")), "club shown");
  // the Toastmaster gives the keynote and a prepared speech; awards ballot leaves them out by default
  await T.setRole(C, "keynote", "TM Nalin De Abrew");
  await C.fill("[data-rpadd-in=speakers]", "SC Afraa Faleel, TM Nalin De Abrew"); await C.click("[data-rpadd=speakers]");
  const P = await T.device(b, { phone: true });
  await P.fill("#wCode", code); await P.click("#wJoin"); await P.waitForSelector("[data-wname]", { timeout: 20000 });
  T.assert.match((await P.innerText("#wbox")).replace(/\s+/g, " "), /Toastmasters · 👋 Guests TM Nalin De Abrew ⭐ TM Kasun Perera 👋 Guest/, "start screen groups Toastmasters and guests");
  await P.click('[data-wname="SC Rashmi Maneesha"]'); await P.click("[data-wrole=member]"); await P.click("#wNext");
  const ballot = async () => { await P.click("#openVote"); await P.waitForSelector("#voteModal.on"); const t = await P.innerText("#voteBox"); await P.click("#voteClose"); return t; };
  const G = await T.device(b); await T.join(G, code, "SC Rashmi Maneesha", ["ge"]);
  await G.click('[data-vote-set="open"]');
  await T.eventually(() => P.isVisible("#openVote"), "voting open on the phone");
  const b1 = await ballot();
  T.assert.ok(/Afraa/.test(b1) && !/Nalin/.test(b1), "Toastmaster not on the ballot by default");
  await T.coTab(C, "people"); await C.check("#tmAwards");
  await T.eventually(async () => /Nalin/.test(await ballot()), "switch puts Toastmasters on the ballot (synced)");
  T.noErrors(C, P, G);
};
