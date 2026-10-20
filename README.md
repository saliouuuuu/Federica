# Federica Siviero — sito one-page

Sito statico in italiano per Federica Siviero, makeup artist certificata a Torino (trucco sposa dal 2015, corsi di self makeup, armocromia).
Una sola pagina con CSS e JavaScript inline. Animazioni con GSAP, ScrollTrigger, SplitText e Lenis caricati da jsDelivr.
Nessun cookie, nessuno strumento di analisi.

## Struttura

- `src/index.src.html`: sorgente della pagina. Le foto sono scritte come segnaposto `{{pic:...}}` e `{{pf:...}}`.
- `build.py`: genera `public/index.html` espandendo i segnaposto in `<picture>` con WebP 480/800/1200 e JPG di riserva. Dopo ogni modifica: `python3 build.py`.
- `public/`: quello che va online (pagina, `privacy.html`, foto, font, favicon, `_headers`, `robots.txt`).
- `originali/`: le foto originali ricevute, con nomi descrittivi.
- `wrangler.jsonc`: dice a Cloudflare di pubblicare solo la cartella `public/`.

## Da completare (cercare `todo` o `DA COMPLETARE`)

- `WA_NUMBER` in fondo a `src/index.src.html`: numero WhatsApp con prefisso, solo cifre (es. 39...). Finché è vuoto il modulo mostra un avviso.
- Numero WhatsApp visibile nella sezione Contatti.
- Recensioni: tre testi reali da Google con nome e servizio.
- P.IVA nel footer.
- Dominio: `canonical`, Open Graph e JSON-LD usano `dominio-da-completare.example`.
- `privacy.html`: titolare (P.IVA, indirizzo, contatti), fornitore di hosting, tempi di conservazione, data.
- Quando il sito va online davvero: togliere `noindex` (meta in `src/index.src.html` e `privacy.html`, `X-Robots-Tag` in `_headers`) e aprire `robots.txt`.

## Pubblicazione

Cloudflare Workers con file statici: collegare il repository, ramo `main`, comando di deploy `npx wrangler deploy`.
