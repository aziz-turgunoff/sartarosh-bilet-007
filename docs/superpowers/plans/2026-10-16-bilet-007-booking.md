# Bilet 007 Booking Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A three-screen barbershop booking SPA that passes the ticket's three acceptance checks, with tests, git history and a README for the contest jury.

**Architecture:** Vite + React SPA with three react-router routes (`/`, `/yozilish`, `/tasdiq`). Pure booking logic in `src/lib/booking.ts` (unit-tested), draft and confirmation held in a React context mirrored to `sessionStorage`. Mantine supplies inputs, layout and theming; a custom `PortalHero` provides the one animated moment.

**Tech Stack:** Vite, React 19, TypeScript, Mantine (core, form, hooks), react-router, Vitest + @testing-library/react + jsdom, @fontsource/bebas-neue, @fontsource-variable/manrope.

**Spec:** `docs/superpowers/specs/2026-10-16-bilet-007-booking-design.md`

## Global Constraints

- Project root is the repo root `C:\Users\azizbek\Desktop\claude\media_comp\ustoz-ai` (existing `docs/` stays). Git is initialised in Task 1; every task ends with a commit.
- All user-facing copy in Uzbek Latin. Errors exactly: `Ismingizni kiriting`, `Xizmatni tanlang`, `Vaqtni tanlang`.
- Price format exactly `50 000 so'm` (space thousands separator, straight apostrophe).
- Date constant exactly `20.11.2026`, shown read-only, labelled `Sana (sinov kuni)`.
- Services and slots exactly as in the spec table. No other slots, no backend, no secrets, no network calls at runtime (fonts bundled).
- Works at 390, 768 and 1366 px with no horizontal page scroll.
- `prefers-reduced-motion: reduce` disables the hero animation.
- Node 24, npm 11. Use `npm install` with caret ranges; do not pin to versions you have not verified exist.

## Review Focus

1. Name of only spaces (`"   "`) must fail with `Ismingizni kiriting` — test in Task 2.
2. Opening `/tasdiq` directly with no booking must redirect to `/yozilish`, not crash — test in Task 4.
3. Refreshing `/tasdiq` after a booking must still show the confirmation (sessionStorage) — test in Task 3.
4. Changing service after a confirmation then re-submitting must show the new price, not the old one — covered by acceptance check 3 in Task 4.
5. A corrupt `sessionStorage` value must not crash the app; context falls back to empty draft — test in Task 3.

---

### Task 1: Scaffold, theme, test harness, git

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/theme.ts`, `src/test/setup.ts`, `src/App.test.tsx`, `postcss.config.cjs`

**Interfaces:**
- Produces: `theme` (MantineThemeOverride) in `src/theme.ts`; `App` renders `<MantineProvider theme={theme}>` + `<BrowserRouter>` + `<Routes>`; `src/test/setup.ts` installs `window.matchMedia`, `ResizeObserver`, and `@testing-library/jest-dom` matchers.

- [ ] **Step 1: Init git and write package.json**

Scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `test` (`vitest run`), `test:watch`. Dependencies: `react`, `react-dom`, `react-router`, `@mantine/core`, `@mantine/form`, `@mantine/hooks`, `@fontsource/bebas-neue`, `@fontsource-variable/manrope`. Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `postcss`, `postcss-preset-mantine`, `postcss-simple-vars`, `@types/react`, `@types/react-dom`.

Run: `git init && npm install`

- [ ] **Step 2: Write the failing smoke test `src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the wordmark', () => {
  render(<App />);
  expect(screen.getByText(/SARTAROSH/i)).toBeInTheDocument();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (module not found or no such text).

- [ ] **Step 4: Implement scaffold**

`vite.config.ts`: react plugin, `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true, css: false }`.
`src/test/setup.ts`: import jest-dom; define `window.matchMedia` returning `{ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}, dispatchEvent(){ return false } }`; define `ResizeObserver` stub class.
`src/theme.ts`: `createTheme({ fontFamily: "'Manrope Variable', sans-serif", headings: { fontFamily: "'Bebas Neue', sans-serif" }, primaryColor: 'amber', colors: { amber: [...10 shades around #e9a23b], teal: [...10 shades around #2f9c8f] }, defaultRadius: 'md' })`. Force dark scheme via `MantineProvider forceColorScheme="dark"`.
`src/App.tsx`: providers + `<Routes><Route path="/" element={<h1>SARTAROSH.</h1>} /></Routes>` as placeholder. `src/main.tsx` imports `@mantine/core/styles.css`, both fontsource packages, and renders `<App />`.
`index.html`: `<html lang="uz">`, title `SARTAROSH — Xizmatga oldindan yozilish`, viewport meta.

