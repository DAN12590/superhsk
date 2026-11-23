/**
 * Scroll-driven Chinese dragon rendered on a background halftone grid.
 * Advances along an S-curve as the user scrolls down, retreats when scrolling up,
 * and idles with a gentle sinusoidal undulation at a throttled frame rate.
 */

interface Point {
  x: number;
  y: number;
}

interface SpineSegment {
  x: number;
  y: number;
  radius: number;
  angle: number;
}

interface RouteSample {
  x: number;
  y: number;
  length: number;
}

interface Palette {
  primary: string;
  secondary: string;
  highlight: string;
}

/** Halftone grid constants aligned with halftone.ts */
const GRID_SPACING = 14;
const BASE_DOT_RADIUS = 3;
const MAX_DRAGON_DOT_RADIUS = 5.4;

/** Spine and movement constants */
const DESKTOP_SEGMENTS = 40;
const MOBILE_SEGMENTS = 20;
const MOBILE_BREAKPOINT = 768;
const SEGMENT_SPACING_RATIO = 0.014;
const MIN_SEGMENT_SPACING = 10;
const MAX_SEGMENT_SPACING = 18;
const HEAD_RADIUS_RATIO = 0.015;
const MIN_HEAD_RADIUS = 11;
const MAX_HEAD_RADIUS = 17;

/** Scroll smoothing and idle wave constants */
const SCROLL_LERP = 0.09;
const PROGRESS_EPSILON = 0.0004;
const IDLE_TIMEOUT_MS = 1000;
const IDLE_FPS = 12;
const IDLE_FRAME_INTERVAL_MS = 1000 / IDLE_FPS;
const WAVE_FREQUENCY = 0.42;
const WAVE_SPEED = 0.0032;
const IDLE_WAVE_AMPLITUDE = 4.2;
const MOVING_WAVE_AMPLITUDE = 2.0;
const STATIC_REDUCED_MOTION_PROGRESS = 0.44;
const MAX_DPR = 2;

/** Chinese dragon anatomical details */
const CREST_INTERVAL = 3;
const WHISKER_NODES = 6;
const WHISKER_SEGMENT_LENGTH = 8;

/** Normalized viewport control points defining the S-curve path */
const ROUTE_CONTROL_POINTS: ReadonlyArray<Point> = [
  { x: 0.16, y: -0.08 },
  { x: 0.82, y: 0.15 },
  { x: 0.2, y: 0.38 },
  { x: 0.8, y: 0.62 },
  { x: 0.22, y: 0.85 },
  { x: 0.76, y: 1.08 },
];

const ROUTE_LUT_STEPS = 240;

let started = false;

/**
 * Clamps a numeric value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between start and end by factor t.
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Evaluates a point along a Catmull-Rom spline segment for parameter t in [0, 1].
 */
function catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/**
 * Builds an arc-length parameterized lookup table for the viewport S-curve.
 */
function buildRouteLut(width: number, height: number): RouteSample[] {
  const scaled = ROUTE_CONTROL_POINTS.map((pt) => ({
    x: pt.x * width,
    y: pt.y * height,
  }));

  const samples: RouteSample[] = [];
  const segmentCount = scaled.length - 1;
  let cumulativeLength = 0;
  let prevPoint: Point | null = null;

  for (let step = 0; step <= ROUTE_LUT_STEPS; step++) {
    const u = (step / ROUTE_LUT_STEPS) * segmentCount;
    const idx = Math.min(Math.floor(u), segmentCount - 1);
    const localT = u - idx;

    const p0 = scaled[Math.max(0, idx - 1)];
    const p1 = scaled[idx];
    const p2 = scaled[Math.min(segmentCount, idx + 1)];
    const p3 = scaled[Math.min(segmentCount, idx + 2)];

    const point = catmullRom(p0, p1, p2, p3, localT);
    if (prevPoint) {
      cumulativeLength += Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
    }

    samples.push({
      x: point.x,
      y: point.y,
      length: cumulativeLength,
    });
    prevPoint = point;
  }

  return samples;
}

/**
 * Samples a point along the S-curve at normalized arc-length progress [0, 1].
 */
