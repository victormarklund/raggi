<script lang="ts">
  import type { Counter } from '../lib/types';
  import { nextReminder } from '../lib/reminders';
  import Icon from './Icon.svelte';

  let { counter, onclick, small = false }: { counter: Counter; onclick: () => void; small?: boolean } = $props();

  const next = $derived(nextReminder(counter));
  const extra = $derived(
    counter.reminders.filter((r) => r.repeat || r.firedAt === undefined).length - (next ? 1 : 0)
  );
</script>

{#if next}
  <button
    class="chip"
    class:small
    onclick={(e) => {
      e.stopPropagation();
      onclick();
    }}
    aria-label="Reminder in {next.target - counter.count}: {next.text}"
  >
    <span class="in">{next.target - counter.count}</span>
    <span class="text">{next.text}</span>
    {#if next.repeat}<span class="rep"><Icon name="repeat" size={14} /></span>{/if}
    {#if extra > 0}<span class="extra">+{extra}</span>{/if}
  </button>
{/if}

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    max-width: 100%;
    min-height: 40px;
    padding: 4px 14px 4px 4px;
    border-radius: 999px;
    background: var(--moss-soft);
    color: var(--ink-soft);
    font-size: 15px;
    font-weight: 600;
    transition: transform 0.25s var(--ease);
  }
  .chip.small {
    min-height: 32px;
    gap: 6px;
    padding: 3px 10px 3px 3px;
    font-size: 13px;
  }
  .small .in {
    min-width: 26px;
    height: 26px;
    padding: 0 6px;
  }
  .chip:active {
    transform: scale(0.96);
  }
  .in {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: var(--moss);
    color: var(--bg-elevated);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }
  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .rep {
    color: var(--moss);
    display: grid;
  }
  .extra {
    color: var(--muted);
    font-size: 13px;
  }
</style>
