<script lang="ts">
  import Sheet from './Sheet.svelte';
  import TextField from './TextField.svelte';
  import Button from './Button.svelte';

  let {
    open = $bindable(false),
    title,
    initial = '',
    placeholder = '',
    action,
    onsave
  }: {
    open?: boolean;
    title: string;
    initial?: string;
    placeholder?: string;
    action: string;
    onsave: (name: string) => void;
  } = $props();

  let name = $state('');

  $effect(() => {
    if (open) name = initial;
  });

  function save() {
    if (!name.trim()) return;
    onsave(name.trim());
    open = false;
  }
</script>

<Sheet bind:open {title}>
  <div class="form">
    <TextField bind:value={name} label={title} {placeholder} autofocus onsubmit={save} />
    <Button disabled={!name.trim()} onclick={save}>{action}</Button>
  </div>
</Sheet>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    padding-top: var(--sp-2);
  }
</style>
