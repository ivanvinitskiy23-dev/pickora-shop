#!/usr/bin/env python3
"""Global disclosure polish + articles/about redesign."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DISCLOSURE_CSS = """<style id="pk-disclosure-footer-inline-css">
.pk-disclosure-footer {
  max-width: 1200px !important;
  width: 100% !important;
  margin: 40px auto 30px !important;
  padding: 0 20px !important;
  text-align: center !important;
  color: #64748b !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  white-space: normal;
  box-sizing: border-box !important;
}
.pk-disclosure-footer,
.pk-disclosure-footer * {
  box-sizing: border-box;
}
.pk-disclosure-footer p {
  margin: 0 !important;
  display: inline-block;
  max-width: 100%;
}
.pk-disclosure-footer a {
  color: #2075d2 !important;
  text-decoration: underline;
}
</style>
"""

DISCLOSURE_HTML = (
    '<div class="pk-disclosure-footer">'
    "<p>Pickora is reader-supported. When you buy through links on our site, we may earn "
    "an affiliate commission at no extra cost to you. As an Amazon Associate we earn "
    'from qualifying purchases. <a href="/affiliate-disclosure/">Learn more</a>.</p>'
    "</div>\n"
)

ARTICLES_ABOUT_BLOCK = """
<section class="pk-articles-about" aria-label="About Pickora">
  <div class="pk-articles-about-inner">
    <p class="pk-articles-about-eyebrow">About Pickora</p>
    <h2>Honest reviews. Clear comparisons.</h2>
    <p class="pk-articles-about-copy">
      We dig deep into Amazon&rsquo;s selection to bring you honest reviews and clear comparisons,
      helping you pick the best products without the hassle.
    </p>
    <div class="pk-articles-about-pills">
      <div class="pk-articles-about-pill">
        <strong>Our Mission</strong>
        <span>Trusted Picks</span>
      </div>
      <div class="pk-articles-about-pill">
        <strong>Why Us</strong>
        <span>Smart Choices</span>
      </div>
    </div>
  </div>
</section>

<style id="pk-articles-about-inline-css">
.pk-articles-about {
  max-width: 900px;
  width: calc(100% - 40px);
  margin: 48px auto 24px;
  padding: 0;
  box-sizing: border-box;
}
.pk-articles-about-inner {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  padding: 36px 40px;
  text-align: center;
  box-sizing: border-box;
}
.pk-articles-about-eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}
.pk-articles-about-inner h2 {
  margin: 0 0 14px !important;
  font-family: Montserrat, sans-serif !important;
  font-size: clamp(24px, 3vw, 32px) !important;
  font-weight: 800 !important;
  color: #15223B !important;
  letter-spacing: -0.03em !important;
  line-height: 1.25 !important;
}
.pk-articles-about-copy {
  margin: 0 auto 24px !important;
  max-width: 620px;
  font-size: 16px !important;
  line-height: 1.65 !important;
  color: #475569 !important;
}
.pk-articles-about-pills {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}
.pk-articles-about-pill {
  min-width: 160px;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}
