import { DRAGONS } from '../content/dragons.ts'
import { eggKind, goalLeft, growing } from '../engine/rewards.ts'
import type { Profile } from '../engine/types.ts'
import { T } from '../strings.ts'
import { DragonPic, EggPic, EggSlot, IconBack } from '../ui/art.tsx'

// The dragon collection: each hatched dragon rests on its own small hoard in a niche of the
// grotto, newest first and biggest; the one being fed says how many crystals it still needs.
// Then the next egg (filling, or waiting until that dragon is grown), then the eggs still to
// find as dashed shapes carved into the rock: the child sees how many, never what they are.

export function Collection({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const dragons = [...profile.dragons].reverse()
  const ready = !!profile.pendingHatch
  const fed = growing(profile)
  const left = DRAGONS.length - profile.dragons.length - 1

  return (
    <div class="collection grotto">
      <header class="collection-top">
        <button type="button" class="btn-round" aria-label={T.toGrotto} onClick={onBack}>
          <IconBack />
        </button>
        <h1>{T.myDragons}</h1>
      </header>
      <p class="collection-sub">{dragons.length ? T.dragonCount(dragons.length) : T.noDragons}</p>
      <div class="niches">
        {dragons.map((d) => {
          const stage = d.stage
          return (
            <div class="niche">
              <div class="niche-arch" data-stage={stage}>
                <DragonPic kind={d.kind} stage={stage} label={`${d.name}, ${T.stage[stage]}`} />
              </div>
              <span class="niche-name">{d.name}</span>
              <span class="niche-meta">
                {T.stage[stage]}
                {d.id === fed?.id && <> · {T.crystalsLeft(goalLeft(profile))}</>}
              </span>
            </div>
          )
        })}
        {left >= 0 && (
          <div class="niche" data-empty={fed ? '' : undefined}>
            <div class="niche-arch niche-egg">{fed ? <EggSlot /> : <EggPic kind={eggKind(profile)} isNew={ready} />}</div>
            <span class="niche-name">{T.egg}</span>
            <span class="niche-meta">{fed ? T.eggAfter(fed.name) : ready ? T.eggReady : T.eggLeft(goalLeft(profile))}</span>
          </div>
        )}
        {Array.from({ length: Math.max(0, left) }, () => (
          <div class="niche" data-empty="">
            <div class="niche-arch niche-egg">
              <EggSlot />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
