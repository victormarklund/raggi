<script lang="ts">
  import { dur } from '../lib/motion';

  let { value }: { value: number } = $props();

  // svelte-ignore state_referenced_locally
  let prev = value;
  let direction = $state(1);

  $effect.pre(() => {
    direction = value >= prev ? 1 : -1;
    prev = value;
  });

  const digits = $derived(String(value).split(''));

  function roll(node: HTMLElement, { out = false } = {}) {
    const d = direction;
    return {
      duration: dur(out ? 260 : 380),
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      css: (t: number, u: number) => {
        const y = out ? -d * u * 70 : d * u * 70;
        return `transform:translateY(${y}%) scale(${0.9 + 0.1 * t});opacity:${t};filter:blur(${u * 2}px)`;
      }
    };
  }
</script>

<span class="number" aria-hidden="true">
  {#each digits as digit, i (digits.length - i)}
    <span class="slot">
      {#key digit}
        <span class="digit" in:roll out:roll={{ out: true }}>{digit}</span>
      {/key}
    </span>
  {/each}
</span>

<style>
  .number {
    display: inline-flex;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .slot {
    display: inline-grid;
    overflow: visible;
  }
  .digit {
    grid-area: 1 / 1;
    display: block;
    will-change: transform, opacity;
  }
</style>
