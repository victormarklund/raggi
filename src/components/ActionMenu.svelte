<script lang="ts" module>
  import type { IconName } from './Icon.svelte';
  export interface MenuItem {
    label: string;
    icon: IconName;
    danger?: boolean;
    disabled?: boolean;
    action: () => void;
  }
</script>

<script lang="ts">
  import Icon from './Icon.svelte';
  import { portal } from '../lib/portal';
  import { dur, iosEase } from '../lib/motion';

  let {
    anchor,
    items,
    onclose
  }: { anchor: HTMLElement; items: MenuItem[]; onclose: () => void } = $props();

  // positioned once, when opened
  // svelte-ignore state_referenced_locally
  const rect = anchor.getBoundingClientRect();
  const width = 230;
  const right = Math.max(12, innerWidth - rect.right);
  // svelte-ignore state_referenced_locally
  const openUp = rect.bottom + items.length * 52 + 24 > innerHeight;
  const top = openUp ? undefined : rect.bottom + 6;
  const bottom = openUp ? innerHeight - rect.top + 6 : undefined;

  function pop(node: HTMLElement) {
    return {
      duration: dur(260),
      easing: iosEase,
      css: (t: number) => `opacity:${t};transform:scale(${0.6 + 0.4 * t})`
    };
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div class="layer" use:portal>
  <div class="scrim" onclick={onclose} role="presentation"></div>
  <div
    class="menu"
    role="menu"
    style="width:{width}px; right:{right}px; {top !== undefined ? `top:${top}px` : `bottom:${bottom}px`}; transform-origin: {openUp ? 'bottom' : 'top'} right"
    transition:pop
  >
    {#each items as item (item.label)}
      <button
        role="menuitem"
        class:danger={item.danger}
        disabled={item.disabled}
        onclick={() => {
          onclose();
          item.action();
        }}
      >
        <span>{item.label}</span>
        <Icon name={item.icon} size={20} />
      </button>
    {/each}
  </div>
</div>

<style>
  .layer {
    position: fixed;
    inset: 0;
    z-index: 60;
  }
  .scrim {
    position: absolute;
    inset: 0;
  }
  .menu {
    position: absolute;
    background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    backdrop-filter: blur(24px) saturate(1.4);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-lg), 0 0 0 0.5px var(--sand-strong);
    overflow: hidden;
  }
  button {
    width: 100%;
    min-height: 50px;
    padding: 0 var(--sp-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-3);
    font-weight: 500;
    text-align: left;
    transition: background-color 0.15s ease;
  }
  button + button {
    border-top: 0.5px solid var(--sand);
  }
  button:active {
    background: var(--sand);
  }
  button:disabled {
    opacity: 0.35;
  }
  .danger {
    color: var(--danger);
  }
</style>
