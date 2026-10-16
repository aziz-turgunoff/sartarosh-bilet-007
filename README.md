# SARTAROSH — Xizmatga oldindan yozilish (Bilet 007, viloyat bosqichi)

Ishtirokchi kodi: ____

Sartaroshxona uchun oldindan yozilish sayti. Mijoz uchta xizmatdan birini, uchta vaqtdan birini tanlaydi, ismini kiritadi, kerak bo'lsa sanani o'zgartiradi (20.11.2026 oldindan tanlangan) va "Yozilish" tugmasini bosadi. Natijada ism, xizmat, sana, vaqt va narx ko'rsatilgan tasdiq chiqadi. "Qayta tanlash" orqali shaklga oldingi qiymatlar bilan qaytish mumkin.

Bu sinov loyihasi: haqiqiy yozilish, to'lov yoki xabar yuborish amalga oshirilmaydi. Backend yo'q, tarmoqqa murojaat yo'q, maxfiy kalitlar yo'q.

## Ishga tushirish

Talab: Node 24 va npm 11.

```bash
npm install                      # bog'liqliklarni o'rnatish
npm run dev                      # ishlab chiqish serveri (http://localhost:5173)
npm run build && npm run preview # ishlab chiqarish yig'masi va uni ko'rish
npm test                         # testlar (vitest run)
```

## Sahifalar

