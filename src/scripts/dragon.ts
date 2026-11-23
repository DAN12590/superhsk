/**
 * A lantern-style Chinese dragon that swims across the page background.
 *
 * The dragon follows a closed figure-eight route across the viewport. Scrolling (in either
 * direction) pushes it forward along the route; when the page is still it keeps crawling slowly.
 * Its body follows the head along the route like a ribbon, with a travelling undulation, a roll
 * that shows the belly in profile and the dorsal ridge when seen from above, four clawed legs,
 * a flowing mane, antlers, whiskers and the flaming pearl it chases.
 */

interface Pt { x: number; y: number }

interface Node {
  x: number; y: number;
  /** Unit tangent pointing towards the head. */
  tx: number; ty: number;
  /** Unit normal: the tangent turned 90° clockwise on screen. */
  nx: number; ny: number;
  /** Body radius. */
  r: number;
  /** Roll: +1 belly towards +normal, -1 belly towards -normal, 0 seen from above. */
  s: number;
}

const TAU = Math.PI * 2;
const LUT_STEPS = 2048;
/** Distance between spine samples, in CSS pixels. */
const STEP = 5;
/** Body length in body radii. */
const BODY_LENGTH = 30;
/** Crawl speed while the page is still, in body radii per second. */
const IDLE_SPEED = 0.55;
/** Route distance travelled per pixel scrolled. */
const SCROLL_GAIN = 0.75;
const MAX_SCROLL_STEP = 160;
const IDLE_FRAME = 1000 / 30;
const MAX_DPR = 2;

const C = {
  line: '#5e0a06',
  deep: '#9e140d',
  red: '#d42a1c',
  orange: '#ff761a',
  amber: '#ffa42a',
  gold: '#ffd246',
  cream: '#fff0b4',
  white: '#fffdf3',
  teal: '#12a594',
  blue: '#2b6de0',
  violet: '#8a4fd6',
  green: '#3fb24a',
  mouth: '#4a0805',
  tongue: '#ee3c58',
  pearl: '#cfe0ff',
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); };

/** A closed figure-eight across the viewport, sampled by arc length. */
class Route {
  private xs = new Float64Array(LUT_STEPS + 1);
  private ys = new Float64Array(LUT_STEPS + 1);
  private lens = new Float64Array(LUT_STEPS + 1);
  total = 1;

  build(width: number, height: number) {
    const tall = height > width * 1.15;
    let length = 0;
    for (let k = 0; k <= LUT_STEPS; k++) {
      const u = (k / LUT_STEPS) * TAU;
      const along = 0.36 * Math.sin(u) + 0.05 * Math.sin(3 * u + 0.7);
      const across = 0.27 * Math.sin(2 * u + 0.35) + 0.04 * Math.sin(5 * u + 1.3);
      const x = width * (0.5 + (tall ? across * 1.1 : along));
      const y = height * (0.5 + (tall ? along : across));
      if (k > 0) length += Math.hypot(x - this.xs[k - 1], y - this.ys[k - 1]);
      this.xs[k] = x;
      this.ys[k] = y;
      this.lens[k] = length;
    }
    this.total = length || 1;
  }

  at(distance: number, out: Pt) {
    const d = ((distance % this.total) + this.total) % this.total;
    let lo = 0, hi = LUT_STEPS;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.lens[mid] <= d) lo = mid; else hi = mid;
    }
    const f = (d - this.lens[lo]) / (this.lens[hi] - this.lens[lo] || 1);
    out.x = lerp(this.xs[lo], this.xs[hi], f);
    out.y = lerp(this.ys[lo], this.ys[hi], f);
  }
}

/** Body thickness from head (0) to tail (1), relative to the widest point. */
function profile(t: number) {
  if (t < 0.1) return 0.8 + 0.2 * smooth(t / 0.1);
  return Math.max(0.07, Math.pow(1 - (t - 0.1) / 0.9, 0.7));
}

/** Points of a curling line: starts at (x, y) heading at angle a0 and turns by turn(k) each segment. */
function curl(x: number, y: number, a0: number, segments: number, length: number, turn: (k: number) => number): Pt[] {
  const pts: Pt[] = [{ x, y }];
  let a = a0;
  for (let k = 0; k < segments; k++) {
    a += turn(k);
    x += Math.cos(a) * length;
    y += Math.sin(a) * length;
    pts.push({ x, y });
  }
  return pts;
}

