"use strict";
window.ISO_GUIDE = {
  reviewed: "2026-11-06",
  standards: [
    { id: "27001", tone: "blue", year: "2022", label: "Information security", type: "ISMS · Requirements", title: "Protect the information.", summary: "A risk-based management system for the confidentiality, integrity and availability of information, across people, processes and technology.", question: "How do we manage information security risk?", assurance: "Management-system certification available", source: "https://www.iso.org/standard/27001" },
    { id: "42001", tone: "purple", year: "2023", label: "AI governance", type: "AIMS · Requirements", title: "Govern AI responsibly.", summary: "An AI management system for organisations developing, providing or using AI, addressing accountability, risk, oversight and continual improvement.", question: "How do we oversee our use of AI?", assurance: "Management-system certification available", source: "https://www.iso.org/standard/42001" },
    { id: "27090", tone: "teal", year: "2026", label: "AI cybersecurity", type: "AI security · Guidance", title: "Defend the AI system.", summary: "Guidance on AI-specific security threats, their consequences, detection and mitigation across the life cycle. Complements established cybersecurity practices.", question: "How could our AI be attacked?", assurance: "Guidance, not an ISMS/AIMS certification", source: "https://www.iso.org/standard/27090" }
  ],
  comparison: {
    business: [
      ["Primary lens", "Information security risk in the defined ISMS scope.", "Responsible AI development, provision and use in the AIMS scope.", "Security threats and compromises specific to AI systems."],
      ["Document type", "Management-system requirements.", "Management-system requirements.", "AI cybersecurity guidance."],
      ["Assurance route", "Optional certification of the scoped ISMS by an independent certification body.", "Optional certification of the scoped AIMS by an independent certification body.", "Use as supporting security guidance; not the same management-system certification route."],
      ["If no AI is involved", "Still relevant to information security needs.", "No AI use in scope? First establish whether an AIMS is relevant.", "AI-specific guidance is not the immediate priority for a non-AI scope."],
      ["When AI is involved", "Extend information security risk treatment to AI-related assets and dependencies.", "Create accountable oversight of AI risks, impacts and the life cycle.", "Investigate attacks against AI data, models, inputs, outputs and workflows."],
      ["Typical business owner · illustrative", "CISO / information security leadership.", "AI governance lead with business, risk and technical owners.", "AI security / security engineering with AI and data teams."],
      ["What it does not prove", "No guarantee of incident-free operation or product security.", "No blanket proof that every AI output is safe, fair or legally compliant.", "No guarantee that threats are eliminated, and no replacement for governance."],
      ["How the three connect · interpretation", "Provide shared security governance, risk treatment and evidence processes.", "Add AI-specific accountability, impacts and oversight to the programme.", "Inform the technical work needed to address AI-specific attack paths."]
    ],
    evidence: [
      ["Scope & inventory", "ISMS boundary and information asset inventory.", "AI use-case register with business owner and intended use.", "AI system and data-flow inventory, including model and dataset origins."],
      ["Risk decisions", "Security risk register, treatment decisions and accepted residual risks.", "Documented AI risk and impact assessments with accountable approval.", "System-specific threat model and mitigation decisions, including limits."],
      ["Supplier review", "Supplier security review and contractual security expectations.", "AI provider accountability, use limitations and change responsibilities.", "Model and dataset provenance checks, update integrity and dependency risks."],
      ["Release decisions", "Access, change and recovery evidence relevant to the service.", "Approval criteria, human oversight and information for users.", "AI attack testing, input/output safeguards and documented residual exposure."],
      ["Operations & incidents", "Monitoring, incident records and corrective actions.", "AI performance/impact review and escalation ownership.", "AI-specific security signals, model integrity checks and tested response paths."],
      ["Audit & improvement", "Internal audit, management review and effectiveness evidence.", "AIMS review, issue tracking and improvements to AI oversight.", "Retest findings and update mitigations as models, data and threats change."]
    ]
  },
  examples: {
    support: [
      ["27001", "Protect the service", "Review access to customer records, platform security, supplier connections and recovery responsibilities."],
      ["42001", "Make ownership explicit", "Document intended use, human escalation, user information and accountability for harmful or incorrect responses."],
      ["27090", "Test the AI boundary", "Explore prompt injection, sensitive outputs and tampered knowledge sources. Record testing limits and residual exposure."]
    ],
    credit: [
      ["27001", "Protect financial information", "Review identity, confidential applicant data, integrity of records and availability of the decision-support service."],
      ["42001", "Govern consequential use", "Assign decision accountability and oversight; assess impacts, intended use and how staff can challenge outputs. Separate legal assessment is needed."],
      ["27090", "Challenge the model", "Investigate manipulated inputs, poisoned training data and model extraction. Define detection, response and retesting responsibilities."]
    ],
    saas: [
      ["27001", "Start with information risk", "Identify the service scope, assets, security owners and priority risk-treatment decisions."],
      ["42001", "Check the scope first", "An AIMS is not an automatic next step for a non-AI service. Confirm whether hidden supplier AI features affect the scope."],
      ["27090", "Keep it proportionate", "AI-specific attack guidance is not a substitute for conventional security controls. Revisit if AI enters the service."]
    ]
  },
  phases: [
    { name: "Understand", subtitle: "Get the boundary right", items: [
      { id: "scope", title: "Define the programme scope", detail: "Name the services, information and AI use cases being considered. Record exclusions and dependencies.", lenses: ["27001", "42001"] },
      { id: "inventory", title: "Map the AI footprint", detail: "Identify internally developed and supplier-provided AI, intended uses, data and models. If none exist, document that conclusion.", lenses: ["42001", "27090"] },
      { id: "owners", title: "Assign accountable owners", detail: "Agree who accepts risk, approves deployment, operates controls and leads incident response.", lenses: ["27001", "42001", "27090"] }
    ] },
    { name: "Assess", subtitle: "Make risk decisions visible", items: [
      { id: "security", title: "Assess information security risks", detail: "Use consistent likelihood, impact and risk-acceptance criteria for the scoped service.", lenses: ["27001"] },
      { id: "impact", title: "Assess AI risks and impacts", detail: "Consider intended use, affected people, oversight and reasonably foreseeable misuse. Bring in legal expertise where needed.", lenses: ["42001"] },
      { id: "threats", title: "Model AI attack paths", detail: "Where AI is in scope, examine data poisoning, evasion, model theft and relevant input/output threats.", lenses: ["27090"] }
    ] },
    { name: "Implement", subtitle: "Connect controls to evidence", items: [
      { id: "treatment", title: "Agree treatment and residual risk", detail: "Prioritise actions, owners, dates and approvals. Shared evidence can support several objectives without proving equivalence.", lenses: ["27001", "42001", "27090"] },
      { id: "oversight", title: "Define AI operating guardrails", detail: "Set human escalation, permitted use, supplier responsibilities and change approvals appropriate to each use case.", lenses: ["42001"] },
      { id: "testing", title: "Test relevant AI safeguards", detail: "Document test methods, environments, findings and limits. No single test establishes that a model is secure.", lenses: ["27090"] }
    ] },
    { name: "Improve", subtitle: "Keep the programme alive", items: [
      { id: "response", title: "Exercise incident response", detail: "Include conventional incidents and AI-specific compromise where relevant, with owners and communications decisions.", lenses: ["27001", "42001", "27090"] },
      { id: "review", title: "Review evidence and performance", detail: "Review the relevant management systems, unresolved issues and whether controls remain effective.", lenses: ["27001", "42001"] },
      { id: "retest", title: "Reassess after change", detail: "Review changes in AI use, data, models, suppliers and threats. Retest safeguards and revisit accepted risks.", lenses: ["27001", "42001", "27090"] }
    ] }
  ],
  sources: [
    { title: "ISO/IEC 27001:2022", tag: "Official catalogue", text: "ISMS requirements and the distinction between implementation and optional certification.", url: "https://www.iso.org/standard/27001" },
    { title: "ISO/IEC 42001:2023", tag: "Official catalogue", text: "AI management-system requirements for organisations that develop, provide or use AI.", url: "https://www.iso.org/standard/42001" },
    { title: "ISO/IEC 27090:2026", tag: "Official catalogue · published Oct 2026", text: "AI-specific cybersecurity guidance; the source of truth for the published edition and status.", url: "https://www.iso.org/standard/27090" },
    { title: "ISO/IEC 42001 explained", tag: "ISO explainer", text: "Management-system scope and voluntary certification, performed by independent certification bodies—not ISO.", url: "https://www.iso.org/insights/iso-42001-explained" },
    { title: "ISO/IEC 27090 · IEC catalogue", tag: "Official co-publisher", text: "Independent catalogue confirmation: first edition published on 14 October 2026.", url: "https://webstore.iec.ch/en/publication/117332" },
    { title: "ISO/IEC 27090 explained", tag: "ISO explainer · final-draft context", text: "Background on AI threats. This older article still references a final draft; do not use it for current publication status or final clause content.", url: "https://www.iso.org/insights/ISO-27090-explained" }
  ]
};
