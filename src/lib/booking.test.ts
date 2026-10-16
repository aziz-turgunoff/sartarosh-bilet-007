import { validateBooking, formatPrice, formatDate, buildConfirmation, EMPTY_DRAFT } from './booking';

test("formatPrice uses space thousands and so'm", () => {
  expect(formatPrice(50000)).toBe("50 000 so'm");
  expect(formatPrice(80000)).toBe("80 000 so'm");
  expect(formatPrice(30000)).toBe("30 000 so'm");
});

test('formatDate renders an ISO date as dd.mm.yyyy', () => {
  expect(formatDate('2026-11-20')).toBe('20.11.2026');
  expect(formatDate('2026-12-05')).toBe('05.12.2026');
});

test('empty draft fails name, service and time; the preselected date passes', () => {
  expect(EMPTY_DRAFT.date).toBe('2026-11-20');
  expect(validateBooking(EMPTY_DRAFT)).toEqual({
    name: 'Ismingizni kiriting',
    serviceId: 'Xizmatni tanlang',
    time: 'Vaqtni tanlang',
  });
});

test('whitespace-only name fails', () => {
  expect(validateBooking({ name: '   ', serviceId: 'S01', time: '12:00', date: '2026-11-20' })).toEqual({
    name: 'Ismingizni kiriting',
  });
});

test('missing time alone fails', () => {
  expect(validateBooking({ name: 'Sinovchi 01', serviceId: 'S01', time: null, date: '2026-11-20' })).toEqual({
    time: 'Vaqtni tanlang',
  });
});

test('missing or malformed date fails with Sanani tanlang; past dates are accepted', () => {
  const base = { name: 'Sinovchi 01', serviceId: 'S01', time: '12:00' } as const;
  expect(validateBooking({ ...base, date: '' })).toEqual({ date: 'Sanani tanlang' });
  expect(validateBooking({ ...base, date: '20.11.2026' })).toEqual({ date: 'Sanani tanlang' });
  expect(validateBooking({ ...base, date: '2026-02-30' })).toEqual({ date: 'Sanani tanlang' });
  expect(validateBooking({ ...base, date: '2020-01-01' })).toEqual({});
});

test('acceptance check 1: S01 12:00 Sinovchi 01', () => {
  const c = buildConfirmation({ name: 'Sinovchi 01', serviceId: 'S01', time: '12:00', date: '2026-11-20' });
  expect(c).toMatchObject({
    name: 'Sinovchi 01',
    serviceName: 'Soch olish',
    date: '20.11.2026',
    time: '12:00',
    priceLabel: "50 000 so'm",
  });
});

test('buildConfirmation formats the chosen date and keeps the ISO value', () => {
  const c = buildConfirmation({ name: 'Sinovchi 01', serviceId: 'S01', time: '12:00', date: '2026-12-05' });
  expect(c.date).toBe('05.12.2026');
  expect(c.dateIso).toBe('2026-12-05');
});

test('buildConfirmation trims the name and throws on invalid draft', () => {
  expect(buildConfirmation({ name: '  Ali ', serviceId: 'S02', time: '14:00', date: '2026-11-20' }).name).toBe('Ali');
  expect(() => buildConfirmation(EMPTY_DRAFT)).toThrow('invalid draft');
});
