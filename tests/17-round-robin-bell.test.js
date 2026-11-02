// Round Robin: the person being timed sees their own live clock and the bell on their phone, whatever role they hold.
const T = require("./lib");
module.exports = async (b) => {
  const M = await T.device(b);
  const code = await T.host(M, "Dilini", ["timer"]);
  const P = await T.device(b, { phone: true });
  await T.join(P, code, "Eshan Rodrigo", ["member"]);
  await M.click("[data-tab=rr]");
  await M.fill('[data-lim="b"]', "3"); await M.press('[data-lim="b"]', "Tab");
  await M.fill("#qname", "Eshan Rodrigo"); await M.click("#qadd");
  await M.click('#view [data-act="start"]');
  await T.eventually(async () => /You are speaking · Round Robin[\s\S]*Within time[\s\S]*bell in/i.test(await P.innerText("#nowStrip")), "live card before the bell");
  await T.eventually(async () => /BELL · TIME’S UP/i.test(await P.innerText("#nowStrip")), "bell shown on the speaker's phone", 8000);
  T.assert.match(await P.getAttribute(".mecard", "class"), /\bsr\b/);
  T.noErrors(M, P);
};