.pk-articles-about-pill strong {
  font-size: 14px;
  color: #15223B;
}
.pk-articles-about-pill span {
  font-size: 13px;
  color: #64748b;
}
@media (max-width: 640px) {
  .pk-articles-about-inner { padding: 28px 20px; }
  .pk-articles-about-pill { width: 100%; }
}
</style>
"""


def update_disclosure_all() -> int:
    n = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "wp-content" in path.parts or "tools" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        original = text

        # Remove old disclosure style blocks / inline-styled disclosure
        text = re.sub(
            r'\s*<style id="pk-disclosure-footer-inline-css">[\s\S]*?</style>\s*',
            "\n",
            text,
        )
        text = re.sub(
            r'\s*<div class="pk-disclosure-footer"[^>]*>[\s\S]*?</div>\s*(?=<footer\b)',
            "\n",
            text,
            flags=re.I,
        )

        # Insert CSS near end of head
        if 'id="pk-disclosure-footer-inline-css"' not in text:
            text = re.sub(r"</head>", DISCLOSURE_CSS + "</head>", text, count=1, flags=re.I)

        # Insert clean disclosure HTML before footer
        text = re.sub(r"(<footer\b)", DISCLOSURE_HTML + r"\1", text, count=1, flags=re.I)

        if text != original:
            path.write_text(text, encoding="utf-8")
            n += 1
            print(f"disclosure OK: {path.relative_to(ROOT).as_posix()}")
    return n


def redesign_articles() -> None:
    path = ROOT / "articles" / "index.html"
    text = path.read_text(encoding="utf-8")

    # Remove old about section CSS (from .pk-about-section through closing style before about HTML)
    text = re.sub(
        r"<style>\s*/\* Pickora — About Us section fix \*/[\s\S]*?</style>\s*",
        "",
        text,
        count=1,
    )

    # Remove Elementor about block + Shop Smart section + its style
    text = re.sub(
        r'<div class="elementor-element elementor-element-36a0b95[\s\S]*?'
        r'<!-- Секция Shop Smart с адаптивным дизайном -->\s*'
        r'<section class="pk-shop-smart-section">[\s\S]*?</section>\s*'
        r"<style>[\s\S]*?</style>\s*",
        ARTICLES_ABOUT_BLOCK + "\n",
        text,
        count=1,
    )

    # Clean leftover shop-smart references in earlier CSS
    text = text.replace(",\n.pk-shop-smart-section", "")
    text = text.replace(".pk-shop-smart-section,", "")
    text = text.replace(".pk-shop-smart-section {\n  min-height: 0 !important;\n  height: auto !important;\n}\n", "")
    text = re.sub(
        r"\.pk-about-section,\s*\n\.pk-shop-smart-section \{\s*min-height: 0 !important;\s*height: auto !important;\s*\}\s*",
        ".pk-articles-about { min-height: 0 !important; height: auto !important; }\n",
        text,
    )

    path.write_text(text, encoding="utf-8")
    print("articles redesigned")


def redesign_about() -> None:
    path = ROOT / "about" / "index.html"
    text = path.read_text(encoding="utf-8")

    old_mission = """    /* 2. МИССИЯ И ПОЧЕМУ МЫ (НАЕЗЖАЮЩИЕ КАРТОЧКИ) */
    .pk-mission-container {
        position: relative;
        z-index: 10;
        display: flex;
        gap: 30px;
        justify-content: center;
        margin-bottom: 80px;
    }
    
    .pk-card-mini {
        background: #ffffff;
        padding: 40px 30px;
        border-radius: 20px;
        text-align: center;
        flex: 1;
        max-width: 380px;
        box-sizing: border-box; /* Важно для мобилок */
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .pk-card-mini:hover {
        transform: translateY(-5px);
        box-shadow: 0 25px 50px rgba(32, 117, 210, 0.15);
    }
    
    .pk-card-mini h3 {
        font-family: 'Montserrat', sans-serif;
        color: #2075d2;
        font-size: 24px;
        margin-bottom: 12px;
        font-weight: 700;
    }
    .pk-card-mini p {
        margin: 0;
        font-size: 16px;
        color: #54595F;
    }"""

    new_mission = """    /* 2. MISSION / WHY US — laconic mini cards */
    .pk-mission-container {
        position: relative;
        z-index: 10;
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-bottom: 72px;
        padding: 0 16px;
        box-sizing: border-box;
    }

    .pk-card-mini {
        background: #ffffff;
        padding: 24px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        text-align: center;
        flex: 1;
        max-width: 360px;
        box-sizing: border-box;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .pk-card-mini:hover {
        transform: translateY(-3px);
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
    }

    .pk-card-mini h3 {
        font-family: 'Montserrat', sans-serif;
        color: #15223B;
        font-size: 20px;
        margin: 0 0 8px;
        font-weight: 700;
    }
    .pk-card-mini p {
        margin: 0;
        font-size: 15px;
        color: #64748b;
        line-height: 1.5;
    }"""

    old_services_card = """    /* Делаем карточки одинаковой высоты */
    .pk-service-card {
        background: #ffffff;
        border-radius: 24px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        display: flex;
        flex-direction: column; /* Flex внутри карточки */
        height: 100%; /* Растягиваем на всю высоту грида */
    }
    
    .pk-service-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(32, 117, 210, 0.1);
    }
    
    .pk-service-card img {
        width: 100%;
        height: 220px; /* Строго одинаковая высота для всех картинок */
        object-fit: cover;
        border-radius: 16px;
        margin-bottom: 25px;
    }
    
    .pk-service-card h4 {
        font-family: 'Montserrat', sans-serif;
        color: #15223B;
        font-size: 22px;
        margin-bottom: 15px;
        font-weight: 700;
    }
    
    .pk-service-card p {
        font-size: 15px;
        line-height: 1.6;
        flex-grow: 1; /* Если текст разный, он равномерно заполнит пространство */
        margin: 0;
    }"""

    new_services_card = """    /* Equal-height service cards */
    .pk-service-card {
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 24px;
        text-align: center;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
    }

    .pk-service-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
    }

    .pk-service-card img {
        width: 100%;
        aspect-ratio: 16 / 9;
        height: auto;
        object-fit: cover;
        border-radius: 12px;
        margin-bottom: 20px;
        display: block;
    }

    .pk-service-card h4 {
        font-family: 'Montserrat', sans-serif;
        color: #15223B;
        font-size: 20px;
        margin: 0 0 12px;
        font-weight: 700;
        letter-spacing: -0.02em;
    }

    .pk-service-card p {
        font-size: 15px;
        line-height: 1.65;
        color: #64748b;
        flex-grow: 1;
        margin: 0;
    }"""

    old_feedback = """    /* 4. ОТЗЫВЫ (REAL FEEDBACK) */
    .pk-feedback-section {
        background: linear-gradient(135deg, #15223B 0%, #1e3a68 100%);
        padding: 80px 40px;
        border-radius: 30px;
        text-align: center;
        margin-bottom: 80px;
        box-shadow: 0 20px 40px rgba(21, 34, 59, 0.15);
    }
    
    .pk-feedback-section span {
        display: inline-block;
        background: rgba(32, 117, 210, 0.2);
        padding: 8px 20px;
        border-radius: 30px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 13px;
        margin-bottom: 25px;
        color: #6ec1e4;
        font-weight: 700;
    }
    
    .pk-feedback-section p {
        font-family: 'Montserrat', sans-serif;
        font-size: 32px;
        font-style: italic;
        color: #ffffff;
        max-width: 900px;
        margin: 0 auto;
        line-height: 1.4;
        font-weight: 500;
    }"""

    new_feedback = """    /* 4. REAL FEEDBACK — elegant light quote */
    .pk-feedback-section {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 48px 40px 44px;
        border-radius: 20px;
        text-align: center;
        max-width: 800px;
        margin: 60px auto 80px;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
        box-sizing: border-box;
        position: relative;
    }

    .pk-feedback-section::before {
        content: "\\201C";
        display: block;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 64px;
        line-height: 1;
        color: #2075d2;
        opacity: 0.35;
        margin-bottom: 8px;
    }

    .pk-feedback-section span {
        display: inline-block;
        background: transparent;
        padding: 0;
        border-radius: 0;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 12px;
        margin-bottom: 16px;
        color: #64748b;
        font-weight: 700;
    }

    .pk-feedback-section p {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: clamp(20px, 2.4vw, 26px);
        font-style: italic;
        color: #334155;
        max-width: 640px;
        margin: 0 auto;
        line-height: 1.55;
        font-weight: 400;
    }"""

    if old_mission not in text:
        raise SystemExit("about: mission CSS block not found")
    if old_services_card not in text:
        raise SystemExit("about: services CSS block not found")
    if old_feedback not in text:
        raise SystemExit("about: feedback CSS block not found")

    text = text.replace(old_mission, new_mission)
    text = text.replace(old_services_card, new_services_card)
    text = text.replace(old_feedback, new_feedback)

    # Soften services section background to match new look
    text = text.replace(
        """    .pk-services-section {
        background: #F5FAFF;
        padding: 100px 40px;
        border-radius: 40px;
        margin-bottom: 100px;
    }""",
        """    .pk-services-section {
        background: #f8fafc;
        padding: 72px 40px;
        border-radius: 24px;
        border: 1px solid #e2e8f0;
        margin-bottom: 40px;
        box-sizing: border-box;
    }""",
    )

    text = text.replace(
        ".pk-service-card img { height: 200px; }",
        ".pk-service-card img { aspect-ratio: 16 / 9; height: auto; }",
    )
    text = text.replace(
        ".pk-feedback-section { padding: 50px 20px; border-radius: 24px; margin-bottom: 60px; }",
        ".pk-feedback-section { padding: 36px 20px 32px; margin: 40px auto 60px; width: calc(100% - 30px); }",
    )

    path.write_text(text, encoding="utf-8")
    print("about redesigned")


def main() -> int:
    update_disclosure_all()
    redesign_articles()
    redesign_about()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
