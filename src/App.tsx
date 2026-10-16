import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import { BarberPole } from './components/BarberPole';
import { SiteHeader } from './components/SiteHeader';
import { BookingForm } from './pages/BookingForm';
import { Confirmation } from './pages/Confirmation';
import { Home } from './pages/Home';
import { DATES_SETTINGS } from './lib/dates';
import { BookingProvider } from './state/BookingContext';
import { theme } from './theme';

/** Scrolls to the top on route change, or to the `#hash` target when one is present. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function AppRoutes() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/yozilish" element={<BookingForm />} />
        <Route path="/tasdiq" element={<Confirmation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <DatesProvider settings={DATES_SETTINGS}>
        <BookingProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <SiteHeader />
            <BarberPole />
            <AppRoutes />
          </BrowserRouter>
        </BookingProvider>
      </DatesProvider>
    </MantineProvider>
  );
}
