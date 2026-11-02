import type { AppData, Counter, Project, Reminder } from './types';
import { STORAGE_KEY, load, parse, save } from './storage';
import { uid } from './id';
import { createReminder, onDecrement, onIncrement, onReset, onSet, pushRecent } from './reminders';
import { haptic } from './haptics';

export const DEFAULT_COUNTER_LABEL = 'Rows';

export const app: AppData = $state(load());

export interface FiredReminder {
  key: string;
  projectId: string;
  counterId: string;
  counterLabel: string;
  reminderId: string;
  text: string;
  count: number;
}

/** Fired reminders waiting to be acknowledged (shown as toasts). */
export const fired: { list: FiredReminder[]; glow: Record<string, number> } = $state({
  list: [],
  glow: {}
});

// ---- persistence -----------------------------------------------------------

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let dirty = false;

function flush() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = undefined;
  if (!dirty) return;
  dirty = false;
  save($state.snapshot(app) as AppData);
}

function scheduleSave() {
  dirty = true;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 150);
}

export function initPersistence() {
  $effect.root(() => {
    $effect(() => {
      // deep read so the effect tracks every nested change
      JSON.stringify(app);
      scheduleSave();
    });
  });
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const next = parse(e.newValue);
    app.projects = next.projects;
    app.recentReminders = next.recentReminders;
    app.settings = next.settings;
    dirty = false;
  });
  navigator.storage?.persist?.().catch(() => {});
}

// ---- selectors -------------------------------------------------------------

export function getProject(id: string | undefined): Project | undefined {
  return id ? app.projects.find((p) => p.id === id) : undefined;
}

export function sortedProjects(): Project[] {
  return [...app.projects].sort((a, b) => b.updatedAt - a.updatedAt);
}

function locate(projectId: string, counterId: string) {
  const project = getProject(projectId);
  const counter = project?.counters.find((c) => c.id === counterId);
  return { project, counter };
}

function touch(p: Project) {
  p.updatedAt = Date.now();
}

// ---- actions ---------------------------------------------------------------

function newCounter(label = DEFAULT_COUNTER_LABEL): Counter {
  return { id: uid(), label, count: 0, reminders: [] };
}

export function createProject(name: string): Project {
  const now = Date.now();
  const project: Project = {
    id: uid(),
    name: name.trim() || 'New project',
    createdAt: now,
    updatedAt: now,
    counters: [newCounter()]
  };
  app.projects.push(project);
  return app.projects[app.projects.length - 1];
}

export function renameProject(id: string, name: string) {
  const p = getProject(id);
  if (p && name.trim()) {
    p.name = name.trim();
    touch(p);
  }
}

export function deleteProject(id: string) {
  const i = app.projects.findIndex((p) => p.id === id);
  if (i >= 0) app.projects.splice(i, 1);
  fired.list = fired.list.filter((f) => f.projectId !== id);
}

export function addCounter(projectId: string, label = ''): Counter | undefined {
  const p = getProject(projectId);
  if (!p) return;
  p.counters.push(newCounter(label));
  touch(p);
  return p.counters[p.counters.length - 1];
}

export function renameCounter(projectId: string, counterId: string, label: string) {
  const { project, counter } = locate(projectId, counterId);
  if (project && counter) {
    counter.label = label.trim();
    touch(project);
  }
}

export function removeCounter(projectId: string, counterId: string) {
  const p = getProject(projectId);
  if (!p || p.counters.length <= 1) return;
  const i = p.counters.findIndex((c) => c.id === counterId);
  if (i >= 0) p.counters.splice(i, 1);
  touch(p);
}

export function increment(projectId: string, counterId: string) {
  const { project, counter } = locate(projectId, counterId);
  if (!project || !counter) return;
  counter.count += 1;
  touch(project);
  const hits = onIncrement(counter);
  if (hits.length) {
    haptic('success');
    fireToasts(project, counter, hits);
  } else {
    haptic('tap');
  }
}

export function decrement(projectId: string, counterId: string) {
  const { project, counter } = locate(projectId, counterId);
  if (!project || !counter || counter.count <= 0) return;
  counter.count -= 1;
  onDecrement(counter);
  touch(project);
  haptic('tap');
  // a toast for a count we've now undone is no longer relevant
  fired.list = fired.list.filter((f) => !(f.counterId === counterId && f.count > counter.count));
}

export function setCount(projectId: string, counterId: string, value: number) {
  const { project, counter } = locate(projectId, counterId);
  if (!project || !counter || !Number.isFinite(value)) return;
  const next = Math.max(0, Math.round(value));
  const prev = counter.count;
  if (next === prev) return;
  counter.count = next;
  onSet(counter, prev);
  touch(project);
  haptic('tap');
  fired.list = fired.list.filter((f) => !(f.counterId === counterId && f.count > next));
}

export function resetCounter(projectId: string, counterId: string) {
  const { project, counter } = locate(projectId, counterId);
  if (!project || !counter) return;
  counter.count = 0;
  onReset(counter);
  touch(project);
  fired.list = fired.list.filter((f) => f.counterId !== counterId);
}

export function resetProject(projectId: string) {
  const p = getProject(projectId);
  p?.counters.forEach((c) => resetCounter(projectId, c.id));
}

export function addReminder(projectId: string, counterId: string, text: string, every: number, repeat: boolean) {
  const { project, counter } = locate(projectId, counterId);
  if (!project || !counter || !text.trim() || every < 1) return;
  counter.reminders.push(createReminder(counter.count, text, every, repeat));
  app.recentReminders = pushRecent(app.recentReminders, { text, every, repeat });
  touch(project);
}

export function removeReminder(projectId: string, counterId: string, reminderId: string) {
  const { project, counter } = locate(projectId, counterId);
  if (!project || !counter) return;
  counter.reminders = counter.reminders.filter((r) => r.id !== reminderId);
  touch(project);
}

export function toggleKeepAwake() {
  app.settings.keepAwake = !app.settings.keepAwake;
}

// ---- toasts ----------------------------------------------------------------

function fireToasts(project: Project, counter: Counter, hits: Reminder[]) {
  for (const r of hits) {
    fired.list.push({
      key: uid(),
      projectId: project.id,
      counterId: counter.id,
      counterLabel: counter.label,
      reminderId: r.id,
      text: r.text,
      count: counter.count
    });
  }
  fired.glow[counter.id] = Date.now();
}

/** Acknowledge a toast. A spent one-shot reminder is cleaned up at this point. */
export function dismissToast(key: string) {
  const toast = fired.list.find((f) => f.key === key);
  fired.list = fired.list.filter((f) => f.key !== key);
  if (!toast) return;
  const { counter } = locate(toast.projectId, toast.counterId);
  if (counter) {
    counter.reminders = counter.reminders.filter((r) => !(r.id === toast.reminderId && !r.repeat && r.firedAt !== undefined));
  }
}
