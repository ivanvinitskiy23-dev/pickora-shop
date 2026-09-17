#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""One-shot: wire best-coffee-makers-2026 from microwave chrome + new body."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "how-to-choose-a-microwave-2026" / "index.html"
DST_DIR = ROOT / "best-coffee-makers-2026"
DST = DST_DIR / "index.html"

U = "https://pickora.shop/wp-content/uploads/2026/09"


def cta(url: str) -> str:
    return (
        '<p><a style="background: #FF9900; color: white; padding: 8px 14px; '
        'border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;" '
        f'href="{url}" target="_blank" rel="sponsored nofollow noopener noreferrer">'
        "Check on Amazon →</a></p>"
    )


def body_html() -> str:
    return f"""<style id="pk-mw-guide-layout">
.pk-mw-guide h2 {{ margin-top: 2.2rem; color: #15223B; }}
.pk-mw-pick {{
  margin: 40px 0;
  padding: 0 0 32px;
  border-bottom: 1px solid #e5e7eb;
}}
.pk-mw-pick:last-of-type {{ border-bottom: 0; }}
.pk-mw-pick img {{
  width: 100%;
  height: auto;
  border-radius: 14px;
  margin: 0 0 18px;
  display: block;
  box-shadow: 0 8px 24px rgba(15,23,42,0.08);
}}
.pk-mw-pick-title {{
  font-family: Montserrat, sans-serif;
  font-size: clamp(1.15rem, 2.4vw, 1.45rem);
  font-weight: 700;
  color: #15223B;
  margin: 0 0 10px;
  line-height: 1.3;
}}
.pk-mw-badge {{
  display: inline-block;
  background: #eef5fc;
  color: #2075d2;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 6px 10px;
  border-radius: 999px;
  margin: 0 0 12px;
}}
.pk-mw-cols {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin: 16px 0 18px;
}}
@media (max-width: 700px) {{
  .pk-mw-cols {{ grid-template-columns: 1fr; }}
}}
.pk-mw-box {{
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
}}
.pk-mw-box h4 {{ margin: 0 0 8px; font-size: 0.95rem; color: #15223B; }}
.pk-mw-box ul {{ margin: 0; padding-left: 1.1rem; }}
.pk-mw-box li {{ margin: 0.25rem 0; }}
.pk-mw-guide table {{ width: 100%; border-collapse: collapse; margin: 1.2rem 0 1.6rem; font-size: 0.95rem; }}
.pk-mw-guide th, .pk-mw-guide td {{ border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; vertical-align: top; }}
.pk-mw-guide th {{ background: #f1f5f9; color: #15223B; }}
.pk-mw-guide .pk-skip {{ background: #fff7ed; border-left: 4px solid #f97316; padding: 14px 16px; margin: 1.4rem 0; border-radius: 0 10px 10px 0; }}
</style>
<div class="pk-mw-guide">
<p>Most mornings do not need ten brew modes. They need hot water at the right temperature, a carafe that matches how fast you drink, and a machine that still works after a year of daily use.</p>
<p>This roundup covers seven current coffee makers — drip, SCA-style premium, capsules, and a grounds-plus-pods combo — based on specs and Amazon owner praise and complaint clusters. It is not a kitchen lab we run. If you are also upgrading nearby appliances, see our <a class="pk-inline" href="https://pickora.shop/how-to-choose-a-microwave-2026/">microwave buyer guide</a>, the <a class="pk-inline" href="https://pickora.shop/best-air-fryers-of-2026-which-one-should-you-buy/">air fryer rankings</a>, and the <a class="pk-inline" href="https://pickora.shop/home-kitchen/">Home &amp; Kitchen hub</a>.</p>

<aside class="pk-skip"><strong>Who should skip this:</strong> You need a real espresso machine with a portafilter and steam wand. You only want a bare $20–$30 drip box. You need office-scale volume past a household 14-cup pot. You refuse filters and pods and only want manual pour-over gear.</aside>

<h2>Quick comparison</h2>
<table>
<thead><tr><th>Model</th><th>Best for</th><th>Carafe</th><th>Programmable</th><th>Price band</th></tr></thead>
<tbody>
<tr><td>OXO Brew 9-Cup</td><td>Best overall drip</td><td>Thermal</td><td>Yes</td><td>$$$</td></tr>
<tr><td>Ninja Fresh Brew 12-Cup</td><td>Best value</td><td>Glass + plate</td><td>Yes</td><td>$$</td></tr>
<tr><td>Cuisinart 14-Cup</td><td>Big household</td><td>Glass + plate</td><td>Yes</td><td>$–$$</td></tr>
<tr><td>Moccamaster thermal</td><td>Premium thermal</td><td>Thermal</td><td>No</td><td>$$$$</td></tr>
<tr><td>Moccamaster KBGV Select</td><td>Premium glass SCA</td><td>Glass + plate</td><td>No</td><td>$$$$</td></tr>
<tr><td>Nespresso Vertuo Plus</td><td>Capsules</td><td>—</td><td>—</td><td>$$–$$$</td></tr>
<tr><td>Ninja DualBrew</td><td>Drip + pods</td><td>Glass</td><td>Yes</td><td>$$$</td></tr>
</tbody>
</table>

<article class="pk-mw-pick">
<img src="{U}/oxo-brew-9cup.webp" alt="9-cup drip coffee maker with thermal carafe on a warm oak kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best overall drip</span>
<h3 class="pk-mw-pick-title">1. OXO Brew 9-Cup Drip Coffee Maker</h3>
<p>Programmable SCA-style drip with a bloom cycle and a thermal carafe option. Owners who grind decent beans often say the cup beats older Ninja pots and weak full-mug K-Cups. “Cups” here are small — about two machine cups fill one normal mug.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Stronger, less bitter cup when grind and dose are right</li><li>Delay brew and simple one-knob controls</li><li>Thermal carafe avoids hot-plate “cooked” coffee</li><li>Fits under many cabinets better than bulkier 12-cup boxes</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Front knob can feel loose or flimsy</li><li>Basket valve sticking and mid-brew drip burns show up often</li><li>Reports of leftover tank water and thermal carafe seam moisture</li></ul></div>
</div>
<p><strong>Buy if</strong> you want programmable drip that tastes closer to pour-over. <strong>Skip if</strong> you hate fiddly baskets or need a huge glass pot for a crowd.</p>
{cta("https://link.amazon/B09wqVQq0")}
</article>

<article class="pk-mw-pick">
<img src="{U}/ninja-fresh-brew-12cup.webp" alt="12-cup programmable drip coffee maker with glass carafe on a cool gray counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best value</span>
<h3 class="pk-mw-pick-title">2. Ninja Fresh Brew 12-Cup Programmable</h3>
<p>Everyday drip with Classic and Rich strength, small-batch mode, and a clear removable reservoir. Many owners like the taste and how easy the tank is to fill and scrub. Paper #4 filters usually beat the included mesh for grit and clarity.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Hot coffee and a useful Rich setting</li><li>Removable tank is easy to clean and monitor</li><li>Overflow from a missing carafe tends to hit the counter, not ruin the tank path</li><li>Solid feature set for the money</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Plastic tank and lid feel light</li><li>Post-warranty leaks, clock failures, and carafe seam issues cluster in reviews</li><li>Support often goes hard-line after the warranty window</li></ul></div>
</div>
<p><strong>Buy if</strong> you want programmable 12-cup drip without SCA pricing. <strong>Skip if</strong> you expect premium longevity without budgeting for eventual wear.</p>
{cta("https://link.amazon/B0dEIVh3O")}
</article>

<article class="pk-mw-pick">
<img src="{U}/cuisinart-14cup.webp" alt="14-cup programmable coffee maker with glass carafe on a bright white kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best large household</span>
<h3 class="pk-mw-pick-title">3. Cuisinart 14-Cup Programmable (DCC-3200 family)</h3>
<p>Big glass-carafe drip with Bold brew, 1–4 cup mode, adjustable plate temperature, and a charcoal water filter. Owners upgrading from older Cuisinart models often praise hotter, more flavorful pots — if the basket is fully seated and you do not stuff the basket at true max fill.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Real capacity for guests or iced-coffee batches</li><li>Bold, timer, tone, and plate-temp controls</li><li>Sneak-a-cup works when the basket seats with a firm pop</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Overflow and grounds in the reservoir near max fill</li><li>Carafe drips if you pour too fast</li><li>Tall lid needs clearance under cabinets; thin glass</li></ul></div>
</div>
<p><strong>Buy if</strong> you need volume on a mid budget. <strong>Skip if</strong> you want thermal hold or tiny counters.</p>
{cta("https://link.amazon/B06WvuYrD")}
</article>

<article class="pk-mw-pick">
<img src="{U}/moccamaster-thermal.webp" alt="Premium thermal-carafe drip coffee maker on a dark walnut loft kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best premium thermal</span>
<h3 class="pk-mw-pick-title">4. Technivorm Moccamaster (thermal carafe)</h3>
<p>Fast, simple SCA/ECBC-style brewing into a thermal carafe. Owners chasing pour-over clarity often stay once grind is coarse enough. There is no delay brew — you grind, fill cold water, and switch on.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Excellent cup clarity and speed</li><li>Thermal hold without a hot plate</li><li>Long-life and parts stories show up often</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>High price; plastic parts surprise some buyers</li><li>Pour spout can dribble; many hand-wash pieces</li><li>No programming; fine grind risks overflow</li></ul></div>
</div>
<p><strong>Buy if</strong> coffee quality beats timer convenience and coffee sits a while. <strong>Skip if</strong> you need wake-up programming.</p>
{cta("https://link.amazon/B0giKWii2")}
</article>

<article class="pk-mw-pick">
<img src="{U}/moccamaster-kbgv.webp" alt="Premium glass-carafe drip coffee maker on a light marble counter with soft teal cabinets" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best premium glass SCA</span>
<h3 class="pk-mw-pick-title">5. Technivorm Moccamaster KBGV Select</h3>
<p>Same brew philosophy with a glass carafe and hot plate, plus a half-pot / full-pot Select switch. Great when you finish the pot quickly. Five-year warranty themes and replaceable parts are a big reason people leave short-lived midrange drip behind.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Consistently smooth, café-like drip</li><li>Half/full Select helps smaller batches</li><li>Quiet, simple, serviceable design</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>No clock or delay brew</li><li>Hand wash only; glass feels delicate</li><li>Grocery fine grind can clog or overflow</li></ul></div>
</div>
<p><strong>Buy if</strong> you drink the pot while it is fresh. <strong>Skip if</strong> you leave coffee on a plate for hours.</p>
{cta("https://link.amazon/B07zKY1r6")}
</article>

<article class="pk-mw-pick">
<img src="{U}/nespresso-vertuo-plus.webp" alt="Matte black capsule coffee machine with crema-topped mug on a minimal white counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best capsules</span>
<h3 class="pk-mw-pick-title">6. Nespresso Vertuo Plus</h3>
<p>Barcode pods set volume and brew style. Owners switching from weak large K-Cups often praise crema and one-button consistency. Capsule cost is the tax for speed.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Fast, consistent cups with real crema</li><li>Easy cleanup and compact footprint</li><li>Size options by pod without fiddling dials</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Ongoing capsule spend and locked ecosystem</li><li>Not a fresh-bean drip machine</li></ul></div>
</div>
<p><strong>Buy if</strong> convenience and crema beat grinding beans. <strong>Skip if</strong> you want cheap bulk drip from a bag of beans.</p>
{cta("https://link.amazon/B08e3tVs4")}
</article>

<article class="pk-mw-pick">
<img src="{U}/ninja-dualbrew.webp" alt="Slim black dual brew coffee system with carafe and iced drinks on a charcoal counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best drip + pods</span>
<h3 class="pk-mw-pick-title">7. Ninja DualBrew Pro / Specialty Coffee System</h3>
<p>One slim tower for ground coffee and K-Cup-style pods, often with Classic / Rich / Over Ice / Specialty modes and a side frother. Match the exact Amazon listing — DualBrew SKUs look alike but differ on carafe size, pod puncture style, and extras.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Covers mixed households without two machines</li><li>Narrow footprint; reservoir can move side or back</li><li>Independent hot-water path helps tea and oatmeal</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Listing confusion between similar model numbers</li><li>Frother often does not heat milk</li><li>Smaller carafe than some DualBrew variants</li></ul></div>
</div>
<p><strong>Buy if</strong> one person wants pods and another wants a pot. <strong>Skip if</strong> you only brew one way and can buy a simpler machine.</p>
{cta("https://link.amazon/B09gjlZdP")}
</article>

<h2>What matters when you buy</h2>
<ul>
<li><strong>Carafe type:</strong> Thermal avoids burnt plate taste; glass stays hotter for people who finish the pot fast.</li>
<li><strong>“Cup” size:</strong> Maker cups are often ~5 oz. Count mugs, not marketing cups.</li>
<li><strong>Grind:</strong> SCA drip wants medium-coarse. Fine grocery grind overflows premium baskets.</li>
<li><strong>Basket seating:</strong> A half-seated basket keeps the drip valve closed and spills grounds into the tank.</li>
<li><strong>Pods vs beans:</strong> Capsules win mornings you will not grind. Drip wins cost per cup and bean control.</li>
</ul>

<h2>Our research method</h2>
<p>We compared listed specs and repeated Amazon owner praise and complaint themes from September 2026 research. We did not run a timed kitchen lab or invent buyer quotes.</p>

<h2>Final awards</h2>
<ul>
<li><strong>Best overall drip:</strong> OXO Brew 9-Cup (thermal) — watch the basket valve</li>
<li><strong>Best value:</strong> Ninja Fresh Brew 12-Cup</li>
<li><strong>Best big pot:</strong> Cuisinart 14-Cup</li>
<li><strong>Best premium:</strong> Moccamaster thermal or KBGV Select</li>
<li><strong>Best capsules:</strong> Nespresso Vertuo Plus</li>
<li><strong>Best mixed household:</strong> Ninja DualBrew</li>
</ul>

<h2>FAQ</h2>
<h3>1. Thermal or glass carafe?</h3>
<p>Thermal if coffee sits. Glass plus plate if you drink it quickly and want hotter sips from the pot.</p>
<h3>2. Do “12 cups” mean 12 mugs?</h3>
<p>No. Maker cups are small. Plan on roughly half as many full mugs.</p>
<h3>3. Is a Moccamaster worth it vs OXO or Ninja?</h3>
<p>Yes if taste and longevity beat timers and price. No if you need delay brew or hate hand-washing parts.</p>
<h3>4. DualBrew or separate drip + Nespresso?</h3>
<p>DualBrew if counter space is tight and both styles get used weekly. Separate machines if one style dominates.</p>
<h3>5. Why does the basket leak when I pull the carafe?</h3>
<p>The drip-stop spring or gasket may be stuck or weak. Rinse the valve area; on some OXO units owners report replacement baskets from support.</p>

<h2>Conclusion</h2>
<p>Pick <strong>OXO</strong> for programmable SCA-style drip, <strong>Ninja Fresh Brew</strong> for value, <strong>Cuisinart</strong> for big glass pots, <strong>Moccamaster</strong> when the cup matters most, <strong>Vertuo Plus</strong> for capsules, and <strong>DualBrew</strong> when the house cannot agree.</p>
<p><strong>Amazon Affiliate Disclosure</strong>: As an Amazon Associate we earn from qualifying purchases. Commissions do not change the ranking.</p>
</div>"""


