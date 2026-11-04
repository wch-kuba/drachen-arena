import { PictureHat } from './art.tsx'

// Drawn word pictures by key. Part 7 swaps these for generated art; until then an item
// without a drawing simply shows no picture (no emoji stand-ins).
const PICTURES: Record<string, () => preact.JSX.Element> = {
  hat: PictureHat,
}

export function WordPicture({ image }: { image?: string }) {
  const P = image ? PICTURES[image] : undefined
  return P ? <P /> : null
}

export const hasPicture = (image?: string) => !!image && image in PICTURES
