"""Build the design portfolio pages from tools/design-projects.json.

    python tools/build_design_pages.py            # pages only
    python tools/build_design_pages.py --images   # also rebuild marquee tiles and share images (needs Pillow)

How the portfolio is organised:
  * every design has a TYPE of work (post, logo, flyer, ui, packaging, stationery, banner, illustration)
  * every design belongs to a PROJECT, which is either one brand's work or a mixed collection

Pages written:
  designs.html                 design home: one section per type, then complete brands, then every project
  designs/<type page>.html     everything of one type, grouped by brand (posts, logos, brochures, ui, ...)
  designs/<project>.html       one brand or collection, split into sections by type
  sitemap.xml

Design images live in assets/designs/<slug>/NN.webp (full) and NNt.webp (thumbnail).
"""
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
VER = "2026.16"
DATA = json.load(open(os.path.join(HERE, "design-projects.json"), encoding="utf-8"))
SITE = DATA["site"]
PROJECTS = DATA["projects"]
BY_SLUG = {p["slug"]: p for p in PROJECTS}
TYPES = DATA["types"]
TYPE = {t["key"]: t for t in TYPES}
# On a brand page the identity comes first, then how it was applied.
BRAND_ORDER = ["logo", "stationery", "packaging", "post", "flyer", "banner", "ui", "illustration"]
TOTAL = sum(len(p["items"]) for p in PROJECTS)
WA = "https://wa.me/923263400018?text=" + "Hello%20Zaheer%2C%20I%20saw%20your%20design%20portfolio%20and%20would%20like%20to%20discuss%20a%20project."
MAIL = "mailto:zaheeruldin978@gmail.com?subject=Design%20project%20inquiry"
FONTS = ("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600"
         "&family=Space+Grotesk:wght@500;600;700&display=swap")
e = html.escape


# ---------- small helpers ----------
def thumb(root, slug, n):
    return f"{root}assets/designs/{slug}/{n:02d}t.webp"


def full(root, slug, n):
    return f"{root}assets/designs/{slug}/{n:02d}.webp"


def dims(p, n):
    return p["items"][n - 1]


def ratio(p, n):
    return dims(p, n)[0] / dims(p, n)[1]


def of_type(p, key):
    """1-based numbers of the designs in project p that are of this type."""
    return [i + 1 for i, t in enumerate(p["types"]) if t == key]


def types_in(p, order=None):
    return [k for k in (order or [t["key"] for t in TYPES]) if k in p["types"]]


def count_label(n, t):
    return f'{n} {t["one"] if n == 1 else t["many"]}'


def type_total(key):
    return sum(p["types"].count(key) for p in PROJECTS)


def trio_for(p):
    if p.get("trio"):
        return p["trio"]
    everything = [p["cover"]] + [i for i in range(1, len(p["items"]) + 1) if i != p["cover"]]
    big = next((i for i in everything if 0.68 <= ratio(p, i) <= 1.3), p["cover"])
    rest = [i for i in everything if i != big]
    good = [i for i in rest if 0.8 <= ratio(p, i) <= 2.2] or rest
    picks = (good + rest)[:2]
    while len(picks) < 2:
        picks.append(big)
    return [big] + picks


# ---------- page frame ----------
def head(title, desc, path, og, root, accent=None, html_attrs=""):
    style = f' style="--accent:{accent}"' if accent else ""
    return f'''<!doctype html>
<html lang="en"{html_attrs}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#06070b">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <link rel="canonical" href="{SITE}{path}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:url" content="{SITE}{path}">
  <meta property="og:image" content="{SITE}{og}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <script>document.documentElement.classList.add('js')</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="{FONTS}" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="{FONTS}"></noscript>
  <link rel="stylesheet" href="{root}assets/design.css?v={VER}">
  <link rel="icon" type="image/png" sizes="48x48" href="{root}assets/favicon-48.png">
  <link rel="apple-touch-icon" href="{root}assets/apple-touch-icon.png">
</head>
<body{style}>
  <a class="skip" href="#main">Skip to content</a>
'''


