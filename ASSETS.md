# Assets

Source and license of every bundled asset (see CLAUDE.md › Possible commercialization).

## Images (`public/img/`, `public/icons/`)

| What | Source | License |
|---|---|---|
| Word pictures, dragons (stages × moods), eggs, lands, world map, app icon | Generated 2026-11-04 with OpenAI GPT Image (`gpt-image-1-mini` for words, `gpt-image-1.5` for the rest) by `scripts/gen-images.ts`; prompts in `src/content/picture-prompts.ts` and DESIGN.md › Image style prompt. Model, prompt hash and date per file in `src/content/image-sources.json`. | OpenAI Terms of Use: the output belongs to us, commercial use allowed. Re-check the terms before a commercial release. |
| Egg shell halves (`public/img/shell/`) | Cut from the generated eggs by `scripts/gen-images.ts` | As above |
| UI, gems, coins, icons (inline SVG in `src/ui/art.tsx`) | Drawn for this project | Own work |

Free libraries checked 2026-11-04 (Kenney, OpenGameArt, itch.io, OpenMoji, Twemoji, Fluent, Noto, game-icons.net): none fit the style, so none are used. Verdict in plan/v1-07-images.md.

## Sound effects (`public/sfx/`)

| File | Source | License |
|---|---|---|
| right, gem, key, hint, round, wobble, hatch, land, grotto, snore (`.mp3`) | Generated 2026-11-04 with ElevenLabs sound effects (`eleven_text_to_sound_v3`) by `scripts/gen-sfx.ts`; prompts in that file | ElevenLabs paid plan: commercial use of generated audio allowed. Re-check the terms before a commercial release. |

## Voice clips (`public/audio/`)

Generated at build time by `scripts/gen-audio.ts`; provider and terms in PRODUCT.md › Audio.

## Fonts

Andika (SIL), OFL 1.1, self-hosted in `public/fonts/`.
