<script lang="ts">
  import type { Project } from '../lib/types';
  import Icon from './Icon.svelte';

  let {
    project,
    onopen,
    ondelete
  }: { project: Project; onopen: () => void; ondelete: () => void } = $props();

  const REVEAL = 88;
  let x = $state(0);
  let dragging = $state(false);
  let pressed = $state(false);
  let startX = 0;
  let startY = 0;
  let base = 0;
  let axis: 'x' | 'y' | null = null;
  let suppressClick = false;

  const main = $derived(project.counters[0]?.count ?? 0);
  const extra = $derived(project.counters.length - 1);
  const when = $derived(relative(project.updatedAt));

  function relative(ts: number) {
    const day = 86_400_000;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    if (ts >= startOfToday) return 'Today';
    const days = Math.ceil((startOfToday - ts) / day);
    if (days <= 1) return 'Yesterday';
    if (days < 7) return new Date(ts).toLocaleDateString(undefined, { weekday: 'long' });
    return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  function down(e: PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    base = x;
    axis = null;
    pressed = true;
    suppressClick = false;
  }
  function move(e: PointerEvent) {
    if (!pressed) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis === 'x') {
        dragging = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } else {
        pressed = false;
        return;
      }
    }
    suppressClick = true;
    let next = base + dx;
    if (next > 0) next = next / 4;
    if (next < -REVEAL) next = -REVEAL + (next + REVEAL) / 3;
    x = next;
  }
  function up() {
    pressed = false;
    if (!dragging) return;
    dragging = false;
    x = x < -REVEAL / 2 ? -REVEAL : 0;
  }
  function click() {
    if (suppressClick) return;
    if (x !== 0) {
      x = 0;
      return;
    }
    onopen();
  }
</script>

<div class="row-wrap">
  <button class="delete" aria-label="Delete {project.name}" tabindex={x === 0 ? -1 : 0} onclick={ondelete}>
    <Icon name="trash" size={22} />
  </button>
  <button
    class="row"
    class:dragging
    class:pressed={pressed && !dragging}
    style="transform: translateX({x}px)"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    onclick={click}
  >
    <span class="info">
      <span class="name">{project.name}</span>
      <span class="sub">
        {when}{#if extra > 0}<span class="dot">·</span>{extra + 1} counters{/if}
      </span>
    </span>
    <span class="count">{main}</span>
  </button>
</div>

<style>
  .row-wrap {
    position: relative;
    border-radius: var(--r-md);
    overflow: hidden;
    background: var(--clay-soft);
  }
  .delete {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 88px;
    display: grid;
    place-items: center;
    color: var(--danger);
  }
  .row {
    position: relative;
    width: 100%;
    min-height: 80px;
    display: flex;
    align-items: center;
    gap: var(--sp-4);
    padding: var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-5);
    background: var(--card);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    text-align: left;
    touch-action: pan-y;
    transition: transform 0.45s var(--ease), background-color 0.2s ease;
  }
  .row.dragging {
    transition: none;
  }
  .row.pressed {
    background: color-mix(in srgb, var(--card) 70%, var(--sand));
  }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .name {
    font-size: 18px;
    font-weight: 650;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    font-size: 14px;
    font-weight: 500;
    color: var(--muted);
  }
  .dot {
    margin: 0 6px;
  }
  .count {
    min-width: 56px;
    height: 56px;
    padding: 0 var(--sp-3);
    border-radius: 18px;
    display: grid;
    place-items: center;
    background: var(--bg);
    font-size: 24px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
</style>
