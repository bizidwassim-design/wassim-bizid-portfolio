/* Overlays: project drawer, certificate lightbox, command palette, terminal, shortcuts. */
(function () {
  "use strict";
  var PF = window.PF, D = PF.D, h = PF.h, $ = PF.$, $$ = PF.$$, icon = PF.icon;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var openOverlay = null, lastFocus = null;

  /* ---------- generic open/close with focus handling ---------- */
  var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  function openEl(el, focusSel) {
    if (openOverlay && openOverlay !== el) closeEl(openOverlay, true);
    lastFocus = lastFocus || document.activeElement;
    el.hidden = false; openOverlay = el;
    document.body.style.overflow = el.id === "terminal" ? "" : "hidden";
    var f = focusSel ? $(focusSel, el) : $(FOCUSABLE, el);
    if (f) setTimeout(function () { f.focus(); }, 0);
  }
  function closeEl(el, keepFocus) {
    el.hidden = true; if (openOverlay === el) openOverlay = null;
    document.body.style.overflow = "";
    if (!keepFocus && lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* gone */ } }
    if (!keepFocus) lastFocus = null;
  }
  function trap(e, el) {
    if (e.key !== "Tab") return;
    var f = $$(FOCUSABLE, el).filter(function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- project drawer ---------- */
  var drawer = $("#drawer");
  function projectByNumber(n) { return D.projects.filter(function (p) { return p.number === String(n).padStart(2, "0"); })[0]; }
  function section(title, body, cls) { return h("div", { class: "d-sec " + (cls || "") }, h("h4", { text: title }), body); }
  function renderProject(p) {
    var list = (PF.visible && PF.visible.indexOf(p) >= 0) ? PF.visible : D.projects;
    var idx = list.indexOf(p), prev = list[(idx - 1 + list.length) % list.length], next = list[(idx + 1) % list.length];
    drawer.textContent = "";
    var panel = h("div", { class: "drawer-panel", vars: { "--c": p.accent } },
      h("div", { class: "d-top" }, h("span", { class: "num", text: "PROJECT " + p.number + " OF " + D.projects.length }),
        h("button", { class: "icon-btn", type: "button", "aria-label": "Close project", html: icon("X"), on: { click: closeProject } })),
      h("h2", { id: "drawer-title", text: p.title }), h("p", { class: "d-cat", text: p.category }), h("p", { class: "d-sum", text: p.summary }),
      section("Challenge", h("p", { text: p.challenge })),
      section("What I built", h("ul", { class: "checks" }, p.built.map(function (b) { return h("li", null, h("span", { html: icon("CheckCircle2") }), b); }))),
      p.flow ? section("Automation flow", h("ol", { class: "flow" }, p.flow.map(function (s, i) { return h("li", null, h("i", { text: String(i + 1) }), s); }))) : null,
      p.attack ? section("MITRE ATT&CK · techniques these controls counter", h("ul", { class: "attack" }, p.attack.map(function (t) {
        return h("li", null, h("code", { text: t.id }), h("span", null, h("strong", { text: t.name }), " — " + t.note));
      }))) : null,
      section("Evidence of impact", h("p", { text: p.evidence }), "evidence"),
      section("Technologies", h("div", { class: "pills" }, p.tools.map(function (t) { return h("span", { class: "pill", text: t }); }))),
      h("div", { class: "d-nav" },
        h("button", { class: "btn btn-ghost btn-sm", type: "button", on: { click: function () { PF.openProject(prev.number); } } }, h("span", { html: icon("ChevronLeft") }), "Previous"),
        h("button", { class: "btn btn-ghost btn-sm", type: "button", on: { click: function () { PF.openProject(next.number); } } }, "Next", h("span", { html: icon("ChevronRight") }))));
    drawer.appendChild(panel);
  }
  PF.openProject = function (n) {
    var p = projectByNumber(n); if (!p) return false;
    renderProject(p);
    if (!openOverlay || openOverlay !== drawer) openEl(drawer, ".icon-btn"); else { drawer.firstChild.scrollTop = 0; var b = $(".icon-btn", drawer); if (b) b.focus(); }
    history.replaceState(null, "", "#project-" + p.number);
    return true;
  };
  function closeProject() {
    closeEl(drawer);
    if (/^#project-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search + "#work");
  }
  drawer.addEventListener("click", function (e) { if (e.target === drawer) closeProject(); });
  drawer.addEventListener("keydown", function (e) { trap(e, drawer); });
  function fromHash() { var m = /^#project-(\d{1,2})$/.exec(location.hash); if (m) PF.openProject(m[1]); }
  window.addEventListener("hashchange", fromHash);

  /* ---------- certificate lightbox ---------- */
  var lightbox = $("#lightbox"), lbIndex = 0;
  function renderLightbox() {
    var c = D.certificateProofs[lbIndex];
    lightbox.textContent = "";
    lightbox.appendChild(h("div", { class: "lb" },
      h("img", { src: c.src, alt: c.name + " certificate, issued by " + c.issuer + " in " + c.year }),
      h("div", { class: "lb-cap" },
        h("div", null, h("strong", { text: c.name }), h("br"), h("small", { text: c.issuer + " · " + c.year })),
        h("div", { class: "cta" },
          h("button", { class: "icon-btn", type: "button", "aria-label": "Previous certificate", html: icon("ChevronLeft"), on: { click: function () { PF.openLightbox(lbIndex - 1); } } }),
          h("button", { class: "icon-btn", type: "button", "aria-label": "Next certificate", html: icon("ChevronRight"), on: { click: function () { PF.openLightbox(lbIndex + 1); } } }),
          h("button", { class: "icon-btn", type: "button", "aria-label": "Close preview", html: icon("X"), on: { click: closeLightbox } })))));
  }
  PF.openLightbox = function (i) {
    var n = D.certificateProofs.length; lbIndex = (i + n) % n; renderLightbox();
    lightbox.classList.add("center");
    if (openOverlay !== lightbox) openEl(lightbox, "[aria-label='Close preview']"); else { var b = $("[aria-label='Close preview']", lightbox); if (b) b.focus(); }
  };
  function closeLightbox() { closeEl(lightbox); }
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
  lightbox.addEventListener("keydown", function (e) {
    trap(e, lightbox);
    if (e.key === "ArrowRight") PF.openLightbox(lbIndex + 1);
    if (e.key === "ArrowLeft") PF.openLightbox(lbIndex - 1);
  });

  /* ---------- actions shared by palette and terminal ---------- */
  var SECTIONS = [["about", "About"], ["strengths", "Strengths"], ["value", "Business value"], ["work", "Projects"], ["dashboards", "Dashboards"], ["toolkit", "Open source"], ["events", "Learning"], ["moments", "Moments"], ["values", "Values"], ["credentials", "Credentials"], ["contact", "Contact"]];
  function go(id) {
    var el = document.getElementById(id); if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  }
  function openLink(url) { window.open(url, "_blank", "noopener,noreferrer"); }
  function copy(text) {
    var done = function () { PF.toast("Copied: " + text); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { PF.toast(text); });
    else PF.toast(text);
  }
  var U = D.urls;
  var ACTIONS = [
    ["Toggle light / dark theme", "Action", function () { PF.toggleTheme(); }],
    ["Open the terminal", "Action", function () { PF.openTerminal(); }],
    ["Book a 30-minute call", "Link", function () { openLink(U.calendly); }],
    ["Send an email", "Link", function () { location.href = "mailto:" + U.email; }],
    ["Copy my email address", "Action", function () { copy(U.email); }],
    ["Open LinkedIn", "Link", function () { openLink(U.linkedIn); }],
    ["Open GitHub", "Link", function () { openLink(U.github); }],
    ["Print or save as PDF", "Action", function () { window.print(); }]
  ];

  /* ---------- command palette ---------- */
  var palette = $("#palette"), pItems = [], pSel = 0, pList, pInput;
  function buildItems() {
    var items = [];
    SECTIONS.forEach(function (s) { items.push({ t: s[1], g: "Section", k: s[1].toLowerCase() + " section jump", run: function () { go(s[0]); } }); });
    D.projects.forEach(function (p) { items.push({ t: p.number + " · " + p.title, g: "Project", k: (p._text || p.title.toLowerCase()), run: function () { PF.openProject(p.number); } }); });
    D.ownProjects.forEach(function (p) { items.push({ t: p.name, g: "Open source", k: (p.name + " " + p.tags.join(" ") + " " + p.description).toLowerCase(), run: function () { openLink(p.href); } }); });
    D.certificateProofs.forEach(function (c, i) { items.push({ t: c.name, g: "Certificate", k: (c.name + " " + c.issuer + " " + c.year).toLowerCase(), run: function () { PF.openLightbox(i); } }); });
    ACTIONS.forEach(function (a) { items.push({ t: a[0], g: a[1], k: a[0].toLowerCase(), run: a[2] }); });
    return items;
  }
  function score(item, words) {
    var t = item.t.toLowerCase(), s = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (t.indexOf(w) === 0) s += 6; else if (t.indexOf(w) > 0) s += 4; else if (item.k.indexOf(w) >= 0) s += 1; else return -1;
    }
    return s;
  }
  function renderPalette() {
    var q = pInput.value.trim().toLowerCase(), words = q ? q.split(/\s+/) : [];
    var scored = pItems.map(function (it) { return { it: it, s: words.length ? score(it, words) : (it.g === "Section" || it.g === "Action" || it.g === "Link" ? 1 : 0) }; })
      .filter(function (x) { return x.s >= 0 && (words.length || x.s > 0); })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, 40).map(function (x) { return x.it; });
    pSel = 0; pList.textContent = "";
    if (!scored.length) pList.appendChild(h("li", { "aria-disabled": "true", text: "No result. Try “defender”, “zero trust” or “cissp”." }));
    scored.forEach(function (it, i) {
      var li = h("li", { role: "option", "aria-selected": String(i === 0), on: { mousemove: function () { select(i); }, click: function () { choose(it); } } }, h("span", { class: "t", text: it.t }), h("span", { class: "grp", text: it.g }));
      pList.appendChild(li);
    });
    pList._items = scored;
  }
  function select(i) {
    var lis = $$("li[role=option]", pList); if (!lis.length) return;
    pSel = (i + lis.length) % lis.length;
    lis.forEach(function (li, k) { li.setAttribute("aria-selected", String(k === pSel)); });
    lis[pSel].scrollIntoView({ block: "nearest" });
  }
  function choose(it) { closePalette(true); setTimeout(it.run, 20); }
  function closePalette(keep) { closeEl(palette, keep); }
  PF.openPalette = function (prefill) {
    if (!pInput) {
      pInput = h("input", { type: "text", placeholder: "Search projects, certificates, actions…", "aria-label": "Search", autocomplete: "off", spellcheck: "false", role: "combobox", "aria-expanded": "true", "aria-controls": "pal-list" });
      pList = h("ul", { class: "pal-list", id: "pal-list", role: "listbox" });
      palette.appendChild(h("div", { class: "pal" }, h("div", { class: "pal-in" }, h("span", { html: icon("Search") }), pInput, h("kbd", { text: "Esc" })), pList,
        h("div", { class: "pal-foot" }, h("span", { text: "↑↓ navigate" }), h("span", { text: "↵ open" }), h("span", { text: "esc close" }))));
      pInput.addEventListener("input", renderPalette);
      pInput.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); select(pSel + 1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); select(pSel - 1); }
        else if (e.key === "Enter") { e.preventDefault(); var it = pList._items && pList._items[pSel]; if (it) choose(it); }
      });
      palette.addEventListener("click", function (e) { if (e.target === palette) closePalette(); });
      palette.addEventListener("keydown", function (e) { trap(e, palette); });
    }
    pItems = buildItems(); palette.classList.add("center");
    pInput.value = prefill || ""; renderPalette();
    openEl(palette, "input");
  };
  $("#open-palette").addEventListener("click", function () { PF.openPalette(); });

  /* ---------- terminal ---------- */
  var term = $("#terminal"), tOut, tIn, tHist = [], tPos = 0;
  var COMMANDS = ["help", "whoami", "ls", "open", "cat", "stats", "skills", "certs", "contact", "github", "theme", "neofetch", "clear", "exit"];
  function out(text, cls) { var d = h("div", { class: cls || "", text: text }); tOut.appendChild(d); tOut.scrollTop = tOut.scrollHeight; return d; }
  function outLink(label, url) { var d = h("div"); d.appendChild(h("a", { href: url, target: "_blank", rel: "noopener noreferrer", text: label })); tOut.appendChild(d); tOut.scrollTop = tOut.scrollHeight; }
  function findProject(arg) {
    if (/^\d{1,2}$/.test(arg)) return projectByNumber(arg);
    var w = arg.toLowerCase();
    return D.projects.filter(function (p) { return p.title.toLowerCase().indexOf(w) >= 0 || p._text.indexOf(w) >= 0; })[0];
  }
  var CMD = {
    help: function () {
      [["help", "this list"], ["whoami", "who I am"], ["ls [projects|oss|certs|events|creds]", "list things"], ["open <n|keyword|section>", "open a project or jump to a section"], ["cat <n>", "read a case study here"], ["stats", "measured outcomes"], ["skills", "most used technologies"], ["certs", "certifications"], ["contact", "how to reach me"], ["github", "live GitHub numbers"], ["theme [light|dark]", "switch theme"], ["neofetch", "profile card"], ["clear", "clear the screen"], ["exit", "close the terminal"]]
        .forEach(function (r) { out("  " + r[0].padEnd(34) + r[1], "m"); });
    },
    whoami: function () {
      out("Wassim Bizid", "c"); out("Cybersecurity & GRC leader · CISSP · CISM · ITIL · Executive Mini-MBA");
      out("Security that is measurable, explainable and usable.", "m");
    },
    ls: function (a) {
      var w = (a[0] || "projects").toLowerCase();
      if (w.indexOf("proj") === 0) D.projects.forEach(function (p) { out(p.number + "  " + p.title); });
      else if (w === "oss" || w.indexOf("open") === 0) D.ownProjects.forEach(function (p, i) { out(String(i + 1).padStart(2, "0") + "  " + p.name); });
      else if (w.indexOf("cert") === 0) D.certificateProofs.forEach(function (c) { out(c.year + "  " + c.name + " · " + c.issuer); });
      else if (w.indexOf("event") === 0) D.events.forEach(function (e) { out(e.date.padEnd(12) + e.title + " · " + e.place); });
      else if (w.indexOf("cred") === 0) D.credentials.forEach(function (c) { out(c.name + " · " + c.issuer); });
      else out("ls: unknown target “" + w + "”. Try projects, oss, certs, events, creds.", "m");
    },
    open: function (a) {
      if (!a.length) { out("usage: open <n|keyword|section|github|linkedin|calendly>", "m"); return; }
      var w = a.join(" ").toLowerCase();
      var links = { github: U.github, linkedin: U.linkedIn, calendly: U.calendly };
      if (links[w]) { out("opening " + w + "…", "m"); openLink(links[w]); return; }
      var sec = SECTIONS.filter(function (s) { return s[0] === w || s[1].toLowerCase() === w; })[0];
      if (sec) { out("jumping to " + sec[1], "m"); closeTerminal(); go(sec[0]); return; }
      var p = findProject(w);
      if (p) { out("opening project " + p.number + ": " + p.title, "m"); closeTerminal(); PF.openProject(p.number); return; }
      var o = D.ownProjects.filter(function (x) { return x.name.toLowerCase().indexOf(w) >= 0; })[0];
      if (o) { out("opening " + o.name, "m"); openLink(o.href); return; }
      out("open: nothing found for “" + w + "”.", "m");
    },
    cat: function (a) {
      var p = a.length && findProject(a.join(" "));
      if (!p) { out("usage: cat <project number>   (try: ls projects)", "m"); return; }
      out(p.number + " · " + p.title, "c"); out(p.category, "b"); out(""); out(p.summary); out(""); out("What I built", "c");
      p.built.forEach(function (b) { out("  • " + b); }); out(""); out("Evidence", "c"); out(p.evidence);
    },
    stats: function () { D.impactMetrics.forEach(function (m) { out(m.value.padEnd(12) + m.label + "  ·  " + m.detail, ""); }); },
    skills: function () {
      var n = {}; D.projects.forEach(function (p) { p.tools.forEach(function (t) { n[t] = (n[t] || 0) + 1; }); });
      Object.keys(n).sort(function (a, b) { return n[b] - n[a] || a.localeCompare(b); }).slice(0, 14).forEach(function (t) { out(String(n[t]).padStart(2) + " × " + t); });
    },
    certs: function () { D.credentials.filter(function (c) { return c.kind === "certification"; }).forEach(function (c) { out("✓ " + c.name + " · " + c.issuer, "c"); }); },
    contact: function () { out("email     " + U.email); outLink("linkedin  " + U.linkedIn, U.linkedIn); outLink("call      " + U.calendly, U.calendly); },
    github: function () {
      if (PF.gh) { out(PF.gh.user.public_repos + " public repos · " + PF.gh.stars + " stars (live)", "c"); PF.gh.repos.slice(0, 6).forEach(function (r) { out("  " + r.name + "  ★" + r.stargazers_count, "m"); }); }
      else out("live numbers are not available yet.", "m");
      outLink("github.com/bizidwassim-design →", U.github);
    },
    theme: function (a) { var t = a[0]; if (t === "light" || t === "dark") PF.setTheme(t); else PF.toggleTheme(); out("theme: " + document.documentElement.getAttribute("data-theme"), "m"); },
    neofetch: function () {
      ["      ╭───╮     wassim@portfolio", "      │ WB│     ─────────────────", "      ╰───╯     role      cybersecurity & GRC leader", "                focus     identity · Zero Trust · SecOps · AI governance", "                certs     CISSP · CISM · Azure Security Engineer · ITIL", "                projects  " + D.projects.length + " case studies · " + D.ownProjects.length + " open-source repos", "                based     Montréal ↔ Dubai"].forEach(function (l) { out(l, "c"); });
    },
    clear: function () { tOut.textContent = ""; },
    exit: function () { closeTerminal(); }
  };
  function run(line) {
    out("$ " + line, "b");
    var parts = line.trim().split(/\s+/), name = (parts.shift() || "").toLowerCase();
    if (!name) return;
    if (CMD[name]) CMD[name](parts); else out(name + ": command not found. Type “help”.", "m");
  }
  function buildTerminal() {
    tOut = h("div", { class: "t-out", "aria-live": "polite" });
    tIn = h("input", { type: "text", "aria-label": "Terminal command", autocomplete: "off", spellcheck: "false", autocapitalize: "off" });
    term.appendChild(h("div", { class: "t-bar" }, h("i"), h("i"), h("i"), h("span", { text: "wassim@portfolio: ~" }), h("button", { type: "button", "aria-label": "Close terminal", html: icon("X"), on: { click: closeTerminal } })));
    term.appendChild(tOut);
    term.appendChild(h("div", { class: "t-in" }, h("span", { text: "$" }), tIn));
    tIn.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { var v = tIn.value; tIn.value = ""; if (v.trim()) { tHist.push(v); tPos = tHist.length; } run(v); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (tPos > 0) tIn.value = tHist[--tPos] || ""; }
      else if (e.key === "ArrowDown") { e.preventDefault(); tPos = Math.min(tHist.length, tPos + 1); tIn.value = tHist[tPos] || ""; }
      else if (e.key === "Tab") { e.preventDefault(); var v2 = tIn.value.toLowerCase(); var m = COMMANDS.filter(function (c) { return c.indexOf(v2) === 0; }); if (m.length === 1) tIn.value = m[0] + " "; }
      else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); CMD.clear(); }
    });
    out("Welcome. Type “help” to see what this terminal can do.", "m");
    out("");
  }
  PF.openTerminal = function () {
    if (!tOut) buildTerminal();
    if (openOverlay && openOverlay !== term) closeEl(openOverlay, true);
    term.hidden = false; openOverlay = term; document.body.style.overflow = "";
    setTimeout(function () { tIn.focus(); }, 0);
  };
  function closeTerminal() { term.hidden = true; if (openOverlay === term) openOverlay = null; var b = $("#open-terminal"); if (b) b.focus(); }
  $("#open-terminal").addEventListener("click", PF.openTerminal);

  /* ---------- global shortcuts ---------- */
  document.addEventListener("keydown", function (e) {
    var typing = /^(input|textarea|select)$/i.test(e.target.tagName || "");
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (openOverlay === palette) closePalette(); else PF.openPalette(); return; }
    if (e.key === "Escape") {
      if (openOverlay === palette) closePalette();
      else if (openOverlay === drawer) closeProject();
      else if (openOverlay === lightbox) closeLightbox();
      else if (openOverlay === term) closeTerminal();
      return;
    }
    if (e.key === "`" && !typing && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (openOverlay === term) closeTerminal(); else PF.openTerminal(); }
  });

  /* ---------- deep link + offline ---------- */
  fromHash();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { /* offline support is optional */ }); });
  }
})();
