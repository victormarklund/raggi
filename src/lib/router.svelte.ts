export type Route = { name: 'home' } | { name: 'project'; id: string };

function parseHash(hash: string): Route {
  const m = hash.match(/^#\/p\/([^/?#]+)/);
  return m ? { name: 'project', id: decodeURIComponent(m[1]) } : { name: 'home' };
}

const depth = (r: Route) => (r.name === 'home' ? 0 : 1);

export const router: { route: Route; direction: 1 | -1 } = $state({
  route: parseHash(typeof location !== 'undefined' ? location.hash : ''),
  direction: 1
});

/** Whether we pushed an entry ourselves (so history.back() stays inside the app). */
let pushedFromHome = false;

export function initRouter() {
  addEventListener('hashchange', () => {
    const next = parseHash(location.hash);
    router.direction = depth(next) >= depth(router.route) ? 1 : -1;
    if (next.name === 'home') pushedFromHome = false;
    router.route = next;
  });
}

export function openProject(id: string) {
  pushedFromHome = router.route.name === 'home';
  location.hash = `#/p/${encodeURIComponent(id)}`;
}

export function goHome() {
  if (pushedFromHome) {
    history.back();
  } else {
    // deep-linked / launched straight into a project: replace instead
    router.direction = -1;
    history.replaceState(null, '', '#/');
    router.route = { name: 'home' };
  }
}
