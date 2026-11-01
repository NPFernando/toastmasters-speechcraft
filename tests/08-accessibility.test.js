// WCAG 2.1 AA (axe-core) on the main screens, light and dark.
const fs = require("fs");
const T = require("./lib");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
module.exports = async (b) => {
  const fails = [];
  for (const dark of [false, true]) {
    const p = await T.device(b, { dark, url: T.FILE + "?as=practice" });
    const run = async (tag) => {
      await p.addScriptTag({ content: AXE });
      const v = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations.map((x) => x.id + " (" + x.nodes.length + ")"));
      v.forEach((x) => fails.push((dark ? "dark " : "light ") + tag + ": " + x));
    };
    await run("start");
    await p.click("#wSolo"); await T.pickWho(p, "Janani Kumar", ["coord"]); await run("coordinator");
    if (await p.$("#pinIn")) { await p.fill("#pinIn", "1234"); await p.click("#pinUnlock"); }
    await p.waitForSelector(".cotabs", { timeout: 5000 });
    for (const t of ["setup", "agenda", "people", "after"]) { await T.coTab(p, t); await run("coordinator " + t); }
    await p.click("[data-nav=now]"); await run("now");
    await p.click("[data-nav=agenda]"); await run("agenda");
    for (const [role, name] of [["timer", "Dilini Jayasinghe"], ["ah", "Eshan Rodrigo"], ["gram", "Fathima Rizvi"], ["ttm", "Gihan de Mel"], ["president", "Amal Perera"], ["speaker", "Isuru Bandara"], ["tteval", "Bhagya Silva"], ["member", "Amal Perera"]]) {
      await p.click("#homeBtn"); await p.click("#wChange"); await T.pickWho(p, name, [role]); await run(role);
    }
    await p.close();
  }
  T.assert.deepStrictEqual(fails, [], "accessibility violations");
};
