# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Installable PWA, used as a home-screen app. **Mainly on an iPad** (portrait and landscape), also on an iPhone (portrait). Touch only. Layout scales with the screen; iPad landscape uses two panes.)

## Stack

Vite + Preact + TypeScript + `vite-plugin-pwa` (service worker precaches everything, so the app works fully offline after first load). Static build hosted on the team's own Laravel Forge server (nginx static site, Let's Encrypt HTTPS, deploy script `npm ci && npm run build`, web root `dist/`). The Forge host was the user's choice; the framework was recommended and not objected to.

## Users

- **Primary: one child in Klasse 2** at a German primary school. Not a native-level German speller yet. Plays alone, mostly on an iPad (sometimes an iPhone), in short sessions at home. Reads simple German; all child-facing UI is in German.
- **Secondary: the parent.** Adds words, imports lists, checks progress and problem words, keeps the material aligned with what school is covering right now. Uses a separate parent mode inside the same installed app.

## Product Purpose

A small personal learning game, "Drachen-Arena", that drills real Klasse 2 German spelling and grammar inside a dragon-collecting adventure. Success = the child gets the school's Lernzielkontrolle tasks right: identifying Selbstlaute/Umlaute/Zwielaute, forming plurals (incl. umlaut plurals), filling in missing letters, short vs long vowels, and ie-words.

## Positioning

Not a generic quiz or flashcard app. It is built around this child's actual school material and actual mistakes, the child types real German words, and the parent keeps feeding it the current school content.

## Operating Context

Evidence from a graded school test (Lernzielkontrolle 1 – Selbstlaute, Umlaute, Zwielaute, Klett 2021) shows the current gaps:
- Selbstlaute 0/12, Umlaute 0/4, Zwielaute 2/4 when coloring letters in sentences.
- Plurals 0/4: wrote "Hauten, Lausen, Korben, Wanden" for Hüte, Läuse, Körbe, Wände. The child adds -en and misses the vowel change (a→ä, o→ö, u→ü, au→äu).
- ü/ö/i choice 2/4 on the scored items: missed Mütze, Birne, Kirsche, König.
The school test format (color letters in a sentence; complete the plural from a picture; insert the missing letter) should be mirrored so practice transfers.

## Capabilities and Constraints

Five exercise types:
1. **Selbstlaute, Zwielaute, Umlaute**: choose the category (3 options) for a letter/letter group; plus a sentence mode mirroring the school test (tap letters in a sentence and sort them).
2. **Einzahl und Mehrzahl**: see singular + picture, type the plural. Emphasis on umlaut plurals.
3. **Fehlende Buchstaben**: type the missing letter(s) in a word.
4. **Kurze und lange Selbstlaute**: choose short or long. Needs audio (see Audio below).
5. **Wörter mit ie**: see a picture, type the word. Short-i words (Fisch, Kissen) are mixed in, so the child chooses: long i → ie, short i → i. Land label: "i oder ie?".

- Exercises 2, 3, 5 are typed; 1 and 4 are choice-based. Typing uses a **custom in-app keyboard** (large keys, Ä Ö Ü ß always visible, no autocorrect), not the iOS system keyboard.
- **Answer strictness:** capitalization matters but is handled gently. A lowercase noun ("hüte") counts as almost right: "Fast! Nomen schreibt man groß." The child fixes it and still earns the reward. An article is never required.
- **Exercise 1 has two modes:** (A) a single letter or letter group → pick 1 of 3 categories; (B) school-test style, where the child taps letters in a sentence and sorts them gelb (Selbstlaut) / grün (Zwielaut) / blau (Umlaut).
- **Exercise 4 marks:** dot under a short vowel (•), line under a long vowel (–), as in Klett materials. The child taps • or –.
- **Exercise 3 scope (v1):** the gap is a single vowel or umlaut, or a vowel group (ie, ei, ai, au, eu, äu; ai added 2026-11-04 as Merkwörter: Kaiser, Hai). No ck/tz/double-consonant gaps in v1.
- **Sessions:** 10 tasks per round, no timers, no daily cap. Every instruction has a speaker button.
- **Personalization:** the parent sets the child's name in the app (never hard-coded) and the game greets the child by it. When an egg hatches, the child types a name for the dragon. The child's favorite colors, animals and themes, which the parent will supply, shape the dragons and worlds.
- No syllable splitting (Silbentrennung). Explicitly out of scope.
- Wrong answers never punish: graded hints (rule hint → partial reveal → show answer and retype). Wrong words come back more often (per-word spaced repetition).
- Rewards: points and crystals for correct answers, eggs that hatch into collectible dragons that grow (hatchling → young → grown) and show moods (idle, happy, sleeping), new worlds/levels unlocked by progress. Rules (decided 2026-11-04):
  - Crystals: 3 right on the first try, 2 after one hint, 1 after more help; +10 for every finished round. The crystal total is the score. Nothing is ever taken away.
  - An egg needs 100 crystals: 3 rounds at best, 5 at worst. One egg at a time; extra crystals carry into the next.
  - Each hatch opens the next land. Order: Mehrzahl (open at start, the biggest test gap) → Fehlende Buchstaben → i oder ie? → Laute → Kurz oder lang. Each land's egg first hatches that land's own dragon; 12 dragons in v1.
  - A dragon grows young after 10 finished rounds since hatching, grown after 25. Never shrinks.
  - The child types their own name on first start (v1); parent mode takes this over in v2.
