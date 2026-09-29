"""Render content/home.json into admin-lab/site/index.html (+ lab top-picks.json)."""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import LAB_SITE, ROOT, abs_url, esc, load_json  # noqa: E402

# Marker that must remain after the 4 cards, before </div></section>
KEEP_COMMENT = (
    "        <!-- Keep exactly 4 cards: newest first. "
    "Drop the oldest when publishing a new guide. -->"
)


def render_review_card(item: dict) -> str:
    url = abs_url(item["url"])
    img = abs_url(item["image"])
    cat = esc(item["category"])
    title = esc(item["title"])
    excerpt = esc(item["excerpt"])
    alt = esc(item.get("imageAlt") or item["title"])
    badge = item.get("badge") or "none"
    badge_html = ""
    if badge and badge != "none":
        label = {
            "updated": "Updated",
            "must-read": "Must read",
            "editors-pick": "Editor's pick",
            "hot": "Hot",
            "new": "New",
        }.get(badge, badge)
        badge_html = (
            f'\n                    <span class="pk-rev-badge" '
            f'data-badge="{esc(badge)}">{esc(label)}</span>'
        )
    return f"""        <article class="pk-rev-card">
            <a href="{url}" class="pk-rev-link">
                <div class="pk-rev-image">
                    <img src="{img}" alt="{alt}" width="1200" height="670" loading="lazy" decoding="async">{badge_html}
                    <span class="pk-rev-category">{cat}</span>
                </div>
                <div class="pk-rev-content">
                    <h3 class="pk-rev-title">{title}</h3>
                    <p class="pk-rev-excerpt">{excerpt}</p>
                    <div class="pk-rev-cta">
                        Read Review <span class="pk-arrow">→</span>
                    </div>
                </div>
            </a>
        </article>"""


def patch_top_pick_shell(html: str, pick: dict) -> str:
    html = re.sub(
        r'(<img class="pk-top-pick-img" src=")[^"]+(")',
        rf'\1{abs_url(pick["image"])}\2',
        html,
        count=1,
    )
    html = re.sub(
        r'(class="pk-top-pick-img"[^>]*alt=")[^"]*(")',
        rf'\1{esc(pick.get("imageAlt") or pick["title"])}\2',
        html,
        count=1,
    )
    html = re.sub(
        r'(class="pk-pick-category">)[^<]*(</span>)',
        rf'\1{esc(pick["category"])}\2',
        html,
        count=1,
    )
    html = re.sub(
        r'(class="pk-year-tag">)[^<]*(</p>)',
        rf'\1{esc(pick["tagline"])}\2',
        html,
        count=1,
    )
    html = re.sub(
        r'(class="pk-product-title">)[^<]*(</h3>)',
        rf'\1{esc(pick["title"])}\2',
        html,
        count=1,
    )
    html = re.sub(
        r'(class="pk-pick-blurb">)[^<]*(</p>)',
        rf'\1{esc(pick["blurb"])}\2',
        html,
        count=1,
    )
    pros = "\n".join(
        f'                    <li><span>✓</span> {esc(p)}</li>' for p in pick.get("pros", [])
    )
    html = re.sub(
        r'(<ul class="pk-check-list">).*?(</ul>)',
        rf"\1\n{pros}\n                \2",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(class="pk-btn-blue pk-btn-amazon"[^>]*href=")[^"]+(")',
        rf'\1{esc(pick["amazonUrl"])}\2',
        html,
        count=1,
    )
    html = re.sub(
        r'(class="pk-btn-ghost pk-btn-guide"[^>]*href=")[^"]+(")',
        rf'\1{esc(pick["guideUrl"])}\2',
        html,
        count=1,
    )
    return html


def replace_reviews_grid(html: str, cards: str) -> str:
    """Replace only the inner cards. Never touch </div></section> or the <style> block after."""
    pattern = re.compile(
        r'(<div class="pk-reviews-grid">\s*).*?(</div>\s*</section>)',
        re.S,
    )
    inner = cards + "\n\n" + KEEP_COMMENT + "\n\n    "
    new_html, n = pattern.subn(rf"\1\n{inner}\2", html, count=1)
    if n != 1:
        raise SystemExit(
            "Could not find pk-reviews-grid … </div></section> "
            "(lab HTML may be corrupt — re-seed from live index.html)"
        )
    # Sanity: reviews CSS block must still be present
    if ".pk-rev-card {" not in new_html or ".pk-reviews-grid {" not in new_html:
        raise SystemExit("Reviews <style> block missing after render — aborting")
    if 'id="pk-top-picks"' not in new_html and "pk-best-overall-v2" not in new_html:
        raise SystemExit("Top picks section missing after render — aborting")
    return new_html


def ensure_lab_base() -> Path:
    """If lab home is broken/missing styles, re-copy from live root index.html."""
    target = LAB_SITE / "index.html"
    live = ROOT / "index.html"
    need_seed = False
    if not target.exists():
        need_seed = True
    else:
        text = target.read_text(encoding="utf-8", errors="replace")
        if ".pk-rev-card {" not in text or "pk-best-overall-v2" not in text:
            need_seed = True
    if need_seed:
        LAB_SITE.mkdir(parents=True, exist_ok=True)
        shutil.copy2(live, target)
        print(f"Re-seeded lab home from {live}")
    return target


def main() -> None:
    data = load_json("home.json")
    reviews = data["latestReviews"]
    if len(reviews) != 4:
        raise SystemExit(f"latestReviews must be exactly 4, got {len(reviews)}")

    target = ensure_lab_base()
    html = target.read_text(encoding="utf-8", errors="replace")

    cards = "\n\n".join(render_review_card(r) for r in reviews)
    new_html = replace_reviews_grid(html, cards)

    first = data["topPicks"]["picks"][0]
    new_html = patch_top_pick_shell(new_html, first)

    # Lab preview served from repo root: point carousel JSON at lab copy
    new_html = new_html.replace(
        'data-pk-top-picks-src="/assets/data/top-picks.json"',
        'data-pk-top-picks-src="/admin-lab/site/assets/data/top-picks.json"',
    )
    # Idempotent if already patched
    if 'data-pk-top-picks-src="/admin-lab/site/assets/data/top-picks.json"' not in new_html:
        # absolute live URL fallback still ok for shell; prefer lab path
        new_html = re.sub(
            r'data-pk-top-picks-src="[^"]+"',
            'data-pk-top-picks-src="/admin-lab/site/assets/data/top-picks.json"',
            new_html,
            count=1,
        )

    target.write_text(new_html, encoding="utf-8")

    lab_assets = LAB_SITE / "assets" / "data"
    lab_assets.mkdir(parents=True, exist_ok=True)
    payload = {
        "updated": data["topPicks"]["updated"],
        "picks": data["topPicks"]["picks"],
    }
    (lab_assets / "top-picks.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(f"Rendered home -> {target}")
    print(f"Wrote lab top-picks -> {lab_assets / 'top-picks.json'}")


if __name__ == "__main__":
    main()
