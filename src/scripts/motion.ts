import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth scroll for the whole site, driven by GSAP's ticker so ScrollTrigger stays in sync.
let lenis: Lenis | null = null;
function smoothScroll() {
  if (lenis || reduced()) return;
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

let ctx: gsap.Context | null = null;

/** Headings rise out of a mask, line by line. */
function headings() {
  const hero = document.querySelector<HTMLElement>('.hero h1, .intro h1');
  if (hero) {
    const split = SplitText.create(hero, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
    gsap.from('.hero .lead, .hero .status, .intro .lead', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power3.out', delay: 0.45, stagger: 0.08 });
  }
  document.querySelectorAll<HTMLElement>('.head h2, .build-copy h2, .lv-head h2').forEach((h) => {
    const split = SplitText.create(h, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: h, start: 'top 85%' },
    });
  });
}

/** 木 → 林 → 森 written by the scroll. */
function build() {
  const section = document.querySelector<HTMLElement>('.build');
  if (!section) return;
  const inks = [...section.querySelectorAll<SVGPathElement>('.ink')];
  inks.forEach((p) => {
    const len = p.getTotalLength() + 1;
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section, pin: '.build-pin', start: 'top top', end: () => `+=${innerHeight * 2.6}`,
      scrub: 0.8, anticipatePin: 1,
    },
  });
  section.querySelectorAll<HTMLElement>('.build-char').forEach((fig) => {
    fig.querySelectorAll<SVGPathElement>('.ink').forEach((p) => tl.to(p, { strokeDashoffset: 0, duration: 1 }));
    tl.from(fig.querySelector('figcaption'), { autoAlpha: 0, y: 10, duration: 1.2 }, '<');
    const plus = fig.querySelector('.plus');
    if (plus) tl.from(plus, { autoAlpha: 0, x: -12, duration: 1 });
  });
  tl.to('.build-hint', { autoAlpha: 0, duration: 1 }, 0);
}

/** Lists come in one row after another as they enter. */
function lists() {
  const targets = '.drills li, .steps li, .words li, .faq details, .keys .key';
  gsap.set(targets, { autoAlpha: 0, y: 28 });
  ScrollTrigger.batch(targets, {
    start: 'top 92%',
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, overwrite: true }),
    once: true,
  });
}

document.addEventListener('astro:page-load', () => {
  ctx?.revert();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (reduced()) return;
  smoothScroll();
  lenis?.scrollTo(0, { immediate: true });
  ctx = gsap.context(() => { headings(); build(); lists(); });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
});
