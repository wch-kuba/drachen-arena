# Part 5 – Seed content

**Goal:** ~150–200 real Klasse 2 items, focused on the kid's known mistakes, checked by the parent.

← [Back to plan](../PLAN.md)

## Tasks
- [x] First draft by Claude Opus 5.5, using the lists below as the brief, checked by hand (2026-11-04). Written straight into the code in the coding session instead of a separate API script (no Anthropic key needed); Part 14 builds its own AI calls.
- [x] Write the seed: `src/content/seed.ts` (TypeScript, not JSON, so Laute answers come from `lautOf`/`lauteCode` and can't drift). 192 items. Checked by `seed.test.ts`. The app and `npm run audio` use it; `test-items.ts` stays for the engine tests.
- [x] **Laute:** all Selbstlaute (a e i o u), Umlaute (ä ö ü), Zwielaute (au ei eu äu ai), plus ~20 short sentences for mode B (include the 3 test sentences' style, not the same sentences).
- [x] **Mehrzahl:** ~40 nouns, at least half **umlaut plurals**: Hut→Hüte, Laus→Läuse, Korb→Körbe, Wand→Wände, Ball→Bälle, Baum→Bäume, Haus→Häuser, Maus→Mäuse, Topf→Töpfe, Zahn→Zähne, Stuhl→Stühle, Fuß→Füße, Hand→Hände, Kopf→Köpfe… plus regular ones (Katze→Katzen, Auto→Autos, Hund→Hunde).
- [x] **Lücke:** ~40 words; start with the missed ones: Mütze, Birne, Kirsche, König, then Milch, Bürste, Löwe, Pilz, Tür, Vögel, Schüssel, Möhre… Group gaps ie, ei, ai, au, eu, äu (ai added 2026-11-04: Kaiser, Hai, with a Merkwort hint).
- [x] **Kurz/lang:** ~30 words in clear pairs (Ofen/offen, Hüte/Hütte, Beet/Bett, Schal/Schall, Miete/Mitte, Kahn/kann, Stiel/still).
- [x] **ie:** ~30 picturable words, of them 10 short-i contrast words (Fisch, Kissen, Brille…, tag `short-i`) so the child chooses ie or i (decided 2026-11-04). Land label "i oder ie?"; one rule hint for both: "Langes i schreibt man ie. Kurzes i schreibt man i." Hard-to-draw ie words (Dieb, Lied, Kiefer, Ziel) dropped for now: Biene, Brief, Ziege, Spiegel, Tier, Fliege, Wiese, Riese, Knie, Dieb, Lied, Sieb, Stiefel, Kiefer…
- [x] A rule `hint` for every item where it helps (Kurz/lang: double consonant, tz, h, ie, doubled vowel; Lücke: umlaut from the base word). Mehrzahl gets its hint from the vowel change.
- [x] Tag items (`umlaut-plural`, `missed-on-test`) so they come first: `pickRound` puts tagged new items ahead of other new items (`leitner.ts › PRIORITY`).
- [x] Export as a readable table: `npm run seed:table` → `seed-review.md` (not committed).
- [x] Independent review by a fresh agent (2026-11-04): no German errors. Applied: Lücke gaps that made another known word swapped (B_ch, M_s, T_r, Schw_n, B_r, Kr_z → Käfer, Kürbis, Geige, Zähne, Teufel, Zaun); Kurz/lang + ck, doubled vowel, Dehnungs-h (Jacke, Decke, Zoo, Haar, Bahn, Huhn); Mehrzahl + Männer, Dächer, Blätter and traps Bären, Türen (`umlaut-plural` now comes from the real vowel change); Igel sentence fixed. Skipped: "several consonants → kurz" hint (Mond, Obst break it), cutting classroom words like Radiergummi.
- [x] ~~Parent reviews `seed-review.md`~~ The parent doesn't read German (decided 2026-11-04): the independent review above counts as the language check.
- [ ] Parent sends photos of the current school worksheets / Wörterliste; compare topics and words with the seed and apply the fixes.
- [ ] Voice clips for the seed with ElevenLabs (decided 2026-11-04, PRODUCT.md › Audio): Knurps narrates in 3 tones, every word in Kermy/Hopsi/Emmy/Knurps, random clip per play. Made 2026-11-04: 1,032 clips for 268 texts (4,648 credits). Word voices and the Knurps narration heard and approved on the iPad (parent, 2026-11-04). `npm run audio` makes only missing clips, so rerun it after the worksheet fixes. Parent listens through every voice before Part 5 is ticked.

## Done when
The seed has passed the independent language review, and it has been compared with photos of the current school worksheets and the gaps fixed.
