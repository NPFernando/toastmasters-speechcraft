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

  await T.setRole(host, "keynote", "Visiting Presenter");
  await T.coTab(host, "people");
  T.assert.strictEqual(await host.getByRole("button", { name: "Remove Meeting Guest", exact: true }).count(), 1);
  T.assert.match(await host.locator(".kgroup").last().innerText(), /Guests.*Visiting Presenter/s);
  await host.getByRole("button", { name: "Remove Visiting Presenter", exact: true }).click();
  await T.coTab(host, "setup");
  await T.coTab(host, "people");
  T.assert.strictEqual(await host.getByRole("button", { name: "Remove Visiting Presenter", exact: true }).count(), 0);
  T.assert.strictEqual(await host.locator('[data-checkin="Visiting Presenter"]').count(), 1);

  const guest = await T.device(browser, { phone: true, url: T.URL + "#join=" + code });
  await guest.locator('[data-wname="Meeting Guest"]').waitFor();
  T.assert.deepStrictEqual(
    (await guest.locator("[data-wname]").evaluateAll(chips => chips.map(chip => chip.dataset.wname))).sort(),
    ["Meeting Guest", "Prepared Speaker", "Speech Evaluator", "Visiting Presenter"]
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
