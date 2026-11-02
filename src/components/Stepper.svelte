<script lang="ts">
  import Icon from './Icon.svelte';
  import { haptic } from '../lib/haptics';

  let { value = $bindable(1), min = 1, max = 999 }: { value?: number; min?: number; max?: number } = $props();

  let holdTimer: ReturnType<typeof setTimeout> | undefined;

  function step(d: number) {
    const next = Math.min(max, Math.max(min, value + d));
    if (next !== value) {
      value = next;
      haptic('tap');
    }
  }
  function startHold(d: number) {
    stopHold();
    let delay = 380;
    const tick = () => {
      step(d);
      delay = Math.max(60, delay * 0.8);
      holdTimer = setTimeout(tick, delay);
    };
    holdTimer = setTimeout(tick, delay);
  }
  function stopHold() {
    clearTimeout(holdTimer);
  }
</script>

<div class="stepper">
  <button
    aria-label="Fewer"
    disabled={value <= min}
    onclick={() => step(-1)}
    onpointerdown={() => startHold(-1)}
    onpointerup={stopHold}
    onpointerleave={stopHold}
    onpointercancel={stopHold}
  >
    <Icon name="minus" size={24} stroke={2.6} />
  </button>
  <input
    type="number"
    inputmode="numeric"
    pattern="[0-9]*"
    aria-label="Count"
    style="width: max(92px, calc({String(value).length} * 0.62em + 16px))"
    {min}
    {max}
    value={value}
    onfocus={(e) => (e.currentTarget as HTMLInputElement).select()}
    oninput={(e) => {
      const n = parseInt((e.currentTarget as HTMLInputElement).value, 10);
      if (!Number.isNaN(n)) value = Math.min(max, Math.max(min, n));
    }}
    onblur={(e) => ((e.currentTarget as HTMLInputElement).value = String(value))}
  />
  <button
    aria-label="More"
    disabled={value >= max}
    onclick={() => step(1)}
    onpointerdown={() => startHold(1)}
    onpointerup={stopHold}
    onpointerleave={stopHold}
    onpointercancel={stopHold}
  >
    <Icon name="plus" size={24} stroke={2.6} />
  </button>
</div>

<style>
  .stepper {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
  }
  button {
    width: 56px;
    height: 56px;
    border-radius: 999px;
    background: var(--sand);
    display: grid;
    place-items: center;
    color: var(--ink);
    transition: transform 0.2s var(--ease), opacity 0.2s ease;
  }
  button:active:not(:disabled) {
    transform: scale(0.9);
  }
  button:disabled {
    opacity: 0.35;
  }
  input {
    width: 92px;
    height: 56px;
    border: 0;
    background: transparent;
    text-align: center;
    font-size: 40px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
