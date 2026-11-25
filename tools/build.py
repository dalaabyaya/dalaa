#!/usr/bin/env python3
"""Builds the static HTML pages (shared header/footer + page bodies).
Run from the project root:  python3 tools/build.py
Product and settings data are NOT here: edit data/products.js and data/settings.js.
"""
import os
import random
import re
import hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = ("https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Birthstone&"
         "family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500&display=swap")

ICON = {
    "search": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    "user": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c.6-3.6 3.7-5.5 7.5-5.5s6.9 1.9 7.5 5.5"/></svg>',
    "bag": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l-1 12h-11z"/><path d="M9 8V6.5a3 3 0 016 0V8"/></svg>',
    "menu": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>',
    "close": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
}

def head(title, desc, extra="", bodyclass=""):
    return f"""<!doctype html>
<html lang="en-AU" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/img/logo-pink.png">
<meta name="theme-color" content="#B00870">
<link rel="icon" type="image/png" href="assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="css/main.css">
{extra}</head>
<body{bodyclass}>
<a class="skip" href="#main">Skip to content</a>
<div class="announce" id="announce" role="region" aria-label="Announcement"><span class="arabic" lang="ar" dir="rtl">دلعي نفسك</span></div>
<header class="header">
  <div class="wrap">
    <button class="icon-btn menu-btn" id="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="nav">{ICON['menu']}</button>
    <a class="brand" href="index.html" aria-label="Dalaa by Aya, home"><img src="assets/img/logo-pink-sm.png" alt="Dalaa by Aya" width="133" height="140"></a>
    <nav class="nav" id="nav" aria-label="Main">
      <button class="icon-btn nav-close" id="nav-close" aria-label="Close menu">{ICON['close']}</button>
      <a href="index.html">Home</a><a href="shop.html">Shop</a><a href="story.html">Our Story</a>
    </nav>
    <div class="icons">
      <button class="icon-btn" data-open="search" aria-label="Search">{ICON['search']}</button>
      <div style="position:relative">
        <button class="icon-btn" data-open="account" aria-label="Account" aria-expanded="false">{ICON['user']}</button>
        <div class="pop" id="account-pop" role="dialog" aria-label="Account"><span class="script">Hello, gorgeous</span>
          Customer accounts switch on when the store goes live. Until then you can shop as a guest, or <a class="link-u" style="font-size:11px" href="info.html#contact">get in touch</a> about an order.</div>
      </div>
      <button class="icon-btn" data-open="cart" aria-label="Open shopping bag">{ICON['bag']}<span class="count" data-cart-count data-n="0">0</span></button>
    </div>
  </div>
</header>
"""

def chrome_layers():
    return f"""
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="cart" aria-hidden="true" aria-label="Shopping bag">
  <header><h2>Your bag</h2><button class="icon-btn" data-close aria-label="Close bag">{ICON['close']}</button></header>
  <div class="body" id="cart-body"></div>
  <footer id="cart-foot" hidden>
    <div class="sub"><span>Subtotal</span><strong id="cart-sub">—</strong></div>
    <p class="note" id="cart-note"></p>
    <p class="notice" id="cart-notice" hidden></p>
    <button class="btn btn-primary" id="checkout-btn" disabled>Checkout opens soon</button>
  </footer>
</aside>
<div class="search-panel" id="search" aria-hidden="true" role="dialog" aria-label="Search">
  <div class="wrap">
    <form id="search-form" class="big" role="search"><label class="sr-only" for="search-input">Search the collection</label>
      <input id="search-input" type="search" placeholder="Search the collection…" autocomplete="off">
      <button class="icon-btn" type="button" data-close aria-label="Close search">{ICON['close']}</button></form>
    <div class="sresults" id="search-results"></div>
  </div>
</div>
<div class="modal" id="sizeguide" aria-hidden="true" role="dialog" aria-label="Size guide">
  <button class="icon-btn x" data-close aria-label="Close size guide">{ICON['close']}</button>
  <h2>Size guide</h2><div id="sg-body"></div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
"""

