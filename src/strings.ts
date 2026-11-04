// Child-facing German text, kept in one place so it can be reviewed (and translated later).

import type { ExerciseType } from './engine/types.ts'

export const T = {
  almostNoun: 'Fast! Nomen schreibt man groß.',
  almostCase: 'Fast! Achte auf große und kleine Buchstaben.',
  hintRule: (rule: string) => `Tipp: ${rule}`,
  hintStart: 'So fängt es an. Schreib weiter!',
  hintShow: 'So heißt es. Schreib es ab.',
  hintListen: 'Hör noch einmal genau hin.',
  hintChoice: 'So ist es richtig. Tipp darauf.',
  umlautRule: (from: string, to: string) => `Aus ${from} wird ${to}.`,
  satzMissed: 'Fast! Schau auf die Ringe.',
  satzColor: 'Die Ringe zeigen dir die Farbe.',
  satzShow: 'So ist es richtig. Tipp auf Fertig.',
  listen: 'Wort anhören',
  kurz: 'kurz',
  lang: 'lang',
  next: 'Weiter',
  done: 'Fertig',
  readAloud: 'Vorlesen',
  noVoice: 'Vorlesen geht auf diesem Gerät gerade nicht.',
  exit: 'Zurück zur Grotte',
  progress: (n: number, of: number) => `${n} von ${of}`,
  roundScore: (n: number, of: number) => `${n} von ${of}!`,
  roundCrystals: (n: number) => `+${n} Kristalle für deinen Schatz`,
  again: 'Noch eine Runde',
  home: 'Zur Grotte',
  empty: 'Hier gibt es noch keine Aufgaben.',
  // Rewards (Part 6)
  hello: (name: string) => (name ? `Hallo, ${name}!` : 'Hallo!'),
  askName: 'Wie heißt du?',
  start: 'Los geht’s!',
  sleepsOn: 'Dein Drache schläft auf',
  crystalsWord: (n: number) => (n === 1 ? 'Kristall' : 'Kristallen'),
  myDragons: 'Deine Drachen',
  locked: 'Noch verschlossen',
  nextEgg: 'Öffnet sich mit dem nächsten Ei',
  roundBonus: (n: number) => `+${n} extra für die ganze Runde!`,
  eggLeft: (n: number) => `Noch ${n} Kristalle, dann schlüpft dein Ei.`,
  eggReady: 'Dein Ei wackelt! Gleich schlüpft es.',
  toEgg: 'Zum Ei!',
  dragonOfDay: (name: string) => `${name} ist heute bei dir.`,
  tapEgg: 'Tipp auf das Ei!',
  hatched: 'Dein Ei ist geschlüpft!',
  askDragonName: 'Wie soll dein Drache heißen?',
  helloDragon: (name: string) => `Hallo, ${name}!`,
  newLand: (land: string) => `Eine neue Grotte ist offen: ${land}`,
  toGrotto: 'Zur Grotte',
  dragonCount: (n: number) => (n === 1 ? '1 Drache' : `${n} Drachen`),
  stage: { hatchling: 'Drachenbaby', young: 'Junger Drache', grown: 'Großer Drache' },
  growsIn: (n: number) => (n === 1 ? 'Wächst nach der nächsten Runde' : `Wächst in ${n} Runden`),
  egg: 'Dein Ei',
  sounds: 'Töne',
  seaSound: 'Meeresrauschen',
  noDragons: 'Noch kein Drache. Spiel Runden, dann schlüpft dein Ei!',
} as const

/** Praise for a right answer. Rotates, never the same line twice in a row. */
export const PRAISE = [
  'Super!',
  'Stark gemacht!',
  'Richtig! Dein Schatz wächst.',
  'Du bist ein Drachenprofi!',
  'Toll gemacht!',
  'Genau so!',
  'Klasse!',
  'Prima, weiter so!',
]

/** First line after a wrong try: warm, never a "no". The hint follows. */
export const GENTLE = ['Noch nicht ganz.', 'Gleich hast du es!', 'Versuch es noch einmal.', 'Nicht schlimm. Probier es noch mal.']

const turn = new Map<readonly string[], number>()
/** Next line of a list, in turn, so the same line never shows twice in a row. */
export function pick(list: readonly string[]): string {
  const i = ((turn.get(list) ?? -1) + 1) % list.length
  turn.set(list, i)
  return list[i]
}

/** Default rule hint per exercise, used when an item has no own hint. */
export const DEFAULT_HINT: Record<ExerciseType, string> = {
  laute: 'Schau auf die Buchstaben auf den Farben.',
  mehrzahl: 'Wird aus a, o, u ein ä, ö, ü?',
  luecke: 'Sprich das Wort langsam und hör genau hin.',
  kurzlang: 'Sprich das Wort laut. Klingt der Selbstlaut kurz oder lang?',
  // The land mixes ie and short-i words, so the rule names both and gives neither away.
  ie: 'Langes i schreibt man ie. Kurzes i schreibt man i.',
}

/** Spoken instruction per exercise (the read-aloud button on the task plaque). */
export const ASK: Record<ExerciseType, string> = {
  laute: 'Was ist das für ein Laut?',
  mehrzahl: 'Schreib die Mehrzahl.',
  luecke: 'Welcher Buchstabe fehlt?',
  kurzlang: 'Hör gut zu. Kurz oder lang?',
  ie: 'Schreib das Wort.',
}

/** Laute in sentence mode (school-test style). */
export const ASK_SATZ = 'Tipp auf die Buchstaben. Dann auf die Farbe.'
/** Fehlende Buchstaben when the gap is a letter group. */
export const ASK_GROUP = 'Welche Buchstaben fehlen?'
