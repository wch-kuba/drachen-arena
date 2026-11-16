// The generated art (Part 7), bundled in public/img and precached for offline play.
// scripts/gen-images.ts writes the manifest; keys are "<group>/<name>".

import flaps from '../content/flap-manifest.json'
import manifest from '../content/image-manifest.json'
import type { Stage } from '../engine/rewards.ts'

export interface Pic {
  src: string
  w: number
  h: number
}

/** A dragon's mood. Every dragon has all three at every growth stage. */
export type Pose = 'idle' | 'happy' | 'sleeping'

const ALL = manifest as Record<string, Pic>

export function pic(key: string): Pic | undefined {
  const p = ALL[key]
  return p && { ...p, src: import.meta.env.BASE_URL + p.src }
}

export const wordPic = (image?: string) => (image ? pic(`word/${image}`) : undefined)
export const dragonPic = (kind: string, stage: Stage, pose: Pose) => pic(`dragon/${kind}-${stage}-${pose}`)
/** The grown dragon in flight, facing right. Missing until its picture is generated. */
export const flyPic = (kind: string) => pic(`fly/${kind}`)
/** A dragon's wing beat as a sheet of frames (scripts/gen-flap.ts). Missing until its clip is made. */
export interface Flap extends Pic {
  /** Frames per row, and rows: the beat runs through them row by row. */
  cols: number
  rows: number
  /** How long one beat takes. */
  ms: number
}
export function flapPic(kind: string): Flap | undefined {
  const f = (flaps as Record<string, Flap>)[kind]
  return f && { ...f, src: import.meta.env.BASE_URL + f.src }
}
/** A piece of the grotto the flight passes (rocks, kelp, the egg's ledge). */
export const flightPic = (key: string) => pic(`flight/${key}`)
export const eggPic = (kind: string) => pic(`egg/${kind}`)
export const shellPic = (kind: string, half: 'top' | 'bottom') => pic(`shell/${kind}-${half}`)
export const landPic = (land: string) => pic(`land/${land}`)

/** Every key the app may ask for, so a test can check the art is complete. */
export const hasPic = (key: string) => key in ALL
