const T = require("./lib");

module.exports = async (browser) => {
  const laptop = await T.device(browser);
  const code = await T.host(laptop, "Alex", ["gram", "seval"]);
  const phone = await T.device(browser, { phone: true, url: T.URL + "#join=" + code + "&role=gram&person=Alex" });
  const guest = await T.device(browser);
  await T.join(guest, code, "Guest", ["member"]);
  const unlock = async (page, label) => {
    await page.locator("summary").filter({ hasText: "Sync private drafts across my devices" }).click();
    await page.fill("#draftPin", "28463179");
    await page.getByRole("button", { name: label }).click();
    await page.getByText("Private draft sync is unlocked on this device.").waitFor();
  };
  await unlock(laptop, "Set feedback PIN");
  await phone.getByRole("button", { name: "Unlock draft sync", includeHidden: true }).waitFor({ state: "attached" });
  await unlock(phone, "Unlock draft sync");

  await laptop.fill("#wotd", "Meticulous");
  await T.eventually(async () => await phone.inputValue("#wotd") === "Meticulous", "word draft reaches author's phone");
  await phone.fill("#wotdMeaning", "Very careful about details");
  await T.eventually(async () => await laptop.inputValue("#wotdMeaning") === "Very careful about details", "word edit returns to laptop");

  for (const page of [laptop, phone]) {
    await page.click('[data-rtab="seval"]');
    await page.fill("#evAddIn", "Taylor");
    await page.click("#evAdd");
  }
  await laptop.fill('[data-evf="c1"]', "Your opening made the story clear.");
  await T.eventually(async () => await phone.inputValue('[data-evf="c1"]') === "Your opening made the story clear.", "evaluation draft reaches author's phone");
  await phone.fill('[data-evf="r"]', "Pause longer before the ending.");
  await T.eventually(async () => await laptop.inputValue('[data-evf="r"]') === "Pause longer before the ending.", "evaluation edit returns to laptop");

  const shared = await T.stored(guest);
  T.assert.doesNotMatch(shared, /Meticulous|Very careful about details|Your opening made the story clear|Pause longer before the ending/);
  T.assert.strictEqual(await guest.locator("#publishedWord").count(), 0);
  T.noErrors(laptop, phone, guest);
};
