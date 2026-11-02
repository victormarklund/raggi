<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { portal } from '../lib/portal';
  import { dur, iosEase } from '../lib/motion';
  import { keyboard, trackKeyboard } from '../lib/keyboard.svelte';

  let {
    open = $bindable(false),
    title = '',
    onclose,
    children
  }: {
    open?: boolean;
    title?: string;
    onclose?: () => void;
    children: Snippet;
  } = $props();

  trackKeyboard();

  let dragY = $state(0);
  let dragging = $state(false);
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;

  function close() {
    open = false;
    onclose?.();
  }

  function down(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('button, input')) return;
    dragging = true;
    startY = lastY = e.clientY;
    lastT = e.timeStamp;
    velocity = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (!dragging) return;
    const dy = e.clientY - startY;
    // rubber-band upward, free downward
    dragY = dy > 0 ? dy : dy / 6;
    const dt = Math.max(1, e.timeStamp - lastT);
    velocity = (e.clientY - lastY) / dt;
    lastY = e.clientY;
    lastT = e.timeStamp;
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    if (dragY > 120 || velocity > 0.6) {
      close();
    }
    dragY = 0;
  }

  function slide(node: HTMLElement, { duration = 420 } = {}) {
    const from = dragY;
    return {
      duration: dur(duration),
      easing: iosEase,
      css: (t: number) => `transform: translateY(calc(${(1 - t) * 100}% + ${(1 - t) * from}px))`
    };
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) close();
  }
</script>

<svelte:window {onkeydown} />

{#if open}
  <div class="layer" use:portal>
    <div class="scrim" transition:fade={{ duration: dur(300) }} onclick={close} role="presentation"></div>
    <div
      class="sheet"
      class:dragging
      role="dialog"
      aria-modal="true"
      aria-label={title || undefined}
      style="transform: translateY({dragY}px); margin-bottom:{keyboard.inset}px"
      transition:slide
    >
      <div
        class="grab"
        onpointerdown={down}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
        role="presentation"
      >
        <div class="handle"></div>
        {#if title}<h2>{title}</h2>{/if}
      </div>
      <div class="content">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .layer {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .scrim {
    position: absolute;
    inset: 0;
    background: var(--scrim);
  }
  .sheet {
    position: relative;
    background: var(--bg-elevated);
    border-radius: var(--r-xl) var(--r-xl) 0 0;
    box-shadow: var(--shadow-lg);
    padding: 0 var(--sp-5) calc(var(--sp-5) + var(--safe-bottom));
    max-height: calc(100% - var(--safe-top) - 24px);
    display: flex;
    flex-direction: column;
    transition: transform 0.45s var(--ease), margin-bottom 0.25s var(--ease);
    will-change: transform;
  }
  .sheet.dragging {
    transition: none;
  }
  .grab {
    touch-action: none;
    padding: 10px 0 var(--sp-3);
    cursor: grab;
  }
  .handle {
    width: 38px;
    height: 5px;
    border-radius: 3px;
    background: var(--sand-strong);
    margin: 0 auto var(--sp-3);
  }
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    letter-spacing: -0.01em;
  }
  .content {
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
</style>