def news_footer():
    return """
<footer class="footer">
  <div class="wrap">
    <div class="cols">
      <div>
        <span class="logo-card"><img src="assets/img/logo-pink-sm.png" alt="Dalaa by Aya" loading="lazy"></span>
        <p class="tagline">Modesty at your own accord.</p>
        <p style="font-size:14px;color:rgba(255,248,241,.75)" data-loc>Melbourne, Victoria, Australia</p>
      </div>
      <div><h4>Explore</h4><ul><li><a href="shop.html">Shop</a></li><li><a href="story.html">Our Story</a></li><li><a href="info.html#contact">Contact</a></li></ul></div>
      <div><h4>Help</h4><ul><li><a href="info.html#shipping">Shipping &amp; Returns</a></li><li><a href="info.html#faqs">FAQs</a></li></ul>
        <div class="social" style="margin-top:22px"><a data-social="instagram" href="#" rel="noopener" target="_blank">Instagram</a><a data-social="tiktok" href="#" rel="noopener" target="_blank">TikTok</a></div></div>
      <div><h4>Letters from Dalaa</h4>
        <form class="nform-s" data-newsletter novalidate><label class="sr-only" for="fn-email">Email address</label><input id="fn-email" type="email" name="email" placeholder="Your email" autocomplete="email"><button type="submit">Join</button></form>
        <p class="form-msg" role="status" aria-live="polite"></p></div>
    </div>
    <div class="base"><span>© 2026 Dalaa by Aya. Handmade with love in Melbourne, Australia.</span><span>All prices in AUD</span></div>
  </div>
</footer>
<script src="data/settings.js"></script>
<script src="data/products.js"></script>
<script src="js/app.js"></script>
"""

def newsletter():
    return """
<section class="news" aria-labelledby="news-h">
  <img class="kiss-l" src="assets/img/kiss.png" alt="" loading="lazy"><img class="kiss-r" src="assets/img/kiss.png" alt="" loading="lazy">
  <div class="wrap rv">
    <span class="script" style="font-size:48px;display:block">xo</span>
    <h2 id="news-h">Letters from Dalaa, gorgeous ♡</h2>
    <p>Be the first to know about new drops, exclusive releases and a little Dalaa magic.</p>
    <div><form class="nform" data-newsletter novalidate><label class="sr-only" for="nl-email">Email address</label><input id="nl-email" type="email" name="email" placeholder="Your email address" autocomplete="email"><button class="btn btn-primary" type="submit">Subscribe</button></form>
    <p class="form-msg" role="status" aria-live="polite"></p></div>
  </div>
</section>
"""

def ph(slot, label, cls="", alt=""):
    return (f'<div class="ph {cls}" data-slot="{slot}" data-alt="{alt}"><img class="ph-kiss" src="assets/img/kiss.png" alt="">'
            f'<span class="ph-label">{label}</span></div>')

def _ver(path):
    """Short content hash, so browsers re-download a CSS/JS file whenever it changes."""
    try:
        with open(os.path.join(ROOT, path), "rb") as f:
            return hashlib.md5(f.read()).hexdigest()[:8]
    except OSError:
        return None

def write(name, html):
    def bust(m):
        v = _ver(m.group(2))
        return f'{m.group(1)}="{m.group(2)}?v={v}"' if v else m.group(0)
    html = re.sub(r'(href|src)="((?:css|js|data)/[^"?#]+\.(?:css|js))"', bust, html)
    with open(os.path.join(ROOT, name), "w", encoding="utf-8") as f:
        f.write(html)

# ------------------------------------------------------------------ HOME
phrases = ["Modest, but never ordinary", "Handmade in Melbourne", "A little extra never hurt", "Blending in was never an option", "Pretty things for girls with personality"]
tick = "".join(f'<span>{p}</span><img src="assets/img/kiss.png" alt="">' for p in phrases)

