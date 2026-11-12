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