function sampleRouteAtProgress(lut: RouteSample[], progress: number): Point {
  if (lut.length === 0) return { x: 0, y: 0 };
  const clamped = clamp(progress, 0, 1);
  const totalLength = lut[lut.length - 1].length;
  const targetLength = clamped * totalLength;

  let low = 0;
  let high = lut.length - 1;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (lut[mid].length < targetLength) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  const index = Math.max(1, low);
  const a = lut[index - 1];
  const b = lut[index];
  const span = b.length - a.length || 1;
  const factor = clamp((targetLength - a.length) / span, 0, 1);

  return {
    x: lerp(a.x, b.x, factor),
    y: lerp(a.y, b.y, factor),
  };
}

/**
 * Computes normalized document scroll progress in [0, 1].
 */
function getScrollProgress(): number {
  const doc = document.documentElement;
  const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  return clamp(scrollTop / maxScroll, 0, 1);
}

/**
 * Reads the site's seal red (--seal in app.css) plus a gold accent for the current color scheme.
 */
function resolvePalette(): Palette {
  const seal = getComputedStyle(document.documentElement).getPropertyValue('--seal').trim();
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    primary: seal || (isDark ? '#e0574b' : '#a8302b'),
    secondary: isDark ? '#b83228' : '#8f1f18',
    highlight: isDark ? '#f0b84b' : '#c98a1e',
  };
}

/**
 * Computes minimum squared distance from point (px, py) to segment (ax, ay)-(bx, by).
 */
function distToSegmentSquared(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ex = px - ax;
    const ey = py - ay;
    return ex * ex + ey * ey;
  }
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  const distX = px - projX;
  const distY = py - projY;
  return distX * distX + distY * distY;
}

/**
 * Initializes the background scroll-driven Chinese dragon canvas.
 * Safe to call repeatedly across Astro View Transitions.
 */
