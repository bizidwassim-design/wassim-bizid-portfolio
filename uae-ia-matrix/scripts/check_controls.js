// CI check: 15 families (6 management, 9 technical), unique ids, complete mappings, valid sample.
"use strict";
const path = require("path");
const CAT = require(path.join(__dirname, "..", "data", "controls.js"));
const SAMPLE = require(path.join(__dirname, "..", "data", "sample.js"));

let errors = [];
const fail = (m) => errors.push(m);

const ids = CAT.families.map((f) => f.id);
if (ids.length !== 15) fail(`expected 15 families, found ${ids.length}`);
if (new Set(ids).size !== ids.length) fail("duplicate family ids");
if (CAT.families.filter((f) => f.group === "management").length !== 6) fail("expected 6 management families");
if (CAT.families.filter((f) => f.group === "technical").length !== 9) fail("expected 9 technical families");
for (const f of CAT.families) {
  if (!/^[MT]\d$/.test(f.id)) fail(`${f.id}: id must be M1–M6 or T1–T9`);
  if (!f.name || !f.desc || !f.evidence) fail(`${f.id}: name, desc and evidence are required`);
  if (!Array.isArray(f.iso) || !f.iso.length) fail(`${f.id}: at least one ISO 27001 reference`);
  if (!Array.isArray(f.csf) || !f.csf.length) fail(`${f.id}: at least one NIST CSF reference`);
  for (const r of f.iso) if (!/^(Cl\. \d+(\.\d+)*|[5-8]\.\d{1,2})$/.test(r)) fail(`${f.id}: ISO reference "${r}" is not an Annex A control (5.1–8.34) or a clause`);
  for (const r of f.csf) if (!/^(GV|ID|PR|DE|RS|RC)\.[A-Z]{2}$/.test(r)) fail(`${f.id}: CSF reference "${r}" is not a CSF 2.0 category`);
}
const statusIds = new Set(CAT.statuses.map((s) => s.id));
if (statusIds.size !== 6) fail("expected 6 statuses");
for (const id of Object.keys(SAMPLE.items)) {
  if (!ids.includes(id)) fail(`sample: unknown family ${id}`);
  const it = SAMPLE.items[id];
  if (!statusIds.has(it.status)) fail(`sample ${id}: unknown status ${it.status}`);
  if (it.priority && !CAT.priorities.includes(it.priority)) fail(`sample ${id}: unknown priority ${it.priority}`);
}
if (Object.keys(SAMPLE.items).length !== 15) fail("sample must cover all 15 families");

if (errors.length) { console.error("FAIL\n  " + errors.join("\n  ")); process.exit(1); }
console.log(`OK: ${ids.length} families, ${CAT.statuses.length} statuses, sample "${SAMPLE.organisation}" complete`);
