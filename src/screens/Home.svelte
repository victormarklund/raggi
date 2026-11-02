<script lang="ts">
  import { flip } from 'svelte/animate';
  import { createProject, deleteProject, sortedProjects } from '../lib/store.svelte';
  import { openProject } from '../lib/router.svelte';
  import { primeKeyboard } from '../lib/focus';
  import { dur, grow } from '../lib/motion';
  import NavBar from '../components/NavBar.svelte';
  import ProjectRow from '../components/ProjectRow.svelte';
  import NameSheet from '../components/NameSheet.svelte';
  import ConfirmSheet from '../components/ConfirmSheet.svelte';
  import Icon from '../components/Icon.svelte';
  import Ghost from '../components/pixel/Ghost.svelte';
  import PixelArt from '../components/pixel/PixelArt.svelte';
  import { knitWordmark, yarn, yarnClay } from '../components/pixel/sprites';
  import type { Project } from '../lib/types';

  let collapsed = $state(false);
  let creating = $state(false);
  let toDelete = $state<Project | null>(null);

  const projects = $derived(sortedProjects());

  function startNew() {
    primeKeyboard();
    creating = true;
  }
</script>

<div class="screen" onscroll={(e) => (collapsed = (e.currentTarget as HTMLElement).scrollTop > 36)}>
  <NavBar title="Raggi" {collapsed}>
    {#snippet titleArt()}
      <PixelArt sprite={knitWordmark} scale={1} />
    {/snippet}
    {#snippet titleAccessory()}
      {#if projects.length}
        <div class="mascot"><Ghost scale={3} /></div>
      {/if}
    {/snippet}
  </NavBar>

  {#if projects.length}
    <ul class="list">
      {#each projects as p (p.id)}
        <li animate:flip={{ duration: dur(400) }} out:grow={{ duration: 300 }}>
          <ProjectRow project={p} onopen={() => openProject(p.id)} ondelete={() => (toDelete = p)} />
        </li>
      {/each}
    </ul>
  {:else}
    <button class="empty" onclick={startNew}>
      <div class="scene">
        <Ghost scale={7} />
        <div class="yarns">
          <PixelArt sprite={yarnClay} scale={4} />
          <PixelArt sprite={yarn} scale={5} />
        </div>
      </div>
      <span class="cta">Start a project</span>
    </button>
  {/if}
</div>

<button class="fab" aria-label="New project" onclick={startNew}>
  <Icon name="plus" size={28} stroke={2.6} />
</button>

<NameSheet
  bind:open={creating}
  title="New project"
  placeholder="Cosy sweater"
  action="Start"
  onsave={(name) => {
    const p = createProject(name);
    setTimeout(() => openProject(p.id), 180);
  }}
/>

{#if toDelete}
  <ConfirmSheet
    title="Delete “{toDelete.name}”?"
    confirmLabel="Delete project"
    oncancel={() => (toDelete = null)}
    onconfirm={() => {
      if (toDelete) deleteProject(toDelete.id);
      toDelete = null;
    }}
  />
{/if}

<style>
  .screen {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(120px + var(--safe-bottom));
  }
  .mascot {
    margin-right: -6px;
    margin-bottom: -6px;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: var(--sp-2) calc(var(--sp-4) + var(--safe-right)) 0 calc(var(--sp-4) + var(--safe-left));
    display: flex;
    flex-direction: column;
  }
  .list li {
    margin-bottom: var(--sp-3);
  }
  .empty {
    width: 100%;
    min-height: 62dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--sp-6);
    transition: transform 0.3s var(--ease);
  }
  .empty:active {
    transform: scale(0.97);
  }
  .scene {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: var(--sp-2);
  }
  .yarns {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    margin-bottom: 10px;
  }
  .cta {
    font-size: 19px;
    font-weight: 650;
    color: var(--muted);
  }
  .fab {
    position: absolute;
    right: calc(var(--sp-5) + var(--safe-right));
    bottom: calc(var(--sp-5) + var(--safe-bottom));
    width: 64px;
    height: 64px;
    border-radius: 24px;
    display: grid;
    place-items: center;
    background: var(--ink);
    color: var(--bg);
    box-shadow: var(--shadow-lg);
    transition: transform 0.3s var(--ease);
  }
  .fab:active {
    transform: scale(0.9);
  }
</style>