def header(root, current=""):
    def cur(name):
        return ' aria-current="page"' if name == current else ""
    home = f"{root}designs.html"
    return f'''  <header class="dh">
    <a class="brand" href="{home}" aria-label="Zaheer Malik design portfolio, home">
      <b>Z<i>.</i></b> ZAHEER MALIK <small>DESIGN</small>
    </a>
    <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="dnav">
      <span></span><span></span><span></span>
    </button>
    <nav class="dnav" id="dnav" aria-label="Design portfolio">
      <a href="{home}#types"{cur("types")}>By type</a>
      <a href="{home}#brands"{cur("brands")}>Brands</a>
      <a href="{home}#work">All work</a>
      <a href="#contact">Contact</a>
      <a href="{root}index.html">Developer portfolio &nearr;</a>
    </nav>
    <a class="btn btn-solid" href="{WA}" target="_blank" rel="noopener">Start a project</a>
  </header>
'''


def cta(root):
    return f'''    <section class="wrap" id="contact">
      <div class="cta rv">
        <p class="label">Start a project</p>
        <h2>Have something that needs designing?</h2>
        <p>Tell me what you are making and when you need it. A short message is enough to get started.</p>
        <div class="cta-actions">
          <a class="btn btn-wa" href="{WA}" target="_blank" rel="noopener">Chat on WhatsApp <span class="arr">&nearr;</span></a>
          <a class="btn btn-ghost" href="{MAIL}">zaheeruldin978@gmail.com</a>
        </div>
      </div>
    </section>
'''


def footer(root):
    type_links = "".join(f'<a href="{root}designs/{t["page"]}.html">{e(t["short"])}</a>' for t in TYPES)
    return f'''  <footer class="df wrap">
    <a class="brand" href="{root}designs.html"><b>Z<i>.</i></b> ZAHEER MALIK</a>
    <nav aria-label="Types of work">{type_links}</nav>
    <nav aria-label="Elsewhere">
      <a href="{root}index.html">Developer portfolio</a>
      <a href="https://www.linkedin.com/in/zaheer-ul-din-babar/" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://www.instagram.com/zaheeruldin978" target="_blank" rel="noopener">Instagram</a>
      <a href="https://github.com/zaheeruldinbabar" target="_blank" rel="noopener">GitHub</a>
    </nav>
    <small>&copy; <span id="year">2026</span> Muhammad Zaheer Ul Din Babar. Gujranwala, Pakistan.</small>
  </footer>
'''


def tail(root, title="Design"):
    return f'''  <div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Full size design" data-title="{e(title)}" hidden>
    <div class="lb-bar">
      <div class="lb-count" id="lbCount" aria-live="polite"></div>
      <button type="button" class="lb-x" id="lbClose">Close &#10005;</button>
    </div>
    <div class="lb-stage" id="lbStage">
      <button type="button" class="lb-arrow lb-prev" id="lbPrev" aria-label="Previous design">&lsaquo;</button>
      <img id="lbImg" alt="">
      <button type="button" class="lb-arrow lb-next" id="lbNext" aria-label="Next design">&rsaquo;</button>
    </div>
  </div>
  <script src="{root}assets/design.js?v={VER}" defer></script>
</body>
</html>
'''


# ---------- building blocks ----------
def shot(p, i, root, cls="jg-item", eager=False):
    """One design as a link that opens it full size."""
    a, b, fw, fh = dims(p, i)
    r = round(a / b, 4)
    t = TYPE[p["types"][i - 1]]
    cap = f'{p["title"]} · {t["name"]}'
    desk, tab, mob = min(1320, round(r * 380)), min(860, round(r * 280)), min(360, round(r * 190))
    load = "" if eager else ' loading="lazy"'
    # Sample strips are small, so the thumbnail alone is enough there.
    responsive = "" if cls == "strip-item" else (
        f' srcset="{thumb(root, p["slug"], i)} {a}w, {full(root, p["slug"], i)} {fw}w" '
        f'sizes="(max-width: 620px) {mob}px, (max-width: 900px) {tab}px, {desk}px"')
    return (f'<a class="{cls}" href="{full(root, p["slug"], i)}" data-full="{full(root, p["slug"], i)}" data-w="{fw}" data-h="{fh}" '
            f'data-cap="{e(cap)}" style="--r:{r}" aria-label="Open full size: {e(cap)}">'
            f'<img src="{thumb(root, p["slug"], i)}"{responsive} width="{a}" height="{b}" '
            f'alt="{e(p["title"])}, {e(t["name"])}"{load} decoding="async"></a>')


