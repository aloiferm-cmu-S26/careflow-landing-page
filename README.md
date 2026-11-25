# CareFlow landing page

Landing page for CareFlow, a concept product for emergency room nurses.

Live site: https://careflow-ban.pages.dev/

CareFlow is a concept in development by a Carnegie Mellon student team. It is not available for clinical use, and the patient shown in the demo is fictional.

## Run it

```sh
npm install
npm run dev
```

Other scripts: `npm test`, `npm run lint`, `npm run build`.

## MVP prototype

A clickable version of the Figma file "CareFlow MVP prototype" lives at `/app/` (run `npm run dev` and open http://localhost:5173/app/). It follows one fictional patient, Alex Morgan, through the nurse's flow: dashboard, Patient History (tap to share records), Live Chart, Medication Review, the Nurse Companion panel and the visit summary. Everything is scripted in the browser. There is no backend and no real AI.

The code is in `src/pages/app/`:

- `shell/` holds the top bar, workspace rail and notifications that every screen shares.
- `state/` holds the patient data and app-wide state. Screens use hash routes like `#/patients/PT-00482/chart`, so the back button and deep links work.
- `features/<screen>/` holds one folder per screen, with its own assets and tests.

It is laid out for the iPad landscape size the designs use (1194 x 834) and needs at least 1024px of width.

## Configuration

Everything that changes per deployment is in `src/config.ts`: the Google Analytics ID, the video link, the site URL and the signup form. With no form connected, the signup flow runs without saving anything.

## Stack

React, TypeScript and Vite, with CSS Modules. Tests use Vitest and Testing Library. The page is a static build, so any static host works.
