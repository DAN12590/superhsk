/**
 * The mouse leaves a brush stroke of ink that fades away. Faster movement makes a thinner line,
 * like a real brush. Only for a fine pointer (mouse or trackpad) and without reduced motion.
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

  const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--ink-trail').trim() || 'rgba(31,27,22,0.5)';
  let color = ink();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { color = ink(); });

  type P = { x: number; y: number; w: number };
  let last: P | null = null;
  let mid: { x: number; y: number } | null = null;
  let idle = 0;

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const x = e.clientX, y = e.clientY;
    if (!last) { last = { x, y, w: 6 }; mid = { x, y }; return; }
    const dist = Math.hypot(x - last.x, y - last.y);
    if (dist < 2) return;
    // Width follows speed: slow is heavy, fast is a hairline.
    const target = Math.max(1.5, 11 - dist * 0.22);
    const w = last.w + (target - last.w) * 0.35;
    const m = { x: (x + last.x) / 2, y: (y + last.y) / 2 };
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(mid!.x, mid!.y);
    ctx.quadraticCurveTo(last.x, last.y, m.x, m.y);
    ctx.stroke();
    last = { x, y, w };
    mid = m;
    idle = 0;
  }, { passive: true });
  addEventListener('pointerleave', () => { last = null; });
  document.addEventListener('pointerdown', () => { last = null; });

  // Fade what is drawn a little every frame; stop working once the canvas is clear.
  const fade = () => {
    if (idle < 90) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.045)';
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.restore();
      idle++;
      if (idle === 90) ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
    requestAnimationFrame(fade);
  };
  requestAnimationFrame(fade);
}
