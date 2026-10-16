import { Button, Container, Title } from '@mantine/core';
import { Link } from 'react-router';
import { SERVICES } from '../data/services';
import { formatPrice } from '../lib/booking';
import styles from './ServiceDeck.module.css';

/** The price board: one dotted-leader row per service. */
export function ServiceDeck() {
  return (
    <section id="xizmatlar" className={styles.section}>
      <Container size="md" py={{ base: 40, md: 80 }}>
        <Title order={2} className={styles.title}>
          Narxlar taxtasi
        </Title>
        <ul className={styles.board}>
          {SERVICES.map((service) => (
            <li key={service.id} data-testid={`deck-${service.id}`} className={styles.row}>
              <span className={styles.name}>{service.name}</span>
              <span className={styles.leader} aria-hidden="true" />
              <span className={styles.duration}>{`${service.durationMin} daqiqa`}</span>
              <span className={styles.price}>{formatPrice(service.price)}</span>
              <Button
                component={Link}
                to={`/yozilish?xizmat=${service.id}`}
                size="xs"
                variant="outline"
                className={styles.cta}
              >
                Yozilish
              </Button>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export default ServiceDeck;
