# Federica Siviero: sito di 3 pagine

Sito statico in italiano per Federica Siviero, makeup artist certificata a Torino (trucco sposa dal 2015, cerimonie, shooting ed editoriali).
Tre pagine, Home, Servizi e Portfolio, più l'informativa privacy. Animazioni con GSAP (ScrollTrigger, SplitText, Flip) e Lenis,
tutte ospitate sul sito: nessuna libreria da CDN, nessun cookie, nessuno strumento di analisi.

Direzione: rivista di moda, minimale, lusso. Bianco caldo `#F4F1EC`, nero `#111`, un solo accento rosso rossetto `#D10F2F` usato con parsimonia.
Font: Bodoni Moda (titoli), Instrument Serif corsivo (accenti), Archivo 800 (parole giganti) e 400 (testo), IBM Plex Mono (scontrini).

## Le tre pagine

- **Home**: copertina con il nome a tutta larghezza; marquee; Chi sono, con il testo che si accende parola per parola, il ritaglio in bianco e nero di Federica (rossetto rosso) che segue il mouse e il badge 2015; MAKEUP con due foto specchiate; manifesto "SEI TU."; metodo in tre passi; il nome in corsivo che scorre sopra un viso; servizi in breve con il video delle spose; galleria orizzontale; recensioni; "Prenotiamo?" e il modulo che apre WhatsApp.
- **Servizi**: tre scontrini appesi (Sposa, Cerimonia o evento, Shooting o editoriale) che cadono e oscillano attorno allo spillo; listino a menu; corsi e armocromia con il video.
- **Portfolio**: rivista aperta che si sfoglia scorrendo; griglia asimmetrica con filtri Tutti, Sposa, Editoriale e Beauty; ogni foto si apre a schermo intero.

Le foto hanno gli angoli arrotondati come nel sito di prima. Testi e foto vengono dal sito di prima; il ritaglio (`assets/img/federica-ritaglio-*.webp`) è ricavato da `originali/federica-al-lavoro.jpg`.

## Struttura

- `src/template.html`: scheletro comune (head, preload dei font, script).
- `src/partials/`: `shell.html` (preloader, tendina, header, menu, WhatsApp, cursore, avvisi, grana) e `footer.html`.
- `src/pages/`: una pagina per file, con le impostazioni in testa (titolo, descrizione, indirizzo, file generato, voce di menu, CSS e JS della pagina).
- `build.py`: genera `public/*.html`. Espande `{{pic:...}}` in `<picture>` con WebP 480/800/1200 e JPG di riserva, e aggiunge `?v=<impronta>` a CSS e JS (la cache di `/assets/*` dura un anno). Dopo ogni modifica: `python3 build.py`.
- `public/assets/css/site.css`: stile comune. `public/assets/js/site.js`: comportamenti comuni. `boot.js` parte nell'`<head>`, `config.js` contiene le impostazioni da completare.
- `public/assets/vendor/`: GSAP 3.13.0 e Lenis 1.1.20. `public/assets/fonts/`: font in locale.
- `src/archivio/index-onepage.src.html`: la vecchia pagina unica, non compilata, tenuta come riferimento.
- `originali/`: le foto originali ricevute.
- `wrangler.jsonc`: dice a Cloudflare di pubblicare solo `public/`.

## Come si comporta

- **Preloader**: contatore 0→100, il nome sale lettera per lettera, poi il sipario si apre. Una volta per visita.
- **Tra le pagine**: dove il browser lo sa fare (View Transitions) la pagina nuova sale a tendina sopra la vecchia. Altrove una tendina nera fa lo stesso. Con "riduci movimento" nessuna delle due.
- **Telefono**: niente cursore personalizzato, niente bottoni magnetici, scorrimento nativo.
- **Riduci movimento**: niente preloader, niente scorrimento morbido, niente spostamenti. Il sito resta completo.

## Da completare (cercare `DA COMPLETARE`, `todo` o `XX`)

- Prezzi e durate in `src/pages/servizi.html`: scontrini (`€ XX`, `XX min`) e listino (`data-price="XX"`). Con un numero, per esempio `data-price="120"`, il prezzo conta da zero quando entra nello schermo.
- Il terzo dei "tre elementi chiave" del metodo e le tre recensioni reali da Google (Home).

- `WA_NUMBER` in `public/assets/js/config.js`: numero WhatsApp con prefisso, solo cifre (es. 39...). Finché è vuoto i pulsanti WhatsApp mostrano un avviso.
- P.IVA nel footer (`src/partials/footer.html`).
- Dominio: `SITE` in `build.py` (canonical, Open Graph e JSON-LD usano `dominio-da-completare.example`).
- `src/pages/privacy.html`: titolare (P.IVA, indirizzo, contatti), fornitore di hosting, tempi di conservazione, data.
- Quando il sito va online davvero: togliere `noindex` (meta in `src/template.html` e `X-Robots-Tag` in `public/_headers`) e aprire `public/robots.txt`.

## Pubblicazione

Cloudflare Workers con file statici: collegare il repository, ramo `main`, comando di deploy `npx wrangler deploy`.
