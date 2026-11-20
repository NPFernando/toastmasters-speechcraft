// Devices connect with a meeting code; set-up syncs; online list counts people, not devices.
const T = require("./lib");
module.exports = async (b) => {
  const C = await T.device(b);
  const code = await T.host(C, "Naveen", ["coord"]);
  T.assert.match(code, /^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
  await T.setCoordPin(C);
  await T.addMembers(C, ["Afraa", "Rashmi", "Laurel"]);
  await T.setRole(C, "ah", "Afraa");
  const A = await T.device(b, { phone: true });
  await A.fill("#wCode", code); await A.click("#wJoin");
  await A.waitForSelector("[data-wname]", { timeout: 20000 });
  T.assert.deepStrictEqual((await A.$$eval("[data-wname]", (e) => e.map((x) => x.dataset.wname))).sort(), ["Afraa", "Laurel", "Rashmi"], "member names reach the new phone");
  await A.click('[data-wname="Afraa"]');
  T.assert.deepStrictEqual(await A.$$eval("#wGrid .rolecard.active", (e) => e.map((x) => x.dataset.wrole)), ["ah"], "today's role is pre-ticked");
  await A.click("#wNext");
  const A2 = await T.device(b, { phone: true });
  await T.join(A2, code, "Afraa", ["ah"]);
  await T.eventually(async () => /2 online/.test(await C.innerText("#connTxt")), "two people online (Afraa's two devices count once)");
  await T.eventually(async () => /2 devices/.test(await C.innerText("#roles")), "Afraa shown with 2 devices");
  for (const page of [C, A]) {
    await page.click("#connBtn");
    T.assert.strictEqual(await page.locator("#connBox .qr").count(), 1);
    const caption = await page.locator(".conn-qr figcaption").boundingBox();
    const qr = await page.locator(".conn-qr .qr").boundingBox();
    T.assert.ok(qr.y >= caption.y + caption.height, "the scan label is above the QR");
    T.assert.ok(await page.locator("#connModal").evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth), "the connection dialog fits the viewport");
    await page.click("#copyLink");
    await page.waitForFunction(() => document.getElementById("connCopyStatus").textContent === "Invite link copied.");
    T.assert.match(await page.evaluate(() => navigator.clipboard.readText()), /#join=[A-Z0-9]{3}-[A-Z0-9]{3}$/);
    await page.click("#connClose");
  }
  T.noErrors(C, A, A2);
};
