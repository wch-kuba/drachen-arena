// Seed content for v1 (plan/v1-05-content.md): about 190 Klasse 2 items across the five exercises.
// Our own word picks of common Klasse 2 vocabulary, aimed at the child's known mistakes
// (umlaut plurals, ü/ö/i). Answers that can be derived (Laute classes, sentence colorings)
// are computed, so they can't drift from the checking rules. Checked by seed.test.ts.
//
// Tags put items first in a fresh pool (leitner.ts › PRIORITY):
//   missed-on-test  wrong on the school test
//   umlaut-plural   the plural changes a, o, u, au to ä, ö, ü, äu

import type { ExerciseType, Item } from '../engine/types.ts'
import { lauteCode, lautOf, umlautChange } from '../engine/words.ts'

const SLUG: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => SLUG[c])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const MISSED = 'missed-on-test'

const make = (type: ExerciseType, id: string, prompt: string, answer: string, extra: Partial<Item> = {}): Item => ({
  id,
  type,
  prompt,
  answer,
  source: 'seed',
  active: true,
  ...extra,
})

// ---------------------------------------------------------------------------------------------
// 1. Selbstlaute, Zwielaute, Umlaute

/** Mode A: one letter or group; the answer is its class. */
const sound = (group: string) => make('laute', `lt-${slug(group)}`, group, lautOf(group)!)

/**
 * Mode B (school-test style): a short sentence to color. Avoid words where two vowels meet
 * without forming a Zwielaut (Museum, geimpft): the coloring would count them as one.
 */
const sentence = (text: string) => make('laute', `lz-${slug(text).split('-').slice(0, 3).join('-')}`, text, lauteCode(text))

const LAUTE: Item[] = [
  ...['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü', 'au', 'ei', 'eu', 'äu', 'ai'].map(sound),
  ...[
    'Die Maus isst Käse.',
    'Im Garten blüht ein Baum.',
    'Der Bär läuft heute weit.',
    'Mein Hund bellt laut.',
    'Die Eule schläft am Tag.',
    'Oma backt einen Kuchen.',
    'Der Kaiser hat eine Krone.',
    'Wir spielen mit dem Ball.',
    'Die Möwe fliegt über das Meer.',
    'Im Ofen brennt ein Feuer.',
    'Der Igel schläft im Laub.',
    'Mein Freund hat ein Boot.',
    'Die Kühe stehen auf der Wiese.',
    'Das Eis ist süß.',
    'Der Fuchs läuft in den Wald.',
    'Am Abend leuchten die Sterne.',
    'Die Bäume sind grün.',
    'Das Brot liegt auf dem Teller.',
    'Der Löwe hat eine Mähne.',
    'Ein Hai schwimmt im Meer.',
  ].map(sentence),
]

// ---------------------------------------------------------------------------------------------
// 2. Einzahl und Mehrzahl. The rule hint ("Aus u wird ü.") comes from the vowel change.

/** Plural traps: the singular already has ä, ö or ü. */
const KEEP = 'Das Wort hat schon ä, ö oder ü. Das bleibt so.'

const plural = (prompt: string, answer: string, extra: Partial<Item> = {}) => {
  const tags = [...(umlautChange(prompt, answer) ? ['umlaut-plural'] : []), ...(extra.tags ?? [])]
  const noun = slug(prompt.split(' ')[1])
  return make('mehrzahl', `mz-${noun}`, prompt, answer, { image: noun, ...extra, tags })
}

