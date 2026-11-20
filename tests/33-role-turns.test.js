const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");

module.exports = async () => {
  const S = {
    topics: [{ id: "one", used: true, speaker: "Alex" }, { id: "two", used: true, speaker: "Alex" }],
    evals: [], ttassign: [], rows: { rr: [] }, rrq: [], genotes: {}, attend: [],
    rrcur: {}, mid: "today", gramRows: [],
  };
  const model = vm.createContext({
    S, NET: { room: null }, L: {}, nkey: (v) => String(v || "").toLowerCase(),
    ttSpeakers: () => ["Alex"], uniq: (names) => [...new Set(names)],
    rowState: (row) => row.start == null ? "idle" : "done",
    document: { getElementById: () => ({ addEventListener() {} }) },
  });
  for (const role of ["evaluator", "round-robin-master", "general-evaluator", "ah-counter-grammarian"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/js/roles", role + ".js"), "utf8"), model);
  }

  const [first, second] = model.ttTargets();
  assert.equal(model.ttTargetName(first), "Alex");
  assert.notEqual(model.evId("tt", first, "Judge"), model.evId("tt", second, "Judge"));
  assert.notEqual(model.ttAssignId(first), model.ttAssignId(second));

  assert.equal(model.rrPool().length, 0);
  S.attend = [{ mid: "old", name: "Absent", present: true }, { mid: "today", name: "Present", present: true }];
  assert.deepEqual([...model.rrPool()], ["Present"]);

  S.rows.rr = [{ id: "queued", ord: 1 }, { id: "later", ord: 2, start: 200 }, { id: "first", ord: 3, start: 100 }];
  assert.deepEqual(Array.from(model.geRoundRobinTurns(), (row) => row.id), ["first", "later"]);

  S.gramRows = [{ name: "Alex", format: "tt", w: 2 }, { name: "Alex", format: "rr", w: 4 }];
  assert.equal(model.formatRecord("gram", "Alex", "rr").w, 4);
  assert.equal(model.formatRecord("gram", "Alex", "tt").w, 2);
};
