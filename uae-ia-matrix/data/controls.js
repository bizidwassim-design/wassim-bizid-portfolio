/* UAE IA Compliance Matrix — control catalogue. MIT License.
 *
 * The 15 control families of the UAE Information Assurance (IA) Standard, grouped as the standard does:
 * six management families (M1–M6) and nine technical families (T1–T9). Family names are the standard's;
 * the descriptions, the ISO/IEC 27001:2022 and NIST CSF 2.0 mappings and the evidence hints are this
 * project's own wording. The individual controls of the standard are not reproduced here: import your
 * own control list from the official document with the CSV template in templates/.
 */
(function (root) {
  "use strict";

  var FAMILIES = [
    { id: "M1", group: "management", name: "Strategy and planning",
      desc: "Information security governance: policy set, roles and accountability, management commitment, planning and resourcing of the security programme.",
      iso: ["5.1", "5.2", "5.4", "5.35", "5.36", "Cl. 5", "Cl. 6.2"],
      csf: ["GV.OC", "GV.PO", "GV.RR"],
      evidence: "Approved security policy, security organisation chart, programme plan and budget, management review minutes." },
    { id: "M2", group: "management", name: "Information security risk management",
      desc: "Risk assessment method, risk register, treatment decisions, risk acceptance and periodic re-assessment.",
      iso: ["Cl. 6.1.2", "Cl. 6.1.3", "Cl. 8.2", "Cl. 8.3", "5.7"],
      csf: ["GV.RM", "ID.RA"],
      evidence: "Risk methodology, current risk register, treatment plan, risk acceptance records." },
    { id: "M3", group: "management", name: "Awareness and training",
      desc: "Security awareness for everyone, role-based training for staff with security duties, and measurement of both.",
      iso: ["6.3", "Cl. 7.2", "Cl. 7.3"],
      csf: ["PR.AT"],
      evidence: "Awareness plan, completion rates, phishing simulation results, training records for privileged roles." },
    { id: "M4", group: "management", name: "Human resources security",
      desc: "Screening, terms of employment, duties during employment, disciplinary process and responsibilities when people leave or change role.",
      iso: ["6.1", "6.2", "6.4", "6.5", "6.6"],
      csf: ["GV.RR", "PR.AA"],
      evidence: "Screening procedure, signed terms and confidentiality agreements, joiner/mover/leaver checklist." },
    { id: "M5", group: "management", name: "Compliance",
      desc: "Identification of legal, regulatory and contractual obligations, protection of records and personal data, and verification that policies are followed.",
      iso: ["5.31", "5.32", "5.33", "5.34", "5.36"],
      csf: ["GV.OC", "GV.PO"],
      evidence: "Register of obligations, records retention schedule, privacy notices, internal compliance checks." },
    { id: "M6", group: "management", name: "Performance evaluation and improvement",
      desc: "Monitoring and measurement of the programme, internal audit, management review and corrective action.",
      iso: ["Cl. 9.1", "Cl. 9.2", "Cl. 9.3", "Cl. 10.1", "5.35"],
      csf: ["ID.IM", "GV.OV"],
      evidence: "Security metrics, internal audit programme and reports, corrective action log, management review outputs." },

    { id: "T1", group: "technical", name: "Asset management",
      desc: "Inventory and ownership of information and assets, acceptable use, classification and labelling, handling and return of assets.",
      iso: ["5.9", "5.10", "5.11", "5.12", "5.13", "7.10", "7.14"],
      csf: ["ID.AM"],
      evidence: "Asset inventory with owners, classification scheme, acceptable use policy, media disposal records." },
    { id: "T2", group: "technical", name: "Physical and environmental security",
      desc: "Secure areas, physical entry control, protection against environmental threats, equipment siting, maintenance and secure disposal.",
      iso: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.11", "7.12", "7.13"],
      csf: ["PR.AA", "PR.IR"],
      evidence: "Access logs for secure areas, visitor records, environmental monitoring, maintenance and disposal records." },
    { id: "T3", group: "technical", name: "Operations management",
      desc: "Documented operating procedures, change management, capacity, malware protection, vulnerability and patch management, configuration, backup, logging and monitoring.",
      iso: ["5.37", "8.6", "8.7", "8.8", "8.9", "8.13", "8.15", "8.16", "8.19", "8.32"],
      csf: ["PR.PS", "DE.CM"],
      evidence: "Operating procedures, change records, patch compliance report, backup test results, log retention settings." },
    { id: "T4", group: "technical", name: "Communications",
      desc: "Network security and segregation, security of network services, information transfer, cryptography and data leakage prevention.",
      iso: ["8.20", "8.21", "8.22", "8.24", "5.14", "8.12"],
      csf: ["PR.DS", "PR.IR"],
      evidence: "Network diagram with zones, firewall rule review, encryption standard, transfer agreements, DLP policy." },
    { id: "T5", group: "technical", name: "Access control",
      desc: "Access control policy, identity lifecycle, authentication, privileged access, access rights review and secure authentication.",
      iso: ["5.15", "5.16", "5.17", "5.18", "8.2", "8.3", "8.5"],
      csf: ["PR.AA"],
      evidence: "Access control policy, joiner/mover/leaver evidence, MFA coverage, privileged account inventory, access review sign-offs." },
    { id: "T6", group: "technical", name: "Third-party security",
      desc: "Security in supplier relationships: requirements in agreements, supply chain, monitoring and review of supplier services, cloud services.",
      iso: ["5.19", "5.20", "5.21", "5.22", "5.23"],
      csf: ["GV.SC"],
      evidence: "Supplier inventory with tiering, security clauses in contracts, supplier assessments, service review records." },
    { id: "T7", group: "technical", name: "Information systems acquisition, development and maintenance",
      desc: "Security requirements for new systems, secure development lifecycle, test data, outsourced development, change and acceptance testing.",
      iso: ["5.8", "8.4", "8.25", "8.26", "8.27", "8.28", "8.29", "8.30", "8.31"],
      csf: ["PR.PS", "ID.RA"],
      evidence: "Security requirements checklist, secure coding standard, code review and test results, environment separation." },
    { id: "T8", group: "technical", name: "Information security incident management",
      desc: "Incident response planning, reporting of events and weaknesses, assessment and decision, response, lessons learned and evidence collection.",
      iso: ["5.24", "5.25", "5.26", "5.27", "5.28", "6.8"],
      csf: ["DE.AE", "RS.MA", "RS.AN", "RS.CO", "RS.MI"],
      evidence: "Incident response plan, incident register, post-incident reviews, regulator notification records." },
    { id: "T9", group: "technical", name: "Information systems continuity management",
      desc: "Continuity planning for ICT, redundancy, recovery objectives, testing and maintenance of continuity arrangements.",
      iso: ["5.29", "5.30", "8.14"],
      csf: ["RC.RP", "RC.CO", "PR.IR"],
      evidence: "Business impact analysis, ICT continuity plan with RTO/RPO, test reports, redundancy design." }
  ];

  var STATUSES = [
    { id: "na",   label: "Not applicable", score: null },
    { id: "none", label: "Not started",    score: 0 },
    { id: "plan", label: "Planned",        score: 1 },
    { id: "part", label: "Partially implemented", score: 2 },
    { id: "done", label: "Implemented",    score: 3 },
    { id: "ver",  label: "Implemented and verified", score: 4 }
  ];

  var PRIORITIES = ["P1", "P2", "P3", "P4"];

  var CATALOGUE = {
    framework: "UAE Information Assurance Standard",
    version: "families-1.0",
    families: FAMILIES,
    statuses: STATUSES,
    priorities: PRIORITIES
  };

  if (typeof module === "object" && module.exports) module.exports = CATALOGUE;
  else root.UAE_IA = CATALOGUE;
})(typeof window !== "undefined" ? window : this);
