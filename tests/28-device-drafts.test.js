const T = require("./lib");

module.exports = async (browser) => {
  const laptop = await T.device(browser);
  const code = await T.host(laptop, "Alex", ["rrm", "ttm"]);
  const phone = await T.device(browser, { phone: true, url: T.URL + "#join=" + code + "&role=rrm&person=Alex" });
  const other = await T.device(browser);
  await T.join(other, code, "Sam", ["member"]);

  async function unlock(page, label) {
    await page.locator("summary").filter({ hasText: "Sync private drafts across my devices" }).click();
    await page.fill("#draftPin", "28463179");
    await page.getByRole("button", { name: label }).click();
    await page.getByText("Private draft sync is unlocked on this device.").waitFor();
  }
  await unlock(laptop, "Set feedback PIN");
  await phone.getByRole("button", { name: "Unlock draft sync", includeHidden: true }).waitFor({ state: "attached" });
  await unlock(phone, "Unlock draft sync");
  await laptop.fill("#rrQ", "What made you smile?");
  await T.eventually(async () => await phone.inputValue("#rrQ") === "What made you smile?", "Round Robin draft syncs");
  T.assert.ok(!(await T.stored(other)).includes("What made you smile?"));

  for (const page of [laptop, phone]) await page.click('[data-rtab="ttm"]');
  await phone.fill("#topicInput", "A lesson from a friend");
  await T.eventually(async () => await laptop.inputValue("#topicInput") === "A lesson from a friend", "topic draft syncs");
  await laptop.click("#addTopics");
  await T.eventually(async () => await phone.inputValue("#topicInput") === "", "adding a topic clears its draft on both devices");
  await phone.locator('[data-edit="topic"][value="A lesson from a friend"]').waitFor();
  T.noErrors(laptop, phone, other);
};
