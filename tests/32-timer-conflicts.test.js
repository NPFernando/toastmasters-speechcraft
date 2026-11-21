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
    const ended = clone(right);
    ended.rows.ps[0].end = 2000;
    ended.rows.ps[0].u = 2001;
    ended.timerTurn.u = 1100;
    mergeInto(ended, left);
    recordTimerClockOffset("timer", 12950, 10000, 13050);
    const timed = { start: 10000, clockOwner: "timer" };
    return {
      delayedStart: rowState(ended.rows.rr[0]),
      finishedTurn: rowState(ended.rows.ps[0]),
      adjustedClock: timerElapsed("rr", timed, 18000),
      pausedClock: timerElapsed("rr", { ...timed, paused: 12000 }, 30000),
      left: states(mergedLeft),
      right: states(mergedRight),
      limits: [mergedLeft.limits.rr.b, mergedLeft.limits.ps.r],
      originalSignal: signal("rr", 35, left.rows.rr[0]),
      originalStatus: status("ps", { ...right.rows.ps[0], end: 441000 }, 441000).text,
    };
  })())`, model));
  assert.strictEqual(result.delayedStart, "idle");
  assert.strictEqual(result.finishedTurn, "done");
  assert.strictEqual(result.adjustedClock, 5);
  assert.strictEqual(result.pausedClock, 2);
  assert.deepStrictEqual(result.left, result.right);
  assert.deepStrictEqual(result.left.sort(), ["idle", "running"]);
  assert.deepStrictEqual(result.limits, [45, 460]);
  assert.strictEqual(result.originalSignal, "sr");
  assert.match(result.originalStatus, /^Overtime/);

  const view = source("core/render-shell.js");
  vm.runInContext(view.slice(view.indexOf("function nextAgendaTiming"), view.indexOf("function renderTimerHandoff")), model);
  for (const file of ["roles/shared.js", "agenda/timing.js", "roles/toastmaster-order.js"]) vm.runInContext(source(file), model);
  vm.runInContext(source("features/live-meeting-roles.js"), model);
  model.activeEvaluatorPairs = () => [];
  model.speechTitle = () => "";
  model.presentationRow = () => undefined;
  const agendaQueue = vm.runInContext(`(() => {
    S = blank();
    S.run.cur = "d5";
    S.run.skip = { d6: true, d7: true, "prepared|prepared": true };
    S.rows.ps.push({ id: "prepared", name: "Prepared speaker" });
    S.rows.tt.push({ id: "topic", name: "Table Topics speaker" });
    function liveItem() {
      const its = runItems(), i = its.findIndex((item) => item.id === S.run.cur);
      return { its, i, cur: its[i] };
    }
    globalThis.curItem = liveItem;
    return nextAgendaTiming().row.id;
  })()`, model);
  assert.strictEqual(agendaQueue, "topic");
  const liveOrder = JSON.parse(vm.runInContext(`JSON.stringify((() => {
    S = blank();
    S.rows.ps = ["first", "second"].map((id) => ({ id, name: id }));
    S.run.cur = "d7";
    S.run.started.d7 = 100;
    globalThis.myRoles = () => ["tmod"];
    globalThis.commit = () => {};
    let undo;
    globalThis.offerUndo = (_label, callback) => { undo = callback; };
    const previous = clone(S.run);
    const rejected = reorderLiveItem("d7", "prepared|second", true);
    const moved = reorderLiveItem("prepared|second", "prepared|first", false);
    const queue = timerRows("ps").map((row) => row.id);
    const advanced = { ...previous, cur: "prepared|second", u: previous.u + 1 };
    const merged = mergeLiveRun(S.run, advanced);
    const estimate=nextLiveEstimate({cur:{id:"d7",x:""},next:{id:"prepared|second"}});
    const undone = undo() !== false;
    const restored = timerRows("ps").map((row) => row.id);
    return { rejected, moved, queue, current: merged.cur, order: merged.order, undone, restored, estimate };
  })())`, model));
  assert.strictEqual(liveOrder.rejected, false);
  assert.strictEqual(liveOrder.moved, true);
  assert.strictEqual(liveOrder.undone, true);
  assert.deepStrictEqual(liveOrder.restored, ["first", "second"]);
  assert.ok(Number.isFinite(liveOrder.estimate));
  assert.deepStrictEqual(liveOrder.queue, ["second", "first"]);
  assert.strictEqual(liveOrder.current, "prepared|second");
  assert.ok(liveOrder.order.indexOf("prepared|second") < liveOrder.order.indexOf("prepared|first"));
  const reports = JSON.parse(vm.runInContext(`JSON.stringify((() => {
    S = blank();
    S.agenda.assign.timer = "Taylor";
    S.agenda.assign.ah = "Alex";
    S.rows.rep = [{id:"timer",ak:"rep:timer"},{id:"ah",ak:"rep:ah"}];
    S.run.cur = "d8";
    S.run.started.d8 = 100;
    reorderLiveItem("agenda-report|rep:ah", "d9", false);
    const timeline = runItems().map((item) => item.id);
    const queue = orderedReportQueue().map((report) => report.role);
    const timer = firstQueued("rep").id;
    S.run.skip = {"agenda-report|rep:ah":true};
    const afterSkip = firstQueued("rep").id;
    return { timeline, queue, timer, afterSkip };
  })())`, model));
  assert.ok(reports.timeline.indexOf("agenda-report|rep:ah") < reports.timeline.indexOf("d9"));
  assert.deepStrictEqual(reports.queue, ["ah","timer"]);
  assert.strictEqual(reports.timer, "ah");
  assert.strictEqual(reports.afterSkip, "timer");
};
