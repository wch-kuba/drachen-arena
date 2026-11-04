import { wordPic } from './images.ts'

// The word picture on a task plaque (Part 7 art). An item without a picture shows none:
// no emoji stand-ins. Wörter mit ie then lets the child listen instead (Typed.tsx).

export function WordPicture({ image, label }: { image?: string; label: string }) {
  const p = wordPic(image)
  if (!p) return null
  return <img class="ex-picture" src={p.src} width={p.w} height={p.h} alt={label} decoding="async" draggable={false} />
}

export const hasPicture = (image?: string) => !!wordPic(image)
