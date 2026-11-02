<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    onclick,
    variant = 'primary',
    disabled = false,
    type = 'button',
    children
  }: {
    onclick?: (e: MouseEvent) => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    disabled?: boolean;
    type?: 'button' | 'submit';
    children: Snippet;
  } = $props();
</script>

<button class="btn {variant}" {type} {disabled} {onclick}>
  {@render children()}
</button>

<style>
  .btn {
    width: 100%;
    min-height: 54px;
    padding: 0 var(--sp-5);
    border-radius: var(--r-md);
    font-weight: 600;
    font-size: 17px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-2);
    transition: transform 0.25s var(--ease), opacity 0.2s ease, background-color 0.2s ease;
  }
  .btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .primary {
    background: var(--ink);
    color: var(--bg);
  }
  .secondary {
    background: var(--sand);
    color: var(--ink);
  }
  .danger {
    background: var(--clay-soft);
    color: var(--danger);
  }
  .ghost {
    color: var(--muted);
  }
</style>
