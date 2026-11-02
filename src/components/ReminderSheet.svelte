<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade, scale } from 'svelte/transition';
  import type { Counter, RecentReminder } from '../lib/types';
  import { addReminder, app, removeReminder } from '../lib/store.svelte';
  import { dur } from '../lib/motion';
  import Sheet from './Sheet.svelte';
  import Stepper from './Stepper.svelte';
  import Segmented from './Segmented.svelte';
  import TextField from './TextField.svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';

  let {
    open = $bindable(false),
    projectId,
    counter
  }: { open?: boolean; projectId: string; counter: Counter } = $props();

  let mode = $state<'once' | 'repeat'>('once');
  let every = $state(4);
  let text = $state('');

  const active = $derived(counter.reminders.filter((r) => r.repeat || r.firedAt === undefined));
  const canSave = $derived(text.trim().length > 0 && every >= 1);

  // fresh form each time the sheet opens
  $effect(() => {
    if (open) {
      text = '';
      mode = 'once';
    }
  });

  const unit = $derived((counter.label || 'rows').toLowerCase());

  function pick(r: RecentReminder) {
    text = r.text;
    if (r.every !== undefined) {
      every = r.every;
      mode = r.repeat ? 'repeat' : 'once';
    }
  }

  function isSelected(r: RecentReminder) {
    if (r.text !== text.trim()) return false;
    return r.every === undefined || (r.every === every && !!r.repeat === (mode === 'repeat'));
  }

  function recentLabel(r: RecentReminder) {
    if (r.every === undefined) return r.text;
    return `${r.text}, ${r.repeat ? 'every' : 'in'} ${r.every} ${unit}`;
  }

  function save() {
    if (!canSave) return;
    addReminder(projectId, counter.id, text, every, mode === 'repeat');
    open = false;
  }
</script>

<Sheet bind:open title="Reminder">
  {#if active.length}
    <ul class="existing">
      {#each active as r (r.id)}
        <li animate:flip={{ duration: dur(300) }} out:fade={{ duration: dur(180) }}>
          <span class="badge">
            {#if r.repeat}<Icon name="repeat" size={14} />{/if}
            {r.repeat ? r.every : r.target - counter.count}
          </span>
          <span class="txt">{r.text}</span>
          <button class="del" aria-label="Delete reminder" onclick={() => removeReminder(projectId, counter.id, r.id)}>
            <Icon name="x" size={18} />
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="form">
    <Segmented
      bind:value={mode}
      label="Reminder type"
      options={[
        { value: 'once', label: 'In' },
        { value: 'repeat', label: 'Every' }
      ]}
    />

    <div class="amount">
      <Stepper bind:value={every} />
      <span class="unit">{unit}</span>
    </div>

    <TextField bind:value={text} label="Reminder text" placeholder="Decrease, change colour…" onsubmit={save} />

    {#if app.recentReminders.length}
      <div class="recent">
        {#each app.recentReminders as r (r.text)}
          <button
            class="pill"
            class:selected={isSelected(r)}
            aria-label={recentLabel(r)}
            in:scale={{ duration: dur(220), start: 0.85 }}
            onclick={() => pick(r)}
          >
            <span class="pill-text">{r.text}</span>
            {#if r.every !== undefined}
              <span class="pill-count" aria-hidden="true">
                {#if r.repeat}<Icon name="repeat" size={12} />{/if}
                {r.every}
              </span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}

    <Button disabled={!canSave} onclick={save}>
      <Icon name="bell" size={20} />
      Set reminder
    </Button>
  </div>
</Sheet>

<style>
  .existing {
    list-style: none;
    margin: 0 0 var(--sp-4);
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }
  li {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    min-height: 52px;
    padding: 0 4px 0 var(--sp-2);
    border-radius: var(--r-sm);
    background: var(--moss-soft);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    min-width: 36px;
    height: 32px;
    padding: 0 10px;
    justify-content: center;
    border-radius: 999px;
    background: var(--moss);
    color: var(--bg-elevated);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-size: 15px;
  }
  .txt {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .del {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    color: var(--muted);
  }
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }
  .amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--sp-2) 0;
  }
  .unit {
    color: var(--muted);
    font-weight: 600;
    font-size: 15px;
  }
  .recent {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
    margin-top: calc(var(--sp-1) * -1);
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    max-width: 100%;
    min-height: 40px;
    padding: 0 var(--sp-4);
    border-radius: 999px;
    background: var(--sand);
    font-weight: 600;
    font-size: 15px;
    color: var(--ink-soft);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: transform 0.2s var(--ease), background-color 0.2s ease, color 0.2s ease;
  }
  .pill-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pill-count {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    margin-right: calc(var(--sp-2) * -1);
    justify-content: center;
    border-radius: 999px;
    background: var(--sand-strong);
    color: var(--ink);
    font-weight: 700;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  .pill.selected .pill-count {
    background: var(--bg);
    color: var(--ink);
  }
  .pill:active {
    transform: scale(0.95);
  }
  .pill.selected {
    background: var(--ink);
    color: var(--bg);
  }
</style>
