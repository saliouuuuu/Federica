"""Genera public/index.html da src/index.src.html espandendo i segnaposto delle immagini.
{{pic:nome|sizes|alt|eager}}  ->  <picture> con WebP 480/800/1200 e JPG 800 di riserva
{{pf:nome|titolo|alt}}        ->  voce del portfolio (bottone che apre la foto grande)
"""
import re, pathlib
src = pathlib.Path('src/index.src.html').read_text(encoding='utf-8')

def pic(name, sizes, alt, eager=False):
    ss = ', '.join(f'assets/img/{name}-{w}.webp {w}w' for w in (480, 800, 1200))
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    return (f'<picture><source type="image/webp" srcset="{ss}" sizes="{sizes}">'
            f'<img src="assets/img/{name}-800.jpg" width="800" height="1067" alt="{alt}" {load}></picture>')

def repl_pic(m):
    parts = m.group(1).split('|')
    return pic(parts[0], parts[1], parts[2], len(parts) > 3 and parts[3] == 'eager')

def repl_pf(m):
    name, title, alt = m.group(1).split('|')
    return (f'<figure class="pf-item"><button type="button" data-cursor="vedi" data-full="assets/img/{name}-1200.webp" data-title="{title}" aria-label="Apri la foto: {title}">'
            f'<div class="ph">{pic(name, "(min-width: 900px) 26vw, 76vw", alt)}</div></button>'
            f'<figcaption class="pf-cap"><span>{title}</span></figcaption></figure>')

out = re.sub(r'\{\{pic:([^}]+)\}\}', repl_pic, src)
out = re.sub(r'\{\{pf:([^}]+)\}\}', repl_pf, out)
assert '{{' not in out
pathlib.Path('public/index.html').write_text(out, encoding='utf-8')
print('ok', len(out))
