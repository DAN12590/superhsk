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
    gsap.from('.hero .lead, .hero .playbadge, .hero .status, .intro .lead', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power3.out', delay: 0.45, stagger: 0.08 });
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

/** The app tour: the phone stays while the steps and screens change with the scroll. */
function tour() {
  const section = document.querySelector<HTMLElement>('.tour');
  if (!section) return;
  const steps = [...section.querySelectorAll<HTMLElement>('.tour-steps li')];
  const shots = [...section.querySelectorAll<HTMLElement>('.tour-phone .shot')];
  const dots = [...section.querySelectorAll<HTMLElement>('.tour-dots span')];
  let current = 0;
  const show = (i: number) => {
    if (i === current) return;
    const down = i > current;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    gsap.fromTo(steps[i], { autoAlpha: 0, y: down ? 24 : -24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: true });
    gsap.set(steps[current], { autoAlpha: 0 });
    shots.forEach((s, k) => { if (k !== i && k !== current) gsap.set(s, { opacity: 0, zIndex: 0 }); });
    gsap.set(shots[current], { zIndex: 1 });
    gsap.fromTo(shots[i], { opacity: 1, zIndex: 2, clipPath: down ? 'inset(100% 0% 0% 0% round 0)' : 'inset(0% 0% 100% 0% round 0)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0)', duration: 0.7, ease: 'expo.out', overwrite: true });
    current = i;
  };
  ScrollTrigger.create({
    trigger: section, pin: '.tour-pin', start: 'top top', end: () => `+=${innerHeight * (steps.length - 0.4) * 0.75}`,
    anticipatePin: 1,
    onUpdate: (st) => show(Math.min(steps.length - 1, Math.floor(st.progress * steps.length))),
  });
}

/** The two phones in the hero drift apart a little as the page leaves. */
function heroPhones() {
  const back = document.querySelector('.hero-phone .back');
  if (!back) return;
  gsap.from('.hero-phone .phone', { y: 60, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.3 });
  gsap.to(back, { rotate: -14, xPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-phone .phone:not(.back)', { rotate: 6, yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
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
  ctx = gsap.context(() => { headings(); heroPhones(); tour(); build(); lists(); });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
});
