import { useEffect, useRef, useState } from 'preact/hooks'
import { DRAGONS, kindOf } from '../content/dragons.ts'
import { cardSay } from '../content/speech.ts'
import { eggKind, goalFill, goalLeft, growing } from '../engine/rewards.ts'
import type { Dragon, Profile } from '../engine/types.ts'
import { T } from '../strings.ts'
import { DragonPic, EggPic, EggSlot, IconBack, IconFlip } from '../ui/art.tsx'
import { Speak } from '../ui/Speak.tsx'

// The dragon collection: each hatched dragon rests on its own small hoard in a niche of the
// grotto, newest first and biggest; the one being fed says how many crystals it still needs.
// Then the next egg (filling, or waiting until that dragon is grown), then the eggs still to
// find as dashed shapes carved into the rock: the child sees how many, never what they are.
// A tap on a dragon lifts its card out of the niche (Part 6b): front the dragon, back what it is.

interface Props {
  profile: Profile
  onBack: () => void
  /** A grown dragon's card can fly it again (the flight, without an egg). */
  onFly?: (d: Dragon) => void
  /** Preview only: open on this dragon's card. */
  card?: string
}

export function Collection({ profile, onBack, onFly, card }: Props) {
  const dragons = [...profile.dragons].reverse()
  const ready = !!profile.pendingHatch
  const fed = growing(profile)
  const left = DRAGONS.length - profile.dragons.length - 1
  const [open, setOpen] = useState(card)
  const shown = dragons.find((d) => d.id === open)

  return (
    <div class="collection grotto">
      <header class="collection-top">
        <button type="button" class="btn-round" aria-label={T.toGrotto} onClick={onBack}>
          <IconBack />
        </button>
        <h1>{T.myDragons}</h1>
      </header>
      <p class="collection-sub">{dragons.length ? T.dragonCount(dragons.length) : T.noDragons}</p>
      <div class="niches" inert={!!shown}>
        {dragons.map((d) => {
          const stage = d.stage
          return (
            <button type="button" class="niche" aria-label={T.showCard(d.name)} onClick={() => setOpen(d.id)}>
              <span class="niche-arch" data-stage={stage}>
                <DragonPic kind={d.kind} stage={stage} />
              </span>
              <span class="niche-name">{d.name}</span>
              <span class="niche-meta">
                {T.stage[stage]}
                {d.id === fed?.id && <> · {T.crystalsLeft(goalLeft(profile))}</>}
              </span>
            </button>
          )
        })}
        {left >= 0 && (
          <div class="niche" data-empty={fed ? '' : undefined}>
            <div class="niche-arch niche-egg">{fed ? <EggSlot /> : <EggPic kind={eggKind(profile)} isNew={ready} fill={goalFill(profile)} />}</div>
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
      {shown && <DragonCard key={shown.id} dragon={shown} onClose={() => setOpen(undefined)} onFly={onFly && shown.stage === 'grown' ? () => onFly(shown) : undefined} />}
    </div>
  )
}

/**
 * A dragon's card, held up over the niches. Front: the dragon, its name and stage. Back: its
 * kind, power, home, size and favorite word, with a read-aloud button. A tap turns it over.
 */
function DragonCard({ dragon, onClose, onFly }: { dragon: Dragon; onClose: () => void; onFly?: () => void }) {
  const [back, setBack] = useState(false)
  const close = useRef<HTMLButtonElement>(null)
  const info = kindOf(dragon.kind)?.card

  useEffect(() => {
    close.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [])

  const rows = info && [
    [T.card.art, info.art],
    [T.card.power, info.power],
    [T.card.home, info.home],
    [T.card.size, T.cardSize[dragon.stage]],
    ...(dragon.word ? [[T.card.word, dragon.word]] : []),
  ]

  return (
    <div class="card-view" role="dialog" aria-modal="true" aria-label={dragon.name}>
      <button type="button" class="card-shade" aria-label={T.myDragons} tabIndex={-1} onClick={onClose} />
      <button ref={close} type="button" class="btn-round card-close" aria-label={T.myDragons} onClick={onClose}>
        <IconBack />
      </button>
      <div class="card-room">
        <div class="card" data-back={back ? '' : undefined}>
          <div class="card-turn">
          <button type="button" class="card-face card-front" aria-label={T.flipCard} aria-hidden={back} tabIndex={back ? -1 : 0} onClick={() => setBack(true)}>
            <span class="card-window">
              <DragonPic kind={dragon.kind} stage={dragon.stage} label={dragon.name} />
            </span>
            <span class="card-name">{dragon.name}</span>
            <span class="card-stage">{T.stage[dragon.stage]}</span>
          </button>
          {/* A tap anywhere but the speaker turns it back. */}
          <div class="card-face card-back" aria-hidden={!back} inert={!back} onClick={(e) => !(e.target as Element).closest('button') && setBack(false)}>
            <div class="card-head">
              <span class="card-name">{dragon.name}</span>
              <Speak text={cardSay(dragon.kind)} />
            </div>
            {rows && (
              <dl class="card-facts">
                {rows.map(([k, v]) => (
                  <div>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <EggPic class="card-egg" kind={dragon.kind} />
          </div>
          </div>
        </div>
      </div>
      <div class="card-act">
        {onFly && (
          <button type="button" class="btn-gold" onClick={onFly}>
            {T.fly}
          </button>
        )}
        <button type="button" class="reward-home card-flip" onClick={() => setBack(!back)}>
          <IconFlip />
          {T.flipCard}
        </button>
      </div>
    </div>
  )
}
