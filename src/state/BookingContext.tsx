import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  EMPTY_DRAFT,
  buildConfirmation,
  isIsoDate,
  isServiceId,
  isTimeSlot,
  validateBooking,
  type BookingDraft,
  type BookingErrors,
  type Confirmation,
} from '../lib/booking';

export const STORAGE_KEY = 'sartarosh.booking.v1';

interface BookingState {
  draft: BookingDraft;
  confirmation: Confirmation | null;
}

export interface BookingContextValue {
  draft: BookingDraft;
  updateDraft(patch: Partial<BookingDraft>): void;
  confirmation: Confirmation | null;
  confirm(): BookingErrors;
  clearConfirmation(): void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const INITIAL_STATE: BookingState = { draft: EMPTY_DRAFT, confirmation: null };

function sanitizeDraft(value: unknown): BookingDraft {
  if (typeof value !== 'object' || value === null) return EMPTY_DRAFT;
  const raw = value as Record<string, unknown>;
  return {
    name: typeof raw.name === 'string' ? raw.name : '',
    serviceId: isServiceId(raw.serviceId) ? raw.serviceId : null,
    time: isTimeSlot(raw.time) ? raw.time : null,
    // Drafts stored before the date became selectable have no date: fall back to the default.
    date: isIsoDate(raw.date) ? raw.date : EMPTY_DRAFT.date,
  };
}

function sanitizeConfirmation(value: unknown): Confirmation | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.name !== 'string' || !isServiceId(raw.serviceId) || !isTimeSlot(raw.time)) return null;
  try {
    return buildConfirmation({
      name: raw.name,
      serviceId: raw.serviceId,
      time: raw.time,
      // Confirmations stored before the date became selectable were always on the default date.
      date: typeof raw.dateIso === 'string' ? raw.dateIso : EMPTY_DRAFT.date,
    });
  } catch {
    return null;
  }
}

function readState(): BookingState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return INITIAL_STATE;
    const obj = parsed as Record<string, unknown>;
    return { draft: sanitizeDraft(obj.draft), confirmation: sanitizeConfirmation(obj.confirmation) };
  } catch {
    return INITIAL_STATE;
  }
}

function writeState(state: BookingState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode, quota): the in-memory state still works.
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(readState);

  useEffect(() => {
    writeState(state);
  }, [state]);

  const updateDraft = useCallback((patch: Partial<BookingDraft>) => {
    setState((prev) => ({ ...prev, draft: { ...prev.draft, ...patch } }));
  }, []);

  const confirm = useCallback((): BookingErrors => {
    const errors = validateBooking(state.draft);
    if (Object.keys(errors).length > 0) return errors;
    setState((prev) => ({ ...prev, confirmation: buildConfirmation(prev.draft) }));
    return {};
  }, [state.draft]);

  const clearConfirmation = useCallback(() => {
    setState((prev) => (prev.confirmation === null ? prev : { ...prev, confirmation: null }));
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({ draft: state.draft, confirmation: state.confirmation, updateDraft, confirm, clearConfirmation }),
    [state.draft, state.confirmation, updateDraft, confirm, clearConfirmation],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (ctx === null) throw new Error('useBooking outside BookingProvider');
  return ctx;
}