def replace_meta(html: str) -> str:
    cover = f"{U}/best-coffee-makers-2026-cover.webp"
    title = "Best Coffee Makers 2026: 7 Honest Picks | Pickora"
    desc = (
        "Seven coffee makers ranked for taste, capacity, carafe type, and daily reliability — "
        "OXO, Ninja, Cuisinart, Moccamaster, Nespresso, DualBrew."
    )
    canon = "https://pickora.shop/best-coffee-makers-2026/"

    reps = [
        (r"<title>.*?</title>", f"<title>{title}</title>"),
        (
            r'<meta name="description" content="[^"]*"',
            f'<meta name="description" content="{desc}"',
        ),
        (r'<link rel="canonical" href="[^"]*"', f'<link rel="canonical" href="{canon}"'),
        (r'<meta property="og:url" content="[^"]*"', f'<meta property="og:url" content="{canon}"'),
        (
            r'<meta property="og:title" content="[^"]*"',
            f'<meta property="og:title" content="{title}"',
        ),
        (
            r'<meta property="og:description" content="[^"]*"',
            f'<meta property="og:description" content="{desc}"',
        ),
        (r'<meta property="og:image" content="[^"]*"', f'<meta property="og:image" content="{cover}"'),
        (
            r'<meta name="twitter:title" content="[^"]*"',
            f'<meta name="twitter:title" content="{title}"',
        ),
        (
            r'<meta name="twitter:description" content="[^"]*"',
            f'<meta name="twitter:description" content="{desc}"',
        ),
        (r'<meta name="twitter:image" content="[^"]*"', f'<meta name="twitter:image" content="{cover}"'),
    ]
    for pat, rep in reps:
        html, n = re.subn(pat, rep, html, count=1, flags=re.S)
        if n != 1:
            print(f"WARN meta miss: {pat[:40]}")

    # JSON-LD image + headline rough replace
    html = html.replace(
        "https://pickora.shop/wp-content/uploads/2026/09/how-to-choose-a-microwave-2026-cover.webp",
        cover,
    )
    html = html.replace(
        "How to choose a microwave in 2026",
        "Best Coffee Makers 2026",
    )
    html = html.replace("How to choose a microwave", "Best coffee makers")
    html = html.replace(
        "how-to-choose-a-microwave-2026",
        "best-coffee-makers-2026",
    )
    return html


