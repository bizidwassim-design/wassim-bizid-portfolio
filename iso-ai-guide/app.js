"use strict";
(() => {
  const D = window.ISO_GUIDE, $ = s => document.querySelector(s);
  const KEY = "iso-compass-plan-v1", THEME = "iso-compass-theme-v1";
  const items = D.phases.flatMap(p => p.items);
  let completed = new Set(), mode = "business", storageAvailable = true;
  $(".skip").addEventListener("click", e => { e.preventDefault(); $("#main").focus(); });
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => { if (k === "class") node.className = v; else node.setAttribute(k, v); });
    children.flat().forEach(c => node.append(c instanceof Node ? c : document.createTextNode(String(c)))); return node;
  }
  function tone(id) { return D.standards.find(s => s.id === id).tone; }
  function tag(id) { return el("span", { class: "tag " + tone(id) }, id); }
  function openView(id, focus = false) {
    if (!document.getElementById(id)?.classList.contains("view")) id = "overview";
    document.querySelectorAll(".view").forEach(n => { n.hidden = n.id !== id; });
    document.querySelectorAll("[data-view]").forEach(n => n.setAttribute("aria-pressed", String(n.dataset.view === id)));
    $("#view-label").textContent = document.querySelector(`[data-view="${id}"]`).textContent.replace(/[◈▦⌁☑↗]|0[1-5]/g, "").trim();
    if (focus) { $("#main").focus(); window.scrollTo(0, 0); }
  }
  function navigate(id) { if (location.hash.slice(1) === id) openView(id, true); else location.hash = id; }
  document.querySelectorAll("[data-view]").forEach(n => n.addEventListener("click", () => navigate(n.dataset.view)));
  document.querySelectorAll("[data-open]").forEach(n => n.addEventListener("click", e => { e.preventDefault(); navigate(n.dataset.open); }));
  window.addEventListener("hashchange", () => openView(location.hash.slice(1), true));
  D.standards.forEach(s => {
    $("#standard-cards").append(el("article", { class: "standard-card " + s.tone },
      el("div", { class: "standard-head" }, el("span", { class: "small-caps" }, s.label), el("span", { class: "edition" }, s.year)),
      el("p", { class: "standard-number" }, el("small", {}, "ISO/IEC"), s.id),
      el("span", { class: "type-label" }, s.type), el("h3", {}, s.title), el("p", {}, s.summary),
      el("div", { class: "standard-question" }, s.question), el("p", { class: "assurance" }, s.assurance),
      el("a", { href: s.source, target: "_blank", rel: "noopener noreferrer", class: "source-link" }, "Official source ↗")));
  });
  function renderExample() {
    const box = $("#use-case-result"); box.replaceChildren();
    D.examples[$("#use-case").value].forEach(([id, title, body]) => box.append(el("article", { class: "example-card " + tone(id) }, tag(id), el("h3", {}, title), el("p", {}, body))));
  }
  $("#use-case").addEventListener("change", renderExample); renderExample();
  function renderComparison() {
    const query = $("#comparison-search").value.trim().toLowerCase();
    const rows = D.comparison[mode].filter(r => r.join(" ").toLowerCase().includes(query));
    $("#comparison-rows").replaceChildren(...rows.map(r => el("tr", {}, el("th", { scope: "row" }, r[0]), ...r.slice(1).map(c => el("td", {}, c)))));
    $("#comparison-caption").textContent = mode === "business" ? "Thematic comparison · business perspective" : "Original evidence ideas · not an official clause mapping";
    $("#comparison-status").textContent = rows.length ? `${rows.length} comparison dimensions shown.` : "No matching dimensions. Try a different search.";
  }
  document.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.mode; document.querySelectorAll("[data-mode]").forEach(n => n.setAttribute("aria-pressed", String(n === b))); renderComparison();
  }));
  $("#comparison-search").addEventListener("input", renderComparison); renderComparison();
  $("#decision-form").addEventListener("submit", e => {
    e.preventDefault(); const ai = new FormData(e.currentTarget).get("ai"), goal = $("#goal").value;
    let title, body, next, supporting;
    if (ai === "unknown") {
      title = "Start with discovery, not certification.";
      body = "Establish whether AI is present in your own services or supplier features. Keep information security risk management active while you clarify the scope.";
      next = "Create an AI use-case inventory and assign one owner to confirm the scope.";
      supporting = "27001 supports current security needs. Assess 42001 and 27090 after confirming AI use.";
    } else if (ai === "no") {
      title = "Start with the information security scope.";
      body = "ISO/IEC 27001 is the most directly relevant lens for the stated non-AI scope. AI governance or AI attack testing should not be added merely to collect standard numbers.";
      next = goal === "security" ? "Agree the scope, risk criteria and first security risk assessment." : "Your selected AI priority conflicts with a non-AI scope. Confirm AI use before choosing AI-specific workstreams.";
      supporting = "Revisit 42001 and 27090 when AI enters the service or supplier chain.";
    } else {
      const rec = {
        security: ["Lead with information security risk.", "Use 27001 to frame the ISMS workstream. Include AI assets and dependencies; bring AI governance and threat specialists into treatment decisions.", "Define the service boundary and review the most consequential information security risks.", "42001 adds AI oversight; 27090 informs AI-specific security work."],
        governance: ["Lead with accountable AI governance.", "Use 42001 to structure the AIMS workstream. Define ownership, intended use, impacts and oversight without assuming cybersecurity is already covered.", "Assign AI owners and review intended uses, affected parties and escalation responsibilities.", "27001 supports the security programme; 27090 informs relevant AI threat treatment."],
        threats: ["Lead with an AI security workstream.", "Use 27090 as guidance for examining threats to AI systems. It is not a substitute for an ISMS or AIMS, and it is not a third management-system certification.", "Select one AI system and document its data/model flows, attack paths and testable mitigations.", "27001 and 42001 provide complementary risk governance and accountability."]
      }[goal]; [title, body, next, supporting] = rec;
    }
    $("#recommendation").replaceChildren(el("span", { class: "pill" }, "Suggested starting point · not an applicability verdict"), el("h2", {}, title), el("p", {}, body), el("h3", {}, "Bring the other lenses with you"), el("p", {}, supporting), el("div", { class: "next-action" }, el("span", { class: "small-caps" }, "YOUR NEXT ACTION"), el("p", {}, next)), el("button", { type: "button", class: "button primary", id: "go-to-plan" }, "Open the action plan →"));
    $("#go-to-plan").addEventListener("click", () => navigate("plan"));
  });
  try { const raw = JSON.parse(localStorage.getItem(KEY) || "[]"); if (Array.isArray(raw)) completed = new Set(raw.filter(id => items.some(i => i.id === id))); } catch { storageAvailable = false; }
  function updateProgress() {
    $("#plan-count").textContent = `${completed.size} / ${items.length} actions`;
    $("#plan-progress").value = completed.size;
    $("#plan-status").textContent = `${completed.size} of ${items.length} starter actions marked complete.`;
    if (!storageAvailable) $("#storage-note").textContent = "Browser storage is unavailable. Checkmarks work for this session; export to keep a copy.";
  }
  function savePlan() { try { localStorage.setItem(KEY, JSON.stringify([...completed])); } catch { storageAvailable = false; } updateProgress(); }
  D.phases.forEach((p, index) => {
    const list = el("div", { class: "checklist" });
    p.items.forEach(i => {
      const input = el("input", { type: "checkbox", id: "task-" + i.id }); input.checked = completed.has(i.id);
      const row = el("label", { class: "check-row", for: "task-" + i.id }, input, el("span", {}, el("strong", {}, i.title), el("small", {}, i.detail), el("span", { class: "lens-tags" }, ...i.lenses.map(tag))));
      input.addEventListener("change", () => { if (input.checked) completed.add(i.id); else completed.delete(i.id); savePlan(); }); list.append(row);
    });
    $("#plan-phases").append(el("article", { class: "phase panel" }, el("div", { class: "phase-heading" }, el("span", { class: "phase-number" }, "0" + (index + 1)), el("div", {}, el("h2", {}, p.name), el("p", {}, p.subtitle))), list));
  }); updateProgress();
  $("#reset").addEventListener("click", () => { if (!completed.size || window.confirm("Reset all starter-plan checkmarks?")) { completed.clear(); document.querySelectorAll(".check-row input").forEach(i => { i.checked = false; }); savePlan(); } });
  function download(name, text, type) { const url = URL.createObjectURL(new Blob([text], { type })); const a = el("a", { href: url, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  $("#export-json").addEventListener("click", () => download("iso-compass-starter-plan.json", JSON.stringify({ schema: "iso-compass-plan/1", exportedAt: new Date().toISOString(), disclaimer: "Original planning aid, not an ISO checklist, compliance score or certification assessment.", actions: items.map(i => ({ ...i, complete: completed.has(i.id) })), sources: D.sources }, null, 2) + "\n", "application/json"));
  $("#export-md").addEventListener("click", () => {
    const out = ["# ISO Compass — Starter plan", "", "Original planning aid. Not an official clause mapping, full checklist or certification assessment.", "", `Progress: ${completed.size}/${items.length} starter actions marked complete.`, ""];
    D.phases.forEach(p => { out.push("## " + p.name, ""); p.items.forEach(i => out.push(`- [${completed.has(i.id) ? "x" : " "}] **${i.title}** — ${i.detail} (Lenses: ${i.lenses.join(", ")})`)); out.push(""); });
    out.push("## Official references", "", ...D.sources.map(s => `- [${s.title}](${s.url})`)); download("iso-compass-starter-plan.md", out.join("\n"), "text/markdown");
  });
  D.sources.forEach(s => $("#source-list").append(el("article", { class: "panel source-card" }, el("span", { class: "small-caps" }, s.tag), el("h2", {}, s.title), el("p", {}, s.text), el("a", { href: s.url, target: "_blank", rel: "noopener noreferrer" }, "Read the official source ↗"))));
  function applyTheme(theme) { document.documentElement.dataset.theme = theme; $("#theme").setAttribute("aria-pressed", String(theme === "dark")); $("#theme").textContent = theme === "dark" ? "Light theme" : "Dark theme"; }
  try { applyTheme(localStorage.getItem(THEME) === "dark" ? "dark" : "light"); } catch { applyTheme("light"); }
  $("#theme").addEventListener("click", () => { const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; applyTheme(t); try { localStorage.setItem(THEME, t); } catch { /* Theme works without persistence. */ } });
  $("#print").addEventListener("click", () => window.print()); openView(location.hash.slice(1));
})();
