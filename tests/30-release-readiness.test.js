const T = require("./lib");

module.exports = async (browser) => {
  const laptop = await T.device(browser);
  const code = await T.host(laptop, "Coordinator", ["coord"]);
  await T.setCoordPin(laptop);
  await T.setRole(laptop, "timer", "Taylor");
  await laptop.locator("#absentName").selectOption("Taylor");
  await laptop.click("#markAbsent");
  await laptop.getByRole("link", { name: "Find replacements" }).waitFor();
  await laptop.getByRole("textbox", { name: "Replacement for Timer" }).fill("Morgan");
  await laptop.locator('[data-replace-role="timer"]').click();
  T.assert.equal(await laptop.inputValue('[data-rp="timer"]'), "Morgan");

  const phone = await T.device(browser, { phone: true });
  await T.join(phone, code, "Morgan", ["timer"]);
  await T.eventually(async () => /Synced/.test(await phone.innerText("#connTxt")), "phone receives shared meeting data");
  await phone.context().setOffline(true);
  await T.eventually(async () => /Reconnecting/.test(await phone.innerText("#connTxt")), "phone reports lost connection", 35000);
  await T.setRole(laptop, "ah", "Casey");
  await phone.context().setOffline(false);
  await T.eventually(async () => /Synced/.test(await phone.innerText("#connTxt")), "phone syncs after reconnect", 35000);
  await T.eventually(async () => JSON.parse(await T.stored(phone)).agenda.assign.ah === "Casey", "meeting change made offline reaches phone");
  T.noErrors(laptop, phone);
};
