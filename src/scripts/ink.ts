/**
 * The mouse paints with a grungy ink brush: a rough stroke with ragged, bristly edges that turns
 * into dry-brush streaks when the brush runs low, drips that run down under gravity and splatter
 * on quick flicks. Everything it paints lives only a moment and then dries away, so the page never
 * fills up.
 * Only for a mouse and without reduced motion.
 */

const TAU = Math.PI * 2;
const STAMP = 128; // brush stamp texture size
const CORE = 40; // radius of the stamp's solid core
/** How long each mark lives, in ms. Short on purpose: a little trail, not a painted screen. */
const LIFE = { stamp: 1150, drip: 1600, dot: 1300 };
const MAX_STAMPS = 1400;
const MAX_DRIPS = 12;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = (n: number) => Math.floor(Math.random() * n);

function surface(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  return [c, g];
}

/** A wet dab: a rough blob with a grainy rim and a few bristles poking out along the stroke (x axis). */
function wetStamp(color: string) {
  const [c, g] = surface(STAMP);
  const m = STAMP / 2;
  g.fillStyle = g.strokeStyle = color;
  const p1 = rnd(0, TAU), p2 = rnd(0, TAU);
  g.beginPath();
  for (let i = 0; i <= 96; i++) {
    const t = (i / 96) * TAU;
    const r = CORE * (0.9 + 0.06 * Math.sin(3 * t + p1) + 0.04 * Math.sin(8 * t + p2) + rnd(-0.045, 0.045));
    if (i) g.lineTo(m + Math.cos(t) * r, m + Math.sin(t) * r);
    else g.moveTo(m + Math.cos(t) * r, m + Math.sin(t) * r);
  }
  g.fill();
  for (let i = 0; i < 240; i++) {
    const t = rnd(0, TAU);
    const d = CORE * (0.85 + Math.random() ** 2 * 0.45);
    g.beginPath();
    g.arc(m + Math.cos(t) * d, m + Math.sin(t) * d, rnd(0.4, 1.7), 0, TAU);
    g.fill();
  }
  g.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const y = m + (Math.random() < 0.5 ? -1 : 1) * CORE * rnd(0.78, 1.14);
    const len = rnd(14, 46);
    const x = m + rnd(-CORE * 0.6, CORE * 0.6) - len / 2;
    g.lineWidth = rnd(0.6, 1.7);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y + rnd(-1, 1));
    g.stroke();
  }
  return c;
}

/** A dry dab: broken streaks along the stroke, the paper showing through between bristles. */
function dryStamp(color: string) {
  const [c, g] = surface(STAMP);
  const m = STAMP / 2;
  g.strokeStyle = g.fillStyle = color;
  g.lineCap = 'round';
  for (let y = -CORE; y <= CORE; y += 1.6) {
    if (Math.random() < 0.38) continue;
    const half = CORE * Math.sqrt(1 - (y / CORE) ** 2) * rnd(0.6, 1.15);
    let x = m - half;
    while (x < m + half) {
      const len = rnd(8, half * 1.4 + 8);
      g.globalAlpha = rnd(0.55, 1);
      g.lineWidth = rnd(0.7, 1.9);
      g.beginPath();
      g.moveTo(x, m + y);
      g.lineTo(Math.min(x + len, m + half), m + y + rnd(-0.6, 0.6));
      g.stroke();
      x += len + rnd(3, 14);
    }
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 40; i++) {
    g.beginPath();
    g.arc(m + rnd(-CORE, CORE), m + rnd(-CORE, CORE) * 1.1, rnd(0.4, 1.2), 0, TAU);
    g.fill();
  }
  return c;
}

function textures(color: string) {
  return {
    wet: Array.from({ length: 6 }, () => wetStamp(color)),
    dry: Array.from({ length: 4 }, () => dryStamp(color)),
  };
}

type Stamp = { x: number; y: number; a: number; s: number; t: number; i: number; dry: boolean };
type Drip = { x: number; y: number; len: number; w: number; bend: number; grow: number; t: number };
type Dot = { x: number; y: number; r: number; t: number };

