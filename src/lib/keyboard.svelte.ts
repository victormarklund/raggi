/** Height of the on-screen keyboard (iOS), derived from visualViewport. */
export const keyboard = $state({ inset: 0 });

let started = false;

export function trackKeyboard() {
  if (started || typeof visualViewport === 'undefined' || !visualViewport) return;
  started = true;
  const vv = visualViewport;
  const update = () => {
    keyboard.inset = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop));
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}
