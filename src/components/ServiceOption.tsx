import { UnstyledButton } from '@mantine/core';
import type { Service } from '../data/services';
import { formatPrice } from '../lib/booking';
import classes from './ServiceOption.module.css';

export interface ServiceOptionProps {
  service: Service;
  selected: boolean;
  onSelect(): void;
}

/** A ticket-stub radio card: the punch hole fills red when selected. */
export function ServiceOption({ service, selected, onSelect }: ServiceOptionProps) {
  return (
    <UnstyledButton
      type="button"
      role="radio"
      aria-checked={selected}
      data-testid={`service-${service.id}`}
      className={classes.option}
      onClick={onSelect}
    >
      <span className={classes.name}>{service.name}</span>
      <span className={classes.meta}>
        <span className={classes.duration}>{service.durationMin} daqiqa</span>
        <span className={classes.dot} aria-hidden="true">
          ·
        </span>
        <span className={classes.price}>{formatPrice(service.price)}</span>
      </span>
    </UnstyledButton>
  );
}
