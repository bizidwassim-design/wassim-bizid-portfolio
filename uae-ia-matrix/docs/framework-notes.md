# Framework notes

## The standard

The UAE Information Assurance Standard sets the baseline information security requirements for entities that the
UAE considers critical, and is used well beyond them as the national reference. It was first issued by the
National Electronic Security Authority (NESA), later the Signals Intelligence Agency, and sits today under the
UAE Cybersecurity Council. The controls are organised in two groups:

| Group | Families |
|-------|----------|
| Management (M) | M1 Strategy and planning · M2 Information security risk management · M3 Awareness and training · M4 Human resources security · M5 Compliance · M6 Performance evaluation and improvement |
| Technical (T) | T1 Asset management · T2 Physical and environmental security · T3 Operations management · T4 Communications · T5 Access control · T6 Third-party security · T7 Information systems acquisition, development and maintenance · T8 Information security incident management · T9 Information systems continuity management |

Each control in the standard carries a priority (P1 to P4) that drives the order of implementation. The matrix
keeps the same priority scale so an imported control list keeps its meaning.

## What this repository does and does not contain

* **Contains:** the family structure, a description of each family in this project's words, ISO/IEC 27001:2022
  and NIST CSF 2.0 mappings at family level, evidence hints, and a tool to record status and evidence.
* **Does not contain:** the standard's control statements, sub-family text or implementation guidance. Those
  belong to the issuing authority. Obtain the official document and import your control list with the CSV
  template.

## How the mappings were built

1. Each family was read as a scope statement (what it governs), then matched to the ISO/IEC 27001:2022 Annex A
   controls whose purpose falls inside that scope. Management-system clauses (risk assessment, competence,
   performance evaluation) are cited as `Cl. x.y` where a family is about the management system rather than a
   control.
2. The NIST CSF 2.0 mapping is at **category** level (for example `PR.AA`, `GV.SC`) because a family is broader
   than a single subcategory.
3. A reference is listed once, under the family where it fits best; a few appear under two families when the
   overlap is real (for example `5.35` Independent review under M1 and M6).

The CI check validates the format of every reference (Annex A control numbers 5.1 to 8.34, CSF 2.0 category
codes) but not its meaning. Review the mapping with your own copy of the standards before relying on it.

## What to verify against the official text

* The family names and the M/T split, in case a newer edition changes them.
* The priority of each control you import (P1 to P4).
* Any sector overlay you are subject to: for example a Dubai government entity also follows the Dubai Electronic
  Security Center regulation, financial institutions follow the Central Bank's requirements, and personal data is
  covered by the federal Personal Data Protection Law. These are not mapped here.

## Suggested workflow

1. Start at family level to agree ownership and a first status with the control owners.
2. Import the control list and refine the status per control; keep the evidence column pointing at real artefacts.
3. Export JSON at each review; keep the files as a dated history.
4. Feed the gap list into the
   [risk-treatment-plan-generator](https://github.com/bizidwassim-design/risk-treatment-plan-generator) to build
   the remediation waves, and report the score in the
   [ciso-executive-dashboard](https://github.com/bizidwassim-design/ciso-executive-dashboard).
