// Reveal on scroll and solid nav after the hero.
(function () {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  var nav = document.querySelector('.nav');
  addEventListener('scroll', function () { nav.classList.toggle('solid', scrollY > 40); }, { passive: true });
  // Staggered green cells in the writing tile.
  document.querySelectorAll('.wgrid .g').forEach(function (el, i) { el.style.animationDelay = (0.15 * i) + 's'; });
  document.querySelectorAll('.wave i').forEach(function (el, i) { el.style.animationDelay = (-(i * 0.09)) + 's'; });
  if (location.hash === '#all') document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
})();
