<script lang="ts">
  import PixelArt from './PixelArt.svelte';
  import { ghostBlink, ghostHappy, ghostIdle } from './sprites';

  let {
    scale = 4,
    mood = 'idle',
    float = true,
    shadow = true
  }: { scale?: number; mood?: 'idle' | 'happy'; float?: boolean; shadow?: boolean } = $props();

  let blinking = $state(false);

  $effect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(() => {
        blinking = true;
        setTimeout(() => (blinking = false), 140);
        loop();
      }, 2400 + Math.random() * 3200);
    };
    loop();
    return () => clearTimeout(timer);
  });

  const sprite = $derived(mood === 'happy' ? ghostHappy : blinking ? ghostBlink : ghostIdle);
</script>

<div class="ghost" class:float style="--s:{scale}px">
  <div class="body">
    <PixelArt {sprite} {scale} />
  </div>
  {#if shadow}<div class="shadow"></div>{/if}
</div>

<style>
  .ghost {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
  }
  .float .body {
    animation: bob 2.6s ease-in-out infinite;
  }
  .shadow {
    width: calc(var(--s) * 8);
    height: calc(var(--s) * 1.5);
    margin-top: calc(var(--s) * 0.5);
    border-radius: 50%;
    background: var(--shadow-ink);
    opacity: 0.5;
  }
  .float .shadow {
    animation: shadow 2.6s ease-in-out infinite;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(calc(var(--s) * -1.5)); }
  }
  @keyframes shadow {
    0%, 100% { transform: scaleX(1); opacity: 0.5; }
    50% { transform: scaleX(0.8); opacity: 0.32; }
  }
  @media (prefers-reduced-motion: reduce) {
    .float .body, .float .shadow { animation: none; }
  }
</style>