home = head("Dalaa by Aya | Handmade modest fashion, Melbourne",
            "Handmade modest clothing from Melbourne. Dresses and full-length tops with more colour, more character and more you. Modesty at your own accord.") + f"""
<main id="main">
<section class="hero">
  <div class="wrap">
    <div class="rv">
      <span class="eyebrow">Handmade modest fashion · Melbourne</span>
      <h1>Modesty at your own <em>accord.</em></h1>
      <p class="lead">For the girls who like a little extra. Modest, but never ordinary.</p>
      <div class="ctas"><a class="btn btn-primary" href="shop.html">Shop the collection</a><a class="link-u" href="story.html">Get to know Dalaa</a></div>
    </div>
    <div class="hero-visual rv">
      <span class="script script-float" style="font-size:58px">gorgeous</span>
      {ph("hero", "Campaign photo goes here", "hero-photo", "Sewing pattern laid out on a table (placeholder photo)")}
      <img class="sticker" src="assets/img/kiss.png" alt="">
      <div class="badge-circle"><div><b>handmade</b>in Melbourne</div></div>
    </div>
  </div>
</section>
<div class="ticker" aria-hidden="true"><div class="ticker-track">{tick}{tick}{tick}{tick}</div></div>

<section class="intro">
  <img class="frame-orn l" src="assets/img/kiss.png" alt=""><img class="frame-orn r" src="assets/img/kiss.png" alt="">
  <div class="wrap rv">
    <span class="eyebrow">Meet Dalaa · <span class="arabic" style="font-size:18px;letter-spacing:0">دلع</span></span>
    <h2 style="margin-top:20px">Not your usual <em>modest</em> wardrobe.</h2>
    <p>We believe modesty should never come at the expense of self-expression. Dalaa was created for the girls who want more character and individuality in their wardrobe.</p>
    <p class="closing">Because blending in was never an option.</p>
  </div>
</section>

<section class="s" style="padding-top:20px" aria-labelledby="coll-h">
  <div class="wrap">
    <div class="s-head rv"><div><span class="script kicker-script">a little treat for yourself</span><h2 id="coll-h">Shop the collection</h2></div><a class="btn btn-ghost" href="shop.html">Shop all</a></div>
    <div class="grid" id="featured-grid"></div>
  </div>
</section>

<section class="s energy" aria-labelledby="en-h">
  <div class="wrap">
    <div class="center rv" style="margin-bottom:48px"><span class="eyebrow">A little Dalaa energy</span><h2 id="en-h" class="sr-only">A little Dalaa energy</h2></div>
    <div class="bento rv">
      <div class="tile t1"><img class="kiss-d" src="assets/img/kiss.png" alt=""><h3><em>A little extra</em>never hurt.</h3></div>
      <div class="tile t2"><span class="script">Dalaa</span><h3>Covered, confident &amp; a little spoiled.</h3></div>
      <div class="tile t3">{ph("energyA", "Photo", "", "")}</div>
      <div class="tile t4">{ph("energyB", "Photo", "t-fuchsia", "")}</div>
      <div class="tile t5"><span class="script">always</span><h3>Special clothing for a special soul.</h3></div>
      <div class="tile t6"><h3>Pretty things for girls with personality.</h3><img class="kiss-s" src="assets/img/kiss.png" alt=""></div>
    </div>
  </div>
</section>

<section class="s story-prev" aria-labelledby="sp-h">
  <div class="wrap">
    <div class="vis rv">{ph("storyPreview", "Your photo goes here", "arch", "Aya, founder of Dalaa")}<img class="logo-b" src="assets/img/logo-black-sm.png" alt="Dalaa in Arabic calligraphy, دلع" loading="lazy"></div>
    <div class="rv">
      <span class="eyebrow">Our story</span>
      <h2 id="sp-h">It started with a <em>wardrobe</em> problem.</h2>
      <blockquote>As a Muslim girl growing up in the West, alongside all the other challenges young diaspora face, came an unexpected one: shopping. Years later, I took matters into my own hands by creating what I wanted. Clothing at my own accord.</blockquote>
      <a class="btn btn-primary" href="story.html">Read our story</a>
    </div>
  </div>
</section>
{newsletter()}
</main>
{news_footer()}
{chrome_layers()}
</body></html>
"""
write("index.html", home)

