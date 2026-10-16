import { DEFAULT_BOOKING_DATE, SERVICES, TIME_SLOTS, type ServiceId, type TimeSlot } from '../data/services';

export interface BookingDraft {
  name: string;
  serviceId: ServiceId | null;
  time: TimeSlot | null;
  /** ISO yyyy-mm-dd, the value a native date input emits. */
  date: string;
}

export const EMPTY_DRAFT: BookingDraft = { name: '', serviceId: null, time: null, date: DEFAULT_BOOKING_DATE };

export type BookingErrors = Partial<Record<keyof BookingDraft, string>>;

export interface Confirmation {
  name: string;
  serviceId: ServiceId;
  serviceName: string;
  durationMin: number;
  /** dd.mm.yyyy for display. */
  date: string;
  /** ISO yyyy-mm-dd, kept so a stored confirmation can be rebuilt. */
  dateIso: string;
  time: TimeSlot;
  price: number;
  priceLabel: string;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isServiceId(value: unknown): value is ServiceId {
  return SERVICES.some((s) => s.id === value);
}

export function isTimeSlot(value: unknown): value is TimeSlot {
  return (TIME_SLOTS as readonly unknown[]).includes(value);
}

/** True for a yyyy-mm-dd string that names a real calendar day (2026-02-30 is rejected). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE.exec(value);
  if (match === null) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function validateBooking(draft: BookingDraft): BookingErrors {
  const errors: BookingErrors = {};
  if (draft.name.trim() === '') errors.name = 'Ismingizni kiriting';
  if (!isServiceId(draft.serviceId)) errors.serviceId = 'Xizmatni tanlang';
  if (!isTimeSlot(draft.time)) errors.time = 'Vaqtni tanlang';
  // Past dates are not rejected: the demo must stay deterministic after the default date.
  if (!isIsoDate(draft.date)) errors.date = 'Sanani tanlang';
  return errors;
}

export function formatPrice(amount: number): string {
  const digits = String(Math.trunc(Math.abs(amount)));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}${grouped} so'm`;
}

/** '2026-11-20' -> '20.11.2026'. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

export function buildConfirmation(draft: BookingDraft): Confirmation {
  if (Object.keys(validateBooking(draft)).length > 0) throw new Error('invalid draft');
  const service = SERVICES.find((s) => s.id === draft.serviceId)!;
  return {
    name: draft.name.trim(),
    serviceId: service.id,
    serviceName: service.name,
    durationMin: service.durationMin,
    date: formatDate(draft.date),
    dateIso: draft.date,
    time: draft.time!,
    price: service.price,
    priceLabel: formatPrice(service.price),
  };
}
