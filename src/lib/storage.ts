import type { AppData, Counter, Project, RecentReminder, Reminder } from './types';
import { MAX_RECENT } from './reminders';

export const STORAGE_KEY = 'raggi:v1';
export const CURRENT_VERSION = 1 as const;

export function defaultData(): AppData {
  return {
    version: CURRENT_VERSION,
    projects: [],
    recentReminders: [],
    settings: { keepAwake: true }
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);

function sanitizeReminder(r: unknown): Reminder | null {
  if (!isObj(r)) return null;
  const every = Math.max(1, Math.round(num(r.every, 1)));
  const out: Reminder = {
    id: str(r.id) || Math.random().toString(36).slice(2),
    text: str(r.text),
    every,
    target: Math.round(num(r.target, every)),
    repeat: r.repeat === true
  };
  if (typeof r.firedAt === 'number') out.firedAt = r.firedAt;
  return out;
}

function sanitizeCounter(c: unknown): Counter | null {
  if (!isObj(c)) return null;
  return {
    id: str(c.id) || Math.random().toString(36).slice(2),
    label: str(c.label),
    count: Math.max(0, Math.round(num(c.count))),
    reminders: Array.isArray(c.reminders)
      ? c.reminders.map(sanitizeReminder).filter((x): x is Reminder => x !== null)
      : []
  };
}

function sanitizeProject(p: unknown): Project | null {
  if (!isObj(p)) return null;
  const now = Date.now();
  const counters = Array.isArray(p.counters)
    ? p.counters.map(sanitizeCounter).filter((x): x is Counter => x !== null)
    : [];
  return {
    id: str(p.id) || Math.random().toString(36).slice(2),
    name: str(p.name, 'Project'),
    createdAt: num(p.createdAt, now),
    updatedAt: num(p.updatedAt, now),
    counters
  };
}

function sanitizeRecent(r: unknown): RecentReminder | null {
  // legacy entries (recentReminderTexts) were plain strings
  if (typeof r === 'string') return r.trim() ? { text: r } : null;
  if (!isObj(r) || typeof r.text !== 'string' || !r.text.trim()) return null;
  const out: RecentReminder = { text: r.text };
  if (typeof r.every === 'number' && Number.isFinite(r.every) && Math.round(r.every) >= 1) {
    out.every = Math.round(r.every);
  }
  if (r.repeat === true) out.repeat = true;
  return out;
}

/** Bring any stored shape up to the current version. Never throws. */
export function migrate(raw: unknown): AppData {
  if (!isObj(raw)) return defaultData();
  // Future: if (raw.version === 1) raw = v1ToV2(raw) ...
  const base = defaultData();
  return {
    version: CURRENT_VERSION,
    projects: Array.isArray(raw.projects)
      ? raw.projects.map(sanitizeProject).filter((x): x is Project => x !== null)
      : base.projects,
    recentReminders: (() => {
      const list = Array.isArray(raw.recentReminders)
        ? raw.recentReminders
        : Array.isArray(raw.recentReminderTexts)
          ? raw.recentReminderTexts
          : base.recentReminders;
      return list.map(sanitizeRecent).filter((x): x is RecentReminder => x !== null).slice(0, MAX_RECENT);
    })(),
    settings: {
      keepAwake: isObj(raw.settings) && typeof raw.settings.keepAwake === 'boolean'
        ? raw.settings.keepAwake
        : base.settings.keepAwake
    }
  };
}

export function parse(json: string | null): AppData {
  if (!json) return defaultData();
  try {
    return migrate(JSON.parse(json));
  } catch {
    return defaultData();
  }
}

export function load(): AppData {
  try {
    return parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return defaultData();
  }
}

export function save(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode — nothing sensible to do */
  }
}
