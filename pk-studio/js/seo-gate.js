/**
 * Pickora SEO publish gate — shared rules for Studio + Worker.
 * Blockers must be empty before status can become seo_ready.
 */
(function (root) {
  const ALLOWED_CHIPS = [
    "audio",
    "electronics",
    "mobile",
    "kitchen",
    "cleaning",
    "smart-home",
    "fitness",
    "wearables",
    "pets",
    "home",
  ];

  const HUBS = [
    "Articles",
    "Home & Kitchen",
    "Consumer Electronics",
    "Fitness & Health",
    "Pet Supplies",
  ];

  const BANNED = [
    /we (spent|tested|lab[- ]?tested)/i,
    /hours? (of )?testing/i,
    /verified buyer/i,
    /AggregateRating/i,
    /TODO/i,
    /example\.com/i,
    /amzn\.to\/TODO/i,
  ];

  function validateArticleDraft(draft) {
    const blockers = [];
    const warnings = [];
    const d = draft || {};

    const slug = String(d.slug || "").trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      blockers.push({
        id: "slug",
        label: "Slug must be kebab-case (a-z, 0-9, hyphens)",
      });
    }

    const title = String(d.title || "").trim();
    if (title.length < 25 || title.length > 70) {
      blockers.push({
        id: "title_len",
        label: "Title length should be 25–70 characters",
      });
    }

    const meta = String(d.metaDescription || "").trim();
    if (meta.length < 110 || meta.length > 170) {
      blockers.push({
        id: "meta_len",
        label: "Meta description should be 110–170 characters",
      });
    }

    if (!HUBS.includes(d.hubCategory)) {
      blockers.push({
        id: "hub",
        label: "Pick a hub category (Home & Kitchen, …)",
      });
    }

    const chips = Array.isArray(d.chips) ? d.chips : [];
    if (chips.length < 1 || chips.length > 3) {
      blockers.push({ id: "chips_count", label: "Choose 1–3 chips" });
    }
    chips.forEach((c) => {
      if (!ALLOWED_CHIPS.includes(c)) {
        blockers.push({ id: "chip_" + c, label: "Unknown chip: " + c });
      }
    });

    const cover = String(d.coverImage || "").trim();
    if (!cover || cover.includes("TODO")) {
      blockers.push({ id: "cover", label: "Cover image path required" });
    } else if (!/\.webp(\?|$)/i.test(cover) && !/\/api\/media\/file\//.test(cover)) {
      warnings.push({
        id: "cover_webp",
        label: "Prefer a .webp cover for live publish",
      });
    }

    const canonical = String(d.canonical || "").trim();
    const expectedCanon = slug ? `https://pickora.shop/${slug}/` : "";
    if (slug && canonical && canonical !== expectedCanon) {
      blockers.push({
        id: "canonical",
        label: "Canonical must be https://pickora.shop/{slug}/",
      });
    }

    const linksFromField = Array.isArray(d.affiliateLinks) ? d.affiliateLinks : [];
    let linksFromBlocks = [];
    if (Array.isArray(d.blocks) && d.blocks.length) {
      d.blocks.forEach((b) => {
        if (b && (b.type === "product" || b.type === "cta")) {
          (b.links || []).forEach((l) => {
            if (l && l.url) linksFromBlocks.push(String(l.url).trim());
          });
        }
      });
    }
    const links = [...linksFromField, ...linksFromBlocks];
    const goodAff = links.filter(
      (u) => /^https:\/\/amzn\.to\/[A-Za-z0-9]+/.test(String(u || "").trim())
    );
    if (goodAff.length < 1) {
      blockers.push({
        id: "affiliate",
        label: "At least one real https://amzn.to/… link required",
      });
    }

    const internal = Array.isArray(d.internalLinks) ? d.internalLinks : [];
    if (internal.filter(Boolean).length < 2) {
      warnings.push({
        id: "internal",
        label: "Add at least 2 internal links before publish",
      });
    }

    let body = String(d.bodyHtml || "");
    if (Array.isArray(d.blocks) && d.blocks.length && root.PK_BLOCKS) {
      body = root.PK_BLOCKS.compileBlocksToHtml(d.blocks);
    } else if (Array.isArray(d.blocks) && d.blocks.length) {
      // Worker / no PK_BLOCKS: approximate from plain fields
      body = d.blocks
        .map((b) => {
          if (!b) return "";
          if (b.type === "html") return String(b.html || "");
          if (b.type === "product") {
            return [b.title, b.description, b.verdict, ...(b.pros || [])].join(" ");
          }
          if (b.type === "faq") {
            return (b.items || []).map((i) => `${i.q || ""} ${i.a || ""}`).join(" ");
          }
          if (b.type === "table") {
            return [...(b.headers || []), ...(b.rows || []).flat()].join(" ");
          }
          return String(b.text || b.html || "");
        })
        .join("\n");
    }
    if (body.replace(/<[^>]+>/g, " ").trim().length < 400) {
      blockers.push({
        id: "body",
        label: "Article content too short (add intro + product cards)",
      });
    }

    if (Array.isArray(d.blocks) && d.blocks.length) {
      const products = d.blocks.filter((b) => b && b.type === "product");
      if (products.length < 1) {
        warnings.push({
          id: "no_product_block",
          label: "Add at least one Product card block for a stronger guide",
        });
      }
    }

    const hay = [title, meta, body, String(d.dek || ""), String(d.h1 || "")].join(
      "\n"
    );
    BANNED.forEach((re, i) => {
      if (re.test(hay)) {
        blockers.push({
          id: "banned_" + i,
          label: "Banned phrase / pattern detected: " + re.source,
        });
      }
    });

    if (/AggregateRating/i.test(body)) {
      blockers.push({
        id: "schema_rating",
        label: "Do not include AggregateRating in markup",
      });
    }

    const type = Number(d.type);
    if (![1, 2, 3, 4, 5, 6].includes(type)) {
      blockers.push({ id: "type", label: "Article type must be 1–6" });
    }

    return {
      ok: blockers.length === 0,
      blockers,
      warnings,
      allowedChips: ALLOWED_CHIPS,
      hubs: HUBS,
    };
  }

  root.PK_SEO_GATE = {
    ALLOWED_CHIPS,
    HUBS,
    validateArticleDraft,
  };
})(typeof window !== "undefined" ? window : globalThis);
