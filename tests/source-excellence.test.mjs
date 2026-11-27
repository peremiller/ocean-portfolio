import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "app/page.tsx"), "utf8");
const safeUrlFunction = source.match(/function safeProjectUrl\(value: string\): string \| null \{([\s\S]*?)\n\}/);
assert.ok(safeUrlFunction, "expected a shared safeProjectUrl function");
// The extracted function body is ordinary JavaScript; execute the exact source
// algorithm without a TypeScript dependency.
const safeProjectUrl = new Function("value", safeUrlFunction[1]);

test("allows full HTTP and HTTPS links, not unsafe schemes", () => {
  assert.equal(safeProjectUrl("https://example.com/path"), "https://example.com/path");
  assert.equal(safeProjectUrl("http://example.com"), "http://example.com/");
  for (const value of ["javascript:alert(1)", "data:text/html,evil", "mailto:test@example.com", "/relative", "not a URL"]) {
    assert.equal(safeProjectUrl(value), null, value);
  }
});

test("rejects credential-bearing URLs without disrupting normal project links", () => {
  assert.equal(safeProjectUrl("https://username:password@example.com/private"), null);
  assert.equal(safeProjectUrl("https://username@example.com/"), null);
  assert.equal(safeProjectUrl("http://user:pass@example.com/"), null);
  assert.equal(safeProjectUrl("https://example.com/project?view=demo"), "https://example.com/project?view=demo");
  assert.match(source, /without embedded login details/);
});

