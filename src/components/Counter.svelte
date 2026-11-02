<script lang="ts">
  import { flushSync } from 'svelte';
  import { Spring } from 'svelte/motion';
  import { autofocus } from '../lib/focus';
  import type { Counter } from '../lib/types';
  import {
    decrement,
    fired,
    increment,
    removeCounter,
    renameCounter,
    resetCounter
  } from '../lib/store.svelte';
  import { reducedMotion } from '../lib/motion';
  import Icon from './Icon.svelte';
  import IconButton from './IconButton.svelte';
  import RollingNumber from './RollingNumber.svelte';
  import ReminderChip from './ReminderChip.svelte';
  import ReminderSheet from './ReminderSheet.svelte';
  import SetCountSheet from './SetCountSheet.svelte';
  import ActionMenu from './ActionMenu.svelte';
  import ConfirmSheet from './ConfirmSheet.svelte';

  let {
    projectId,
    counter,
    compact = false,
    removable = true,
    autoEdit = false
  }: { projectId: string; counter: Counter; compact?: boolean; removable?: boolean; autoEdit?: boolean } = $props();

  const press = new Spring(1, { stiffness: 0.35, damping: 0.55 });

  let card: HTMLElement;
  let moreBtn = $state<HTMLElement>();
  let labelInput = $state<HTMLInputElement>();
  // svelte-ignore state_referenced_locally
  let editing = $state(autoEdit);
  // svelte-ignore state_referenced_locally
  let draft = $state(counter.label);
  let reminderOpen = $state(false);
  let setCountOpen = $state(false);
  let menuOpen = $state(false);
  let confirm = $state<'reset' | 'remove' | null>(null);
  let ripples = $state<{ id: number; x: number; y: number }[]>([]);
  let glowing = $state(false);
  let rippleId = 0;

  // glow briefly when one of this counter's reminders fires
  let lastGlow = 0;
  $effect(() => {
    const t = fired.glow[counter.id];
    if (!t || t === lastGlow) return;
    lastGlow = t;
    glowing = true;
    const timer = setTimeout(() => (glowing = false), 1400);
    return () => clearTimeout(timer);
  });

  function onPointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('button, input')) return;
    press.target = 0.965;
  }
  function onPointerUp() {
    press.target = 1;
  }

  function onTap(e: MouseEvent) {
    if (editing) return;
    if ((e.target as HTMLElement).closest('button, input')) return;
    increment(projectId, counter.id);
    if (!reducedMotion()) {
      const r = card.getBoundingClientRect();
      const id = ++rippleId;
      const x = e.clientX ? e.clientX - r.left : r.width / 2;
      const y = e.clientY ? e.clientY - r.top : r.height / 2;
      ripples = [...ripples.slice(-3), { id, x, y }];
      setTimeout(() => (ripples = ripples.filter((p) => p.id !== id)), 650);
    }
    // a little bounce even on fast taps
    press.set(0.975, { instant: true });
    press.target = 1;
  }

  function onKey(e: KeyboardEvent) {
    if (e.target !== card) return;
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === '+') {
      e.preventDefault();
      increment(projectId, counter.id);
    } else if (e.key === 'ArrowDown' || e.key === '-' || e.key === 'Backspace') {
      e.preventDefault();
      decrement(projectId, counter.id);
    }
  }

  function startEdit(): void {
    draft = counter.label;
    flushSync(() => (editing = true));
    labelInput?.focus();
  }
  function commitEdit() {
    if (!editing) return;
    editing = false;
    renameCounter(projectId, counter.id, draft);
  }

  const menuItems = $derived([
    { label: 'Rename', icon: 'pencil' as const, action: startEdit },
    { label: 'Set count', icon: 'hash' as const, action: (): void => {
        setCountOpen = true;
      } },
    { label: 'Reminder', icon: 'bell' as const, action: (): void => {
        reminderOpen = true;
      } },
    {
      label: 'Reset',
      icon: 'reset' as const,
      disabled: counter.count === 0,
      action: (): void => {
        confirm = 'reset';
      }
    },
    ...(removable
      ? [{ label: 'Remove', icon: 'trash' as const, danger: true, action: (): void => {
            confirm = 'remove';
          } }]
      : [])
  ]);
</script>

<div
  bind:this={card}
  class="counter"
  class:compact
  class:glowing
  role="button"
  tabindex="0"
  aria-label="{counter.label || 'Counter'}: {counter.count}. Tap to add one."
  style="transform: scale({press.current})"
  onpointerdown={onPointerDown}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
  onpointerleave={onPointerUp}
  onclick={onTap}
  onkeydown={onKey}
