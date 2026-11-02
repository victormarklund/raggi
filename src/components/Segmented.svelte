<script lang="ts" generics="T extends string">
  let {
    value = $bindable(),
    options,
    label
  }: { value: T; options: { value: T; label: string }[]; label: string } = $props();

  const index = $derived(Math.max(0, options.findIndex((o) => o.value === value)));
</script>

<div class="seg" role="radiogroup" aria-label={label} style="--n:{options.length}; --i:{index}">
  <span class="thumb"></span>
  {#each options as o (o.value)}
    <button role="radio" aria-checked={o.value === value} class:on={o.value === value} onclick={() => (value = o.value)}>
      {o.label}
    </button>
  {/each}
</div>

<style>
  .seg {
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--n), 1fr);
    padding: 3px;
    border-radius: 14px;
    background: var(--sand);
  }
  .thumb {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc((100% - 6px) / var(--n));
    border-radius: 11px;
    background: var(--bg-elevated);
    box-shadow: var(--shadow-sm);
    transform: translateX(calc(100% * var(--i)));
    transition: transform 0.4s var(--ease);
  }
  button {
    position: relative;
    height: 40px;
    font-weight: 600;
    font-size: 15px;
    color: var(--muted);
    transition: color 0.2s ease;
  }
  button.on {
    color: var(--ink);
  }
</style>
