const T = require("./lib");

module.exports = async (browser) => {
  const host = await T.device(browser);
  const code = await T.host(host, "Alex", ["coord", "tmod", "ge"]);
  await T.setCoordPin(host);
  for (const name of ["Asha", "Ben", "Chloe"]) {
    await host.fill("[data-rpadd-in=speakers]", name);
    await host.click("[data-rpadd=speakers]");
  }
  await host.fill("[data-rpadd-in=sevals]", "Dev");
  await host.click("[data-rpadd=sevals]");
  await host.selectOption('[data-assign="Chloe"]', "Dev");

  const phone = await T.device(browser, { phone: true, url: T.URL + "#join=" + code + "&role=ge&person=Alex" });
  await phone.locator('[data-rtab="tmod"]').waitFor();
  await phone.locator('[data-rtab="coord"]').waitFor();

  const timer = await T.device(browser);
  await T.join(timer, code, "Taylor", ["timer"]);
  await timer.click('[data-tab="ps"]');
  await host.click('[data-rtab="tmod"]');
  await host.getByRole("button", { name: "Move up Chloe" }).click();
  const order = async () => timer.locator('tr [data-edit="name"]').evaluateAll(inputs => inputs.map(input => input.value).join(","));
  await T.eventually(async () => await order() === "Asha,Chloe,Ben", "Timer shows Move up order");
  await host.getByRole("button", { name: "Speak next: Chloe" }).click();
  await T.eventually(async () => await order() === "Chloe,Asha,Ben", "Timer shows Speak next order");
  T.assert.match(await host.locator("li").filter({ hasText: "Chloe" }).first().innerText(), /Evaluator: Dev/);

  await host.click('[data-rtab="ge"]');
  await host.fill("#geObservationText", "Check the handover");
  await T.eventually(async () => await phone.inputValue("#geObservationText") === "Check the handover", "Observation draft reaches second device");
  await phone.fill("#geObservationText", "Handover checked");
  await T.eventually(async () => await host.inputValue("#geObservationText") === "Handover checked", "Second device edit reaches first device");
  T.noErrors(host, phone, timer);
};
