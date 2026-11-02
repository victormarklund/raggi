/**
 * Keeps the screen on while `enabled` is true and the page is visible.
 * Uses the Screen Wake Lock API, falling back to a muted looping inline video
 * (the NoSleep technique) for older iOS home-screen apps.
 */
let sentinel: WakeLockSentinel | null = null;
let video: HTMLVideoElement | null = null;
let wanted = false;
let listening = false;

const supported = () => typeof navigator !== 'undefined' && 'wakeLock' in navigator;

function getVideo(): HTMLVideoElement {
  if (video) return video;
  const v = document.createElement('video');
  v.src = `${import.meta.env.BASE_URL}awake.mp4`;
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.setAttribute('muted', '');
  v.setAttribute('aria-hidden', 'true');
  v.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0.01;pointer-events:none;left:0;top:0';
  document.body.appendChild(v);
  video = v;
  return v;
}

async function acquire() {
  if (!wanted || document.visibilityState !== 'visible') return;
  if (supported()) {
    try {
      if (!sentinel || sentinel.released) {
        sentinel = await navigator.wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          sentinel = null;
        });
      }
      return;
    } catch {
      /* fall through to the video fallback */
    }
  }
  getVideo().play().catch(() => {
    /* needs a user gesture — we retry on the next pointerdown */
  });
}

async function release() {
  try {
    await sentinel?.release();
  } catch {
    /* ignore */
  }
  sentinel = null;
  video?.pause();
}

function onVisibility() {
  if (document.visibilityState === 'visible') acquire();
}

function onGesture() {
  if (wanted && !sentinel && (!video || video.paused)) acquire();
}

export function setKeepAwake(enabled: boolean) {
  wanted = enabled;
  if (!listening) {
    listening = true;
    document.addEventListener('visibilitychange', onVisibility);
    addEventListener('pointerdown', onGesture, { passive: true });
  }
  if (enabled) acquire();
  else release();
}