const MEHRZAHL: Item[] = [
  // Wrong on the school test (the child wrote Hauten, Lausen, Korben, Wanden).
  plural('der Hut', 'Hüte', { tags: [MISSED] }),
  plural('die Laus', 'Läuse', { tags: [MISSED] }),
  plural('der Korb', 'Körbe', { tags: [MISSED] }),
  plural('die Wand', 'Wände', { tags: [MISSED] }),
  // Umlaut plurals.
  plural('der Ball', 'Bälle'),
  plural('der Baum', 'Bäume'),
  plural('das Haus', 'Häuser'),
  plural('die Maus', 'Mäuse'),
  plural('der Topf', 'Töpfe'),
  plural('der Zahn', 'Zähne'),
  plural('der Stuhl', 'Stühle'),
  plural('der Fuß', 'Füße'),
  plural('die Hand', 'Hände'),
  plural('der Kopf', 'Köpfe'),
  plural('der Fuchs', 'Füchse'),
  plural('der Zug', 'Züge'),
  plural('die Kuh', 'Kühe'),
  plural('die Gans', 'Gänse'),
  plural('die Wurst', 'Würste'),
  plural('das Buch', 'Bücher'),
  plural('das Glas', 'Gläser'),
  plural('das Rad', 'Räder'),
  plural('der Frosch', 'Frösche'),
  plural('der Turm', 'Türme'),
  plural('der Apfel', 'Äpfel'),
  plural('der Vogel', 'Vögel'),
  plural('der Zaun', 'Zäune'),
  plural('die Nuss', 'Nüsse'),
  plural('der Bauch', 'Bäuche'),
  plural('der Wolf', 'Wölfe'),
  plural('der Mann', 'Männer'),
  plural('das Dach', 'Dächer'),
  plural('das Blatt', 'Blätter'),
  // Traps: ä/ö/ü is already there and stays; only the ending is added.
  plural('der Bär', 'Bären', { hint: KEEP }),
  plural('die Tür', 'Türen', { hint: KEEP }),
  // Plurals without a vowel change, so the child learns to check, not to always add dots.
  plural('die Katze', 'Katzen'),
  plural('das Auto', 'Autos'),
  plural('der Hund', 'Hunde'),
  plural('der Fisch', 'Fische'),
  plural('die Blume', 'Blumen'),
  plural('der Tisch', 'Tische'),
  plural('der Schuh', 'Schuhe'),
  plural('das Ei', 'Eier'),
  plural('das Kind', 'Kinder'),
  plural('das Bett', 'Betten'),
  plural('die Hose', 'Hosen'),
  plural('das Pferd', 'Pferde'),
  plural('das Schaf', 'Schafe'),
  plural('die Uhr', 'Uhren'),
]

// ---------------------------------------------------------------------------------------------
// 3. Fehlende Buchstaben: one vowel/umlaut or a group (ie, ei, ai, au, eu, äu). Picture + audio
// tell the word. Avoid gaps that make another word the child knows (B_ch: Bauch/Buch/Bach).

/** ai sounds like ei; the child has to know these words. */
const AI = 'Ein Merkwort: Es klingt wie ei, aber man schreibt es anders.'

const gap = (prompt: string, answer: string, extra: Partial<Item> = {}) => {
  const word = slug(prompt.replace('_', answer))
  return make('luecke', `lu-${word}`, prompt, answer, { image: word, ...extra })
}

const LUECKE: Item[] = [
  // Wrong on the school test.
  gap('M_tze', 'ü', { tags: [MISSED] }),
  gap('B_rne', 'i', { tags: [MISSED] }),
  gap('K_rsche', 'i', { tags: [MISSED] }),
  gap('K_nig', 'ö', { tags: [MISSED] }),
  // ü
  gap('B_rste', 'ü'),
  gap('K_rbis', 'ü'),
  gap('Sch_ssel', 'ü'),
  gap('K_che', 'ü'),
  gap('Br_cke', 'ü'),
  gap('M_cke', 'ü'),
  gap('Fl_gel', 'ü'),
  gap('Gem_se', 'ü'),
  // ö
  gap('L_we', 'ö'),
  gap('V_gel', 'ö', { hint: 'Ein Vogel, viele Vögel: Aus o wird ö.' }),
  gap('M_hre', 'ö'),
  gap('L_ffel', 'ö'),
  gap('Br_tchen', 'ö', { hint: 'Brötchen kommt von Brot: Aus o wird ö.' }),
  gap('M_we', 'ö'),
  // ä
  gap('K_se', 'ä'),
  gap('K_fer', 'ä'),
  gap('Z_hne', 'ä', { hint: 'Ein Zahn, viele Zähne: Aus a wird ä.' }),
  gap('M_dchen', 'ä'),
  // i
  gap('M_lch', 'i'),
  gap('P_lz', 'i'),
  gap('F_sch', 'i'),
  gap('K_nd', 'i'),
  gap('Z_rkus', 'i'),
  // ie, ei, au, eu, äu
  gap('Z_ge', 'ie'),
  gap('Sp_gel', 'ie'),
  gap('Br_f', 'ie'),
  gap('Kl_d', 'ei'),
  gap('G_ge', 'ei'),
  gap('S_fe', 'ei'),
  gap('H_s', 'au'),
  gap('B_m', 'au'),
  gap('Z_n', 'au'),
  gap('Fr_nd', 'eu'),
  gap('F_er', 'eu'),
  gap('T_fel', 'eu'),
  // ai: few words, learned by heart. H_ could also be Heu: the picture and the spoken word decide (decided 2026-11-04).
  gap('K_ser', 'ai', { hint: AI }),
  gap('H_', 'ai', { hint: AI }),
  gap('B_me', 'äu', { hint: 'Ein Baum, viele Bäume: Aus au wird äu.' }),
  gap('M_se', 'äu', { hint: 'Eine Maus, viele Mäuse: Aus au wird äu.' }),
  gap('H_ser', 'äu', { hint: 'Ein Haus, viele Häuser: Aus au wird äu.' }),
]