def replace_hero(html: str) -> str:
    html = re.sub(
        r'(<li aria-current="page">).*?(</li>)',
        r"\1Best Coffee Makers 2026\2",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(id="pk-review-title" class="pk-review-title">).*?(</h1>)',
        r'\1Best <span class="pk-blue-text">coffee makers</span> of 2026\2',
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(class="pk-review-dek">).*?(</p>)',
        r"\1Seven drip, premium SCA, capsule, and combo machines ranked for taste, "
        r"carafe type, and daily reliability — from owner research, not a kitchen lab.\2",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(class="pk-review-legacy-date"[^>]*>).*?(</p>)',
        r"\1Updated September 17, 2026\2",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(<img class="e-image-base[^"]*"[^>]*alt=")[^"]*"',
        r'\1Morning drip coffee pour on a bright kitchen counter"',
        html,
        count=1,
    )
    return html


def replace_body(html: str) -> str:
    m = re.search(
        r'<style id="pk-mw-guide-layout">.*?Commissions do not change the advice\.</p>\s*</div>',
        html,
        re.S,
    )
    if not m:
        raise SystemExit("Could not find microwave body block to replace")
    return html[: m.start()] + body_html() + html[m.end() :]


def replace_related(html: str) -> str:
    related = f"""<section class="pk-related" aria-labelledby="pk-related-title">
    <h2 id="pk-related-title">Keep reading</h2>
    <div class="pk-articles-grid">
        <article class="pk-card">
            <a href="https://pickora.shop/how-to-choose-a-microwave-2026/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="https://pickora.shop/wp-content/uploads/2026/09/how-to-choose-a-microwave-2026-cover.webp" alt="How to choose a microwave 2026" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Home &amp; Kitchen</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">How to Choose a Microwave</h3>
                    <p class="pk-card-excerpt">Size, wattage, and combo vs simple — with five honest 2026 examples.</p>
                    <div class="pk-card-footer"><span>Keep reading</span><span class="pk-card-arrow">→</span></div>
                </div>
            </a>
        </article>
        <article class="pk-card">
            <a href="https://pickora.shop/best-air-fryers-of-2026-which-one-should-you-buy/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="https://pickora.shop/wp-content/uploads/2026/06/Ultra_realistic_commercial_food_photography_202606141721-scaled.webp" alt="Best Air Fryers 2026" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Home &amp; Kitchen</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">Best Air Fryers of 2026</h3>
                    <p class="pk-card-excerpt">Seven air fryers ranked for weeknight cooking, cleanup, and counter space.</p>
                    <div class="pk-card-footer"><span>Keep reading</span><span class="pk-card-arrow">→</span></div>
                </div>
            </a>
        </article>
        <article class="pk-card">
            <a href="https://pickora.shop/home-kitchen/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="https://pickora.shop/wp-content/uploads/2026/06/Espresso_machine_and_latte_mug_202606281727.webp" alt="Home and Kitchen" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Collection</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">Home &amp; Kitchen</h3>
                    <p class="pk-card-excerpt">Guides for everyday kitchen gear, from coffee makers to air fryers.</p>
                    <div class="pk-card-footer"><span>Keep reading</span><span class="pk-card-arrow">→</span></div>
                </div>
            </a>
        </article>
    </div>
</section>"""
    m = re.search(r'<section class="pk-related".*?</section>', html, re.S)
    if not m:
        raise SystemExit("related section missing")
    return html[: m.start()] + related + html[m.end() :]


def fix_date(html: str) -> str:
    html = html.replace(
        '<time datetime="2026-09-17T12:00:00+00:00">September 17, 2026</time>',
        '<time datetime="2026-09-17T14:00:00+00:00">September 17, 2026</time>',
    )
    return html


def main() -> int:
    html = SRC.read_text(encoding="utf-8")
    html = replace_meta(html)
    html = replace_hero(html)
    html = replace_body(html)
    html = replace_related(html)
    html = fix_date(html)

    # Balance check
    if html.count("<div") != html.count("</div>"):
        print(
            "WARN div imbalance",
            html.count("<div"),
            html.count("</div>"),
            "diff",
            html.count("<div") - html.count("</div>"),
        )

    DST_DIR.mkdir(exist_ok=True)
    DST.write_text(html, encoding="utf-8")
    print(f"OK wrote {DST.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
