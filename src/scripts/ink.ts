/**
 * The mouse paints with a wet brush: a thick stroke that swells when you slow down, thins when you
 * go fast, bleeds a little at the edges, drops a few splashes on quick flicks and slowly dries away.
 * Only for a mouse and without reduced motion.
 */
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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--ink-trail').trim() || 'rgba(31,27,22,0.6)';
  let color = ink();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { color = ink(); });

  let last: { x: number; y: number; w: number } | null = null;
  let mid = { x: 0, y: 0 };
  let idle = 0;
  let load = 1; // ink left in the brush: it runs dry over a long stroke and refills when you stop

  const blob = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const x = e.clientX, y = e.clientY;
    if (!last) { last = { x, y, w: 14 }; mid = { x, y }; return; }
    const dist = Math.hypot(x - last.x, y - last.y);
    if (dist < 1.5) return;
    const target = Math.max(3, (30 - dist * 0.5) * (0.45 + load * 0.55));
    const w = last.w + (target - last.w) * 0.25;
    const m = { x: (x + last.x) / 2, y: (y + last.y) / 2 };
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = w * 0.6; // the wet edge bleeding into the paper
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(mid.x, mid.y);
    ctx.quadraticCurveTo(last.x, last.y, m.x, m.y);
    ctx.stroke();
    // Dry brush: a few thin bristle lines that split from the stroke when the brush runs low.
    if (load < 0.6) {
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      const nx = -(y - last.y) / dist, ny = (x - last.x) / dist;
      for (let i = -1; i <= 1; i += 2) {
        const o = w * 0.55 * i;
        ctx.beginPath();
        ctx.moveTo(mid.x + nx * o, mid.y + ny * o);
        ctx.lineTo(m.x + nx * o, m.y + ny * o);
        ctx.stroke();
      }
    }
    // Splashes when you flick fast.
    if (dist > 38 && Math.random() < 0.5) {
      ctx.shadowBlur = 2;
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const a = Math.atan2(y - last.y, x - last.x) + (Math.random() - 0.5) * 1.4;
        const r = 8 + Math.random() * 30;
        blob(x + Math.cos(a) * r, y + Math.sin(a) * r, 1 + Math.random() * 3);
      }
    }
    load = Math.max(0.15, load - dist / 2600);
    last = { x, y, w };
    mid = m;
    idle = 0;
  }, { passive: true });

  const lift = () => { last = null; };
  document.documentElement.addEventListener('pointerleave', lift);
  document.addEventListener('pointerdown', lift);

  // The ink dries slowly; the brush refills while it rests.
  const tick = () => {
    if (idle < 160) {
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.028)';
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.restore();
      idle++;
      if (idle === 160) ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
    if (idle > 6) load = Math.min(1, load + 0.03);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
