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

### Forge
- [ ] Decide the domain/subdomain and point DNS at the Forge server.
- [ ] New site on Forge, linked to the repo, branch `main`.
- [ ] Web directory: `/dist`.
- [ ] Deploy script:
  ```bash
  cd $FORGE_SITE_PATH
  git pull origin $FORGE_SITE_BRANCH
  npm ci
  npm run build
  ```
- [ ] Check that Node 20+ is on the server.
- [ ] Let's Encrypt SSL on.
- [ ] Nginx headers:
  ```nginx
  location = /sw.js { add_header Cache-Control "no-cache"; }
  location = /manifest.webmanifest { add_header Cache-Control "no-cache"; }
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location / { try_files $uri $uri/ /index.html; }
  ```
- [ ] Quick Deploy on (push = deploy).

### iPhone
- [ ] Open the URL in Safari → Share → "Zum Home-Bildschirm".
- [ ] Opens full screen, no Safari bar.
- [ ] Airplane mode → app still opens.
- [ ] Push a small change → app shows the update prompt.

## Done when
Installed icon on the iPhone opens offline, and a `git push` reaches the phone.
