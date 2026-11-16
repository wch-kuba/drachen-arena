# Assets

Source and license of every bundled asset (see CLAUDE.md › Possible commercialization).

## Images (`public/img/`, `public/icons/`)

| What | Source | License |
|---|---|---|
| Word pictures, dragons (stages × moods), eggs, lands, world map, app icon | Generated 2026-11-04 with OpenAI GPT Image (`gpt-image-1-mini` for words, `gpt-image-1.5` for the rest) by `scripts/gen-images.ts`; prompts in `src/content/picture-prompts.ts` and DESIGN.md › Image style prompt. Model, prompt hash and date per file in `src/content/image-sources.json`. | OpenAI Terms of Use: the output belongs to us, commercial use allowed. Re-check the terms before a commercial release. |
| Flying dragons (`public/img/fly/`, 12) and flight scenery (`public/img/flight/`, 8 pieces) | Generated 2026-11-16 the same way (`gpt-image-1.5`, groups `fly` and `flight`); flying poses are made from each dragon's reference picture | As above |
| Wing-beat sprite sheets (`public/img/flap/`, 12) | Cut by `scripts/gen-flap.ts` from 3 s clips generated 2026-11-16 with Google Gemini Omni Flash (`gemini-omni-1.2-flash`, Gemini API, paid tier) from our own flying-dragon pictures; prompt in that script | Gemini API terms. **Usage rights for generated video not confirmed** (the docs read on 2026-11-16 do not state them); outputs carry a SynthID watermark. Check the terms before a commercial release; the still flying pictures are the fallback. |
| Take-off clips (`public/video/dive-*.mp4`) | Generated 2026-11-16 with Gemini Omni Flash from our own grotto wall picture as the first frame (`npm run flap -- dive`; prompt in `scripts/gen-flap.ts`) | As the wing-beat sheets: **usage rights not confirmed**, SynthID watermark. The game works without them. |
| Egg shell halves (`public/img/shell/`) | Cut from the generated eggs by `scripts/gen-images.ts` | As above |
| UI, gems, coins, icons (inline SVG in `src/ui/art.tsx`) | Drawn for this project | Own work |

Free libraries checked 2026-11-04 (Kenney, OpenGameArt, itch.io, OpenMoji, Twemoji, Fluent, Noto, game-icons.net): none fit the style, so none are used. Verdict in plan/v1-07-images.md.

## Sound effects (`public/sfx/`)

| File | Source | License |
|---|---|---|
| right, gem, hint, round, wobble, hatch, land, grotto (`.mp3`); wake, roar (2026-11-05) | Generated 2026-11-04 with ElevenLabs sound effects (`eleven_text_to_sound_v3`) by `scripts/gen-sfx.ts`; prompts in that file | ElevenLabs paid plan: commercial use of generated audio allowed. Re-check the terms before a commercial release. |
| wings (`.mp3`) | Generated 2026-11-16 the same way (dragon take-off for the flight) | As above |
| music (`.mp3`) | Generated 2026-11-05 with ElevenLabs Music (`music_v1`, instrumental) by `scripts/gen-music.ts`; prompt and loop points in that file | ElevenLabs paid plan: commercial use of generated music allowed. Re-check the terms before a commercial release. |

## Voice clips (`public/audio/`)

Generated at build time by `scripts/gen-audio.ts`; provider and terms in PRODUCT.md › Audio.

## Fonts

Andika (SIL), OFL 1.1, self-hosted in `public/fonts/`.
