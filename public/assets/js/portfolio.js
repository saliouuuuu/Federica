/* Federica Siviero: Portfolio. Usa window.FS di site.js e GSAP Flip. */
(function () {
  'use strict';
  var FS = window.FS;
  if (!FS) return;
  var $ = FS.$, $$ = FS.$$, gs = window.gsap, ST = window.ScrollTrigger;

  /* ── griglia: forme a rotazione e filtri (funzionano anche con "riduci movimento") ── */
  var grid = $('[data-pg]'), items = $$('.pg-item', grid), btns = $$('[data-filter]'), status = $('[data-filter-status]');
  var DESK = ['a', 'b', 'c', 'd', 'e', 'f', 'g'], MOB = ['a', 'b', 'c'];
  var wide = window.matchMedia('(min-width: 900px)');
  function shapes() {
    var cyc = wide.matches ? DESK : MOB, k = 0;
    items.forEach(function (it) { if (!it.hidden) it.setAttribute('data-shape', cyc[k++ % cyc.length]); });
  }
  function apply(cat, animate) {
    var state = animate && window.Flip ? window.Flip.getState(items) : null;
    items.forEach(function (it) { it.hidden = !(cat === 'tutti' || it.getAttribute('data-cat') === cat); });
    shapes();
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === cat ? 'true' : 'false'); });
    var n = items.filter(function (it) { return !it.hidden; }).length;
    if (status) status.textContent = n + (n === 1 ? ' lavoro' : ' lavori');
    if (state) {
      window.Flip.from(state, {
        duration: 0.9, ease: 'expo.inOut', absolute: true, stagger: 0.015,
        onEnter: function (els) { return gs.fromTo(els, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out', delay: 0.25 }); },
        onLeave: function (els) { return gs.to(els, { opacity: 0, scale: 0.86, duration: 0.4 }); },
        onComplete: function () { if (ST) ST.refresh(); }
      });
    } else if (ST) ST.refresh();
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-filter'), !FS.reduce && !!gs); }); });
  if (wide.addEventListener) wide.addEventListener('change', shapes);
  shapes();

  if (FS.reduce || !gs || !ST) return;

  FS.start(function () {
    /* rivista: scorrendo, ogni pagina di destra gira attorno alla piega e scopre la doppia pagina dopo.
       Con il mouse la sezione resta ferma mentre si sfoglia; sul telefono si sfoglia mentre passa sullo schermo. */
    var book = $('[data-book]'), leaves = $$('[data-leaf]', book);
    var order = function () {
      leaves.forEach(function (l, i) {
        var flipped = gs.getProperty(l, 'rotationY') < -90;
        l.style.zIndex = flipped ? 20 + i : 10 + (leaves.length - i);
      });
    };
    order();
    gs.from(book, { y: 70, opacity: 0, rotationX: 14, transformPerspective: 1600, duration: 1.5, ease: 'expo.out', delay: 0.2 });
    var mm = gs.matchMedia();
    mm.add({ pin: '(min-width: 900px) and (hover: hover)', free: '(max-width: 899px), (hover: none)' }, function (ctx) {
      var tl = gs.timeline({
        defaults: { ease: 'none' }, onUpdate: order,
        scrollTrigger: ctx.conditions.pin
          ? { trigger: '[data-mag]', start: 'top top', end: '+=' + (leaves.length * 110) + '%', pin: true, scrub: 1, anticipatePin: 1 }
          : { trigger: book, start: 'top 72%', end: 'bottom 18%', scrub: 1 }
      });
      leaves.forEach(function (l, i) {
        var at = i * 1.25;
        tl.to(l, { rotationY: -180, duration: 1, ease: 'power1.inOut' }, at)
          .fromTo($('.mag-face--front .mag-shade', l), { opacity: 0 }, { opacity: 0.35, duration: 0.5 }, at)
          .fromTo($('.mag-face--back .mag-shade', l), { opacity: 0.35 }, { opacity: 0, duration: 0.5 }, at + 0.5);
      });
      tl.to({}, { duration: 0.3 });
      return function () { gs.set(leaves, { rotationY: 0 }); order(); };
    });
    gs.to('.mag-hint', { opacity: 0, scrollTrigger: { trigger: '[data-mag]', start: 'top top', end: '+=200', scrub: true } });

    /* griglia: ogni foto si scopre dal basso quando entra e si muove piano dentro la cornice */
    var phs = items.map(function (it) { return $('.pg-ph', it); });
    gs.set(phs, { clipPath: 'inset(100% 0% 0% 0% round 22px)' });
    ST.batch(items, {
      start: 'top 92%', once: true,
      onEnter: function (batch) {
        gs.to(batch.map(function (it) { return $('.pg-ph', it); }), { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, ease: 'expo.out', stagger: 0.09, clearProps: 'clipPath' });
      }
    });
    items.forEach(function (it) {
      gs.fromTo($('img', it), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    ST.refresh();
  });
})();
