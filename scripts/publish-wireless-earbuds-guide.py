#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Publish how-to-choose-wireless-earbuds from microwave chrome."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "how-to-choose-a-microwave-2026" / "index.html"
DST_DIR = ROOT / "how-to-choose-wireless-earbuds"
DST = DST_DIR / "index.html"
U = "https://pickora.shop/wp-content/uploads/2026/09"

SONY = "https://link.amazon/B04mtaVOi"
AIRPODS = "https://link.amazon/B0cMAEh88"
GALAXY = "https://link.amazon/B0dtHrZWe"
SOUNDCORE = "https://link.amazon/B0ecRaz3R"
BOSE = "https://link.amazon/B0fwmnOMc"

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
.pk-inline {{ color: #2075d2; text-decoration: underline; text-underline-offset: 2px; }}
</style>
<div class="pk-mw-guide">
<p>Most people shop wireless earbuds by brand ads and star ratings. Then the buds slip, the ANC leaks, or calls sound muddy. Fit, phone ecosystem, and how you use them matter more than a long codec list.</p>
<p>This guide walks the choices first. Then it shows five current examples — from Sony WF-1000XM6 and AirPods Pro 3 to Galaxy Buds4 Pro, Soundcore Liberty 5 Pro, and Bose QuietComfort Ultra (2nd Gen). Notes come from listed specs and Amazon owner praise and complaint themes. This is not a listening lab we run. For a wider ranking, see our <a class="pk-inline" href="https://pickora.shop/best-wireless-earbuds-2026-top-7-models-tested-honest-reviews/">Best Wireless Earbuds 2026</a> roundup or the <a class="pk-inline" href="https://pickora.shop/consumer-electronics/">Consumer Electronics</a> hub.</p>

<aside class="pk-skip"><strong>Who should skip this:</strong> You only want over-ear ANC headphones. You need wired studio IEMs. You are fine with $20 disposable buds for podcasts and will not pay for ANC. You need open-ear bone conduction for road cycling as your only use case.</aside>

<h2>How to choose (before you pick a brand)</h2>
<div class="pk-mw-criteria">
<article>
<h3>1. Start with your phone — not the logo</h3>
<p>AirPods unlock Find My, seamless Mac/iPhone switching, and Apple’s call stack. Galaxy Buds unlock Samsung AI Interpreter paths and deep settings. Sony, Bose, and Soundcore work across phones, but the “magic” extras thin out off-ecosystem. If you live on one phone brand, buy for that first.</p>
</article>
<article>
<h3>2. Fit and seal beat marketing ANC scores</h3>
<p>Active noise canceling only works if the tip seals. Owners who swap tip sizes — or move to foam like Comply — often say ANC and bass “suddenly” work. Use in-app fit tests when offered (Apple, Samsung). Wings help for gyms. Stems can catch long hair.</p>
</article>
<article>
<h3>3. Decide what ANC must kill</h3>
<p>Planes, open offices, and fans need strong canceling. Quiet apartments need less. Bose often wins “switch off the world.” Sony and AirPods Pro 3 sit close when sealed. Transparency / ambient modes matter for walking and talking without removing a bud.</p>
</article>
<article>
<h3>4. Calls and multipoint for work days</h3>
<p>If you live on Teams and phone calls, mic noise canceling matters as much as music. Soundcore Liberty 5 Pro owners push call cleanup hard. Apple still leads many iPhone call stories. Triple multipoint (Soundcore) helps phone + laptop + second phone without constant re-pair.</p>
</article>
<article>
<h3>5. Battery: buds vs case reality</h3>
<p>Look at on-bud hours for long flights and case reserve for travel weeks. Some upgrades add bud time but trim case capacity (AirPods Pro 3 theme). Idle case drain shows up on some Galaxy reports. Long calls drain buds faster when mics work hard.</p>
</article>
<article>
<h3>6. Controls, apps, and durability</h3>
<p>Touch pads misfire. Pinch stems take practice. Physical feedback helps. Apps unlock EQ, ANC levels, and firmware. Plan a case of tips and clean ears. Rare single-bud failures after a year+ show up even on premium pairs — warranties help.</p>
</article>
</div>

<h2>Common buying mistakes</h2>
<ul>
<li>Buying AirPods for Android and expecting full features.</li>
<li>Ignoring tip fit, then blaming the brand for weak ANC.</li>
<li>Paying flagship money when you only need commute podcasts.</li>
<li>Skipping multipoint when you juggle phone and laptop all day.</li>
<li>Upgrading every generation when last year’s buds still fit and hold charge.</li>
</ul>

<h2>Quick comparison</h2>
<p class="pk-swipe-hint">Swipe the table sideways on a phone.</p>
<div class="pk-mw-table-wrap">
<table class="pk-mw-table">
<thead>
<tr><th>Model</th><th>Best for</th><th>Phone fit</th><th>Price</th><th>Action</th></tr>
</thead>
<tbody>
<tr><td><strong>Sony WF-1000XM6</strong></td><td>Sound + ANC on Android</td><td>Any (great on Android)</td><td>$$$$</td><td>{amazon_cell(SONY)}</td></tr>
<tr><td><strong>AirPods Pro 3</strong></td><td>iPhone daily driver</td><td>Apple best</td><td>$$$–$$$$</td><td>{amazon_cell(AIRPODS)}</td></tr>
<tr><td><strong>Galaxy Buds4 Pro</strong></td><td>Samsung phone users</td><td>Galaxy best</td><td>$$$–$$$$</td><td>{amazon_cell(GALAXY)}</td></tr>
<tr><td><strong>Soundcore Liberty 5 Pro</strong></td><td>Calls + value multipoint</td><td>Any</td><td>$$–$$$</td><td>{amazon_cell(SOUNDCORE)}</td></tr>
<tr><td><strong>Bose QC Ultra 2nd Gen</strong></td><td>Maximum hush</td><td>Any</td><td>$$$$</td><td>{amazon_cell(BOSE)}</td></tr>
</tbody>
</table>
</div>

<h2>Example picks</h2>

<article class="pk-mw-pick">
<img src="{U}/sony-wf1000xm6.webp" alt="Sony WF-1000XM6 style wireless earbuds and case on a walnut desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best Android sound · $$$$</span>
<h3 class="pk-mw-pick-title">1. Sony WF-1000XM6</h3>
<p>Pick Sony when sound quality and tunable ANC matter more than Apple or Samsung extras. Owners talk about deep bass for earbuds, a rich app, and canceling that can erase nearby talk when the seal and calibration are right. Tip choice is not optional — foam aftermarket tips come up often for comfort and isolation.</p>
<p>Calls are clear for many, but some note short dropouts at home. Battery stories are strong when you use the case. Longevity is usually fine; a few owners still mention one bud dying after a year-plus and wish they had extended warranty.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> sound that “seals the deal,” strong ANC with proper tips, deep EQ app, solid case runtime.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> premium price; occasional call quirks; rare single-bud failures; ANC not “perfect” if seal is weak.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Flagship sound and ANC when sealed</li>
<li>Serious app tuning</li>
<li>Works across phones</li>
<li>Strong all-day case praise</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Costs top dollar</li>
<li>Tip hunt required</li>
<li>Less “magic” than AirPods on iPhone</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you want Android-friendly flagship sound. <strong>Skip if</strong> you live only in Apple’s stack.</div>
{cta(SONY, "See Sony WF-1000XM6 on Amazon →")}
</article>

<article class="pk-mw-pick">
<img src="{U}/airpods-pro-3.webp" alt="Apple AirPods Pro style white stem earbuds on a light marble desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best for iPhone · $$$–$$$$</span>
<h3 class="pk-mw-pick-title">2. Apple AirPods Pro 3</h3>
<p>Pick AirPods Pro 3 when you already own Apple devices. Setup is instant. Switching between iPhone and Mac feels automatic. Call quality still leads many head-to-heads. Owners upgrading from Pro 1 or Pro 2 cite better fit, stronger ANC, clearer sound, and longer on-bud battery for meetings and flights.</p>
<p>Transparency can feel almost “too good.” Live Translate is mixed — better with pauses and close speakers, still beta-ish. Multipoint stays in the Apple family. Case capacity themes say buds last longer while the case holds fewer full top-ups than before. First-unit faults (random disconnects) happen; replacements often behave.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> ecosystem, ANC leap, secure foam tips, calls, USB-C + wireless charge travel kits.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> price if Pro 2 still healthy; stems catching hair; Translate quirks; Android users lose the extras.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Best Apple daily experience</li>
<li>Excellent calls and ANC for many</li>
<li>Fit upgrade helps workouts</li>
<li>Longer bud battery vs older Pros</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Weak choice as a primary Android bud</li>
<li>Premium cost for incremental Pro 2 owners</li>
<li>Case reserve trade-offs</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you are deep in Apple. <strong>Skip if</strong> you need true cross-brand multipoint every day.</div>
{cta(AIRPODS, "See AirPods Pro 3 on Amazon →")}
</article>

<article class="pk-mw-pick">
<img src="{U}/galaxy-buds4-pro.webp" alt="Samsung Galaxy Buds stem earbuds with translucent case on a slate desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best for Galaxy · $$$–$$$$</span>
<h3 class="pk-mw-pick-title">3. Samsung Galaxy Buds4 Pro</h3>
<p>Pick Buds4 Pro when your phone is a Galaxy. Pairing is automatic. Fit tests and hearing profiles show up in setup. Owners praise rich dual-driver sound, strong ANC for shop noise, clear calls, and pinch controls that beat accidental touch pads for some people. Light weight and secure fit help chores and long shifts.</p>
<p>Galaxy AI translation workflows make more sense with buds near your mouth than with a phone held between people. Off Samsung, you lose a lot of the smart extras. Some owners say upgrades from Buds3 Pro feel small. Case idle drain and finicky pinch timing show up in complaints. Stem fit hurts some ears that prefer bean shapes.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> Samsung integration, sound + ANC, call clarity, secure light fit, ambient/driving modes.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> price vs last gen; case drain when idle; controls learning curve; not worth it without a Galaxy phone.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Best match for Samsung phones</li>
<li>Strong sound and ANC themes</li>
<li>Clear calls for sales / busy spaces</li>
<li>Fit and hearing setup tools</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Ecosystem lock-in for full value</li>
<li>Stem comfort is personal</li>
<li>Some say little jump from Buds3 Pro</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you carry a Galaxy daily. <strong>Skip if</strong> you want bean-shaped buds or iPhone-first features.</div>
{cta(GALAXY, "See Galaxy Buds4 Pro on Amazon →")}
</article>

<article class="pk-mw-pick">
<img src="{U}/soundcore-liberty-5-pro.webp" alt="Soundcore Liberty 5 Pro earbuds and smart display charging case on an oak desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best value / calls · $$–$$$</span>
<h3 class="pk-mw-pick-title">4. Soundcore Liberty 5 Pro</h3>
<p>Pick Liberty 5 Pro when call quality and multipoint matter more than a luxury logo. Owners who left Galaxy Buds for mic issues often land here. Mic noise canceling is the headline — kitchen noise, fans, and TV often stay off the other end of the call. Triple multipoint helps personal phone, work phone, and laptop.</p>
<p>Wings and tip choices keep gyms and jogs secure. The case screen is handy for ANC modes and battery, though some call the plastic case less premium. Stock EQ can sound thin until you tune it. Bass fans love custom presets; neutral listeners may prefer dual-driver flagships. Long calls drain buds faster. Transparency can feel harsh in loud kitchens.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> call mic NC, multipoint, app EQ depth, secure fit, ANC for the money, useful case screen.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> case feel; stock tuning; call-time battery; rare ANC feedback squeals on pillows; Max upsell not needed for most.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>Standout call cleanup</li>
<li>Triple multipoint for work setups</li>
<li>Strong ANC and fit for the price</li>
<li>Deep EQ without ecosystem lock</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Not the absolute flagship sound crown</li>
<li>Case plastics / bulk</li>
<li>Needs EQ time out of the box</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you live on calls across devices. <strong>Skip if</strong> you only want Apple’s seamless stack.</div>
{cta(SOUNDCORE, "See Liberty 5 Pro on Amazon →")}
</article>

<article class="pk-mw-pick">
<img src="{U}/bose-qc-ultra-earbuds.webp" alt="Bose QuietComfort Ultra style earbuds with stability wings on a concrete desk" width="1200" height="900" loading="lazy" decoding="async">
<span class="pk-mw-badge">Best pure ANC · $$$$</span>
<h3 class="pk-mw-pick-title">5. Bose QuietComfort Ultra Earbuds (2nd Gen)</h3>
<p>Pick Bose when silence is the product. Owners describe fans, AC, shops, and even nearby dogs fading when ANC engages. Fit with soft tips and stability bands stays snug for walks and long listens. Sound leans rich and bass-friendly once EQ and phone volume limits are set. Multipoint to phone and laptop works for meetings.</p>
<p>Touch controls take practice — volume swipes can skip tracks or change modes. Some Samsung phones needed a firmware jump to stay connected. Comfort is excellent for many; a few still feel pressure after long days like most sealed buds. Battery stories are solid for all-day single-bud rotation.</p>
<p class="pk-mw-note"><strong>What owners like:</strong> class-leading hush, secure comfort, enjoyable sound, USB-C + wireless case, meeting mics.</p>
<p class="pk-mw-note"><strong>What owners hate:</strong> touch learning curve; Samsung firmware drama for some; premium price; limited EQ vs Sony/Soundcore apps.</p>
<div class="pk-mw-cols">
<div class="pk-mw-box"><h4>Pros</h4><ul>
<li>ANC that feels like an off switch</li>
<li>Secure, light long-wear fit for many</li>
<li>Works across phone brands</li>
<li>Good meeting call reports</li>
</ul></div>
<div class="pk-mw-box"><h4>Cons</h4><ul>
<li>Touch controls need patience</li>
<li>Watch firmware on some Android phones</li>
<li>Costs flagship money for hush first</li>
</ul></div>
</div>
<div class="pk-mw-verdict"><strong>Buy if</strong> you want maximum quiet. <strong>Skip if</strong> you need the deepest EQ playground or cheapest value.</div>
{cta(BOSE, "See Bose QC Ultra on Amazon →")}
</article>

<h2>Simple decision tree</h2>
<ul>
<li><strong>iPhone / Mac daily:</strong> AirPods Pro 3</li>
<li><strong>Galaxy phone:</strong> Galaxy Buds4 Pro</li>
<li><strong>Android, want sound + ANC:</strong> Sony WF-1000XM6</li>
<li><strong>Work calls + laptop + two phones:</strong> Soundcore Liberty 5 Pro</li>
<li><strong>Planes, shops, max hush:</strong> Bose QC Ultra (2nd Gen)</li>
<li><strong>Still comparing a longer list:</strong> <a class="pk-inline" href="https://pickora.shop/best-wireless-earbuds-2026-top-7-models-tested-honest-reviews/">full earbuds roundup</a></li>
</ul>

<h2>Our research method</h2>
<p>We compared listed specs and repeated Amazon owner praise and complaint themes from September 2026 research. We did not run a lab listening panel. We did not invent buyer quotes.</p>

<h2>FAQ</h2>
<h3>1. Do I need ANC?</h3>
<p>Yes for planes, open offices, and loud commutes. Optional for quiet homes and podcasts. Fit still matters either way.</p>
<h3>2. Are AirPods worth it on Android?</h3>
<p>Usually no as a primary pair. You lose the best features. Buy Sony, Bose, or Soundcore instead.</p>
<h3>3. How important is the ear tip seal?</h3>
<p>It decides bass, ANC, and comfort. Use fit tests. Try every tip size. Foam tips help many owners.</p>
<h3>4. What is best for work calls?</h3>
<p>Soundcore Liberty 5 Pro for mic cleanup and multipoint. AirPods Pro 3 if you stay on Apple. Galaxy Buds4 Pro if you stay on Samsung.</p>
<h3>5. When is Bose worth the premium?</h3>
<p>When hush is the main job and you will wear them in noisy rooms daily. If you want max EQ toys, look at Sony or Soundcore.</p>

<h2>Conclusion</h2>
<p>Choose by phone, fit, and use case — not by the loudest ad. Get <strong>AirPods Pro 3</strong> for Apple, <strong>Galaxy Buds4 Pro</strong> for Samsung, <strong>Sony WF-1000XM6</strong> for Android sound and ANC, <strong>Soundcore Liberty 5 Pro</strong> for calls and multipoint value, and <strong>Bose QC Ultra (2nd Gen)</strong> when silence comes first.</p>
<p><strong>Amazon Affiliate Disclosure</strong>: As an Amazon Associate we earn from qualifying purchases. Commissions do not change the advice.</p>
</div>"""


def main() -> int:
    html = SRC.read_text(encoding="utf-8")
    cover = f"{U}/how-to-choose-wireless-earbuds-cover.webp"
    title = "How to Choose Wireless Earbuds (2026) | Pickora"
    desc = (
        "Fit, ANC, calls, and phone ecosystem — then five honest examples from Sony XM6 "
        "and AirPods Pro 3 to Soundcore and Bose."
    )
    canon = "https://pickora.shop/how-to-choose-wireless-earbuds/"

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
    html = html.replace("how-to-choose-a-microwave-2026", "how-to-choose-wireless-earbuds")
    html = html.replace("How to Choose a Microwave in 2026", "How to Choose Wireless Earbuds")
    html = html.replace("How to choose a microwave", "How to choose wireless earbuds")
    html = html.replace("How to Choose a Microwave", "How to Choose Wireless Earbuds")

    html = re.sub(
        r'(id="pk-review-title" class="pk-review-title">).*?(</h1>)',
        r'\1How to choose <span class="pk-blue-text">wireless earbuds</span>\2',
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(class="pk-review-dek">).*?(</p>)',
        r"\1Phone ecosystem, fit, ANC, and calls matter more than ads. "
        r"Here is how to choose — with five honest 2026 examples.\2",
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
        r'\1Wireless earbuds and charging cases compared on a modern desk"',
        html,
        count=1,
    )
    # badge category if Home & Kitchen
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
            <a href="https://pickora.shop/best-wireless-earbuds-2026-top-7-models-tested-honest-reviews/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="https://pickora.shop/wp-content/uploads/2026/06/Create_an_ultra-realistic_editorial_hero_202606141914-scaled.webp" alt="Best Wireless Earbuds 2026" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Consumer Electronics</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">Best Wireless Earbuds 2026</h3>
                    <p class="pk-card-excerpt">Seven earbuds ranked for ANC, sound, and daily use.</p>
                    <div class="pk-card-footer"><span>Keep reading</span><span class="pk-card-arrow">→</span></div>
                </div>
            </a>
        </article>
        <article class="pk-card">
            <a href="https://pickora.shop/ninja-vs-cosori-air-fryer/" class="pk-card-inner">
                <div class="pk-card-media">
                    <img src="{U}/ninja-vs-cosori-air-fryer-cover.webp" alt="Ninja vs Cosori air fryer" width="1200" height="670" loading="lazy" decoding="async">
                    <span class="pk-card-tag">Home &amp; Kitchen</span>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">Ninja vs Cosori Air Fryer</h3>
                    <p class="pk-card-excerpt">Dual-zone DZ550 versus TurboBlaze — who should buy which.</p>
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
                    <p class="pk-card-excerpt">Earbuds, keyboards, and desk gadgets for daily use.</p>
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

    html = re.sub(r'"headline":\s*"[^"]*"', '"headline": "How to Choose Wireless Earbuds"', html, count=1)
    html = re.sub(r'"description":\s*"[^"]*"', f'"description": "{desc}"', html, count=1)
    html = re.sub(
        r'(\{"@type": "ListItem", "position": 3, "name": ")[^"]*(")',
        r'\1How to Choose Wireless Earbuds\2',
        html,
        count=1,
    )

    if html.count("<main") != html.count("</main>"):
        print("WARN main", html.count("<main"), html.count("</main>"))

    DST_DIR.mkdir(parents=True, exist_ok=True)
    DST.write_text(html, encoding="utf-8")
    print("Wrote", DST)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
