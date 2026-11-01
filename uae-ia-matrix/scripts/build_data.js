// Regenerates data/controls.csv and examples/falcon-bay-sample.json from the JS sources.
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const CAT = require(path.join(root, "data", "controls.js"));
const SAMPLE = require(path.join(root, "data", "sample.js"));

const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const csv = [["id", "group", "name", "description", "iso27001", "nist_csf", "evidence"].join(",")];
for (const f of CAT.families) csv.push([f.id, f.group, f.name, f.desc, f.iso.join("; "), f.csf.join("; "), f.evidence].map(cell).join(","));
fs.writeFileSync(path.join(root, "data", "controls.csv"), csv.join("\n") + "\n");

const score = {}; for (const s of CAT.statuses) score[s.id] = s.score;
let applicable = 0, sum = 0;
for (const id of Object.keys(SAMPLE.items)) { const s = score[SAMPLE.items[id].status]; if (s !== null) { applicable++; sum += s; } }
const doc = {
  schema: "uae-ia-compliance-matrix/1.0",
  framework: CAT.framework,
  catalogue: CAT.version,
  organisation: SAMPLE.organisation,
  assessment_date: SAMPLE.assessment_date,
  assessor: SAMPLE.assessor,
  compliance_score: Math.round((sum / (applicable * 4)) * 1000) / 10,
  applicable,
  controls: [],
  items: SAMPLE.items
};
fs.mkdirSync(path.join(root, "examples"), { recursive: true });
fs.writeFileSync(path.join(root, "examples", "falcon-bay-sample.json"), JSON.stringify(doc, null, 2) + "\n");
console.log(`wrote data/controls.csv (${CAT.families.length} rows) and examples/falcon-bay-sample.json (score ${doc.compliance_score}%)`);
