/* Federica Siviero: comportamenti comuni a tutte le pagine.
   Preloader, scorrimento morbido (Lenis), header che si nasconde, menu, tendina tra le pagine,
   cursore personalizzato, bottoni magnetici, WhatsApp.

   Le pagine usano window.FS:
     FS.start(fn)   esegue fn quando il preloader (o la tendina) ha finito di scoprire la pagina
     FS.reduce      true con "riduci movimento": solo dissolvenze, niente spostamenti
     FS.fine        true con un mouse vero
     FS.lenis       l'istanza di Lenis (null con riduci movimento o senza librerie)
     FS.toast(txt)  avviso in basso
   Senza le librerie, o con "riduci movimento", il sito resta completo e fermo. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = root.classList.contains('rm');
  var fine = root.classList.contains('fine');
  var hasVT = root.classList.contains('has-vt');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var gs = window.gsap;
  var canAnimate = !reduce && !!gs && !!window.ScrollTrigger;

  var resolveReady;
  var FS = window.FS = {
    reduce: reduce, fine: fine, lenis: null, $: $, $$: $$,
    ready: new Promise(function (r) { resolveReady = r; }),
    start: function (fn) { return FS.ready.then(fn); },
    toast: toast,
    scrollTo: scrollTo
  };

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ── avviso in basso ── */
  var toastEl = $('[data-toast]'), toastT;
  function toast(txt) {
    if (!toastEl) return;
    toastEl.textContent = txt; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 5200);
  }

  /* ── WhatsApp: il numero sta in assets/js/config.js ── */
  var WA = ((window.FS_CONFIG || {}).WA_NUMBER || '').replace(/\D/g, '');
  $$('[data-wa]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (!WA) { toast('Numero WhatsApp ancora da inserire [DA COMPLETARE]: in questa anteprima la chat non può aprirsi.'); return; }
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(a.getAttribute('data-wa-msg') || ''), '_blank', 'noopener');
    });
  });

  /* ── testi che riempiono la larghezza (nome in copertina): [data-fit] sul contenitore, .fit-row sulle righe ── */
  function fitAll() {
    $$('[data-fit]').forEach(function (box) {
      var w = box.clientWidth;
      if (!w) return;
      $$('.fit-row', box).forEach(function (row) {
        if (getComputedStyle(row).display === 'none') return;
        row.style.fontSize = '100px';
        var rw = row.getBoundingClientRect().width;
        if (rw) row.style.fontSize = (100 * w / rw * 0.995).toFixed(2) + 'px';
      });
    });
  }
  FS.fit = fitAll;
  var fitT;
  window.addEventListener('resize', function () { clearTimeout(fitT); fitT = setTimeout(function () { fitAll(); if (window.ScrollTrigger) window.ScrollTrigger.refresh(); }, 150); });
  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

  /* ── video: partono muti quando si vedono, si fermano fuori schermo; con riduci movimento si avviano a mano ── */
  $$('video[data-autoplay]').forEach(function (v) {
    if (reduce || !('IntersectionObserver' in window)) { v.controls = true; return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { v.preload = 'auto'; var pr = v.play(); if (pr && pr.catch) pr.catch(function () { v.controls = true; }); }
        else v.pause();
      });
    }, { rootMargin: '120px 0px' }).observe(v);
  });

  /* ── visore a schermo intero: si apre dal riquadro della foto (clip-path) e si chiude con ESC, X o trascinando ──
     uso: un contenitore [data-view-group] con dentro bottoni [data-view] che hanno data-full e data-title */
  var vwEl = $('[data-vw]');
  if (vwEl) {
    var vImg = $('[data-vw-img]', vwEl), vCap = $('[data-vw-cap]', vwEl), vNum = $('[data-vw-n]', vwEl), vList = [], vi = 0, vLast = null;
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var clipOf = function (el) {
      var r = el.getBoundingClientRect();
      return 'inset(' + r.top + 'px ' + (window.innerWidth - r.right) + 'px ' + (window.innerHeight - r.bottom) + 'px ' + r.left + 'px round 22px)';
    };
    var vShow = function (k) {
      vi = (k + vList.length) % vList.length;
      var b = vList[vi], im = $('img', b);
      vImg.src = b.getAttribute('data-full'); vImg.alt = im ? im.alt : '';
      vCap.textContent = b.getAttribute('data-title') || ''; vNum.textContent = pad(vi + 1) + ' / ' + pad(vList.length);
    };
    var vOpen = function (list, k) {
      vList = list; vLast = list[k]; vShow(k);
      vwEl.classList.add('is-open'); lock();
      if (gs && !reduce) gs.fromTo(vwEl, { clipPath: clipOf(list[k]) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.85, ease: 'expo.inOut' });
      else if (gs) gs.fromTo(vwEl, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      $('[data-vw-x]', vwEl).focus();
    };
    var vClose = function () {
      if (!vwEl.classList.contains('is-open')) return;
      var b = vList[vi], r = b.getBoundingClientRect(), seen = r.bottom > 0 && r.top < window.innerHeight;
      var done = function () { vwEl.classList.remove('is-open'); if (gs) gs.set(vwEl, { clearProps: 'clipPath,opacity' }); unlock(); b.focus({ preventScroll: true }); };
      if (gs && !reduce && seen) gs.to(vwEl, { clipPath: clipOf(b), duration: 0.75, ease: 'expo.inOut', onComplete: done });
      else if (gs) gs.to(vwEl, { opacity: 0, duration: 0.3, onComplete: done });
      else done();
    };
    FS.view = vOpen;
    $$('[data-view-group]').forEach(function (g) {
      g.addEventListener('click', function (e) {
        var b = e.target.closest('[data-view]');
        if (!b || b.dataset.dragged) return;
        /* solo le foto visibili (i filtri del portfolio ne nascondono alcune) */
        var list = $$('[data-view]', g).filter(function (x) { return !x.closest('[hidden]') && x.offsetParent !== null; });
        vOpen(list, Math.max(0, list.indexOf(b)));
      });
    });
    $('[data-vw-x]', vwEl).addEventListener('click', vClose);
    $('[data-vw-prev]', vwEl).addEventListener('click', function () { vShow(vi - 1); });
    $('[data-vw-next]', vwEl).addEventListener('click', function () { vShow(vi + 1); });
    document.addEventListener('keydown', function (e) {
      if (!vwEl.classList.contains('is-open')) return;
      if (e.key === 'Escape') vClose();
      else if (e.key === 'ArrowRight') vShow(vi + 1);
      else if (e.key === 'ArrowLeft') vShow(vi - 1);
      else if (e.key === 'Tab') {   /* il focus resta nel visore */
        var f = $$('button', vwEl), at = f.indexOf(document.activeElement);
        e.preventDefault(); f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    var sx = null, sy = null;
    vwEl.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    vwEl.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (dy > 80 && Math.abs(dy) > Math.abs(dx)) vClose();
      else if (Math.abs(dx) > 50) vShow(vi + (dx < 0 ? 1 : -1));
    });
  }

  /* ── senza animazioni il sito finisce qui, completo ── */
  if (!canAnimate) {
    initMenu(); initHeader();
    var ld0 = $('.ld'); if (ld0) ld0.remove();
    root.classList.remove('ld-on', 'is-arriving');
    resolveReady();
    return;
  }
  gs.registerPlugin(window.ScrollTrigger);
  if (window.SplitText) gs.registerPlugin(window.SplitText);
  if (window.Flip) gs.registerPlugin(window.Flip);
  window.ScrollTrigger.config({ ignoreMobileResize: true });

  /* ── Lenis: scorrimento morbido, agganciato a ScrollTrigger ── */
  var lenis = null;
  if (window.Lenis) {
    lenis = FS.lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', window.ScrollTrigger.update);
    gs.ticker.add(function (t) { lenis.raf(t * 1000); });
    gs.ticker.lagSmoothing(0);
  }
  function lock() { if (lenis) lenis.stop(); else root.style.overflow = 'hidden'; }
  function unlock() { if (lenis) lenis.start(); else root.style.overflow = ''; }
  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: -8, duration: 1.4 });
    else (typeof target === 'string' ? $(target) : target).scrollIntoView({ behavior: 'smooth' });
  }
  $$('a[href^="#"]:not([data-wa])').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    a.addEventListener('click', function (e) { var t = $(id); if (!t) return; e.preventDefault(); scrollTo(t); });
  });

  initMenu(); initHeader();

  /* ── menu a tutto schermo ── */
  function initMenu() {
    var menu = $('#menu'), open = $('.hdr-burger'), close = $('.menu-x');
    if (!menu || !open) return;
    function set(on) {
      menu.classList.toggle('is-open', on); open.setAttribute('aria-expanded', on);
      if (FS.lenis) { on ? FS.lenis.stop() : FS.lenis.start(); } else { root.style.overflow = on ? 'hidden' : ''; }
      (on ? close : open).focus();
    }
    open.addEventListener('click', function () { set(true); });
    close.addEventListener('click', function () { set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) set(false); });
  }

  /* ── header: si nasconde scendendo, riappare risalendo; la barra rossa mostra quanto hai scorso ── */
  function initHeader() {
    var hdr = $('[data-hdr]'), prog = $('[data-progress]'), lastY = window.scrollY, tick = false;
    if (!hdr) return;
    function run() {
      tick = false;
      var y = window.scrollY, max = root.scrollHeight - window.innerHeight, dy = y - lastY;
      if (prog) prog.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      if (y < 90) hdr.classList.remove('is-hidden');
      else if (dy > 6) hdr.classList.add('is-hidden');
      else if (dy < -6) hdr.classList.remove('is-hidden');
      if (Math.abs(dy) > 6) lastY = y;
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    hdr.addEventListener('focusin', function () { hdr.classList.remove('is-hidden'); });
    run();
  }

  /* ── bottoni magnetici e cursore: solo con il mouse ── */
  if (fine) {
    $$('.magnetic').forEach(function (b) {
      var xTo = gs.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), yTo = gs.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.36); });
      b.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
    var cur = $('.cur'), cx = gs.quickTo(cur, 'x', { duration: 0.4, ease: 'power3' }), cy = gs.quickTo(cur, 'y', { duration: 0.4, ease: 'power3' }), first = true, px = -1, py = -1, ctick = false;
    var curTxt = $('span', cur);
    /* sopra [data-cursor="vedi"] o [data-cursor="sfoglia"] il cerchio si allarga e mostra la parola */
    var curState = function (t) {
      var v = t && t.closest && t.closest('[data-cursor]');
      if (v && curTxt.textContent !== v.getAttribute('data-cursor')) curTxt.textContent = v.getAttribute('data-cursor');
      cur.classList.toggle('is-view', !!v);
      cur.classList.toggle('is-link', !v && !!(t && t.closest && t.closest('a, button, label, summary')));
    };
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (first) { gs.set(cur, { x: e.clientX, y: e.clientY }); first = false; }
      root.classList.add('cur-on'); cx(e.clientX); cy(e.clientY); px = e.clientX; py = e.clientY;
      curState(e.target);
    }, { passive: true });
    /* scorrendo con la rotella il puntatore resta fermo ma sotto cambia tutto: si ricontrolla cosa c'è */
    window.addEventListener('scroll', function () {
      if (px < 0 || ctick) return;
      ctick = true;
      requestAnimationFrame(function () { ctick = false; curState(document.elementFromPoint(px, py)); });
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { root.classList.remove('cur-on'); });
  }

  /* ── PRELOADER: contatore 0→100, il nome sale lettera per lettera, poi il sipario si apre ── */
  function runLoader() {
    var ld = $('.ld'), name = $('.ld-name'), num = $('[data-ld-n]'), bar = $('.ld-line');
    var words = name.textContent.split(' ');
    name.textContent = '';
    words.forEach(function (word, i) {
      var w = document.createElement('span'); w.className = 'w';
      word.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.appendChild(s); });
      name.appendChild(w);
      if (i < words.length - 1) { var sp = document.createElement('span'); sp.className = 'sp'; name.appendChild(sp); }
    });
    name.classList.add('is-split');
    var chars = $$('.ch', name), v = { n: 0 };
    lock();
    var tl = gs.timeline({ onComplete: function () { ld.remove(); root.classList.remove('ld-on'); unlock(); } });
    tl.to(chars, { y: 0, yPercent: 0, duration: 1, stagger: 0.055, ease: 'expo.out' }, 0.2)
      .to(v, { n: 100, duration: 2.3, ease: 'power2.inOut', onUpdate: function () { num.textContent = Math.round(v.n); } }, 0)
      .to(bar, { scaleX: 1, duration: 2.3, ease: 'power2.inOut' }, 0)
      .to('.ld-count', { opacity: 0, duration: 0.35 }, '>-0.05')
      .to('.ld-core', { yPercent: -10, opacity: 0, duration: 0.55, ease: 'power2.in' }, '>0.1')
      .addLabel('open')
      .to('.ld-panel--l', { xPercent: -101, duration: 1.15, ease: 'expo.inOut' }, 'open')
      .to('.ld-panel--r', { xPercent: 101, duration: 1.15, ease: 'expo.inOut' }, 'open')
      .to(bar, { opacity: 0, duration: 0.3 }, 'open')
      .call(resolveReady, null, 'open+=0.35');
  }

  /* ── tendina tra le pagine dove il browser non sa farle da solo ── */
  function initCurtain(loading) {
    var crt = $('.crt'), leaving = false;
    if (root.classList.contains('is-arriving')) {
      gs.to(crt, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'expo.inOut', delay: 0.12, onStart: function () { setTimeout(resolveReady, 450); },
        onComplete: function () { root.classList.remove('is-arriving'); gs.set(crt, { clearProps: 'clipPath' }); } });
    } else if (!loading) {
      resolveReady();
    }
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      e.preventDefault();
      if (leaving) return;
      leaving = true; lock();
      try { sessionStorage.setItem('fs-nav', '1'); } catch (err) {}
      gs.fromTo(crt, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut', onComplete: function () { location.href = u.href; } });
    });
    /* tornando indietro il browser può riportare la pagina com'era: la tendina deve essere aperta */
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      leaving = false; gs.set(crt, { clipPath: 'inset(100% 0% 0% 0%)' }); unlock();
    });
  }

  /* ── via: preloader alla prima visita, altrimenti tendina o View Transitions ── */
  var loading = root.classList.contains('ld-on');
  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 900); })]) : Promise.resolve();
  if (loading) fontsReady.then(runLoader);
  else if (hasVT) {
    /* le View Transitions scoprono la pagina da sole: i testi aspettano la fine della tendina */
    Promise.race([window.__fsVT || Promise.resolve(), new Promise(function (r) { setTimeout(r, 1400); })]).then(resolveReady);
  }
  if (!hasVT) initCurtain(loading);

  /* ── animazioni dei testi e delle foto, dopo il preloader o la tendina ──
     data-split   lettere che salgono da dietro una maschera (titoli principali)
     data-lines   righe che salgono da dietro una maschera (titoli di sezione)
     data-words   parole che si accendono dal 10% al 100% mentre scorri (testi lunghi)
     data-fade    sale e compare quando entra nello schermo
     data-reveal  foto che si scopre dal basso, con la foto dentro che rientra
     data-speed   parallasse verticale (numero = intensità, negativo = verso l'alto) */
  /* SplitText mette aria-label sull'elemento: va bene sui titoli, non su paragrafi e span (lì le parole restano leggibili così) */
  function ariaFor(el) { return /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none'; }
  FS.start(function () {
    var desk = window.matchMedia('(min-width: 900px)').matches, k = desk ? 1 : 0.45;
    $$('[data-split]').forEach(function (el) {
      if (!window.SplitText) { gs.set(el, { visibility: 'visible' }); return; }
      /* parole intere come blocchi: le lettere salgono, ma una parola non si spezza mai a fine riga */
      SplitText.create(el, { type: 'words, chars', mask: 'chars', wordsClass: 'sw', charsClass: 'sc', autoSplit: true, aria: ariaFor(el), onSplit: function (self) {
        gs.set(el, { visibility: 'visible' });
        /* a fine animazione la maschera si toglie, altrimenti taglia il lato delle lettere in corsivo */
        return gs.from(self.chars, { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.035,
          onComplete: function () { gs.set($$('.sc-mask', el), { overflow: 'visible' }); } });
      } });
    });
    if (window.SplitText) {
      $$('[data-lines]').forEach(function (el) {
        SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln', autoSplit: true, aria: ariaFor(el), onSplit: function (self) {
          return gs.from(self.lines, { yPercent: 112, duration: 1.25, ease: 'expo.out', stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 88%' },
            onComplete: function () { gs.set($$('.ln-mask', el), { overflow: 'visible' }); } });
        } });
      });
      $$('[data-words]').forEach(function (el) {
        SplitText.create(el, { type: 'words', wordsClass: 'w', autoSplit: true, aria: 'none', onSplit: function (self) {
          return gs.fromTo(self.words, { opacity: 0.1 }, { opacity: 1, stagger: 0.1, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true } });
        } });
      });
    }
    $$('[data-fade]').forEach(function (el) {
      gs.from(el, { y: 28, opacity: 0, duration: 1.15, ease: 'expo.out', delay: parseFloat(el.getAttribute('data-fade')) || 0, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    $$('[data-reveal]').forEach(function (ph) {
      var r = getComputedStyle(ph).borderTopLeftRadius || '0px', inner = $('img, video', ph);
      var tl = gs.timeline({ scrollTrigger: { trigger: ph, start: 'top 88%' } });
      tl.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0% round ' + r + ')' }, { clipPath: 'inset(0% 0% 0% 0% round ' + r + ')', duration: 1.4, ease: 'expo.out', clearProps: 'clipPath' });
      if (inner) tl.fromTo(inner, { scale: 1.15 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
    });
    $$('[data-speed]').forEach(function (el) {
      var v = parseFloat(el.getAttribute('data-speed'));
      gs.fromTo(el, { yPercent: -v * k }, { yPercent: v * k, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    window.ScrollTrigger.refresh();
  });

  window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
