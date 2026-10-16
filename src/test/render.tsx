import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from '../App';
import { SiteHeader } from '../components/SiteHeader';
import { DATES_SETTINGS } from '../lib/dates';
import { BookingProvider } from '../state/BookingContext';
import { theme } from '../theme';

export function renderAt(path: string) {
  const user = userEvent.setup();
  const renderResult = render(
    <MantineProvider theme={theme} forceColorScheme="light">
      <DatesProvider settings={DATES_SETTINGS}>
        <BookingProvider>
          <MemoryRouter initialEntries={[path]}>
            <SiteHeader />
            <AppRoutes />
          </MemoryRouter>
        </BookingProvider>
      </DatesProvider>
    </MantineProvider>,
  );
  return { user, ...renderResult };
}
