<script lang="ts">
  export type IconName =
    | 'back' | 'plus' | 'minus' | 'bell' | 'more' | 'trash' | 'pencil'
    | 'reset' | 'x' | 'repeat' | 'check' | 'hash';

  let { name, size = 22, stroke = 2.2 }: { name: IconName; size?: number; stroke?: number } = $props();

  const paths: Record<IconName, string> = {
    back: 'M15 5l-7 7 7 7',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 0 0 4 0',
    more: 'M6 12h.01M12 12h.01M18 12h.01',
    trash: 'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12',
    pencil: 'M15.5 5.5l3 3L9 18l-4 1 1-4 9.5-9.5z',
    reset: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4',
    x: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
    repeat: 'M17 3l3 3-3 3M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20M7 21l-3-3 3-3M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    hash: 'M10 4L8 20M16 4l-2 16M5 9h15M4 15h15'
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={name === 'more' ? stroke * 1.6 : stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={paths[name]} />
</svg>

<style>
  svg {
    display: block;
    flex-shrink: 0;
  }
</style>
