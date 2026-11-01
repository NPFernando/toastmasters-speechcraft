// Shared helpers for the browser tests. Each test drives several simulated devices
// (separate browser contexts = separate phones/laptops) through a local test relay.
const { chromium } = require("playwright");
const path = require("path");
const { spawn } = require("child_process");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.RELAY_PORT || "7000";
const FILE = "file://" + path.join(ROOT, "index.html");
const URL = FILE + "?relay=ws://127.0.0.1:" + PORT;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startRelay() {
  const r = spawn(process.execPath, [path.join(__dirname, "relay.js")], { env: { ...process.env, RELAY_PORT: PORT }, stdio: "ignore" });
  await sleep(500);
  return r;
}

/* a fresh device; collects page errors so tests can assert there were none */
async function device(b, opts = {}) {
  const ctx = await b.newContext({ viewport: opts.phone ? { width: 390, height: 844 } : { width: 1200, height: 850 }, colorScheme: opts.dark ? "dark" : "light", permissions: ["clipboard-read", "clipboard-write"] });
  const p = await ctx.newPage();
  p._errors = [];
  p._dialogs = [];
  p.on("pageerror", (e) => p._errors.push(e.message));
  p.on("dialog", (d) => { p._dialogs.push(d.message()); d.type() === "prompt" ? d.accept(p._answer || "") : d.accept(); });
  p.setDefaultTimeout(15000);
  await p.goto(opts.url || URL);
  return p;
}

async function pickWho(p, name, roles) {
  await p.waitForSelector("#wGrid");
  if (name) await p.fill("#wName", name);
  for (const r of roles) await p.click(`[data-wrole=${r}]`);
  await p.click("#wNext");
  await p.click("[data-tipsdone]", { timeout: 1500 }).catch(() => {});
}
/* ① host a meeting, ② name + roles; returns the meeting code */
async function host(p, name, roles) {
  await p.click("#wHost");
  await p.waitForSelector("#wbox .code");
  const code = (await p.textContent("#wbox .code")).trim();
  await p.click("#wNextWho");
  await pickWho(p, name, roles);
  return code;
}
async function join(p, code, name, roles) {
  await p.fill("#wCode", code);
  await p.click("#wJoin");
  await p.waitForSelector("#wGrid", { timeout: 20000 });
  await pickWho(p, name, roles);
}
async function solo(p, name, roles) { await p.click("#wSolo"); await pickWho(p, name, roles); }
async function setCoordPin(p, pin = "2468") {
  await p.fill("#pin1", pin); await p.fill("#pin2", pin); await p.click("#pinSet");
  await p.waitForSelector("#recDone"); await p.click("#recDone");
}
/* Coordinator sub-tabs: setup (default) · agenda · people · after */
async function coTab(p, t) { const sel = `.cotabs [data-cotab=${t}]`; if (await p.$(sel + '[aria-selected="true"]')) return; if (await p.$(sel)) { await p.click(sel); await p.waitForSelector(sel + '[aria-selected="true"]'); } }
async function addMembers(p, names) { await coTab(p, "people"); await p.fill("#memIn", names.join(", ")); await p.click("#memAdd"); await coTab(p, "setup"); }
async function setRole(p, key, name) { await coTab(p, "setup"); await p.fill(`[data-rp=${key}]`, name); await p.press(`[data-rp=${key}]`, "Tab"); }
async function eventually(fn, msg, ms = 10000) {
  const t = Date.now(); let last;
  while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) { last = e; } await sleep(250); }
  throw new assert.AssertionError({ message: msg + (last ? " (" + last.message + ")" : "") });
}
function noErrors(...pages) { for (const p of pages) assert.deepStrictEqual(p._errors, [], "page errors"); }
function stored(p) { return p.evaluate(() => localStorage.getItem("speechcraftMeeting.v2") || ""); }

module.exports = { chromium, assert, sleep, ROOT, FILE, URL, startRelay, device, host, join, solo, pickWho, setCoordPin, coTab, addMembers, setRole, eventually, noErrors, stored };
