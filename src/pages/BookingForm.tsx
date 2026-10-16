import { Box, Button, Container, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { ServiceOption } from '../components/ServiceOption';
import { DEFAULT_BOOKING_DATE, SERVICES, TIME_SLOTS } from '../data/services';
import { isServiceId, type BookingErrors } from '../lib/booking';
import { DATE_LOCALE, LONG_DATE_FORMAT, formatLongDate } from '../lib/dates';
import { useBooking } from '../state/BookingContext';
import classes from './BookingForm.module.css';

const ARROW_KEYS = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];

/** Arrow keys move focus and selection inside a radiogroup, as native radios do. */
function onRadioGroupKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  if (!ARROW_KEYS.includes(event.key)) return;
  const radios = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const index = radios.indexOf(document.activeElement as HTMLElement);
  if (index === -1) return;
  event.preventDefault();
  const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
  const next = radios[(index + delta + radios.length) % radios.length];
  next.focus();
  next.click();
}

export function BookingForm() {
  const { draft, updateDraft, confirm } = useBooking();
  const [errors, setErrors] = useState<BookingErrors>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const serviceGroupRef = useRef<HTMLDivElement>(null);
  const timeGroupRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLButtonElement>(null);

  // On mount: a fresh entry (home, header, price list) starts with nothing
  // chosen except the service named by ?xizmat=; only "Qayta tanlash" arrives
  // with { keep: true } and restores the previous choices. The query is
  // stripped so browser Back cannot re-apply the preselection later.
  useEffect(() => {
    const keep = (location.state as { keep?: boolean } | null)?.keep === true;
    const requested = searchParams.get('xizmat');
    const requestedId = isServiceId(requested) ? requested : null;
    if (!keep) updateDraft({ name: '', serviceId: requestedId, time: null });
    else if (requestedId) updateDraft({ serviceId: requestedId });
    if (requested !== null) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearError(key: keyof BookingErrors) {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = confirm();
    if (Object.keys(result).length === 0) {
      navigate('/tasdiq');
      return;
    }
    setErrors(result);
    // Move focus to the first invalid control in form order.
    if (result.serviceId) serviceGroupRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus();
    else if (result.time) timeGroupRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus();
    else if (result.name) nameRef.current?.focus();
    else if (result.date) dateRef.current?.focus();
  }

  return (
    <Box component="main">
      <Container size="sm" py={{ base: 'xl', md: 48 }}>
        <Paper component="form" onSubmit={handleSubmit} noValidate className={`${classes.ticket} perf-top`}>
          <Stack gap="xl">
            <Title order={1} className={classes.title}>
              Yozilish
            </Title>

            <Stack gap="xs">
              <Text className={classes.groupLabel}>Xizmat</Text>
              <SimpleGrid
                ref={serviceGroupRef}
                role="radiogroup"
                aria-label="Xizmat"
                aria-describedby={errors.serviceId ? 'service-error' : undefined}
                aria-invalid={errors.serviceId ? true : undefined}
                cols={{ base: 1, sm: 3 }}
                spacing="sm"
                onKeyDown={onRadioGroupKeyDown}
              >
                {SERVICES.map((service) => (
                  <ServiceOption
                    key={service.id}
                    service={service}
                    selected={draft.serviceId === service.id}
                    onSelect={() => {
                      updateDraft({ serviceId: service.id });
                      clearError('serviceId');
                    }}
                  />
                ))}
              </SimpleGrid>
              {errors.serviceId && (
                <Text id="service-error" className={classes.error} size="sm" role="alert">
                  {errors.serviceId}
                </Text>
              )}
            </Stack>

            <Stack gap="xs">
              <Text className={classes.groupLabel}>Vaqt</Text>
              <Group
                ref={timeGroupRef}
                role="radiogroup"
                aria-label="Vaqt"
                aria-describedby={errors.time ? 'time-error' : undefined}
                aria-invalid={errors.time ? true : undefined}
                gap="sm"
                grow
                wrap="nowrap"
                onKeyDown={onRadioGroupKeyDown}
              >
                {TIME_SLOTS.map((slot) => {
                  const selected = draft.time === slot;
                  return (
                    <Button
                      key={slot}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      data-testid={`time-${slot}`}
                      variant="default"
                      size="md"
                      className={classes.slot}
                      onClick={() => {
                        updateDraft({ time: slot });
                        clearError('time');
                      }}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </Group>
              {errors.time && (
                <Text id="time-error" className={classes.error} size="sm" role="alert">
                  {errors.time}
                </Text>
              )}
            </Stack>

            <TextInput
              ref={nameRef}
              label="Ism"
              placeholder="Ismingiz"
              size="md"
              maxLength={80}
              autoComplete="name"
              classNames={{ input: classes.underline, label: classes.groupLabel }}
              value={draft.name}
              onChange={(event) => {
                updateDraft({ name: event.currentTarget.value });
                clearError('name');
              }}
              error={errors.name}
              data-testid="name-input"
            />

            <DatePickerInput
              ref={dateRef}
              label="Sana"
              description={`Sinov uchun ${formatLongDate(DEFAULT_BOOKING_DATE)} oldindan tanlangan`}
              placeholder="Sanani tanlang"
              size="md"
              locale={DATE_LOCALE}
              valueFormat={LONG_DATE_FORMAT}
              classNames={{ input: classes.underline, label: classes.groupLabel }}
              value={draft.date || null}
              onChange={(value) => {
                updateDraft({ date: value ?? '' });
                clearError('date');
              }}
              error={errors.date}
              data-testid="date-input"
            />

            <Text c="dimmed" size="sm">
              Bu sinov shakli: haqiqiy yozilish amalga oshirilmaydi.
            </Text>

            <Button type="submit" size="lg" fullWidth data-testid="submit-booking">
              Yozilish
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
