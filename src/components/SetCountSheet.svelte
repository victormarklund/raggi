<script lang="ts">
  import type { Counter } from '../lib/types';
  import { setCount } from '../lib/store.svelte';
  import Sheet from './Sheet.svelte';
  import Stepper from './Stepper.svelte';
  import Button from './Button.svelte';

  let {
    open = $bindable(false),
    projectId,
    counter
  }: { open?: boolean; projectId: string; counter: Counter } = $props();

  let value = $state(0);

  // start from the current count each time the sheet opens
  $effect(() => {
    if (open) value = counter.count;
  });

  function save() {
    setCount(projectId, counter.id, value);
    open = false;
  }
</script>

<Sheet bind:open title="Set count">
  <div class="form">
    <div class="amount">
      <Stepper bind:value min={0} max={99999} />
      <span class="unit">{(counter.label || 'rows').toLowerCase()}</span>
    </div>
    <Button disabled={value === counter.count} onclick={save}>Set to {value}</Button>
  </div>
</Sheet>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }
  .amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--sp-2) 0;
  }
  .unit {
    color: var(--muted);
    font-weight: 600;
    font-size: 15px;
  }
</style>