export function startInk() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('canvas.ink-trail')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'ink-trail';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  };
  resize();
  addEventListener('resize', resize);

  const readColor = () => getComputedStyle(document.documentElement).getPropertyValue('--ink-trail').trim() || 'rgb(31,27,22)';
  let color = readColor();
  let tex = textures(color);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    color = readColor();
    tex = textures(color);
  });

  const stamps: Stamp[] = [], drips: Drip[] = [], dots: Dot[] = [];
  let last: { x: number; y: number; w: number } | null = null;
  let mid = { x: 0, y: 0 };
  let load = 1; // ink left in the brush: it runs dry over a long stroke and refills when you rest
  let lastMove = 0;

  const dab = (x: number, y: number, a: number, w: number, t: number) => {
    const dry = Math.random() < (0.72 - load) * 1.7;
    stamps.push({ x, y, a: a + rnd(-0.08, 0.08), s: w / (2 * CORE), t, i: pick(dry ? tex.dry.length : tex.wet.length), dry });
  };
  const drip = (x: number, y: number, w: number, t: number) => {
    if (drips.length >= MAX_DRIPS) return;
    drips.push({
      x: x + rnd(-w, w) * 0.3, y: y + w * 0.3,
      len: rnd(18, 60) * (Math.random() < 0.2 ? 2 : 1),
      w: rnd(1.6, 1.6 + w * 0.08), bend: rnd(-4, 4), grow: rnd(500, 900), t,
    });
  };
  const splat = (x: number, y: number, a: number, spread: number, n: number, reach: number, t: number) => {
    for (let i = 0; i < n; i++) {
      const d = rnd(8, reach), b = a + rnd(-spread, spread);
      dots.push({ x: x + Math.cos(b) * d, y: y + Math.sin(b) * d, r: rnd(0.8, 3.2), t });
    }
    if (Math.random() < 0.2) { // a tight little cluster of specks
      const d = rnd(reach * 0.5, reach), cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d;
      for (let i = 0; i < 6 + pick(6); i++) dots.push({ x: cx + rnd(-7, 7), y: cy + rnd(-7, 7), r: rnd(0.4, 1.3), t });
    }
  };

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const x = e.clientX, y = e.clientY, now = performance.now();
    if (!last) { // the brush touches the paper: a heavier blot to start
      last = { x, y, w: 16 };
      mid = { x, y };
      dab(x, y, rnd(0, TAU), 26 * (0.6 + load * 0.4), now);
      splat(x, y, rnd(0, TAU), Math.PI, 3 + pick(5), 40, now);
      if (load > 0.5 && Math.random() < 0.5) drip(x, y, 22, now);
      lastMove = now;
      return;
    }
    const dist = Math.hypot(x - last.x, y - last.y);
    if (dist < 1.5) return;
    const target = Math.max(5, (34 - dist * 0.45) * (0.45 + load * 0.55));
    const w = last.w + (target - last.w) * 0.25;
    const m = { x: (x + last.x) / 2, y: (y + last.y) / 2 };

    // Walk the smoothed curve mid → m (bending through the last point) and dab along it.
    const len = Math.hypot(last.x - mid.x, last.y - mid.y) + Math.hypot(m.x - last.x, m.y - last.y);
    const n = Math.max(1, Math.ceil(len / Math.max(1.5, w * 0.16)));
    for (let i = 1; i <= n; i++) {
      const t = i / n, u = 1 - t;
      const px = u * u * mid.x + 2 * u * t * last.x + t * t * m.x;
      const py = u * u * mid.y + 2 * u * t * last.y + t * t * m.y;
      const dx = u * (last.x - mid.x) + t * (m.x - last.x);
      const dy = u * (last.y - mid.y) + t * (m.y - last.y);
      dab(px, py, Math.atan2(dy, dx), last.w + (w - last.w) * t, now);
    }
    if (stamps.length > MAX_STAMPS) stamps.splice(0, stamps.length - MAX_STAMPS);

    if (Math.random() < 0.05 * (w / 34) * load) drip(m.x, m.y, w, now);
    if (dist > 32 && Math.random() < 0.55) splat(x, y, Math.atan2(y - last.y, x - last.x), 0.7, 1 + pick(4), 20 + dist * 0.4, now);

    load = Math.max(0.15, load - dist / 2600);
    last = { x, y, w };
    mid = m;
    lastMove = now;
  }, { passive: true });

  const lift = () => { last = null; };
  document.documentElement.addEventListener('pointerleave', lift);
  document.addEventListener('pointerdown', lift);

  const expire = <T extends { t: number }>(list: T[], life: number, now: number) => {
    let k = 0;
    while (k < list.length && now - list[k].t > life) k++;
    if (k) list.splice(0, k);
  };
  const place = (img: HTMLCanvasElement, x: number, y: number, a: number, s: number, alpha: number) => {
    const c = Math.cos(a) * s * dpr, sn = Math.sin(a) * s * dpr;
    ctx.globalAlpha = alpha;
    ctx.setTransform(c, sn, -sn, c, x * dpr, y * dpr);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
  };
  /** 1 while fresh, then eases to 0 once the mark starts to dry at `from` (0–1 of its life). */
  const dryOut = (k: number, from: number) => (k < from ? 1 : (1 - (k - from) / (1 - from)) ** 1.4);

  let dirty = false;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (now - lastMove > 120) load = Math.min(1, load + 0.03);
    expire(stamps, LIFE.stamp, now);
    expire(drips, LIFE.drip, now);
    expire(dots, LIFE.dot, now);
    if (!stamps.length && !drips.length && !dots.length) {
      if (dirty) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dirty = false;
      }
      return;
    }
    dirty = true;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stamps) {
      const k = (now - s.t) / LIFE.stamp;
      const shrink = 1 - 0.15 * Math.max(0, (k - 0.4) / 0.6);
      place((s.dry ? tex.dry : tex.wet)[s.i], s.x, s.y, s.a, s.s * shrink, dryOut(k, 0.4));
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    for (const d of drips) {
      const age = now - d.t;
      const g = Math.min(1, age / d.grow);
      const l = d.len * (1 - (1 - g) ** 3); // runs quickly, then slows as it thins out
      ctx.globalAlpha = dryOut(age / LIFE.drip, 0.4);
      // A tapered runnel: wide where it leaves the stroke, thin as it runs, with a bead at the end.
      const top = d.w * 1.3, low = d.w * 0.45, ex = d.x + d.bend * 0.4, ey = d.y + l, cx = d.x + d.bend;
      ctx.beginPath();
      ctx.moveTo(d.x - top, d.y);
      ctx.quadraticCurveTo(cx - (top + low) / 2, d.y + l / 2, ex - low, ey);
      ctx.lineTo(ex + low, ey);
      ctx.quadraticCurveTo(cx + (top + low) / 2, d.y + l / 2, d.x + top, d.y);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(d.x, d.y, top * 1.4, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex, ey, d.w * 1.1, 0, TAU);
      ctx.fill();
    }
    for (const d of dots) {
      ctx.globalAlpha = dryOut((now - d.t) / LIFE.dot, 0.45);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  requestAnimationFrame(frame);
}
