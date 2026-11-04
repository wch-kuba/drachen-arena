// Write the seed content as a readable table for the parent's review (plan/v1-05-content.md).
//
//   npm run seed:table   → seed-review.md (not committed; regenerate after every change)

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { SEED } from '../src/content/seed.ts'
import { ruleOf } from '../src/content/speech.ts'
import type { ExerciseType, Item } from '../src/engine/types.ts'
import { isSentence, wordOf } from '../src/engine/words.ts'

const OUT = join(new URL('..', import.meta.url).pathname, 'seed-review.md')

const TITLE: Record<ExerciseType, string> = {
  laute: '1. Selbstlaute, Zwielaute, Umlaute',
  mehrzahl: '2. Einzahl und Mehrzahl',
  luecke: '3. Fehlende Buchstaben',
  kurzlang: '4. Kurze und lange Selbstlaute',
  ie: '5. Wörter mit ie',
}

const mark = (i: Item) => (i.tags?.includes('missed-on-test') ? ' ★' : '')
const own = (i: Item) => (i.hint ? ruleOf(i) : '')

const table = (head: string[], rows: string[][]) =>
  [`| # | ${head.join(' | ')} |`, `|---|${head.map(() => '---').join('|')}|`, ...rows.map((r, n) => `| ${n + 1} | ${r.join(' | ')} |`)].join('\n')

const of = (t: ExerciseType) => SEED.filter((i) => i.type === t)

const sections: string[] = [
  '# Drachen-Arena – Wortliste zur Durchsicht',
  '',
  `${SEED.length} Aufgaben. ★ = beim Schultest falsch, kommt zuerst. Bitte markieren: falsch, fehlt, passt nicht zur Schule.`,
  '',
  `## ${TITLE.laute}`,
  '',
  '**Einzelne Laute**',
  '',
  table(['Laut', 'Antwort'], of('laute').filter((i) => !isSentence(i)).map((i) => [i.prompt, i.answer])),
  '',
  '**Sätze (einfärben wie im Test; ie, ee, oo zählen als zwei Selbstlaute: Wiese, Meer, Boot)**',
  '',
  table(['Satz'], of('laute').filter(isSentence).map((i) => [i.prompt])),
  '',
  `## ${TITLE.mehrzahl}`,
  '',
  table(['Einzahl', 'Mehrzahl', 'Umlaut?'], of('mehrzahl').map((i) => [i.prompt + mark(i), i.answer, i.tags?.includes('umlaut-plural') ? 'ja' : ''])),
  '',
  `## ${TITLE.luecke}`,
  '',
  table(['Lücke', 'fehlt', 'Wort', 'eigener Tipp'], of('luecke').map((i) => [i.prompt.replace('_', ' _ ') + mark(i), i.answer, wordOf(i), own(i)])),
  '',
  `## ${TITLE.kurzlang}`,
  '',
  table(['Wort', 'kurz/lang', 'eigener Tipp'], of('kurzlang').map((i) => [i.prompt, i.answer, own(i)])),
  '',
  `## ${TITLE.ie}`,
  '',
  table(['Wort', 'ie oder i'], of('ie').map((i) => [i.prompt, i.tags?.includes('short-i') ? 'i (kurz)' : 'ie'])),
  '',
]

writeFileSync(OUT, sections.join('\n'))
console.log(`Wrote ${OUT} (${SEED.length} items)`)
