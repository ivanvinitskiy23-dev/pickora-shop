#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Publish ninja-vs-cosori-air-fryer from microwave chrome."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "how-to-choose-a-microwave-2026" / "index.html"
DST_DIR = ROOT / "ninja-vs-cosori-air-fryer"
DST = DST_DIR / "index.html"
U = "https://pickora.shop/wp-content/uploads/2026/09"

NINJA = "https://link.amazon/B0b5GqzRl"
COSORI = "https://link.amazon/B03jjPcUP"

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
.pk-mw-guide h3 {{ margin-top: 1.6rem; color: #15223B; }}
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
.pk-mw-round {{
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  margin: 0 0 16px;
  background: #fff;
}}
.pk-mw-round h3 {{ margin: 0 0 10px; font-size: 1.08rem; }}
.pk-mw-round p {{ margin: 0 0 10px; color: #475569; line-height: 1.55; }}
.pk-mw-round p:last-child {{ margin-bottom: 0; }}
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
<p>Ninja and Cosori sit at the top of a lot of air fryer shortlists. They solve different kitchen problems. One is a dual-drawer meal machine. The other is a fast, quieter single basket that often costs less.</p>
<p>This head-to-head compares the <strong>Ninja Foodi DZ550 DualZone Smart XL</strong> (10 quart, two baskets, Smart Cook probe) with the <strong>Cosori TurboBlaze 6-Quart</strong>. Notes come from listed specs and repeated Amazon owner praise and complaint themes — not a kitchen lab we run. For a wider field, see our <a class="pk-inline" href="https://pickora.shop/best-air-fryers-of-2026-which-one-should-you-buy/">Best Air Fryers of 2026</a> guide or the <a class="pk-inline" href="https://pickora.shop/home-kitchen/">Home &amp; Kitchen hub</a>.</p>

<aside class="pk-skip"><strong>Who should skip this:</strong> You want an oven-style toaster-oven air fryer. You only need a tiny 2–3 qt basket for one person and almost no counter space. You already own one of these and only need liners. You cook restaurant volume.</aside>

<h2>Quick comparison</h2>
<p class="pk-swipe-hint">Swipe the table sideways on a phone.</p>
<div class="pk-mw-table-wrap">
<table class="pk-mw-table">
<thead>
<tr><th>Model</th><th>Best for</th><th>Layout</th><th>Price</th><th>Action</th></tr>
</thead>
<tbody>
<tr><td><strong>Ninja DZ550 Foodi</strong></td><td>Families / two foods at once</td><td>Dual 5-qt drawers + probe</td><td>$$$</td><td>{amazon_cell(NINJA)}</td></tr>
<tr><td><strong>Cosori TurboBlaze</strong></td><td>Speed, quieter daily use</td><td>Single 6-qt basket</td><td>$$</td><td>{amazon_cell(COSORI)}</td></tr>
</tbody>
</table>
</div>

<p>There is no single “always better” brand. Pick the machine that matches how you cook on a Tuesday night.</p>

<h2>Round by round</h2>

<div class="pk-mw-round">
<h3>Round 1 — Build, size, and counter space</h3>
<p><strong>Ninja DZ550</strong> is a wide dual-drawer box with silver handles and a full top panel (DualZone, Smart Finish, Match Cook, probe port). Owners love the look next to other black appliances. They also warn it is <em>huge</em> — measure the counter before you buy. Capacity is the selling point: about 5 quarts per drawer, 10 quarts total for family trays.</p>
<p><strong>Cosori TurboBlaze</strong> is a single square basket with a sloped top touch panel and silver trim. Owners call it sleek and “premium” on the counter. Some say the footprint is a bit bigger than older compact Ninjas they owned, but still fine once they ditched a toaster oven. The top panel works well for average height; shorter users may find it awkward.</p>
<p><strong>Round winner:</strong> Cosori if counter width is tight. Ninja if you have the space and need two zones.</p>
</div>

<div class="pk-mw-round">
<h3>Round 2 — Capacity and real family cooking</h3>
<p>Dual drawers change weeknight math. Owners cook fries in one basket and chicken in the other, then use <strong>Smart Finish</strong> so both land at the same time. Teens and college kids use it late without heating the whole kitchen. Leftovers still re-crisp. Large families of six still note a catch: pile food too high and crisp falls off — these drawers want space and a shake, not a stuffed oven tray.</p>
<p>Cosori’s 6-quart single basket holds a solid batch (owners cite about five bone-in thighs per run). You will do two batches for a full pack. That is fine for couples and small families. It is slower for “everything at once” dinners.</p>
<p><strong>Round winner:</strong> Ninja for households that cook two foods or serve more than three people often.</p>
</div>

<div class="pk-mw-round">
<h3>Round 3 — Cooking performance and features</h3>
<p>Both machines get food hotter and crispier than many first-gen air fryer lids. Ninja owners highlight juicy drumsticks with browned skin, frozen snacks in about ten minutes, and no mandatory preheat for many cooks. The <strong>Smart Cook probe</strong> is the differentiator — stick it in a thick steak or chicken and stop guessing. Modes cover air fry, bake, roast, reheat, air broil, and dehydrate. Bacon divides people: some love low-fat crisp; others prefer oven bacon that fries in its own fat. Thin non-breaded meat can dry out if you treat it like a fryer snack.</p>
<p>Cosori TurboBlaze owners push the turbo fan story: lean chicken breast and tenderloin stay juicy when eaten fresh; shrimp and weeknight proteins brown well; some replace the oven for toast, broil, and small bakes. Fine temp steps (about 5°) help dial-in. A common annoyance: after a cycle, the unit may snap back to a default temp, so add-time cooks need a quick reset.</p>
<p><strong>Round winner:</strong> Tie on “does dinner taste good.” Ninja wins for probe + dual timing. Cosori wins for simple high-heat single-basket speed.</p>
</div>

<div class="pk-mw-round">
<h3>Round 4 — Noise, heat, and cleanup</h3>
<p>Ninja noise is “as expected” — often quieter than a full oven. Fan cool-down is short. Grease builds fast like any fryer; silicone liners or parchment help, and the coated drawers wipe if you hit the nooks. Dishwasher-safe parts get praise when families actually clean them.</p>
<p>Cosori noise is a frequent win. Owners switching from Ninja AF101-class units call the TurboBlaze fan gentler. Exterior stays touchable during cooks for several reviewers. Ceramic-coated basket wipe-downs are a highlight — cheese drips and meat juices often come off with soap and hot water. The “done” chime can be quiet; some set a phone timer so they do not miss it.</p>
<p><strong>Round winner:</strong> Cosori for quieter daily use and easy wipe cleanup. Ninja stays fine with liners and habits.</p>
</div>

<div class="pk-mw-round">
<h3>Round 5 — Value, accessories, and trust</h3>
<p>Cosori often lands near a strong mid-budget price (owners casually cite great ~$90 spends). Third-party accessories are thinner than the Ninja world. Silicone liners sized for Ninja drawers may slide in the Cosori basket. Official Cosori add-ons are sometimes regular nonstick even when buyers wanted ceramic — a real mismatch for coating-focused shoppers.</p>
<p>Ninja costs more but replaces “two cooks” and adds a probe. Accessory choice is huge: liners, silicone baskets, books. Brand loyalty shows up in “I bought a second one for the beach house” stories.</p>
<p>On Cosori ceramic vs older PTFE stock: later production (owners checking manufacture dates into 2026) aligns with ceramic listings when bought from the brand store. Packaging may still say only “nonstick,” which frustrates careful buyers. Fire scare reviews often show clear misuse (machine on a stove). Follow the manual clearance rules.</p>
<p><strong>Round winner:</strong> Cosori for dollar-per-cook value. Ninja for long-term family workflow value if you use both drawers.</p>
</div>

<h2>Side A — Ninja Foodi DZ550 DualZone Smart XL</h2>
<article class="pk-mw-pick">
<img src="{U}/ninja-dz550-foodi.webp" alt="Ninja Foodi dual-basket air fryer on a dark marble kitchen counter with drumsticks and fries" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best for families · $$$</span>
<h3 class="pk-mw-pick-title">Ninja DZ550 Foodi 10-Quart DualZone</h3>
<p>Buy this when dinner is two different foods and you hate staggered oven trays. Independent temps and times, Smart Finish sync, and a probe for thick proteins make it more than “a bigger fryer.” Owners with teens, college kids, or a household of four-plus keep calling it a favorite appliance after a year of daily use.</p>
<p>Plan counter width. Do not overfill drawers if you want real crisp. Budget liners. Expect grease management. Skip bacon here if you love fatty oven strips.</p>
<p class="pk-mw-note"><strong>Owner praise themes:</strong> dual drawers, Smart Finish, probe accuracy, even crisp on fries and chicken, easy controls, quieter than a full oven, strong multi-year durability stories.</p>
<p class="pk-mw-note"><strong>Owner complaint themes:</strong> large footprint; soggy results when packed; grease buildup; bacon that drains dry; thin meats can toughen; needs room to shake and breathe.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Two foods, two temps, one finish time</li>
<li>Probe takes the guesswork out of doneness</li>
<li>True family capacity when not overfilled</li>
<li>Huge accessory ecosystem</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Needs serious counter space</li>
<li>Costs more than a strong single basket</li>
<li>Overfill kills crisp</li>
<li>Grease needs liners or careful washing</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Get Ninja</strong> if you cook for a household and use both drawers weekly. <strong>Skip it</strong> if you mostly reheat fries for one or two people.</div>
{cta(NINJA, "See Ninja DZ550 on Amazon →")}
</article>

<h2>Side B — Cosori TurboBlaze 6-Quart</h2>
<article class="pk-mw-pick">
<img src="{U}/cosori-turboblaze.webp" alt="Cosori TurboBlaze single-basket air fryer on a light oak kitchen counter" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best everyday value · $$</span>
<h3 class="pk-mw-pick-title">Cosori TurboBlaze Air Fryer</h3>
<p>Buy this when you want one excellent basket that cooks fast, stays quieter, and cleans with a wipe. Owners who left older Ninja single baskets call it a clear upgrade for fan noise, exterior heat, and weeknight chicken. Many stop using the big oven for small dinners.</p>
<p>Accept batch cooking for big family packs. Confirm you want ceramic-era stock from a reputable listing. Expect fewer perfect-fit third-party liners than Ninja. Listen for the soft done chime — or set a timer.</p>
<p class="pk-mw-note"><strong>Owner praise themes:</strong> speed, juicy lean chicken, quiet fan, easy ceramic wipe cleanup, sleek look, wide temp range, replaces toaster oven for some cooks.</p>
<p class="pk-mw-note"><strong>Owner complaint themes:</strong> soft done chime; temp resets after a cycle; top panel height; thinner accessory market; packaging unclear on coating type; batch cooking for large households.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Strong mid-budget performance</li>
<li>Quieter daily fan noise</li>
<li>Easy cleanup on ceramic-era baskets</li>
<li>Fine temp control for dialing recipes</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>One basket — more batches for big meals</li>
<li>Fewer accessories than Ninja</li>
<li>UI quirks (reset temp, quiet chime)</li>
<li>Coating clarity on the box can frustrate</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Get Cosori</strong> for couples, small families, and quieter counters. <strong>Skip it</strong> if you need two foods done together every night.</div>
{cta(COSORI, "See Cosori TurboBlaze on Amazon →")}
</article>

<h2>Who should buy which</h2>
<ul>
<li><strong>Family of 4+ / teens cooking late / two sides at once:</strong> Ninja DZ550</li>
<li><strong>Probe for steak and thick chicken:</strong> Ninja DZ550</li>
<li><strong>Couple or small kitchen, best everyday value:</strong> Cosori TurboBlaze</li>
<li><strong>Quiet fan and wipe-clean priority:</strong> Cosori TurboBlaze</li>
<li><strong>Still unsure across more brands:</strong> <a class="pk-inline" href="https://pickora.shop/best-air-fryers-of-2026-which-one-should-you-buy/">full 2026 air fryer roundup</a></li>
</ul>

<h2>Our research method</h2>
<p>We compared listed specs and paraphrased Amazon owner praise and complaint clusters from September 2026 research dumps for these two models. We did not run timed lab tests. We did not invent buyer quotes.</p>

<h2>FAQ</h2>
<h3>1. Is Ninja or Cosori better for families?</h3>
<p>Ninja DZ550 for most families that cook two items or larger portions. Cosori still works if you accept two batches and mainly feed two to three people.</p>
<h3>2. Which is quieter and easier to clean?</h3>
<p>Owner themes lean Cosori for quieter fans and wipe-clean ceramic baskets. Ninja cleans fine with liners and a sink habit.</p>
<h3>3. Do you need dual baskets?</h3>
<p>Only if you regularly cook two foods with different times or want protein and sides done together. Otherwise a strong 6-quart single basket is simpler.</p>
<h3>4. Is the Cosori TurboBlaze ceramic now?</h3>
<p>Listings and later manufacture dates point to ceramic-era stock in 2026, especially from the brand store. Packaging may still say only “nonstick,” so check the date stamp if coating type matters to you.</p>
<h3>5. Which is the better value?</h3>
<p>Cosori usually wins pure dollar value. Ninja wins if you will use dual zones and the probe every week — then the higher price buys workflow, not just metal.</p>

<h2>Conclusion</h2>
<p><strong>Choose Ninja DZ550</strong> when dual drawers, Smart Finish, and a probe match your household. <strong>Choose Cosori TurboBlaze</strong> when you want a quieter, faster single basket that punches above its price. Both can replace a lot of oven nights. Match the machine to how you actually cook — not to which logo feels louder in ads.</p>
<p><strong>Amazon Affiliate Disclosure</strong>: As an Amazon Associate we earn from qualifying purchases. Commissions do not change the advice.</p>
</div>"""


def main() -> int:
    html = SRC.read_text(encoding="utf-8")
    cover = f"{U}/ninja-vs-cosori-air-fryer-cover.webp"
    title = "Ninja vs Cosori Air Fryer (2026) | Pickora"
    desc = (
        "Ninja Foodi DZ550 vs Cosori TurboBlaze — dual baskets and probe versus a quieter "
        "6-quart speed machine. Clear rounds, table, and who should buy which."
    )
    canon = "https://pickora.shop/ninja-vs-cosori-air-fryer/"

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
            print("WARN", pat[:50])

    html = html.replace(
        "https://pickora.shop/wp-content/uploads/2026/09/how-to-choose-a-microwave-2026-cover.webp",
        cover,
    )
    html = html.replace("how-to-choose-a-microwave-2026", "ninja-vs-cosori-air-fryer")
    html = html.replace("How to Choose a Microwave in 2026", "Ninja vs Cosori Air Fryer")
    html = html.replace("How to choose a microwave", "Ninja vs Cosori air fryer")
    html = html.replace("How to Choose a Microwave", "Ninja vs Cosori Air Fryer")

    html = re.sub(
        r'(id="pk-review-title" class="pk-review-title">).*?(</h1>)',
        r'\1Ninja vs <span class="pk-blue-text">Cosori</span> air fryer\2',
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(class="pk-review-dek">).*?(</p>)',
        r"\1Dual-zone Ninja DZ550 versus Cosori TurboBlaze — capacity, noise, cleanup, "
        r"and who should buy which in 2026.\2",
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
        r'\1Ninja dual-basket and Cosori single-basket air fryers compared on a kitchen counter"',
        html,
        count=1,
    )

    m = re.search(
        r'<style id="pk-mw-guide-layout">.*?Commissions do not change the advice\.</p>\s*</div>',
        html,
        re.S,
    )
    if not m:
        # microwave may not have that exact closing if different body — try broader
        m = re.search(
            r'<style id="pk-mw-guide-layout">.*?</div>\s*(?=<section class="pk-related"|<div class="elementor-element)',
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
            <a href="https://pickora.shop/best-air-fryers-of-2026-which-one-should-you-buy/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="https://pickora.shop/wp-content/uploads/2026/07/A_modern_black_air_fryer_202606131522-scaled.webp" alt="Best Air Fryers 2026" width="1200" height="670" loading="lazy" decoding="async">
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
            <a href="https://pickora.shop/how-to-choose-an-espresso-machine/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="{U}/how-to-choose-an-espresso-machine-cover.webp" alt="How to choose an espresso machine" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Home &amp; Kitchen</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">How to Choose an Espresso Machine</h3>
                    <p class="pk-card-excerpt">Grinder, steam style, and portafilter size — with six honest home machines.</p>
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
                    <p class="pk-card-excerpt">Guides for air fryers, espresso, coffee makers, and more.</p>
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
        '"headline": "Ninja vs Cosori Air Fryer"',
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
        r'(\{"@type": "ListItem", "position": 3, "name": ")[^"]*(")',
        r'\1Ninja vs Cosori Air Fryer\2',
        html,
        count=1,
    )

    # Balance check
    if html.count("<main") != html.count("</main>"):
        print("WARN main imbalance", html.count("<main"), html.count("</main>"))

    DST_DIR.mkdir(parents=True, exist_ok=True)
    DST.write_text(html, encoding="utf-8")
    print("Wrote", DST)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
