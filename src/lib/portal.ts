/** Svelte action: render the node at the end of <body> (escapes transformed ancestors). */
export function portal(node: HTMLElement) {
  document.body.appendChild(node);
  return {
    destroy() {
      node.remove();
    }
  };
}
