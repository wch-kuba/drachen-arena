// The five lands: one grotto chamber per exercise type (see PRODUCT.md).

export type LandId = 'laute' | 'mehrzahl' | 'luecke' | 'kurzlang' | 'ie'

export interface Land {
  id: LandId
  name: string
  what: string
  hue: string
}

export const LANDS: Land[] = [
  { id: 'laute', name: 'Kristallhöhle', what: 'Selbstlaute, Zwielaute, Umlaute', hue: 'var(--tq-300)' },
  { id: 'mehrzahl', name: 'Perlenriff', what: 'Einzahl und Mehrzahl', hue: 'var(--gold-300)' },
  { id: 'luecke', name: 'Schiffswrack', what: 'Fehlende Buchstaben', hue: 'var(--tq-500)' },
  { id: 'kurzlang', name: 'Echo-Grotte', what: 'Kurz oder lang?', hue: 'var(--gold-500)' },
  { id: 'ie', name: 'Tiefsee-Garten', what: 'i oder ie?', hue: 'var(--tq-100)' },
]
