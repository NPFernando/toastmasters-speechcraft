const T = require("./lib");

module.exports = async (browser) => {
  const host = await T.device(browser);
  const code = await T.host(host, "Host", ["coord","ttm"]);
  await T.setCoordPin(host);
  await T.setRole(host, "timer", "Returning");
  await host.click('[data-rtab="ttm"]');
  await host.fill("#topicInput", "Question from the hosted meeting");
  await host.click("#addTopics");

  const returning = await T.device(browser);
  await T.solo(returning, "Returning", ["ttm"]);
  await returning.fill("#topicInput", "Question from a previous local meeting");
  await returning.click("#addTopics");
  await returning.evaluate((code) => {
    const key = "speechcraftMeeting.local";
    const saved = JSON.parse(localStorage.getItem(key));
    saved.conn = { mode: "join", code: code.replace(/-/g, "") };
    localStorage.setItem(key, JSON.stringify(saved));
  }, code);
  await returning.goto(T.URL + "#join=" + code);
  await returning.locator('[data-rtab="timer"].on').waitFor();
  T.assert.equal(await returning.locator('[data-rtab="ttm"]').count(), 0);
  await returning.reload();
  await returning.locator('[data-rtab="timer"].on').waitFor();
  await T.eventually(async () => /Synced/.test(await returning.innerText("#connTxt")), "same meeting syncs after reload");
  const hosted = JSON.parse(await T.stored(host));
  const joined = JSON.parse(await T.stored(returning));
  T.assert.equal(joined.mid, hosted.mid);
  T.assert.deepStrictEqual(joined.topics.map(topic => topic.text), ["Question from the hosted meeting"]);
  T.assert.ok(!returning._dialogs.some(message => /bring it into this meeting/.test(message)));

  const record = await returning.evaluate(() => localStorage.getItem("speechcraftRecords"));
  T.assert.match(record, /Question from a previous local meeting/);
  T.noErrors(host, returning);
};
