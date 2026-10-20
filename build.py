"""Genera public/index.html da src/index.src.html espandendo i segnaposto delle immagini.
{{pic:nome|sizes|alt|eager}}       ->  <picture> con WebP e JPG di riserva
{{pf:nome|titolo|etichetta|alt}}   ->  card del portfolio (bottone che apre la foto grande)
"""
import re, pathlib
src = pathlib.Path('src/index.src.html').read_text(encoding='utf-8')

# larghezze disponibili e proporzioni (larghezza, altezza del JPG da 800 o dell'unico JPG)
DEFAULT = ((480, 800, 1200), 800, 800, 1067)
SPECIAL = {
    'federica-al-lavoro': ((480, 660), 660, 660, 1020),
}
def spec(name):
    if name in SPECIAL: return SPECIAL[name]
    if name.startswith('palazzo-'): return ((480, 800, 1200), 800, 800, 800)
    return DEFAULT

def pic(name, sizes, alt, eager=False):
    widths, jpgw, w, h = spec(name)
    ss = ', '.join(f'assets/img/{name}-{x}.webp {x}w' for x in widths)
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    return (f'<picture><source type="image/webp" srcset="{ss}" sizes="{sizes}">'
            f'<img src="assets/img/{name}-{jpgw}.jpg" width="{w}" height="{h}" alt="{alt}" {load}></picture>')

def full(name):
    return f'assets/img/{name}-{spec(name)[0][-1]}.webp'

def repl_pic(m):
    parts = m.group(1).split('|')
    return pic(parts[0], parts[1], parts[2], len(parts) > 3 and parts[3] == 'eager')

def repl_pf(m):
    name, title, chip, alt = m.group(1).split('|')
    return (f'<figure class="pf-item"><button type="button" data-cursor="vedi" data-full="{full(name)}" data-title="{title}">'
            f'<div class="ph">{pic(name, "(min-width: 900px) 19rem, 58vw", alt)}<span class="pf-chip">{chip}</span>'
            f'<figcaption class="pf-cap">{title}<span class="sr">, apri la foto</span></figcaption></div></button></figure>')

out = re.sub(r'\{\{pic:([^}]+)\}\}', repl_pic, src)
out = re.sub(r'\{\{pf:([^}]+)\}\}', repl_pf, out)
assert '{{' not in out
pathlib.Path('public/index.html').write_text(out, encoding='utf-8')
print('ok', len(out))