def gallery(p, nums, root, eager=0):
    rows = "\n".join("        " + shot(p, i, root, eager=(k < eager)) for k, i in enumerate(nums))
    return f'      <div class="jg">\n{rows}\n      </div>'


def type_chips(p, root, linked=False):
    out = []
    for k in types_in(p, BRAND_ORDER):
        t, n = TYPE[k], p["types"].count(k)
        label = f'{e(t["short"])} <b>{n}</b>'
        out.append(f'<a href="#{t["page"]}">{label}</a>' if linked else f"<i>{label}</i>")
    return "".join(out)


def visual(p, root):
    a, b, c = trio_for(p)
    slug = p["slug"]
    tw, th, fw, fh = dims(p, a)
    small = "".join(
        f'<img src="{thumb(root, slug, i)}" width="{dims(p, i)[0]}" height="{dims(p, i)[1]}" alt="" loading="lazy" decoding="async">'
        for i in (b, c))
    return (f'<img src="{thumb(root, slug, a)}" srcset="{thumb(root, slug, a)} {tw}w, {full(root, slug, a)} {fw}w" '
            f'sizes="(max-width: 900px) 58vw, 30vw" width="{tw}" height="{th}" alt="" loading="lazy" decoding="async">{small}')


def brand_card(p, root):
    n = len(p["items"])
    return f'''        <a class="brand-card rv" href="{root}designs/{p["slug"]}.html" style="--accent:{p["accent"]}" aria-label="{e(p["title"])}: complete brand work, {n} designs">
          <span class="feat-visual">{visual(p, root)}</span>
          <span class="brand-body">
            <span class="brand-top"><span class="brand-title">{e(p["title"])}</span><span class="brand-go" aria-hidden="true">&nearr;</span></span>
            <span class="brand-kind">{e(p["kind"])}</span>
            <span class="brand-types">{type_chips(p, root)}</span>
          </span>
        </a>'''


def card(p, root, span=4):
    c = p["cover"]
    tw, th, fw, fh = dims(p, c)
    sizes = {4: "31vw", 5: "39vw", 7: "56vw"}[span]
    n = len(p["items"])
    kinds = " · ".join(TYPE[k]["short"] for k in types_in(p, BRAND_ORDER)[:3])
    return f'''        <a class="card rv" href="{root}designs/{p["slug"]}.html" data-types="{" ".join(types_in(p))}" data-span="{span}" style="--accent:{p["accent"]}">
          <span class="card-media">
            <img src="{thumb(root, p["slug"], c)}" srcset="{thumb(root, p["slug"], c)} {tw}w, {full(root, p["slug"], c)} {fw}w" sizes="(max-width: 620px) 46vw, (max-width: 900px) 46vw, {sizes}" width="{tw}" height="{th}" alt="" loading="lazy" decoding="async">
            <span class="card-count">{n} design{"s" if n != 1 else ""}</span>
            <span class="card-go" aria-hidden="true">&nearr;</span>
          </span>
          <span class="card-body">
            <span><span class="card-title">{e(p["title"])}</span><span class="card-kind">{e(p["kind"])}</span></span>
            <span class="card-cat">{e(kinds)}</span>
          </span>
        </a>'''


def preview_picks(key, limit=12):
    """Spread the home-page preview across brands: one from each, then a second from each, and so on."""
    pools = [(p, of_type(p, key)) for p in PROJECTS if key in p["types"]]
    picks, depth = [], 0
    while len(picks) < limit and any(depth < len(nums) for _, nums in pools):
        for p, nums in pools:
            if depth < len(nums) and len(picks) < limit:
                picks.append((p, nums[depth]))
        depth += 1
    return picks


def marquee(root, tiles):
    rows = []
    for r, row in enumerate(DATA["marquee"]):
        cells = []
        for dup in (0, 1):
            for slug, n in row:
                p = BY_SLUG[slug]
                key = f"{slug}-{n:02d}"
                if key in tiles:
                    src, w, h = f"{root}assets/designs/strip/{key}.webp", tiles[key][0], tiles[key][1]
                else:
                    src, (w, h) = thumb(root, slug, n), dims(p, n)[:2]
                hidden = ' aria-hidden="true" tabindex="-1"' if dup else f' aria-label="{e(p["title"])}"'
                cells.append(f'<a class="mq-tile" href="{root}designs/{slug}.html"{hidden}><img src="{src}" width="{w}" height="{h}" alt="" decoding="async"></a>')
        rows.append(f'        <div class="mq{" rev" if r else ""}"><div class="mq-track">{"".join(cells)}</div></div>')
    return "\n".join(rows)


