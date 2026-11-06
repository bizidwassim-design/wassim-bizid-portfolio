# ISO Compass

Independent interactive guide comparing ISO/IEC 27001:2022, ISO/IEC 42001:2023 and ISO/IEC 27090:2026.

## Live guide

https://bizidwassim-design.github.io/wassim-bizid-portfolio/iso-ai-guide/

## What it does

- Executive overview with three complementary perspectives.
- Searchable business comparison and original evidence ideas.
- Three applied examples (AI customer support, AI credit-decision support, non-AI SaaS).
- Context-based starting-point recommendations.
- Twelve-action starter plan with browser-local checkmarks and JSON/Markdown export.
- Light/dark themes, keyboard navigation, reduced motion and print layout.

## Boundaries

The guide is not an ISO publication, official clause crosswalk, conformity assessment, legal opinion or certification claim. It does not reproduce the licensed standards. Management-system certification under 27001 or 42001 is distinct from the AI cybersecurity guidance in 27090. Examples and checklist items are original implementation suggestions, not quoted normative requirements.

ISO/IEC 27090:2026 is listed as published in October 2026 in the official ISO and IEC catalogues. The older ISO explainer still describes final-draft content; use the published standard for final provisions. Public source descriptions reviewed 6 November 2026. Consult applicable amendments and the licensed standards before making conformity claims.

## Sources

- https://www.iso.org/standard/27001
- https://www.iso.org/standard/42001
- https://www.iso.org/standard/27090
- https://www.iso.org/insights/iso-42001-explained
- https://webstore.iec.ch/en/publication/117332
- https://www.iso.org/insights/ISO-27090-explained (final-draft context only)

## Local development and checks

No dependencies, build step or external runtime assets. Serve this folder with any static web server.

```sh
node --check data.js
node --check app.js
node check.mjs
```

All UI text is written using DOM text nodes. Strict CSP excludes external scripts, inline scripts, inline styles and runtime network connections. Local storage contains checkmark IDs and a theme preference only. No personal or organisational data entry is required. Hosting infrastructure can still record ordinary access logs.

Code may be reused under the portfolio repository's MIT licence. ISO/IEC standard texts and marks remain the property of their owners. No endorsement is claimed.
