<script lang="ts">
  let {
    value = $bindable(''),
    placeholder = '',
    autofocus = false,
    maxlength = 60,
    label,
    onsubmit
  }: {
    value?: string;
    placeholder?: string;
    autofocus?: boolean;
    maxlength?: number;
    label: string;
    onsubmit?: () => void;
  } = $props();

  let input: HTMLInputElement;

  $effect(() => {
    if (!autofocus) return;
    // iOS only opens the keyboard when focus happens close to a user gesture,
    // so focus immediately, then once more after the sheet has animated in.
    input.focus({ preventScroll: true });
    const t = setTimeout(() => input.focus({ preventScroll: true }), 320);
    return () => clearTimeout(t);
  });
</script>

<div class="field">
  <input
    bind:this={input}
    bind:value
    {placeholder}
    {maxlength}
    aria-label={label}
    autocomplete="off"
    autocapitalize="sentences"
    enterkeyhint="done"
    onkeydown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onsubmit?.();
      }
    }}
  />
  {#if value}
    <button class="clear" aria-label="Clear" tabindex="-1" onclick={() => { value = ''; input.focus(); }}>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M9 9l6 6M15 9l-6 6" stroke="var(--bg-elevated)" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
  {/if}
</div>

<style>
  .field {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--bg);
    border-radius: var(--r-sm);
    box-shadow: inset 0 0 0 1px var(--sand);
    transition: box-shadow 0.2s ease;
  }
  .field:focus-within {
    box-shadow: inset 0 0 0 2px var(--moss);
  }
  input {
    flex: 1;
    min-width: 0;
    height: 54px;
    padding: 0 var(--sp-4);
    border: 0;
    background: transparent;
    font-weight: 500;
  }
  input::placeholder {
    color: var(--faint);
  }
  .clear {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    color: var(--faint);
  }
</style>
