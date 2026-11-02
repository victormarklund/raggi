<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    collapsed = false,
    left,
    right,
    titleAccessory,
    titleArt,
    ontitletap
  }: {
    title: string;
    collapsed?: boolean;
    left?: Snippet;
    right?: Snippet;
    titleAccessory?: Snippet;
    /** Optional graphic shown in place of the large title text (text stays for a11y). */
    titleArt?: Snippet;
    ontitletap?: () => void;
  } = $props();
</script>

<header class="bar" class:collapsed>
  <div class="row">
    <div class="side left">{@render left?.()}</div>
    <div class="compact-title" aria-hidden={!collapsed}>{title}</div>
    <div class="side right">{@render right?.()}</div>
  </div>
</header>

<div class="large">
  {#if ontitletap}
    <button class="large-title" onclick={ontitletap}>{title}</button>
  {:else if titleArt}
    <h1 class="large-title art">
      <span class="visually-hidden">{title}</span>
      {@render titleArt()}
    </h1>
  {:else}
    <h1 class="large-title">{title}</h1>
  {/if}
  {@render titleAccessory?.()}
</div>

<style>
  .bar {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: var(--safe-top) calc(var(--sp-2) + var(--safe-right)) 0 calc(var(--sp-2) + var(--safe-left));
    background: transparent;
    transition: background-color 0.25s ease, box-shadow 0.25s ease;
  }
  .bar.collapsed {
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    backdrop-filter: blur(20px) saturate(1.3);
    box-shadow: 0 0.5px 0 var(--sand-strong);
  }
  .row {
    height: 52px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }
  .side {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .right {
    justify-content: flex-end;
  }
  .compact-title {
    font-weight: 650;
    font-size: 17px;
    max-width: 52vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.2s ease, transform 0.3s var(--ease);
  }
  .collapsed .compact-title {
    opacity: 1;
    transform: none;
  }
  .large {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-3);
    padding: 0 calc(var(--sp-5) + var(--safe-right)) var(--sp-3) calc(var(--sp-5) + var(--safe-left));
  }
  .large-title {
    margin: 0;
    font-size: 34px;
    font-weight: 750;
    letter-spacing: -0.02em;
    line-height: 1.1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .large-title.art {
    display: flex;
    overflow: visible;
  }
  button.large-title {
    transition: opacity 0.2s ease;
  }
  button.large-title:active {
    opacity: 0.55;
  }
</style>
