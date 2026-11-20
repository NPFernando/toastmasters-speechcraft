const T = require("./lib");

module.exports = async (browser) => {
  const timer = await T.device(browser);
  const code = await T.host(timer, "Timer", ["timer"]);
  const attendee = await T.device(browser, { phone: true });
  await T.join(attendee, code, "Attendee", ["member"]);
  const card = attendee.locator("#timerDemoDisplay .mecard");

  await timer.click('[data-tab="rr"]');
  await timer.click("#timerDemoStart");
  await card.getByText("Within time", { exact: true }).waitFor();
  await timer.click('[data-demo-step="1"]');
  await card.getByText("Time’s up · Bell").waitFor();
  await card.getByRole("button", { name: "Hear demo bell" }).click();
  T.assert.ok(await attendee.evaluate(() => window.__bellRang > 0));

  for (const [sid, name] of [["ps", "Prepared Speech"], ["tt", "Table Topics"], ["ev", "Evaluations"], ["rep", "Role reports"]]) {
    await timer.click('[data-tab="' + sid + '"]');
    await timer.click("#timerDemoStart");
    await card.getByText("Timer demo · " + name, { exact: true }).waitFor();
    for (const [step, color] of [["1", "Green"], ["2", "Amber"], ["3", "Red"]]) {
      await timer.click('[data-demo-step="' + step + '"]');
      await card.getByText(color, { exact: true }).waitFor();
    }
  }

  const state = JSON.parse(await T.stored(attendee));
  T.assert.ok(Object.values(state.rows).every(rows => rows.length === 0), "demo creates no timing records");
  await timer.click("#timerDemoEnd");
  await card.waitFor({ state: "detached" });
  T.noErrors(timer, attendee);
};