# ---------- pages ----------
def build_home(tiles):
    root = ""
    pattern = [7, 5, 4, 4, 4, 5, 7, 4, 4, 4]
    cards = "\n".join(card(p, root, pattern[i % len(pattern)]) for i, p in enumerate(PROJECTS))
    brands = "\n".join(brand_card(BY_SLUG[s], root) for s in DATA["complete_brands"])

    jump = "".join(f'<a href="#{t["page"]}">{e(t["short"])} <b>{type_total(t["key"])}</b></a>' for t in TYPES)
    sections = []
    for n, t in enumerate(TYPES, 1):
        total = type_total(t["key"])
        owners = [p for p in PROJECTS if t["key"] in p["types"]]
        picks = preview_picks(t["key"])
        items = "".join(shot(p, i, root, cls="strip-item") for p, i in picks)
        rest = total - len(picks)
        more = (f'<a class="strip-more" href="designs/{t["page"]}.html"><b>+{rest}</b><span>See all {e(t["many"])}</span></a>'
                if rest > 0 else "")
        where = f'{len(owners)} brand{"s" if len(owners) != 1 else ""} and collection{"s" if len(owners) != 1 else ""}' if len(owners) > 1 else e(owners[0]["title"])
        sections.append(f'''    <section class="sec wrap type-sec" id="{t["page"]}">
      <div class="sec-head">
        <div class="rv"><p class="label">{n:02d} / Type of work</p><h2>{e(t["name"])}</h2></div>
        <div class="rv type-meta">
          <p><strong>{count_label(total, t)}</strong> from {where}. {e(t["desc"])}</p>
          <a class="btn btn-ghost" href="designs/{t["page"]}.html">See all {count_label(total, t)} <span class="arr">&nearr;</span></a>
        </div>
      </div>
      <div class="strip rv" role="group" aria-label="{e(t["name"])}: a sample, scroll sideways for more">{items}{more}</div>
    </section>
''')

    filters = [f'        <button type="button" class="filter" data-filter="all" aria-pressed="true">All <sup>{len(PROJECTS)}</sup></button>']
    for t in TYPES:
        c = sum(1 for p in PROJECTS if t["key"] in p["types"])
        filters.append(f'        <button type="button" class="filter" data-filter="{t["key"]}" aria-pressed="false">{e(t["short"])} <sup>{c}</sup></button>')
    biggest = max(PROJECTS, key=lambda p: len(p["items"]))
    desc = (f"Graphic design portfolio of Zaheer Malik (Muhammad Zaheer Ul Din Babar): {TOTAL} designs organised by type, "
            f"from social media posts and logos to brochures, packaging and UI, plus complete brand projects.")
    slugs = ",".join(p["slug"] for p in PROJECTS)
    page = head("Design Portfolio | Zaheer Malik, Graphic Designer", desc, "designs.html", "assets/og-designs.jpg", root,
                html_attrs=f' data-projects="{slugs}"')
    page += header(root)
    page += f'''
  <main id="main">
    <section class="hero wrap">
      <span class="pill"><i></i> Adobe Certified Professional &middot; Open to new projects</span>
      <h1 class="display">Brand, campaign<br>&amp; packaging<br><em>design.</em></h1>
      <div class="hero-row">
        <p class="lead">I'm <strong>Zaheer Malik</strong>, a graphic designer in Gujranwala, Pakistan. Browse <strong>{TOTAL} designs</strong> by type of work, or open a brand to see everything made for it.</p>
        <div class="hero-actions">
          <a class="btn btn-solid" href="#types">Browse by type <span class="arr down">&darr;</span></a>
          <a class="btn btn-ghost" href="#brands">Complete brands <span class="arr down">&darr;</span></a>
        </div>
      </div>
    </section>

    <div class="mq-wrap" aria-label="A moving strip of selected designs">
{marquee(root, tiles)}
    </div>

    <section class="wrap">
      <ul class="stats">
        <li><b>{TOTAL}</b><span>designs</span></li>
        <li><b>{len(TYPES)}</b><span>types of work</span></li>
        <li><b>{len(PROJECTS)}</b><span>brands and collections</span></li>
        <li><b>{len(biggest["items"])}</b><span>posts in one campaign</span></li>
      </ul>
    </section>

    <section class="wrap jump-wrap" id="types">
      <p class="label">Browse by type of work</p>
      <nav class="jump" aria-label="Types of work">{jump}</nav>
    </section>

{"".join(sections)}
    <section class="sec wrap" id="brands">
      <div class="sec-head">
        <div class="rv"><p class="label">Complete brand work</p><h2>Brands designed from logo to launch.</h2></div>
        <p class="rv">For these brands I made more than one kind of design. Each page keeps the whole brand together: logo, posts, stationery, brochures and packaging.</p>
      </div>
      <div class="brand-grid">
{brands}
      </div>
    </section>

    <section class="sec wrap" id="work">
      <div class="sec-head">
        <div class="rv"><p class="label">All work</p><h2>Every brand and collection.</h2></div>
        <p class="rv">{len(PROJECTS)} in total. Filter by the type of work each one contains.</p>
      </div>
      <div class="filters" role="group" aria-label="Filter by type of work">
{chr(10).join(filters)}
      </div>
      <div class="grid" id="grid">
{cards}
      </div>
    </section>

    <section class="sec wrap" id="process">
      <div class="sec-head">
        <div class="rv"><p class="label">Process</p><h2>How a project runs.</h2></div>
        <p class="rv">Four simple stages, from first message to final files.</p>
      </div>
      <ol class="steps">
        <li class="rv"><b>01</b><h3>Brief</h3><p>You share the goal, the audience and any brand files you already have.</p></li>
        <li class="rv" style="--d:.08s"><b>02</b><h3>Directions</h3><p>I explore a few different directions and show them side by side.</p></li>
        <li class="rv" style="--d:.16s"><b>03</b><h3>Refine</h3><p>We pick one and tighten the type, colour and layout together.</p></li>
        <li class="rv" style="--d:.24s"><b>04</b><h3>Deliver</h3><p>You receive print-ready and web-ready files in the formats you need.</p></li>
      </ol>
    </section>

{cta(root)}  </main>

{footer(root)}{tail(root)}'''
    write("designs.html", page)


