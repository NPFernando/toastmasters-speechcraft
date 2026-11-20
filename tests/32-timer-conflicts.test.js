const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

module.exports = async () => {
  const model = vm.createContext({ document: { addEventListener() {}, getElementById: () => ({ addEventListener() {} }) } });
  const source = (file) => fs.readFileSync(path.join(__dirname, "../src/js", file), "utf8");
  vm.runInContext(source("core/config.js").replace("(function(){", ""), model);
  for (const file of ["core/helpers.js", "agenda/agenda.js", "core/state.js", "core/merge.js", "core/field-sync.js", "core/timer-logic.js"]) {
    vm.runInContext(source(file), model);
  }
  const result = JSON.parse(vm.runInContext(`JSON.stringify((() => {
    const initial = blank();
    const left = clone(initial), right = clone(initial);
    left.rows.rr.push({ id: "round-robin", start: 1000, u: 1001, timedLim: { b: 30 } });
    right.rows.ps.push({ id: "prepared", start: 1000, u: 1001, timedLim: { g: 300, a: 360, r: 420 } });
    left.timerTurn = { sid: "rr", id: "round-robin", u: 1001 };
    right.timerTurn = { sid: "ps", id: "prepared", u: 1001 };
    left.limits.rr.b = 45;
    left.limits.fu = { rr: 1001 };
    left.limits.u = 1001;
    right.limits.ps.r = 460;
    right.limits.fu = { ps: 1001 };
    right.limits.u = 1001;
    const mergedLeft = clone(left), mergedRight = clone(right);
    mergeInto(mergedLeft, right);
    mergeInto(mergedRight, left);
    const states = (state) => [rowState(state.rows.rr[0]), rowState(state.rows.ps[0])];
    return {
      left: states(mergedLeft),
      right: states(mergedRight),
      limits: [mergedLeft.limits.rr.b, mergedLeft.limits.ps.r],
      originalSignal: signal("rr", 35, left.rows.rr[0]),
      originalStatus: status("ps", { ...right.rows.ps[0], end: 441000 }, 441000).text,
    };
  })())`, model));
  assert.deepStrictEqual(result.left, result.right);
  assert.deepStrictEqual(result.left.sort(), ["idle", "running"]);
  assert.deepStrictEqual(result.limits, [45, 460]);
  assert.strictEqual(result.originalSignal, "sr");
  assert.match(result.originalStatus, /^Overtime/);
};
