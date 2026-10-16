import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: "'Manrope Variable', sans-serif",
  headings: { fontFamily: "'Bebas Neue', sans-serif" },
  primaryColor: 'ink',
  primaryShade: 6,
  autoContrast: true,
  respectReducedMotion: true,
  black: '#17151a',
  colors: {
    // Shade 6 is the ink used for filled buttons; shade 7 is pole red so the
    // filled hover state (primaryShade + 1) turns ink into red.
    ink: [
      '#f4eee3',
      '#e4ded2',
      '#c9c3b8',
      '#a39d93',
      '#6b655c',
      '#3b3740',
      '#17151a',
      '#c8102e',
      '#a50d26',
      '#0b0a0c',
    ],
  },
  defaultRadius: 'sm',
});
