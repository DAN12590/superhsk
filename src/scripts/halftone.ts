/** A drifting halftone grid on the page background that blooms around a moving mouse. */

const SPACING = 14;
const NOISE_STEP = SPACING * 4;
const NOISE_SCALE = 270;
const DOT_RADIUS = 3;
const FOCUS_RADIUS = 185;
const FOCUS_GROWTH = 3.4;
const FOCUS_IDLE = 180;
const AMBIENT_FRAME_INTERVAL = 80;
const FOCUS_FRAME_INTERVAL = 32;
const TAU = Math.PI * 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function latticeValue(x: number, y: number) {
  const seed = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  const hash = Math.imul(seed ^ (seed >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 0xffffffff;
}

function noise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const u = smoothstep(x - ix), v = smoothstep(y - iy);
  return lerp(
    lerp(latticeValue(ix, iy), latticeValue(ix + 1, iy), u),
    lerp(latticeValue(ix, iy + 1), latticeValue(ix + 1, iy + 1), u),
    v,
  );
}

let started = false;

export function startHalftone() {
  if (started) return;
  const canvas = document.querySelector<HTMLCanvasElement>('.halftone');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  started = true;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const colorScheme = matchMedia('(prefers-color-scheme: dark)');
  const pointer = { x: 0, y: 0, lastMove: -Infinity };
  const focus = { x: 0, y: 0, strength: 0 };

  let width = 0, height = 0, dpr = 0;
  let columns = 0, rows = 0;
  let field = new Float32Array(0);
  let time = 0;
  let lastDraw: number | undefined;
  let request: number | undefined;
  let needsResize = true;
  let needsPaint = true;

  const resize = () => {
    needsResize = false;
    const nextWidth = canvas.clientWidth, nextHeight = canvas.clientHeight;
    const nextDpr = Math.min(devicePixelRatio || 1, 2);
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;

    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.ceil(width / NOISE_STEP) + 1;
    rows = Math.ceil(height / NOISE_STEP) + 1;
    field = new Float32Array(columns * rows);
    needsPaint = true;
  };

  const paint = () => {
    // Blend two slowly drifting noise layers on a coarse grid, then interpolate at the dots.
    const detail = 0.24 + 0.06 * Math.sin(time * 0.27);
    const scale = NOISE_STEP / NOISE_SCALE;
    for (let row = 0; row < rows; row++) {
      const y = row * scale;
      for (let col = 0; col < columns; col++) {
        const x = col * scale;
        const broad = noise(x + 3.7 + time * 0.015, y + 5.2 - time * 0.009);
        const small = noise(x * 2.05 - 4.3 - time * 0.013, y * 2.05 + 2.8 + time * 0.012);
        field[row * columns + col] = lerp(broad, small, detail);
      }
    }

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    if (needsPaint) ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    ctx.beginPath();
    const growth = focus.strength * FOCUS_GROWTH;
    const focusRadiusSquared = FOCUS_RADIUS * FOCUS_RADIUS;
    for (let y = SPACING / 2; y < height; y += SPACING) {
      const gy = y / NOISE_STEP, iy = Math.floor(gy);
      const top = iy * columns, bottom = top + columns;
      const v = gy - iy;
      const reach = focusRadiusSquared - (y - focus.y) ** 2;
      for (let x = SPACING / 2; x < width; x += SPACING) {
        const gx = x / NOISE_STEP, ix = Math.floor(gx);
        const u = gx - ix;
        const value = lerp(
          lerp(field[top + ix], field[top + ix + 1], u),
          lerp(field[bottom + ix], field[bottom + ix + 1], u),
          v,
        );
        let radius = DOT_RADIUS * Math.max(0, 2 * value - 1);
        if (growth > 0 && reach > 0) {
          const falloff = (reach - (x - focus.x) ** 2) / focusRadiusSquared;
          if (falloff > 0) radius += growth * smoothstep(falloff);
        }
        if (radius < 0.15) continue;
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, TAU);
      }
    }
    ctx.fill();
  };

  const releasePointer = () => { pointer.lastMove = -Infinity; };
  const frame = (now: number) => {
    request = undefined;
    if (needsResize) resize();

    const animated = !reducedMotion.matches;
    const following = now - pointer.lastMove < FOCUS_IDLE;
    const interval = following || focus.strength > 0 ? FOCUS_FRAME_INTERVAL : AMBIENT_FRAME_INTERVAL;
    const delta = lastDraw === undefined ? 16 : now - lastDraw;
    if (needsPaint || (animated && (lastDraw === undefined || delta >= interval))) {
      if (animated) {
        time += delta / 1000;
        const follow = 1 - Math.exp(-delta / 85);
        focus.x = lerp(focus.x, pointer.x, follow);
        focus.y = lerp(focus.y, pointer.y, follow);
        const fade = 1 - Math.exp(-delta / (following ? 105 : 240));
        focus.strength = lerp(focus.strength, Number(following), fade);
        if (!following && focus.strength < 0.005) focus.strength = 0;
      }
      paint();
      needsPaint = false;
      lastDraw = now;
    }
    schedule();
  };

  const schedule = () => {
    if (document.hidden || request !== undefined) return;
    if (!reducedMotion.matches || needsPaint || needsResize) request = requestAnimationFrame(frame);
  };

  addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches || document.hidden) return;
    const { clientX: x, clientY: y } = event;
    if (x === pointer.x && y === pointer.y && Number.isFinite(pointer.lastMove)) return;
    if (focus.strength === 0) {
      focus.x = x;
      focus.y = y;
    }
    pointer.x = x;
    pointer.y = y;
    pointer.lastMove = performance.now();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', releasePointer);
  addEventListener('blur', releasePointer);
  finePointer.addEventListener('change', releasePointer);
  addEventListener('resize', () => {
    needsResize = true;
    schedule();
  });
  colorScheme.addEventListener('change', () => {
    needsPaint = true;
    schedule();
  });
  reducedMotion.addEventListener('change', () => {
    releasePointer();
    focus.strength = 0;
    lastDraw = undefined;
    needsPaint = true;
    schedule();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (request !== undefined) cancelAnimationFrame(request);
      request = undefined;
      lastDraw = undefined;
      releasePointer();
    } else {
      schedule();
    }
  });
  schedule();
}
