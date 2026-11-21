import HanziWriter from 'hanzi-writer';

const data = import.meta.glob('../data/*.json', { import: 'default' });
const load = (c: string, done: (d: never) => void) => { data[`../data/${c}.json`]?.().then((d) => done(d as never)); };

/** A big practice cell that draws a character stroke by stroke; call `show(char)` to draw another. */
export function drawCell(el: HTMLElement, first: string) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const size = el.clientWidth;
  el.innerHTML = '';
  const w = HanziWriter.create(el, first, {
    width: size, height: size, padding: size * 0.07,
    strokeColor: css.getPropertyValue('--ink').trim(), outlineColor: css.getPropertyValue('--guide').trim(),
    showOutline: true, showCharacter: reduced, strokeAnimationSpeed: 1.2, delayBetweenStrokes: 80, charDataLoader: load,
  });
  let current = first;
  const show = (c: string) => {
    if (c === current && !reduced) { w.animateCharacter(); return; }
    current = c;
    if (reduced) { w.setCharacter(c); return; }
    w.setCharacter(c).then(() => { w.hideCharacter(); w.animateCharacter(); });
  };
  if (!reduced) w.animateCharacter();
  return { show };
}
