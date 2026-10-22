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

  if (!gs) return;

  /* ── rivista: ogni pagina di destra gira attorno alla piega e scopre la doppia pagina dopo.
     Si sfoglia in tre modi che restano d'accordo tra loro:
       scorrendo   con il mouse la sezione resta ferma e le pagine girano insieme allo scorrimento;
                   sul telefono la pagina gira quando il libro passa sullo schermo
       trascinando le foto di lato (dito o mouse): la pagina segue il gesto e, lasciata, finisce di girare o torna
       frecce      i bottoni sotto il libro e i tasti ← → della tastiera
     Con "riduci movimento" niente scorrimento né animazioni: frecce e trascinamento cambiano pagina subito. */
  var book = $('[data-book]'), leaves = $$('[data-leaf]', book), N = leaves.length;
  var prevB = $('[data-mag-prev]'), nextB = $('[data-mag-next]'), numEl = $('[data-mag-n]');
  var order = function () {
    leaves.forEach(function (l, i) {
      var flipped = gs.getProperty(l, 'rotationY') < -90;
      l.style.zIndex = flipped ? 20 + i : 10 + (N - i);
    });
  };
  /* la doppia pagina k (0..N) è aperta quando le prime k pagine sono girate */
  var at = function (k) { return k ? (k - 1) * 1.25 + 1 : 0; };
  var TOTAL = at(N) + 0.3;                  /* un attimo di pausa sull'ultima doppia pagina */
  var page = function () {
    var t = tl.time(), k = 0;
    for (var j = 1; j <= N; j++) if (Math.abs(at(j) - t) < Math.abs(at(k) - t)) k = j;
    return k;
  };
  var shown = -1;
  var ui = function () {
    order();
    var k = page();
    if (k === shown) return;
    shown = k;
    if (numEl) numEl.textContent = k + 1;
    if (prevB) prevB.disabled = k === 0;
    if (nextB) nextB.disabled = k === N;
  };
  var tl = gs.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: ui });
  leaves.forEach(function (l, i) {
    var t = i * 1.25;
    tl.to(l, { rotationY: -180, duration: 1, ease: 'power1.inOut' }, t)
      .fromTo($('.mag-face--front .mag-shade', l), { opacity: 0 }, { opacity: 0.35, duration: 0.5 }, t)
      .fromTo($('.mag-face--back .mag-shade', l), { opacity: 0.35 }, { opacity: 0, duration: 0.5 }, t + 0.5);
  });
  tl.to({}, { duration: 0.3 });
  ui();

  var pinST = null;                          /* lo ScrollTrigger della sezione ferma (solo con il mouse) */
  var toTime = function (t, dur) {
    if (FS.reduce) { gs.killTweensOf(tl); tl.time(t); return; }
    gs.to(tl, { time: t, duration: dur, ease: 'power3.out', overwrite: true });
  };
  var go = function (k) {
    k = Math.max(0, Math.min(N, k));
    toTime(at(k), 0.9);
    /* con la sezione ferma anche lo scorrimento si sposta sulla stessa pagina, così riprendendo a scorrere non salta */
    if (pinST) {
      var y = pinST.start + (at(k) / TOTAL) * (pinST.end - pinST.start);
      if (FS.lenis) FS.lenis.scrollTo(y, { duration: 0.9 }); else window.scrollTo(0, y);
    }
  };
  if (prevB) prevB.addEventListener('click', function () { go(page() - 1); });
  if (nextB) nextB.addEventListener('click', function () { go(page() + 1); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (document.querySelector('.vw.is-open') || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    var r = book.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    e.preventDefault();
    go(page() + (e.key === 'ArrowRight' ? 1 : -1));
  });

  /* trascinamento: in orizzontale la pagina segue il dito; in verticale si lascia scorrere la pagina */
  var drag = null;
  book.addEventListener('dragstart', function (e) { e.preventDefault(); });
  book.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, k: page(), t: tl.time(), on: false };
  });
  book.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      drag.on = true;
      book.classList.add('is-drag');
      if (book.setPointerCapture) book.setPointerCapture(e.pointerId);
      gs.killTweensOf(tl);
    }
    /* mezzo libro di trascinamento = una pagina intera */
    var t = drag.t - dx / (book.clientWidth / 2);
    tl.time(Math.max(0, Math.min(at(N), t)));
  });
  var release = function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    if (!d.on) return;
    book.classList.remove('is-drag');
    var dx = e.type === 'pointercancel' ? 0 : e.clientX - d.x;
    go(d.k + (dx < -40 ? 1 : dx > 40 ? -1 : 0));
  };
  book.addEventListener('pointerup', release);
  book.addEventListener('pointercancel', release);

  if (FS.reduce || !ST) return;

  FS.start(function () {
    gs.from(book, { y: 70, opacity: 0, rotationX: 14, transformPerspective: 1600, duration: 1.5, ease: 'expo.out', delay: 0.2 });
    gs.from('.mag-nav', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.8 });
    var mm = gs.matchMedia();
    mm.add({ pin: '(min-width: 900px) and (hover: hover)', free: '(max-width: 899px), (hover: none)' }, function (ctx) {
      if (ctx.conditions.pin) {
        /* con il mouse: la sezione resta ferma e le pagine seguono lo scorrimento */
        pinST = ST.create({ trigger: '[data-mag]', start: 'top top', end: '+=' + (N * 110) + '%', pin: true, anticipatePin: 1,
          onUpdate: function (st) { if (!drag || !drag.on) toTime(st.progress * TOTAL, 0.7); } });
      } else {
        /* sul telefono niente sezione ferma: mentre il libro attraversa lo schermo gira una pagina per volta.
           Il trascinamento resta libero: la pagina cambia per lo scorrimento solo quando si passa una soglia nuova. */
        var last = -1;
        ST.create({ trigger: book, start: 'top 70%', end: 'bottom 20%',
          onUpdate: function (st) {
            var k = Math.min(N, Math.floor(st.progress * (N + 1)));
            if (k !== last) { last = k; if (!drag || !drag.on) go(k); }
          } });
      }
      return function () { pinST = null; gs.killTweensOf(tl); tl.time(0); };
    });

    /* griglia: ogni foto si scopre dal basso quando entra */
    var phs = items.map(function (it) { return $('.pg-ph', it); });
    gs.set(phs, { clipPath: 'inset(100% 0% 0% 0% round 22px)' });
    ST.batch(items, {
      start: 'top 92%', once: true,
      onEnter: function (batch) {
        gs.to(batch.map(function (it) { return $('.pg-ph', it); }), { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, ease: 'expo.out', stagger: 0.09, clearProps: 'clipPath' });
      }
    });
    ST.refresh();
  });
})();
