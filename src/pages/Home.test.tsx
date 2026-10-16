import { screen, within } from '@testing-library/react';
import { renderAt } from '../test/render';

beforeEach(() => sessionStorage.clear());

test('lists three services with duration and price', () => {
  renderAt('/');
  for (const [id, name, dur, price] of [
    ['S01', 'Soch olish', '30 daqiqa', "50 000 so'm"],
    ['S02', 'Soch turmaklash', '60 daqiqa', "80 000 so'm"],
    ['S03', 'Soqolni tartibga keltirish', '30 daqiqa', "30 000 so'm"],
  ]) {
    const card = screen.getByTestId(`deck-${id}`);
    for (const t of [name, dur, price]) expect(card).toHaveTextContent(t);
  }
});

test('deck Yozilish opens the form with the service preselected', async () => {
  const { user } = renderAt('/');
  await user.click(within(screen.getByTestId('deck-S02')).getByRole('link', { name: 'Yozilish' }));
  expect(screen.getByTestId('service-S02')).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('service-S01')).toHaveAttribute('aria-checked', 'false');
});