| Marshrut    | Sahifa | Fayl |
|-------------|--------|------|
| `/`         | Bosh sahifa: sarlavha va narxlar ro'yxati | `src/pages/Home.tsx` |
| `/yozilish` | Yozilish shakli (`?xizmat=S0x` bilan xizmat oldindan tanlanadi) | `src/pages/BookingForm.tsx` |
| `/tasdiq`   | Tasdiq chiptasi (yozilish bo'lmasa `/yozilish` ga qaytaradi) | `src/pages/Confirmation.tsx` |

Noma'lum manzil `/` ga yo'naltiriladi.

## Bilet talablari va ularni bajaruvchi kod

| # | Talab | Qayerda bajarilgan |
|---|-------|--------------------|
| 1 | 3 ta xizmatni davomiyligi va narxi bilan ko'rsatish | Ma'lumot: `src/data/services.ts` (S01 Soch olish, 30 daqiqa, 50 000 so'm; S02 Soch turmaklash, 60 daqiqa, 80 000 so'm; S03 Soqolni tartibga keltirish, 30 daqiqa, 30 000 so'm). Bosh sahifadagi narxlar ro'yxati: `src/components/ServiceDeck.tsx` (`deck-S01`, `deck-S02`, `deck-S03`; har birida `/yozilish?xizmat=<id>` ga "Yozilish" havolasi). Shakldagi xizmat tanlovi: `src/components/ServiceOption.tsx` (`service-S01`, `service-S02`, `service-S03`, `role="radio"`). |
| 2 | Tanlangan xizmat uchun 10:00, 12:00, 14:00 vaqtlarini tanlash | `src/pages/BookingForm.tsx`, "Vaqt" radiogroup (`time-10:00`, `time-12:00`, `time-14:00`). Vaqtlar ro'yxati `src/data/services.ts` da. |
| 3 | Ism maydoni; ism, xizmat va vaqt majburiy | Maydon: `src/pages/BookingForm.tsx` (`name-input`). Tekshiruv: `src/lib/booking.ts`, `validateBooking` (bo'sh yoki faqat probeldan iborat ism rad etiladi). Xato matnlari: "Ismingizni kiriting", "Xizmatni tanlang", "Vaqtni tanlang"; bo'sh yoki noto'g'ri sana uchun "Sanani tanlang". |
| 4 | "Yozilish" bosilganda tekshirish va natijani chiqarish | Tugma `submit-booking` (`src/pages/BookingForm.tsx`), keyin `confirm` (`src/state/BookingContext.tsx`), keyin `buildConfirmation` (`src/lib/booking.ts`). Xatolar maydon ostida chiqadi; xatosiz holatda `/tasdiq` ga o'tiladi. |
| 5 | Tasdiqda ism, xizmat, sana, vaqt, narx; "Qayta tanlash" bilan shaklga qaytish | `src/pages/Confirmation.tsx` (`confirm-card`, `reselect-button`). Sana shakldagi "Sana" maydonida tanlanadi (`date-input`, brauzerning sana tanlagichi); sinov uchun `20.11.2026` oldindan tanlangan (`DEFAULT_BOOKING_DATE`, `src/data/services.ts`). Tasdiqda sana `kun.oy.yil` ko'rinishida (`formatDate`, `src/lib/booking.ts`). Narx formati `formatPrice` orqali: `50 000 so'm`. Qayta tanlashda oldingi qiymatlar saqlanadi (`sessionStorage`). |

## Qabul sinovlari va ularni isbotlovchi testlar

| # | Biletdagi sinov | Test fayli | Test nomi |
|---|-----------------|------------|-----------|
| 1 | S01, 12:00, "Sinovchi 01" tanlansa, tasdiqda "Soch olish", 20.11.2026, 12:00 va 50 000 so'm chiqadi | `src/pages/booking-flow.test.tsx` | `check 1: S01 + 12:00 + Sinovchi 01 shows the confirmation` |
|   |  | `src/lib/booking.test.ts` | `acceptance check 1: S01 12:00 Sinovchi 01` |
| 2 | Vaqt tanlanmasa yoki ism bo'sh bo'lsa, yozilish tasdiqlanmaydi | `src/pages/booking-flow.test.tsx` | `check 2a: no time -> stays on form with Vaqtni tanlang` |
|   |  |  | `check 2b: empty name -> Ismingizni kiriting` |
|   |  |  | `check 2c: nothing chosen -> all three errors, fixing one field clears only that error` |
|   |  | `src/lib/booking.test.ts` | `empty draft fails all three fields in Uzbek`, `whitespace-only name fails`, `missing time alone fails` |
| 3 | Qayta tanlash orqali S02 va 14:00 yuborilsa, yangi tasdiqda 80 000 so'm va 14:00 ko'rinadi | `src/pages/booking-flow.test.tsx` | `check 3: Qayta tanlash then S02 + 14:00 shows 80 000 so'm and 14:00` |

Qo'shimcha testlar: `/tasdiq` ga yozilishsiz kirganda shaklga qaytarish, `?xizmat=` parametri (to'g'ri va noto'g'ri qiymat), klaviatura bilan boshqarish, radiogroup va oldindan tanlangan sana belgilari, boshqa sana tanlash, bo'sh sana xatosi, sanasiz eski qoralamani tiklash, `sessionStorage` orqali sahifa yangilanganda saqlanish, buzilgan `sessionStorage` dan tiklanish, sarlavha havolalari.

Test fayllari: `src/lib/booking.test.ts` (9), `src/state/BookingContext.test.tsx` (6), `src/pages/booking-flow.test.tsx` (15), `src/pages/Home.test.tsx` (2), `src/App.test.tsx` (1).

Natija: `npx vitest run — 5 fayl, 33 test (so'nggi to'liq yurgizish)`

## Dizayn konsepti — "Navbat chiptasi"

Sayt sartaroshxonadagi qog'oz navbat chiptasi sifatida ishlangan. Yagona bezak motivi — sekin sudralib yuruvchi sartarosh ustuni chizig'i (qizil, oq, ko'k). Bosh sahifada kartalar o'rniga oddiy narxlar ro'yxati: xizmat, davomiylik, narx va "Yozilish" havolasi bir qatorda. Yozilish shakli chiptani to'ldirishdek; tasdiq esa yirtib olingan chipta, ustida "QABUL QILINDI" muhri. Palitra: och qog'oz `#f4eee3`, siyoh `#17151a`, ustun qizili `#c8102e`, ustun ko'ki `#1d4e9e`, jez `#a8803f`. Harakat uchta lahzada: bosh sahifadagi chipta sichqoncha ortidan 3D egiladi (`src/components/TicketHero.tsx`, faqat `hover` va aniq ko'rsatkichli qurilmalarda), tanlangan xizmat yoki vaqt stubida teshik "teshiladi" (`ServiceOption.module.css`, `BookingForm.module.css`), tasdiq sahifasida "QABUL QILINDI" muhri chiptaga urilib tushadi (`Confirmation.module.css`). Barchasi faqat `transform`/`opacity` orqali; `prefers-reduced-motion` yoqilganda chiziq to'xtaydi, egilish va animatsiyalar o'chadi, yakuniy holat ko'rsatiladi. Shriftlar paketga qo'shilgan (`@fontsource`), shuning uchun demo tarmoqqa bog'liq emas. Sayt 390, 768 va 1366 px kengliklarda gorizontal aylantirishsiz ishlaydi.

## Ishlatilgan vositalar

- Claude Code — Claude Fable 5.1 (dizayn spetsifikatsiyasi, reja, kod, testlar, tekshiruv; promptlar `docs/PROMPTS.md` da)
- Vite (yig'ish), React 19, TypeScript
- Mantine 9 (`@mantine/core`, `@mantine/form`, `@mantine/hooks`)
- react-router 7 (`react-router` paketi)
- Vitest 5 + Testing Library + jsdom (testlar)
- Git (har bir bosqich alohida commit)

Asosiy hujjatlar: `docs/TICKET-007.md` (bilet matni), `docs/superpowers/specs/2026-10-16-bilet-007-booking-design.md` (dizayn spetsifikatsiyasi), `docs/superpowers/plans/2026-10-16-bilet-007-booking.md` (bajarish rejasi), `docs/PROMPTS.md` (promptlar jurnali).

## Ma'lum cheklovlar

- Vaqtlar band qilinmaydi: bir vaqtga istalgancha yozilish mumkin (bilet buni talab qilmaydi).
- Backend va ma'lumotlar bazasi yo'q; holat faqat brauzerning `sessionStorage` ida saqlanadi.
- Sana tanlanadi, `20.11.2026` (biletdagi sinov kuni) oldindan tanlangan; o'tgan sanalar rad etilmaydi, shunda sinov natijasi kundan bog'liq emas.
- Bu sinov shakli: haqiqiy yozilish, xabar yoki to'lov yo'q.
- Bilet chegarasiga ko'ra SMS, to'lov va administrator paneli amalga oshirilmagan.

## Loyiha tuzilmasi

```
.
├── index.html
├── package.json
├── vite.config.ts                # Vite + Vitest sozlamalari
├── docs/
│   ├── TICKET-007.md             # bilet matni
│   ├── PROMPTS.md                # promptlar jurnali
│   ├── screenshots/              # 390 / 768 / 1366 px ekran rasmlari
│   └── superpowers/              # dizayn spetsifikatsiyasi va reja
└── src/
    ├── main.tsx                  # kirish nuqtasi
    ├── App.tsx                   # MantineProvider, BookingProvider, marshrutlar
    ├── theme.ts                  # Mantine mavzusi (palitra, shriftlar)
    ├── data/services.ts          # xizmatlar, vaqtlar, standart sana
    ├── lib/booking.ts            # validateBooking, buildConfirmation, formatPrice
    ├── state/BookingContext.tsx  # qoralama va tasdiq, sessionStorage
    ├── components/               # SiteHeader, BarberPole, TicketHero, ServiceDeck (narxlar ro'yxati qatorlari), ServiceOption
    ├── pages/                    # Home, BookingForm, Confirmation
    └── test/                     # setup.ts, render.tsx (test qobig'i)
```

Testlar tegishli fayllar yonida: `*.test.ts` / `*.test.tsx`.

## Topshirish

Topshiriladigan papka nomi: `hududiy_<ishtirokchi-kodi>_007`. Ichida: `node_modules/` va `dist/` siz manba kodi, `README.md`, `docs/PROMPTS.md`, `docs/screenshots/`. Tekshiruvchi `npm install` va `npm run dev` bilan ishga tushiradi, `npm test` bilan 33 testni yurgizadi.
