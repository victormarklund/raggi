<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    onclick,
    variant = 'plain',
    size = 44,
    children,
    ...rest
  }: {
    label: string;
    onclick?: (e: MouseEvent) => void;
    variant?: 'plain' | 'soft' | 'solid';
    size?: number;
    children: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button
  class="icon-btn {variant}"
  style="--size:{size}px"
  aria-label={label}
  title={label}
  onclick={(e) => {
    e.stopPropagation();
    onclick?.(e);
  }}
  {...rest}
>
  {@render children()}
</button>

<style>
  .icon-btn {
    width: var(--size);
    height: var(--size);
    min-width: 44px;
    min-height: 44px;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    color: var(--ink-soft);
    transition: transform 0.25s var(--ease), background-color 0.2s ease, color 0.2s ease;
  }
  .icon-btn:active {
    transform: scale(0.9);
  }
  .soft {
    background: var(--sand);
  }
  .soft:active {
    background: var(--sand-strong);
  }
  .solid {
    background: var(--ink);
    color: var(--bg);
    box-shadow: var(--shadow-md);
  }
</style>
