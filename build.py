"""Genera le pagine di public/ da src/pages/*.html dentro src/template.html.

Dopo ogni modifica a qualcosa in src/: python3 build.py

Una pagina in src/pages/ comincia con un blocco di impostazioni:

    ---
    title: Titolo della pagina
    description: Descrizione per i motori di ricerca
    path: /servizi          (indirizzo pubblico)
    out: servizi.html       (file generato in public/)
    nav: servizi            (voce attiva del menu)
    css: servizi            (facoltativo: public/assets/css/servizi.css)
    js: servizi             (facoltativo: public/assets/js/servizi.js)
    libs: Flip              (facoltativo: altri plugin GSAP oltre a ScrollTrigger e SplitText)
    jsonld: yes             (facoltativo: dati strutturati dell'attivita')
    ---

Nel corpo si possono usare:
  {{pic:nome|sizes|alt|eager}}   <picture> con WebP 480/800/1200 e JPG di riserva
Tutti i file di assets/css, assets/js e assets/vendor escono con ?v=<impronta>: la cache lunga
di /assets/* non serve mai file vecchi.
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SRC, OUT = ROOT / 'src', ROOT / 'public'
SITE = 'https://dominio-da-completare.example'

# larghezze disponibili, larghezza del JPG di riserva, e dimensioni dichiarate (larghezza, altezza)
DEFAULT = ((480, 800, 1200), 800, 800, 1067)
SPECIAL = {'federica-al-lavoro': ((480, 660), 660, 660, 1020)}


def spec(name):
    if name in SPECIAL:
        return SPECIAL[name]
    if name.startswith('palazzo-'):
        return ((480, 800, 1200), 800, 800, 800)
    return DEFAULT


def pic(name, sizes, alt, eager=False):
    widths, jpgw, w, h = spec(name)
    ss = ', '.join(f'/assets/img/{name}-{x}.webp {x}w' for x in widths)
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    return (f'<picture><source type="image/webp" srcset="{ss}" sizes="{sizes}">'
            f'<img src="/assets/img/{name}-{jpgw}.jpg" width="{w}" height="{h}" alt="{alt}" {load}></picture>')


def stamp(path):
    """Indirizzo di un file di public/ con l'impronta del contenuto."""
    f = OUT / path.lstrip('/')
    return f'{path}?v={hashlib.sha256(f.read_bytes()).hexdigest()[:8]}'


def split_front(text):
    m = re.match(r'---\n(.*?)\n---\n', text, re.S)
    meta = dict(re.findall(r'^(\w+):\s*(.*)$', m.group(1), re.M))
    return meta, text[m.end():]


def expand_pics(text):
    def one(m):
        p = m.group(1).split('|')
        return pic(p[0], p[1], p[2], len(p) > 3 and p[3] == 'eager')
    return re.sub(r'\{\{pic:([^}]+)\}\}', one, text)


partials = {p.stem: p.read_text(encoding='utf-8') for p in (SRC / 'partials').glob('*.html')}
template = (SRC / 'template.html').read_text(encoding='utf-8')

JSONLD = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "name": "Federica Siviero Makeup Artist",
  "description": "Makeup artist certificata: trucco sposa, corsi di self makeup e armocromia.",
  "areaServed": ["Torino", "Piemonte"],
  "foundingDate": "2015",
  "sameAs": ["https://www.instagram.com/federicasiviero_beauty/"],
  "image": "%(site)s/assets/img/og.jpg",
  "url": "%(site)s/"
}
</script>''' % {'site': SITE}

FONT_PRELOAD = ['bodoni-moda-latin-standard-normal', 'archivo-latin-400-normal', 'instrument-serif-latin-400-italic']

for page in sorted((SRC / 'pages').glob('*.html')):
    meta, body = split_front(page.read_text(encoding='utf-8'))
    nav = meta.get('nav', '')

    def partial(name):
        t = expand_pics(partials[name])
        # il menu segna la pagina corrente
        return re.sub(r'\{\{cur:(\w+)\}\}', lambda m: ' aria-current="page"' if m.group(1) == nav else '', t)

    libs = ['gsap', 'ScrollTrigger', 'SplitText'] + [x.strip() for x in meta.get('libs', '').split(',') if x.strip()] + ['lenis']
    scripts = [f'<script defer src="{stamp(f"/assets/vendor/{l}.min.js")}"></script>' for l in libs]
    scripts.append(f'<script defer src="{stamp("/assets/js/config.js")}"></script>')
    scripts.append(f'<script defer src="{stamp("/assets/js/site.js")}"></script>')
    if meta.get('js'):
        scripts.append(f'<script defer src="{stamp("/assets/js/" + meta["js"] + ".js")}"></script>')

    css = f'<link rel="stylesheet" href="{stamp("/assets/css/site.css")}">'
    if meta.get('css'):
        css += f'\n<link rel="stylesheet" href="{stamp("/assets/css/" + meta["css"] + ".css")}">'

    preload = '\n'.join(f'<link rel="preload" href="/assets/fonts/{f}.woff2" as="font" type="font/woff2" crossorigin>' for f in FONT_PRELOAD)

    out = template
    for key, val in {
        'title': meta['title'], 'description': meta['description'], 'path': meta['path'], 'nav': nav, 'site': SITE,
        'css': css, 'preload': preload, 'boot': stamp('/assets/js/boot.js'),
        'jsonld': JSONLD if meta.get('jsonld') else '', 'scripts': '\n'.join(scripts),
        'shell': partial('shell'), 'footer': partial('footer'), 'content': expand_pics(body.strip()),
    }.items():
        out = out.replace('{{' + key + '}}', val)
    assert '{{' not in re.sub(r'<script.*?</script>', '', out, flags=re.S), f'segnaposto non risolto in {page.name}'
    (OUT / meta['out']).write_text(out, encoding='utf-8')
    print('ok', meta['out'], len(out))
