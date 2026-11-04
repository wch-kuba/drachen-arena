# Part 11 – Excel / CSV import

**Goal:** import a list of words from Excel or CSV, offline, with a clear preview.

← [Back to plan](../PLAN.md)

## Tasks
- [ ] Template file `vorlage.xlsx`, downloadable from the parent panel, with one sheet per exercise or a `Übung` column:

  | Übung | Wort | Lösung | Hinweis | Bild |
  |---|---|---|---|---|
  | mehrzahl | der Hut | Hüte | Aus u wird ü | 🎩 |
  | luecke | Mütze | ü | | 🧢 |
  | kurzlang | Ofen | lang:o | | |
  | ie | Biene | Biene | | 🐝 |

- [ ] Bundle SheetJS (lazy-loaded, but in the precache) so import works offline.
- [ ] File picker (`.xlsx`, `.csv`); works with Files app / iCloud Drive on the iPhone.
- [ ] Parse → validate → preview table: new / changed / duplicate / error (with reason).
- [ ] Import only the valid rows; show the errors so the parent can fix them.
- [ ] Imported items get `source: 'parent'` and an optional tag (e.g. the import date).
- [ ] Also accept CSV with `;` separator (German Excel default).

## Done when
The parent fills in the template on a phone or laptop, imports it on the iPhone, and the words appear in the game.