def build_type(t):
    root = "../"
    key = t["key"]
    owners = [p for p in PROJECTS if key in p["types"]]
    total = type_total(key)
    groups = []
    for g, p in enumerate(owners):
        nums = of_type(p, key)
        multi = len(types_in(p)) > 1
        link = "See the full brand" if (p["brand"] and multi) else ("Open this brand" if p["brand"] else "Open this collection")
        groups.append(f'''    <section class="group wrap" id="{p["slug"]}" style="--accent:{p["accent"]}">
      <div class="group-head rv">
        <div><p class="label no-rule">{count_label(len(nums), t)}</p><h2><a href="{p["slug"]}.html">{e(p["title"])}</a></h2></div>
        <a class="btn btn-ghost" href="{p["slug"]}.html">{link} <span class="arr">&nearr;</span></a>
      </div>
{gallery(p, nums, root, eager=3 if g == 0 else 0)}
    </section>
''')
    others = "".join(
        f'<a href="{o["page"]}.html"{" aria-current=page" if o["key"] == key else ""}>{e(o["short"])} <b>{type_total(o["key"])}</b></a>'
        for o in TYPES)
    title = f'{t["name"]} | Zaheer Malik Design Portfolio'
    desc = f'{count_label(total, t).capitalize()} by Zaheer Malik across {len(owners)} brands and collections. {t["desc"]}'
    page = head(title, desc, f'designs/{t["page"]}.html', f'assets/designs/{owners[0]["slug"]}/og.jpg', root, accent=owners[0]["accent"])
    page += header(root, "types")
    page += f'''
  <main id="main">
    <section class="ph wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="{root}designs.html">Design work</a><span>/</span><span>{e(t["short"])}</span></nav>
      <p class="label ph-kind">Type of work</p>
      <h1 class="display-2">{e(t["name"])}</h1>
      <div class="ph-row">
        <p class="ph-lead">{e(t["desc"])} Grouped by brand, so you can see how each one was handled.</p>
        <dl class="meta">
          <div><dt>Designs</dt><dd>{total}</dd></div>
          <div><dt>Brands</dt><dd>{len(owners)}</dd></div>
          <div><dt>Viewing</dt><dd>Select any piece</dd></div>
        </dl>
      </div>
      <nav class="jump" aria-label="Types of work">{others}</nav>
    </section>

{"".join(groups)}
{cta(root)}  </main>

{footer(root)}{tail(root, t["name"])}'''
    write(f'designs/{t["page"]}.html', page)


