// Dummy items for the Part 3 engine test round. Part 5 replaces these with the reviewed seed.
// Focus on umlaut plurals, the child's main gap.

import type { Item } from '../engine/types.ts'

const plural = (id: string, prompt: string, answer: string, hint?: string, image?: string): Item => ({
  id: `test-mz-${id}`,
  type: 'mehrzahl',
  prompt,
  answer,
  image,
  hint,
  tags: answer.match(/[äöü]/i) ? ['umlaut-plural'] : [],
  source: 'seed',
  active: true,
})

export const TEST_ITEMS: Item[] = [
  plural('hut', 'der Hut', 'Hüte', 'Aus u wird oft ü.', 'hat'),
  plural('laus', 'die Laus', 'Läuse', 'Aus au wird oft äu.'),
  plural('korb', 'der Korb', 'Körbe', 'Aus o wird oft ö.'),
  plural('wand', 'die Wand', 'Wände', 'Aus a wird oft ä.'),
  plural('maus', 'die Maus', 'Mäuse', 'Aus au wird oft äu.'),
  plural('baum', 'der Baum', 'Bäume', 'Aus au wird oft äu.'),
  plural('ball', 'der Ball', 'Bälle', 'Aus a wird oft ä.'),
  plural('stuhl', 'der Stuhl', 'Stühle', 'Aus u wird oft ü.'),
  plural('topf', 'der Topf', 'Töpfe', 'Aus o wird oft ö.'),
  plural('fuchs', 'der Fuchs', 'Füchse', 'Aus u wird oft ü.'),
  plural('hund', 'der Hund', 'Hunde'),
  plural('fisch', 'der Fisch', 'Fische'),
]
