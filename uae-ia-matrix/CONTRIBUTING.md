# Contributing

Thanks for helping improve this matrix. Welcome contributions: corrections to the ISO 27001 and NIST CSF
mappings, clearer family descriptions and evidence hints, Arabic and French labels, accessibility fixes, and
documentation.

## Ground rules

* **Fictional data only.** The sample uses a made-up company (Falcon Bay Logistics FZ-LLC). Never commit a real
  assessment, real people, hostnames or internal details.
* **Original content.** Reference the UAE IA Standard, ISO/IEC 27001 and NIST CSF by name and identifier; never
  paste their text. The standard's control statements stay out of this repository.
* **No build step, no dependencies, no network.** The app must keep working when opened as a local file with the
  Content-Security-Policy in `index.html` unchanged: no external scripts, styles, fonts or fetches.
* Be kind: see the [Code of Conduct](CODE_OF_CONDUCT.md).

## Where things live

| Path | Change it when |
|------|----------------|
| `data/controls.js` | You correct a mapping, a description or an evidence hint. Single source of truth. |
| `data/sample.js` | You change the fictional sample statuses. |
| `data/controls.csv`, `examples/falcon-bay-sample.json` | Never by hand: run `node scripts/build_data.js`. |
| `assets/app.js`, `assets/style.css`, `index.html` | Behaviour, styling, markup. |
| `docs/` | Framework notes. Keep them consistent with the catalogue. |

## Making a change

1. Fork and branch (`fix/t4-mapping`, `feat/arabic-labels`).
2. Edit the source files.
3. Run the checks that CI runs:

   ```bash
   node scripts/check_controls.js
   node scripts/build_data.js
   npx --yes html-validate@8 index.html
   ```

4. Open a pull request that says what changed and why; for a mapping change, cite the control purpose you relied on.
