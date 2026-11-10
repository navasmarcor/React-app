# React App

React App helps student-athletes get recruited by boarding schools and colleges. Athletes build one profile with their marks, race videos, grades and photos, see which schools fit them, get advice on what to improve, and email coaches a link to their profile. The app works in English, Spanish and French, in light and dark mode, on iPhone, Android and the web.

## What is in this version

- **Sign up and log in** with email. The Apple and Google buttons are in place and connect once online accounts are added.
- **Home**: profile strength, next steps, school matches by Likely, Target and Reach, and emails sent.
- **Profile**: personal info, personal bests, race videos, grades with conversion to the U.S. 4.0 scale, track and everyday photos, and what the athlete is looking for.
- **Schools**: a fit score for each school (marks 45%, grades 30%, eligibility 15%, preferences 10%) and a form to add your own schools.
- **Advice**: changes ranked by how many schools each one would add.
- **Email**: a ready-to-send email for each school with the profile link, opened in the athlete's own email app, plus a reply tracker.
- **Coach page** (`/p/<name>`): what a coach sees, with marks and video first.

Data is saved on the device for now. The school list and its standards are sample data.

## Run it

You need Node.js 20 or newer.

```bash
npm install
npx expo start
```

Then scan the QR code with the Expo Go app on your phone, or press `w` to open it in a browser.

## Checks

```bash
npm run typecheck
npm run lint
```

## Project layout

- `src/app/` screens. Every file is a route.
- `src/components/` shared building blocks.
- `src/lib/` colors, translations, school scoring, email text and saved data.
- `assets/images/` app icon, splash screen and logo.

## Next steps

1. Online accounts and storage with Supabase, so the coach link opens for anyone.
2. Real school list and verified results.
3. App Store and Google Play builds with EAS.