def build_project(p, idx):
    root = "../"
    slug, n = p["slug"], len(p["items"])
    c = p["cover"]
    tw, th, fw, fh = dims(p, c)
    kinds = types_in(p, BRAND_ORDER)
    multi = len(kinds) > 1
    prev_p, next_p = PROJECTS[(idx - 1) % len(PROJECTS)], PROJECTS[(idx + 1) % len(PROJECTS)]
    notes = "".join(f"<li>{e(x)}</li>" for x in p["notes"])
    chips = "".join(f"<li>{e(x)}</li>" for x in p["tags"])
    includes = ", ".join(f'<a href="{TYPE[k]["page"]}.html">{e(TYPE[k]["short"])}</a>' for k in kinds)

    sections = []
    for s, k in enumerate(kinds):
        t, nums = TYPE[k], of_type(p, k)
        sections.append(f'''    <section class="group wrap" id="{t["page"]}">
      <div class="group-head rv">
        <div><p class="label no-rule">{count_label(len(nums), t)}</p><h2>{e(t["name"])}</h2></div>
        <a class="btn btn-ghost" href="{t["page"]}.html">All {e(t["many"])} from every brand <span class="arr">&nearr;</span></a>
      </div>
{gallery(p, nums, root, eager=3 if s == 0 else 0)}
    </section>
''')
    jump = f'      <nav class="jump" aria-label="Sections on this page">{type_chips(p, root, linked=True)}</nav>\n' if multi else ""
    intro = ("Everything made for this brand, split by type of work." if p["brand"] and multi
             else "Select any piece to view it full size.")

    def pn(q, cls, word):
        qc = q["cover"]
        return (f'      <a class="pn-card {cls} rv" href="{q["slug"]}.html" style="--accent:{q["accent"]}">'
                f'<img src="{thumb(root, q["slug"], qc)}" srcset="{thumb(root, q["slug"], qc)} {dims(q, qc)[0]}w, {full(root, q["slug"], qc)} {dims(q, qc)[2]}w" sizes="(max-width: 620px) 92vw, 46vw" width="{dims(q, qc)[0]}" height="{dims(q, qc)[1]}" alt="" loading="lazy" decoding="async">'
                f'<small>{word}</small><strong>{e(q["title"])}</strong></a>')

    title = f'{p["title"]}: {p["kind"]} | Zaheer Malik Design'
    label = ("Complete brand work" if multi else "Brand project") if p["brand"] else "Collection"
    page = head(title, p["desc"], f"designs/{slug}.html", f"assets/designs/{slug}/og.jpg", root, accent=p["accent"])
    page += header(root, "brands" if p["brand"] else "")
    page += f'''
  <main id="main">
    <section class="ph wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="{root}designs.html">Design work</a><span>/</span><a href="{root}designs.html#{"brands" if p["brand"] and multi else "work"}">{"Brands" if p["brand"] else "Collections"}</a><span>/</span><span>{e(p["title"])}</span></nav>
      <p class="label ph-kind">{label} &middot; {e(p["kind"])}</p>
      <h1 class="display-2">{e(p["title"])}</h1>
      <div class="ph-row">
        <p class="ph-lead">{e(p["desc"])}</p>
        <dl class="meta">
          <div><dt>Includes</dt><dd>{includes}</dd></div>
          <div><dt>Pieces</dt><dd><a href="#gallery">{n} design{"s" if n != 1 else ""}</a></dd></div>
          <div><dt>Viewing</dt><dd>Select any piece</dd></div>
        </dl>
      </div>
      <div class="stage">
        <button type="button" class="stage-btn" data-full="{full(root, slug, c)}" data-w="{fw}" data-h="{fh}" aria-label="View the cover design full size">
          <img src="{full(root, slug, c)}" width="{fw}" height="{fh}" alt="{e(p["title"])}, {e(p["kind"])}" fetchpriority="high" decoding="async">
        </button>
      </div>
    </section>

    <section class="sec wrap about">
      <div class="rv">
        <p class="label">Design notes</p>
        <h2>How it holds together.</h2>
      </div>
      <div class="rv">
        <ol class="notes">{notes}</ol>
        <ul class="chips" aria-label="Deliverables">{chips}</ul>
      </div>
    </section>

    <section class="sec wrap" id="gallery">
      <div class="gal-head rv">
        <div><p class="label">The work</p><h2>All {n} piece{"s" if n != 1 else ""}{", by type" if multi else ""}.</h2></div>
        <p>{intro}</p>
      </div>
{jump}    </section>

{"".join(sections)}
    <section class="sec wrap">
      <div class="pn">
{pn(prev_p, "prev", "Previous")}
{pn(next_p, "next", "Next")}
      </div>
      <div class="all-link"><a class="btn btn-ghost" href="{root}designs.html#work">All {len(PROJECTS)} brands and collections</a></div>
    </section>

{cta(root)}  </main>

{footer(root)}{tail(root, p["title"])}'''
    write(f"designs/{slug}.html", page)