>
  {#each ripples as r (r.id)}
    <span class="ripple" style="left:{r.x}px; top:{r.y}px"></span>
  {/each}

  <div class="top">
    {#if editing}
      <input
        bind:this={labelInput}
        bind:value={draft}
        class="label-input"
        use:autofocus
        placeholder="Label"
        maxlength="30"
        aria-label="Counter label"
        enterkeyhint="done"
        onblur={commitEdit}
        onkeydown={(e) => {
          if (e.key === 'Enter') labelInput?.blur();
          if (e.key === 'Escape') {
            draft = counter.label;
            labelInput?.blur();
          }
        }}
      />
    {:else}
      <button class="label" class:empty={!counter.label} onclick={startEdit}>
        {counter.label || 'Label'}
      </button>
    {/if}
    {#if compact}
      <div class="chip-top">
        <ReminderChip {counter} small onclick={() => (reminderOpen = true)} />
      </div>
    {/if}
    <div class="actions">
      <IconButton label="Reminder" onclick={() => (reminderOpen = true)}>
        <Icon name="bell" />
      </IconButton>
      <span bind:this={moreBtn}>
        <IconButton label="More" onclick={() => (menuOpen = true)}>
          <Icon name="more" />
        </IconButton>
      </span>
    </div>
  </div>

  {#snippet minus()}
    <IconButton
      label="Subtract one"
      variant="soft"
      size={compact ? 48 : 56}
      disabled={counter.count === 0}
      onclick={() => decrement(projectId, counter.id)}
    >
      <Icon name="minus" size={compact ? 22 : 26} stroke={2.6} />
    </IconButton>
  {/snippet}

  <div class="middle">
    {#if compact}<div class="minus-side">{@render minus()}</div>{/if}
    <div class="count">
      <span class="count-inner" style="--digits:{Math.max(2, String(counter.count).length)}">
        <RollingNumber value={counter.count} />
      </span>
    </div>
  </div>
  <span class="visually-hidden" aria-live="polite">{counter.count}</span>

  {#if !compact}
    <div class="bottom">
      {@render minus()}
      <div class="chip-wrap">
        <ReminderChip {counter} onclick={() => (reminderOpen = true)} />
      </div>
    </div>
  {/if}
</div>

<ReminderSheet bind:open={reminderOpen} {projectId} {counter} />
<SetCountSheet bind:open={setCountOpen} {projectId} {counter} />

{#if menuOpen && moreBtn}
  <ActionMenu anchor={moreBtn} items={menuItems} onclose={() => (menuOpen = false)} />
{/if}

{#if confirm}
  <ConfirmSheet
    title={confirm === 'reset' ? `Reset ${counter.label || 'counter'} to 0?` : `Remove ${counter.label || 'this counter'}?`}
    confirmLabel={confirm === 'reset' ? 'Reset' : 'Remove'}
    oncancel={() => (confirm = null)}
    onconfirm={() => {
      if (confirm === 'reset') resetCounter(projectId, counter.id);
      else removeCounter(projectId, counter.id);
      confirm = null;
    }}
  />
{/if}

<style>
  .counter {
    position: relative;
    overflow: hidden;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: var(--sp-3) var(--sp-3) var(--sp-4) var(--sp-5);
    background: var(--card);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-md);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    will-change: transform;
    transition: box-shadow 0.6s var(--ease);
  }
  .counter.compact {
    padding: var(--sp-2) var(--sp-2) var(--sp-3) var(--sp-4);
    border-radius: var(--r-md);
  }
  .counter.glowing {
    box-shadow: var(--shadow-md), 0 0 0 3px var(--moss), 0 0 40px color-mix(in srgb, var(--moss) 45%, transparent);
  }
  .ripple {
    position: absolute;
    width: 30px;
    height: 30px;
    margin: -15px 0 0 -15px;
    border-radius: 50%;
    background: var(--sand);
    pointer-events: none;
    animation: ripple 0.65s var(--ease-out) forwards;
  }
  @keyframes ripple {
    from { transform: scale(0.4); opacity: 0.9; }
    to { transform: scale(14); opacity: 0; }
  }
  .top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-2);
    min-height: 44px;
  }
  .label,
  .label-input {
    min-width: 0;
    flex: 1;
    height: 40px;
    font-size: 17px;
    font-weight: 650;
    color: var(--muted);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.01em;
  }
  .label.empty {
    color: var(--faint);
  }
  .label-input {
    border: 0;
    border-radius: 10px;
    padding: 0 10px;
    margin-left: -10px;
    background: var(--bg);
    color: var(--ink);
    -webkit-user-select: text;
    user-select: text;
  }
  .actions {
    display: flex;
    flex-shrink: 0;
  }
  .middle {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
  }
  .minus-side {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
  }
  .chip-top {
    flex: 0 1 auto;
    min-width: 0;
    max-width: 48%;
    display: flex;
  }
  .compact .label,
  .compact .label-input {
    flex: 1 1 auto;
  }
  /* The number scales with whatever space the card gets. */
  .count {
    position: relative;
    flex: 1;
    min-height: 0;
    container-type: size;
    display: grid;
    place-items: center;
    pointer-events: none;
  }
  .count-inner {
    /* height-bound, width-bound (≈0.62em per tabular digit), and a hard cap */
    font-size: max(36px, min(78cqh, calc(80cqw / (var(--digits) * 0.62)), 220px));
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .bottom {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    min-height: 48px;
  }
  .chip-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: flex-end;
  }
  .counter :global(button:disabled) {
    opacity: 0.35;
  }
</style>
