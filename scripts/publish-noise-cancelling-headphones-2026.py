#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Publish best-noise-cancelling-headphones-2026 from microwave chrome."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "how-to-choose-a-microwave-2026" / "index.html"
DST_DIR = ROOT / "best-noise-cancelling-headphones-2026"
DST = DST_DIR / "index.html"
U = "https://pickora.shop/wp-content/uploads/2026/09"

XM6 = "https://link.amazon/B0j6GjBg9"
BOSE = "https://link.amazon/B0dZd0Fre"
MAX2 = "https://link.amazon/A01LIhrTl"
CH720 = "https://link.amazon/B0bXcvIMx"
SPACE = "https://link.amazon/B0cYQWlT8"

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
.pk-inline {{ color: #2075d2; text-decoration: underline; text-underline-offset: 2px; }}
</style>
<div class="pk-mw-guide">
<p>Over-ear noise cancelling headphones still beat most earbuds when you want all-day comfort, deeper bass, and a seal that lasts through flights and open offices. The hard part is picking a lane: max hush, Apple seamless, or real value under flagship money.</p>
<p>This roundup ranks five current pairs using listed specs and Amazon owner praise and complaint themes. It is not a listening lab. If you want in-ears instead, start with our <a class="pk-inline" href="https://pickora.shop/how-to-choose-wireless-earbuds/">wireless earbuds buyer guide</a> or <a class="pk-inline" href="https://pickora.shop/wireless-earbud-buying-mistakes/">earbud buying mistakes</a>.</p>

<aside class="pk-skip"><strong>Who should skip this:</strong> You only want tiny earbuds for the gym. You need open-back wired studio cans. You will not spend more than about $50. You refuse Bluetooth entirely.</aside>

<h2>Quick comparison</h2>
<p class="pk-swipe-hint">Swipe the table sideways on a phone.</p>
<div class="pk-mw-table-wrap">
<table class="pk-mw-table">
<thead>
<tr><th>Model</th><th>Best for</th><th>ANC vibe</th><th>Price</th><th>Action</th></tr>
</thead>
<tbody>
<tr><td><strong>Sony WH-1000XM6</strong></td><td>Best overall travel / focus</td><td>Flagship hush + app EQ</td><td>$$$$</td><td>{amazon_cell(XM6)}</td></tr>
<tr><td><strong>Bose QC Ultra 2nd Gen</strong></td><td>All-day comfort</td><td>Cloud fit + strong ANC</td><td>$$$$</td><td>{amazon_cell(BOSE)}</td></tr>
<tr><td><strong>AirPods Max 2</strong></td><td>Apple homes</td><td>Premium seal + Spatial</td><td>$$$$</td><td>{amazon_cell(MAX2)}</td></tr>
<tr><td><strong>Sony WH-CH720N</strong></td><td>Lighter mid budget</td><td>Good, not XM6-class</td><td>$$–$$$</td><td>{amazon_cell(CH720)}</td></tr>
<tr><td><strong>Soundcore Space One</strong></td><td>Best value</td><td>Strong for the money</td><td>$$</td><td>{amazon_cell(SPACE)}</td></tr>
</tbody>
</table>
</div>

<h2>The picks</h2>

<article class="pk-mw-pick">
<img src="{U}/sony-wh1000xm6.webp" alt="Sony WH-1000XM6 style over-ear headphones on a light oak desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best overall · $$$$</span>
<h3 class="pk-mw-pick-title">1. Sony WH-1000XM6</h3>
<p>Buy the XM6 when you want one pair for chaotic homes, flights, and multipoint work. Owners praise ANC that cuts tank pumps, fridge hum, and street rumble — and still lets some kid talk through if you need it. Multipoint between phone and computers is a frequent win. Battery often lasts days of mixed use. The app EQ fixes stock tuning for many listeners.</p>
<p>Expect a learning week with touch pads. Some find the clamp firm or the cups warm after long wears. Build can feel lighter than Apple metal. A few travelers dislike ear-cup suction on plane descent. Price is the main hesitation when Soundcore already “good enough.”</p>
<p class="pk-mw-note"><strong>What owners like:</strong> elite ANC, multipoint, battery, detailed sound after EQ, long Bluetooth range.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> cost; touch vs buttons; oil stains on light colors; heat; plastic feel vs Max.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Flagship ANC for travel and focus</li>
<li>Strong multipoint and calls</li>
<li>Deep app tuning</li>
<li>Long real-world battery stories</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Premium price</li>
<li>Touch controls take practice</li>
<li>Cups can warm up</li>
<li>Not the plush “forget them” Bose fit for everyone</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you want the default 2026 flagship. <strong>Skip if</strong> comfort-first Bose or Apple lock-in matters more.</div>
{cta(XM6, "See Sony WH-1000XM6 on Amazon →")}
</article>

<article class="pk-mw-pick">
<img src="{U}/bose-qc-ultra-headphones.webp" alt="Bose QuietComfort Ultra headphones on a pale concrete desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best comfort · $$$$</span>
<h3 class="pk-mw-pick-title">2. Bose QuietComfort Ultra Headphones (2nd Gen)</h3>
<p>Buy Bose when you will wear cans 8–12 hours and ANC is the product. Owners call the fit pillow-soft, even with glasses. Passive seal alone quiets rooms for some before Quiet mode. Calls and battery get strong praise. Immersion mode helps bedtime and movies. They fold for bags. Many who tried Sony returned to Bose for comfort and build feel.</p>
<p>Watch multipoint setup on PCs — a few needed a second unit after YouTube glitches. Hinge creak under silence shows up in a minority of reviews (sometimes fixable). Voice prompts gave way to tones. Stock pads can slip on pillows; firmer aftermarket foam helps sleepers.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> all-day comfort, ANC, calls, battery, foldable travel, Immersion mode.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> rare BT/app multipoint bugs; hinge creak; pricey; muddy bass until EQ cut.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Best “forget you are wearing them” fit</li>
<li>Class-leading hush for many</li>
<li>Folds small for travel</li>
<li>Strong call clarity themes</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>App / multipoint quirks for some</li>
<li>Possible hinge creak in quiet rooms</li>
<li>Basic EQ vs Sony’s deep tools</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> comfort and hush win. <strong>Skip if</strong> you need Sony’s EQ playground or Apple seamless only.</div>
{cta(BOSE, "See Bose QC Ultra on Amazon →")}
</article>

<article class="pk-mw-pick">
<img src="{U}/airpods-max-2.webp" alt="Apple AirPods Max style headphones on a white marble desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best for Apple · $$$$</span>
<h3 class="pk-mw-pick-title">3. Apple AirPods Max 2</h3>
<p>Buy Max 2 when iPhone, Mac, iPad, and Apple TV are your daily stack. Pairing and device switching feel automatic. Owners love ANC for focus work, Spatial Audio and Atmos for movies, and a metal build that feels premium. USB-C lossless helps wired Mac listening. Comfort improves after a break-in week for many.</p>
<p>Weight is real — fine at a desk, rough for long delivery shifts. Battery around 20 hours trails Sony/Bose stories. Glasses can press temples. Not sweat-proof gym gear; moisture in metal cups needs drying habits for heavy wearers. Windows Bluetooth can drop more than Mac. Case is minimal.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> ecosystem, ANC, Spatial/Atmos, build, desk comfort after break-in.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> weight; 20-hour battery; price; sweat/moisture; weaker off-Apple experience.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Best Apple daily experience</li>
<li>Immersive Spatial and movie mixes</li>
<li>Premium materials and replaceable pads</li>
<li>Strong ANC for focus and travel</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Heavy vs Sony/Bose</li>
<li>Shorter battery class</li>
<li>Not for sweaty workouts</li>
<li>Android / Windows get less magic</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you live in Apple. <strong>Skip if</strong> you need light all-day multipoint on Android/Windows first.</div>
{cta(MAX2, "See AirPods Max 2 on Amazon →")}
</article>

<article class="pk-mw-pick">
<img src="{U}/sony-wh-ch720n.webp" alt="Sony WH-CH720N headphones on a cool gray desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best mid Sony · $$–$$$</span>
<h3 class="pk-mw-pick-title">4. Sony WH-CH720N</h3>
<p>Buy the CH720N when you want Sony software and a lighter frame without XM6 money. Owners like multipoint, long battery, and surprisingly natural ambient mode. Wired jack helps on planes and PCs. App EQ saves a dull stock tune. Good daily driver for home fans, gyms, and mowing when priced near $100–150 sales.</p>
<p>ANC is “noise reduction,” not XM6 silence — sudden loud sounds still break through. Pads can smash larger ears or glasses arms. Interior mic bumps annoy some. Call mics are hit-or-miss. Adaptive ANC sometimes guesses wrong. Build feels plastic. Do not pay near XM6 prices for these.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> light comfort for many, battery, value sale price, app, solid PC pairing.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> mid ANC; ear pad fit; mic consistency; adaptive quirks; plasticky feel.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Lighter than flagship Sonys</li>
<li>Strong value on sale</li>
<li>Useful ambient / app tools</li>
<li>Jack + multipoint flexibility</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Not flagship ANC</li>
<li>Fit issues for some ears/glasses</li>
<li>Inconsistent call mics</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> budget mid Sony fits. <strong>Skip if</strong> you need plane-class hush — step to XM6 or Bose.</div>
{cta(CH720, "See Sony WH-CH720N on Amazon →")}
</article>

<article class="pk-mw-pick">
<img src="{U}/soundcore-space-one.webp" alt="Soundcore Space One headphones on a warm oak desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best value · $$</span>
<h3 class="pk-mw-pick-title">5. Soundcore Space One</h3>
<p>Buy Space One when you want most of the checklist — ANC, app EQ, multipoint, long battery — without $400 stickers. Owners praise plane engine drone reduction, comfort for long days, physical buttons, and easy pairing. Wear detection and auto-pause delight many. Travel pouch and aux cable help. Firmware and EQ often fix early “flat bass” complaints.</p>
<p>Plastic build is honest at the price. Wear sensors can false-trigger. Multipoint switching is clumsier than Sony for some. Clamp can feel firm on long sessions. A few hear left-cup hiss until updates. Not a Bose/Sony material flex — it is a bargain that punches up.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> ANC for money, comfort, battery, app, buttons, travel value.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> plastic; wear-detect quirks; occasional hiss/bass until EQ; multipoint friction.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Best dollar-per-ANC story here</li>
<li>Light all-day comfort for many</li>
<li>Rich app and physical controls</li>
<li>Travel-friendly extras</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Build feels budget vs Bose/Apple</li>
<li>Feature quirks need app time</li>
<li>Not the absolute hush kings</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> value matters. <strong>Skip if</strong> you already decided to pay for XM6 or Bose comfort.</div>
{cta(SPACE, "See Soundcore Space One on Amazon →")}
</article>

<h2>Simple decision tree</h2>
<ul>
<li><strong>One flagship for most people:</strong> Sony WH-1000XM6</li>
<li><strong>Wear all day / max comfort:</strong> Bose QC Ultra 2nd Gen</li>
<li><strong>iPhone / Mac / Apple TV life:</strong> AirPods Max 2</li>
<li><strong>Lighter mid Sony:</strong> WH-CH720N on sale</li>
<li><strong>Best under ~$150:</strong> Soundcore Space One</li>
<li><strong>Still want earbuds:</strong> <a class="pk-inline" href="https://pickora.shop/how-to-choose-wireless-earbuds/">earbuds how-to</a></li>
</ul>

<h2>Our research method</h2>
<p>We compared listed specs and paraphrased Amazon owner themes from September 2026 research dumps for these five models. We did not run a lab panel. We did not invent buyer quotes.</p>

<h2>FAQ</h2>
<h3>1. Over-ear or earbuds for ANC?</h3>
<p>Over-ear usually wins for long flights and all-day wear. Earbuds win for gyms and pockets. See our earbuds guides if size matters more than seal.</p>
<h3>2. Sony XM6 or Bose Ultra for flights?</h3>
<p>Both hush well. Pick Sony for EQ and multipoint defaults. Pick Bose if comfort is the deal-breaker.</p>
<h3>3. Are AirPods Max worth it on Android?</h3>
<p>Usually no as a primary pair. You lose the best switching and features. Buy Sony or Bose instead.</p>
<h3>4. How much battery is enough?</h3>
<p>Plan for your longest travel day with ANC on. XM6 and Bose owners often cite multi-day mixed use. Max 2 sits nearer a long workday plus evening.</p>
<h3>5. Is Space One “good enough” vs $400 cans?</h3>
<p>For many commute and home users, yes. Step up when you need every last dB of hush or premium materials.</p>

<h2>Conclusion</h2>
<p>Start with <strong>Sony WH-1000XM6</strong> for the safest flagship bet. Choose <strong>Bose QC Ultra 2nd Gen</strong> for all-day comfort, <strong>AirPods Max 2</strong> for Apple homes, <strong>WH-CH720N</strong> for a lighter mid Sony, and <strong>Soundcore Space One</strong> when value comes first.</p>
<p><strong>Amazon Affiliate Disclosure</strong>: As an Amazon Associate we earn from qualifying purchases. Commissions do not change the advice.</p>
</div>"""


def main() -> int:
    html = SRC.read_text(encoding="utf-8")
    cover = f"{U}/best-noise-cancelling-headphones-2026-cover.webp"
    title = "Best Noise Cancelling Headphones 2026 | Pickora"
    desc = (
        "Five over-ear ANC picks for 2026 — Sony WH-1000XM6, Bose QC Ultra, AirPods Max 2, "
        "Sony CH720N, and Soundcore Space One."
    )
    canon = "https://pickora.shop/best-noise-cancelling-headphones-2026/"

    for pat, rep in [
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
    ]:
        html, n = re.subn(pat, rep, html, count=1, flags=re.S)
        if n != 1:
            print("WARN", pat[:40])

    html = html.replace(
        "https://pickora.shop/wp-content/uploads/2026/09/how-to-choose-a-microwave-2026-cover.webp",
        cover,
    )
    html = html.replace("how-to-choose-a-microwave-2026", "best-noise-cancelling-headphones-2026")
    html = html.replace("How to Choose a Microwave in 2026", "Best Noise Cancelling Headphones 2026")
    html = html.replace("How to choose a microwave", "Best noise cancelling headphones")
    html = html.replace("How to Choose a Microwave", "Best Noise Cancelling Headphones")

    html = re.sub(
        r'(id="pk-review-title" class="pk-review-title">).*?(</h1>)',
        r'\1Best <span class="pk-blue-text">noise cancelling</span> headphones 2026\2',
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(class="pk-review-dek">).*?(</p>)',
        r"\1Five over-ear ANC picks — Sony XM6, Bose Ultra, AirPods Max 2, CH720N, and Space One — "
        r"ranked for travel, comfort, and value.\2",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(class="pk-review-legacy-date"[^>]*>).*?(</p>)',
        r"\1Updated September 22, 2026\2",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(<img class="e-image-base[^"]*"[^>]*alt=")[^"]*"',
        r'\1Best noise cancelling headphones on a desk — 2026 roundup"',
        html,
        count=1,
    )
    html = html.replace(">Home &amp; Kitchen<", ">Consumer Electronics<", 1)

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
            <a href="https://pickora.shop/how-to-choose-wireless-earbuds/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="{U}/how-to-choose-wireless-earbuds-cover.webp" alt="How to choose wireless earbuds" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Consumer Electronics</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">How to Choose Wireless Earbuds</h3>
                    <p class="pk-card-excerpt">Fit, ANC, calls, and phone ecosystem — with five honest examples.</p>
                    <div class="pk-card-footer"><span>Keep reading</span><span class="pk-card-arrow">→</span></div>
                </div>
            </a>
        </article>
        <article class="pk-card">
            <a href="https://pickora.shop/wireless-earbud-buying-mistakes/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="{U}/wireless-earbud-buying-mistakes-cover.webp" alt="Wireless earbud buying mistakes" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Consumer Electronics</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">Wireless Earbud Buying Mistakes</h3>
                    <p class="pk-card-excerpt">Seven common mistakes with clear fixes and soft picks.</p>
                    <div class="pk-card-footer"><span>Keep reading</span><span class="pk-card-arrow">→</span></div>
                </div>
            </a>
        </article>
        <article class="pk-card">
            <a href="https://pickora.shop/consumer-electronics/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="https://pickora.shop/wp-content/uploads/2026/06/Create_an_ultra-realistic_editorial_hero_202606141914-scaled.webp" alt="Consumer Electronics" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Collection</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">Consumer Electronics</h3>
                    <p class="pk-card-excerpt">Headphones, earbuds, and desk gadgets for daily use.</p>
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

    html = re.sub(
        r'"headline":\s*"[^"]*"',
        '"headline": "Best Noise Cancelling Headphones 2026"',
        html,
        count=1,
    )
    html = re.sub(r'"description":\s*"[^"]*"', f'"description": "{desc}"', html, count=1)
    html = re.sub(
        r'(\{"@type": "ListItem", "position": 3, "name": ")[^"]*(")',
        r'\1Best Noise Cancelling Headphones 2026\2',
        html,
        count=1,
    )

    DST_DIR.mkdir(parents=True, exist_ok=True)
    DST.write_text(html, encoding="utf-8")
    print("Wrote", DST)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
