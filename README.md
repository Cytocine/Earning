# Earnings Wire — PWA

A dual-timeframe (1H/1D) confluence scanner, packaged as an installable PWA.

## Files

```
index.html          the app (was scanner_mobile.html)
manifest.json        PWA manifest (name, icons, theme)
sw.js                 service worker — caches the app shell only
icons/
  icon-192.png
  icon-512.png
  icon-512-maskable.png
  apple-touch-icon.png
.nojekyll             tells GitHub Pages not to run Jekyll on this repo
```

Live market data (Alpaca) and Google Fonts are deliberately excluded from
the service worker cache — they're always fetched fresh over the network,
so quotes are never stale and your API keys never get cached to disk.

## Deploy to GitHub Pages

1. Create a new repo (e.g. `earnings-wire`) and push these files to the
   root of the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Earnings Wire PWA"
   git branch -M main
   git remote add origin https://github.com/<you>/earnings-wire.git
   git push -u origin main
   ```
2. In the repo: **Settings → Pages → Build and deployment → Source** → set
   to **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Your app will be live at `https://<you>.github.io/earnings-wire/`.

Note: because the site is served from a subpath (`/earnings-wire/`), the
relative paths in `manifest.json`, `sw.js`, and `index.html` (`./`,
`icons/...`) work as-is — don't change them to absolute `/` paths or the
icons/manifest will 404 on GitHub Pages.

## Deploy to Cloudflare Pages

**Option A — connect the GitHub repo (recommended, auto-deploys on push):**
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the `earnings-wire` repo.
3. Build settings: **Framework preset: None**, **Build command: (leave empty)**,
   **Build output directory: `/`**.
4. Deploy. You'll get a `https://earnings-wire.pages.dev` URL, and every
   push to `main` redeploys automatically.

**Option B — drag-and-drop (no repo needed):**
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Upload assets**.
2. Drag the whole project folder in and deploy.

Cloudflare Pages serves from the domain root, so no path adjustments needed.

## Installing on your phone

- **iOS (Safari):** open the URL → Share → *Add to Home Screen*.
- **Android (Chrome):** open the URL → menu (⋮) → *Install app* /
  *Add to Home screen*.

Once installed it opens full-screen (no browser chrome), uses the
candlestick icon, and the app shell loads instantly from cache even on a
flaky connection — only the live bar data needs a network hit.

## Updating

Bump `CACHE_VERSION` in `sw.js` (e.g. `ew-shell-v2`) whenever you change
`index.html`/`manifest.json`/icons, so installed clients pick up the new
shell instead of serving a stale cached copy.

## API keys

Alpaca Key ID/Secret are entered in the UI and stored in the browser's
`localStorage` on-device — they are never bundled into these files, so it's
safe to commit this repo publicly.
