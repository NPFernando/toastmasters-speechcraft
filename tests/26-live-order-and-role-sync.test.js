const T = require("./lib");

module.exports = async (browser) => {
  const host = await T.device(browser);
  const code = await T.host(host, "Alex", ["coord", "tmod", "ge"]);
  await T.setCoordPin(host);
  await T.setRole(host, "timer", "Taylor");
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

  await host.click('[data-nav="agenda"]');
  const ben = host.locator('[data-live-item^="prepared|"]').filter({ hasText: "Ben" });
  const chloe = host.locator('[data-live-item^="prepared|"]').filter({ hasText: "Chloe" });
  await ben.locator(".live-grip").dragTo(chloe, { targetPosition: { x: 12, y: 8 } });
  await T.eventually(async () => await order() === "Ben,Chloe,Asha", "Drag updates the shared Timer order");
  T.assert.match(await chloe.innerText(), /Evaluator: Dev/);
  await timer.click('[data-nav="agenda"]');
  T.assert.equal(await timer.locator("[data-live-move]").count(), 0);
  await timer.click('[data-nav="role"]');

  await host.click('[data-nav="role"]');
  await host.click('[data-run="d7"]');
  await host.click('[data-nav="agenda"]');
  T.assert.equal(await host.locator('[data-live-item="d7"] [data-live-move]').count(), 0);
  await host.click('[data-nav="now"]');
  T.assert.match(await host.locator(".dh-next").innerText(), /Ben/);
  const speaker = await T.device(browser, { phone: true });
  await T.join(speaker, code, "Ben", ["speaker"]);
  await speaker.getByRole("button", { name: /Speaker Up next/ }).waitFor();
  await speaker.locator(".live-role-cue").getByRole("button", { name: "Open my role" }).click();

  await host.locator("#liveSubstitution summary").click();
  await host.selectOption("#liveReplaceRole", JSON.stringify(["speakers", "Ben"]));
  await host.selectOption("#liveReplacement", { label: "Taylor · Connected" });
  await host.click("#liveReplace");
  await T.eventually(async () => await order() === "Taylor,Chloe,Asha", "Substitution preserves the live slot and updates Timer");

  await timer.getByRole("button", { name: "Mark ready" }).click();
  await host.getByRole("button", { name: "Call next ready report" }).click();
  await timer.getByRole("button", { name: /Timer Action needed/ }).waitFor();
  await timer.getByRole("button", { name: "Mark presented" }).click();
  await host.locator(".live-report-queue li").filter({ hasText: "Taylor" }).getByText("Presented", { exact: true }).waitFor();

  await host.click('[data-rtab="ge"]');
  await host.fill("#geObservationText", "Check the handover");
  await T.eventually(async () => await phone.inputValue("#geObservationText") === "Check the handover", "Observation draft reaches second device");
  await phone.fill("#geObservationText", "Handover checked");
  await T.eventually(async () => await host.inputValue("#geObservationText") === "Handover checked", "Second device edit reaches first device");
  T.noErrors(host, phone, timer, speaker);
};
