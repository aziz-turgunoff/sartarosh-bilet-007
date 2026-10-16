import { Button } from '@mantine/core';
import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router';
import { SERVICES, TIME_SLOTS } from '../data/services';
import styles from './TicketHero.module.css';

const MAX_TILT_DEG = 6;

/** Pointer tilt runs only on hover-capable fine-pointer devices without reduced motion. */
function tiltAllowed(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function TicketHero() {
  const tiltRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const pointerRef = useRef({ x: 0.5, y: 0.5, width: 0, height: 0 });

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const applyTilt = () => {
    frameRef.current = 0;
    const tilt = tiltRef.current;
    const shine = shineRef.current;
    if (!tilt) return;
    const { x, y, width, height } = pointerRef.current;
    const rotateY = (x - 0.5) * 2 * MAX_TILT_DEG;
    const rotateX = (0.5 - y) * 2 * MAX_TILT_DEG;
    tilt.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    if (shine) {
      shine.style.transform = `translate(${((x - 0.5) * width).toFixed(1)}px, ${((y - 0.5) * height).toFixed(1)}px)`;
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!tiltAllowed()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointerRef.current = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
      width: rect.width,
      height: rect.height,
    };
    event.currentTarget.dataset.active = '';
    if (frameRef.current === 0) frameRef.current = requestAnimationFrame(applyTilt);
  };

  const onPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    delete event.currentTarget.dataset.active;
    if (tiltRef.current) tiltRef.current.style.transform = '';
    if (shineRef.current) shineRef.current.style.transform = '';
  };

  return (
    <section className={styles.hero} aria-label="SARTAROSH">
      <div className={styles.lead}>
        <h1 className={styles.wordmark}>SARTAROSH.</h1>
        <p className={styles.tagline}>Xizmatga oldindan yozilish</p>
      </div>

      <div className={styles.ticketWrap}>
        <div className={styles.tiltField} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
          <div ref={tiltRef} className={styles.tilt}>
            <article className={`${styles.ticket} perf-top perf-bottom`}>
              <div className={styles.body}>
                <p className={styles.ticketTitle}>NAVBAT CHIPTASI</p>
                <dl className={styles.facts}>
                  <div className={styles.fact}>
                    <dt>Sana</dt>
                    <dd>Siz tanlaysiz</dd>
                  </div>
                  <div className={styles.fact}>
                    <dt>Vaqtlar</dt>
                    <dd>{TIME_SLOTS.join(' · ')}</dd>
                  </div>
                  <div className={styles.fact}>
                    <dt>Xizmatlar</dt>
                    <dd>{SERVICES.length}</dd>
                  </div>
                </dl>
                <Button component={Link} to="/yozilish" size="lg" fullWidth className={styles.cta}>
                  Yozilish
                </Button>
              </div>
              <div className={styles.stub} aria-hidden="true">
                <span className={styles.stubText}>SARTAROSH.</span>
              </div>
            </article>
            <div ref={shineRef} className={styles.shine} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default TicketHero;
