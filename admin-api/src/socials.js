/**
 * Footer social links — catalog + HTML builders for Studio / publish / live chrome.
 *
 * Draft field on home: socialLinks: Array<{ id, url, enabled }>
 * Live JSON: assets/data/socials.json
 */

export const SOCIAL_CATALOG = [
  {
    id: "facebook",
    label: "Facebook",
    className: "facebook",
    placeholder: "https://facebook.com/yourpage",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"></path></svg>`,
  },
  {
    id: "instagram",
    label: "Instagram",
    className: "instagram",
    placeholder: "https://instagram.com/yourpage",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.41.61.24 1.05.52 1.51.98.46.46.74.9.98 1.51.17.46.36 1.26.41 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.41 2.43-.24.61-.52 1.05-.98 1.51-.46.46-.9.74-1.51.98-.46.17-1.26.36-2.43.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.41-.61-.24-1.05-.52-1.51-.98-.46-.46-.74-.9-.98-1.51-.17-.46-.36-1.26-.41-2.43C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.24-1.97.41-2.43.24-.61.52-1.05.98-1.51.46-.46.9-.74 1.51-.98.46-.17 1.26-.36 2.43-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91C23.99 15.67 24 15.26 24 12s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13C21.32 1.34 20.65.93 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z"></path></svg>`,
  },
  {
    id: "x",
    label: "X (Twitter)",
    className: "x",
    placeholder: "https://x.com/yourhandle",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M13.982 10.622 20.54 3h-1.554l-5.693 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245l-7.131-10.378Zm-2.128 2.474-.697-.997-5.543-7.93H8l4.474 6.4.697.996 5.815 8.318h-2.387l-4.745-6.787Z"></path></svg>`,
  },
  {
    id: "tiktok",
    label: "TikTok",
    className: "tiktok",
    placeholder: "https://tiktok.com/@yourhandle",
    svg: `<svg width="24" height="24" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z"></path></svg>`,
  },
  {
    id: "youtube",
    label: "YouTube",
    className: "youtube",
    placeholder: "https://youtube.com/@yourchannel",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M21.8 8.001c-.2-1.4-.9-2.4-2.2-2.6C17.9 5 12 5 12 5s-5.9 0-7.6.4c-1.3.2-2 1.2-2.2 2.6C2 9.6 2 12 2 12s0 2.4.2 3.999c.2 1.4.9 2.4 2.2 2.6 1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4c1.3-.2 2-1.2 2.2-2.6.2-1.599.2-3.999.2-3.999s0-2.4-.2-3.999zM9.8 15.2V8.8l6.2 3.2-6.2 3.2z"></path></svg>`,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    className: "pinterest",
    placeholder: "https://pinterest.com/yourprofile",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12.017 1.5c-5.9 0-9.6 4.2-9.6 8.8 0 2.5 1.3 5.5 3.4 6.5.2.1.4 0 .4-.2 0-.2 0-.6.1-1 .1-.3-.1-.6-.4-.8C4.5 13.5 3.9 12 3.9 10.3c0-3.6 2.8-7.1 8-7.1 4.4 0 7.5 2.9 7.5 6.9 0 4.4-2.4 7.5-5.5 7.5-1.7 0-3-1.4-2.6-3.1.5-2 1.4-4.1 1.4-5.5 0-1.3-.7-2.3-2.1-2.3-1.7 0-3 1.7-3 4.1 0 1.5.5 2.5.5 2.5l-2 8.3c-.6 2.4-.1 5.4-.1 5.7 0 .2.2.2.3.1.1-.2 1.9-2.4 2.5-4.6l1-3.7c.5.9 1.9 1.7 3.4 1.7 4.5 0 7.7-4.1 7.7-9.1C21.5 4.8 17.6 1.5 12.017 1.5z"></path></svg>`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    className: "linkedin",
    placeholder: "https://linkedin.com/company/yourco",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.7 3H4.3C3.6 3 3 3.6 3 4.3v15.4C3 20.4 3.6 21 4.3 21h15.4c.7 0 1.3-.6 1.3-1.3V4.3C21 3.6 20.4 3 19.7 3zM8.3 18.3H5.7V9.7h2.6v8.6zM7 8.4C6.1 8.4 5.4 7.7 5.4 6.8S6.1 5.2 7 5.2s1.6.7 1.6 1.6S7.9 8.4 7 8.4zm11.3 9.9h-2.6v-4.5c0-1.3-.5-2.1-1.6-2.1-.9 0-1.4.6-1.6 1.2-.1.2-.1.5-.1.8v4.6H9.8s0-7.5 0-8.6h2.6v1.4c.4-.7 1.2-1.6 2.9-1.6 2.1 0 3.7 1.4 3.7 4.3v4.5z"></path></svg>`,
  },
  {
    id: "threads",
    label: "Threads",
    className: "threads",
    placeholder: "https://threads.net/@yourhandle",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16.5 9.5c-.2-2.6-1.6-4.3-4.3-4.4-2.9-.1-4.8 1.7-4.9 4.6-.1 2.3 1 3.9 2.9 4.5-.5.9-.9 1.7-1 2.4-.2 1.2.2 2.3 1.1 2.9.8.5 1.8.6 2.8.3 1.6-.4 2.6-1.5 3.2-3.4.3-1 .5-2.1.5-3.3 1.1-.7 1.9-1.8 2.1-3.2.3-1.9-.5-3.6-2.4-4.4zm-2.2 6.8c-.3 1.2-.9 2-1.9 2.2-.6.2-1.1.1-1.4-.2-.3-.3-.4-.8-.3-1.4.1-.5.4-1.1.8-1.8 1.1.2 2 .4 2.8 1.2zm.1-3.1c-.6-.2-1.2-.4-1.9-.6-.1-.6-.1-1.1 0-1.5.2-.8.8-1.3 1.6-1.3.7 0 1.2.4 1.3 1.1.1.6-.2 1.5-1 2.3z"></path></svg>`,
  },
  {
    id: "telegram",
    label: "Telegram",
    className: "telegram",
    placeholder: "https://t.me/yourchannel",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M21.9 4.2 2.8 11.5c-1.3.5-1.3 1.2-.2 1.5l4.9 1.5 1.9 5.8c.2.7.4.9 1 .9.6 0 .9-.3 1.2-.6l2.9-2.8 6 4.4c1.1.6 1.9.3 2.2-1l3.5-16.4c.4-1.5-.5-2.2-1.6-1.6z"></path></svg>`,
  },
  {
    id: "bluesky",
    label: "Bluesky",
    className: "bluesky",
    placeholder: "https://bsky.app/profile/you.bsky.social",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 11.5c-1.4-2.7-5.2-7.7-8.7-10.2C1.3.1 0 1.5 0 3.7c0 2.1 1.2 8.3 2.1 9.5.9 1.3 2.1 1.7 3.6 1.2 0 0 2.5-.9 4.3-3.4 0 0 .7 4.5.8 5.4.2 1.6.8 2.1 1.2 2.2.4-.1 1-.6 1.2-2.2.1-.9.8-5.4.8-5.4 1.8 2.5 4.3 3.4 4.3 3.4 1.5.5 2.7.1 3.6-1.2.9-1.2 2.1-7.4 2.1-9.5 0-2.2-1.3-3.6-3.3-2.4-3.5 2.5-7.3 7.5-8.7 10.2z"></path></svg>`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    className: "whatsapp",
    placeholder: "https://wa.me/15551234567",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 2C6.5 2 2 6.4 2 11.8c0 2.1.7 4 1.8 5.6L2.5 22l4.8-1.3c1.5.8 3.2 1.3 5 1.3 5.5 0 10-4.4 10-9.8S17.5 2 12 2zm5.4 14c-.2.6-1.2 1.1-1.9 1.2-.5.1-1.1.2-3.5-.7-2.9-1.2-4.8-4.2-4.9-4.4-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.8.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.1.1-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1.1-.2.6-.7.8-.9.2-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3.1.3 0 1-.2 1.6z"></path></svg>`,
  },
  {
    id: "discord",
    label: "Discord",
    className: "discord",
    placeholder: "https://discord.gg/yourinvite",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.3 5.2A17.4 17.4 0 0 0 15.1 4l-.2.4c1.5.4 2.8 1 4 1.8-1.5-.9-3.2-1.5-5-1.8h-.2c-.6 0-1.2.1-1.8.1S10.7 4 10.1 4h-.2C8.1 4.3 6.4 4.9 4.9 5.8c1.2-.8 2.5-1.4 4-1.8L8.7 4A17.4 17.4 0 0 0 4.5 5.2C1.8 9.2 1.1 13.1 1.4 16.9A17.5 17.5 0 0 0 6.7 19l.6-.8c-.9-.3-1.7-.8-2.5-1.3.3.2.6.3.9.5 2.4 1.2 5 1.8 7.6 1.8s5.2-.6 7.6-1.8c.3-.1.6-.3.9-.5-.8.6-1.6 1-2.5 1.3l.6.8a17.5 17.5 0 0 0 5.3-2.1c.4-4.4-.6-8.2-2.9-11.8zM8.7 14.6c-.9 0-1.7-.8-1.7-1.8s.8-1.8 1.7-1.8 1.7.8 1.7 1.8-.7 1.8-1.7 1.8zm6.6 0c-.9 0-1.7-.8-1.7-1.8s.8-1.8 1.7-1.8 1.7.8 1.7 1.8-.8 1.8-1.7 1.8z"></path></svg>`,
  },
  {
    id: "reddit",
    label: "Reddit",
    className: "reddit",
    placeholder: "https://reddit.com/r/yoursub",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M22 12.2c0-1.3-1-2.3-2.3-2.3-.6 0-1.2.2-1.6.6-1.6-1.1-3.7-1.7-6-1.8l1-3.3 2.8.7c0 .8.7 1.4 1.5 1.4s1.5-.6 1.5-1.5S18.2 4.4 17.3 4.4c-.6 0-1.1.3-1.3.8l-3.2-.8c-.2 0-.4.1-.4.3l-1.2 3.8c-2.3.1-4.4.8-6 1.8-.9-.8-2.3-.7-3.1.2-.8.9-.7 2.3.2 3.1v.4c0 3.4 4 6.1 8.9 6.1s8.9-2.7 8.9-6.1v-.4c.6-.4 1-1.1 1-1.8zM7.8 13.5c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4zm7.7 3.5c-1 .9-2.4 1.3-3.7 1.3s-2.7-.4-3.7-1.3c-.2-.1-.2-.4 0-.5.1-.2.4-.2.5 0 .8.7 2 1.1 3.2 1.1s2.4-.4 3.2-1.1c.2-.1.4-.1.5 0 .2.1.2.4 0 .5zm-.3-2.1c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z"></path></svg>`,
  },
];

