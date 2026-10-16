import { screen, within } from '@testing-library/react';
import { renderAt } from '../test/render';

beforeEach(() => sessionStorage.clear());

async function completeCheckOne(user: ReturnType<typeof renderAt>['user']) {
  await user.click(screen.getByTestId('service-S01'));
  await user.click(screen.getByTestId('time-12:00'));
  await user.type(screen.getByTestId('name-input'), 'Sinovchi 01');
  await user.click(screen.getByTestId('submit-booking'));
  return screen.findByTestId('confirm-card');
}

test('check 1: S01 + 12:00 + Sinovchi 01 shows the confirmation', async () => {
  const { user } = renderAt('/yozilish');
  const card = await completeCheckOne(user);
  for (const t of ['Sinovchi 01', 'Soch olish', '20.11.2026', '12:00', "50 000 so'm"]) {
    expect(card).toHaveTextContent(t);
  }
  expect(screen.getByRole('heading', { name: 'Yozilish qabul qilindi' })).toBeInTheDocument();
});

test('check 2a: no time -> stays on form with Vaqtni tanlang', async () => {
  const { user } = renderAt('/yozilish');
  await user.click(screen.getByTestId('service-S01'));
  await user.type(screen.getByTestId('name-input'), 'Sinovchi 01');
  await user.click(screen.getByTestId('submit-booking'));
  expect(screen.getByText('Vaqtni tanlang')).toBeInTheDocument();
  expect(screen.getByText('Vaqtni tanlang')).toHaveAttribute('role', 'alert');
  expect(screen.queryByText('Ismingizni kiriting')).toBeNull();
  expect(screen.queryByText('Xizmatni tanlang')).toBeNull();
  expect(screen.queryByTestId('confirm-card')).toBeNull();
});

test('check 2b: empty name -> Ismingizni kiriting', async () => {
  const { user } = renderAt('/yozilish');
  await user.click(screen.getByTestId('service-S01'));
  await user.click(screen.getByTestId('time-12:00'));
  await user.click(screen.getByTestId('submit-booking'));
  expect(screen.getByText('Ismingizni kiriting')).toBeInTheDocument();
  expect(screen.getByTestId('name-input')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.queryByText('Vaqtni tanlang')).toBeNull();
  expect(screen.queryByTestId('confirm-card')).toBeNull();
});

test('check 2c: nothing chosen -> all three errors, fixing one field clears only that error', async () => {
  const { user } = renderAt('/yozilish');
  await user.click(screen.getByTestId('submit-booking'));
  expect(screen.getByText('Ismingizni kiriting')).toBeInTheDocument();
  expect(screen.getByText('Xizmatni tanlang')).toBeInTheDocument();
  expect(screen.getByText('Vaqtni tanlang')).toBeInTheDocument();
  await user.click(screen.getByTestId('service-S02'));
  expect(screen.queryByText('Xizmatni tanlang')).toBeNull();
  expect(screen.getByText('Vaqtni tanlang')).toBeInTheDocument();
});

test("check 3: Qayta tanlash then S02 + 14:00 shows 80 000 so'm and 14:00", async () => {
  const { user } = renderAt('/yozilish');
  await completeCheckOne(user);
  await user.click(screen.getByTestId('reselect-button'));
  expect(screen.getByTestId('name-input')).toHaveValue('Sinovchi 01');
  expect(screen.getByTestId('service-S01')).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('time-12:00')).toHaveAttribute('aria-checked', 'true');
  await user.click(screen.getByTestId('service-S02'));
  await user.click(screen.getByTestId('time-14:00'));
  await user.click(screen.getByTestId('submit-booking'));
  const card = await screen.findByTestId('confirm-card');
  expect(card).toHaveTextContent("80 000 so'm");
  expect(card).toHaveTextContent('14:00');
  expect(card).toHaveTextContent('Soch turmaklash');
  expect(card).not.toHaveTextContent("50 000 so'm");
});

