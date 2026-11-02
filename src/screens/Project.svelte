<script lang="ts">
  import { flushSync, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import {
    addCounter,
    app,
    deleteProject,
    getProject,
    renameProject,
    resetProject,
    toggleKeepAwake
  } from '../lib/store.svelte';
  import { goHome } from '../lib/router.svelte';
  import { setKeepAwake } from '../lib/wakeLock';
  import { primeKeyboard } from '../lib/focus';
  import { dur, iosEase } from '../lib/motion';
  import NavBar from '../components/NavBar.svelte';
  import Counter from '../components/Counter.svelte';
  import IconButton from '../components/IconButton.svelte';
  import Icon from '../components/Icon.svelte';
  import ActionMenu from '../components/ActionMenu.svelte';
  import ConfirmSheet from '../components/ConfirmSheet.svelte';
  import NameSheet from '../components/NameSheet.svelte';
  import PixelArt from '../components/pixel/PixelArt.svelte';
  import { moon, sun } from '../components/pixel/sprites';

  let { id }: { id: string } = $props();

  const project = $derived(getProject(id));
  // keep the last known project around while the screen animates out after deletion
  // svelte-ignore state_referenced_locally
  let shown = $state(getProject(id));
  $effect(() => {
    if (project) shown = project;
    else goHome();
  });

  let scroller = $state<HTMLElement>()!;
  let collapsed = $state(false);
  let renaming = $state(false);
  let menuOpen = $state(false);
  let moreBtn = $state<HTMLElement>();
  let confirm = $state<'reset' | 'delete' | null>(null);
  let justAdded = $state<string | null>(null);

  $effect(() => {
    setKeepAwake(app.settings.keepAwake);
    return () => setKeepAwake(false);
  });

  /**
   * Counters share the screen via flex-grow; animating flex-grow (and min-height)
   * lets the new card swell in while its siblings shrink smoothly to make room.
   */
  function growFlex(node: HTMLElement) {
    const minH = parseFloat(getComputedStyle(node).minHeight) || 0;
    return {
      duration: dur(460),
      easing: iosEase,
      css: (t: number) =>
        `flex-grow:${t}; min-height:${t * minH}px; opacity:${Math.min(1, t * 1.6)}; transform:scale(${0.94 + 0.06 * t})`
    };
  }

  async function add() {
    if (!shown) return;
    let c;
    flushSync(() => {
      c = addCounter(shown!.id);
      justAdded = c?.id ?? null;
    });
    await tick();
    const last = scroller.querySelector('.counters li:last-child');
    last?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
</script>

{#if shown}
  <div class="screen" bind:this={scroller} onscroll={() => (collapsed = scroller.scrollTop > 36)}>
    <NavBar
      title={shown.name}
      {collapsed}
      ontitletap={() => {
        primeKeyboard();
        renaming = true;
      }}
    >
      {#snippet left()}
        <button class="back" onclick={goHome} aria-label="Back to projects">
          <Icon name="back" size={26} stroke={2.4} />
        </button>
      {/snippet}
      {#snippet right()}
        <IconButton
          label={app.settings.keepAwake ? 'Screen stays on' : 'Screen may sleep'}
          aria-pressed={app.settings.keepAwake}
          onclick={toggleKeepAwake}
        >
          <span class="awake">
            {#key app.settings.keepAwake}
              <span class="awake-icon" transition:fade={{ duration: dur(200) }}>
                <PixelArt sprite={app.settings.keepAwake ? sun : moon} scale={2} />
              </span>
            {/key}
          </span>
        </IconButton>
        <span bind:this={moreBtn}>
          <IconButton label="More" onclick={() => (menuOpen = true)}>
            <Icon name="more" />
          </IconButton>
        </span>
      {/snippet}
    </NavBar>

    <ul class="counters" class:multi={shown.counters.length > 1}>
      {#each shown.counters as c (c.id)}
        <li transition:growFlex>
          <Counter
            projectId={shown.id}
            counter={c}
            compact={shown.counters.length > 1}
            removable={shown.counters.length > 1}
            autoEdit={c.id === justAdded}
          />
        </li>
      {/each}
    </ul>

    <div class="add-wrap">
      <button class="add" onclick={add}>
        <Icon name="plus" size={20} stroke={2.6} />
        <span>Counter</span>
      </button>
    </div>
  </div>

  <NameSheet
    bind:open={renaming}
    title="Rename"
    initial={shown.name}
    action="Save"
    onsave={(name) => renameProject(shown!.id, name)}
  />

  {#if menuOpen && moreBtn}
    <ActionMenu
      anchor={moreBtn}
      onclose={() => (menuOpen = false)}
      items={[
        {
          label: 'Rename',
          icon: 'pencil',
          action: () => {
            primeKeyboard();
            renaming = true;
          }
        },
        {
          label: 'Reset all',
          icon: 'reset',
          disabled: shown.counters.every((c) => c.count === 0),
          action: () => (confirm = 'reset')
        },
        { label: 'Delete', icon: 'trash', danger: true, action: () => (confirm = 'delete') }
      ]}
    />
  {/if}

  {#if confirm}
    <ConfirmSheet
      title={confirm === 'reset' ? 'Reset all counters to 0?' : `Delete “${shown.name}”?`}
      confirmLabel={confirm === 'reset' ? 'Reset all' : 'Delete project'}
      oncancel={() => (confirm = null)}
      onconfirm={() => {
        const id = shown!.id;
        if (confirm === 'reset') resetProject(id);
        else {
          goHome();
          setTimeout(() => deleteProject(id), 400);
        }
        confirm = null;
      }}
    />
  {/if}
{/if}

<style>
  .screen {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    padding-bottom: calc(var(--sp-3) + var(--safe-bottom));
  }
  .back {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    color: var(--ink);
    transition: opacity 0.2s ease;
  }
  .back:active {
    opacity: 0.5;
  }
  .awake {
    display: grid;
    width: 22px;
    height: 22px;
  }
  .awake-icon {
    grid-area: 1 / 1;
    display: grid;
    place-items: center;
  }
  /* Fill the remaining height; cards split it evenly and only scroll once
     they would get smaller than their minimum. */
  .counters {
    flex: 1 0 auto;
    list-style: none;
    margin: 0;
    padding: var(--sp-1) calc(var(--sp-4) + var(--safe-right)) 0 calc(var(--sp-4) + var(--safe-left));
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
  }
  .counters li {
    flex: 1 1 0;
    min-height: 300px;
    display: flex;
  }
  .counters.multi li {
    min-height: 140px;
  }
  .add-wrap {
    flex: none;
    display: flex;
    justify-content: center;
    padding: var(--sp-2) 0;
  }
  .add {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    min-height: 48px;
    padding: 0 var(--sp-5);
    border-radius: 999px;
    background: var(--sand);
    color: var(--ink-soft);
    font-weight: 650;
    transition: transform 0.25s var(--ease), background-color 0.2s ease;
  }
  .add:active {
    transform: scale(0.95);
    background: var(--sand-strong);
  }
</style>