def write(rel, text):
    path = os.path.join(REPO, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)


def build_images():
    """Marquee tiles (small, fixed height) and 1200x630 share images. Needs Pillow."""
    from PIL import Image, ImageOps
    mq_dir = os.path.join(REPO, "assets", "designs", "strip")
    os.makedirs(mq_dir, exist_ok=True)
    tiles = {}
    for row in DATA["marquee"]:
        for slug, n in row:
            im = Image.open(os.path.join(REPO, "assets", "designs", slug, f"{n:02d}.webp")).convert("RGB")
            h = 380
            w = round(im.width * h / im.height)
            im = im.resize((w, h), Image.LANCZOS)
            key = f"{slug}-{n:02d}"
            im.save(os.path.join(mq_dir, key + ".webp"), "WEBP", quality=66, method=6)
            tiles[key] = [w, h]
    for p in PROJECTS:
        im = Image.open(os.path.join(REPO, "assets", "designs", p["slug"], f'{p["cover"]:02d}.webp')).convert("RGB")
        im = ImageOps.fit(im, (1200, 630), Image.LANCZOS, centering=(0.5, 0.12))
        im.save(os.path.join(REPO, "assets", "designs", p["slug"], "og.jpg"), quality=80, optimize=True, progressive=True)
    json.dump(tiles, open(os.path.join(HERE, "marquee-tiles.json"), "w", encoding="utf-8"), indent=1)
    return tiles


def main():
    tiles_path = os.path.join(HERE, "marquee-tiles.json")
    if "--images" in sys.argv:
        tiles = build_images()
    elif os.path.isfile(tiles_path):
        tiles = json.load(open(tiles_path, encoding="utf-8"))
    else:
        tiles = {}
    type_pages = {t["page"] for t in TYPES}
    for p in PROJECTS:
        assert len(p["types"]) == len(p["items"]), f'{p["slug"]}: every design needs a type'
        assert p["slug"] not in type_pages, f'{p["slug"]}: a project cannot share its address with a type page'
    build_home(tiles)
    for t in TYPES:
        build_type(t)
    for i, p in enumerate(PROJECTS):
        build_project(p, i)
    # Remove pages left over from an older structure.
    keep = {t["page"] + ".html" for t in TYPES} | {p["slug"] + ".html" for p in PROJECTS}
    out_dir = os.path.join(REPO, "designs")
    removed = [f for f in os.listdir(out_dir) if f.endswith(".html") and f not in keep]
    for f in removed:
        os.remove(os.path.join(out_dir, f))
    urls = ["", "designs.html"] + [f'designs/{t["page"]}.html' for t in TYPES] + [f'designs/{p["slug"]}.html' for p in PROJECTS]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += "".join(f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls) + "</urlset>\n"
    write("sitemap.xml", sm)
    print(f"built designs.html + {len(TYPES)} type pages + {len(PROJECTS)} brand/collection pages; "
          f"removed {removed or 'nothing'}; sitemap has {len(urls)} URLs")


if __name__ == "__main__":
    main()
