// Quality gate: every local asset referenced by the page and the data exists, anchors resolve, and the CSP has no inline allowances.
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
let failures = 0;
const fail = (m) => { failures++; console.error("FAIL  " + m); };
const ok = (m) => console.log("ok    " + m);

const html = read("index.html");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(read("data/data.js"), ctx);
const { PF_DATA: data, PF_ICONS: icons } = ctx.window;

// 1. Local files referenced from the HTML
const refs = [...html.matchAll(/(?:src|href)="([^"#:?]+\.[a-z0-9]+)"/gi)].map((m) => m[1]).filter((p) => !/^https?:/.test(p));
refs.forEach((p) => existsSync(resolve(root, p)) || fail("missing file referenced in index.html: " + p));
ok(refs.length + " files referenced in index.html");

// 2. Assets referenced from the data
const paths = new Set();
JSON.stringify(data, (k, v) => { if (typeof v === "string" && /^assets\//.test(v)) paths.add(v); return v; });
paths.forEach((p) => existsSync(resolve(root, p)) || fail("missing asset referenced in data: " + p));
ok(paths.size + " assets referenced in data.js");

// 3. Every icon name used in the data has a glyph
const used = new Set();
JSON.stringify(data, (k, v) => { if (k === "icon" && typeof v === "string") used.add(v); return v; });
used.forEach((n) => icons[n] || fail("icon without glyph: " + n));
ok(used.size + " icons resolved");

// 4. In-page anchors
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
[...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).forEach((a) => ids.has(a) || fail("anchor without target: #" + a));
ok("anchors resolve");

// 5. Strict CSP, no inline script or style
/'unsafe-inline'|'unsafe-eval'/.test(html) && fail("CSP allows unsafe-inline or unsafe-eval");
/<style[\s>]/i.test(html) && fail("inline <style> block");
/\sstyle="/i.test(html) && fail("inline style attribute in index.html");
/<script(?![^>]*\ssrc=)/i.test(html) && fail("inline <script>");
ok("CSP strict, no inline code");

// 6. Content sanity
data.projects.length === 23 || fail("expected 23 case studies, found " + data.projects.length);
data.ownProjects.length === 19 || fail("expected 19 open-source projects, found " + data.ownProjects.length);
ok(data.projects.length + " case studies, " + data.ownProjects.length + " open-source projects");

if (failures) { console.error("\n" + failures + " check(s) failed"); process.exit(1); }
console.log("\nall checks passed");
