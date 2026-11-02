/**
 * iOS only shows the keyboard for focus() calls made synchronously inside a
 * user gesture. Call primeKeyboard() in the tap handler that opens a sheet;
 * it focuses a hidden input right away so the keyboard starts opening, and the
 * real field can take focus a moment later without the keyboard dropping.
 */
let proxy: HTMLInputElement | null = null;

export function primeKeyboard() {
  if (!proxy) {
    proxy = document.createElement('input');
    proxy.setAttribute('aria-hidden', 'true');
    proxy.tabIndex = -1;
    proxy.style.cssText =
      'position:fixed;top:40%;left:0;width:1px;height:1px;opacity:0;font-size:16px;pointer-events:none;border:0;padding:0';
    document.body.appendChild(proxy);
  }
  proxy.focus({ preventScroll: true });
}

/** Svelte action: focus the element as soon as it is mounted. */
export function autofocus(node: HTMLInputElement) {
  node.focus({ preventScroll: true });
  node.select?.();
}