// ---------------------------------------------------------------------------------------------
// 4. Kurze und lange Selbstlaute: clear pairs first, then single words. The target vowel is
// the first vowel (or ie / doubled vowel), see words.ts › targetVowel.

const DOUBLE = 'Danach kommen zwei gleiche Mitlaute. Dann ist der Selbstlaut kurz.'
const TZ = 'Vor tz ist der Selbstlaut kurz.'
const CK = 'Vor ck ist der Selbstlaut kurz.'
const DEHN_H = 'Ein h nach dem Selbstlaut macht ihn lang.'
const IE = 'ie ist immer lang.'
const DOUBLE_VOWEL = 'Zwei gleiche Selbstlaute sind lang.'

const shortLong = (word: string, answer: 'kurz' | 'lang', hint?: string) =>
  make('kurzlang', `kl-${slug(word)}`, word, answer, hint ? { hint } : {})

const KURZLANG: Item[] = [
  shortLong('Ofen', 'lang'),
  shortLong('offen', 'kurz', DOUBLE),
  shortLong('Hüte', 'lang'),
  shortLong('Hütte', 'kurz', DOUBLE),
  shortLong('Beet', 'lang', DOUBLE_VOWEL),
  shortLong('Bett', 'kurz', DOUBLE),
  shortLong('Schal', 'lang'),
  shortLong('Schall', 'kurz', DOUBLE),
  shortLong('Miete', 'lang', IE),
  shortLong('Mitte', 'kurz', DOUBLE),
  shortLong('Kahn', 'lang', DEHN_H),
  shortLong('kann', 'kurz', DOUBLE),
  shortLong('Stiel', 'lang', IE),
  shortLong('still', 'kurz', DOUBLE),
  shortLong('Schaf', 'lang'),
  shortLong('Ball', 'kurz', DOUBLE),
  shortLong('Hose', 'lang'),
  shortLong('Fisch', 'kurz'),
  shortLong('Mund', 'kurz'),
  shortLong('Biene', 'lang', IE),
  shortLong('Tisch', 'kurz'),
  shortLong('Rose', 'lang'),
  shortLong('Nase', 'lang'),
  shortLong('Sonne', 'kurz', DOUBLE),
  shortLong('Mond', 'lang'),
  shortLong('Katze', 'kurz', TZ),
  shortLong('Brot', 'lang'),
  shortLong('Kamm', 'kurz', DOUBLE),
  shortLong('Zahn', 'lang', DEHN_H),
  shortLong('Hund', 'kurz'),
  shortLong('Jacke', 'kurz', CK),
  shortLong('Decke', 'kurz', CK),
  shortLong('Zoo', 'lang', DOUBLE_VOWEL),
  shortLong('Haar', 'lang', DOUBLE_VOWEL),
  shortLong('Bahn', 'lang', DEHN_H),
  shortLong('Huhn', 'lang', DEHN_H),
]

// ---------------------------------------------------------------------------------------------
// 5. Wörter mit ie: picturable words; the child types the whole word. Short-i words are mixed in,
// so the child has to choose: long i → ie, short i → i (decided 2026-11-04). Both share the
// exercise's rule hint (strings.ts › DEFAULT_HINT.ie), which names both and gives neither away.

/** Words without a clear picture are listened to instead (Typed.tsx › listenFirst). */
const NO_PICTURE = new Set(['vier'])
const ieItem = (word: string, extra: Partial<Item> = {}) =>
  make('ie', `ie-${slug(word)}`, word, word, { ...(NO_PICTURE.has(word) ? {} : { image: slug(word) }), ...extra })
const ie = (word: string) => ieItem(word)
const shortI = (word: string) => ieItem(word, { tags: ['short-i'] })

const IE_WORDS: Item[] = [
  ...[
    'Biene',
    'Brief',
    'Ziege',
    'Spiegel',
    'Tier',
    'Fliege',
    'Wiese',
    'Riese',
    'Knie',
    'Sieb',
    'Stiefel',
    'Papier',
    'Klavier',
    'Zwiebel',
    'Stier',
    'Gießkanne',
    'Riesenrad',
    'Radiergummi',
    'Fliegenpilz',
    'vier',
  ].map(ie),
  ...['Fisch', 'Kissen', 'Brille', 'Pinsel', 'Ritter', 'Schiff', 'Finger', 'Kind', 'Zimmer', 'Insel'].map(shortI),
]

export const SEED: Item[] = [...LAUTE, ...MEHRZAHL, ...LUECKE, ...KURZLANG, ...IE_WORDS]
