<script lang="ts">
  import type { Sprite } from './sprites';

  let { sprite, scale = 4, title = '' }: { sprite: Sprite; scale?: number; title?: string } = $props();

  // Merge horizontal runs of the same colour into one rect each.
  const runs = $derived.by(() => {
    const out: { x: number; y: number; w: number; fill: string }[] = [];
    sprite.rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        let end = x + 1;
        while (end < row.length && row[end] === ch) end++;
        const fill = sprite.palette[ch];
        if (ch !== '.' && fill) out.push({ x, y, w: end - x, fill });
        x = end;
      }
    });
    return out;
  });
</script>

<svg
  class="pixel"
  viewBox="0 0 {sprite.w} {sprite.h}"
  width={sprite.w * scale}
  height={sprite.h * scale}
  shape-rendering="crispEdges"
  role={title ? 'img' : undefined}
  aria-hidden={title ? undefined : 'true'}
  aria-label={title || undefined}
>
  {#each runs as r, i (i)}
    <rect x={r.x} y={r.y} width={r.w} height="1" fill={r.fill} />
  {/each}
</svg>

<style>
  .pixel {
    display: block;
    image-rendering: pixelated;
    flex-shrink: 0;
  }
</style>
