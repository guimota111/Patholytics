# Patholytics

Precision tools for pathologists — scoring, staging and differential support.

This repository currently holds the **foundation only**: authentication, layout,
internationalisation and route structure. No tool logic is implemented yet; each
tool ships in its own change.

## Stack

| Concern    | Choice                                      |
| ---------- | ------------------------------------------- |
| Build      | Vite 7 + React 19 + TypeScript              |
| Styling    | Tailwind CSS v4 (CSS-first tokens)          |
| Routing    | React Router 7                              |
| i18n       | i18next + react-i18next (`en`, `pt-BR`)     |
| Icons      | Lucide                                      |
| Auth/data  | Firebase Auth + Firestore (client-side)     |
| Hosting    | Firebase Hosting (static SPA)               |

Vite rather than Next.js: every screen resolves client-side after
`onAuthStateChanged`, so there is no server rendering to gain — and on Firebase
Hosting, SSR would mean App Hosting or Cloud Functions. A static `dist/` with a
single SPA rewrite is the smaller, cheaper, faster deploy. The trade-off is that
the landing page is client-rendered; its metadata is static in `index.html`, and
prerendering can be added for `/` alone if organic search becomes a priority.

## Getting started

```bash
npm install
cp .env.example .env     # fill in the Firebase values — see below
npm run dev
```

Until `.env` is filled in, the app runs and the landing page renders; the auth
screens show a setup notice instead of a broken sign-in form.

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`,
`npm run typecheck`.

No lockfile is committed yet, so the first `npm install` resolves the ranges in
`package.json` and writes one. Commit the `package-lock.json` it produces to pin
the tree for CI and deploys.

## Firebase setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method**: enable **Email/Password** and **Google**.
3. **Firestore Database**: create a database (production mode).
4. **Project settings → Your apps → Web app**: register an app and copy the
   config values into `.env`:

   | `.env` key                          | Firebase config field |
   | ----------------------------------- | --------------------- |
   | `VITE_FIREBASE_API_KEY`             | `apiKey`              |
   | `VITE_FIREBASE_AUTH_DOMAIN`         | `authDomain`          |
   | `VITE_FIREBASE_PROJECT_ID`          | `projectId`           |
   | `VITE_FIREBASE_STORAGE_BUCKET`      | `storageBucket`       |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId`   |
   | `VITE_FIREBASE_APP_ID`              | `appId`               |
   | `VITE_FIREBASE_MEASUREMENT_ID`      | `measurementId`       |

5. Put the same project id in `.firebaserc` (replacing the placeholder).
6. **Authentication → Settings → Authorized domains**: add the hosting domain
   (`<project>.web.app`) and any custom domain, or Google sign-in will be
   rejected in production.

`measurementId` is optional and drives Google Analytics. Leave it empty and the
Analytics SDK is never imported — no chunk fetched, no tracking. Set it and
analytics cookies start on the public landing page, which is the point at which
a consent notice becomes a question worth answering for EU/LGPD visitors.

These values ship in the client bundle — that is expected for Firebase web
apps. Access is controlled by `firestore.rules` and Auth, not by hiding keys.

Deploy `firestore.rules` before the first real sign-in. A database created in
production mode denies every write until then, so the `users/{uid}` document
can't be created and profiles stay empty (the app still loads — the failure is
logged, not fatal).

## Deploy

```bash
npm run build
npx firebase-tools deploy --only hosting,firestore:rules
```

`firebase.json` serves `dist/`, rewrites all paths to `index.html` for the SPA,
and caches hashed assets for a year while keeping `index.html` uncached.

## Firestore data model

The profile document plus the case organiser's own collections. Other tools
keep their state in the browser; the organiser does not, because its data is
accumulated over weeks and read from both phone and desktop.

```
users/{uid}
  email        string | null    mirrored from the auth record
  displayName  string           editable in /profile
  photoURL     string | null    from Google sign-in, when present
  language     'en' | 'pt-BR'   preferred locale, applied on every device
  plan         'free'           placeholder until billing exists
  createdAt    timestamp        server-set on creation
  updatedAt    timestamp        server-set on every write
```

The document is created lazily on first authenticated load (`ensureUserProfile`)
rather than only during e-mail sign-up, because Google sign-in has no separate
sign-up step. `firestore.rules` restricts a document to its owner and allows a
client to write only `displayName`, `language`, `photoURL` and `updatedAt` — so
nobody can grant themselves a paid plan before billing is wired up.

The case organiser adds two collections underneath the same user document.
Everything in them is user-defined — the stage names, their colours, the label
the identifier field carries — so the rules are deliberately wide: the owner
reads and writes, nobody else touches it, and no field is reserved.

```
users/{uid}/caseLists/{listId}
  name             string           shown in the list switcher
  stages           array            { id, name, color, emoji } — up to 10, ordered
  identifierLabel  string           'FAP', 'Accession'… empty falls back to "Code"
  showReviewCheck  boolean          the tick with a timestamp on each row
  order            number           position in the switcher
  createdAt/updatedAt timestamp     server-set

users/{uid}/caseLists/{listId}/cases/{caseId}
  title        string        free text — the organiser never requires a patient name
  identifier   string        optional, and never enforced as unique
  stageId      string        points at one of the list's stages
  tags         string[]      free labels, autocompleted from the ones already used
  deadline     number | null milliseconds; drives the countdown
  archived     boolean       archiving is independent of the stage, so reopening
  archivedAt   number | null   restores the case exactly where it was
  pending      { text, since } | null   blocked marker, valid in any stage
  log          array         { text, ts } append-only, newest shown on the row
  notes        string        long free text
  order        number        manual position, in steps of 1000
  reviewed     boolean       cleared on archive
  reviewedAt   number | null
  createdAt/updatedAt timestamp
```

Stages live on the list rather than on the user: two lists rarely share a
workflow, which is the whole reason to have more than one. That is also why
moving a case between lists asks which stage it lands in — there is no
automatic equivalence between two different workflows.

## Project layout

```
src/
  components/     UI primitives (ui/), tool card, guards, language switcher
  contexts/       AuthProvider — session, profile, auth actions
  data/tools.ts   tool + category registry (the file you edit to ship a tool)
  hooks/          useAuth, useDismiss
  i18n/           i18next setup and locale JSON
  layouts/        MarketingLayout, AppLayout, AuthLayout
  lib/            firebase, firestore, analytics, auth error mapping, helpers
  pages/          Landing, Login, Signup, ResetPassword, Dashboard, Profile
  services/       Firestore access (userProfile)
  tools/          one folder per tool — logic, storage and its own components
```

## Adding a tool later

1. Build the page under `src/pages/tools/`.
2. Add a route inside the authenticated block in `src/App.tsx`.
3. In `src/data/tools.ts`, set the entry's `status` to `'available'` and give it
   a `path`. The card stops being greyed out and becomes a link — the dashboard
   needs no other change.
4. Add `tools.<key>.name` / `.description` to both locale files.

## Design system

Dark-first, defined as tokens in `src/index.css`:

- ground `#0A0E14`, surfaces `#0F141C` / `#121821` / `#171E29`
- hairlines `#1E2632`, text `#E6EAF0` with muted `#8A94A6` and faint `#5C6678`
- accent electric violet `#7C5CFF`, used only on CTAs, active links and numeric
  highlights
- Inter for prose, JetBrains Mono for every number, score, stage and identifier
  (the `.tabular` utility)

## Scope note

Not implemented on purpose: tool logic, billing/Stripe, backend services. The
profile page reserves the plan section; nothing is wired to a payment provider.
