import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@fontsource/bebas-neue';
import '@fontsource-variable/manrope';
import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
