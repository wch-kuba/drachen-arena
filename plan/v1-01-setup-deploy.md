# Part 1 – Setup & first deploy

**Goal:** an empty "Hallo Drache" PWA is live on Forge over HTTPS and installed on the iPhone home screen. Deploy pipeline works before any feature work.

← [Back to plan](../PLAN.md)

## Tasks

### Project
- [x] `git init`, create the repo (GitHub), push.
- [x] Scaffold Vite + Preact + TypeScript (`npm create vite@latest -- --template preact-ts`).
- [x] Add `vite-plugin-pwa` (`registerType: 'prompt'`, precache all assets).
- [x] Web manifest: name "Drachen-Arena", short_name "Drachen", `display: standalone`, `orientation: portrait`, `lang: de`, theme/background color (placeholder).
- [x] iOS meta tags: `apple-mobile-web-app-capable`, status-bar style, `apple-touch-icon` (180×180 placeholder).
- [x] `viewport-fit=cover` and safe-area padding (notch / home indicator).
- [x] Disable zoom-on-double-tap and text selection on game UI.
- [x] "Neue Version verfügbar" prompt wired to the service worker update event.
- [x] Update progress (asked 2026-11-05: "Aktualisieren" sometimes takes long): after the tap a gold progress bar replaces the button, following the worker phases; reload fallback after 10 s in case the takeover event never comes. Checked in preview with a real second build, iPad and iPhone widths.

### Forge
- [x] Decide the domain/subdomain and point DNS at the Forge server.
- [x] New site on Forge, linked to the repo, branch `main`.
- [x] Web directory: `/dist`. Domain: https://drachen.webchefs.software
- [x] Deploy script:
  ```bash
  cd $FORGE_SITE_PATH
  git pull origin $FORGE_SITE_BRANCH
  npm ci
  npm run build
  ```
- [x] Check that Node 20+ is on the server.
- [x] Let's Encrypt SSL on.
- [x] Nginx headers:
  ```nginx
  location = /sw.js { add_header Cache-Control "no-cache"; }
  location = /manifest.webmanifest { add_header Cache-Control "no-cache"; }
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location / { try_files $uri $uri/ /index.html; }
  ```
- [x] Quick Deploy on (push = deploy).

### iPhone
- [x] Open the URL in Safari → Share → "Zum Home-Bildschirm".
- [x] Opens full screen, no Safari bar.
- [x] Airplane mode → app still opens.
- [x] Push a small change → app shows the update prompt.

## Done when
Installed icon on the iPhone opens offline, and a `git push` reaches the phone.
