/* UAE IA Compliance Matrix — app logic. No dependencies, no network. MIT License. */
(function () {
  "use strict";

  var CAT = window.UAE_IA, SAMPLE = window.UAE_IA_SAMPLE;
  var STORAGE = "uae-ia-matrix-draft";
  var SCHEMA = "uae-ia-compliance-matrix/1.0";
  var MAX_SCORE = 4;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var statusById = {};
  CAT.statuses.forEach(function (s) { statusById[s.id] = s; });

  /* ---------- state ---------- */
  var state = { organisation: "", assessment_date: "", assessor: "", items: {}, controls: [] };
  var filters = { group: "", status: "", priority: "", text: "" };

  function familyOf(id) {
    var m = /^([MT]\d+)/i.exec(id || "");
    return m ? m[1].toUpperCase() : null;
  }
  function rows() {
    // family rows always; imported control rows under their family
    var out = [];
    CAT.families.forEach(function (f) {
      out.push({ kind: "family", id: f.id, name: f.name, desc: f.desc, iso: f.iso, csf: f.csf, group: f.group, hint: f.evidence });
      state.controls.filter(function (c) { return familyOf(c.id) === f.id; }).forEach(function (c) {
        out.push({ kind: "control", id: c.id, name: c.title, desc: c.description || "", iso: c.iso || [], csf: c.csf || [], group: f.group, priority: c.priority || "" });
      });
    });
    var orphans = state.controls.filter(function (c) { return !familyOf(c.id) || !CAT.families.some(function (f) { return f.id === familyOf(c.id); }); });
    orphans.forEach(function (c) { out.push({ kind: "control", id: c.id, name: c.title, desc: c.description || "", iso: c.iso || [], csf: c.csf || [], group: "other", priority: c.priority || "" }); });
    return out;
  }
  function item(id) {
    if (!state.items[id]) state.items[id] = { status: "none", priority: "", owner: "", due: "", evidence: "" };
    return state.items[id];
  }
  function scored() {
    // when controls are imported, score on controls; otherwise on families
    var ids = state.controls.length ? state.controls.map(function (c) { return c.id; }) : CAT.families.map(function (f) { return f.id; });
    return ids.map(function (id) { return { id: id, it: item(id) }; });
  }

  /* ---------- persistence ---------- */
  function save() { try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch (e) { /* private mode */ } }
  function load() {
    try { var raw = localStorage.getItem(STORAGE); if (raw) { var s = JSON.parse(raw); if (s && s.items) state = s; } } catch (e) { /* ignore */ }
    if (!state.controls) state.controls = [];
  }

  /* ---------- rendering ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function refs(list) {
    return el("div", { class: "refs" }, list.map(function (r) { return el("span", { class: "ref", text: r }); }));
  }
  function statusSelect(id) {
    var it = item(id);
    var sel = el("select", { "aria-label": "Status of " + id });
    CAT.statuses.forEach(function (s) {
      var o = el("option", { value: s.id, text: s.label }); if (s.id === it.status) o.selected = true; sel.appendChild(o);
    });
    sel.addEventListener("change", function () { it.status = sel.value; sel.parentNode.setAttribute("data-s", sel.value); save(); renderSummary(); });
    return sel;
  }
  function prioritySelect(id, fixed) {
    var it = item(id);
    if (fixed && !it.priority) it.priority = fixed;
    var sel = el("select", { "aria-label": "Priority of " + id });
    sel.appendChild(el("option", { value: "", text: "—" }));
    CAT.priorities.forEach(function (p) { var o = el("option", { value: p, text: p }); if (p === it.priority) o.selected = true; sel.appendChild(o); });
    sel.addEventListener("change", function () { it.priority = sel.value; save(); renderSummary(); });
    return sel;
  }
  function textInput(id, key, type, label) {
    var it = item(id);
    var inp = el("input", { type: type || "text", "aria-label": label + " for " + id });
    inp.value = it[key] || "";
    inp.addEventListener("input", function () { it[key] = inp.value; save(); });
    return inp;
  }
  function evidenceArea(id, hint) {
    var it = item(id);
    var ta = el("textarea", { rows: "2", "aria-label": "Evidence for " + id });
    ta.value = it.evidence || "";
    ta.addEventListener("input", function () { it.evidence = ta.value; save(); });
    var wrap = el("div", null, [ta]);
    if (hint) wrap.appendChild(el("div", { class: "hint", text: "Evidence to look for: " + hint }));
    return wrap;
  }
  function matches(r) {
    var it = item(r.id);
    if (filters.group && r.group !== filters.group) return false;
    if (filters.status && it.status !== filters.status) return false;
    if (filters.priority && it.priority !== filters.priority) return false;
    if (filters.text) {
      var hay = [r.id, r.name, r.desc, r.iso.join(" "), r.csf.join(" "), it.owner, it.evidence].join(" ").toLowerCase();
      if (hay.indexOf(filters.text) < 0) return false;
    }
    return true;
  }
  function renderMatrix() {
    var body = $("#matrix-body"); body.textContent = "";
    var all = rows(), shown = 0;
    all.forEach(function (r) {
      if (!matches(r)) return;
      shown++;
      var it = item(r.id);
      var tr = el("tr", { class: r.kind + "-row" }, [
        el("td", { class: "id", text: r.id }),
        el("td", { class: "name" }, [el("b", { text: r.name }), r.desc ? el("small", { text: r.desc }) : null]),
        el("td", null, [refs(r.iso)]),
        el("td", null, [refs(r.csf)]),
        el("td", null, [prioritySelect(r.id, r.priority)]),
        el("td", { class: "status", "data-s": it.status }, [statusSelect(r.id)]),
        el("td", null, [textInput(r.id, "owner", "text", "Owner")]),
        el("td", null, [textInput(r.id, "due", "date", "Target date")]),
        el("td", { class: "ev" }, [evidenceArea(r.id, r.kind === "family" ? r.hint : "")])
      ]);
      body.appendChild(tr);
    });
    $("#matrix-meta").textContent = shown + " of " + all.length + " rows" + (state.controls.length ? " · " + state.controls.length + " imported controls" : " · family level (import a control list to go deeper)");
  }
  function renderSummary() {
    var sc = scored(), applicable = 0, sum = 0, counts = {}, byPriority = {};
    CAT.statuses.forEach(function (s) { counts[s.id] = 0; });
    sc.forEach(function (x) {
      counts[x.it.status] = (counts[x.it.status] || 0) + 1;
      var s = statusById[x.it.status];
      if (s && s.score !== null) { applicable++; sum += s.score; }
      if (x.it.priority) { byPriority[x.it.priority] = byPriority[x.it.priority] || { n: 0, open: 0 }; byPriority[x.it.priority].n++; if (s && s.score !== null && s.score < 3) byPriority[x.it.priority].open++; }
    });
    var pct = applicable ? Math.round((sum / (applicable * MAX_SCORE)) * 100) : 0;
    var implemented = counts.done + counts.ver;
    var kp = $("#kpis"); kp.textContent = "";
    [["Compliance score", pct + "%", "weighted by status, " + applicable + " applicable"],
     ["Implemented", implemented + " / " + applicable, "implemented or verified"],
     ["Partially implemented", String(counts.part), "in progress"],
     ["Not started or planned", String(counts.none + counts.plan), "open"],
     ["P1 open", String((byPriority.P1 || { open: 0 }).open), "highest-priority items not implemented"]
    ].forEach(function (k) { kp.appendChild(el("div", { class: "kpi" }, [el("small", { text: k[0] }), el("b", { text: k[1] }), el("small", { text: k[2] })])); });

    var bars = $("#bars"); bars.textContent = "";
    CAT.families.forEach(function (f) {
      var ids = state.controls.length ? state.controls.filter(function (c) { return familyOf(c.id) === f.id; }).map(function (c) { return c.id; }) : [f.id];
      var a = 0, s = 0;
      ids.forEach(function (id) { var st = statusById[item(id).status]; if (st && st.score !== null) { a++; s += st.score; } });
      var p = a ? Math.round((s / (a * MAX_SCORE)) * 100) : 0;
      var fill = el("div", { class: "fill" }); fill.style.width = p + "%";
      bars.appendChild(el("div", { class: "bar", title: f.name }, [el("span", { class: "id", text: f.id }), el("div", { class: "track", role: "img", "aria-label": f.name + " " + p + "%" }, [fill]), el("span", { class: "pct", text: p + "%" })]));
    });
    renderGaps();
  }
  function renderGaps() {
    var list = $("#gaps"); list.textContent = "";
    var names = {}; rows().forEach(function (r) { names[r.id] = r.name; });
    var order = { P1: 0, P2: 1, P3: 2, P4: 3, "": 4 };
    var gaps = scored().filter(function (x) { var s = statusById[x.it.status]; return s && s.score !== null && s.score < 3; })
      .sort(function (a, b) { return (order[a.it.priority] - order[b.it.priority]) || (statusById[a.it.status].score - statusById[b.it.status].score) || a.id.localeCompare(b.id); })
      .slice(0, 15);
    if (!gaps.length) { list.appendChild(el("li", { text: "No open gaps. Everything applicable is implemented." })); return; }
    gaps.forEach(function (x) {
      list.appendChild(el("li", null, [el("b", { text: x.id }), " " + (names[x.id] || ""), el("span", { class: "tag", text: statusById[x.it.status].label }), x.it.priority ? el("span", { class: "tag", text: x.it.priority }) : null, x.it.owner ? el("span", { class: "tag", text: x.it.owner }) : null]));
    });
  }
  function renderHeader() {
    $("#org").value = state.organisation || ""; $("#date").value = state.assessment_date || ""; $("#assessor").value = state.assessor || "";
  }
  function renderAll() { renderHeader(); renderMatrix(); renderSummary(); }

  /* ---------- export / import ---------- */
  function say(msg) { $("#status").textContent = msg; }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "application/json" });
    var a = el("a", { href: URL.createObjectURL(blob), download: name }); document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function slug(s) { return (s || "organisation").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function exportDoc() {
    var sc = scored(), applicable = 0, sum = 0;
    sc.forEach(function (x) { var s = statusById[x.it.status]; if (s && s.score !== null) { applicable++; sum += s.score; } });
    var doc = { schema: SCHEMA, framework: CAT.framework, catalogue: CAT.version, organisation: state.organisation, assessment_date: state.assessment_date, assessor: state.assessor,
      compliance_score: applicable ? Math.round((sum / (applicable * MAX_SCORE)) * 1000) / 10 : 0, applicable: applicable, controls: state.controls, items: {} };
    sc.forEach(function (x) { doc.items[x.id] = x.it; });
    return doc;
  }
  function csvCell(v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function exportCsv() {
    var lines = [["id", "name", "group", "iso27001", "nist_csf", "priority", "status", "owner", "target_date", "evidence"].join(",")];
    rows().forEach(function (r) { var it = item(r.id); lines.push([r.id, r.name, r.group, r.iso.join(" "), r.csf.join(" "), it.priority, statusById[it.status].label, it.owner, it.due, it.evidence].map(csvCell).join(",")); });
    return lines.join("\n");
  }
  function parseCsv(text) {
    var out = [], row = [], cell = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); out.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    if (cell.length || row.length) { row.push(cell); out.push(row); }
    return out.filter(function (r) { return r.some(function (c) { return c.trim(); }); });
  }
  function importControls(text) {
    var table = parseCsv(text.replace(/^﻿/, ""));
    if (table.length < 2) throw new Error("The CSV has no data rows.");
    var head = table[0].map(function (h) { return h.trim().toLowerCase(); });
    var col = function (n) { return head.indexOf(n); };
    if (col("id") < 0 || col("title") < 0) throw new Error("The CSV needs at least the columns id and title.");
    var seen = {}, controls = [];
    table.slice(1).forEach(function (r) {
      var id = (r[col("id")] || "").trim(); if (!id || seen[id]) return; seen[id] = true;
      var split = function (n) { var i = col(n); return i < 0 ? [] : (r[i] || "").split(/[;|]/).map(function (s) { return s.trim(); }).filter(Boolean); };
      controls.push({ id: id, title: (r[col("title")] || "").trim(), description: col("description") < 0 ? "" : (r[col("description")] || "").trim(),
        priority: col("priority") < 0 ? "" : (r[col("priority")] || "").trim().toUpperCase(), iso: split("iso27001"), csf: split("nist_csf") });
    });
    if (!controls.length) throw new Error("No control rows found.");
    state.controls = controls;
    return controls.length;
  }
  function importDoc(doc) {
    if (!doc || typeof doc !== "object" || !doc.items) throw new Error("Not a matrix export (missing items).");
    var ignored = 0, applied = 0;
    state.controls = Array.isArray(doc.controls) ? doc.controls : [];
    var known = {}; rows().forEach(function (r) { known[r.id] = true; });
    state.items = {};
    Object.keys(doc.items).forEach(function (id) {
      var v = doc.items[id];
      if (!known[id] || !v || !statusById[v.status]) { ignored++; return; }
      state.items[id] = { status: v.status, priority: CAT.priorities.indexOf(v.priority) >= 0 ? v.priority : "", owner: String(v.owner || ""), due: String(v.due || ""), evidence: String(v.evidence || "") };
      applied++;
    });
    state.organisation = String(doc.organisation || ""); state.assessment_date = String(doc.assessment_date || ""); state.assessor = String(doc.assessor || "");
    return { applied: applied, ignored: ignored };
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    var dark = t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
    $("#theme-toggle").textContent = dark ? "Light theme" : "Dark theme";
    $("#theme-toggle").setAttribute("aria-pressed", String(dark));
  }

  /* ---------- wiring ---------- */
  function init() {
    load();
    var fs = $("#filter-status"); CAT.statuses.forEach(function (s) { fs.appendChild(el("option", { value: s.id, text: s.label })); });
    var fp = $("#filter-priority"); CAT.priorities.forEach(function (p) { fp.appendChild(el("option", { value: p, text: p })); });
    ["group", "status", "priority"].forEach(function (k) { $("#filter-" + k).addEventListener("change", function (e) { filters[k] = e.target.value; renderMatrix(); }); });
    $("#filter-text").addEventListener("input", function (e) { filters.text = e.target.value.trim().toLowerCase(); renderMatrix(); });
    $("#org").addEventListener("input", function (e) { state.organisation = e.target.value; save(); });
    $("#date").addEventListener("input", function (e) { state.assessment_date = e.target.value; save(); });
    $("#assessor").addEventListener("input", function (e) { state.assessor = e.target.value; save(); });

    $("#btn-sample").addEventListener("click", function () {
      state = JSON.parse(JSON.stringify({ organisation: SAMPLE.organisation, assessment_date: SAMPLE.assessment_date, assessor: SAMPLE.assessor, items: SAMPLE.items, controls: [] }));
      save(); renderAll(); say("Sample loaded: " + SAMPLE.organisation + " (fictional).");
    });
    $("#btn-export").addEventListener("click", function () {
      var doc = exportDoc(); download("uae-ia-matrix-" + slug(doc.organisation) + "-" + (doc.assessment_date || "undated") + ".json", JSON.stringify(doc, null, 2)); say("JSON exported.");
    });
    $("#btn-export-csv").addEventListener("click", function () { download("uae-ia-matrix-" + slug(state.organisation) + ".csv", exportCsv(), "text/csv"); say("CSV exported."); });
    $("#file-import").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return; var rd = new FileReader();
      rd.onload = function () { try { var r = importDoc(JSON.parse(rd.result)); save(); renderAll(); say("Imported " + r.applied + " items" + (r.ignored ? ", " + r.ignored + " ignored" : "") + "."); } catch (err) { say("Import failed: " + err.message); } e.target.value = ""; };
      rd.readAsText(f);
    });
    $("#file-controls").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return; var rd = new FileReader();
      rd.onload = function () { try { var n = importControls(rd.result); save(); renderAll(); say(n + " controls imported. Family rows stay as headings; scoring now uses the controls."); } catch (err) { say("Control import failed: " + err.message); } e.target.value = ""; };
      rd.readAsText(f);
    });
    $("#btn-print").addEventListener("click", function () { window.print(); });
    $("#btn-reset").addEventListener("click", function () {
      state = { organisation: "", assessment_date: "", assessor: "", items: {}, controls: [] };
      try { localStorage.removeItem(STORAGE); } catch (e) { /* ignore */ }
      renderAll(); say("Matrix reset.");
    });
    var saved = null; try { saved = localStorage.getItem("uae-ia-theme"); } catch (e) { /* ignore */ }
    applyTheme(saved);
    $("#theme-toggle").addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var dark = cur === "dark" || (!cur && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark"; try { localStorage.setItem("uae-ia-theme", next); } catch (e) { /* ignore */ } applyTheme(next);
    });
    if (/[?&]sample=1/.test(location.search) && !Object.keys(state.items).length) $("#btn-sample").click(); else renderAll();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
