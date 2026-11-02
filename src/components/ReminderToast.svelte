<script lang="ts">
  import { fade } from 'svelte/transition';
  import { dismissToast, fired } from '../lib/store.svelte';
  import { router } from '../lib/router.svelte';
  import { dur } from '../lib/motion';
  import Ghost from './pixel/Ghost.svelte';
  import Icon from './Icon.svelte';

  // Only show toasts for the project on screen.
  const visible = $derived(
    router.route.name === 'project'
      ? fired.list.filter((f) => f.projectId === (router.route as { id: string }).id)
      : []
  );
  const current = $derived(visible[0]);

  let dragY = $state(0);
  let dragging = $state(false);
  let startY = 0;
  let moved = false;

  function down(e: PointerEvent) {
    dragging = true;
    moved = false;
    startY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (!dragging) return;
    const dy = e.clientY - startY;
    if (Math.abs(dy) > 4) moved = true;
    dragY = dy < 0 ? dy : dy / 5;
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    if (!moved || dragY < -40) dismiss();
    dragY = 0;
  }
  function dismiss() {
    if (current) dismissToast(current.key);
  }

  /** Drops in from above with a soft overshoot so it catches the eye. */
  function drop(node: HTMLElement, { out = false } = {}) {
    const from = dragY;
    if (out) {
      return {
        duration: dur(320),
        easing: (t: number) => t * t,
        css: (t: number, u: number) =>
          `transform: translateY(calc(${-u * 130}% + ${from}px)) scale(${0.96 + 0.04 * t}); opacity:${t}`
      };
    }
    return {
      duration: dur(640),
      css: (t: number) => {
        // easeOutBack
        const c = 1.5;
        const e = 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
        return `transform: translateY(${(1 - e) * -140}%) scale(${0.9 + 0.1 * e}); opacity:${Math.min(1, t * 3)}`;
      }
    };
  }
</script>

{#if current}
  <!-- Dim the page: the next tap acknowledges the reminder instead of counting past it. -->
  <div class="scrim" transition:fade={{ duration: dur(250) }} onclick={dismiss} role="presentation"></div>
{/if}

<div class="toast-zone" aria-live="assertive">
  {#key current?.key}
    {#if current}
      <div
        class="toast"
        class:dragging
        style="transform: translateY({dragY}px)"
        role="alert"
        onpointerdown={down}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
        in:drop
        out:drop={{ out: true }}
      >
        <div class="main">
          <div class="ghost"><span class="hop"><Ghost scale={4} mood="happy" shadow={false} /></span></div>
          <div class="body">
            <span class="meta">{current.counterLabel ? `${current.counterLabel} · ` : ''}{current.count}</span>
            <span class="text">{current.text}</span>
          </div>
          {#if visible.length > 1}
            <span class="more">{visible.length}</span>
          {/if}
        </div>
        <button class="ok" onclick={(e) => { e.stopPropagation(); dismiss(); }}>
          <Icon name="check" size={22} stroke={2.8} />
          Got it
        </button>
      </div>
    {/if}
  {/key}
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 39;
    background: color-mix(in srgb, var(--bg) 55%, transparent);
    -webkit-backdrop-filter: blur(3px) saturate(0.8);
    backdrop-filter: blur(3px) saturate(0.8);
  }
  .toast-zone {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 40;
    padding: calc(var(--safe-top) + var(--sp-2)) calc(var(--sp-3) + var(--safe-right)) 0 calc(var(--sp-3) + var(--safe-left));
    pointer-events: none;
    display: grid;
  }
  .toast {
    grid-area: 1 / 1;
    pointer-events: auto;
    touch-action: none;
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    padding: var(--sp-4);
    border-radius: var(--r-xl);
    background: var(--moss);
    color: var(--bg-elevated);
    box-shadow: var(--shadow-lg), 0 0 0 0 color-mix(in srgb, var(--moss) 50%, transparent);
    transition: transform 0.4s var(--ease);
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    animation: pulse 2.4s ease-out 0.7s infinite;
  }
  .toast.dragging {
    transition: none;
  }
  @keyframes pulse {
    0% { box-shadow: var(--shadow-lg), 0 0 0 0 color-mix(in srgb, var(--moss) 55%, transparent); }
    70%, 100% { box-shadow: var(--shadow-lg), 0 0 0 18px color-mix(in srgb, var(--moss) 0%, transparent); }
  }
  .main {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
  }
  .ghost {
    flex-shrink: 0;
    width: 76px;
    height: 76px;
    border-radius: 24px;
    background: color-mix(in srgb, var(--bg-elevated) 22%, transparent);
    display: grid;
    place-items: center;
  }
  .hop {
    display: block;
    animation: hop 0.9s var(--ease-out) 0.35s 2;
  }
  @keyframes hop {
    0%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
  }
  .body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .meta {
    font-size: 14px;
    font-weight: 650;
    opacity: 0.8;
    font-variant-numeric: tabular-nums;
  }
  .text {
    font-size: 24px;
    font-weight: 750;
    line-height: 1.15;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }
  .more {
    align-self: flex-start;
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    border-radius: 999px;
    background: var(--bg-elevated);
    color: var(--moss);
    font-size: 14px;
    font-weight: 750;
    display: grid;
    place-items: center;
  }
  .ok {
    min-height: 54px;
    border-radius: var(--r-md);
    background: var(--bg-elevated);
    color: var(--ink);
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-2);
    transition: transform 0.2s var(--ease);
  }
  .ok:active {
    transform: scale(0.97);
  }
  @media (prefers-color-scheme: dark) {
    .toast {
      color: #1d1a17;
    }
    .ok {
      background: #1d1a17;
      color: var(--ink);
    }
  }
</style>