# ------------------------------------------------------------------ SHOP
shop = head("Shop the Collection | Dalaa by Aya",
            "Browse handmade modest dresses, full-length tops and more from Dalaa by Aya, Melbourne. Filter by size, colour, price and type.") + f"""
<main id="main">
<section class="page-head wrap">
  <span class="eyebrow">Handmade in Melbourne</span>
  <h1 style="margin-top:14px">The <em>collection</em></h1>
  <p>Pretty things with personality, made to be worn your way. Pick a favourite, gorgeous.</p>
</section>
<div class="wrap">
  <div class="toolbar">
    <div class="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><label class="sr-only" for="shop-q">Search products</label><input id="shop-q" type="search" placeholder="Search dresses, tops…" autocomplete="off"></div>
    <button class="btn btn-ghost filter-toggle" id="filter-open" style="padding:13px 22px">Filter<span id="filter-n"></span></button>
    <div class="tb-right"><span class="result-count" id="shop-count" aria-live="polite"></span>
      <label class="sr-only" for="shop-sort">Sort by</label>
      <select class="select" id="shop-sort"><option value="featured">Featured</option><option value="new">New arrivals</option><option value="best">Bestsellers</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="az">Name: A–Z</option></select></div>
  </div>
  <div class="shop-layout">
    <aside class="filters" id="filters" aria-label="Filters">
      <div class="filter-close"><h3>Filters</h3><button class="icon-btn" id="filter-close" aria-label="Close filters">{ICON['close']}</button></div>
      <div class="fgroup"><h3>Product type</h3><div id="f-type"></div></div>
      <div class="fgroup"><h3>Size</h3><div class="fopts" id="f-size"></div></div>
      <div class="fgroup"><h3>Colour</h3><div class="fopts" id="f-color"></div></div>
      <div class="fgroup"><h3>Price (AUD)</h3><div class="price-row"><label class="sr-only" for="pmin">Minimum price</label><input id="pmin" type="number" min="0" placeholder="Min"><span>–</span><label class="sr-only" for="pmax">Maximum price</label><input id="pmax" type="number" min="0" placeholder="Max"></div><p class="fnote" id="f-price-note"></p></div>
      <button class="btn btn-ghost" style="width:100%" data-clear>Clear all</button>
    </aside>
    <div><div class="chips" id="shop-chips"></div><div class="grid" id="shop-grid" style="grid-template-columns:repeat(3,1fr)"></div></div>
  </div>
</div>
<div style="height:100px"></div>
{newsletter()}
</main>
{news_footer()}
<style>@media (max-width:1100px){{#shop-grid{{grid-template-columns:repeat(2,1fr)!important}}}}@media (max-width:420px){{#shop-grid{{gap:28px 10px}}}}</style>
<script src="js/shop.js"></script>
{chrome_layers()}
</body></html>
"""
write("shop.html", shop)

# ------------------------------------------------------------------ PRODUCT
product = head("Product | Dalaa by Aya",
               "Handmade modest fashion from Dalaa by Aya, Melbourne.") + f"""
<main id="main">
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <span id="crumb-type">Product</span> / <span id="crumb-name"></span></nav>
  <div class="pdp" id="pdp-root"><div style="min-height:60vh"></div></div>
</div>
<section class="related" id="related"><div class="wrap"><h2>You might also love</h2><div class="grid" id="related-grid"></div></div></section>
</main>
{news_footer()}
<script src="js/product.js"></script>
{chrome_layers()}
</body></html>
"""
write("product.html", product)

# ------------------------------------------------------------------ STORY
def words(text, start=0):
    return " ".join(f'<span class="w" style="--i:{start + i}"><span>{w}</span></span>' for i, w in enumerate(text.split()))

_r = random.Random(11)
sparks = "".join(
    f'<i class="spark" style="left:{_r.randint(4, 96)}%;top:{_r.randint(6, 90)}%;--s:{_r.choice([2, 3, 3, 4])}px;'
    f'--t:{_r.uniform(3, 6.5):.1f}s;--dl:{_r.uniform(0, 5):.1f}s"></i>' for _ in range(22))

def drift(cls, speed, rot, r0, o, style=""):
    return (f'<span class="drift {cls}" data-speed="{speed}" data-rot="{rot}" aria-hidden="true" style="{style}">'
            f'<img src="assets/img/kiss-glow.png" alt="" style="--r0:{r0}deg;--o:{o}"></span>')

STORY_EXTRA = ('<link rel="stylesheet" href="css/story.css">\n'
               '<script>(function(){var d=document.documentElement;d.classList.add("story-ready");'
               'if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("story-calm");'
               'setTimeout(function(){if(!window.__storyOK)d.classList.remove("story-ready")},3500)})()</script>\n')

