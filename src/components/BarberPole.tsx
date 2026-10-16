import classes from './BarberPole.module.css';

/** The site's single motif: a slowly crawling barber-pole stripe. */
export function BarberPole() {
  return <div className={classes.pole} aria-hidden="true" title="Navbat" />;
}

export default BarberPole;
