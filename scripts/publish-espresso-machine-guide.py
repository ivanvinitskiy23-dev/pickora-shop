#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Publish how-to-choose-an-espresso-machine from microwave chrome."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "how-to-choose-a-microwave-2026" / "index.html"
DST_DIR = ROOT / "how-to-choose-an-espresso-machine"
DST = DST_DIR / "index.html"
U = "https://pickora.shop/wp-content/uploads/2026/09"

BTN = (
    'style="background:#FF9900;color:#fff;padding:10px 18px;border-radius:8px;'
    'text-decoration:none;font-weight:700;display:inline-block;margin-top:8px;" '
    'target="_blank" rel="sponsored nofollow noopener noreferrer"'
)


def cta(url: str, label: str = "Check on Amazon →") -> str:
    return (
        f'<p><a style="background:#FF9900;color:#fff;padding:8px 14px;border-radius:6px;'
        f'text-decoration:none;font-weight:bold;display:inline-block;" href="{url}" '
        f'target="_blank" rel="sponsored nofollow noopener noreferrer">{label}</a></p>'
    )


def amazon_cell(url: str) -> str:
    return f'<a {BTN} href="{url}">Amazon →</a>'


def body() -> str:
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
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
}}
.pk-mw-box h4 {{ margin: 0 0 10px; font-size: 15px; color: #15223B; }}
.pk-mw-box ul {{ margin: 0; padding-left: 18px; }}
.pk-mw-box li {{ margin: 0 0 8px; color: #334155; line-height: 1.45; }}
.pk-mw-note {{ margin: 0.75rem 0 0; color: #4B5563; line-height: 1.55; }}
.pk-mw-verdict {{
  background: #f0f7ff;
  border-left: 4px solid #2075d2;
  padding: 14px 16px;
  margin: 12px 0 8px;
  border-radius: 0 10px 10px 0;
  color: #15223B;
  line-height: 1.5;
}}
.pk-mw-criteria {{
  display: grid;
  gap: 14px;
  margin: 18px 0 28px;
}}
.pk-mw-criteria article {{
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
  background: #fff;
}}
.pk-mw-criteria h3 {{
  margin: 0 0 8px;
  font-size: 1.05rem;
  color: #15223B;
}}
.pk-mw-criteria p {{ margin: 0; color: #475569; line-height: 1.55; }}
.pk-swipe-hint {{ color: #64748b; font-size: 14px; margin: 0 0 8px; }}
.pk-mw-table-wrap {{
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 20px 0 28px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}}
.pk-mw-table {{
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 15px;
  background: #fff;
}}
.pk-mw-table th {{
  padding: 14px 12px;
  text-align: left;
  background: #f8fafc;
  border-bottom: 3px solid #e2e8f0;
  color: #15223B;
}}
.pk-mw-table td {{
  padding: 14px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
  color: #334155;
}}
.pk-mw-table tr:nth-child(even) td {{ background: #fafafa; }}
.pk-mw-guide .pk-skip {{
  background: #fff7ed;
  border-left: 4px solid #f97316;
  padding: 14px 16px;
  margin: 1.4rem 0;
  border-radius: 0 10px 10px 0;
}}
</style>
<div class="pk-mw-guide">
<p>A good home espresso setup is not about the flashiest panel. It is about heat, grind, and a steam style you will actually use on a Tuesday morning.</p>
<p>This guide walks through the choices that matter first. Then it shows six current machines people buy a lot — from a slim budget Stilosa to a Bambino Plus and a Gaggia Classic-class metal box. Notes come from listed specs and Amazon owner praise and complaint clusters. This is not a kitchen lab we run. If you still want drip or pods instead, start with our <a class="pk-inline" href="https://pickora.shop/best-coffee-makers-2026/">best coffee makers 2026</a> roundup, or browse the <a class="pk-inline" href="https://pickora.shop/home-kitchen/">Home &amp; Kitchen hub</a>.</p>

<aside class="pk-skip"><strong>Who should skip this:</strong> You only want one-button pods. You need a dual-boiler café machine over about $1,500 as your first buy. You refuse any grinder and will not use pressurized baskets. You want a fully automatic bean-to-cup with a milk carafe and no portafilter.</aside>

<h2>How to choose (before you pick a brand)</h2>
<div class="pk-mw-criteria">
<article>
<h3>1. Budget a grinder — or accept pressurized baskets</h3>
<p>Fresh espresso-fine grind matters more than most machine upgrades. If you will not buy a decent burr grinder yet, start with pressurized baskets. Plan to move to single-wall baskets later. Owners who skip this step often blame the machine for weak shots.</p>
</article>
<article>
<h3>2. Decide milk style: auto froth vs manual wand</h3>
<p>Auto froth (Bambino Plus) wins busy mornings and guests. A manual wand (Bambino, Gaggia, Dedica, Stilosa, Impress) teaches control and latte art. Manual steam also means a learning week of screams, large bubbles, and burned milk.</p>
</article>
<article>
<h3>3. Portafilter size and upgrade path</h3>
<p>51mm is common on slim De’Longhi units. 54mm is the Breville Bambino world with plenty of aftermarket parts. 58mm (Gaggia Classic class) opens the biggest accessory and mod ecosystem. Size is not “better” by itself — it changes which baskets and tampers fit.</p>
</article>
<article>
<h3>4. Heat-up time and brew-to-steam wait</h3>
<p>ThermoJet machines like the Bambinos heat in seconds. Single-boiler Gaggia units need warm-up and a pause when you switch from shot to steam. If you make three lattes for guests, that wait is real.</p>
</article>
<article>
<h3>5. Footprint, weight, and counter grip</h3>
<p>Tiny kitchens love Bambino and Dedica widths. Light machines can slide when you lock the portafilter — owners use silicone mats. Built-in grinder machines (Impress) need more width and overhead for the hopper.</p>
</article>
<article>
<h3>6. Maintenance reality</h3>
<p>Descale on schedule, especially on hard water. Backflush where the design allows. Wipe and purge steam wands right after milk. Ignore this and even good machines taste dull or fail early.</p>
</article>
</div>

<h2>Common buying mistakes</h2>
<ul>
<li>Buying a machine first and a $20 blade grinder second.</li>
<li>Expecting café shots on day one with grocery pre-ground.</li>
<li>Choosing auto-everything when you hate cleaning milk systems.</li>
<li>Ignoring water quality (hard water kills boilers and thermocoils).</li>
<li>Skipping the drip tray and calling normal purge “a leak.”</li>
</ul>

<h2>Quick comparison</h2>
<p class="pk-swipe-hint">Swipe the table sideways on a phone to compare models.</p>
<div class="pk-mw-table-wrap">
<table class="pk-mw-table">
<thead>
<tr><th>Model</th><th>Best for</th><th>Style</th><th>Price</th><th>Action</th></tr>
</thead>
<tbody>
<tr><td><strong>Bambino Plus</strong></td><td>Easy milk drinks</td><td>54mm + auto froth</td><td>$$$</td><td>{amazon_cell("https://link.amazon/B01mDPyXh")}</td></tr>
<tr><td><strong>Bambino</strong></td><td>Compact grow-into-it</td><td>54mm + manual steam</td><td>$$–$$$</td><td>{amazon_cell("https://link.amazon/B04toh02W")}</td></tr>
<tr><td><strong>Gaggia Classic / E24</strong></td><td>Metal hobby path</td><td>58mm manual</td><td>$$$</td><td>{amazon_cell("https://link.amazon/B027mjW28")}</td></tr>
<tr><td><strong>Dedica Duo</strong></td><td>Slim mid budget</td><td>Narrow De’Longhi</td><td>$$</td><td>{amazon_cell("https://link.amazon/B0gf0xZ6B")}</td></tr>
<tr><td><strong>Stilosa</strong></td><td>Cheap first try</td><td>51mm entry</td><td>$</td><td>{amazon_cell("https://link.amazon/B0g73XgID")}</td></tr>
<tr><td><strong>Barista Express Impress</strong></td><td>One box + grinder</td><td>Built-in grind + assisted tamp</td><td>$$$$</td><td>{amazon_cell("https://link.amazon/B09kP3ljL")}</td></tr>
</tbody>
</table>
</div>

<h2>Example picks</h2>

<article class="pk-mw-pick">
<img src="{U}/breville-bambino-plus.webp" alt="Breville Bambino Plus espresso machine with auto steam wand on a warm oak kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best easy milk drinks · $$$</span>
<h3 class="pk-mw-pick-title">1. Breville Bambino Plus (BES500BSS)</h3>
<p>This is the pick when you want café-ish lattes without becoming a full-time barista. ThermoJet heat-up is nearly instant. The auto milk system lets you set heat and foam levels, then walk away for about a minute. Owners who use it daily for a year or two often call it one of their best value kitchen buys — fewer shop runs, smaller footprint, and shots that beat old drip or weak pods.</p>
<p>You still need a real grinder for best results. Many owners start with pressurized baskets, then move to single-wall 54mm baskets and a better tamp setup. The machine is light, so locking the portafilter can slide it unless you hold it or add a mat.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> fast heat, strong daily reliability stories (even past 1,000 shots), compact counters, guest-friendly auto froth, and simple day-to-day cleaning when you purge the wand into the pitcher.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> auto-steam that sometimes stops mid-cycle and forces a purge/clean sequence; plastic inside the stock portafilter; drip tray that fills from internal purge; cleaning steps that no longer match older manuals.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Near-instant heat and small footprint</li>
<li>Auto milk that works for busy mornings</li>
<li>Long daily-use praise when cleaned</li>
<li>Room to upgrade baskets and tools later</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Auto-steam stop quirk wastes time</li>
<li>Light chassis can move when locking</li>
<li>Needs a grinder and extras for peak taste</li>
<li>No loud low-water warning for some users</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> milk drinks and speed matter most. <strong>Skip if</strong> you want a heavy metal 58mm hobby machine.</div>
{cta("https://link.amazon/B01mDPyXh")}
</article>

<article class="pk-mw-pick">
<img src="{U}/breville-bambino.webp" alt="Breville Bambino espresso machine on a cool gray quartz kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best compact beginner · $$–$$$</span>
<h3 class="pk-mw-pick-title">2. Breville Bambino (BES450BSS)</h3>
<p>Same fast heat family as the Plus, but with a manual steam wand and a lower sticker price. That is the better split if you will put more money into a grinder. Owners after two or three years of daily shots still report solid performance when they descale and avoid hard water.</p>
<p>Pressurized baskets make early crema easier. As you improve, 54mm aftermarket baskets and bottomless portafilters are easy to find. Some owners say the build feels more plastic than they hoped for the price — fair for the group head feel — but function wins for most beginners.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> durability with regular cleaning, quiet-enough mornings, programmable shot volume, and a path to better technique without buying a new machine.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> plastic-heavy feel; hard-water buildup if ignored; light body; and the truth that pre-ground grocery coffee still tastes flat.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Fast heat and compact stainless look</li>
<li>Manual wand grows with your skill</li>
<li>Strong multi-year daily-use stories</li>
<li>Cheaper than Plus if froth is secondary</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Less “set and forget” milk than Plus</li>
<li>Plastic parts worry some long-term buyers</li>
<li>Still needs a good grinder for peak shots</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you want speed and control without auto froth pricing. <strong>Skip if</strong> you refuse to learn a steam wand.</div>
{cta("https://link.amazon/B04toh02W")}
</article>

<article class="pk-mw-pick">
<img src="{U}/gaggia-classic-e24.webp" alt="Gaggia Classic espresso machine on a dark walnut loft kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best metal hobby path · $$$</span>
<h3 class="pk-mw-pick-title">3. Gaggia Classic / E24</h3>
<p>This is the “made of metal, built to learn” pick. The 58mm group opens a huge accessory and mod community. Owners who wanted repairability and café-style workflow — not another touchscreen — keep landing here after research paralysis.</p>
<p>Expect a real learning curve. Warm-up takes longer than a Bambino. Single-boiler design means pull shots first, then wait for steam. Pair it with a capable espresso burr grinder or you will fight channeling forever. Soft or bottled water helps longevity.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> solid feel, tasty shots once dialed, strong steam with patience, parts and mods, and shop-cost savings that pay back the machine.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> brew-to-steam wait; weaker-feeling steam vs commercial; plastic steam knob on some units; and the need for timers, backflush baskets, and technique videos.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Metal build and repair reputation</li>
<li>58mm ecosystem and community support</li>
<li>Excellent ceiling once dialed in</li>
<li>Classic look without touchscreen clutter</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Slower workflow than ThermoJet machines</li>
<li>Steeper beginner curve</li>
<li>Grinder quality is non-negotiable</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you want a long hobby path. <strong>Skip if</strong> you need guest lattes in under two minutes with zero practice.</div>
{cta("https://link.amazon/B027mjW28")}
</article>

<article class="pk-mw-pick">
<img src="{U}/delonghi-dedica-duo.webp" alt="Slim DeLonghi Dedica espresso machine on a bright white kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best slim mid budget · $$</span>
<h3 class="pk-mw-pick-title">4. De’Longhi Dedica Duo</h3>
<p>Choose Dedica when counter width is the constraint and you still want a stylish stainless tower. Owners praise fast ready lights, compact looks (including color options), and better results than older cheap De’Longhi units. Some models lean into iced or cold-brew style drinks as a bonus use case.</p>
<p>Expect a short rocky start: jams, steam-light quirks, and froth mess until you learn the dial and wand. A matching pitcher is often a separate buy. Customer support stories are mixed but some owners get clear help after warranty or setup issues.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> looks, speed, slim footprint, auto-off after shots on some workflows, and travel-mug clearance when the drip tray comes off.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> early jamming until technique clicks; steam indicator quirks; accessories not in the box; froth learning mess.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Very slim counter profile</li>
<li>Fast heat and simple buttons</li>
<li>Strong “upgrade from cheap De’Longhi” praise</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Smaller accessory ecosystem than 54/58mm</li>
<li>Setup quirks in the first weeks</li>
<li>Pitcher often sold separately</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> width and style matter as much as shot geekery. <strong>Skip if</strong> you already know you want 58mm mods.</div>
{cta("https://link.amazon/B0gf0xZ6B")}
</article>

<article class="pk-mw-pick">
<img src="{U}/delonghi-stilosa.webp" alt="Black DeLonghi Stilosa espresso machine on a light marble counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best cheap entry · $</span>
<h3 class="pk-mw-pick-title">5. De’Longhi Stilosa</h3>
<p>This is the honest budget door. Heat is fast. The machine is small. Beginners who watch timing videos and buy fresh beans can make drinks they prefer to a $7 shop line. It is also the pick with the most “read the manual” landmines.</p>
<p>Stock pressurized setups can taste like fake crema until you modify or replace the portafilter path. Shot volume is often manual — you stop the pump yourself. The plastic tamper is weak; buy a real one. Tall tumblers may not fit, so use a shot glass and pour.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> price, speed vs older cheap machines, small kitchens, and café-like results after practice with fresh beans.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> no auto shot stop; pressurized stock limits; missing pitcher/glasses; brew-then-steam order or you scorch the next shot.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Low cost to start learning</li>
<li>Fast heat and simple dial</li>
<li>Can taste great with fresh grind and technique</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Manual timing is easy to overshoot</li>
<li>Stock accessories feel cheap</li>
<li>Lower ceiling than Bambino / Gaggia</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you want a cheap skills trainer. <strong>Skip if</strong> you want one-button consistency on day one.</div>
{cta("https://link.amazon/B0g73XgID")}
</article>

<article class="pk-mw-pick">
<img src="{U}/breville-barista-express-impress.webp" alt="Breville Barista Express Impress with bean hopper on a charcoal kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best all-in-one · $$$$</span>
<h3 class="pk-mw-pick-title">6. Breville Barista Express Impress</h3>
<p>Pick Impress when you want the grinder in the same chassis and help with dosing and tamping. The assisted tamp lever and dose feedback cut beginner mistakes. Owners who left Nespresso or dead fully-autos praise stronger shots, hot-water Americanos, and machines that still feel consistent after a year or more of daily use.</p>
<p>There is still a learning week: grind dials, extraction timing near 30 seconds, and steam skill. The hopper can bridge and stick — bump it when the grinder sounds free. There is no friendly low-water sensor on some reports, so dry-pump risk is real if you ignore the tank. It needs more counter space than a Bambino.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> built-in grind + assisted tamp, pressure gauge guidance, café savings vs pods, and durable daily routines with cleaning.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> hopper flow quirks; learning curve; froth technique; expensive official cleaners; footprint.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Grinder included — one purchase path</li>
<li>Assisted tamp helps consistency</li>
<li>Hot water spout for Americanos</li>
<li>Strong long-term daily-use praise</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Costs more and needs desk space</li>
<li>Bean bridging in the hopper</li>
<li>Watch the water tank yourself</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you want one box and guided dosing. <strong>Skip if</strong> you already own a great grinder and want a smaller Bambino footprint.</div>
{cta("https://link.amazon/B09kP3ljL")}
</article>

<h2>Simple decision tree</h2>
<ul>
<li><strong>Mostly lattes, hate frothing:</strong> Bambino Plus</li>
<li><strong>Small counter, will learn steam:</strong> Bambino or Dedica Duo</li>
<li><strong>Want metal and mods for years:</strong> Gaggia Classic / E24</li>
<li><strong>Strict budget to learn:</strong> Stilosa</li>
<li><strong>No separate grinder budget:</strong> Barista Express Impress</li>
<li><strong>Only want pods after all:</strong> see our <a class="pk-inline" href="https://pickora.shop/best-coffee-makers-2026/">coffee makers guide</a></li>
</ul>

<h2>Our research method</h2>
<p>We compared listed specs and repeated Amazon owner praise and complaint themes from September 2026 research. We did not run a timed café lab. We did not invent buyer quotes.</p>

<h2>FAQ</h2>
<h3>1. Do I need a separate grinder?</h3>
<p>Yes for best taste on Bambino, Gaggia, Dedica, and Stilosa. Impress includes a grinder. Pressurized baskets can hide a weak grind for a while — they will not match a dialed single-wall shot.</p>
<h3>2. Pressurized or single-wall baskets first?</h3>
<p>Start pressurized if you are new. Move to single-wall when your grind and tamp are steady. That is when crema and sweetness get honest.</p>
<h3>3. Bambino or Bambino Plus?</h3>
<p>Plus if auto milk matters. Base Bambino if you want to spend the difference on a grinder and will steam by hand.</p>
<h3>4. Is Gaggia worth the learning curve?</h3>
<p>Yes if you want metal, 58mm parts, and a long hobby. No if you need guest drinks with zero practice time.</p>
<h3>5. When does a built-in grinder win?</h3>
<p>When counter space and one purchase matter more than owning a separate high-end grinder. Impress fits that lane.</p>

<h2>Conclusion</h2>
<p>Start with the criteria, not the logo. Get a path to fresh grind. Match steam style to your mornings. Then pick <strong>Bambino Plus</strong> for easy milk, <strong>Bambino</strong> for compact growth, <strong>Gaggia</strong> for metal hobby years, <strong>Dedica Duo</strong> for slim style, <strong>Stilosa</strong> for a cheap start, or <strong>Barista Express Impress</strong> when the grinder must live in the same box.</p>
<p><strong>Amazon Affiliate Disclosure</strong>: As an Amazon Associate we earn from qualifying purchases. Commissions do not change the advice.</p>
</div>"""


def main() -> int:
    html = SRC.read_text(encoding="utf-8")
    cover = f"{U}/how-to-choose-an-espresso-machine-cover.webp"
    title = "How to Choose an Espresso Machine (2026) | Pickora"
    desc = (
        "Clear criteria for home espresso — grinder, steam style, portafilter size — "
        "plus six honest examples from Bambino Plus to Gaggia and Stilosa."
    )
    canon = "https://pickora.shop/how-to-choose-an-espresso-machine/"

    reps = [
        (r"<title>.*?</title>", f"<title>{title}</title>"),
        (r'<meta name="description" content="[^"]*"', f'<meta name="description" content="{desc}"'),
        (r'<link rel="canonical" href="[^"]*"', f'<link rel="canonical" href="{canon}"'),
        (r'<meta property="og:url" content="[^"]*"', f'<meta property="og:url" content="{canon}"'),
        (r'<meta property="og:title" content="[^"]*"', f'<meta property="og:title" content="{title}"'),
        (r'<meta property="og:description" content="[^"]*"', f'<meta property="og:description" content="{desc}"'),
        (r'<meta property="og:image" content="[^"]*"', f'<meta property="og:image" content="{cover}"'),
        (r'<meta name="twitter:title" content="[^"]*"', f'<meta name="twitter:title" content="{title}"'),
        (r'<meta name="twitter:description" content="[^"]*"', f'<meta name="twitter:description" content="{desc}"'),
        (r'<meta name="twitter:image" content="[^"]*"', f'<meta name="twitter:image" content="{cover}"'),
    ]
    for pat, rep in reps:
        html, n = re.subn(pat, rep, html, count=1, flags=re.S)
        if n != 1:
            print("WARN", pat[:40])

    html = html.replace(
        "https://pickora.shop/wp-content/uploads/2026/09/how-to-choose-a-microwave-2026-cover.webp",
        cover,
    )
    html = html.replace("how-to-choose-a-microwave-2026", "how-to-choose-an-espresso-machine")
    html = html.replace("How to Choose a Microwave in 2026", "How to Choose an Espresso Machine")
    html = html.replace("How to choose a microwave", "How to choose an espresso machine")
    html = html.replace("How to Choose a Microwave", "How to Choose an Espresso Machine")

    html = re.sub(
        r'(id="pk-review-title" class="pk-review-title">).*?(</h1>)',
        r'\1How to choose an <span class="pk-blue-text">espresso machine</span>\2',
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(class="pk-review-dek">).*?(</p>)',
        r"\1Grinder, steam style, and portafilter size matter more than a long feature list. "
        r"Here is how to choose — with six honest home machines.\2",
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
        r'\1Compact stainless espresso machine pulling a shot on a bright kitchen counter"',
        html,
        count=1,
    )

    m = re.search(
        r'<style id="pk-mw-guide-layout">.*?Commissions do not change the advice\.</p>\s*</div>',
        html,
        re.S,
    )
    if not m:
        raise SystemExit("body not found")
    html = html[: m.start()] + body() + html[m.end() :]

    related = f"""<section class="pk-related" aria-labelledby="pk-related-title">
    <h2 id="pk-related-title">Keep reading</h2>
    <div class="pk-articles-grid">
        <article class="pk-card">
            <a href="https://pickora.shop/best-coffee-makers-2026/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="{U}/best-coffee-makers-2026-cover-v2.webp" alt="Best coffee makers 2026" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Home &amp; Kitchen</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">Best Coffee Makers 2026</h3>
                    <p class="pk-card-excerpt">Seven drip, SCA, capsule, and combo machines for daily kitchens.</p>
                    <div class="pk-card-footer"><span>Keep reading</span><span class="pk-card-arrow">→</span></div>
                </div>
            </a>
        </article>
        <article class="pk-card">
            <a href="https://pickora.shop/how-to-choose-a-microwave-2026/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="https://pickora.shop/wp-content/uploads/2026/09/how-to-choose-a-microwave-2026-cover.webp" alt="How to choose a microwave" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Home &amp; Kitchen</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">How to Choose a Microwave</h3>
                    <p class="pk-card-excerpt">Size, wattage, and combo vs simple — with five honest examples.</p>
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
                    <p class="pk-card-excerpt">Guides for espresso, coffee makers, microwaves, and more.</p>
                    <div class="pk-card-footer"><span>Keep reading</span><span class="pk-card-arrow">→</span></div>
                </div>
            </a>
        </article>
    </div>
</section>"""
    m2 = re.search(r'<section class="pk-related".*?</section>', html, re.S)
    if not m2:
        raise SystemExit("related missing")
    html = html[: m2.start()] + related + html[m2.end() :]

    # JSON-LD cleanup
    html = re.sub(
        r'"headline":\s*"[^"]*"',
        '"headline": "How to Choose an Espresso Machine"',
        html,
        count=1,
    )
    html = re.sub(
        r'"description":\s*"[^"]*"',
        f'"description": "{desc}"',
        html,
        count=1,
    )
    html = re.sub(
        r'("item": "https://pickora\.shop/how-to-choose-an-espresso-machine/"\s*\}\s*\])',
        r'\1',
        html,
        count=1,
    )
    # breadcrumb name
    html = html.replace(
        '"name": "How to Choose an Espresso Machine", "item": "https://pickora.shop/how-to-choose-an-espresso-machine/"',
        '"name": "How to Choose an Espresso Machine", "item": "https://pickora.shop/how-to-choose-an-espresso-machine/"',
    )
    # Fix breadcrumb if still microwave wording in position 3
    html = re.sub(
        r'(\{"@type": "ListItem", "position": 3, "name": ")[^"]*(")',
        r'\1How to Choose an Espresso Machine\2',
        html,
        count=1,
    )

    html = html.replace(
        '<time datetime="2026-09-17T12:00:00+00:00">September 17, 2026</time>',
        '<time datetime="2026-09-17T16:00:00+00:00">September 17, 2026</time>',
    )

    if html.count("<div") != html.count("</div>"):
        print("WARN div", html.count("<div"), html.count("</div"))

    DST_DIR.mkdir(exist_ok=True)
    DST.write_text(html, encoding="utf-8")
    print("OK", DST.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
