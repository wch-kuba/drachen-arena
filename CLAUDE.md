# Drachen-Arena – working rules

Offline Klasse 2 German spelling PWA for one child, mainly on an iPad (also an iPhone). Vite + Preact + TypeScript + vite-plugin-pwa.
Product facts: [PRODUCT.md](PRODUCT.md). Plan: [PLAN.md](PLAN.md) → detail files in [plan/](plan/).

## Plan housekeeping (always)

- Before starting work, find the matching task in `plan/*.md`. If the work isn't in the plan, add it there first.
- When a task is done and verified, tick it in the same commit as the work (or a `docs: tick …` commit right after).
- When all tasks of a Part are ticked and its "Done when" check passes, tick the Part in PLAN.md.
- Resolved open question → tick it in PLAN.md and record the answer where it belongs (plan file or PRODUCT.md).
- New decision or scope change → update PRODUCT.md / the plan file in the same change. Plan and docs never drift from the code.

## Instructions for the user (devops, settings, external websites, iPad/iPhone)

When something must be done by hand (Forge panel, DNS, GitHub settings, iPad/iPhone checks, any external site):
- Give **one action per message**: what to open, where to click, what to enter, what to expect.
- Then **wait** for the user to confirm, and **verify** what can be verified from here (curl the URL/headers, `gh` API, git log, build output) before giving the next step.
- If it can't be verified from here, ask one concrete yes/no question about the expected result.

## Deploy = push to main

Forge Quick Deploy builds every push to `main` at https://drachen.webchefs.software. So:
- Run `npm run build` locally and make sure it passes before every push.
- Never push half-done work to `main`; use a branch + PR for anything larger than a small fix.
- After a push that changes the app, check the live site (`curl -sI`) and remember the service worker: the phone sees changes only after the update prompt.

## Design (always impeccable)

- Any design or UI task (look and feel, screens, components, layout, color, type, motion, icons, polish, UX copy, DESIGN.md) **must** go through the `impeccable` skill. Invoke it before writing UI code or design docs.
- Don't do design work ad hoc, even small tweaks. Use impeccable's matching mode (shape, critique, polish, colorize, animate, …).
- Design decisions live in DESIGN.md (Part 2), and PRODUCT.md stays the product source impeccable reads.

## Possible commercialization later (secondary)

The main goal is a great game for one child. It *might* be sold later, so keep that door open when it costs little, but never let it slow down or shape v1/v2 work:
- **Licenses:** only use dependencies, fonts, sounds and icons that allow commercial use (MIT/Apache/OFL or similar). Record the source and license of every asset you add. AI images must come from a tool whose terms allow commercial use.
- **Content:** words and exercises are our own. Mirror school-test *formats*, but never copy text, images or layouts from Klett or other publishers' materials.
- **Personal data:** nothing personal in the code or the bundle. Child data stays on the device. Don't add anything that would make GDPR/DSGVO or children's-privacy compliance harder later (no accounts, tracking or third-party calls without a decision).
- **No single-child assumptions:** names and settings come from data, not from code. Keep child-facing strings in one place so they can be translated later.
- Don't add multi-user, payments, accounts or i18n infrastructure now. Flag it when a decision would make commercialization noticeably harder.

## Language

- UI text (child-facing) is German, short, warm, readable by a 7–8-year-old. Code, comments, commits, docs: English.

## Commits & PRs

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`. Subject ≤ 50 chars, imperative.
- One logical change per commit. Template: [.gitmessage](.gitmessage) (`git config commit.template .gitmessage`).
- PR template: [.github/pull_request_template.md](.github/pull_request_template.md).
- Commit or push only when the user asks.