test('/tasdiq restores a confirmation persisted in sessionStorage', () => {
  sessionStorage.setItem(
    'sartarosh.booking.v1',
    JSON.stringify({
      draft: { name: 'Sinovchi 01', serviceId: 'S01', time: '12:00' },
      confirmation: {
        name: 'Sinovchi 01',
        serviceId: 'S01',
        serviceName: 'Soch olish',
        durationMin: 30,
        date: '20.11.2026',
        time: '12:00',
        price: 50000,
        priceLabel: "50 000 so'm",
      },
    }),
  );
  renderAt('/tasdiq');
  const card = screen.getByTestId('confirm-card');
  for (const t of ['Sinovchi 01', 'Soch olish', '20.11.2026', '12:00', "50 000 so'm"]) {
    expect(card).toHaveTextContent(t);
  }
});

test('direct /tasdiq without booking redirects to the form', () => {
  renderAt('/tasdiq');
  expect(screen.getByTestId('submit-booking')).toBeInTheDocument();
  expect(screen.queryByTestId('confirm-card')).toBeNull();
});

test('?xizmat=S03 preselects the service', () => {
  renderAt('/yozilish?xizmat=S03');
  expect(screen.getByTestId('service-S03')).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('service-S01')).toHaveAttribute('aria-checked', 'false');
});

test('?xizmat=S99 leaves the service unselected', () => {
  renderAt('/yozilish?xizmat=S99');
  for (const id of ['S01', 'S02', 'S03']) {
    expect(screen.getByTestId(`service-${id}`)).toHaveAttribute('aria-checked', 'false');
  }
});

test('form exposes labelled radiogroups and the preselected date', () => {
  renderAt('/yozilish');
  const services = screen.getByRole('radiogroup', { name: 'Xizmat' });
  expect(within(services).getAllByRole('radio')).toHaveLength(3);
  const times = screen.getByRole('radiogroup', { name: 'Vaqt' });
  expect(within(times).getAllByRole('radio').map((el) => el.textContent)).toEqual(['10:00', '12:00', '14:00']);
  const date = screen.getByTestId('date-input');
  expect(screen.getByLabelText('Sana')).toBe(date);
  expect(date).toHaveTextContent('20 Noyabr 2026');
  expect(date).not.toBeDisabled();
  expect(screen.getByText('Bu sinov shakli: haqiqiy yozilish amalga oshirilmaydi.')).toBeInTheDocument();
});

test('service and time options are keyboard operable', async () => {
  const { user } = renderAt('/yozilish');
  screen.getByTestId('service-S02').focus();
  await user.keyboard('{Enter}');
  expect(screen.getByTestId('service-S02')).toHaveAttribute('aria-checked', 'true');
  screen.getByTestId('time-10:00').focus();
  await user.keyboard(' ');
  expect(screen.getByTestId('time-10:00')).toHaveAttribute('aria-checked', 'true');
});

test('header wordmark links home and its Yozilish link opens the form', async () => {
  const { user } = renderAt('/');
  const header = screen.getByRole('banner');
  expect(within(header).getByRole('link', { name: 'SARTAROSH.' })).toHaveAttribute('href', '/');
  await user.click(within(header).getAllByRole('link', { name: 'Yozilish' })[0]);
  expect(screen.getByTestId('submit-booking')).toBeInTheDocument();
});

test('unknown route redirects to / and Bosh sahifa leaves the confirmation', async () => {
  const { user } = renderAt('/nimadir');
  expect(screen.queryByTestId('submit-booking')).toBeNull();
  const header = screen.getByRole('banner');
  await user.click(within(header).getAllByRole('link', { name: 'Yozilish' })[0]);
  await completeCheckOne(user);
  await user.click(screen.getByRole('link', { name: 'Bosh sahifa' }));
  expect(screen.queryByTestId('confirm-card')).toBeNull();
});

function seedDraftDate(date: string) {
  sessionStorage.setItem(
    'sartarosh.booking.v1',
    JSON.stringify({ draft: { name: '', serviceId: null, time: null, date }, confirmation: null }),
  );
}

test('another chosen date is shown in Uzbek and lands in the confirmation', async () => {
  seedDraftDate('2026-12-05');
  const { user } = renderAt('/yozilish');
  expect(screen.getByTestId('date-input')).toHaveTextContent('5 Dekabr 2026');
  const card = await completeCheckOne(user);
  expect(card).toHaveTextContent('05.12.2026');
  expect(card).not.toHaveTextContent('20.11.2026');
});

