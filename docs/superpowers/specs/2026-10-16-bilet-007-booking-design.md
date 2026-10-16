# Bilet 007 — Xizmatga oldindan yozilish (viloyat bosqichi)

Date: 2026-10-16. Stage: hududiy (viloyat), 120 minutes. Track: "Eng yaxshi veb-sayt".

## Intent

A barbershop booking site. A client sees three services with duration and price, picks a service, a time slot and enters a name, presses "Yozilish", and sees a confirmation with name, service, date, time and price. "Qayta tanlash" returns to the form with the previous values kept.

It is a test project: no real booking, payment, SMS or admin. The site must score well on the contest sheet: working mandatory flow (30), content fit (20), UX (10), presentation (10), tooling evidence (20), creativity (10).

## Goals

- All five ticket requirements and all three acceptance checks pass exactly as written.
- Three equal-weight screens (hududiy scope: at least 3 pages, 2 linked actions, invalid-input check, visible result).
- Usable at 390, 768 and 1366 px widths with no horizontal scroll.
- Uzbek (Latin) copy everywhere: labels, buttons, error messages.
- One memorable hero moment; everything else quiet.
- Tests prove the acceptance checks. Git history and a README prove the process.

## Non-goals

- Slot locking, multiple clients, SMS, payment, admin panel, backend, database, auth.
- Date picking. The ticket fixes the test date at 20.11.2026; the form shows it read-only.
- Chatbot or any AI feature in the site.

## Anti-goals

- A form that looks done but a button that does nothing.
- Extra features that distract from the mandatory flow.
- Generic SaaS card grid with gradient accent.
- Secrets, API keys or external services in the code.

## Data (fixed, from the ticket)

| ID  | Xizmat                     | Davomiylik | Narx       |
|-----|----------------------------|-----------:|-----------:|
| S01 | Soch olish                 | 30 daqiqa  | 50 000 so'm |
| S02 | Soch turmaklash            | 60 daqiqa  | 80 000 so'm |
| S03 | Soqolni tartibga keltirish | 30 daqiqa  | 30 000 so'm |

Time slots for every service: 10:00, 12:00, 14:00. Date: 20.11.2026.

## Acceptance checks (verbatim intent)

1. S01 + 12:00 + name "Sinovchi 01" → confirmation shows "Soch olish", "20.11.2026", "12:00", "50 000 so'm".
2. No time chosen, or empty name → no confirmation; a clear Uzbek error per missing field.
3. "Qayta tanlash" → form; choose S02 + 14:00 → new confirmation shows "80 000 so'm" and "14:00".

## Screens

Three routes, one SPA, client-side router.

1. `/` — Bosh sahifa. Hero with the portal reveal and the wordmark. Below it the three services as a horizontal "deck" on desktop, stacked on mobile, each with duration, price and a "Yozilish" button that opens the form with that service preselected.
2. `/yozilish` — Yozilish shakli. Fields: Xizmat (radio cards, S01–S03), Vaqt (segmented 10:00 / 12:00 / 14:00), Ism (text), Sana (read-only 20.11.2026, labelled as the test day). Submit "Yozilish". A note that this is a test form.
3. `/tasdiq` — Tasdiq. A receipt-style card: Ism, Xizmat, Sana, Vaqt, Narx. Buttons: "Qayta tanlash" (back to `/yozilish` with values kept) and "Bosh sahifa". If opened with no booking, redirect to `/yozilish`.

Validation runs on submit. Errors show under the field in Uzbek: "Ismingizni kiriting", "Xizmatni tanlang", "Vaqtni tanlang". Name is trimmed; whitespace-only counts as empty.

## Visual direction

Subject: a barbershop. Audience: walk-in clients on a phone. Primary job: book in under a minute.

- Brand: wordmark "SARTAROSH" with a period. Tagline "Xizmatga oldindan yozilish".
- Palette: near-black ground `#0f0e0c`, bone text `#ebe4d8`, amber accent `#e9a23b` (primary action), teal `#2f9c8f` (success, confirmation), muted `#8b857b`.
- Type: display condensed (Bebas Neue, bundled via @fontsource) for wordmark and headings; Manrope (variable, bundled) for body and UI. Bundled fonts so the demo does not depend on the network.
- Hero (the one orchestrated moment): on load two dark panels part left and right, uncovering a full-bleed visual, while the wordmark scales up and its tracking tightens. The visual is a generated amber-to-teal gradient with grain (CSS/SVG), so no licensed photo is needed; `public/hero.jpg` can replace it later. Respects `prefers-reduced-motion`: no panel motion, final state shown.
- Scroll: services deck fades and rises once when it enters view. Nothing else moves on scroll.
- Form and confirmation: quiet, high contrast, large tap targets, visible focus rings, keyboard operable.
- No eyebrow labels, no one-highlighted-word headlines, no decorative dividers.

## Stack (my call)

- Vite 6 + React 19 + TypeScript.
- Mantine 8 core, @mantine/form, @mantine/hooks. Mantine UI (ui.mantine.dev) patterns for inputs and cards, restyled with the palette above.
- react-router 7 for the three routes.
- Vitest + @testing-library/react + jsdom for tests.
- @fontsource/bebas-neue, @fontsource-variable/manrope.
- Git from the first commit; one commit per task.

## Code shape (my call)

- `src/data/services.ts` — services, slots, date constant.
- `src/lib/booking.ts` — pure functions: `validateBooking`, `formatPrice`, `buildConfirmation`. Unit-tested first.
- `src/state/BookingContext.tsx` — draft form values and the confirmed booking, mirrored to `sessionStorage` so a refresh on `/tasdiq` keeps the result.
- `src/pages/Home.tsx`, `src/pages/BookingForm.tsx`, `src/pages/Confirmation.tsx`.
- `src/components/PortalHero.tsx`, `src/components/ServiceDeck.tsx`, `src/components/SiteHeader.tsx`.
- `src/theme.ts` — Mantine theme with palette and fonts.
- Tests: `src/lib/booking.test.ts`, `src/pages/booking-flow.test.tsx` (the three acceptance checks end to end through the router).

## Submission package

- `README.md`: run instructions (`npm install`, `npm run dev`, `npm run build`, `npm test`), participant code placeholder, ticket number, feature list mapped to ticket items, test results, tools used, known limits.
- `docs/PROMPTS.md`: key prompts and decisions in order.
- `docs/screenshots/`: 390, 768, 1366 captures of each screen (taken at verification).
- Folder name on delivery: `hududiy_<ishtirokchi-kodi>_007`.

## Left to the builder

- Exact easing and durations of the portal reveal (target under 1.4 s total).
- Radio-card vs select for service on mobile, as long as all three are visible without scrolling inside the control.
- Header: wordmark left, two links (Xizmatlar, Yozilish) right; collapse to wordmark plus one "Yozilish" button under 768 px.
