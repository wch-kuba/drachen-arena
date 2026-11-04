# Drachen-Arena

Personal Klasse 2 German spelling game. Installable offline PWA (Vite + Preact + TypeScript + vite-plugin-pwa).

- Product: [PRODUCT.md](PRODUCT.md)
- Plan: [PLAN.md](PLAN.md)

## Dev

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve dist/ locally (service worker active)
```

## Deploy

Laravel Forge static site, web directory `/dist`, Quick Deploy on `main`.
Deploy script and nginx snippet: [deploy/](deploy/).
