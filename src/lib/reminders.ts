import type { Counter, RecentReminder, Reminder } from './types';
import { uid } from './id';

export const MAX_RECENT = 3;

export function createReminder(count: number, text: string, every: number, repeat: boolean): Reminder {
  const n = Math.max(1, Math.round(every));
  return { id: uid(), text: text.trim(), every: n, target: count + n, repeat };
}

/** Most recent first, deduped case-insensitively by text (latest count wins). */
export function pushRecent(list: RecentReminder[], entry: RecentReminder): RecentReminder[] {
  const text = entry.text.trim();
  if (!text) return list.slice(0, MAX_RECENT);
  const lower = text.toLowerCase();
  const next: RecentReminder = { text };
  if (entry.every !== undefined) next.every = Math.max(1, Math.round(entry.every));
  if (entry.repeat) next.repeat = true;
  return [next, ...list.filter((x) => x.text.toLowerCase() !== lower)].slice(0, MAX_RECENT);
}

/**
 * Call after counter.count has been incremented. Mutates reminders and
 * returns the ones that fired at this count.
 */
export function onIncrement(counter: Counter, now = Date.now()): Reminder[] {
  const fired: Reminder[] = [];
  for (const r of counter.reminders) {
    if (r.repeat) {
      if (counter.count === r.target) {
        fired.push({ ...r });
        r.target += r.every;
      }
    } else if (r.firedAt === undefined && counter.count === r.target) {
      r.firedAt = now;
      fired.push({ ...r });
    }
  }
  return fired;
}

/** Call after counter.count has been decremented. Re-arms reminders so undo is safe. */
export function onDecrement(counter: Counter): void {
  for (const r of counter.reminders) {
    if (r.repeat) {
      // target should be the next multiple strictly ahead of count
      while (r.target - r.every > counter.count) r.target -= r.every;
    } else if (r.firedAt !== undefined && counter.count < r.target) {
      delete r.firedAt;
    }
  }
}

/**
 * Call after counter.count has been set directly from `prev`. Jumping never
 * fires reminders: ones skipped past going up are silently consumed, and
 * going down re-arms them just like undo.
 */
export function onSet(counter: Counter, prev: number, now = Date.now()): void {
  if (counter.count < prev) return onDecrement(counter);
  if (counter.count === prev) return;
  for (const r of counter.reminders) {
    if (r.repeat) {
      while (r.target <= counter.count) r.target += r.every;
    } else if (r.firedAt === undefined && r.target <= counter.count) {
      r.firedAt = now;
    }
  }
}

/** Called when a counter is reset to 0 — one-shot reminders re-arm, repeating ones restart. */
export function onReset(counter: Counter): void {
  for (const r of counter.reminders) {
    if (r.repeat) r.target = r.every;
    else delete r.firedAt;
  }
}

/** Nearest reminder that hasn't fired yet. */
export function nextReminder(counter: Counter): Reminder | undefined {
  let best: Reminder | undefined;
  for (const r of counter.reminders) {
    if (!r.repeat && r.firedAt !== undefined) continue;
    if (r.target <= counter.count) continue;
    if (!best || r.target < best.target) best = r;
  }
  return best;
}
