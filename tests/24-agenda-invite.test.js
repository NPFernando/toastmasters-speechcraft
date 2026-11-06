const T = require("./lib");

module.exports = async (browser) => {
  const host = await T.device(browser);
  const code = await T.host(host, "Coordinator", ["coord"]);
  await T.setCoordPin(host);
  await T.setRole(host, "president", "Meeting Guest");
  await T.setRole(host, "ttm", "Meeting Guest");
  await host.fill("[data-rpadd-in=speakers]", "Prepared Speaker");
  await host.click("[data-rpadd=speakers]");
  await host.fill("[data-rpadd-in=sevals]", "Speech Evaluator");
  await host.click("[data-rpadd=sevals]");
  await host.selectOption('[data-assign="Prepared Speaker"]', "Speech Evaluator");

  const guest = await T.device(browser, { phone: true, url: T.URL + "#join=" + code });
  await guest.locator('[data-wname="Meeting Guest"]').waitFor();
  T.assert.deepStrictEqual(
    (await guest.locator("[data-wname]").evaluateAll(chips => chips.map(chip => chip.dataset.wname))).sort(),
    ["Meeting Guest", "Prepared Speaker", "Speech Evaluator"]
  );
  const selected = () => guest.locator("#wGrid .rolecard.active").evaluateAll(cards => cards.map(card => card.dataset.wrole));
  await guest.click('[data-wname="Meeting Guest"]');
  T.assert.deepStrictEqual((await selected()).sort(), ["president", "ttm"]);
  await guest.click('[data-wname="Prepared Speaker"]');
  T.assert.deepStrictEqual(await selected(), ["speaker"]);
  await guest.click('[data-wname="Speech Evaluator"]');
  T.assert.deepStrictEqual(await selected(), ["seval"]);
  T.noErrors(host, guest);
};
