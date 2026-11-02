<script lang="ts">
  import { router, goHome } from './lib/router.svelte';
  import { dur, iosEase } from './lib/motion';
  import Home from './screens/Home.svelte';
  import Project from './screens/Project.svelte';
  import ReminderToast from './components/ReminderToast.svelte';

  const projectId = $derived(router.route.name === 'project' ? router.route.id : null);

  // ---- interactive edge-swipe back ------------------------------------------
  let width = $state(typeof innerWidth === 'number' ? innerWidth : 390);
  let swipeX = $state(0);
  let swiping = $state(false);
  let skipOutro = false;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let lastX = 0;
  let lastT = 0;
  let vx = 0;

  const progress = $derived(projectId ? 1 - swipeX / width : 0);

  function touchstart(e: TouchEvent) {
    if (!projectId || e.touches.length !== 1) return;
    const t = e.touches[0];
    if (t.clientX > 24) return;
    tracking = true;
    startX = lastX = t.clientX;
    startY = t.clientY;
    lastT = e.timeStamp;
    vx = 0;
  }
  function touchmove(e: TouchEvent) {
    if (!tracking) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    if (!swiping) {
      if (Math.abs(t.clientY - startY) > Math.abs(dx) && Math.abs(t.clientY - startY) > 10) {
        tracking = false;
        return;
      }
      if (dx < 6) return;
      swiping = true;
    }
    e.preventDefault();
    swipeX = Math.max(0, dx);
    vx = (t.clientX - lastX) / Math.max(1, e.timeStamp - lastT);
    lastX = t.clientX;
    lastT = e.timeStamp;
  }
  function touchend() {
    if (!tracking) return;
    tracking = false;
    if (!swiping) return;
    swiping = false;
    if (swipeX > width * 0.35 || vx > 0.5) {
      swipeX = width; // CSS transition carries it off-screen
      setTimeout(() => {
        skipOutro = true;
        goHome();
        swipeX = 0;
        requestAnimationFrame(() => (skipOutro = false));
      }, dur(280));
    } else {
      swipeX = 0;
    }
  }

  // ---- push / pop transitions ----------------------------------------------
  function push(node: HTMLElement, { out = false } = {}) {
    if (out && skipOutro) return { duration: 0 };
    return {
      duration: dur(480),
      easing: iosEase,
      css: (t: number) => `transform: translateX(${(1 - t) * 100}%); box-shadow: 0 0 40px rgba(58,51,43,${0.18 * t})`
    };
  }
</script>

<svelte:window bind:innerWidth={width} />
<svelte:document ontouchstart={touchstart} ontouchmove={touchmove} ontouchend={touchend} ontouchcancel={touchend} />

<div class="stack" class:swiping>
  <div
    class="layer home"
    inert={!!projectId}
    style="transform: translateX({-28 * progress}%); --dim:{0.12 * progress}"
  >
    <Home />
  </div>

  {#if projectId}
    {#key projectId}
      <div class="layer project" style="transform: translateX({swipeX}px)" in:push out:push={{ out: true }}>
        <Project id={projectId} />
      </div>
    {/key}
  {/if}
</div>

<ReminderToast />

<style>
  .stack {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--bg);
  }
  .layer {
    position: absolute;
    inset: 0;
    background: var(--bg);
    will-change: transform;
    transition: transform 0.48s var(--ease);
  }
  .swiping .layer {
    transition: none;
  }
  .home::after {
    content: '';
    position: absolute;
    inset: 0;
    background: #000;
    opacity: var(--dim);
    pointer-events: none;
    transition: opacity 0.48s var(--ease);
  }
  .swiping .home::after {
    transition: none;
  }
  .project {
    box-shadow: -1px 0 0 var(--sand), -12px 0 40px rgba(58, 51, 43, 0.1);
  }
</style>