/** Adds a tapered band along a polyline to the current path. */
function band(ctx: CanvasRenderingContext2D, pts: Pt[], w0: number, w1: number) {
  const n = pts.length;
  const left: Pt[] = [], right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const w = lerp(w0, w1, i / (n - 1)) / 2;
    left.push({ x: pts[i].x - (dy / len) * w, y: pts[i].y + (dx / len) * w });
    right.push({ x: pts[i].x + (dy / len) * w, y: pts[i].y - (dx / len) * w });
  }
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
}

/** A tapered band with a dark outline and an optional lighter core. */
function limb(ctx: CanvasRenderingContext2D, pts: Pt[], w0: number, w1: number, edge: number, fill: string, core?: string) {
  ctx.fillStyle = C.line;
  ctx.beginPath(); band(ctx, pts, w0 + edge * 2, w1 + edge * 2); ctx.fill();
  ctx.fillStyle = fill;
  ctx.beginPath(); band(ctx, pts, w0, w1); ctx.fill();
  if (core) {
    ctx.fillStyle = core;
    ctx.beginPath(); band(ctx, pts, w0 * 0.38, w1 * 0.3); ctx.fill();
  }
}

/** Adds a flame-shaped tuft from a base point to a tip to the current path. */
function flame(ctx: CanvasRenderingContext2D, bx: number, by: number, tx: number, ty: number, width: number, bend = 0.4) {
  const dx = tx - bx, dy = ty - by, len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * width, py = (dx / len) * width;
  ctx.moveTo(bx + px, by + py);
  ctx.quadraticCurveTo(bx + dx * 0.5 + px * (1.1 + bend), by + dy * 0.5 + py * (1.1 + bend), tx, ty);
  ctx.quadraticCurveTo(bx + dx * 0.55 - px * (0.5 - bend), by + dy * 0.55 - py * (0.5 - bend), bx - px, by - py);
  ctx.closePath();
}

/** A layered flame: dark rim, colour and a bright heart. */
function tuft(ctx: CanvasRenderingContext2D, bx: number, by: number, tx: number, ty: number, width: number, color: string, edge: number, bend = 0.4) {
  ctx.beginPath(); flame(ctx, bx, by, tx, ty, width, bend);
  ctx.fillStyle = color; ctx.fill();
  ctx.lineWidth = edge; ctx.strokeStyle = C.line; ctx.stroke();
  ctx.beginPath(); flame(ctx, bx, by, lerp(bx, tx, 0.62), lerp(by, ty, 0.62), width * 0.45, bend);
  ctx.fillStyle = 'rgba(255, 240, 170, 0.55)'; ctx.fill();
}

/** The dragon now on screen and how to stop it. Only the home page has a dragon canvas. */
let active: { canvas: HTMLCanvasElement; stop: () => void } | null = null;

