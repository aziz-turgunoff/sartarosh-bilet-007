import { Box, Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { Link, Navigate, useNavigate } from 'react-router';
import { useBooking } from '../state/BookingContext';
import classes from './Confirmation.module.css';

export function Confirmation() {
  const { confirmation } = useBooking();
  const navigate = useNavigate();

  if (confirmation === null) return <Navigate to="/yozilish" replace />;

  const rows: Array<{ term: string; value: string; price?: boolean }> = [
    { term: 'Ism', value: confirmation.name },
    { term: 'Xizmat', value: `${confirmation.serviceName} · ${confirmation.durationMin} daqiqa` },
    { term: 'Sana', value: confirmation.date },
    { term: 'Vaqt', value: confirmation.time },
    { term: 'Narx', value: confirmation.priceLabel, price: true },
  ];

  return (
    <Box component="main">
      <Container size="sm" py={{ base: 'xl', md: 48 }}>
        <Stack gap="xl">
          <Title order={1} className={classes.title}>
            Yozilish qabul qilindi
          </Title>

          <Paper data-testid="confirm-card" className={`${classes.ticket} perf-top`}>
            <span className={classes.stamp} aria-hidden="true">
              QABUL QILINDI
            </span>
            <p className={classes.timeLabel}>Vaqt</p>
            <p className={classes.time}>{confirmation.time}</p>
            <Box component="dl" className={classes.list}>
              {rows.map(({ term, value, price }) => (
                <div key={term} className={classes.row}>
                  <dt className={classes.term}>{term}</dt>
                  <dd className={price ? `${classes.value} ${classes.price}` : classes.value}>{value}</dd>
                </div>
              ))}
            </Box>
          </Paper>

          <Text c="dimmed" size="sm">
            Bu sinov loyihasi: haqiqiy yozilish amalga oshirilmaydi.
          </Text>

          <Group gap="sm">
            <Button size="md" data-testid="reselect-button" onClick={() => navigate('/yozilish')}>
              Qayta tanlash
            </Button>
            <Button component={Link} to="/" variant="outline" size="md">
              Bosh sahifa
            </Button>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}
