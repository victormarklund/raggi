import { describe, expect, it } from 'vitest';
import { defaultData, migrate, parse } from './storage';

describe('storage', () => {
  it('falls back to defaults on missing or corrupt data', () => {
    expect(parse(null)).toEqual(defaultData());
    expect(parse('{not json')).toEqual(defaultData());
    expect(parse('42')).toEqual(defaultData());
  });

  it('sanitizes partial / malformed records', () => {
    const data = migrate({
      projects: [
        { id: 'p', name: 'Hat', counters: [{ id: 'c', label: 'Rows', count: -3, reminders: [{ text: 'x', every: 0 }] }] },
        'junk'
      ],
      recentReminders: [{ text: 'a', every: 3.4 }, 1, { text: 'b', every: 0, repeat: 'yes' }, { text: 'c', repeat: true }, { text: 'd' }],
      settings: { keepAwake: false }
    });
    expect(data.projects).toHaveLength(1);
    expect(data.projects[0].counters[0].count).toBe(0);
    expect(data.projects[0].counters[0].reminders[0].every).toBe(1);
    expect(data.recentReminders).toEqual([{ text: 'a', every: 3 }, { text: 'b' }, { text: 'c', repeat: true }]);
    expect(data.settings.keepAwake).toBe(false);
  });

  it('migrates legacy text-only recent reminders', () => {
    const data = migrate({ recentReminderTexts: ['a', 7, 'b'] });
    expect(data.recentReminders).toEqual([{ text: 'a' }, { text: 'b' }]);
  });

  it('round-trips current data unchanged', () => {
    const d = defaultData();
    d.projects.push({
      id: 'p',
      name: 'Socks',
      createdAt: 1,
      updatedAt: 2,
      counters: [{ id: 'c', label: 'Rows', count: 7, reminders: [{ id: 'r', text: 'Heel', every: 3, target: 9, repeat: true }] }]
    });
    d.recentReminders.push({ text: 'Heel', every: 3, repeat: true }, { text: 'Gauge', every: 1 });
    expect(parse(JSON.stringify(d))).toEqual(d);
  });
});
