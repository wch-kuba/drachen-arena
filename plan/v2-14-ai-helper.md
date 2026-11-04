# Part 14 – AI helper (parent panel)

**Goal:** AI saves the parent time when adding school material. The child never talks to AI, and AI output never reaches the child without the parent approving it.

← [Back to plan](../PLAN.md)

## Models
- **Text and photo understanding at runtime:** Claude Haiku 5.5 (`claude-haiku-5-5`). This is the cheap tier, about $0.10 / $0.50 per 1M tokens in/out. One request costs a fraction of a cent.
- **Seed content at build time (Part 5):** Claude Opus 5.5 (`claude-opus-5-5`). It's a one-off job and accuracy matters more than price.
- **Images:** Claude does not generate images. Use a separate image API (pick one in Part 7). Generate at build time for the seed set, and on demand for parent-added words.

## Architecture
- [ ] The API key **never** goes into the PWA. Add a small endpoint on Forge (Laravel or plain PHP) with the key in `.env`.
- [ ] Endpoints: `POST /api/ai/extract` (photo → items), `POST /api/ai/suggest` (word → filled fields), `POST /api/ai/generate` (topic → items), `POST /api/ai/image` (word → picture).
- [ ] Protect the endpoints with a parent token set in parent mode, plus a rate limit and a daily cap.
- [ ] Use structured outputs (`output_config.format` with a JSON schema that matches the `Item` type) so responses always parse.
- [ ] The app stays fully offline for the child. AI features show "Nur mit Internet" when offline.

## Features
- [ ] **Worksheet photo → words:** the parent photographs a school worksheet or Wochenplan, AI extracts words and builds items for the matching exercises, and the parent sees a preview.
- [ ] **Auto-fill:** the parent types "der Korb" and AI suggests the plural "Körbe", a hint ("Aus o wird ö"), the gap letters, vowel length and the ie-check.
- [ ] **Topic → 10 items:** e.g. "Wörter mit ie, Tiere", or "Umlaut-Plural, Schule".
- [ ] **Picture for a new word** via the image API, in the locked style prompt from DESIGN.md.

## Safety & quality
- [ ] Everything AI makes goes into a **review queue**. The parent approves, edits or rejects it. Nothing goes live automatically.
- [ ] Local rule checks on AI output: the plural differs from the singular, the gap letters are really in the word, ie-words contain "ie", the answer uses only German letters.
- [ ] The system prompt pins Klasse 2 level, standard German spelling (no Swiss "ss" for "ß"), and child-safe words.
- [ ] Log costs per request and show them in the parent panel ("Diesen Monat: 0,12 €").

## Done when
The parent photographs a worksheet, approves 8 items in under 2 minutes, and the child sees them in the next round.
