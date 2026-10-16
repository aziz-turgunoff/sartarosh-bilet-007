export type ServiceId = 'S01' | 'S02' | 'S03';

export interface Service {
  id: ServiceId;
  name: string;
  durationMin: number;
  price: number;
}

export const SERVICES: readonly Service[] = [
  { id: 'S01', name: 'Soch olish', durationMin: 30, price: 50000 },
  { id: 'S02', name: 'Soch turmaklash', durationMin: 60, price: 80000 },
  { id: 'S03', name: 'Soqolni tartibga keltirish', durationMin: 30, price: 30000 },
];

export const TIME_SLOTS = ['10:00', '12:00', '14:00'] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

/** ISO yyyy-mm-dd; the booking form preselects it, the visitor may change it. */
export const DEFAULT_BOOKING_DATE = '2026-11-20';
