const T = require("./lib");

module.exports = async (browser) => {
  const grammarian = await T.device(browser);
  const code = await T.host(grammarian, "Grammarian", ["gram"]);
  const guest = await T.device(browser, { phone: true });
  await T.join(guest, code, "Guest", ["member"]);

  await grammarian.fill("#wotd", "Resilient");
  await grammarian.fill("#wotdMeaning", "Able to recover after a setback.");
  await grammarian.click("#wotdReveal");
  T.assert.ok(!(await T.stored(grammarian)).includes("Resilient"), "incomplete draft stays out of shared state");
  await grammarian.fill("#wotdExample", "The resilient team regrouped after the delay.");
  T.assert.ok(!(await T.stored(grammarian)).includes("Resilient"), "complete draft stays out of shared state");
  T.assert.strictEqual(await guest.locator("#publishedWord").count(), 0);

  await grammarian.click("#wotdReveal");
  await T.eventually(async () => (await guest.locator("#publishedWord").count()) === 1, "revealed word arrives on phone");
  const published = await guest.locator("#publishedWord").innerText();
  T.assert.match(published, /Resilient/);
  T.assert.match(published, /Meaning: Able to recover after a setback\./);
  T.assert.match(published, /Example: The resilient team regrouped after the delay\./);

  await grammarian.fill("#wotdExample", "An unpublished revision.");
  T.assert.ok(!(await T.stored(grammarian)).includes("An unpublished revision."));
  T.assert.strictEqual(await guest.locator("#publishedWord").innerText(), published);
  T.noErrors(grammarian, guest);
};
