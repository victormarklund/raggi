<script lang="ts">
  import { fade } from 'svelte/transition';
  import { portal } from '../lib/portal';
  import { dur, iosEase } from '../lib/motion';

  let {
    title,
    confirmLabel,
    onconfirm,
    oncancel
  }: { title: string; confirmLabel: string; onconfirm: () => void; oncancel: () => void } = $props();

  function rise(node: HTMLElement) {
    return {
      duration: dur(380),
      easing: iosEase,
      css: (t: number) => `transform:translateY(${(1 - t) * 110}%)`
    };
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && oncancel()} />

<div class="layer" use:portal>
  <div class="scrim" transition:fade={{ duration: dur(260) }} onclick={oncancel} role="presentation"></div>
  <div class="stack" role="alertdialog" aria-label={title} transition:rise>
    <div class="group">
      <p>{title}</p>
      <button class="danger" onclick={onconfirm}>{confirmLabel}</button>
    </div>
    <button class="cancel" onclick={oncancel}>Cancel</button>
  </div>
</div>

<style>
  .layer {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .scrim {
    position: absolute;
    inset: 0;
    background: var(--scrim);
  }
  .stack {
    position: relative;
    padding: 0 var(--sp-3) calc(var(--sp-3) + var(--safe-bottom));
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }
  .group,
  .cancel {
    background: var(--bg-elevated);
    border-radius: var(--r-md);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }
  p {
    margin: 0;
    padding: var(--sp-4) var(--sp-5);
    text-align: center;
    color: var(--muted);
    font-size: 14px;
    font-weight: 500;
  }
  button {
    width: 100%;
    min-height: 56px;
    font-size: 18px;
    font-weight: 600;
    transition: background-color 0.15s ease;
  }
  .danger {
    color: var(--danger);
    border-top: 0.5px solid var(--sand);
  }
  button:active {
    background: var(--sand);
  }
</style>
