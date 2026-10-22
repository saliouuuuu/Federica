# Federica Siviero: sito di 3 pagine

Sito statico in italiano per Federica Siviero, makeup artist certificata a Torino (trucco sposa dal 2015, cerimonie, shooting ed editoriali).
Tre pagine, Home, Servizi e Portfolio, più l'informativa privacy. Animazioni con GSAP (ScrollTrigger, SplitText, Flip) e Lenis,
tutte ospitate sul sito: nessuna libreria da CDN, nessun cookie, nessuno strumento di analisi.

Direzione: rivista di moda, minimale, lusso. Bianco caldo `#F4F1EC`, nero `#111`, un solo accento rosso rossetto `#D10F2F` usato con parsimonia.
Font: Bodoni Moda (titoli), Instrument Serif corsivo (accenti), Archivo 800 (parole giganti) e 400 (testo), IBM Plex Mono (scontrini).

## Stato dei lavori

- **Fase 1, parti comuni: fatta.** Preloader, scorrimento morbido, header, transizioni tra pagine, cursore, bottoni magnetici, WhatsApp, grana.
- Fase 2, Home: da fare. Le tre pagine mostrano per ora un segnaposto "in costruzione".
- Fase 3, Servizi: da fare.
- Fase 4, Portfolio: da fare.

## Struttura

- `src/template.html`: scheletro comune (head, preload dei font, script).
- `src/partials/`: `shell.html` (preloader, tendina, header, menu, WhatsApp, cursore, avvisi, grana) e `footer.html`.
- `src/pages/`: una pagina per file, con le impostazioni in testa (titolo, descrizione, indirizzo, file generato, voce di menu, CSS e JS della pagina).
- `build.py`: genera `public/*.html`. Espande `{{pic:...}}` in `<picture>` con WebP 480/800/1200 e JPG di riserva, e aggiunge `?v=<impronta>` a CSS e JS (la cache di `/assets/*` dura un anno). Dopo ogni modifica: `python3 build.py`.
- `public/assets/css/site.css`: stile comune. `public/assets/js/site.js`: comportamenti comuni. `boot.js` parte nell'`<head>`, `config.js` contiene le impostazioni da completare.
- `public/assets/vendor/`: GSAP 3.13.0 e Lenis 1.1.20. `public/assets/fonts/`: font in locale.
- `src/archivio/index-onepage.src.html`: la vecchia pagina unica, non compilata: serve solo come riserva di testi e foto per le fasi successive.
- `originali/`: le foto originali ricevute.
- `wrangler.jsonc`: dice a Cloudflare di pubblicare solo `public/`.

## Come si comporta

- **Preloader**: contatore 0→100, il nome sale lettera per lettera, poi il sipario si apre. Una volta per visita.
- **Tra le pagine**: dove il browser lo sa fare (View Transitions) la pagina nuova sale a tendina sopra la vecchia. Altrove una tendina nera fa lo stesso. Con "riduci movimento" nessuna delle due.
- **Telefono**: niente cursore personalizzato, niente bottoni magnetici, scorrimento nativo.
- **Riduci movimento**: niente preloader, niente scorrimento morbido, niente spostamenti. Il sito resta completo.

## Da completare (cercare `DA COMPLETARE` o `todo`)

- `WA_NUMBER` in `public/assets/js/config.js`: numero WhatsApp con prefisso, solo cifre (es. 39...). Finché è vuoto i pulsanti WhatsApp mostrano un avviso.
- P.IVA nel footer (`src/partials/footer.html`).
- Dominio: `SITE` in `build.py` (canonical, Open Graph e JSON-LD usano `dominio-da-completare.example`).
- `src/pages/privacy.html`: titolare (P.IVA, indirizzo, contatti), fornitore di hosting, tempi di conservazione, data.
- Quando il sito va online davvero: togliere `noindex` (meta in `src/template.html` e `X-Robots-Tag` in `public/_headers`) e aprire `public/robots.txt`.

## Pubblicazione

Cloudflare Workers con file statici: collegare il repository, ramo `main`, comando di deploy `npx wrangler deploy`.