export function startDragon(): void {
  if (started) return;
  started = true;

  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let routeLut: RouteSample[] = [];
  let segments: SpineSegment[] = [];
  let upperWhisker: Point[] = [];
  let lowerWhisker: Point[] = [];
  let palette: Palette = resolvePalette();

  let segmentCount = DESKTOP_SEGMENTS;
  let segmentSpacing = 14;
  let baseBodyRadius = 14;

  let currentProgress = getScrollProgress();
  let targetProgress = currentProgress;
  let lastScrollTime = performance.now();
  let lastRenderTime = 0;
  let rafId: number | null = null;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  /**
   * Computes tapered body radius for segment index i in [0, count - 1].
   */
  function getSegmentRadius(index: number, count: number): number {
    const t = index / Math.max(1, count - 1);
    if (t < 0.08) {
      // Slightly narrower neck right behind the head
      return baseBodyRadius * lerp(0.78, 1.0, t / 0.08);
    }
    if (t < 0.35) {
      // Full muscular torso
      return baseBodyRadius;
    }
    // Smooth taper down to the tail tip
    const tailT = (t - 0.35) / 0.65;
    return Math.max(2.5, baseBodyRadius * Math.pow(1 - tailT, 1.35));
  }

  /**
   * Rebuilds the spine and whiskers along the route for a given normalized progress.
   */
  function resetSpineAtProgress(progress: number): void {
    const totalLength = routeLut[routeLut.length - 1]?.length || 1;
    const spacingProgress = segmentSpacing / totalLength;

    segments = [];
    for (let i = 0; i < segmentCount; i++) {
      const segProgress = progress - i * spacingProgress;
      const pos = sampleRouteAtProgress(routeLut, segProgress);
      segments.push({
        x: pos.x,
        y: pos.y,
        radius: getSegmentRadius(i, segmentCount),
        angle: 0,
      });
    }

    for (let i = 0; i < segments.length; i++) {
      const prev = segments[Math.max(0, i - 1)];
      const next = segments[Math.min(segments.length - 1, i + 1)];
      segments[i].angle = Math.atan2(prev.y - next.y, prev.x - next.x);
    }

    const head = segments[0];
    if (head) {
      upperWhisker = Array.from({ length: WHISKER_NODES }, (_, idx) => ({
        x: head.x - Math.cos(head.angle) * (idx + 1) * WHISKER_SEGMENT_LENGTH,
        y: head.y - Math.sin(head.angle) * (idx + 1) * WHISKER_SEGMENT_LENGTH - idx * 2,
      }));
      lowerWhisker = Array.from({ length: WHISKER_NODES }, (_, idx) => ({
        x: head.x - Math.cos(head.angle) * (idx + 1) * WHISKER_SEGMENT_LENGTH,
        y: head.y - Math.sin(head.angle) * (idx + 1) * WHISKER_SEGMENT_LENGTH + idx * 2,
      }));
    }
  }

  /**
   * Resizes canvas backing store and recalculates viewport-dependent geometry.
   */
  function resize(): void {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isCompact = coarsePointerQuery.matches || width < MOBILE_BREAKPOINT;
    segmentCount = isCompact ? MOBILE_SEGMENTS : DESKTOP_SEGMENTS;
    segmentSpacing = clamp(width * SEGMENT_SPACING_RATIO, MIN_SEGMENT_SPACING, MAX_SEGMENT_SPACING);
    baseBodyRadius = clamp(width * HEAD_RADIUS_RATIO, MIN_HEAD_RADIUS, MAX_HEAD_RADIUS);

    routeLut = buildRouteLut(width, height);
    palette = resolvePalette();

    const poseProgress = reducedMotionQuery.matches
      ? STATIC_REDUCED_MOTION_PROGRESS
      : currentProgress;
    resetSpineAtProgress(poseProgress);
    render(performance.now(), false);
  }

  /**
   * Updates follow-the-leader chain, sinusoidal idle wave, and trailing whiskers.
   */
  function updateSimulation(now: number, isMoving: boolean): void {
    if (segments.length === 0) return;

    const prevProgress = currentProgress;
    currentProgress = lerp(currentProgress, targetProgress, SCROLL_LERP);
    if (Math.abs(targetProgress - currentProgress) < PROGRESS_EPSILON) {
      currentProgress = targetProgress;
    }

    const deltaProgress = currentProgress - prevProgress;
    const headTarget = sampleRouteAtProgress(routeLut, currentProgress);
    const totalLength = routeLut[routeLut.length - 1]?.length || 1;
    const spacingProgress = segmentSpacing / totalLength;

    segments[0].x = headTarget.x;
    segments[0].y = headTarget.y;

    // Follow-the-leader distance constraint along the body
    for (let i = 1; i < segments.length; i++) {
      const leader = segments[i - 1];
      const follower = segments[i];

      // When scrolling upward, softly guide followers upstream so the spine never bunches
      if (deltaProgress < -0.00005) {
        const upstream = sampleRouteAtProgress(routeLut, currentProgress - i * spacingProgress);
        follower.x = lerp(follower.x, upstream.x, 0.28);
        follower.y = lerp(follower.y, upstream.y, 0.28);
      }

      const dx = follower.x - leader.x;
      const dy = follower.y - leader.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      follower.x = leader.x + (dx / dist) * segmentSpacing;
      follower.y = leader.y + (dy / dist) * segmentSpacing;
    }

    // Recompute tangent angles after constraint pass
    for (let i = 0; i < segments.length; i++) {
      const prev = segments[Math.max(0, i - 1)];
      const next = segments[Math.min(segments.length - 1, i + 1)];
      segments[i].angle = Math.atan2(prev.y - next.y, prev.x - next.x);
    }

    // Update trailing whiskers with delayed follow-the-leader physics
    const head = segments[0];
    const facingSign = Math.cos(head.angle) >= 0 ? 1 : -1;
    const snoutX = head.x + Math.cos(head.angle) * (baseBodyRadius * 1.15);
    const snoutY = head.y + Math.sin(head.angle) * (baseBodyRadius * 1.15);
    const perpX = -Math.sin(head.angle) * facingSign;
    const perpY = Math.cos(head.angle) * facingSign;

    updateWhisker(
      upperWhisker,
      snoutX + perpX * 3.5,
      snoutY + perpY * 3.5,
      head.angle + Math.PI - 0.35 * facingSign,
      now,
      0,
    );
    updateWhisker(
      lowerWhisker,
      snoutX - perpX * 3.5,
      snoutY - perpY * 3.5,
      head.angle + Math.PI + 0.35 * facingSign,
      now,
      1.6,
    );

    // Apply subtle perpendicular sine wave (stronger when idling so the dragon breathes)
    const waveAmp = isMoving ? MOVING_WAVE_AMPLITUDE : IDLE_WAVE_AMPLITUDE;
    const phase = now * WAVE_SPEED;

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const envelope = clamp(i / 8, 0, 1);
      const offset = Math.sin(phase - i * WAVE_FREQUENCY) * waveAmp * envelope;
      const nx = -Math.sin(seg.angle);
      const ny = Math.cos(seg.angle);
      seg.x += nx * offset * 0.14;
      seg.y += ny * offset * 0.14;
    }
  }

  /**
   * Advances a multi-node whisker chain trailing behind the dragon's snout.
   */
  function updateWhisker(
    nodes: Point[],
    anchorX: number,
    anchorY: number,
    trailAngle: number,
    now: number,
    phaseOffset: number,
  ): void {
    if (nodes.length === 0) return;
    nodes[0].x = anchorX;
    nodes[0].y = anchorY;

    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const sway = Math.sin(now * 0.004 + i * 0.65 + phaseOffset) * 1.3;
      const biasX = Math.cos(trailAngle) * 1.8 - Math.sin(trailAngle) * sway;
      const biasY = Math.sin(trailAngle) * 1.8 + Math.cos(trailAngle) * sway;

      const targetX = curr.x + biasX;
      const targetY = curr.y + biasY;
      const dx = targetX - prev.x;
      const dy = targetY - prev.y;
      const dist = Math.hypot(dx, dy) || 0.001;

      curr.x = prev.x + (dx / dist) * WHISKER_SEGMENT_LENGTH;
      curr.y = prev.y + (dy / dist) * WHISKER_SEGMENT_LENGTH;
    }
  }

  /**
   * Renders the dragon body on the halftone grid plus stylized Chinese dragon features.
   */
  function render(now: number, animated: boolean): void {
    if (!ctx || segments.length === 0) return;
    ctx.clearRect(0, 0, width, height);

    // 1. Compute bounding box around the spine to query only relevant halftone grid dots
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const pad = baseBodyRadius + GRID_SPACING * 2;

    for (const seg of segments) {
      if (seg.x - pad < minX) minX = seg.x - pad;
      if (seg.y - pad < minY) minY = seg.y - pad;
      if (seg.x + pad > maxX) maxX = seg.x + pad;
      if (seg.y + pad > maxY) maxY = seg.y + pad;
    }

    const startCol = Math.max(0, Math.floor(minX / GRID_SPACING));
    const endCol = Math.min(Math.ceil(width / GRID_SPACING), Math.ceil(maxX / GRID_SPACING));
    const startRow = Math.max(0, Math.floor(minY / GRID_SPACING));
    const endRow = Math.min(Math.ceil(height / GRID_SPACING), Math.ceil(maxY / GRID_SPACING));

    // 2. Paint enlarged accent dots on the halftone grid inside the dragon's silhouette
    ctx.fillStyle = palette.primary;
    ctx.beginPath();

    for (let row = startRow; row <= endRow; row++) {
      const gy = row * GRID_SPACING;
      for (let col = startCol; col <= endCol; col++) {
        const gx = col * GRID_SPACING;

        let minRatio = Infinity;
        for (let i = 0; i < segments.length - 1; i++) {
          const a = segments[i];
          const b = segments[i + 1];
          const avgRadius = (a.radius + b.radius) * 0.5;
          const distSq = distToSegmentSquared(gx, gy, a.x, a.y, b.x, b.y);
          const ratioSq = distSq / (avgRadius * avgRadius);
          if (ratioSq < minRatio) {
            minRatio = ratioSq;
          }
        }

        if (minRatio <= 1.25) {
          const closeness = 1 - clamp(Math.sqrt(minRatio) / 1.12, 0, 1);
          const dotRadius = lerp(BASE_DOT_RADIUS + 0.6, MAX_DRAGON_DOT_RADIUS, closeness);
          ctx.moveTo(gx + dotRadius, gy);
          ctx.arc(gx, gy, dotRadius, 0, Math.PI * 2);
        }
      }
    }
    ctx.fill();

    // 3. Dorsal spines / crests every few segments (distinguishes dragon from serpent)
    ctx.fillStyle = palette.highlight;
    const crestLimit = Math.floor(segments.length * 0.86);
    for (let i = 2; i < crestLimit; i += CREST_INTERVAL) {
      const seg = segments[i];
      const facing = Math.cos(seg.angle) >= 0 ? 1 : -1;
      const dorsalAngle = seg.angle - (Math.PI / 2) * facing;
      const size = seg.radius * 0.85;

      const baseX = seg.x + Math.cos(dorsalAngle) * (seg.radius * 0.65);
      const baseY = seg.y + Math.sin(dorsalAngle) * (seg.radius * 0.65);
      const tipX =
        seg.x +
        Math.cos(dorsalAngle) * (seg.radius + size) -
        Math.cos(seg.angle) * (size * 0.55);
      const tipY =
        seg.y +
        Math.sin(dorsalAngle) * (seg.radius + size) -
        Math.sin(seg.angle) * (size * 0.55);
      const backX = baseX - Math.cos(seg.angle) * (size * 0.8);
      const backY = baseY - Math.sin(seg.angle) * (size * 0.8);

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(backX, backY);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Two pairs of clawed legs (forelimbs & hindlimbs)
    const legIndices = [
      Math.max(3, Math.round(segments.length * 0.24)),
      Math.max(6, Math.round(segments.length * 0.62)),
    ];
    for (let pairIdx = 0; pairIdx < legIndices.length; pairIdx++) {
      const segIdx = legIndices[pairIdx];
      const seg = segments[segIdx];
      if (!seg) continue;
      const swing = animated ? Math.sin(now * 0.004 + pairIdx * Math.PI) * 0.25 : 0.1;
      drawLeg(ctx, seg, 1, swing);
      drawLeg(ctx, seg, -1, -swing);
    }

    // 5. Trailing whiskers
    drawWhisker(ctx, upperWhisker);
    drawWhisker(ctx, lowerWhisker);

    // 6. Stylized dragon head with snout and swept-back horn
    drawHead(ctx, segments[0]);
  }

  /**
   * Draws a single stylized limb with three claws on one side of a body segment.
   */
  function drawLeg(
    context: CanvasRenderingContext2D,
    seg: SpineSegment,
    side: 1 | -1,
    swing: number,
  ): void {
    const limbLen = seg.radius * 1.15;
    const hipAngle = seg.angle + side * (Math.PI * 0.62) + swing;
    const kneeX = seg.x + Math.cos(hipAngle) * limbLen;
    const kneeY = seg.y + Math.sin(hipAngle) * limbLen;

    const ankleAngle = hipAngle + side * 0.45;
    const footX = kneeX + Math.cos(ankleAngle) * (limbLen * 0.75);
    const footY = kneeY + Math.sin(ankleAngle) * (limbLen * 0.75);

    context.strokeStyle = palette.secondary;
    context.lineWidth = Math.max(2, seg.radius * 0.24);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();
    context.moveTo(seg.x, seg.y);
    context.lineTo(kneeX, kneeY);
    context.lineTo(footX, footY);
    context.stroke();

    // Three small claws
    context.lineWidth = Math.max(1.4, seg.radius * 0.14);
    for (let c = -1; c <= 1; c++) {
      const clawAngle = ankleAngle + c * 0.42;
      context.beginPath();
      context.moveTo(footX, footY);
      context.lineTo(footX + Math.cos(clawAngle) * 4.5, footY + Math.sin(clawAngle) * 4.5);
      context.stroke();
    }
  }

  /**
   * Draws a tapered trailing whisker curve.
   */
  function drawWhisker(context: CanvasRenderingContext2D, nodes: Point[]): void {
    if (nodes.length < 2) return;
    context.strokeStyle = palette.highlight;
    context.lineWidth = 1.6;
    context.lineCap = 'round';

    context.beginPath();
    context.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      context.lineTo(nodes[i].x, nodes[i].y);
    }
    context.stroke();
  }

  /**
   * Draws a compact silhouette profile of a Chinese dragon head with snout and horn.
   */
  function drawHead(context: CanvasRenderingContext2D, head: SpineSegment): void {
    const r = baseBodyRadius;
    const flipY = Math.cos(head.angle) < 0 ? -1 : 1;

    context.save();
    context.translate(head.x, head.y);
    context.rotate(head.angle);
    context.scale(1, flipY);

    // Swept-back horn
    context.fillStyle = palette.highlight;
    context.beginPath();
    context.moveTo(-r * 0.1, -r * 0.55);
    context.quadraticCurveTo(-r * 0.9, -r * 1.45, -r * 1.75, -r * 1.15);
    context.quadraticCurveTo(-r * 0.95, -r * 0.85, -r * 0.45, -r * 0.35);
    context.closePath();
    context.fill();

    // Cranium + elongated snout + lower jaw
    context.fillStyle = palette.primary;
    context.beginPath();
    context.moveTo(-r * 0.7, -r * 0.55);
    context.lineTo(r * 0.25, -r * 0.65);
    context.lineTo(r * 1.35, -r * 0.38);
    context.quadraticCurveTo(r * 1.55, -r * 0.1, r * 1.32, r * 0.12);
    context.lineTo(r * 0.45, r * 0.15);
    context.lineTo(r * 1.05, r * 0.42);
    context.quadraticCurveTo(r * 0.3, r * 0.68, -r * 0.65, r * 0.48);
    context.closePath();
    context.fill();

    // Eye dot
    context.fillStyle = palette.highlight;
    context.beginPath();
    context.arc(r * 0.22, -r * 0.22, Math.max(2, r * 0.16), 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

  /**
   * Main animation loop with automatic throttling to ~12fps after 1s of scroll inactivity.
   */
  function tick(now: number): void {
    if (document.hidden || reducedMotionQuery.matches) {
      rafId = null;
      return;
    }

    const isActivelyScrolling =
      now - lastScrollTime < IDLE_TIMEOUT_MS ||
      Math.abs(targetProgress - currentProgress) > PROGRESS_EPSILON;

    if (!isActivelyScrolling && now - lastRenderTime < IDLE_FRAME_INTERVAL_MS) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    lastRenderTime = now;
    updateSimulation(now, isActivelyScrolling);
    render(now, true);
    rafId = requestAnimationFrame(tick);
  }

  /**
   * Starts the animation loop if permitted by visibility and motion preferences.
   */
  function startLoop(): void {
    if (rafId !== null || document.hidden || reducedMotionQuery.matches) return;
    lastRenderTime = 0;
    rafId = requestAnimationFrame(tick);
  }

  /**
   * Stops the animation loop cleanly.
   */
  function stopLoop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /**
   * Updates target scroll progress and wakes the loop to full frame rate.
   */
  function onScroll(): void {
    targetProgress = getScrollProgress();
    lastScrollTime = performance.now();
    if (!reducedMotionQuery.matches && rafId === null && !document.hidden) {
      startLoop();
    }
  }

  /**
   * Binds the canvas element on initial load and after Astro View Transitions.
   */
  function mount(): void {
    const nextCanvas = document.querySelector<HTMLCanvasElement>('canvas.dragon');
    if (!nextCanvas) return;

    canvas = nextCanvas;
    targetProgress = getScrollProgress();
    currentProgress = targetProgress;
    resize();

    if (reducedMotionQuery.matches) {
      stopLoop();
      resetSpineAtProgress(STATIC_REDUCED_MOTION_PROGRESS);
      render(performance.now(), false);
    } else {
      startLoop();
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
    } else if (!reducedMotionQuery.matches) {
      lastScrollTime = performance.now();
      startLoop();
    }
  });

  reducedMotionQuery.addEventListener('change', () => {
    if (reducedMotionQuery.matches) {
      stopLoop();
      resetSpineAtProgress(STATIC_REDUCED_MOTION_PROGRESS);
      render(performance.now(), false);
    } else {
      lastScrollTime = performance.now();
      startLoop();
    }
  });

  // The site follows the system theme, so refresh the colors when it changes
  colorSchemeQuery.addEventListener('change', () => {
    palette = resolvePalette();
    render(performance.now(), false);
  });

  document.addEventListener('astro:page-load', mount);
  mount();
}
