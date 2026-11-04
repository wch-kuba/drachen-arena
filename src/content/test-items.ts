// Test items for the engine and the five exercise screens (Parts 3–4). Part 5 replaces these
// with the reviewed seed. Words are our own picks of common Klasse 2 vocabulary.

import type { ExerciseType, Item } from '../engine/types.ts'
import { lauteCode, lautOf } from '../engine/words.ts'

const make = (type: ExerciseType, id: string, prompt: string, answer: string, extra: Partial<Item> = {}): Item => ({
  id: `test-${id}`,
  type,
  prompt,
  answer,
  source: 'seed',
  active: true,
  ...extra,
})

// Einzahl und Mehrzahl: umlaut plurals first, the child's main gap. The rule hint
// ("Aus u wird ü.") comes from the vowel change, so items need no own hint.
const plural = (id: string, prompt: string, answer: string, image?: string) =>
  make('mehrzahl', `mz-${id}`, prompt, answer, { image, tags: /[äöü]/i.test(answer) ? ['umlaut-plural'] : [] })

// Laute, one sound: the answer is its class.
const sound = (group: string) => make('laute', `lt-${group}`, group, lautOf(group)!)
// Laute, sentence (school-test style): the answer is the right coloring.
const sentence = (id: string, text: string) => make('laute', `lz-${id}`, text, lauteCode(text))

const gap = (id: string, prompt: string, answer: string) => make('luecke', `lu-${id}`, prompt, answer)
const shortLong = (word: string, answer: 'kurz' | 'lang') => make('kurzlang', `kl-${word.toLowerCase()}`, word, answer)
const ie = (word: string) => make('ie', `ie-${word.toLowerCase()}`, word, word)

export const TEST_ITEMS: Item[] = [
  plural('hut', 'der Hut', 'Hüte', 'hat'),
  plural('laus', 'die Laus', 'Läuse'),
  plural('korb', 'der Korb', 'Körbe'),
  plural('wand', 'die Wand', 'Wände'),
  plural('maus', 'die Maus', 'Mäuse'),
  plural('baum', 'der Baum', 'Bäume'),
  plural('ball', 'der Ball', 'Bälle'),
  plural('stuhl', 'der Stuhl', 'Stühle'),
  plural('topf', 'der Topf', 'Töpfe'),
  plural('fuchs', 'der Fuchs', 'Füchse'),
  plural('hund', 'der Hund', 'Hunde'),
  plural('fisch', 'der Fisch', 'Fische'),

  sound('a'),
  sound('ei'),
  sound('ü'),
  sound('au'),
  sound('o'),
  sound('äu'),
  sound('ö'),
  sound('eu'),
  sentence('maus', 'Die Maus isst Käse.'),
  sentence('baum', 'Im Garten blüht ein Baum.'),
  sentence('baer', 'Der Bär läuft heute weit.'),

  gap('muetze', 'M_tze', 'ü'),
  gap('birne', 'B_rne', 'i'),
  gap('koenig', 'K_nig', 'ö'),
  gap('kirsche', 'K_rsche', 'i'),
  gap('ziege', 'Z_ge', 'ie'),
  gap('haus', 'H_s', 'au'),
  gap('leute', 'L_te', 'eu'),
  gap('baeume', 'B_me', 'äu'),

  shortLong('Schaf', 'lang'),
  shortLong('Ball', 'kurz'),
  shortLong('Hose', 'lang'),
  shortLong('Fisch', 'kurz'),
  shortLong('Mund', 'kurz'),
  shortLong('Biene', 'lang'),
  shortLong('Tisch', 'kurz'),
  shortLong('Rose', 'lang'),

  ie('Biene'),
  ie('Brief'),
  ie('Ziege'),
  ie('Spiegel'),
  ie('Tier'),
  ie('Wiese'),
]
