/* Parte prima di tutto il resto, nell'<head>: decide classi e cose da mostrare prima del primo disegno.
   - js        : le animazioni possono partire (senza, la pagina resta completa e ferma)
   - rm        : "riduci movimento" attivo, solo dissolvenze
   - ld-on     : preloader (una volta per visita)
   - has-vt    : il browser sa fare le transizioni tra pagine da solo (View Transitions)
   - is-arriving: arrivo da un'altra pagina senza View Transitions: la tendina nera copre finché la pagina è pronta
   - fine      : mouse vero, quindi cursore personalizzato */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false, arriving = false;
  try {
    seen = !!sessionStorage.getItem('fs-intro');
    arriving = sessionStorage.getItem('fs-nav') === '1';
    sessionStorage.removeItem('fs-nav');
  } catch (e) {}

  if (reduce) d.classList.add('rm', 'no-loader');
  else if (seen) d.classList.add('no-loader');
  else { d.classList.add('ld-on'); try { sessionStorage.setItem('fs-intro', '1'); } catch (e) {} }

  if (!reduce && 'CSSViewTransitionRule' in window) d.classList.add('has-vt');
  else if (!reduce && arriving) d.classList.add('is-arriving');
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) d.classList.add('fine');

  /* con le View Transitions la pagina si scopre dopo la tendina: i testi aspettano che finisca */
  window.__fsVT = null;
  addEventListener('pagereveal', function (e) {
    if (e.viewTransition) window.__fsVT = e.viewTransition.finished.catch(function () {});
  });
})();