- [ ] **Step 5: Run test to verify it passes, and build**

Run: `npx vitest run && npm run build`
Expected: 1 passed; `dist/` produced with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + Mantine with Vitest harness"
```

---

### Task 2: Service data and pure booking logic

**Files:**
- Create: `src/data/services.ts`, `src/lib/booking.ts`
- Test: `src/lib/booking.test.ts`

**Interfaces:**
- Produces, in `src/data/services.ts`:
  - `export type ServiceId = 'S01' | 'S02' | 'S03'`
  - `export interface Service { id: ServiceId; name: string; durationMin: number; price: number }`
  - `export const SERVICES: readonly Service[]` (S01 Soch olish 30 50000; S02 Soch turmaklash 60 80000; S03 Soqolni tartibga keltirish 30 30000)
  - `export const TIME_SLOTS = ['10:00', '12:00', '14:00'] as const; export type TimeSlot = (typeof TIME_SLOTS)[number]`
  - `export const BOOKING_DATE = '20.11.2026'`
- Produces, in `src/lib/booking.ts`:
  - `export interface BookingDraft { name: string; serviceId: ServiceId | null; time: TimeSlot | null }`
  - `export const EMPTY_DRAFT: BookingDraft`
  - `export type BookingErrors = Partial<Record<keyof BookingDraft, string>>`
  - `export function validateBooking(draft: BookingDraft): BookingErrors` (empty object = valid)
  - `export function formatPrice(amount: number): string`
  - `export interface Confirmation { name: string; serviceId: ServiceId; serviceName: string; durationMin: number; date: string; time: TimeSlot; price: number; priceLabel: string }`
  - `export function buildConfirmation(draft: BookingDraft): Confirmation` (throws `Error('invalid draft')` if `validateBooking` is non-empty)

- [ ] **Step 1: Write failing tests `src/lib/booking.test.ts`**

```ts
import { validateBooking, formatPrice, buildConfirmation, EMPTY_DRAFT } from './booking';

test('formatPrice uses space thousands and so\'m', () => {
  expect(formatPrice(50000)).toBe("50 000 so'm");
  expect(formatPrice(80000)).toBe("80 000 so'm");
  expect(formatPrice(30000)).toBe("30 000 so'm");
});

test('empty draft fails all three fields in Uzbek', () => {
  expect(validateBooking(EMPTY_DRAFT)).toEqual({
    name: 'Ismingizni kiriting', serviceId: 'Xizmatni tanlang', time: 'Vaqtni tanlang',
  });
});

test('whitespace-only name fails', () => {
  expect(validateBooking({ name: '   ', serviceId: 'S01', time: '12:00' })).toEqual({ name: 'Ismingizni kiriting' });
});

test('missing time alone fails', () => {
  expect(validateBooking({ name: 'Sinovchi 01', serviceId: 'S01', time: null })).toEqual({ time: 'Vaqtni tanlang' });
});

test('acceptance check 1: S01 12:00 Sinovchi 01', () => {
  const c = buildConfirmation({ name: 'Sinovchi 01', serviceId: 'S01', time: '12:00' });
  expect(c).toMatchObject({ name: 'Sinovchi 01', serviceName: 'Soch olish', date: '20.11.2026', time: '12:00', priceLabel: "50 000 so'm" });
});