story = head("Our Story | Dalaa by Aya",
             "Dalaa by Aya started with a wardrobe problem: stylish, full-coverage clothes that weren't beige. Read why Aya started making what she wanted to wear.",
             extra=STORY_EXTRA, bodyclass=' class="story-dark"') + f"""
<div class="thread" aria-hidden="true"><i></i></div>
<div class="spot" aria-hidden="true"></div>
<main id="main">
<section class="story-hero">
  <div class="glow g1" aria-hidden="true"></div>
  {sparks}
  {drift("d-hero-a", 0.16, 30, -18, 0.34)}
  {drift("d-hero-b", -0.12, -24, 16, 0.26)}
  <div class="wrap">
    <span class="eyebrow sx">Our story</span>
    <h1 class="sx split">{words("Not just another")} <em class="w" style="--i:3"><span>modest</span></em> {words("clothing label.", 4)}</h1>
    <p class="script byline sx" style="--d:5;font-size:44px">with love, Aya</p>
  </div>
  <div class="cue" aria-hidden="true"><span>scroll</span><i></i></div>
</section>

<section class="chapter">
  <span class="ghost" data-speed="-0.14" aria-hidden="true">i</span>
  <div class="wrap">
    <div class="vis sx">{ph("storyStruggle", "Your photo goes here", "arch", "Aya")}</div>
    <div><span class="num sx">i. The struggle</span><h2 class="sx split">{words("Shopping was the unexpected challenge.")}</h2>
      <p class="sx" style="--d:2">As a Muslim girl growing up in the West, alongside all the other challenges young diaspora face, came one I never saw coming: shopping.</p>
      <p class="sx" style="--d:3">Finding clothes with enough coverage was no easy feat. Walking into a shop and finding a stylish full-length top, or a dress that ticks every box? Nearly impossible.</p></div>
  </div>
</section>

<section class="chapter alt flip">
  <span class="ghost" data-speed="-0.14" aria-hidden="true">ii</span>
  {drift("d-ch2", 0.2, 50, 12, 0.2)}
  <div class="wrap">
    <div class="vis sx">{ph("storyFrustration", "Your photo goes here", "t-cream", "A Dalaa piece")}</div>
    <div><span class="num sx">ii. The frustration</span><h2 class="sx split">{words("The same designs. The same nudes.")}</h2>
      <p class="sx" style="--d:2">I can't deny there are other Australian modest clothing lines out there. But I'm sure we've all seen enough of the identical nude palettes across the board.</p>
      <p class="big sx" style="--d:3">We're sick of seeing the same designs over and over again.</p></div>
  </div>
</section>

<section class="pull">
  {drift("d-pull-a", -0.14, 60, 14, 0.3)}
  {drift("d-pull-b", 0.18, -50, -12, 0.22)}
  <div class="wrap"><p class="lit">Clothing at my own accord.</p></div>
</section>

<section class="chapter">
  <span class="ghost" data-speed="-0.14" aria-hidden="true">iii</span>
  <div class="glow g3" aria-hidden="true"></div>
  <div class="wrap">
    <div class="vis sx">{ph("storyHands", "Your photo goes here", "arch t-fuchsia", "Aya sewing")}</div>
    <div><span class="num sx">iii. Taking matters into my own hands</span><h2 class="sx split">{words("So I made what I wanted.")}</h2>
      <p class="sx" style="--d:2">Years later, I stopped waiting for someone else to design it. I took matters into my own hands and created the clothes I wanted to wear myself.</p>
      <p class="sx" style="--d:3">I'm sure this isn't an issue I alone face, and it's something I feel obligated to share with you all.</p></div>
  </div>
</section>

<section class="chapter alt philosophy flip">
  <span class="ghost" data-speed="-0.14" aria-hidden="true">iv</span>
  {drift("d-ch4", -0.18, -40, -14, 0.2)}
  <div class="wrap">
    <div class="vis sx">{ph("storyPhilosophy", "Your photo goes here", "t-hot", "A Dalaa piece")}</div>
    <div><span class="num sx">iv. The Dalaa philosophy</span><h2 class="sx split">{words("Modesty, on your own terms.")}</h2>
      <p class="sx" style="--d:2"><span class="arabic" style="font-size:1.2em">دلع</span> (Dalaa) is the feeling of being adored, pampered, a little spoiled and a little extra, in the best way. That's how I want you to feel in what you wear.</p>
      <p class="sx" style="--d:3">Every piece is designed with intention, individuality and an appreciation for the details. Because modesty should never mean compromising on personal style.</p></div>
  </div>
</section>

<section class="sign">
  <div class="glow g2" aria-hidden="true"></div>
  <div class="wrap">
    <span class="logo-ar sx"><img src="assets/img/logo-arabic-dark.png" alt="دلع, Dalaa by Aya, in Arabic calligraphy" width="800" height="920" loading="lazy"></span>
    <h2 class="lit">Because modesty was never meant to mean compromising on who you are.</h2>
    <span class="script welcome sx" style="--d:1">Welcome to Dalaa, gorgeous.</span>
    <div class="sx" style="--d:2"><a class="btn btn-primary btn-glow" href="shop.html">Shop the collection</a></div>
  </div>
</section>
{newsletter()}
</main>
{news_footer()}
{chrome_layers()}
<script src="js/story.js"></script>
</body></html>
"""
write("story.html", story)

