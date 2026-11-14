# Studio / JSON publish path

Article Editor must know **both** publish paths.

## Path A — Chrome HTML (classic)

`pickora-publish`: wire `slug/index.html` from sibling chrome + draft HTML. Still the default for many live guides.

## Path B — Studio JSON

1. Shape article as JSON (see `content/articles/_EXAMPLE.json` and live `content/articles/*.json`).
2. Required fields: `slug`, `type` (1–6), `title`, `metaDescription`, `h1`, `dek`, `hubCategory`, `hubUrl`, `chips[]`, `coverImage`, `coverAlt`, `canonical`, `affiliateLinks[]`, body via `bodyHtml` and/or `blocks[]`, optional `faq[]`, `status`.
3. Studio / Worker: SEO gate → compile blocks → publish HTML + Article schema (**no Offer / AggregateRating**).
4. CLI / agent may also write `content/articles/{slug}.json` then ship via publish skill / Studio.

## Editor output when JSON path requested

Deliver a complete JSON document matching `_EXAMPLE.json`, plus Growth packet. Do not invent affiliate URLs. Leave `TODO` only if user has not supplied links — then **block publish**.

## Blocks (when using Studio blocks)

Prefer stacks from Studio `starterBlocks`: intro, table, product, cta, faq, verdict, richtext/html. Editor checks that compiled HTML would keep research-only voice and valid affiliate `rel`.