- Progress stored locally on the device (IndexedDB, `navigator.storage.persist()`), with JSON backup export/import in the parent panel. Installed-PWA storage is separate from Safari's, so all parent work happens inside the installed app.
- Works offline after first load. Internet only needed for first install and updates.
- **Audio:** every spoken text is an **AI-generated clip** from **ElevenLabs** (`eleven_v3`, German, speed 0.85), generated at build time on the parent's Mac and bundled as MP3, so it plays offline. The child's app never calls ElevenLabs. Voices from the ElevenLabs voice library, chosen by the parent (2026-11-04): **Knurps** (playful chipmunk) narrates every instruction, tip and feedback line in three tones (cheerful, playful, warm; eleven_v3 audio tags); every word, plural, sound and sentence is made in four voices (**Kermy**, **Hopsi**, **Emmy**, **Knurps**) and the app picks a random clip (voice or tone) each time a text is spoken. `src/content/audio-sources.json` records the voice of every clip. The device's own voice (`speechSynthesis`, de-DE) is only a fallback for text without a clip (e.g. parent-added words until their clips are generated, see Part 14).
  - Why not Gemini TTS any more: Tier 1 caps at 100 requests per model per day, so the seed would have taken a week; Google Cloud TTS (Chirp 3 HD) had no cap but less warmth. ElevenLabs Starter: 40,000 credits a month, enough to make every clip in one run.
  - Terms: ElevenLabs paid plans include commercial use of the generated audio; library voices may be used under the plan. The ElevenLabs account belongs to the parent (adult); no child data is sent, only our own word lists. **Before any commercial release:** re-check the ElevenLabs terms for library voices in a children's product.
- Word pictures: **AI-generated illustrations** in one consistent style, bundled with the app for the seed content. A fallback for parent-added words (emoji or photo) is still to be decided.
- Seed content: about 150–200 Klasse 2 words across the five exercises, written by us and reviewed by the parent.

**Release plan**
- v1: five exercises, seed content, rewards loop, offline install.
- v2: parent panel (add words/questions, Excel/CSV import via bundled SheetJS with a template file, progress and problem-word view, backup).

**Open decisions:** where generated images come from (tool/pipeline), image fallback for parent-added words, parent-gate mechanism (proposed: long-press + an adult-level sum). Production domain: https://drachen.webchefs.software.

**Future (not a goal now):** the app may be commercialized later. The main goal stays the personal game. Avoid choices that would block a later release (asset licenses, publisher content, personal data in the bundle), but don't build for it.

## Brand Commitments

- Name: **Drachen-Arena**. Tagline: "Deutsch lernen, Drachen sammeln und Abenteuer erleben!"
- World: colorful, friendly dragons, eggs, crystals, magical lands. Chosen visual world: **Drachenhort** – the child's dragon sleeps on a treasure hoard in a turquoise sea grotto (details in DESIGN.md).
- Child's favorites (from the parent): turquoise and gold; ocean and sea creatures; dragons are the main theme; feel magical, glowing, cozy. Nothing specific to avoid.
- Child-facing voice: German, warm and encouraging, short sentences a 7–8-year-old can read.

## Evidence on Hand

- Original brief (Polish), in conversation.
- Photo of the graded Lernzielkontrolle 1 worksheet (in conversation, not in repo). The child's name and worksheet must not be shipped in the app.
- No word lists, artwork, or Excel files provided yet. Do not invent curriculum claims beyond standard Klasse 2 content.

## Product Principles

1. **Real school content over game filler.** Every task should be one the child could meet in a Klasse 2 test.
2. **Target the actual mistakes.** Umlaut plurals and ü/ö/i come first; repetition follows what the child gets wrong.
3. **Mistakes are safe.** Hint, retry, never lose rewards.
4. **The child types the word.** Recognition alone isn't enough; spelling is produced, not picked, wherever the brief says so.
5. **Parent keeps it current.** Adding school material should take minutes.

## Accessibility & Inclusion

Early reader: minimal text, large type, audio for every word, large touch targets for small fingers, no time pressure.
