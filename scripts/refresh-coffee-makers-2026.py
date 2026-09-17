#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Refresh coffee makers article: cover v2, longer simple copy, fix main gap."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "best-coffee-makers-2026" / "index.html"
U = "https://pickora.shop/wp-content/uploads/2026/09"


def cta(url: str) -> str:
    return (
        '<p><a style="background: #FF9900; color: white; padding: 8px 14px; '
        'border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;" '
        f'href="{url}" target="_blank" rel="sponsored nofollow noopener noreferrer">'
        "Check on Amazon →</a></p>"
    )


def body() -> str:
    # Short sentences. Aim Flesch ~60–70. Extra detail per model.
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
.pk-mw-note {{ margin: 0.75rem 0 0; color: #4B5563; }}
</style>
<div class="pk-mw-guide">
<p>You do not need a dozen brew modes for a good morning cup. You need hot water at the right heat. You need a carafe that fits how fast you drink. And you need a machine that still works after months of daily use.</p>
<p>We ranked seven coffee makers people buy right now. The list mixes drip pots, premium SCA-style brewers, capsules, and one grounds-plus-pods combo. The notes come from listed specs and common Amazon owner praise and complaints. This is not a kitchen lab we run. For nearby kitchen gear, see our <a class="pk-inline" href="https://pickora.shop/how-to-choose-a-microwave-2026/">microwave buyer guide</a>, the <a class="pk-inline" href="https://pickora.shop/best-air-fryers-of-2026-which-one-should-you-buy/">air fryer rankings</a>, and the <a class="pk-inline" href="https://pickora.shop/home-kitchen/">Home &amp; Kitchen hub</a>.</p>

<aside class="pk-skip"><strong>Who should skip this:</strong> You want a real espresso machine with a portafilter and steam wand. You only want a bare $20–$30 drip box. You need office-size volume past a home 14-cup pot. You refuse filters and pods and only want manual pour-over gear.</aside>

<h2>Quick comparison</h2>
<table>
<thead><tr><th>Model</th><th>Best for</th><th>Carafe</th><th>Timer</th><th>Price</th></tr></thead>
<tbody>
<tr><td>OXO Brew 9-Cup</td><td>Best overall drip</td><td>Thermal</td><td>Yes</td><td>$$$</td></tr>
<tr><td>Ninja Fresh Brew 12-Cup</td><td>Best value</td><td>Glass + plate</td><td>Yes</td><td>$$</td></tr>
<tr><td>Cuisinart 14-Cup</td><td>Big household</td><td>Glass + plate</td><td>Yes</td><td>$–$$</td></tr>
<tr><td>Moccamaster thermal</td><td>Premium thermal</td><td>Thermal</td><td>No</td><td>$$$$</td></tr>
<tr><td>Moccamaster KBGV Select</td><td>Premium glass</td><td>Glass + plate</td><td>No</td><td>$$$$</td></tr>
<tr><td>Nespresso Vertuo Plus</td><td>Capsules</td><td>—</td><td>—</td><td>$$–$$$</td></tr>
<tr><td>Ninja DualBrew</td><td>Drip + pods</td><td>Glass</td><td>Yes</td><td>$$$</td></tr>
</tbody>
</table>

<article class="pk-mw-pick">
<img src="{U}/oxo-brew-9cup.webp" alt="9-cup drip coffee maker with thermal carafe on a warm oak kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best overall drip</span>
<h3 class="pk-mw-pick-title">1. OXO Brew 9-Cup Drip Coffee Maker</h3>
<p>This is the best all-around drip pick in this list. It is programmable. It blooms the grounds. Many owners pick the thermal carafe so coffee does not sit on a hot plate and taste burnt.</p>
<p>The cup size on the tank is small. Two machine “cups” are about one normal mug. Owners who grind fresh beans often say the brew tastes better than older Ninja pots and weak full-mug K-Cups.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> cleaner taste, delay brew for early mornings, a slim fit under many cabinets, and support that often ships a new basket or carafe when parts fail.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> a front knob that feels loose, a basket valve that sticks open and drips when you pull the carafe, leftover water in the tank, and rare moisture inside thermal carafe walls.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Better cup when grind and dose are right</li><li>Timer and simple one-knob controls</li><li>Thermal carafe skips the hot-plate taste</li><li>Fits under cabinets better than bulky 12-cup boxes</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Knob can feel cheap</li><li>Sticky basket valve can burn skin</li><li>Tank and carafe moisture complaints</li></ul></div>
</div>
<p><strong>Buy if</strong> you want timed drip that tastes closer to pour-over. <strong>Skip if</strong> you hate fiddly baskets or need a huge glass pot for guests.</p>
{cta("https://link.amazon/B09wqVQq0")}
</article>

<article class="pk-mw-pick">
<img src="{U}/ninja-fresh-brew-12cup.webp" alt="12-cup programmable drip coffee maker with glass carafe on a cool gray counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best value</span>
<h3 class="pk-mw-pick-title">2. Ninja Fresh Brew 12-Cup Programmable</h3>
<p>This is the value drip machine for most homes. You get Classic and Rich strength, a small-batch mode, and a clear tank you can pull off to fill at the sink.</p>
<p>Coffee comes out hot. The Rich button gives more body without hard math. Many owners switch from the mesh filter to #4 paper filters. Paper cuts grit and can calm stomach upset from oils and fines.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> taste for the price, easy tank cleaning, and a design that spills on the counter if you forget the carafe — not back into the tank path like some older pots.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> light plastic parts, clocks that die, base leaks, carafe seam leaks, and support that often stops helping after the warranty ends.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Hot coffee and a useful Rich setting</li><li>Removable tank is easy to wash</li><li>Good features for the money</li><li>Paper filters improve clarity</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Plastic feels light</li><li>Leaks and clock failures after a year or two</li><li>Hard support line after warranty</li></ul></div>
</div>
<p><strong>Buy if</strong> you want a timed 12-cup pot without premium pricing. <strong>Skip if</strong> you expect it to last like a Moccamaster with no wear budget.</p>
{cta("https://link.amazon/B0dEIVh3O")}
</article>

<article class="pk-mw-pick">
<img src="{U}/cuisinart-14cup.webp" alt="14-cup programmable coffee maker with glass carafe on a bright white kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best large household</span>
<h3 class="pk-mw-pick-title">3. Cuisinart 14-Cup Programmable (DCC-3200 family)</h3>
<p>This is the big-pot pick. You get Bold brew, a 1–4 cup mode, plate heat settings, a ready tone you can mute, and a charcoal water filter.</p>
<p>Owners who moved up from older Cuisinart models often say the coffee tastes stronger and hotter. The basket must “pop” fully into place. If it sits high, the drip valve stays shut and grounds can flood the tank.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> guest-size batches, iced-coffee prep, clear buttons, and sneak-a-cup when the basket seats right.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> overflow near true max fill, carafe drips if you pour too fast, a tall lid under cabinets, and thin glass.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Real capacity for family and guests</li><li>Bold, timer, tone, and plate controls</li><li>Good hot coffee on a mid budget</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Overflow risk at high fill</li><li>Basket must seat with a firm pop</li><li>Needs cabinet height; thin glass</li></ul></div>
</div>
<p><strong>Buy if</strong> you need volume and do not mind a glass carafe. <strong>Skip if</strong> you want thermal hold or a tiny counter.</p>
{cta("https://link.amazon/B06WvuYrD")}
</article>

<article class="pk-mw-pick">
<img src="{U}/moccamaster-thermal.webp" alt="Premium thermal-carafe drip coffee maker on a dark walnut loft kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best premium thermal</span>
<h3 class="pk-mw-pick-title">4. Technivorm Moccamaster (thermal carafe)</h3>
<p>This machine is about the cup, not the clock. It heats fast. It aims for SCA/ECBC brew temps. Coffee lands in a thermal carafe with no hot plate.</p>
<p>There is no delay timer. You grind, add cold water, and flip the switch. Use a coarser grind than grocery “drip” fine. Fine grind can overflow the basket.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> clear café-like flavor, quick brew, coffee that stays pleasant in the thermal pot, and long life with replaceable parts.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> the high price, plastic parts that feel plain for the cost, a pour spout that dribbles, and many small pieces to wash by hand.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Excellent cup clarity and speed</li><li>Thermal hold without a plate</li><li>Strong longevity and parts stories</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Expensive</li><li>No programming</li><li>Messy pour spout; hand-wash parts</li></ul></div>
</div>
<p><strong>Buy if</strong> taste and thermal hold beat wake-up timers. <strong>Skip if</strong> you need coffee waiting when you wake up.</p>
{cta("https://link.amazon/B0giKWii2")}
</article>

<article class="pk-mw-pick">
<img src="{U}/moccamaster-kbgv.webp" alt="Premium glass-carafe drip coffee maker on a light marble counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best premium glass</span>
<h3 class="pk-mw-pick-title">5. Technivorm Moccamaster KBGV Select</h3>
<p>Same brew idea as the thermal model, but with a glass carafe and hot plate. The Select switch helps half-pot and full-pot batches brew better.</p>
<p>Pick this if you finish the pot while it is fresh. The plate keeps sips hot. Do not leave coffee on the plate for hours if you hate that cooked taste.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> smooth drip, quiet brew, simple half/full control, a long warranty theme, and parts you can replace instead of tossing the whole machine.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> no clock, hand-wash rules, fragile-feeling glass, and overflow risk with fine grind.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Consistent café-like drip</li><li>Half/full Select for smaller pots</li><li>Quiet and simple to service</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>No delay brew</li><li>Hand wash only</li><li>Glass can break; needs coarse grind</li></ul></div>
</div>
<p><strong>Buy if</strong> you drink the pot soon after brew. <strong>Skip if</strong> coffee sits half the morning.</p>
{cta("https://link.amazon/B07zKY1r6")}
</article>

<article class="pk-mw-pick">
<img src="{U}/nespresso-vertuo-plus.webp" alt="Matte black capsule coffee machine with crema-topped mug on a minimal white counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best capsules</span>
<h3 class="pk-mw-pick-title">6. Nespresso Vertuo Plus</h3>
<p>This is the easy single-cup pick. The pod barcode sets size and brew style. Heat-up is quick. Cleanup is mostly emptying used pods and rinsing the tank.</p>
<p>Many owners leave Keurig because large K-Cups taste weak. Vertuo cups often show thicker crema and a more even shot. You pay for that in capsule cost over time.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> one-button days, café-like foam, small footprint, and less mess than grinding beans.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> locked pods, higher cost per cup, and no fresh-bean drip control.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Fast, steady cups with real crema</li><li>Easy clean and compact size</li><li>Pod sets the cup size for you</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Capsule spend adds up</li><li>Not a bean-to-cup drip machine</li></ul></div>
</div>
<p><strong>Buy if</strong> speed and crema beat grinding. <strong>Skip if</strong> you want cheap pots from a bag of beans.</p>
{cta("https://link.amazon/B08e3tVs4")}
</article>

<article class="pk-mw-pick">
<img src="{U}/ninja-dualbrew.webp" alt="Slim black dual brew coffee system with carafe and iced drinks on a charcoal counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best drip + pods</span>
<h3 class="pk-mw-pick-title">7. Ninja DualBrew Pro / Specialty Coffee System</h3>
<p>This slim tower does ground coffee and K-Cup-style pods in one footprint. Many listings add Classic, Rich, Over Ice, and Specialty modes, plus a side frother.</p>
<p>Read the Amazon title with care. DualBrew models look alike. Carafe size, pod puncture style, and extras change by SKU. Some frothers only whip milk cold. Heat the milk first if you want a hot latte feel.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> one machine for mixed homes, a narrow counter width, a tank that can sit on the side or back, and a clean hot-water path for tea or oatmeal.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> confusing model numbers, cold-only frothing, and a smaller carafe than some DualBrew versions.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul><li>Pods and a full pot without two machines</li><li>Slim design for tight counters</li><li>Separate hot water helps non-coffee drinks</li></ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul><li>Easy to buy the wrong DualBrew twin</li><li>Frother may not heat</li><li>Carafe can feel small</li></ul></div>
</div>
<p><strong>Buy if</strong> one person wants pods and another wants a pot. <strong>Skip if</strong> you only brew one way.</p>
{cta("https://link.amazon/B09gjlZdP")}
</article>

<h2>What matters when you buy</h2>
<ul>
<li><strong>Carafe type:</strong> Thermal is kinder when coffee sits. Glass plus a plate stays hotter if you finish the pot fast.</li>
<li><strong>“Cup” size:</strong> Maker cups are often about 5 oz. Count real mugs, not the number on the box.</li>
<li><strong>Grind:</strong> Premium drip wants medium-coarse. Fine grocery grind can overflow fancy baskets.</li>
<li><strong>Basket seating:</strong> A half-seated basket keeps the valve closed and can dump grounds into the tank.</li>
<li><strong>Pods vs beans:</strong> Capsules win rushed mornings. Drip wins cost per cup and bean control.</li>
</ul>

<h2>Our research method</h2>
<p>We compared listed specs and repeated Amazon owner praise and complaint themes from September 2026 research. We did not run a timed kitchen lab. We did not invent buyer quotes.</p>

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
<p>Choose thermal if coffee sits. Choose glass plus a plate if you drink it soon and want hotter sips from the pot.</p>
<h3>2. Do “12 cups” mean 12 mugs?</h3>
<p>No. Maker cups are small. Plan on about half as many full mugs.</p>
<h3>3. Is a Moccamaster worth it vs OXO or Ninja?</h3>
<p>Yes if taste and long life beat timers and price. No if you need delay brew or hate hand-washing parts.</p>
<h3>4. DualBrew or separate drip + Nespresso?</h3>
<p>DualBrew if space is tight and both styles get used each week. Buy separate machines if one style wins most days.</p>
<h3>5. Why does the basket leak when I pull the carafe?</h3>
<p>The drip-stop spring or gasket may stick or feel weak. Rinse the valve area. Some OXO owners get a replacement basket from support.</p>

<h2>Conclusion</h2>
<p>Get the <strong>OXO</strong> for timed SCA-style drip. Get the <strong>Ninja Fresh Brew</strong> for value. Get the <strong>Cuisinart</strong> for big glass pots. Get a <strong>Moccamaster</strong> when the cup comes first. Get the <strong>Vertuo Plus</strong> for capsules. Get the <strong>DualBrew</strong> when the house cannot agree.</p>
<p><strong>Amazon Affiliate Disclosure</strong>: As an Amazon Associate we earn from qualifying purchases. Commissions do not change the ranking.</p>
</div>"""


def main() -> int:
    html = HTML.read_text(encoding="utf-8")

    # Cover → v2 everywhere for this article's primary cover refs
    html = html.replace(
        f"{U}/best-coffee-makers-2026-cover.webp",
        f"{U}/best-coffee-makers-2026-cover-v2.webp",
    )
    html = html.replace(
        'alt="Morning drip coffee pour on a bright kitchen counter"',
        'alt="Glass carafe pouring coffee into a mug on a bright kitchen counter"',
    )

    # Replace body
    m = re.search(
        r'<style id="pk-mw-guide-layout">.*?Commissions do not change the ranking\.</p>\s*</div>',
        html,
        re.S,
    )
    if not m:
        m = re.search(
            r'<style id="pk-mw-guide-layout">.*?Commissions do not change the advice\.</p>\s*</div>',
            html,
            re.S,
        )
    if not m:
        raise SystemExit("body block not found")
    html = html[: m.start()] + body() + html[m.end() :]

    # Fix early </main>: remove it after hero, close main before related
    html = html.replace(
        """    </section>
    </main>



<div class="wp-block-group has-global-padding""",
        """    </section>

<div class="wp-block-group has-global-padding""",
        1,
    )
    # Close main before pk-related
    if "</main>" not in html.split('<section class="pk-related"')[0]:
        html = html.replace(
            '<section class="pk-related"',
            '</main>\n<section class="pk-related"',
            1,
        )

    # Soften sticky main flex gap if any leftover CSS targets empty main
    if "pk-coffee-layout-fix" not in html:
        html = html.replace(
            "</style>\n<link rel=\"stylesheet\" href=\"/assets/css/pickora-nav.css?v=5\">",
            """</style>
<style id="pk-coffee-layout-fix">
main#wp--skip-link--target {
  flex: 0 1 auto !important;
  min-height: 0 !important;
}
</style>
<link rel="stylesheet" href="/assets/css/pickora-nav.css?v=5">""",
            1,
        )

    if html.count("<div") != html.count("</div>"):
        print("WARN div", html.count("<div"), html.count("</div"))
    if html.count("<main") != html.count("</main>"):
        print("WARN main", html.count("<main"), html.count("</main>"))

    HTML.write_text(html, encoding="utf-8")
    print("OK refreshed", HTML.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
