# Promptlar jurnali — Bilet 007

Loyiha Claude Code (Claude Fable 5.1) bilan bajarildi. Asosiy promptlar ikki faylda: dizayn spetsifikatsiyasi `docs/superpowers/specs/2026-10-16-bilet-007-booking-design.md` va bajarish rejasi `docs/superpowers/plans/2026-10-16-bilet-007-booking.md`. Qolgan promptlar shu ikki hujjatga tayanadi. Quyida xronologik tartibda.

1. **Bilet qabul qilindi.** Bilet 007 matni (`docs/TICKET-007.md`), tanlov nizomi va baholash mezonlari o'qildi. Talablar, uchta qabul sinovi va vazifa chegarasi aniqlandi.
2. **Dizayn spetsifikatsiyasi.** Maqsad, chegara, ma'lumotlar, uchta sahifa, tekshiruv matnlari, vizual yo'nalish va stek yozildi: `docs/superpowers/specs/2026-10-16-bilet-007-booking-design.md`.
3. **Reja.** Spetsifikatsiya yettita vazifaga bo'lindi, har biriga fayllar, interfeyslar va testlar belgilandi: `docs/superpowers/plans/2026-10-16-bilet-007-booking.md`.
4. **Skaffold.** Vite + React 19 + TypeScript, Mantine 9, react-router 7, Vitest + Testing Library + jsdom. Test qobig'i (`src/test/setup.ts`, `src/test/render.tsx`), birinchi commit.
5. **Parallel bajarish.** Bir agent biznes mantiq va sahifalarni TDD bilan yozdi (`src/lib/booking.ts`, `src/state/BookingContext.tsx`, `src/pages/BookingForm.tsx`, `src/pages/Confirmation.tsx`); ikkinchisi bosh sahifani (`src/pages/Home.tsx`, `src/components/`).
6. **Integratsiya.** Ikki agent ishi birlashtirildi, marshrutlar yakunlandi. `npx vitest run`: 5 fayl, 26 test; `npm run build` toza.
7. **Ikki mustaqil tekshiruv.** Birinchisi spetsifikatsiyaga muvofiqlik, ikkinchisi sifat va a11y (kontrast, fokus, klaviatura, `prefers-reduced-motion`). Topilmalar ro'yxati tuzildi.
8. **Brauzerda qo'lda tekshiruv.** 390, 768 va 1366 px kengliklarda uchala sahifa; uchta qabul sinovi qo'lda bajarildi.
9. **Qayta dizayn.** "Navbat chiptasi" konsepti: qog'oz chipta, sartarosh ustuni chizig'i, kartalar o'rniga narxlar ro'yxati, yirtilgan chipta va "QABUL QILINDI" muhri. Tekshiruv topilmalari tuzatildi.
10. **README.** Ishga tushirish, talablar va testlar xaritasi, vositalar, cheklovlar, topshirish papkasi (`README.md`) va ushbu jurnal.
