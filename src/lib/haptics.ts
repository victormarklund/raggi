/**
 * Progressive-enhancement haptics.
 * - Android / Chrome: navigator.vibrate
 * - iOS 18+ Safari: toggling a hidden <input type="checkbox" switch> via its
 *   label triggers the system "selection" haptic. Must run inside a user gesture.
 */
type Kind = 'tap' | 'success';

let label: HTMLLabelElement | null = null;

function iosSwitch(): HTMLLabelElement | null {
  if (typeof document === 'undefined') return null;
  if (label) return label;
  const l = document.createElement('label');
  l.setAttribute('aria-hidden', 'true');
  l.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  l.appendChild(input);
  document.body.appendChild(l);
  label = l;
  return l;
}

const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export function haptic(kind: Kind = 'tap') {
  try {
    if (canVibrate()) {
      navigator.vibrate(kind === 'success' ? [12, 60, 18] : 8);
      return;
    }
    const l = iosSwitch();
    if (!l) return;
    l.click();
    if (kind === 'success') setTimeout(() => l.click(), 110);
  } catch {
    /* no haptics available — silently ignore */
  }
}
