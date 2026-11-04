// Child-facing German text, kept in one place so it can be reviewed (and translated later).

import type { ExerciseType } from './engine/types.ts'

export const T = {
  right: 'Super! Ein Kristall für deinen Schatz.',
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
} as const

/** Default rule hint per exercise, used when an item has no own hint. */
export const DEFAULT_HINT: Record<ExerciseType, string> = {
  laute: 'Schau auf die Buchstaben auf den Farben.',
  mehrzahl: 'Wird aus a, o, u ein ä, ö, ü?',
  luecke: 'Sprich das Wort langsam und hör genau hin.',
  kurzlang: 'Sprich das Wort laut. Klingt der Selbstlaut kurz oder lang?',
  ie: 'Es hat ein langes i. Das schreibt man ie.',
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
