/**
 * The mouse paints with a grungy ink brush: a rough stroke with ragged, bristly edges that turns
 * into dry-brush streaks when the brush runs low, drips that run down under gravity and splatter
 * on quick flicks. Everything it paints lives only a moment: the ink stays wet for a beat and then
 * cracks and crumbles into specks and dry-brush streaks until it is gone, so the page never fills up.
 * Only for a mouse and without reduced motion.
 */

const TAU = Math.PI * 2;
const STAMP = 128; // brush stamp texture size
const CORE = 40; // radius of the stamp's solid core
/** How long each mark lives, in ms. Short on purpose: a little trail, not a painted screen. */
const LIFE = 1300;
const DRY_FROM = 0.35; // share of its life a mark stays wet before it starts to crumble
const LEVELS = 8; // steps of crumbling, from wet ink to the last specks
const TILE = 384; // size of the paper-grain tile that decides where the ink cracks first
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

/**
 * Crumbling masks, one per level: each keeps the paper-grain pixels above a cut, so as the level
 * rises the ink breaks up into blotches, streaks along the fibres and fine grit. Because the grain
 * is fixed to the screen, overlapping dabs of the same age crumble in exactly the same places.
 */
function dryingMasks() {
  const v = new Float32Array(TILE * TILE);
  const octave = (cw: number, ch: number, amp: number) => {
    const nx = TILE / cw, ny = TILE / ch;
    const lattice = Float32Array.from({ length: nx * ny }, () => Math.random());
    const smooth = (f: number) => f * f * (3 - 2 * f);
    for (let y = 0; y < TILE; y++) {
      const gy = y / ch, y0 = Math.floor(gy), sy = smooth(gy - y0);
      const r0 = y0 * nx, r1 = ((y0 + 1) % ny) * nx;
      for (let x = 0; x < TILE; x++) {
        const gx = x / cw, x0 = Math.floor(gx), sx = smooth(gx - x0), x1 = (x0 + 1) % nx;
        const a = lattice[r0 + x0] + (lattice[r0 + x1] - lattice[r0 + x0]) * sx;
        const b = lattice[r1 + x0] + (lattice[r1 + x1] - lattice[r1 + x0]) * sx;
        v[y * TILE + x] += (a + (b - a) * sy) * amp;
      }
    }
  };
  octave(64, 64, 0.4); // blotches
  octave(48, 12, 0.25); // streaks along the fibres
  octave(12, 3, 0.15);
  octave(2, 2, 0.2); // grit
  const sorted = Float32Array.from(v).sort();
  return Array.from({ length: LEVELS }, (_, l) => {
    const cut = sorted[Math.floor((l / LEVELS) * (sorted.length - 1))];
    const [c, g] = surface(TILE);
    const img = g.createImageData(TILE, TILE);
    for (let i = 0; i < v.length; i++) img.data[i * 4 + 3] = v[i] > cut ? 255 : 0;
    g.putImageData(img, 0, 0);
    return c;
  });
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
  const layer = document.createElement('canvas'); // where each crumbling level is masked
  const lctx = layer.getContext('2d')!;
  const masks = dryingMasks().map((m) => lctx.createPattern(m, 'repeat')!);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    layer.width = canvas.width = innerWidth * dpr;
    layer.height = canvas.height = innerHeight * dpr;
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
      x: x + rnd(-w, w) * 0.3, y: y + w * 0.15,
      len: rnd(18, 60) * (Math.random() < 0.2 ? 2 : 1),
      w: rnd(1.6, 1.6 + w * 0.08), bend: rnd(-4, 4), grow: rnd(450, 800), t,
    });
    // Now and then a drop falls loose below it.
    if (Math.random() < 0.4) dots.push({ x: x + rnd(-6, 6), y: y + w * 0.5 + rnd(30, 90), r: rnd(1.2, 3), t });
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

  const expire = <T extends { t: number }>(list: T[], now: number) => {
    let k = 0;
    while (k < list.length && now - list[k].t > LIFE) k++;
    if (k) list.splice(0, k);
  };
  /** 0 while wet, then 1…LEVELS-1 as the mark crumbles. */
  const level = (t: number, now: number) => {
    const k = (now - t) / LIFE;
    return k < DRY_FROM ? 0 : Math.min(LEVELS - 1, 1 + Math.floor(((k - DRY_FROM) / (1 - DRY_FROM)) * (LEVELS - 1)));
  };

  // Bounding box (CSS px) of what the current level painted, so only that area is masked.
  let bx0 = 0, by0 = 0, bx1 = 0, by1 = 0;
  const cover = (x: number, y: number, r: number) => {
    bx0 = Math.min(bx0, x - r); by0 = Math.min(by0, y - r);
    bx1 = Math.max(bx1, x + r); by1 = Math.max(by1, y + r);
  };
  const paintStamp = (g: CanvasRenderingContext2D, s: Stamp) => {
    const c = Math.cos(s.a) * s.s * dpr, sn = Math.sin(s.a) * s.s * dpr;
    g.setTransform(c, sn, -sn, c, s.x * dpr, s.y * dpr);
    g.drawImage((s.dry ? tex.dry : tex.wet)[s.i], -STAMP / 2, -STAMP / 2);
    cover(s.x, s.y, STAMP * 0.71 * s.s);
  };
  const paintDrip = (g: CanvasRenderingContext2D, d: Drip, now: number) => {
    const grown = Math.min(1, (now - d.t) / d.grow);
    const l = d.len * (1 - (1 - grown) ** 3); // runs quickly, then slows as it thins out
    // A tapered runnel: wide where it leaves the stroke, thin as it runs, with a bead at the end.
    const top = d.w * 1.3, low = d.w * 0.45, ex = d.x + d.bend * 0.4, ey = d.y + l, cx = d.x + d.bend;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.beginPath();
    g.moveTo(d.x - top, d.y);
    g.quadraticCurveTo(cx - (top + low) / 2, d.y + l / 2, ex - low, ey);
    g.lineTo(ex + low, ey);
    g.quadraticCurveTo(cx + (top + low) / 2, d.y + l / 2, d.x + top, d.y);
    g.fill();
    g.beginPath();
    g.arc(d.x, d.y, top, 0, TAU);
    g.fill();
    g.beginPath();
    g.arc(ex, ey, d.w * 1.1, 0, TAU);
    g.fill();
    cover(d.x, d.y, top + 6);
    cover(ex, ey, d.w * 2 + 6);
  };
  const paintDot = (g: CanvasRenderingContext2D, d: Dot) => {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.beginPath();
    g.arc(d.x, d.y, d.r, 0, TAU);
    g.fill();
    cover(d.x, d.y, d.r + 1);
  };

  let dirty = false;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (now - lastMove > 120) load = Math.min(1, load + 0.03);
    expire(stamps, now);
    expire(drips, now);
    expire(dots, now);
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

    // Wet ink goes straight onto the canvas; each crumbling level is painted on the layer, cut
    // with its mask and then copied over.
    for (let l = 0; l < LEVELS; l++) {
      const g = l ? lctx : ctx;
      g.fillStyle = color;
      bx0 = by0 = Infinity;
      bx1 = by1 = -Infinity;
      for (const s of stamps) if (level(s.t, now) === l) paintStamp(g, s);
      for (const d of drips) if (level(d.t, now) === l) paintDrip(g, d, now);
      for (const d of dots) if (level(d.t, now) === l) paintDot(g, d);
      if (!l || bx1 < bx0) continue;
      const x0 = Math.max(0, Math.floor(bx0 * dpr)), y0 = Math.max(0, Math.floor(by0 * dpr));
      const w = Math.min(layer.width, Math.ceil(bx1 * dpr)) - x0, h = Math.min(layer.height, Math.ceil(by1 * dpr)) - y0;
      if (w <= 0 || h <= 0) continue;
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalCompositeOperation = 'destination-in';
      lctx.fillStyle = masks[l];
      lctx.fillRect(x0, y0, w, h);
      lctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(layer, x0, y0, w, h, x0, y0, w, h);
      lctx.clearRect(x0, y0, w, h);
    }
  };
  requestAnimationFrame(frame);
}
