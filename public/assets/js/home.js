/* Federica Siviero: Home. Usa window.FS di site.js (preloader, Lenis, animazioni dei testi). */
(function () {
  'use strict';
  var FS = window.FS;
  if (!FS) return;
  var $ = FS.$, $$ = FS.$$, gs = window.gsap, reduce = FS.reduce;

  /* ── modulo: prepara il messaggio e apre WhatsApp (il numero è in config.js) ── */
  var form = $('#form'), msgEl = $('[data-form-msg]');
  var WA = ((window.FS_CONFIG || {}).WA_NUMBER || '').replace(/\D/g, '');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    if (!nome) { msgEl.textContent = 'Scrivi il tuo nome, così Federica sa chi sei.'; form.nome.focus(); return; }
    var data = form.data.value ? new Date(form.data.value + 'T12:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    var t = 'Ciao Federica, sono ' + nome + '.\nTi scrivo per: ' + form.servizio.value + '.';
    if (data) t += '\nData dell\'evento: ' + data + '.';
    if (form.messaggio.value.trim()) t += '\n' + form.messaggio.value.trim();
    if (!WA) { msgEl.textContent = 'Numero WhatsApp ancora da inserire [DA COMPLETARE]: in questa anteprima il messaggio non può partire.'; return; }
    msgEl.textContent = 'Si apre WhatsApp con il messaggio pronto.';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
  });

  /* ── metodo: il passo al centro dello schermo accende la sua foto ── */
  var steps = $$('[data-step]'), stepImgs = $$('[data-step-img]');
  if (steps.length && 'IntersectionObserver' in window) {
    var stepIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = e.target.getAttribute('data-step');
        steps.forEach(function (st) { st.classList.toggle('is-on', st === e.target); });
        stepImgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-step-img') === k); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (st) { stepIO.observe(st); });
    steps[0].classList.add('is-on');
  }

  /* ── da qui in poi solo movimento ── */
  if (reduce || !gs || !window.ScrollTrigger) return;
  var ST = window.ScrollTrigger;

  FS.start(function () {
    var mm = gs.matchMedia();

    /* copertina: la foto si scopre dal basso e rientra, poi scende più lenta della testata */
    var cph = $('[data-cover-ph]'), cimg = cph && $('img', cph);
    if (cph) {
      gs.fromTo(cph, { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.5, ease: 'expo.inOut', delay: 0.1, clearProps: 'clipPath' });
      gs.fromTo(cimg, { scale: 1.3 }, { scale: 1, duration: 2.1, ease: 'expo.out', delay: 0.1 });
      gs.to(cimg, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true } });
      gs.to('.cover-mast', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* marquee: gira solo quando si vede */
    var mq = $('[data-mq]');
    if (mq) ST.create({ trigger: '.mq', start: 'top bottom', end: 'bottom top', onToggle: function (s) { mq.style.animationPlayState = s.isActive ? 'running' : 'paused'; } });

    /* ritaglio in bianco e nero: entra dal basso; col mouse segue il puntatore */
    var cut = $('[data-cut]');
    if (cut) {
      gs.from(cut, { yPercent: 16, rotation: -6, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: cut, start: 'top 85%' } });
      if (FS.fine) {
        var cx = gs.quickTo(cut, 'x', { duration: 1.1, ease: 'power3' }), cy = gs.quickTo(cut, 'y', { duration: 1.1, ease: 'power3' });
        $('.chi').addEventListener('pointermove', function (e) {
          cx((e.clientX / window.innerWidth - 0.5) * 56); cy((e.clientY / window.innerHeight - 0.5) * 40);
        }, { passive: true });
      }
    }

    /* MAKEUP: la parola resta ferma al centro, le due foto si allontanano in direzioni opposte */
    var mk = $('[data-mk]');
    if (mk) {
      mm.add({ desk: '(min-width: 900px)', mob: '(max-width: 899px)' }, function (ctx) {
        var d = ctx.conditions.desk ? 1 : 0.55, H = function () { return window.innerHeight; };
        var tl = gs.timeline({ scrollTrigger: { trigger: mk, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
        tl.fromTo('.mk-ph--top', { y: function () { return H() * 0.03 * d; } }, { y: function () { return -H() * 0.15 * d; }, ease: 'none' }, 0)
          .fromTo('.mk-ph--bot', { y: function () { return -H() * 0.03 * d; } }, { y: function () { return H() * 0.15 * d; }, ease: 'none' }, 0)
          .fromTo('.mk-ghost', { yPercent: -45, opacity: 0 }, { yPercent: 0, opacity: 0.15, ease: 'none' }, 0);
      });
      gs.from('.mk-solid', { yPercent: 55, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: mk, start: 'top 55%' } });
      gs.from('.mk-ph--top', { clipPath: 'inset(0% 0% 100% 0% round 22px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: mk, start: 'top 70%' } });
      gs.from('.mk-ph--bot', { clipPath: 'inset(100% 0% 0% 0% round 22px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: mk, start: 'top 70%' } });
    }

    /* manifesto: la scheda si apre entrando; col mouse la lente segue il puntatore sul viso.
       Niente animazioni legate allo scorrimento qui: ogni cambio della maschera ridisegna tutta la foto. */
    var mani = $('[data-mani]');
    if (mani) {
      gs.from(mani, { clipPath: 'inset(10% 8% 10% 8% round 80px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: mani, start: 'top 85%' } });
      if (FS.fine) {
        var lens = $$('.mani-lens', mani), svg = $('svg', mani), pt = svg.createSVGPoint();
        /* quickTo non gestisce gli attributi SVG: un tween breve che si sovrascrive fa lo stesso */
        var lensTo = function (x, y) { gs.to(lens, { attr: { cx: x, cy: y }, duration: 0.7, ease: 'power3', overwrite: 'auto' }); };
        mani.addEventListener('pointerenter', function () { gs.to(lens, { attr: { r: 120 }, duration: 0.6, ease: 'power3' }); });
        mani.addEventListener('pointermove', function (e) { pt.x = e.clientX; pt.y = e.clientY; var q = pt.matrixTransform(svg.getScreenCTM().inverse()); lensTo(q.x, q.y); });
        mani.addEventListener('pointerleave', function () { gs.to(lens, { attr: { cx: 535, cy: 480, r: 92 }, duration: 0.8, ease: 'power3' }); });
      }
    }
    gs.from('.met-n', { yPercent: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.met-steps', start: 'top 80%' } });

    /* galleria: con il mouse la sezione si ferma e le foto scorrono di lato */
    mm.add('(min-width: 900px) and (hover: hover)', function () {
      var sec = $('[data-hg]'), track = $('[data-hg-track]');
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gs.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      gs.from($$('.hg-item', track).slice(0, 3), { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: sec, start: 'top 70%' } });
    });
    mm.add('(max-width: 899px), (hover: none)', function () {
      gs.from('.hg-item', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '[data-hg-track]', start: 'top 85%' } });
    });

    gs.from('.rec-row strong', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.rec', start: 'top 85%' } });
    ST.refresh();
  });
})();
