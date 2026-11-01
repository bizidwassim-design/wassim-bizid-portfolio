/* Fictional sample: "Falcon Bay Logistics FZ-LLC", a made-up Dubai free-zone company. MIT License.
 * Family-level statuses only. Every value is invented for the demo. */
(function (root) {
  "use strict";
  var SAMPLE = {
    organisation: "Falcon Bay Logistics FZ-LLC",
    assessment_date: "2026-10-20",
    assessor: "Information security manager",
    items: {
      M1: { status: "done", priority: "P1", owner: "CISO", due: "", evidence: "Policy set v3 approved by the board on 2026-03-12; security steering committee meets quarterly." },
      M2: { status: "part", priority: "P1", owner: "CISO", due: "2026-12-31", evidence: "Risk register exists (42 risks); treatment plan approved; annual re-assessment not yet scheduled." },
      M3: { status: "part", priority: "P2", owner: "HR & security", due: "2027-01-31", evidence: "Awareness e-learning at 78% completion; role-based training for administrators not started." },
      M4: { status: "done", priority: "P2", owner: "HR", due: "", evidence: "Screening and confidentiality terms in every contract; leaver checklist in the ITSM." },
      M5: { status: "plan", priority: "P1", owner: "Legal", due: "2027-02-28", evidence: "Obligations register drafted (UAE PDPL, free-zone regulations, customer contracts); records retention schedule pending." },
      M6: { status: "none", priority: "P2", owner: "CISO", due: "2027-03-31", evidence: "No internal audit yet; metrics reported ad hoc." },
      T1: { status: "part", priority: "P1", owner: "IT operations", due: "2026-12-15", evidence: "CMDB covers servers and laptops (94%); OT and IoT assets not inventoried; classification scheme approved." },
      T2: { status: "done", priority: "P3", owner: "Facilities", due: "", evidence: "Badge access with logs on server rooms; UPS and fire suppression maintained under contract." },
      T3: { status: "part", priority: "P1", owner: "IT operations", due: "2027-01-15", evidence: "Patch SLA met for 91% of endpoints; backup restore tested in September; central logging covers identity and endpoints, not yet OT." },
      T4: { status: "part", priority: "P1", owner: "Network team", due: "2027-02-15", evidence: "Segmentation between office, warehouse and OT in place; firewall rule review overdue; TLS 1.2+ enforced." },
      T5: { status: "done", priority: "P1", owner: "Identity team", due: "", evidence: "MFA on 100% of accounts; privileged access through PIM; quarterly access review with sign-off." },
      T6: { status: "plan", priority: "P2", owner: "Procurement & security", due: "2027-03-31", evidence: "Supplier inventory with 68 suppliers tiered; security clauses in new contracts only; assessments not started." },
      T7: { status: "none", priority: "P3", owner: "Applications", due: "2027-06-30", evidence: "No secure development standard; outsourced development without security acceptance criteria." },
      T8: { status: "ver", priority: "P1", owner: "SOC lead", due: "", evidence: "IR plan tested in a tabletop exercise in August; incident register maintained; regulator notification path documented." },
      T9: { status: "part", priority: "P1", owner: "IT operations", due: "2027-01-31", evidence: "BIA completed; ICT continuity plan drafted with RTO 4 h; failover test planned for December." }
    }
  };
  if (typeof module === "object" && module.exports) module.exports = SAMPLE;
  else root.UAE_IA_SAMPLE = SAMPLE;
})(typeof window !== "undefined" ? window : this);
