import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

/** iOS-ish "fluid" curve: cubic-bezier(.32,.72,0,1) */
export function iosEase(t: number): number {
  // Numerically solve the bezier for x→y
  const x1 = 0.32, y1 = 0.72, x2 = 0, y2 = 1;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  let u = t;
  for (let i = 0; i < 6; i++) {
    const xu = ((ax * u + bx) * u + cx) * u - t;
    const d = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(d) < 1e-6) break;
    u -= xu / d;
  }
  return ((ay * u + by) * u + cy) * u;
}

export const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const dur = (ms: number) => (reducedMotion() ? 0 : ms);

/** Smooth grow-in for list items (height + fade). */
export function grow(node: HTMLElement, { duration = 380 } = {}): TransitionConfig {
  const h = node.offsetHeight;
  const style = getComputedStyle(node);
  const mb = parseFloat(style.marginBottom);
  return {
    duration: dur(duration),
    easing: iosEase,
    css: (t) =>
      `overflow:hidden;height:${t * h}px;margin-bottom:${t * mb}px;opacity:${cubicOut(t)};transform:scale(${0.96 + 0.04 * t})`
  };
}