/** Starts the dragon on pages that have its canvas and stops it on the ones that don't. */
export function startDragon() {
  const canvas = document.querySelector<HTMLCanvasElement>('.dragon');
  if (active?.canvas === canvas) return;
  active?.stop();
  active = null;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const listeners = new AbortController();
  const signal = listeners.signal;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const route = new Route();
  const tmp: Pt = { x: 0, y: 0 };

  let width = 0, height = 0, dpr = 1, R = 30;
  let nodes: Node[] = [];
  let travel = 0, pending = 0, time = 0;
  let flip = 1, flipTarget = 1;
  let lastScroll = scrollY;
  let last: number | undefined;
  let lastPaint = -Infinity;
  let needsResize = true;
  let request: number | undefined;

  const resize = () => {
    needsResize = false;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const d = Math.min(devicePixelRatio || 1, MAX_DPR);
    if (w === width && h === height && d === dpr && nodes.length) return;
    width = w; height = h; dpr = d;
    canvas.width = Math.round(w * d);
    canvas.height = Math.round(h * d);
    R = clamp(Math.min(w, h) * 0.05, 15, 42);
    route.build(w, h);
    const count = Math.ceil((BODY_LENGTH * R) / STEP) + 1;
    nodes = Array.from({ length: count }, () => ({ x: 0, y: 0, tx: 1, ty: 0, nx: 0, ny: 1, r: 0, s: 0 }));
    if (!travel) travel = route.total * 0.18;
  };

  const frames = () => {
    const n = nodes.length;
    for (let i = 0; i < n; i++) {
      const a = nodes[Math.max(0, i - 1)], b = nodes[Math.min(n - 1, i + 1)];
      const dx = a.x - b.x, dy = a.y - b.y, len = Math.hypot(dx, dy) || 1;
      const node = nodes[i];
      node.tx = dx / len; node.ty = dy / len;
      node.nx = -node.ty; node.ny = node.tx;
    }
  };

  /** Places the spine along the route, adds the swimming wave and works out thickness and roll. */
  const layout = (dt: number) => {
    const n = nodes.length;
    for (let i = 0; i < n; i++) {
      route.at(travel - i * STEP, tmp);
      nodes[i].x = tmp.x; nodes[i].y = tmp.y;
    }
    frames();
    const k = TAU / (R * 10);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const amp = R * lerp(0.08, 0.55, smooth(t / 0.3));
      const off = amp * Math.sin(i * STEP * k - time * 2.3);
      nodes[i].x += nodes[i].nx * off;
      nodes[i].y += nodes[i].ny * off;
    }
    frames();

    const head = nodes[0];
    if (head.ny > 0.22) flipTarget = 1;
    else if (head.ny < -0.22) flipTarget = -1;
    flip = dt ? clamp(flip + clamp(flipTarget - flip, -dt * 3.5, dt * 3.5), -1, 1) : flipTarget;

    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const node = nodes[i];
      node.r = R * profile(t);
      node.s = lerp(flip, Math.tanh(node.ny * 2.6), smooth(t / 0.16));
    }
  };

  const at = (t: number) => nodes[Math.round(t * (nodes.length - 1))];

  /** Adds one circle per spine node to the current path: their union is the body. */
  const tube = (scale: number, shift: number) => {
    ctx.beginPath();
    for (const node of nodes) {
      const r = node.r * scale;
      if (r < 0.4) continue;
      const o = node.s * node.r * shift;
      const x = node.x + node.nx * o, y = node.y + node.ny * o;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, TAU);
    }
  };

  const drawPearl = (glow: number) => {
    route.at(travel + R * 4.6, tmp);
    const r = R * 0.62;
    const x = tmp.x, y = tmp.y + Math.sin(time * 1.6) * R * 0.25;
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU + time * 0.9;
      const len = r * (2.0 + 0.35 * Math.sin(time * 4 + k * 1.9));
      tuft(ctx, x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6,
        x + Math.cos(a + 0.35) * len, y + Math.sin(a + 0.35) * len,
        r * 0.32, k % 2 ? C.orange : C.red, R * 0.04, 0.6);
    }
    ctx.save();
    ctx.shadowColor = `rgba(190, 220, 255, ${0.5 + 0.4 * glow})`;
    ctx.shadowBlur = R * (0.6 + glow) * dpr;
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, C.white);
    g.addColorStop(0.6, C.pearl);
    g.addColorStop(1, '#8eaee0');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.lineWidth = R * 0.05; ctx.strokeStyle = 'rgba(60, 80, 130, 0.6)'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; ctx.lineWidth = R * 0.07;
    ctx.beginPath(); ctx.arc(x, y, r * 0.62, -2.6, -1.6); ctx.stroke();
  };

  const drawLeg = (node: Node, side: number, len: number, swing: number) => {
    const rs = clamp(side * (1 - Math.abs(node.s)) + node.s, -1, 1);
    const root = { x: node.x + node.nx * rs * node.r * 0.45, y: node.y + node.ny * rs * node.r * 0.45 };
    let ox = node.nx * rs - node.tx * 0.6, oy = node.ny * rs - node.ty * 0.6;
    const ol = Math.hypot(ox, oy) || 1;
    ox /= ol; oy /= ol;
    const c = Math.cos(swing), s = Math.sin(swing);
    [ox, oy] = [ox * c - oy * s, ox * s + oy * c];
    const knee = { x: root.x + ox * len * 0.55, y: root.y + oy * len * 0.55 };
    let fx = node.tx * 0.8 + ox * 0.6, fy = node.ty * 0.8 + oy * 0.6;
    const fl = Math.hypot(fx, fy) || 1;
    fx /= fl; fy /= fl;
    const ankle = { x: knee.x + fx * len * 0.5, y: knee.y + fy * len * 0.5 };

    // Flames trailing from the elbow.
    for (let k = 0; k < 3; k++) {
      const spread = (k - 1) * 0.45 + Math.sin(time * 3 + k) * 0.1;
      const bx = -node.tx + ox * 0.3, by = -node.ty + oy * 0.3;
      const tx = bx * Math.cos(spread) - by * Math.sin(spread), ty = bx * Math.sin(spread) + by * Math.cos(spread);
      const l = R * (1.1 - Math.abs(k - 1) * 0.25);
      tuft(ctx, knee.x, knee.y, knee.x + tx * l, knee.y + ty * l, R * 0.2, [C.red, C.orange, C.red][k], R * 0.04);
    }
    limb(ctx, [root, knee], R * 0.62, R * 0.42, R * 0.05, C.red, C.amber);
    limb(ctx, [knee, ankle], R * 0.42, R * 0.3, R * 0.05, C.orange, C.gold);
    ctx.fillStyle = C.orange;
    ctx.beginPath(); ctx.arc(knee.x, knee.y, R * 0.2, 0, TAU); ctx.fill();

    // Four toes fanning out, each with a hooked talon.
    for (let k = 0; k < 4; k++) {
      const a = -0.7 + k * 0.47;
      const dx = fx * Math.cos(a) - fy * Math.sin(a), dy = fx * Math.sin(a) + fy * Math.cos(a);
      const toe = { x: ankle.x + dx * R * 0.42, y: ankle.y + dy * R * 0.42 };
      let hx = dx * 0.5 + ox * 0.9, hy = dy * 0.5 + oy * 0.9;
      const hl = Math.hypot(hx, hy) || 1;
      hx /= hl; hy /= hl;
      limb(ctx, [ankle, toe], R * 0.2, R * 0.15, R * 0.04, C.gold);
      limb(ctx, [toe, { x: toe.x + dx * R * 0.12, y: toe.y + dy * R * 0.12 }, { x: toe.x + dx * R * 0.14 + hx * R * 0.22, y: toe.y + dy * R * 0.14 + hy * R * 0.22 }],
        R * 0.15, R * 0.01, R * 0.035, C.cream);
    }
  };

  const drawSpikes = () => {
    const n = nodes.length;
    const every = Math.max(2, Math.round((R * 0.8) / STEP));
    for (let i = Math.round(n * 0.04); i < n - 3; i += every) {
      const node = nodes[i];
      const t = i / (n - 1);
      const h = R * 0.95 * (1 - t * 0.55) * (0.85 + 0.15 * Math.sin(time * 3 + i));
      const side = -node.s;
      const bx = node.x + node.nx * side * node.r * 0.8, by = node.y + node.ny * side * node.r * 0.8;
      const tipx = bx + (node.nx * side - node.tx * 0.6) * h, tipy = by + (node.ny * side - node.ty * 0.6) * h;
      const w = Math.max(node.r * 0.4, 2);
      ctx.beginPath();
      ctx.moveTo(bx + node.tx * w, by + node.ty * w);
      ctx.quadraticCurveTo(bx + (tipx - bx) * 0.3 + node.tx * w * 0.9, by + (tipy - by) * 0.3 + node.ty * w * 0.9, tipx, tipy);
      ctx.quadraticCurveTo(bx + (tipx - bx) * 0.5 - node.tx * w * 0.6, by + (tipy - by) * 0.5 - node.ty * w * 0.6, bx - node.tx * w, by - node.ty * w);
      ctx.closePath();
      ctx.fillStyle = C.red; ctx.fill();
      ctx.lineWidth = R * 0.045; ctx.strokeStyle = C.line; ctx.stroke();
      ctx.beginPath();
      flame(ctx, bx, by, lerp(bx, tipx, 0.7), lerp(by, tipy, 0.7), w * 0.4, 0.2);
      ctx.fillStyle = C.gold; ctx.fill();
      // A little lantern bulb at each tip.
      ctx.fillStyle = C.white;
      ctx.beginPath(); ctx.arc(tipx, tipy, Math.max(1.2, R * 0.07 * (1 - t * 0.5)), 0, TAU); ctx.fill();
    }
  };

  const drawTail = () => {
    const end = nodes[nodes.length - 1];
    const bx = -end.tx, by = -end.ty;
    for (let k = 0; k < 7; k++) {
      const a = (k - 3) * 0.28 + Math.sin(time * 3.4 + k * 1.3) * 0.12;
      const dx = bx * Math.cos(a) - by * Math.sin(a), dy = bx * Math.sin(a) + by * Math.cos(a);
      const l = R * (2.3 - Math.abs(k - 3) * 0.3);
      tuft(ctx, end.x, end.y, end.x + dx * l, end.y + dy * l, R * 0.24, [C.red, C.orange, C.amber][k % 3], R * 0.045);
    }
  };

  const drawBody = (glow: number) => {
    ctx.save();
    ctx.shadowColor = `rgba(255, 110, 20, ${0.35 + 0.5 * glow})`;
    ctx.shadowBlur = R * (0.4 + 0.8 * glow) * dpr;
    ctx.fillStyle = C.line; tube(1.08, 0); ctx.fill();
    ctx.restore();
    const layers: [number, number, string][] = [
      [1, 0, C.red], [0.86, 0.06, C.orange], [0.62, 0.16, C.amber], [0.36, 0.24, C.gold],
    ];
    for (const [scale, shift, color] of layers) { ctx.fillStyle = color; tube(scale, shift); ctx.fill(); }

    // Scales: overlapping scallops that open towards the tail, clipped to the body.
    ctx.save();
    tube(1, 0);
    ctx.clip();
    const n = nodes.length;
    const every = Math.max(1, Math.round((R * 0.4) / STEP));
    const rows = [-0.95, -0.45, 0.05, 0.55];
    const arcs = new Path2D(), shine = new Path2D();
    for (let i = 2, col = 0; i < n; i += every, col++) {
      const node = nodes[i];
      const rs = node.r * 0.46;
      if (rs < 1.2) continue;
      const back = Math.atan2(-node.ty, -node.tx);
      const bc = node.s * 0.68, bw = Math.abs(node.s) * 0.27 + 0.1;
      for (const row of rows) {
        const v = row + (col % 2 ? 0.2 : 0);
        if (Math.abs(v - bc) < bw) continue;
        const x = node.x + node.nx * v * node.r, y = node.y + node.ny * v * node.r;
        arcs.moveTo(x + Math.cos(back - 1.5) * rs, y + Math.sin(back - 1.5) * rs);
        arcs.arc(x, y, rs, back - 1.5, back + 1.5);
        shine.moveTo(x + Math.cos(back - 1) * rs * 0.6, y + Math.sin(back - 1) * rs * 0.6);
        shine.arc(x, y, rs * 0.6, back - 1, back + 1);
      }
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(150, 18, 8, 0.9)'; ctx.lineWidth = Math.max(1, R * 0.075); ctx.stroke(arcs);
    ctx.strokeStyle = 'rgba(255, 238, 160, 0.85)'; ctx.lineWidth = Math.max(0.8, R * 0.05); ctx.stroke(shine);
    ctx.restore();

    // Belly: a pale band of ribbed plates on the belly side, hidden when seen from above.
    const left: Pt[] = [], right: Pt[] = [];
    for (const node of nodes) {
      const bc = node.s * node.r * 0.68, bw = Math.abs(node.s) * node.r * 0.27;
      left.push({ x: node.x + node.nx * (bc - bw), y: node.y + node.ny * (bc - bw) });
      right.push({ x: node.x + node.nx * (bc + bw), y: node.y + node.ny * (bc + bw) });
    }
    ctx.beginPath();
    left.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    ctx.fillStyle = C.cream; ctx.fill();
    ctx.lineWidth = Math.max(1, R * 0.05); ctx.strokeStyle = 'rgba(158, 20, 13, 0.75)'; ctx.stroke();
    const ribs = Math.max(2, Math.round((R * 0.5) / STEP));
    ctx.beginPath();
    for (let i = 3; i < nodes.length; i += ribs) {
      ctx.moveTo(left[i].x, left[i].y);
      ctx.lineTo(right[i].x, right[i].y);
    }
    ctx.strokeStyle = 'rgba(240, 120, 30, 0.9)'; ctx.lineWidth = Math.max(1, R * 0.07); ctx.stroke();
  };

  const drawHead = (glow: number) => {
    const h = nodes[0], b = nodes[Math.min(5, nodes.length - 1)];
    let dx = h.x - b.x, dy = h.y - b.y;
    const dl = Math.hypot(dx, dy) || 1;
    dx /= dl; dy /= dl;
    const fy = Math.abs(flip) < 0.06 ? 0.06 * Math.sign(flip || 1) : flip;
    const U = R * 1.3;
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.transform(dx, dy, -dy * fy, dx * fy, 0, 0);
    ctx.scale(U, U);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const edge = 0.06;

    // Mane: a back layer of rainbow fronds and a front layer of fiery ones.
    const rainbow = [C.teal, C.blue, C.violet, C.green];
    for (let k = 0; k < 9; k++) {
      const f = k / 8;
      const a = Math.PI + lerp(1.1, -0.8, f) + 0.1 * Math.sin(time * 3.1 + k * 1.7);
      const len = 2.4 + 0.45 * Math.sin(k * 2.3);
      const bx = 0.35 - f * 0.45, by = -0.6 + f * 1.0;
      tuft(ctx, bx, by, bx + Math.cos(a) * len, by + Math.sin(a) * len, 0.26, rainbow[k % 4], edge, 0.5);
    }
    for (let k = 0; k < 8; k++) {
      const f = (k + 0.5) / 8;
      const a = Math.PI + lerp(1.0, -0.7, f) + 0.12 * Math.sin(time * 3.6 + k * 2.1);
      const len = 1.7 + 0.3 * Math.sin(k * 1.7);
      const bx = 0.45 - f * 0.4, by = -0.55 + f * 0.95;
      tuft(ctx, bx, by, bx + Math.cos(a) * len, by + Math.sin(a) * len, 0.24, [C.red, C.orange, C.gold][k % 3], edge, 0.5);
    }

    // Antlers.
    const antler = (ox: number, oy: number, color: string) => {
      const main = curl(0.6 + ox, -0.75 + oy, -1.85, 10, 0.23, () => -0.12);
      limb(ctx, main, 0.3, 0.08, 0.05, color, C.cream);
      const tine = curl(main[4].x, main[4].y, -1.6, 4, 0.14, () => -0.08);
      limb(ctx, tine, 0.16, 0.05, 0.05, color);
    };
    antler(0.3, 0.05, C.amber);

    // Mouth: the inside, the lower jaw with its beard and teeth, and the tongue.
    const jaw = 0.3 + 0.07 * Math.sin(time * 1.4);
    const hingeX = 0.75, hingeY = 0.12;
    const rot = (x: number, y: number): Pt => {
      const c = Math.cos(jaw), s = Math.sin(jaw);
      return { x: hingeX + (x - hingeX) * c - (y - hingeY) * s, y: hingeY + (x - hingeX) * s + (y - hingeY) * c };
    };
    const lipTip = rot(2.4, 0.12), lipBack = rot(0.9, 0.15);
    ctx.beginPath();
    ctx.moveTo(0.7, 0.08); ctx.lineTo(2.75, 0.0); ctx.lineTo(lipTip.x, lipTip.y); ctx.lineTo(lipBack.x, lipBack.y);
    ctx.closePath();
    ctx.fillStyle = C.mouth; ctx.fill();

    ctx.save();
    ctx.translate(hingeX, hingeY); ctx.rotate(jaw); ctx.translate(-hingeX, -hingeY);
    for (let k = 0; k < 4; k++) {
      const bx = 1.2 + k * 0.35;
      const sway = Math.sin(time * 2.6 + k * 1.3) * 0.15;
      tuft(ctx, bx, 0.5, bx - 0.75 + sway, 1.35 - k * 0.08, 0.17, [C.gold, C.orange, C.red, C.gold][k], edge, 0.5);
    }
    const jg = ctx.createLinearGradient(0, 0.1, 0, 0.65);
    jg.addColorStop(0, C.amber); jg.addColorStop(1, C.orange);
    ctx.beginPath();
    ctx.moveTo(0.5, 0.1);
    ctx.lineTo(2.35, 0.12);
    ctx.quadraticCurveTo(2.7, 0.15, 2.6, 0.38);
    ctx.quadraticCurveTo(2.35, 0.62, 1.0, 0.62);
    ctx.quadraticCurveTo(0.55, 0.6, 0.5, 0.1);
    ctx.fillStyle = jg; ctx.fill();
    ctx.lineWidth = edge; ctx.strokeStyle = C.line; ctx.stroke();
    ctx.beginPath();
    for (let x = 1.05; x < 2.3; x += 0.25) { ctx.moveTo(x - 0.07, 0.13); ctx.lineTo(x, -0.02); ctx.lineTo(x + 0.07, 0.13); }
    ctx.moveTo(2.08, 0.13); ctx.lineTo(2.18, -0.22); ctx.lineTo(2.28, 0.13);
    ctx.fillStyle = C.white; ctx.fill();
    ctx.lineWidth = 0.035; ctx.stroke();
    const tongue = curl(1.0, 0.2, -0.04, 12, 0.21, (k) => (k > 7 ? -0.38 : 0.02) + Math.sin(time * 3 + k * 0.6) * 0.05);
    limb(ctx, tongue, 0.2, 0.06, 0.035, C.tongue);
    ctx.restore();

    // Upper head: skull and snout with an upturned nose.
    const sg = ctx.createLinearGradient(0, -1.1, 0, 0.7);
    sg.addColorStop(0, C.red); sg.addColorStop(0.45, C.orange); sg.addColorStop(1, C.gold);
    ctx.save();
    ctx.shadowColor = `rgba(255, 110, 20, ${0.3 + 0.5 * glow})`;
    ctx.shadowBlur = R * (0.3 + 0.7 * glow) * dpr;
    ctx.beginPath();
    ctx.moveTo(-0.35, 0.55);
    ctx.bezierCurveTo(-0.55, 0.0, -0.4, -0.75, 0.3, -0.85);
    ctx.bezierCurveTo(0.8, -1.15, 1.45, -1.05, 1.6, -0.72);
    ctx.bezierCurveTo(1.9, -0.55, 2.2, -0.6, 2.45, -0.7);
    ctx.bezierCurveTo(2.75, -0.98, 3.18, -0.78, 3.06, -0.38);
    ctx.bezierCurveTo(3.0, -0.15, 2.85, -0.02, 2.65, 0.0);
    ctx.lineTo(0.95, 0.08);
    ctx.bezierCurveTo(0.75, 0.2, 0.7, 0.5, 0.45, 0.62);
    ctx.bezierCurveTo(0.2, 0.7, -0.2, 0.7, -0.35, 0.55);
    ctx.closePath();
    ctx.fillStyle = sg; ctx.fill();
    ctx.restore();
    ctx.lineWidth = edge; ctx.strokeStyle = C.line; ctx.stroke();

    // Upper teeth and fangs.
    ctx.beginPath();
    for (let x = 1.1; x < 2.55; x += 0.24) { ctx.moveTo(x - 0.07, 0.03); ctx.lineTo(x, 0.18); ctx.lineTo(x + 0.07, 0.03); }
    for (const x of [1.25, 2.45]) { ctx.moveTo(x - 0.09, 0.02); ctx.lineTo(x, 0.4); ctx.lineTo(x + 0.09, 0.02); }
    ctx.fillStyle = C.white; ctx.fill();
    ctx.lineWidth = 0.035; ctx.stroke();

    // Nose ridge, nostril and the spiral on the cheek.
    ctx.lineWidth = 0.05;
    ctx.beginPath(); ctx.moveTo(1.7, -0.68); ctx.quadraticCurveTo(2.2, -0.55, 2.55, -0.78); ctx.stroke();
    ctx.beginPath(); ctx.arc(2.8, -0.48, 0.11, 0, TAU); ctx.fillStyle = C.red; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(2.83, -0.46, 0.04, 0, TAU); ctx.fillStyle = C.line; ctx.fill();
    for (let k = 0; k < 3; k++) {
      tuft(ctx, 0.25, 0.3, -0.45 - k * 0.1, 0.55 + k * 0.32, 0.14, [C.teal, C.blue, C.green][k], 0.04, 0.6);
    }
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 3.2; a += 0.2) {
      const r = 0.03 + a * 0.028;
      const x = 0.45 + Math.cos(a) * r, y = 0.18 + Math.sin(a) * r;
      if (a) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.lineWidth = 0.07; ctx.strokeStyle = C.teal; ctx.stroke();

    // Eye under a heavy jade brow.
    ctx.save();
    ctx.translate(1.25, -0.48); ctx.rotate(-0.15);
    ctx.beginPath(); ctx.ellipse(0, 0, 0.3, 0.21, 0, 0, TAU);
    ctx.fillStyle = C.white; ctx.fill();
    ctx.lineWidth = 0.05; ctx.strokeStyle = C.line; ctx.stroke();
    ctx.beginPath(); ctx.arc(0.06, 0, 0.16, 0, TAU); ctx.fillStyle = C.gold; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0.07, 0, 0.055, 0.13, 0, 0, TAU); ctx.fillStyle = '#140504'; ctx.fill();
    ctx.beginPath(); ctx.arc(0.0, -0.06, 0.04, 0, TAU); ctx.fillStyle = C.white; ctx.fill();
    ctx.restore();
    for (let k = 0; k < 3; k++) {
      tuft(ctx, 0.95 - k * 0.12, -0.78, 0.35 - k * 0.25, -1.15 - k * 0.12 + Math.sin(time * 2.5 + k) * 0.05, 0.12, [C.green, C.teal, C.green][k], 0.04, 0.5);
    }
    ctx.beginPath();
    ctx.moveTo(0.82, -0.62);
    ctx.quadraticCurveTo(1.2, -1.08, 1.8, -0.84);
    ctx.quadraticCurveTo(1.35, -0.8, 0.82, -0.62);
    ctx.fillStyle = C.teal; ctx.fill();
    ctx.lineWidth = 0.045; ctx.strokeStyle = C.line; ctx.stroke();

    antler(0, 0, C.gold);

    // Whiskers: one curling up over the head, one curling down under the jaw.
    const upper = curl(2.75, -0.42, -0.45, 18, 0.25, (k) => -0.19 + 0.12 * Math.sin(time * 2.2 - k * 0.45));
    const lower = curl(2.7, -0.12, 0.5, 16, 0.25, (k) => 0.15 + 0.12 * Math.sin(time * 2.2 - k * 0.45 + 1.7));
    limb(ctx, upper, 0.12, 0.02, 0.035, C.gold);
    limb(ctx, lower, 0.12, 0.02, 0.035, C.gold);
    ctx.restore();
  };

  const render = (dt: number) => {
    if (needsResize) resize();
    if (!width || !height) return;
    layout(dt);
    const glow = dark.matches ? 1 : 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawPearl(glow);
    const walk = travel / (R * 2.4);
    const front = at(0.15), frontFar = at(0.17), rear = at(0.5), rearFar = at(0.52);
    const far = -Math.sign(front.s || 1);
    drawLeg(frontFar, far, R * 1.8, Math.sin(walk + Math.PI) * 0.45);
    drawLeg(rearFar, -Math.sign(rear.s || 1), R * 1.7, Math.sin(walk) * 0.45);
    drawTail();
    drawSpikes();
    drawLeg(front, -far, R * 1.8, Math.sin(walk) * 0.45);
    drawLeg(rear, Math.sign(rear.s || 1), R * 1.7, Math.sin(walk + Math.PI) * 0.45);
    drawBody(glow);
    drawHead(glow);
  };

  const tick = (now: number) => {
    request = requestAnimationFrame(tick);
    const dt = last === undefined ? 0 : Math.min(0.05, (now - last) / 1000);
    last = now;
    let dy = Math.abs(scrollY - lastScroll);
    lastScroll = scrollY;
    if (dy > height * 0.8) dy = 0; // a jump (page change, back to top) is not a swim
    pending += Math.min(dy, MAX_SCROLL_STEP) * SCROLL_GAIN;
    const take = pending * (1 - Math.exp(-dt * 9));
    pending -= take;
    travel += take + IDLE_SPEED * R * dt;
    time += dt;
    if (take < 0.3 && now - lastPaint < IDLE_FRAME) return;
    lastPaint = now;
    render(dt);
  };

  const still = () => {
    if (request !== undefined) cancelAnimationFrame(request);
    request = undefined;
    needsResize = true;
    render(0);
  };

  const start = () => {
    if (reducedMotion.matches) return still();
    last = undefined;
    lastScroll = scrollY;
    if (request === undefined) request = requestAnimationFrame(tick);
  };

  addEventListener('resize', () => {
    needsResize = true;
    if (reducedMotion.matches) still();
  }, { passive: true, signal });
  reducedMotion.addEventListener('change', start, { signal });
  dark.addEventListener('change', () => { if (reducedMotion.matches) still(); }, { signal });
  active = {
    canvas,
    stop: () => {
      listeners.abort();
      if (request !== undefined) cancelAnimationFrame(request);
      request = undefined;
    },
  };
  start();
}
