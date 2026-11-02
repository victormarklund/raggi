# Raggi

A calm row counter for knitting and crochet. Svelte 5 + Vite, stored entirely in
`localStorage`, works offline via a service worker and installs to the iOS home screen.

## Run

```sh
# development (HMR on http://localhost:5173)
docker compose -f docker-compose.dev.yml up --build

# production (nginx on http://localhost:8080)
docker compose up --build -d
```

Ports and bind addresses are configurable: `cp .env.example .env` and edit
(`RAGGI_PORT`, `RAGGI_BIND`, `RAGGI_DEV_PORT`, `RAGGI_DEV_ALLOWED_HOSTS`, …).

Without Docker: `npm install`, then `npm run dev`.

> Service workers and "Add to Home Screen" require **HTTPS** (or `localhost`).
> To test on an iPhone, put the production container behind a TLS reverse proxy
> (Caddy, Traefik, Cloudflare Tunnel …) or use a tunnel such as `cloudflared` in dev.

### Firebase Hosting

The same bundle can be served from Firebase Hosting (HTTPS included, so the
service worker and "Add to Home Screen" work out of the box). `firebase.json`
mirrors the nginx caching rules: `sw.js`, `index.html` and the manifest are
never cached, hashed `/assets/*` are cached forever.

```sh
# one-time: set your project id in .firebaserc (or: npx firebase-tools use --add)
npx firebase-tools login

npm run firebase:serve     # local hosting emulator on http://localhost:5050 (no login needed)
npm run firebase:preview   # temporary preview URL (expires after 7 days)
npm run firebase:deploy    # publish to your live site
```

> **Choose the final domain before sharing the app.** Projects live in each
> user's `localStorage`, which is tied to the exact origin. `<id>.web.app`,
> `<id>.firebaseapp.com` and any custom domain each have *separate* data, so
> pick one, link only to that one, and add a custom domain *before* people
> start using it — moving later means users start with an empty list.

#### Automatic deploys (GitHub Actions)

- `.github/workflows/firebase-deploy.yml`: on every push to `main`, run the type check
  and unit tests, then build and deploy to the **live** site.
- `.github/workflows/firebase-preview.yml`: on every pull request, run the type check,
  unit tests and WebKit E2E test, then deploy to a **preview channel** (expires after
  7 days) and comment its URL on the PR.

Both need a repository secret named `FIREBASE_SERVICE_ACCOUNT`: the JSON key of a
service account in the Firebase project with these roles:

- Firebase Hosting Admin
- Service Usage Consumer (the CLI checks that the Hosting API is enabled)
- Firebase Authentication Admin (preview channels register their domains)
- Cloud Run Viewer, API Keys Viewer

Hosting must be enabled once in the Firebase console (Hosting → Get started).
The project comes from `.firebaserc`.

To run the E2E suite against an already-running server (e.g. the emulator):
`E2E_BASE_URL=http://localhost:5050 npm run e2e`.

## Scripts

| command          | what                                                   |
| ---------------- | ------------------------------------------------------ |
| `npm run dev`    | Vite dev server                                        |
| `npm run build`  | Production build + service worker (`dist/`)            |
| `npm run check`  | svelte-check / TypeScript                              |
| `npm test`       | Vitest unit tests (reminder logic, storage)            |
| `npm run e2e`    | Playwright smoke test in WebKit (iPhone 15 profile)    |
| `npm run icons`  | Regenerate icons + iOS splash screens from the sprite  |
| `npm run firebase:serve`   | Build + Firebase hosting emulator (:5050)     |
| `npm run firebase:preview` | Build + deploy to a 7-day preview channel     |
| `npm run firebase:deploy`  | Build + deploy to the live Firebase site      |

## Structure

- `src/lib/` – data model, storage (`raggi:v1` key, versioned `migrate`), runes store,
  pure reminder logic, router, wake lock, haptics, motion helpers
- `src/components/Counter.svelte` – the self-contained counter card
- `src/components/pixel/` – sprite grids (`sprites.ts`) rendered as crisp SVG
- `src/screens/` – Home (project list) and Project (stacked counters)

## Notes

- **Reminders:** "In X" fires once at `count + X`; "Every X" repeats. Undo (−) re-arms them.
  The last 3 reminder texts are offered as quick picks.
- **Keep awake:** the sun/moon in the project header. Uses the Screen Wake Lock API, with a
  muted looping video fallback for older iOS home-screen apps.
- **Haptics:** `navigator.vibrate` where available, and the iOS 18+ `<input switch>` trick in Safari.