test('buildConfirmation trims the name and throws on invalid draft', () => {
  expect(buildConfirmation({ name: '  Ali ', serviceId: 'S02', time: '14:00' }).name).toBe('Ali');
  expect(() => buildConfirmation(EMPTY_DRAFT)).toThrow('invalid draft');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/booking.test.ts`
Expected: FAIL, module `./booking` not found.

- [ ] **Step 3: Implement `src/data/services.ts` and `src/lib/booking.ts`**

`formatPrice`: group digits by 3 with a normal space, append ` so'm`. Validation order of keys: name, serviceId, time.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/booking.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/data src/lib
git commit -m "feat: service data and pure booking validation/confirmation"
```

---

### Task 3: Booking context with sessionStorage

**Files:**
- Create: `src/state/BookingContext.tsx`
- Test: `src/state/BookingContext.test.tsx`

**Interfaces:**
- Consumes: Task 2 types and functions.
- Produces:
  - `export function BookingProvider({ children }: { children: ReactNode })`
  - `export function useBooking(): { draft: BookingDraft; updateDraft(patch: Partial<BookingDraft>): void; confirmation: Confirmation | null; confirm(): BookingErrors; clearConfirmation(): void }` — `confirm()` validates the current draft; on success stores `buildConfirmation(draft)` and returns `{}`; on failure returns the errors and leaves `confirmation` unchanged.
  - Storage key `sartarosh.booking.v1`, JSON `{ draft, confirmation }` in `sessionStorage`; read once on mount inside `try/catch`, fallback `{ draft: EMPTY_DRAFT, confirmation: null }`.

- [ ] **Step 1: Write failing tests**

```tsx
import { renderHook, act } from '@testing-library/react';
import { BookingProvider, useBooking } from './BookingContext';

const wrapper = ({ children }) => <BookingProvider>{children}</BookingProvider>;
beforeEach(() => sessionStorage.clear());

test('confirm returns errors for empty draft and keeps confirmation null', () => {
  const { result } = renderHook(() => useBooking(), { wrapper });
  let errors;
  act(() => { errors = result.current.confirm(); });
  expect(errors).toEqual({ name: 'Ismingizni kiriting', serviceId: 'Xizmatni tanlang', time: 'Vaqtni tanlang' });
  expect(result.current.confirmation).toBeNull();
});

test('confirm stores confirmation and survives remount via sessionStorage', () => {
  const first = renderHook(() => useBooking(), { wrapper });
  act(() => first.result.current.updateDraft({ name: 'Sinovchi 01', serviceId: 'S01', time: '12:00' }));
  act(() => { first.result.current.confirm(); });
  first.unmount();
  const second = renderHook(() => useBooking(), { wrapper });
  expect(second.result.current.confirmation?.priceLabel).toBe("50 000 so'm");
  expect(second.result.current.draft.serviceId).toBe('S01');
});

test('corrupt storage falls back to empty state', () => {
  sessionStorage.setItem('sartarosh.booking.v1', '{not json');
  const { result } = renderHook(() => useBooking(), { wrapper });
  expect(result.current.draft.name).toBe('');
  expect(result.current.confirmation).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/state`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `src/state/BookingContext.tsx`**

`useState` initialised from storage via lazy initialiser; `useEffect` writes storage on every state change; `useBooking` throws `Error('useBooking outside BookingProvider')` when context is missing.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/state`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/state
git commit -m "feat: booking context with sessionStorage persistence"
```

---

### Task 4: Form and confirmation pages, routes, acceptance flow tests

**Files:**
- Create: `src/pages/BookingForm.tsx`, `src/pages/Confirmation.tsx`, `src/components/SiteHeader.tsx`, `src/components/ServiceOption.tsx`
- Modify: `src/App.tsx` (routes, `BookingProvider`)
- Test: `src/pages/booking-flow.test.tsx`

**Interfaces:**
- Consumes: Task 2 data, Task 3 `useBooking`.
- Produces:
  - Routes: `/` (placeholder until Task 5), `/yozilish` → `BookingForm`, `/tasdiq` → `Confirmation`, `*` → redirect `/`.
  - `BookingForm` reads `?xizmat=S0x` query on mount and calls `updateDraft({ serviceId })` when valid.
  - `Confirmation` renders `<Navigate to="/yozilish" replace />` when `confirmation` is null.
  - `SiteHeader` props: none. Wordmark `SARTAROSH.` links to `/`; links `Xizmatlar` (`/#xizmatlar`) and `Yozilish` (`/yozilish`); under 768 px only wordmark + `Yozilish` button.
  - `ServiceOption` props `{ service: Service; selected: boolean; onSelect(): void }` — a radio-card showing name, `30 daqiqa`, price label; role `radio`, `aria-checked`.
  - Test ids: `name-input`, `time-<slot>` (e.g. `time-12:00`), `service-<id>`, `submit-booking`, `confirm-card`, `reselect-button`.

- [ ] **Step 1: Write failing flow tests `src/pages/booking-flow.test.tsx`**

Render helper: `renderAt(path)` = `render(<MantineProvider theme={theme}><BookingProvider><MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter></BookingProvider></MantineProvider>)` — export `AppRoutes` (the `<Routes>` block) from `src/App.tsx` so tests can mount it without `BrowserRouter`. Use `userEvent.setup()`.

```tsx
test('check 1: S01 + 12:00 + Sinovchi 01 shows the confirmation', async () => {
  renderAt('/yozilish');
  await user.click(screen.getByTestId('service-S01'));
  await user.click(screen.getByTestId('time-12:00'));
  await user.type(screen.getByTestId('name-input'), 'Sinovchi 01');
  await user.click(screen.getByTestId('submit-booking'));
  const card = await screen.findByTestId('confirm-card');
  for (const t of ['Sinovchi 01', 'Soch olish', '20.11.2026', '12:00', "50 000 so'm"]) expect(card).toHaveTextContent(t);
});

test('check 2a: no time -> stays on form with Vaqtni tanlang', async () => {
  renderAt('/yozilish');
  await user.click(screen.getByTestId('service-S01'));
  await user.type(screen.getByTestId('name-input'), 'Sinovchi 01');
  await user.click(screen.getByTestId('submit-booking'));
  expect(screen.getByText('Vaqtni tanlang')).toBeInTheDocument();
  expect(screen.queryByTestId('confirm-card')).toBeNull();
});

test('check 2b: empty name -> Ismingizni kiriting', async () => { /* S01 + 12:00, no name */ });

test('check 3: Qayta tanlash then S02 + 14:00 shows 80 000 so\'m and 14:00', async () => {
  // complete check 1 flow, then:
  await user.click(screen.getByTestId('reselect-button'));
  expect(screen.getByTestId('name-input')).toHaveValue('Sinovchi 01');
  await user.click(screen.getByTestId('service-S02'));
  await user.click(screen.getByTestId('time-14:00'));
  await user.click(screen.getByTestId('submit-booking'));
  const card = await screen.findByTestId('confirm-card');
  expect(card).toHaveTextContent("80 000 so'm");
  expect(card).toHaveTextContent('14:00');
  expect(card).not.toHaveTextContent("50 000 so'm");
});

test('direct /tasdiq without booking redirects to the form', () => {
  renderAt('/tasdiq');
  expect(screen.getByTestId('submit-booking')).toBeInTheDocument();
});

test('?xizmat=S03 preselects the service', () => {
  renderAt('/yozilish?xizmat=S03');
  expect(screen.getByTestId('service-S03')).toHaveAttribute('aria-checked', 'true');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pages`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement pages, header, routes**

`BookingForm`: Mantine `Container size="sm"`, `Title` `Yozilish`, three `ServiceOption` in a `SimpleGrid cols={{ base: 1, sm: 3 }}` wrapped in a `role="radiogroup"` with `aria-label="Xizmat"`; time as `SegmentedControl`-like group of three `Button`s (each `role="radio"`, test id `time-<slot>`); `TextInput label="Ism" data-testid="name-input"`; read-only `TextInput label="Sana (sinov kuni)" value="20.11.2026"`; a `Text` note `Bu sinov shakli: haqiqiy yozilish amalga oshirilmaydi.`; submit `Button` `Yozilish`. On submit: `const errors = confirm(); if (Object.keys(errors).length === 0) navigate('/tasdiq'); else setErrors(errors)`. Errors render as Mantine `error` props / `Text c="red"` under each control, with `role="alert"` on the first error.
`Confirmation`: `Paper data-testid="confirm-card"` with a definition list of Ism, Xizmat, Sana, Vaqt, Narx; teal check mark heading `Yozilish qabul qilindi`; buttons `Qayta tanlash` (`navigate('/yozilish')`) and `Bosh sahifa`. Draft is not cleared on reselect.
`App.tsx`: export `AppRoutes`; default export wraps `MantineProvider` + `BookingProvider` + `BrowserRouter` + `SiteHeader` + `AppRoutes`.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: all passed (smoke test may need updating if `/` placeholder changed).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: booking form, confirmation page and routed acceptance flow"
```

---

### Task 5: Home page with portal hero and service deck

**Files:**
- Create: `src/pages/Home.tsx`, `src/components/PortalHero.tsx`, `src/components/PortalHero.module.css`, `src/components/ServiceDeck.tsx`, `src/components/ServiceDeck.module.css`
- Modify: `src/App.tsx` (`/` → `Home`), `src/App.test.tsx`
- Test: `src/pages/Home.test.tsx`

**Interfaces:**
- Consumes: `SERVICES`, `formatPrice`, router.
- Produces: `PortalHero` (no props), `ServiceDeck` (no props; section `id="xizmatlar"`, each card has `data-testid="deck-<id>"` and a `Yozilish` link to `/yozilish?xizmat=<id>`).

- [ ] **Step 1: Write failing tests `src/pages/Home.test.tsx`**

```tsx
test('lists three services with duration and price', () => {
  renderAt('/');
  for (const [id, name, dur, price] of [['S01','Soch olish','30 daqiqa',"50 000 so'm"],['S02','Soch turmaklash','60 daqiqa',"80 000 so'm"],['S03','Soqolni tartibga keltirish','30 daqiqa',"30 000 so'm"]]) {
    const card = screen.getByTestId(`deck-${id}`);
    for (const t of [name, dur, price]) expect(card).toHaveTextContent(t);
  }
});

test('deck Yozilish opens the form with the service preselected', async () => {
  renderAt('/');
  await user.click(within(screen.getByTestId('deck-S02')).getByRole('link', { name: 'Yozilish' }));
  expect(screen.getByTestId('service-S02')).toHaveAttribute('aria-checked', 'true');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pages/Home.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement hero, deck, home**

`PortalHero`: full-viewport section (`min-height: 100svh`), background layer = CSS gradient `radial-gradient` amber `#e9a23b` → teal `#2f9c8f` over `#0f0e0c` plus an SVG `feTurbulence` grain overlay at 8% opacity; two absolutely positioned panels (`left`, `right`, background `#0f0e0c`) animated with `@keyframes part-left { to { transform: translateX(-100%) } }` / `part-right`, `1.1s cubic-bezier(.77,0,.18,1) .2s forwards`; wordmark `SARTAROSH.` as `h1` with `font-size: clamp(3.5rem, 18vw, 16rem)`, `letter-spacing` animated from `0.12em` to `-0.02em` and `transform: scale(.85)` to `scale(1)` over the same duration; tagline `Xizmatga oldindan yozilish` and a `Yozilish` button (`component={Link} to="/yozilish"`) in the lower-left; small meta line lower-right `20.11.2026 · 10:00 — 14:00`. `@media (prefers-reduced-motion: reduce)` sets all animations to `none` and panels to their final translated state. Every text is `color: #ebe4d8` on the dark ground; wordmark overlays the gradient.
`ServiceDeck`: `Container` + `Title order={2}` `Xizmatlar`; `SimpleGrid cols={{ base: 1, md: 3 }}`; each card `Paper` with service name (Bebas Neue), duration, price (amber), `Button component={Link}` `Yozilish`. One-time reveal: `useIntersection` from `@mantine/hooks` toggles a `.visible` class that transitions `opacity 0→1, translateY 24px→0` over 500 ms; disabled under reduced motion.
`Home`: `<PortalHero /><ServiceDeck />`.

- [ ] **Step 4: Run all tests and build**

Run: `npx vitest run && npm run build`
Expected: all passed; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: home page with portal hero and service deck"
```

---

### Task 6: Responsive and accessibility verification in the browser

**Files:**
- Modify: any `*.module.css` / page files as needed for fixes
- Create: `docs/screenshots/*.png` (390, 768, 1366 × home, form, form-with-errors, confirmation)

- [ ] **Step 1: Start dev server and open in the built-in browser**

Run: `npm run dev` via the preview tool. Expected: app at `http://localhost:5173`.

- [ ] **Step 2: Check at 390, 768 and 1366 px**

For each width: no horizontal scroll (`document.documentElement.scrollWidth <= window.innerWidth`), hero wordmark fully visible, all three services visible, form controls not clipped. Run the three acceptance checks by hand once at 390 and once at 1366. Save screenshots to `docs/screenshots/`.

- [ ] **Step 3: Keyboard and focus**

Tab through the form: every control reachable, focus ring visible, Enter on `Yozilish` submits. Fix and re-run tests if anything changed.

- [ ] **Step 4: Reduced motion**

Emulate `prefers-reduced-motion: reduce` (browser tool `colorScheme` cannot; use the JS console: add class or check CSS applies via `matchMedia`). Confirm the hero shows its final state with no animation.

- [ ] **Step 5: Commit fixes and screenshots**

```bash
git add -A
git commit -m "chore: responsive and a11y verification, screenshots"
```

---

### Task 7: Submission package

**Files:**
- Create: `README.md`, `docs/PROMPTS.md`

- [ ] **Step 1: Write `README.md`**

Sections: title and ticket (`Bilet 007 — Viloyat bosqichi`); `Ishtirokchi kodi: ____`; run (`npm install`, `npm run dev`, `npm run build && npm run preview`, `npm test`); mandatory requirements 1–5 mapped to the component that implements each; acceptance checks 1–3 with the test name that proves each and the latest `npm test` output; tools used (Claude Code, Vite, React, Mantine, Vitest); known limits (no slot locking, no backend, fixed date, test form); delivery folder name `hududiy_<kod>_007`.

- [ ] **Step 2: Write `docs/PROMPTS.md`**

Chronological list of the key prompts and decisions: ticket intake, design spec, plan, each task, verification. Reference the spec and plan paths.

- [ ] **Step 3: Final verification**

Run: `npx vitest run && npm run build`
Expected: all passed; build succeeds. Paste the test summary into README.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: README and prompt log for submission"
```
