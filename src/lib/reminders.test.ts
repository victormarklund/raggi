import { describe, expect, it } from 'vitest';
import type { Counter } from './types';
import { createReminder, nextReminder, onDecrement, onIncrement, onReset, onSet, pushRecent } from './reminders';
import type { RecentReminder } from './types';

const counter = (count = 0): Counter => ({ id: 'c', label: 'Rows', count, reminders: [] });

function inc(c: Counter) {
  c.count++;
  return onIncrement(c);
}
function dec(c: Counter) {
  c.count--;
  onDecrement(c);
}

describe('one-shot reminders', () => {
  it('fires exactly once when the target is reached', () => {
    const c = counter(10);
    c.reminders.push(createReminder(c.count, 'Decrease', 3, false));
    expect(inc(c)).toHaveLength(0);
    expect(inc(c)).toHaveLength(0);
    const hits = inc(c);
    expect(hits.map((h) => h.text)).toEqual(['Decrease']);
    expect(c.count).toBe(13);
    expect(inc(c)).toHaveLength(0);
  });

  it('re-arms when undone below the target', () => {
    const c = counter(0);
    c.reminders.push(createReminder(0, 'x', 2, false));
    inc(c);
    expect(inc(c)).toHaveLength(1);
    dec(c);
    expect(c.reminders[0].firedAt).toBeUndefined();
    expect(inc(c)).toHaveLength(1);
  });
});

describe('repeating reminders', () => {
  it('fires every N counts', () => {
    const c = counter(0);
    c.reminders.push(createReminder(0, 'Increase', 4, true));
    const fires: number[] = [];
    for (let i = 0; i < 12; i++) if (inc(c).length) fires.push(c.count);
    expect(fires).toEqual([4, 8, 12]);
  });

  it('steps back on undo so the same row fires again', () => {
    const c = counter(0);
    c.reminders.push(createReminder(0, 'Increase', 4, true));
    for (let i = 0; i < 4; i++) inc(c);
    expect(c.reminders[0].target).toBe(8);
    dec(c);
    expect(c.reminders[0].target).toBe(4);
    expect(inc(c)).toHaveLength(1);
  });

  it('restarts on reset', () => {
    const c = counter(0);
    c.reminders.push(createReminder(0, 'x', 3, true));
    for (let i = 0; i < 7; i++) inc(c);
    c.count = 0;
    onReset(c);
    expect(c.reminders[0].target).toBe(3);
  });
});

describe('nextReminder', () => {
  it('picks the nearest pending reminder', () => {
    const c = counter(5);
    c.reminders.push(createReminder(5, 'far', 10, false), createReminder(5, 'near', 2, true));
    expect(nextReminder(c)?.text).toBe('near');
  });
  it('ignores fired one-shots', () => {
    const c = counter(0);
    c.reminders.push(createReminder(0, 'a', 1, false));
    inc(c);
    expect(nextReminder(c)).toBeUndefined();
  });
});

function set(c: Counter, n: number) {
  const prev = c.count;
  c.count = n;
  onSet(c, prev);
}

describe('setting the count directly', () => {
  it('consumes one-shot reminders jumped past without firing, re-arms below', () => {
    const c = counter(0);
    c.reminders.push(createReminder(0, 'x', 5, false));
    set(c, 8);
    expect(c.reminders[0].firedAt).toBeDefined();
    expect(inc(c)).toHaveLength(0);
    set(c, 2);
    expect(c.reminders[0].firedAt).toBeUndefined();
    set(c, 4);
    expect(inc(c)).toHaveLength(1);
  });

  it('keeps repeating reminders on their cycle', () => {
    const c = counter(0);
    c.reminders.push(createReminder(0, 'r', 4, true));
    set(c, 10);
    expect(c.reminders[0].target).toBe(12);
    set(c, 5);
    expect(c.reminders[0].target).toBe(8);
    set(c, 7);
    expect(inc(c)).toHaveLength(1);
  });

  it('jumping onto a target does not fire, but stepping back and forward does', () => {
    const c = counter(0);
    c.reminders.push(createReminder(0, 'r', 4, true));
    set(c, 4);
    expect(c.reminders[0].target).toBe(8);
    dec(c);
    expect(inc(c)).toHaveLength(1);
  });
});

describe('pushRecent', () => {
  it('dedupes case-insensitively, most recent first, max 3', () => {
    let list: RecentReminder[] = [];
    for (const t of ['A', 'b', 'c', 'B', 'd']) list = pushRecent(list, { text: t, every: 2 });
    expect(list.map((r) => r.text)).toEqual(['d', 'B', 'c']);
  });
  it('remembers the latest count and mode for a text', () => {
    let list: RecentReminder[] = [];
    list = pushRecent(list, { text: 'Decrease', every: 4 });
    list = pushRecent(list, { text: ' decrease ', every: 6, repeat: true });
    expect(list).toEqual([{ text: 'decrease', every: 6, repeat: true }]);
  });
  it('ignores blank text', () => {
    expect(pushRecent([{ text: 'a', every: 1 }], { text: '   ', every: 3 })).toEqual([
      { text: 'a', every: 1 }
    ]);
  });
});