# ------------------------------------------------------------------ INFO
info = head("Contact, Shipping & FAQs | Dalaa by Aya",
            "Get in touch with Dalaa by Aya, find shipping and returns information, and read answers to common questions.") + f"""
<main id="main">
<section class="page-head wrap"><span class="eyebrow">Here to help</span><h1 style="margin-top:14px">Hello, <em>gorgeous</em></h1><p>Questions about a piece, sizing or an order? We'd love to hear from you.</p></section>
<div class="wrap"><div class="info">

<section id="contact"><h2>Contact</h2>
  <p>Based in <span data-loc>Melbourne, Victoria, Australia</span>. Email: <a class="link-u" style="font-size:12px" data-email>Email address to be added</a></p>
  <form class="cform" id="contact-form" novalidate>
    <label>Name<input name="name" required autocomplete="name"></label>
    <label>Email<input name="email" type="email" required autocomplete="email"></label>
    <label>Message<textarea name="message" rows="5" required></textarea></label>
    <button class="btn btn-primary" type="submit">Send message</button>
    <p class="form-msg" id="contact-msg" role="status" aria-live="polite"></p>
  </form>
  <p style="margin-top:18px">Or say hi on <a class="link-u" style="font-size:12px" data-social="instagram" target="_blank" rel="noopener" href="#">Instagram</a> or <a class="link-u" style="font-size:12px" data-social="tiktok" target="_blank" rel="noopener" href="#">TikTok</a>.</p>
</section>

<section id="shipping"><h2>Shipping &amp; returns</h2>
  <dl>
    <dt>Delivery within Australia</dt><dd>Time: <span class="tbc">to be confirmed</span> · Cost: <span class="tbc">to be confirmed</span></dd>
    <dt>International shipping</dt><dd><span class="tbc">to be confirmed</span></dd>
    <dt>Handmade timing</dt><dd>Every piece is handmade in Melbourne. Made-to-order timeframes: <span class="tbc">to be confirmed</span></dd>
    <dt>Returns &amp; exchanges</dt><dd>Return window: <span class="tbc">to be confirmed</span>. Conditions: <span class="tbc">to be confirmed</span></dd>
    <dt>Your rights</dt><dd>Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage.</dd>
  </dl>
</section>

<section id="faqs"><h2>FAQs</h2>
  <div class="acc">
    <details><summary>Is Dalaa really handmade?</summary><div class="acc-body"><p>Yes. Dalaa is a handmade modest clothing brand based in Melbourne, Australia.</p></div></details>
    <details><summary>How do I find my size?</summary><div class="acc-body"><p>Open the size guide on any product page. <span class="tbc">measurements to be added</span></p></div></details>
    <details><summary>Can I place an order right now?</summary><div class="acc-body"><p>Online checkout isn't switched on yet. Join the newsletter or follow along on Instagram to hear the moment it is.</p></div></details>
    <details><summary>What do I do if something isn't right with my order?</summary><div class="acc-body"><p>Get in touch using the form above and we'll sort it out together.</p></div></details>
  </div>
</section>
</div></div>
{newsletter()}
</main>
{news_footer()}
{chrome_layers()}
</body></html>
"""
write("info.html", info)
print("built: index, shop, product, story, info")
