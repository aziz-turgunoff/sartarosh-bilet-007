import { render, screen, within } from '@testing-library/react';
import App from './App';

test('renders the wordmark in the site header', () => {
  render(<App />);
  const header = screen.getByRole('banner');
  expect(within(header).getByRole('link', { name: 'SARTAROSH.' })).toBeInTheDocument();
});
