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

It is designed for an iPad in landscape (1194 x 834), the size of the Figma frames, and adapts to iPad portrait and phones. The breakpoints are listed at the top of `src/pages/app/app.css` and explained in the style guide.

## Live demo

Every push to `main` deploys the prototype and the style guide to GitHub Pages (`.github/workflows/deploy-pages.yml`):

- App: https://aloiferm-cmu-s26.github.io/careflow-mvp/app/
- Style guide: https://aloiferm-cmu-s26.github.io/careflow-mvp/style-guide/

The landing page is not deployed there, because its live copy on Cloudflare Pages sends analytics and signups to the team's real Google properties.

## Style guide

The style guide is a page of this project: run `npm run dev` and open http://localhost:5173/style-guide/. The live copy is at https://aloiferm-cmu-s26.github.io/careflow-mvp/style-guide/. It covers the logo, colors, typography, layout and spacing, buttons, icons, tags, cards, tables, menus, forms, dialogs and the design patterns. Each example is drawn by the CSS shown under it (`src/pages/style-guide/components.css`), and colors come from the app's tokens in `src/pages/app/app.css`. A one-page summary for Jama is in `docs/style-guide-one-pager.md`.

## Limitations

The MVP prototype is a front-end demo:

- **Hard-coded data.** The four patients, Alex's records, the Live Chart conversation, the physician's reply and the Companion's answers are fixed scripts in the code.
- **No backend.** Nothing is saved. A page refresh keeps the current screen but resets all progress.
- **No real integrations.** The phone tap, pharmacy and hospital records, speech-to-text, physician messaging and the AI Companion are simulated.
- **One full patient flow.** Only Alex Morgan has every step. Other patients open screens with Alex's content.
- **Designs exist only for tablet landscape.** The iPad portrait and phone layouts were derived from them and have not been through a usability test.

## Configuration

Everything that changes per deployment is in `src/config.ts`: the Google Analytics ID, the video link, the site URL and the signup form. With no form connected, the signup flow runs without saving anything.

## Stack

React, TypeScript and Vite, with CSS Modules. Tests use Vitest and Testing Library. The page is a static build, so any static host works.