test("newly entered and previously saved project destinations use the same safety guard", () => {
  assert.match(source, /const submittedUrl = safeProjectUrl\(String\(form\.get\("url"\)/);
  assert.match(source, /url: submittedUrl,/);
  assert.match(source, /safeProjectUrl\(selected\.url\) \? \(/);
  assert.doesNotMatch(source, /href=\{selected\.url\}/);
});

test("device-local submissions and approval are described truthfully", () => {
  assert.match(source, /Nothing is submitted to the portfolio owner or a server/);
  assert.match(source, /Approvals and rejections are stored only in this browser/);
  assert.doesNotMatch(source, /Captain&apos;s Log · July 18, 2026/);
});

test("existing project routes, starter fleet and storage keys remain present", () => {
  for (const id of ["plugspot", "pantry", "groupmate", "migration"]) {
    assert.ok(source.includes(`id: "${id}"`));
  }
  for (const key of ["aj-fleet:custom-ships", "aj-fleet:pending-ships"]) {
    assert.ok(source.includes(key));
  }
  assert.match(source, /return `\/projects\/\$\{slugifyProject\(project\.name\)\}`/);
  assert.match(source, /window\.addEventListener\("popstate", syncViewFromUrl\)/);
});

test("modal focus is contained, Escape closes and opener can regain focus", () => {
  assert.match(source, /document\.addEventListener\("keydown", containFocus\)/);
  assert.match(source, /event\.shiftKey && document\.activeElement === first/);
  assert.match(source, /returnFocus\.focus\(\)/);
  assert.match(source, /event\.key === "Escape"/);
});

test("photo read failure and cancellation keep the form available for retry", () => {
  const handler = source.slice(source.indexOf("async function addShip("), source.indexOf("function approveShip("));
  assert.match(handler, /reader\.onabort = \(\) => reject/);
  assert.match(handler, /reader\.onerror = \(\) => reject/);
  assert.match(handler, /catch \{\s*setToast\("Could not read the captain photo[^"]*"\);\s*return;\s*\}/);
  assert.ok(handler.indexOf("Could not read the captain photo") < handler.indexOf("savePendingShips("));
});


test("pending storage write failure preserves existing state and submission form", () => {
  const body = source.match(/function savePendingShips\(next: Project\[\]\) \{([\s\S]*?)\n  \}/);
  assert.ok(body);
  const save = new Function("next", "localStorage", "setPendingShips", body[1]);
  const previous = [{ id: "old" }];
  const next = [...previous, { id: "new" }];
  let state = previous;
  let stored = JSON.stringify(previous);
  const setState = (value) => { state = value; };
  assert.throws(() => save(next, { setItem() { throw new Error("quota"); } }, setState), /quota/);
  assert.equal(state, previous);
  assert.equal(stored, JSON.stringify(previous));
  save(next, { setItem(key, value) { assert.equal(key, "aj-fleet:pending-ships"); stored = value; }, getItem() { return stored; } }, setState);
  assert.equal(state, next);
  assert.equal(stored, JSON.stringify(next));
  const handler = source.slice(source.indexOf("async function addShip("), source.indexOf("function approveShip("));
  assert.match(handler, /try \{\s*savePendingShips\(\[\.\.\.pendingShips, next\]\);\s*\} catch \{\s*setToast\("Could not save on this device[^"]*"\);\s*return;\s*\}/);
  assert.ok(handler.indexOf("Could not save on this device") < handler.indexOf("setAddOpen(false)"));
});


test("custom ship removal retains state on storage failure", () => {
  const body = source.match(/function saveCustomShips\(next: Project\[\]\) \{([\s\S]*?)\n  \}/);
  assert.ok(body);
  const save = new Function("next", "localStorage", "setFleet", body[1]);
  const prior = [{ id: "starter", custom: false }, { id: "custom", custom: true }];
  let state = prior;
  let stored = JSON.stringify([prior[1]]);
  assert.throws(() => save([prior[0]], { setItem() { throw Error("quota"); } }, v => state = v), /quota/);
  assert.equal(state, prior);
  assert.equal(stored, JSON.stringify([prior[1]]));
  save([prior[0]], { setItem(key, value) { assert.equal(key, "aj-fleet:custom-ships"); stored = value; }, getItem() { return stored; } }, v => state = v);
  assert.deepEqual(state, [prior[0]]);
  assert.equal(stored, "[]");
});

test("rejection and removal catch storage errors before success feedback or navigation", () => {
  const reject = source.slice(source.indexOf("function rejectShip("), source.indexOf("function removeShip("));
  const remove = source.slice(source.indexOf("function removeShip("), source.indexOf("function moveScene("));
  assert.match(reject, /catch \{\s*setToast\("Could not save the decision[^"]*"\);\s*return;/);
  assert.match(remove, /catch \{\s*setToast\("Could not save the removal[^"]*"\);\s*return;/);
  assert.ok(remove.indexOf("Could not save the removal") < remove.indexOf("setSelected(null)"));
  assert.ok(remove.indexOf("Could not save the removal") < remove.indexOf('navigateTo("/")'));
});

test("silent write rejection does not change displayed fleet or pending records", () => {
  for (const [fn, setter] of [["saveCustomShips", "setFleet"], ["savePendingShips", "setPendingShips"]]) {
    const start = source.indexOf("function " + fn + "(");
    const body = source.slice(source.indexOf("{", start) + 1, source.indexOf("\n  }", start));
    const save = new Function("next", "localStorage", setter, body);
    const prior = [{ id: "old", custom: true }];
    let state = prior;
    assert.throws(() => save([{ id: "new", custom: true }], {
      setItem() {}, getItem() { return JSON.stringify(prior); }
    }, value => { state = value; }), /write not verified/);
    assert.equal(state, prior);
  }
});

test("approval retry after pending write failure does not duplicate approved ship", () => {
  const body = source.match(/function approveShip\(project: Project\) \{([\s\S]*?)\n  \}/);
  assert.ok(body);
  const approve = new Function("project", "fleet", "pendingShips", "saveCustomShips", "savePendingShips", "setToast", body[1]);
  const project = { id: "p", name: "Pending", custom: true };
  let fleet = [{ id: "starter" }], pending = [project], toast = "";
  let saves = 0, failPending = true;
  const run = () => approve(project, fleet, pending, value => { fleet = value; saves++; },
    value => { if (failPending) throw Error("quota"); pending = value; }, value => { toast = value; });
  run();
  assert.equal(saves, 1);
  assert.equal(pending.length, 1);
  assert.match(toast, /Could not verify/);
  failPending = false;
  run();
  assert.equal(saves, 1);
  assert.equal(fleet.filter(ship => ship.id === project.id).length, 1);
  assert.equal(pending.length, 0);
  assert.match(toast, /was approved locally/);
});
