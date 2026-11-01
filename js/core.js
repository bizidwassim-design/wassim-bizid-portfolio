/* Portfolio core: rendering, theme, project explorer, live GitHub numbers. No dependencies. */
(function () {
  "use strict";
  var D = window.PF_DATA, ICONS = window.PF_ICONS || {};
  var PF = (window.PF = { D: D });
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  function icon(name) {
    return '<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v; /* only ever used for the static icon set */
      else if (k === "vars") Object.keys(v).forEach(function (n) { el.style.setProperty(n, v[n]); });
      else if (k === "on") Object.keys(v).forEach(function (n) { el.addEventListener(n, v[n]); });
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) kid.forEach(function (k) { append(el, k); });
    else el.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function hydrateIcons(root) {
    $$("[data-icon]", root).forEach(function (n) { n.innerHTML = icon(n.getAttribute("data-icon")); n.removeAttribute("data-icon"); });
  }
  var TONES = { "#EAF4FF": "#2F80ED", "#FFF0EC": "#FF7A6B", "#E7FAF4": "#42C7A5", "#F0EEFF": "#8B7CF6", "#FFF8D8": "#F5C451" };
  function toneColor(t) { return TONES[String(t).toUpperCase()] || "#2F80ED"; }
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2200);
  }
  function titleCase(s) { return s.toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); }); }
  PF.icon = icon; PF.h = h; PF.$ = $; PF.$$ = $$; PF.toast = toast; PF.hydrateIcons = hydrateIcons; PF.toneColor = toneColor;

  function head(id, eyebrow, title, desc, extra) {
    var left = h("div", { class: "sec-head" },
      h("p", { class: "eyebrow", text: eyebrow }),
      h("h2", { id: id, text: title }),
      desc ? h("p", { text: desc }) : null);
    return extra ? h("div", { class: "row-head" }, left, extra) : left;
  }
  function mount(id, kids) {
    var s = document.getElementById(id);
    var w = h("div", { class: "wrap reveal" });
    append(w, kids);
    s.appendChild(w);
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  function setTheme(t, persist) {
    root.setAttribute("data-theme", t);
    var b = $("#theme-toggle");
    b.innerHTML = icon(t === "dark" ? "Sun" : "Moon");
    b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    if (persist) { try { localStorage.setItem("pf-theme", t); } catch (e) { /* storage blocked */ } }
  }
  PF.setTheme = function (t) { setTheme(t, true); };
  PF.toggleTheme = function () { var t = root.getAttribute("data-theme") === "dark" ? "light" : "dark"; setTheme(t, true); return t; };
  var stored = null;
  try { stored = localStorage.getItem("pf-theme"); } catch (e) { /* ignore */ }
  setTheme(stored || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), false);
  $("#theme-toggle").addEventListener("click", PF.toggleTheme);

  /* ---------- header: scrolled state, mobile menu, active section ---------- */
  var header = $("#top-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var nav = $("#nav"), menuBtn = $("#menu-toggle");
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); } });

  /* ---------- hero: network, typed line ---------- */
  (function network() {
    var svg = $("#net"), W = 1200, H = 560, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    var pts = [], i, j, ns = "http://www.w3.org/2000/svg";
    for (i = 0; i < 26; i++) pts.push({ x: rnd() * W, y: rnd() * H });
    for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) {
      var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      if (dx * dx + dy * dy < 210 * 210) {
        var l = document.createElementNS(ns, "line");
        l.setAttribute("class", "ln"); l.setAttribute("x1", pts[i].x); l.setAttribute("y1", pts[i].y);
        l.setAttribute("x2", pts[j].x); l.setAttribute("y2", pts[j].y); svg.appendChild(l);
      }
    }
    pts.forEach(function (p, k) {
      var c = document.createElementNS(ns, "circle");
      c.setAttribute("class", "nd" + (k % 5 === 0 ? " pulse" : "")); c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 3);
      if (k % 5 === 0) c.style.animationDelay = (k % 7) * 0.6 + "s";
      svg.appendChild(c);
    });
  })();
  (function typed() {
    var words = ["grc · identity · zero trust", "microsoft security · secops · automation", "ai governance · iso/iec 42001", "risk decisions leaders can act on"];
    var el = $("#typed"), w = 0, c = 0, del = false;
    if (reduceMotion) { el.textContent = words[0]; return; }
    (function tick() {
      var full = words[w];
      c += del ? -1 : 1;
      el.textContent = full.slice(0, c);
      var wait = del ? 28 : 55;
      if (!del && c === full.length) { del = true; wait = 1700; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
      setTimeout(tick, wait);
    })();
  })();

  /* ---------- stats ---------- */
  var sg = $("#stat-grid");
  D.impactMetrics.forEach(function (m) {
    sg.appendChild(h("div", { class: "stat" }, h("b", { text: m.value }), h("strong", { text: m.label }), h("span", { text: m.detail })));
  });

  /* ---------- about ---------- */
  mount("about", [
    head("about-title", "01 · Biography", "A bridge between cyber strategy and execution.",
      "My career has developed across infrastructure, cloud, IT operations and cybersecurity, giving me the context to connect board-level risk with the day-to-day reality of technical teams."),
    h("article", { class: "card about-card" },
      h("div", { class: "about-split" },
        h("p", { class: "about-lead", text: "I am a cybersecurity and IT leader with more than 15 years in technology and more than 10 years focused on security." }),
        h("div", { class: "about-copy" },
          h("p", { text: "My work spans governance, risk and compliance, identity, Microsoft security, vulnerability management, network segmentation, SecOps, industrial environments and automation. I am equally comfortable discussing risk treatment with leadership and working with technical teams to make the control operational." }),
          h("p", { text: "I have led multidisciplinary teams and delivered programmes across multi-site environments in Canada and the United States, while maintaining an active professional perspective on the Middle East cybersecurity ecosystem." }),
          h("p", { text: "What defines my approach is the combination of governance discipline, hands-on engineering and trusted collaboration. I want security to be measurable, understandable and sustainable, not a collection of disconnected tools." }))),
      h("div", { class: "sub" },
        h("p", { class: "eyebrow", text: "Selected industry experience" }),
        h("p", { class: "d", text: "My professional journey has crossed very different operating and regulatory environments. That range helps me adapt security controls to the business instead of forcing every organisation into the same model." }),
        h("div", { class: "grid g4 mt-s" }, D.sectorExperience.map(function (s, i) {
          var c = ["#2F80ED", "#42C7A5", "#FF7A6B", "#8B7CF6"][i % 4];
          var box = h("div", { class: "logo-box" }, h("img", { src: s.logo, alt: s.organisation + " logo", loading: "lazy" }));
          box.style.background = s.logoBackground;
          return h("div", { class: "sector tint", vars: { "--c": c } }, box, h("small", { text: s.sector }), h("strong", { text: s.organisation }));
        }))),
      h("div", { class: "sub" },
        h("p", { class: "eyebrow", text: "Technology foundation" }),
        h("div", { class: "grid g4" }, [
          ["Microsoft Azure", "Azure administration, cloud operations, security and identity"],
          ["VMware", "VCP Data Center expertise and virtual infrastructure operations"],
          ["Linux & Unix", "Red Hat Linux, HP-UX, Unix and Solaris server environments"],
          ["IT service management", "ITIL practices and structured change management"]
        ].map(function (x) { return h("div", { class: "mini" }, h("strong", { text: x[0] }), h("span", { text: x[1] })); }))),
      h("div", { class: "grid g3 sub" }, [["Governance", "Clear ownership", "#2F80ED"], ["Engineering", "Practical controls", "#42C7A5"], ["Leadership", "Trusted delivery", "#FF7A6B"]].map(function (x) {
        return h("div", { class: "mini tint", vars: { "--c": x[2] } }, h("span", { class: "eyebrow", text: x[0] }), h("strong", { text: x[1] }));
      })))
  ]);
  $$(".mt-s").forEach(function (n) { n.style.marginTop = "18px"; });

  /* ---------- strengths / value ---------- */
  function pointCards(list, cols) {
    return h("div", { class: "grid " + cols + " mt" }, list.map(function (p) {
      var c = toneColor(p.tone);
      return h("article", { class: "card tint", vars: { "--c": c } }, h("span", { class: "ico", html: icon(p.icon) }), h("h3", { text: p.title }), h("p", { class: "d", text: p.description }));
    }));
  }
  mount("strengths", [head("strengths-title", "02 · Strengths", "How I show up at work.", "Technical capability matters, but dependable execution also comes from how a person learns, collaborates and takes care of the details."), pointCards(D.strengths, "g4")]);
  mount("value", [head("value-title", "03 · Business value", "What I bring to an organisation.", "My value is not limited to deploying controls. I help an organisation decide what matters, deliver it efficiently and make the result visible to the people accountable for risk."), pointCards(D.businessValue, "g4")]);

  /* ---------- project explorer ---------- */
  var TOPICS = [
    ["GRC & risk", /grc|risk assessment|iso 27001|third-party|vendor|finops|assurance|risk register|risk treatment/i],
    ["Identity & Zero Trust", /iam|identity|entra|zero trust|joiner|conditional access|jml/i],
    ["Microsoft security", /microsoft|defender|purview|sharepoint|teams|attack surface|secure score/i],
    ["SecOps & detection", /secops|siem|soar|soc |soc-|detection|incident|thehive|kql|elk/i],
    ["Endpoint hardening", /endpoint|hardening|gpo|ninjaone|patch|attack surface/i],
    ["Network & OT", /network|meraki|firewall|ot|armis|vlan|segmentation|industrial/i],
    ["Data protection", /dlp|data governance|purview|collaboration|data protection/i],
    ["Resilience", /continuity|disaster|backup|recovery|datto|resilience/i],
    ["Vulnerability management", /vulnerab|openvas|kali/i],
    ["Human risk", /awareness|phishing|human-risk|human risk/i],
    ["Automation", /automation|powershell|rest api|workflow|soar/i],
    ["Agentic AI", /agentic|claude|mcp/i]
  ];
  var tagCount = {}, tagLabel = {};
  D.projects.forEach(function (p) {
    var hay = [p.title, p.category, p.tools.join(" ")].join(" ");
    p._topics = [];
    TOPICS.forEach(function (t) { if (t[1].test(hay)) { p._topics.push(t[0]); tagCount[t[0]] = (tagCount[t[0]] || 0) + 1; tagLabel[t[0]] = t[0]; } });
    p._text = [p.title, p.category, p.summary, p.challenge, p.evidence, p.built.join(" "), p.tools.join(" ")].join(" ").toLowerCase();
  });
  var topTags = TOPICS.map(function (t) { return t[0]; }).filter(function (k) { return tagCount[k]; });
  var state = { q: "", tag: "GRC & risk", sort: "num", view: "grid" };
  PF.visible = D.projects.slice();

  var search = h("input", { id: "proj-search", type: "search", placeholder: "Search 23 case studies: Defender, identity, SIEM, OT…", "aria-label": "Search case studies", autocomplete: "off" });
  var sortSel = h("select", { class: "select", "aria-label": "Sort case studies" }, h("option", { value: "num", text: "Sort: project number" }), h("option", { value: "az", text: "Sort: A to Z" }), h("option", { value: "rev", text: "Sort: newest first" }));
  var gridBtn = h("button", { type: "button", "aria-pressed": "true", "aria-label": "Grid view", html: icon("LayoutGrid") });
  var listBtn = h("button", { type: "button", "aria-pressed": "false", "aria-label": "List view", html: icon("List") });
  var filters = h("div", { class: "filters", role: "group", "aria-label": "Filter by topic" });
  var meta = h("p", { class: "result-meta", "aria-live": "polite" });
  var cases = h("div", { class: "grid g3 cases" });

  function renderFilters() {
    filters.textContent = "";
    var all = h("button", { type: "button", class: "tag", "aria-pressed": String(!state.tag), text: "All topics", on: { click: function () { state.tag = null; apply(); } } });
    filters.appendChild(all);
    topTags.forEach(function (k) {
      filters.appendChild(h("button", { type: "button", class: "tag", "aria-pressed": String(state.tag === k), text: tagLabel[k] + " · " + tagCount[k], on: { click: function () { state.tag = state.tag === k ? null : k; apply(); } } }));
    });
  }
  function renderCases() {
    cases.textContent = "";
    cases.className = "cases " + (state.view === "list" ? "list" : "grid g3");
    if (!PF.visible.length) { cases.appendChild(h("p", { class: "empty", text: "No case study matches. Try another word or clear the filter." })); return; }
    PF.visible.forEach(function (p) {
      var c = p.accent;
      var card = h("a", { href: "#project-" + p.number, class: "case", vars: { "--c": c }, "aria-label": "Open project " + p.number + ": " + p.title, on: { click: function (e) { e.preventDefault(); PF.openProject(p.number); } } },
        h("div", { class: "top" }, h("span", { class: "ico", html: icon(p.icon) }), h("span", { class: "num", text: "PROJECT " + p.number })),
        h("div", { class: "body" }, h("h3", { text: p.title }), h("p", { class: "cat", text: p.category })),
        h("p", { class: "sum", text: p.summary }),
        h("div", { class: "tools-mini" }, p.tools.slice(0, 4).map(function (t) { return h("span", { class: "pill", text: t }); })));
      cases.appendChild(card);
    });
  }
  function apply() {
    var q = state.q.trim().toLowerCase(), words = q ? q.split(/\s+/) : [];
    var list = D.projects.filter(function (p) {
      if (state.tag && p._topics.indexOf(state.tag) < 0) return false;
      return words.every(function (w) { return p._text.indexOf(w) >= 0; });
    });
    if (state.sort === "az") list.sort(function (a, b) { return a.title.localeCompare(b.title); });
    if (state.sort === "rev") list.sort(function (a, b) { return Number(b.number) - Number(a.number); });
    PF.visible = list;
    renderFilters(); renderCases();
    meta.textContent = list.length + " of " + D.projects.length + " case studies" + (state.tag ? " · topic: " + tagLabel[state.tag] : "") + (q ? " · “" + state.q.trim() + "”" : "");
  }
  search.addEventListener("input", function () { state.q = search.value; apply(); });
  sortSel.addEventListener("change", function () { state.sort = sortSel.value; apply(); });
  gridBtn.addEventListener("click", function () { state.view = "grid"; gridBtn.setAttribute("aria-pressed", "true"); listBtn.setAttribute("aria-pressed", "false"); apply(); });
  listBtn.addEventListener("click", function () { state.view = "list"; listBtn.setAttribute("aria-pressed", "true"); gridBtn.setAttribute("aria-pressed", "false"); apply(); });
  PF.filterProjects = function (q) { search.value = q || ""; state.q = q || ""; state.tag = null; apply(); };

  mount("work", [
    head("work-title", "05 · Case studies", "Select a project to read the full story.",
      "The library opens on governance, risk and compliance work. Choose All topics for the full set. Each case study shows the challenge, what I built, the evidence of impact and the technologies involved. Client names and sensitive details are intentionally removed.",
      h("div", { class: "count-pill" }, h("span", { html: icon("BookOpenCheck") }), D.projects.length + " case studies")),
    h("div", { class: "tools-row" },
      h("div", { class: "search" }, h("span", { class: "ic", html: icon("Search") }), search, h("kbd", { text: "/" })),
      sortSel, h("div", { class: "seg", role: "group", "aria-label": "View" }, gridBtn, listBtn)),
    filters, meta, cases
  ]);
  apply();
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/input|textarea|select/i.test((e.target.tagName || "")) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); search.focus(); $("#work").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  });

  /* ---------- dashboards (synthetic) ---------- */
  function meter(label, pct, color) {
    var fill = h("div", { class: "m-fill", vars: { "--c": color } }); fill.style.width = pct + "%";
    return h("div", { class: "meter" }, h("div", { class: "m-row" }, h("span", { text: label }), h("span", { text: pct + "%" })), h("div", { class: "m-track" }, fill));
  }
  function bars(vals, color) {
    return h("div", { class: "bars", vars: { "--c": color } }, vals.map(function (v) { var b = h("div", { class: "cbar" }); b.style.height = v + "%"; return b; }));
  }
  function kpis(list, k3) {
    return h("div", { class: "kpis" + (k3 ? " k3" : "") }, list.map(function (k) {
      return h("div", { class: "kpi", vars: { "--c": k[3] } }, h("small", { text: k[0] }), h("b", { text: k[1] }), k[2] ? h("i", { text: k[2] }) : null);
    }));
  }
  function dash(label, title, body) {
    return h("div", { class: "card dash" }, h("div", { class: "dash-head" }, h("div", null, h("small", { text: label }), h("b", { text: title })), h("span", { class: "badge", text: "SYNTHETIC" })), h("div", { class: "dash-body" }, body));
  }
  mount("dashboards", [
    head("dashboards-title", "Project evidence · Dashboard gallery", "From raw signals to an executive narrative.", "These reconstructions illustrate the information architecture of dashboards I designed. All numbers shown here are synthetic and do not represent any client environment."),
    h("div", { class: "grid g2 mt" },
      dash("Power BI reconstruction", "Executive risk pulse", [
        kpis([["MTTD", "24 min", "↓ 18%", "#2F80ED"], ["MTTR", "58 min", "↓ 12%", "#42C7A5"], ["90d+ vulns", "27", "↓ 9", "#FF7A6B"], ["Training", "84%", "↑ 6%", "#8B7CF6"]]),
        bars([42, 58, 51, 67, 72, 76, 83], "#2F80ED"),
        meter("Vulnerabilities 0–30 d", 78, "#42C7A5"), meter("31–60 d", 48, "#F5C451"), meter("61–90 d", 31, "#FF7A6B"), meter("90 d+", 18, "#8B7CF6")]),
      dash("Kibana reconstruction", "Detection & investigation", [
        kpis([["Alerts", "1,284", "", "#2F80ED"], ["High severity", "37", "", "#FF7A6B"], ["Sources", "18", "", "#42C7A5"]], true),
        bars([28, 46, 35, 70, 54, 82, 62, 88, 72, 94, 79, 86], "#8B7CF6"),
        h("p", { class: "note", text: "Identity · Endpoint · Network: events over the last 24 hours" })]),
      dash("OpenVAS programme", "Remediation movement", [meter("Remediated", 74, "#42C7A5"), meter("In progress", 47, "#2F80ED"), meter("Accepted risk", 22, "#F5C451")]),
      dash("Human risk programme", "Reporting behaviour", [kpis([["Phish reported", "↑ 31%", "", "#2F80ED"], ["Repeat clicks", "↓ 18%", "", "#42C7A5"], ["Training", "84%", "", "#8B7CF6"]], true)]))
  ]);

  /* ---------- open source (with live GitHub data) ---------- */
  var ossCards = {};
  var ossWrap = h("div", { class: "grid g2 mt" });
  var OSS_ORDER = ["UAE IA Compliance Matrix", "ISO 27001 ISMS Lab", "Executive Risk Pack", "Application Risk Assessment Template", "Risk Treatment Plan Generator", "Vendor Risk Assessment (TPRM) Template", "Cybersecurity RACI Matrices Library", "ISO 27001 & ISO 42001 Toolkit", "GRC Control Crosswalk", "Control Evidence Collector", "Policy-as-Code Starter", "AI Risk Assessment Template (ISO/IEC 42001)", "Threat Modeling Toolkit", "CISO Executive Dashboard", "Security Metrics & KPI Library", "SOC Maturity Assessment Tool", "SOC Detection Rules & Playbooks", "Incident Response Playbooks Pack", "Public Scripts"];
  function ossRank(p) { var k = OSS_ORDER.indexOf(p.name); return k < 0 ? 99 : k; }
  D.ownProjects.slice().sort(function (a, b) { return ossRank(a) - ossRank(b); }).forEach(function (p) {
    var slug = p.href.split("/").pop();
    var meta2 = h("div", { class: "meta" });
    var card = h("article", { class: "oss" },
      h("span", { class: "own", text: "Original · built by me" }), h("h3", { text: p.name }), h("p", { class: "d", text: p.description }),
      meta2,
      h("div", { class: "foot-row" },
        h("div", { class: "tags" }, p.tags.map(function (t) { return h("span", { class: "pill", text: t }); })),
        h("a", { class: "btn btn-primary btn-sm", href: p.href, target: "_blank", rel: "noopener noreferrer" }, "View on GitHub", h("span", { html: icon("ExternalLink") }))));
    ossCards[slug] = meta2; ossWrap.appendChild(card);
  });
  var repoHref = {};
  D.ownProjects.forEach(function (p) { repoHref[p.name] = p.href; });
  /* GRC coverage: every domain points at work that already appears on this page */
  var COVERAGE = [
    ["Risk assessment & treatment", "Business-application risk assessments with owners, treatment options and an executive risk view.", ["18", "04"], ["Application Risk Assessment Template", "Risk Treatment Plan Generator"]],
    ["Compliance & audit", "UAE IA Standard compliance matrix, ISO/IEC 27001 and 42001 control mapping, SOC 2 control evidence and an evidence collector.", ["13"], ["UAE IA Compliance Matrix", "ISO 27001 ISMS Lab", "ISO 27001 & ISO 42001 Toolkit", "GRC Control Crosswalk", "Control Evidence Collector"]],
    ["Third-party risk", "Vendor assessment, renewal governance and control of third-party remote access.", ["16", "08"], ["Vendor Risk Assessment (TPRM) Template"]],
    ["Policy & accountability", "Policy enforced as code, hardened baselines and clear RACI ownership.", ["01"], ["Policy-as-Code Starter", "Cybersecurity RACI Matrices Library"]],
    ["Metrics & executive reporting", "KPIs that leadership can act on, from Secure Score progress to a CISO dashboard.", ["04"], ["Executive Risk Pack", "CISO Executive Dashboard", "Security Metrics & KPI Library"]],
    ["AI governance", "AI risk assessment aligned to ISO/IEC 42001, structured threat modelling and a human-controlled agentic orchestrator.", ["23"], ["AI Risk Assessment Template (ISO/IEC 42001)", "Threat Modeling Toolkit"]],
    ["Resilience & incident governance", "Multi-site continuity design and response playbooks that keep decisions accountable.", ["17", "19"], ["Incident Response Playbooks Pack"]]
  ];
  var grcMap = h("div", { class: "grc-map", role: "list", "aria-label": "GRC coverage" }, COVERAGE.map(function (c) {
    var links = c[2].map(function (n) {
      return h("a", { class: "lk", href: "#project-" + n, text: "Case study " + n, on: { click: function (e) { e.preventDefault(); PF.openProject(n); } } });
    }).concat(c[3].filter(function (r) { return repoHref[r]; }).map(function (r) {
      return h("a", { class: "lk repo", href: repoHref[r], target: "_blank", rel: "noopener noreferrer", text: r + " \u2197" });
    }));
    return h("article", { class: "grc-tile", role: "listitem" }, h("h3", { text: c[0] }), h("p", { text: c[1] }), h("div", { class: "lks" }, links));
  }));
  mount("toolkit", [
    head("toolkit-title", "04 · GRC coverage & open-source toolkit", "Governance, risk and compliance, with working evidence.", "Each GRC domain below points to the case studies and original open-source projects that demonstrate it. The projects are published on GitHub, so you can browse the code, README and licence."),
    grcMap,
    ossWrap,
    h("p", { class: "index-link" }, "All " + D.ownProjects.length + " projects are indexed in one place: ", h("a", { href: D.portfolioIndex, target: "_blank", rel: "noopener noreferrer", text: "github.com/bizidwassim-design/cybersecurity-portfolio" }))
  ]);

  function ago(iso) {
    var d = Math.max(0, (Date.now() - new Date(iso).getTime()) / 864e5);
    if (d < 1) return "today"; if (d < 2) return "yesterday"; if (d < 30) return Math.round(d) + " days ago";
    if (d < 365) return Math.round(d / 30) + " mo ago"; return Math.round(d / 365) + " y ago";
  }
  function liveStats(user, repos) {
    var stars = repos.reduce(function (n, r) { return n + (r.stargazers_count || 0); }, 0);
    $("#live-text").textContent = "Live from GitHub · " + user.public_repos + " public repos · " + stars + " ★ · updated just now";
    $(".live .dot").classList.remove("dot-quiet");
    repos.forEach(function (r) {
      var m = ossCards[r.name]; if (!m) return;
      m.textContent = "";
      if (r.language) m.appendChild(h("span", { text: "● " + r.language }));
      m.appendChild(h("span", { text: "★ " + r.stargazers_count }));
      m.appendChild(h("span", { text: "pushed " + ago(r.pushed_at) }));
    });
    PF.gh = { user: user, repos: repos, stars: stars };
  }
  (function fetchGitHub() {
    var KEY = "pf-gh-v1", TTL = 30 * 60 * 1000, cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { /* ignore */ }
    if (cached && Date.now() - cached.t < TTL) { liveStats(cached.user, cached.repos); return; }
    var base = "https://api.github.com/users/bizidwassim-design";
    Promise.all([fetch(base).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }), fetch(base + "/repos?per_page=100&sort=pushed").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })])
      .then(function (res) { try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), user: res[0], repos: res[1] })); } catch (e) { /* ignore */ } liveStats(res[0], res[1]); })
      .catch(function () { $("#live-text").textContent = D.ownProjects.length + " original open-source projects · live numbers unavailable right now"; });
  })();

  /* ---------- events ---------- */
  mount("events", [
    head("events-title", "07 · Continuous learning", "Always learning, always current.",
      "Conferences, seminars and community events I attend as a participant to stay current on cybersecurity, IT and AI, stay close to the practitioner community and earn the CPE credits that keep my certifications active. Each one brings practical lessons back into my security work.",
      h("a", { href: D.urls.linkedIn, target: "_blank", rel: "noopener noreferrer", class: "btn btn-ghost btn-sm" }, "View the complete LinkedIn activity", h("span", { html: icon("ExternalLink") }))),
    h("div", { class: "grid g3 mt" }, D.events.map(function (e) {
      return h("article", { class: "event", vars: { "--c": toneColor(e.tone) } },
        h("div", { class: "when" }, h("span", { class: "date", text: e.date }), h("span", { html: icon("CalendarDays") })),
        h("h3", { text: e.title }), h("p", { class: "place", text: e.place }), h("p", { class: "d", text: e.note }),
        e.href ? h("a", { class: "src", href: e.href, target: "_blank", rel: "noopener noreferrer" }, "Public field note ↗") : h("p", { class: "src", text: "Verified from event credential" }));
    }))
  ]);

  /* ---------- moments gallery ---------- */
  (function moments() {
    var M = D.souvenirMoments;
    function item(m) {
      var ratio = m.width / m.height;
      var fig = h("figure", { class: "mg-item" + (ratio < 1 ? " portrait" : ""), tabindex: "0" },
        h("img", { src: m.src, alt: m.alt, width: m.width, height: m.height, loading: "lazy" }),
        h("figcaption", { class: "mg-cap" }, h("p", { class: "tg" }, m.tag), h("h3", null, m.title), h("p", { class: "dsc" }, m.description)));
      fig.style.setProperty("flex", ratio.toFixed(3) + " 1 0");
      return fig;
    }
    /* two justified rows: every photo is shown at once, side by side */
    var rows = [[0, 1], [2, 3, 4]].map(function (r) {
      return h("div", { class: "mg-row" }, r.filter(function (k) { return M[k]; }).map(function (k) { return item(M[k]); }));
    });
    mount("moments", [head("moments-title", "08 · Professional moments", "Memorable Moments", "Professional connections, cybersecurity conferences and executive education: memorable encounters and milestones that continue to shape my journey."),
      h("div", { class: "moments", role: "group", "aria-label": "Professional moments" }, rows)]);
  })();

  /* ---------- values ---------- */
  mount("values", [h("div", { class: "values-split" },
    h("div", null, head("values-title", "09 · Motto & values", "Automate. Augment. Stay curious.", "Three principles guide how I approach technology, improvement and responsible innovation."),
      h("blockquote", { class: "quote", text: "“Automate the repeatable. Use AI to accelerate good judgment. Stay curious enough to keep learning, and critical enough to keep testing.”" })),
    h("div", { class: "vlist" }, D.personalValues.map(function (v, k) {
      var c = ["#2F80ED", "#FF7A6B", "#42C7A5"][k % 3];
      return h("article", { class: "vitem", vars: { "--c": c } }, h("span", { class: "ico", html: icon(v.icon) }), h("div", null, h("h3", { text: v.title }), h("p", { text: v.description })));
    })))]);

  /* ---------- credentials ---------- */
  var KIND = { certification: ["ok", "Obtained"], "in-progress": ["pr", "In progress"], experience: ["ex", "Experience"], education: ["ed", "Education"] };
  var strip = h("div", { class: "cert-strip", role: "list", "aria-label": "Certificates and training records" });
  D.certificateProofs.forEach(function (c, k) {
    strip.appendChild(h("button", { type: "button", class: "cert", role: "listitem", "aria-label": "Enlarge " + c.name, on: { click: function () { PF.openLightbox(k); } } },
      h("div", { class: "thumb" }, h("img", { src: c.src, alt: c.name + " certificate", loading: "lazy", width: 240, height: 150 })),
      h("b", { text: c.name }), h("small", { text: c.issuer + " · " + c.year + (c.kind === "training" ? " · training" : "") })));
  });
  mount("credentials", [
    h("div", { class: "cred-split" },
      h("div", null,
        head("credentials-title", "06 · Credentials", "Technical depth, governance perspective.", "Formal security and technology certifications reinforced by business leadership education and continuous field learning. Highlighted cards are certifications I have obtained."),
        h("div", { class: "frame-card" }, h("span", { html: icon("GraduationCap") }), h("b", { text: "Framework fluency" }), h("p", { text: "NIST CSF 2.0 · ISO 27001 · ISO 42001 · SOC 2 · CIS Controls · Zero Trust · Microsoft security architecture · risk treatment and audit evidence" }))),
      h("div", { class: "grid g2" }, D.credentials.map(function (c, k) {
        var kd = KIND[c.kind] || KIND.education, colour = ["#2F80ED", "#FF7A6B", "#42C7A5", "#8B7CF6"][k % 4];
        return h("article", { class: "cred" + (c.kind === "certification" ? " ok" : "") },
          h("span", { class: "ico", vars: { "--c": colour }, html: icon(c.kind === "certification" ? "ShieldCheck" : "GraduationCap") }),
          h("div", null,
            h("h3", null, c.name, h("span", { class: "st " + kd[0], text: kd[1] })),
            h("p", { class: "full", text: c.fullName }), h("p", { class: "iss", text: c.issuer }), h("p", { class: "foc", text: c.focus })));
      }))),
    h("div", { class: "certs" }, h("h3", { text: "Certificates and training records" }), h("p", { class: "note", text: "Tap a certificate to enlarge it." }), strip)
  ]);

  /* ---------- contact ---------- */
  mount("contact", [h("div", { class: "cta-card" },
    h("p", { class: "eyebrow", text: "Let’s compare notes" }),
    h("h2", { id: "contact-title", text: "Security should be measurable, explainable and usable." }),
    h("p", { text: "For conversations about cybersecurity leadership, GRC transformation, identity, SecOps or secure AI adoption." }),
    h("div", { class: "cta" },
      h("a", { class: "btn btn-dark", href: D.urls.calendly, target: "_blank", rel: "noopener noreferrer" }, h("span", { html: icon("CalendarDays") }), "Book a 30-min call"),
      h("a", { class: "btn btn-primary", href: "mailto:" + D.urls.email }, h("span", { html: icon("Mail") }), D.urls.email),
      h("a", { class: "btn btn-ghost", href: D.urls.linkedIn, target: "_blank", rel: "noopener noreferrer" }, "Connect on LinkedIn", h("span", { html: icon("ArrowUpRight") }))))]);

  /* ---------- finishing: icons, reveal, active nav ---------- */
  hydrateIcons(document);
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" }) : null;
  $$(".reveal").forEach(function (n) { io ? io.observe(n) : n.classList.add("in"); });
  var links = {}; $$(".nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && links[e.target.id]) { Object.keys(links).forEach(function (k) { links[k].classList.toggle("active", k === e.target.id); }); } });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }
  PF.ready = true;
})();