const BY_ID = Object.fromEntries(SOCIAL_CATALOG.map((s) => [s.id, s]));

export function defaultSocialLinks() {
  return SOCIAL_CATALOG.map((s) => ({
    id: s.id,
    url: "",
    enabled: ["facebook", "instagram", "x", "tiktok"].includes(s.id),
  }));
}

export function normalizeSocialLinks(list) {
  if (!Array.isArray(list) || !list.length) return defaultSocialLinks();
  const byId = Object.fromEntries(
    list.map((row) => [String(row?.id || "").toLowerCase(), row])
  );
  return SOCIAL_CATALOG.map((s) => {
    const row = byId[s.id];
    if (!row) return { id: s.id, url: "", enabled: false };
    return {
      id: s.id,
      url: String(row.url || "").trim(),
      enabled: row.enabled !== false && row.enabled !== "false" && row.enabled !== 0,
    };
  });
}

export function activeSocialLinks(list) {
  return normalizeSocialLinks(list).filter((s) => {
    if (!s.enabled) return false;
    const u = s.url.trim();
    if (!u) return false;
    if (!/^https?:\/\//i.test(u)) return false;
    // bare platform roots count as "not set"
    try {
      const host = new URL(u).hostname.replace(/^www\./, "");
      const path = new URL(u).pathname.replace(/\/+$/, "");
      if (path === "" || path === "/") {
        const bare = new Set([
          "facebook.com",
          "instagram.com",
          "twitter.com",
          "x.com",
          "tiktok.com",
          "youtube.com",
          "pinterest.com",
          "linkedin.com",
          "threads.net",
          "t.me",
          "telegram.me",
          "bsky.app",
          "discord.com",
          "discord.gg",
          "reddit.com",
          "wa.me",
        ]);
        if (bare.has(host)) return false;
      }
    } catch {
      return false;
    }
    return true;
  });
}

function escAttr(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSocialLinksUl(list) {
  const active = activeSocialLinks(list);
  if (!active.length) {
    return `<ul class="wp-block-social-links has-icon-color is-style-logos-only is-layout-flex wp-container-core-social-links-is-layout-87452e7f wp-block-social-links-is-layout-flex" data-pk-socials="empty" hidden></ul>`;
  }
  const items = active
    .map((s) => {
      const meta = BY_ID[s.id];
      if (!meta) return "";
      return `<li style="color:#ffffff" class="wp-social-link wp-social-link-${meta.className} has-light-color wp-block-social-link"><a href="${escAttr(s.url)}" class="wp-block-social-link-anchor" target="_blank" rel="noopener noreferrer">${meta.svg}<span class="wp-block-social-link-label screen-reader-text">${escAttr(meta.label)}</span></a></li>`;
    })
    .filter(Boolean)
    .join("\n\n");
  return `<ul class="wp-block-social-links has-icon-color is-style-logos-only is-layout-flex wp-container-core-social-links-is-layout-87452e7f wp-block-social-links-is-layout-flex" data-pk-socials="live">${items}</ul>`;
}

export function patchHtmlSocials(html, list) {
  const ul = buildSocialLinksUl(list);
  const re = /<ul class="wp-block-social-links[\s\S]*?<\/ul>/;
  if (!re.test(html)) return { html, patched: false };
  return { html: html.replace(re, ul), patched: true };
}

export function socialsPublicJson(list) {
  return {
    updated: new Date().toISOString().slice(0, 10),
    links: activeSocialLinks(list).map((s) => ({
      id: s.id,
      label: BY_ID[s.id]?.label || s.id,
      className: BY_ID[s.id]?.className || s.id,
      url: s.url,
      svg: BY_ID[s.id]?.svg || "",
    })),
  };
}

export const SOCIAL_UL_RE = /<ul class="wp-block-social-links[\s\S]*?<\/ul>/;
