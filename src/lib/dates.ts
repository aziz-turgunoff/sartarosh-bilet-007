import type { DatesProviderSettings } from '@mantine/dates';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';

/** dayjs locale bundled with the app: Uzbek Latin month and weekday names, no network. */
export const DATE_LOCALE = 'uz-latn';

/** `D MMMM YYYY` in Uzbek: '2026-11-20' -> '20 Noyabr 2026'. */
export const LONG_DATE_FORMAT = 'D MMMM YYYY';

/** Shared settings for every @mantine/dates component: Uzbek names, Monday first, Sunday off. */
export const DATES_SETTINGS: DatesProviderSettings = { locale: DATE_LOCALE, firstDayOfWeek: 1, weekendDays: [0] };

/** '2026-11-20' -> '20 Noyabr 2026'. The confirmation keeps `formatDate` ('20.11.2026'). */
export function formatLongDate(iso: string): string {
  return dayjs(iso).locale(DATE_LOCALE).format(LONG_DATE_FORMAT);
}
