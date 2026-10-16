import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BookingProvider, useBooking } from './BookingContext';
import type { BookingErrors } from '../lib/booking';

const wrapper = ({ children }: { children: ReactNode }) => <BookingProvider>{children}</BookingProvider>;
beforeEach(() => sessionStorage.clear());

test('confirm returns errors for empty draft and keeps confirmation null', () => {
  const { result } = renderHook(() => useBooking(), { wrapper });
  let errors: BookingErrors = {};
  act(() => {
    errors = result.current.confirm();
  });
  expect(errors).toEqual({
    name: 'Ismingizni kiriting',
    serviceId: 'Xizmatni tanlang',
    time: 'Vaqtni tanlang',
  });
  expect(result.current.confirmation).toBeNull();
});

test('confirm stores confirmation and survives remount via sessionStorage', () => {
  const first = renderHook(() => useBooking(), { wrapper });
  act(() => first.result.current.updateDraft({ name: 'Sinovchi 01', serviceId: 'S01', time: '12:00' }));
  act(() => {
    first.result.current.confirm();
  });
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

test('clearConfirmation drops the confirmation but keeps the draft', () => {
  const { result } = renderHook(() => useBooking(), { wrapper });
  act(() => result.current.updateDraft({ name: 'Sinovchi 01', serviceId: 'S01', time: '12:00' }));
  act(() => {
    result.current.confirm();
  });
  expect(result.current.confirmation).not.toBeNull();
  act(() => result.current.clearConfirmation());
  expect(result.current.confirmation).toBeNull();
  expect(result.current.draft.name).toBe('Sinovchi 01');
});

test('useBooking outside provider throws', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => renderHook(() => useBooking())).toThrow('useBooking outside BookingProvider');
  spy.mockRestore();
});

test('a stored draft without date restores with the preselected date', () => {
  sessionStorage.setItem(
    'sartarosh.booking.v1',
    JSON.stringify({ draft: { name: 'Sinovchi 01', serviceId: 'S01', time: '12:00' }, confirmation: null }),
  );
  const { result } = renderHook(() => useBooking(), { wrapper });
  expect(result.current.draft).toEqual({ name: 'Sinovchi 01', serviceId: 'S01', time: '12:00', date: '2026-11-20' });
});
