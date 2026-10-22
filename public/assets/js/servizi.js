/* Federica Siviero: Servizi. Usa window.FS di site.js. */
(function () {
  'use strict';
  var FS = window.FS;
  if (!FS || FS.reduce || !window.gsap || !window.ScrollTrigger) return;
  var $ = FS.$, $$ = FS.$$, gs = window.gsap;

  FS.start(function () {
    /* scontrini: cadono dall'alto uno dopo l'altro e oscillano come pendoli attorno allo spillo,
       poi restano in un'oscillazione leggerissima */
    var rcs = $$('[data-rc]');
    var fall = gs.timeline({ scrollTrigger: { trigger: '[data-rc-wall]', start: 'top 78%' } });
    rcs.forEach(function (rc, i) {
      var swing = i % 2 ? 15 : -17;
      fall.fromTo(rc, { y: function () { return -window.innerHeight * 0.85; }, rotation: swing * 0.4, autoAlpha: 0 },
        { y: 0, rotation: swing, autoAlpha: 1, duration: 0.85, ease: 'power3.in' }, i * 0.18)
        .to(rc, { rotation: 0, duration: 3, ease: 'elastic.out(1.15, 0.17)' }, '>-0.02');
    });
    fall.call(function () {
      rcs.forEach(function (rc, i) {
        gs.fromTo(rc, { rotation: -0.7 }, { rotation: 0.7, duration: 2.6 + i * 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    });

    /* col mouse lo scontrino si solleva e si inclina in 3D verso il puntatore */
    if (FS.fine) {
      rcs.forEach(function (rc) {
        var paper = $('.rc-paper', rc);
        gs.set(paper, { transformPerspective: 900 });
        var rx = gs.quickTo(paper, 'rotationX', { duration: 0.5, ease: 'power3' });
        var ry = gs.quickTo(paper, 'rotationY', { duration: 0.5, ease: 'power3' });
        var ly = gs.quickTo(paper, 'y', { duration: 0.6, ease: 'power3' });
        rc.addEventListener('pointermove', function (e) {
          var r = rc.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 18);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
        });
        rc.addEventListener('pointerenter', function () { ly(-16); rc.classList.add('is-up'); });
        rc.addEventListener('pointerleave', function () { rx(0); ry(0); ly(0); rc.classList.remove('is-up'); });
      });
    }

    /* listino: le righe entrano una alla volta; i prezzi numerici contano da zero,
       i segnaposto "XX" salgono da sotto */
    gs.from('.ls-list li', { y: 20, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '[data-ls]', start: 'top 75%' } });
    gs.from('.ls-head', { yPercent: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '[data-ls]', start: 'top 78%' } });
    $$('[data-price]').forEach(function (el) {
      var v = el.getAttribute('data-price');
      if (/^\d+$/.test(v)) {
        var o = { n: 0 };
        el.textContent = '0';
        gs.to(o, { n: +v, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%' }, onUpdate: function () { el.textContent = Math.round(o.n); } });
      } else {
        gs.from(el, { yPercent: 100, opacity: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
      }
    });
  });
})();
